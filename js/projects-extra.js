// projects-extra.js
// Search, sort, view toggle, details button opens modal placeholder, mobile hamburger fallback, theme toggle.

(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // SEARCH: filter project cards by title or description
  const searchInput = $('#project-search');
  function applySearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    $$('.project-card').forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.proj-desc')?.textContent || '').toLowerCase();
      const show = !q || title.includes(q) || desc.includes(q);
      card.style.display = show ? '' : 'none';
    });
  }
  if (searchInput) searchInput.addEventListener('input', applySearch);

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

  // VIEW toggle (grid/list)
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

  // DETAILS button for project cards -> open modal with placeholder "fill me"
  $$('.details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.project-card');
      if (!card) return;
      // Build placeholder data (per your request)
      const data = {
        title: card.dataset.title || (card.querySelector('h3')?.textContent || 'Project'),
        desc: card.dataset.desc || 'fill me',
        tools: card.dataset.tools || '',
        impact: card.dataset.impact || '',
        img: card.dataset.img || card.querySelector('img')?.src || ''
      };
      // If projects-marquee exposes openProjectModal, use it; otherwise populate modal directly
      if (window.openProjectModal && typeof window.openProjectModal === 'function') {
        window.openProjectModal(data);
      } else {
        const modal = document.getElementById('marquee-modal');
        if (!modal) return;
        document.getElementById('mm-title').textContent = data.title;
        document.getElementById('mm-desc').textContent = data.desc;
        document.getElementById('mm-tools').textContent = data.tools;
        document.getElementById('mm-impact').textContent = data.impact;
        const mmImg = document.getElementById('mm-img');
        mmImg.src = data.img || '';
        mmImg.alt = data.title || '';
        modal.classList.add('visible'); modal.setAttribute('aria-hidden','false');
      }
    });
  });

  // Theme toggle + persist
  const themeToggle = $('#theme-toggle');
  function setTheme(t) {
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    try { localStorage.setItem('site-theme', t); } catch (e) {}
  }
  try {
    const saved = localStorage.getItem('site-theme');
    if (saved) setTheme(saved);
  } catch (e) {}
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    setTheme(dark ? 'dark' : 'light');
  });

  // MOBILE HAMBURGER: build a simple nav (if not already built by your main script)
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
        nav.style.display = 'block'; nav.classList.add('visible');
        nav.querySelectorAll('.menu-item').forEach(mi => mi.addEventListener('click', () => {
          mt.setAttribute('aria-expanded', 'false'); nav.style.display = 'none'; nav.classList.remove('visible');
        }));
      } else {
        nav.style.display = 'none'; nav.classList.remove('visible');
      }
    });
  }

})();
