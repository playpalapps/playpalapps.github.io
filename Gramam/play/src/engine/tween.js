// Lightweight tween/timer manager
const tweens = [];
export function tween(obj, props, dur, ease = t => t, done) {
  const from = {}; for (const k in props) from[k] = obj[k];
  const tw = { obj, props, from, dur, ease, t: 0, done, dead: false };
  tweens.push(tw); return tw;
}
export function delay(sec, fn) { return tween({}, {}, sec, t => t, fn); }
export function updateTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    if (tw.dead) { tweens.splice(i, 1); continue; }
    tw.t += dt;
    const k = tw.dur <= 0 ? 1 : Math.min(1, tw.t / tw.dur), e = tw.ease(k);
    for (const p in tw.props) tw.obj[p] = tw.from[p] + (tw.props[p] - tw.from[p]) * e;
    if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); }
  }
}
