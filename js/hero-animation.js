// ── Hero Canvas: Colour-Shifting Particle Nebula ───────────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, tick = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  const ripples = [];

  // ── Colour math ──────────────────────────────────────────────
  // Cycles through the pink palette: deep pink → hot pink → rose
  function pinkCycle(t) {
    const s = Math.sin(t) * 0.5 + 0.5;
    const s2 = Math.cos(t * 0.7 + 1.2) * 0.5 + 0.5;
    return [
      Math.round(195 + 60 * s),        // 195-255
      Math.round(s2 * 45),             // 0-45
      Math.round(80 + 75 * (1 - s)),   // 80-155
    ];
  }
  function pc(t, a) {
    const [r, g, b] = pinkCycle(t);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ── Config ───────────────────────────────────────────────────
  const COUNT   = 72;
  const CONNECT = 145;
  const M_RAD   = 180;

  // ── Particle ─────────────────────────────────────────────────
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.32;
      this.vy    = (Math.random() - 0.5) * 0.32;
      this.r     = Math.random() * 1.8 + 0.4;
      this.br    = this.r;
      this.phi   = Math.random() * Math.PI * 2;
      this.phase = Math.random() * Math.PI * 6;  // colour phase
      this.a     = Math.random() * 0.32 + 0.22;
    }
    update() {
      this.phi += 0.013;
      this.r    = this.br + Math.sin(this.phi) * 0.45;

      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < M_RAD * M_RAD && d2 > 1) {
        const d = Math.sqrt(d2);
        const f = ((M_RAD - d) / M_RAD) ** 2 * 1.45;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }
      this.vx *= 0.95; this.vy *= 0.95;
      const sp2 = this.vx ** 2 + this.vy ** 2;
      if (sp2 > 9) { const k = 3 / Math.sqrt(sp2); this.vx *= k; this.vy *= k; }
      this.x += this.vx; this.y += this.vy;
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
    draw() {
      const t = tick * 0.008 + this.phase;
      const [r, g, b] = pinkCycle(t);
      ctx.globalAlpha = this.a;
      ctx.fillStyle   = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Connection lines ─────────────────────────────────────────
  function drawLines() {
    const C2 = CONNECT * CONNECT;
    for (let i = 0; i < particles.length - 1; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b  = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= C2) continue;
        const alpha = (1 - Math.sqrt(d2) / CONNECT) * 0.17;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = pc(tick * 0.008 + a.phase, alpha);
        ctx.lineWidth   = 0.65;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // ── Slow drifting ambient glow ────────────────────────────────
  function drawAmbient() {
    const t  = tick * 0.0025;
    const cx = W * 0.72 + Math.sin(t) * W * 0.06;
    const cy = H * 0.38 + Math.cos(t * 0.85) * H * 0.07;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.45);
    grd.addColorStop(0, pc(t * 2, 0.055));
    grd.addColorStop(0.6, pc(t * 1.5 + 1, 0.022));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle   = grd;
    ctx.fillRect(0, 0, W, H);

    // Second, slower ambient on left
    const cx2 = W * 0.18 + Math.sin(t * 0.6 + 2) * W * 0.05;
    const cy2 = H * 0.65 + Math.cos(t * 0.5 + 1) * H * 0.06;
    const grd2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, W * 0.32);
    grd2.addColorStop(0, pc(t + 2, 0.035));
    grd2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Mouse nebula glow ────────────────────────────────────────
  function drawNebulaGlow() {
    if (!mouse.active) return;
    const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 190);
    grd.addColorStop(0,   pc(tick * 0.006, 0.09));
    grd.addColorStop(0.4, pc(tick * 0.004 + 1, 0.04));
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle   = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Canvas cursor (inside hero only) ─────────────────────────
  function drawCursor() {
    if (!mouse.active) return;
    const t  = tick * 0.045;
    const ro = 28 + Math.sin(t) * 6;
    const ri = 3.5 + Math.sin(t * 1.45) * 1.2;

    // Outer pulsing ring
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = pc(tick * 0.007, 0.28);
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro, 0, Math.PI * 2);
    ctx.stroke();

    // Inner subtle ring
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#F5F0E8';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ro * 0.52, 0, Math.PI * 2);
    ctx.stroke();

    // Centre dot
    ctx.globalAlpha = 0.85;
    ctx.fillStyle   = pc(tick * 0.007 + 0.5, 0.85);
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, ri, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Click ripples (staggered) ─────────────────────────────────
  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.radius += 3.5;
      rp.alpha  -= 0.019;
      if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.globalAlpha = rp.alpha;
      ctx.strokeStyle = '#FF2D78';
      ctx.lineWidth   = 1.2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ── Main loop ─────────────────────────────────────────────────
  let raf;
  function loop() {
    raf = requestAnimationFrame(loop);
    tick++;

    ctx.clearRect(0, 0, W, H);

    drawAmbient();
    drawNebulaGlow();

    ctx.shadowBlur = 0;
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    drawRipples();
    drawCursor();
    ctx.globalAlpha = 1;
  }

  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    cancelAnimationFrame(raf);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });

  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.active = false; });

  // Staggered ripple burst on click
  hero.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        ripples.push({ x: cx, y: cy, radius: 4 + i * 7, alpha: 0.65 - i * 0.12 });
      }, i * 90);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else requestAnimationFrame(loop);
  });

  init();
})();
