export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => t * t * (3 - 2 * t);
export const inOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const outCubic = t => 1 - Math.pow(1 - t, 3);
export const outBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
export const pick = arr => arr[(Math.random() * arr.length) | 0];
// deterministic hash noise for stable procedural placement
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function lerpColor(a, b, t) {
  const pa = parse(a), pb = parse(b);
  const r = Math.round(lerp(pa[0], pb[0], t)), g = Math.round(lerp(pa[1], pb[1], t)), bl = Math.round(lerp(pa[2], pb[2], t));
  return `rgb(${r},${g},${bl})`;
}
export function parse(c) {
  if (c[0] === '#') { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const m = c.match(/\d+/g); return [+m[0], +m[1], +m[2]];
}
export function rgba(c, a) { const p = parse(c); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
