import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { banyan, jackfruitTree, person, grassTuft, mist } from '../art/lib.js';
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
import { fireflies } from '../engine/particles.js';

export class Kaavu extends Scene {
  constructor() {
    super('kaavu', 'Sarpakkavu', 'സർപ്പക്കാവ്'); this.horizon = 200; this.ground = '#1f3a1e'; this.lamp = 0; this.fireflies = [20, 350, 480, 720]; this.bats = Array.from({ length: 6 }, (_, i) => ({ x: hash(i) * 370, y: 60 + hash(i + 2) * 120, t: i }));
    this.hotspots = [
      { x: 215, y: 560, r: 40, label: 'nagam', action: () => this.pray() },
      { x: 170, y: 596, r: 26, label: 'lamp', enabled: () => this.lamp <= 0, action: () => this.light() },
      { x: 260, y: 600, r: 30, label: 'noorum palum', enabled: () => (state.pantry.milk || 0) > 0, action: () => this.offer() },
      { x: 80, y: 660, r: 44, label: 'sit and listen', action: () => this.sit() },
    ];
    this.exits = [{ side: 'bottom', label: 'Ambalam', go: () => router.go('ambalam') }];
  }
  enter() { super.enter(); if (fest().theyyam && clock.hour >= 19) did('theyyam'); }
  tapFree(p) { if (clock.hour >= 21 && Math.hypot(p.x - 300, p.y - 240) < 24) { found('owl'); return true; } if (clock.phase === 'sandhya') for (const b of this.bats) if (Math.hypot(p.x - b.x, p.y - b.y) < 20) { found('bats'); return true; } return false; }
  pray() { this.busy = true; audio.sfx('chime'); delay(1.2, () => { this.busy = false; say('You fold your hands before the stone nagams, hooded and worn smooth, under a tree older than the family.', 'നാഗം'); remember('kaavu', 'Went into the sarpakkavu behind the ambalam, where nobody cuts a branch or raises a voice. The nagams were covered in turmeric and the silence was complete.'); }); }
  light() { this.busy = true; audio.sfx('match'); delay(.8, () => { this.lamp = 1; this.busy = false; say('One small flame in the whole dark grove. The leaves above take the light and give it back green.', 'വിളക്ക്'); remember('kaavulamp', 'Lit the lamp in the kaavu at dusk. A thousand leaves lit up above it and something moved and was not a snake.'); }); }
  offer() { this.busy = true; audio.sfx('pour'); delay(1.2, () => { state.pantry.milk--; this.busy = false; say('Milk and turmeric on a plavila before the nagams: noorum palum. The ants will take it to whoever it is for.', 'നൂറും പാലും'); remember('noorumpalum', 'Offered noorum palum at the kaavu, milk and turmeric on a leaf, the way Ammamma did on the first of every month.'); }); }
  sit() { this.busy = true; clock.speed = 14; say('You sit on the root of the great tree. Drips, an owl somewhere, a leaf letting go. The grove is the one place in the village that is not waiting for anything.', 'കാവ്', 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('kaavusit', 'Sat in the sarpakkavu until the light was gone. It is the only place I have ever been where the quiet has a shape.'); }); }
  ambience() { const f = fest(); const m = { kaavu: .7, wind: .05, birds: clock.phase === 'ravile' ? .2 : 0, crickets: clock.phase === 'rathri' ? .3 : 0 }; if (f.theyyam && clock.hour >= 19) { m.chenda = .8; m.murmur = .3; } return m; }
  tick(dt) { this.lamp = Math.max(0, this.lamp - dt / 400); for (const b of this.bats) { b.t += dt; b.x += Math.sin(b.t * 1.3) * dt * 40; b.y += Math.cos(b.t * .9) * dt * 20; } }
  glows() { const g = []; if (this.lamp > 0) g.push({ x: 170, y: 590, r: 110, a: .9 * this.lamp }); if (fest().theyyam && clock.hour >= 19) { g.push({ x: 215, y: 520, r: 200, a: 1 }, { x: 90, y: 520, r: 90, a: .8 }, { x: 340, y: 520, r: 90, a: .8 }); } return g; }
  drawStatic(c, w, h) {
    // a dark grove: canopy layers closing overhead, huge trunks, aerial roots, a stone platform with nagams
    rect(c, 0, 0, w, h, vgrad(c, 0, 0, h, [[0, '#0f2414'], [.5, '#1f3a1e'], [1, '#2a3a22']]));
    for (let i = 0; i < 26; i++) ellipse(c, hash(i + 11) * w, 40 + hash(i + 3) * 200, 50 + hash(i) * 60, 26 + hash(i + 7) * 20, i % 3 ? '#183018' : '#1f3d1c');
    for (let i = 0; i < 12; i++) ellipse(c, hash(i + 31) * w, 120 + hash(i + 5) * 120, 40 + hash(i) * 40, 20 + hash(i + 7) * 14, '#2a4a28');
    // light shafts
    c.globalAlpha = .12; for (let i = 0; i < 4; i++) poly(c, [[60 + i * 80, 0], [100 + i * 80, 0], [80 + i * 80, 520], [20 + i * 80, 520]], '#dfe8b0'); c.globalAlpha = 1;
    banyan(c, 70, 540, 1.1); jackfruitTree(c, 330, 520, .9);
    // trunks and roots everywhere
    c.strokeStyle = '#4a3a2a'; c.lineCap = 'round'; for (let i = 0; i < 10; i++) { const x = 20 + hash(i + 50) * 330; c.lineWidth = 3 + hash(i) * 8; c.beginPath(); c.moveTo(x, 520); c.quadraticCurveTo(x + (hash(i + 1) - .5) * 40, 400, x + (hash(i + 2) - .5) * 60, 200); c.stroke(); }
    // floor: leaf litter and moss, stone platform
    rect(c, 0, 520, w, h - 520, vgrad(c, 0, 520, h, [[0, '#3a4a2a'], [1, '#22301c']])); for (let i = 0; i < 60; i++) ellipse(c, hash(i + 90) * w, 530 + hash(i + 91) * 260, 4 + hash(i) * 4, 2, i % 2 ? '#5a4a2a' : '#4a6a3a', hash(i + 2) * 3);
    poly(c, [[150, 600], [280, 600], [290, 620], [140, 620]], P.stoneDk); poly(c, [[158, 580], [272, 580], [280, 600], [150, 600]], P.stone); rect(c, 150, 618, 140, 4, '#2a2a22');
    // nagam stones: hooded cobra carvings, turmeric-stained
    for (let i = 0; i < 3; i++) { const x = 190 + i * 25, y = 578; poly(c, [[x - 9, y], [x + 9, y], [x + 7, y - 26], [x - 7, y - 26]], P.stoneDk); poly(c, [[x - 8, y - 24], [x + 8, y - 24], [x + 5, y - 38], [x - 5, y - 38]], '#8a7a62'); circle(c, x, y - 38, 6, '#8a7a62'); c.fillStyle = 'rgba(220,170,40,.55)'; circle(c, x, y - 30, 5, 'rgba(220,170,40,.55)'); c.fillStyle = '#c8322a'; circle(c, x, y - 40, 1.5, '#c8322a'); }
    // small clay lamp on the platform edge, a leaf for offerings
    ellipse(c, 170, 598, 7, 3, P.clay); ellipse(c, 260, 600, 14, 5, '#4f8a4a');
    for (let i = 0; i < 20; i++) grassTuft(c, hash(i + 60) * w, 640 + hash(i + 61) * 140, .7, '#4a6a3a');
    mist(c, 0, 560, w, 120, .2);
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest();
    if (this.lamp > 0) { const fl = 1 + Math.sin(t * 12) * .1; glow(c, 170, 592, 30, '#ffb050', .5 * this.lamp); c.fillStyle = P.flame; c.beginPath(); c.moveTo(168, 597); c.quadraticCurveTo(167, 588, 170, 583 - 4 * fl); c.quadraticCurveTo(173, 588, 172, 597); c.fill(); }
    if (clock.phase === 'sandhya' || clock.phase === 'rathri') for (const b of this.bats) { c.fillStyle = '#0a1208'; const f2 = Math.sin(b.t * 10); c.beginPath(); c.moveTo(b.x - 8, b.y - f2 * 4); c.quadraticCurveTo(b.x - 3, b.y - 1, b.x, b.y); c.quadraticCurveTo(b.x + 3, b.y - 1, b.x + 8, b.y - f2 * 4); c.lineTo(b.x + 6, b.y - f2 * 4 + 2); c.quadraticCurveTo(b.x, b.y + 2, b.x - 6, b.y - f2 * 4 + 2); c.fill(); }
    if (clock.hour >= 21) { const bl = Math.floor(t * .4) % 7 === 0 ? 0 : 1; circle(c, 294, 240, 2.2 * bl, '#ffe08a'); circle(c, 306, 240, 2.2 * bl, '#ffe08a'); }
    // Theyyam night: the performer in red with the great headdress, torches, drummers, crowd
    if (f.theyyam && clock.hour >= 19) {
      for (const tx of [90, 340]) { rect(c, tx - 2, 500, 4, 60, P.teakDk); const fl = 1 + Math.sin(t * 11 + tx) * .15; glow(c, tx, 490, 40 * fl, '#ff8a2a', .6); c.fillStyle = P.flameCore; c.beginPath(); c.moveTo(tx - 7, 500); c.quadraticCurveTo(tx - 6, 480, tx, 466 - 10 * fl); c.quadraticCurveTo(tx + 6, 480, tx + 7, 500); c.fill(); c.fillStyle = P.flame; c.beginPath(); c.moveTo(tx - 3, 500); c.quadraticCurveTo(tx - 3, 486, tx, 478 - 6 * fl); c.quadraticCurveTo(tx + 3, 486, tx + 3, 500); c.fill(); }
      const px = 215 + Math.sin(t * 2.2) * 24, py = 560 + Math.abs(Math.sin(t * 4.4)) * -8;
      shadow(c, px, py + 4, 30, 8, .4);
      // skirt of palm fronds, red body paint, breastplate, the huge round mudi
      poly(c, [[px - 30, py], [px + 30, py], [px + 18, py - 40], [px - 18, py - 40]], '#c8322a'); for (let i = 0; i < 9; i++) line(c, px - 26 + i * 6.5, py, px - 30 + i * 7.5, py + 14, '#e0b43a', 2);
      rect(c, px - 12, py - 74, 24, 36, '#d8402c'); for (let i = 0; i < 4; i++) rect(c, px - 10, py - 70 + i * 8, 20, 2, '#f2c230');
      line(c, px - 12, py - 66, px - 34 + Math.sin(t * 6) * 8, py - 44, '#d8402c', 6); line(c, px + 12, py - 66, px + 34 - Math.sin(t * 6) * 8, py - 44, '#d8402c', 6);
      circle(c, px, py - 84, 11, '#d8402c'); c.fillStyle = '#f2c230'; c.fillRect(px - 8, py - 88, 16, 3); c.fillStyle = '#1a1a1a'; c.fillRect(px - 5, py - 86, 3, 2); c.fillRect(px + 2, py - 86, 3, 2);
      c.save(); c.translate(px, py - 96); for (let i = 0; i < 24; i++) { const a = Math.PI + i * (Math.PI / 23); c.strokeStyle = i % 2 ? '#c8322a' : '#f2c230'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 54, Math.sin(a) * 54); c.stroke(); } c.fillStyle = '#c8322a'; c.beginPath(); c.arc(0, 0, 50, Math.PI, 0); c.fill(); c.fillStyle = '#f2c230'; c.beginPath(); c.arc(0, 0, 40, Math.PI, 0); c.fill(); c.fillStyle = '#c8322a'; c.beginPath(); c.arc(0, 0, 28, Math.PI, 0); c.fill(); c.restore();
      for (let i = 0; i < 3; i++) person(c, 120 + i * 24, 620, .7, { sex: 'm', bare: true, mundu: '#d9d2c0' }, t + i);
      for (let i = 0; i < 9; i++) person(c, 30 + i * 40 + (i % 2) * 8, 690 + (i % 3) * 14, .7, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', flip: i % 2 }, t + i);
    }
  }
}
