import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm, tileRoof } from '../art/draw.js';
import { person, mangoTree, lateriteWall, grassTuft, crowBird } from '../art/lib.js';
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
import { talk } from '../game/dialogue.js';
import { add } from '../game/pantry.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { anyDue, playBeat } from '../game/people.js';

const LETTERS = ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ക', 'ഖ', 'ഗ', 'മ', 'ര', 'ല', 'വ'];
export class Pallikkoodam extends Scene {
  constructor() {
    super('pallikkoodam', 'Pallikkoodam', 'പള്ളിക്കൂടം'); this.horizon = 320; this.ground = '#c9b998'; this.bellT = 0; this.kids = Array.from({ length: 7 }, (_, i) => ({ x: 60 + i * 42, y: 620 + (i % 3) * 22, d: i % 2 ? 1 : -1, t: i }));
    this.hotspots = [
      { x: 60, y: 430, r: 36, label: 'school bell', action: () => this.bell() },
      { x: 215, y: 470, r: 50, label: 'classroom', enabled: () => this.open(), action: () => this.lesson() },
      { x: 318, y: 520, r: 34, label: 'uppumavu', enabled: () => this.open() && clock.hour >= 12 && clock.hour < 14, action: () => this.lunch() },
      { x: 320, y: 380, r: 30, label: 'flag', action: () => { audio.sfx('chime'); say('The tricolour on the bamboo pole, a little faded, straightening in the wind off the paddy.', 'പതാക'); remember('flag', 'Stood under the school flag. On August 15 the whole village came here for laddus and a speech nobody listened to.'); } },
      { x: 150, y: 560, r: 40, label: 'the master', enabled: () => this.open(), action: () => talk([['Mash, chalk on his fingers: “You. Second bench, window side, 1958. You drew a boat in your Malayalam copy.”', 'മാഷ്'], ['“It was a good boat. Sit. Say the letters with them. Nobody is too old for the first bench.”']]) },
      { x: 200, y: 680, r: 50, label: 'play', enabled: () => this.open(), due: () => anyDue('kids'), action: () => { if (!playBeat('kids')) this.play(); } },
    ];
    this.exits = [{ side: 'bottom', label: 'Idavazhi · home', go: () => router.go('poomukham') }, { side: 'left', y: 640, label: 'Angadi', go: () => router.go('angadi') }];
  }
  open() { return state.days % 7 !== 0 && clock.hour >= 9.5 && clock.hour < 16; }
  bell() { did('school'); this.busy = true; audio.sfx('schoolBell', { reps: 6 }); this.bellT = 1; tween(this, { bellT: 0 }, 1.6, t => t, () => { this.busy = false; say(this.open() ? 'The bell. Forty children stop in the middle of a hundred games and run.' : 'The bell rings over an empty ground. A crow objects.', 'മണി'); remember('schoolbell', 'Rang the school bell, the brass one on the mango tree. The sound has not changed. Neither has the mango tree.'); }); }
  lesson() { this.busy = true; clock.speed = 12; audio.sfx('slate'); const L = LETTERS[(state.days + clock.day) % LETTERS.length]; say(pick(`On the slate, in chalk, with thirty voices: ${L}. The master taps the board. Again. ${L}.`, `സ്ലേറ്റിൽ, ചോക്കുകൊണ്ട്, മുപ്പതു ശബ്ദങ്ങളിൽ: ${L}. മാഷ് ബോർഡിൽ തട്ടുന്നു. ഒന്നുകൂടി. ${L}.`), L, 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('lesson', 'Sat on the back bench of the first standard and said the letters with the children. അ, ആ, ഇ. The slate pencil squeak went straight down my spine.'); }); }
  lunch() { this.busy = true; audio.sfx('pour'); delay(1.5, () => { this.busy = false; say('Uppumavu from the big aluminium vessel, steaming, a spoon of sugar for those who ask nicely. The best meal of the week for half the ground.', 'ഉപ്പുമാവ്'); remember('uppumavu', 'School uppumavu at noon from the government vessel, on a plavila. The master gave me a double portion and a look.'); }); }
  play() { this.busy = true; clock.speed = 10; audio.hold('schoolyard', .6, 6); say('Kuttiyum kolum, then kallukali, then a fight about the rules of both. You are made referee and immediately disputed.', 'കളി', 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('play', 'Played kuttiyum kolum on the school ground. Lost to a six-year-old named Ambili who did not gloat, which was worse.'); }); }
  ambience() { return { schoolyard: this.open() ? .4 : 0, crows: .2, wind: .2, koel: (clock.month === 7 || clock.month === 8) ? .2 : 0 }; }
  tick(dt) { if (this.open()) for (const k of this.kids) { k.t += dt; k.x += k.d * dt * 14; if (k.x < 40) k.d = 1; if (k.x > 330) k.d = -1; } }
  drawStatic(c, w, h) {
    rect(c, 0, 300, w, 50, vgrad(c, 0, 300, 350, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 10; i++) ellipse(c, hash(i + 5) * w, 318, 18, 14, P.cocoDeep);
    palm(c, w - 30, 360, 150, -16, .95, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // the school: long low building, tiled roof, verandah with square pillars, blue dado, name board
    rect(c, 20, 390, 330, 110, vgrad(c, 0, 390, 500, [[0, P.lime], [1, P.limeDk]])); tileRoof(c, 8, 352, 354, 40, P.tile, P.tileLt, P.tileDk); rect(c, 8, 390, 354, 5, P.teakDk);
    rect(c, 20, 470, 330, 30, '#3a6fa8'); for (const px of [60, 140, 220, 300]) { rect(c, px - 7, 395, 14, 105, P.limeShade); rect(c, px - 7, 395, 4, 105, 'rgba(255,255,255,.4)'); }
    for (const dx of [100, 180, 260]) { rect(c, dx - 20, 410, 40, 60, P.teakDk); rect(c, dx - 16, 414, 32, 52, '#2a1a10'); } // classroom doors
    rect(c, 70, 362, 230, 20, '#1a4a7a'); text(c, 'GOVT. L. P. SCHOOL', 185, 372, 9, '#f1e4c8', 'center', 'sans-serif', 'bold');
    // blackboard glimpse through middle door with letters
    rect(c, 170, 418, 20, 20, '#1e2e22'); c.fillStyle = '#f1e4c8'; c.font = '9px sans-serif'; c.textAlign = 'center'; c.fillText('അ ആ', 180, 432);
    // mango tree with the bell; flagpole
    mangoTree(c, 60, 500, .75, 0, fest().mango); rect(c, 318, 330, 3, 170, '#cdbb90'); poly(c, [[321, 334], [346, 334], [346, 350], [321, 350]], '#ff9933'); rect(c, 321, 339, 25, 5, '#fff'); rect(c, 321, 344, 25, 6, '#138808'); circle(c, 333, 342, 1.8, '#1a3a8a');
    // ground: red earth, a well on the right, stone edge
    rect(c, 0, 500, w, h - 500, vgrad(c, 0, 500, h, [[0, '#c9a070'], [1, P.earthDk]])); rect(c, 0, 500, w, 6, P.lateriteDk);
    for (let i = 0; i < 20; i++) grassTuft(c, hash(i + 80) * w, 520 + hash(i + 81) * 260, .7, P.cocoDk);
    ellipse(c, 326, 548, 26, 9, P.lateriteDk); rect(c, 300, 528, 52, 20, P.laterite); ellipse(c, 326, 528, 26, 9, P.lateriteLt); ellipse(c, 326, 528, 18, 6, '#2a1d14'); // well
    // uppumavu vessel on a stone stove by the verandah end
    rect(c, 306, 508, 24, 14, '#8a8a90'); ellipse(c, 318, 508, 12, 4, '#b8b8c0'); rect(c, 300, 522, 36, 6, '#3a2a1c');
    // hopscotch squares scratched in the earth
    c.strokeStyle = 'rgba(255,240,220,.45)'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) c.strokeRect(190, 660 + i * 22, 24, 22); c.strokeRect(166, 704, 24, 22); c.strokeRect(214, 704, 24, 22);
    lateriteWall(c, 0, 760, w, 30, .4);
  }
  drawDynamic(c, w, h) {
    const t = this.t;
    // bell on the tree branch
    const bx = 60, by = 432, sw = Math.sin(t * 9) * this.bellT * .4; c.save(); c.translate(bx, by - 14); c.rotate(sw); line(c, 0, 0, 0, 10, P.brassDk, 1.5); poly(c, [[-7, 10], [7, 10], [9, 24], [-9, 24]], P.brass); ellipse(c, 0, 24, 9, 3, P.brassDk); c.restore();
    if (this.open()) { for (const k of this.kids) person(c, k.x, k.y, .55, { sex: k.t % 2 > 1 ? 'girl' : 'boy', top: ['#e0b43a', '#c8322a', '#2a3a8a', '#2d6b5a'][Math.floor(k.t) % 4], mundu: k.t % 2 > 1 ? '#8a2a3a' : '#f3ecd8', pose: 'walk', flip: k.d < 0 }, t * 1.4 + k.t); person(c, 150, 560, .9, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', skin: '#9c6a48', moustache: true }, t); }
    crowBird(c, 110, 395, .9, t);
  }
}
