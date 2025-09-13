// projects-marquee.js
// Duplicate originals for loop, pause on hover any item, expand, click to open modal with item data.

(function () {
  const TRACK_ID = 'marquee-track';
  const track = document.getElementById(TRACK_ID);
  if (!track) return;

  // Duplicate originals once
  if (!track.dataset.duplicated) {
    const originals = Array.from(track.children);
    originals.forEach(n => track.appendChild(n.cloneNode(true)));
    track.dataset.duplicated = 'true';
  }

  // Pause/resume helper
  function pause() { track.classList.add('paused'); }
  function resume() { track.classList.remove('paused'); }

  // Expand on hover (any item)
  let expanded = null;
  track.addEventListener('pointerover', (ev) => {
    const item = ev.target.closest('.marquee-item');
    if (!item) return;
    if (expanded && expanded !== item) expanded.classList.remove('expanded');
    expanded = item;
    item.classList.add('expanded');
    pause();
  });
  track.addEventListener('pointerout', (ev) => {
    const leftItem = ev.target.closest('.marquee-item');
    if (leftItem && (!ev.relatedTarget || !leftItem.contains(ev.relatedTarget))) {
      leftItem.classList.remove('expanded');
      expanded = null;
      // don't resume if modal open
      if (!document.getElementById('marquee-modal')?.classList.contains('visible')) resume();
    }
  });

  // Helper to return original items list
  function originalsList() {
    const all = Array.from(track.children);
    return all.slice(0, all.length / 2);
  }

  // Modal elements
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
    i = ((i % originals.length) + originals.length) % originals.length;
    const el = originals[i];
    mmTitle.textContent = el.dataset.title || '';
    mmDesc.textContent = el.dataset.desc || '';
    mmTools.textContent = el.dataset.tools || '';
    mmImpact.textContent = el.dataset.impact || '';
    mmImg.src = el.dataset.img || (el.querySelector('img')?.src || '');
    mmImg.alt = el.dataset.title || '';
    modal.classList.add('visible'); modal.setAttribute('aria-hidden', 'false');
    currentIndex = i; pause();
  }

  function closeModal() {
    modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true');
    currentIndex = -1;
    const ex = track.querySelector('.marquee-item.expanded'); if (ex) ex.classList.remove('expanded');
    resume();
  }

  // click track item -> open modal for that item
  track.addEventListener('click', (ev) => {
    const clicked = ev.target.closest('.marquee-item');
    if (!clicked) return;
    const originals = originalsList();
    let idx = originals.findIndex(o => o.dataset.title === clicked.dataset.title && o.dataset.desc === clicked.dataset.desc);
    if (idx === -1) idx = originals.findIndex(o => o.dataset.title === clicked.dataset.title);
    if (idx !== -1) openModalAt(idx);
  });

  if (btnPrev) btnPrev.addEventListener('click', () => { if (currentIndex !== -1) openModalAt(currentIndex - 1); });
  if (btnNext) btnNext.addEventListener('click', () => { if (currentIndex !== -1) openModalAt(currentIndex + 1); });

  // close on outside click or close button
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target === btnClose) closeModal(); });
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // keyboard nav in modal
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft') openModalAt(currentIndex - 1);
    else if (e.key === 'ArrowRight') openModalAt(currentIndex + 1);
    else if (e.key === 'Escape') closeModal();
  });

  // tune animation speed based on number of children for consistent perceived speed
  function tune() {
    const count = track.children.length;
    const base = 16;
    const secs = Math.max(8, Math.round(base * (count / 14)));
    track.style.setProperty('--marquee-duration', secs + 's');
  }
  tune();
  window.addEventListener('resize', () => setTimeout(tune, 120));

  // Expose helper for project-card details to call
  window.openProjectModal = function (data) {
    if (!modal) return;
    mmTitle.textContent = data.title || '';
    mmDesc.textContent = data.desc || '';
    mmTools.textContent = data.tools || '';
    mmImpact.textContent = data.impact || '';
    mmImg.src = data.img || '';
    mmImg.alt = data.title || '';
    modal.classList.add('visible'); modal.setAttribute('aria-hidden','false');
    pause();
    currentIndex = -1;
  };

})();
