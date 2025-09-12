// Project data for the wheel and details
const projectsData = [
  { title: "AI in Healthcare Research", description: "Machine learning applications for early disease detection using neural networks and patient data analysis.", tools: "Python, TensorFlow, PyTorch, Scikit-learn, Pandas", impact: "Potential to improve early diagnosis rates by 35% for certain conditions" },
  { title: "Responsive Web Platform", description: "Accessibility-focused web application with React, featuring responsive design and WCAG 2.1 compliance.", tools: "React, Node.js, CSS3, HTML5, JavaScript", impact: "Serves over 500 monthly users with a 99% accessibility score" },
  { title: "Educational Game", description: "Interactive learning game for STEM education that makes complex concepts approachable for students.", tools: "Unity, C#, Blender, Photoshop", impact: "Used in 10+ schools, improving test scores by an average of 22%" },
  { title: "Data Visualization Platform", description: "Climate data analysis and presentation tool that helps researchers visualize complex environmental data.", tools: "D3.js, Python, MongoDB, Express.js", impact: "Helped researchers identify 3 new climate patterns in regional data" }
];

// Initialize the project wheel
function initProjectWheel() {
  const wheel = document.querySelector('.project-wheel');
  if (!wheel) return;
  const items = Array.from(wheel.querySelectorAll('.wheel-item'));
  const title = document.getElementById('project-title');
  const description = document.getElementById('project-description');
  const tools = document.getElementById('project-tools');
  const impact = document.getElementById('project-impact');

  // Position items in a circle
  items.forEach((item, i) => {
    const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2; // start at top
    const radius = Math.min(120, (Math.min(wheel.clientWidth, wheel.clientHeight) / 2) - 40);
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));
    // Use translate to position around center of parent (.project-wheel)
    item.style.left = `calc(50% + ${x}px - ${item.offsetWidth/2}px)`;
    item.style.top = `calc(50% + ${y}px - ${item.offsetHeight/2}px)`;

    // Click behavior
    item.addEventListener('click', () => {
      items.forEach(it => it.classList.remove('active'));
      item.classList.add('active');
      const project = projectsData[i];
      if (title) title.textContent = project.title;
      if (description) description.textContent = project.description;
      if (tools) tools.textContent = project.tools;
      if (impact) impact.textContent = project.impact;
    });

    // Hover effects (desktop)
    item.addEventListener('mouseenter', () => {
      if (!item.classList.contains('active')) item.style.transform = 'scale(1.08)';
    });
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('active')) item.style.transform = '';
    });
  });

  // Activate first by default
  const first = items[0];
  if (first) first.click();
}

// Auto-rotate the wheel
function startWheelRotation() {
  const items = Array.from(document.querySelectorAll('.wheel-item'));
  if (!items.length) return;
  let current = 0;
  setInterval(() => {
    current = (current + 1) % items.length;
    items[current].click();
  }, 5000);
}

// Basic tab switching (kept for single-page fallback)
function switchToTab(name) {
  document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  const tab = document.getElementById(name);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.menu-item[data-tab="' + name + '"]').forEach(m => m.classList.add('active'));
  if (name === 'projects' || name === 'journey') animateSkillBars();
}

// animate skill bars
function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const percent = parseInt(bar.getAttribute('data-percent') || 60, 10);
    const fill = bar.querySelector('.skill-fill');
    if (!fill) return;
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = percent + '%'; }, 120);
  });
}

/* DOM loaded initialization */
document.addEventListener('DOMContentLoaded', () => {
  initProjectWheel();
  startWheelRotation();
  animateSkillBars();

  // Menu click behavior:
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // If the anchor has an explicit href to a page (not '#'), let it navigate
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        return; // allow default navigation to other HTML pages
      }
      // Otherwise treat it as SPA tab control
      e.preventDefault();
      const tab = this.getAttribute('data-tab');
      if (tab) switchToTab(tab);
      // close mobile nav if present
      const mt = document.getElementById('menu-toggle');
      if (mt && window.innerWidth <= 840) {
        mt.setAttribute('aria-expanded', 'false');
        const nav = document.getElementById('mobile-nav');
        if (nav) { nav.style.display = 'none'; nav.classList.remove('visible'); }
      }
    });
  });

  // Mobile hamburger: build a simple nav with real links (page navigation)
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const nav = document.getElementById('mobile-nav');
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      if (!open) {
        // construct mobile links to your separate pages
        nav.innerHTML = `
          <nav class="mobile-nav visible" style="background:#fff;padding:.75rem;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
            <a class="menu-item" href="index.html">Home</a>
            <a class="menu-item" href="projects.html">Projects</a>
            <a class="menu-item" href="info.html">Info</a>
            <a class="menu-item" href="beyond.html">Beyond Work</a>
            <a class="menu-item" href="journey.html">My Journey</a>
          </nav>`;
        nav.style.display = 'block';
        nav.classList.add('visible');
        // listeners: no special handler required for navigation (anchors will navigate)
        // but we add a small handler to close the menu after click
        nav.querySelectorAll('.menu-item').forEach(mi => mi.addEventListener('click', () => {
          menuToggle.setAttribute('aria-expanded', 'false');
          nav.style.display = 'none';
          nav.classList.remove('visible');
        }));
      } else {
        nav.style.display = 'none';
        nav.classList.remove('visible');
      }
    });
  }

  // Theme toggle & persist
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  }

  // Project filtering
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card => {
        if (filter === 'all' || card.getAttribute('data-type') === filter) card.style.display = '';
        else card.style.display = 'none';
      });
    });
  });

  // Modal details
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (!card || !modal) return;
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalBody.textContent = card.querySelector('.proj-desc').textContent;
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('modal-close').focus();
    });
  });
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', () => { modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); });
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); } });

  // Accordion toggles
  document.querySelectorAll('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const panel = this.nextElementSibling;
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      if (panel) { panel.style.display = open ? 'none' : 'block'; panel.setAttribute('aria-hidden', String(open)); }
    });
  });

  // Carousel basic
  (function () {
    const items = Array.from(document.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    let index = 0;
    function show(i) { items.forEach(it => it.classList.remove('active')); items[i].classList.add('active'); }
    show(index);
    const next = document.querySelector('.carousel-btn.next');
    const prev = document.querySelector('.carousel-btn.prev');
    if (next) next.addEventListener('click', () => { index = (index + 1) % items.length; show(index); });
    if (prev) prev.addEventListener('click', () => { index = (index - 1 + items.length) % items.length; show(index); });
  })();

  // Keyboard navigation (left/right)
  window.addEventListener('keydown', (e) => {
    const tabs = ['home','projects','info','beyond','journey'];
    const current = tabs.findIndex(t => document.getElementById(t) && document.getElementById(t).classList.contains('active'));
    let nextIndex = current;
    if (e.key === 'ArrowRight') nextIndex = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (current - 1 + tabs.length) % tabs.length;
    if (nextIndex !== current && document.getElementById(tabs[nextIndex])) switchToTab(tabs[nextIndex]);
    else if (e.key === 'Escape') {
      const modalEl = document.getElementById('modal');
      if (modalEl && modalEl.classList.contains('visible')) { modalEl.classList.remove('visible'); modalEl.setAttribute('aria-hidden','true'); }
    }
  });
});
