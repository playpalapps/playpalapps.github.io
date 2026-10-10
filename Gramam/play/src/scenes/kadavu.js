import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm, bananaPlant } from '../art/draw.js';
import { person, boat, water, kingfisher, fishShape, mist, grassTuft } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { add } from '../game/pantry.js';
import { talk } from '../game/dialogue.js';
import { drops } from '../engine/particles.js';
import { haptics } from '../engine/haptics.js';
import { anyDue, playBeat, has } from '../game/people.js';

export class Kadavu extends Scene {
  constructor() {
    super('kadavu', 'Kadavu', 'കടവ്'); this.horizon = 320; this.ground = '#5f6f58'; this.fireflies = [200, 350, 600, 700]; this.ferryX = 300; this.ferryDir = -1; this.ferryT = 0; this.ride = 0; this.ferryK = 1; this.ferryGo = 0; this.called = 0; this.snakeX = -400; this.kettuX = 600; this.ripples = [];
    this.hotspots = [
      { x: 300, y: 560, r: 56, label: 'kadathu · call the ferry', due: () => this.ferryK >= 1 && anyDue('pappan'), action: () => this.ferry() },
      { x: 230, y: 540, r: 40, label: 'pole it yourself', enabled: () => has('pappan', 'pole') && this.ferryK >= 1 && !this.ride, drag: p => this.poleIt(p), action: () => {} },
      { x: 110, y: 600, r: 40, label: 'steps', action: () => this.sit() },
      { x: 60, y: 520, r: 36, label: 'fisherman', action: () => this.fisherman() },
      { x: 200, y: 680, r: 40, label: 'skip a stone', action: () => this.skip() },
      { x: 215, y: 470, r: 60, label: 'vallamkali', enabled: () => fest().onam && clock.day === 23, action: () => { say('The chundan vallam goes past with a hundred rowers and the vanchipattu loud enough to feel. Uthrattathi, the day after Thiruvonam.', 'വള്ളംകളി', 6); remember('vallamkali', 'Vallamkali on Uthrattathi. The snake boat came past the kadavu like a thing alive, oars in time, the song keeping it alive.'); state.festival.vallamkali = clock.day; } },
      { x: 150, y: 540, r: 40, label: 'bali', enabled: () => fest().vavu && clock.hour < 9, action: () => { this.busy = true; audio.sfx('conch'); delay(2.5, () => { this.busy = false; say('On a banana leaf at the water: rice, sesame, darbha grass. For Achan, for Amma, for everyone whose names you know and the ones you do not.', 'ബലി', 7); remember('vavu', 'Karkidaka vavu bali at the kadavu at dawn, with half the village in wet mundus. The priest said the names and the river took the leaf.'); }); } },
    ];
    this.exits = [{ side: 'left', y: 640, label: 'Kavala', go: () => router.go('kavala') }, { x: 330, y: 380, side: 'top', label: 'Pally · across', go: () => router.go('pally') }];
  }
  // The call to action: the thoni rests on the far bank. Cup your hands and call, and Pappan poles it across to the steps for you.
  // ferryK is where the boat is: 0 = far bank (small, by the temple roof), 1 = the near steps.
  ferry() {
    if (this.ride) return;
    if (this.ferryK < 1) {
      if (this.called) { say('He is coming. The pole goes in, the boat comes on, the pole goes in.', 'കടത്ത്', 4); return; }
      this.called = 1; this.idle = 0; audio.sfx('call'); haptics.light();
      say('You cup your hands at the water: “Pappaaa!” The sound goes flat across the river and comes back from the palms.', 'കടത്ത്', 5);
      delay(2.2, () => { audio.sfx('call'); say('A hand goes up on the far bank. The pole goes in.', 'പാപ്പൻ', 4); this.ferryGo = 1; });
      return;
    }
    this.busy = true; clock.speed = 8; this.ride = 1; audio.sfx('paddle'); say('Pappan pushes off with the long pole. The river is slow and brown and the other bank is close and takes forever.', 'കടത്ത്', 5); delay(2.5, () => audio.sfx('paddle')); delay(5.5, () => { clock.speed = 1; this.busy = false; this.ride = 0; state.boatDay = clock.day; if (!playBeat('pappan')) talk([['Pappan: “Four annas in your Achan’s time. Now I do not say a price and people give what they give. It is the same four annas, somehow.”', 'പാപ്പൻ']]); remember('ferry', 'Called Pappan across with the shout every child here learns first, and crossed on his kadathu thoni and came back. He stood at the back with the pole the whole way like a man who has never once sat down.'); this.restT = 0; });
  }
  // the last of Pappan's beats: he hands you the pole. Push in strokes; the boat answers slowly, then he brings you back.
  poleIt(p) {
    const self = this; let anchor = p.y, moved = 0; this.poling = 1; this.ride = 1; this.ferryDir = -1; audio.sfx('wood');
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.y - anchor)); if (q.y < anchor) anchor = q.y; if (q.y - anchor > 40) { anchor = q.y; self.ferryX = Math.max(130, self.ferryX - 24); audio.sfx('splash'); haptics.soft(); if (self.ferryX <= 130) { self.gesture = null; self.poling = 0; say('The far bank. Pappan takes the pole back without a word, which from him is a medal, and brings you home.', 'പാപ്പൻ', 5); delay(1.5, () => { self.ferryDir = 1; delay(6, () => { self.ride = 0; self.ferryX = 300; self.restT = 0; }); }); } } },
      end() { if (moved < 10) say('Push the pole down and back, a stroke at a time. Feel the bottom.', 'കഴ'); if (self.poling && self.ferryX > 130) { self.poling = 0; self.ferryDir = 1; delay(4, () => { self.ride = 0; self.ferryX = 300; self.restT = 0; }); } }
    };
  }
  enter() { super.enter(); this.ferryK = 0; this.called = 0; this.ferryGo = 0; this.ride = 0; }
  sit() { did('kadavu'); this.busy = true; clock.speed = 14; say('You sit on the mud steps with the water pulling at your feet. A kettuvallam goes by with a load of coir and a man asleep on it.', 'പടവ്', 5); delay(4.5, () => { clock.speed = 1; this.busy = false; remember('riverbank', 'Sat at the kadavu until the light went. The river does not care who left or who came back, which is restful.'); }); }
  fisherman() { if (state.days % 2 === 0) { add('fish', 2); audio.sfx('splash'); talk([['The fisherman lifts a karimeen from the basket by the gill: “From the kayal, this morning. For you, the price of a chaya.”', 'മീൻ']]); remember('fisherman', 'Bought karimeen at the kadavu from a man who fishes with a chundal and a lifetime of patience.'); } else talk([['The fisherman: “Nothing today but small fry. Come after the rain, the fish come up to breathe.”', 'മീൻപിടുത്തക്കാരൻ']]); }
  skip() { this.busy = true; for (let i = 0; i < 4; i++) setTimeout(() => { this.ripples.push({ x: 220 + i * 40, y: 640 - i * 12, r: 2, a: .8 }); audio.sfx('splash'); }, i * 260); delay(1.4, () => { this.busy = false; say('Four skips. Ravi’s record is nine and he will tell you so from Dubai.', 'കല്ല്'); }); }
  ambience() { const ph = clock.phase; return { lapping: .5, frogs: ph === 'rathri' ? .35 : 0, koel: (clock.month === 7 || clock.month === 8) ? .2 : 0, wind: .2 }; }
  tick(dt) {
    this.ferryT += dt;
    // the thoni crossing to you after a call, and drifting back to the far bank a while after a ride
    if (this.ferryGo && this.ferryK < 1) { this.ferryK = Math.min(1, this.ferryK + dt / 14); if (Math.floor(this.ferryT * .7) !== Math.floor((this.ferryT - dt) * .7)) audio.sfx('splash'); if (this.ferryK >= 1) { this.ferryGo = 0; this.called = 0; audio.sfx('wood'); say('The thoni noses into the steps. Pappan: “Kayaru.” Get in.', 'പാപ്പൻ', 5); } }
    if (!this.ride && this.ferryK >= 1 && this.restT !== undefined) { this.restT += dt; if (this.restT > 40) { this.restT = undefined; this.ferryGo = -1; } }
    if (this.ferryGo < 0) { this.ferryK = Math.max(0, this.ferryK - dt / 20); if (this.ferryK <= 0) this.ferryGo = 0; }
    if (this.ride && !this.poling) { this.ferryX += (this.ferryDir < 0 ? -1 : 1) * dt * 40; if (this.ferryX < 130) this.ferryDir = 1; if (this.ferryX > 300 && this.ferryDir > 0) { this.ferryDir = -1; } }
    this.kettuX -= dt * 14; if (this.kettuX < -200) this.kettuX = 600 + Math.random() * 800;
    if (fest().onam && clock.day === 23) { this.snakeX += dt * 60; if (this.snakeX > 700) this.snakeX = -400; }
    for (const r of this.ripples) { r.r += dt * 30; r.a -= dt * .6; } this.ripples = this.ripples.filter(r => r.a > 0);
    if (Math.random() < dt * .2) this.ripples.push({ x: 60 + Math.random() * 320, y: 480 + Math.random() * 260, r: 2, a: .5 });
  }
  drawStatic(c, w, h) {
    // far bank: palms, a small temple roof, coconut groves
    rect(c, 0, 312, w, 40, vgrad(c, 0, 312, 352, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 14; i++) ellipse(c, hash(i + 17) * w, 326, 14 + hash(i) * 18, 12, P.cocoDeep);
    for (let i = 0; i < 6; i++) palm(c, 20 + i * 80 + hash(i) * 20, 352, 240 - hash(i + 1) * 30, (i - 3) * 5, .6, [P.teakLt, P.teakDk, P.cocoDeep, P.cocoDk]);
    poly(c, [[260, 350], [330, 350], [318, 322], [272, 322]], P.tileDk); rect(c, 266, 350, 58, 8, P.lime);
    // far bank edge
    rect(c, 0, 352, w, 10, P.earthDk);
    // near bank: mud steps on the left, grass and banana on the right (also redrawn over the water each frame)
    this.bank(c, w, h);
    bananaPlant(c, 340, 640, 1.05, P.cocoDk, P.cocoLt); bananaPlant(c, 325, 680, .75, P.cocoDk, P.coco);
    for (let i = 0; i < 20; i++) grassTuft(c, 200 + hash(i + 40) * 230, 610 + hash(i + 41) * 60, .8, P.coco);
    // leaning coconut palm over the water
    palm(c, 30, 700, 420, 110, 1.3, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // mooring post and rope
    rect(c, 150, 580, 6, 50, P.teakDk);
    // fisherman's basket
    ellipse(c, 60, 560, 14, 5, '#a67c4a'); poly(c, [[46, 560], [74, 560], [70, 544], [50, 544]], '#c49a60');
  }
  bank(c, w, h) {
    rect(c, 0, 600, w, h - 600, vgrad(c, 0, 600, h, [[0, P.earthLt], [1, P.earthDk]]));
    for (let i = 0; i < 6; i++) { const y = 540 + i * 14; poly(c, [[0, y], [120 + i * 14, y], [120 + i * 14, y + 14], [0, y + 14]], i % 2 ? P.earth : P.earthLt); rect(c, 0, y, 120 + i * 14, 2, P.earthDk); }
  }
  drawDynamic(c, w, h) {
    const t = this.t, ph = clock.phase, day = clock.daylight > .5;
    water(c, 0, 362, w, 240, t, day ? ['#8a9a78', '#5f6f58'] : ['#2f3a3c', '#1c2628'], day ? '#d8e0c8' : null);
    this.bank(c, w, h); rect(c, 150, 580, 6, 50, P.teakDk); ellipse(c, 60, 560, 14, 5, '#a67c4a'); poly(c, [[46, 560], [74, 560], [70, 544], [50, 544]], '#c49a60'); for (let i = 0; i < 20; i++) grassTuft(c, 200 + hash(i + 40) * 230, 610 + hash(i + 41) * 60, .8, P.coco); bananaPlant(c, 340, 640, 1.05, P.cocoDk, P.cocoLt); bananaPlant(c, 325, 680, .75, P.cocoDk, P.coco);
    // reflections
    c.globalAlpha = .15; for (let i = 0; i < 6; i++) ellipse(c, 20 + i * 80 + hash(i) * 20, 420, 8, 60, '#1f3d1c'); c.globalAlpha = 1;
    if (!day && state.rainT < .3) { c.globalAlpha = (1 - clock.daylight) * .45 * clock.moon; ellipse(c, 260, 480, 16, 80, '#f3ecd2'); c.globalAlpha = 1; }
    // kettuvallam passing far
    if (this.kettuX > -200 && this.kettuX < w + 100) { boat(c, this.kettuX, 400, .8, t); c.fillStyle = '#8a7a4a'; c.beginPath(); c.ellipse(this.kettuX, 380, 36, 16, 0, Math.PI, 0); c.fill(); person(c, this.kettuX + 40, 392, .5, { sex: 'm', bare: true, mundu: '#d9d2c0' }, t); }
    // snake boat on Uthrattathi
    if (fest().onam && clock.day === 23) { const sx = this.snakeX; c.fillStyle = P.teakDk; c.beginPath(); c.moveTo(sx - 160, 440); c.quadraticCurveTo(sx, 456, sx + 160, 440); c.lineTo(sx + 190, 400); c.lineTo(sx + 164, 432); c.quadraticCurveTo(sx, 446, sx - 160, 432); c.closePath(); c.fill(); for (let i = 0; i < 14; i++) { person(c, sx - 140 + i * 20, 436, .36, { sex: 'm', bare: true, mundu: '#f3ecd8' }, t); line(c, sx - 140 + i * 20, 430, sx - 146 + i * 20 + Math.sin(t * 6) * 6, 452, P.teakLt, 1.5); } rect(c, sx + 170, 396, 2, 20, P.brass); poly(c, [[sx + 172, 396], [sx + 190, 400], [sx + 172, 406]], '#d8402c'); }
    // ferry (kadathu thoni) with Pappan and the pole
    const k = this.ferryK, kk = k * k * (3 - 2 * k), fx = this.ride ? this.ferryX : 296 + (300 - 296) * kk + Math.sin(this.ferryT * .5) * (1 - kk) * 2, fy = (376 + (560 - 376) * kk) + Math.sin(t) * 1.5, fs = .45 + .55 * kk;
    boat(c, fx, fy, fs, t); if (has('pappan', 'plank')) rect(c, fx - 20 * fs, fy - 6 * fs, 22 * fs, 4 * fs, '#d9c9a0'); person(c, fx + 44 * fs, fy - 12 * fs, .8 * fs, { sex: 'm', bare: true, mundu: '#d9d2c0', skin: '#8a5a3a' }, t);
    { const push = this.ferryGo > 0 ? Math.sin(this.ferryT * 2.2) * 10 : 0; line(c, fx + 52 * fs, fy - 70 * fs + push * fs, fx + 62 * fs, fy + 10 * fs, P.teakLt, 2 * fs); }
    if (this.ride) person(c, fx - 10, fy - 10, .8, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'sit' }, t);
    // rope to the post when the boat is at the steps; a wake when it is crossing
    if (!this.ride && k >= 1) { c.strokeStyle = '#c9b48a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(153, 584); c.quadraticCurveTo(220, 600, fx - 60, fy - 14); c.stroke(); }
    if (this.ferryGo) { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(fx - 30 * fs, fy + 6 * fs); c.quadraticCurveTo(fx, fy + 2 * fs, fx + 30 * fs, fy + 6 * fs); c.stroke(); }
    // fisherman with chundal on the steps
    person(c, 60, 538, .85, { sex: 'm', bare: true, mundu: '#d9d2c0', pose: 'sit', skin: '#8a5a3a' }, t); line(c, 70, 500, 130 + Math.sin(t) * 2, 470, P.teakLt, 1.5); line(c, 130 + Math.sin(t) * 2, 470, 132, 520 + Math.sin(t * 1.3) * 3, 'rgba(255,255,255,.5)', .8);
    // washing women at the far steps, children in the water in the afternoon
    if (ph === 'ravile') { person(c, 40, 596, .7, { sex: 'f', top: '#2d6b5a', mundu: P.kasavu, pose: 'sit' }, t); }
    if (ph === 'uchha' && !fest().monsoon) { for (let i = 0; i < 3; i++) { circle(c, 200 + i * 30 + Math.sin(t * 2 + i) * 6, 500 + Math.sin(t * 3 + i) * 3, 6, '#9c6a48'); } }
    for (const r of this.ripples) { c.strokeStyle = `rgba(255,255,255,${r.a * .4})`; c.lineWidth = 1; c.beginPath(); c.ellipse(r.x, r.y, r.r, r.r * .3, 0, 0, 7); c.stroke(); }
    kingfisher(c, 152, 574, 1);
    // vavu morning crowd
    if (fest().vavu && clock.hour < 9) { for (let i = 0; i < 6; i++) person(c, 30 + i * 30, 580 + (i % 2) * 8, .7, { sex: i % 2 ? 'm' : 'f', bare: i % 2 === 1, top: '#f1e6d0', mundu: '#f3ecd8', pose: 'sit' }, t); }
    if (fest().mistMorning) mist(c, 0, 360, w, 200, .55);
  }
}
