/* projects-marquee.js
   - Seamless marquee loop via duplication + CSS translateX(-50%)
   - Hover any item: pause + expand (no stars)
   - Click expanded item to open modal; modal left/right nav to browse projects
   - Clicking outside modal closes it and resumes marquee
   - Light/Dark toggle hook (works with button #theme-toggle)
*/

(function () {
  const MARQUEE_ID = 'marquee-track';
  const track = document.getElementById(MARQUEE_ID);
  if (!track) return;

  // Duplicate children once to make seamless loop (check flag to avoid doubling)
  if (track.children.length && track.dataset.duplicated !== 'true') {
    const originals = Array.from(track.children);
    originals.forEach((c) => track.appendChild(c.cloneNode(true)));
    track.dataset.duplicated = 'true';
  }

  // Helper: center of marquee viewport
  function viewportCenterX() {
    const vp = track.parentElement.getBoundingClientRect();
    return vp.left + vp.width / 2;
  }

  // Pause/resume marquee by toggling class
  function pauseMarquee() { track.classList.add('paused'); }
  function resumeMarquee() { track.classList.remove('paused'); }

  // Hover behavior: any item hovered -> expand it and pause
  let hoveredItem = null;
  track.addEventListener('pointerover', (ev) => {
    const item = ev.target.closest('.marquee-item');
    if (!item) return;
    // expand the hovered item
    if (hoveredItem && hoveredItem !== item) {
      hoveredItem.classList.remove('expanded');
    }
    hoveredItem = item;
    item.classList.add('expanded');
    pauseMarquee();
  });

  // pointerout: collapse if leaving the item entirely
  track.addEventListener('pointerout', (ev) => {
    const left = ev.target.closest('.marquee-item');
    // if we left an item and the newly focused element isn't inside it, collapse
    if (left && (!ev.relatedTarget || !left.contains(ev.relatedTarget))) {
      left.classList.remove('expanded');
      hoveredItem = null;
      // resume only if no modal open
      if (!isModalOpen()) resumeMarquee();
    }
  });

  // find base (first-half) items and their ordering
  function originalsList() {
    const all = Array.from(track.children);
    return all.slice(0, all.length / 2);
  }

  // find index of item among originals (returns 0..n-1) based on element reference
  function indexOfOriginal(item) {
    const originals = originalsList();
    return originals.findIndex(o => o.dataset.title === item.dataset.title && o.dataset.desc === item.dataset.desc);
  }

  // Modal elements and functions
  const modal = document.getElementById('marquee-modal');
  const mmTitle = document.getElementById('mm-title');
  const mmDesc = document.getElementById('mm-desc');
  const mmTools = document.getElementById('mm-tools');
  const mmImpact = document.getElementById('mm-impact');
  const mmImg = document.getElementById('mm-img');
  const mmClose = modal ? modal.querySelector('.marquee-modal-close') : null;
  const mmPrev = modal ? modal.querySelector('.marquee-modal-nav.prev') : null;
  const mmNext = modal ? modal.querySelector('.marquee-modal-nav.next') : null;

  let currentModalIndex = -1; // index in originals

  function isModalOpen() { return modal && modal.classList.contains('visible'); }

  function openModalAtIndex(i) {
    const originals = originalsList();
    if (!originals.length) return;
    i = ((i % originals.length) + originals.length) % originals.length; // wrap
    const el = originals[i];
    if (!el) return;
    // populate modal
    mmTitle.textContent = el.dataset.title || '';
    mmDesc.textContent = el.dataset.desc || '';
    mmTools.textContent = el.dataset.tools || '';
    mmImpact.textContent = el.dataset.impact || '';
    mmImg.src = el.dataset.img || (el.querySelector('img')?.src || '');
    mmImg.alt = el.dataset.title || '';
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    currentModalIndex = i;
    pauseMarquee();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    currentModalIndex = -1;
    // collapse any expanded item
    const ex = track.querySelector('.marquee-item.expanded');
    if (ex) ex.classList.remove('expanded');
    resumeMarquee();
  }

  // clicking on any marquee item: if it's expanded, open modal for that item
  track.addEventListener('click', (ev) => {
    const target = ev.target.closest('.marquee-item');
    if (!target) return;
    // open modal for the corresponding original index
    const idx = indexOfOriginal(target);
    if (idx === -1) {
      // try matching by title
      const originals = originalsList();
      const maybe = originals.findIndex(o => o.dataset.title === target.dataset.title);
      if (maybe !== -1) openModalAtIndex(maybe);
    } else openModalAtIndex(idx);
  });

  // modal nav handlers
  if (mmPrev) mmPrev.addEventListener('click', () => { if (currentModalIndex !== -1) openModalAtIndex(currentModalIndex - 1); });
  if (mmNext) mmNext.addEventListener('click', () => { if (currentModalIndex !== -1) openModalAtIndex(currentModalIndex + 1); });

  // close modal when clicking outside content or on close button
  if (modal) {
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal || ev.target === mmClose) closeModal();
    });
  }
  if (mmClose) mmClose.addEventListener('click', closeModal);

  // keyboard: left/right to navigate modal, Esc to close
  window.addEventListener('keydown', (ev) => {
    if (!isModalOpen()) return;
    if (ev.key === 'ArrowLeft') { openModalAtIndex(currentModalIndex - 1); }
    else if (ev.key === 'ArrowRight') { openModalAtIndex(currentModalIndex + 1); }
    else if (ev.key === 'Escape') { closeModal(); }
  });

  // tune duration so speed is visually consistent with number of items
  function tuneDuration() {
    const totalChildren = track.children.length; // includes duplicates
    // baseline 16s for ~14 elements (7 originals + 7 duplicates)
    const baselineItems = 14;
    const baseSecs = 16;
    const secs = Math.max(6, Math.round((totalChildren / baselineItems) * baseSecs));
    track.style.setProperty('--marquee-duration', secs + 's');
  }
  tuneDuration();
  window.addEventListener('resize', () => setTimeout(tuneDuration, 120));

  // Light/dark toggle (connect to #theme-toggle button if present)
  function setTheme(theme) {
    if (theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('site-theme', theme); } catch (e) { /* ignore */ }
  }
  const saved = (function () { try { return localStorage.getItem('site-theme'); } catch (e) { return null; } })();
  if (saved) setTheme(saved);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      setTheme(dark ? 'dark' : 'light');
    });
  }

})();
