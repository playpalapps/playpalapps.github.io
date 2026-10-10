import { text, FONT, roundRect } from '../art/draw.js';
import { t, lang, FONT_ML, ui, sub as subOf, mode } from '../i18n/t.js';
// What the village says to you comes on a slip of paper at the foot of the screen. It stays until you have read it: tap the slip (or its ✕) to put it away,
// or tap anything else and it goes as you go. Lines wait their turn; a mark on the slip says there is more. Very short lines are just a whisper that fades.
const q = []; let cur = null;
export function say(en, ml, hold = 3.2) {
  if (cur && cur.t > 1 && q.length === 0 && cur.toast) cur = null;
  q.push({ en, ml, hold, toast: hold <= 2.6 && en.length < 48 }); while (q.length > 4) q.shift();
}
export function sayNow(en, ml, hold = 3.2) { q.length = 0; cur = null; q.push({ en, ml, hold, toast: false }); }
export function clearCaptions() { q.length = 0; cur = null; }
export function captionUp() { return !!cur; }
export function dismiss() { if (!cur) return false; cur = null; return true; }
export function updateCaption(dt) {
  if (!cur && q.length) { cur = q.shift(); cur.t = 0; cur.y = null; }
  if (cur) { cur.t += dt; const life = cur.toast ? cur.hold + 1.2 : Math.min(22, Math.max(9, cur.hold * 2.4)); if (cur.t > life) cur = null; }
}
// a tap on the slip (or the ✕) puts it away and is consumed; a tap anywhere else also puts it away but goes through to the world
export function captionTap(p, w, h, safeBottom) {
  if (!cur) return false;
  const box = cur.box; cur = null;
  if (!box) return false;
  return p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}
export function drawCaption(c, w, h, safeBottom, scene) {
  if (!cur) return;
  const ml = lang() === 'ml', main = ml ? t(cur.en) : cur.en, tr = ml && main !== cur.en, sub = tr ? '' : subOf(cur.ml), subF = mode() === 'enml' ? FONT_ML : FONT;
  const sc = ui.scale, F = tr ? FONT_ML : FONT;
  if (cur.toast) { // a whisper: small, centred, gone soon
    const a = Math.min(1, cur.t * 2.5) * Math.min(1, (cur.hold + 1.2 - cur.t) * 1.5), y = h - 118 - safeBottom;
    c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 10; text(c, main, w / 2, y, 15 * sc, '#fff7e6', 'center', F, tr ? '' : 'italic'); if (sub) text(c, sub, w / 2, y + 20 * sc, 12 * sc, 'rgba(255,247,230,.75)', 'center', subF, subF === FONT ? 'italic' : ''); c.restore(); cur.box = null; return;
  }
  const life = Math.min(22, Math.max(9, cur.hold * 2.4)), a = Math.min(1, cur.t * 4) * Math.min(1, (life - cur.t) * 2);
  const size = (tr ? 14.5 : 15) * sc, lh = (tr ? 22 : 20) * sc, pad = 14, maxW = w - 48 - pad * 2 - 18;
  c.save(); c.font = `${tr ? '' : 'italic '}${size}px ${F}`;
  const words = main.split(' '), lines = []; let line = ''; for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (c.measureText(tt).width > maxW && line) { lines.push(line); line = wd; } else line = tt; } if (line) lines.push(line);
  const head = sub ? 16 * sc : 0, bh = pad * 2 + head + lines.length * lh, bw = w - 48, bx = 24, by = h - safeBottom - 62 - bh;
  cur.box = { x: bx, y: by, w: bw, h: bh };
  c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 14;
  roundRect(c, bx, by, bw, bh, 6, ui.contrast ? '#f7efdc' : 'rgba(243,234,211,.96)'); c.shadowBlur = 0;
  c.fillStyle = '#a3522f'; c.fillRect(bx, by, 4, bh);
  c.fillStyle = 'rgba(0,0,0,.06)'; c.beginPath(); c.moveTo(bx + bw - 14, by + bh); c.lineTo(bx + bw, by + bh - 14); c.lineTo(bx + bw, by + bh); c.fill();
  if (sub) text(c, sub, bx + pad + 4, by + pad + 2, 11.5 * sc, 'rgba(160,60,40,.95)', 'left', subF, subF === FONT ? 'italic' : '');
  let yy = by + pad + head + lh / 2; for (const l of lines) { text(c, l, bx + pad + 4, yy, size, '#2b2118', 'left', F, tr ? '' : 'italic'); yy += lh; }
  c.strokeStyle = 'rgba(43,33,24,.55)'; c.lineWidth = 1.4; c.lineCap = 'round'; const xx = bx + bw - 15, xy = by + 13; c.beginPath(); c.moveTo(xx - 4, xy - 4); c.lineTo(xx + 4, xy + 4); c.moveTo(xx + 4, xy - 4); c.lineTo(xx - 4, xy + 4); c.stroke();
  if (q.length) text(c, '›', bx + bw - 15, by + bh - 13, 16, 'rgba(160,60,40,.9)', 'center', FONT);
  c.restore();
}
