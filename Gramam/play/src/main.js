import { canvas, ctx, view, resize, beginFrame, makeLayer } from './engine/canvas.js';
import { on, pointer } from './engine/input.js';
import { haptics } from './engine/haptics.js';
import { updateTweens, tween } from './engine/tween.js';
import { audio } from './engine/audio.js';
import { grain, vignette, text, FONT } from './art/draw.js';
import { state, load, save, reset } from './game/state.js';
import { clock } from './game/clock.js';
import { updateWorld, world } from './game/world.js';
import { router } from './game/router.js';
import { say, updateCaption, drawCaption, clearCaptions, captionTap } from './ui/caption.js';
import { hud, drawHUD, hudTap, drawJournal } from './ui/hud.js';
import { map, drawMap, mapTap, drawMapIcon, TRAVEL } from './ui/map.js';
import { notebook, drawNotebook, notebookTap } from './ui/notebook.js';
import { SCENES } from './scenes/index.js';
import { Title } from './scenes/title.js';
import { visitors, reconcile, deliver } from './game/visitors.js';
import { fest } from './game/festivals.js';
import { letter, drawLetter, letterTap } from './ui/letter.js';
import { music } from './engine/music.js';
import { checkTasks } from './game/tasks.js';
import { yearSkipDue } from './game/arc.js';
import { t, pick, FONT_ML } from './i18n/t.js';
import { ARCS, playBeat, anyDue, has, beatDue } from './game/people.js';
import { SURPRISES } from './game/surprises.js';
import { choice, drawChoice, choiceTap } from './ui/choice.js';
import { postcard, openPostcard, drawPostcard, postcardTap } from './ui/postcard.js';
import { mountA11y, updateA11y, setA11yLang } from './ui/a11y.js';
import { syncReminders } from './game/reminders.js';
import { sessionNotes } from './game/notes.js';
import { platform } from './engine/platform.js';
import { ui } from './i18n/t.js';
import { pushWidget } from './game/widget.js';
import { guide, point, unpoint, drawGuide } from './ui/guide.js';
import { openText } from './ui/letter.js';
import { RECIPES, listFor } from './game/pantry.js';

const DEMO = /[?&]demo=1/.test(location.search);
const hasSave = load();
audio.muted = !state.sound; audio.musicOff = !state.music;
clock.mode = state.timeMode || 'real'; if (DEMO) { state.timeMode = 'story'; clock.mode = 'story'; } if (clock.mode === 'real') clock.syncReal();
if (state.prologue) state.prologue = false; // an interrupted first morning just becomes an ordinary day
const scenes = {}; for (const k in SCENES) scenes[k] = new SCENES[k]();
const HOME = new Set(['poomukham', 'nadumuttam', 'adukkala', 'ara', 'thodi', 'kulam', 'thattinpuram']);
let title = new Title(hasSave), current = title, snap = null, snapA = 0, inTitle = true, holdT = 0;
const inter = { on: false, a: 0, text: '', phase: 'out', t: 0, next: null, mode: 'walk' }; // travel / ride / sleep interludes: the world stays visible
const pro = { on: false, t: 0, hinted: false, tapped: false }; // the first morning, scripted at dawn before real time takes over
resize(); addEventListener('resize', () => { resize(); for (const k in scenes) scenes[k].invalidate(); });
// Try to wake audio at launch (works inside the native app); browsers wait for the first touch.
try { audio.unlock(); } catch (e) { }
let titleMusic = false;

