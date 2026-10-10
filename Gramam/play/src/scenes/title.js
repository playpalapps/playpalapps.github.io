import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { rect, vgrad, ellipse, circle, text, FONT, roundRect, palm, poly, line, tileRoof, bananaPlant, glow } from '../art/draw.js';
import { skyColors } from '../art/sky.js';
import { hash, lerpColor } from '../engine/ease.js';
import { state } from '../game/state.js';
import { clock } from '../game/clock.js';
import { arecaPalm, boat, person, mist, grassTuft, crowBird, kingfisher } from '../art/lib.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';

// Opening screen: dawn over the kayal, the tharavad on the far bank, a thoni crossing. Full-bleed art, title set over the water.
export class Title extends Scene {
  constructor(hasSave) { super('title', '', ''); this.outdoor = false; this.hasSave = hasSave; this.pressed = 0; this.confirmT = 0; this.boatX = -80; this.egrets = []; this.egT = 4; this.smoke = []; }
  update(dt) { super.update(dt); this.boatX += dt * 9; if (this.boatX > 480) this.boatX = -120; this.confirmT = Math.max(0, this.confirmT - dt); this.egT -= dt; if (this.egT <= 0) { this.egT = 14 + Math.random() * 16; this.egrets.push({ x: -40, y: 150 + Math.random() * 60, n: 3 + (Math.random() * 4 | 0), t: 0 }); } for (const e of this.egrets) { e.x += dt * 28; e.t += dt; } this.egrets = this.egrets.filter(e => e.x < 520); if (Math.random() < dt * 2.5) this.smoke.push({ x: 0, y: 0, r: 2 + Math.random() * 2, life: 6, vx: 4 + Math.random() * 3 }); for (const s of this.smoke) { s.life -= dt; s.x += s.vx * dt; s.y -= dt * 7; s.r += dt * 1.4; } this.smoke = this.smoke.filter(s => s.life > 0); }
  draw(c, w, h) {
    const t = this.t, cols = skyColors(6.35);
    const ox = Math.max(0, (w - 430) / 2); c.save(); if (ox) { c.fillStyle = '#1a1510'; c.fillRect(0, 0, w, h); c.translate(ox, 0); c.beginPath(); c.rect(0, 0, 430, h); c.clip(); } w = Math.min(w, 430);
    // sky
    const g = c.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, '#3e4a74'); g.addColorStop(.45, lerpColor(cols[1], '#d99a7a', .35)); g.addColorStop(1, '#f4d2a6'); c.fillStyle = g; c.fillRect(0, 0, w, 332);
    // stars fading at the top
    c.fillStyle = 'rgba(255,245,220,.7)'; for (let i = 0; i < 30; i++) { const x = hash(i) * w, y = hash(i + 50) * 120; c.globalAlpha = (.3 + .4 * Math.sin(t + i)) * (1 - y / 120); circle(c, x, y, .8 + hash(i + 3), 'rgba(255,245,220,1)'); } c.globalAlpha = 1;
    // high pink clouds
    c.globalAlpha = .5; for (let i = 0; i < 4; i++) { const cx0 = ((hash(i + 21) * w * 1.5 + t * (2 + i)) % (w * 1.5)) - w * .25, cy0 = 70 + hash(i + 5) * 110, s = .7 + hash(i + 9) * .8; for (const [dx, dy, r] of [[0, 0, 18], [18, -6, 14], [-18, -4, 13], [34, 2, 11], [-32, 3, 10], [10, 6, 15]]) circle(c, cx0 + dx * s, cy0 + dy * s, r * s, i % 2 ? '#e9b9a8' : '#d9a6a0'); } c.globalAlpha = 1;
    // sun with layered glow
    const sx = w * .64, sy = 292; glow(c, sx, sy, 170, '#ffb070', .55); glow(c, sx, sy, 70, '#ffd9a0', .6); circle(c, sx, sy, 24, '#ffe3b4');
    // distant hills, two ranges, in haze
    c.fillStyle = '#8d9bb4'; c.beginPath(); c.moveTo(0, 330); for (let x = 0; x <= w; x += 8) c.lineTo(x, 286 - Math.sin(x / 90 + 1) * 16 - Math.sin(x / 31) * 6); c.lineTo(w, 332); c.fill();
    c.fillStyle = '#a6b0b8'; c.beginPath(); c.moveTo(0, 334); for (let x = 0; x <= w; x += 8) c.lineTo(x, 310 - Math.sin(x / 55 + 3) * 10 - Math.sin(x / 19) * 3); c.lineTo(w, 334); c.fill();
    mist(c, 0, 300, w, 60, .7);
    // far bank: treeline, paddy, the tharavad with a lit window and kitchen smoke, areca palms, temple roof far left
    rect(c, 0, 330, w, 30, '#2f5527'); for (let i = 0; i < 18; i++) ellipse(c, hash(i + 9) * w, 334, 12 + hash(i) * 14, 10, '#24431f');
    rect(c, 0, 352, w, 68, vgrad(c, 0, 352, 420, [[0, '#a9c86e'], [1, '#6f9a44']])); c.strokeStyle = 'rgba(40,70,20,.16)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, 358 + i * 7); c.lineTo(w, 360 + i * 7); c.stroke(); }
    poly(c, [[36, 352], [86, 352], [78, 332], [44, 332]], '#6e3a26'); rect(c, 40, 352, 42, 6, '#e9dcc2'); // temple roof far left
    for (let i = 0; i < 5; i++) arecaPalm(c, 300 + i * 26, 356, 70 + hash(i) * 20, .7, Math.sin(t * .7 + i) * 2);
    const hx = 215, hy = 372; // tharavad: long tiled roof, gable, white walls, pillars, plinth
    rect(c, hx - 72, hy, 144, 24, '#e9dcc2'); for (let i = 0; i < 7; i++) rect(c, hx - 66 + i * 22, hy + 2, 5, 22, '#5a3a24'); rect(c, hx - 34, hy + 6, 18, 18, '#2a1a10');
    rect(c, hx - 76, hy + 22, 152, 6, '#9b4a30'); rect(c, hx - 80, hy + 28, 160, 4, '#6e3a26');
    tileRoof(c, hx - 86, hy - 26, 172, 26, P.tile, P.tileLt, P.tileDk); poly(c, [[hx - 60, hy - 26], [hx + 60, hy - 26], [hx + 34, hy - 48], [hx - 34, hy - 48]], '#a65c3c'); rect(c, hx - 36, hy - 50, 72, 3, '#5a2a1c');
    glow(c, hx + 44, hy + 12, 16, '#ffb050', .7); rect(c, hx + 40, hy + 8, 8, 10, '#ffd27a'); // lit window
    for (const s of this.smoke) { c.globalAlpha = Math.min(.5, s.life / 6 * .5); circle(c, hx - 50 + s.x, hy - 50 + s.y, s.r, '#dcd2c4'); } c.globalAlpha = 1;
    // bank edge
    rect(c, 0, 418, w, 10, '#8a6a44'); rect(c, 0, 426, w, 6, '#5f4a30'); for (let i = 0; i < 24; i++) grassTuft(c, hash(i + 40) * w, 420, .6, '#4f7a3a');
    // kayal: water with sky reflection, reflected palms and house, shimmer, ripples
    const wy = 432, wh = 330; const wg = c.createLinearGradient(0, wy, 0, wy + wh); wg.addColorStop(0, '#d7b48f'); wg.addColorStop(.35, '#7f9f9a'); wg.addColorStop(1, '#2d4a4a'); c.fillStyle = wg; c.fillRect(0, wy, w, wh);
    c.globalAlpha = .2; poly(c, [[hx - 76, wy + 4], [hx + 76, wy + 4], [hx + 72, wy + 30], [hx - 72, wy + 30]], '#e9dcc2'); poly(c, [[hx - 86, wy + 30], [hx + 86, wy + 30], [hx + 60, wy + 58], [hx - 60, wy + 58]], '#7a3a26'); for (let i = 0; i < 5; i++) ellipse(c, 300 + i * 26, wy + 50, 3, 60, '#1f3d1c'); c.globalAlpha = 1;
    c.globalAlpha = .35; glow(c, sx, wy + 60, 120, '#ffc080', .8); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,240,210,.28)'; c.lineWidth = 1; for (let i = 0; i < 26; i++) { const yy = wy + 14 + (i * 83 % (wh - 40)), xx = ((i * 61 + t * 10 * (1 + i % 3)) % (w + 80)) - 40, len = 16 + (i % 5) * 12; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + len, yy); c.stroke(); }
    // kettuvallam far, thoni near with a boatman poling
    const kx = (t * 6) % (w + 300) - 150; boat(c, kx, wy + 70, .55, t); c.fillStyle = '#8a7a4a'; c.beginPath(); c.ellipse(kx, wy + 58, 24, 11, 0, Math.PI, 0); c.fill();
    const bx = this.boatX, by = wy + 190 + Math.sin(t) * 1.5; c.globalAlpha = .3; ellipse(c, bx, by + 12, 56, 8, '#10201f'); c.globalAlpha = 1; boat(c, bx, by, .95, t); person(c, bx + 40, by - 12, .74, { sex: 'm', bare: true, mundu: '#efe6cf', skin: '#6a4028' }, t); line(c, bx + 48, by - 66, bx + 58, by + 8, P.teakLt, 2);
    c.globalAlpha = .18; ellipse(c, bx, by + 30, 50, 14, '#efe6cf'); c.globalAlpha = 1;
    // water lilies near the bank, bottom left
    for (const [lx, ly, s] of [[40, 720, 1.1], [86, 744, .9], [24, 756, .8], [120, 730, .7]]) { ellipse(c, lx, ly, 16 * s, 7 * s, '#4f8a4a'); if (s > .8) { for (let k = 0; k < 6; k++) { const a = k * 1.047; ellipse(c, lx - 6 * s + Math.cos(a) * 4 * s, ly - 8 * s + Math.sin(a) * 2.5 * s, 4 * s, 2 * s, '#f0a0c0', a); } circle(c, lx - 6 * s, ly - 8 * s, 1.8 * s, '#f2c230'); } }
    // near bank with grass and a banana plant, bottom right
    rect(c, 0, 762, w, h - 762, vgrad(c, 0, 762, h, [[0, '#4e5a2e'], [1, '#2c3320']])); for (let i = 0; i < 26; i++) grassTuft(c, hash(i + 70) * w, 770 + hash(i + 71) * 20, .9, i % 2 ? '#5f8a33' : '#7fa65a');
    bananaPlant(c, w - 30, 790, 1.1, P.cocoDk, P.coco); kingfisher(c, 150, 758, .9);
    // egrets crossing
    for (const e of this.egrets) for (let i = 0; i < e.n; i++) { const ex = e.x - i * 16, ey = e.y + Math.sin(i * 1.4) * 4; c.strokeStyle = '#fff6e6'; c.lineWidth = 1.4; c.beginPath(); const f = Math.sin(e.t * 6 + i); c.moveTo(ex - 6, ey - f * 3); c.quadraticCurveTo(ex, ey + 1, ex + 6, ey - f * 3); c.stroke(); }
    // framing palms from the bottom corners, swaying
    const sway = Math.sin(t * .6) * 3;
    palm(c, -14, 840, 230, 36, 1.5, ['#2b2a28', '#1f1e1c', '#223a24', '#2f5230'], sway);
    palm(c, w + 12, 850, 200, -40, 1.65, ['#2b2a28', '#1f1e1c', '#223a24', '#2f5230'], -sway);
    palm(c, w - 26, 840, 330, -8, .7, ['#2b2a28', '#1f1e1c', '#1f3420', '#2a4a2a'], sway * .5);
    mist(c, 0, 400, w, 90, .25);
    // title block over the water with a soft dark band for legibility
    const tg = c.createLinearGradient(0, 470, 0, 640); tg.addColorStop(0, 'rgba(15,25,30,0)'); tg.addColorStop(.5, 'rgba(15,25,30,.42)'); tg.addColorStop(1, 'rgba(15,25,30,0)'); c.fillStyle = tg; c.fillRect(0, 470, w, 170);
    c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 16;
    text(c, 'Gramam', w / 2, 528, 64, '#fff4de', 'center', FONT);
    text(c, 'ഗ്രാമം', w / 2, 574, 22, 'rgba(255,244,222,.9)', 'center', 'system-ui, "Noto Sans Malayalam", sans-serif');
    text(c, pick('a slow life in old Kerala', 'പഴയ കേരളത്തിലെ ഒരു പതിഞ്ഞ ജീവിതം'), w / 2, 606, 15, 'rgba(255,244,222,.85)', 'center', lang() === 'ml' ? FONT_ML : FONT, lang() === 'ml' ? '' : 'italic');
    c.restore();
    // button
    const by2 = 672, bw = 170, bxx = w / 2 - bw / 2, pulse = 1 + Math.sin(t * 2) * .01;
    c.save(); c.translate(w / 2, by2); c.scale(pulse - this.pressed * .04, pulse - this.pressed * .04); c.translate(-w / 2, -by2);
    roundRect(c, bxx, by2 - 24, bw, 48, 24, 'rgba(10,20,20,.35)', 'rgba(255,244,222,.9)'); c.lineWidth = 1.4;
    text(c, this.hasSave ? pick('Continue', 'തുടരുക') : pick('Begin', 'തുടങ്ങുക'), w / 2, by2 + 1, 18, '#fff4de', 'center', lang() === 'ml' ? FONT_ML : FONT);
    c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
    if (this.hasSave) { text(c, pick(`${clock.dateStr()} · ${state.days + 1} day${state.days ? 's' : ''} home${clock.mode === 'real' ? ' · real time' : ''}`, `${clock.dateStrML()} · വീട്ടിൽ ${state.days + 1} ദിവസം${clock.mode === 'real' ? ' · യഥാർത്ഥ സമയം' : ''}`), w / 2, by2 + 44, 12, 'rgba(255,244,222,.8)', 'center', lang() === 'ml' ? FONT_ML : FONT, lang() === 'ml' ? '' : 'italic'); text(c, this.confirmT > 0 ? pick('tap again to erase and start over', 'മായ്ച്ച് പുതുതായി തുടങ്ങാൻ ഒന്നുകൂടി തൊടുക') : pick('start over', 'പുതുതായി തുടങ്ങുക'), w / 2, by2 + 66, 11.5, this.confirmT > 0 ? '#ffb070' : 'rgba(255,244,222,.6)', 'center', FONT, 'italic'); }
    text(c, pick('headphones recommended', 'ഹെഡ്‌ഫോൺ ഉപയോഗിക്കുന്നതാണ് നല്ലത്'), w / 2, h - 26, 11, 'rgba(255,244,222,.55)', 'center', lang() === 'ml' ? FONT_ML : FONT, lang() === 'ml' ? '' : 'italic');
    c.restore(); c.restore();
  }
  // returns 'start' | 'reset' | null
  tapAt(p, w, h) {
    const ox = Math.max(0, (w - 430) / 2), x = p.x - ox, cw = Math.min(w, 430), by2 = 672;
    if (this.hasSave && Math.abs(p.y - (by2 + 66)) < 16 && Math.abs(x - cw / 2) < 120) { if (this.confirmT > 0) return 'reset'; this.confirmT = 3.5; return null; }
    if (Math.abs(p.y - by2) < 30 && Math.abs(x - cw / 2) < 100) return 'start';
    if (p.y < by2 - 40) return 'start';
    return null;
  }
}
