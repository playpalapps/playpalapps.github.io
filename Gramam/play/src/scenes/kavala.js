import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm, tileRoof } from '../art/draw.js';
import { person, bus, ambassador, bicycle, banyan, cinemaPoster, dog, crowBird, lateriteWall } from '../art/lib.js';
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
import { LETTERS } from '../game/letters.js';
import { haptics } from '../engine/haptics.js';
import { ask } from '../ui/choice.js';
import { has } from '../game/people.js';

export class Kavala extends Scene {
  constructor() {
    super('kavala', 'Kavala', 'കവല'); this.horizon = 320; this.ground = '#8fb05a'; this.busX = -300; this.busState = 'away'; this.busT = 0; this.carX = 600; this.cycleX = -60;
    this.hotspots = [
      { x: 120, y: 520, r: 44, label: 'bus stop · wave it down', action: () => this.bus() },
      { x: 330, y: 500, r: 30, label: 'post box', action: () => this.post() },
      { x: 300, y: 430, r: 34, label: 'post office', action: () => talk([['The postmaster: “A money order from Dubai? Not yet. A letter from Madras? Raghavan has it. Stamps? Fifteen paise.”', 'പോസ്റ്റ് ഓഫീസ്']]) },
      { x: 60, y: 410, r: 44, label: 'talkies posters', action: () => this.posters() },
      { x: 325, y: 672, r: 36, label: 'cycle shop', action: () => { audio.sfx('cycleBell'); say('The cycle repair man pumps a tyre and tells you your Hercules is still in his shed, from before you left.', 'സൈക്കിൾ'); remember('cycle', 'My old Hercules cycle is still at the repair shop at the kavala, under a sack. The bell works.'); } },
    ];
    this.exits = [{ side: 'bottom', label: 'Idavazhi · home', go: () => router.go('poomukham') }, { side: 'left', y: 640, label: 'Vayal', go: () => router.go('vayal') }, { side: 'right', y: 660, label: 'Kadavu', go: () => router.go('kadavu') }, { side: 'right', y: 560, label: 'Angadi', go: () => router.go('angadi') }];
  }
  // The call to action: step to the edge of the road and put a hand out. The anavandi comes round the bend for anyone who waves,
  // stops with a sigh of brakes and the conductor's whistle, and waits a little while for you to climb on.
  bus() {
    if (this.busState === 'stopped') {
      this.busy = true; audio.sfx('conductor');
      router.interlude('The anavandi to town: a window seat, the conductor\u2019s whistle, paddy and palms and churches and a river, then the market, then the same road back.', () => { clock.minutes += 240; add('vegetables', 1); add('tea', 1); this.busState = 'away'; this.busX = -300; this.waved = 0; }, 3.2);
      delay(4.6, () => { this.busy = false; say('Town and back on the ani-vandi, with a packet of Horlicks biscuits, a Mathrubhumi weekly, and a lap full of someone else\u2019s hens.', 'ടൗൺ', 6); remember('bus', 'Took the KSRTC to town and back. Sat behind the driver, who knew Achan, who knew everyone. The conductor did not take my fare.'); });
      return;
    }
    if (this.busState === 'arriving') { say('It has seen you. The driver lifts two fingers off the wheel, which is a KSRTC promise.', 'ആനവണ്ടി', 4); return; }
    if (this.busState === 'leaving') { say('Gone, in a cloud of red dust and diesel. Wave again in a while; there is always another, eventually.', 'ആനവണ്ടി', 4); return; }
    if (clock.hour < 5.5 || clock.hour >= 22.5) { say('No bus at this hour. The shelter is for the dog and the dog knows it.', 'ആനവണ്ടി', 4); return; }
    if (this.waved) return;
    this.waved = 1; this.idle = 0; audio.sfx('tap'); haptics.light();
    say('You step to the edge of the road and put a hand out, the way everyone does. Somewhere past the banyan, a horn.', 'ആനവണ്ടി', 6);
    delay(2.5, () => { if (this.busState === 'away') { audio.sfx('busHorn'); this.busState = 'arriving'; this.busX = -300; } });
  }
  post() {
    if (state.lettersRead === 0) { say('Nothing to post yet. Wait for Ravi’s letter.', 'പോസ്റ്റ്'); return; }
    if (state.postDay === clock.day) { say('You already posted today. Raghavan clears the box at four.', 'പോസ്റ്റ്'); return; }
    const opts = [{ k: 'rain', t: 'About the rain, and the roof holding', ml: 'മഴയെപ്പറ്റി' }, { k: 'cow', t: 'About Lakshmi, the milk, and Kuttan', ml: 'ലക്ഷ്മിയെപ്പറ്റി' }, { k: 'village', t: 'About Velayudhan, Kunjappan, everyone', ml: 'നാട്ടുകാരെപ്പറ്റി' }];
    if (state.lettersRead >= 3) opts.push({ k: 'quiet', t: 'About the thing you are not saying', ml: 'പറയാത്ത കാര്യം' });
    ask('To Ravi', 'an inland letter, one page, what will you write about?', opts, o => { this.busy = true; audio.sfx('page'); delay(1, () => { state.postDay = clock.day; state.replyTopic = o.k; save(); this.busy = false; audio.sfx('wood');
      say(o.k === 'rain' ? 'You write about the rain for a whole page, because he asked, and because it is easier than the other things. Into the red box.' : o.k === 'cow' ? 'You write about Lakshmi and the milk and Kuttan’s whistling, a page of small true things. Into the red box.' : o.k === 'village' ? 'You write about Velayudhan’s knee and Kunjappan’s book and who married whom, the whole kavala in one page. Into the red box.' : 'You write the thing you have not been saying, and then the rain, to balance it. You post it before you can take it back.', 'കത്തയച്ചു', 6);
      remember('post', 'Posted a reply to Ravi. Wrote about the rain for a whole page because he asked, and because it is easier than the other things.'); if (o.k === 'quiet') remember('post_quiet', 'Wrote to Ravi about the thing neither of us says. Posted it fast. The red box does not give letters back, which is the point of it.'); }); });
  }
  posters() { const f = ['Chemmeen (1965): Sathyan, Sheela, Madhu. Salil Chowdhury’s songs. The whole village went twice.', 'Neelakuyil (1954): Sathyan and Miss Kumari. Someone has drawn a moustache on Miss Kumari.', 'Nirmalyam (1973): P. J. Antony as the velichappad. Not for a Sunday mood, says Velayudhan.']; audio.sfx('page'); say(f[(state.days) % f.length], 'ടാക്കീസ്', 6); remember('talkies', 'The talkies posters on the kavala wall: Chemmeen, Neelakuyil, Nirmalyam. New ones pasted over old ones, decades deep, like the village.'); }
  ambience() { return { murmur: .2, crows: .2, wind: .15 }; }
  tick(dt) {
    const m = clock.minutes % 120; // bus cycle every two game hours: arrives at :00, stops 6 minutes
    if (this.busState === 'away' && m < 6 && clock.hour >= 6 && clock.hour < 22) { this.busState = 'arriving'; this.busX = -300; audio.sfx('busHorn'); }
    if (this.busState === 'arriving') { this.busX += dt * (this.busX < 0 ? 170 : 70); if (this.busX >= 120) { this.busX = 120; this.busState = 'stopped'; this.stopT = 0; audio.sfx('conductor'); if (this.waved) say('Brakes, dust, the conductor\u2019s whistle. He leans out: “Town?”', 'കണ്ടക്ടർ', 5); } }
    if (this.busState === 'stopped') { this.stopT = (this.stopT || 0) + dt; if (this.stopT > (this.waved ? 30 : 12)) { this.busState = 'leaving'; this.waved = 0; audio.sfx('busHorn'); } }
    if (this.busState === 'leaving') { this.busX += dt * 200; if (this.busX > 700) this.busState = 'away'; }
    if (this.busState === 'away' && m > 10) this.busX = -300;
    this.carX -= dt * 60; if (this.carX < -200) this.carX = 700 + Math.random() * 1500;
    this.cycleX += dt * 40; if (this.cycleX > 520) this.cycleX = -200 - Math.random() * 800;
  }
  drawStatic(c, w, h) {
    // junction: a tarred road across the middle, buildings behind (post office, tailor, talkies wall), banyan left
    rect(c, 0, 300, w, 50, vgrad(c, 0, 300, 350, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 9; i++) ellipse(c, hash(i + 7) * w, 316, 20, 14, P.cocoDeep);
    rect(c, 0, 350, w, 180, vgrad(c, 0, 350, 530, [[0, '#8fb05a'], [1, P.earthLt]]));
    lateriteWall(c, 0, 440, w, 60, .35); rect(c, 0, 500, w, 30, P.earthLt);
    palm(c, 345, 380, 150, -14, .95, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    banyan(c, 50, 470, .8);
    // post office: small tiled building with a red letter box and board
    rect(c, 240, 380, 150, 100, vgrad(c, 0, 380, 480, [[0, P.lime], [1, P.limeDk]])); tileRoof(c, 232, 354, 166, 30, P.tile, P.tileLt, P.tileDk); rect(c, 232, 382, 166, 4, P.teakDk);
    rect(c, 300, 410, 36, 70, P.teakDk); rect(c, 304, 414, 28, 62, '#2a1a10'); rect(c, 250, 400, 36, 36, P.teakDk); rect(c, 254, 404, 28, 28, '#9fb37a');
    rect(c, 246, 388, 140, 14, '#c8322a'); text(c, 'POST OFFICE · തപാല്‍', 316, 395, 7, '#fff', 'center', 'sans-serif', 'bold');
    // red letter box on a post
    rect(c, 326, 486, 4, 30, '#444'); roundRect(c, 318, 456, 20, 32, 6, '#c8322a'); rect(c, 321, 466, 14, 3, '#2a1a10'); ellipse(c, 328, 456, 10, 4, '#a82218');
    // talkies poster wall left
    rect(c, 0, 360, 130, 120, P.lateriteDk); cinemaPoster(c, 8, 372, 36, 50, 'CHEMMEEN', '#2a6fa0'); cinemaPoster(c, 50, 376, 34, 46, 'NEELAKUYIL', '#8a2a3a'); cinemaPoster(c, 90, 372, 34, 50, 'NIRMALYAM', '#c8955a');
    // cycle shop right with tyres
    rect(c, 0, 640, w, 2, 'rgba(0,0,0,0)');
    // bus shelter (tin roof on poles) with KSRTC board
    rect(c, 70, 470, 110, 6, '#8a8a90'); for (const px of [76, 170]) rect(c, px, 476, 4, 54, '#555'); rect(c, 80, 500, 90, 8, P.teakLt); rect(c, 90, 452, 70, 16, '#f1c232'); text(c, 'K.S.R.T.C', 125, 460, 8, '#1a1a1a', 'center', 'sans-serif', 'bold');
    // road
    rect(c, 0, 530, w, 110, vgrad(c, 0, 530, 640, [[0, '#5a5a5e'], [1, '#48484c']])); rect(c, 0, 528, w, 4, '#8a8a7a'); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < w / 40; i++) c.fillRect(i * 40, 584, 20, 2);
    // potholes and puddle marks
    ellipse(c, 300, 600, 18, 6, 'rgba(0,0,0,.25)'); ellipse(c, 140, 620, 12, 4, 'rgba(0,0,0,.2)');
    // near side: red earth verge
    rect(c, 0, 640, w, h - 640, vgrad(c, 0, 640, h, [[0, P.earthLt], [1, P.earthDk]]));
    // cycle repair lean-to on the near verge, right
    rect(c, 290, 650, 70, 44, '#6a4a2e'); rect(c, 286, 646, 78, 8, '#8a7a4a'); for (let i = 0; i < 3; i++) { c.strokeStyle = '#222'; c.lineWidth = 3; c.beginPath(); c.arc(306 + i * 20, 678, 9, 0, 7); c.stroke(); } rect(c, 300, 654, 14, 4, '#c8322a');
    // milestone
    poly(c, [[20, 690], [36, 690], [36, 666], [28, 658], [20, 666]], '#f1e4c8'); rect(c, 20, 684, 16, 6, '#e0b43a'); text(c, '3', 28, 674, 8, '#1a1a1a', 'center', 'sans-serif', 'bold');
  }
  drawDynamic(c, w, h) {
    if (has('velayudhan', 'road')) { rect(c, 0, 530, w, 110, '#3a3a40'); rect(c, 0, 528, w, 3, '#8a8a7a'); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < w / 40; i++) c.fillRect(i * 40, 584, 20, 2); }
    const t = this.t, ph = clock.phase;
    // car and cycle on the road (background lane)
    if (this.carX > -200 && this.carX < w + 100) ambassador(c, this.carX, 586, .8, hash(Math.floor(clock.day)) > .5 ? '#f0ead6' : '#2a2a30');
    if (this.cycleX > -60 && this.cycleX < w + 60) { bicycle(c, this.cycleX, 606, 1.1); person(c, this.cycleX, 606, .8, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'walk' }, t); }
    // bus
    if (this.busState !== 'away') { bus(c, this.busX, 596, 1.05); if (this.busState === 'stopped') { for (let i = 0; i < 3; i++) person(c, this.busX + 120 + i * 20, 620 + i * 6, .8, { sex: i ? 'm' : 'f', top: ['#b8443a', '#f1e6d0', '#2d6b5a'][i], mundu: '#f3ecd8', pose: 'walk', flip: true }, t + i); } }
    // people waiting at the stop, postman's cycle
    if (ph !== 'rathri') { person(c, 100, 530, .9, { sex: 'f', top: '#8a2a3a', mundu: P.kasavu, item: 'umbrella' }, t); person(c, 150, 532, .9, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', item: 'bag' }, t); }
    dog(c, 220, 650, .9, t);
    crowBird(c, 330, 452, .9, t);
    if (clock.daylight < .5) { glow(c, 316, 400, 60, '#ffd080', .4); }
  }
}
