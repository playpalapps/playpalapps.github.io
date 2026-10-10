import { text, FONT, roundRect } from '../art/draw.js';
import { clock, MONTHS, MONTHS_ML } from '../game/clock.js';
import { state } from '../game/state.js';
import { audio } from '../engine/audio.js';
import { openNotebook } from './notebook.js';
import { GLOSSARY } from '../game/glossary.js';
import { BOOKS } from '../scenes/vayanasala.js';
import { tasksForToday, festivalTasks, openTasks } from '../game/tasks.js';
import { FINDS } from '../game/finds.js';
import { music } from '../engine/music.js';
import { t, pick, lang, FONT_ML, ui, sub, mode } from '../i18n/t.js';
import { setA11yLang } from './a11y.js';
import { TASK_PLACE } from '../game/guidetasks.js';
import { unpoint } from './guide.js';
export const hud = { journalOpen: false, journalScroll: 0, alpha: 0, safeTop: 20, page: 'today', action: null };
const PHASE_ML = { Velupp: 'വെളുപ്പ്', Ravile: 'രാവിലെ', Uchha: 'ഉച്ച', Sandhya: 'സന്ധ്യ', Rathri: 'രാത്രി' };
// "Chingam 1, Ravile" → "ചിങ്ങം 1, രാവിലെ"
function stampML(s) { const m = /^(\w+) (\d+), (\w+)$/.exec(s); if (!m) return s; const mi = MONTHS.indexOf(m[1]); return `${mi >= 0 ? MONTHS_ML[mi] : m[1]} ${m[2]}, ${PHASE_ML[m[3]] || m[3]}`; }
export function drawHUD(c, w, h, scene, safeTop, safeBottom) {
  hud.safeTop = safeTop;
  const a = hud.alpha; if (a <= 0) return;
  const ml = lang() === 'ml';
  c.save(); c.globalAlpha = a;
  // top legibility band
  const g = c.createLinearGradient(0, 0, 0, safeTop + 70); g.addColorStop(0, 'rgba(10,8,6,.5)'); g.addColorStop(1, 'rgba(10,8,6,0)'); c.fillStyle = g; c.fillRect(0, 0, w, safeTop + 70);
  const y = safeTop + 18;
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
  if (ml) {
    text(c, clock.dateStrML(), 18, y, 15, '#fff7e6', 'left', FONT_ML);
    text(c, clock.phaseNameML(), 18, y + 20, 11.5, 'rgba(255,247,230,.75)', 'left', FONT_ML);
    text(c, scene.titleML, w / 2, y, 15, '#fff7e6', 'center', FONT_ML);
  } else {
    text(c, `${clock.dateStr()}`, 18, y, 15, '#fff7e6', 'left', FONT);
    const ps = sub(clock.phaseNameML()), ts = sub(scene.titleML);
    text(c, ps ? `${clock.phaseName()} · ${ps}` : clock.phaseName(), 18, y + 19, 11.5, 'rgba(255,247,230,.75)', 'left', FONT);
    text(c, scene.title, w / 2, y, 15, '#fff7e6', 'center', FONT);
    if (ts) text(c, ts, w / 2, y + 19, 11.5, 'rgba(255,247,230,.75)', 'center', FONT, mode() === 'en' ? 'italic' : '');
  }
  text(c, clock.timeStr(), w - 18, y, 15, '#fff7e6', 'right', FONT);
  // diary icon (small closed book) bottom-right
  const bx = w - 30, by = h - safeBottom - 30;
  c.shadowBlur = 5;
  roundRect(c, bx - 9, by - 11, 18, 22, 2, '#f1e4c8'); c.fillStyle = '#a3522f'; c.fillRect(bx - 9, by - 11, 4, 22);
  c.fillStyle = 'rgba(60,36,20,.35)'; for (let i = 0; i < 4; i++) c.fillRect(bx - 2, by - 6 + i * 4, 8, 1);
  if (state.unread > 0) { c.fillStyle = '#e8c060'; c.beginPath(); c.arc(bx + 9, by - 10, 3.5, 0, 7); c.fill(); } else if (openTasks() > 0) { c.fillStyle = 'rgba(241,228,200,.85)'; c.beginPath(); c.arc(bx + 9, by - 10, 2.5, 0, 7); c.fill(); }
  c.restore();
}
export function hudTap(p, w, h, safeBottom) {
  const bx = w - 30, by = h - safeBottom - 30;
  if (Math.hypot(p.x - bx, p.y - by) < 28) { unpoint('diary'); hud.journalOpen = !hud.journalOpen; hud.journalScroll = 0; if (hud.journalOpen && !hud.page) hud.page = 'today'; audio.sfx('page'); return true; }
  if (hud.journalOpen) { if (journalTap(p, w, h, hud.safeTop, safeBottom)) return true; hud.journalOpen = false; audio.sfx('page'); return true; }
  return false;
}
function panel(h, safeTop, safeBottom) { const py = safeTop + 60, ph = h - py - safeBottom - 100; return { py, ph, sy: py + ph + 28 }; }
export function drawJournal(c, w, h, safeTop, safeBottom) {
  if (!hud.journalOpen) return;
  const ml = lang() === 'ml', F = ml ? FONT_ML : FONT, body = (s) => ml ? t(s) : s;
  c.save();
  c.fillStyle = 'rgba(20,12,6,.55)'; c.fillRect(0, 0, w, h);
  const px = 26, pw = w - 52, { py, ph, sy } = panel(h, safeTop, safeBottom);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 24; roundRect(c, px, py, pw, ph, 6, '#efe3c6'); c.shadowBlur = 0;
  c.fillStyle = '#a3522f'; c.fillRect(px, py, 8, ph);
  c.fillStyle = 'rgba(120,80,40,.12)'; for (let yy = py + 60; yy < py + ph - 20; yy += 26) c.fillRect(px + 26, yy, pw - 44, 1);
  const PAGES = ['today', 'diary', 'words', 'found', 'more'], TITLES = { today: ['Today', 'ഇന്ന്'], diary: ['Diary', 'ഡയറി'], words: ['Words', 'വാക്കുകൾ'], found: ['Found', 'കണ്ടെത്തിയത്'], more: ['More', 'കൂടുതൽ'] };
  const sc = ui.scale;
  const pg = PAGES.includes(hud.page) ? hud.page : 'diary', isWords = pg === 'words';
  if (ml) text(c, TITLES[pg][1], px + pw / 2 + 4, py + 32, 19, '#2b2118', 'center', FONT_ML);
  else { text(c, TITLES[pg][0], px + pw / 2 + 4, py + 30, 20, '#2b2118', 'center', FONT); text(c, TITLES[pg][1], px + pw / 2 + 4, py + 50, 12, 'rgba(43,33,24,.6)', 'center', FONT); }
  // page tabs along the bottom edge
  hud._tabs = []; for (let i = 0; i < PAGES.length; i++) { const tx = px + 24 + i * ((pw - 48) / 4); const on = PAGES[i] === pg; text(c, ml ? TITLES[PAGES[i]][1] : TITLES[PAGES[i]][0].toLowerCase(), tx, py + ph - 16, 11, on ? '#a3522f' : 'rgba(43,33,24,.5)', 'center', F, on || ml ? '' : 'italic'); if (on) { c.fillStyle = '#a3522f'; c.fillRect(tx - 14, py + ph - 8, 28, 1.5); } hud._tabs.push([tx, PAGES[i]]); }
  c.beginPath(); c.rect(px + 8, py + 62, pw - 8, ph - 92); c.clip();
  let y = py + 86 - hud.journalScroll;
  const taskRow = (p) => { const d = p.done(); if (!hud._taskRows) hud._taskRows = []; hud._taskRows.push([y - 12, y + 14, p]); box(px + 26, y, d); if (ml) { text(c, p.ml, px + 50, y, 13.5 * sc, d ? 'rgba(43,33,24,.5)' : '#2b2118', 'left', FONT_ML); y += 24 * sc; return; } text(c, p.t, px + 50, y, 13.5 * sc, d ? 'rgba(43,33,24,.5)' : '#2b2118', 'left', FONT); c.font = `${13.5 * sc}px ${FONT}`; const pm = mode() === 'enml' ? p.ml : ''; if (!pm) { y += 24 * sc; } else if (c.measureText(p.t).width < pw - 150) { text(c, pm, px + pw - 16, y, 10.5 * sc, 'rgba(43,33,24,.5)', 'right', FONT); y += 24 * sc; } else { y += 16 * sc; text(c, pm, px + 50, y, 10.5 * sc, 'rgba(43,33,24,.5)', 'left', FONT); y += 20 * sc; } };
  const box = (x, yy, done) => { c.strokeStyle = 'rgba(43,33,24,.55)'; c.lineWidth = 1.2; roundRect(c, x, yy - 7, 14, 14, 3, done ? '#a3522f' : null, 'rgba(43,33,24,.55)'); if (done) { c.strokeStyle = '#f1e4c8'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 3, yy); c.lineTo(x + 6, yy + 3.5); c.lineTo(x + 11, yy - 4); c.stroke(); } };
  if (pg === 'today') {
    hud._taskRows = []; const T = tasksForToday(), Fe = festivalTasks();
    text(c, ml ? `${clock.dateStrML()} · ${clock.phaseNameML()}` : `${clock.dateStr()} · ${clock.phaseName()}`, px + 26, y, 12, 'rgba(160,60,40,.9)', 'left', F, ml ? '' : 'italic'); y += 26;
    if (Fe.length) { text(c, pick('This festival', 'ഈ ആഘോഷത്തിന്'), px + 26, y, 12.5, '#2b2118', 'left', F); y += 22; for (const p of Fe) taskRow(p); y += 10; }
    text(c, pick('Small things for today', 'ഇന്നത്തെ ചെറിയ കാര്യങ്ങൾ'), px + 26, y, 12.5, '#2b2118', 'left', F); y += 22;
    for (const p of T) taskRow(p);
    y += 12; text(c, state.today.allDone ? pick('A good day. Nothing left but the evening.', 'നല്ല ദിവസം. ഇനി സന്ധ്യ മാത്രം ബാക്കി.') : pick('No streaks, no penalties. Do what you like.', 'കണക്കില്ല, ശിക്ഷയില്ല. ഇഷ്ടമുള്ളത് ചെയ്യുക.'), px + 26, y, 11.5, 'rgba(43,33,24,.6)', 'left', F, ml ? '' : 'italic'); y += 18; text(c, pick('Tap a thing and the hand will show you where.', 'ഒന്നിൽ തൊട്ടാൽ കൈ എവിടെയെന്ന് കാണിച്ചുതരും.'), px + 26, y, 11.5, 'rgba(43,33,24,.6)', 'left', F, ml ? '' : 'italic'); y += 20; const gd = state.goodDays || 0; text(c, pick(`${gd} good day${gd === 1 ? '' : 's'} so far`, `ഇതുവരെ ${gd} നല്ല ദിവസങ്ങൾ`), px + 26, y, 11.5, 'rgba(160,60,40,.9)', 'left', F, ml ? '' : 'italic');
  } else if (pg === 'found') {
    const cats = [...new Set(FINDS.map(f => f.cat))]; const n = FINDS.filter(f => state.finds[f.id]).length; text(c, pick(`${n} of ${FINDS.length} found`, `${FINDS.length}-ൽ ${n} കണ്ടെത്തി`), px + 26, y, 12, 'rgba(160,60,40,.9)', 'left', F, ml ? '' : 'italic'); y += 24;
    for (const cat of cats) { text(c, body(cat), px + 26, y, 13, '#2b2118', 'left', F); y += 20; for (const f of FINDS.filter(f => f.cat === cat)) { const got = !!state.finds[f.id]; const nm = ml ? f.ml : f.n; text(c, got ? '✓ ' + nm : '?  ' + nm, px + 30, y, 13, got ? '#2b2118' : 'rgba(43,33,24,.5)', 'left', F); text(c, got ? (mode() === 'enml' ? f.ml : '') : body(f.where), px + pw - 16, y, 10.5, 'rgba(43,33,24,.5)', 'right', F); y += 15; if (!got) { y = wrap(c, body(f.hint), px + 30, y, pw - 60, 10.5, 'rgba(43,33,24,.55)', 14, F); } y += 6; } y += 8; }
  } else if (pg === 'more') {
    hud._rows = [];
    const row = (label, value, act) => { text(c, label, px + 26, y, 13 * sc, '#2b2118', 'left', F); if (value) { y = wrap(c, value, px + 26, y + 17 * sc, pw - 52, 11 * sc, 'rgba(160,60,40,.9)', 14 * sc, F); } else y += 16 * sc; hud._rows.push([y - 50 * sc, y, act]); y += 12 * sc; c.fillStyle = 'rgba(120,80,40,.15)'; c.fillRect(px + 26, y - 8 * sc, pw - 52, 1); y += 10 * sc; };
    row(pick('How to play', 'എങ്ങനെ കളിക്കാം'), pick('tap things · pull, rub and stir · the map and the diary · nothing can go wrong', 'സാധനങ്ങൾ തൊടുക · വലിക്കുക, ഉരയ്ക്കുക, ഇളക്കുക · ഭൂപടവും ഡയറിയും · ഒന്നും തെറ്റാനില്ല'), 'how');
    row(pick('Time', 'സമയം'), clock.mode === 'real' ? pick('The village keeps real time · tap for story time', 'ഗ്രാമം യഥാർത്ഥ സമയത്തിൽ · കഥാസമയത്തിന് തൊടുക') : pick('Story time, a day in 24 minutes · tap for real time', 'കഥാസമയം, 24 മിനിറ്റിൽ ഒരു ദിവസം · യഥാർത്ഥ സമയത്തിന് തൊടുക'), 'time');
    row(pick('Language', 'ഭാഷ'), mode() === 'en' ? 'English: Kada · shop · tap for Kada · കട' : mode() === 'enml' ? 'English + മലയാളം: Kada · കട · tap for മലയാളം മാത്രം' : 'മലയാളം മാത്രം · English-നായി തൊടുക', 'lang');
    row(pick('Text size', 'അക്ഷര വലിപ്പം'), [pick('normal', 'സാധാരണ'), pick('larger', 'വലുത്'), pick('largest', 'ഏറ്റവും വലുത്')][sc >= 1.3 ? 2 : sc > 1 ? 1 : 0] + ' · ' + pick('tap to change', 'മാറ്റാൻ തൊടുക'), 'text');
    row(pick('Motion', 'ചലനം'), state.reduceMotion ? pick('reduced: no sway, no particles, no grain · tap for full', 'കുറച്ചത്: ആട്ടമില്ല, കണികകളില്ല · പൂർണ്ണത്തിന് തൊടുക') : pick('full · tap to reduce', 'പൂർണ്ണം · കുറയ്ക്കാൻ തൊടുക'), 'motion');
    row(pick('Captions', 'അടിക്കുറിപ്പുകൾ'), state.highContrast ? pick('high contrast · tap for soft', 'ഉയർന്ന വ്യത്യാസം · മൃദുവിന് തൊടുക') : pick('soft · tap for high contrast', 'മൃദു · ഉയർന്ന വ്യത്യാസത്തിന് തൊടുക'), 'contrast');
    row(pick('Gentle reminders', 'മൃദുവായ ഓർമ്മപ്പെടുത്തലുകൾ'), state.reminders ? pick('on: Thiruvonam tomorrow, the kani tonight, the postman · never more than a few a week', 'ഓൺ: നാളെ തിരുവോണം, ഇന്ന് കണി, പോസ്റ്റുമാൻ · ആഴ്ചയിൽ രണ്ടോ മൂന്നോ മാത്രം') : pick('off · tap to allow', 'ഓഫ് · അനുവദിക്കാൻ തൊടുക'), 'reminders');
    row(pick('Postcards', 'പോസ്റ്റ്കാർഡുകൾ'), pick('press and hold anywhere in the village · tap here for one now', 'ഗ്രാമത്തിൽ എവിടെയും അമർത്തിപ്പിടിക്കുക · ഇപ്പോൾ ഒന്നിന് ഇവിടെ തൊടുക'), 'postcard');
    row(pick('Session notes', 'സെഷൻ കുറിപ്പുകൾ'), pick('share a private summary of your play, for the makers', 'നിങ്ങളുടെ കളിയുടെ സ്വകാര്യ സംഗ്രഹം പങ്കുവെക്കുക'), 'notes');
    row(pick('Frame times', 'ഫ്രെയിം സമയം'), state.showFps ? pick('shown · tap to hide', 'കാണിക്കുന്നു · മറയ്ക്കാൻ തൊടുക') : pick('hidden · tap to show, or tap the clock three times', 'മറച്ചിരിക്കുന്നു · കാണിക്കാൻ തൊടുക'), 'fps');
    row(pick('Gramam', 'ഗ്രാമം'), pick('every line, picture and sound made in code · no ads, no accounts, no tracking', 'ഓരോ വരിയും ചിത്രവും ശബ്ദവും കോഡിൽ ഉണ്ടാക്കിയത് · പരസ്യമില്ല, അക്കൗണ്ടില്ല, നിരീക്ഷണമില്ല'), null);
  } else if (isWords) {
    for (const [en, mlw, meaning] of GLOSSARY) { if (ml) { text(c, mlw, px + 26, y, 13.5, '#2b2118', 'left', FONT_ML); text(c, en, px + pw - 16, y, 11, 'rgba(43,33,24,.6)', 'right', FONT); } else { text(c, en, px + 26, y, 13.5, '#2b2118', 'left', FONT); text(c, mlw, px + pw - 16, y, 11, 'rgba(43,33,24,.6)', 'right', FONT); } y += 15; y = wrap(c, body(meaning), px + 26, y, pw - 48, 11.5, 'rgba(43,33,24,.7)', 15, F); y += 8; }
  } else {
    // life so far
    const dishes = Object.keys(state.dishes).length, books = Object.keys(state.booksRead).length, fests = ['thiruvonam', 'kaniseen', 'utsavam', 'harvest', 'planting', 'vavu', 'ramayanam', 'vallamkali'].filter(k => state.firsts[k]).length;
    const summary = ml ? `വീട്ടിൽ ${state.days + 1} ദിവസം · ${dishes} വിഭവം · ${state.lettersRead} കത്ത് · ${books} പുസ്തകം · ${fests} ആഘോഷം` : `${state.days + 1} day${state.days ? 's' : ''} home · ${dishes} dish${dishes === 1 ? '' : 'es'} cooked · ${state.lettersRead} letter${state.lettersRead === 1 ? '' : 's'} · ${books} book${books === 1 ? '' : 's'} · ${fests} festival${fests === 1 ? '' : 's'}`;
    y = wrap(c, summary, px + 26, y, pw - 48, 11.5, 'rgba(160,60,40,.85)', 15, F); y += 10;
    if (!state.diary.length) text(c, pick('Nothing written yet. Live a little.', 'ഇതുവരെ ഒന്നും എഴുതിയിട്ടില്ല. കുറച്ചു ജീവിക്കൂ.'), px + pw / 2 + 4, y, 13, 'rgba(43,33,24,.6)', 'center', F, ml ? '' : 'italic');
    for (let i = state.diary.length - 1; i >= 0; i--) {
      const e = state.diary[i];
      text(c, ml ? stampML(e.t) : e.t, px + 26, y, 10.5, 'rgba(43,33,24,.55)', 'left', F, ml ? '' : 'italic');
      y += 16; y = wrap(c, body(e.text), px + 26, y, pw - 48, 13.5 * sc, '#2b2118', (ml ? 20 : 18) * sc, F); y += 14;
    }
  }
  c.restore();
  // settings rows under the diary
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
  const S = (s, x, yy, size, col, style) => text(c, s, x, yy, size, col, 'center', F, ml ? '' : (style || ''));
  S(state.sound ? pick('Sound on', 'ശബ്ദം ഓൺ') : pick('Sound off', 'ശബ്ദം ഓഫ്'), w / 2 - 100, sy, 12.5, '#fff7e6');
  S(pick('Notebook', 'നോട്ടുബുക്ക്'), w / 2, sy, 12.5, '#fff7e6');
  S(pick('Close', 'അടയ്ക്കുക'), w / 2 + 100, sy, 12.5, '#fff7e6');
  S(state.hints ? pick('Hints on', 'സൂചനകൾ ഓൺ') : pick('Hints off', 'സൂചനകൾ ഓഫ്'), w / 2 - 70, sy + 32, 11.5, 'rgba(255,247,230,.85)');
  S(state.music ? pick('Music on', 'സംഗീതം ഓൺ') : pick('Music off', 'സംഗീതം ഓഫ്'), w / 2 + 60, sy + 32, 11.5, 'rgba(255,247,230,.85)');
  c.restore();
  c.strokeStyle = 'rgba(255,247,230,.5)'; c.lineWidth = 1; for (const dx of [-100, 0, 100]) roundRect(c, w / 2 + dx - 42, sy - 14, 84, 28, 14, null, 'rgba(255,247,230,.5)');
}
export function journalTap(p, w, h, safeTop, safeBottom) {
  const { py, ph, sy } = panel(h, safeTop, safeBottom);
  if (hud.page === 'today' && hud._taskRows && p.y > py + 62 && p.y < py + ph - 30) { const yy = p.y + hud.journalScroll; for (const [a, b, task] of hud._taskRows) if (yy >= a && yy <= b) { const g = TASK_PLACE[task.id]; if (!g) return true; audio.sfx('tap'); hud.journalOpen = false; hud.action = { go: g }; return true; } }
  if (hud.page === 'more' && hud._rows && p.y > py + 62 && p.y < py + ph - 30) { const yy = p.y + hud.journalScroll; for (const [a, b, act] of hud._rows) if (yy >= a && yy <= b) { if (!act) return true; audio.sfx('tap');
      if (act === 'time') { state.timeMode = clock.mode = clock.mode === 'real' ? 'story' : 'real'; if (clock.mode === 'real') clock.syncReal(); state.lastDayKey = clock.dayKey(); state.today = { key: clock.dayKey() }; }
      else if (act === 'lang') { state.lang = mode() === 'en' ? 'enml' : mode() === 'enml' ? 'ml' : 'en'; setA11yLang(state.lang); }
      else if (act === 'text') { state.textScale = state.textScale >= 1.3 ? 1 : state.textScale > 1 ? 1.3 : 1.15; }
      else if (act === 'motion') state.reduceMotion = !state.reduceMotion;
      else if (act === 'contrast') state.highContrast = !state.highContrast;
      else if (act === 'fps') state.showFps = !state.showFps;
      else hud.action = act; // reminders, postcard, notes: handled by the game loop
      return true; } }
  if (hud._tabs && Math.abs(p.y - (py + ph - 16)) < 16) { for (const [tx, id] of hud._tabs) if (Math.abs(p.x - tx) < 40) { hud.page = id; hud.journalScroll = 0; audio.sfx('page'); return true; } }
  if (Math.abs(p.y - (sy + 32)) < 13 && Math.abs(p.x - (w / 2 + 60)) < 60) { state.music = !state.music; audio.musicOff = !state.music; if (!state.music) music.stop(); audio.sfx('tap'); return true; }
  if (Math.abs(p.y - sy) < 18 && Math.abs(p.x - (w / 2 - 100)) < 44) { state.sound = !state.sound; audio.setMuted(!state.sound); audio.sfx('tap'); return true; }
  if (Math.abs(p.y - (sy + 32)) < 13 && Math.abs(p.x - (w / 2 - 70)) < 44) { state.hints = !state.hints; audio.sfx('tap'); return true; }
  if (Math.abs(p.y - sy) < 18 && Math.abs(p.x - w / 2) < 44) { hud.journalOpen = false; openNotebook(); return true; }
  return false;
}
export function wrap(c, s, x, y, maxW, size, col, lh, font = FONT) {
  c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle';
  const words = s.split(' '); let line = '';
  for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (c.measureText(tt).width > maxW && line) { c.fillText(line, x, y); y += lh; line = wd; } else line = tt; }
  if (line) { c.fillText(line, x, y); y += lh; }
  return y;
}
