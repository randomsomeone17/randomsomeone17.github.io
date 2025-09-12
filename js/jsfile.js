/* main.js - externalized interactions */

/* ========== Basic tab switching ========== */
function switchToTab(name) {
  document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  const tab = document.getElementById(name);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.menu-item[data-tab="' + name + '"]').forEach(m => m.classList.add('active'));

  // Animate skill bars when Projects or About opens
  if (name === 'projects' || name === 'about') animateSkillBars();
}

/* attach menu listeners (header & sidebar) */
document.addEventListener('DOMContentLoaded', function () {
  // header & sidebar menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const tab = this.getAttribute('data-tab');
      switchToTab(tab);
      // close mobile nav if present
      const mt = document.getElementById('menu-toggle');
      if (mt && window.innerWidth <= 840) {
        mt.setAttribute('aria-expanded', 'false');
        document.getElementById('mobile-nav').style.display = 'none';
      }
    });
  });

  // Mobile hamburger menu
  document.getElementById('menu-toggle').addEventListener('click', function () {
    const nav = document.getElementById('mobile-nav');
    const open = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!open));
    if (!open) {
      nav.innerHTML = '<nav style="background:#fff;padding:.75rem;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)"><a href="#" data-tab="home" class="menu-item active" style="display:block;padding:.5rem 0">Home</a><a href="#" data-tab="projects" class="menu-item" style="display:block;padding:.5rem 0">Projects</a><a href="#" data-tab="info" class="menu-item" style="display:block;padding:.5rem 0">Info</a><a href="#" data-tab="about" class="menu-item" style="display:block;padding:.5rem 0">About</a></nav>';
      nav.style.display = 'block';
      // attach listeners to the new mobile links
      nav.querySelectorAll('.menu-item').forEach(mi => mi.addEventListener('click', ev => {
        ev.preventDefault();
        switchToTab(mi.getAttribute('data-tab'));
        document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
        nav.style.display = 'none';
      }));
    } else {
      nav.style.display = 'none';
    }
  });

  /* ========== Theme toggle ========== */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark');
    });
  }

  /* ========== Project filtering ========== */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card => {
        if (filter === 'all' || card.getAttribute('data-type') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ========== Modal details ========== */
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalBody.textContent = card.querySelector('.proj-desc').textContent + " — This modal demonstrates a JS-controlled popup. Replace with real project details.";
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('modal-close').focus();
    });
  });
  if (document.getElementById('modal-close')) {
    document.getElementById('modal-close').addEventListener('click', function () {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); } });
  }

  /* ========== Accordion ========== */
  document.querySelectorAll('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const panel = this.nextElementSibling;
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      panel.style.display = open ? 'none' : 'block';
      panel.setAttribute('aria-hidden', String(open));
    });
  });

  /* ========== Carousel (simple) ========== */
  (function () {
    const items = Array.from(document.querySelectorAll('.carousel-item'));
    if (items.length === 0) return;
    let index = 0;
    function show(i) {
      items.forEach(it => it.classList.remove('active'));
      items[i].classList.add('active');
    }
    show(index);
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    if (nextBtn) nextBtn.addEventListener('click', () => { index = (index + 1) % items.length; show(index); });
    if (prevBtn) prevBtn.addEventListener('click', () => { index = (index - 1 + items.length) % items.length; show(index); });
  })();

  /* ========== Skill bar animation ========== */
  function animateSkillBars() {
    document.querySelectorAll('.skill-bar').forEach(bar => {
      const percent = parseInt(bar.getAttribute('data-percent') || 60, 10);
      const fill = bar.querySelector('.skill-fill');
      if (!fill) return;
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = percent + '%'; }, 120);
    });
  }

  // animate initial state for visible bars
  animateSkillBars();

  /* ========== Keyboard navigation (left/right to switch tabs) ========== */
  window.addEventListener('keydown', (e) => {
    const tabs = ['home', 'projects', 'info', 'about'];
    let current = tabs.findIndex(t => document.getElementById(t).classList.contains('active'));
    if (e.key === 'ArrowRight') {
      current = (current + 1) % tabs.length;
      switchToTab(tabs[current]);
    } else if (e.key === 'ArrowLeft') {
      current = (current - 1 + tabs.length) % tabs.length;
      switchToTab(tabs[current]);
    } else if (e.key === 'Escape') {
      const modalEl = document.getElementById('modal');
      if (modalEl && !modalEl.classList.contains('hidden')) {
        modalEl.classList.add('hidden');
        modalEl.setAttribute('aria-hidden', 'true');
      }
    }
  });
});