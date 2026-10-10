import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, tileRoof, palm } from '../art/draw.js';
import { person, jar, gunnySack, cow, cinemaPoster, hurricaneLamp, dog } from '../art/lib.js';
import { state, remember, save } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { add } from '../game/pantry.js';

export class Angadi extends Scene {
  constructor() {
    super('angadi', 'Angadi', 'അങ്ങാടി'); this.horizon = 300; this.ground = P.earthLt; this.cartX = 500; this.sewT = 0; this.cutT = 0;
    this.hotspots = [
      { x: 70, y: 470, r: 44, label: 'tailor', action: () => this.tailor() },
      { x: 190, y: 470, r: 40, label: 'barber', action: () => this.barber() },
      { x: 300, y: 470, r: 40, label: 'pettikkada', action: () => this.petti() },
      { x: 120, y: 640, r: 40, label: 'bangles', enabled: () => fest().chanta, action: () => this.bangles() },
      { x: 260, y: 650, r: 46, label: 'chanta', enabled: () => fest().chanta, action: () => this.chanta() },
    ];
    this.exits = [{ side: 'left', y: 620, label: 'Kavala', go: () => router.go('kavala') }, { side: 'right', y: 620, label: 'Pallikkoodam', go: () => router.go('pallikkoodam') }, { x: 330, y: 330, side: 'top', label: 'Talkies', go: () => router.go('talkies') }];
  }
  tailor() { this.busy = true; audio.sfx('sewing', { reps: 14 }); tween(this, { sewT: 1 }, 1.8, t => t, () => { this.sewT = 0; this.busy = false; const f = fest(); if (f.uthradam || f.thiruvonam) { say('Sukumaran the tailor, pins in his mouth: “Onakkodi. Kasavu mundu, measured, hemmed, ready by sandhya. Your Amma’s measurements are in the book.”', 'ഓണക്കോടി', 6); remember('onakkodi', 'Onakkodi from Sukumaran’s shop, the Usha machine going like a train. New clothes for Thiruvonam, as every year of my life except the ones away.'); } else { say('Sukumaran turns the Usha wheel and your torn shirt is whole again before the chaya is cool.', 'തയ്യൽ'); remember('tailor', 'Had a shirt mended at the tailor on the angadi. He remembered my school uniform size and said I had not grown. He is right.'); } }); }
  barber() { this.busy = true; clock.speed = 12; audio.sfx('scissors', { reps: 6 }); say('Gopalan’s barber shop: a cracked mirror, a Prem Nazir poster, cricket on the radio, and more news than the Manorama. You are shorn and informed.', 'ബാർബർ', 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('barber', 'Haircut at Gopalan’s. Learned who is marrying whom, who went to the Gulf, who came back, and that the bridge is coming next year.'); }); }
  petti() { this.busy = true; audio.sfx('tap'); delay(.8, () => { this.busy = false; const r = (state.days + clock.day) % 3; if (r === 0) { add('banana', 2); say('From the pettikkada: a hand of bananas, a Parle-G, and naranga mittai in a paper twist for the road.', 'പെട്ടിക്കട'); } else if (r === 1) { add('tea', 1); say('A packet of Kannan Devan dust and a Camel matchbox. The pettikkada man asks after Ravi, like everyone.', 'പെട്ടിക്കട'); } else say('Naranga mittai, two for five paise, sour enough to close one eye. You buy ten.', 'നാരങ്ങാ മിഠായി'); remember('pettikkada', 'The pettikkada on the angadi: jars of mittai, bananas on a string, and the same man who sold me mittai for five paise selling it to me now for ten.'); }); }
  bangles() { this.busy = true; audio.sfx('bangles'); delay(1.2, () => { this.busy = false; say('A dozen glass bangles, green and gold, slid on by the bangle woman who reads your palm for free while she does it.', 'കുപ്പിവള'); remember('bangles', 'Bought glass bangles at the Wednesday chanta for Ammini chechi. The bangle woman said my life line was long and my patience short.'); }); }
  chanta() { this.busy = true; audio.sfx('wood'); delay(1.2, () => { add('vegetables', 2); add('fish', 1); this.busy = false; say('Wednesday chanta: yam, drumsticks, a string of mathi, a clay pot that rings true when you tap it. Everyone is shouting a price at someone.', 'ചന്ത', 6); remember('chanta', 'The Wednesday chanta on the angadi. Pots, fish, bangles, bullock carts, a man selling a cure for everything. Came home with vegetables and a headache.'); }); }
  ambience() { const f = fest(); return { murmur: f.chanta ? .6 : .25, cart: f.chanta ? .3 : .1, crows: .15, radio: .15, hens: f.chanta ? .2 : 0 }; }
  tick(dt) { this.cartX -= dt * 22; if (this.cartX < -200) this.cartX = 600 + Math.random() * 900; }
  drawStatic(c, w, h) {
    rect(c, 0, 290, w, 40, vgrad(c, 0, 290, 330, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 8; i++) ellipse(c, hash(i + 3) * w, 306, 20, 14, P.cocoDeep);
    // row of three shops under one tiled roof: tailor, barber, pettikkada
    tileRoof(c, -10, 318, w + 20, 44, P.tile, P.tileLt, P.tileDk); rect(c, -10, 360, w + 20, 5, P.teakDk);
    rect(c, 0, 365, w, 140, vgrad(c, 0, 365, 505, [[0, '#d9c9a0'], [1, '#bda985']])); for (const px of [130, 250]) rect(c, px - 3, 365, 6, 140, P.teakDk);
    // tailor: open front, Usha machine on a table, cloth bolts, a mannequin bust
    rect(c, 14, 380, 104, 110, '#3a2a1c'); rect(c, 20, 386, 92, 98, '#5a4632'); for (let i = 0; i < 4; i++) rect(c, 24, 392 + i * 16, 36, 12, ['#8a2a3a', '#2a3a8a', '#f1e4c8', '#2d6b5a'][i]);
    rect(c, 70, 440, 40, 6, P.teak); rect(c, 74, 446, 4, 40, P.teakDk); rect(c, 102, 446, 4, 40, P.teakDk); roundRect(c, 78, 424, 26, 16, 3, '#1a1a1a'); circle(c, 104, 432, 7, '#333'); rect(c, 76, 420, 6, 6, '#c9962e');
    rect(c, 20, 368, 92, 12, '#8a2a1c'); text(c, 'SUKUMARAN TAILORS', 66, 374, 6, '#f1e4c8', 'center', 'sans-serif', 'bold');
    // barber: mirror, chair, posters
    rect(c, 136, 380, 108, 110, '#2a3a44'); rect(c, 150, 390, 50, 60, '#9fc2cc'); rect(c, 150, 390, 50, 4, '#c9962e'); rect(c, 150, 446, 50, 4, '#c9962e'); cinemaPoster(c, 208, 392, 30, 42, 'NAZIR', '#8a2a3a');
    rect(c, 160, 452, 36, 8, '#8a2a1c'); rect(c, 162, 460, 6, 28, '#444'); rect(c, 188, 460, 6, 28, '#444'); rect(c, 156, 436, 44, 16, '#8a2a1c');
    rect(c, 140, 368, 100, 12, '#1a4a7a'); text(c, 'GOPALAN HAIR CUTTING', 190, 374, 6, '#f1e4c8', 'center', 'sans-serif', 'bold');
    // pettikkada: a box shop, jars, bananas hanging, Parle-G
    rect(c, 258, 380, 100, 110, '#6a4a2e'); rect(c, 262, 384, 92, 102, '#8a6a4a'); rect(c, 262, 430, 92, 6, P.teak); for (let i = 0; i < 4; i++) jar(c, 266 + i * 22, 404, 18, 26, ['#e0a040', '#d8402c', '#f2c230', '#c9a050'][i]);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) ellipse(c, 334 + k * 6, 392 + r * 8, 3.5, 2.2, r % 2 ? '#e0c850' : '#d8b840'); rect(c, 266, 440, 30, 14, '#e8dcc0'); rect(c, 266, 440, 30, 4, '#c8322a'); rect(c, 300, 440, 22, 14, '#2a6a3a'); rect(c, 328, 442, 14, 10, '#c8322a');
    rect(c, 262, 368, 92, 12, '#2d6b5a'); text(c, 'PETTIKKADA', 308, 374, 6, '#f1e4c8', 'center', 'sans-serif', 'bold');
    // road and verge
    rect(c, 0, 505, w, 90, vgrad(c, 0, 505, 595, [[0, '#5a5a5e'], [1, '#48484c']])); rect(c, 0, 503, w, 4, '#8a8a7a');
    rect(c, 0, 595, w, h - 595, vgrad(c, 0, 595, h, [[0, P.earthLt], [1, P.earthDk]]));
    hurricaneLamp(c, 250, 372, 1, false);
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest();
    person(c, 44, 488, .78, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'sit', skin: '#9c6a48', moustache: true }, t); if (this.sewT > 0) { c.globalAlpha = .7; rect(c, 92, 428 + Math.sin(this.sewT * 60) * 2, 2, 6, '#ddd'); c.globalAlpha = 1; }
    person(c, 178, 486, .78, { sex: 'm', top: '#e0e0e0', mundu: '#f3ecd8', skin: '#b08060' }, t); person(c, 178, 470, .6, { sex: 'm', top: '#2d6b5a', mundu: '#f3ecd8', pose: 'sit' }, t);
    person(c, 300, 486, .8, { sex: 'm', top: '#8a2a3a', mundu: '#f3ecd8', pose: 'sit', skin: '#9c6a48' }, t);
    // bullock cart passing on the road
    if (this.cartX > -200 && this.cartX < w + 100) { const cx = this.cartX; cow(c, cx + 70, 596, .55, t, false); rect(c, cx - 50, 560, 90, 24, P.teak); rect(c, cx - 50, 552, 90, 8, '#8a7a4a'); c.strokeStyle = '#222'; c.lineWidth = 3; c.beginPath(); c.arc(cx - 30, 590, 12, 0, 7); c.moveTo(cx + 32, 590); c.arc(cx + 20, 590, 12, 0, 7); c.stroke(); line(c, cx + 40, 568, cx + 60, 560, P.teakDk, 3); person(c, cx - 10, 560, .55, { sex: 'm', top: '#f1e6d0', mundu: '#d9d2c0', pose: 'sit' }, t); }
    // chanta day: stalls, crowd, bangle woman
    if (f.chanta) {
      for (const [x, y, col] of [[60, 640, '#8fb05a'], [160, 660, '#9fb4c4'], [250, 650, '#c9603a'], [320, 668, '#e0b43a']]) { rect(c, x - 30, y - 6, 60, 10, '#8a7a4a'); for (let i = 0; i < 6; i++) circle(c, x - 20 + i * 8, y - 10, 4, col); rect(c, x - 2, y - 40, 4, 34, P.teak); poly(c, [[x - 34, y - 40], [x + 34, y - 40], [x + 30, y - 30], [x - 30, y - 30]], '#f1e4c8'); }
      person(c, 120, 640, .78, { sex: 'f', top: '#8a2a3a', mundu: '#efe6cf', pose: 'sit' }, t); for (let i = 0; i < 8; i++) { c.strokeStyle = i % 2 ? '#2d8a5a' : '#c9962e'; c.lineWidth = 1.5; c.beginPath(); c.arc(100 + i * 5, 626, 6, 0, 7); c.stroke(); }
      for (let i = 0; i < 7; i++) person(c, 40 + i * 46 + Math.sin(t * .4 + i) * 6, 700 + (i % 2) * 14, .72, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', pose: 'walk', flip: i % 2 }, t + i);
      for (let i = 0; i < 3; i++) ellipse(c, 300 + i * 14, 700 + i * 6, 12 - i * 2, 10 - i * 2, i % 2 ? P.clay : P.clayLt);
    } else { dog(c, 300, 660, 1, t, true); person(c, 60, 700, .8, { sex: 'f', top: '#2d6b5a', mundu: P.kasavu, pose: 'walk', item: 'pot' }, t); }
  }
}
