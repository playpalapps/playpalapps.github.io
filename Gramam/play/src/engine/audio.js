// Fully procedural audio. No files. Everything is synthesized in WebAudio.
let ac = null, master, ambBus, sfxBus;
const amb = {}; // named ambience voices
const holds = {}; // short-lived overrides from scenes (kettle hiss while cooking, etc.)
let unlocked = false;
let lastTime = 0, stuckFor = 0, lastCheck = 0, onRebuild = [];
function build() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
  master = ac.createGain(); master.gain.value = audio.muted ? 0 : 0.9; master.connect(ac.destination);
  ambBus = ac.createGain(); ambBus.gain.value = 0.8; const ambLP = ac.createBiquadFilter(); ambLP.type = 'lowpass'; ambLP.frequency.value = 3200; ambLP.Q.value = .3; const ambHS = ac.createBiquadFilter(); ambHS.type = 'highshelf'; ambHS.frequency.value = 1800; ambHS.gain.value = -12; ambBus.connect(ambHS); ambHS.connect(ambLP); ambLP.connect(master);
  sfxBus = ac.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
  for (const k in amb) delete amb[k]; for (const k in holds) delete holds[k]; lastTime = 0; stuckFor = 0;
  if (ac.state !== 'running') { try { ac.resume(); } catch (e) { } }
}
export const audio = {
  get ready() { return unlocked; },
  get running() { return !!ac && ac.state === 'running'; },
  unlock() {
    if (unlocked) { audio.resume(); return; }
    build(); unlocked = true;
  },
  // iOS stops a context on a phone call, Siri, headphones coming out, or a long stay in the background, and leaves it 'interrupted' or 'suspended'; resume it, and if it will not come back, build a new one
  resume() { if (!ac) return; if (ac.state !== 'running') { try { const p = ac.resume(); if (p && p.catch) p.catch(() => { }); } catch (e) { } } },
  rebuild() { try { if (ac && ac.close) ac.close().catch(() => { }); } catch (e) { } build(); for (const f of onRebuild) { try { f(); } catch (e) { } } },
  onRebuild(f) { onRebuild.push(f); },
  // called every frame while the page is visible: a context that is not running, or whose clock has stopped, gets resumed and then rebuilt
  watch(dt) {
    if (!unlocked || !ac) return; lastCheck += dt; if (lastCheck < 1) return; lastCheck = 0;
    const running = ac.state === 'running', moving = ac.currentTime > lastTime + .2; lastTime = ac.currentTime;
    if (running && moving) { stuckFor = 0; return; }
    stuckFor += 1; audio.resume();
    if (stuckFor >= 4) { stuckFor = 0; audio.rebuild(); }
  },
  muted: false,
  setMuted(m) { this.muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : .9, ac.currentTime, .1); },
  setAmbience(targets, fade = 2.5) { // {wind:0.3, rain:0, cicadas:0.5 ...}; the whole mix, every frame
    if (!unlocked) return;
    const now = ac.currentTime;
    for (const k in holds) { if (holds[k].until < now) delete holds[k]; }
    for (const k in voices) {
      let want = targets[k] || 0; if (holds[k]) want = Math.max(want, holds[k].v);
      if (want > 0 && !amb[k]) amb[k] = voices[k]();
      if (amb[k]) {
        const v = amb[k], g = v.gain.gain;
        if (v.want !== undefined && Math.abs(v.want - want) < .01) continue; // already heading there
        v.want = want; const cur = g.value, T = Math.max(.3, fade);
        g.cancelScheduledValues(now); g.setValueAtTime(cur, now); g.linearRampToValueAtTime(want, now + T);
        if (want === 0) g.setValueAtTime(0, now + T + .02);
      }
    }
  },
  hold(k, v, seconds = 4) { if (!unlocked) return; holds[k] = { v, until: ac.currentTime + seconds }; },
  release(k) { delete holds[k]; },
  sfx(name, opt = {}) { if (unlocked && sfx[name]) sfx[name](opt); },
  get now() { return ac ? ac.currentTime : 0; },
  context() { return ac; }, master() { return master; }, voices() { const o = {}; for (const k in amb) o[k] = +amb[k].gain.gain.value.toFixed(3); return o; }, _amb() { return amb; }, noise(sec) { return noiseBuffer(sec, 'pink'); }, musicOff: false
};

// ---------- building blocks ----------
function noiseBuffer(sec = 2, color = 'white') {
  const n = ac.sampleRate * sec, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'white') d[i] = w;
    else if (color === 'pink') { b0 = .99765 * b0 + w * .099; b1 = .963 * b1 + w * .2965; b2 = .57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * .1848) * .18; }
    else { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
  }
  return b;
}
function noiseSrc(color) { const s = ac.createBufferSource(); s.buffer = noiseBuffer(3, color); s.loop = true; return s; }
function voice() { const gain = ac.createGain(); gain.gain.value = 0; gain.connect(ambBus); const keep = ac.createConstantSource(); keep.offset.value = 0; keep.connect(gain); keep.start(); return { gain, nodes: [keep] }; } // the constant source keeps the node processing so fades always complete
function lfo(freq, depth, target, base) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target); if (base !== undefined) target.value = base; o.start(); return o; }

