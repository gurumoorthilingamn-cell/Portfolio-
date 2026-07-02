// ── Dark / Light Mode ─────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const savedTheme  = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.setAttribute('icon', 'ph:moon-bold');
}
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeIcon.setAttribute('icon', isDark ? 'ph:sun-bold' : 'ph:moon-bold');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// ── Navbar scroll ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile hamburger ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const open  = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
  spans[1].style.opacity   = open ? '0' : '1';
  spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// ── Typed animation ──────────────────────────────────────
const roles   = [
  'Digital Marketing Executive',
  'Graphic Designer',
  'SEO Specialist',
  'Social Media Strategist',
  'Brand Identity Designer',
  'Content Marketing Expert'
];
const typedEl = document.getElementById('typed-role');
if (typedEl) {
  let ri = 0, ci = 0, deleting = false;
  function typeStep() {
    const word = roles[ri];
    if (!deleting) {
      typedEl.textContent = word.slice(0, ++ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(typeStep, 2200);
        return;
      }
      setTimeout(typeStep, 70);
    } else {
      typedEl.textContent = word.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(typeStep, 400);
        return;
      }
      setTimeout(typeStep, 38);
    }
  }
  setTimeout(typeStep, 1200);
}

// ── Scroll reveal (IntersectionObserver) ─────────────────
const io = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-up,.fade-left,.fade-right,.scale-in').forEach(el => io.observe(el));

// ── Animated progress bars + counters ────────────────────
const progressFills = document.querySelectorAll('.progress-fill');
const counters      = document.querySelectorAll('.num[data-count]');

const resultIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;

    // Animate progress bars in this card
    e.target.querySelectorAll('.progress-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });

    // Animate counters in this card
    e.target.querySelectorAll('.num[data-count]').forEach(el => {
      const target = +el.dataset.count;
      const duration = 1600;
      const start    = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });

    resultIO.unobserve(e.target);
  });
}, { threshold: 0.35 });

document.querySelectorAll('.result-card').forEach(card => resultIO.observe(card));

// ── Gallery filter ────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.style.opacity    = show ? '1' : '0';
      item.style.transform  = show ? 'scale(1)' : 'scale(0.85)';
      item.style.pointerEvents = show ? '' : 'none';
      item.style.transition = 'opacity .35s, transform .35s';
    });
  });
});

// ── Gallery lightbox ──────────────────────────────────────
const galleryData = [
  { label: 'Instagram Campaign — Fashion', bg: 'gal-1', icon: 'ph:instagram-logo-bold' },
  { label: 'Logo & Brand Identity',        bg: 'gal-2', icon: 'ph:crown-bold' },
  { label: 'Google Display Ad Set',        bg: 'gal-3', icon: 'ph:megaphone-bold' },
  { label: 'Social Media Dashboard Post',  bg: 'gal-4', icon: 'ph:chart-line-up-bold' },
  { label: 'Brochure Design',              bg: 'gal-5', icon: 'ph:newspaper-bold' },
  { label: 'Brand Color System',           bg: 'gal-6', icon: 'ph:palette-bold' },
  { label: 'Mobile Ad Creatives',          bg: 'gal-7', icon: 'ph:device-mobile-bold' },
  { label: 'Reels Thumbnail Series',       bg: 'gal-8', icon: 'ph:video-bold' },
  { label: 'Event Poster Design',          bg: 'gal-9', icon: 'ph:ticket-bold' },
];
const lightbox      = document.getElementById('lightbox');
const lightboxInner = document.getElementById('lightbox-inner');

window.openLightbox = function(idx) {
  const d = galleryData[idx];
  lightboxInner.innerHTML = `
    <div class="gallery-placeholder ${d.bg}" style="height:420px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem">
      <iconify-icon icon="${d.icon}" style="font-size:4rem;color:rgba(255,255,255,.8)"></iconify-icon>
      <div style="color:rgba(255,255,255,.9);font-weight:700;font-size:1.1rem">${d.label}</div>
    </div>`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── Project Modals ────────────────────────────────────────
window.openModal = function(id) {
  document.getElementById('modal-' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeModal = function(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
};
window.closeModalOutside = function(e, id) {
  if (e.target.id === id) closeModal(id);
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ── Contact form ──────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
const submitBtnText = document.getElementById('submit-btn-text');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    submitBtnText.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      submitBtnText.textContent = 'Message Sent ✓';
      contactForm.reset();
      setTimeout(() => {
        submitBtnText.textContent = 'Send Message';
        btn.disabled = false;
      }, 3500);
    }, 1400);
  });
}

// ── Smooth scroll for nav links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
