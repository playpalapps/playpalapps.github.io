import { rnd } from './ease.js';
export class Particles {
  constructor() { this.list = []; }
  emit(n, make) { for (let i = 0; i < n; i++) this.list.push(make(i)); }
  update(dt) {
    if (!(dt > 0)) return; const l = this.list;
    for (let i = l.length - 1; i >= 0; i--) {
      const p = l[i]; p.life -= dt;
      if (p.life <= 0) { l.splice(i, 1); continue; }
      p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.update) p.update(p, dt);
    }
  }
  draw(x) { for (const p of this.list) p.draw(x, p); }
}
export function steam(ps, x, y, n = 1, spread = 10) {
  ps.emit(n, () => ({
    x: x + rnd(-spread, spread), y, vx: rnd(-4, 4), vy: rnd(-22, -12), life: rnd(2, 3.2), max: 3, r: rnd(3, 6), g: -2,
    draw(c, p) { const a = Math.min(1, p.life / p.max) * 0.35 * Math.min(1, (p.max - p.life) * 2); c.globalAlpha = a; c.fillStyle = '#fff6e8'; c.beginPath(); c.arc(p.x, p.y, Math.max(.1, p.r + (p.max - p.life) * 3), 0, 7); c.fill(); c.globalAlpha = 1; }
  }));
}
export function dust(ps, x0, x1, y0, y1, n = 1) {
  ps.emit(n, () => ({
    x: rnd(x0, x1), y: rnd(y0, y1), vx: rnd(-3, 3), vy: rnd(-4, 2), life: rnd(4, 8), max: 8, r: rnd(.6, 1.4), g: 0,
    update(p, dt) { p.vx += rnd(-2, 2) * dt; },
    draw(c, p) { const k = Math.sin((p.life / p.max) * Math.PI); c.globalAlpha = k * 0.5; c.fillStyle = '#fff2cc'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.globalAlpha = 1; }
  }));
}
export function drops(ps, x, y, n = 6) {
  ps.emit(n, () => ({
    x: x + rnd(-6, 6), y, vx: rnd(-30, 30), vy: rnd(-40, 10), life: rnd(.5, .9), max: .9, r: rnd(1, 2), g: 300,
    draw(c, p) { c.globalAlpha = 0.8; c.fillStyle = '#cfe6f0'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.globalAlpha = 1; }
  }));
}
export function sparks(ps, x, y, n = 3) {
  ps.emit(n, () => ({
    x: x + rnd(-8, 8), y, vx: rnd(-15, 15), vy: rnd(-70, -30), life: rnd(.4, 1), max: 1, r: rnd(.8, 1.6), g: 40,
    draw(c, p) { c.globalAlpha = p.life / p.max; c.fillStyle = '#ffb347'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.globalAlpha = 1; }
  }));
}
export function fireflies(ps, x0, x1, y0, y1, n = 1) {
  ps.emit(n, () => ({
    x: rnd(x0, x1), y: rnd(y0, y1), vx: rnd(-6, 6), vy: rnd(-6, 6), life: rnd(5, 9), max: 9, ph: rnd(6.28), g: 0,
    update(p, dt) { p.vx += rnd(-10, 10) * dt; p.vy += rnd(-10, 10) * dt; p.vx *= .98; p.vy *= .98; },
    draw(c, p) { const k = Math.max(0, Math.sin(p.life * 2.2 + p.ph)); c.globalAlpha = k * .9; c.fillStyle = '#e8ff9a'; c.shadowColor = '#d8ff70'; c.shadowBlur = 8; c.beginPath(); c.arc(p.x, p.y, 1.4, 0, 7); c.fill(); c.shadowBlur = 0; c.globalAlpha = 1; }
  }));
}
