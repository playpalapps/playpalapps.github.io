// A small sheet of choices on paper: what to write to Ravi, and anything else that needs a decision. Tap a line to choose.
import { text, FONT, roundRect } from '../art/draw.js';
import { audio } from '../engine/audio.js';
import { t, pick, lang, FONT_ML, mode } from '../i18n/t.js';
export const choice = { open: false, title: '', sub: '', options: [], cb: null };
export function ask(title, sub, options, cb) { choice.open = true; choice.title = title; choice.sub = sub; choice.options = options; choice.cb = cb; audio.sfx('page'); }
export function drawChoice(c, w, h, safeTop, safeBottom) {
  if (!choice.open) return;
  const ml = lang() === 'ml', F = ml ? FONT_ML : FONT, n = choice.options.length;
  c.save(); c.fillStyle = 'rgba(20,12,6,.55)'; c.fillRect(0, 0, w, h);
  const px = 28, pw = w - 56, ph = 120 + n * 58, py = h / 2 - ph / 2;
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; roundRect(c, px, py, pw, ph, 4, '#f4ecd8'); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(60,90,160,.35)'; c.lineWidth = 1.5; c.strokeRect(px + 8, py + 8, pw - 16, ph - 16);
  text(c, t(choice.title), px + pw / 2, py + 34, 16, '#2b2118', 'center', F);
  text(c, t(choice.sub), px + pw / 2, py + 56, 11, 'rgba(43,33,24,.6)', 'center', F, ml ? '' : 'italic');
  choice._rows = [];
  for (let i = 0; i < n; i++) { const o = choice.options[i], y = py + 96 + i * 58; roundRect(c, px + 22, y - 20, pw - 44, 44, 6, null, 'rgba(43,33,24,.3)'); text(c, t(o.t), px + pw / 2, y - 2, 13.5, '#2b2118', 'center', F); if (mode() === 'enml' && o.ml) text(c, o.ml, px + pw / 2, y + 14, 10.5, 'rgba(43,33,24,.55)', 'center', FONT_ML); choice._rows.push(y); }
  c.restore();
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; text(c, pick('not now', 'ഇപ്പോൾ വേണ്ട'), w / 2, py + ph + 28, 13, '#fff7e6', 'center', F, ml ? '' : 'italic'); c.restore();
}
export function choiceTap(p) {
  if (!choice.open) return false;
  for (let i = 0; i < (choice._rows || []).length; i++) if (Math.abs(p.y - choice._rows[i]) < 24) { const o = choice.options[i]; choice.open = false; audio.sfx('page'); choice.cb && choice.cb(o, i); return true; }
  choice.open = false; audio.sfx('page'); return true;
}
