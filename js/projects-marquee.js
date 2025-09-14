// js/projects-marquee.js
(function () {
  const TRACK_ID = 'marquee-track';
  const track = document.getElementById(TRACK_ID);
  if (!track) return;

  // Duplicate original children once to create seamless loop
  if (!track.dataset.duplicated) {
    const originals = Array.from(track.children);
    originals.forEach(n => track.appendChild(n.cloneNode(true)));
    track.dataset.duplicated = 'true';
  }

  // Pause / resume helpers
  function pause() { track.classList.add('paused'); }
  function resume() { track.classList.remove('paused'); }

  // Hover expand any item
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
      if (!document.getElementById('marquee-modal')?.classList.contains('visible')) resume();
    }
  });

  // Helper: originals (first half of track children)
  function originalsList() {
    const all = Array.from(track.children);
    const half = Math.floor(all.length / 2);
    return all.slice(0, half);
  }

  // Modal elements
  const modal = document.getElementById('marquee-modal');
  if (!modal) return;
  const mmTitle = document.getElementById('mm-title');
  const mmDesc = document.getElementById('mm-desc');
  const mmTools = document.getElementById('mm-tools');
  const mmImpact = document.getElementById('mm-impact');
  const mmImg = document.getElementById('mm-img');
  const mmBullets = document.getElementById('mm-bullets');
  const btnClose = modal.querySelector('.marquee-modal-close');
  const btnPrev = modal.querySelector('.marquee-modal-nav.prev');
  const btnNext = modal.querySelector('.marquee-modal-nav.next');

  let currentIndex = -1;

  function renderModalFromElement(el) {
    const title = el.dataset.title || '';
    const img = el.dataset.img || (el.querySelector('img')?.src || '');
    const tools = el.dataset.tools || '';
    const impact = el.dataset.impact || '';
    const desc = el.dataset.desc || '';
    const bulletsRaw = el.dataset.bullets || '';
    return { title, img, tools, impact, desc, bulletsRaw };
  }

  function openModalAt(i) {
    const originals = originalsList();
    if (!originals.length) return;
    i = ((i % originals.length) + originals.length) % originals.length;
    const el = originals[i];
    const data = renderModalFromElement(el);
    populateModal(data);
    modal.classList.add('visible'); modal.setAttribute('aria-hidden', 'false');
    currentIndex = i; pause();
  }

  function populateModal(data) {
    mmTitle.textContent = data.title || '';
    mmImg.src = data.img || '';
    mmImg.alt = data.title || '';
    mmTools.textContent = data.tools || '';
    mmImpact.textContent = data.impact || '';
    mmDesc.textContent = data.desc || '';
    // bullets: pipe-separated
    mmBullets.innerHTML = '';
    if (data.bulletsRaw) {
      const bullets = data.bulletsRaw.split('|').map(s => s.trim()).filter(Boolean);
      bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        mmBullets.appendChild(li);
      });
    }
  }

  function closeModal() {
    modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true');
    currentIndex = -1;
    const ex = track.querySelector('.marquee-item.expanded'); if (ex) ex.classList.remove('expanded');
    resume();
  }

  // click on marquee item -> open modal
  track.addEventListener('click', (ev) => {
    const clicked = ev.target.closest('.marquee-item');
    if (!clicked) return;
    const originals = originalsList();
    // find by matching title (first-half originals)
    let idx = originals.findIndex(o => o.dataset.title === clicked.dataset.title && o.dataset.desc === clicked.dataset.desc);
    if (idx === -1) idx = originals.findIndex(o => o.dataset.title === clicked.dataset.title);
    if (idx !== -1) openModalAt(idx);
    else {
      // fallback: open via data from clicked
      const data = renderModalFromElement(clicked);
      populateModal(data);
      modal.classList.add('visible'); modal.setAttribute('aria-hidden', 'false');
      pause();
      currentIndex = -1;
    }
  });

  // prev/next handlers
  if (btnPrev) btnPrev.addEventListener('click', () => { if (currentIndex !== -1) openModalAt(currentIndex - 1); });
  if (btnNext) btnNext.addEventListener('click', () => { if (currentIndex !== -1) openModalAt(currentIndex + 1); });

  // close modal on outside click or close button
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target === btnClose) closeModal(); });
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // keyboard nav inside modal
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('visible')) return;
    if (e.key === 'ArrowLeft') openModalAt(currentIndex - 1);
    else if (e.key === 'ArrowRight') openModalAt(currentIndex + 1);
    else if (e.key === 'Escape') closeModal();
  });

  // tune duration based on original item count
  function tune() {
    const count = track.children.length;
    const base = 18;
    const secs = Math.max(8, Math.round(base * (count / 14)));
    track.style.setProperty('--marquee-duration', secs + 's');
  }
  tune();
  window.addEventListener('resize', () => setTimeout(tune, 120));

  // Expose helper used by project-cards to open modal using data object
  window.openProjectModal = function (data) {
    populateModal(data);
    modal.classList.add('visible'); modal.setAttribute('aria-hidden','false');
    pause();
    currentIndex = -1; // unknown index
  };

})();
