// Logical coordinate system: height is always 800 units; width scales with aspect.
export const LH = 800;
export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const view = { w: 360, h: LH, scale: 1, dpr: 1, cx: 180, safeTop: 0, safeBottom: 0 };

export function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 3);
  const cw = innerWidth, ch = innerHeight;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  view.dpr = dpr;
  view.scale = ch / LH;
  view.w = cw / view.scale;
  view.h = LH;
  view.cx = view.w / 2;
  const st = getComputedStyle(document.documentElement);
  const sat = parseFloat(st.getPropertyValue('--sat')) || 0, sab = parseFloat(st.getPropertyValue('--sab')) || 0;
  // env() values are CSS px; convert to logical units. Fall back to a ratio guess when unavailable (desktop browsers).
  view.safeTop = sat > 0 ? sat / view.scale + 4 : ((ch / cw > 1.9) ? 44 : 20);
  view.safeBottom = sab > 0 ? sab / view.scale : ((ch / cw > 1.9) ? 28 : 8);
}
export function beginFrame() {
  ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, 0);
}
export function makeLayer(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * view.dpr * view.scale);
  c.height = Math.ceil(h * view.dpr * view.scale);
  const x = c.getContext('2d');
  x.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, 0);
  return { c, x, w, h };
}
