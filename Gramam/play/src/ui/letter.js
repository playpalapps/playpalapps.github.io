import { text, FONT, roundRect } from '../art/draw.js';
import { wrap } from './hud.js';
import { state, save, remember } from '../game/state.js';
import { LETTERS, REPLIES } from '../game/letters.js';
import { audio } from '../engine/audio.js';
import { t, pick, lang, FONT_ML, ui } from '../i18n/t.js';
export const letter = { open: false, idx: -1, custom: null };
export function openLetter(idx) { letter.open = true; letter.idx = idx; letter.custom = null; audio.sfx('page'); }
export function openText(from, text) { letter.open = true; letter.idx = -1; letter.custom = { from, text }; audio.sfx('page'); }
export function drawLetter(c, w, h, safeTop, safeBottom) {
  if (!letter.open) return; const L = letter.custom || LETTERS[letter.idx]; if (!L) { letter.open = false; return; }
  c.save(); c.fillStyle = 'rgba(20,12,6,.6)'; c.fillRect(0, 0, w, h);
  const px = 30, py = safeTop + 90, pw = w - 60;
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; roundRect(c, px, py, pw, h - py - safeBottom - 110, 3, '#f4ecd8'); c.shadowBlur = 0;
  // inland letter blue border
  c.strokeStyle = 'rgba(60,90,160,.35)'; c.lineWidth = 1.5; c.strokeRect(px + 8, py + 8, pw - 16, h - py - safeBottom - 126);
  const ml = lang() === 'ml', F = ml ? FONT_ML : FONT;
  text(c, t(L.from), px + pw - 20, py + 30, 11, 'rgba(43,33,24,.65)', 'right', F, ml ? '' : 'italic');
  const sc = ui.scale; let y0 = py + 60; const topic = letter.idx >= 0 && state.letterReplies && state.letterReplies[letter.idx]; if (topic && REPLIES[topic]) { const rp = REPLIES[topic][letter.idx >= 4 ? 'gulf' : 'madras']; y0 = wrap(c, t(rp), px + 22, y0, pw - 44, 13.5 * sc, '#2b2118', (ml ? 22 : 20) * sc, F) + 10; }
  let yEnd = y0; for (const para of t(L.text).split('\n\n')) { yEnd = wrap(c, para, px + 22, yEnd, pw - 44, 13.5 * sc, '#2b2118', (ml ? 22 : 20) * sc, F) + 8; }
  c.restore();
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; text(c, pick('fold it away', 'മടക്കിവെക്കുക'), w / 2, h - safeBottom - 80, 13, '#fff7e6', 'center', lang() === 'ml' ? FONT_ML : FONT, lang() === 'ml' ? '' : 'italic'); c.restore();
}
export function letterTap() { if (!letter.open) return false; letter.open = false; audio.sfx('page'); return true; }
export function readNextLetter() {
  const idx = state.letters[state.lettersRead]; if (idx === undefined) return false;
  state.lettersRead++; state.unread = Math.max(0, state.unread - 1); save(); openLetter(idx);
  if (idx === 0) remember('letter1', 'The first letter from Ravi in Madras. He cannot find proper kaapi. I read it twice on the charupadi and once more at night.');
  if (idx === 4) remember('letter_gulf', 'Ravi is in the Gulf now. He writes about sand in the bread and sends money for a new chembu. I will not replace the chembu.');
  if (idx === 8) remember('telegram', 'A telegram. REACHING THURSDAY. I lit the lamp early that evening and sat on the step until the bus.');
  return true;
}
