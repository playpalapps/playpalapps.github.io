// Shared art library: trees, walls, people, animals, vehicles, water. All flat painterly, palette-driven.
import { P } from './palette.js';
import { ellipse, circle, rect, poly, line, roundRect, vgrad, shadow } from './draw.js';
import { hash } from '../engine/ease.js';

// ---------- trees ----------
export function jackfruitTree(c, x, y, s = 1, sway = 0) {
  c.save(); c.lineCap = 'round';
  c.strokeStyle = P.teak; c.lineWidth = 16 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4 * s + sway, y - 110 * s); c.stroke();
  c.strokeStyle = P.teakLt; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x - 4 * s, y); c.lineTo(x + sway, y - 100 * s); c.stroke();
  for (const [ax, ay, L] of [[-1, -.5, 60], [1, -.6, 70], [-.6, -1, 50], [.7, -1, 55]]) { c.strokeStyle = P.teak; c.lineWidth = 7 * s; c.beginPath(); c.moveTo(x + 2 * s + sway, y - 100 * s); c.lineTo(x + ax * L * s + sway, y - 100 * s + ay * L * s); c.stroke(); }
  // dense dark canopy clusters
  const blobs = [[0, -175, 70], [-60, -150, 48], [62, -155, 52], [-30, -120, 40], [35, -118, 42], [0, -140, 60], [-78, -118, 30], [80, -120, 32]];
  for (const [bx, by, r] of blobs) { ellipse(c, x + bx * s + sway * .5, y + by * s, r * s, r * .8 * s, P.cocoDk); }
  for (const [bx, by, r] of blobs) { ellipse(c, x + bx * s - r * .18 * s + sway * .5, y + by * s - r * .22 * s, r * .7 * s, r * .5 * s, P.coco); }
  for (const [bx, by, r] of blobs.slice(0, 5)) { ellipse(c, x + bx * s - r * .3 * s + sway * .5, y + by * s - r * .35 * s, r * .35 * s, r * .25 * s, P.cocoLt); }
  // jackfruits hanging on the trunk
  for (const [fx, fy, fr] of [[-10, -60, 11], [12, -40, 13], [-6, -22, 9]]) { ellipse(c, x + fx * s, y + fy * s, fr * s, fr * 1.45 * s, '#9bb24a'); ellipse(c, x + fx * s - 3 * s, y + fy * s - 4 * s, fr * .5 * s, fr * .8 * s, '#b7c75a'); c.fillStyle = 'rgba(60,80,20,.35)'; for (let i = 0; i < 8; i++) circle(c, x + fx * s + (hash(i + fx) - .5) * fr * 1.4 * s, y + fy * s + (hash(i + fy) - .5) * fr * 2.2 * s, .9 * s, 'rgba(60,80,20,.35)'); }
  c.restore();
}
export function mangoTree(c, x, y, s = 1, sway = 0, fruit = false) {
  c.save(); c.lineCap = 'round';
  c.strokeStyle = P.teakDk; c.lineWidth = 14 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 6 * s, y - 60 * s, x + 6 * s + sway, y - 100 * s); c.stroke();
  for (const [ax, ay] of [[-50, -40], [50, -45], [-25, -60], [30, -65], [0, -50]]) { c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x + 4 * s + sway, y - 95 * s); c.lineTo(x + ax * s + sway, y - 95 * s + ay * s); c.stroke(); }
  const blobs = [[0, -165, 85, 60], [-70, -140, 55, 42], [70, -142, 58, 44], [-35, -175, 50, 38], [38, -178, 52, 40], [0, -125, 70, 45]];
  for (const [bx, by, rx, ry] of blobs) ellipse(c, x + bx * s + sway * .6, y + by * s, rx * s, ry * s, '#2f5a2a');
  for (const [bx, by, rx, ry] of blobs) ellipse(c, x + bx * s - rx * .15 * s + sway * .6, y + by * s - ry * .25 * s, rx * .72 * s, ry * .6 * s, '#45783a');
  for (const [bx, by, rx, ry] of blobs.slice(0, 4)) ellipse(c, x + bx * s - rx * .3 * s + sway * .6, y + by * s - ry * .4 * s, rx * .35 * s, ry * .3 * s, '#6c9a4e');
  if (fruit) for (let i = 0; i < 14; i++) { const bx = (hash(i + 3) - .5) * 160, by = -110 - hash(i + 9) * 70; ellipse(c, x + bx * s + sway * .6, y + by * s, 5 * s, 7 * s, i % 3 ? '#e0b43a' : '#c9d85a'); }
  c.restore();
}
export function arecaPalm(c, x, y, h = 180, s = 1, sway = 0) { // kavungu: thin pale trunk, small crown
  c.save(); c.lineCap = 'round';
  c.strokeStyle = '#b9b39a'; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * .3, y - h * .6, x + sway, y - h); c.stroke();
  c.strokeStyle = '#8f8a74'; c.lineWidth = 1 * s; for (let i = 1; i < 10; i++) { const t = i / 10; line(c, x - 2.5 * s + sway * t * t, y - h * t, x + 2.5 * s + sway * t * t, y - h * t, '#8f8a74', 1); }
  const tx = x + sway, ty = y - h;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * .9 + i * (Math.PI * .8 / 6), L = 34 * s; c.strokeStyle = i % 2 ? P.cocoDk : P.coco; c.lineWidth = 2.6 * s; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * L * .6, ty + Math.sin(a) * L * .6 - 8 * s, tx + Math.cos(a) * L, ty + Math.sin(a) * L * .3 + L * .5); c.stroke(); }
  for (let i = 0; i < 5; i++) circle(c, tx - 5 * s + i * 2.5 * s, ty + 10 * s + (i % 2) * 3 * s, 2.2 * s, '#d88a3a');
  c.restore();
}
export function banyan(c, x, y, s = 1) { // aalmaram: huge canopy with hanging aerial roots
  c.save(); c.lineCap = 'round';
  c.strokeStyle = '#5a4a3a'; c.lineWidth = 34 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 90 * s); c.stroke();
  c.strokeStyle = '#6e5c48'; c.lineWidth = 8 * s; for (const dx of [-14, 0, 12]) { c.beginPath(); c.moveTo(x + dx * s, y); c.lineTo(x + dx * .6 * s, y - 86 * s); c.stroke(); }
  for (const [ax, ay] of [[-110, -60], [110, -62], [-60, -90], [60, -92], [0, -100]]) { c.strokeStyle = '#5a4a3a'; c.lineWidth = 9 * s; c.beginPath(); c.moveTo(x, y - 85 * s); c.lineTo(x + ax * s, y - 85 * s + ay * s); c.stroke(); }
  const blobs = [[0, -215, 150, 70], [-110, -180, 90, 55], [112, -182, 92, 56], [-50, -230, 80, 48], [52, -232, 82, 50], [0, -165, 120, 50]];
  for (const [bx, by, rx, ry] of blobs) ellipse(c, x + bx * s, y + by * s, rx * s, ry * s, '#2c4f2a');
  for (const [bx, by, rx, ry] of blobs) ellipse(c, x + bx * s - rx * .12 * s, y + by * s - ry * .22 * s, rx * .75 * s, ry * .6 * s, '#3f6b36');
  // aerial roots
  c.strokeStyle = '#7a6650'; c.lineWidth = 2 * s; for (let i = 0; i < 9; i++) { const rx = x + (hash(i) - .5) * 230 * s, top = y - 150 * s - hash(i + 5) * 40 * s, bot = top + 60 * s + hash(i + 7) * 100 * s; c.beginPath(); c.moveTo(rx, top); c.quadraticCurveTo(rx + 4 * s, (top + bot) / 2, rx + (hash(i + 2) - .5) * 10 * s, Math.min(bot, y)); c.stroke(); }
  c.restore();
}
export function konnaTree(c, x, y, s = 1, bloom = 0) { // kanikonna: golden shower in Medam
  c.save(); c.lineCap = 'round';
  c.strokeStyle = '#6b5a48'; c.lineWidth = 9 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3 * s, y - 80 * s); c.stroke();
  for (const [ax, ay] of [[-40, -35], [40, -38], [0, -45]]) { c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + 2 * s, y - 76 * s); c.lineTo(x + ax * s, y - 76 * s + ay * s); c.stroke(); }
  for (const [bx, by, r] of [[0, -130, 46], [-40, -112, 34], [42, -114, 36]]) ellipse(c, x + bx * s, y + by * s, r * s, r * .7 * s, '#4f7a3a');
  if (bloom > 0) { c.globalAlpha = bloom; for (let i = 0; i < 26; i++) { const bx = (hash(i + 11) - .5) * 120, by = -150 + hash(i + 21) * 70, len = 14 + hash(i) * 18; c.strokeStyle = '#f2c230'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x + bx * s, y + by * s); c.lineTo(x + bx * s, y + by * s + len * s); c.stroke(); for (let k = 0; k < 4; k++) circle(c, x + bx * s + (k % 2 ? 2 : -2) * s, y + by * s + k * len / 4 * s, 2.4 * s, k % 2 ? '#ffd94a' : '#f4bf2a'); } c.globalAlpha = 1; }
  c.restore();
}
export function hibiscus(c, x, y, s = 1) { // chembarathi bush
  c.save();
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35; c.strokeStyle = P.cocoDk; c.lineWidth = 2 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * 20 * s, y + Math.sin(a) * 30 * s, x + Math.cos(a) * 34 * s, y + Math.sin(a) * 44 * s); c.stroke(); ellipse(c, x + Math.cos(a) * 34 * s, y + Math.sin(a) * 44 * s, 7 * s, 4 * s, i % 2 ? P.coco : P.cocoLt, a); }
  for (const [fx, fy] of [[-14, -30], [16, -26], [2, -42]]) { for (let k = 0; k < 5; k++) { const a = k * 1.256; ellipse(c, x + fx * s + Math.cos(a) * 4 * s, y + fy * s + Math.sin(a) * 4 * s, 4 * s, 2.6 * s, '#d8402c', a); } circle(c, x + fx * s, y + fy * s, 1.6 * s, '#f5c84a'); line(c, x + fx * s, y + fy * s, x + fx * s + 5 * s, y + fy * s - 6 * s, '#f5c84a', 1); }
  c.restore();
}
export function tapioca(c, x, y, s = 1) { // kappa plant: thin stem, palmate leaves
  c.save(); c.strokeStyle = '#8a6a4a'; c.lineWidth = 2 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2 * s, y - 60 * s); c.stroke();
  for (const [lx, ly] of [[0, -60], [-8, -44], [9, -36]]) for (let k = 0; k < 7; k++) { const a = -Math.PI + k * (Math.PI / 6); ellipse(c, x + lx * s + Math.cos(a) * 9 * s, y + ly * s + Math.sin(a) * 9 * s, 7 * s, 2.2 * s, k % 2 ? P.coco : P.cocoLt, a); }
  c.restore();
}
export function lateriteWall(c, x, y, w, h, mossy = .3) { // chengal wall with lichen
  rect(c, x, y, w, h, P.laterite);
  for (let r = 0; r < Math.ceil(h / 14); r++) for (let i = 0; i < Math.ceil(w / 28) + 1; i++) { const bx = x + i * 28 - (r % 2) * 14, by = y + r * 14; if (bx + 26 < x || bx > x + w) continue; rect(c, Math.max(x, bx), by, Math.min(26, x + w - Math.max(x, bx)), 12, (i + r) % 3 ? P.laterite : P.lateriteLt); }
  c.fillStyle = `rgba(70,110,50,${mossy})`; for (let i = 0; i < w / 10; i++) { const mx = x + hash(i + 31) * w, my = y + h - hash(i + 41) * h * .5; ellipse(c, mx, my, 5 + hash(i) * 8, 2 + hash(i + 1) * 3, `rgba(70,110,50,${mossy})`); }
  rect(c, x, y, w, 3, P.lateriteDk); rect(c, x, y + h - 3, w, 3, P.lateriteDk);
}
export function grassTuft(c, x, y, s = 1, col = P.coco) { c.strokeStyle = col; c.lineWidth = 1.6 * s; c.lineCap = 'round'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (k - 2) * 4 * s, y - 8 * s, x + (k - 2) * 7 * s, y - 12 * s - hash(k + x) * 6 * s); c.stroke(); } }

