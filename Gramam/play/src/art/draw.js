import { rgba } from '../engine/ease.js';
export function rr(x, c, y, w, h, r, fill) { // rounded rect; (ctx, x, y, w, h, r, fill)
  // signature kept flexible: rr(ctx, x, y, w, h, r, fill)
}
export function roundRect(c, x, y, w, h, r, fill, stroke) {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.stroke(); }
}
export function poly(c, pts, fill, stroke, lw) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
}
export function ellipse(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fillStyle = fill; c.fill(); }
export function circle(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); }
export function rect(c, x, y, w, h, fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
export function vgrad(c, x, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
export function hgrad(c, x0, x1, stops) { const g = c.createLinearGradient(x0, 0, x1, 0); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
export function shadow(c, x, y, rx, ry, a = .25) { const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(30,18,8,${a})`); g.addColorStop(1, 'rgba(30,18,8,0)'); c.save(); c.scale(1, ry / rx); c.fillStyle = g; c.beginPath(); c.arc(x, y * rx / ry, rx, 0, 7); c.fill(); c.restore(); }
export function glow(c, x, y, r, col, a = .5) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.5, rgba(col, a * .35)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
export function line(c, x0, y0, x1, y1, col, w = 1) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
export function text(c, s, x, y, size, col, align = 'center', font = 'serif', weight = '') {
  c.font = `${weight} ${size}px ${font}`; c.fillStyle = col; c.textBaseline = 'middle';
  // WebKit mis-positions right/center-aligned complex scripts (Malayalam); measure and draw left-aligned instead
  if (align === 'right') { c.textAlign = 'left'; c.fillText(s, x - c.measureText(s).width, y); }
  else if (align === 'center' && /[\u0D00-\u0D7F]/.test(s)) { c.textAlign = 'left'; c.fillText(s, x - c.measureText(s).width / 2, y); }
  else { c.textAlign = align; c.fillText(s, x, y); }
}
export const FONT = '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif';

// Paper grain overlay (generated once)
let grainCanvas = null, grainPat = null;
export function grain(c, w, h, alpha = .07) {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas'); grainCanvas.width = grainCanvas.height = 256;
    const g = grainCanvas.getContext('2d'), img = g.createImageData(256, 256), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 110 + Math.random() * 90; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  if (!grainPat) grainPat = c.createPattern(grainCanvas, 'repeat');
  c.save(); c.globalAlpha = alpha; c.globalCompositeOperation = 'overlay';
  c.fillStyle = grainPat; c.fillRect(0, 0, w, h); c.restore();
}
export function vignette(c, w, h, a = .35) {
  const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .45, w / 2, h / 2, Math.max(w, h) * .75);
  g.addColorStop(0, 'rgba(20,10,5,0)'); g.addColorStop(1, `rgba(20,10,5,${a})`); c.fillStyle = g; c.fillRect(0, 0, w, h);
}
// Coconut palm: tapered trunk from (x,yBase) curving to (x+lean,yTop), crown of pinnate fronds
export function palm(c, x, yBase, yTop, lean, scale, colors, sway = 0) {
  const [trunk, trunkDk, frondDk, frondLt] = colors;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const tx = x + lean + sway, ty = yTop, cx = x + lean * .45, cy = (yBase + yTop) * .5 + 10;
  // trunk as tapered ribbon along a quadratic curve
  const N = 14, L = [], R = [];
  for (let i = 0; i <= N; i++) { const t = i / N, px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * tx, py = (1 - t) * (1 - t) * yBase + 2 * (1 - t) * t * cy + t * t * ty; const wdt = (5.5 - t * 2.2) * scale; L.push([px - wdt, py]); R.push([px + wdt, py]); }
  c.fillStyle = trunk; c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (const p of L) c.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  c.strokeStyle = trunkDk; c.lineWidth = 1.2 * scale; c.globalAlpha = .6;
  for (let i = 1; i < N; i += 1) { c.beginPath(); c.moveTo(L[i][0] + 1, L[i][1]); c.lineTo(R[i][0] - 1, R[i][1] - 2 * scale); c.stroke(); }
  c.globalAlpha = 1;
  // fronds: back row darker, front row lighter
  const fr = (a, len, col, droop) => {
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .35 + len * droop;
    const mx = tx + Math.cos(a) * len * .6, my = ty + Math.sin(a) * len * .45 - len * .22;
    const S = 13, pts = [], outL = [], outR = [];
    for (let i = 0; i <= S; i++) { const t = i / S, px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey; pts.push([px, py]); }
    for (let i = 0; i <= S; i++) {
      const t = i / S, [px, py] = pts[i], [qx, qy] = pts[Math.min(S, i + 1)], [rx, ry] = pts[Math.max(0, i - 1)];
      let dx = qx - rx, dy = qy - ry; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const ll = Math.pow(Math.sin(t * Math.PI), .6) * 13 * scale * (i % 2 ? 1 : .55), nx = -dy, ny = dx;
      outL.push([px + nx * ll, py + ny * ll + ll * .5]); outR.push([px - nx * ll, py - ny * ll + ll * .5]);
    }
    c.fillStyle = col; c.beginPath(); c.moveTo(tx, ty); for (const p of outL) c.lineTo(p[0], p[1]); c.lineTo(ex, ey); for (let i = outR.length - 1; i >= 0; i--) c.lineTo(outR[i][0], outR[i][1]); c.closePath(); c.fill();
    c.strokeStyle = trunkDk; c.lineWidth = .8 * scale; c.globalAlpha = .5; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke(); c.globalAlpha = 1;
  };
  const n = 9;
  for (let i = 0; i < n; i++) { const a = -Math.PI * .98 + i * (Math.PI * .96 / (n - 1)) + sway * .01; fr(a, (62 + (i % 3) * 10) * scale, frondDk, .55 + (i % 2) * .12); }
  for (let i = 0; i < n - 2; i++) { const a = -Math.PI * .9 + i * (Math.PI * .8 / (n - 3)) + .1 + sway * .012; fr(a, (54 + (i % 2) * 12) * scale, frondLt, .42 + (i % 2) * .15); }
  // coconuts cluster
  for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? frondDk : trunkDk; c.beginPath(); c.arc(tx - 7 * scale + i * 5 * scale, ty + 9 * scale + (i % 2) * 3 * scale, 4.2 * scale, 0, 7); c.fill(); }
  c.restore();
}
export function bananaPlant(c, x, y, scale, dk, lt) {
  c.save(); c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * .45, L = (60 + (i % 2) * 20) * scale;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    c.strokeStyle = i % 2 ? dk : lt; c.lineWidth = 11 * scale; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L * .6, y + Math.sin(a) * L * .6 - 10 * scale, ex, ey + 8 * scale); c.stroke();
    c.strokeStyle = dk; c.lineWidth = 1.2 * scale; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L * .6, y + Math.sin(a) * L * .6 - 10 * scale, ex, ey + 8 * scale); c.stroke();
  }
  c.restore();
}
export function tileRoof(c, x, y, w, h, tile, tileLt, tileDk) { // overhanging roof band with tile rows
  c.fillStyle = tile; c.fillRect(x, y, w, h);
  const rows = Math.max(2, Math.floor(h / 9));
  for (let r = 0; r < rows; r++) {
    const yy = y + r * (h / rows);
    c.fillStyle = r % 2 ? tileLt : tile; c.fillRect(x, yy, w, h / rows);
    c.fillStyle = tileDk; c.globalAlpha = .35;
    for (let xx = x + (r % 2) * 9; xx < x + w; xx += 18) { c.beginPath(); c.arc(xx, yy + h / rows, 5, Math.PI, 0); c.fill(); }
    c.globalAlpha = 1;
  }
  c.fillStyle = tileDk; c.fillRect(x, y + h - 3, w, 3);
}