function setScene(name, opt = {}) {
  if (!opt.back && current !== title && state.scene !== name) { router.history.push(state.scene); if (router.history.length > 24) router.history.shift(); }
  clearCaptions(); // what was left to say about the old place stays there
  if (guide.target && guide.target.scene && guide.target.scene !== name) guide.target = null;
  current.leave(); current = scenes[name]; current.enter(); state.scene = name;
  world.sceneName = name; world.indoor = name === 'adukkala' || name === 'ara' || name === 'vayanasala' || name === 'kada' || name === 'thattinpuram'; world.courtyard = name === 'nadumuttam';
  save();
}
const DEMO_PLACES = new Set(['poomukham', 'nadumuttam', 'adukkala', 'ara', 'thodi', 'kulam', 'thattinpuram', 'chayakkada', 'kavala', 'kadavu', 'station']);
router.go = (name, opt = {}) => {
  const next = scenes[name]; if (!next || next === current || inter.on) return;
  if (DEMO && !DEMO_PLACES.has(name)) { say('The rest of the village is in the app. This is the first morning, in your browser.', 'ആപ്പിൽ', 4); return; }
  const walk = opt.walk !== undefined ? opt.walk : !(HOME.has(name) && HOME.has(state.scene));
  if (walk) { startInter(opt.back ? (TRAVEL.back || 'You walk back the way you came.') : (TRAVEL[name] || 'You walk.'), () => { clock.minutes += HOME.has(name) || HOME.has(state.scene) ? 12 : 6; setScene(name, opt); }, 1.3, 'walk'); return; }
  snap = makeLayer(view.w, view.h); snap.x.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, view.w, view.h); snapA = 1;
  setScene(name, opt);
  tween({ get a() { return snapA; }, set a(v) { snapA = v; } }, { a: 0 }, 1.1, t => t * t * (3 - 2 * t), () => { snap = null; });
};
router.interlude = (line, fn, hold, mode = 'ride') => startInter(line, fn, hold, mode);
router.back = () => { if (inter.on || inTitle) return; if (hud.journalOpen || map.open || notebook.open || letter.open || choice.open || postcard.open) { hud.journalOpen = map.open = notebook.open = letter.open = choice.open = postcard.open = false; audio.sfx('page'); return; } const prev = router.history.pop(); if (!prev || !scenes[prev]) { map.open = true; audio.sfx('page'); return; } audio.sfx('tap'); haptics.light(); router.go(prev, { back: true }); };
router.exitDir = dir => { const ex = current.exits.find(e => e.side === dir); if (ex && !current.busy) { audio.sfx('tap'); haptics.light(); ex.go(); return true; } return false; };
function morningReset() { state.lamp = false; state.kaapi = false; state.swept = false; state.thodiSwept = false; state.paperRead = false; state.chammanthi = false; state.laundryUp = false; state.served = null; }
router.sleep = (line) => {
  if (clock.mode === 'real') { startInter(line || 'You sleep. The house creaks and settles around you.', () => { }, 2.2, 'sleep'); return; }
  if (yearSkipDue()) { startInter('Months pass the way they do here: rain, harvest, heat, rain again. Chingam comes round, and with it Uthradam.', () => { clock.month = 0; clock.day = 21; clock.minutes = 5 * 60 + 40; clock.advance(0); state.days += 300; state.skipped = true; morningReset(); state.today = { key: clock.dayKey() }; save(); }, 3.6, 'sleep'); return; }
  startInter(line || 'You sleep. The house creaks and settles around you.', () => { clock.minutes = 5 * 60 + 40; clock.day++; if (clock.day > 30) { clock.day = 1; clock.month = (clock.month + 1) % 12; } clock.advance(0); state.days++; morningReset(); save(); }, 2.6, 'sleep');
};
function startInter(line, apply, hold = 1.6, mode = 'walk') {
  inter.on = true; inter.phase = 'out'; inter.t = 0; inter.text = line; inter.apply = apply; inter.hold = hold; inter.mode = mode; inter.applied = false;
  // keep the old view and crossfade it into the new one under the strip, instead of going to black
  snap = makeLayer(view.w, view.h); snap.x.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, view.w, view.h); snapA = 1;
  if (mode === 'walk') audio.sfx('steps', { reps: 3 });
}
function updateInter(dt) {
  if (!inter.on) return; inter.t += dt;
  const outT = inter.mode === 'sleep' ? .9 : .45, inT = inter.mode === 'sleep' ? 1.1 : .7;
  if (inter.phase === 'out') { inter.a = Math.min(1, inter.t / outT); if (inter.t >= outT) { inter.phase = 'hold'; inter.t = 0; } }
  else if (inter.phase === 'hold') { inter.a = 1; if (!inter.applied && inter.t >= inter.hold * .35) { inter.applied = true; inter.apply && inter.apply(); } if (inter.applied && snap) snapA = Math.max(0, snapA - dt / (inter.hold * .6)); if (inter.t >= inter.hold) { inter.phase = 'in'; inter.t = 0; } }
  else { inter.a = Math.max(0, 1 - inter.t / inT); if (snap) snapA = Math.max(0, snapA - dt * 2); if (inter.t >= inT) { inter.on = false; if (!inter.applied) { inter.applied = true; inter.apply && inter.apply(); } snap = null; snapA = 0; } }
}
function drawInter(c, w, h) {
  if (!inter.on) return; c.save();
  const a = inter.a, mode = inter.mode;
  if (mode === 'sleep') { // eyelids closing from top and bottom; the room stays between them until they meet
    const lid = a * (h / 2 + 2); c.fillStyle = '#120d08'; c.fillRect(0, 0, w, lid); c.fillRect(0, h - lid, w, lid);
  } else { c.globalAlpha = a * (mode === 'ride' ? .5 : .3); c.fillStyle = '#17120d'; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
    if (mode === 'ride' && inter.phase === 'hold') { c.globalAlpha = .18; c.strokeStyle = '#fff2d0'; c.lineWidth = 1; for (let i = 0; i < 14; i++) { const yy = 120 + i * 48, xx = ((inter.t * 420 * (1 + i % 3)) + i * 97) % (w + 120) - 60; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx - 40 - (i % 3) * 20, yy); c.stroke(); } c.globalAlpha = 1; } }
  // the line on a strip of paper, low on the screen, so the place can be seen above it
  const ta = inter.phase === 'hold' ? Math.min(1, inter.t * 3) : inter.phase === 'in' ? a : Math.min(1, inter.t * 2) * a;
  const txt = t(inter.text), ml = txt !== inter.text;
  c.globalAlpha = ta; c.font = ml ? `14px ${FONT_ML}` : `italic 14.5px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const words = txt.split(' '); let line = '', lines = []; for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (c.measureText(tt).width > w - 96 && line) { lines.push(line); line = wd; } else line = tt; } if (line) lines.push(line);
  const sh = lines.length * 21 + 26, sy = mode === 'sleep' ? h / 2 - sh / 2 : h * .60 - sh / 2;
  c.fillStyle = mode === 'sleep' ? 'rgba(18,13,8,0)' : 'rgba(243,234,211,.94)'; c.beginPath(); c.roundRect(24, sy, w - 48, sh, 6); c.fill();
  if (mode !== 'sleep') { c.fillStyle = '#a3522f'; c.fillRect(24, sy, 4, sh); if (mode === 'walk') { for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(163,82,47,${((Math.floor(inter.t * 3) + i) % 3 === 0) ? .9 : .3})`; c.beginPath(); c.ellipse(w - 46 - i * 10, sy + sh - 10 + (i % 2) * 3, 2.6, 4, -.4, 0, 7); c.fill(); } } }
  c.fillStyle = mode === 'sleep' ? '#efe3c6' : '#2b2118'; let y = sy + 14 + 10; for (const l of lines) { text(c, l, w / 2 + 2, y, ml ? 14 : 14.5, c.fillStyle, 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic'); y += 21; }
  c.restore();
}
// ---------- the first morning ----------
// Whatever the phone's clock says, the first time you arrive it is dawn: Kuttan is on his way with the milk and the flute is awake.
// After a few minutes of that, the village hands you over to real time.
function beginPrologue() {
  pro.on = true; pro.t = 0; state.prologue = true; clock.mode = 'story'; clock.speed = 1; clock.syncReal();
  clock.minutes = 6 * 60 + 4; state.lastDayKey = clock.dayKey(); state.today = { key: clock.dayKey(), mDawn: true };
  say(pick(`${clock.dateStr()}. Dawn. You have come home after a long time away.`, `${clock.dateStrML()}. വെളുപ്പാൻകാലം. ഒരുപാട് നാളുകൾക്കു ശേഷം നിങ്ങൾ വീട്ടിൽ തിരിച്ചെത്തി.`), 'വീട്', 5.5);
  state.lastMusicAt = Date.now(); setTimeout(() => { if (!inTitle && !audio.musicOff && !music.playing) music.play('mohanam', 70); }, 6000);
}
function updatePrologue(dt) {
  if (!pro.on) return; pro.t += dt;
  if (state.timeMode === 'story' || clock.mode !== 'story') { pro.on = false; state.prologue = false; return; } // the player chose story time, or something else moved the clock
  if (!pro.hinted && pro.t > 10 && visitors.active && !visitors.active.met) { pro.hinted = true; const sp = current.visitorSpot(Math.min(view.w, 430)); current.hotspots.push({ x: sp.x, y: sp.y - 36, r: 1, label: '_kuttan', enabled: () => !!(visitors.active && !visitors.active.met), action: () => {} }); point({ scene: state.scene, label: '_kuttan', text: 'Tap Kuttan. He has the milk.', ml: 'കുട്ടനെ തൊടുക. പാൽ കൊണ്ടുവന്നിട്ടുണ്ട്.' }); }
  if (visitors.active && visitors.active.met && guide.target && guide.target.label === '_kuttan') unpoint('_kuttan');
  if (!pro.diaryHint && pro.t > 40 && !guide.target) { pro.diaryHint = true; point({ hud: 'diary', text: 'The diary has today’s small things. Tap one and the hand takes you there.', ml: 'ഡയറിയിൽ ഇന്നത്തെ ചെറിയ കാര്യങ്ങളുണ്ട്.' }); }
  if (!pro.mapHint && pro.t > 70 && !guide.target && !map.open) { pro.mapHint = true; point({ hud: 'map', text: 'The folded map takes you into the village.', ml: 'മടക്കിയ ഭൂപടം ഗ്രാമത്തിലേക്ക് കൊണ്ടുപോകും.' }); }
  const metKuttan = (state.visitorsMet.milkman || 0) > 0;
  if (inter.on) return;
  if ((metKuttan && pro.t > 50) || pro.t > 170) {
    pro.on = false; state.prologue = false;
    const n = new Date(), hh = n.getHours(), mm = n.getMinutes(), ts = `${hh % 12 || 12}:${mm < 10 ? '0' : ''}${mm} ${hh >= 12 ? 'pm' : 'am'}`;
    startInter(pick(`The morning goes the way mornings do here. From now on the village keeps your time: it is ${ts} outside.`, `രാവിലെകൾ ഇവിടെ പോകുന്നതുപോലെ ഈ രാവിലെയും പോയി. ഇനി ഗ്രാമം നിങ്ങളുടെ സമയം തന്നെ നോക്കും: പുറത്ത് ഇപ്പോൾ ${ts}.`), () => { clock.mode = 'real'; clock.syncReal(); state.lastDayKey = clock.dayKey(); state.today = { key: clock.dayKey() }; state.lastSeenAt = Date.now(); save(); }, 3.4, 'walk');
  }
}
function start() {
  inTitle = false; music.stop(); const name = scenes[state.scene] ? state.scene : 'poomukham';
  if (!state.startedAt) state.startedAt = Date.now(); state.stats.sessions = (state.stats.sessions || 0) + 1; setA11yLang(state.lang); if (state.reminders) setTimeout(syncReminders, 3000);
  setScene(name); state.started = true; tween(hud, { alpha: 1 }, 1.5);
  if (!hasSave) {
    if (clock.mode === 'real') beginPrologue();
    else { state.lastDayKey = clock.dayKey(); state.today = { key: clock.dayKey() }; say('Chingam. The month of Onam. You have come home after a long time away.', 'ചിങ്ങം', 6); setTimeout(() => say('Tap what you want to touch. Wait a moment and the house will show you where.', '', 4.5), 5500); setTimeout(() => say('The folded map, bottom left, takes you into the village.', '', 4), 10500); }
  }
  else { say('Welcome back.', 'വീണ്ടും സ്വാഗതം', 2.5); setTimeout(reconcile, 1200); }
  save(); setTimeout(() => pushWidget(true), 2500);
}
const overlaysOpen = () => hud.journalOpen || map.open || notebook.open || letter.open || choice.open || postcard.open;
let lastInput = performance.now(), lastMoveY = null, clockTaps = [];
on('down', p => { audio.unlock(); audio.resume(); holdT = performance.now(); holdP = p; holdMoved = false; lastMoveY = p.y; lastInput = performance.now(); pro.tapped = true; if (!inTitle && !inter.on && !overlaysOpen()) current.down && current.down(p, view.w); });
on('up', p => { holdT = 0; if (!inTitle && current.up) current.up(p); });
let holdP = null, holdMoved = false;
on('swipe', s => { if (inTitle || inter.on) return; if (overlaysOpen()) return; if (current.gestureEnd && performance.now() - current.gestureEnd < 200) return; if (s.dir === 'right' && s.startX < 36) { router.back(); return; } if (s.dir === 'right') router.exitDir('left'); else router.exitDir('right'); });
// Android hardware back and iOS: Capacitor App plugin when present
try { const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App; if (App && App.addListener) App.addListener('backButton', () => { if (inTitle) { App.minimizeApp && App.minimizeApp(); } else router.back(); }); } catch (e) { }
on('move', p => { lastInput = performance.now(); if (holdP && Math.hypot(p.x - holdP.x, p.y - holdP.y) > 10) holdMoved = true; if (!inTitle && current.gesture) { current.move(p); return; } if (pointer.down && lastMoveY !== null) { const dy = p.y - lastMoveY; if (hud.journalOpen) hud.journalScroll = Math.max(0, hud.journalScroll - dy); if (notebook.open) notebook.scroll = Math.max(0, notebook.scroll - dy); lastMoveY = p.y; } });
on('tap', p => {
  if (inTitle) { const r = title.tapAt(p, view.w, view.h); if (r === 'reset') { audio.sfx('page'); reset(); location.reload(); } else if (r === 'start') { audio.sfx('tap'); title.pressed = 1; tween(title, { pressed: 0 }, .3); setTimeout(start, 180); } else if (title.confirmT > 0) audio.sfx('tap'); return; }
  if (inter.on) return;
  // three quick taps on the clock show frame times (for checking the phone, not for playing)
  if (p.y < view.safeTop + 40 && p.x > view.w - 90 && !overlaysOpen()) { const now = performance.now(); clockTaps = clockTaps.filter(x => now - x < 900); clockTaps.push(now); if (clockTaps.length >= 3) { clockTaps = []; state.showFps = !state.showFps; audio.sfx('tap'); return; } }
  if (map.open) { const to = mapTap(p, view.w, view.h, view.safeTop, view.safeBottom); if (to && to !== state.scene) router.go(to); return; }
  if (postcard.open) { postcardTap(p, view.w); return; }
  if (letterTap()) return;
  if (choiceTap(p)) return;
  if (notebookTap(p, view.w, view.h, view.safeTop, view.safeBottom)) return;
  if (hudTap(p, view.w, view.h, view.safeBottom)) return;
  if (captionTap(p, view.w, view.h, view.safeBottom)) { audio.sfx('page'); return; } // the slip itself: put it away
  if (Math.hypot(p.x - 30, p.y - (view.h - view.safeBottom - 30)) < 28 && !hud.journalOpen) { map.open = true; unpoint('map'); audio.sfx('page'); return; }
  if (router.history.length && Math.abs(p.y - (view.h - view.safeBottom - 30)) < 20 && Math.abs(p.x - view.w / 2) < 80 && !hud.journalOpen) { router.back(); return; }
  current.tap(p, view.w, view.h);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); pushWidget(true); } else { audio.resume(); lastInput = performance.now(); if (!inTitle) { if (clock.mode === 'real') clock.syncReal(); setTimeout(reconcile, 600); } } });
