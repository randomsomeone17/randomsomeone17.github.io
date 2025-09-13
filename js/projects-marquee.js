// js/projects-marquee.js
(function () {
  const TRACK_ID = 'marquee-track';
  const track = document.getElementById(TRACK_ID);
  if (!track) return;

  // === Duplicate originals exactly once so animation -50% is correct ===
  // Take the children present on load as the "original" sequence.
  if (!track.dataset.duplicated) {
    const originals = Array.from(track.children);
    const originalsCount = originals.length;
    // store original count for tune() and other logic
    track.dataset.originalCount = String(originalsCount);

    // Append a single cloned copy of that original sequence (one clone only)
    originals.forEach(node => {
      track.appendChild(node.cloneNode(true));
    });

    track.dataset.duplicated = 'true';
  }

  // Pause / resume helpers (used by mouse hover, modal open)
  function pause() { track.classList.add('paused'); }
  function resume() { track.classList.remove('paused'); }

  // Hover behavior: expand item under pointer
  track.addEventListener('pointerenter', pause);
  track.addEventListener('pointerleave', resume);

  // Keyboard accessible pause via focus
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', resume);

  // Tune marquee duration based on the original item count
  function tune() {
    const originalCount = Number(track.dataset.originalCount) || Math.round(track.children.length / 2);
    const base = 18; // base seconds for about ~14 items
    const secs = Math.max(6, Math.round(base * (originalCount / 14)));
    track.style.setProperty('--marquee-duration', secs + 's');
  }
  // run tune after a tick so layout settles
  setTimeout(tune, 80);
  window.addEventListener('resize', () => setTimeout(tune, 140));

  // Expose helper used by other scripts to open the details modal
  // This expects a modal with id="modal" and elements with ids: mm-title, mm-img, mm-tools, mm-impact, mm-desc, mm-bullets
  const modal = document.getElementById('modal');
  const mmTitle = modal ? modal.querySelector('#mm-title') : null;
  const mmImg = modal ? modal.querySelector('#mm-img') : null;
  const mmTools = modal ? modal.querySelector('#mm-tools') : null;
  const mmImpact = modal ? modal.querySelector('#mm-impact') : null;
  const mmDesc = modal ? modal.querySelector('#mm-desc') : null;
  const mmBullets = modal ? modal.querySelector('#mm-bullets') : null;

  function populateModal(data) {
    if (!modal) return;
    mmTitle && (mmTitle.textContent = data.title || '');
    mmImg && (mmImg.src = data.img || '');
    mmImg && (mmImg.alt = data.title || '');
    mmTools && (mmTools.textContent = data.tools || '');
    mmImpact && (mmImpact.textContent = data.impact || '');
    mmDesc && (mmDesc.textContent = data.desc || '');

    // bullets: pipe-separated in data.bulletsRaw
    if (mmBullets) {
      mmBullets.innerHTML = '';
      const raw = data.bulletsRaw || '';
      if (raw) {
        const items = raw.split('|').map(s => s.trim()).filter(Boolean);
        items.forEach(it => {
          const li = document.createElement('li');
          li.textContent = it;
          mmBullets.appendChild(li);
        });
      }
    }
  }

  // Called by details buttons or other scripts
  window.openProjectModal = function (data) {
    if (!modal) return;
    populateModal(data || {});
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    pause();
  };

  // Wire close / nav buttons if present
  if (modal) {
    modal.querySelectorAll('.marquee-modal-close').forEach(b => b.addEventListener('click', () => {
      modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); resume();
    }));
    modal.querySelectorAll('.marquee-modal-nav.prev').forEach(b => b.addEventListener('click', () => {
      // navigation behavior can be implemented later if desired
      modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); resume();
    }));
    modal.querySelectorAll('.marquee-modal-nav.next').forEach(b => b.addEventListener('click', () => {
      modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); resume();
    }));
    // allow Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('visible')) {
        modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); resume();
      }
    });
  }

})();
