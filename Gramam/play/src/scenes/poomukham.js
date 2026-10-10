import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm, tileRoof, bananaPlant } from '../art/draw.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { outCubic, inOut, rnd, hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { drawCat, catTap } from '../game/cat.js';
import { drops, fireflies, dust } from '../engine/particles.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { pickupStep } from '../game/visitors.js';
import { readNextLetter } from '../ui/letter.js';
import { map } from '../ui/map.js';
import { note } from '../game/state.js';
import { raviAtHome } from '../game/arc.js';
import { person } from '../art/lib.js';
import { haptics } from '../engine/haptics.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { has } from '../game/people.js';

export class Poomukham extends Scene {
  constructor() {
    super('poomukham', 'Poomukham', 'പൂമുഖം');
    this.horizon = 330; this.outdoor = true; this.ground = P.earth;
    this.flame = state.lamp ? 1 : 0; this.bucket = 0; this.readT = 0; this.ffT = 0;
    this.hotspots = [
      { x: 262, y: 418, r: 34, label: 'nilavilakku', enabled: () => !state.lamp, hint: () => clock.hour >= 17 || clock.hour < 6, action: () => this.lightLamp() },
      { x: 132, y: 476, r: 42, label: 'charupadi', action: () => this.readPaper() },
      { x: 160, y: 470, r: 26, label: 'letter', enabled: () => state.unread > 0, action: () => { this.idle = 0; readNextLetter(); } },
      { x: 92, y: 612, r: 36, label: 'thulasi', action: () => this.waterThulasi() },
      { x: 296, y: 598, r: 52, label: 'kinar', drag: p => this.pullRope(p), action: () => {} },
      { x: 190, y: 652, r: 56, label: 'pookalam', enabled: () => fest().onam && state.festival.pookalamDay !== clock.day, drag: p => this.layPetals(p), action: () => {} },
    ];
    this.exits = [{ x: 188, y: 340, side: 'top', label: 'Akam · inside', go: () => router.go('nadumuttam') }, { side: 'right', y: 500, label: 'Thodi', go: () => router.go('thodi') }, { side: 'bottom', label: 'Idavazhi · village', go: () => { map.open = true; } }];
  }
  enter() { super.enter(); this.flame = state.lamp ? 1 : 0; setTimeout(pickupStep, 800); }
  pookalam() {
    const f = fest(); state.festival.pookalam = Math.min(10, Math.max(state.festival.pookalam + 1, f.onamDay)); state.festival.pookalamDay = clock.day; audio.sfx('chime');
    say(f.thiruvonam ? 'The pookalam is complete. Ten rings, thumba at the centre. Maveli will approve.' : pick(`Ring ${state.festival.pookalam}. Thetti, chembarathi, thumba, konna, in a circle on the muttam.`, `${state.festival.pookalam}-ാം വട്ടം. തെറ്റി, ചെമ്പരത്തി, തുമ്പ, കൊന്ന, മുറ്റത്ത് ഒരു വട്ടത്തിൽ.`), 'പൂക്കളം');
    remember('pookalam', 'Started the pookalam on Atham with a single ring of thumba, the way the house has done it for longer than anyone remembers.');
    if (f.thiruvonam) remember('thiruvonam', 'Thiruvonam. Pookalam complete, sadya on the leaf, lamp lit. For one evening the house was as full as it used to be.');
  }
  ambience() { return {}; }
  visitorSpot(w) { return { x: 236, y: 704 }; } // on the path, clear of the well
  // ---------- interactions ----------
  lightLamp() {
    this.busy = true; audio.sfx('match');
    delay(.7, () => { state.lamp = true; state.lampLitDay = clock.day; tween(this, { flame: 1 }, 1.2, outCubic, () => { this.busy = false; });
      say('The nilavilakku is lit. The house exhales.', 'നിലവിളക്ക് തെളിഞ്ഞു');
      remember('lamp', 'Lit the nilavilakku at the pillar, the way it has been lit every evening in this house for a hundred years.'); });
  }
  readPaper() {
    this.busy = true; this.readT = 0; clock.speed = 18; audio.sfx('page');
    say('You sit on the charupadi with the Mathrubhumi. The day drifts past.', 'ചാരുപടി · മാതൃഭൂമി', 5);
    delay(1.8, () => audio.sfx('page')); delay(3.6, () => audio.sfx('page'));
    tween(this, { readT: 1 }, 5.5, t => t, () => { clock.speed = 1; this.busy = false; state.paperRead = true; remember('paper', 'Read the Mathrubhumi on the charupadi until the letters swam. Nothing in it mattered more than the breeze.'); });
  }
  waterThulasi() {
    if (state.thulasiWater > .8 && !state.finds.thulasi_flower) { found('thulasi_flower'); return; }
    if (!state.potFull) { say('The kudam is empty. Draw water from the kinar first.', 'കുടം ഒഴിഞ്ഞു'); return; }
    this.busy = true; audio.sfx('pour'); state.potFull = false;
    const ps = this.ps; let n = 0; const iv = setInterval(() => { drops(ps, 92, 575, 4); if (++n > 9) clearInterval(iv); }, 100);
    delay(1.3, () => { state.thulasiWater = 1; state.thulasiGrowth = Math.min(1, (state.thulasiGrowth || 0) + .08); did('thulasi'); this.busy = false; say('You water the thulasi. A few drops catch the light.', 'തുളസിത്തറ'); remember('thulasi', 'Watered the thulasi on the thara. Three times around it, the way Ammamma did, without quite knowing why.'); });
  }
  // the kinar: pull the rope down to drop the bucket, then hand over hand back up. A tap just tells you so.
  pullRope(p) {
    if (!this.pull) this.pull = { phase: 'down', b: this.bucket || 0 };
    const P = this.pull, start = { x: p.x, y: p.y, b: P.b }, self = this; let moved = 0, lastCreak = 0, lastY = p.y;
    return {
      move(q) {
        moved = Math.max(moved, Math.hypot(q.x - start.x, q.y - start.y));
        if (P.phase === 'down') { self.bucket = Math.max(0, Math.min(1, start.b + (q.y - start.y) / 110)); if (self.bucket >= 1) { P.phase = 'up'; audio.sfx('splash'); haptics.medium(); start.y = q.y; start.b = 1; } }
        else { self.bucket = Math.max(0, Math.min(1, start.b - (start.y - q.y) / 130)); }
        if (Math.abs(q.y - lastY) > 22) { lastY = q.y; if (performance.now() - lastCreak > 260) { lastCreak = performance.now(); audio.sfx('creak'); haptics.soft(); } }
        P.b = self.bucket;
        if (P.phase === 'up' && self.bucket <= 0) { self.pull = null; state.potFull = true; did('water'); haptics.success(); say('Cold water from the kinar, pulled up hand over hand.', 'കിണർ'); remember('kinar', 'Drew water from the kinar. The pulley still complains in the same two notes it did when I was small.'); self.gesture = null; }
      },
      end() {
        if (moved < 10) { say(P.phase === 'down' ? 'Pull the rope down to drop the bucket, then draw it back up.' : 'Now pull the rope up, hand over hand.', 'കയർ വലിക്കുക'); return; }
        if (P.phase === 'down' && self.pull) { const b = self.bucket; tween(self, { bucket: 0 }, .5 * b + .1, outCubic); P.b = 0; }
      }
    };
  }
  // the pookalam: lay the ring with your finger, round the circle on the muttam
  layPetals(p) {
    const f = fest(), n = state.festival.pookalam, r = 10 + n * 7, cx = 190, cy = 652, self = this;
    const cols = ['#f2c230', '#d8402c', '#f6e7c1', '#e07a3a', '#b35bb3', '#f2c230', '#ffffff', '#d8402c', '#7fa65a', '#f2c230'];
    if (!this.petals || this.petalRing !== n) { this.petals = []; this.petalRing = n; this.sectors = new Set(); }
    let moved = 0, start = { x: p.x, y: p.y };
    const lay = q => { const a = Math.atan2((q.y - cy) / .45, q.x - cx), sec = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 16) % 16; if (!self.sectors.has(sec)) { self.sectors.add(sec); for (let k = 0; k < 3; k++) self.petals.push({ a: a + (k - 1) * .12, r: r + (k - 1) * 1.5, c: cols[n % cols.length] }); if (self.sectors.size % 2 === 0) { audio.sfx('tap'); haptics.soft(); } }
      if (self.sectors.size >= 14) { self.gesture = null; self.petals = null; self.pookalam(); } };
    return {
      move(q) { moved = Math.max(moved, Math.hypot(q.x - start.x, q.y - start.y)); if (Math.hypot(q.x - cx, (q.y - cy) / .45) < r + 40) lay(q); },
      end() { if (moved < 10) say(f.thiruvonam ? 'The last ring. Lay the flowers round the circle with your finger.' : 'Lay the flowers in a ring with your finger, round the muttam.', 'പൂക്കളം'); }
    };
  }
  tap(p, w, h) { if (!this.busy && this.catHere() && Math.hypot(p.x - this.catPos().x, p.y - this.catPos().y) < 30) { catTap(); this.idle = 0; return true; } return super.tap(p, w, h); }
  tapFree(p) { if (clock.phase === 'rathri') { for (const f of this.ps.list) if (f.ph !== undefined && Math.hypot(p.x - f.x, p.y - f.y) < 18) { found('firefly'); return true; } if (this.civetX !== undefined && Math.abs(p.x - this.civetX) < 30 && Math.abs(p.y - 160) < 24) { found('civet'); return true; } } return false; }
  catHere() { return clock.phase === 'uchha' || clock.phase === 'ravile'; }
  catPos() { return state.rainT > .3 ? { x: 150, y: 546 } : { x: 134, y: 478 }; }
  glows() { const g = state.lamp ? [{ x: 262, y: 408, r: 230, a: .95 }, { x: 262, y: 408, r: 90, a: .6 }, { x: 262, y: 530, r: 120, a: .35 }] : []; if (state.items.petromax && clock.daylight < .5) g.push({ x: 60, y: 300, r: 260, a: 1 }); return g; }
  // ---------- static art ----------
  drawStatic(c, w, h) {
    const cx = w / 2;
    // far: paddy and treeline behind house
    rect(c, 0, 300, w, 70, vgrad(c, 0, 300, 370, [[0, '#9fc27a'], [1, P.paddy]]));
    c.fillStyle = P.cocoDeep; for (let i = 0; i < 14; i++) { const x = hash(i + 3) * w, r = 14 + hash(i + 8) * 18; ellipse(c, x, 318, r, r * .7, P.cocoDeep); }
    // coconut palms behind the roof
    palm(c, 40, 340, 110, 22, 1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    palm(c, w - 60, 340, 95, -18, 1.1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    palm(c, w - 20, 350, 150, -10, .8, [P.teakLt, P.teakDk, P.cocoDeep, P.cocoDk]);
    bananaPlant(c, 24, 400, .8, P.cocoDk, P.cocoLt);
    // roof: tiled, with ridge and slope
    poly(c, [[-10, 262], [w + 10, 262], [w + 10, 170], [cx + 140, 150], [cx - 140, 150], [-10, 170]], P.tile);
    tileRoof(c, -10, 172, w + 20, 88, P.tile, P.tileLt, P.tileDk);
    poly(c, [[cx - 142, 152], [cx + 142, 152], [cx + 150, 158], [cx - 150, 158]], P.tileDk);
    // roof shadow line / eave
    rect(c, -10, 258, w + 20, 7, P.teakDk);
    rect(c, -10, 265, w + 20, 22, 'rgba(40,22,10,.55)');
    // wall (lime-washed) under eave
    rect(c, 0, 265, w, 275, vgrad(c, 0, 265, 540, [[0, P.limeShade], [.25, P.lime], [1, P.limeDk]]));
    // dado band (laterite)
    rect(c, 0, 470, w, 70, P.laterite); rect(c, 0, 470, w, 4, P.lateriteDk);
    // door (double, teak, brass studs)
    const dx = cx - 30, dy = 300, dw = 60, dh = 220;
    rect(c, dx - 8, dy - 8, dw + 16, dh + 8, P.teakDk); rect(c, dx, dy, dw, dh, P.teak);
    rect(c, dx, dy, dw / 2 - 1, dh, P.teakLt); rect(c, dx + dw / 2 + 1, dy, dw / 2 - 1, dh, P.teak);
    c.fillStyle = P.teakDk; for (let r = 0; r < 4; r++) { c.fillRect(dx + 4, dy + 14 + r * 52, dw / 2 - 9, 38); c.fillRect(dx + dw / 2 + 5, dy + 14 + r * 52, dw / 2 - 9, 38); }
    c.fillStyle = P.brass; for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { circle(c, dx + 8 + k * 14, dy + 10 + r * 52, 1.6, P.brassLt); circle(c, dx + dw / 2 + 9 + k * 14, dy + 10 + r * 52, 1.6, P.brassLt); }
    circle(c, dx + dw / 2 - 5, dy + 120, 3, P.brassLt); circle(c, dx + dw / 2 + 5, dy + 120, 3, P.brassLt);
    // thoranam (mango leaf garland) above door
    c.strokeStyle = P.cocoDk; c.lineWidth = 1.5; c.beginPath(); c.moveTo(dx - 14, dy - 14); c.quadraticCurveTo(cx, dy - 2, dx + dw + 14, dy - 14); c.stroke();
    for (let i = 0; i < 9; i++) { const t = i / 8, x = dx - 14 + t * (dw + 28), y = dy - 14 + Math.sin(t * Math.PI) * 10; ellipse(c, x, y + 7, 3, 7, i % 2 ? P.coco : P.cocoDk); }
    // verandah floor (red oxide), plinth, steps
    rect(c, 0, 520, w, 24, '#7a2e22'); rect(c, 0, 520, w, 3, '#9a4434');
    rect(c, 0, 544, w, 22, P.lateriteDk);
    for (let i = 0; i < 3; i++) { rect(c, cx - 48 + i * 4, 544 + i * 18, 96 - i * 8, 18, i % 2 ? P.laterite : P.lateriteLt); rect(c, cx - 48 + i * 4, 544 + i * 18, 96 - i * 8, 2, '#d88a68'); }
    // pillars (teak, square with carved capital)
    for (const px of [72, cx - 72, cx + 72, w - 72]) {
      rect(c, px - 9, 268, 18, 256, vgrad(c, 0, 268, 524, [[0, P.teakLt], [1, P.teak]]));
      rect(c, px - 9, 268, 5, 256, P.teakHi); rect(c, px + 4, 268, 5, 256, P.teakDk);
      poly(c, [[px - 14, 268], [px + 14, 268], [px + 11, 282], [px - 11, 282]], P.teakDk);
      rect(c, px - 12, 508, 24, 16, P.teakDk);
      // soft contact shadow of pillar on wall
      rect(c, px + 9, 282, 8, 226, 'rgba(60,30,10,.12)');
    }
    // charupadi: long low bench along the verandah edge between the left pillars, slatted backrest sloping back
    const bx = 84, by = 486, bw = 96;
    // backrest: slanted frame of vertical slats, seen from the front, leaning away
    poly(c, [[bx + 4, by], [bx + bw - 4, by], [bx + bw - 10, by - 46], [bx + 10, by - 46]], 'rgba(40,20,8,.18)'); // its shadow on wall
    for (let i = 0; i < 7; i++) { const t0 = i / 7, t1 = (i + .55) / 7; poly(c, [[bx + 4 + t0 * (bw - 8), by], [bx + 4 + t1 * (bw - 8), by], [bx + 10 + t1 * (bw - 20), by - 48], [bx + 10 + t0 * (bw - 20), by - 48]], i % 2 ? P.teakLt : P.teakHi); }
    rect(c, bx + 8, by - 50, bw - 16, 5, P.teakDk); // top rail
    // seat plank and apron
    rect(c, bx - 2, by, bw + 4, 9, P.teakHi); rect(c, bx - 2, by + 9, bw + 4, 4, P.teakDk);
    rect(c, bx + 2, by + 13, bw - 4, 22, P.teak); rect(c, bx + 2, by + 13, bw - 4, 2, P.teakLt);
    rect(c, bx + 2, by + 35, 8, 10, P.teakDk); rect(c, bx + bw - 10, by + 35, 8, 10, P.teakDk);
    // newspaper folded on bench
    c.save(); c.translate(bx + 70, by - 2); c.rotate(-.08); rect(c, -16, -6, 32, 10, P.paper); rect(c, -16, -6, 32, 1.5, '#d9ccad'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let i = 0; i < 4; i++) c.fillRect(-13, -3 + i * 2, 20 - i * 3, .8); c.restore();
    // nilavilakku (brass lamp) right of door
    this.drawLampBody(c, 262, 522);
    // yard ground
    rect(c, 0, 566, w, h - 566, vgrad(c, 0, 566, h, [[0, P.earthLt], [.5, P.earth], [1, P.earthDk]]));
    // path of worn earth to steps
    ellipse(c, cx, 700, 90, 70, 'rgba(255,230,190,.14)');
    // scattered leaves and pebbles
    for (let i = 0; i < 26; i++) { const x = hash(i + 50) * w, y = 580 + hash(i + 70) * 210; ellipse(c, x, y, 3 + hash(i) * 3, 1.3 + hash(i + 1) * 1.2, i % 3 ? 'rgba(90,60,30,.35)' : 'rgba(150,120,60,.4)', hash(i + 5) * 3); }
    // thulasi thara (pedestal)
    const tx = 92, ty = 640;
    shadow(c, tx, ty + 40, 46, 14, .3);
    poly(c, [[tx - 30, ty], [tx + 30, ty], [tx + 34, ty + 46], [tx - 34, ty + 46]], P.laterite);
    poly(c, [[tx - 30, ty], [tx + 30, ty], [tx + 24, ty - 10], [tx - 24, ty - 10]], P.lime);
    rect(c, tx - 34, ty + 36, 68, 10, P.lateriteDk); rect(c, tx - 26, ty + 4, 52, 3, P.lateriteLt);
    // little chalk kolam marks
    c.strokeStyle = 'rgba(255,245,225,.6)'; c.lineWidth = 1; c.beginPath(); c.arc(tx, ty + 22, 8, 0, 7); c.moveTo(tx - 14, ty + 22); c.lineTo(tx + 14, ty + 22); c.stroke();
    // kinar (well) with pulley frame
    const kx = 296, ky = 650;
    shadow(c, kx, ky + 36, 60, 16, .3);
    ellipse(c, kx, ky + 26, 46, 14, P.lateriteDk);
    rect(c, kx - 46, ky - 6, 92, 32, P.laterite);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) rect(c, kx - 44 + i * 19 + (r % 2) * 9, ky - 4 + r * 10, 16, 8, r % 2 ? P.lateriteLt : P.laterite);
    ellipse(c, kx, ky - 6, 46, 14, P.lateriteLt); ellipse(c, kx, ky - 6, 36, 10, '#2a1d14');
    // frame posts and crossbar
    rect(c, kx - 40, ky - 110, 6, 104, P.teak); rect(c, kx + 34, ky - 110, 6, 104, P.teak);
    rect(c, kx - 44, ky - 114, 88, 6, P.teakDk);
    // pulley wheel
    circle(c, kx, ky - 100, 9, P.teakDk); circle(c, kx, ky - 100, 6, P.teakLt); circle(c, kx, ky - 100, 1.5, P.teakDk);
    // kudam (clay water pot) beside well
    const px = kx + 58, py = ky + 22; shadow(c, px, py + 2, 16, 5, .3);
    ellipse(c, px, py - 10, 13, 12, P.clay); ellipse(c, px - 4, py - 13, 5, 6, 'rgba(255,220,180,.25)'); rect(c, px - 7, py - 24, 14, 5, P.clayLt); ellipse(c, px, py - 24, 7, 2.5, P.clay);
    // small plants near the wall base
    for (const [x, s] of [[20, .6], [w - 24, .7]]) bananaPlant(c, x, 600, s, P.cocoDk, P.coco);
    for (let i = 0; i < 9; i++) { const x = 8 + i * (w / 9) + hash(i + 20) * 20; if (Math.abs(x - cx) < 70) continue; const y = 566; c.strokeStyle = i % 2 ? P.coco : P.cocoDk; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (k - 2) * 4, y - 8, x + (k - 2) * 7, y - 12 - hash(i + k) * 6); c.stroke(); } }
  }
  drawLampBody(c, x, base) {
    // tiered brass nilavilakku on a stand
    shadow(c, x, base + 2, 22, 6, .35);
    ellipse(c, x, base - 4, 20, 6, P.brassDk); ellipse(c, x, base - 7, 18, 5, P.brass);
    rect(c, x - 3, base - 110, 6, 104, P.brass); rect(c, x - 3, base - 110, 2, 104, P.brassLt);
    for (const [yy, r] of [[-30, 10], [-60, 8], [-88, 7]]) { ellipse(c, x, base + yy, r, 3, P.brassDk); ellipse(c, x, base + yy - 2, r, 3, P.brassLt); }
    // top oil bowl with 5 wick spouts
    ellipse(c, x, base - 112, 15, 5, P.brassDk); ellipse(c, x, base - 114, 15, 5, P.brass); ellipse(c, x, base - 116, 10, 3, P.brassLt);
    circle(c, x, base - 128, 3, P.brassLt); rect(c, x - 1, base - 126, 2, 10, P.brass);
  }
  // ---------- dynamic ----------
  tick(dt) {
    if (clock.phase === 'rathri' && state.rainT < .2) { this.ffT += dt; if (this.ffT > .5) { this.ffT = 0; fireflies(this.ps, 20, 340, 560, 720, 1); } }
    if (clock.phase === 'uchha' && state.rainT < .2 && Math.random() < dt * 1.5) dust(this.ps, 60, 320, 280, 520, 1);
  }
  drawDynamic(c, w, h) {
    const t = this.t, cx = w / 2;
    // thulasi plant (droops when dry)
    const tx = 92, ty = 640, hy = state.thulasiWater, droop = (1 - hy) * 10, grow = 1 + .4 * (state.thulasiGrowth || 0);
    c.save(); c.translate(tx, ty - 10); c.scale(grow, grow); c.lineCap = 'round';
    c.strokeStyle = P.cocoDk; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(0, -18, Math.sin(t) * 1.5, -34 + droop); c.stroke();
    for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, yy = -8 - i * 2.8, sway = Math.sin(t * 1.5 + i) * 1.2; const col = hy > .4 ? (i % 3 ? P.coco : P.cocoLt) : (i % 3 ? '#7f8a4a' : '#9a9a55'); ellipse(c, side * (7 + (i % 3) * 2) + sway, yy + droop * (i / 10), 6, 3, col, side * -.5 + droop * .05); }
    circle(c, Math.sin(t) * 1.5, -36 + droop, 2.2, '#b36ba0');
    c.restore();
    // bucket on rope
    const kx = 296, ky = 650, drop = this.bucket * 70, sw = Math.sin(t * 2.2) * (this.busy ? 1.5 : 0);
    line(c, kx, ky - 100, kx + 2 + sw, ky - 60 + drop, '#c9b48a', 1.5);
    line(c, kx - 6, ky - 109, kx, ky - 100, '#c9b48a', 1.2); line(c, kx - 6, ky - 109, kx - 37, ky - 109, '#c9b48a', 1.2);
    if (this.bucket < .85) { const bxx = kx + 2 + sw, byy = ky - 60 + drop; c.save(); c.beginPath(); c.rect(kx - 36, ky - 130, 72, 124); c.clip(); line(c, bxx - 7, byy, bxx + 7, byy, P.brassDk, 1.5); poly(c, [[bxx - 8, byy], [bxx + 8, byy], [bxx + 6, byy + 14], [bxx - 6, byy + 14]], P.brass); rect(c, bxx - 8, byy, 16, 2, P.brassLt); c.restore(); }
    // flame
    if (this.flame > 0) {
      const x = 262, y = 522 - 118, f = this.flame;
      const fl = 1 + Math.sin(t * 11) * .08 + Math.sin(t * 23) * .04;
      c.save(); c.globalAlpha = f;
      glow(c, x, y - 4, 54, '#ff9a2a', .35); glow(c, x, y - 4, 22, '#ffd27a', .45);
      c.fillStyle = P.flame; c.beginPath(); c.moveTo(x - 3.5, y + 2); c.quadraticCurveTo(x - 4, y - 8 * fl, x + Math.sin(t * 9) * .8, y - 15 * fl); c.quadraticCurveTo(x + 4, y - 8 * fl, x + 3.5, y + 2); c.fill();
      c.fillStyle = P.flameHi; c.beginPath(); c.moveTo(x - 1.6, y + 1); c.quadraticCurveTo(x - 1.6, y - 4 * fl, x, y - 8 * fl); c.quadraticCurveTo(x + 1.6, y - 4 * fl, x + 1.6, y + 1); c.fill();
      c.restore();
    }
    // petromax hanging from the eave on the left, lit after dark
    if (state.items.petromax) { line(c, 60, 265, 60, 290, '#888', 1); rect(c, 52, 290, 16, 5, '#777'); rect(c, 54, 295, 12, 18, 'rgba(230,240,250,.45)'); rect(c, 50, 313, 20, 8, '#8a8a8a'); if (clock.daylight < .5) { glow(c, 60, 304, 60, '#fff2c0', .6); circle(c, 60, 304, 4, '#ffffff'); } }
    // reading: newspaper rises and tilts
    if (this.readT > 0 && this.readT < 1) { const k = Math.sin(this.readT * Math.PI); c.save(); c.translate(142, 420 - k * 18); c.rotate(-.25 * k); roundRect(c, -20, -14, 40, 28, 1, P.paper); c.fillStyle = 'rgba(43,33,24,.45)'; for (let i = 0; i < 7; i++) c.fillRect(-16, -9 + i * 3.4, 32 - (i % 3) * 6, 1); c.fillRect(-16, -11, 32, 1.6); c.restore(); }
    // pookalam on the muttam during Onam
    if (fest().onam && state.festival.pookalam > 0) {
      const n = state.festival.pookalam, px = cx, py = 652; const cols = ['#f2c230', '#d8402c', '#f6e7c1', '#e07a3a', '#b35bb3', '#f2c230', '#ffffff', '#d8402c', '#7fa65a', '#f2c230'];
      for (let i = n - 1; i >= 0; i--) { const r = 10 + i * 7; c.save(); c.scale(1, .45); c.fillStyle = cols[i]; c.beginPath(); c.arc(px, py / .45, r, 0, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < r * 1.2; k++) { const a = k / (r * 1.2) * 6.283; c.beginPath(); c.arc(px + Math.cos(a) * (r - 2), py / .45 + Math.sin(a) * (r - 2), 1.2, 0, 7); c.fill(); } c.restore(); }
      c.save(); c.scale(1, .45); circle(c, px, py / .45, 5, '#f6e7c1'); c.restore();
    }
    if (fest().onam && this.petals && this.petals.length) { const px = cx, py = 652; c.save(); c.scale(1, .45); for (const q of this.petals) { c.fillStyle = q.c; c.beginPath(); c.arc(px + Math.cos(q.a) * q.r, py / .45 + Math.sin(q.a) * q.r, 2.2, 0, 7); c.fill(); } c.restore();
      if (fest().thiruvonam) { /* a tiny clay Maveli (thrikkakara appan) */ poly(c, [[px - 6, py - 8], [px + 6, py - 8], [px + 4, py - 22], [px - 4, py - 22]], P.clay); circle(c, px, py - 24, 3, P.clayLt); }
    }
    // Ravi home on leave: on the charupadi in the evenings for two months
    if (raviAtHome() && clock.hour >= 16 && clock.hour < 22) { person(c, 112, 490, .95, { sex: 'm', top: '#2a3a8a', mundu: '#f3ecd8', pose: 'sit', skin: '#a9744f', item: 'paper' }, t); }
    // a civet on the roof ridge, late at night
    if (clock.hour >= 22 || clock.hour < 4) { this.civetX = 60 + ((t * 9) % 260); const vx = this.civetX; c.fillStyle = '#2a2420'; ellipse(c, vx, 160, 14, 5, '#2a2420'); circle(c, vx + 13, 157, 4, '#2a2420'); c.strokeStyle = '#2a2420'; c.lineWidth = 3; c.beginPath(); c.moveTo(vx - 13, 160); c.quadraticCurveTo(vx - 26, 150 + Math.sin(t * 3) * 3, vx - 34, 158); c.stroke(); c.fillStyle = '#e8ffb0'; c.fillRect(vx + 14, 156, 1.5, 1.5); } else this.civetX = undefined;
    // what the year leaves on the house: Ammini's chembarathi by the step, the children's kite on the roof, Ravi's letters tied with thread and his cassette player on the charupadi, the borrowed book
    if (has('ammini', 'cutting')) { const px = 236, py = 580; poly(c, [[px - 10, py - 14], [px + 10, py - 14], [px + 8, py], [px - 8, py]], P.clay); rect(c, px - 11, py - 16, 22, 3, P.clayLt); c.strokeStyle = P.cocoDk; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(px, py - 14); c.quadraticCurveTo(px + (i - 1.5) * 8, py - 30, px + (i - 1.5) * 12, py - 40 - (i % 2) * 6); c.stroke(); ellipse(c, px + (i - 1.5) * 12, py - 40 - (i % 2) * 6, 5, 3, i % 2 ? P.coco : P.cocoLt, (i - 1.5) * .4); } circle(c, px + 6, py - 36, 4, '#d8402c'); circle(c, px + 6, py - 36, 1.4, '#f5c84a'); }
    if (has('kids', 'kiteroof')) { const kx = 300, ky = 200; poly(c, [[kx, ky - 10], [kx + 8, ky], [kx, ky + 10], [kx - 8, ky]], '#f1e4c8'); line(c, kx, ky + 10, kx - 10 + Math.sin(t * 3) * 3, ky + 26, '#c8322a', 1.2); }
    if (state.lettersRead >= 2) { const n = Math.min(10, state.lettersRead), lx = 108, ly = 484; for (let i = 0; i < n; i++) rect(c, lx - 10 + (i % 2), ly - 2 - i * 1.2, 20, 1.6, i % 2 ? '#e8dcc0' : '#f4ecd8'); line(c, lx - 10, ly - n * 1.2, lx + 10, ly - 2, '#c8322a', .8); }
    if (state.raviHome >= 0 && !raviAtHome()) { rect(c, 150, 478, 16, 9, '#2a2a30'); rect(c, 152, 480, 5, 4, '#9fc2cc'); rect(c, 159, 480, 5, 4, '#9fc2cc'); circle(c, 162, 487, 1.2, '#c8322a'); }
    if (state.bookBorrowed !== null && state.bookBorrowed !== undefined) { rect(c, 118, 480, 14, 7, '#8a2a1c'); rect(c, 118, 480, 14, 1.5, '#e8dcc0'); }
    // cat
    if (this.catHere()) { const cp = this.catPos(); drawCat(c, cp.x, cp.y, t, 1); }
    // doorway darkness suggests depth
    const g = c.createLinearGradient(0, 300, 0, 520); g.addColorStop(0, 'rgba(20,10,5,.0)'); g.addColorStop(1, 'rgba(20,10,5,.0)');
  }
}
