import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm } from '../art/draw.js';
import { person, cow, dragonfly, mist, crowBird, grassTuft } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash, lerpColor } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { add } from '../game/pantry.js';
import { fireflies } from '../engine/particles.js';
import { haptics } from '../engine/haptics.js';

export class Vayal extends Scene {
  constructor() {
    super('vayal', 'Vayal', 'വയൽ'); this.horizon = 330; this.ground = '#5f8a33'; this.egrets = [{ x: 150, y: 470 }, { x: 260, y: 500 }, { x: 320, y: 455 }]; this.kite = 0; this.ffT = 0;
    this.hotspots = [
      { x: 215, y: 600, r: 60, label: 'bund', action: () => this.walk() },
      { x: 120, y: 520, r: 50, label: 'harvest', enabled: () => fest().harvest && state.festival.harvestDay !== clock.day, action: () => this.harvest() },
      { x: 300, y: 540, r: 50, label: 'njaru', enabled: () => fest().planting && state.fieldDay !== clock.day, action: () => this.plant() },
      { x: 330, y: 660, r: 36, label: 'thumba', enabled: () => fest().onam, action: () => { found('thumba'); audio.sfx('chime'); say('You pick white thumba from the bund for the centre of the pookalam. Onathumbi everywhere.', 'തുമ്പപ്പൂ'); remember('thumba', 'Thumba flowers from the bund for the pookalam, and onathumbi, the Onam dragonflies, rising from the stubble as I walked.'); } },
      { x: 90, y: 440, r: 36, label: 'scarecrow', action: () => { audio.sfx('tap'); say('The scarecrow wears Achan’s old shirt. The crows have never once been fooled.', 'നോക്കുകുത്തി'); } },
      { x: 330, y: 560, r: 60, label: 'kite · tug the thread', enabled: () => clock.month === 8 || clock.month === 0, drag: p => this.flyKite(p), action: () => {} },
    ];
    this.exits = [{ side: 'right', y: 640, label: 'Kavala', go: () => router.go('kavala') }];
  }
  walk() { this.busy = true; clock.speed = 12; audio.sfx('steps', { reps: 6 }); say(fest().monsoon ? 'You walk the bund in the rain, the mud taking a print of every step, the field a mirror broken by seedlings.' : 'You walk the varambu between the fields. Warm mud, the smell of wet earth, egrets lifting ahead of you and settling behind.', 'വരമ്പ്', 5); delay(4.6, () => { clock.speed = 1; this.busy = false; state.fieldDay = clock.day; remember('bund', 'Walked the varambu to the far end of the vayal and back. Counted egrets. Lost count. Found the stone we used to call the elephant.'); }); }
  harvest() { this.busy = true; clock.speed = 10; audio.sfx('sweep', { reps: 6 }); say('You take a sickle and join the line. Cut, bundle, stack. Your hands remember before you do.', 'കൊയ്ത്ത്', 5); delay(5, () => { clock.speed = 1; this.busy = false; state.festival.harvestDay = clock.day; add('paddy', 2); remember('harvest', 'Koythu in Makaram. Cut paddy with the women until the sun was too much, then threshed by the kalam while someone sang. Two para for the pathayam.'); }); }
  plant() { this.busy = true; clock.speed = 10; say('You step into the flooded field, bent double, pushing seedlings into the mud three fingers apart, while the women sing the njattupattu around you.', 'ഞാറുനടീൽ', 5); delay(5, () => { clock.speed = 1; this.busy = false; state.fieldDay = clock.day; remember('planting', 'Njaru nadal. Back bent, feet in warm mud, the planting song going round and round. By noon I could not stand up straight and did not want to.'); }); }
  // The call to action: tug the thread upward and the Medam wind takes the paper kite; let go and it stays up a while, then settles.
  flyKite(p) {
    const self = this, base = this.kite, y0 = p.y; let moved = 0; this.kiteFall = false;
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.y - y0)); const k = Math.max(0, Math.min(1, base + (y0 - q.y) / 170)); if (k > self.kite + .08) haptics.soft(); self.kite = Math.max(self.kite, k);
        if (self.kite >= .9 && !self.kiteSaid) { self.kiteSaid = true; say('A paper kite on a thread of Achan’s old fishing line, climbing over the paddy until it is a dot.', 'പട്ടം', 5); remember('kite', 'Flew a kite over the vayal in the Medam wind, tugging the thread the way Achan showed us. The children at the kavala saw it and came running, so it became theirs.'); } },
      end() { self.kiteFall = true; if (moved < 10) say('Tug the thread upward, in short pulls, and the wind does the rest.', 'പട്ടം'); }
    };
  }
  tapFree(p) { const f = fest(), t = this.t; if (f.onam) for (let i = 0; i < 4; i++) if (Math.hypot(p.x - (60 + i * 80 + Math.sin(t + i) * 30), p.y - (560 + Math.cos(t * 1.4 + i) * 20)) < 20) { found('onathumbi'); return true; } for (const e of this.egrets) if (Math.hypot(p.x - e.x, p.y - e.y) < 20) { found('egret'); return true; } if (state.rainbow > 0 && p.y < 330) { found('rainbow'); return true; } return false; }
  ambience() { const f = fest(), ph = clock.phase; const m = { wind: .4, leaves: .2 }; if (f.planting && ph !== 'rathri') m.njattupattu = .45; if (ph === 'rathri' || state.rainT > .3) m.frogs = .4; if (ph === 'ravile') m.birds = .4; return m; }
  tick(dt) { if (this.kiteFall && this.kite > 0) this.kite = Math.max(0, this.kite - dt * .035); for (const e of this.egrets) { e.x += Math.sin(this.t * .3 + e.y) * dt * 6; } if (clock.phase === 'rathri' && state.rainT < .2) { this.ffT += dt; if (this.ffT > .4) { this.ffT = 0; fireflies(this.ps, 20, 410, 440, 700, 1); } } }
  fieldColors() { const f = fest(); if (f.harvest || f.paddyGold) return ['#d9b84a', '#b8953a']; if (f.ploughing) return ['#7a5a3a', '#5a4030']; if (f.planting) return ['#8fb0a8', '#6f9088']; if (clock.month === 6 || clock.month === 7 || (clock.month === 8 && !f.ploughing)) return ['#c9b48a', '#a89a6a']; return ['#8fc25a', '#5f8a33']; }
  drawStatic(c, w, h) {
    // this scene's field colours change with season, so most of it is drawn dynamically; static holds hills and far palms
    c.fillStyle = '#6f8ea0'; c.beginPath(); c.moveTo(0, 332); for (let x = 0; x <= w; x += 10) c.lineTo(x, 300 - Math.sin(x / 70) * 14 - Math.sin(x / 23) * 5); c.lineTo(w, 332); c.fill();
    c.fillStyle = '#8aa6a0'; c.beginPath(); c.moveTo(0, 332); for (let x = 0; x <= w; x += 10) c.lineTo(x, 318 - Math.sin(x / 40 + 2) * 8); c.lineTo(w, 332); c.fill();
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest(), [lt, dk] = this.fieldColors(), ph = clock.phase;
    // far treeline and palms
    rect(c, 0, 328, w, 14, P.cocoDeep); for (let i = 0; i < 16; i++) ellipse(c, hash(i + 9) * w, 332, 12 + hash(i) * 16, 10, P.cocoDeep);
    for (let i = 0; i < 5; i++) palm(c, 30 + i * 95, 345, 300 - hash(i) * 20, (i - 2) * 6, .55, [P.teakLt, P.teakDk, P.cocoDeep, P.cocoDk], Math.sin(t * .7 + i) * 2);
    // field in perspective: rows converging
    rect(c, 0, 340, w, h - 340, vgrad(c, 0, 340, h, [[0, lt], [1, dk]]));
    if (f.planting || (f.monsoon && state.rainT > .3)) { c.globalAlpha = .45; rect(c, 0, 340, w, h - 340, vgrad(c, 0, 340, h, [[0, '#9fc0d0'], [1, '#6f90a0']])); c.globalAlpha = 1; }
    c.strokeStyle = 'rgba(40,60,20,.22)'; c.lineWidth = 1;
    for (let i = 0; i < 18; i++) { const y = 345 + Math.pow(i / 18, 1.6) * 460; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + Math.sin(i) * 2); c.stroke(); }
    c.strokeStyle = 'rgba(40,60,20,.08)'; for (let i = -6; i <= 6; i++) { if (i === 0) continue; c.beginPath(); c.moveTo(215 + i * 20, 345); c.lineTo(215 + i * 90, h); c.stroke(); }
    // paddy stalks near the viewer swaying
    if (!f.ploughing && !f.harvest) { c.strokeStyle = f.paddyGold ? '#e8c860' : '#6f9a44'; c.lineWidth = 1.4; c.lineCap = 'round'; for (let i = 0; i < 70; i++) { const x = hash(i + 100) * w, y = 560 + hash(i + 101) * 240, sw = Math.sin(t * 1.8 + i) * 4; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y - 20, x + sw * 2, y - 36 - hash(i) * 10); c.stroke(); if (f.paddyGold) { ellipse(c, x + sw * 2, y - 38 - hash(i) * 10, 2, 5, '#e8c860'); } } }
    if (f.ploughing) { c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(0, 420 + i * 30); c.lineTo(w, 426 + i * 30); c.stroke(); } }
    // bund (varambu) in the middle, from the viewer into the distance
    poly(c, [[180, h], [250, h], [222, 345], [208, 345]], P.earth); poly(c, [[192, h], [238, h], [218, 345], [212, 345]], P.earthLt);
    for (let i = 0; i < 12; i++) grassTuft(c, 200 + (i % 2) * 24, 420 + i * 30, .6 + i * .05, P.coco);
    // water channel glint on the left
    poly(c, [[0, 500], [60, 500], [40, 345], [30, 345]], 'rgba(160,200,220,.35)');
    // scarecrow
    rect(c, 88, 410, 3, 70, P.teakDk); rect(c, 72, 428, 36, 3, P.teakDk); poly(c, [[78, 430], [100, 430], [104, 462], [74, 462]], '#f1e6d0'); circle(c, 89, 420, 8, P.clay); poly(c, [[80, 414], [98, 414], [92, 406], [86, 406]], '#8a7a4a');
    // egrets
    for (const e of this.egrets) { ellipse(c, e.x, e.y, 7, 4, '#f6f3ea'); line(c, e.x + 4, e.y - 2, e.x + 8, e.y - 12, '#f6f3ea', 1.5); circle(c, e.x + 8, e.y - 13, 2.5, '#f6f3ea'); line(c, e.x + 10, e.y - 13, e.x + 15, e.y - 12, '#e0b43a', 1); line(c, e.x - 2, e.y + 4, e.x - 2, e.y + 10, '#333', 1); }
    // seasonal people: planting women, harvesters, ploughman with bullocks
    if (f.planting && ph !== 'rathri') { for (let i = 0; i < 5; i++) { const x = 260 + i * 30, y = 520 + (i % 2) * 16; person(c, x, y, .62, { sex: 'f', top: ['#b8443a', '#2d6b5a', '#8a2a3a', '#e0b43a', '#2a3a8a'][i], mundu: '#efe6cf', pose: 'stand' }, t); } }
    if (f.harvest && ph !== 'rathri') { for (let i = 0; i < 5; i++) { const x = 60 + i * 32, y = 540 + (i % 2) * 20; person(c, x, y, .64, { sex: i % 2 ? 'm' : 'f', top: ['#b8443a', '#f1e6d0', '#2d6b5a', '#e0b43a', '#8a2a3a'][i], mundu: '#efe6cf', bare: i % 2 === 1 }, t); } for (let i = 0; i < 4; i++) { poly(c, [[300 + i * 24, 500], [316 + i * 24, 500], [312 + i * 24, 470], [304 + i * 24, 470]], '#d9b84a'); } }
    if (f.ploughing && ph === 'ravile') { cow(c, 150 + Math.sin(t * .2) * 20, 470, .55, t); cow(c, 190 + Math.sin(t * .2) * 20, 472, .55, t + 1); person(c, 230 + Math.sin(t * .2) * 20, 476, .62, { sex: 'm', bare: true, mundu: '#d9d2c0' }, t); }
    if (ph === 'uchha' || ph === 'ravile') { dragonfly(c, 120 + Math.sin(t * 1.3) * 50, 600 + Math.sin(t * 2.1) * 12, 1, t); dragonfly(c, 300 + Math.cos(t * .9) * 60, 650 + Math.sin(t * 1.5) * 10, .9, t + 1); if (f.onam) for (let i = 0; i < 4; i++) dragonfly(c, 60 + i * 80 + Math.sin(t + i) * 30, 560 + Math.cos(t * 1.4 + i) * 20, .8, t + i); }
    crowBird(c, 100, 412, .8, t);
    if (this.kite > 0) { const kx = 330 - this.kite * 80, ky = 400 - this.kite * 200 + Math.sin(t * 2) * 6; line(c, 340, 640, kx, ky, 'rgba(255,255,255,.5)', 1); poly(c, [[kx, ky - 14], [kx + 10, ky], [kx, ky + 14], [kx - 10, ky]], '#d8402c'); line(c, kx, ky + 14, kx - 6 + Math.sin(t * 5) * 4, ky + 34, '#f2c230', 1.5); }
    if (f.mistMorning) mist(c, 0, 340, w, 160, .6);
    if (state.rainbow > 0) { c.save(); c.globalAlpha = Math.min(1, state.rainbow * 2) * .55; const cols = ['#ff5a5a', '#ffb050', '#ffe060', '#60c060', '#60a0ff', '#8060ff']; for (let i = 0; i < 6; i++) { c.strokeStyle = cols[i]; c.lineWidth = 5; c.beginPath(); c.arc(w / 2 + 60, 330, 300 - i * 5, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); } c.restore(); }
  }
}
