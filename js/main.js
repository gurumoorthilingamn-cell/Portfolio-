// ══════════════════════════════════════════════════
//  CUSTOM CURSOR — colour-shifting morphing cursor
// ══════════════════════════════════════════════════
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let rvx = 0, rvy = 0;       // ring spring velocity
let cursorTick = 0;
let cursorMode = 'default'; // default | link | image | drag | text
let prevMode   = 'default';

// Cycles through teal → cyan palette per frame
function cursorColor(t) {
  const s  = Math.sin(t)   * 0.5 + 0.5;
  const s2 = Math.cos(t * 0.7 + 1.2) * 0.5 + 0.5;
  // ring: animates between teal #3B939B and cyan #91F3FC
  const r  = Math.round(59  + 86  * s2);
  const g  = Math.round(147 + 96  * s);
  const b  = Math.round(155 + 97  * s2);
  return { r, g, b, str: `rgb(${r},${g},${b})`, faint: `rgba(${r},${g},${b},.5)` };
}

function detectMode(el) {
  if (!el) return 'default';
  if (el.closest('.gallery-masonry-item'))                       return 'image';
  if (el.closest('.work-item') || el.closest('.service-row'))    return 'drag';
  if (el.closest('a') || el.closest('button') ||
      el.closest('.gf-btn') || el.closest('.contact-cta-btn'))   return 'link';
  if (el.matches('p,h1,h2,h3,h4,span,li'))                      return 'text';
  return 'default';
}

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.transform  = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
  cursorMode = detectMode(e.target);
}, { passive: true });

(function animateCursor() {
  cursorTick++;
  const t = cursorTick * 0.018;
  const c = cursorColor(t);

  // Spring physics (separate x/y velocities for natural wobble)
  rvx += (mouseX - ringX) * 0.13;
  rvy += (mouseY - ringY) * 0.13;
  rvx *= 0.76; rvy *= 0.76;
  ringX += rvx; ringY += rvy;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;

  // Per-frame colour update (no transition fighting — borderWidth excluded from CSS transition)
  dot.style.background  = '#0D2E32';
  ring.style.borderColor = cursorMode === 'default' ? c.faint : c.str;

  // Mode class swap — CSS transitions handle the smooth size morph
  if (cursorMode !== prevMode) {
    ring.className = cursorMode !== 'default' ? `cm-${cursorMode}` : '';
    dot.className  = cursorMode !== 'default' ? `cm-${cursorMode}` : '';
    prevMode = cursorMode;
  }

  requestAnimationFrame(animateCursor);
})();

// ══════════════════════════════════════════════════
//  NAVBAR SCROLL
// ══════════════════════════════════════════════════
const navbar = document.getElementById('navbar');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ══════════════════════════════════════════════════
//  HAMBURGER
// ══════════════════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const open  = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'translateY(6.5px) rotate(45deg)' : '';
  spans[1].style.opacity   = open ? '0' : '1';
  spans[2].style.transform = open ? 'translateY(-6.5px) rotate(-45deg)' : '';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

// ══════════════════════════════════════════════════
//  TEXT SCRAMBLE
// ══════════════════════════════════════════════════
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
function scramble(el, finalText, delay) {
  setTimeout(() => {
    let iter = 0;
    const total = finalText.length * 2.5;
    const iv = setInterval(() => {
      el.textContent = finalText.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (c === '.') return i < Math.floor(iter / 2.5) ? '.' : CHARS[Math.floor(Math.random()*CHARS.length)];
        if (i < Math.floor(iter / 2.5)) return c;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (iter >= total) { el.textContent = finalText; clearInterval(iv); }
      iter++;
    }, 32);
  }, delay);
}

// Trigger hero lines in + scramble; fade in page
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  const lines = document.querySelectorAll('.hero-line-inner');
  lines.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 200 + i * 180);
    const text = el.dataset.scramble;
    if (text) scramble(el, text, 600 + i * 180);
  });
});

// ══════════════════════════════════════════════════
//  SCROLL REVEAL
// ══════════════════════════════════════════════════
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('revealed');
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

const fadeIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    fadeIO.unobserve(e.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeIO.observe(el));

