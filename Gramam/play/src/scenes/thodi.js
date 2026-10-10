import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, palm, tileRoof, bananaPlant } from '../art/draw.js';
import { jackfruitTree, konnaTree, tapioca, cow, hen, dog, crowBird, butterfly, lateriteWall, grassTuft, hibiscus } from '../art/lib.js';
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
import { add } from '../game/pantry.js';
import { dust } from '../engine/particles.js';
import { anyDue, playBeat } from '../game/people.js';
import { person } from '../art/lib.js';
import { haptics } from '../engine/haptics.js';

export class Thodi extends Scene {
  constructor() {
    super('thodi', 'Thodi', 'തൊടി'); this.horizon = 330; this.ground = '#8fb05a'; this.fireflies = [20, 340, 440, 700]; this.milkT = 0; this.hens = [{ x: 200, y: 700, f: false, t: 0 }, { x: 240, y: 720, f: true, t: 2 }, { x: 170, y: 735, f: false, t: 4 }];
    this.hotspots = [
      { x: 90, y: 560, r: 50, label: 'Lakshmi', action: () => this.cow() },
      { x: 200, y: 640, r: 60, label: 'chool · sweep the leaves', enabled: () => !state.thodiSwept, drag: p => this.sweepLeaves(p), action: () => {} },
      { x: 40, y: 560, r: 30, label: 'thengu · a fallen coconut', enabled: () => state.coconutDay !== clock.day, action: () => { state.coconutDay = clock.day; add('coconut', 1); audio.sfx('wood'); haptics.light(); say('A coconut came down in the night, as one does. Into the kitchen with it.', 'തേങ്ങ'); remember('coconut', 'The thengu drops one or two a week, usually at night, usually near the cowshed, so that Lakshmi can look offended.'); } },
      { x: 330, y: 390, r: 40, label: 'Ammini chechi · over the wall', enabled: () => anyDue('ammini') && clock.hour >= 7 && clock.hour < 19, due: () => true, action: () => playBeat('ammini') },
      { x: 140, y: 440, r: 40, label: 'laundry line', enabled: () => !state.laundryUp, action: () => this.laundry() },
      { x: 300, y: 500, r: 40, label: 'plavu', action: () => this.jackfruit() },
      { x: 340, y: 610, r: 36, label: 'vazha', action: () => this.banana() },
      { x: 205, y: 712, r: 40, label: 'kozhi', enabled: () => state.eggsDay !== clock.day, action: () => this.eggs() },
      { x: 300, y: 690, r: 34, label: 'kappa', action: () => this.tapioca() },
      { x: 236, y: 500, r: 34, label: 'konna', enabled: () => fest().konna > .8, action: () => { audio.sfx('chime'); found('konna'); say('You pick a spray of konna for the kani. The whole tree is gold.', 'കണിക്കൊന്ന'); remember('konna', 'The kanikonna behind the house in full bloom for Vishu, right on time, as it is every year, which is the miracle.'); } },
    ];
    this.exits = [{ side: 'left', y: 560, label: 'Poomukham', go: () => router.go('poomukham') }, { side: 'right', y: 640, label: 'Kulam', go: () => router.go('kulam') }];
  }
  cow() {
    const h = clock.hour;
    if (state.fedCowDay !== clock.day) { this.busy = true; audio.sfx('sweep', { reps: 2 }); delay(1.2, () => { state.fedCowDay = clock.day; audio.sfx('moo'); this.busy = false; say('You bring Lakshmi an armful of grass and a bucket of kanji water. She eats like she has been wronged.', 'ലക്ഷ്മി'); remember('cow', 'The cow is still called Lakshmi. Every cow this house has had has been called Lakshmi. She has her grandmother’s stubbornness.'); }); return; }
    if (state.milkedDay !== clock.day && h >= 5.5 && h < 9.5) { this.busy = true; this.milkT = 0; tween(this, { milkT: 1 }, 3, t => t, () => { state.milkedDay = clock.day; add('milk', 2); this.busy = false; audio.sfx('pour'); say('Warm milk, frothing into the brass vessel, Lakshmi chewing and looking at the paddy.', 'പാൽ'); remember('milk', 'Milked Lakshmi myself. She allowed it, barely. The froth on the milk, the smell of the shed, the hens underfoot.'); }); for (let i = 0; i < 6; i++) setTimeout(() => audio.sfx('splash'), 300 + i * 420); return; }
    audio.sfx('moo'); say(state.milkedDay === clock.day ? 'Lakshmi has given her milk for today. She flicks an ear at you.' : 'Lakshmi is fed. Milking is at dawn.', 'ലക്ഷ്മി');
  }
  laundry() { this.busy = true; audio.sfx('sweep', { reps: 3 }); delay(1.4, () => { state.laundryUp = true; state.laundryDay = clock.day; this.busy = false; say(state.rainT > .2 ? 'You hang the mundus on the line anyway. The rain will do what it does.' : 'Mundus and thorthus on the line, snapping in the wind off the paddy.', 'അലക്ക്'); remember('laundry', 'Hung the washing between the plavu and the pole. Amma always said the smell of sun on a mundu was the smell of the house.'); }); }
  jackfruit() { const f = fest(); if (!f.jackfruit) { say('The plavu is between seasons. Chakka comes in Medam.', 'പ്ലാവ്'); return; } if (state.pluckedDay === clock.day) { say('One chakka a day is enough for any house.', 'ചക്ക'); return; } this.busy = true; audio.sfx('wood'); delay(1, () => { state.pluckedDay = clock.day; add('jackfruit', 1); this.busy = false; say('A ripe chakka, heavy as a child, the smell announcing itself from the ground up.', 'ചക്ക'); remember('chakka', 'Took a chakka from the plavu, the old tree by the cowshed. The squirrels had tested it first and approved.'); }); }
  banana() { if (state.days % 3 !== 0 && (state.pantry.banana || 0) > 2) { say('The next bunch is still green. Give it a few days.', 'വാഴ'); return; } this.busy = true; audio.sfx('wood'); delay(.9, () => { add('banana', 3); this.busy = false; say('A hand of ripe palayankodan from the vazha. The crows watched the whole operation.', 'പഴം'); remember('banana', 'Cut a bunch from the vazha. Each plant fruits once and then you cut it down and the baby beside it takes over. Amma used to say that about families.'); }); }
  eggs() { this.busy = true; audio.sfx('eggs'); delay(.8, () => { state.eggsDay = clock.day; add('eggs', 2); this.busy = false; say('Two warm eggs from under the hen in the coconut-husk nest. She complains the whole time.', 'മുട്ട'); remember('eggs', 'Eggs from the hens, which Ammini chechi says are hers but which live here.'); }); }
  tapioca() { if (state.days % 2 === 1 && (state.pantry.tapioca || 0) > 1) { say('Let the kappa grow a little more.', 'കപ്പ'); return; } this.busy = true; audio.sfx('sweep', { reps: 2 }); delay(1.2, () => { add('tapioca', 2); this.busy = false; say('You pull a kappa plant and shake the red earth off three fat tubers.', 'കപ്പ'); remember('kappa', 'Pulled kappa from the patch behind the cowshed. The soil here is red enough to stain, and it has stained everything I own.'); }); }
  bfly(t) { return [[220 + Math.sin(t * .7) * 30, 580 + Math.sin(t * 1.9) * 12, 'butterfly_yellow'], [320 + Math.cos(t * .5) * 24, 640 + Math.sin(t * 1.3) * 10, 'butterfly_white']]; }
  tapFree(p) { for (const [x, y, id] of this.bfly(this.t)) if (Math.hypot(p.x - x, p.y - y) < 20) { found(id); return true; } if (Math.hypot(p.x - 210, p.y - 592) < 22) { found('chembarathi'); return true; } if (clock.hour >= 7 && clock.hour < 10 && Math.hypot(p.x - 292, p.y - 520) < 20) { found('squirrel'); return true; } return false; }
  ambience() { return { hens: .35, cowshed: .4, koel: (clock.month === 7 || clock.month === 8) ? .3 : 0 }; }
  tick(dt) { for (const hn of this.hens) { hn.t += dt; if (Math.random() < dt * .3) { hn.f = !hn.f; } hn.x += (hn.f ? -1 : 1) * dt * 4; if (hn.x < 150) hn.f = false; if (hn.x > 270) hn.f = true; } if (clock.phase === 'uchha' && Math.random() < dt) dust(this.ps, 100, 400, 350, 500, 1); }
  drawStatic(c, w, h) {
    const f = fest();
    // far: treeline and the back of neighbouring parambu
    rect(c, 0, 300, w, 60, vgrad(c, 0, 300, 360, [[0, '#9fc27a'], [1, P.paddy]]));
    for (let i = 0; i < 12; i++) ellipse(c, hash(i + 3) * w, 322, 16 + hash(i + 8) * 20, 14, P.cocoDeep);
    palm(c, 40, 360, 120, 18, .95, [P.teakLt, P.teakDk, P.cocoDk, P.coco]); palm(c, w - 30, 370, 140, -14, .9, [P.teakLt, P.teakDk, P.cocoDeep, P.cocoDk]);
    // back wall of the house (left) with the kitchen window and a lean-to cowshed
    rect(c, 0, 250, 170, 160, vgrad(c, 0, 250, 410, [[0, P.limeShade], [1, P.limeDk]])); tileRoof(c, -10, 226, 190, 36, P.tile, P.tileLt, P.tileDk);
    // cowshed: thatched lean-to with wooden posts
    poly(c, [[16, 432], [176, 432], [160, 376], [32, 376]], '#a08a52'); for (let i = 0; i < 16; i++) line(c, 20 + i * 10, 432, 34 + i * 9, 378, 'rgba(70,55,20,.4)', 1.2); rect(c, 30, 374, 132, 5, P.teakDk);
    rect(c, 20, 430, 150, 6, P.teakDk); for (const px of [28, 160]) rect(c, px, 436, 8, 130, P.teak);
    rect(c, 36, 436, 124, 130, '#4a3828'); rect(c, 36, 436, 124, 50, '#3a2a1c'); // dark interior
    for (let i = 0; i < 8; i++) rect(c, 40 + i * 15, 520, 12, 46, i % 2 ? '#8a7a4a' : '#9a8a5a'); // hay
    // laterite boundary wall on the right
    lateriteWall(c, 250, 340, w - 250, 70, .4);
    // ground: red earth with grass patches
    rect(c, 0, 566, w, h - 566, vgrad(c, 0, 566, h, [[0, P.earthLt], [.5, P.earth], [1, P.earthDk]]));
    rect(c, 0, 410, 250, 160, vgrad(c, 0, 410, 570, [[0, '#8fb05a'], [1, P.earthLt]])); rect(c, 170, 410, w, 160, vgrad(c, 0, 410, 570, [[0, '#8fb05a'], [1, P.earthLt]]));
    for (let i = 0; i < 40; i++) grassTuft(c, hash(i + 70) * w, 430 + hash(i + 71) * 300, .7 + hash(i) * .6, i % 2 ? P.coco : P.cocoLt);
    // jackfruit tree (right of centre), konna (centre), banana clump (right), tapioca patch (centre bottom)
    jackfruitTree(c, 300, 560, .95);
    konnaTree(c, 236, 560, .9, f.konna);
    bananaPlant(c, 345, 630, 1.15, P.cocoDk, P.cocoLt); bananaPlant(c, 362, 660, .85, P.cocoDk, P.coco);
    // hanging banana bunch
    poly(c, [[338, 572], [350, 572], [352, 612], [336, 612]], '#7fa65a'); for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) ellipse(c, 338 + k * 6, 578 + r * 9, 3.5, 2.2, r % 2 ? '#9fc26a' : '#8fb25a');
    for (let i = 0; i < 6; i++) tapioca(c, 270 + i * 16 + (i % 2) * 6, 700 + (i % 3) * 10, .9);
    // laundry line pole
    rect(c, 60, 390, 4, 150, P.teakDk); line(c, 62, 400, 276, 440, '#e8dcc0', 1.2);
    hibiscus(c, 210, 600, .9);
    // clay pots stacked by the wall, cow dung cakes drying on the wall
    for (let i = 0; i < 3; i++) { ellipse(c, 24 + i * 2, 612 - i * 14, 14 - i * 2, 12 - i * 2, i % 2 ? P.clay : P.clayLt); }
    for (let i = 0; i < 6; i++) circle(c, 262 + i * 22, 352, 7, '#6a5a3a');
    // path
    ellipse(c, 200, 640, 90, 30, 'rgba(255,230,190,.12)');
  }
  sweepLeaves(p) {
    const self = this; let lastX = p.x, dir = 0, moved = 0; if (this.sweepP === undefined) this.sweepP = 0; this.broomX = p.x; this.broomOn = true;
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.x - p.x)); self.broomX = Math.max(120, Math.min(300, q.x)); const d = Math.sign(q.x - lastX); if (d && d !== dir && Math.abs(q.x - lastX) > 8) { if (dir) { self.sweepP = Math.min(1, self.sweepP + 1 / 7); audio.sfx('sweep', { reps: 1 }); haptics.soft(); } dir = d; lastX = q.x; }
        if (self.sweepP >= 1) { self.gesture = null; self.broomOn = false; state.thodiSwept = true; self.sweepP = 0; haptics.success(); say('The thodi path is clear of leaves. By tomorrow the plavu will have its opinion about that.', 'ചൂല്'); remember('thodisweep', 'Swept the leaves off the thodi path. The plavu drops more in an hour than I clear in a morning; this is a conversation we will be having all year.'); } },
      end() { self.broomOn = false; if (moved < 10) say('Sweep the leaves off the path, side to side.', 'ചൂല്'); }
    };
  }
  drawDynamic(c, w, h) {
    if (!state.thodiSwept) { const n = Math.ceil(14 * (1 - (this.sweepP || 0))); for (let i = 0; i < n; i++) { const k = hash(i + 400 + clock.day), fx = 120 + hash(i + 410) * 180 + (this.sweepP || 0) * 50 * (hash(i) - .5), fy = 600 + hash(i + 420) * 90; c.save(); c.translate(fx, fy); c.rotate(hash(i + 430) * 6); c.fillStyle = ['#8a7a3a', '#b89a4a', '#6f8a3a', '#7a5a2a'][i % 4]; c.beginPath(); c.ellipse(0, 0, 6 + k * 3, 2.5, 0, 0, 7); c.fill(); c.restore(); } }
    if (this.broomOn) { c.save(); c.translate(this.broomX, 650); c.rotate(.5); line(c, 0, -60, 0, 0, P.teakHi, 3); c.strokeStyle = '#c9a46a'; c.lineWidth = 1.2; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(-10 + i * 2.2, 26); c.stroke(); } c.restore(); }
    if (state.coconutDay !== clock.day) { c.fillStyle = '#6b4a2a'; c.beginPath(); c.ellipse(40, 566, 9, 7, .3, 0, 7); c.fill(); c.fillStyle = '#8a6a3a'; c.beginPath(); c.ellipse(37, 563, 4, 2.5, .3, 0, 7); c.fill(); }
    if (anyDue('ammini') && clock.hour >= 7 && clock.hour < 19) { c.save(); c.beginPath(); c.rect(250, 300, w - 250, 40); c.clip(); person(c, 330, 396, .8, { sex: 'f', top: '#b8443a', mundu: '#f3ecd8' }, this.t); c.restore(); }
    const t = this.t;
    cow(c, 90, 566, .9, t, false);
    if (this.milkT > 0 && this.milkT < 1) { rect(c, 118, 556, 12, 12, P.brass); rect(c, 118, 556, 12, 2, P.brassLt); }
    // laundry on the line
    if (state.laundryUp) { for (let i = 0; i < 4; i++) { const x = 90 + i * 50, y = 405 + i * 8, sw = Math.sin(t * 1.5 + i) * 4; poly(c, [[x, y], [x + 36, y + 6], [x + 36 + sw, y + 60], [x + sw, y + 54]], i % 2 ? P.kasavu : '#e6d7b5'); if (i % 2 === 0) rect(c, x + sw, y + 50, 36, 3, P.gold); } }
    // hens pecking
    for (const hn of this.hens) hen(c, hn.x, hn.y, .9, hn.t, hn.f, hn === this.hens[1] ? '#2a2a2a' : '#8a4a2a');
    for (let i = 0; i < 3; i++) hen(c, 212 + i * 9, 724 + (i % 2) * 4, .35, t + i, false, '#e8c060'); // chicks
    dog(c, 150, 600, .9, t, true);
    // crows on the wall
    crowBird(c, 300, 338, 1, t); if (Math.sin(t * .3) > 0) crowBird(c, 380, 338, .9, t);
    butterfly(c, 220 + Math.sin(t * .7) * 30, 580 + Math.sin(t * 1.9) * 12, 1, t); butterfly(c, 320 + Math.cos(t * .5) * 24, 640 + Math.sin(t * 1.3) * 10, .8, t + 2, '#e8e8f0');
    if (clock.hour >= 7 && clock.hour < 10) { const sy = 520 + Math.sin(t * 1.5) * 6; ellipse(c, 292, sy, 7, 4, '#8a6a4a'); circle(c, 297, sy - 3, 3, '#8a6a4a'); c.strokeStyle = '#8a6a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(285, sy); c.quadraticCurveTo(278, sy - 12, 284, sy - 18); c.stroke(); c.strokeStyle = '#e8dcc0'; c.lineWidth = .8; for (let i = -1; i <= 1; i++) line(c, 286, sy + i * 1.6, 298, sy + i * 1.6, '#e8dcc0', .7); }
  }
}
