// Music composed in code: a bamboo flute over a tanpura drone, phrases generated from raga rules. Sparse by design.
import { audio } from './audio.js';
let ac = null, bus = null, playing = false, stopAt = 0, timer = null, drone = null, veenaDrone = null;
const RAGAS = {
  mohanam: { notes: [0, 2, 4, 7, 9], rest: [0, 7], mood: 'dawn' },           // S R G P D
  kalyani: { notes: [0, 2, 4, 6, 7, 9, 11], rest: [0, 7, 4], mood: 'dusk' },  // S R G M# P D N
  neelambari: { notes: [0, 2, 4, 5, 7, 9, 11], rest: [0, 4, 7], mood: 'night', soft: true },
  hamsadhwani: { notes: [0, 2, 4, 7, 11], rest: [0, 7], mood: 'festival' }     // S R G P N
};
function ctx() { if (!ac) { ac = audio.context(); if (!ac) return null; bus = ac.createGain(); bus.gain.value = 0; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3800; const d = ac.createDelay(1); d.delayTime.value = .27; const fb = ac.createGain(); fb.gain.value = .28; const wet = ac.createGain(); wet.gain.value = .35; bus.connect(lp); lp.connect(audio.master()); lp.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(audio.master()); } return ac; }
function flute(fr, t, dur, amp, slideFrom) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
  o.type = 'sine'; o2.type = 'triangle'; o.frequency.setValueAtTime(slideFrom || fr * .97, t); o.frequency.exponentialRampToValueAtTime(fr, t + .09); o2.frequency.setValueAtTime((slideFrom || fr * .97) * 2, t); o2.frequency.exponentialRampToValueAtTime(fr * 2, t + .09);
  const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(fr * .007, t + dur * .5); v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + dur + .3);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + .08); g.gain.setValueAtTime(amp * .9, t + dur - .12); g.gain.linearRampToValueAtTime(0, t + dur + .05);
  g2.gain.value = .12; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .1); o2.start(t); o2.stop(t + dur + .1);
  const n = ac.createBufferSource(); n.buffer = audio.noise(.6); const nf = ac.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = fr * 2; nf.Q.value = 3; const ng = ac.createGain(); ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(amp * .08, t + .05); ng.gain.linearRampToValueAtTime(0, t + .4); n.connect(nf); nf.connect(ng); ng.connect(bus); n.start(t);
}
// pulluvan veena: a single gut string over a pot, bowed slowly with a bamboo stick; here a sawtooth through a resonant bandpass with a slow bow swell
function veena(base) {
  const g = ac.createGain(); g.gain.value = .05; g.connect(bus); let on = true;
  const bow = () => { if (!playing || !on) return; const t = ac.currentTime, o = ac.createOscillator(), f = ac.createBiquadFilter(), og = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = base * .5; f.type = 'bandpass'; f.frequency.value = base * 2; f.Q.value = 9; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.5, t + 1.6); og.gain.setValueAtTime(.45, t + 3.2); og.gain.linearRampToValueAtTime(0, t + 4.4); o.connect(f); f.connect(og); og.connect(g); o.start(t); o.stop(t + 4.5); timer2 = setTimeout(bow, 5200); };
  bow(); return { g, stop() { on = false; } };
}
let timer2 = null;
function tanpura(base) {
  const g = ac.createGain(); g.gain.value = .045; g.connect(bus); const strings = [base / 2 * 1.5, base, base, base / 2]; let i = 0;
  const pluck = () => { if (!playing) return; const fr = strings[i % 4]; i++; const t = ac.currentTime; for (const [h, a] of [[1, 1], [2, .5], [3, .3], [4, .18], [5, .1]]) { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = fr * h; og.gain.setValueAtTime(a * .25, t); og.gain.exponentialRampToValueAtTime(.001, t + 2.6); o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.7); } timer = setTimeout(pluck, 760); };
  pluck(); return g;
}
audio.onRebuild(() => { if (timer) clearTimeout(timer); if (timer2) clearTimeout(timer2); timer = timer2 = null; playing = false; ac = null; bus = null; drone = null; veenaDrone = null; });
export const music = {
  get playing() { return playing; },
  play(name, seconds = 75, base = 349.2) { // base F4
    if (!ctx() || playing || audio.musicOff) return; const R = RAGAS[name] || RAGAS.mohanam; playing = true; stopAt = ac.currentTime + seconds;
    bus.gain.cancelScheduledValues(ac.currentTime); bus.gain.setValueAtTime(0, ac.currentTime); bus.gain.linearRampToValueAtTime(R.soft ? .5 : .7, ac.currentTime + 3);
    drone = tanpura(base / 2); if (R.soft) veenaDrone = veena(base);
    let t = ac.currentTime + 1.2, idx = R.notes.indexOf(0), octave = 0, lastFr = base; const beat = R.soft ? .95 : .78;
    const phrase = () => {
      if (!playing || t > stopAt - 4) { fadeOut(); return; }
      const len = 4 + (Math.random() * 5 | 0); let dir = Math.random() < .5 ? 1 : -1;
      for (let k = 0; k < len; k++) {
        if (Math.random() < .2) dir = -dir; const step = Math.random() < .25 ? 2 : 1; idx += dir * step;
        if (idx >= R.notes.length) { idx -= R.notes.length; octave = Math.min(1, octave + 1); } if (idx < 0) { idx += R.notes.length; octave = Math.max(-1, octave - 1); }
        if (k === len - 1 && !R.rest.includes(R.notes[idx])) { idx = R.notes.indexOf(R.rest[(Math.random() * R.rest.length) | 0]); }
        const fr = base * Math.pow(2, (R.notes[idx] + 12 * octave) / 12), dur = (k === len - 1 ? beat * (2 + Math.random() * 1.5) : beat * (Math.random() < .3 ? .5 : 1)) ;
        flute(fr, t, dur, R.soft ? .11 : .15, Math.random() < .35 ? lastFr : null); lastFr = fr; t += dur + .04;
      }
      t += beat * (1 + Math.random() * 2); // breath between phrases
      timer = setTimeout(phrase, Math.max(50, (t - ac.currentTime - 2) * 1000));
    };
    phrase();
  },
  stop() { fadeOut(); }
};
function fadeOut() { if (!playing) return; playing = false; if (veenaDrone) { veenaDrone.stop(); veenaDrone = null; } if (timer2) { clearTimeout(timer2); timer2 = null; } const t = ac.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0, t + 4); if (timer) { clearTimeout(timer); timer = null; } }
