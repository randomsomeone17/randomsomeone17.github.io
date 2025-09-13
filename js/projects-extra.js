// js/projects-extra.js
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const searchInput = $('#project-search');
  const searchResults = $('#search-results');
  const searchResultsList = $('#search-results-list');
  const track = document.getElementById('marquee-track');

  // Helper: return originals (first half of track) as data objects
  function getOriginalsData() {
    if (!track) return [];
    const all = Array.from(track.children);
    const originals = all.slice(0, all.length / 2);
    return originals.map(el => ({
      title: el.dataset.title || '',
      img: el.dataset.img || (el.querySelector('img')?.src || ''),
      tools: el.dataset.tools || '',
      impact: el.dataset.impact || '',
      desc: el.dataset.desc || '',
      bulletsRaw: el.dataset.bullets || ''
    }));
  }

  // Render a small card node for results (returns element)
  function buildResultCard(data) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.setAttribute('data-title', data.title || '');
    article.innerHTML = `
      <h3>${data.title || ''}</h3>
      <img src="${data.img || ''}" alt="${data.title || ''}" loading="lazy"/>
      <p class="proj-desc">${data.desc ? (data.desc.length > 140 ? data.desc.slice(0,140) + '…' : data.desc) : ''}</p>
      <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
        <button class="details-btn">Details</button>
      </div>
    `;
    // details button handler opens modal with full data
    article.querySelector('.details-btn').addEventListener('click', () => {
      window.openProjectModal({
        title: data.title,
        img: data.img,
        tools: data.tools,
        impact: data.impact,
        desc: data.desc,
        bulletsRaw: data.bulletsRaw
      });
    });
    return article;
  }

  // Apply search: find matches in originals
  function applySearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (!q) {
      searchResults.style.display = 'none';
      searchResultsList.innerHTML = '';
      return;
    }
    const items = getOriginalsData();
    const matches = items.filter(it => {
      return (it.title || '').toLowerCase().includes(q) || (it.desc || '').toLowerCase().includes(q) || (it.tools || '').toLowerCase().includes(q);
    });
    searchResultsList.innerHTML = '';
    if (matches.length === 0) {
      searchResultsList.innerHTML = '<p>No results</p>';
    } else {
      matches.forEach(m => searchResultsList.appendChild(buildResultCard(m)));
    }
    searchResults.style.display = 'block';
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  // View toggle (grid/list)
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

  // DETAILS buttons for cards already in #project-list
  function wireExistingDetailsButtons() {
    $$('.project-card .details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.project-card');
        if (!card) return;
        // Build data object from data-* attributes on the card
        const data = {
          title: card.dataset.title || (card.querySelector('h3')?.textContent || ''),
          img: card.dataset.img || (card.querySelector('img')?.src || ''),
          tools: card.dataset.tools || '',
          impact: card.dataset.impact || '',
          desc: card.dataset.desc || (card.querySelector('.proj-desc')?.textContent || ''),
          bulletsRaw: card.dataset.bullets || ''
        };
        // open modal (projects-marquee exposes this)
        if (window.openProjectModal) window.openProjectModal(data);
      });
    });
  }
  wireExistingDetailsButtons();

  // Theme toggle + persist
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

  // Mobile hamburger fallback
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
