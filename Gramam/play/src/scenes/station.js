import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm, tileRoof } from '../art/draw.js';
import { person, hurricaneLamp, crowBird, dog } from '../art/lib.js';
import { state, remember, save, note } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';
import { haptics } from '../engine/haptics.js';

import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { add } from '../game/pantry.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';

export class Station extends Scene {
  constructor() {
    super('station', 'Station', 'റെയിൽവേ സ്റ്റേഷൻ'); this.horizon = 300; this.ground = P.earthLt; this.trainX = -900; this.trainState = 'away'; this.weighT = 0; this.called = 0; this.arm = 0; this.masterX = 190; this.masterY = 500; this.lastTrainAt = -1e9; this.waitT = 0;
    this.hotspots = [
      { x: 70, y: 470, r: 40, label: 'weighing machine', action: () => this.weigh() },
      { x: 300, y: 480, r: 40, label: 'chaya kettle', action: () => this.chaya() },
      { x: 190, y: 470, r: 40, label: 'station master', action: () => this.master() },
      { x: 215, y: 560, r: 60, label: 'bench · wait for the train', action: () => this.bench() },
      { x: 215, y: 660, r: 70, label: 'Ravi', enabled: () => state.raviArriving && this.trainState === 'stopped', action: () => this.ravi() },
    ];
    this.exits = [{ side: 'left', y: 620, label: 'Pally', go: () => router.go('pally') }, { side: 'right', y: 620, label: 'Masjid', go: () => router.go('masjid') }];
  }
  weigh() { this.busy = true; audio.sfx('coin'); this.weighT = 1; tween(this, { weighT: 0 }, 2.2, t => t, () => { this.busy = false; const kg = 52 + (state.days * 7) % 9, fortunes = ['You will travel across water.', 'A letter brings good news.', 'Beware of the words of a barber.', 'Your patience will be rewarded by a cow.', 'Wealth is coming by the second show.']; { const fo = fortunes[state.days % fortunes.length]; say(pick(`The machine blinks its coloured lights, whirs, and spits a card: ${kg} kg. “${fo}”`, `യന്ത്രം നിറമുള്ള വിളക്കുകൾ മിന്നിച്ച്, മൂളി, ഒരു കാർഡ് തുപ്പുന്നു: ${kg} കിലോ. “${t(fo)}”`), 'തൂക്കം', 6); } remember('weigh', 'Put ten paise in the station weighing machine for the lights and the fortune card. The fortune was wrong and the weight was rude.'); }); }
  chaya() { this.busy = true; audio.sfx('pour'); delay(1.4, () => { this.busy = false; audio.sfx('slurp'); say('Chaya from the vendor’s kettle in a glass that has met every train since 1952. “Chaaaya, chaaya,” he says to nobody, from habit.', 'ചായ'); remember('stationchaya', 'Chaya on the platform from the kettle man, who calls the trains by their nicknames and the passengers by their fathers.'); }); }
  master() { if (this.called) { talk([['The station master, flag out, not looking at you: “It is coming. Sit. Standing does not make it faster, I have checked for thirty years.”', 'സ്റ്റേഷൻ മാസ്റ്റർ']]); return; }
    talk([['The station master, white uniform, green flag under his arm: “The up train is at eleven-forty. It is never at eleven-forty. Sit on the bench; it comes when somebody sits. That is the only rule this station has.”', 'സ്റ്റേഷൻ മാസ്റ്റർ'], state.raviArriving ? ['“Your brother is on the morning train. The telegram came through this office; I read it, naturally. Stand by the second bench, he always got off at the second bench.”'] : ['“Your Achan met every train for a month when your Amma was in Madras. I let him sit in the office. He never once asked the time.”']]); }
  // The call to action: sit, and the train comes. Nothing else brings it. Sitting lowers the signal arm, sends the master to the edge with his flag,
  // sets the rails humming, and some twenty seconds later the whistle is heard from beyond the palms. Once it has gone, the next one is a while off.
  bench() {
    const h = clock.hour;
    if (h >= 23 || h < .5) { this.busy = true; clock.speed = 8; this.trainState = 'leaving'; this.trainX = -900; audio.sfx('whistle'); say('Lights, a roar, a wall of wind and the night mail is gone without stopping, the station master not even looking up.', 'രാത്രി തീവണ്ടി', 6); delay(5, () => { clock.speed = 1; this.busy = false; found('night_mail'); }); return; }
    if (this.trainState !== 'away') { say('You sit. The train is here; the chaya man is doing his best business of the day.', 'ബെഞ്ച്', 4); return; }
    if (this.called) { say('You sit again. The arm is down, the master has his flag out. It is coming.', 'ബെഞ്ച്', 4); return; }
    const since = (performance.now() - this.lastTrainAt) / 60000;
    if (since < 8) { this.busy = true; if (clock.mode === 'story') clock.speed = 14; say('You sit on the long bench under the name board. The last train has only just gone; the next is a long way down the line. A goat examines the timetable.', 'ബെഞ്ച്', 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('stationbench', 'Sat on the platform bench with no train to meet. The rails hum long before anything comes; Achan taught me that.'); }); return; }
    this.called = 1; this.waitT = 0; this.idle = 0; audio.sfx('tap'); haptics.light();
    tween(this, { arm: 1 }, 1.6, t => t * t * (3 - 2 * t)); tween(this, { masterX: 232, masterY: 556 }, 3.5, t => t * t * (3 - 2 * t));
    say(state.raviArriving ? 'You sit on the long bench under the name board. The master walks to the edge with his flag. The rails begin to hum. Ravi is on this one.' : 'You sit on the long bench under the name board. The signal arm drops; the master walks to the edge with his flag. Far down the line, the rails begin to hum.', 'ബെഞ്ച്', 7);
    remember('stationbench', 'Sat on the platform bench and the train came, the way Achan said it would if you sat long enough. The rails hum long before anything shows.');
    delay(14, () => { if (this.called) audio.sfx('whistle', { dist: 3 }); });
    delay(22, () => { if (this.called && this.trainState === 'away') { this.trainState = 'arriving'; this.trainX = -900; audio.sfx('whistle', { dist: 1.4 }); } });
  }
  ravi() { this.busy = true; audio.sfx('chime'); delay(1, () => { state.raviArriving = false; state.raviHome = state.days; save(); this.busy = false; say('Ravi, off the train with a suitcase and a cassette player, thinner, browner, grinning: “Chettaa. Is the kadala curry still there?”', 'രവി വന്നു', 7); remember('ravihome', 'Ravi came home on the morning train. We stood on the platform for a full minute not saying anything, and then he asked about the curry. Two months of leave. The house is full again.'); }); }
  ambience() { return { crows: .2, murmur: .18, wind: .2, rails: this.trainState !== 'away' ? .5 : this.called ? Math.min(.35, this.waitT * .02) : 0 }; }
  tick(dt) {
    const m = clock.minutes % 180; // a train every three hours at :40
    if (this.trainState === 'away' && m >= 40 && m < 48 && clock.hour >= 5 && clock.hour < 23) { this.trainState = 'arriving'; this.trainX = -900; audio.sfx('whistle'); }
    if (this.trainState === 'arriving') { this.trainX += dt * (this.trainX < -300 ? 170 : 90); if (this.trainX >= 0) { this.trainX = 0; this.trainState = 'stopped'; this.stopAt = clock.minutes; this.stopT = 0; audio.sfx('conductor'); } }
    if (this.trainState === 'stopped') { this.stopT = (this.stopT || 0) + dt; const long = this.called ? 42 : 18; if (this.stopT > long || (clock.mode === 'story' && (clock.minutes - this.stopAt > 4 || clock.minutes < this.stopAt))) { this.trainState = 'leaving'; audio.sfx('whistle'); } }
    if (this.trainState === 'leaving') { this.trainX += dt * 200; if (this.trainX > 1300) { this.trainState = 'away'; this.lastTrainAt = performance.now(); if (this.called) { this.called = 0; tween(this, { arm: 0 }, 1.2, t => t); tween(this, { masterX: 190, masterY: 500 }, 3, t => t); } } }
    if (this.called) this.waitT += dt;
    if (this.trainState === 'away' && m > 60) this.trainX = -900;
  }
  drawStatic(c, w, h) {
    rect(c, 0, 290, w, 40, vgrad(c, 0, 290, 330, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 8; i++) ellipse(c, hash(i + 3) * w, 306, 20, 14, P.cocoDeep);
    palm(c, 40, 340, 140, 16, .9, [P.teakLt, P.teakDk, P.cocoDk, P.coco]); palm(c, 330, 350, 150, -14, .85, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // station building: tiled roof, yellow-cream walls, red trim, name board, master's office window with a clock
    rect(c, 90, 380, 250, 120, vgrad(c, 0, 380, 500, [[0, '#f1dfa8'], [1, '#d9c488']])); tileRoof(c, 70, 340, 290, 44, P.tile, P.tileLt, P.tileDk); rect(c, 70, 382, 290, 5, '#8a2a1c');
    rect(c, 120, 400, 36, 50, '#8a2a1c'); rect(c, 124, 404, 28, 42, '#2a1a10'); rect(c, 250, 400, 60, 40, '#8a2a1c'); rect(c, 254, 404, 52, 32, '#9fc2cc'); circle(c, 280, 420, 10, '#f1e4c8'); line(c, 280, 420, 280, 413, '#222', 1.5); line(c, 280, 420, 286, 420, '#222', 1);
    rect(c, 140, 350, 150, 24, '#f1c232'); rect(c, 140, 350, 150, 3, '#1a1a1a'); text(c, 'GRAMAM', 215, 358, 11, '#1a1a1a', 'center', 'sans-serif', 'bold'); text(c, 'ഗ്രാമം', 215, 369, 7, '#1a1a1a', 'center', 'sans-serif');
    rect(c, 170, 400, 50, 100, '#8a2a1c'); rect(c, 174, 404, 42, 92, '#1a0e0e');
    // weighing machine (the coin kind, with lights), chaya kettle stall, bench
    roundRect(c, 50, 420, 40, 90, 6, '#c8322a'); rect(c, 56, 426, 28, 20, '#1a1a2e'); for (let i = 0; i < 4; i++) circle(c, 60 + i * 7, 450, 2.2, ['#ff5a5a', '#ffd25a', '#5aff8a', '#5aa0ff'][i]); rect(c, 58, 458, 24, 30, '#e8dcc0'); roundRect(c, 44, 508, 52, 8, 3, '#8a1a10');
    rect(c, 280, 460, 50, 40, '#3a2a1c'); rect(c, 284, 464, 42, 32, '#5a4632'); ellipse(c, 300, 478, 10, 8, P.brass); rect(c, 296, 466, 8, 6, P.brassDk); for (let i = 0; i < 4; i++) rect(c, 312 + i * 4, 474, 3, 10, 'rgba(220,230,240,.6)');
    rect(c, 150, 530, 130, 8, P.teakLt); rect(c, 156, 538, 6, 20, P.teak); rect(c, 268, 538, 6, 20, P.teak); rect(c, 150, 512, 130, 4, P.teakDk); for (let i = 0; i < 6; i++) rect(c, 154 + i * 21, 516, 16, 14, P.teak);
    // platform edge, yellow line, rails below with sleepers, signal post
    rect(c, 0, 500, w, 70, vgrad(c, 0, 500, 570, [[0, '#c9b998'], [1, '#a8987a']])); rect(c, 0, 566, w, 6, '#f1c232'); rect(c, 0, 572, w, 10, '#7a6a52');
    rect(c, 0, 582, w, h - 582, vgrad(c, 0, 582, h, [[0, '#6a5a44'], [1, '#4a3a2c']])); for (let i = 0; i < w / 18; i++) rect(c, i * 18, 640, 12, 60, '#3a2a1c'); rect(c, 0, 636, w, 5, '#8a8a90'); rect(c, 0, 700, w, 5, '#8a8a90');
    rect(c, 340, 400, 4, 180, '#555'); rect(c, 336, 576, 12, 6, '#333'); for (let i = 0; i < 6; i++) rect(c, 338, 420 + i * 26, 8, 1.5, '#777');
    hurricaneLamp(c, 215, 390, 1, false);
  }
  drawDynamic(c, w, h) {
    const t = this.t;
    // semaphore: arm horizontal = stop, dropped = the line is clear; lamp red/green behind the spectacle
    { const ax = 342, ay = 426, a = this.arm * .8; c.save(); c.translate(ax, ay); c.rotate(a); rect(c, 0, -3, 30, 6, '#c8322a'); rect(c, 22, -3, 5, 6, '#f1e4c8'); c.restore(); circle(c, ax - 5, ay, 3, this.arm > .5 ? '#40ff60' : '#ff4040'); if (clock.daylight < .5) glow(c, ax - 5, ay, 10, this.arm > .5 ? '#60ff80' : '#ff6060', .6); }
    // the station master: at his door, or at the platform edge with the green flag out when a train has been called
    { const mx = this.masterX, my = this.masterY, out = Math.max(0, (mx - 190) / 42); person(c, mx, my, .9, { sex: 'm', top: '#f1e6d0', mundu: '#f1e6d0', cap: '#f1e6d0', skin: '#9c6a48', moustache: true }, t); if (out < .5) rect(c, mx + 10, my - 50, 10, 3, '#2a8a3a'); else { const wv = Math.sin(t * 3) * 3; line(c, mx + 10, my - 46, mx + 26, my - 60 + wv, '#5a3a22', 1.5); poly(c, [[mx + 26, my - 60 + wv], [mx + 40, my - 56 + wv * 1.4], [mx + 40, my - 48 + wv * 1.4], [mx + 26, my - 52 + wv]], '#2a8a3a'); } }
    person(c, 300, 500, .85, { sex: 'm', top: '#e0b43a', mundu: '#f3ecd8', skin: '#b08060' }, t);
    if (this.weighT > 0) { for (let i = 0; i < 4; i++) { c.globalAlpha = (Math.floor(t * 8) + i) % 2 ? 1 : .3; circle(c, 60 + i * 7, 450, 3, ['#ff5a5a', '#ffd25a', '#5aff8a', '#5aa0ff'][i]); } c.globalAlpha = 1; }
    if (clock.phase !== 'rathri') { person(c, 240, 528, .8, { sex: 'f', top: '#8a2a3a', mundu: P.kasavu, pose: 'sit', item: 'umbrella' }, t); person(c, 120, 530, .8, { sex: 'm', top: '#2d6b5a', mundu: '#f3ecd8', pose: 'sit', item: 'bag' }, t); }
    dog(c, 60, 560 - (this.called ? 4 : 0), .9, this.called ? t * 3 : t);
    // the train: an engine and four coaches, red and cream, sliding along the rails
    if (this.trainState !== 'away') {
      const x0 = this.trainX, y = 700;
      for (let i = 0; i < 4; i++) { const cx = x0 - 180 - i * 180; roundRect(c, cx - 84, y - 70, 168, 62, 4, '#8a2a1c'); rect(c, cx - 84, y - 70, 168, 20, '#f1dfa8'); for (let k = 0; k < 6; k++) roundRect(c, cx - 76 + k * 27, y - 64, 18, 14, 2, '#cfe3ea'); for (const wx of [cx - 60, cx - 40, cx + 40, cx + 60]) circle(c, wx, y - 4, 7, '#222'); }
      roundRect(c, x0 - 90, y - 84, 180, 76, 4, '#2a2a30'); rect(c, x0 - 90, y - 84, 180, 10, '#c8322a'); roundRect(c, x0 + 40, y - 78, 40, 30, 3, '#cfe3ea'); circle(c, x0 + 88, y - 44, 6, '#ffd27a'); rect(c, x0 - 70, y - 100, 20, 18, '#1a1a1a'); for (const wx of [x0 - 60, x0 - 34, x0 + 30, x0 + 56]) { circle(c, wx, y - 4, 10, '#222'); circle(c, wx, y - 4, 4, '#888'); }
      text(c, 'JAYANTHI JANATA', x0 - 360, y - 54, 7, '#f1dfa8', 'center', 'sans-serif', 'bold');
      if (this.trainState === 'stopped') { for (let i = 0; i < 3; i++) person(c, 100 + i * 60, 572, .78, { sex: i ? 'm' : 'f', top: ['#b8443a', '#f1e6d0', '#2d6b5a'][i], mundu: '#f3ecd8', pose: 'walk', item: i === 1 ? 'bag' : null }, t + i); if (state.raviArriving) { person(c, 215, 640, 1, { sex: 'm', top: '#2a3a8a', mundu: '#f3ecd8', skin: '#a9744f' }, t); rect(c, 236, 610, 16, 22, '#5a3a22'); const a = .5 + .3 * Math.sin(t * 3); c.globalAlpha = a; c.strokeStyle = '#fff6e0'; c.lineWidth = 1.2; c.beginPath(); c.arc(215, 600, 12, 0, 7); c.stroke(); c.globalAlpha = 1; } }
      // smoke from the engine
      for (let i = 0; i < 6; i++) { const k = ((t * .6 + i * .17) % 1); c.globalAlpha = (1 - k) * .4; circle(c, x0 - 60 - k * 80 * (this.trainState === 'stopped' ? .3 : 1), y - 110 - k * 60, 6 + k * 18, '#cfcfd4'); } c.globalAlpha = 1;
    }
    crowBird(c, 150, 346, .9, t);
    if (clock.daylight < .6) { glow(c, 215, 378, 50, '#ffb050', .5); circle(c, 215, 380, 2.2, P.flameHi); }
  }
}
