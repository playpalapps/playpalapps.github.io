import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm } from '../art/draw.js';
import { person, water, grassTuft, fishShape } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash, lerpColor } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { add } from '../game/pantry.js';
import { haptics } from '../engine/haptics.js';

export class Kadappuram extends Scene {
  constructor() {
    super('kadappuram', 'Kadappuram', 'കടപ്പുറം'); this.horizon = 302; this.ground = '#e8d8b0'; this.pullT = 0; this.pulls = 0; this.crabX = 120; this.crabD = 1; this.gullX = -40; this.netIn = 0;
    this.hotspots = [
      { x: 150, y: 550, r: 70, label: 'karamadi · haul the net', enabled: () => clock.hour >= 6 && clock.hour < 11 && !this.netIn, drag: p => this.haul(p), action: () => {} },
      { x: 290, y: 600, r: 40, label: 'fish', action: () => this.buy() },
      { x: 215, y: 700, r: 60, label: 'walk the shore', action: () => this.walk() },
      { x: 300, y: 552, r: 36, label: 'kattamaram', action: () => this.ride() },
      { x: 120, y: 740, r: 30, label: 'crab', action: () => { audio.sfx('tap'); this.crabD *= -1; found('crab'); say('The crab goes sideways into its hole, offended.', 'ഞണ്ട്'); } },
    ];
    this.exits = [{ side: 'top', x: 40, y: 280, label: 'Pally', go: () => router.go('pally') }];
  }
  // The call to action: take the rope and haul with the men, a stroke at a time towards the land. Nine strokes bring the net in; stop, and the sea takes some back.
  haul(p) {
    const self = this; let anchor = p.x, moved = 0;
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.x - anchor)); if (q.x > anchor) anchor = q.x;
        if (anchor - q.x > 44) { anchor = q.x; self.pulls = Math.min(9, self.pulls + 1); self.pullT = self.pulls / 9; audio.sfx('heave'); haptics.medium();
          if (self.pulls >= 9) { self.netIn = 1; self.gesture = null; add('fish', 3); haptics.success(); say('The last heave and the karamadi comes up the sand, silver and thrashing, the whole line falling backwards laughing. Your share is three mathi and a sunburn.', 'കരമടി', 7); remember('karamadi', 'Hauled the shore net at the kadappuram with the fishermen, a stroke at a time to a song with no words. The net came in full of sardines and one furious eel. They gave me a share I did not earn.'); delay(30, () => { self.netIn = 0; self.pulls = 0; self.pullT = 0; }); } } },
      end() { if (moved < 10) say('Take the rope and haul it towards the land, a stroke at a time, with the men.', 'കരമടി'); }
    };
  }
  buy() { this.busy = true; audio.sfx('splash'); delay(1, () => { this.busy = false; add('fish', 2); say('Ayala and mathi from the women sorting the catch on the sand, wrapped in a plavila, the price settled by shouting.', 'മീൻ'); remember('beachfish', 'Bought fish straight off the sand at the kadappuram. The woman threw in a crab for Amma, whom she had never met, because she knew the house.'); }); }
  tapFree(p) { for (const [sx, sy, id] of [[60, 700, 'shell_cowrie'], [330, 590, 'shell_conch'], [150, 660, 'shell_clam']]) if (Math.hypot(p.x - sx, p.y - sy) < 18) { found(id); return true; } if (clock.phase === 'sandhya' && p.y > 300 && p.y < 420 && Math.abs(p.x - 220) < 80) { found('glitter'); return true; } return false; }
  walk() { did('beach'); this.busy = true; clock.speed = 12; say(clock.phase === 'sandhya' ? 'You walk the wet edge of the kadappuram as the sun goes into the sea. The whole village seems to be here, not speaking, which is rare.' : 'You walk the shore. Foam, broken shells, a dead starfish, a line of crows at the edge of the wet, and the lighthouse far down the coast.', 'കടപ്പുറം', 6); delay(5.5, () => { clock.speed = 1; this.busy = false; remember('shore', 'Walked the kadappuram. The sea here is the same one that goes to the Gulf, which is a thing you think about on a beach with your brother away.'); }); }
  ride() { this.busy = true; audio.sfx('paddle'); router.interlude('Three logs tied with coir, a paddle, and a fisherman who laughs at how you sit. Out past the breakers the land turns into a line of palms.', () => { clock.minutes += 60; }, 4); delay(5.5, () => { this.busy = false; remember('kattamaram', 'Went out on a kattamaram, three logs and coir, past the breakers. Came back soaked, blessed, and certain I had never been so awake.'); }); }
  sea(c, w, t, day, ph) {
    const top = 300, bot = 496;
    // water body: deep at the horizon, turquoise near the shore, with a bright horizon line
    const g = c.createLinearGradient(0, top, 0, bot);
    if (day > .5) { g.addColorStop(0, '#2b6a84'); g.addColorStop(.35, '#3f8fa8'); g.addColorStop(.75, '#6fb8c0'); g.addColorStop(1, '#9fd0cc'); }
    else { g.addColorStop(0, '#0f2230'); g.addColorStop(.4, '#163444'); g.addColorStop(1, '#2a5060'); }
    c.fillStyle = g; c.fillRect(0, top, w, bot - top);
    c.fillStyle = day > .5 ? 'rgba(255,255,255,.35)' : 'rgba(200,220,240,.18)'; c.fillRect(0, top, w, 1.5);
    if (ph === 'sandhya') { c.save(); c.globalAlpha = .55; glow(c, w * .6, top + 10, 180, '#ffa060', 1); c.restore(); }
    // glitter path under the sun / moon
    const gx = ph === 'sandhya' ? w * .6 : day > .5 ? w * .3 : w * .5;
    c.fillStyle = day > .5 ? (ph === 'sandhya' ? 'rgba(255,220,160,.9)' : 'rgba(255,255,255,.75)') : 'rgba(230,236,255,.6)';
    for (let i = 0; i < 60; i++) { const k = hash(i + 200), yy = top + 4 + k * k * (bot - top) * .8, spread = 20 + (yy - top) * .5, xx = gx + (hash(i + 300) - .5) * spread * 2 + Math.sin(t * 1.3 + i) * 3; const a = (.4 + .6 * Math.abs(Math.sin(t * 2.2 + i * 1.7))) * (1 - k * .5); c.globalAlpha = a; c.fillRect(xx, yy, 2 + k * 6, 1); } c.globalAlpha = 1;
    // far swells
    c.strokeStyle = day > .5 ? 'rgba(255,255,255,.22)' : 'rgba(200,220,240,.12)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const yy = top + 14 + i * 12 + Math.sin(t * .7 + i) * 1.5; c.beginPath(); for (let x = 0; x <= w; x += 10) c.lineTo(x, yy + Math.sin(x / 40 + t * 1.2 + i * 2) * 1.5); c.stroke(); }
    // rolling waves: crests travel from mid-sea to the shore, growing, breaking into foam
    const N = 5;
    for (let i = 0; i < N; i++) {
      const p = ((t * .11 + i / N) % 1), q = Math.pow(p, 1.25), yy = top + 70 + q * (bot - top - 70), hgt = 4 + q * 16, amp = 1 + q * 3;
      // body of the wave (slightly lighter) and its shadowed trough below
      c.fillStyle = day > .5 ? `rgba(120,200,210,${.25 + q * .25})` : `rgba(60,110,130,${.2 + q * .2})`;
      c.beginPath(); c.moveTo(-10, yy + hgt); for (let x = -10; x <= w + 10; x += 8) c.lineTo(x, yy + Math.sin(x / 34 + t * 2 + i * 1.3) * amp); c.lineTo(w + 10, yy + hgt); c.closePath(); c.fill();
      c.fillStyle = `rgba(20,60,80,${.12 * q})`; c.beginPath(); c.moveTo(-10, yy + hgt + 10); for (let x = -10; x <= w + 10; x += 8) c.lineTo(x, yy + hgt + Math.sin(x / 34 + t * 2 + i * 1.3) * amp); c.lineTo(w + 10, yy + hgt + 10); c.closePath(); c.fill();
      // foam along the crest where it breaks (closer waves foam more)
      const foam = Math.max(0, q - .35) / .65; if (foam > 0) { c.strokeStyle = `rgba(255,255,255,${.5 + foam * .45})`; c.lineCap = 'round';
        for (let x = -10; x <= w + 10; x += 8) { const s = Math.sin(x / 34 + t * 2 + i * 1.3), s2 = Math.sin(x / 11 + t * 3 + i); if (s2 > .1 - foam * .6) { c.lineWidth = 1 + foam * 3 * Math.abs(s2); c.beginPath(); c.moveTo(x, yy + s * amp - 1); c.lineTo(x + 7, yy + Math.sin((x + 7) / 34 + t * 2 + i * 1.3) * amp - 1); c.stroke(); } }
        c.fillStyle = `rgba(255,255,255,${.35 * foam})`; for (let k = 0; k < 14; k++) { const fx = hash(k + i * 7 + 400) * (w + 20) - 10, fy = yy + Math.sin(fx / 34 + t * 2 + i * 1.3) * amp + hash(k + 500) * hgt; c.beginPath(); c.ellipse(fx, fy, 6 + hash(k) * 8 * foam, 1.5 + foam * 2, 0, 0, 7); c.fill(); } }
    }
    // the wash: the last wave spreading up the wet sand and sliding back, with bubbles and a wet sheen
    const wash = (Math.sin(t * .55) + 1) / 2, edge = bot + 6 + wash * 26;
    c.fillStyle = 'rgba(150,170,160,.35)'; c.fillRect(0, bot - 4, w, edge - bot + 4);
    c.fillStyle = `rgba(255,255,255,${.55 + wash * .3})`; c.beginPath(); c.moveTo(0, bot - 6); for (let x = 0; x <= w; x += 8) c.lineTo(x, edge + Math.sin(x / 28 + t * .9) * 5 + Math.sin(x / 9 + t * 2) * 2); c.lineTo(w, bot - 6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 24; k++) { const bx = hash(k + 600) * w, by = edge - 2 - hash(k + 700) * 18 * wash; if (by > bot - 4) circle(c, bx, by, .8 + hash(k) * 1.6, 'rgba(255,255,255,.5)'); }
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, edge + 4, w, 10); // lingering sheen
  }
  ambience() { return { sea: .8, gulls: .4, wind: .35, murmur: clock.hour >= 6 && clock.hour < 11 ? .25 : 0 }; }
  tick(dt) { if (!this.gesture && !this.netIn && this.pullT > 0) { this.pullT = Math.max(0, this.pullT - dt * .012); this.pulls = Math.floor(this.pullT * 9); } this.crabX += this.crabD * dt * 18; if (this.crabX > 200) this.crabD = -1; if (this.crabX < 80) this.crabD = 1; this.gullX += dt * 24; if (this.gullX > 420) this.gullX = -60; }
  drawStatic(c, w, h) {
    // the sea fills the horizon band; drawn dynamic. Static: sand, nets drying on poles, kattamaram, lighthouse far right
    rect(c, 0, 470, w, h - 470, vgrad(c, 0, 470, h, [[0, '#f0e2c0'], [.3, '#e8d8b0'], [1, '#c9b48a']]));
    for (let i = 0; i < 80; i++) { c.fillStyle = i % 3 ? 'rgba(120,100,70,.18)' : 'rgba(255,255,255,.35)'; circle(c, hash(i + 5) * w, 480 + hash(i + 6) * 310, .8 + hash(i) * 1.4, c.fillStyle); }
    // nets on poles
    for (const px of [40, 120]) { rect(c, px, 560, 4, 90, P.teak); } c.strokeStyle = 'rgba(80,60,40,.55)'; c.lineWidth = .8; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(42, 570 + i * 8); c.quadraticCurveTo(82, 576 + i * 8, 122, 570 + i * 8); c.stroke(); } for (let i = 0; i < 8; i++) line(c, 50 + i * 9, 570, 50 + i * 9, 636, 'rgba(80,60,40,.45)', .8);
    // kattamaram on the sand
    c.save(); c.translate(300, 556); c.rotate(-.08); for (let i = 0; i < 3; i++) roundRect(c, -46, -8 + i * 7, 92, 8, 4, i % 2 ? P.teakLt : P.teak); line(c, -44, -4, 44, -4, '#c9b48a', 1); line(c, -44, 8, 44, 8, '#c9b48a', 1); c.restore(); line(c, 330, 528, 352, 568, P.teakLt, 2.5);
    // baskets with the catch, a palm leaning from the right, shells
    for (const [bx, by] of [[270, 606], [304, 616]]) { ellipse(c, bx, by, 16, 6, '#a67c4a'); poly(c, [[bx - 16, by], [bx + 16, by], [bx + 13, by - 12], [bx - 13, by - 12]], '#c49a60'); for (let i = 0; i < 6; i++) fishShape(c, bx - 10 + i * 4, by - 12, .5, '#9fb4c4'); }
    palm(c, w - 10, 760, 400, -40, 1.3, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    for (let i = 0; i < 12; i++) ellipse(c, hash(i + 40) * w, 640 + hash(i + 41) * 140, 3, 2, '#f6f3ea', hash(i) * 3);
    // three real shells to find
    ellipse(c, 60, 700, 5, 3.5, '#f3e6d0'); ellipse(c, 60, 699, 2, 1.2, '#b89a7a'); c.save(); c.translate(330, 590); c.rotate(.4); ellipse(c, 0, 0, 6, 4, '#f0e0cc'); poly(c, [[4, 0], [10, -1], [4, 2]], '#f0e0cc'); c.restore(); c.fillStyle = '#e8d8c0'; c.beginPath(); c.arc(150, 660, 5, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(120,90,60,.4)'; c.lineWidth = .6; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(150, 660); c.lineTo(150 + Math.cos(Math.PI + i * .78) * 5, 660 + Math.sin(Math.PI + i * .78) * 5); c.stroke(); }
    for (let i = 0; i < 10; i++) grassTuft(c, 20 + hash(i + 60) * 120, 560 + hash(i + 61) * 60, .6, '#9aa86a');
  }
  drawDynamic(c, w, h) {
    const t = this.t, day = clock.daylight, ph = clock.phase;
    this.sea(c, w, t, day, ph);
    // lighthouse far on the right horizon, blinking at night
    rect(c, 340, 276, 6, 26, '#f1e4c8'); rect(c, 340, 276, 6, 4, '#c8322a'); rect(c, 340, 288, 6, 3, '#c8322a'); if (day < .5 && Math.floor(t * .7) % 2 === 0) glow(c, 343, 276, 14, '#ffe08a', .8);
    // boats out at sea, gulls
    for (let i = 0; i < 3; i++) { const bx = ((t * 3 + i * 130) % (w + 60)) - 30; poly(c, [[bx - 10, 318 + i * 6], [bx + 10, 318 + i * 6], [bx + 6, 322 + i * 6], [bx - 6, 322 + i * 6]], '#2a2a2a'); line(c, bx, 308 + i * 6, bx, 318 + i * 6, '#2a2a2a', 1); }
    for (let i = 0; i < 3; i++) { const gx = this.gullX + i * 30, gy = 240 + Math.sin(t * 1.5 + i) * 10, f = Math.sin(t * 7 + i); c.strokeStyle = '#f6f3ea'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(gx - 7, gy - f * 3); c.quadraticCurveTo(gx, gy + 1, gx + 7, gy - f * 3); c.stroke(); }
    // fishermen pulling the karamadi in the morning: a line of men on a rope, the net in the surf
    if (clock.hour >= 6 && clock.hour < 11) { const k = this.pullT, lean = this.gesture ? Math.sin(t * 6) * 3 : 0; for (let i = 0; i < 7; i++) person(c, 60 + i * 26 - k * 40 + lean, 566 + (i % 2) * 6, .66, { sex: 'm', bare: true, mundu: '#d9d2c0', pose: this.gesture ? 'walk' : 'stand', skin: '#6a4028' }, t * 1.5 + i); line(c, 40 - k * 40, 528, 250 - k * 70, 532 - k * 10, '#c9b48a', 2); const nx = 250 - k * 70, ny = 528 - k * 10; c.strokeStyle = 'rgba(60,50,40,.5)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(nx, ny, 8 + i * 5, Math.PI * .9, Math.PI * 1.9); c.stroke(); } if (k > .5) for (let i = 0; i < 8; i++) fishShape(c, nx - 20 + hash(i) * 40, ny - 4 + hash(i + 9) * 10 + Math.sin(t * 9 + i) * 2 * (1 - this.netIn), .45, '#cfd8dc'); }
    // women sorting the catch
    person(c, 280, 630, .74, { sex: 'f', top: '#2d6b5a', mundu: '#efe6cf', pose: 'sit' }, t); person(c, 320, 640, .74, { sex: 'f', top: '#8a2a3a', mundu: '#efe6cf', pose: 'sit', flip: true }, t);
    // crab
    const cx = this.crabX, cy = 740; c.fillStyle = '#c8603a'; ellipse(c, cx, cy, 7, 4, '#c8603a'); for (let i = -1; i <= 1; i += 2) { line(c, cx + i * 6, cy, cx + i * 11, cy - 4 + Math.sin(t * 12) * 2, '#c8603a', 1.5); line(c, cx + i * 5, cy + 2, cx + i * 10, cy + 5, '#c8603a', 1.5); }
    if (ph === 'sandhya' || ph === 'rathri') { for (let i = 0; i < 5; i++) person(c, 40 + i * 70, 690 + (i % 2) * 20, .72, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a', '#f1e6d0'][i], mundu: '#f3ecd8', pose: 'sit', flip: i % 2 }, t + i); }
  }
}