// ---------- people (flat, period dress) ----------
// opts: {sex:'m'|'f'|'boy'|'girl', top, mundu, hair, skin, pose:'stand'|'walk'|'sit'|'carryHead'|'cycle', flip, item}
export function person(c, x, y, s, o, t = 0) {
  const skin = o.skin || '#b98461', hair = o.hair || '#1e130c', mundu = o.mundu || P.kasavu, top = o.top || (o.sex === 'f' ? '#b8443a' : '#f1e6d0');
  const H = 74 * s, w = 1;
  c.save(); c.translate(x, y); if (o.flip) c.scale(-1, 1);
  const walk = o.pose === 'walk' ? Math.sin(t * 7) : 0;
  shadow(c, 0, 2, 16 * s, 5 * s, .3);
  if (o.pose === 'sit') { // seated: legs folded forward
    poly(c, [[-11 * s, -28 * s], [11 * s, -28 * s], [15 * s, -4 * s], [-15 * s, -4 * s]], mundu); rect(c, -15 * s, -8 * s, 30 * s, 2 * s, P.gold);
  } else {
    // mundu (men: ankle length; women: ankle length with neriyathu). legs hinted by split when walking
    poly(c, [[-9 * s, -34 * s], [9 * s, -34 * s], [12 * s + walk * 3 * s, -2 * s], [-12 * s - walk * 3 * s, -2 * s]], mundu);
    rect(c, -12 * s - walk * 3 * s, -5 * s, 24 * s + walk * 6 * s, 2 * s, o.sex === 'f' ? P.gold : 'rgba(0,0,0,.08)');
    // feet
    ellipse(c, -6 * s + walk * 4 * s, -1 * s, 4 * s, 2 * s, skin); ellipse(c, 6 * s - walk * 4 * s, -1 * s, 4 * s, 2 * s, skin);
  }
  // torso
  if (o.sex === 'm' && o.bare) { poly(c, [[-9 * s, -58 * s], [9 * s, -58 * s], [10 * s, -34 * s], [-10 * s, -34 * s]], skin); rect(c, -11 * s, -56 * s, 6 * s, 24 * s, P.kasavu); /* thorthu on shoulder */ }
  else { poly(c, [[-10 * s, -58 * s], [10 * s, -58 * s], [10 * s, -34 * s], [-10 * s, -34 * s]], top); }
  if (o.sex === 'f') { poly(c, [[-10 * s, -58 * s], [4 * s, -58 * s], [10 * s, -36 * s], [-10 * s, -34 * s]], mundu); rect(c, -10 * s, -40 * s, 20 * s, 1.5 * s, P.gold); } // neriyathu drape
  // arms
  c.strokeStyle = skin; c.lineWidth = 4 * s; c.lineCap = 'round';
  const armSwing = walk * 6 * s;
  if (o.pose === 'carryHead') { c.beginPath(); c.moveTo(-9 * s, -54 * s); c.lineTo(-13 * s, -74 * s); c.moveTo(9 * s, -54 * s); c.lineTo(13 * s, -74 * s); c.stroke(); }
  else if (o.pose === 'sit') { c.beginPath(); c.moveTo(-9 * s, -54 * s); c.lineTo(-6 * s, -32 * s); c.moveTo(9 * s, -54 * s); c.lineTo(6 * s, -32 * s); c.stroke(); }
  else { c.beginPath(); c.moveTo(-9 * s, -54 * s); c.lineTo(-11 * s - armSwing, -36 * s); c.moveTo(9 * s, -54 * s); c.lineTo(11 * s + armSwing, -36 * s); c.stroke(); }
  // head
  circle(c, 0, -68 * s, 9 * s, skin);
  if (o.sex === 'f') { circle(c, 0, -72 * s, 9 * s, hair); circle(c, -6 * s, -66 * s, 5 * s, hair); circle(c, 0, -69 * s, 7.5 * s, skin); /* bun */ circle(c, 7 * s, -70 * s, 4 * s, hair); circle(c, 9 * s, -72 * s, 1.8 * s, '#fff'); /* mulla */ }
  else if (o.sex === 'boy' || o.sex === 'girl') { circle(c, 0, -71 * s, 8 * s, hair); circle(c, 0, -68 * s, 7.5 * s, skin); }
  else { poly(c, [[-9 * s, -70 * s], [9 * s, -70 * s], [7 * s, -77 * s], [-7 * s, -77 * s]], hair); }
  if (o.cap) { rect(c, -10 * s, -78 * s, 20 * s, 5 * s, o.cap); rect(c, -8 * s, -84 * s, 16 * s, 7 * s, o.cap); }
  if (o.moustache) { rect(c, -4 * s, -65 * s, 8 * s, 1.6 * s, hair); }
  // eyes
  c.fillStyle = '#2b1a10'; c.fillRect(-3.5 * s, -69 * s, 1.5 * s, 1.5 * s); c.fillRect(2 * s, -69 * s, 1.5 * s, 1.5 * s);
  // items
  if (o.item === 'basket') { ellipse(c, 0, -80 * s, 16 * s, 5 * s, '#a67c4a'); poly(c, [[-16 * s, -80 * s], [16 * s, -80 * s], [13 * s, -92 * s], [-13 * s, -92 * s]], '#c49a60'); for (let i = 0; i < 6; i++) ellipse(c, -10 * s + i * 4 * s, -92 * s, 3 * s, 1.6 * s, '#9fb0c0'); }
  if (o.item === 'can') { rect(c, 13 * s, -40 * s, 9 * s, 14 * s, P.brass); rect(c, 13 * s, -40 * s, 9 * s, 2 * s, P.brassLt); line(c, 13 * s, -41 * s, 22 * s, -41 * s, P.brassDk, 1.5); }
  if (o.item === 'bag') { rect(c, -20 * s, -40 * s, 12 * s, 14 * s, '#7a5a3a'); line(c, -14 * s, -40 * s, 6 * s, -56 * s, '#7a5a3a', 2); }
  if (o.item === 'umbrella') { c.fillStyle = '#1e1e1e'; c.beginPath(); c.arc(0, -82 * s, 22 * s, Math.PI, 0); c.fill(); line(c, 0, -82 * s, 0, -50 * s, '#555', 1.5); }
  if (o.item === 'pot') { ellipse(c, -16 * s, -40 * s, 8 * s, 9 * s, P.clay); ellipse(c, -16 * s, -49 * s, 5 * s, 2 * s, P.clayLt); }
  if (o.item === 'paper') { c.save(); c.translate(12 * s, -42 * s); c.rotate(-.3); rect(c, -7 * s, -5 * s, 14 * s, 9 * s, P.paper); c.restore(); }
  c.restore();
}
// ---------- animals ----------
export function cow(c, x, y, s = 1, t = 0, flip = false) {
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
  shadow(c, 0, 4, 40 * s, 8 * s, .3);
  const col = '#cfc3ad', dk = '#a89a82';
  for (const lx of [-24, -12, 14, 26]) rect(c, lx * s - 3 * s, -24 * s, 6 * s, 26 * s, dk);
  ellipse(c, 0, -40 * s, 36 * s, 20 * s, col); ellipse(c, -8 * s, -46 * s, 16 * s, 10 * s, 'rgba(255,255,255,.35)');
  // hump and neck (zebu)
  circle(c, 24 * s, -56 * s, 10 * s, col); poly(c, [[26 * s, -60 * s], [44 * s, -52 * s], [46 * s, -36 * s], [30 * s, -36 * s]], col);
  // head
  ellipse(c, 50 * s, -40 * s + Math.sin(t) * 1.5 * s, 11 * s, 8 * s, col); ellipse(c, 58 * s, -38 * s + Math.sin(t) * 1.5 * s, 5 * s, 4 * s, '#d9a9a0');
  line(c, 46 * s, -48 * s, 40 * s, -58 * s, dk, 2 * s); line(c, 52 * s, -48 * s, 56 * s, -58 * s, dk, 2 * s); // horns
  ellipse(c, 44 * s, -44 * s, 4 * s, 2 * s, dk); c.fillStyle = '#2b1a10'; c.fillRect(50 * s, -43 * s, 1.6 * s, 1.6 * s);
  // udder, tail
  ellipse(c, -4 * s, -24 * s, 8 * s, 5 * s, '#e0b8ae');
  c.strokeStyle = dk; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(-34 * s, -44 * s); c.quadraticCurveTo(-46 * s, -30 * s, -40 * s + Math.sin(t * 2) * 4 * s, -10 * s); c.stroke(); circle(c, -40 * s + Math.sin(t * 2) * 4 * s, -9 * s, 3 * s, '#5a4a3a');
  // bell
  line(c, 40 * s, -36 * s, 40 * s, -30 * s, P.brassDk, 1); circle(c, 40 * s, -28 * s, 2.5 * s, P.brass);
  c.restore();
}
export function hen(c, x, y, s = 1, t = 0, flip = false, col = '#8a4a2a') {
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
  const peck = Math.max(0, Math.sin(t * 5)) * 3 * s;
  ellipse(c, 0, -8 * s, 9 * s, 6 * s, col); poly(c, [[-8 * s, -10 * s], [-16 * s, -18 * s], [-6 * s, -12 * s]], '#2a1a10');
  circle(c, 8 * s, -14 * s + peck, 4 * s, col); poly(c, [[11 * s, -14 * s + peck], [16 * s, -12 * s + peck], [11 * s, -11 * s + peck]], '#e0a030');
  poly(c, [[6 * s, -18 * s + peck], [9 * s, -21 * s + peck], [11 * s, -17 * s + peck]], '#d8402c');
  c.fillStyle = '#2b1a10'; c.fillRect(8 * s, -15 * s + peck, 1.2 * s, 1.2 * s);
  line(c, -2 * s, -2 * s, -2 * s, 0, '#e0a030', 1.2 * s); line(c, 3 * s, -2 * s, 3 * s, 0, '#e0a030', 1.2 * s);
  c.restore();
}
export function crowBird(c, x, y, s = 1, t = 0, flying = false) {
  c.save(); c.translate(x, y); c.fillStyle = '#1e1e22';
  if (flying) { const f = Math.sin(t * 9); c.beginPath(); c.moveTo(-12 * s, -f * 5 * s); c.quadraticCurveTo(-4 * s, -2 * s, 0, 0); c.quadraticCurveTo(4 * s, -2 * s, 12 * s, -f * 5 * s); c.lineTo(10 * s, -f * 5 * s + 2 * s); c.quadraticCurveTo(0, 3 * s, -10 * s, -f * 5 * s + 2 * s); c.fill(); }
  else { ellipse(c, 0, -5 * s, 7 * s, 4 * s, '#1e1e22'); circle(c, 6 * s, -9 * s, 3 * s, '#2a2a30'); poly(c, [[8 * s, -9 * s], [13 * s, -8 * s], [8 * s, -7 * s]], '#444'); poly(c, [[-6 * s, -6 * s], [-13 * s, -8 * s], [-6 * s, -3 * s]], '#1e1e22'); }
  c.restore();
}
export function dog(c, x, y, s = 1, t = 0, flip = false) { // sleeping village dog
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
  shadow(c, 0, 4, 22 * s, 5 * s, .25); const col = '#b58a5a';
  ellipse(c, 0, -6 * s, 20 * s, 9 * s, col); circle(c, -16 * s, -8 * s, 7 * s, col); poly(c, [[-20 * s, -13 * s], [-24 * s, -20 * s], [-16 * s, -14 * s]], '#8a6540');
  c.strokeStyle = col; c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(18 * s, -6 * s); c.quadraticCurveTo(26 * s, -14 * s + Math.sin(t * 3) * 2 * s, 20 * s, -18 * s); c.stroke();
  c.strokeStyle = '#5a4030'; c.lineWidth = 1; c.beginPath(); c.moveTo(-20 * s, -8 * s); c.lineTo(-17 * s, -8 * s); c.stroke(); circle(c, -23 * s, -6 * s, 1.5 * s, '#2b1a10');
  c.restore();
}
export function kingfisher(c, x, y, s = 1) { c.save(); c.translate(x, y); ellipse(c, 0, 0, 7 * s, 4.5 * s, '#1f8fc0'); circle(c, 6 * s, -3 * s, 3.5 * s, '#1f8fc0'); ellipse(c, 0, 1.5 * s, 5 * s, 2.5 * s, '#e07a3a'); poly(c, [[9 * s, -3 * s], [18 * s, -2 * s], [9 * s, -1 * s]], '#222'); c.restore(); }
export function fishShape(c, x, y, s, col = '#9fb4c4', dir = 1) { c.save(); c.translate(x, y); c.scale(dir, 1); ellipse(c, 0, 0, 6 * s, 2.4 * s, col); poly(c, [[-6 * s, 0], [-10 * s, -3 * s], [-10 * s, 3 * s]], col); c.restore(); }
export function butterfly(c, x, y, s, t, col = '#f2c230') { const f = Math.abs(Math.sin(t * 10)) * .6 + .4; c.save(); c.translate(x, y); ellipse(c, -4 * s * f, 0, 4 * s * f, 3 * s, col); ellipse(c, 4 * s * f, 0, 4 * s * f, 3 * s, col); line(c, 0, -3 * s, 0, 3 * s, '#333', 1); c.restore(); }
export function dragonfly(c, x, y, s, t) { c.save(); c.translate(x, y); line(c, -8 * s, 0, 8 * s, 0, '#c0392b', 1.5 * s); c.globalAlpha = .55; ellipse(c, -2 * s, -2 * s, 7 * s, 1.6 * s, '#dff', -.3); ellipse(c, 2 * s, -2 * s, 7 * s, 1.6 * s, '#dff', .3); c.restore(); }
export function elephant(c, x, y, s = 1, t = 0, decorated = false) {
  c.save(); c.translate(x, y); shadow(c, 0, 6, 70 * s, 12 * s, .35); const col = '#5a5a60', dk = '#44444a';
  for (const lx of [-40, -18, 20, 42]) rect(c, lx * s - 8 * s, -50 * s, 16 * s, 52 * s, dk);
  ellipse(c, 0, -80 * s, 64 * s, 40 * s, col);
  circle(c, 58 * s, -98 * s, 28 * s, col); ellipse(c, 44 * s, -96 * s, 18 * s, 24 * s, dk); // head + ear
  c.strokeStyle = col; c.lineWidth = 14 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(78 * s, -84 * s); c.quadraticCurveTo(96 * s + Math.sin(t) * 4 * s, -50 * s, 84 * s, -8 * s); c.stroke();
  line(c, 70 * s, -78 * s, 90 * s, -62 * s, '#efe6d0', 5 * s); // tusk
  c.fillStyle = '#1a1a1a'; c.fillRect(66 * s, -104 * s, 3 * s, 3 * s);
  if (decorated) { // nettipattam (golden caparison)
    poly(c, [[44 * s, -126 * s], [74 * s, -126 * s], [80 * s, -70 * s], [60 * s, -60 * s], [40 * s, -70 * s]], P.brass); for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) circle(c, 48 * s + k * 8 * s, -118 * s + r * 11 * s, 2.6 * s, r % 2 ? P.brassLt : P.brassDk);
    rect(c, -50 * s, -118 * s, 100 * s, 8 * s, '#b8321c'); // back cloth
  }
  c.restore();
}
// ---------- vehicles / boats ----------
export function bus(c, x, y, s = 1) { // KSRTC: red-yellow, 'anavandi'
  c.save(); c.translate(x, y); shadow(c, 0, 6, 110 * s, 12 * s, .35);
  roundRect(c, -100 * s, -70 * s, 200 * s, 62 * s, 6 * s, '#c8322a'); rect(c, -100 * s, -40 * s, 200 * s, 10 * s, '#f1c232');
  for (let i = 0; i < 6; i++) roundRect(c, -92 * s + i * 32 * s, -64 * s, 24 * s, 20 * s, 2 * s, '#cfe3ea');
  rect(c, 70 * s, -64 * s, 26 * s, 36 * s, '#cfe3ea'); rect(c, -100 * s, -30 * s, 200 * s, 20 * s, '#b32a22');
  circle(c, -60 * s, -6 * s, 12 * s, '#222'); circle(c, 60 * s, -6 * s, 12 * s, '#222'); circle(c, -60 * s, -6 * s, 5 * s, '#888'); circle(c, 60 * s, -6 * s, 5 * s, '#888');
  rect(c, -40 * s, -36 * s, 80 * s, 5 * s, '#f1c232'); c.fillStyle = '#fff'; c.font = `${7 * s}px sans-serif`; c.textAlign = 'center'; c.fillText('K S R T C', 0, -31 * s);
  c.restore();
}
export function ambassador(c, x, y, s = 1, col = '#f0ead6') {
  c.save(); c.translate(x, y); shadow(c, 0, 4, 60 * s, 8 * s, .3);
  roundRect(c, -56 * s, -26 * s, 112 * s, 20 * s, 6 * s, col); roundRect(c, -34 * s, -46 * s, 66 * s, 24 * s, 10 * s, col);
  roundRect(c, -28 * s, -42 * s, 26 * s, 16 * s, 3 * s, '#9fc2cc'); roundRect(c, 2 * s, -42 * s, 24 * s, 16 * s, 3 * s, '#9fc2cc');
  circle(c, -34 * s, -6 * s, 9 * s, '#222'); circle(c, 34 * s, -6 * s, 9 * s, '#222'); circle(c, -34 * s, -6 * s, 4 * s, '#ccc'); circle(c, 34 * s, -6 * s, 4 * s, '#ccc');
  rect(c, -58 * s, -14 * s, 116 * s, 3 * s, '#999'); circle(c, 54 * s, -18 * s, 3 * s, '#ffe9a0');
  c.restore();
}
export function bicycle(c, x, y, s = 1) { c.save(); c.translate(x, y); c.strokeStyle = '#222'; c.lineWidth = 2 * s; c.beginPath(); c.arc(-14 * s, 0, 10 * s, 0, 7); c.moveTo(24 * s, 0); c.arc(14 * s, 0, 10 * s, 0, 7); c.moveTo(-14 * s, 0); c.lineTo(0, -14 * s); c.lineTo(14 * s, 0); c.lineTo(4 * s, -2 * s); c.lineTo(-14 * s, 0); c.moveTo(0, -14 * s); c.lineTo(10 * s, -16 * s); c.moveTo(-4 * s, -16 * s); c.lineTo(2 * s, -15 * s); c.stroke(); c.restore(); }
export function boat(c, x, y, s = 1, t = 0) { // vallam / thoni
  c.save(); c.translate(x, y + Math.sin(t) * 1.5 * s);
  c.fillStyle = P.teakDk; c.beginPath(); c.moveTo(-60 * s, -10 * s); c.quadraticCurveTo(0, 14 * s, 60 * s, -10 * s); c.lineTo(70 * s, -22 * s); c.quadraticCurveTo(0, -6 * s, -70 * s, -22 * s); c.closePath(); c.fill();
  c.fillStyle = P.teak; c.beginPath(); c.moveTo(-66 * s, -20 * s); c.quadraticCurveTo(0, -8 * s, 66 * s, -20 * s); c.lineTo(62 * s, -16 * s); c.quadraticCurveTo(0, -2 * s, -62 * s, -16 * s); c.closePath(); c.fill();
  c.restore();
}
export function water(c, x, y, w, h, t, cols = ['#7fa6b8', '#4f7f92'], reflect = null) {
  rect(c, x, y, w, h, vgrad(c, 0, y, y + h, [[0, cols[0]], [1, cols[1]]]));
  c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1;
  for (let i = 0; i < 18; i++) { const yy = y + 6 + (i * 97 % h), xx = x + ((i * 53 + t * 12 * (1 + i % 3)) % (w + 60)) - 30, len = 14 + (i % 4) * 10; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + len, yy); c.stroke(); }
  if (reflect) { c.globalAlpha = .18; c.fillStyle = reflect; c.fillRect(x, y, w, h * .5); c.globalAlpha = 1; }
}
export function mist(c, x, y, w, h, a = .5) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,245,230,0)'); g.addColorStop(.5, `rgba(255,245,230,${a})`); g.addColorStop(1, 'rgba(255,245,230,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); }
export function hurricaneLamp(c, x, y, s = 1, lit = false) { rect(c, x - 5 * s, y - 4 * s, 10 * s, 4 * s, '#444'); rect(c, x - 4 * s, y - 22 * s, 8 * s, 18 * s, lit ? 'rgba(255,230,160,.6)' : 'rgba(200,210,220,.4)'); rect(c, x - 6 * s, y - 24 * s, 12 * s, 3 * s, '#444'); c.strokeStyle = '#444'; c.lineWidth = 1; c.beginPath(); c.arc(x, y - 26 * s, 6 * s, Math.PI, 0); c.stroke(); if (lit) { circle(c, x, y - 12 * s, 2.2 * s, P.flameHi); } }
export function jar(c, x, y, w, h, contents, label) { rect(c, x, y, w, h, 'rgba(225,230,235,.4)'); rect(c, x, y + h * .35, w, h * .65, contents); rect(c, x - 1, y - 3, w + 2, 4, '#c8a050'); rect(c, x + 1.5, y + 2, 2, h - 4, 'rgba(255,255,255,.45)'); }
export function kindi(c, x, y, s = 1) { ellipse(c, x, y, 8 * s, 3 * s, P.brassDk); ellipse(c, x, y - 7 * s, 9 * s, 7 * s, P.brass); rect(c, x - 3 * s, y - 18 * s, 6 * s, 6 * s, P.brass); ellipse(c, x, y - 18 * s, 5 * s, 2 * s, P.brassLt); line(c, x + 8 * s, y - 9 * s, x + 16 * s, y - 20 * s, P.brass, 3 * s); }
export function kolambi(c, x, y, s = 1) { ellipse(c, x, y, 9 * s, 3 * s, P.brassDk); poly(c, [[x - 7 * s, y], [x + 7 * s, y], [x + 9 * s, y - 10 * s], [x - 9 * s, y - 10 * s]], P.brass); ellipse(c, x, y - 10 * s, 11 * s, 3.5 * s, P.brassLt); ellipse(c, x, y - 10 * s, 7 * s, 2 * s, P.brassDk); }
export function gunnySack(c, x, y, w, h, grain = '#e8dcc0') { roundRect(c, x, y, w, h, 6, '#b89a6a'); c.strokeStyle = 'rgba(80,60,30,.25)'; c.lineWidth = 1; for (let i = 0; i < h / 6; i++) { c.beginPath(); c.moveTo(x + 2, y + 4 + i * 6); c.lineTo(x + w - 2, y + 4 + i * 6); c.stroke(); } ellipse(c, x + w / 2, y + 2, w / 2 - 3, 6, grain); }
export function cinemaPoster(c, x, y, w, h, title, col) { rect(c, x - 2, y - 2, w + 4, h + 4, '#e8dcc0'); rect(c, x, y, w, h, col); ellipse(c, x + w / 2, y + h * .45, w * .28, h * .3, '#f0d0b0'); circle(c, x + w / 2, y + h * .32, w * .18, '#2a1a10'); rect(c, x, y + h - 14, w, 14, '#1a1a1a'); c.fillStyle = '#ffe28a'; c.font = `bold 7px sans-serif`; c.textAlign = 'center'; c.fillText(title, x + w / 2, y + h - 5); }
