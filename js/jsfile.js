// Project data for the wheel and details
const projectsData = [
  {
    title: "AI in Healthcare Research",
    description: "Machine learning applications for early disease detection using neural networks and patient data analysis.",
    tools: "Python, TensorFlow, PyTorch, Scikit-learn, Pandas",
    impact: "Potential to improve early diagnosis rates by 35% for certain conditions"
  },
  {
    title: "Responsive Web Platform",
    description: "Accessibility-focused web application with React, featuring responsive design and WCAG 2.1 compliance.",
    tools: "React, Node.js, CSS3, HTML5, JavaScript",
    impact: "Serves over 500 monthly users with a 99% accessibility score"
  },
  {
    title: "Educational Game",
    description: "Interactive learning game for STEM education that makes complex concepts approachable for students.",
    tools: "Unity, C#, Blender, Photoshop",
    impact: "Used in 10+ schools, improving test scores by an average of 22%"
  },
  {
    title: "Data Visualization Platform",
    description: "Climate data analysis and presentation tool that helps researchers visualize complex environmental data.",
    tools: "D3.js, Python, MongoDB, Express.js",
    impact: "Helped researchers identify 3 new climate patterns in regional data"
  }
];

// Initialize the project wheel
function initProjectWheel() {
  const wheel = document.querySelector('.project-wheel');
  const items = document.querySelectorAll('.wheel-item');
  const title = document.getElementById('project-title');
  const description = document.getElementById('project-description');
  const tools = document.getElementById('project-tools');
  const impact = document.getElementById('project-impact');
  
  // Position items in a circle
  items.forEach((item, i) => {
    const angle = (i / items.length) * 2 * Math.PI;
    const radius = 120;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    item.style.transform = `translate(${x}px, ${y}px)`;
    
    // Add click event
    item.addEventListener('click', () => {
      items.forEach(it => it.classList.remove('active'));
      item.classList.add('active');
      
      // Update project details
      const project = projectsData[i];
      title.textContent = project.title;
      description.textContent = project.description;
      tools.textContent = project.tools;
      impact.textContent = project.impact;
    });
    
    // Add hover effect
    item.addEventListener('mouseenter', () => {
      if (!item.classList.contains('active')) {
        item.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('active')) {
        item.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  });
  
  // Activate the first project by default
  if (items.length > 0) {
    items[0].click();
  }
}

// Auto-rotate the project wheel
function startWheelRotation() {
  const items = document.querySelectorAll('.wheel-item');
  let currentIndex = 0;
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].click();
  }, 5000);
}

// Basic tab switching
function switchToTab(name) {
  document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  const tab = document.getElementById(name);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.menu-item[data-tab="' + name + '"]').forEach(m => m.classList.add('active'));

  // Animate skill bars when Projects or About opens
  if (name === 'projects' || name === 'journey') animateSkillBars();
}

// Animate skill bars
function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const percent = parseInt(bar.getAttribute('data-percent') || 60, 10);
    const fill = bar.querySelector('.skill-fill');
    if (!fill) return;
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = percent + '%'; }, 120);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize project wheel
  initProjectWheel();
  startWheelRotation();
  
  // Header & sidebar menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const tab = this.getAttribute('data-tab');
      switchToTab(tab);
      // Close mobile nav if present
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
      nav.innerHTML = '<nav style="background:#fff;padding:.75rem;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)"><a href="#" data-tab="home" class="menu-item active" style="display:block;padding:.5rem 0">Home</a><a href="#" data-tab="projects" class="menu-item" style="display:block;padding:.5rem 0">Projects</a><a href="#" data-tab="info" class="menu-item" style="display:block;padding:.5rem 0">Info</a><a href="#" data-tab="beyond" class="menu-item" style="display:block;padding:.5rem 0">Beyond Work</a><a href="#" data-tab="journey" class="menu-item" style="display:block;padding:.5rem 0">My Journey</a></nav>';
      nav.style.display = 'block';
      nav.classList.add('visible');
      // Attach listeners to the new mobile links
      nav.querySelectorAll('.menu-item').forEach(mi => mi.addEventListener('click', ev => {
        ev.preventDefault();
        switchToTab(mi.getAttribute('data-tab'));
        document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
        nav.style.display = 'none';
        nav.classList.remove('visible');
      }));
    } else {
      nav.style.display = 'none';
      nav.classList.remove('visible');
    }
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark');
      // Save preference to localStorage
      if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    }
  }

  // Project filtering
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

  // Modal details
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalBody.textContent = card.querySelector('.proj-desc').textContent + " — This modal demonstrates a JS-controlled popup. Replace with real project details.";
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('modal-close').focus();
    });
  });
  
  // Modal close functionality
  if (document.getElementById('modal-close')) {
    document.getElementById('modal-close').addEventListener('click', function () {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => { 
      if (e.target === modal) { 
        modal.classList.remove('visible'); 
        modal.setAttribute('aria-hidden', 'true'); 
      } 
    });
  }

  // Accordion functionality
  document.querySelectorAll('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const panel = this.nextElementSibling;
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      panel.style.display = open ? 'none' : 'block';
      panel.setAttribute('aria-hidden', String(open));
    });
  });

  // Carousel functionality
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

  // Animate initial state for visible bars
  animateSkillBars();

  // Keyboard navigation (left/right to switch tabs)
  window.addEventListener('keydown', (e) => {
    const tabs = ['home', 'projects', 'info', 'beyond', 'journey'];
    let current = tabs.findIndex(t => document.getElementById(t).classList.contains('active'));
    if (e.key === 'ArrowRight') {
      current = (current + 1) % tabs.length;
      switchToTab(tabs[current]);
    } else if (e.key === 'ArrowLeft') {
      current = (current - 1 + tabs.length) % tabs.length;
      switchToTab(tabs[current]);
    } else if (e.key === 'Escape') {
      const modalEl = document.getElementById('modal');
      if (modalEl && modalEl.classList.contains('visible')) {
        modalEl.classList.remove('visible');
        modalEl.setAttribute('aria-hidden', 'true');
      }
    }
  });
});