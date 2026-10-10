import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { hurricaneLamp, kindi, kolambi } from '../art/lib.js';
import { state, remember, note } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { dust } from '../engine/particles.js';
import { add } from '../game/pantry.js';
import { readAmmaPage, ammaPagesAvailable } from '../game/arc.js';
import { openText } from '../ui/letter.js';

const PHOTOS = ['Amma on the verandah, squinting, the year the well was dug.', 'Achan in a white shirt beside the new Murphy radio, prouder of the radio.', 'Ravi and me on the kinar wall, feet dangling, forbidden.', 'The whole tharavad at a wedding, forty people, one goat that wandered in.', 'Ammamma with the brass para, measuring paddy, measuring us.'];
export class Ara extends Scene {
  constructor() {
    super('ara', 'Ara', 'അറ'); this.outdoor = false; this.pettiOpen = 0; this.incense = 0;
    this.hotspots = [
      { x: 270, y: 600, r: 56, label: 'kattil', action: () => this.sleep() },
      { x: 120, y: 660, r: 36, label: 'petti', action: () => this.petti() },
      { x: 90, y: 470, r: 44, label: 'pathayam', action: () => this.paddy() },
      { x: 300, y: 330, r: 30, label: 'Amma', enabled: () => this.incense <= 0, action: () => this.pray() },
      { x: 62, y: 380, r: 30, label: 'Amma\u2019s diary', enabled: () => state.ammaRead < ammaPagesAvailable(), action: () => { const pg = readAmmaPage(); if (pg) openText('Amma, a page of the year', pg); } },
      { x: 200, y: 690, r: 40, label: 'Vishukkani', enabled: () => (fest().vishuEve && !state.festival.kaniSet) || (fest().vishu && state.festival.kaniSet && state.festival.kaniSeen !== clock.day), action: () => this.kani() },
    ];
    this.exits = [{ side: 'right', y: 560, label: 'Nadumuttam', go: () => router.go('nadumuttam') }, { x: 330, y: 120, side: 'top', label: 'Thattinpuram · ladder', go: () => router.go('thattinpuram') }];
  }
  sleep() {
    const h = clock.hour;
    if (h >= 9 && h < 18) { this.busy = true; clock.speed = 30; say('You lie down on the paaya for a while. The fan of the palm leaf, the wall, the dark.', 'ഉച്ചമയക്കം', 4); delay(3, () => { clock.speed = 1; this.busy = false; }); return; }
    if (fest().vishuEve && !state.festival.kaniSet) { say('Set up the kani first, or you will see the wrong thing in the morning.', 'വിഷുക്കണി'); return; }
    audio.sfx('wood'); did('sleep'); router.sleep(fest().vishuEve ? 'You sleep with the kani ready in the corner. Ammini chechi will wake you with her hands over your eyes.' : state.rainT > .3 ? 'You sleep under the sound of rain on the tiles, which is the best sound.' : 'You sleep. The house creaks and settles around you.');
    remember('sleep', 'Slept in the ara on Achan’s kattil. The mattress is a paaya and a thin cotton sheet and I slept like a stone.');
  }
  petti() {
    this.busy = true; audio.sfx('wood'); tween(this, { pettiOpen: 1 }, .8, t => t, () => { const i = (state.days + state.lettersRead) % PHOTOS.length; say('A photograph: ' + PHOTOS[i], 'പെട്ടി', 5); if (!remember('photo_' + i, 'From the petti: ' + PHOTOS[i])) {} delay(2.5, () => tween(this, { pettiOpen: 0 }, .6, t => t, () => { this.busy = false; })); });
  }
  paddy() {
    this.busy = true; audio.sfx('grind', { reps: 2 }); delay(1.4, () => { add('paddy', 1); this.busy = false; say('You open the pathayam and measure out a para of paddy. The smell of the granary: dust, husk, mice.', 'പത്തായം'); remember('pathayam', 'The pathayam still has last year’s paddy. Ammamma could tell a good year from a bad one by the sound the lid made.'); });
  }
  pray() {
    this.busy = true; audio.sfx('match'); delay(.6, () => { this.incense = 1; audio.sfx('chime'); this.busy = false; say('You light a stick of sambrani before Amma’s photograph. The sandalwood garland has gone pale.', 'അമ്മ'); remember('amma', 'Lit incense for Amma. Her photograph is from before I was born; she is laughing at something outside the frame.'); });
  }
  kani() {
    const f = fest();
    if (f.vishuEve) { this.busy = true; audio.sfx('chime'); delay(1.2, () => { state.festival.kaniSet = true; this.busy = false; say('In the uruli: raw rice, a golden kani vellari, konna flowers, halves of coconut, mango, jackfruit, betel and areca, the val kannadi, a new mundu, coins, and the lamp. Ready.', 'വിഷുക്കണി ഒരുക്കി', 7); remember('kani', 'Set up the Vishukkani the night before, every item from memory, the Aranmula mirror last. Checked it four times.'); }); }
    else { this.busy = true; delay(.8, () => { state.festival.kaniSeen = clock.day; this.busy = false; audio.sfx('coin'); say('Eyes closed, led by memory, then opened: gold konna, the lamp, your own face in the mirror. A good year begins.', 'വിഷുക്കണി കണ്ടു', 6); remember('kaniseen', 'Vishu morning. Saw the kani: konna, lamp, cucumber, my own face in the val kannadi, older than I expected. Kaineettam from Ammini chechi, one rupee.'); }); }
  }
  tapFree(p) { if (clock.daylight < .4 && Math.hypot(p.x - 104, p.y - 352) < 22) { found('gecko'); return true; } return false; }
  tick(dt) { this.incense = Math.max(0, this.incense - dt / 120); if (this.incense > 0 && Math.random() < dt * 3) this.ps.emit(1, () => ({ x: 300 + (Math.random() - .5) * 4, y: 352, vx: (Math.random() - .5) * 3, vy: -8 - Math.random() * 6, life: 4, max: 4, g: -1, update(p, d) { p.vx += (Math.random() - .5) * 4 * d; }, draw(c, p) { c.globalAlpha = (p.life / p.max) * .25; c.fillStyle = '#e8e0d8'; c.beginPath(); c.arc(p.x, p.y, Math.max(.1, 2 + (p.max - p.life) * 2), 0, 7); c.fill(); c.globalAlpha = 1; } })); if (clock.phase === 'uchha' && Math.random() < dt * 1.5) dust(this.ps, 300, 400, 200, 400, 1); }
  glows() { const g = []; if (clock.daylight < .6) g.push({ x: 60, y: 372, r: 130, a: .7 }); if (state.festival.kaniSet && (fest().vishuEve || fest().vishu)) g.push({ x: 200, y: 670, r: 70, a: .6 }); return g; }
  ambience() { return { wind: .1, leaves: .04, crickets: clock.phase === 'rathri' ? .18 : 0 }; }
  drawStatic(c, w, h) {
    // dark teak-panelled room
    rect(c, 0, 0, w, 560, vgrad(c, 0, 0, 560, [[0, '#2a1a10'], [.5, '#4a2f1c'], [1, '#5a3a24']]));
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < w / 42; i++) c.fillRect(i * 42, 0, 2, 560);
    rect(c, 0, 250, w, 6, P.teakDk); rect(c, 0, 0, w, 40, '#1f140c');
    // floor: red oxide
    rect(c, 0, 560, w, h - 560, vgrad(c, 0, 560, h, [[0, '#7a2e22'], [1, '#4e1c14']])); rect(c, 0, 556, w, 6, '#3a1a12');
    // window with wooden shutters half open (right)
    rect(c, 290, 170, 70, 90, P.teakDk); rect(c, 296, 176, 28, 78, '#9fb37a'); rect(c, 326, 176, 28, 78, P.teak); rect(c, 328, 180, 24, 70, P.teakLt); c.fillStyle = P.teakLt; for (let i = 0; i < 3; i++) c.fillRect(300 + i * 9, 176, 3, 78);
    // pathayam (granary chest) left
    const px = 30, py = 400; shadow(c, px + 70, py + 120, 90, 14, .4);
    rect(c, px, py, 140, 110, P.teak); rect(c, px, py, 140, 12, P.teakLt); rect(c, px + 6, py + 20, 128, 80, P.teakDk); rect(c, px + 10, py + 24, 120, 72, P.teak);
    for (let i = 0; i < 3; i++) rect(c, px + 10, py + 40 + i * 20, 120, 3, P.teakDk);
    rect(c, px + 60, py - 6, 20, 8, P.teakLt); circle(c, px + 70, py + 60, 4, P.brass); // lid handle and lock
    rect(c, px, py + 110, 10, 14, P.teakDk); rect(c, px + 130, py + 110, 10, 14, P.teakDk);
    rect(c, 50, 372, 26, 10, '#5a3a22'); rect(c, 52, 370, 22, 3, '#e8dcc0'); rect(c, 50, 372, 26, 1.5, '#8a2a1c'); // Amma's diary
    // brass para (paddy measure) on top
    poly(c, [[px + 20, py - 2], [px + 44, py - 2], [px + 42, py - 20], [px + 22, py - 20]], P.brass); ellipse(c, px + 32, py - 20, 11, 3, P.brassLt);
    // kattil (wooden cot) right, with paaya mat and pillow
    const kx = 196, ky = 600; shadow(c, kx + 70, ky + 50, 110, 14, .4);
    rect(c, kx - 10, ky, 166, 14, P.teakLt); rect(c, kx - 10, ky + 14, 166, 6, P.teakDk);
    for (const lx of [kx - 6, kx + 144]) { rect(c, lx, ky + 20, 10, 36, P.teak); rect(c, lx, ky - 40, 10, 60, P.teak); circle(c, lx + 5, ky - 44, 6, P.teakLt); }
    rect(c, kx + 4, ky - 6, 136, 8, '#cdb98c'); c.strokeStyle = 'rgba(90,70,40,.35)'; c.lineWidth = 1; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(kx + 8 + i * 10, ky - 6); c.lineTo(kx + 8 + i * 10, ky + 2); c.stroke(); } // paaya weave
    roundRect(c, kx + 100, ky - 14, 36, 10, 4, P.kasavu); roundRect(c, kx + 10, ky - 10, 60, 6, 3, '#e6d7b5'); // pillow, folded thorthu
    // petti (wooden trunk) at the foot
    const tx = 80, ty = 640; shadow(c, tx + 40, ty + 36, 50, 8, .4); rect(c, tx, ty, 80, 36, P.teakDk); rect(c, tx, ty, 80, 6, P.teakLt); rect(c, tx + 4, ty + 10, 72, 22, P.teak); for (let i = 0; i < 3; i++) rect(c, tx + 8 + i * 28, ty + 2, 3, 32, P.brassDk); circle(c, tx + 40, ty + 20, 4, P.brass);
    // wall: Amma's photograph with a garland, a calendar, Ravi Varma print
    rect(c, 274, 300, 52, 64, '#3a2a1c'); rect(c, 278, 304, 44, 56, '#e8dcc0'); ellipse(c, 300, 326, 10, 12, '#c9a07a'); circle(c, 300, 318, 7, '#2a1a10'); rect(c, 290, 338, 20, 22, '#b8443a');
    c.strokeStyle = '#d8c89a'; c.lineWidth = 3; c.beginPath(); c.moveTo(276, 302); c.quadraticCurveTo(300, 376, 324, 302); c.stroke();
    rect(c, 190, 290, 40, 54, '#e8dcc0'); rect(c, 190, 290, 40, 10, '#b8321c'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) c.fillRect(194 + k * 7, 306 + r * 9, 4, 4); // Mathrubhumi calendar
    rect(c, 110, 290, 56, 70, '#5a3a22'); rect(c, 114, 294, 48, 62, '#d9b48a'); ellipse(c, 138, 326, 12, 18, '#f0d8c0'); circle(c, 138, 312, 8, '#2a1a10'); rect(c, 124, 336, 28, 20, '#8a2a3a'); // Ravi Varma lady print
    // niche with kerosene lamp, kindi and kolambi on the floor
    rect(c, 40, 340, 44, 54, '#1f140c'); rect(c, 42, 342, 40, 50, '#2e1e12'); hurricaneLamp(c, 62, 390, 1, false);
    kindi(c, 200, 700, 1); kolambi(c, 230, 704, .9);
    // ceiling beam shadows
    rect(c, 0, 40, w, 8, '#17100a');
  }
  drawDynamic(c, w, h) {
    const t = this.t;
    if (clock.daylight < .6) { glow(c, 62, 376, 40, '#ffb050', .5); circle(c, 62, 378, 2.2, P.flameHi); }
    if (state.items.print) { rect(c, 190, 150, 70, 90, '#5a3a22'); rect(c, 194, 154, 62, 82, '#e9d9b8'); ellipse(c, 225, 200, 16, 24, '#f0d8c0'); circle(c, 225, 180, 10, '#2a1a10'); rect(c, 206, 214, 38, 22, '#2d6b5a'); line(c, 212, 206, 246, 192, P.brass, 2); }
    if (clock.daylight < .4) { const gx = 100 + Math.sin(t * .3) * 6, gy = 352; ellipse(c, gx, gy, 7, 2.6, '#c9bca0'); circle(c, gx + 7, gy - 1, 2.4, '#c9bca0'); line(c, gx - 7, gy, gx - 14, gy + 3 + Math.sin(t * 2) * 2, '#c9bca0', 1.2); for (const [dx, dy] of [[-4, 2], [3, 2], [-4, -2], [3, -2]]) line(c, gx + dx, gy, gx + dx * 1.4, gy + dy * 2.2, '#c9bca0', .8); }
    if (this.pettiOpen > 0) { const k = this.pettiOpen; c.save(); c.translate(80, 640); c.rotate(-k * 1.2); rect(c, 0, -6, 80, 6, P.teakLt); c.restore(); c.globalAlpha = k; rect(c, 92, 626, 56, 12, '#e8dcc0'); rect(c, 100, 620, 40, 10, '#d9c9a0'); c.globalAlpha = 1; }
    if (this.incense > 0) { line(c, 300, 352, 302, 366, '#8a6a4a', 1.2); circle(c, 300, 351, 1.2, '#ff7a1a'); }
    // Vishukkani in the corner on Vishu eve/day
    if (state.festival.kaniSet && (fest().vishuEve || fest().vishu)) {
      const kx = 200, ky = 690; shadow(c, kx, ky + 8, 50, 8, .35);
      ellipse(c, kx, ky, 34, 12, '#8a6a2a'); ellipse(c, kx, ky - 4, 34, 12, '#b58a38'); ellipse(c, kx, ky - 6, 28, 8, '#f3e6c6'); // uruli with rice
      ellipse(c, kx - 10, ky - 10, 10, 5, '#e8c030'); ellipse(c, kx + 12, ky - 9, 6, 4, '#c9d85a'); ellipse(c, kx + 2, ky - 12, 5, 3, '#f0a030'); // vellari, mango
      for (let i = 0; i < 7; i++) { circle(c, kx - 24 + i * 8, ky - 16 - (i % 2) * 4, 2.6, '#f2c230'); }
      rect(c, kx + 34, ky - 40, 3, 36, P.brass); circle(c, kx + 36, ky - 44, 10, P.brassLt); circle(c, kx + 36, ky - 44, 7, '#cfe3ea'); // val kannadi
      rect(c, kx - 44, ky - 30, 4, 30, P.brass); circle(c, kx - 42, ky - 32, 2.5, P.flame); glow(c, kx - 42, ky - 34, 26, '#ffb050', .4);
      roundRect(c, kx - 30, ky + 4, 60, 8, 3, P.kasavu); rect(c, kx - 30, ky + 4, 60, 1.5, P.gold);
    }
  }
}