addEventListener('pagehide', save);

// ---------- frame loop ----------
// When nobody has touched the screen for a while the game draws at 30 and then 20 frames a second: a village that is just sitting there should not warm the phone.
let last = performance.now(), lastDraw = 0, a11yT = 0; const perf = { frame: 16.7, work: 4, worst: 0, worstT: 0 };
function frame(now) {
  const idle = (now - lastInput) / 1000;
  const minGap = (inTitle || inter.on || overlaysOpen() || current.busy || current.gesture) ? 0 : idle > 90 ? 48 : idle > 20 ? 31 : 0;
  if (minGap && now - lastDraw < minGap - 2) { requestAnimationFrame(frame); return; }
  const t0 = performance.now(); lastDraw = now;
  const dt = Math.min(.05, (now - last) / 1000); perf.frame += ((now - last) - perf.frame) * .08; last = now;
  updateTweens(dt); updateInter(dt); updatePrologue(dt); if (!document.hidden) audio.watch(dt);
  // press and hold for a postcard (not during a gesture, an interlude or with anything open)
  if (holdT && !holdMoved && !inTitle && !inter.on && !overlaysOpen() && !current.gesture && !current.busy && now - holdT > 650) { holdT = 0; openPostcard(current, view.w, view.h); }
  if (hud.action) { const act = hud.action; hud.action = null; hud.journalOpen = false;
    if (act && act.go) { const g = act.go; if (g.hud) point({ hud: g.hud, text: g.text, ml: g.ml }); else if (g.scene === state.scene) point(g); else { router.go(g.scene); setTimeout(() => point(g), 2600); } }
    else if (act === 'how') openText(pick('How to play', 'എങ്ങനെ കളിക്കാം'), pick('Tap a thing to use it: the lamp, the well, the cow, a person. Wait a moment and small rings show what can be touched.\n\nSome things want your hand: pull the well rope down and up, rub the grinding stone side to side, sweep the leaves, stir the payasam round and round, pull the bell rope. The hand will show you the first time.\n\nThe folded map, bottom left, takes you anywhere in the village. The diary, bottom right, has today’s small things: tap one and the hand takes you there.\n\nSwipe left or right to go next door. Swipe from the left edge to go back.\n\nPress and hold anywhere for a postcard. Nothing can go wrong, nothing is lost, there is no hurry.', 'ഒരു സാധനം ഉപയോഗിക്കാൻ അതിൽ തൊടുക: വിളക്ക്, കിണർ, പശു, ഒരാൾ. ഒരു നിമിഷം കാത്താൽ തൊടാവുന്നവയ്ക്കു ചുറ്റും ചെറിയ വളയങ്ങൾ വരും.\n\nചിലതിന് കൈ വേണം: കിണറ്റിലെ കയർ താഴേക്കും മേലോട്ടും വലിക്കുക, അമ്മിക്കല്ല് അങ്ങോട്ടുമിങ്ങോട്ടും ഉരയ്ക്കുക, ഇലകൾ അടിച്ചുവാരുക, പായസം വട്ടത്തിൽ ഇളക്കുക, മണിക്കയർ വലിക്കുക. ആദ്യത്തെ തവണ കൈ കാണിച്ചുതരും.\n\nതാഴെ ഇടത്തെ മടക്കിയ ഭൂപടം ഗ്രാമത്തിൽ എവിടെയും കൊണ്ടുപോകും. താഴെ വലത്തെ ഡയറിയിൽ ഇന്നത്തെ ചെറിയ കാര്യങ്ങളുണ്ട്: ഒന്നിൽ തൊട്ടാൽ കൈ അവിടെ കൊണ്ടുപോകും.\n\nഅടുത്ത മുറിയിലേക്ക് ഇടത്തോട്ടോ വലത്തോട്ടോ തെന്നുക. തിരിച്ചുപോകാൻ ഇടത്തെ അരികിൽനിന്ന് തെന്നുക.\n\nപോസ്റ്റ്കാർഡിന് എവിടെയും അമർത്തിപ്പിടിക്കുക. ഒന്നും തെറ്റാനില്ല, ഒന്നും നഷ്ടപ്പെടില്ല, തിരക്കില്ല.'));
    else if (act === 'postcard') openPostcard(current, view.w, view.h);
    else if (act === 'notes') platform.shareText(sessionNotes(perf)).then(r => say(r === 'copied' ? 'Session notes copied.' : r === 'shared' ? 'Session notes shared.' : 'Could not share the notes here.', '', 3));
    else if (act === 'reminders') { if (state.reminders) { state.reminders = false; syncReminders(); say('Reminders off.', '', 2.5); } else platform.reminders.enable().then(ok => { state.reminders = ok; if (ok) { syncReminders(); say('Gentle reminders on: Thiruvonam tomorrow, the kani tonight, the postman. Never more than a few a week.', 'ഓർമ്മപ്പെടുത്തൽ', 6); } else say('Reminders need permission in Settings, or are not available here.', '', 4); }); } }
  a11yT = (a11yT || 0) + dt; if (a11yT > .5 && !inTitle) { a11yT = 0; updateA11y(current, [{ label: pick('Map', 'ഭൂപടം'), x: 30, y: view.h - view.safeBottom - 30, r: 26, fn: () => { map.open = true; audio.sfx('page'); } }, { label: pick('Diary', 'ഡയറി'), x: view.w - 30, y: view.h - view.safeBottom - 30, r: 26, fn: () => { hud.journalOpen = !hud.journalOpen; audio.sfx('page'); } }]); }
  if (!inTitle) { updateWorld(dt, current); current.update(dt); } else { title.update(dt); if (audio.ready && audio.running) { audio.setAmbience({ birds: .35, wind: .22, lapping: .3, koel: .12, crows: .1 }, 3); if (!titleMusic && !music.playing && !audio.musicOff) { titleMusic = true; setTimeout(() => { if (inTitle) music.play('mohanam', 70, 392); }, 2500); } } }
  updateCaption(dt);
  beginFrame();
  const w = view.w, h = view.h;
  ctx.fillStyle = '#1c2b45'; ctx.fillRect(0, 0, w, h);
  current.draw(ctx, w, h);
  if (snap) { ctx.globalAlpha = snapA; ctx.drawImage(snap.c, 0, 0, w, h); ctx.globalAlpha = 1; }
  if (!inTitle) {
    drawHUD(ctx, w, h, current, view.safeTop, view.safeBottom);
    if (hud.alpha > 0 && !hud.journalOpen && !map.open && !notebook.open) { ctx.save(); ctx.globalAlpha = hud.alpha; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 5; drawMapIcon(ctx, 30, h - view.safeBottom - 30); const prev = router.history[router.history.length - 1]; if (prev && scenes[prev] && !inter.on) { const by = h - view.safeBottom - 30, label = '‹  ' + t(scenes[prev].title); ctx.font = `italic 12px ${FONT}`; const tw = ctx.measureText(label).width + 26; ctx.fillStyle = 'rgba(20,14,8,.45)'; ctx.beginPath(); ctx.roundRect(w / 2 - tw / 2, by - 14, tw, 28, 14); ctx.fill(); text(ctx, label, w / 2, by + 1, 12, '#fff7e6', 'center', FONT, 'italic'); } ctx.restore(); }
    drawCaption(ctx, w, h, view.safeBottom, current); drawGuide(ctx, current, w, h, view.safeBottom); drawJournal(ctx, w, h, view.safeTop, view.safeBottom); drawNotebook(ctx, w, h, view.safeTop, view.safeBottom); drawLetter(ctx, w, h, view.safeTop, view.safeBottom); drawChoice(ctx, w, h, view.safeTop, view.safeBottom); drawMap(ctx, w, h, view.safeTop, view.safeBottom); drawPostcard(ctx, w, h, view.safeTop, view.safeBottom);
  }
  drawInter(ctx, w, h);
  if (ui.motion) grain(ctx, w, h, .06); vignette(ctx, w, h, .38);
  const work = performance.now() - t0; perf.work += (work - perf.work) * .1; if (work > perf.worst || now - perf.worstT > 2000) { perf.worst = work; perf.worstT = now; }
  if (state.showFps && !inTitle) { ctx.save(); ctx.font = `11px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(10, view.safeTop + 48, 200, 34); ctx.fillStyle = '#fff7e6'; ctx.fillText(`frame ${perf.frame.toFixed(1)} ms · ${(1000 / perf.frame).toFixed(0)} fps${minGap ? ' · resting' : ''}`, 16, view.safeTop + 58); ctx.fillText(`draw ${perf.work.toFixed(1)} ms · worst ${perf.worst.toFixed(1)} ms · ${canvas.width}×${canvas.height}`, 16, view.safeTop + 72); ctx.restore(); }
  requestAnimationFrame(frame);
}
mountA11y(p => { if (inTitle || inter.on) return; current.tap(p, view.w, view.h); });
requestAnimationFrame(frame);
window.__g = { clock, state, scenes, audio, hud, map, notebook, visitors, fest, letter, music, pro, perf, reconcile, people: { ARCS, playBeat, anyDue, has, beatDue }, SURPRISES, choice, deliver, postcard, RECIPES, listFor, openPostcard: () => openPostcard(current, view.w, view.h), notes: () => sessionNotes(perf), go: (n, o) => router.go(n, o), sleep: () => router.sleep(), start: () => { if (inTitle) start(); }, nosnap: () => { snap = null; snapA = 0; }, step: (n = 60, ms = 16) => { for (let i = 0; i < n; i++) { lastInput = performance.now(); last = performance.now() - ms; lastDraw = 0; frame(performance.now()); } }, tick: (n = 60, dt = .016) => { for (let i = 0; i < n; i++) { updateTweens(dt); updateInter(dt); updatePrologue(dt); if (!inTitle) { updateWorld(dt, current); current.update(dt); } updateCaption(dt); } }, get current() { return current; }, inter };
