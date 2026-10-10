import { text, FONT, roundRect } from '../art/draw.js';
import { state } from '../game/state.js';
import { RECIPES, ITEMS, available, canCook, missing, SOURCES, listFor, kadaSells } from '../game/pantry.js';
import { say } from './caption.js';
import { wrap } from './hud.js';
import { audio } from '../engine/audio.js';
import { t, pick, lang, FONT_ML, mode } from '../i18n/t.js';
export const notebook = { open: false, pick: null, scroll: 0, where: null };
export function openNotebook(pick = null, where = null) { notebook.open = true; notebook.pick = pick; notebook.where = where; notebook.scroll = 0; audio.sfx('page'); }
function rows() { return RECIPES.filter(r => available(r) && (!notebook.where || r.where === notebook.where)); }
export function drawNotebook(c, w, h, safeTop, safeBottom) {
  if (!notebook.open) return;
  c.save(); c.fillStyle = 'rgba(20,12,6,.6)'; c.fillRect(0, 0, w, h);
  const px = 24, py = safeTop + 50, pw = w - 48, ph = h - py - safeBottom - 60;
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 24; roundRect(c, px, py, pw, ph, 6, '#f3ead3'); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(160,60,40,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px + 30, py); c.lineTo(px + 30, py + ph); c.stroke();
  const ml = lang() === 'ml', F = ml ? FONT_ML : FONT, it = ml ? '' : 'italic';
  text(c, pick('Amma’s notebook', 'അമ്മയുടെ നോട്ടുബുക്ക്'), px + pw / 2 + 10, py + 26, 18, '#2b2118', 'center', F);
  text(c, notebook.pick ? pick('what will you make?', 'എന്താണ് ഉണ്ടാക്കുന്നത്?') : pick('recipes and the pantry', 'വിഭവങ്ങളും കലവറയും'), px + pw / 2 + 10, py + 46, 11, 'rgba(43,33,24,.6)', 'center', F, it);
  const L = Object.keys(state.shopping || {}); if (L.length) text(c, pick('List for Kunjappan’s: ', 'കുഞ്ഞപ്പന്റെ കടയ്ക്ക്: ') + L.map(k => t(ITEMS[k][0]).toLowerCase()).join(', '), px + pw / 2 + 10, py + ph - 14, 10, 'rgba(160,60,40,.9)', 'center', F, it);
  c.beginPath(); c.rect(px, py + 58, pw, ph - 58); c.clip();
  let y = py + 80 - notebook.scroll;
  for (const r of rows()) {
    const ok = canCook(r), made = state.dishes[r.id] || 0;
    text(c, (made ? '✓ ' : '') + (ml ? r.ml : r.name), px + 40, y, 14, ok ? '#2b2118' : 'rgba(43,33,24,.45)', 'left', F);
    if (mode() === 'enml') text(c, r.ml, px + pw - 14, y, 11, 'rgba(43,33,24,.55)', 'right', FONT);
    const needs = Object.keys(r.needs).map(k => { const have = state.pantry[k] || 0, need = r.needs[k]; return `${t(ITEMS[k][0]).toLowerCase()} ×${need}` + (have < need ? (have ? ` (${pick('have', 'ഉള്ളത്')} ${have})` : ` (${pick('none', 'ഇല്ല')})`) : ''); }).join(' · ');
    const short = Object.keys(r.needs).filter(k => (state.pantry[k] || 0) < r.needs[k]); const where = ok ? '' : short.map(k => kadaSells(k) ? `${t(ITEMS[k][0]).toLowerCase()}: ${pick('Kunjappan’s', 'കുഞ്ഞപ്പന്റെ കട')}` : `${t(ITEMS[k][0]).toLowerCase()}: ${t(SOURCES[k])}`).join(' · ');
    text(c, needs, px + 40, y + 16, 10, ok ? 'rgba(43,33,24,.6)' : 'rgba(160,60,40,.7)', 'left', F, it);
    let extra = 0; if (where) { const yEnd = wrap(c, where + (short.some(kadaSells) ? pick(' · tap to add to the list', ' · ലിസ്റ്റിൽ ചേർക്കാൻ തൊടുക') : ''), px + 40, y + 29, pw - 60, 9, 'rgba(43,33,24,.55)', 12, F); extra = yEnd - (y + 29) - 12; }
    if (notebook.pick && ok) { c.strokeStyle = 'rgba(43,33,24,.35)'; roundRect(c, px + 34, y - 12, pw - 44, 38, 6, null, 'rgba(43,33,24,.25)'); }
    r._y = y; r._short = !ok; y += (ok ? 44 : 56) + extra;
  }
  y += 10; text(c, pick('Pantry', 'കലവറ'), px + 40, y, 13, '#2b2118', 'left', F); y += 20;
  const keys = Object.keys(ITEMS); let col = 0;
  for (const k of keys) { const x = px + 40 + col * ((pw - 50) / 2); text(c, `${ml ? ITEMS[k][1] : ITEMS[k][0]}  ${state.pantry[k] || 0}`, x, y, 11.5, 'rgba(43,33,24,.75)', 'left', F); col++; if (col === 2) { col = 0; y += 17; } }
  c.restore();
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6; text(c, pick('close', 'അടയ്ക്കുക'), w / 2, py + ph + 30, 13, '#fff7e6', 'center', F); c.restore();
}
export function notebookTap(p, w, h, safeTop, safeBottom) {
  if (!notebook.open) return false;
  for (const r of rows()) { if (r._y === undefined || Math.abs(p.y - (r._y + 8)) > 24) continue; if (canCook(r)) { if (notebook.pick) { const cb = notebook.pick; notebook.open = false; notebook.pick = null; cb(r); } return true; } const added = listFor(r); if (added.length) { audio.sfx('page'); say(pick(`On the list for Kunjappan’s: ${added.join(', ')}.`, `കുഞ്ഞപ്പന്റെ കടയിലെ ലിസ്റ്റിൽ: ${added.join(', ')}.`), 'ലിസ്റ്റ്', 3.5); } else say(pick('Nothing from the kada is missing; the rest is in the thodi or comes to the gate.', 'കടയിൽ നിന്ന് ഒന്നും വേണ്ട; ബാക്കി തൊടിയിലുണ്ട്, അല്ലെങ്കിൽ പടിക്കൽ വരും.'), 'ലിസ്റ്റ്', 3.5); return true; }
  notebook.open = false; notebook.pick = null; audio.sfx('page'); return true;
}
