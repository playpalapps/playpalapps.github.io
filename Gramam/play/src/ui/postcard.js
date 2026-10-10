// Postcards: press and hold anywhere and the moment becomes a card, with a border, a stamp, the Malayalam date and the last line of the diary. Share it or keep it.
import { text, FONT, roundRect, grain, vignette, circle } from '../art/draw.js';
import { state } from '../game/state.js';
import { clock } from '../game/clock.js';
import { audio } from '../engine/audio.js';
import { haptics } from '../engine/haptics.js';
import { platform } from '../engine/platform.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { wrap } from './hud.js';
export const postcard = { open: false, img: null, dataUrl: null, status: '' };
const CARD_W = 1080, CARD_H = 1440; // 3:4 portrait, phone-friendly
export function makePostcard(scene, viewW, viewH) {
  const c = document.createElement('canvas'); c.width = CARD_W; c.height = CARD_H; const x = c.getContext('2d');
  // cream card
  x.fillStyle = '#f1e6cf'; x.fillRect(0, 0, CARD_W, CARD_H);
  // the picture: the whole scene, tall, on the left, with a thin dark mount; the stamp and postmark sit in the column beside it
  const m = 54, dw = Math.min(viewW, 430), ph = CARD_H - 400, sc = ph / viewH, pw = Math.round(dw * sc), py = m, px = m;
  x.save(); x.fillStyle = '#2b2118'; x.fillRect(px - 6, py - 6, pw + 12, ph + 12); x.beginPath(); x.rect(px, py, pw, ph); x.clip(); x.translate(px, py); x.scale(sc, sc);
  const ox = scene.ox; scene.ox = 0; scene.noUI = true; try { scene.draw(x, dw, viewH); } finally { scene.ox = ox; scene.noUI = false; }
  grain(x, dw, viewH, .06); vignette(x, dw, viewH, .3); x.restore();
  // stamp, postmark, lines
  const ml = lang() === 'ml';
  const sx = CARD_W - m - 150, sy = py + 10;
  x.save(); x.translate(sx, sy); x.rotate(.03); x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, 130, 160); x.strokeStyle = '#c8b89a'; x.setLineDash([6, 6]); x.lineWidth = 3; x.strokeRect(6, 6, 118, 148); x.setLineDash([]);
  x.fillStyle = '#a3522f'; x.fillRect(16, 16, 98, 98); // a lamp on the stamp
  x.fillStyle = '#f2c230'; x.fillRect(62, 40, 6, 56); for (const [yy, r] of [[58, 16], [76, 13], [94, 11]]) { x.beginPath(); x.ellipse(65, yy, r, 5, 0, 0, 7); x.fill(); } x.beginPath(); x.arc(65, 34, 6, 0, 7); x.fill();
  text(x, 'ഗ്രാമം', 65, 134, 22, '#2b2118', 'center', FONT_ML); text(x, '1 ANNA', 65, 150, 11, 'rgba(43,33,24,.6)', 'center', FONT);
  x.restore();
  x.save(); x.translate(sx + 50, sy + 270); x.rotate(-.2); x.strokeStyle = 'rgba(43,33,24,.55)'; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 0, 46, 0, 7); x.stroke();
  text(x, (ml ? clock.dateStrML() : clock.dateStr()).toUpperCase(), 0, -8, 17, 'rgba(43,33,24,.7)', 'center', ml ? FONT_ML : FONT); text(x, 'GRAMAM P.O.', 0, 14, 13, 'rgba(43,33,24,.7)', 'center', FONT); x.restore();
  // the line: last diary entry, or the place
  const last = state.diary.length ? state.diary[state.diary.length - 1].text : '';
  const line = last ? (ml ? t(last) : last) : (ml ? scene.titleML : scene.title);
  x.font = `italic 34px ${FONT}`; const yEnd = wrap(x, line, m + 10, py + ph + 60, CARD_W - m * 2, 32, '#2b2118', 42, ml ? FONT_ML : FONT);
  text(x, ml ? `${scene.titleML} · ${clock.dateStrML()}` : `${scene.title} · ${clock.dateStr()}`, px + pw + 40, py + 420, 24, 'rgba(160,60,40,.9)', 'left', ml ? FONT_ML : FONT);
  // a few lines for the address, as on a real card
  x.strokeStyle = 'rgba(43,33,24,.25)'; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(px + pw + 40, py + 520 + i * 70); x.lineTo(CARD_W - m - 10, py + 520 + i * 70); x.stroke(); }
  text(x, pick('Gramam · a slow life in old Kerala', 'ഗ്രാമം · പഴയ കേരളത്തിലെ ഒരു പതിഞ്ഞ ജീവിതം'), m + 10, CARD_H - 70, 22, 'rgba(43,33,24,.55)', 'left', ml ? FONT_ML : FONT);
  // paper grain over the whole card
  grain(x, CARD_W, CARD_H, .05);
  return c;
}
export function openPostcard(scene, viewW, viewH) {
  const c = makePostcard(scene, viewW, viewH); postcard.img = c; postcard.dataUrl = c.toDataURL('image/png'); postcard.open = true; postcard.status = ''; audio.sfx('page'); haptics.medium();
  state.stats.postcards = (state.stats.postcards || 0) + 1;
}
export function drawPostcard(c, w, h, safeTop, safeBottom) {
  if (!postcard.open || !postcard.img) return;
  c.save(); c.fillStyle = 'rgba(20,12,6,.75)'; c.fillRect(0, 0, w, h);
  const ml = lang() === 'ml', F = ml ? FONT_ML : FONT;
  const maxW = w - 60, maxH = h - safeTop - safeBottom - 170, sc = Math.min(maxW / CARD_W, maxH / CARD_H), cw = CARD_W * sc, ch = CARD_H * sc, cx = w / 2 - cw / 2, cy = safeTop + 50;
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 30; c.drawImage(postcard.img, cx, cy, cw, ch); c.shadowBlur = 0;
  const by = cy + ch + 44; postcard._btn = by;
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
  for (const [dx, label] of [[-70, pick('Share', 'പങ്കുവെക്കുക')], [70, pick('Close', 'അടയ്ക്കുക')]]) { roundRect(c, w / 2 + dx - 56, by - 16, 112, 32, 16, 'rgba(20,14,8,.45)', 'rgba(255,247,230,.6)'); text(c, label, w / 2 + dx, by + 1, 13, '#fff7e6', 'center', F); }
  if (postcard.status) text(c, postcard.status, w / 2, by + 36, 11.5, 'rgba(255,247,230,.75)', 'center', F, ml ? '' : 'italic');
  c.restore();
}
export async function postcardTap(p, w) {
  if (!postcard.open) return false;
  const by = postcard._btn || 0;
  if (Math.abs(p.y - by) < 20 && Math.abs(p.x - (w / 2 - 70)) < 60) {
    postcard.status = pick('…', '…'); const r = await platform.sharePNG(postcard.dataUrl, `gramam-${clock.dateStr().replace(' ', '-').toLowerCase()}.png`, pick('A postcard from Gramam', 'ഗ്രാമത്തിൽ നിന്ന് ഒരു പോസ്റ്റ്കാർഡ്'));
    postcard.status = r === 'shared' ? pick('Sent.', 'അയച്ചു.') : r === 'saved' ? pick('Saved.', 'സൂക്ഷിച്ചു.') : r === 'cancelled' ? '' : pick('Could not share on this device.', 'ഈ ഉപകരണത്തിൽ പങ്കുവെക്കാനായില്ല.'); return true;
  }
  postcard.open = false; audio.sfx('page'); return true;
}
