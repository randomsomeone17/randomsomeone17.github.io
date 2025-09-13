/* projects-marquee.js
   - Sets up a seamless marquee (duplicates items)
   - Detects center item, pauses animation on hover
   - Expands center item with extra info and shoots stars
   - Click center item opens modal; clicking outside closes modal & resumes
*/
(function () {
  // config
  const MARQUEE_ID = 'marquee-track';
  const viewportMargin = 0; // not used currently
  const starCount = 10;     // how many stars per side when expanded
  const starDuration = 900; // ms

  const track = document.getElementById(MARQUEE_ID);
  if (!track) return;

  // duplicate children to allow seamless -50% translation loop
  const children = Array.from(track.children);
  // remove any previous duplicates (if script re-runs)
  if (children.length && track.dataset.duplicated !== 'true') {
    children.forEach(c => track.appendChild(c.cloneNode(true)));
    track.dataset.duplicated = 'true';
  }

  // helper: compute center element given viewport center
  function getViewportCenterX(elem) {
    const rect = elem.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function getTrackCenterX() {
    const vp = track.parentElement.getBoundingClientRect();
    return vp.left + vp.width / 2;
  }

  // find currently closest child to center (only consider original set)
  function findClosestToCenter() {
    const vpCenterX = getTrackCenterX();
    // only take first half (unique originals) to avoid duplicates
    const all = Array.from(track.children).slice(0, track.children.length / 2);
    let best = null;
    let bestDist = Infinity;
    all.forEach(ch => {
      const cx = getViewportCenterX(ch);
      const d = Math.abs(cx - vpCenterX);
      if (d < bestDist) { bestDist = d; best = ch; }
    });
    return { el: best, dist: bestDist };
  }

  // pause/resume marquee
  function pauseMarquee() {
    track.classList.add('paused');
  }
  function resumeMarquee() {
    track.classList.remove('paused');
  }

  // small function to create a star element that shoots left or right
  function emitStars(el) {
    // emit from two sides
    const rect = el.getBoundingClientRect();
    const parent = el; // attach to item for relative pos
    for (let side of ['left', 'right']) {
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'marquee-star';
        // start position near vertical center of item; offset random
        const startX = side === 'left' ? 6 : rect.width - 16;
        const startY = rect.height / 2 + (Math.random() * 20 - 10);
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;
        star.style.opacity = '1';
        // small size variation
        star.style.width = `${6 + Math.round(Math.random()*8)}px`;
        star.style.height = star.style.width;
        // choose animation direction
        const animName = (side === 'left') ? 'star-shoot-left' : 'star-shoot-right';
        star.style.animation = `${animName} ${800 + Math.round(Math.random()*400)}ms cubic-bezier(.2,.9,.2,1) forwards`;
        // offset start a little
        star.style.animationDelay = `${Math.random()*200}ms`;
        parent.appendChild(star);
        // cleanup after animation
        setTimeout(() => { star.remove(); }, starDuration + 600);
      }
    }
  }

  // expand center item: add class and show .mi-extra text (create if missing)
  function expandCenterItem(item) {
    if (!item) return;
    item.classList.add('center-expanded');
    if (!item.querySelector('.mi-extra')) {
      const extra = document.createElement('div');
      extra.className = 'mi-extra';
      // populate from data attributes
      const desc = item.dataset.desc || '';
      const tools = item.dataset.tools ? `<strong>Tools:</strong> ${item.dataset.tools}` : '';
      extra.innerHTML = `<div style="font-weight:700; margin-bottom:6px;">${item.dataset.title || ''}</div>
                         <div style="font-size:.95rem; margin-bottom:6px;">${desc}</div>
                         <div style="font-size:.9rem; color:#444">${tools}</div>`;
      item.appendChild(extra);
    }
    // emit stars once when expanded
    emitStars(item);
  }

  // collapse
  function collapseExpanded(item) {
    if (!item) return;
    item.classList.remove('center-expanded');
    const extra = item.querySelector('.mi-extra');
    if (extra) {
      // keep it but hide; no need to remove
      extra.style.display = '';
    }
  }

  // When cursor enters an item, check if it is the center one (threshold)
  let currentlyExpanded = null;
  track.addEventListener('pointerenter', (ev) => {
    // pointer events on track will be delegated below on pointerover
  });

  // use pointerover to detect entering items
  track.addEventListener('pointerover', (ev) => {
    const targetItem = ev.target.closest('.marquee-item');
    if (!targetItem) return;
    // pick closest item to center and only react if the hovered target is that closest element
    const { el: closest, dist } = findClosestToCenter();
    if (!closest) return;
    // threshold: if distance between centers less than 80px, treat as center
    const threshold = 80;
    if (closest === targetItem && dist < threshold) {
      // pause track and expand
      pauseMarquee();
      expandCenterItem(targetItem);
      currentlyExpanded = targetItem;
    }
  });

  // pointerout to resume when leaving the expanded area
  track.addEventListener('pointerout', (ev) => {
    const leftItem = ev.target.closest('.marquee-item');
    // if we left the currentlyExpanded and pointer is outside it (not in any of its children)
    if (currentlyExpanded && !currentlyExpanded.contains(ev.relatedTarget)) {
      // collapse and resume
      collapseExpanded(currentlyExpanded);
      currentlyExpanded = null;
      resumeMarquee();
    }
  });

  // clicking behavior: if click on center item, open modal
  const modal = document.getElementById('marquee-modal');
  const mmTitle = document.getElementById('mm-title');
  const mmDesc = document.getElementById('mm-desc');
  const mmTools = document.getElementById('mm-tools');
  const mmImpact = document.getElementById('mm-impact');
  const mmImg = document.getElementById('mm-img');
  const mmClose = modal ? modal.querySelector('.marquee-modal-close') : null;

  track.addEventListener('click', (ev) => {
    const clicked = ev.target.closest('.marquee-item');
    if (!clicked) return;
    // only react if clicked item is currently the closest-to-center
    const { el: closest } = findClosestToCenter();
    if (closest !== clicked) {
      // not center — ignore or optionally nudge to make it center
      return;
    }
    // open modal with details
    if (!modal) return;
    mmTitle.textContent = clicked.dataset.title || '';
    mmDesc.textContent = clicked.dataset.desc || '';
    mmTools.textContent = clicked.dataset.tools || '';
    mmImpact.textContent = clicked.dataset.impact || '';
    mmImg.src = clicked.dataset.img || (clicked.querySelector('img')?.src || '');
    mmImg.alt = clicked.dataset.title || '';
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    // keep marquee paused while modal open
    pauseMarquee();
  });

  // click outside modal to close (and resume marquee)
  if (modal) {
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal || ev.target === mmClose) {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        // collapse any expanded center
        if (currentlyExpanded) { collapseExpanded(currentlyExpanded); currentlyExpanded = null; }
        resumeMarquee();
      }
    });
  }

  // also close with Escape key
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal && modal.classList.contains('visible')) {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
      if (currentlyExpanded) { collapseExpanded(currentlyExpanded); currentlyExpanded = null; }
      resumeMarquee();
    }
  });

  // Make sure the marquee animation speed scales with the number of items,
  // so more items = slightly longer duration (keeps perceived speed consistent).
  function tuneDuration() {
    const viewport = track.parentElement;
    const itemsCount = track.children.length; // duplicated included
    // base duration scales with total width: we take base 12s for 7 items, scale accordingly
    const base = 12; // seconds baseline
    const duration = Math.max(8, Math.round(base * (itemsCount / 7)));
    track.style.setProperty('--marquee-duration', duration + 's');
  }
  tuneDuration();

  // on resize, re-tune
  window.addEventListener('resize', () => setTimeout(tuneDuration, 120));
})();
