// Лёгкий canvas-конфетти для поздравлений. Уважает prefers-reduced-motion.

const COLORS = ['#FFD45C', '#7655D9', '#5EC8ED', '#F38BBF', '#4ADE80', '#fff'];

export function fireConfetti(durationMs = 1600): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:80';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const parts = Array.from({ length: 90 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 9,
    vy: -6 - Math.random() * 7,
    w: 5 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const start = performance.now();
  function tick(now: number) {
    const t = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28;
      p.rot += p.vr;
      const fade = 1 - Math.max(0, (t - durationMs * 0.6) / (durationMs * 0.4));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, fade);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < durationMs) requestAnimationFrame(tick);
    else canvas.remove();
  }
  requestAnimationFrame(tick);
}
