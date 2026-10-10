import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { dust } from '../engine/particles.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { haptics } from '../engine/haptics.js';

const TRUNK = ['Achan’s letters to Amma from the mill in Coimbatore, 1949, tied with a kasavu thread. “The food is terrible. Come soon. Do not come, it is terrible.”', 'A Mathrubhumi from the week Kerala became a state, 1956, the ink gone brown. Someone has circled the weather.', 'My school slate, with my name still on it in Ammamma’s hand. The frame has woodworm and so, apparently, does the name.', 'A bioscope: a tin box with a lens. Inside, twelve tiny views of Delhi, Agra, and one of Kovalam that someone put in later.', 'Ravi’s first drawing of a train. It has nine wheels and a face. It is a good train.', 'A brass kindi with a dent from the year the cow got into the house. Ammamma kept it as evidence.', 'Amma’s diary, 1961. I close it. Some things stay in the trunk.', 'A harmonium with a dead reed, Achan’s, which he played only when it rained.'];
export class Thattinpuram extends Scene {
  constructor() {
    super('thattinpuram', 'Thattinpuram', 'തട്ടിൻപുറം'); this.outdoor = false; this.lid = 0; this.idx = 0; this.key = -1; this.bellows = 0; this.notes = 0;
    this.hotspots = [
      { x: 110, y: 600, r: 50, label: 'Achan’s trunk', action: () => this.trunk() },
      { x: 300, y: 560, r: 36, label: 'bioscope', action: () => this.bioscope() },
      { x: 240, y: 660, r: 30, label: 'slate', action: () => { audio.sfx('slate'); say('You write your name on the old slate in chalk, under the one Ammamma wrote. The letters come out the same.', 'സ്ലേറ്റ്'); remember('slate', 'Found my school slate in the thattinpuram and wrote my name under Ammamma’s. Same hand, forty years apart.'); } },
      { x: 200, y: 180, r: 40, label: 'roof gap', action: () => this.gap() },
      { x: 330, y: 442, r: 44, label: 'harmonium', drag: p => this.play(p), action: () => {} },
    ];
    this.exits = [{ side: 'bottom', label: 'Ara · ladder down', go: () => router.go('ara') }];
  }
  // The call to action: press the keys, or slide along them. Nine keys in Mohanam from Achan's C; the fifth reed is dead and only breathes.
  play(p) {
    const self = this, NOTES = [0, 2, 4, 7, 9, 12, 14, 16, 19], DEAD = 4; let moved = 0; const x0 = p.x;
    const press = q => { const i = Math.max(0, Math.min(8, Math.floor((q.x - 300) / 6.7))); if (i === self.key) return; self.key = i; self.bellows = 1; self.notes++;
      audio.sfx('reed', { fr: 261.6 * Math.pow(2, NOTES[i] / 12), dur: .9, dead: i === DEAD }); haptics.soft();
      if (self.notes === 6) { say('Achan’s harmonium: one reed dead, two sour, the rest exactly him. You play the beginning of the only song you both knew and stop where he did.', 'ഹാർമോണിയം', 6); remember('harmonium', 'Pumped Achan’s harmonium in the attic and found the song with my fingers before my head. One reed dead, two sour, the rest exactly him.'); } };
    press(p);
    return { move(q) { moved = Math.max(moved, Math.abs(q.x - x0)); press(q); }, end() { self.key = -1; } };
  }
  trunk() { this.busy = true; audio.sfx('wood'); tween(this, { lid: 1 }, .8, t => t, () => { const it = TRUNK[this.idx % TRUNK.length]; this.idx++; say(it, 'പെട്ടി', 7); remember('trunk_' + ((this.idx - 1) % TRUNK.length), 'From Achan’s trunk in the thattinpuram: ' + it); delay(3, () => tween(this, { lid: 0 }, .6, t => t, () => { this.busy = false; })); }); }
  bioscope() { this.busy = true; audio.sfx('tap'); delay(1.2, () => { this.busy = false; const v = ['the Taj Mahal, slightly pink', 'the Red Fort with a flag', 'a Bombay tram', 'Kovalam beach, which somebody added', 'the Howrah bridge at an angle', 'a ship, maybe the one Ravi took'][state.days % 6]; say(pick(`Eye to the lens, click the lever: ${v}. Click: the next. The whole world in a tin box for one paisa a look.`, `ലെൻസിൽ കണ്ണുവെച്ച്, ലിവർ തിരിച്ചു: ${t(v)}. ക്ലിക്ക്: അടുത്തത്. ഒരു പൈസയ്ക്ക് ഒരു നോട്ടം, തകരപ്പെട്ടിയിൽ ലോകം മുഴുവൻ.`), 'ബയോസ്കോപ്പ്', 6); remember('bioscope', 'The bioscope in the attic still works. Twelve views of the world, a paisa each, and I would still pay.'); }); }
  gap() { const night = clock.daylight < .4; if (night && clock.hour >= 22 && !state.finds.shooting_star && Math.random() < .5) { this.busy = true; delay(2.2, () => { this.busy = false; found('shooting_star'); say('A streak across the gap, gone before the wish is finished. You wish anyway.', 'കൊള്ളിമീൻ'); }); return; } this.busy = true; clock.speed = night ? 10 : 6; say(night ? 'Through the gap where a tile slipped: three stars, a bat, the top of the plavu, and the smell of the whole night coming in.' : 'A tile has slipped. A blade of sunlight stands in the dust like a thing you could lean on.', 'ഓട്', 5); delay(4.5, () => { clock.speed = 1; this.busy = false; remember('roofgap', 'Lay on the attic floor under the gap in the tiles, the way Ravi and I did, and counted the stars that fit through it. Three. Always three.'); }); }
  ambience() { return { wind: .12, leaves: .06, crickets: clock.phase === 'rathri' ? .2 : 0, rain: state.rainT * .5 }; }
  tick(dt) { if (clock.daylight > .3 && Math.random() < dt * 6) dust(this.ps, 150, 250, 180, 520, 1); }
  glows() { return clock.daylight < .4 ? [{ x: 200, y: 180, r: 90, a: .5 }, { x: 60, y: 700, r: 90, a: .6 }] : []; }
  drawStatic(c, w, h) {
    // the underside of a tiled roof: rafters sloping to a ridge, the floor of rough planks, old things everywhere
    rect(c, 0, 0, w, h, vgrad(c, 0, 0, h, [[0, '#17100a'], [.5, '#2a1c12'], [1, '#3a2a1c']]));
    c.strokeStyle = '#4a3020'; c.lineWidth = 5; for (let i = 0; i < 9; i++) { const x = i * 46; c.beginPath(); c.moveTo(x, 40); c.lineTo(185, 500 - Math.abs(x - 185) * 1.2); c.stroke(); }
    for (let i = 0; i < 7; i++) { c.strokeStyle = '#3a2416'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 90 + i * 60); c.lineTo(w, 90 + i * 60); c.stroke(); }
    // tiles seen from below: rows of curved shadows
    c.fillStyle = 'rgba(120,70,40,.25)'; for (let r = 0; r < 12; r++) for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(i * 22 + (r % 2) * 11, 30 + r * 40, 10, 0, Math.PI); c.fill(); }
    // the gap with light
    rect(c, 186, 160, 28, 40, clock.daylight > .4 ? '#fff2c0' : '#1c2b45');
    // floor planks
    rect(c, 0, 520, w, h - 520, vgrad(c, 0, 520, h, [[0, '#5a4632'], [1, '#3a2a1c']])); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.5; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 540 + i * 28); c.lineTo(w, 540 + i * 28); c.stroke(); }
    // cobwebs
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = .8; for (let k = 0; k < 3; k++) { const ox = [20, 340, 60][k], oy = [60, 90, 440][k]; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(i * .5) * 50, oy + Math.sin(i * .5) * 50); c.stroke(); } for (let r = 10; r < 50; r += 10) { c.beginPath(); c.arc(ox, oy, r, 0, 2.6); c.stroke(); } }
    // Achan's trunk, a harmonium, a broken clock, slate, bioscope box, a rolled paaya, umbrellas
    const tx = 60, ty = 600; shadow(c, tx + 50, ty + 46, 60, 10, .4); rect(c, tx, ty, 100, 46, '#4a2a1a'); rect(c, tx, ty, 100, 6, '#6b4226'); for (let i = 0; i < 3; i++) rect(c, tx + 8 + i * 38, ty + 2, 4, 42, P.brassDk); circle(c, tx + 50, ty + 24, 5, P.brass);
    roundRect(c, 300, 420, 60, 36, 3, '#3a2a1c'); for (let i = 0; i < 9; i++) rect(c, 304 + i * 6, 440, 4, 12, i % 2 ? '#e8dcc0' : '#1a1a1a'); rect(c, 300, 414, 60, 6, '#5a3a22');
    rect(c, 230, 646, 30, 24, '#2a2a22'); rect(c, 233, 649, 24, 18, '#1a1a1a'); c.fillStyle = 'rgba(255,255,255,.6)'; c.font = '7px serif'; c.fillText('രവി', 236, 661);
    roundRect(c, 284, 546, 36, 26, 3, '#4a4a50'); circle(c, 302, 559, 7, '#1a1a1a'); circle(c, 302, 559, 4, '#9fc2cc'); rect(c, 318, 552, 6, 4, '#c8322a');
    circle(c, 330, 330, 18, '#e8dcc0'); line(c, 330, 330, 330, 318, '#222', 1.5); line(c, 330, 330, 336, 334, '#222', 1); rect(c, 310, 348, 40, 4, '#5a3a22'); c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.arc(330, 330, 18, 0, 7); c.stroke();
    ellipse(c, 200, 700, 40, 14, '#cdb98c'); ellipse(c, 200, 700, 8, 14, '#a89a6a');
    for (let i = 0; i < 3; i++) { line(c, 30 + i * 12, 440, 36 + i * 12, 540, '#1e1e1e', 2); c.fillStyle = '#1e1e1e'; c.beginPath(); c.arc(30 + i * 12, 440, 10, Math.PI, 0); c.fill(); }
    // a bat hanging from a rafter
    poly(c, [[250, 96], [262, 96], [256, 120]], '#0a0a0a'); circle(c, 256, 96, 4, '#0a0a0a');
    rect(c, 20, 690, 60, 8, P.teak); rect(c, 60, 750, 6, 50, P.teak); rect(c, 100, 750, 6, 50, P.teak); for (let i = 0; i < 2; i++) rect(c, 60, 760 + i * 20, 46, 4, P.teakLt); // ladder top
  }
  drawDynamic(c, w, h) {
    const t = this.t;
    // harmonium: the pressed key sinks, the bellows swell and sigh back
    this.bellows = Math.max(0, this.bellows - .016); if (this.key >= 0) { rect(c, 304 + this.key * 6, 441, 4, 11, this.key % 2 ? '#c8bca0' : '#2a2a2a'); } rect(c, 302, 456, 56, 3 + this.bellows * 5, '#2a1a10'); rect(c, 300, 459 + this.bellows * 5, 60, 2, '#1a1008');
    if (clock.daylight > .4) { c.save(); c.globalAlpha = .18; poly(c, [[186, 200], [214, 200], [250, 560], [150, 560]], '#fff2c0'); c.restore(); }
    if (this.lid > 0) { c.save(); c.translate(60, 600); c.rotate(-this.lid * 1.4); rect(c, 0, -6, 100, 8, '#6b4226'); c.restore(); c.globalAlpha = this.lid; rect(c, 70, 586, 80, 14, '#e8dcc0'); rect(c, 80, 580, 40, 8, '#d9c9a0'); c.globalAlpha = 1; }
    // mouse
    const mx = 150 + Math.sin(t * .4) * 100; ellipse(c, mx, 790, 6, 3.5, '#5a5a5a'); circle(c, mx + 6, 788, 2.5, '#5a5a5a'); line(c, mx - 6, 790, mx - 16, 787, '#5a5a5a', 1);
  }
}
