// ── Hero Canvas: Interactive Particle Constellation ───────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COUNT   = 85;
  const CONNECT = 140;
  const M_RAD   = 170;

  // Blue & cyan — matches the new marketing portfolio theme
  const COLORS = [
    [37,  99,  235],  // --primary #2563EB (most common)
    [37,  99,  235],
    [37,  99,  235],
    [56,  189, 248],  // --accent  #38BDF8
    [56,  189, 248],
    [99,  145, 245],  // mid blue
    [139, 92,  246],  // purple accent highlight
  ];

  let W, H, particles;
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
      this.vx  = (Math.random() - 0.5) * 0.45;
      this.vy  = (Math.random() - 0.5) * 0.45;
      this.r   = Math.random() * 1.8 + 0.6;
      this.br  = this.r;
      this.phi = Math.random() * Math.PI * 2;
      this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.a   = Math.random() * 0.35 + 0.25;
    }

    update() {
      this.phi += 0.016;
      this.r = this.br + Math.sin(this.phi) * 0.5;

      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < M_RAD && d > 1) {
        const f = ((M_RAD - d) / M_RAD) ** 2 * 1.4;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }
      this.vx *= 0.95; this.vy *= 0.95;
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > 3) { this.vx *= 3/sp; this.vy *= 3/sp; }
      this.x += this.vx; this.y += this.vy;
      if (this.x < -30) this.x = W+30;
      if (this.x > W+30) this.x = -30;
      if (this.y < -30) this.y = H+30;
      if (this.y > H+30) this.y = -30;
    }

    draw() {
      const [r,g,b] = this.col;
      ctx.save();
      ctx.globalAlpha = this.a;
      ctx.shadowColor = `rgb(${r},${g},${b})`;
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d >= CONNECT) continue;

        const alpha = (1 - d / CONNECT) * 0.22;
        const [ar,ag,ab] = a.col, [br2,bg,bb] = b.col;
        const grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grd.addColorStop(0, `rgba(${ar},${ag},${ab},${alpha})`);
        grd.addColorStop(1, `rgba(${br2},${bg},${bb},${alpha})`);

        ctx.save();
        ctx.strokeStyle = grd;
        ctx.lineWidth   = 0.7;
        ctx.shadowColor = `rgba(${ar},${ag},${ab},0.4)`;
        ctx.shadowBlur  = 4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawCursor() {
    if (mouse.x < 0) return;
    const t = Date.now() / 750;
    const ro = 30 + Math.sin(t) * 6;
    const ri = 4 + Math.sin(t * 1.3) * 1.2;

    // Outer ring — blue
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = '#2563EB';
    ctx.shadowBlur  = 22;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro, 0, Math.PI * 2);
    ctx.stroke();

    // Second ring — cyan
    const ro2 = 18 + Math.sin(t * 0.7 + 1) * 4;
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro2, 0, Math.PI * 2);
    ctx.stroke();

    // Centre dot — accent cyan
    ctx.globalAlpha = 0.85;
    ctx.fillStyle   = '#38BDF8';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ri, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    drawCursor();
    raf = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    cancelAnimationFrame(raf);
    loop();
  }

  window.addEventListener('resize', resize);
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else loop();
  });

  init();
})();