// ---------- ambience voices ----------
const voices = {
  wind() { // wind through coconut fronds: pink noise, slow swelling bandpass
    const v = voice(), s = noiseSrc('pink'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = .6; g.gain.value = .5;
    lfo(.07, 250, f.frequency, 600); lfo(.11, .25, g.gain, .5);
    s.connect(f); f.connect(g); g.connect(v.gain); s.start(); return v;
  },
  leaves() { // high rustle layer
    const v = voice(), s = noiseSrc('white'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .7; g.gain.value = .035; lfo(.19, .025, g.gain, .035);
    s.connect(f); f.connect(g); g.connect(v.gain); s.start(); return v;
  },
  rain() { // rain on tiled roof: brown+white mix, plus random drips scheduled
    const v = voice(), s = noiseSrc('white'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = 1100; g.gain.value = .22;
    s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const s2 = noiseSrc('brown'), g2 = ac.createGain(); g2.gain.value = .6; s2.connect(g2); g2.connect(v.gain); s2.start();
    const drip = () => { if (v.gain.gain.value > .01) plink(v.gain, 700 + Math.random() * 900, .035); setTimeout(drip, 160 + Math.random() * 600); };
    setTimeout(drip, 500); return v;
  },
  cicadas() { // two choruses far off: narrow noise bands that swell and fall with pauses, never a constant whine
    const v = voice();
    for (const [fr, rate, off] of [[1700, 34, 0], [2200, 41, 2.3]]) {
      const s = noiseSrc('pink'), f = ac.createBiquadFilter(), g = ac.createGain(), env = ac.createGain();
      f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = 9; g.gain.value = 0; env.gain.value = 0;
      lfo(rate, .5, g.gain, .5);
      s.connect(f); f.connect(g); g.connect(env); env.connect(v.gain); s.start();
      const swell = () => { if (v.gain.gain.value > .005) { const t = ac.currentTime, len = 3 + Math.random() * 4; env.gain.cancelScheduledValues(t); env.gain.setValueAtTime(env.gain.value, t); env.gain.linearRampToValueAtTime(.045, t + len * .4); env.gain.linearRampToValueAtTime(.0, t + len); } setTimeout(swell, (4 + Math.random() * 6) * 1000); };
      setTimeout(swell, off * 1000 + 500);
    }
    return v;
  },
  crickets() { // soft chirps of band-limited noise, far off, with long gaps; no pure tones
    const v = voice();
    for (const [fr, amp, gap] of [[1300, .014, 1.8], [1600, .009, 2.6]]) {
      const n = noiseSrc('pink'), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = 6; g.gain.value = 0;
      n.connect(f); f.connect(g); g.connect(v.gain); n.start();
      const trill = () => { if (v.gain.gain.value > .005) { const t = ac.currentTime, k = 3 + (Math.random() * 3 | 0); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t); for (let i = 0; i < k; i++) { g.gain.linearRampToValueAtTime(amp, t + i * .07 + .02); g.gain.linearRampToValueAtTime(0, t + i * .07 + .06); } } setTimeout(trill, (gap + Math.random() * 1.6) * 1000); };
      setTimeout(trill, 500 + Math.random() * 900);
    }
    return v;
  },
  fire() { // crackle: brown noise + random pops
    const v = voice(), s = noiseSrc('brown'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = .35; lfo(.9, .1, g.gain, .35);
    s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const pop = () => { if (v.gain.gain.value > .01) { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.03, 'white'); const pg = ac.createGain(); pg.gain.setValueAtTime(.3 * Math.random(), ac.currentTime); pg.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .03); n.connect(pg); pg.connect(v.gain); n.start(); } setTimeout(pop, 80 + Math.random() * 600); };
    setTimeout(pop, 300); return v;
  },
  birds() { // dawn chorus: random chirps
    const v = voice();
    const chirp = () => {
      if (v.gain.gain.value > .01) {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime, f0 = 2200 + Math.random() * 1800;
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (1.3 + Math.random() * .5), t + .06); o.frequency.exponentialRampToValueAtTime(f0 * .9, t + .14);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .16);
        o.connect(g); g.connect(v.gain); o.start(t); o.stop(t + .18);
      }
      setTimeout(chirp, 150 + Math.random() * 1400);
    };
    setTimeout(chirp, 400); return v;
  },
  crows() {
    const v = voice();
    const caw = () => {
      if (v.gain.gain.value > .01 && Math.random() < .6) {
        const n = 1 + (Math.random() * 3 | 0);
        for (let i = 0; i < n; i++) setTimeout(() => crowCaw(v.gain, 60 + Math.random() * 140), i * (260 + Math.random() * 120));
      }
      setTimeout(caw, 2500 + Math.random() * 7000);
    };
    setTimeout(caw, 800); return v;
  },
  radio() { // faint warbling Akashvani music through a small speaker
    const v = voice(), f = ac.createBiquadFilter(), g = ac.createGain(), hiss = noiseSrc('white'), hf = ac.createBiquadFilter(), hg = ac.createGain();
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2; g.gain.value = .5; g.connect(f); f.connect(v.gain);
    hf.type = 'bandpass'; hf.frequency.value = 2600; hg.gain.value = .012; hiss.connect(hf); hf.connect(hg); hg.connect(v.gain); hiss.start();
    const scale = [0, 2, 4, 7, 9, 12, 14]; let i = 0;
    const note = () => {
      if (v.gain.gain.value > .01) {
        const o = ac.createOscillator(), og = ac.createGain(), t = ac.currentTime;
        const st = scale[(i + (Math.random() < .3 ? (Math.random() * 3 | 0) : 1)) % scale.length]; i++;
        o.type = 'sawtooth'; o.frequency.value = 220 * Math.pow(2, st / 12); lfo(5.5, 3, o.frequency);
        og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.09, t + .05); og.gain.setTargetAtTime(0, t + .3, .12);
        o.connect(og); og.connect(g); o.start(t); o.stop(t + .9);
      }
      setTimeout(note, 320 + (Math.random() < .25 ? 400 : 0));
    };
    setTimeout(note, 200); return v;
  },
  kettle() { // simmering hiss
    const v = voice(), s = noiseSrc('white'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 1.5; g.gain.value = .15; lfo(3, .05, g.gain, .15);
    s.connect(f); f.connect(g); g.connect(v.gain); s.start(); return v;
  },
  courtyardRain() { // water hitting stone in the nadumuttam: brighter, splashier
    const v = voice(), s = noiseSrc('white'), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .6; g.gain.value = .22; s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const drip = () => { if (v.gain.gain.value > .01) plink(v.gain, 700 + Math.random() * 1200, .07); setTimeout(drip, 60 + Math.random() * 300); };
    setTimeout(drip, 300); return v;
  }
  ,frogs() { // pond frogs at night: croaks in bursts
    const v = voice();
    const croak = () => {
      if (v.gain.gain.value > .01) { const n = 2 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(90 + Math.random() * 40, t); o.frequency.linearRampToValueAtTime(70, t + .12); f.type = 'lowpass'; f.frequency.value = 600; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .02); g.gain.linearRampToValueAtTime(0, t + .14); o.connect(f); f.connect(g); g.connect(v.gain); o.start(t); o.stop(t + .16); }, i * 160); }
      setTimeout(croak, 900 + Math.random() * 2500);
    }; setTimeout(croak, 500); return v;
  },
  koel() { // kuyil: rising two-note call, repeating
    const v = voice();
    const call = () => {
      if (v.gain.gain.value > .01 && Math.random() < .7) { const n = 3 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime, f0 = 700 + i * 40; o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + .25); o.frequency.exponentialRampToValueAtTime(f0 * 1.3, t + .4); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .05); g.gain.setValueAtTime(.08, t + .3); g.gain.linearRampToValueAtTime(0, t + .42); o.connect(g); g.connect(v.gain); o.start(t); o.stop(t + .45); }, i * 480); }
      setTimeout(call, 5000 + Math.random() * 9000);
    }; setTimeout(call, 1500); return v;
  },
  hens() {
    const v = voice();
    const cluck = () => { if (v.gain.gain.value > .01) { const n = 1 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'square'; o.frequency.setValueAtTime(600 + Math.random() * 200, t); o.frequency.exponentialRampToValueAtTime(350, t + .08); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(f); f.connect(g); g.connect(v.gain); o.start(t); o.stop(t + .12); }, i * 130); } setTimeout(cluck, 1200 + Math.random() * 4000); }; setTimeout(cluck, 600); return v;
  },
  murmur() { // chayakkada chatter: formant-filtered noise bursts
    const v = voice(); const s = noiseSrc('pink'); const fs = [500, 1200, 2400].map(fr => { const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = 6; s.connect(f); return f; });
    const g = ac.createGain(); g.gain.value = 0; fs.forEach(f => f.connect(g)); g.connect(v.gain); s.start();
    const talk = () => { if (v.gain.gain.value > .01) { const t = ac.currentTime, len = .2 + Math.random() * .5; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5 + Math.random() * .4, t + .05); for (let i = 0; i < 5; i++) g.gain.linearRampToValueAtTime(.2 + Math.random() * .7, t + .05 + len * (i + 1) / 5); g.gain.linearRampToValueAtTime(0, t + len + .1); fs.forEach(f => f.frequency.setValueAtTime(f.frequency.value * (.9 + Math.random() * .2), t)); } setTimeout(talk, 300 + Math.random() * 900); }; setTimeout(talk, 200); return v;
  },
  lapping() { // water lapping at the kadavu
    const v = voice(), s = noiseSrc('brown'), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = .4; lfo(.4, .25, g.gain, .4); lfo(.13, 200, f.frequency, 700); s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const lap = () => { if (v.gain.gain.value > .01) plink(v.gain, 500 + Math.random() * 600, .04); setTimeout(lap, 400 + Math.random() * 1200); }; setTimeout(lap, 400); return v;
  },
  chenda() { // temple drums: layered pattern at a distance
    const v = voice(); let step = 0;
    const hit = (freq, amp, dur) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * .5, t + dur); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(v.gain); o.start(t); o.stop(t + dur + .02); const n = ac.createBufferSource(); n.buffer = noiseBuffer(.05, 'white'); const ng = ac.createGain(), nf = ac.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 2000; ng.gain.setValueAtTime(amp * .5, t); ng.gain.exponentialRampToValueAtTime(.001, t + .05); n.connect(nf); nf.connect(ng); ng.connect(v.gain); n.start(t); };
    const pattern = [1, 0, .5, .5, 1, 0, .5, 1, 1, .5, .5, .5, 1, 0, 1, .5];
    const tick = () => { if (v.gain.gain.value > .01) { const a = pattern[step % 16]; if (a) hit(a === 1 ? 180 : 320, a === 1 ? .35 : .18, a === 1 ? .18 : .09); if (step % 4 === 0) hit(1400, .06, .04); } step++; setTimeout(tick, 150); }; setTimeout(tick, 100); return v;
  },
  flute() { // pullankuzhal in Mohanam (pentatonic), slow, breathy, far away
    const v = voice(), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 2200; g.gain.value = .6; g.connect(f); f.connect(v.gain);
    const breath = noiseSrc('pink'), bf = ac.createBiquadFilter(), bg = ac.createGain(); bf.type = 'bandpass'; bf.frequency.value = 1800; bf.Q.value = 2; bg.gain.value = 0; breath.connect(bf); bf.connect(bg); bg.connect(v.gain); breath.start();
    const scale = [0, 2, 4, 7, 9, 12, 14, 16]; let idx = 3, phraseLeft = 0; const base = 392; // G
    const note = () => {
      if (v.gain.gain.value > .01) {
        if (phraseLeft <= 0) { phraseLeft = 4 + (Math.random() * 5 | 0); }
        const stepDir = Math.random() < .5 ? -1 : 1; idx = Math.max(0, Math.min(scale.length - 1, idx + (Math.random() < .25 ? stepDir * 2 : stepDir)));
        const dur = phraseLeft === 1 ? 1.6 + Math.random() : .45 + Math.random() * .6, t = ac.currentTime, fr = base * Math.pow(2, scale[idx] / 12);
        const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(fr * .985, t); o.frequency.exponentialRampToValueAtTime(fr, t + .08); lfo(5, fr * .006, o.frequency);
        const o2 = ac.createOscillator(), og2 = ac.createGain(); o2.type = 'triangle'; o2.frequency.value = fr * 2; og2.gain.value = .08; o2.connect(og2); og2.connect(og);
        og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.16, t + .12); og.gain.setValueAtTime(.16, t + dur - .1); og.gain.linearRampToValueAtTime(0, t + dur + .05);
        bg.gain.setValueAtTime(.015, t); bg.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + .1); o2.start(t); o2.stop(t + dur + .1);
        phraseLeft--; setTimeout(note, dur * 1000 + (phraseLeft === 0 ? 1500 + Math.random() * 2500 : 40));
      } else setTimeout(note, 800);
    }; setTimeout(note, 600); return v;
  },
  njattupattu() { // women's planting song: humming melody with vibrato, two voices in near unison
    const v = voice(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; f.connect(v.gain);
    const scale = [0, 2, 3, 5, 7, 8, 10, 12]; let idx = 4; const base = 262;
    const note = () => { if (v.gain.gain.value > .01) { idx = Math.max(0, Math.min(7, idx + (Math.random() < .5 ? -1 : 1) * (Math.random() < .3 ? 2 : 1))); const dur = .4 + Math.random() * .5, t = ac.currentTime, fr = base * Math.pow(2, scale[idx] / 12); for (const det of [1, 1.004]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = 'triangle'; o.frequency.value = fr * det; lfo(5.5, fr * .01, o.frequency); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.07, t + .08); og.gain.setValueAtTime(.07, t + dur - .08); og.gain.linearRampToValueAtTime(0, t + dur); o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + .05); } setTimeout(note, dur * 1000 + 30); } else setTimeout(note, 800); }; setTimeout(note, 300); return v;
  },
  thodu() { // small stream
    const v = voice(), s = noiseSrc('white'), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .5; g.gain.value = .25; lfo(.3, .06, g.gain, .25); s.connect(f); f.connect(g); g.connect(v.gain); s.start(); return v;
  },
  cowshed() { const v = voice(); const moo = () => { if (v.gain.gain.value > .01 && Math.random() < .4) sfx.moo({ dest: v.gain }); setTimeout(moo, 6000 + Math.random() * 12000); }; setTimeout(moo, 2000); return v; }
  ,sea() { // waves on the kadappuram: slow swells of filtered noise with foam hiss
    const v = voice(), s = noiseSrc('brown'), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = .5; lfo(.11, .4, g.gain, .55); lfo(.07, 250, f.frequency, 500); s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const s2 = noiseSrc('white'), f2 = ac.createBiquadFilter(), g2 = ac.createGain(); f2.type = 'bandpass'; f2.frequency.value = 2400; f2.Q.value = .8; g2.gain.value = 0; lfo(.11, .05, g2.gain, .05); s2.connect(f2); f2.connect(g2); g2.connect(v.gain); s2.start(); return v;
  },
  gulls() { const v = voice(); const cry = () => { if (v.gain.gain.value > .01 && Math.random() < .5) { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(1700, t + .15); o.frequency.exponentialRampToValueAtTime(900, t + .5); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 3; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .05); g.gain.linearRampToValueAtTime(0, t + .55); o.connect(f); f.connect(g); g.connect(v.gain); o.start(t); o.stop(t + .6); } setTimeout(cry, 2500 + Math.random() * 7000); }; setTimeout(cry, 1000); return v; },
  rails() { // a distant train: rhythmic clack, approaching and leaving, plus a whistle now and then
    const v = voice(); let ph = 0;
    const clack = () => { if (v.gain.gain.value > .01) { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.04, 'white'); const g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; f.type = 'lowpass'; f.frequency.value = 900; g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); n.connect(f); f.connect(g); g.connect(v.gain); n.start(t); ph++; } setTimeout(clack, ph % 2 ? 160 : 420); }; setTimeout(clack, 300);
    const s = noiseSrc('brown'), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 200; g.gain.value = .5; s.connect(f); f.connect(g); g.connect(v.gain); s.start(); return v;
  },
  projector() { // 16mm projector clatter in the talkies
    const v = voice(), o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'square'; o.frequency.value = 24; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 2; g.gain.value = .08; o.connect(f); f.connect(g); g.connect(v.gain); o.start();
    const s = noiseSrc('pink'), f2 = ac.createBiquadFilter(), g2 = ac.createGain(); f2.type = 'bandpass'; f2.frequency.value = 2400; f2.Q.value = 1; g2.gain.value = .025; s.connect(f2); f2.connect(g2); g2.connect(v.gain); s.start(); return v;
  },
  carols() { // Dhanu nights: a small choir, close harmony, slow
    const v = voice(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800; f.connect(v.gain);
    const scale = [0, 2, 4, 5, 7, 9, 11, 12]; let idx = 4; const base = 196;
    const note = () => { if (v.gain.gain.value > .01) { idx = Math.max(0, Math.min(7, idx + (Math.random() < .5 ? -1 : 1) * (Math.random() < .25 ? 2 : 1))); const dur = .7 + Math.random() * .8, t = ac.currentTime; for (const iv of [0, 4, 7]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = 'triangle'; o.frequency.value = base * Math.pow(2, (scale[idx] + iv) / 12); lfo(5, o.frequency.value * .006, o.frequency); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.05, t + .12); og.gain.setValueAtTime(.05, t + dur - .15); og.gain.linearRampToValueAtTime(0, t + dur); o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + .05); } setTimeout(note, dur * 1000 + 40); } else setTimeout(note, 800); }; setTimeout(note, 300); return v;
  },
  schoolyard() { // children at play, heard from the gate: a low far murmur, short vowel calls with the shape of real voices, a laugh now and then, and sometimes the kuttikali rhyme
    const v = voice();
    const s = noiseSrc('pink'), f = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 480; f.Q.value = .7; f2.type = 'lowpass'; f2.frequency.value = 1400; g.gain.value = .14; lfo(.17, .05, g.gain, .14); s.connect(f); f.connect(f2); f2.connect(g); g.connect(v.gain); s.start();
    const vowel = (fr, dur, amp, glide = 1, when = 0) => { const t = ac.currentTime + when, o = ac.createOscillator(), a1 = ac.createBiquadFilter(), a2 = ac.createBiquadFilter(), og = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(fr, t); o.frequency.linearRampToValueAtTime(fr * glide, t + dur); a1.type = 'bandpass'; a1.frequency.value = 700 + Math.random() * 150; a1.Q.value = 5; a2.type = 'bandpass'; a2.frequency.value = 1050 + Math.random() * 150; a2.Q.value = 6; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(amp, t + .04); og.gain.setValueAtTime(amp * .8, t + dur - .05); og.gain.linearRampToValueAtTime(0, t + dur + .03); o.connect(a1); o.connect(a2); a1.connect(og); a2.connect(og); og.connect(v.gain); o.start(t); o.stop(t + dur + .05); };
    const call = () => { if (v.gain.gain.value > .01) { const n = 1 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) vowel(330 + Math.random() * 260, .12 + Math.random() * .25, .05 + Math.random() * .03, Math.random() < .5 ? 1.15 : .9, i * (.12 + Math.random() * .2)); } setTimeout(call, 700 + Math.random() * 1800); }; setTimeout(call, 400);
    const laugh = () => { if (v.gain.gain.value > .01 && Math.random() < .7) { const fr = 420 + Math.random() * 160; for (let i = 0; i < 5; i++) vowel(fr * (1 - i * .03), .09, .06, .95, i * .14); } setTimeout(laugh, 9000 + Math.random() * 11000); }; setTimeout(laugh, 5000);
    const rhyme = () => { if (v.gain.gain.value > .01 && Math.random() < .6) { const base = 392, seq = [0, 0, -3, 0, 2, 0, -3, -3]; seq.forEach((st, i) => vowel(base * Math.pow(2, st / 12), .22, .055, 1, i * .3)); } setTimeout(rhyme, 20000 + Math.random() * 15000); }; setTimeout(rhyme, 9000);
    return v;
  },
  madrasa() { // children reciting together on the bench: two voices a hair apart, a four-note rise and fall, repeated
    const v = voice(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.connect(v.gain);
    const seq = [0, 2, 3, 2, 0, -2, 0, 0], base = 262; let i = 0;
    const note = () => { if (v.gain.gain.value > .01) { const t = ac.currentTime, fr = base * Math.pow(2, seq[i % seq.length] / 12), dur = i % 8 === 7 ? .7 : .32; for (const det of [1, 1.006]) { const o = ac.createOscillator(), a1 = ac.createBiquadFilter(), og = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = fr * det; a1.type = 'bandpass'; a1.frequency.value = 800; a1.Q.value = 3; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.05, t + .05); og.gain.setValueAtTime(.045, t + dur - .06); og.gain.linearRampToValueAtTime(0, t + dur); o.connect(a1); a1.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + .02); } i++; setTimeout(note, dur * 1000 + (i % 8 === 0 ? 900 : 60)); } else setTimeout(note, 700); }; setTimeout(note, 300); return v;
  },
  cart() { // bullock cart: slow wheel creak and bells
    const v = voice(); const tick = () => { if (v.gain.gain.value > .01) { plink(v.gain, 2400 + Math.random() * 400, .04); setTimeout(() => plink(v.gain, 2600, .03), 120); } setTimeout(tick, 900 + Math.random() * 500); }; setTimeout(tick, 400); return v;
  },
  kaavu() { // sacred grove: deep hush, drips, a distant owl
    const v = voice(), s = noiseSrc('brown'), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 300; g.gain.value = .35; s.connect(f); f.connect(g); g.connect(v.gain); s.start();
    const drip = () => { if (v.gain.gain.value > .01) plink(v.gain, 1200 + Math.random() * 800, .04); setTimeout(drip, 1500 + Math.random() * 4000); }; setTimeout(drip, 800);
    const owl = () => { if (v.gain.gain.value > .01 && Math.random() < .5) { for (let i = 0; i < 2; i++) setTimeout(() => { const o = ac.createOscillator(), g2 = ac.createGain(), t = ac.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(330, t + .35); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.08, t + .08); g2.gain.linearRampToValueAtTime(0, t + .4); o.connect(g2); g2.connect(v.gain); o.start(t); o.stop(t + .42); }, i * 500); } setTimeout(owl, 8000 + Math.random() * 12000); }; setTimeout(owl, 3000); return v;
  }
};
function plink(dest, f, amp) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .6, t + .08);
  g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(.0005, t + .1);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + .12);
}
function crowCaw(dest, dist) {
  const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime;
  o.type = 'sawtooth'; o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(520, t + .08); o.frequency.linearRampToValueAtTime(300, t + .28);
  f.type = 'bandpass'; f.frequency.value = 1100 - dist * 3; f.Q.value = 2.5;
  const a = .09 * (100 / (100 + dist));
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .04); g.gain.setValueAtTime(a, t + .18); g.gain.exponentialRampToValueAtTime(.0005, t + .3);
  o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + .32);
}

