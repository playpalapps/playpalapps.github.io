import { canvas, view } from './canvas.js';
const listeners = { tap: [], down: [], up: [], move: [], swipe: [] };
export const pointer = { x: 0, y: 0, down: false, downAt: 0, dx: 0, dy: 0 };
function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / view.scale, y: (e.clientY - r.top) / view.scale };
}
let start = null;
canvas.addEventListener('pointerdown', e => {
  const p = toLogical(e); start = { ...p, t: performance.now() };
  pointer.x = p.x; pointer.y = p.y; pointer.down = true; pointer.downAt = start.t;
  listeners.down.forEach(f => f(p));
});
canvas.addEventListener('pointermove', e => {
  const p = toLogical(e); pointer.x = p.x; pointer.y = p.y;
  if (start) { pointer.dx = p.x - start.x; pointer.dy = p.y - start.y; }
  listeners.move.forEach(f => f(p));
});
function end(e) {
  const p = toLogical(e); pointer.down = false;
  listeners.up.forEach(f => f(p));
  if (start) {
    const d = Math.hypot(p.x - start.x, p.y - start.y), dt = performance.now() - start.t;
    if (d < 14 && dt < 600) listeners.tap.forEach(f => f(p));
    else if (dt < 700 && Math.abs(p.x - start.x) > 70 && Math.abs(p.y - start.y) < 70) listeners.swipe.forEach(f => f({ dir: p.x > start.x ? 'right' : 'left', startX: start.x, startY: start.y }));
  }
  start = null; pointer.dx = pointer.dy = 0;
}
canvas.addEventListener('pointerup', end);
canvas.addEventListener('pointercancel', () => { start = null; pointer.down = false; });
export function on(type, f) { listeners[type].push(f); return () => { const i = listeners[type].indexOf(f); if (i >= 0) listeners[type].splice(i, 1); }; }
