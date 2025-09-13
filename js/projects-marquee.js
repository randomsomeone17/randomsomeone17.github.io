// projects-marquee.js
// Seamless marquee: duplicate originals, pause on hover any item (expand), open modal with prev/next.
// No stars. Light/dark toggle persistence handled in projects-extra.js.

(function () {
  const TRACK_ID = 'marquee-track';
  const track = document.getElementById(TRACK_ID);
  if (!track) return;

  // Duplicate originals to create seamless loop (only once)
  if (!track.dataset.duplicated) {
    const originals = Array.from(track.children);
    originals.forEach(node => track.appendChild(node.cloneNode(true)));
    track.dataset.duplicated = 'true';
  }

  // Make sure CSS keyframe animation translateX(-50%) loops semlessly because of duplication.

  // Pause/resume helpers
  function pause() { track.classList.add('paused'); }
  function resume() { track.classList.remove('paused'); }

  // Hover any item expands it and pauses
  let expanded = null;
  track.addEventListener('pointerover', (ev) => {
    const item = ev.target.closest('.marquee-item');
    if (!item) return;
    // expand
    if (expanded && expanded !== item) expanded.classList.remove('expanded');
    expanded = item;
    item.classList.add('expanded');
    pause();
  });
  track.addEventListener('pointerout', (ev) => {
    const leftItem = ev.target.closest('.marquee-item');
    // If pointer leaves an item completely, collapse it
    if (leftItem && (!ev.relatedTarget || !leftItem.contains(ev.relatedTarget))) {
      leftItem.classList.remove('expanded');
      expanded = null;
      // don't resume if modal is open
      if (!document.getElementById('marquee-modal')?.classList.contains('visible')) resume();
    }
  });

  // Helpers for originals index
  function originalsList() {
    const all = Array.from(track.children);
    return all.slice(0, all.length / 2);
  }
  function indexOfOriginalByElement(el) {
    const originals = originalsList();
    return originals.findIndex(o => o.dataset.title === el.dataset.title && o.dataset.desc === el.dataset.desc);
  }

  // Modal functions
  const modal = document.getElementById('marquee-modal');
  if (!modal) return;
  const mmTitle = document.getElementById('mm-title');
  const mmDesc = document.getElementById('mm-desc');
  const mmTools = document.getElementById('mm-tools');
  const mmImpact = document.getElementById('mm-impact');
  const mmImg = document.getElementById('mm-img');
  const btnClose = modal.querySelector('.marquee-modal-close');
  const btnPrev = modal.querySelector('.marquee-modal-nav.prev');
  const btnNext = modal.querySelector('.marquee-modal-nav.next');

  let currentIndex = -1;

  function openModalAt(i) {
    const originals = originalsList();
    if (!originals.length) return;
    i = ((i % originals.length) + originals.length) % originals.length; // normalize
    const el = originals[i];
    mmTitle.textContent = el.dataset.title || '';
    mmDesc.textContent = el.dataset.desc || '';
    mmTools.textContent = el.dataset.tools || '';
    mmImpact.textContent = el.dataset.impact || '';
    mmImg.src = el.dataset.img || (el.querySelector('img')?.src || '');
    mmImg.alt = el.dataset.title || '';
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    currentIndex = i;
    pause();
  }

  function closeModal() {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    currentIndex = -1;
    // collapse any expanded item
    const ex = track.querySelector('.marquee-item.expanded');
    if (ex) ex.classList.remove('expanded');
    resume();
  }

  // click item -> if expanded open modal for that original
  track.addEventListener('click', (ev) => {
    const clicked = ev.target.closest('.marquee-item');
    if (!clicked) return;
    // find original index
    const idx = indexOfOriginalByElement(clicked);
    if (idx === -1) {
      // fallback: match by title among originals
      const originals = originalsList();
      const fallback = originals.findIndex(o => o.dataset.title === clicked.dataset.title);
      if (fallback !== -1) openModalAt(fallback);
      return;
    }
    openModalAt(idx);
  });

  // modal nav
  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (currentIndex !== -1) openModalAt(currentIndex - 1);
  });
  if (btnNext) btnNext.addEventListener('click', () => {
    if (currentIndex !== -1) openModalAt(currentIndex + 1);
  });

  // close modal clicking outside content or close button
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === btnClose) closeModal();
  });
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // keyboard nav inside modal
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft') openModalAt(currentIndex - 1);
    else if (e.key === 'ArrowRight') openModalAt(currentIndex + 1);
    else if (e.key === 'Escape') closeModal();
  });

  // tune duration based on number of items (so perceived speed stays constant)
  function tune() {
    const count = track.children.length;
    const base = 16; // baseline seconds
    const secs = Math.max(8, Math.round(base * (count / 14))); // 14 children baseline for 7 originals
    track.style.setProperty('--marquee-duration', secs + 's');
  }
  tune();
  window.addEventListener('resize', () => setTimeout(tune, 120));

})();
