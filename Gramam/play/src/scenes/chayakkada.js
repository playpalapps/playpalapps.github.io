import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm } from '../art/draw.js';
import { person, jar, dog, hurricaneLamp, bicycle } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { steam } from '../engine/particles.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { anyDue, playBeat, has } from '../game/people.js';

const GOSSIP = [
  ['Velayudhan, pouring: “They say the new bridge will come next year. They said that the year you left.”', 'വേലായുധൻ'],
  ['“The panchayat president’s son has gone to the Gulf. The president has bought a scooter. Draw your own conclusions.”', 'വേലായുധൻ'],
  ['“Prem Nazir film at the talkies this week. Sheela also. Do not go on Sunday, the whole village goes on Sunday.”', 'വേലായുധൻ'],
  ['“Your Achan drank his chaya without sugar and argued with everyone about Nehru. Good man. Wrong about Nehru.”', 'വേലായുധൻ'],
  ['“Rain by Thursday. My knee says so and my knee has never been wrong about rain, only about everything else.”', 'വേലായുധൻ'],
  ['“Kunjappan has raised the price of jaggery again. I have raised the price of nothing. Remember that.”', 'വേലായുധൻ'],
  ['“The cricket is on the radio from Madras. India is batting. Sit, sit, you cannot leave while India is batting.”', 'വേലായുധൻ']
];
export class Chayakkada extends Scene {
  constructor() {
    super('chayakkada', 'Chayakkada', 'ചായക്കട'); this.horizon = 230; this.ground = P.earth; this.pourT = 0; this.radioOn = true;
    this.hotspots = [
      { x: 150, y: 470, r: 44, label: 'chaya', action: () => this.chaya() },
      { x: 250, y: 440, r: 34, label: 'parippuvada', action: () => this.snack() },
      { x: 90, y: 440, r: 36, label: 'Velayudhan', due: () => anyDue('velayudhan'), action: () => { if (!playBeat('velayudhan')) talk([GOSSIP[(state.days + clock.day) % GOSSIP.length]]); } },
      { x: 340, y: 570, r: 40, label: 'newspaper', action: () => this.paper() },
      { x: 320, y: 315, r: 30, label: 'radio', action: () => { this.radioOn = !this.radioOn; audio.sfx('radioOn'); say(this.radioOn ? 'Velayudhan turns the radio up. Cricket commentary, then a film song.' : 'He turns the radio down. The argument on the bench gets louder to compensate.', 'റേഡിയോ'); } },
    ];
    this.exits = [{ side: 'bottom', label: 'Idavazhi · home', go: () => router.go('poomukham') }, { side: 'right', y: 640, label: 'Kada', go: () => router.go('kada') }];
  }
  chaya() { this.busy = true; this.pourT = 0; audio.sfx('pour'); tween(this, { pourT: 1 }, 2.2, t => t, () => { audio.sfx('slurp'); this.busy = false; state.chayaDay = clock.day; say('A glass of chaya, pulled a metre long between two glasses, a skin of froth on top. Velayudhan writes it in his book.', 'ചായ'); remember('chaya', 'Chaya at Velayudhan’s kada, poured from a height that would be showing off anywhere else. He still refuses money from this house. I still try.'); }); }
  snack() { audio.sfx('sizzle', { dur: 1 }); this.busy = true; delay(1.2, () => { this.busy = false; const items = ['parippuvada', 'pazhampori', 'sukhiyan', 'uzhunnu vada', 'bonda']; const it = items[(state.days + clock.day) % items.length]; say(pick(`A ${it} from the glass jar, still warm, on a square of yesterday’s newspaper.`, `ചില്ലുഭരണിയിൽ നിന്ന് ഒരു ${t(it)}, ഇനിയും ചൂടാറിയിട്ടില്ല, ഇന്നലത്തെ പത്രത്തിന്റെ ഒരു കഷണത്തിൽ.`), 'പലഹാരം'); remember('snack', 'Parippuvada from the jar at the chayakkada, served on a piece of newspaper so you can read the news in grease.'); }); }
  paper() { this.busy = true; clock.speed = 12; audio.sfx('page'); const news = ['Mathrubhumi: paddy prices up, a bridge promised, a tiger seen near Palakkad, denied by the tiger.', 'Malayala Manorama: the new bus route, a wedding, a film review that is kinder than the film.', 'The paper says it will rain. Velayudhan says the paper is always right, eventually.']; say(news[(state.days) % news.length], 'പത്രം', 5); delay(4, () => { clock.speed = 1; this.busy = false; }); }
  ambience() { const h = clock.hour; return { murmur: h >= 6 && h < 21 ? .45 : 0, kettle: .12, radio: this.radioOn ? .35 : 0, crows: .1 }; }
  tick(dt) { if (Math.random() < dt * 4) steam(this.ps, 120, 404, 1, 4); if (this.pourT > 0 && this.pourT < 1 && Math.random() < dt * 6) steam(this.ps, 160, 440, 1, 3); }
  glows() { return clock.daylight < .6 ? [{ x: 200, y: 360, r: 170, a: .85 }] : []; }
  drawStatic(c, w, h) {
    // the kada is a thatched/tiled shed; we stand at the open front. Lane and palms behind at the top.
    rect(c, 0, 220, w, 40, vgrad(c, 0, 220, 260, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 8; i++) ellipse(c, hash(i + 3) * w, 232, 20, 14, P.cocoDeep);
    palm(c, 40, 250, 60, 16, .9, [P.teakLt, P.teakDk, P.cocoDk, P.coco]); palm(c, w - 40, 250, 50, -14, .95, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // thatched roof (coconut leaf over a bamboo frame) across the top, deep overhang
    poly(c, [[-10, 332], [w + 10, 332], [w + 10, 150], [-10, 150]], '#8f7d4c'); for (let i = 0; i < w / 7; i++) line(c, i * 7, 332, i * 7 + 8, 154, 'rgba(60,50,20,.4)', 1.2); for (let r = 0; r < 6; r++) { rect(c, -10, 150 + r * 30, w + 20, 3, 'rgba(60,50,20,.3)'); } rect(c, -10, 328, w + 20, 8, P.teakDk); rect(c, 60, 150, 4, 182, P.teakDk); rect(c, w - 64, 150, 4, 182, P.teakDk);
    // back wall: wooden planks, a calendar with a god, shelves of jars
    rect(c, 0, 334, w, 226, vgrad(c, 0, 334, 560, [[0, '#6a4a2e'], [1, '#4a3220']])); c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < w / 26; i++) c.fillRect(i * 26, 334, 2, 226);
    rect(c, 200, 350, 36, 48, '#e8dcc0'); rect(c, 200, 350, 36, 10, '#b8321c'); ellipse(c, 218, 376, 8, 10, '#3a6fd0'); rect(c, 206, 388, 24, 8, '#e0b43a'); // calendar with Krishna
    rect(c, 240, 346, 150, 6, P.teak); rect(c, 240, 400, 150, 6, P.teak);
    jar(c, 250, 362, 22, 38, '#c9a050'); jar(c, 278, 362, 22, 38, '#e0a040'); jar(c, 306, 362, 22, 38, '#8a5a2a'); jar(c, 334, 362, 22, 38, '#e8d8a0'); jar(c, 334, 404, 18, 30, '#d8402c');
    // radio on the top shelf right
    roundRect(c, 300, 300, 42, 30, 3, P.teak); roundRect(c, 304, 304, 22, 22, 2, '#e8dcc0'); circle(c, 334, 315, 5, P.brass);
    // bananas hanging in a bunch from the roof
    line(c, 40, 334, 40, 360, '#c9b48a', 1.5); for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) ellipse(c, 34 + k * 6, 364 + r * 9, 4, 2.6, r % 2 ? '#e0c850' : '#d8b840');
    // counter: wooden, with the brass samovar on the left and glass tumblers
    rect(c, 20, 470, w - 40, 14, P.teakLt); rect(c, 20, 484, w - 40, 60, P.teak); rect(c, 20, 544, w - 40, 6, P.teakDk);
    rect(c, 26, 490, 100, 50, '#3a2a1c'); rect(c, 240, 490, 60, 50, '#3a2a1c'); // dark openings under counter
    // samovar
    const sx = 120, sy = 470; shadow(c, sx, sy + 2, 30, 6, .4); ellipse(c, sx, sy - 4, 26, 8, P.brassDk); rect(c, sx - 22, sy - 60, 44, 56, P.brass); rect(c, sx - 22, sy - 60, 10, 56, P.brassLt); ellipse(c, sx, sy - 60, 22, 7, P.brassLt); rect(c, sx - 8, sy - 76, 16, 16, P.brassDk); ellipse(c, sx, sy - 76, 8, 3, P.brass); line(c, sx + 22, sy - 30, sx + 34, sy - 26, P.brassDk, 4); circle(c, sx + 36, sy - 26, 3, P.brassLt);
    rect(c, sx - 26, sy - 6, 52, 6, '#2a1a10'); glow(c, sx, sy - 2, 14, '#ff8a2a', .5);
    for (let i = 0; i < 6; i++) { const gx = 170 + i * 14; rect(c, gx - 4, 456, 8, 14, 'rgba(220,230,240,.55)'); rect(c, gx - 4, 456, 2, 14, 'rgba(255,255,255,.6)'); }
    // snack jars on the counter
    jar(c, 230, 440, 30, 30, '#e0a040'); jar(c, 266, 442, 28, 28, '#c9a050');
    // benches in front, newspaper, floor (packed earth)
    rect(c, 0, 550, w, h - 550, vgrad(c, 0, 550, h, [[0, P.earthLt], [1, P.earthDk]]));
    for (const [bx, by, bw] of [[40, 600, 140], [250, 610, 150]]) { rect(c, bx, by, bw, 10, P.teakLt); rect(c, bx + 6, by + 10, 8, 34, P.teak); rect(c, bx + bw - 14, by + 10, 8, 34, P.teak); }
    c.save(); c.translate(340, 588); c.rotate(-.1); rect(c, -20, -8, 40, 14, P.paper); c.fillStyle = 'rgba(43,33,24,.5)'; for (let i = 0; i < 5; i++) c.fillRect(-16, -5 + i * 2.6, 30 - (i % 2) * 6, .9); c.restore();
    // kerosene lamp hanging from the roof, beedi bundle and matchbox on the counter
    hurricaneLamp(c, 300, 300, 1.1, false); rect(c, 300, 462, 14, 8, '#2a6a3a'); rect(c, 318, 464, 10, 6, '#d8402c');
    // signboard
    rect(c, 110, 180, 170, 28, '#f1e4c8'); rect(c, 110, 180, 170, 4, '#c8322a'); text(c, 'VELAYUDHAN TEA STALL', 195, 196, 9.5, '#8a2a1c', 'center', 'sans-serif', 'bold');
    bicycle(c, 30, 700, 1.2);
  }
  drawDynamic(c, w, h) {
    const t = this.t, h0 = clock.hour;
    // Velayudhan behind the counter, pulling tea
    const pour = this.pourT > 0 && this.pourT < 1 ? Math.sin(this.pourT * Math.PI) : 0;
    person(c, 90, 500, 1, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', moustache: true, skin: '#a9744f' }, t);
    // counter front over his legs
    rect(c, 20, 470, w - 40, 14, P.teakLt); rect(c, 20, 484, w - 40, 60, P.teak); rect(c, 20, 544, w - 40, 6, P.teakDk); rect(c, 26, 490, 100, 50, '#3a2a1c'); rect(c, 240, 490, 60, 50, '#3a2a1c'); for (let i = 0; i < 6; i++) { const gx = 170 + i * 14; rect(c, gx - 4, 456, 8, 14, 'rgba(220,230,240,.55)'); rect(c, gx - 4, 456, 2, 14, 'rgba(255,255,255,.6)'); } jar(c, 230, 440, 30, 30, '#e0a040'); jar(c, 266, 442, 28, 28, '#c9a050'); rect(c, 300, 462, 14, 8, '#2a6a3a'); rect(c, 318, 464, 10, 6, '#d8402c');
    // samovar again, in front
    { const sx = 120, sy = 470; ellipse(c, sx, sy - 4, 26, 8, P.brassDk); rect(c, sx - 22, sy - 60, 44, 56, P.brass); rect(c, sx - 22, sy - 60, 10, 56, P.brassLt); ellipse(c, sx, sy - 60, 22, 7, P.brassLt); rect(c, sx - 8, sy - 76, 16, 16, P.brassDk); ellipse(c, sx, sy - 76, 8, 3, P.brass); line(c, sx + 22, sy - 30, sx + 34, sy - 26, P.brassDk, 4); circle(c, sx + 36, sy - 26, 3, P.brassLt); rect(c, sx - 26, sy - 6, 52, 6, '#2a1a10'); glow(c, sx, sy - 2, 14, '#ff8a2a', .5); }
    if (pour > 0) { rect(c, 72, 420 - pour * 40, 6, 10, 'rgba(220,230,240,.7)'); line(c, 75, 430 - pour * 40, 75, 462, '#c8955a', 2); rect(c, 70, 460, 8, 12, 'rgba(220,230,240,.7)'); rect(c, 71, 464, 6, 8, '#c8955a'); }
    // two regulars on the bench: one with paper, one gesturing
    if (h0 >= 6 && h0 < 21) { person(c, 90, 600, .95, { sex: 'm', top: '#e0e0e0', mundu: '#f3ecd8', pose: 'sit', item: 'paper', skin: '#9c6a48' }, t); person(c, 150, 600, .95, { sex: 'm', bare: true, mundu: '#d9d2c0', pose: 'sit', moustache: true }, t); person(c, 330, 612, .95, { sex: 'm', top: '#2d6b5a', mundu: '#f3ecd8', pose: 'sit', flip: true }, t); }
    dog(c, 330, 700, 1, t, true);
    if (clock.daylight < .6) { glow(c, 300, 278, 36, '#ffb050', .5); circle(c, 300, 288, 2, P.flameHi); }
    if (this.radioOn) { c.globalAlpha = .6 + Math.sin(t * 6) * .2; circle(c, 334, 315, 1.5, '#ffcc66'); c.globalAlpha = 1; }
  }
}