// ══════════════════════════════════════════════════
//  ANIMATED COUNTERS
// ══════════════════════════════════════════════════
function animateCounter(el) {
  const target   = +el.dataset.count;
  const duration = 1800;
  const start    = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animateCounter(e.target);
    counterIO.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

// ══════════════════════════════════════════════════
//  MARQUEE PAUSE ON HOVER
// ══════════════════════════════════════════════════
document.querySelectorAll('.marquee-wrap').forEach(wrap => {
  const track = wrap.querySelector('.marquee-track');
  wrap.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  wrap.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
});

// ══════════════════════════════════════════════════
//  WORK ITEM HOVER — scramble title on enter
// ══════════════════════════════════════════════════
document.querySelectorAll('.work-item').forEach(item => {
  const h3 = item.querySelector('h3');
  const originalText = h3.firstChild.textContent.trim();
  item.addEventListener('mouseenter', () => {
    let iter = 0;
    const total = 8;
    if (item._iv) clearInterval(item._iv);
    item._iv = setInterval(() => {
      if (iter >= total) { h3.firstChild.textContent = originalText; clearInterval(item._iv); return; }
      h3.firstChild.textContent = originalText.split('').map((c,i) => {
        if (c === ' ' || c === '-' || c === '&') return c;
        if (i < (iter / total) * originalText.length) return c;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      iter++;
    }, 40);
  });
  item.addEventListener('mouseleave', () => {
    if (item._iv) clearInterval(item._iv);
    h3.firstChild.textContent = originalText;
  });
});

// ══════════════════════════════════════════════════
//  PROJECT MODALS
// ══════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════
//  MAGNETIC BUTTONS
// ══════════════════════════════════════════════════
document.querySelectorAll('.contact-cta-btn, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform .5s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => { btn.style.transition = ''; }, 500);
  });
});

// ══════════════════════════════════════════════════
//  SMOOTH SCROLL
// ══════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ══════════════════════════════════════════════════
//  SECTION LABELS — stagger reveal
// ══════════════════════════════════════════════════
const labelIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1';
    e.target.style.transform = 'translateX(0)';
    labelIO.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.section-label').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateX(-20px)';
  el.style.transition = 'opacity .6s, transform .6s';
  labelIO.observe(el);
});

// ══════════════════════════════════════════════════
//  GALLERY FILTERS
// ══════════════════════════════════════════════════
document.querySelectorAll('.gf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-masonry-item').forEach(item => {
      const show = filter === 'all' || item.dataset.brand === filter;
      item.style.display = show ? 'block' : 'none';
    });
  });
});

// ══════════════════════════════════════════════════
//  GALLERY — staggered fade in via IntersectionObserver
// ══════════════════════════════════════════════════
const galleryIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1';
    e.target.style.transform = 'translateY(0)';
    galleryIO.unobserve(e.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll('.gallery-masonry-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity .55s ease ${i * 0.04}s, transform .55s ease ${i * 0.04}s`;
  galleryIO.observe(el);
});

// ══════════════════════════════════════════════════
//  LIGHTBOX
// ══════════════════════════════════════════════════
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

window.openLightbox = function(imgEl) {
  lightboxImg.src = imgEl.src;
  lightboxImg.alt = imgEl.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// ══════════════════════════════════════════════════
//  FLOATING TAGS — cursor parallax + organic float
// ══════════════════════════════════════════════════
(function initFloatingTags() {
  const tags = [...document.querySelectorAll('.hft')];
  const hero = document.getElementById('hero');
  if (!tags.length || !hero) return;

  // amp=float height, freq=speed, phase=offset, str=cursor pull, rot=max rotation°
  const cfg = [
    { amp:14, freq:0.70, phase:0.0, str:20, rot:3.0 },  // Marketing
    { amp:11, freq:0.60, phase:2.1, str:26, rot:2.5 },  // Ads
    { amp:16, freq:0.80, phase:1.0, str:18, rot:3.5 },  // Brand
    { amp:12, freq:0.65, phase:3.2, str:24, rot:2.8 },  // Social Media
  ];

  let tx = 0.5, ty = 0.5; // target cursor 0–1
  let cx = 0.5, cy = 0.5; // smoothed (lerped)

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top)  / r.height;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { tx = 0.5; ty = 0.5; });

  let prevNow = performance.now();
  let t = 0;
  (function loop(now) {
    const dt = Math.min((now - prevNow) / 1000, 0.05); // seconds, capped at 50ms
    prevNow = now;
    t += dt;

    // gentle lerp — 0.055 feels silky
    cx += (tx - cx) * 0.055;
    cy += (ty - cy) * 0.055;
    const dx = cx - 0.5;
    const dy = cy - 0.5;

    tags.forEach((tag, i) => {
      const c  = cfg[i] || cfg[0];
      const s1 = Math.sin(t * c.freq + c.phase);
      const s2 = Math.sin(t * c.freq * 0.6  + c.phase + 1.4);
      const s3 = Math.sin(t * c.freq * 0.45 + c.phase);
      const s4 = Math.sin(t * c.freq * 1.2  + c.phase);

      const floatY = c.amp * s1;
      const floatX = c.amp * 0.28 * s2;
      const rotate = c.rot * s3;
      const scale  = 1 + 0.028 * s4;
      const px = dx * c.str;
      const py = dy * c.str * 0.52;

      tag.style.transform =
        `translate(${floatX + px}px,${floatY + py}px) rotate(${rotate}deg) scale(${scale})`;
    });
    requestAnimationFrame(loop);
  })(performance.now());
})();
