// projects-extra.js
// Search, sort, view toggle, shuffle, lazy fade, details button -> modal, theme toggle, mobile nav fallback.

(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // SEARCH
  const searchInput = $('#project-search');
  function applyFilters() {
    const q = searchInput?.value.trim().toLowerCase() || '';
    $$('.project-card').forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.proj-desc')?.textContent || '').toLowerCase();
      const matches = !q || title.includes(q) || desc.includes(q);
      card.style.display = matches ? '' : 'none';
    });
  }
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  // SORT
  const sortSelect = $('#project-sort');
  function sortProjects(mode) {
    const list = $('#project-list');
    if (!list) return;
    const cards = $$('.project-card');
    const sorted = cards.slice().sort((a,b) => {
      const at = (a.querySelector('h3')?.textContent || '').trim().toLowerCase();
      const bt = (b.querySelector('h3')?.textContent || '').trim().toLowerCase();
      return at.localeCompare(bt);
    });
    if (mode === 'za') sorted.reverse();
    sorted.forEach(c => list.appendChild(c));
  }
  if (sortSelect) sortSelect.addEventListener('change', () => {
    const v = sortSelect.value;
    if (v === 'az') sortProjects('az');
    else if (v === 'za') sortProjects('za');
    else sortProjects('default');
  });

  // VIEW TOGGLE
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

  // SHUFFLE
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

  // LAZY FADE
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

  // DETAILS button handler for project cards -> open modal using global helper
  $$('.details-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const card = btn.closest('.project-card');
      if (!card) return;
      // prefer data attrs on card; fallback to DOM contents
      const data = {
        title: card.dataset.title || (card.querySelector('h3')?.textContent || ''),
        desc: card.dataset.desc || (card.querySelector('.proj-desc')?.textContent || ''),
        tools: card.dataset.tools || card.getAttribute('data-tools') || '',
        impact: card.dataset.impact || card.getAttribute('data-impact') || '',
        img: card.dataset.img || card.querySelector('img')?.src || ''
      };
      // Use global function exposed by projects-marquee.js to open modal if available
      if (window.openProjectModal && typeof window.openProjectModal === 'function') {
        window.openProjectModal(data);
      } else {
        // fallback: populate modal directly
        const mm = document.getElementById('marquee-modal');
        if (!mm) return;
        document.getElementById('mm-title').textContent = data.title;
        document.getElementById('mm-desc').textContent = data.desc;
        document.getElementById('mm-tools').textContent = data.tools;
        document.getElementById('mm-impact').textContent = data.impact;
        const mmImg = document.getElementById('mm-img');
        mmImg.src = data.img || '';
        mmImg.alt = data.title || '';
        mm.classList.add('visible'); mm.setAttribute('aria-hidden','false');
      }
    });
  });

  // THEME toggle (persist)
  const themeToggle = $('#theme-toggle');
  function setTheme(t) {
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('site-theme', t); } catch (e) {}
  }
  try { const saved = localStorage.getItem('site-theme'); if (saved) setTheme(saved); } catch (e) {}
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    setTheme(dark ? 'dark' : 'light');
  });

  // MOBILE HAMBURGER fallback (ensures mobile nav is built if your main script didn't)
  const mt = document.getElementById('menu-toggle');
  if (mt) {
    mt.addEventListener('click', function () {
      const nav = document.getElementById('mobile-nav');
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      if (!open) {
        nav.innerHTML = `
          <nav style="background:#fff;padding:.75rem;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)">
            <a href="index.html" class="menu-item" style="display:block;padding:.5rem 0">Home</a>
            <a href="projects.html" class="menu-item" style="display:block;padding:.5rem 0">Projects</a>
            <a href="info.html" class="menu-item" style="display:block;padding:.5rem 0">Info</a>
            <a href="beyond.html" class="menu-item" style="display:block;padding:.5rem 0">Beyond Work</a>
            <a href="journey.html" class="menu-item" style="display:block;padding:.5rem 0">My Journey</a>
          </nav>`;
        nav.style.display = 'block';
        nav.classList.add('visible');
        nav.querySelectorAll('.menu-item').forEach(mi => mi.addEventListener('click', () => {
          mt.setAttribute('aria-expanded', 'false'); nav.style.display = 'none'; nav.classList.remove('visible');
        }));
      } else {
        nav.style.display = 'none'; nav.classList.remove('visible');
      }
    });
  }

})();
