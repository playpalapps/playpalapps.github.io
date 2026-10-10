import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm, tileRoof } from '../art/draw.js';
import { banyan, person, elephant, lateriteWall, grassTuft } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash, rnd } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { haptics } from '../engine/haptics.js';

export class Ambalam extends Scene {
  constructor() {
    super('ambalam', 'Ambalam', 'അമ്പലം'); this.horizon = 330; this.ground = '#8fb05a'; this.fireworks = []; this.lampsLit = 0; this.fwT = 0;
    this.hotspots = [
      { x: 215, y: 470, r: 50, label: 'sreekovil', action: () => this.pray() },
      { x: 120, y: 480, r: 60, label: 'deepastambham', enabled: () => (clock.hour >= 17.5 || clock.hour < 6) && this.lampsLit < 1, drag: p => this.lightTiers(p), action: () => {} },
      { x: 320, y: 560, r: 34, label: 'mani', action: () => { audio.sfx('bell', { dist: .5 }); say('You ring the temple bell once. Pigeons lift from the roof.', 'മണി'); } },
      { x: 215, y: 500, r: 40, label: 'vilakku · light the lamps', enabled: () => (clock.hour >= 17 || clock.hour < 7) && (state.today.vilakku || 0) < 5, action: () => this.smallLamp() },
      { x: 300, y: 486, r: 26, label: 'thenga · break a coconut', enabled: () => state.today.thenga !== true && (state.pantry.coconut || 0) > 0, action: () => this.coconut() },
      { x: 60, y: 420, r: 46, label: 'arayal', action: () => this.sit() },
      { x: 300, y: 660, r: 40, label: 'prasadam', enabled: () => state.templeDay === clock.day, action: () => { audio.sfx('chime'); say('Chandanam on the forehead, a pinch of kumkumam, a leaf of payasam. The priest asks after Ravi.', 'പ്രസാദം'); remember('prasadam', 'Prasadam from the ambalam: sandal paste cool on the forehead, payasam in a leaf. The priest is the son of the old priest and has the same ears.'); } },
    ];
    this.exits = [{ side: 'bottom', label: 'Idavazhi · home', go: () => router.go('poomukham') }, { side: 'left', y: 520, label: 'Kaavu', go: () => router.go('kaavu') }];
  }
  enter() { super.enter(); const f = fest(); if (f.wedding && clock.hour >= 9 && clock.hour < 13) { setTimeout(() => { say('A wedding at the ambalam: the thali tied in four seconds, the sadya for four hundred. Somebody\u2019s cousin from Kottayam asks if you are married.', 'കല്യാണം', 7); remember('wedding', 'A village wedding at the ambalam in Kanni. Everyone in kasavu, the chenda, and a sadya that went on until the leaves ran out.'); }, 1200); } }
  tapFree(p) { const f = fest(); if (f.utsavam && clock.hour >= 16 && clock.hour < 23 && p.y > 430 && p.y < 560 && Math.abs(p.x - 215) < 170) { found('elephant'); return true; } if (Math.hypot(p.x - 330, p.y - 420) < 22) { found('thetti'); return true; } return false; }
  pray() { this.busy = true; clock.speed = 8; audio.sfx('steps', { reps: 6 }); say('You walk around the sreekovil three times, palms together, counting without meaning to.', 'പ്രദക്ഷിണം', 5); delay(4.6, () => { clock.speed = 1; this.busy = false; state.templeDay = clock.day; if (fest().utsavamMain) remember('utsavam', 'The utsavam. Three elephants in gold, chenda like a heartbeat you can lean on, and fireworks over the paddy at night. The whole village was there, which is to say the whole world.'); remember('temple', 'Walked pradakshinam at the ambalam. The stone is worn into a shallow path by a few hundred years of feet, and now mine.'); }); }
  // The call to action: a taper in hand, light the pillar from the bottom tier up by drawing your finger upward. The lit tiers stay lit.
  smallLamp() { state.today.vilakku = (state.today.vilakku || 0) + 1; audio.sfx(state.today.vilakku === 1 ? 'match' : 'tap'); haptics.soft(); if (state.today.vilakku >= 5) { say('Five small lamps in a row at the sreekovil step, each from the last. The priest nods without looking, which is how he approves.', 'വിളക്ക്', 5); remember('smalllamps', 'Lit the row of small oil lamps at the sreekovil step at sandhya, one from the other, the way Amma did, with the same wick-trimming frown.'); did('temple'); } }
  coconut() { state.today.thenga = true; state.pantry.coconut--; this.busy = true; audio.sfx('wood'); delay(.5, () => { audio.sfx('splash'); this.busy = false; say('The coconut breaks clean in two on the stone at the kodimaram, water running into the sand: a good sign, says the man beside you, who says it to everyone.', 'തേങ്ങ ഉടയ്ക്കൽ', 6); remember('thenga', 'Broke a coconut at the kodimaram. It split clean, which is a good sign, according to a man who tells everyone their coconut split clean.'); }); }
  lightTiers(p) {
    const self = this, base = this.lampsLit, y0 = p.y; let moved = 0, tier = Math.floor(base * 6 + .001); if (base === 0) audio.sfx('match');
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.y - y0)); const k = Math.max(self.lampsLit, Math.min(1, base + (y0 - q.y) / 96)); self.lampsLit = k; const nt = Math.floor(k * 6 + .001);
        if (nt > tier) { tier = nt; haptics.soft(); audio.sfx('tap'); if (k >= 1) { say('The last tier takes. Fifty small flames climb the stone, and the bats come out above them.', 'ദീപസ്തംഭം', 6); remember('deepastambham', 'Lit the deepastambham at sandhya with a taper, tier by tier from the bottom, the way the priest does it in half the time. Fifty small flames climbing a stone pillar, and the bats coming out above them.'); } } },
      end() { if (moved < 10) say('Hold the taper to the lowest tier and draw it upward.', 'തിരി'); }
    };
  }
  sit() { this.busy = true; clock.speed = 14; say('You sit on the stone platform under the arayal. The leaves never stop moving, even when there is no wind.', 'ആൽത്തറ', 5); delay(4.5, () => { clock.speed = 1; this.busy = false; remember('arayal', 'Sat under the arayal at the temple. Old men were discussing the price of paddy in 1952 as if it had happened this morning.'); }); }
  ambience() { const f = fest(), h = clock.hour; const m = { birds: clock.phase === 'ravile' ? .4 : 0 }; if (f.utsavam && h >= 17) m.chenda = .7; return m; }
  tick(dt) { const f = fest(); if (f.utsavamMain && clock.hour >= 20 && clock.hour < 22) { this.fwT -= dt; if (this.fwT <= 0) { this.fwT = 1.2 + Math.random() * 2; this.fireworks.push({ x: 80 + Math.random() * 260, y: 80 + Math.random() * 120, t: 0, col: ['#ffd27a', '#ff8a5a', '#9ad0ff', '#f0f0ff'][Math.random() * 4 | 0] }); audio.sfx('firework'); } } for (const fw of this.fireworks) fw.t += dt; this.fireworks = this.fireworks.filter(fw => fw.t < 2); if (clock.hour >= 18.4 && clock.hour < 18.6 && this.lampsLit < 1) this.lampsLit = Math.min(1, this.lampsLit + dt * .3); if (clock.hour > 6 && clock.hour < 17) this.lampsLit = 0; }
  glows() { const g = []; if (this.lampsLit > 0) g.push({ x: 120, y: 500, r: 170, a: .9 * this.lampsLit }); if (clock.daylight < .5) g.push({ x: 215, y: 470, r: 120, a: .8 }); return g; }
  drawStatic(c, w, h) {
    const cx = 215;
    // far: paddy, treeline, hills
    rect(c, 0, 300, w, 70, vgrad(c, 0, 300, 370, [[0, '#9fc27a'], [1, P.paddy]]));
    c.fillStyle = '#6f8ea0'; c.beginPath(); c.moveTo(0, 300); for (let x = 0; x <= w; x += 10) c.lineTo(x, 288 - Math.sin(x / 60) * 10); c.lineTo(w, 300); c.fill();
    for (let i = 0; i < 10; i++) ellipse(c, hash(i + 23) * w, 318, 18 + hash(i + 2) * 20, 14, P.cocoDeep);
    palm(c, w - 40, 380, 150, -20, 1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // banyan / arayal on the left with a stone platform
    banyan(c, 60, 440, .9);
    poly(c, [[0, 440], [120, 440], [126, 462], [0, 462]], P.stone); rect(c, 0, 440, 126, 3, P.stoneLt);
    // temple compound wall (laterite) and gate
    lateriteWall(c, 130, 380, w - 130, 34, .3);
    // ground: temple courtyard sand (white river sand)
    rect(c, 0, 462, w, h - 462, vgrad(c, 0, 462, h, [[0, '#e9dcc2'], [1, '#c9b998']]));
    c.fillStyle = 'rgba(120,100,70,.12)'; for (let i = 0; i < 60; i++) circle(c, hash(i + 5) * w, 470 + hash(i + 6) * 320, .8 + hash(i) * .8, 'rgba(120,100,70,.14)');
    // sreekovil: square sanctum with a copper-tiled pyramidal roof and a small gable, on a granite base
    const sx = cx, sy = 480;
    poly(c, [[sx - 70, sy], [sx + 70, sy], [sx + 66, sy - 14], [sx - 66, sy - 14]], P.stoneDk); // adhishthanam base
    rect(c, sx - 56, sy - 110, 112, 96, vgrad(c, 0, sy - 110, sy - 14, [[0, P.laterite], [1, P.lateriteDk]]));
    for (let i = 0; i < 6; i++) rect(c, sx - 56, sy - 108 + i * 16, 112, 2, 'rgba(0,0,0,.12)');
    // door (dark) with brass and a small lamp on either side
    rect(c, sx - 16, sy - 90, 32, 76, '#1a0e08'); rect(c, sx - 20, sy - 94, 40, 6, P.brassDk); circle(c, sx - 24, sy - 60, 3, P.brass); circle(c, sx + 24, sy - 60, 3, P.brass);
    // pyramidal roof: copper/tile, two tiers
    poly(c, [[sx - 84, sy - 110], [sx + 84, sy - 110], [sx + 40, sy - 160], [sx - 40, sy - 160]], '#8a4a30'); for (let i = 0; i < 9; i++) line(c, sx - 80 + i * 20, sy - 112, sx - 36 + i * 9, sy - 158, 'rgba(0,0,0,.2)', 1);
    poly(c, [[sx - 48, sy - 160], [sx + 48, sy - 160], [sx + 14, sy - 200], [sx - 14, sy - 200]], '#a65c3c'); rect(c, sx - 86, sy - 112, 172, 4, P.teakDk);
    rect(c, sx - 3, sy - 222, 6, 24, P.brass); circle(c, sx, sy - 226, 6, P.brassLt); // thazhikakkudam finial
    // kodimaram (flagstaff) with brass sheathing, right of sanctum
    rect(c, 300, 330, 6, 150, P.brass); rect(c, 300, 330, 2, 150, P.brassLt); for (let i = 0; i < 6; i++) rect(c, 298, 340 + i * 24, 10, 3, P.brassDk); circle(c, 303, 326, 5, P.brassLt); poly(c, [[306, 334], [330, 340], [306, 348]], '#d8402c');
    // bell on a stand near the gate
    rect(c, 316, 500, 4, 60, P.teakDk); rect(c, 304, 498, 28, 4, P.teakDk); poly(c, [[312, 506], [328, 506], [331, 524], [309, 524]], P.brass); ellipse(c, 320, 524, 11, 3, P.brassDk);
    // deepastambham (stone lamp pillar) left of sanctum
    const dx = 120; rect(c, dx - 10, 480, 20, 12, P.stoneDk); rect(c, dx - 4, 390, 8, 90, P.stone); for (let i = 0; i < 6; i++) { const y = 400 + i * 14, r = 7 + i * 1.6; ellipse(c, dx, y, r, 2.4, P.stoneDk); }
    rect(c, dx - 3, 380, 6, 12, P.stone); circle(c, dx, 378, 3, P.stoneLt);
    // granite path from gate to sanctum, oil stains near the lamp pillar
    poly(c, [[cx - 20, 480], [cx + 20, 480], [cx + 60, h], [cx - 60, h]], 'rgba(120,110,100,.25)');
    for (let i = 0; i < 4; i++) rect(c, cx - 18 + i * 2, 500 + i * 60, 36 - i * 4, 40, 'rgba(90,90,100,.25)');
    // thetti (ixora) bush by the wall
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .4; c.strokeStyle = P.cocoDk; c.lineWidth = 2; c.beginPath(); c.moveTo(330, 440); c.quadraticCurveTo(330 + Math.cos(a) * 14, 440 + Math.sin(a) * 20, 330 + Math.cos(a) * 24, 440 + Math.sin(a) * 30); c.stroke(); for (let k = 0; k < 5; k++) circle(c, 330 + Math.cos(a) * 24 + (k % 2) * 3 - 1.5, 440 + Math.sin(a) * 30 + Math.floor(k / 2) * 2, 1.8, '#e0402c'); }
    // a thulasi thara and a small shrine stone (nagam) under the arayal
    poly(c, [[20, 450], [44, 450], [40, 436], [24, 436]], P.stoneDk); circle(c, 32, 432, 3, '#d8402c');
    for (let i = 0; i < 14; i++) grassTuft(c, 140 + hash(i + 60) * 280, 418 + hash(i + 61) * 40, .7, P.cocoDk);
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest(), cx = 215, ph = clock.phase;
    // lamps on the deepastambham
    if (this.lampsLit > 0) { const dx = 120; for (let i = 0; i < 6; i++) { const y = 400 + i * 14, r = 7 + i * 1.6, n = 4 + i; for (let k = 0; k < n; k++) { if ((i * 7 + k) / 40 > this.lampsLit) continue; const a = -Math.PI + k * (Math.PI / (n - 1)), lx = dx + Math.cos(a) * r, fl = 1 + Math.sin(t * 12 + k + i) * .15; circle(c, lx, y - 3 * fl, 1.3, P.flameHi); } } glow(c, dx, 440, 60, '#ffa040', .35 * this.lampsLit); }
    // the row of small lamps at the step, as many as you have lit today
    { const n = state.today.vilakku || 0; for (let i = 0; i < 5; i++) { const lx = cx - 32 + i * 16, ly = 494; ellipse(c, lx, ly, 5, 2, P.brassDk); ellipse(c, lx, ly - 1.5, 5, 2, P.brass); if (i < n) { const fl = 1 + Math.sin(t * 12 + i) * .15; circle(c, lx, ly - 5 * fl, 1.5, P.flameHi); glow(c, lx, ly - 4, 14, '#ffb050', .35); } } }
    // sanctum lamp glow at dusk/night and the priest at the door
    if (clock.daylight < .6) { glow(c, cx, 440, 40, '#ffb050', .5); circle(c, cx - 24, 416, 1.6, P.flameHi); circle(c, cx + 24, 416, 1.6, P.flameHi); }
    if ((ph === 'velupp' || ph === 'sandhya') && !f.utsavam) person(c, cx + 40, 478, .85, { sex: 'm', bare: true, mundu: '#f3ecd8', skin: '#c9956a' }, t);
    // devotees
    if (ph === 'sandhya' || ph === 'velupp') { person(c, 170, 540, .8, { sex: 'f', top: '#8a2a3a', mundu: P.kasavu, pose: 'walk' }, t); person(c, 260, 580, .8, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'walk', flip: true }, t + 1); }
    // utsavam: elephants, crowd, thoranam, fireworks
    if (f.utsavam) {
      for (let i = 0; i < 12; i++) { const x = 130 + i * 24; c.fillStyle = i % 2 ? P.coco : P.cocoDk; c.beginPath(); c.moveTo(x, 384); c.lineTo(x + 6, 398); c.lineTo(x + 12, 384); c.fill(); }
      if (clock.hour >= 16 && clock.hour < 20.5) { elephant(c, cx - 10, 520, .55, t, true); elephant(c, cx - 110, 540, .5, t + 1, true); elephant(c, cx + 100, 545, .5, t + 2, true); for (let i = 0; i < 10; i++) person(c, 40 + i * 36 + (i % 2) * 10, 640 + (i % 3) * 14, .7, { sex: i % 3 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', flip: i % 2 }, t + i); for (let i = 0; i < 3; i++) person(c, 300 + i * 26, 600, .7, { sex: 'm', bare: true, mundu: '#f3ecd8' }, t + i); }
      for (const fw of this.fireworks) { const k = fw.t / 2, r = 10 + k * 60; c.save(); c.globalAlpha = (1 - k) * .9; for (let i = 0; i < 14; i++) { const a = i * .449; circle(c, fw.x + Math.cos(a) * r, fw.y + Math.sin(a) * r * .8, 1.6 + (1 - k) * 1.5, fw.col); } glow(c, fw.x, fw.y, r * 1.2, fw.col, .35 * (1 - k)); c.restore(); }
    }
    // a village wedding on Kanni 18: the couple under the mandapam, family in kasavu, chenda
    if (f.wedding && clock.hour >= 9 && clock.hour < 13) {
      for (let i = 0; i < 12; i++) { const x = 130 + i * 24; c.fillStyle = i % 2 ? P.coco : P.cocoDk; c.beginPath(); c.moveTo(x, 384); c.lineTo(x + 6, 398); c.lineTo(x + 12, 384); c.fill(); }
      rect(c, cx - 40, 560, 80, 6, P.teakDk); for (const dx of [-38, 38]) rect(c, cx + dx - 2, 520, 4, 40, P.teak); rect(c, cx - 44, 516, 88, 6, '#d8402c'); for (let i = 0; i < 8; i++) circle(c, cx - 36 + i * 10, 522, 3, i % 2 ? '#f2c230' : '#ffffff');
      person(c, cx - 12, 560, .8, { sex: 'm', top: '#f1e6d0', mundu: P.kasavu, skin: '#b08060' }, t); person(c, cx + 12, 560, .8, { sex: 'f', top: '#c8322a', mundu: P.kasavu }, t); line(c, cx - 4, 505, cx + 4, 505, '#f2c230', 3);
      for (let i = 0; i < 9; i++) person(c, 50 + i * 40 + (i % 2) * 8, 620 + (i % 3) * 16, .72, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#8a2a3a', '#2d6b5a', '#e0b43a'][i % 4], mundu: P.kasavu, flip: i % 2 }, t + i);
    }
    // pigeons / crows on the roof
    if (clock.daylight > .3) { for (let i = 0; i < 3; i++) { c.fillStyle = '#6a6a70'; circle(c, cx - 30 + i * 30 + Math.sin(t + i) * .5, 318, 3, '#6a6a70'); } }
  }
}
