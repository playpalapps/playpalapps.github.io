import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm } from '../art/draw.js';
import { person, grassTuft, lateriteWall, crowBird } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { haptics } from '../engine/haptics.js';

export class Pally extends Scene {
  constructor() {
    super('pally', 'Pally', 'പള്ളി'); this.horizon = 330; this.ground = '#8fb05a'; this.fireworks = []; this.fwT = 0; this.bellT = 0; this.pull = 0; this.tolls = 0;
    this.hotspots = [
      { x: 215, y: 540, r: 40, label: 'candle', action: () => this.candle() },
      { x: 140, y: 480, r: 44, label: 'bell rope', drag: p => this.rope(p), action: () => {} },
      { x: 330, y: 560, r: 36, label: 'grotto', action: () => { audio.sfx('chime'); say('The grotto of Our Lady: plastic flowers, a tin of candles, a prayer in Malayalam on a slab. Half the village lights one here on the way to the kadavu.', 'ഗ്രോട്ടോ'); remember('grotto', 'Lit a candle at the grotto by the pally. Velayudhan does too, on Fridays, and says it is for his knee.'); } },
      { x: 120, y: 620, r: 44, label: 'pulkoodu', enabled: () => fest().christmas, action: () => { audio.sfx('chime'); say('The crib: a thatched shed the size of a hen house, clay sheep, a river of blue paper, a star on a string. The children have added a KSRTC bus.', 'പുൽക്കൂട്', 6); remember('pulkoodu', 'The pulkoodu outside the pally at Christmas, with paper mountains and a toy bus parked at the manger. Someone had put a Maveli in it too.'); } },
      { x: 290, y: 640, r: 44, label: 'carols', enabled: () => fest().christmasWeek && clock.hour >= 19, action: () => this.carols() },
      { x: 215, y: 460, r: 30, label: 'achan', action: () => talk([['The vicar, cassock hitched up for the mud: “Come in, come in. The roof held through the rains, which is more than the panchayat office can say.”', 'അച്ചൻ'], ['“Perunnal in Makaram. Bring Ammini chechi; she pretends not to come, and comes.”']]) },
    ];
    this.exits = [{ side: 'left', y: 640, label: 'Kadavu', go: () => router.go('kadavu') }, { x: 50, y: 420, side: 'top', label: 'Masjid', go: () => router.go('masjid') }, { side: 'right', y: 640, label: 'Station', go: () => router.go('station') }, { x: 215, y: 720, side: 'bottom', label: 'Kadappuram', go: () => router.go('kadappuram') }];
  }
  candle() { this.busy = true; audio.sfx('match'); delay(.8, () => { this.busy = false; say('A thin candle in the sand tray before the altar, in a church that smells of lime wash, old wood and jasmine.', 'മെഴുകുതിരി'); remember('candle', 'Lit a candle in the pally. Amma used to, for Ravi’s exams, and then for Ravi’s ships. I did it for the house.'); }); }
  // The call to action: the rope from the left tower. Pull it down with your whole weight and let it rise; each full pull is one toll.
  rope(p) {
    const self = this; let moved = 0, armed = true; const y0 = p.y;
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.y - y0)); self.pull = Math.max(0, Math.min(1, (q.y - y0) / 70));
        if (self.pull >= 1 && armed) { armed = false; self.tolls++; self.bellT = 1; tween(self, { bellT: 0 }, 2.6, t => t); audio.sfx('churchBell'); haptics.medium(); if (self.tolls === 3) { say('Three. The sexton nods: that is the number for a visitor. The sound goes over the river to the kadavu and comes back off the palms.', 'പള്ളിമണി', 6); remember('pallybell', 'Rang the pally bell, three pulls, with the sexton watching to see I did it properly. It carries to the kadavu, where the fishermen cross themselves and the Hindus fold their hands and everyone knows it is six.'); } }
        if (self.pull < .3) armed = true; },
      end() { tween(self, { pull: 0 }, .5, t => t); if (moved < 10) say('Take the rope in both hands, pull it right down, and let it rise.', 'മണിക്കയർ'); }
    };
  }
  carols() { this.busy = true; clock.speed = 10; audio.hold('carols', .7, 7); say('The carol party arrives with a drum, a lantern on a pole, and a Santa in a cotton-wool beard sweating in Dhanu. You join the second line and get the words wrong in two languages.', 'കരോൾ', 7); delay(6.5, () => { clock.speed = 1; this.busy = false; remember('carols', 'Went round with the carol singers in Dhanu, the drum and the paper star and the Santa with the sweating beard. Every house gave something. Ammini chechi gave unniyappam.'); }); }
  ambience() { const f = fest(); const m = { birds: clock.phase === 'ravile' ? .3 : 0, wind: .2, crows: .15 }; if (f.christmasWeek && clock.hour >= 19) m.carols = .35; if (f.perunnal && clock.hour >= 17) { m.chenda = .5; m.murmur = .4; } return m; }
  tick(dt) { const f = fest(); if (f.perunnal && clock.hour >= 20 && clock.hour < 22) { this.fwT -= dt; if (this.fwT <= 0) { this.fwT = 1 + Math.random() * 2; this.fireworks.push({ x: 60 + Math.random() * 300, y: 60 + Math.random() * 120, t: 0, col: ['#ffd27a', '#ff8a5a', '#9ad0ff', '#f0f0ff'][Math.random() * 4 | 0] }); audio.sfx('firework'); } } for (const fw of this.fireworks) fw.t += dt; this.fireworks = this.fireworks.filter(fw => fw.t < 2); }
  glows() { const g = []; if (clock.daylight < .5) g.push({ x: 215, y: 520, r: 120, a: .7 }); if (fest().christmasWeek && clock.daylight < .5) g.push({ x: 215, y: 300, r: 160, a: .9 }); return g; }
  drawStatic(c, w, h) {
    const f = fest();
    rect(c, 0, 300, w, 60, vgrad(c, 0, 300, 360, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 10; i++) ellipse(c, hash(i + 13) * w, 318, 18, 14, P.cocoDeep);
    palm(c, 24, 360, 150, 20, 1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]); palm(c, w - 24, 370, 160, -18, 1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // the church: white facade with twin towers, arched door, cross, red tiled side roof
    const cx = 215; rect(c, cx - 90, 380, 180, 130, vgrad(c, 0, 380, 510, [[0, '#f6f1e6'], [1, '#e2dccb']]));
    for (const tx of [cx - 70, cx + 70]) { rect(c, tx - 22, 300, 44, 210, '#f6f1e6'); rect(c, tx - 22, 300, 44, 4, '#c8b89a'); poly(c, [[tx - 26, 300], [tx + 26, 300], [tx, 270]], '#c8322a'); rect(c, tx - 8, 330, 16, 26, '#2a1a1a'); c.fillStyle = '#2a1a1a'; c.beginPath(); c.arc(tx, 330, 8, Math.PI, 0); c.fill(); rect(c, tx - 1, 250, 2, 20, '#f1e4c8'); rect(c, tx - 6, 256, 12, 2, '#f1e4c8'); }
    poly(c, [[cx - 50, 380], [cx + 50, 380], [cx, 340]], '#f6f1e6'); rect(c, cx - 1.5, 316, 3, 26, '#c8b89a'); rect(c, cx - 8, 322, 16, 3, '#c8b89a');
    rect(c, cx - 20, 440, 40, 70, '#2a1a1a'); c.fillStyle = '#2a1a1a'; c.beginPath(); c.arc(cx, 440, 20, Math.PI, 0); c.fill(); rect(c, cx - 16, 450, 32, 60, '#4a2a1a'); circle(c, cx, 410, 12, '#9fc2cc'); for (let i = 0; i < 6; i++) line(c, cx, 410, cx + Math.cos(i * 1.047) * 12, 410 + Math.sin(i * 1.047) * 12, '#5a3a2a', 1);
    rect(c, cx - 98, 508, 196, 8, '#c8b89a'); for (let i = 0; i < 3; i++) rect(c, cx - 60 + i * 2, 516 + i * 6, 120 - i * 4, 6, i % 2 ? '#d9cfb8' : '#e2dccb');
    // bell in the left tower opening; grotto right; compound wall; sand path
    rect(c, 0, 534, w, h - 534, vgrad(c, 0, 534, h, [[0, '#dfd3b8'], [1, '#b8a888']])); poly(c, [[cx - 24, 534], [cx + 24, 534], [cx + 60, h], [cx - 60, h]], 'rgba(255,255,255,.18)');
    lateriteWall(c, 0, 760, w, 36, .3); for (let i = 0; i < 16; i++) grassTuft(c, hash(i + 70) * w, 540 + hash(i + 71) * 200, .7, '#6f9a44');
    poly(c, [[300, 580], [360, 580], [356, 540], [304, 540]], P.stoneDk); c.fillStyle = '#2a2a22'; c.beginPath(); c.arc(330, 556, 16, Math.PI, 0); c.fill(); rect(c, 314, 556, 32, 24, '#2a2a22'); rect(c, 326, 548, 8, 20, '#6fa0d0'); circle(c, 330, 546, 4, '#f0d8c0'); for (let i = 0; i < 5; i++) circle(c, 310 + i * 10, 584, 2, '#d8402c');
    rect(c, 40, 530, 8, 60, P.teak); rect(c, 30, 526, 28, 6, P.teakDk);
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest(), cx = 215;
    const bx = cx - 70, by = 348, sw = Math.sin(t * 7) * this.bellT * .5; c.save(); c.translate(bx, by - 14); c.rotate(sw); poly(c, [[-5, 0], [5, 0], [7, 14], [-7, 14]], P.brass); ellipse(c, 0, 14, 7, 2.5, P.brassDk); c.restore();
    // the bell rope: out of the tower slot, down the wall to a knot the sexton keeps at shoulder height
    { const ry = 470 + this.pull * 50, sway = Math.sin(t * 1.3) * 2 * (1 - this.pull); c.strokeStyle = '#c9b48a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx + 8, by + 6); c.quadraticCurveTo(140 + sway, (by + ry) / 2, 140, ry); c.stroke(); circle(c, 140, ry + 3, 3.5, '#a8906a'); circle(c, 140, ry + 9, 3, '#a8906a'); }
    if (clock.daylight < .5) { glow(c, cx, 480, 30, '#ffd27a', .5); for (let i = 0; i < 5; i++) circle(c, cx - 12 + i * 6, 500, 1.4, P.flameHi); }
    if (f.christmasWeek) { // paper star lanterns on the towers and strung across, a lit crib
      for (const [sx, sy, s] of [[cx - 70, 290, 1.2], [cx + 70, 290, 1.2], [cx, 330, 1], [90, 420, .8], [340, 420, .8]]) { line(c, sx, sy - 30 * s, sx, sy - 14 * s, '#c9b48a', 1); c.save(); c.translate(sx, sy); c.rotate(t * .2 + sx); c.fillStyle = clock.daylight < .5 ? '#ffd27a' : '#e0b43a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * .628, r = i % 2 ? 6 * s : 14 * s; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); if (clock.daylight < .5) glow(c, sx, sy, 22 * s, '#ffd27a', .5); }
      poly(c, [[80, 640], [160, 640], [150, 600], [90, 600]], '#8a7a4a'); rect(c, 84, 640, 72, 20, '#5a4632'); rect(c, 112, 646, 16, 10, '#f1e4c8'); for (let i = 0; i < 4; i++) circle(c, 92 + i * 16, 654, 4, '#f6f3ea'); rect(c, 118, 580, 2, 20, '#c9b48a'); if (clock.daylight < .5) glow(c, 120, 630, 30, '#ffd27a', .5);
    }
    if (f.perunnal) { for (let i = 0; i < 14; i++) { const x = cx - 98 + i * 15; c.fillStyle = i % 2 ? '#c8322a' : '#f2c230'; c.beginPath(); c.moveTo(x, 514); c.lineTo(x + 6, 528); c.lineTo(x + 12, 514); c.fill(); } for (let i = 0; i < 10; i++) person(c, 40 + i * 34 + (i % 2) * 8, 650 + (i % 3) * 14, .72, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: P.kasavu, flip: i % 2 }, t + i); for (const fw of this.fireworks) { const k = fw.t / 2, r = 10 + k * 60; c.save(); c.globalAlpha = (1 - k) * .9; for (let i = 0; i < 14; i++) { const a = i * .449; circle(c, fw.x + Math.cos(a) * r, fw.y + Math.sin(a) * r * .8, 1.6 + (1 - k) * 1.5, fw.col); } c.restore(); } }
    if (clock.hour >= 6 && clock.hour < 8) { person(c, cx - 30, 560, .8, { sex: 'f', top: '#f6f1e6', mundu: '#f6f1e6', pose: 'walk' }, t); person(c, cx + 36, 580, .8, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'walk', flip: true }, t + 1); }
    person(c, cx, 500, .85, { sex: 'm', top: '#f6f1e6', mundu: '#f6f1e6', skin: '#b08060' }, t);
    crowBird(c, cx + 44, 376, .9, t);
  }
}
