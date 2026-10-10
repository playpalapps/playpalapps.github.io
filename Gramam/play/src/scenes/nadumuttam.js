import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, hgrad, shadow, glow, line, tileRoof } from '../art/draw.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { inOut, hash, rnd } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { drawCat, catTap } from '../game/cat.js';
import { dust } from '../engine/particles.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { person } from '../art/lib.js';
import { haptics } from '../engine/haptics.js';

// courtyard opening (trapezoid) in logical coords, relative to center
const OPEN = { top: 70, bot: 262, hwTop: 78, hwBot: 118 }; // half widths
export class Nadumuttam extends Scene {
  constructor() {
    super('nadumuttam', 'Nadumuttam', 'നടുമുറ്റം');
    this.outdoor = true; this.horizon = 300; this.ground = '#7a2e22'; this.swing = 0; this.swingV = 0; this.sweepT = 0; this.dial = 0;
    this.hotspots = [
      { x: 78, y: 596, r: 40, label: 'Murphy radio', action: () => this.radio() },
      { x: 300, y: 606, r: 46, label: 'aattukattil', action: () => this.swingBed() },
      { x: 190, y: 470, r: 70, label: 'chool · sweep the leaves', enabled: () => !state.swept, drag: p => this.sweepLeaves(p), action: () => {} },
      { x: 190, y: 640, r: 36, label: 'Ramayanam', enabled: () => fest().karkidakam && clock.hour >= 17 && state.festival.ramayanamDay !== clock.day, action: () => this.ramayanam() },
    ];
    this.exits = [{ side: 'left', y: 700, label: 'Poomukham', go: () => router.go('poomukham') }, { side: 'right', y: 700, label: 'Adukkala', go: () => router.go('adukkala') }, { x: 30, y: 330, side: 'top', label: 'Ara', go: () => router.go('ara') }];
  }
  radio() {
    state.radio = !state.radio; if (state.radio) did('radio'); audio.sfx('radioOn'); tween(this, { dial: state.radio ? 1 : 0 }, .6, inOut);
    if (state.radio) { say('Akashvani, Thrissur. A song drifts through the house.', 'ആകാശവാണി'); remember('radio', 'Found Akashvani on the Murphy. It still takes a minute to warm up, like Achan did.'); }
    else say('The radio clicks off. The courtyard hums instead.', 'റേഡിയോ');
  }
  swingBed() {
    this.busy = true; clock.speed = 14; audio.sfx('swing'); this.swingV = 1.6;
    say('You lie back on the aattukattil and let it swing. Time loosens.', 'ആട്ടുകട്ടിൽ', 5);
    delay(1.6, () => audio.sfx('swing')); delay(3.2, () => audio.sfx('swing'));
    delay(5.5, () => { clock.speed = 1; this.busy = false; remember('swing', 'Lay on the aattukattil in the nadumuttam watching a square of sky. A kite crossed it twice.'); });
  }
  // Every morning the night has put leaves in the courtyard. Take the broom and sweep them out, a stroke at a time; the floor stays clean till tomorrow.
  sweepLeaves(p) {
    const self = this; let lastX = p.x, dir = 0, moved = 0; if (this.sweepP === undefined) this.sweepP = 0; this.broomX = p.x; this.broomOn = true;
    return {
      move(q) { moved = Math.max(moved, Math.abs(q.x - p.x)); self.broomX = Math.max(100, Math.min(330, q.x)); const d = Math.sign(q.x - lastX); if (d && d !== dir && Math.abs(q.x - lastX) > 8) { if (dir) { self.sweepP = Math.min(1, self.sweepP + 1 / 7); audio.sfx('sweep', { reps: 1 }); haptics.soft(); dust(self.ps, Math.max(110, Math.min(320, q.x)), 24, 470, 520, 2); } dir = d; lastX = q.x; }
        if (self.sweepP >= 1) { self.gesture = null; self.broomOn = false; state.swept = true; state.sweptDay = clock.day; self.sweepP = 0; haptics.success(); say('The courtyard is clear. Dust hangs in the light and settles somewhere else.', 'ചൂല്'); remember('sweep', 'Swept the nadumuttam. The stones underneath are worn smooth by a century of brooms.'); } },
      end() { self.broomOn = false; if (moved < 10) say('Take the chool and sweep the leaves out, side to side.', 'ചൂല്'); }
    };
  }  ramayanam() {
    this.busy = true; clock.speed = 16; audio.sfx('page'); say('You open the Adhyathma Ramayanam on the wooden stand and read aloud, the way Achan did, to nobody and everybody.', 'രാമായണം', 6);
    delay(2, () => audio.sfx('page')); delay(4, () => audio.sfx('page'));
    delay(6, () => { clock.speed = 1; this.busy = false; state.festival.ramayanamDay = clock.day; remember('ramayanam', 'Karkidakam evening. Read the Ramayanam aloud in the nadumuttam with the rain for an audience. My Malayalam is slower than it was.'); });
  }
  tapFree(p) { if (state.rainT > .3 && p.y > 400 && p.y < 520 && Math.abs(p.x - 215) < 120) { found('rain_tiles'); return true; } return false; }
  ambience() { const f = fest(); return f.thiruvathira && clock.hour >= 19 ? { njattupattu: .35 } : {}; }
  tap(p, w, h) { if (!this.busy && this.catHere() && Math.hypot(p.x - 190, p.y - 540) < 30) { catTap(); this.idle = 0; return true; } return super.tap(p, w, h); }
  catHere() { return clock.phase === 'sandhya' || clock.phase === 'rathri'; }
  glows() { const g = []; if (clock.daylight < .5) g.push({ x: 190, y: 330, r: 130, a: .7 }); if (state.radio) g.push({ x: 78, y: 585, r: 30, a: .3 }); return g; }
  drawRain(c, w, h, k) {
    const cx = w / 2; c.save(); c.beginPath();
    c.moveTo(cx - OPEN.hwTop, OPEN.top); c.lineTo(cx + OPEN.hwTop, OPEN.top); c.lineTo(cx + 134, 520); c.lineTo(cx - 134, 520); c.closePath(); c.clip();
    super.drawRain(c, w, h, k); c.restore();
    // splashes on courtyard floor
    const n = Math.floor(14 * k); c.fillStyle = 'rgba(220,235,245,.45)';
    for (let i = 0; i < n; i++) { const s = (this.t * 6 + i * 1.7) % 1, yy = hash(i + 3 + Math.floor(this.t * 6 + i * 1.7)), y = 404 + yy * 112, hw = 92 + yy * 42, x = cx - hw + hash(i + Math.floor(this.t * 6 + i * 1.7)) * hw * 2; c.globalAlpha = (1 - s) * .6; c.beginPath(); c.ellipse(x, y, 2 + s * 6, .8 + s * 2, 0, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }
  drawStatic(c, w, h) {
    const cx = w / 2;
    // far wall across the courtyard (seen through the opening): lime wall with azhi window
    rect(c, cx - 130, 250, 260, 160, vgrad(c, 0, 250, 410, [[0, P.limeShade], [1, P.limeDk]]));
    rect(c, cx - 130, 250, 260, 10, 'rgba(40,22,10,.45)');
    rect(c, cx - 36, 290, 72, 60, P.teakDk); rect(c, cx - 30, 296, 60, 48, '#2a3d22'); c.fillStyle = P.teakLt; for (let i = 0; i < 5; i++) c.fillRect(cx - 26 + i * 12, 296, 4, 48);
    // inner roof: four slopes converging to the opening
    const T = OPEN.top, B = OPEN.bot, hwT = OPEN.hwTop, hwB = OPEN.hwBot;
    // ceiling (underside of the roof) around the opening: dark teak rafters
    poly(c, [[-10, -10], [w + 10, -10], [w + 10, 250], [cx + hwB, 250], [cx + hwT, T], [cx - hwT, T], [cx - hwB, 250], [-10, 250]], '#2e1d12');
    // rafters radiating
    c.strokeStyle = '#4a3020'; c.lineWidth = 3;
    for (let i = -6; i <= 6; i++) { const x0 = cx + i * 30, x1 = cx + i * 24; c.beginPath(); c.moveTo(x0, -10); c.lineTo(cx + Math.sign(i || 1) * Math.min(Math.abs(x1 - cx), hwT) + (i === 0 ? 0 : 0), i === 0 ? T : T + Math.min(Math.abs(i) * 12, 190)); c.stroke(); }
    for (let i = 0; i < 7; i++) { const y = 20 + i * 36; c.beginPath(); c.moveTo(-10, y); c.lineTo(cx - hwT - (hwB - hwT) * (y - T) / (250 - T), Math.max(T, y)); c.moveTo(w + 10, y); c.lineTo(cx + hwT + (hwB - hwT) * (y - T) / (250 - T), Math.max(T, y)); c.stroke(); }
    // tiled eaves edge of the opening (sloping inward)
    poly(c, [[cx - hwT - 14, T - 8], [cx + hwT + 14, T - 8], [cx + hwT, T], [cx - hwT, T]], P.tileDk);
    poly(c, [[cx - hwT, T], [cx - hwB, 250], [cx - hwB - 10, 250], [cx - hwT - 14, T - 8]], P.tile);
    poly(c, [[cx + hwT, T], [cx + hwB, 250], [cx + hwB + 10, 250], [cx + hwT + 14, T - 8]], P.tileLt);
    // tile rows on the side slopes
    c.strokeStyle = P.tileDk; c.lineWidth = 1; c.globalAlpha = .5;
    for (let i = 1; i < 10; i++) { const t = i / 10, yl = T + (250 - T) * t; c.beginPath(); c.moveTo(cx - hwT - 14 - (hwB - hwT) * t + 4, yl - 8 + 8 * t); c.lineTo(cx - hwT - (hwB - hwT) * t, yl); c.moveTo(cx + hwT + 14 + (hwB - hwT) * t - 4, yl - 8 + 8 * t); c.lineTo(cx + hwT + (hwB - hwT) * t, yl); c.stroke(); }
    c.globalAlpha = 1;
    // eave drip edge at bottom of opening
    rect(c, cx - hwB - 10, 248, hwB * 2 + 20, 6, P.teakDk);
    // side walls of the inner verandah (lime) beyond the pillars
    rect(c, 0, 250, cx - 118, 270, vgrad(c, 0, 250, 520, [[0, P.limeShade], [.3, P.lime], [1, P.limeDk]]));
    rect(c, cx + 118, 250, w, 270, vgrad(c, 0, 250, 520, [[0, P.limeShade], [.3, P.lime], [1, P.limeDk]]));
    rect(c, 0, 250, w, 12, 'rgba(40,22,10,.4)');
    rect(c, 0, 470, cx - 118, 50, P.laterite); rect(c, cx + 118, 470, w, 50, P.laterite);
    rect(c, 0, 396, w, 130, '#7a2e22');
    // courtyard floor: sunken laterite square in perspective (narrow far, wide near)
    const fT = 400, fB = 520, hwF = 92, hwN = 134;
    poly(c, [[cx - hwF, fT], [cx + hwF, fT], [cx + hwN, fB], [cx - hwN, fB]], vgrad(c, 0, fT, fB, [[0, '#8f5238'], [1, '#a65c3e']]));
    c.strokeStyle = 'rgba(60,30,15,.3)'; c.lineWidth = 1;
    for (let i = 1; i < 6; i++) { const t = i / 6; c.beginPath(); c.moveTo(cx - hwF + t * 2 * hwF, fT); c.lineTo(cx - hwN + t * 2 * hwN, fB); c.stroke(); }
    for (let i = 1; i < 5; i++) { const t = Math.pow(i / 5, 1.5), y = fT + t * (fB - fT), hw = hwF + t * (hwN - hwF); c.beginPath(); c.moveTo(cx - hw, y); c.lineTo(cx + hw, y); c.stroke(); }
    // wet sheen patches
    ellipse(c, cx - 30, 480, 30, 6, 'rgba(255,230,200,.08)'); ellipse(c, cx + 50, 505, 24, 5, 'rgba(255,230,200,.07)');
    // drain
    rect(c, cx + 96, 500, 16, 8, '#3a2418');
    // surrounding inner verandah floor: red oxide, polished
    rect(c, 0, 520, w, h - 520, vgrad(c, 0, 520, h, [[0, '#8a3a2c'], [.4, '#7a2e22'], [1, '#5c2219']]));
    // low raised edge (lime-plastered) around courtyard, in perspective
    poly(c, [[cx - hwF - 10, fT - 6], [cx + hwF + 10, fT - 6], [cx + hwF, fT], [cx - hwF, fT]], P.lime);
    poly(c, [[cx - hwF - 10, fT - 6], [cx - hwF, fT], [cx - hwN, fB], [cx - hwN - 12, fB + 4]], P.limeDk);
    poly(c, [[cx + hwF + 10, fT - 6], [cx + hwF, fT], [cx + hwN, fB], [cx + hwN + 12, fB + 4]], P.limeShade);
    poly(c, [[cx - hwN - 12, fB + 4], [cx + hwN + 12, fB + 4], [cx + hwN + 14, fB + 12], [cx - hwN - 14, fB + 12]], P.lime);
    rect(c, cx - hwN - 14, fB + 12, hwN * 2 + 28, 3, P.limeShade);
    // reflections/sheen on oxide floor
    c.fillStyle = 'rgba(255,220,190,.07)'; ellipse(c, cx, 640, 140, 30, 'rgba(255,220,190,.07)');
    // pillars left and right (front)
    for (const px of [58, w - 58]) {
      rect(c, px - 11, 250, 22, 290, vgrad(c, 0, 250, 540, [[0, P.teakLt], [1, P.teak]])); rect(c, px - 11, 250, 6, 290, P.teakHi); rect(c, px + 5, 250, 6, 290, P.teakDk);
      poly(c, [[px - 17, 250], [px + 17, 250], [px + 13, 268], [px - 13, 268]], P.teakDk); rect(c, px - 14, 526, 28, 16, P.teakDk);
      // carved band
      rect(c, px - 11, 300, 22, 6, P.teakDk); rect(c, px - 11, 480, 22, 6, P.teakDk);
    }
    // back pillars (small, far side)
    for (const px of [cx - 130, cx + 130]) { rect(c, px - 6, 250, 12, 150, P.teak); rect(c, px - 6, 250, 3, 150, P.teakHi); }
    // beam across top (holds lamp and swing ropes)
    rect(c, 0, 236, w, 14, P.teakDk); rect(c, 0, 236, w, 3, P.teak);
    // potted plants at corners (chembarathi / hibiscus)
    for (const [x, y, s] of [[cx - 150, 500, 1], [cx + 150, 500, 1]]) {
      shadow(c, x, y + 4, 18, 6, .3); poly(c, [[x - 12, y - 18], [x + 12, y - 18], [x + 9, y], [x - 9, y]], P.clay); rect(c, x - 13, y - 20, 26, 4, P.clayLt);
      c.strokeStyle = P.cocoDk; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x, y - 18); c.quadraticCurveTo(x + (i - 2) * 8, y - 36, x + (i - 2) * 12, y - 48 - (i % 2) * 8); c.stroke(); ellipse(c, x + (i - 2) * 12, y - 48 - (i % 2) * 8, 6, 3.5, i % 2 ? P.coco : P.cocoLt, (i - 2) * .4); }
      circle(c, x + 8, y - 44, 5, '#d8402c'); circle(c, x + 8, y - 44, 1.6, '#f5c84a'); circle(c, x - 14, y - 52, 4, '#d8402c');
    }
    // Murphy radio on a teak stand (left front)
    const rx = 78, ry = 612;
    shadow(c, rx, ry + 30, 48, 10, .35);
    rect(c, rx - 34, ry + 8, 68, 6, P.teakDk); rect(c, rx - 30, ry + 14, 6, 16, P.teak); rect(c, rx + 24, ry + 14, 6, 16, P.teak);
    roundRect(c, rx - 32, ry - 34, 64, 42, 5, P.teak); roundRect(c, rx - 32, ry - 34, 64, 42, 5, hgrad(c, rx - 32, rx + 32, [[0, 'rgba(255,220,180,.18)'], [1, 'rgba(0,0,0,.18)']]));
    roundRect(c, rx - 27, ry - 29, 34, 32, 3, '#e8dcc0'); c.fillStyle = 'rgba(80,60,40,.35)'; for (let i = 0; i < 7; i++) for (let k = 0; k < 7; k++) circle(c, rx - 24 + i * 5, ry - 26 + k * 4.5, .9, 'rgba(80,60,40,.45)');
    roundRect(c, rx + 10, ry - 29, 18, 14, 2, '#f1e4c8'); // dial window
    circle(c, rx + 19, ry - 7, 5, P.brassDk); circle(c, rx + 19, ry - 7, 3.5, P.brass);
    // broom (chool) leaning on left pillar
    line(c, 46, 470, 50, 548, P.teakHi, 3); c.strokeStyle = '#c9a46a'; c.lineWidth = 1.2; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(50, 548); c.lineTo(36 + i * 2.6, 586 + Math.sin(i) * 4); c.stroke(); }
  }
  drawDynamic(c, w, h) {
    const t = this.t, cx = w / 2;
    // hanging brass lamp (thooku vilakku) from the beam, lit after dusk
    const lx = 190, ly = 330, lit = clock.daylight < .5;
    line(c, lx, 250, lx, ly - 30, P.brassDk, 1.5);
    ellipse(c, lx, ly - 30, 5, 2, P.brass); rect(c, lx - 1, ly - 30, 2, 18, P.brass);
    ellipse(c, lx, ly - 8, 11, 4, P.brassDk); ellipse(c, lx, ly - 10, 11, 4, P.brass); ellipse(c, lx, ly - 12, 7, 2.5, P.brassLt); circle(c, lx, ly - 2, 3.5, P.brass); 
    if (lit) { const fl = 1 + Math.sin(t * 12) * .08; glow(c, lx, ly - 16, 40, '#ffa040', .35); c.fillStyle = P.flame; c.beginPath(); c.moveTo(lx - 2.5, ly - 12); c.quadraticCurveTo(lx - 3, ly - 20 * fl, lx, ly - 24 * fl); c.quadraticCurveTo(lx + 3, ly - 20 * fl, lx + 2.5, ly - 12); c.fill(); }
    // radio dial glow
    if (this.dial > 0) { c.globalAlpha = this.dial; glow(c, 97, 590, 14, '#ffcc66', .5); c.globalAlpha = 1; }
    // aattukattil (hanging swing bed) right front
    this.swingV *= .995; const ang = this.busy && this.swingV > .1 ? Math.sin(t * 2.1) * .12 * Math.min(1, this.swingV) : Math.sin(t * .8) * .012;
    const px = 300, py = 250; c.save(); c.translate(px, py); c.rotate(ang); c.translate(-px, -py);
    for (const dx of [-42, 42]) line(c, px + dx, py, px + dx, py + 350, '#c9b48a', 2);
    const sy = py + 350;
    shadow(c, px, sy + 30, 60, 10, .3);
    rect(c, px - 50, sy - 2, 100, 10, P.teakLt); rect(c, px - 50, sy + 8, 100, 4, P.teakDk);
    for (let i = 0; i < 6; i++) rect(c, px - 48 + i * 16, sy - 1, 14, 8, i % 2 ? P.teakHi : P.teakLt);
    // thin cotton pillow + folded thorthu
    roundRect(c, px - 44, sy - 12, 30, 10, 3, P.kasavu); rect(c, px - 44, sy - 12, 30, 1.5, P.gold);
    roundRect(c, px + 12, sy - 9, 24, 7, 2, '#e6d7b5');
    c.restore();
    // sweeping broom motion
    if (this.sweepT > 0 && this.sweepT < 1) { const k = Math.sin(this.sweepT * Math.PI * 4) * 22; c.save(); c.translate(cx - 60 + this.sweepT * 100 + k, 500); c.rotate(.4 + k * .01); line(c, 0, -60, 0, 0, P.teakHi, 3); c.strokeStyle = '#c9a46a'; c.lineWidth = 1.2; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(-10 + i * 2.2, 26); c.stroke(); } c.restore(); }
    // acquired things: wall clock on the left wall, gramophone on the radio stand
    if (state.items.clock) { const cx0 = 40, cy0 = 300; rect(c, cx0 - 14, cy0 - 22, 28, 54, P.teakDk); circle(c, cx0, cy0 - 6, 11, '#f1e4c8'); const h = clock.hour % 12 / 12 * 6.283 - 1.57, m = (clock.minutes % 60) / 60 * 6.283 - 1.57; line(c, cx0, cy0 - 6, cx0 + Math.cos(h) * 5, cy0 - 6 + Math.sin(h) * 5, '#222', 1.4); line(c, cx0, cy0 - 6, cx0 + Math.cos(m) * 8, cy0 - 6 + Math.sin(m) * 8, '#222', 1); const p = Math.sin(t * 3.3) * .25; line(c, cx0, cy0 + 8, cx0 + Math.sin(p) * 16, cy0 + 8 + Math.cos(p) * 16, P.brassDk, 1.2); circle(c, cx0 + Math.sin(p) * 16, cy0 + 8 + Math.cos(p) * 16, 3, P.brass); }
    if (state.items.gramophone) { rect(c, 118, 574, 22, 14, P.teak); c.save(); c.translate(132, 568); c.rotate(-.6); poly(c, [[0, 0], [22, -10], [26, 10]], P.brass); c.restore(); circle(c, 128, 574, 4, '#222'); }
    // Karkidakam: Ramayanam on a wooden stand in the evenings
    if (fest().karkidakam) { rect(c, 176, 650, 28, 4, P.teakDk); rect(c, 188, 630, 4, 20, P.teak); poly(c, [[174, 632], [206, 632], [202, 626], [178, 626]], P.teakLt); rect(c, 180, 620, 20, 7, P.paper); rect(c, 180, 620, 20, 1.5, '#b8442a'); }
    // Thiruvathira night: women dance around a lamp in the courtyard
    if (fest().thiruvathira && clock.hour >= 19) {
      const n = 6, R = 48; glow(c, cx, 470, 50, '#ffb050', .4);
      for (let i = 0; i < n; i++) { const a = t * .6 + i * 6.283 / n, x = cx + Math.cos(a) * R * 1.25, y = 470 + Math.sin(a) * R * .35, s = .62 + Math.sin(a) * .06; person(c, x, y + 20, s, { sex: 'f', top: '#b8443a', mundu: P.kasavu, pose: 'walk', flip: Math.cos(a) < 0 }, t * 1.3 + i); }
      ellipse(c, cx, 462, 8, 3, P.brassDk); rect(c, cx - 2, 440, 4, 22, P.brass); circle(c, cx, 436, 3, P.flame);
    }
    // leaves on the courtyard floor until they are swept; the broom when it is in hand
    if (!state.swept) { const n = Math.ceil(16 * (1 - (this.sweepP || 0))); for (let i = 0; i < n; i++) { const k = hash(i + 300 + clock.day), fx = cx - 100 + hash(i + 310) * 200 + (this.sweepP || 0) * 60 * (hash(i) - .5), fy = 410 + hash(i + 320) * 100; c.save(); c.translate(fx, fy); c.rotate(hash(i + 330) * 6); c.fillStyle = ['#b89a4a', '#8a7a3a', '#c9a06a', '#7a5a2a'][i % 4]; c.beginPath(); c.ellipse(0, 0, 5 + k * 3, 2.2, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(60,40,20,.4)'; c.lineWidth = .6; c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.stroke(); c.restore(); } }
    if (this.broomOn) { const bx = this.broomX; c.save(); c.translate(bx, 500); c.rotate(.5); line(c, 0, -60, 0, 0, P.teakHi, 3); c.strokeStyle = '#c9a46a'; c.lineWidth = 1.2; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(-10 + i * 2.2, 26); c.stroke(); } c.restore(); }
    if (this.catHere()) drawCat(c, 190, 540, t, .9, true);
  }
}
