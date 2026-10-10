import { makeLayer } from '../engine/canvas.js';
import { Particles } from '../engine/particles.js';
import { drawSky, applyLighting } from '../art/sky.js';
import { circle, text, FONT } from '../art/draw.js';
import { person } from '../art/lib.js';
import { audio } from '../engine/audio.js';
import { state } from './state.js';
import { clock } from './clock.js';
import { visitors, meet } from './visitors.js';
import { haptics } from '../engine/haptics.js';
import { crowBird } from '../art/lib.js';
import { fireflies } from '../engine/particles.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { drawSurprise, tickSurprise } from './surprises.js';
import { ui } from '../i18n/t.js';
import { guide, point, unpoint, seen } from '../ui/guide.js';
import { VERB_HINTS } from './guidetasks.js';
import { perfHotspots, drawPerformances } from './performances.js';
export const DESIGN_W = 430;
export class Scene {
  constructor(name, title, titleML) {
    this.name = name; this.title = title; this.titleML = titleML;
    this.hotspots = []; this.exits = []; this.ps = new Particles(); this.t = 0; this.idle = 0;
    this.cache = null; this.cacheW = 0; this.outdoor = true; this.horizon = 300; this.ox = 0;
    this.busy = false; this.ground = '#8fb05a';
  }
  enter() { this.idle = 0; if (!this._perf) { this._perf = true; this.hotspots.push(...perfHotspots(this)); } state.stats.scenes[this.name] = (state.stats.scenes[this.name] || 0) + 1; tickSurprise(this.name);
    // the first time a hands-on thing is in reach, the hand shows how (once per thing)
    if (state.hints !== false) setTimeout(() => { if (guide.target) return; for (const hs of this.hotspots) { const vh = VERB_HINTS[hs.label]; if (!vh || (hs.enabled && !hs.enabled())) continue; if (!state.seenVerb || !state.seenVerb[hs.label]) { point({ scene: this.name, label: hs.label, text: vh.text, ml: vh.ml, gesture: vh.gesture || 'tap' }); return; } } }, 1400); }
  leave() { }
  update(dt) {
    this.t += dt; this.idle += dt; if (ui.motion) this.ps.update(dt); else this.ps.list.length = 0; this.tick && this.tick(dt); this.surT = (this.surT || 0) + dt; if (this.surT > 5) { this.surT = 0; tickSurprise(this.name); }
    if (this.outdoor && ui.motion) {
      // a line of crows crossing now and then by day
      this.flockT = (this.flockT === undefined ? 12 : this.flockT) - dt;
      if (this.flockT <= 0 && clock.daylight > .3 && state.rainT < .3) { this.flockT = 35 + Math.random() * 50; this.flock = { x: -60, y: 60 + Math.random() * 120, n: 3 + (Math.random() * 5 | 0), dir: Math.random() < .5 ? 1 : -1, t: 0 }; if (this.flock.dir < 0) this.flock.x = 500; }
      if (this.flock) { this.flock.x += this.flock.dir * dt * 55; this.flock.t += dt; if (this.flock.x < -120 || this.flock.x > 600) this.flock = null; }
      // fireflies in the gardens at night
      if (this.fireflies && clock.phase === 'rathri' && state.rainT < .2) { this.ffT = (this.ffT || 0) + dt; if (this.ffT > .5) { this.ffT = 0; const b = this.fireflies; fireflies(this.ps, b[0], b[1], b[2], b[3], 1); } }
    }
  }
  ambience() { return {}; }
  visitorSpot(w) { return { x: w - 56, y: 606 }; }
  draw(c, w, h) {
    this.ox = Math.max(0, (w - DESIGN_W) / 2); const dw = Math.min(w, DESIGN_W);
    if (this.ox > 0) { // wide screens: a warm woven mount either side of the scene, with a brass hairline at the edges
      c.fillStyle = '#241a12'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,220,170,.035)'; for (let yy = 0; yy < h; yy += 6) c.fillRect(0, yy, w, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(this.ox - 14, 0, 14, h); c.fillRect(this.ox + dw, 0, 14, h); c.fillStyle = '#8a6a3a'; c.fillRect(this.ox - 1, 0, 1, h); c.fillRect(this.ox + dw, 0, 1, h); }
    c.save(); c.translate(this.ox, 0);
    if (this.ox > 0) { c.beginPath(); c.rect(0, 0, dw, h); c.clip(); }
    if (this.outdoor) { drawSky(c, dw, 0, this.horizon, state.rainT); c.fillStyle = this.ground; c.fillRect(0, this.horizon - 1, dw, h - this.horizon + 1); }
    if (!this.cache || this.cacheW !== dw) { this.cache = makeLayer(dw, h); this.cacheW = dw; this.drawStatic(this.cache.x, dw, h); }
    c.drawImage(this.cache.c, 0, 0, dw, h);
    if (this.flock) { for (let i = 0; i < this.flock.n; i++) crowBird(c, this.flock.x - i * 18 * this.flock.dir, this.flock.y + Math.sin(i * 1.3) * 6 + Math.sin(this.t * 2 + i) * 2, .7, this.t + i * .4, true); }
    this.drawDynamic(c, dw, h);
    drawPerformances(this, c, this.t);
    drawSurprise(this, c, this.t);
    this.drawVisitor(c, dw);
    this.ps.draw(c);
    if (this.outdoor && state.rainT > 0.02) this.drawRain(c, dw, h, state.rainT);
    applyLighting(c, dw, h, this.outdoor ? state.rainT : state.rainT * .4, this.glows ? this.glows() : null);
    if (state.flash > 0 && this.outdoor) { c.fillStyle = `rgba(230,235,255,${state.flash * .7})`; c.fillRect(0, 0, dw, h); }
    if (!this.noUI) { this.drawHotspots(c); this.drawExits(c, dw, h); }
    c.restore();
  }
  drawRain(c, w, h, k) {
    const t = this.t * 900, n = Math.floor(110 * k);
    c.strokeStyle = 'rgba(220,235,245,0.33)'; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i < n; i++) { const seed = i * 37.3, x = ((seed * 7.1 + t * (1 + (i % 3) * .2) * .18) % (w + 40)) - 20, y = ((seed * 13.7 + t * (1.3 + (i % 5) * .15)) % (h + 60)) - 30; c.moveTo(x, y); c.lineTo(x - 3, y + 16); }
    c.stroke();
  }
  drawVisitor(c, w) {
    const v = visitors.active; if (!v || v.scene !== this.name) return;
    const sp = this.visitorSpot(w), k = Math.min(1, (clock.minutes - v.arrived) / 2);
    c.save(); c.globalAlpha = k; person(c, sp.x, sp.y, 1, { ...v.opts, pose: v.opts.pose || 'stand', flip: true }, this.t);
    if (!v.met) { const a = .5 + .3 * Math.sin(this.t * 3); c.globalAlpha = a; c.strokeStyle = '#fff6e0'; c.lineWidth = 1.2; c.beginPath(); c.arc(sp.x, sp.y - 40, 12, 0, 7); c.stroke(); }
    c.restore();
  }
  drawHotspots(c) {
    const a = Math.min(1, Math.max(0, (this.idle - (state.hints ? 1.2 : 6)) * .8)) * (state.hints ? .9 : .45);
    if (a <= 0 || this.busy) return;
    const la = Math.min(1, Math.max(0, (this.idle - 5) * .6));
    for (const hs of this.hotspots) {
      if (hs.enabled && !hs.enabled()) continue;
      if (hs.hint && !hs.hint()) continue; // tappable, but not inviting right now (a lamp in daylight)
      if (hs.due && hs.due()) { c.save(); c.globalAlpha = .5 + .3 * Math.sin(this.t * 3); c.strokeStyle = '#fff6e0'; c.lineWidth = 1.2; c.beginPath(); c.arc(hs.x, hs.y - 34, 12, 0, 7); c.stroke(); circle(c, hs.x - 3, hs.y - 36, 1.4, '#fff6e0'); circle(c, hs.x + 3, hs.y - 36, 1.4, '#fff6e0'); c.restore(); }
      const pulse = 1 + .1 * Math.sin(this.t * 2.4 + hs.x);
      c.save(); c.globalAlpha = a * (.55 + .25 * Math.sin(this.t * 2.4 + hs.x));
      c.strokeStyle = '#fff6e0'; c.lineWidth = 1.2; c.beginPath(); c.arc(hs.x, hs.y, 11 * pulse, 0, 7); c.stroke();
      c.globalAlpha = a * .9; circle(c, hs.x, hs.y, 2.2, '#fff6e0');
      if (la > 0 && hs.label) { c.globalAlpha = la * .85; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 4; const lb = t(hs.label), ml = lb !== hs.label; text(c, lb, hs.x, hs.y + 24, 10.5, '#fff6e0', 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic'); }
      c.restore();
    }
  }
  exitPos(ex, w, h) { return { x: ex.x !== undefined ? ex.x : (ex.side === 'left' ? 22 : ex.side === 'right' ? w - 22 : w / 2), y: ex.y !== undefined ? ex.y : (ex.side === 'bottom' ? h - 64 : 420) }; }
  drawExits(c, w, h) {
    const a = .4 + Math.min(1, Math.max(0, (this.idle - 1.6) * .8)) * .5; if (this.busy) return;
    for (const ex of this.exits) {
      const bob = Math.sin(this.t * 1.8) * 2, { x, y } = this.exitPos(ex, w, h);
      c.save(); c.globalAlpha = a; c.strokeStyle = '#fff6e0'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
      if (ex.side === 'left') { c.moveTo(x + 4 + bob, y - 6); c.lineTo(x - 2 + bob, y); c.lineTo(x + 4 + bob, y + 6); }
      else if (ex.side === 'right') { c.moveTo(x - 4 - bob, y - 6); c.lineTo(x + 2 - bob, y); c.lineTo(x - 4 - bob, y + 6); }
      else if (ex.side === 'bottom') { c.moveTo(x - 6, y - 4 + bob); c.lineTo(x, y + 2 + bob); c.lineTo(x + 6, y - 4 + bob); }
      else { c.moveTo(x - 6, y + 4 - bob); c.lineTo(x, y - 2 - bob); c.lineTo(x + 6, y + 4 - bob); }
      c.stroke(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 4;
      const lx = ex.side === 'left' ? x + 14 : ex.side === 'right' ? x - 14 : x, ly = ex.side === 'bottom' ? y - 16 : y + 16;
      const lb = t(ex.label), ml = lb !== ex.label; text(c, lb, lx, ly, 11, '#fff6e0', ex.side === 'left' ? 'left' : ex.side === 'right' ? 'right' : 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic');
      c.restore();
    }
  }
  // hands-on verbs: a hotspot with drag(p) returns { move(p), end(p) } and is driven by the finger instead of a tap
  down(p0, w0) {
    if (this.busy || this.gesture) return false;
    const p = { x: p0.x - this.ox, y: p0.y };
    for (const hs of this.hotspots) { if (!hs.drag || (hs.enabled && !hs.enabled())) continue; if (Math.hypot(p.x - hs.x, p.y - hs.y) < (hs.r || 30)) { const g = hs.drag(p); if (g) { this.gesture = g; this.idle = 0; unpoint(hs.label); seen(hs.label); return true; } } }
    return false;
  }
  move(p0) { if (this.gesture && this.gesture.move) this.gesture.move({ x: p0.x - this.ox, y: p0.y }); }
  up(p0) { if (!this.gesture) return false; const g = this.gesture; this.gesture = null; this.gestureEnd = performance.now(); g.end && g.end({ x: p0.x - this.ox, y: p0.y }); return true; }
  tap(p0, w0, h) {
    if (this.busy) return true;
    if (performance.now() - (this.gestureEnd || 0) < 120) return true; // the finger just finished a gesture
    const p = { x: p0.x - this.ox, y: p0.y }, w = Math.min(w0, DESIGN_W);
    this.idle = 0;
    const v = visitors.active; if (v && v.scene === this.name && !v.met) { const sp = this.visitorSpot(w); if (Math.hypot(p.x - sp.x, p.y - (sp.y - 36)) < 44) { meet(); return true; } }
    for (const ex of this.exits) { const { x, y } = this.exitPos(ex, w, h); if (Math.hypot(p.x - x, p.y - y) < 34) { audio.sfx('tap'); haptics.light(); ex.go(); return true; } }
    let best = null, bd = 1e9;
    for (const hs of this.hotspots) { if (hs.enabled && !hs.enabled()) continue; const d = Math.hypot(p.x - hs.x, p.y - hs.y); if (d < (hs.r || 30) && d < bd) { bd = d; best = hs; } }
    if (best) { audio.sfx('tap'); haptics.light(); unpoint(best.label); seen(best.label); best.action(); return true; }
    if (this.tapFree) return this.tapFree(p, w, h);
    return false;
  }
  invalidate() { this.cache = null; }
}
