// The guiding hand. A small brown hand points at the one thing to touch next, and shows the motion when the thing wants a pull, a rub or a circle.
// It appears when a child (or anyone) taps a task in the diary, the first time a hands-on thing is met, and through the first morning. It leaves as soon as the thing is done.
import { circle, ellipse, line, text, FONT, roundRect } from '../art/draw.js';
import { state, save } from '../game/state.js';
import { pick, lang, FONT_ML } from '../i18n/t.js';
export const guide = { target: null, t: 0 };
// target: { scene, label, text, ml, gesture: 'tap'|'down'|'up'|'side'|'circle'|'updown', hud: 'map'|'diary'|null }
export function point(target) { guide.target = Object.assign({ gesture: 'tap' }, target); guide.t = 0; }
export function unpoint(label) { if (!guide.target) return; if (!label || guide.target.label === label || guide.target.hud === label) guide.target = null; }
export function seen(key) { if (!state.seenVerb) state.seenVerb = {}; if (state.seenVerb[key]) return true; state.seenVerb[key] = true; save(); return false; }
function hand(c, x, y, t, s = 1) {
  const bob = Math.sin(t * 4) * 4; c.save(); c.translate(x + 14 * s, y + 26 * s + bob); c.scale(s, s);
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 6;
  // palm and fingers folded, index finger up to the target
  ellipse(c, 0, 10, 11, 12, '#b07a52'); c.fillStyle = '#b07a52'; c.beginPath(); c.roundRect(-4.5, -22, 9, 30, 4.5); c.fill();
  for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(2 + i * 5.5 - 8, 2 + i * 1.5, 6, 12, 3); c.fill(); }
  c.fillStyle = '#c99068'; c.beginPath(); c.roundRect(-3, -21, 6, 14, 3); c.fill();
  // cuff
  c.fillStyle = '#f3ecd8'; c.beginPath(); c.roundRect(-12, 18, 24, 8, 3); c.fill();
  c.restore();
}
function arrows(c, x, y, t, g) {
  c.save(); c.strokeStyle = '#fff6e0'; c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 4;
  const k = (t * 1.4) % 1;
  const arrow = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 7 * Math.cos(a - .5), y1 - 7 * Math.sin(a - .5)); c.moveTo(x1, y1); c.lineTo(x1 - 7 * Math.cos(a + .5), y1 - 7 * Math.sin(a + .5)); c.stroke(); };
  if (g === 'down') { c.globalAlpha = .9; arrow(x + 34, y - 30 + k * 10, x + 34, y + 30 + k * 10); }
  else if (g === 'up') { c.globalAlpha = .9; arrow(x + 34, y + 30 - k * 10, x + 34, y - 30 - k * 10); }
  else if (g === 'updown') { c.globalAlpha = .9; arrow(x + 34, y - 26, x + 34, y + 26); arrow(x + 46, y + 26, x + 46, y - 26); }
  else if (g === 'side') { c.globalAlpha = .9; const d = Math.sin(t * 3) * 14; arrow(x - 30 + d, y - 36, x + 30 + d, y - 36); arrow(x + 30 - d, y - 24, x - 30 - d, y - 24); }
  else if (g === 'circle') { c.globalAlpha = .9; c.beginPath(); c.arc(x, y, 30, k * 6.28, k * 6.28 + 4.8); c.stroke(); const a = k * 6.28 + 4.8; arrow(x + 30 * Math.cos(a - .2), y + 30 * Math.sin(a - .2), x + 30 * Math.cos(a + .05), y + 30 * Math.sin(a + .05)); }
  c.restore();
}
export function drawGuide(c, scene, w, h, safeBottom) {
  const T = guide.target; if (!T) return; guide.t += 1 / 60;
  let x, y;
  if (T.hud === 'map') { x = 30; y = h - safeBottom - 30; } else if (T.hud === 'diary') { x = w - 30; y = h - safeBottom - 30; }
  else { if (!scene || scene.name !== T.scene) return; const hs = (scene.hotspots || []).find(h => h.label === T.label); if (!hs) return; if (hs.enabled && !hs.enabled()) return; x = hs.x + (scene.ox || 0); y = hs.y; }
  const t = guide.t;
  c.save(); c.globalAlpha = .55 + .35 * Math.sin(t * 4); c.strokeStyle = '#fff6e0'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 20 + Math.sin(t * 4) * 3, 0, 7); c.stroke(); c.restore();
  if (T.gesture && T.gesture !== 'tap') arrows(c, x, y, t, T.gesture);
  hand(c, x + 6, y + 6, t, .9);
  if (T.text) { const ml = lang() === 'ml', s = ml && T.ml ? T.ml : T.text, F = ml && T.ml ? FONT_ML : FONT; c.save(); c.font = `${ml ? '' : 'italic '}12.5px ${F}`; const tw = Math.min(w - 40, c.measureText(s).width + 24); let bx = x - tw / 2, by = y - 64; if (bx < 10) bx = 10; if (bx + tw > w - 10) bx = w - 10 - tw; if (by < 90) by = y + 62; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 8; roundRect(c, bx, by - 13, tw, 26, 13, 'rgba(243,234,211,.96)'); c.shadowBlur = 0; text(c, s, bx + tw / 2, by + 1, 12.5, '#2b2118', 'center', F, ml ? '' : 'italic'); c.restore(); }
}
