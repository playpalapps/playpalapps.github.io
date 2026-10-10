import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm } from '../art/draw.js';
import { person, cinemaPoster, bicycle, hurricaneLamp } from '../art/lib.js';
import { state, remember, save } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';

const FILMS = [['CHEMMEEN', '#2a6fa0', 'Chemmeen (1965). Karuthamma and Pareekutty, the sea, the song Manasa Maine Varoo. Half the hall sang.'], ['NEELAKUYIL', '#8a2a3a', 'Neelakuyil (1954). Sathyan, Miss Kumari, and the whole village wiping its eyes in the dark.'], ['NIRMALYAM', '#c8955a', 'Nirmalyam (1973). The velichappad’s last dance. Nobody spoke on the walk home.'], ['ODAYIL NINNU', '#2d6b5a', 'Odayil Ninnu (1965). Pappu the rickshaw puller, Sathyan again, the hall full of men not crying.'], ['MANJIL VIRINJA', '#4a5a9a', 'Manjil Virinja Pookkal (1980). A new face called Mohanlal as the villain. You will remember the name.']];
export class Talkies extends Scene {
  constructor() {
    super('talkies', 'Paradise Talkies', 'ടാക്കീസ്'); this.horizon = 300; this.ground = P.earthLt; this.showT = 0;
    this.hotspots = [
      { x: 215, y: 480, r: 44, label: 'ticket window', action: () => this.ticket() },
      { x: 90, y: 380, r: 36, label: 'loudspeaker', action: () => this.speaker() },
      { x: 300, y: 430, r: 34, label: 'this week', action: () => { const f = this.film(); audio.sfx('page'); say(f[2], 'സിനിമ', 6); remember('poster_' + f[0], 'This week at Paradise Talkies: ' + f[2]); } },
      { x: 120, y: 560, r: 36, label: 'the gate man', action: () => talk([['The gate man, torch and towel: “Bench, chair, or balcony? Bench is fifty paise and the fleas are free.”', 'ഗേറ്റ്കാരൻ'], ['“First show six-thirty, second nine-thirty. Interval samosa from the bicycle. Do not clap during the songs, the projector is old and sensitive.”']]) },
    ];
    this.exits = [{ side: 'bottom', label: 'Angadi', go: () => router.go('angadi') }];
  }
  film() { return FILMS[Math.floor(state.days / 7) % FILMS.length]; }
  showing() { const h = clock.hour; return (h >= 18.5 && h < 21) || (h >= 21.5 && h < 24); }
  ticket() {
    if (!this.showing()) { say(clock.hour < 18.5 ? 'The window is shut. First show at six-thirty, when the loudspeaker starts the songs.' : 'The show has started. Wait for the second show at nine-thirty.', 'ടിക്കറ്റ്'); return; }
    const f = this.film(); this.busy = true; audio.sfx('coin');
    router.interlude(pick(`The hall goes dark. The projector clatters awake. ${f[2]}`, `ഹാൾ ഇരുട്ടായി. പ്രൊജക്ടർ കടകടശബ്ദത്തോടെ ഉണർന്നു. ${t(f[2])}`), () => { clock.minutes += 150; audio.release('projector'); }, 5);
    audio.hold('projector', .5, 7);
    delay(6.5, () => { this.busy = false; say('Out into the night with the song still going in your head and the whole village walking home in the same direction.', 'സിനിമ കണ്ടു', 5); remember('talkies_show', 'Saw a film at Paradise Talkies, bench class, interval samosa, the reel breaking once to cheers. Walked home under the stars singing badly.'); });
  }
  speaker() { audio.sfx('radioOn'); say(this.showing() || (clock.hour >= 17.5 && clock.hour < 18.5) ? 'The horn speaker on the pole, playing film songs to the whole panchayat an hour before the show. Yesudas, scratchy, enormous.' : 'The speaker is silent. It wakes at half past five, and so does the dog under it.', 'ലൗഡ്‌സ്പീക്കർ'); remember('loudspeaker', 'The talkies loudspeaker at dusk, film songs rolling over the paddy to every house. You could set your lamp by it.'); }
  ambience() { const h = clock.hour; return { radio: (h >= 17.5 && h < 21.5) ? .5 : 0, murmur: this.showing() ? .3 : (h >= 17.5 && h < 22) ? .4 : .08, crickets: clock.phase === 'rathri' ? .25 : 0 }; }
  glows() { return clock.daylight < .5 ? [{ x: 215, y: 470, r: 170, a: .9 }, { x: 215, y: 350, r: 120, a: .5 }] : []; }
  drawStatic(c, w, h) {
    rect(c, 0, 290, w, 40, vgrad(c, 0, 290, 330, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 8; i++) ellipse(c, hash(i + 7) * w, 306, 20, 14, P.cocoDeep);
    palm(c, 30, 340, 120, 14, .9, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // the hall: a long tin-roofed shed, painted front with a name board, posters, a ticket window, two doors
    poly(c, [[40, 330], [330, 330], [350, 350], [20, 350]], '#8a8a90'); for (let i = 0; i < 14; i++) line(c, 30 + i * 22, 350, 36 + i * 22, 330, 'rgba(0,0,0,.25)', 1);
    rect(c, 30, 350, 310, 160, vgrad(c, 0, 350, 510, [[0, '#d9b8a8'], [1, '#b89080']])); rect(c, 30, 350, 310, 4, '#5a3a30');
    rect(c, 70, 356, 230, 34, '#1a1a2e'); text(c, 'PARADISE TALKIES', 185, 369, 12, '#ffd27a', 'center', 'serif', 'bold'); text(c, 'പാരഡൈസ് ടാക്കീസ്', 185, 384, 7, '#f1e4c8', 'center', 'sans-serif');
    const f = this.film(); cinemaPoster(c, 270, 400, 56, 78, f[0], f[1]); cinemaPoster(c, 44, 404, 44, 60, 'NEXT WEEK', '#2d6b5a');
    rect(c, 180, 420, 70, 90, '#3a2a2a'); rect(c, 196, 436, 38, 34, '#1a1a1a'); rect(c, 200, 440, 30, 26, 'rgba(255,220,160,.25)'); rect(c, 198, 470, 34, 3, P.brass); text(c, 'TICKETS', 215, 428, 7, '#f1e4c8', 'center', 'sans-serif', 'bold');
    rect(c, 110, 440, 50, 70, '#2a1a1a'); rect(c, 114, 444, 42, 62, '#1a0e0e'); rect(c, 120, 432, 30, 8, '#8a2a1c'); text(c, 'BENCH', 135, 436, 5, '#fff', 'center', 'sans-serif');
    // loudspeaker horn on a pole, left
    rect(c, 88, 300, 4, 200, '#555'); poly(c, [[92, 372], [122, 362], [122, 392], [92, 382]], '#777'); circle(c, 92, 377, 5, '#444');
    // bicycles leaning, a samosa vendor cycle
    bicycle(c, 60, 540, 1.1); bicycle(c, 92, 544, 1.1); bicycle(c, 320, 548, 1.1);
    rect(c, 0, 510, w, h - 510, vgrad(c, 0, 510, h, [[0, P.earthLt], [1, P.earthDk]])); rect(c, 0, 508, w, 5, '#5a3a30');
    hurricaneLamp(c, 215, 405, 1, false);
  }
  drawDynamic(c, w, h) {
    const t = this.t, h0 = clock.hour, night = clock.daylight < .5;
    if (night) { glow(c, 215, 372, 60, '#ffd27a', .5); for (let i = 0; i < 12; i++) circle(c, 76 + i * 20, 354, 1.6, (Math.floor(t * 4) + i) % 3 ? '#ffd27a' : '#ff8a5a'); glow(c, 215, 394, 24, '#ffb050', .4); circle(c, 215, 396, 2, P.flameHi); }
    person(c, 120, 560, .9, { sex: 'm', top: '#8a7a4a', mundu: '#8a7a4a', skin: '#9c6a48', moustache: true }, t);
    if (h0 >= 17.5 && h0 < 22) { for (let i = 0; i < 6; i++) person(c, 150 + i * 32 + Math.sin(t * .3 + i) * 4, 580 + (i % 2) * 20, .78, { sex: i % 3 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', flip: i % 2 }, t + i); }
    if (h0 >= 17 && h0 < 22) { c.globalAlpha = .5 + .3 * Math.sin(t * 8); circle(c, 122, 377, 3, '#ffd27a'); c.globalAlpha = 1; }
  }
}
