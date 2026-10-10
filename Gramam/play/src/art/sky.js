import { clock } from '../game/clock.js';
import { lerpColor, lerp, hash } from '../engine/ease.js';
// Sky gradient keyframes by hour
const KEYS = [
  [0, ['#0b1626', '#15243a', '#1d2d45']],
  [4.5, ['#0e1a2e', '#1b2b45', '#2a3a52']],
  [5.6, ['#3c3d5e', '#8a5a6a', '#d98a6a']],
  [6.5, ['#8fb0c9', '#f0c3a0', '#f7d7b1']],
  [8, ['#9fc6dd', '#d5e4ea', '#f1e9d6']],
  [11, ['#86bddc', '#b7d8e6', '#e9e6d2']],
  [15, ['#8dbfdb', '#c9dde3', '#eee4cc']],
  [17.3, ['#7f9fc0', '#e9b47a', '#f1c384']],
  [18.3, ['#5a4a74', '#c96a5a', '#f0a066']],
  [19.2, ['#1f2440', '#5a3c5a', '#8a4a4a']],
  [20.5, ['#0d1a2d', '#1a2840', '#2a3350']],
  [24, ['#0b1626', '#15243a', '#1d2d45']]
];
export function skyColors(h = clock.hour) {
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const [h0, a] = KEYS[i], [h1, b] = KEYS[i + 1], t = (h - h0) / (h1 - h0);
  return [lerpColor(a[0], b[0], t), lerpColor(a[1], b[1], t), lerpColor(a[2], b[2], t)];
}
export function drawSky(c, w, y0, y1, rainy = 0) {
  let cols = skyColors();
  if (rainy > 0) cols = cols.map(col => lerpColor(col, '#7d8a93', rainy * .75));
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, cols[0]); g.addColorStop(.55, cols[1]); g.addColorStop(1, cols[2]);
  c.fillStyle = g; c.fillRect(0, y0, w, y1 - y0);
  const h = clock.hour, night = 1 - clock.daylight;
  // stars
  if (night > .2 && rainy < .5) { c.globalAlpha = Math.min(1, (night - .2) * 1.6) * (1 - rainy); c.fillStyle = '#fff6d8'; for (let i = 0; i < 70; i++) { const x = hash(i) * w, y = y0 + hash(i + 99) * (y1 - y0) * .8, r = .4 + hash(i + 7) * 1.1; c.globalAlpha *= .7 + .3 * Math.sin(performance.now() / 700 + i); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = Math.min(1, (night - .2) * 1.6) * (1 - rainy); } c.globalAlpha = 1; }
  // sun / moon
  const dayT = (h - 6) / 12.5; // 0 sunrise ... 1 sunset
  if (dayT > -.05 && dayT < 1.05 && rainy < .6) {
    const sx = w * (0.15 + dayT * 0.7), sy = y1 - 10 - Math.sin(Math.max(0, Math.min(1, dayT)) * Math.PI) * (y1 - y0) * .85;
    const warm = clock.warmth, col = warm > .3 ? '#ffb15a' : '#fff4d0';
    const g2 = c.createRadialGradient(sx, sy, 0, sx, sy, 90); g2.addColorStop(0, col + 'aa'); g2.addColorStop(.25, col + '33'); g2.addColorStop(1, col + '00');
    c.globalAlpha = (1 - rainy) * .9; c.fillStyle = g2; c.fillRect(sx - 90, sy - 90, 180, 180);
    c.fillStyle = col; c.beginPath(); c.arc(sx, sy, warm > .3 ? 22 : 16, 0, 7); c.fill(); c.globalAlpha = 1;
  }
  if (night > .5) {
    const mt = ((h + 5) % 24) / 12; // moon crosses at night
    if (mt < 1) { const mx = w * (0.2 + mt * 0.6), my = y1 - 20 - Math.sin(mt * Math.PI) * (y1 - y0) * .7; c.globalAlpha = (night - .5) * 2 * (1 - rainy); c.fillStyle = '#f3ecd2'; c.beginPath(); c.arc(mx, my, 14, 0, 7); c.fill(); c.fillStyle = skyColors()[0]; c.beginPath(); c.arc(mx + 6, my - 4, 12, 0, 7); c.fill(); c.globalAlpha = 1; }
  }
  // soft clouds
  const t = performance.now() / 1000;
  c.globalAlpha = .55 * (1 - night * .7);
  for (let i = 0; i < 5; i++) {
    const cx = ((hash(i + 31) * w * 1.6 + t * (3 + i)) % (w * 1.6)) - w * .3, cy = y0 + 30 + hash(i + 11) * (y1 - y0) * .45, s = .6 + hash(i + 41) * .8;
    const col = rainy > .3 ? '#9aa4ab' : lerpColor('#ffffff', cols[1], .35);
    cloud(c, cx, cy, s, col);
  }
  c.globalAlpha = 1;
}
function cloud(c, x, y, s, col) {
  c.fillStyle = col; for (const [dx, dy, r] of [[0, 0, 18], [18, -6, 14], [-18, -4, 13], [34, 2, 11], [-32, 3, 10], [10, 6, 15]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, 7); c.fill(); }
}
// Lighting tint applied over the scene. Returns {mul, add, alpha}
export function lighting() {
  const d = clock.daylight, warm = clock.warmth, night = 1 - d;
  // night: multiply with deep blue; dusk/dawn: overlay warm orange
  return { night, warm, nightCol: `rgba(18,28,60,${night * .62})`, warmCol: `rgba(255,140,50,${warm * .18})` };
}
export function applyLighting(c, w, h, rainy = 0, lampGlow = null) {
  const L = lighting();
  if (rainy > 0) { c.fillStyle = `rgba(90,105,115,${rainy * .22})`; c.fillRect(0, 0, w, h); }
  if (L.warm > 0) { c.globalCompositeOperation = 'overlay'; c.fillStyle = L.warmCol; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over'; }
  if (L.night > 0) {
    c.save(); c.fillStyle = L.nightCol; c.fillRect(0, 0, w, h);
    if (lampGlow) { // punch warm light back through the night tint
      for (const g of lampGlow) {
        const gr = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r); gr.addColorStop(0, `rgba(255,170,70,${g.a * L.night})`); gr.addColorStop(.4, `rgba(255,150,60,${g.a * .35 * L.night})`); gr.addColorStop(1, 'rgba(255,150,60,0)');
        c.globalCompositeOperation = 'lighter'; c.fillStyle = gr; c.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
      }
    }
    c.restore();
  }
}
