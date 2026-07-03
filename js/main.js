// ══════════════════════════════════════════════════
//  CUSTOM CURSOR
// ══════════════════════════════════════════════════
const dot      = document.getElementById('cursor-dot');
const ring     = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
}, { passive: true });

(function animateRing() {
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateRing);
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

// Trigger hero lines in + scramble
window.addEventListener('load', () => {
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
