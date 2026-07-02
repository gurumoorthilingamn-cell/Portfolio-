// ── Hero Canvas: Optimised Particle Constellation ─────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COUNT   = 55;   // fewer particles = much faster O(n²) line check
  const CONNECT = 130;
  const M_RAD   = 160;
  const TARGET_FPS = 40;
  const FRAME_MS   = 1000 / TARGET_FPS;

  // Pre-built RGBA strings — avoid string concat inside the loop
  const COLORS = [
    'rgba(37,99,235,',    // blue   (3× weight)
    'rgba(37,99,235,',
    'rgba(37,99,235,',
    'rgba(56,189,248,',   // cyan
    'rgba(56,189,248,',
    'rgba(99,145,245,',   // mid-blue
    'rgba(139,92,246,',   // purple accent
  ];
  // Pre-built fill strings (no alpha variation)
  const FILL = [
    'rgb(37,99,235)',
    'rgb(37,99,235)',
    'rgb(37,99,235)',
    'rgb(56,189,248)',
    'rgb(56,189,248)',
    'rgb(99,145,245)',
    'rgb(139,92,246)',
  ];

  let W, H, particles, lastFrame = 0;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }

  class Particle {
    constructor() { this.spawn(); }
    spawn() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.vx  = (Math.random() - 0.5) * 0.4;
      this.vy  = (Math.random() - 0.5) * 0.4;
      this.r   = Math.random() * 1.6 + 0.5;
      this.br  = this.r;
      this.phi = Math.random() * Math.PI * 2;
      this.ci  = Math.floor(Math.random() * COLORS.length);
      this.a   = Math.random() * 0.35 + 0.3;
    }

    update() {
      this.phi += 0.015;
      this.r = this.br + Math.sin(this.phi) * 0.4;

      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < M_RAD * M_RAD && d2 > 1) {
        const d = Math.sqrt(d2);
        const f = ((M_RAD - d) / M_RAD) ** 2 * 1.3;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }
      this.vx *= 0.95; this.vy *= 0.95;
      const sp2 = this.vx*this.vx + this.vy*this.vy;
      if (sp2 > 9) { const k = 3/Math.sqrt(sp2); this.vx *= k; this.vy *= k; }
      this.x += this.vx; this.y += this.vy;
      if (this.x < -20) this.x = W+20;
      if (this.x > W+20) this.x = -20;
      if (this.y < -20) this.y = H+20;
      if (this.y > H+20) this.y = -20;
    }

    draw() {
      ctx.globalAlpha = this.a;
      ctx.fillStyle   = FILL[this.ci];
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLines() {
    const CONNECT2 = CONNECT * CONNECT;
    for (let i = 0; i < particles.length - 1; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b  = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 >= CONNECT2) continue;

        const alpha = (1 - Math.sqrt(d2) / CONNECT) * 0.18;
        // Single color (source particle) — no gradient, much faster
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = COLORS[a.ci] + alpha + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  function drawCursor() {
    if (mouse.x < 0) return;
    const t  = Date.now() / 750;
    const ro = 28 + Math.sin(t) * 5;
    const ri = 3.5 + Math.sin(t * 1.3) * 1;

    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro, 0, Math.PI * 2);
    ctx.stroke();

    const ro2 = 16 + Math.sin(t * 0.7 + 1) * 3;
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.75;
    ctx.fillStyle   = '#38BDF8';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ri, 0, Math.PI * 2);
    ctx.fill();
  }

  let raf;
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - lastFrame < FRAME_MS) return;  // cap to 40fps
    lastFrame = ts;

    ctx.clearRect(0, 0, W, H);

    // Draw lines — shared state
    ctx.lineWidth = 0.7;
    ctx.shadowBlur = 0;  // no shadow ever
    drawLines();

    // Draw dots
    ctx.shadowBlur = 0;
    particles.forEach(p => { p.update(); p.draw(); });

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    drawCursor();

    ctx.globalAlpha = 1;
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    cancelAnimationFrame(raf);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });

  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else requestAnimationFrame(loop);
  });

  init();
})();