// ---------- one-shot sfx ----------
const sfx = {
  moo({ dest } = {}) { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(150, t + .4); o.frequency.linearRampToValueAtTime(95, t + 1.1); f.type = 'lowpass'; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(900, t + .4); f.frequency.linearRampToValueAtTime(400, t + 1.1); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .15); g.gain.setValueAtTime(.12, t + .8); g.gain.linearRampToValueAtTime(0, t + 1.2); o.connect(f); f.connect(g); g.connect(dest || sfxBus); o.start(t); o.stop(t + 1.25); },
  thunder({ dist = 1 } = {}) { const n = ac.createBufferSource(); n.buffer = noiseBuffer(3, 'brown'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'lowpass'; f.frequency.setValueAtTime(400 / dist, t); f.frequency.exponentialRampToValueAtTime(60, t + 2.8); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9 / dist, t + .15); g.gain.exponentialRampToValueAtTime(.3 / dist, t + 1); g.gain.linearRampToValueAtTime(.5 / dist, t + 1.4); g.gain.exponentialRampToValueAtTime(.001, t + 3); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  sizzle({ dur = 2 } = {}) { const n = ac.createBufferSource(); n.buffer = noiseBuffer(dur + .2, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'highpass'; f.frequency.value = 3000; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .1); g.gain.setValueAtTime(.18, t + dur - .3); g.gain.linearRampToValueAtTime(0, t + dur); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  pound({ reps = 5 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(60, t + .1); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .16); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .18); const n = ac.createBufferSource(); n.buffer = noiseBuffer(.06, 'white'); const ng = ac.createGain(); ng.gain.setValueAtTime(.12, t); ng.gain.exponentialRampToValueAtTime(.001, t + .05); n.connect(ng); ng.connect(sfxBus); n.start(t); }, i * 700); },
  scrape({ reps = 6 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.25, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.setValueAtTime(1200, t); f.frequency.linearRampToValueAtTime(2600, t + .2); f.Q.value = 3; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .06); g.gain.linearRampToValueAtTime(0, t + .24); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); }, i * 300); },
  busHorn() { const t = ac.currentTime; for (const fr of [392, 494]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = fr; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .05); g.gain.setValueAtTime(.06, t + .5); g.gain.linearRampToValueAtTime(0, t + .6); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .65); } const n = ac.createBufferSource(); n.buffer = noiseBuffer(4, 'brown'); const ng = ac.createGain(), nf = ac.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 300; ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(.5, t + 1.2); ng.gain.linearRampToValueAtTime(0, t + 4); n.connect(nf); nf.connect(ng); ng.connect(sfxBus); n.start(t); },
  cycleBell() { for (let i = 0; i < 2; i++) setTimeout(() => { const t = ac.currentTime; for (const [fr, a] of [[2200, .08], [3300, .04]]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = fr; g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .4); } }, i * 180); },
  duff() { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(62, t + .14); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .26); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .3); const n = ac.createBufferSource(); n.buffer = noiseBuffer(.12, 'white'); const f = ac.createBiquadFilter(), ng = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 700; ng.gain.setValueAtTime(.25, t); ng.gain.exponentialRampToValueAtTime(.001, t + .1); n.connect(f); f.connect(ng); ng.connect(sfxBus); n.start(t); },
  clap() { const t = ac.currentTime, n = ac.createBufferSource(); n.buffer = noiseBuffer(.08, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = .8; g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .07); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  elathalam() { const t = ac.currentTime, n = ac.createBufferSource(); n.buffer = noiseBuffer(.5, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 6; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .45); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); const o = ac.createOscillator(), og = ac.createGain(); o.type = 'triangle'; o.frequency.value = 1240; og.gain.setValueAtTime(.06, t); og.gain.exponentialRampToValueAtTime(.001, t + .4); o.connect(og); og.connect(sfxBus); o.start(t); o.stop(t + .42); },
  coin() { for (let i = 0; i < 3; i++) setTimeout(() => plink(sfxBus, 2600 + i * 300, .05), i * 70); },
  firework() { const t = ac.currentTime; const n = ac.createBufferSource(); n.buffer = noiseBuffer(1.2, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(200, t + 1); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.1); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); for (let i = 0; i < 8; i++) setTimeout(() => plink(sfxBus, 1500 + Math.random() * 2500, .04), 200 + Math.random() * 600); },
  conch() { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(330, t + .5); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; lfo(5, 4, o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.setValueAtTime(.12, t + 2); g.gain.linearRampToValueAtTime(0, t + 2.8); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 3); },
  slurp() { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.4, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.setValueAtTime(800, t); f.frequency.linearRampToValueAtTime(2000, t + .3); f.Q.value = 4; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .1); g.gain.linearRampToValueAtTime(0, t + .4); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  steps({ reps = 4 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.08, 'brown'); const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); n.connect(g); g.connect(sfxBus); n.start(t); }, i * 420); },
  eggs() { plink(sfxBus, 900, .06); setTimeout(() => plink(sfxBus, 1100, .05), 120); },
  paddle() { for (let i = 0; i < 3; i++) setTimeout(() => sfx.splash(), i * 900); },
  churchBell() { const t = ac.currentTime, parts = [[1, 1], [2, .6], [3, .35], [4.2, .18]], base = 440; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3500; f.connect(sfxBus); parts.forEach(([r, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = base * r; g.gain.setValueAtTime(a * .14, t); g.gain.exponentialRampToValueAtTime(.0005, t + 2.8 / Math.sqrt(r)); o.connect(g); g.connect(f); o.start(t); o.stop(t + 3); }); },
  schoolBell({ reps = 6 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const t = ac.currentTime; for (const [fr, a] of [[1900, .12], [2900, .06], [4100, .03]]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = fr; g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .3); } }, i * 230); },
  whistle({ dist = 1 } = {}) { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'square'; o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(660, t + .3); o.frequency.linearRampToValueAtTime(600, t + 1.4); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2000 / dist; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09 / dist, t + .08); g.gain.setValueAtTime(.09 / dist, t + 1.1); g.gain.linearRampToValueAtTime(0, t + 1.5); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1.55); const o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'square'; o2.frequency.value = 830; g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.05, t + .1); g2.gain.linearRampToValueAtTime(0, t + 1.4); o2.connect(f); o2.connect(g2); g2.connect(sfxBus); o2.start(t); o2.stop(t + 1.5); },
  bangles() { for (let i = 0; i < 7; i++) setTimeout(() => plink(sfxBus, 3200 + Math.random() * 1800, .04), i * 60 + Math.random() * 40); },
  slate() { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.3, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.setValueAtTime(5000, t); f.Q.value = 4; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .05); g.gain.linearRampToValueAtTime(0, t + .3); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  scissors({ reps = 5 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => plink(sfxBus, 4200, .05), i * 180); },
  sewing({ reps = 10 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'square'; o.frequency.value = 180; g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .05); }, i * 90); },
  cracker() { const t = ac.currentTime; for (let i = 0; i < 5; i++) setTimeout(() => { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.08, 'white'); const g = ac.createGain(), tt = ac.currentTime; g.gain.setValueAtTime(.35, tt); g.gain.exponentialRampToValueAtTime(.001, tt + .07); n.connect(g); g.connect(sfxBus); n.start(tt); }, i * 70 + Math.random() * 60); },
  drumroll() { for (let i = 0; i < 16; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(80, t + .1); g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .14); }, i * 110); },
  tap() { // soft wooden tok
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(180, t + .07);
    g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .09);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .1);
  },
  bell({ dist = 1 } = {}) { // temple bell: inharmonic partials
    const t = ac.currentTime, parts = [[1, 1], [2.76, .5], [5.4, .25], [8.9, .12]], base = 330;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 4000 / dist; f.connect(sfxBus);
    parts.forEach(([r, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = base * r; g.gain.setValueAtTime(a * .18 / dist, t); g.gain.exponentialRampToValueAtTime(.0005, t + 3.5 / Math.sqrt(r)); o.connect(g); g.connect(f); o.start(t); o.stop(t + 4); });
  },
  match() { // strike + flare
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(.4, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    f.type = 'bandpass'; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(600, t + .35); f.Q.value = 1;
    g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.08, t + .1); g.gain.exponentialRampToValueAtTime(.001, t + .4);
    n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t);
  },
  pour() { // water/kaapi pouring
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(1.2, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    f.type = 'bandpass'; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1800, t + 1); f.Q.value = 2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2, t + .15); g.gain.setValueAtTime(.2, t + .8); g.gain.linearRampToValueAtTime(0, t + 1.1);
    n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t);
    for (let i = 0; i < 8; i++) setTimeout(() => plink(sfxBus, 1200 + Math.random() * 1500, .05), 100 + i * 110);
  },
  splash() { for (let i = 0; i < 6; i++) setTimeout(() => plink(sfxBus, 700 + Math.random() * 900, .07), i * 40); const n = ac.createBufferSource(); n.buffer = noiseBuffer(.3, 'white'); const g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; f.type = 'highpass'; f.frequency.value = 1200; g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  creak({ reps = 4 } = {}) { // pulley creak
    for (let i = 0; i < reps; i++) setTimeout(() => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sawtooth';
      o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(190, t + .18); o.frequency.linearRampToValueAtTime(120, t + .32);
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .05); g.gain.linearRampToValueAtTime(0, t + .34);
      o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .36);
    }, i * 420);
  },
  grind({ reps = 5 } = {}) { // stone on stone
    for (let i = 0; i < reps; i++) setTimeout(() => {
      const n = ac.createBufferSource(); n.buffer = noiseBuffer(.5, 'brown'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
      f.type = 'lowpass'; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1400, t + .2); f.frequency.linearRampToValueAtTime(400, t + .45);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .12); g.gain.linearRampToValueAtTime(0, t + .48);
      n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t);
    }, i * 520);
  },
  wood() { // log placed
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(70, t + .12);
    g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .2);
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(.1, 'white'); const ng = ac.createGain(); ng.gain.setValueAtTime(.1, t); ng.gain.exponentialRampToValueAtTime(.001, t + .08); n.connect(ng); ng.connect(sfxBus); n.start(t);
  },
  page() { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.25, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.value = 4000; f.Q.value = .8; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .08); g.gain.linearRampToValueAtTime(0, t + .25); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); },
  sweep({ reps = 4 } = {}) { for (let i = 0; i < reps; i++) setTimeout(() => { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.35, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .7; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .12); g.gain.linearRampToValueAtTime(0, t + .34); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); }, i * 380); },
  radioOn() { const n = ac.createBufferSource(); n.buffer = noiseBuffer(.5, 'white'); const f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; f.type = 'bandpass'; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3000, t + .4); f.Q.value = 6; g.gain.setValueAtTime(.15, t); g.gain.linearRampToValueAtTime(0, t + .5); n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t); sfx.tap(); },
  chime() { [523, 659, 784].forEach((f, i) => setTimeout(() => plink(sfxBus, f, .08), i * 90)); },
  // harmonium reed: two detuned reeds through a dull filter, bellows breath under it. The dead reed only wheezes.
  reed({ fr = 262, dur = .9, dead = false } = {}) {
    const t = ac.currentTime, g = ac.createGain(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; f.Q.value = .6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(dead ? .05 : .13, t + .12); g.gain.setValueAtTime(dead ? .04 : .11, t + dur - .15); g.gain.linearRampToValueAtTime(0, t + dur + .08); f.connect(g); g.connect(sfxBus);
    if (!dead) for (const det of [1, 1.004, .5]) { const o = ac.createOscillator(); o.type = det === .5 ? 'triangle' : 'sawtooth'; o.frequency.value = fr * det; const og = ac.createGain(); og.gain.value = det === .5 ? .5 : .35; o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + .1); }
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(dur + .2, 'brown'); const nf = ac.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = dead ? 500 : 300; nf.Q.value = 1; const ng = ac.createGain(); ng.gain.value = dead ? .9 : .25; n.connect(nf); nf.connect(ng); ng.connect(f); n.start(t); n.stop(t + dur + .2);
  },
  // the haul: twenty men taking the strain on a rope, a low shout and the rope creaking
  heave() {
    const t = ac.currentTime; for (let k = 0; k < 5; k++) { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'sawtooth'; const base = 110 + k * 9; o.frequency.setValueAtTime(base * .9, t); o.frequency.linearRampToValueAtTime(base * 1.1, t + .25); o.frequency.linearRampToValueAtTime(base * .85, t + .55); f.type = 'lowpass'; f.frequency.value = 700; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .08 + k * .02); g.gain.linearRampToValueAtTime(0, t + .6); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .65); }
    const n = ac.createBufferSource(); n.buffer = noiseBuffer(.5, 'brown'); const nf = ac.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 400; nf.Q.value = 2; const ng = ac.createGain(); ng.gain.setValueAtTime(.3, t); ng.gain.exponentialRampToValueAtTime(.001, t + .4); n.connect(nf); nf.connect(ng); ng.connect(sfxBus); n.start(t);
  },
  // the conductor's tin whistle: two short blasts, kept dull for phone speakers
  conductor() { for (let i = 0; i < 2; i++) setTimeout(() => { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; o.type = 'square'; o.frequency.value = 1150; f.type = 'lowpass'; f.frequency.value = 1600; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .02); g.gain.setValueAtTime(.05, t + .16); g.gain.linearRampToValueAtTime(0, t + .22); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .25); }, i * 300); },
  // a call across the water: a cupped-hand shout, mostly vowel
  call() { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), t = ac.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.linearRampToValueAtTime(260, t + .3); o.frequency.linearRampToValueAtTime(200, t + .9); f.type = 'bandpass'; f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(900, t + .4); f.frequency.linearRampToValueAtTime(500, t + .9); f.Q.value = 1.2; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .1); g.gain.setValueAtTime(.1, t + .7); g.gain.linearRampToValueAtTime(0, t + 1); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1.05); },
  // the bang: a single unhurried voice from the minaret, a melisma over a hijaz-like scale, formants over a low sawtooth, kept dull for the speaker
  azan() {
    const t0 = ac.currentTime, base = 196, scale = [0, 1, 4, 5, 7, 8, 11, 12], out = ac.createGain(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), lp = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 650; f1.Q.value = 4; f2.type = 'bandpass'; f2.frequency.value = 1100; f2.Q.value = 5; lp.type = 'lowpass'; lp.frequency.value = 2200; out.gain.value = .11; f1.connect(lp); f2.connect(lp); lp.connect(out); out.connect(sfxBus);
    const phrases = [[0, 4, 5, 4, 0], [7, 8, 7, 5, 4], [0, 4, 7, 8, 7, 5, 4, 0], [4, 5, 7, 5, 4, 1, 0]]; let t = t0 + .3;
    for (const ph of phrases) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5; vg.gain.value = 1.5; v.connect(vg); vg.connect(o.frequency); v.start(t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .25); let tt = t; o.frequency.setValueAtTime(base * Math.pow(2, scale[ph[0]] / 12), tt);
      for (let i = 0; i < ph.length; i++) { const dur = i === ph.length - 1 ? 1.6 : .45 + (i % 2) * .25; o.frequency.linearRampToValueAtTime(base * Math.pow(2, scale[ph[i]] / 12), tt + .12); tt += dur; }
      g.gain.setValueAtTime(1, tt - .3); g.gain.linearRampToValueAtTime(0, tt + .2); o.connect(g); g.connect(f1); g.connect(f2); o.start(t); o.stop(tt + .3); v.stop(tt + .3); t = tt + .9; }
  },
  // carrom: striker on board, coin click, pocket drop
  strike() { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(300, t + .05); g.gain.setValueAtTime(.2, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .1); const n = ac.createBufferSource(); n.buffer = noiseBuffer(.05, 'white'); const nf = ac.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 2500; const ng = ac.createGain(); ng.gain.setValueAtTime(.15, t); ng.gain.exponentialRampToValueAtTime(.001, t + .04); n.connect(nf); nf.connect(ng); ng.connect(sfxBus); n.start(t); },
  pocket() { const t = ac.currentTime; for (let i = 0; i < 3; i++) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(420 - i * 60, t + i * .07); o.frequency.exponentialRampToValueAtTime(180, t + i * .07 + .08); g.gain.setValueAtTime(0, t + i * .07); g.gain.linearRampToValueAtTime(.12, t + i * .07 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .07 + .12); o.connect(g); g.connect(sfxBus); o.start(t + i * .07); o.stop(t + i * .07 + .15); } },
  swing() { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(130, t + .6); o.frequency.linearRampToValueAtTime(90, t + 1.2); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.2); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1.25); }
};
