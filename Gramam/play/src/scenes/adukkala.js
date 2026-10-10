import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, hgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { stepsFor, STEP_SPOT } from '../game/cooking.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { fishShape } from '../art/lib.js';
import { drops } from '../engine/particles.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { inOut, hash, rnd } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { steam, sparks, dust } from '../engine/particles.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';
import { haptics } from '../engine/haptics.js';

import { openNotebook } from '../ui/notebook.js';
import { RECIPES, cook, canCook, add } from '../game/pantry.js';
import { fest } from '../game/festivals.js';

export class Adukkala extends Scene {
  constructor() {
    super('adukkala', 'Adukkala', 'അടുക്കള');
    this.outdoor = false; this.boil = 0; this.grindT = 0; this.cup = state.kaapi ? 1 : 0; this.smokeT = 0;
    this.cooking = null; this.cookT = 0;
    this.hotspots = [
      { x: 56, y: 585, r: 30, label: 'kudam', action: () => say(state.potFull ? 'The kudam is full, cold from the kinar.' : 'The kudam is nearly empty. Draw water from the kinar.', 'കുടം') },
      { x: 316, y: 606, r: 26, label: 'chirava', action: () => { audio.sfx('scrape'); say('The chirava: a serrated blade on a stool you sit on. Every coconut in this house has met it.', 'ചിരവ'); } },
      { x: 190, y: 640, r: 34, label: 'serve', enabled: () => !!(this.cooking && this.step().at === 'serve'), action: () => {} },
      { x: 72, y: 650, r: 40, label: 'viraku', action: () => this.feed() },
      { x: 188, y: 416, r: 34, label: 'chembu', action: () => this.cookAt('chembu') },
      { x: 112, y: 418, r: 30, label: 'chatti', action: () => this.cookAt('chatti') },
      { x: 292, y: 660, r: 50, label: 'ammikkallu', enabled: () => !state.chammanthi, drag: p => this.rub(p), action: () => {} },
      { x: 232, y: 586, r: 30, label: 'puttukutti', action: () => this.cookAt('puttu') },
      { x: 348, y: 640, r: 34, label: 'ural', action: () => this.pound() },
      { x: 300, y: 456, r: 26, label: 'Amma’s notebook', action: () => openNotebook() },
    ];
    this.exits = [{ side: 'left', y: 560, label: 'Nadumuttam', go: () => router.go('nadumuttam') }];
  }
  enter() { super.enter(); this.cup = state.kaapi ? 1 : 0; }
  feed() {
    if (state.fire > .9) { say('The aduppu is already roaring.', 'അടുപ്പ്'); return; }
    this.busy = true; audio.sfx('wood');
    delay(.5, () => { state.fire = Math.min(1, state.fire + .5); sparks(this.ps, 150, 440, 10); this.busy = false; say('You push in a few sticks of viraku. The fire takes.', 'വിറക്'); remember('fire', 'Fed the aduppu with viraku from the stack. The smoke knows its own way out through the roof tiles.'); });
  }
  cookAt(where) { if (this.cooking) return; openNotebook(r => this.make(r), where); }
  // ---------- cooking, step by step ----------
  make(r) { this.cooking = { r, steps: stepsFor(r, state.fire < .25), i: 0, n: 0 }; audio.sfx('page'); say(pick(`${r.name}: ${this.cooking.steps.length} steps. Everything you need is on the counter.`, `${r.ml}: ${this.cooking.steps.length} പടികൾ. വേണ്ടതെല്ലാം തട്ടിലുണ്ട്.`), r.ml, 3.5); }
  step() { return this.cooking ? this.cooking.steps[this.cooking.i] : null; }
  stepSpot() { const st = this.step(); return st ? this.hotspots.find(h => h.label === STEP_SPOT[st.at]) : null; }
  cancelCooking() { this.cooking = null; audio.sfx('page'); say('Left for later. The fire will keep.', 'പിന്നെ'); }
  // the effect of one step at its place, then on to the next
  doStep() {
    const C = this.cooking, st = this.step(); if (!st) return;
    if (st.at === 'viraku') { state.fire = Math.min(1, state.fire + .5); sparks(this.ps, 150, 440, 10); audio.sfx('wood'); }
    else if (st.at === 'kudam') { audio.sfx('pour'); const ps = this.ps; let k = 0; const iv = setInterval(() => { drops(ps, st.at === 'kudam' ? (C.r.where === 'chembu' ? 188 : 112) : 112, 400, 3); if (++k > 6) clearInterval(iv); }, 90); }
    else if (st.at === 'chembu' || st.at === 'chatti') { if (st.kind === 'tap') { audio.hold('kettle', .35, 2.5); steam(this.ps, st.at === 'chembu' ? 168 : 112, 400, 1, 10); } else audio.sfx('sizzle', { dur: .8 }); if (state.fire < .25) { say('The fire has gone low. A stick of viraku first.', 'വിറക്'); C.steps.splice(C.i, 0, { at: 'viraku', kind: 'tap', text: 'Feed the aduppu first; the fire has gone low.', ml: 'അടുപ്പിൽ വിറക്', n: 1 }); return; } }
    else if (st.at === 'shelf') audio.sfx('tap');
    else if (st.at === 'ammikkallu') audio.sfx('grind', { reps: 1 });
    else if (st.at === 'chirava') audio.sfx('scrape', { reps: 1 });
    else if (st.at === 'ural') audio.sfx('pound', { reps: 1 });
    else if (st.at === 'puttukutti') audio.sfx('tap');
    haptics.soft(); C.n = 0; C.i++;
    if (C.i >= C.steps.length) this.finish(); else audio.sfx('page');
  }
  finish() {
    const r = this.cooking.r; this.cooking = null; cook(r); did('cook'); if (r.id === 'kaapi') { did('kaapi'); state.kaapi = true; state.kaapiAt = clock.minutes; tween(this, { cup: 1 }, .5, inOut); } tween(this, { boil: 0 }, 2, t => t); state.fire = Math.max(0, state.fire - .15); haptics.success(); audio.sfx('chime'); say(r.line, r.ml, 5);
  }
  // taps during cooking go to the step; the ✕ on the strip puts it away
  tap(p0, w0, h) {
    if (!this.cooking) return super.tap(p0, w0, h);
    const p = { x: p0.x - this.ox, y: p0.y }; if (p.y > 108 && p.y < 150 && p.x > w0 - 60) { this.cancelCooking(); return true; }
    for (const ex of this.exits) { const q = this.exitPos(ex, Math.min(w0, 430), h); if (Math.hypot(p.x - q.x, p.y - q.y) < 34) { this.cooking = null; return super.tap(p0, w0, h); } }
    const st = this.step(), spot = this.stepSpot(); let hit = null, bd = 1e9;
    for (const hs of this.hotspots) { const d = Math.hypot(p.x - hs.x, p.y - hs.y); if (d < (hs.r || 30) && d < bd) { bd = d; hit = hs; } }
    if (!hit) return true;
    if (hit.label === 'Amma’s notebook' && st.at !== 'shelf') { openNotebook(); return true; }
    if (hit !== spot) { say(pick(`Not that yet. ${st.text}`, `അതിപ്പോഴല്ല. ${t(st.text)}`), st.ml, 3); return true; }
    if (st.kind === 'tap') { audio.sfx('tap'); this.doStep(); }
    else if (st.kind === 'taps') { audio.sfx('tap'); this.cooking.n++; haptics.soft(); if (this.cooking.n >= st.n) this.doStep(); }
    else say(pick(st.kind === 'pull' ? 'Up and down, hand over hand.' : st.kind === 'circle' ? 'Round and round with your finger.' : 'Back and forth with your finger.', st.kind === 'pull' ? 'മേലോട്ടും താഴോട്ടും.' : st.kind === 'circle' ? 'വിരൽകൊണ്ട് വട്ടത്തിൽ.' : 'വിരൽകൊണ്ട് അങ്ങോട്ടുമിങ്ങോട്ടും.'), st.ml, 2.5);
    return true;
  }
  down(p0, w0) {
    if (!this.cooking) return super.down(p0, w0);
    const st = this.step(), spot = this.stepSpot(); if (!st || !spot || st.kind === 'tap' || st.kind === 'taps') return false;
    const p = { x: p0.x - this.ox, y: p0.y }; if (Math.hypot(p.x - spot.x, p.y - spot.y) > (spot.r || 30) + 10) return false;
    const self = this, C = this.cooking; let last = { x: p.x, y: p.y }, dir = 0; const sectors = new Set();
    this.gesture = {
      move(q) {
        if (st.kind === 'strokes' || st.kind === 'pull') { const v = st.kind === 'pull' ? q.y - last.y : q.x - last.x, d = Math.sign(v); if (d && d !== dir && Math.abs(v) > 8) { if (dir) { C.n++; audio.sfx(st.at === 'ammikkallu' ? 'grind' : st.at === 'chirava' ? 'scrape' : st.kind === 'pull' ? 'pour' : 'tap', { reps: 1 }); haptics.soft(); if (st.at === 'ammikkallu') self.roller = Math.max(-22, Math.min(22, q.x - 292)); } dir = d; last = { x: q.x, y: q.y }; } }
        else { const a = Math.atan2(q.y - spot.y, q.x - spot.x), sec = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 12) % 12; if (!sectors.has(sec)) { sectors.add(sec); C.n = sectors.size; if (sectors.size % 3 === 0) { audio.sfx('tap'); haptics.soft(); } } }
        if (C.n >= st.n) { self.gesture = null; self.roller = 0; self.doStep(); }
      },
      end() { self.roller = 0; }
    };
    return true;
  }
  drawHotspots(c) {
    if (!this.cooking) return super.drawHotspots(c);
    const spot = this.stepSpot(); if (!spot) return; const pulse = 1 + .12 * Math.sin(this.t * 3);
    c.save(); c.globalAlpha = .9; c.strokeStyle = '#fff6e0'; c.lineWidth = 1.6; c.beginPath(); c.arc(spot.x, spot.y, 14 * pulse, 0, 7); c.stroke(); c.globalAlpha = .5; c.beginPath(); c.arc(spot.x, spot.y, 22 * pulse, 0, 7); c.stroke(); c.restore();
  }
  drawStrip(c, w) {
    const C = this.cooking; if (!C) return; const st = C.steps[C.i], ml = lang() === 'ml', F = ml ? FONT_ML : FONT;
    c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 10; roundRect(c, 14, 108, w - 28, 50, 6, 'rgba(243,234,211,.96)'); c.shadowBlur = 0; c.fillStyle = '#a3522f'; c.fillRect(14, 108, 4, 50);
    text(c, (ml ? C.r.ml : C.r.name) + ' · ' + pick(`step ${C.i + 1} of ${C.steps.length}`, `${C.i + 1}/${C.steps.length}`) + (st.kind !== 'tap' && st.n > 1 ? ` · ${Math.min(C.n, st.n)}/${st.n}` : ''), 26, 121, 10.5, 'rgba(160,60,40,.95)', 'left', F, ml ? '' : 'italic');
    c.font = `${ml ? '' : 'italic '}12.5px ${F}`; const words = (ml ? t(st.text) : st.text).split(' '); let line = '', lines = []; for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (c.measureText(tt).width > w - 86 && line) { lines.push(line); line = wd; } else line = tt; } if (line) lines.push(line);
    text(c, lines[0], 26, 139, 12.5, '#2b2118', 'left', F, ml ? '' : 'italic'); if (lines[1]) text(c, lines[1] + (lines[2] ? '…' : ''), 26, 152, 11, '#2b2118', 'left', F, ml ? '' : 'italic');
    c.strokeStyle = 'rgba(43,33,24,.55)'; c.lineWidth = 1.4; const xx = w - 28, xy = 121; c.beginPath(); c.moveTo(xx - 4, xy - 4); c.lineTo(xx + 4, xy + 4); c.moveTo(xx + 4, xy - 4); c.lineTo(xx - 4, xy + 4); c.stroke(); c.restore();
  }
  // what you took out for the dish, laid along the hearth ledge
  drawIngredients(c) {
    const C = this.cooking; if (!C) return; let x = 32; const y = 426;
    for (const k in C.r.needs) {
      c.save();
      if (k === 'rice' || k === 'flour' || k === 'paddy') { ellipse(c, x, y, 7, 5, k === 'flour' ? '#f1e4c8' : '#e8dcc0'); ellipse(c, x, y - 4, 5, 2, '#d9c9a0'); }
      else if (k === 'coconut') { circle(c, x, y - 2, 6, '#6b4a2a'); ellipse(c, x + 6, y + 2, 5, 3, '#f6f3ea'); }
      else if (k === 'jaggery') { rect(c, x - 6, y - 5, 12, 9, '#5a3a22'); rect(c, x - 6, y - 5, 12, 2, '#7a5a3a'); }
      else if (k === 'banana') { c.strokeStyle = '#e0b43a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(x, y + 2, 7, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      else if (k === 'jackfruit') { ellipse(c, x, y - 1, 7, 5, '#7fa65a'); c.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 6; i++) circle(c, x - 4 + (i % 3) * 4, y - 3 + Math.floor(i / 3) * 4, 1, 'rgba(0,0,0,.15)'); }
      else if (k === 'tapioca') { rect(c, x - 7, y - 2, 14, 4, '#8a5a3a'); rect(c, x - 7, y - 2, 14, 1, '#a67c4a'); }
      else if (k === 'milk') { ellipse(c, x, y, 6, 5, P.brass); ellipse(c, x, y - 5, 4, 1.5, P.brassLt); }
      else if (k === 'fish') { fishShape(c, x, y, .6, '#9fb4c4'); }
      else if (k === 'tea' || k === 'coffee') { rect(c, x - 5, y - 6, 10, 12, 'rgba(230,220,200,.6)'); rect(c, x - 4, y - 1, 8, 6, k === 'tea' ? '#5a3a22' : '#2a1a10'); }
      else if (k === 'oil') { rect(c, x - 3, y - 8, 6, 14, 'rgba(120,160,80,.7)'); rect(c, x - 2, y - 10, 4, 3, '#444'); }
      else if (k === 'vegetables') { rect(c, x - 6, y - 2, 5, 6, '#7fa65a'); rect(c, x, y - 4, 4, 8, '#e07a3a'); circle(c, x + 6, y, 3, '#b35bb3'); }
      else if (k === 'eggs') { ellipse(c, x - 3, y, 3.5, 4.5, '#f6f3ea'); ellipse(c, x + 4, y + 1, 3.5, 4.5, '#f1e4c8'); }
      c.restore(); x += 22;
    }
  }
  pound() {
    if ((state.pantry.rice || 0) < 1) { say('No rice to pound. Kunjappan’s kada has matta rice.', 'അരി ഇല്ല'); return; }
    this.busy = true; audio.sfx('pound', { reps: 5 }); this.grindT = .001;
    tween(this, { pountT: 1 }, 3.6, t => t, () => { state.pantry.rice -= 1; add('flour', 2); this.busy = false; say('Rice pounded to flour in the ural, with the long ulakka. Your shoulders remember.', 'ഉരൽ'); remember('ural', 'Pounded rice in the stone ural with the ulakka. Two women used to do this together, alternating, singing. I did it alone, badly.'); });
  }
  // the ammikkallu: rub the roller back and forth; the paste comes with the strokes
  rub(p) {
    const self = this, ax = 292; if (this.strokes === undefined) { this.strokes = 0; this.paste = 0; }
    let lastX = p.x, dir = 0, moved = 0, start = p.x;
    this.roller = Math.max(-22, Math.min(22, p.x - ax));
    return {
      move(q) {
        moved = Math.max(moved, Math.abs(q.x - start)); self.roller = Math.max(-22, Math.min(22, q.x - ax));
        const d = Math.sign(q.x - lastX); if (d && d !== dir && Math.abs(q.x - lastX) > 6) { if (dir) { self.strokes++; self.paste = Math.min(1, self.strokes / 8); audio.sfx('grind'); haptics.soft(); } dir = d; lastX = q.x; }
        if (self.strokes >= 8) { self.gesture = null; self.roller = 0; self.strokes = 0; state.chammanthi = true; haptics.success(); say('Coconut, green chilli, shallots, a little tamarind. Chammanthi.', 'ചമ്മന്തി'); remember('chammanthi', 'Ground chammanthi on the ammikkallu. The stone is hollowed in the middle from three generations of lunches.'); }
      },
      end() { self.roller = 0; if (moved < 10) say('Rub the roller back and forth across the stone.', 'അമ്മിക്കല്ല്'); }
    };
  }
  ambience() { return {}; }
  tapFree(p) { if (this.catFish() && Math.hypot(p.x - 250, p.y - 600) < 34) { found('cat_fish'); return true; } return false; }
  catFish() { return clock.hour >= 13 && clock.hour < 14 && (state.pantry.fish || 0) > 0; }
  glows() { const g = []; if (clock.daylight < .6) g.push({ x: 326, y: 372, r: 120, a: .7 }); if (state.fire > .1) g.push({ x: 150, y: 470, r: 110 * state.fire + 30, a: .6 * state.fire }); return g; }
  drawStatic(c, w, h) {
    const cx = w / 2;
    // walls: lime below, soot-darkened above
    rect(c, 0, 0, w, 560, vgrad(c, 0, 0, 560, [[0, '#2c2119'], [.35, '#5a4634'], [.6, '#a08a68'], [1, '#c8b48f']]));
    // soot streaks above hearth
    const sg = c.createRadialGradient(150, 380, 20, 150, 380, 200); sg.addColorStop(0, 'rgba(30,20,14,.55)'); sg.addColorStop(1, 'rgba(30,20,14,0)'); c.fillStyle = sg; c.fillRect(0, 100, w, 400);
    // floor: cow-dung plastered, dark olive-brown
    rect(c, 0, 560, w, h - 560, vgrad(c, 0, 560, h, [[0, '#6a5038'], [1, '#3f2e20']]));
    rect(c, 0, 556, w, 6, '#3a2a1c');
    // window with azhi bars (right), green outside
    const wx = 238, wy = 190, ww = 80, wh = 100;
    rect(c, wx - 8, wy - 8, ww + 16, wh + 16, P.teakDk); rect(c, wx, wy, ww, wh, '#2f4a24');
    // leaves outside
    for (let i = 0; i < 14; i++) ellipse(c, wx + hash(i) * ww, wy + hash(i + 9) * wh, 10 + hash(i + 3) * 10, 5 + hash(i + 4) * 4, i % 2 ? '#4f7a3a' : '#6f9a4a', hash(i + 6) * 3);
    c.fillStyle = P.teakLt; for (let i = 0; i < 6; i++) c.fillRect(wx + 6 + i * 13, wy, 4, wh);
    rect(c, wx - 8, wy + wh, ww + 16, 8, P.teak);
    // wall rack with uruli, ladles, sieve
    rect(c, 40, 250, 180, 6, P.teak); for (const x of [60, 120, 180]) line(c, x, 256, x, 266, P.teakDk, 2);
    // uruli (bronze bowl) hanging
    ellipse(c, 70, 300, 26, 10, '#8a6a2a'); ellipse(c, 70, 296, 26, 10, '#b58a38'); ellipse(c, 70, 294, 20, 6, '#d2a650'); line(c, 70, 256, 70, 286, '#c9b48a', 1.2);
    // ladles (thavi)
    for (const [x, l] of [[120, 36], [138, 30]]) { line(c, x, 262, x, 262 + l, P.teakHi, 2.5); ellipse(c, x, 262 + l + 5, 5, 4, P.teakDk); }
    // sieve
    circle(c, 185, 290, 16, P.teakLt); circle(c, 185, 290, 12, '#cdbb90'); c.strokeStyle = 'rgba(80,60,40,.4)'; c.lineWidth = .8; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(173, 290 + i * 4); c.lineTo(197, 290 + i * 4); c.moveTo(185 + i * 4, 278); c.lineTo(185 + i * 4, 302); c.stroke(); }
    // aduppu (clay hearth)
    const hx = 60, hy = 440, hw = 180, hh = 120;
    shadow(c, hx + hw / 2, hy + hh + 6, 110, 16, .4);
    rect(c, hx, hy, hw, hh, vgrad(c, 0, hy, hy + hh, [[0, '#8a4a30'], [1, '#5e3220']]));
    rect(c, hx, hy, hw, 10, '#a65c3c'); // top ledge
    rect(c, hx - 6, hy + hh - 10, hw + 12, 10, '#4a2818');
    // two fire holes on top
    ellipse(c, hx + 52, hy + 5, 24, 8, '#2a1a12'); ellipse(c, hx + 128, hy + 5, 24, 8, '#2a1a12');
    // firewood arch opening at front
    c.fillStyle = '#1e120c'; c.beginPath(); c.moveTo(hx + 50, hy + hh - 10); c.lineTo(hx + 50, hy + 60); c.quadraticCurveTo(hx + 90, hy + 30, hx + 130, hy + 60); c.lineTo(hx + 130, hy + hh - 10); c.fill();
    // chatti (clay pot) on left hole
    ellipse(c, hx + 52, hy - 8, 22, 9, P.clay); ellipse(c, hx + 52, hy - 22, 24, 14, P.clayLt); ellipse(c, hx + 52, hy - 30, 14, 5, P.clay); ellipse(c, hx + 52, hy - 31, 11, 3, '#3a2418');
    ellipse(c, hx + 44, hy - 24, 5, 7, 'rgba(255,220,180,.2)');
    // firewood stack bottom-left
    for (let i = 0; i < 7; i++) { const x = 30 + (i % 4) * 22 + (i > 3 ? 11 : 0), y = 672 - (i > 3 ? 20 : 0); c.save(); c.translate(x, y); c.rotate(-.1 + hash(i) * .2); roundRect(c, -22, -7, 44, 14, 6, i % 2 ? P.teakLt : P.teak); circle(c, 20, 0, 6, '#c9a46a'); circle(c, 20, 0, 3, P.teakLt); c.restore(); }
    // ammikkallu (flat grinding stone) right
    const ax = 292, ay = 672;
    shadow(c, ax, ay + 10, 56, 12, .4);
    poly(c, [[ax - 48, ay - 6], [ax + 48, ay - 6], [ax + 52, ay + 8], [ax - 52, ay + 8]], P.stoneDk);
    poly(c, [[ax - 46, ay - 14], [ax + 46, ay - 14], [ax + 48, ay - 6], [ax - 48, ay - 6]], P.stone);
    ellipse(c, ax, ay - 12, 26, 4, P.stoneLt);
    // chirava (coconut scraper) stool far right
    rect(c, 300, 596, 30, 8, P.teak); rect(c, 302, 604, 5, 26, P.teakDk); rect(c, 323, 604, 5, 26, P.teakDk); circle(c, 298, 594, 5, P.stoneLt); c.strokeStyle = P.stoneDk; c.lineWidth = 1; c.beginPath(); c.arc(298, 594, 5, 0, 7); c.stroke();
    // wall niche with kerosene lamp (chimney lamp)
    rect(c, 308, 350, 40, 50, '#3a2a1e'); rect(c, 310, 352, 36, 46, '#4e3a2a');
    this.lampBody(c, 326, 396);
    // shelf with jars and a steel tumbler
    rect(c, 250, 470, 110, 6, P.teak);
    for (let i = 0; i < 3; i++) { const x = 266 + i * 30; rect(c, x - 9, 446, 18, 24, 'rgba(230,220,200,.45)'); rect(c, x - 9, 444, 18, 4, P.brassDk); rect(c, x - 7, 456, 14, 12, i ? '#c8a050' : '#8b4a2a'); }
    rect(c, 352, 448, 10, 22, '#cfd3d8'); rect(c, 352, 448, 3, 22, '#eef1f3');
    // ural (stone mortar) with ulakka leaning, far right
    const ux = 348, uy = 660; shadow(c, ux, uy + 10, 24, 7, .4); poly(c, [[ux - 18, uy - 30], [ux + 18, uy - 30], [ux + 22, uy + 6], [ux - 22, uy + 6]], P.stoneDk); ellipse(c, ux, uy - 30, 18, 6, P.stone); ellipse(c, ux, uy - 30, 11, 3.5, '#3a3028'); line(c, ux + 10, uy - 34, ux + 26, uy - 120, P.teakLt, 5);
    // puttukutti (bamboo steamer) on a stand by the hearth
    rect(c, 224, 592, 18, 8, P.teakDk); rect(c, 226, 566, 14, 28, '#cdbb90'); rect(c, 226, 566, 14, 3, '#a89a6a'); rect(c, 224, 598, 18, 4, '#3a2a1c'); ellipse(c, 233, 566, 7, 2.5, '#e0d4b0');
    // string of dried red chillies hanging by the window
    line(c, 214, 190, 214, 250, '#c9b48a', 1); for (let i = 0; i < 6; i++) { c.save(); c.translate(214, 200 + i * 9); c.rotate(.4 + (i % 2) * .5); ellipse(c, 0, 6, 2.5, 7, '#b8321c'); c.restore(); }
  }
  lampBody(c, x, base) { rect(c, x - 8, base - 6, 16, 6, P.brassDk); rect(c, x - 6, base - 14, 12, 8, P.brass); rect(c, x - 4, base - 36, 8, 22, 'rgba(255,240,210,.35)'); rect(c, x - 3, base - 36, 1.5, 22, 'rgba(255,255,255,.5)'); }
  tick(dt) {
    const f = state.fire;
    if (f > .1) { this.smokeT += dt; if (this.smokeT > .18 / f) { this.smokeT = 0; smoke(this.ps, 150, 400, f); } if (Math.random() < dt * 3 * f) sparks(this.ps, 150, 445, 1); }
    if (this.boil > .4) steam(this.ps, this.cooking && this.cooking.where !== 'chembu' ? 112 : 168, 400, 1, 6);
    if (state.kaapi && Math.random() < dt * 2) steam(this.ps, 110, 420, 1, 3);
    if (clock.phase === 'uchha' && Math.random() < dt * 2) dust(this.ps, 238, 318, 200, 400, 1);
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = state.fire;
    this.drawIngredients(c);
    // fire inside the arch
    if (f > .02) { const fl = 1 + Math.sin(t * 13) * .1; glow(c, 150, 505, 50 * fl, '#ff8a2a', .5 * f); c.fillStyle = P.flameCore; c.globalAlpha = f; c.beginPath(); c.moveTo(130, 548); c.quadraticCurveTo(135, 520 - 20 * f * fl, 150, 505 - 30 * f * fl); c.quadraticCurveTo(165, 520 - 20 * f * fl, 170, 548); c.fill(); c.fillStyle = P.flame; c.beginPath(); c.moveTo(138, 548); c.quadraticCurveTo(142, 528 - 10 * f * fl, 150, 518 - 18 * f * fl); c.quadraticCurveTo(158, 528 - 10 * f * fl, 162, 548); c.fill(); c.globalAlpha = 1; }
    // embers glow under pots
    if (f > .05) { glow(c, 112, 445, 26, '#ff7a2a', .35 * f); glow(c, 188, 445, 26, '#ff7a2a', .35 * f); }
    // chembu (brass kettle) on right hole, rattles when boiling
    const kx = 188, ky = 432 + (this.boil > .5 ? Math.sin(t * 40) * .6 : 0);
    ellipse(c, kx, ky, 22, 8, P.brassDk); ellipse(c, kx, ky - 14, 23, 14, P.brass); ellipse(c, kx - 6, ky - 18, 6, 8, 'rgba(255,240,200,.3)');
    rect(c, kx - 8, ky - 34, 16, 8, P.brassDk); ellipse(c, kx, ky - 34, 8, 3, P.brassLt);
    c.strokeStyle = P.brassDk; c.lineWidth = 3; c.beginPath(); c.arc(kx, ky - 30, 12, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    line(c, kx + 18, ky - 18, kx + 30, ky - 28, P.brassDk, 4); line(c, kx + 30, ky - 28, kx + 30, ky - 22, P.brassDk, 3);
    // served dish on a vazhayila on the floor
    if (state.served && state.served.id !== 'kaapi' && state.served.id !== 'chaya') { const sx = 190, sy = 640; shadow(c, sx, sy + 6, 46, 8, .3); ellipse(c, sx, sy, 46, 16, '#5f8f3a'); ellipse(c, sx, sy, 42, 13, '#79a848'); line(c, sx - 44, sy, sx + 44, sy, '#4f7a30', 1); const id = state.served.id; if (id === 'sadya') { for (let i = 0; i < 9; i++) ellipse(c, sx - 32 + i * 8, sy - 6 + (i % 2) * 2, 3.5, 2.2, ['#f2c230', '#d8402c', '#f6e7c1', '#7fa65a', '#e07a3a', '#b35bb3', '#f6e7c1', '#c9962e', '#e8dcc0'][i]); ellipse(c, sx + 4, sy + 4, 14, 6, '#f6e7c1'); } else if (id === 'payasam') { ellipse(c, sx, sy, 12, 7, P.brass); ellipse(c, sx, sy - 2, 9, 4, '#f0c8b0'); } else if (id === 'dosa' || id === 'puttu') { ellipse(c, sx, sy - 2, 20, 8, id === 'dosa' ? '#e8c07a' : '#f6e7c1'); if (id === 'puttu') rect(c, sx - 6, sy - 16, 12, 14, '#f6e7c1'); } else if (id === 'pazhampori' || id === 'unniyappam') { for (let i = 0; i < 4; i++) ellipse(c, sx - 15 + i * 10, sy - 2, 5, id === 'unniyappam' ? 4 : 3, id === 'unniyappam' ? '#5a3a22' : '#e0a040'); } else { ellipse(c, sx - 8, sy - 2, 14, 7, id === 'kanji' ? '#f6efe0' : '#c9603a'); ellipse(c, sx + 16, sy, 7, 4, '#9ab060'); } }
    if (state.served && state.served.id === 'chaya') { const gx = 126, gy = 438; rect(c, gx - 6, gy - 18, 12, 18, '#cfd3d8'); rect(c, gx - 5, gy - 16, 10, 12, '#c8955a'); }
    // new chembu gleam and the calendar
    if (state.items.chembu) { ellipse(c, kx - 8, ky - 20, 5, 9, 'rgba(255,255,255,.55)'); }
    if (state.items.calendar) { rect(c, 150, 300, 34, 46, '#e8dcc0'); rect(c, 150, 300, 34, 9, '#b8321c'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) c.fillRect(153 + k * 6, 314 + r * 7, 4, 4); }
    // kaapi glass on ledge
    if (this.cup > 0) { c.save(); c.globalAlpha = this.cup; const gx = 110, gy = 438; shadow(c, gx, gy + 2, 8, 3, .3); rect(c, gx - 6, gy - 18, 12, 18, '#cfd3d8'); rect(c, gx - 6, gy - 18, 2, 18, '#eef1f3'); rect(c, gx - 5, gy - 16, 10, 5, '#5a3a22'); c.restore(); }
    // grinding roller (ammikuzhavi)
    const ax = 292, ay = 672, gk = this.roller || 0;
    roundRect(c, ax - 16 + gk, ay - 26, 32, 14, 7, P.stoneDk); roundRect(c, ax - 16 + gk, ay - 28, 32, 12, 6, P.stone); ellipse(c, ax - 2 + gk, ay - 24, 8, 3, P.stoneLt);
    if (state.chammanthi || this.paste > 0) ellipse(c, ax + 4, ay - 11, state.chammanthi ? 14 : 4 + 10 * this.paste, state.chammanthi ? 4 : 1.5 + 2.5 * this.paste, '#7d8a4a');
    if (this.catFish()) { const t2 = this.t; ellipse(c, 250, 600, 18, 9, '#e4d6bb'); circle(c, 236, 594, 7, '#e4d6bb'); poly(c, [[232, 588], [230, 580], [236, 586]], '#e4d6bb'); poly(c, [[240, 588], [242, 580], [236, 586]], '#e4d6bb'); ellipse(c, 226 + Math.sin(t2 * 6) * 1, 598, 6, 2.4, '#9fb4c4'); }
    // kerosene lamp flame at night
    if (clock.daylight < .6) { const fl = 1 + Math.sin(t * 15) * .07; glow(c, 326, 374, 30, '#ffb050', .45); c.fillStyle = P.flame; c.beginPath(); c.moveTo(324, 384); c.quadraticCurveTo(323, 374 * 1, 326, 368 - 4 * fl); c.quadraticCurveTo(329, 374, 328, 384); c.fill(); }
    // light rays through window at morning
    if (clock.phase === 'ravile' || clock.phase === 'uchha') { c.save(); c.globalAlpha = .12 * clock.daylight; c.fillStyle = '#fff2c0'; c.beginPath(); c.moveTo(238, 190); c.lineTo(318, 190); c.lineTo(230, 560); c.lineTo(100, 560); c.fill(); c.restore(); }
    // the kudam by the hearth, and the leaf to serve on while cooking
    { const kx = 56, ky = 592; shadow(c, kx, ky + 2, 14, 4, .3); ellipse(c, kx, ky - 10, 12, 11, P.clay); ellipse(c, kx - 4, ky - 13, 4, 5, 'rgba(255,220,180,.25)'); rect(c, kx - 6, ky - 22, 12, 4, P.clayLt); if (state.potFull) ellipse(c, kx, ky - 22, 5, 1.6, 'rgba(120,160,175,.8)'); }
    if (this.cooking && this.step().at === 'serve' && !(state.served && state.served.day === clock.day)) { shadow(c, 190, 646, 46, 8, .3); ellipse(c, 190, 640, 46, 16, '#5f8f3a'); ellipse(c, 190, 640, 42, 13, '#79a848'); }
    this.drawStrip(c, Math.min(w, 430));
  }
}
function smoke(ps, x, y, f) {
  ps.emit(1, () => ({ x: x + rnd(-14, 14), y, vx: rnd(-4, 4), vy: rnd(-28, -16), life: rnd(3, 5), max: 5, r: rnd(5, 9), g: -3,
    update(p, dt) { p.vx += rnd(-6, 6) * dt; },
    draw(c, p) { const k = p.life / p.max; c.globalAlpha = k * .22 * f; c.fillStyle = '#d8d0c4'; c.beginPath(); c.arc(p.x, p.y, Math.max(.1, p.r + (p.max - p.life) * 5), 0, 7); c.fill(); c.globalAlpha = 1; } }));
}
