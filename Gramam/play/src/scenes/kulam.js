import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm } from '../art/draw.js';
import { water, kingfisher, fishShape, dragonfly, mist, lateriteWall, grassTuft, person, mangoTree } from '../art/lib.js';
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
import { drops } from '../engine/particles.js';

export class Kulam extends Scene {
  constructor() {
    super('kulam', 'Kulam', 'കുളം'); this.horizon = 300; this.ground = '#8fb05a'; this.fireflies = [20, 340, 400, 470]; this.ripples = []; this.fishT = 0; this.fish = Array.from({ length: 6 }, (_, i) => ({ x: 120 + i * 40, y: 560 + (i % 3) * 30, d: i % 2 ? 1 : -1, s: .7 + hash(i) * .5 }));
    this.hotspots = [
      { x: 215, y: 600, r: 60, label: 'bathe', action: () => this.bathe() },
      { x: 90, y: 520, r: 36, label: 'washing stone', action: () => this.wash() },
      { x: 300, y: 650, r: 40, label: 'feed the fish', action: () => this.feed() },
      { x: 320, y: 560, r: 30, label: 'ambal', action: () => this.lotus() },
      { x: 150, y: 470, r: 36, label: 'steps', action: () => this.sit() },
    ];
    this.exits = [{ side: 'left', y: 640, label: 'Thodi', go: () => router.go('thodi') }];
  }
  bathe() { this.busy = true; clock.speed = 10; audio.sfx('splash'); for (let i = 0; i < 5; i++) setTimeout(() => { audio.sfx('splash'); this.ripple(215, 600); }, 600 + i * 700); say(fest().mistMorning ? 'You go down the steps into water cold enough to stop your breath. Mist on the surface, the sky turning.' : 'Down the laterite steps, into the green water. You duck under three times and come up new.', 'കുളി', 5); delay(4.5, () => { clock.speed = 1; this.busy = false; state.bathedDay = clock.day; remember('bathe', 'Bathed in the kulam. Ducked under three times, the way we were taught. The water tastes of leaves and laterite, exactly as it did.'); }); }
  wash() { this.busy = true; for (let i = 0; i < 4; i++) setTimeout(() => { audio.sfx('wood'); audio.sfx('splash'); this.ripple(100, 540); }, i * 650); delay(2.8, () => { this.busy = false; say('You beat the mundus on the washing stone, the sound carrying across the water.', 'അലക്കുകല്ല്'); remember('wash', 'Washed clothes on the flat stone at the kulam, the thwack of wet cloth that used to mean morning.'); }); }
  feed() { this.busy = true; audio.sfx('sweep', { reps: 1 }); for (let i = 0; i < 8; i++) setTimeout(() => { this.ripple(280 + Math.random() * 60, 640 + Math.random() * 20); }, 200 + i * 180); this.fishT = 4; delay(1.5, () => { this.busy = false; say('A handful of puffed rice on the water. The fish come up in a silver crowd.', 'മീൻ'); remember('fish', 'Fed the fish in the kulam with pori. They know the sound of footsteps on the steps; they always have.'); }); }
  lotus() { found('ambal'); audio.sfx('chime'); say('You pick a pink ambal for the lamp. The stem drips all the way home.', 'ആമ്പൽ'); remember('lotus', 'Picked a water lily from the kulam. Amma put one before the lamp every Friday.'); }
  sit() { this.busy = true; clock.speed = 14; say('You sit on the top step with your feet in the water. A kingfisher watches the same spot you do.', 'പടവ്', 5); delay(4.5, () => { clock.speed = 1; this.busy = false; remember('steps', 'Sat on the kulam steps until the kingfisher caught something. Then sat a while longer.'); }); }
  tapFree(p) { const ph = clock.phase; if ((ph === 'uchha' || ph === 'ravile') && (Math.hypot(p.x - (160 + Math.sin(this.t * 1.1) * 60), p.y - (500 + Math.sin(this.t * 2.3) * 14)) < 20 || Math.hypot(p.x - (280 + Math.cos(this.t * .8) * 40), p.y - (530 + Math.sin(this.t * 1.7) * 10)) < 20)) { found('dragonfly'); return true; } if (clock.hour >= 5.5 && clock.hour < 7.5 && Math.hypot(p.x - 336, p.y - 470) < 20) { found('kingfisher'); return true; } if (ph === 'rathri' && state.rainT > .1 && (Math.hypot(p.x - 246, p.y - 694) < 20 || Math.hypot(p.x - 116, p.y - 714) < 20)) { found('frog'); return true; } return false; }
  ripple(x, y) { this.ripples.push({ x, y, r: 2, a: .8 }); }
  ambience() { const ph = clock.phase; return { frogs: ph === 'rathri' ? .5 : (ph === 'sandhya' ? .2 : 0), lapping: .15, koel: (clock.month === 7 || clock.month === 8) ? .3 : 0 }; }
  tick(dt) { for (const r of this.ripples) { r.r += dt * 26; r.a -= dt * .5; } this.ripples = this.ripples.filter(r => r.a > 0); for (const f of this.fish) { f.x += f.d * dt * (this.fishT > 0 ? 40 : 10); if (this.fishT > 0) { f.y += (640 - f.y) * dt; } if (f.x > 340) f.d = -1; if (f.x < 110) f.d = 1; } this.fishT = Math.max(0, this.fishT - dt); if (Math.random() < dt * .15) this.ripple(120 + Math.random() * 220, 540 + Math.random() * 180); }
  drawStatic(c, w, h) {
    // far bank: trees, laterite wall, mango tree
    rect(c, 0, 290, w, 74, vgrad(c, 0, 290, 364, [[0, '#9fc27a'], [1, P.paddy]]));
    for (let i = 0; i < 10; i++) ellipse(c, hash(i + 13) * w, 312, 18 + hash(i + 2) * 22, 16, P.cocoDeep);
    mangoTree(c, 316, 400, .85, 0, fest().mango);
    palm(c, 60, 420, 150, 30, 1.1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    lateriteWall(c, 0, 360, w, 36, .5);
    // grass banks
    rect(c, 0, 396, w, 70, vgrad(c, 0, 396, 466, [[0, '#8fb05a'], [1, '#6f9a44']]));
    for (let i = 0; i < 30; i++) grassTuft(c, hash(i + 90) * w, 410 + hash(i + 91) * 50, .8, i % 2 ? P.coco : P.cocoLt);
    // pond: laterite steps on the left going down into the water (kadavu), water fills the rest
    const wy = 500;
    rect(c, 0, 466, w, 40, P.laterite); rect(c, 0, 466, w, 3, P.lateriteDk);
    rect(c, 0, wy, w, h - wy, '#4f7f92');
    // stepped laterite on the left and front
    for (let i = 0; i < 5; i++) { const y = 466 + i * 18, x = 40 + i * 18; poly(c, [[0, y], [x + 120, y], [x + 120, y + 18], [0, y + 18]], i % 2 ? P.laterite : P.lateriteLt); rect(c, 0, y, x + 120, 3, P.lateriteDk); }
    rect(c, 0, 556, 230, 6, P.lateriteDk);
    // washing stone (flat dark slab) on the second step
    poly(c, [[70, 512], [120, 512], [126, 530], [64, 530]], P.stoneDk); poly(c, [[72, 508], [118, 508], [120, 512], [70, 512]], P.stone);
    // far wall of the pond (laterite) and overhanging roots
    rect(c, 230, 466, w - 230, 36, P.laterite); rect(c, 230, 466, w - 230, 3, P.lateriteDk);
    c.strokeStyle = '#7a6650'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = 250 + i * 28; c.beginPath(); c.moveTo(x, 466); c.quadraticCurveTo(x + 4, 490, x - 2, 520 + hash(i) * 10); c.stroke(); }
    // stick for the kingfisher
    line(c, 330, 520, 338, 470, '#8a6a4a', 2);
  }
  drawDynamic(c, w, h) {
    const t = this.t, wy = 500, ph = clock.phase;
    water(c, 0, wy, w, h - wy, t, clock.daylight > .5 ? ['#6f9c8e', '#3f6f78'] : ['#2f4a5a', '#1c2f3c'], clock.daylight > .5 ? '#cfe6e0' : null);
    // reflections of palms (dark vertical smudges) and moon
    c.globalAlpha = .18; ellipse(c, 70, 600, 10, 90, '#1f3d1c'); ellipse(c, 340, 620, 40, 30, '#1f3d1c'); c.globalAlpha = 1;
    if (clock.daylight < .4 && state.rainT < .3) { c.globalAlpha = (1 - clock.daylight) * .5 * clock.moon; ellipse(c, 200 + Math.sin(t * .5) * 2, 640, 18, 60, '#f3ecd2'); c.globalAlpha = 1; }
    // fish shadows
    for (const f of this.fish) fishShape(c, f.x, f.y, f.s, 'rgba(40,60,70,.55)', f.d);
    // water lilies
    for (const [lx, ly, s] of [[330, 560, 1], [300, 580, .8], [360, 600, .9], [250, 700, 1.1], [120, 720, .9]]) { ellipse(c, lx, ly, 16 * s, 8 * s, '#4f8a4a'); poly(c, [[lx + 2 * s, ly], [lx + 16 * s, ly - 2 * s], [lx + 14 * s, ly + 4 * s]], '#3f6f78'); if (s >= .9) { for (let k = 0; k < 6; k++) { const a = k * 1.047; ellipse(c, lx - 6 * s + Math.cos(a) * 4 * s, ly - 8 * s + Math.sin(a) * 2.5 * s, 4 * s, 2 * s, '#f0a0c0', a); } circle(c, lx - 6 * s, ly - 8 * s, 1.8 * s, '#f2c230'); } }
    // ripples
    for (const r of this.ripples) { c.strokeStyle = `rgba(255,255,255,${r.a * .5})`; c.lineWidth = 1; c.beginPath(); c.ellipse(r.x, r.y, r.r, r.r * .35, 0, 0, 7); c.stroke(); }
    kingfisher(c, 336 + Math.sin(t * 3) * .3, 470, 1);
    if (ph === 'uchha' || ph === 'ravile') { dragonfly(c, 160 + Math.sin(t * 1.1) * 60, 500 + Math.sin(t * 2.3) * 14, 1, t); dragonfly(c, 280 + Math.cos(t * .8) * 40, 530 + Math.sin(t * 1.7) * 10, .8, t + 1); }
    // Thiruvathira dawn: women bathing and singing
    if (fest().thiruvathira && clock.hour < 7) { for (let i = 0; i < 3; i++) person(c, 60 + i * 40, 540 + i * 6, .7, { sex: 'f', top: '#2d6b5a', mundu: P.kasavu, pose: 'stand' }, t); }
    if (fest().mistMorning) mist(c, 0, 420, w, 200, .55);
    // frogs at night: little eyes on the lily pads
    if (ph === 'rathri' && state.rainT > .1) for (const [fx, fy] of [[246, 694], [116, 714]]) { ellipse(c, fx, fy - 3, 5, 3, '#4f7a3a'); circle(c, fx - 2, fy - 5, 1, '#ffe08a'); circle(c, fx + 2, fy - 5, 1, '#ffe08a'); }
  }
}
