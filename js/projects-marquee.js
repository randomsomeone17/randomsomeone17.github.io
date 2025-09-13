// projects-extra.js
// Handles search, sort, view toggle, shuffle, lazy fade, filter buttons, copy link, theme toggle.

(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Search + Filter combined
  const searchInput = $('#project-search');
  function applyFilters() {
    const q = searchInput?.value.trim().toLowerCase() || '';
    const activeFilter = $$('.filter-btn').find(b => b.classList.contains('active'))?.getAttribute('data-filter') || 'all';
    $$('.project-card').forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.proj-desc')?.textContent || '').toLowerCase();
      const type = (card.getAttribute('data-type') || '').toLowerCase();
      const matchesQ = !q || title.includes(q) || desc.includes(q);
      const matchesFilter = activeFilter === 'all' || type === activeFilter;
      card.style.display = (matchesQ && matchesFilter) ? '' : 'none';
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    window.addEventListener('keydown', (e) => { if (e.key === 'f' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); } });
  }

  // Sort
  const sortSelect = $('#project-sort');
  function sortProjects(mode) {
    const list = $('#project-list');
    if (!list) return;
    const cards = $$('.project-card');
    // stable sort by title text
    const sorted = cards.slice().sort((a,b) => {
      const at = (a.querySelector('h3')?.textContent || '').trim().toLowerCase();
      const bt = (b.querySelector('h3')?.textContent || '').trim().toLowerCase();
      return at.localeCompare(bt);
    });
    if (mode === 'za') sorted.reverse();
    // append in order
    sorted.forEach(c => list.appendChild(c));
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const v = sortSelect.value;
      if (v === 'az') sortProjects('az');
      else if (v === 'za') sortProjects('za');
      else sortProjects('default');
    });
  }

  // View toggle
  const viewToggle = $('#view-toggle');
  const projectList = $('#project-list');
  let isList = false;
  if (viewToggle && projectList) {
    projectList.classList.add('grid-view');
    viewToggle.addEventListener('click', () => {
      isList = !isList;
      projectList.classList.toggle('list-view', isList);
      projectList.classList.toggle('grid-view', !isList);
      viewToggle.textContent = isList ? 'Grid View' : 'List View';
    });
  }

  // Shuffle
  const shuffleBtn = $('#shuffle-btn');
  if (shuffleBtn && projectList) {
    shuffleBtn.addEventListener('click', () => {
      const cards = $$('.project-card').filter(c => c.style.display !== 'none');
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      cards.forEach(c => projectList.appendChild(c));
    });
  }

  // Lazy images fade (IntersectionObserver)
  function initLazyFade() {
    const imgs = $$('img[loading="lazy"]');
    if ('IntersectionObserver' in window && imgs.length) {
      const obs = new IntersectionObserver((entries, ob) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const img = e.target;
            img.classList.add('lazyfade');
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.complete) img.classList.add('loaded');
            else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            ob.unobserve(img);
          }
        });
      }, { rootMargin: '150px 0px' });
      imgs.forEach(i => obs.observe(i));
    } else {
      imgs.forEach(i => setTimeout(() => i.classList.add('loaded'), 120));
    }
  }
  initLazyFade();

  // Copy-to-clipboard buttons
  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.project-card');
      const link = card?.getAttribute('data-link') || window.location.href;
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
        else {
          const ta = document.createElement('textarea');
          ta.value = link; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        const prev = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = prev, 1200);
      } catch {
        btn.textContent = 'Error';
        setTimeout(() => btn.textContent = 'Copy Link', 1200);
      }
    });
  });

  // Filter buttons
  $$('.filter-btn').forEach(b => b.addEventListener('click', () => {
    $$('.filter-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    applyFilters();
  }));

  // Theme toggle persistent
  const themeToggle = $('#theme-toggle');
  function setTheme(t) {
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('site-theme', t); } catch {}
  }
  const saved = (function(){ try { return localStorage.getItem('site-theme'); } catch { return null; } })();
  if (saved) setTheme(saved);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      setTheme(dark ? 'dark' : 'light');
    });
  }

  // Keyboard navigation for searching/shorcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' && document.activeElement !== searchInput) {
      e.preventDefault(); searchInput?.focus();
    }
    if (e.key === 'Escape') {
      // close modal handled in marquee script
    }
  });

  // If project list is empty, populate with the marquee items as cards (optional convenience)
  const list = $('#project-list');
  if (list && list.children.length === 0) {
    // create cards from marquee items (originals only)
    const track = document.getElementById('marquee-track');
    if (track) {
      const originals = Array.from(track.children).slice(0, track.children.length / 2 || track.children.length);
      if (originals.length === 0) {
        // fallback: build from DOM's existing originals (before duplication) if not duplicated yet
        const raw = Array.from(track.children);
        raw.forEach((item) => {
          // don't duplicate here: only add once
          const card = document.createElement('article');
          card.className = 'project-card';
          card.setAttribute('data-type', 'research');
          card.innerHTML = `<h3>${item.dataset.title || 'Project'}</h3>
            <img src="${item.dataset.img || item.querySelector('img')?.src || ''}" alt="${item.dataset.title || ''}" loading="lazy" />
            <p class="proj-desc">${item.dataset.desc || ''}</p>
            <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
              <button class="details-btn">Details</button>
              <button class="copy-btn">Copy Link</button>
            </div>`;
          list.appendChild(card);
        });
      } else {
        originals.forEach(item => {
          const card = document.createElement('article');
          card.className = 'project-card';
          card.setAttribute('data-type', item.dataset.type || 'research');
          card.innerHTML = `<h3>${item.dataset.title || 'Project'}</h3>
            <img src="${item.dataset.img || item.querySelector('img')?.src || ''}" alt="${item.dataset.title || ''}" loading="lazy" />
            <p class="proj-desc">${item.dataset.desc || ''}</p>
            <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
              <button class="details-btn">Details</button>
              <button class="copy-btn">Copy Link</button>
            </div>`;
          list.appendChild(card);
        });
        // re-run lazy fade on new images
        initLazyFade();
      }
    }
  }

})();
