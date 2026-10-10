// The art forms and festival set-pieces of the village, each in its own place on its own day: Kathakali and Ottamthullal at the utsavam, the kudamattom
// parasols on the elephants, Pulikali at the kavala on the fourth Onam, Kummattikali and the Onappottan at the gate, Vidyarambham at the school on
// Vijayadashami, Margamkali at the pally at Christmas, Duffmuttu at the masjid on perunnal, the Theyyam's blessing, sparklers at Vishu, a paper star.
// Each one is drawn here, heard here, has one thing you can do with your hands, and leaves a line in the diary.
import { P } from '../art/palette.js';
import { poly, ellipse, circle, rect, glow, line, shadow, text } from '../art/draw.js';
import { person } from '../art/lib.js';
import { state, remember } from './state.js';
import { clock } from './clock.js';
import { fest } from './festivals.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { delay } from '../engine/tween.js';
import { haptics } from '../engine/haptics.js';
import { pick, FONT_ML } from '../i18n/t.js';
import { did } from './tasks.js';
const h = () => clock.hour;
const yr = () => clock.mode === 'real' ? new Date().getFullYear() : clock.year || 0;
const F = () => state.festival;
// ------------------------------------------------------------------------------------------------ figures
function kireedam(c, x, y, s, t) { // the round crown: gold disc behind the head, beaded rim, the peaked front
  c.save(); c.translate(x, y); circle(c, 0, 0, 20 * s, '#a8761a'); circle(c, 0, 0, 17 * s, '#e6b848'); circle(c, 0, 0, 13 * s, '#efe4cf'); circle(c, 0, 0, 10 * s, '#b8241e'); circle(c, 0, 0, 7 * s, '#2f6b35'); circle(c, 0, 0, 4 * s, '#e6b848');
  for (let i = 0; i < 16; i++) { const a = Math.PI + i * (Math.PI / 15); circle(c, Math.cos(a) * 19.5 * s, Math.sin(a) * 19.5 * s, 1.6 * s, '#b8241e'); }
  poly(c, [[-5 * s, 2 * s], [5 * s, 2 * s], [0, -24 * s]], '#e6b848'); poly(c, [[-2.5 * s, 2 * s], [2.5 * s, 2 * s], [0, -18 * s]], '#b8241e'); c.restore();
}
function pachaFace(c, x, y, s, kathi) { // green face in its white chutti, the eyes drawn long
  c.save(); c.translate(x, y); poly(c, [[-11 * s, -6 * s], [11 * s, -6 * s], [9 * s, 8 * s], [0, 14 * s], [-9 * s, 8 * s]], '#f3ecd8'); ellipse(c, 0, 0, 7.5 * s, 9 * s, kathi ? '#3f9a4b' : '#3c9a47');
  rect(c, -7 * s, 4 * s, 14 * s, 3 * s, '#f3ecd8'); c.fillStyle = '#140b0a'; c.fillRect(-6 * s, -2 * s, 4.5 * s, 1.3 * s); c.fillRect(1.5 * s, -2 * s, 4.5 * s, 1.3 * s); circle(c, 0, 3 * s, 1.1 * s, '#f3ecd8'); rect(c, -2.5 * s, 6 * s, 5 * s, 1.2 * s, '#b8241e');
  if (kathi) { circle(c, 0, 1 * s, 1.3 * s, '#f3ecd8'); rect(c, -4 * s, 0, 8 * s, 1 * s, '#b8241e'); } c.restore();
}
export function kathakali(c, x, y, s, t, kind = 'pacha') { // a full figure: the great white skirt, red jacket, arms in mudra, the crown
  c.save(); c.translate(x, y); const sway = Math.sin(t * 1.6) * 3 * s, bob = Math.abs(Math.sin(t * 3.2)) * -2 * s; c.translate(sway, bob); shadow(c, 0, 4 * s, 40 * s, 8 * s, .4);
  // uduthukettu: the wide pleated skirt
  c.fillStyle = '#f3ecd8'; c.beginPath(); c.moveTo(-14 * s, -44 * s); c.quadraticCurveTo(-46 * s, -20 * s, -40 * s, 0); c.lineTo(40 * s, 0); c.quadraticCurveTo(46 * s, -20 * s, 14 * s, -44 * s); c.closePath(); c.fill();
  for (let i = 0; i < 9; i++) { const u = -36 + i * 9; line(c, u * s * .6, -36 * s, u * s, -2 * s, 'rgba(90,60,30,.14)', 1.2); } rect(c, -40 * s, -8 * s, 80 * s, 3 * s, '#b8241e'); rect(c, -39 * s, -4 * s, 78 * s, 2 * s, '#e6b848'); rect(c, -42 * s, -14 * s, 84 * s, 2 * s, '#b8241e');
  // jacket and the hanging ornaments
  poly(c, [[-13 * s, -74 * s], [13 * s, -74 * s], [15 * s, -44 * s], [-15 * s, -44 * s]], '#c3271d'); for (let i = 0; i < 3; i++) rect(c, -9 * s + i * 7 * s, -68 * s, 4 * s, 24 * s, i === 1 ? '#e6b848' : '#f3ecd8'); rect(c, -14 * s, -50 * s, 28 * s, 3 * s, '#e6b848');
  // arms up in a mudra, bangles
  const a1 = Math.sin(t * 1.6) * .25; c.strokeStyle = '#c3271d'; c.lineWidth = 6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12 * s, -70 * s); c.lineTo(-30 * s, -86 * s - a1 * 20 * s); c.moveTo(12 * s, -70 * s); c.lineTo(30 * s, -84 * s + a1 * 20 * s); c.stroke();
  c.strokeStyle = '#3c9a47'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-30 * s, -86 * s - a1 * 20 * s); c.lineTo(-36 * s, -98 * s - a1 * 20 * s); c.moveTo(30 * s, -84 * s + a1 * 20 * s); c.lineTo(38 * s, -94 * s + a1 * 20 * s); c.stroke(); circle(c, -30 * s, -86 * s - a1 * 20 * s, 3 * s, '#e6b848'); circle(c, 30 * s, -84 * s + a1 * 20 * s, 3 * s, '#e6b848');
  // head
  kireedam(c, 0, -98 * s, s, t); pachaFace(c, 0, -84 * s, s, kind === 'kathi'); circle(c, -12 * s, -82 * s, 4 * s, '#f3ecd8'); circle(c, 12 * s, -82 * s, 4 * s, '#f3ecd8'); c.restore();
}
function chendaPlayer(c, x, y, s, t, flip) { person(c, x, y, s, { sex: 'm', bare: true, mundu: '#f3ecd8', flip }, 0); c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); rect(c, -4 * s, -46 * s, 22 * s, 14 * s, '#8a5a2a'); ellipse(c, 18 * s, -39 * s, 3 * s, 7 * s, '#e8dcc0'); ellipse(c, -4 * s, -39 * s, 3 * s, 7 * s, '#e8dcc0'); const k = Math.sin(t * 9) * 6 * s; line(c, 6 * s, -56 * s, 14 * s, -44 * s - k, '#d9c7a0', 1.6); line(c, 10 * s, -54 * s, 18 * s, -46 * s + k, '#d9c7a0', 1.6); c.restore(); }
function kalivilakku(c, x, y, s, t, k = 1) { // the big brass lamp at the front of the stage, lit wicks facing the dancer and the audience
  ellipse(c, x, y, 16 * s, 5 * s, P.brassDk); rect(c, x - 3 * s, y - 26 * s, 6 * s, 26 * s, P.brass); ellipse(c, x, y - 26 * s, 18 * s, 6 * s, P.brassDk); ellipse(c, x, y - 28 * s, 18 * s, 6 * s, P.brass); ellipse(c, x, y - 29 * s, 13 * s, 3.5 * s, '#5a3a10');
  for (const dx of [-14, -7, 0, 7, 14]) { const fl = 1 + Math.sin(t * 11 + dx) * .18; c.fillStyle = P.flameHi; c.beginPath(); c.moveTo(x + dx * s - 2 * s, y - 29 * s); c.quadraticCurveTo(x + dx * s - 2 * s, y - 36 * s * fl, x + dx * s, y - 40 * s * fl); c.quadraticCurveTo(x + dx * s + 2 * s, y - 36 * s * fl, x + dx * s + 2 * s, y - 29 * s); c.fill(); }
  glow(c, x, y - 34 * s, 70 * s * k, '#ffa040', .45 * k);
}
function thirassila(c, x, y, w, hh, drop) { // the hand-held curtain: red, black and white stripes, with two men behind it
  const top = y - hh * (1 - drop); if (drop >= 1) return; c.save(); c.beginPath(); c.rect(x - w / 2 - 20, top - 80, w + 40, hh * (1 - drop) + 80); c.clip();
  person(c, x - w / 2 + 6, y, .8, { sex: 'm', bare: true, mundu: '#f3ecd8', pose: 'carryHead' }, 0); person(c, x + w / 2 - 6, y, .8, { sex: 'm', bare: true, mundu: '#f3ecd8', pose: 'carryHead', flip: true }, 0); c.restore();
  const g = c.createLinearGradient(0, top, 0, y); g.addColorStop(0, '#c3271d'); g.addColorStop(.33, '#c3271d'); g.addColorStop(.34, '#1a1410'); g.addColorStop(.66, '#1a1410'); g.addColorStop(.67, '#efe4cf'); g.addColorStop(1, '#efe4cf'); c.fillStyle = g; c.fillRect(x - w / 2, top, w, hh * (1 - drop)); rect(c, x - w / 2, top, w, 3, '#e6b848');
}
export function puli(c, x, y, s, t, col = '#f2c230') { // Pulikali tiger: the painted belly, the mask, the dance
  c.save(); c.translate(x, y); const bob = Math.abs(Math.sin(t * 5)) * -4 * s, lean = Math.sin(t * 2.5) * .12; c.translate(0, bob); c.rotate(lean); shadow(c, 0, 4 * s, 22 * s, 6 * s, .35);
  rect(c, -8 * s, -12 * s, 6 * s, 12 * s, '#c84a1e'); rect(c, 2 * s, -12 * s, 6 * s, 12 * s, '#c84a1e'); // shorts
  ellipse(c, 0, -34 * s, 20 * s, 24 * s, col); c.strokeStyle = '#1a1410'; c.lineWidth = 2.6 * s; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const yy = -52 * s + i * 7 * s, hw = Math.sqrt(Math.max(0, 1 - Math.pow((yy + 34 * s) / (24 * s), 2))) * 20 * s; c.beginPath(); c.moveTo(-hw * .9, yy); c.quadraticCurveTo(-hw * .3, yy + 3 * s, 0, yy); c.quadraticCurveTo(hw * .3, yy - 3 * s, hw * .9, yy); c.stroke(); }
  c.lineWidth = 5 * s; c.strokeStyle = col; c.beginPath(); c.moveTo(-16 * s, -46 * s); c.lineTo(-30 * s, -62 * s + Math.sin(t * 5) * 8 * s); c.moveTo(16 * s, -46 * s); c.lineTo(30 * s, -62 * s - Math.sin(t * 5) * 8 * s); c.stroke(); c.strokeStyle = '#1a1410'; c.lineWidth = 1.6 * s; c.beginPath(); c.moveTo(-22 * s, -53 * s); c.lineTo(-25 * s, -57 * s); c.moveTo(22 * s, -53 * s); c.lineTo(25 * s, -57 * s); c.stroke();
  // mask
  circle(c, 0, -64 * s, 11 * s, col); circle(c, -8 * s, -72 * s, 4 * s, col); circle(c, 8 * s, -72 * s, 4 * s, col); circle(c, -8 * s, -72 * s, 2 * s, '#1a1410'); circle(c, 8 * s, -72 * s, 2 * s, '#1a1410');
  circle(c, -4 * s, -66 * s, 2.2 * s, '#fff'); circle(c, 4 * s, -66 * s, 2.2 * s, '#fff'); circle(c, -4 * s, -66 * s, 1.1 * s, '#1a1410'); circle(c, 4 * s, -66 * s, 1.1 * s, '#1a1410'); ellipse(c, 0, -59 * s, 5 * s, 3 * s, '#c3271d'); rect(c, -4 * s, -60 * s, 8 * s, 1.2 * s, '#fff'); for (const dx of [-1, 1]) { line(c, dx * 5 * s, -61 * s, dx * 14 * s, -63 * s, '#1a1410', 1); line(c, dx * 5 * s, -59 * s, dx * 14 * s, -58 * s, '#1a1410', 1); }
  c.restore();
}
export function kummatti(c, x, y, s, t) { // Kummattikali: a body of parppadaka grass and a painted wooden mask
  c.save(); c.translate(x, y); const bob = Math.abs(Math.sin(t * 4 + x)) * -3 * s; c.translate(0, bob); shadow(c, 0, 3 * s, 20 * s, 5 * s, .35);
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2, r = 16 * s + Math.sin(i * 3.1) * 3 * s; line(c, Math.cos(a) * 4 * s, -40 * s + Math.sin(a) * 6 * s, Math.cos(a) * r, -40 * s + 26 * s + Math.sin(i) * 6 * s, i % 3 ? '#6f8a3a' : '#9aa85a', 2 * s); }
  ellipse(c, 0, -40 * s, 15 * s, 20 * s, '#7d9a44'); for (let i = 0; i < 14; i++) line(c, -12 * s + i * 2 * s, -56 * s, -14 * s + i * 2.2 * s, -20 * s, i % 2 ? '#5e7a30' : '#a7b56a', 1.4 * s);
  // mask: round, red and yellow, big teeth
  circle(c, 0, -66 * s, 10 * s, '#c84a1e'); ellipse(c, 0, -62 * s, 7 * s, 4 * s, '#f2c230'); circle(c, -4 * s, -68 * s, 2.4 * s, '#fff'); circle(c, 4 * s, -68 * s, 2.4 * s, '#fff'); circle(c, -4 * s, -68 * s, 1.1 * s, '#000'); circle(c, 4 * s, -68 * s, 1.1 * s, '#000'); rect(c, -4 * s, -60 * s, 8 * s, 2 * s, '#fff'); for (let i = 0; i < 4; i++) rect(c, -4 * s + i * 2.2 * s, -60 * s, 1 * s, 2 * s, '#1a1410');
  poly(c, [[-10 * s, -72 * s], [10 * s, -72 * s], [0, -84 * s]], '#f2c230'); circle(c, 0, -80 * s, 2 * s, '#c84a1e'); c.restore();
}
export function onappottan(c, x, y, s, t) { // Onappottan: red face, the tall headgear, bells, and the palm-leaf umbrella held high; he does not speak
  c.save(); c.translate(x, y); shadow(c, 0, 3 * s, 16 * s, 5 * s, .35);
  poly(c, [[-9 * s, -34 * s], [9 * s, -34 * s], [12 * s, -2 * s], [-12 * s, -2 * s]], '#c3271d'); for (let i = 0; i < 4; i++) rect(c, -12 * s, -30 * s + i * 8 * s, 24 * s, 1.5 * s, '#e6b848');
  poly(c, [[-10 * s, -58 * s], [10 * s, -58 * s], [10 * s, -34 * s], [-10 * s, -34 * s]], '#c3271d'); for (let i = 0; i < 5; i++) circle(c, -8 * s + i * 4 * s, -44 * s, 1.5 * s, '#e6b848');
  c.strokeStyle = '#c3271d'; c.lineWidth = 4 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9 * s, -54 * s); c.lineTo(-14 * s, -38 * s); c.moveTo(9 * s, -54 * s); c.lineTo(14 * s, -72 * s); c.stroke(); circle(c, -14 * s, -36 * s, 3 * s, P.brass); // bell
  circle(c, 0, -66 * s, 8 * s, '#c84a1e'); c.fillStyle = '#1a1410'; c.fillRect(-4 * s, -68 * s, 2 * s, 2 * s); c.fillRect(2 * s, -68 * s, 2 * s, 2 * s); rect(c, -5 * s, -62 * s, 10 * s, 1.5 * s, '#1a1410'); ellipse(c, 0, -60 * s, 6 * s, 2.5 * s, '#1a1410'); // beard
  poly(c, [[-9 * s, -72 * s], [9 * s, -72 * s], [6 * s, -92 * s], [-6 * s, -92 * s]], '#c3271d'); for (let i = 0; i < 3; i++) rect(c, -8 * s + i * .5 * s, -76 * s - i * 6 * s, 16 * s - i * s, 1.6 * s, '#e6b848'); circle(c, 0, -94 * s, 3 * s, '#f2c230');
  // olakkuda
  c.fillStyle = '#c9b06a'; c.beginPath(); c.moveTo(14 * s, -72 * s); c.lineTo(14 * s, -104 * s); c.stroke(); c.beginPath(); c.arc(14 * s, -100 * s, 22 * s, Math.PI, 0); c.fill(); for (let i = 0; i < 9; i++) line(c, 14 * s, -100 * s, 14 * s + Math.cos(Math.PI + i * Math.PI / 8) * 22 * s, -100 * s + Math.sin(Math.PI + i * Math.PI / 8) * 22 * s, '#a08a4a', .8); line(c, 14 * s, -72 * s, 14 * s, -100 * s, '#6a4a20', 1.6);
  c.restore();
}
function parasol(c, x, y, s, col, t) { line(c, x, y, x, y - 30 * s, '#e6b848', 1.6); c.fillStyle = col; c.beginPath(); c.moveTo(x - 20 * s, y - 28 * s); c.quadraticCurveTo(x, y - 46 * s, x + 20 * s, y - 28 * s); c.closePath(); c.fill(); for (let i = 0; i < 8; i++) line(c, x - 18 * s + i * 5 * s, y - 28 * s, x - 18 * s + i * 5 * s + Math.sin(t * 3 + i) * 1.5, y - 22 * s, '#e6b848', 1); circle(c, x, y - 46 * s, 2 * s, '#e6b848'); }
function duff(c, x, y, s) { circle(c, x, y, 7 * s, '#8a5a2a'); circle(c, x, y, 5.6 * s, '#e8d9b8'); }
function paperStar(c, x, y, s, lit, t) { const g = .75 + Math.sin(t * 2) * .1; if (lit) glow(c, x, y, 36 * s, '#ffcc66', .5 * g); c.fillStyle = lit ? '#ffd27a' : '#d8a040'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 * s : 16 * s; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; line(c, x, y, x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s, 'rgba(160,80,20,.5)', 1); } for (let i = 0; i < 6; i++) line(c, x - 5 * s + i * 2 * s, y + 10 * s, x - 7 * s + i * 2.6 * s, y + 24 * s + Math.sin(t * 2 + i) * 1.5, lit ? '#ffd27a' : '#d8a040', 1); }
// ------------------------------------------------------------------------------------------------ when
const KATHAKALI = () => fest().utsavam && (h() >= 20.5 || h() < 1);
const THULLAL = () => fest().utsavam && h() >= 16 && h() < 18;
const KUDAMATTOM = () => fest().utsavamMain && h() >= 16 && h() < 20.5;
const PULIKALI = () => fest().pulikali && h() >= 15 && h() < 19;
const KUMMATTI = () => fest().onam && (fest().onamDay === 8 || fest().onamDay === 9) && h() >= 9.5 && h() < 12.5;
const POTTAN = () => fest().thiruvonam && h() >= 7 && h() < 11;
const VIDYARAMBHAM = () => fest().vijayadashami && h() >= 7.5 && h() < 11.5;
const MARGAM = () => fest().christmas && h() >= 19 && h() < 22;
const DUFF = () => (fest().eid || fest().bakrid) && h() >= 17 && h() < 21;
const THEYYAM = () => fest().theyyam && h() >= 19;
const VISHU_FIRE = () => (fest().vishuEve && h() >= 19) || (fest().vishu && h() < 8);
const STAR_STALL = () => fest().christmasWeek && !fest().christmas && h() >= 9 && h() < 19;
const PARASOL_COLS = ['#c3271d', '#2f6b35', '#f2c230', '#2a4a9a', '#c3271d', '#e07a3a'];
// ------------------------------------------------------------------------------------------------ hotspots per scene
export function perfHotspots(scene) {
  const n = scene.name, S = (hs) => Object.assign({ r: 44 }, hs);
  if (n === 'ambalam') return [
    S({ x: 215, y: 600, label: 'thirassila · lower the curtain', enabled: () => KATHAKALI() && (scene._curtain || 0) < 1, drag: p => dragCurtain(scene, p), action: () => {} }),
    S({ x: 215, y: 600, label: 'Kathakali', enabled: () => KATHAKALI() && (scene._curtain || 0) >= 1, action: () => kathakaliLine(scene) }),
    S({ x: 90, y: 600, r: 40, label: 'Ottamthullal', enabled: THULLAL, action: () => { audio.sfx('elathalam'); say('Ottamthullal at the mandapam: one dancer, one mridangam, and Kunchan Nambiar’s verses taking the skin off the landlord, the priest and the audience in turn. Everybody laughs, including the landlord.', 'ഓട്ടൻതുള്ളൽ', 7); remember('thullal', 'Ottamthullal at the utsavam. The green face, the tall red mudi, and verses that are two hundred years old and still rude about the right people.'); did('thullal'); } }),
    S({ x: 215, y: 420, r: 60, label: 'kudamattom · change the parasols', enabled: KUDAMATTOM, action: () => { scene._kuda = ((scene._kuda || 0) + 1) % PARASOL_COLS.length; audio.sfx('elathalam'); haptics.light(); if (!state.today.kuda) { state.today.kuda = true; say('Kudamattom: at a signal the men on the elephants swap the silk parasols, all three at once, and the crowd roars as if it were a goal.', 'കുടമാറ്റം', 6); remember('kudamattom', 'The kudamattom at the utsavam: parasols changing colour on three elephants to the chenda’s climb, and the whole paddy edge shouting.'); } } }),
  ];
  if (n === 'kavala') return [
    S({ x: 215, y: 620, r: 70, label: 'Pulikali · the tigers', enabled: PULIKALI, action: () => { audio.sfx('clap'); haptics.light(); scene._puliT = 1; if (!state.today.pulikali) { state.today.pulikali = true; did('pulikali'); say('Pulikali on the fourth Onam: Velayudhan’s cousin and three others painted yellow and black since dawn, bellies shaking to the udukku, a hunter with a toy gun chasing them round the junction.', 'പുലികളി', 7); remember('pulikali', 'Pulikali at the kavala. Four tigers, one hunter, half the village, and paint that will take a week to come off.'); } else say('The biggest tiger does a turn just for you. The paint on his belly is still wet.', 'പുലി'); } }),
    S({ x: 330, y: 610, r: 36, label: 'nakshatram · buy a paper star', enabled: () => STAR_STALL() && F().star !== yr(), action: () => { F().star = yr(); audio.sfx('coin'); say('A paper star from the stall by the post office, red with a tail, for one rupee. Hang it under the eave and put a bulb in it after dark.', 'നക്ഷത്രം', 6); remember('star', 'Bought a paper star at the kavala in Christmas week and hung it under the eave. Mariyamma says it is the brightest on the road.'); did('star'); } }),
  ];
  if (n === 'poomukham') return [
    S({ x: 236, y: 700, r: 56, label: 'Kummattikali · give them rice', enabled: () => KUMMATTI() && !state.today.kummatti, action: () => { if ((state.pantry.rice || 0) < 1) { say('A measure of rice is what they come for. The ara is empty; the kada sells it.', 'അരി'); return; } state.pantry.rice--; state.today.kummatti = true; did('kummatti'); audio.sfx('coin'); say('Three kummattis in grass from head to knee, masks of Krishna, Hanuman and a grinning old woman, dancing to the onavillu bow. A measure of rice into the bag, and they dance once more for the house.', 'കുമ്മാട്ടിക്കളി', 7); remember('kummatti', 'Kummattikali at the gate on Uthradam, the grass bodies and the wooden masks, and a dance for a measure of rice.'); } }),
    S({ x: 236, y: 700, r: 56, label: 'Onappottan · the blessing', enabled: () => POTTAN() && !state.today.pottan, action: () => { state.today.pottan = true; did('pottan'); audio.sfx('chime'); haptics.success(); say('The Onappottan at the gate, red-faced, the olakkuda high, the bell in his hand. He does not speak; he never does. Rice and a coin into the vessel, and his blessing by the bell, and he is gone to the next house.', 'ഓണപ്പൊട്ടൻ', 7); remember('onappottan', 'Thiruvonam morning: the Onappottan came to the gate as he came when I was small, silent, bell and umbrella, Maveli in person for one morning.'); } }),
    S({ x: 90, y: 690, r: 40, label: 'kambithiri · light a sparkler', enabled: VISHU_FIRE, action: () => { scene._spark = 6; audio.sfx('sizzle', { dur: 5 }); haptics.light(); if (!state.today.spark) { state.today.spark = true; did('spark'); say(fest().vishu ? 'Vishu dawn: a sparkler in each hand, olapadakkam going off along the whole road, the kani seen and the kaineettam in the pocket.' : 'Vishu eve: sparklers at the gate, a string of olapadakkam, Ammini chechi covering her ears and laughing.', 'കമ്പിത്തിരി', 6); remember('vishupadakkam', 'Sparklers and olapadakkam at the gate for Vishu. The smell of it is the smell of being nine.'); } } }),
  ];
  if (n === 'pallikkoodam') return [
    S({ x: 215, y: 600, r: 60, label: 'Vidyarambham · write Hari Sree', enabled: () => VIDYARAMBHAM() && !state.today.harisree, drag: p => dragHarisree(scene, p), action: () => {} }),
  ];
  if (n === 'pally') return [
    S({ x: 215, y: 640, r: 70, label: 'Margamkali · clap in time', enabled: MARGAM, action: () => { audio.sfx('clap'); haptics.light(); scene._clapT = .4; scene._claps = (scene._claps || 0) + 1; if (scene._claps === 8 && !state.today.margam) { state.today.margam = true; did('margam'); say('Margamkali in the pally yard: twelve women in chatta and mundu round the nilavilakku, clapping and singing the old Syriac-tinged songs, the circle turning as one.', 'മാർഗ്ഗംകളി', 7); remember('margamkali', 'Margamkali at the pally on Christmas night: the circle of white round the lamp, the claps, and Mariyamma leading the song.'); } } }),
  ];
  if (n === 'masjid') return [
    S({ x: 215, y: 630, r: 70, label: 'Duffmuttu · beat the duff', enabled: DUFF, action: () => { audio.sfx('duff'); haptics.light(); scene._duffT = .3; scene._duffs = (scene._duffs || 0) + 1; if (scene._duffs === 6 && !state.today.duff) { state.today.duff = true; did('duff'); say('Duffmuttu in the masjid yard for perunnal: a row of men with the duff frames, swaying together, the beat going up through the ground, Hamsakka leading with his eyes closed.', 'ദഫ്മുട്ട്', 7); remember('duffmuttu', 'Duffmuttu at the masjid on perunnal. Six duffs in a line and a rhythm you could set your heart to.'); } } }),
  ];
  if (n === 'kaavu') return [
    S({ x: 215, y: 540, r: 60, label: 'Theyyam · receive the blessing', enabled: () => THEYYAM() && !state.today.theyyamBless, action: () => { state.today.theyyamBless = true; did('theyyamBless'); audio.sfx('chime'); haptics.success(); say('The Theyyam stops before you, the mudi filling the sky, and speaks in the god’s voice: the family will be well, the one who went away will come. Turmeric and rice into your palm.', 'തെയ്യം', 7); remember('theyyambless', 'The Theyyam’s blessing at the kaavu: turmeric in my palm and a promise about Ravi, in a voice that was not the toddy-tapper’s who wears it.'); } }),
  ];
  return [];
}
function dragCurtain(scene, p) { let y0 = p.y, start = scene._curtain || 0; return { move(q) { scene._curtain = Math.max(start, Math.min(1, start + (q.y - y0) / 120)); }, end(q) { if ((scene._curtain || 0) >= 1) { if (!state.today.kathakali) { state.today.kathakali = true; did('kathakali'); audio.sfx('elathalam'); say('The thirassila comes down and there he is: pacha, the green of a hero, the kireedam catching the kalivilakku, eyes that have been reddened with a chunda seed, and the chenda breaking into the first kalasam.', 'കഥകളി', 8); remember('kathakali', 'Kathakali at the utsavam, all night in front of the kalivilakku. Nalacharitham. I slept through the second act like everyone and woke for the best part.'); } } else if (Math.abs(q.y - y0) < 10) say('Pull the curtain down with your finger. The men behind it will let it go when you do.', 'തിരശ്ശീല'); } }; }
function kathakaliLine(scene) { const L = [['Nalacharitham. Nalan and Damayanthi, the swan between them, and the dice that lose a kingdom. The whole village knows the story and watches as if it did not.', 'നളചരിതം'], ['The mudras: the lotus, the swan, the arrow. Achan used to translate them for you under his breath, and you have not forgotten all of it.', 'മുദ്ര'], ['The kathi comes on, red moustache and white knob on the nose, and the children in front move back a yard without being told.', 'കത്തി'], ['Three in the morning. The chenda has not stopped. The dancer’s eyes alone are moving, and the whole mandapam is moving with them.', 'കണ്ണ്']]; const l = L[(state.stats.verbs.kathakaliLine || 0) % L.length]; state.stats.verbs.kathakaliLine = (state.stats.verbs.kathakaliLine || 0) + 1; audio.sfx('elathalam'); say(l[0], l[1], 7); }
function dragHarisree(scene, p) { let last = p, len = scene._hari || 0; return { move(q) { if (Math.abs(q.x - 215) < 90 && Math.abs(q.y - 600) < 50) { len += Math.hypot(q.x - last.x, q.y - last.y); scene._hari = Math.min(1, len / 520) * 1; if (Math.floor(len / 40) !== Math.floor((len - Math.hypot(q.x - last.x, q.y - last.y)) / 40)) audio.sfx('scrape', { reps: 1 }); } last = q; }, end(q) { if ((scene._hari || 0) >= 1 && !state.today.harisree) { state.today.harisree = true; did('harisree'); audio.sfx('chime'); haptics.success(); say('Hari Sree Ganapathaye Namah, written in the rice with the master’s finger over yours, then on your tongue with the gold ring. Forty years late and the master does not mention it.', 'ഹരിശ്രീ', 8); remember('vidyarambham', 'Vidyarambham at the school on Vijayadashami: the letters written in rice for the three-year-olds, and once more, for a joke that was not a joke, for me.'); } else if (len < 10) say('Write in the rice with your finger: round and round, the way the master’s hand goes.', 'അരിയിൽ എഴുതുക'); } }; }
// ------------------------------------------------------------------------------------------------ drawing
export function drawPerformances(scene, c, t) {
  const n = scene.name;
  if (n === 'ambalam') {
    if (KATHAKALI()) {
      // the mandapam stage: a mat, the kalivilakku, drummers behind, the audience in front sitting on the ground
      rect(c, 120, 586, 190, 20, '#b8a070'); rect(c, 120, 604, 190, 4, '#8a7048');
      chendaPlayer(c, 150, 584, .7, t); chendaPlayer(c, 290, 584, .7, t + .5, true); person(c, 215, 582, .7, { sex: 'm', bare: true, mundu: '#f3ecd8' }, 0); rect(c, 206, 548, 18, 10, '#8a5a2a'); // maddalam
      const drop = scene._curtain || 0;
      if (drop > 0) { kathakali(c, 215, 598, 1.05, t, 'pacha'); if (drop >= 1 && Math.sin(t * .15) > .3) kathakali(c, 262, 600, .9, t + 1.7, 'kathi'); }
      thirassila(c, 215, 600, 120, 110, drop);
      kalivilakku(c, 215, 640, 1, t);
      for (let i = 0; i < 11; i++) person(c, 30 + i * 36 + (i % 2) * 10, 690 + (i % 3) * 16, .68, { sex: i % 3 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', pose: 'sit', flip: i % 2 }, 0);
    }
    if (THULLAL()) { // a single dancer on the left with a mridangam player; green face, tall red headdress, a wide skirt
      rect(c, 50, 600, 80, 10, '#b8a070'); const px = 90 + Math.sin(t * 2) * 10, py = 604, bob = Math.abs(Math.sin(t * 4)) * -3;
      c.save(); c.translate(px, py + bob); shadow(c, 0, 3, 22, 6, .35); c.fillStyle = '#f3ecd8'; c.beginPath(); c.moveTo(-10, -36); c.quadraticCurveTo(-30, -14, -26, 0); c.lineTo(26, 0); c.quadraticCurveTo(30, -14, 10, -36); c.closePath(); c.fill(); rect(c, -26, -6, 52, 2, '#c3271d'); rect(c, -24, -10, 48, 1.5, '#2f6b35');
      poly(c, [[-9, -60], [9, -60], [10, -36], [-10, -36]], '#2f6b35'); for (let i = 0; i < 4; i++) circle(c, -6 + i * 4, -50, 1.4, '#e6b848'); c.strokeStyle = '#2f6b35'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -56); c.lineTo(-24, -66 + Math.sin(t * 4) * 6); c.moveTo(9, -56); c.lineTo(24, -66 - Math.sin(t * 4) * 6); c.stroke();
      circle(c, 0, -68, 7, '#3c9a47'); poly(c, [[-9, -62], [9, -62], [7, -58], [-7, -58]], '#f3ecd8'); c.fillStyle = '#140b0a'; c.fillRect(-5, -70, 4, 1.2); c.fillRect(1, -70, 4, 1.2); rect(c, -2, -65, 4, 1, '#c3271d');
      poly(c, [[-9, -74], [9, -74], [5, -98], [-5, -98]], '#c3271d'); for (let i = 0; i < 4; i++) rect(c, -8 + i * .8, -78 - i * 5, 16 - i * 1.6, 1.4, '#e6b848'); circle(c, 0, -100, 3, '#f2c230'); c.restore();
      person(c, 46, 604, .66, { sex: 'm', bare: true, mundu: '#f3ecd8', pose: 'sit' }, 0); rect(c, 36, 584, 20, 9, '#8a5a2a');
      for (let i = 0; i < 5; i++) person(c, 40 + i * 30, 660 + (i % 2) * 12, .62, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a'][i % 3], mundu: '#f3ecd8', pose: 'sit' }, 0);
    }
    if (KUDAMATTOM()) { const k = scene._kuda || 0; parasol(c, 205, 420, 1, PARASOL_COLS[k % 6], t); parasol(c, 105, 440, .9, PARASOL_COLS[(k + 2) % 6], t + 1); parasol(c, 315, 445, .9, PARASOL_COLS[(k + 4) % 6], t + 2); }
  }
  if (n === 'kavala' && PULIKALI()) {
    const k = scene._puliT = Math.max(0, (scene._puliT || 0) - 1 / 60); const sp = 1 + k * 2;
    puli(c, 150, 640, 1, t * sp, '#f2c230'); puli(c, 215, 660, 1.08, t * sp + 1.3, '#e0a030'); puli(c, 280, 644, .96, t * sp + 2.1, '#f2c230'); puli(c, 340, 662, .9, t * sp + .7, '#d85a2a');
    person(c, 90, 650, .8, { sex: 'm', top: '#4a5a3a', mundu: '#3a3a3a', pose: 'walk' }, t); line(c, 96, 606, 112, 598, '#1a1410', 2.4); // the hunter
    for (let i = 0; i < 8; i++) person(c, 20 + i * 48 + (i % 2) * 10, 720 + (i % 3) * 10, .66, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#b8443a', '#2d6b5a', '#e0b43a'][i % 4], mundu: '#f3ecd8', flip: i % 2 }, t + i);
  }
  if (n === 'kavala' && STAR_STALL()) { rect(c, 310, 560, 46, 50, '#6a4a2a'); rect(c, 306, 556, 54, 6, '#8a6a3a'); for (let i = 0; i < 3; i++) paperStar(c, 320 + i * 14, 578, .5, false, t + i); for (let i = 0; i < 3; i++) paperStar(c, 326 + i * 12, 598, .4, false, t + i + 1); }
  if (n === 'poomukham') {
    if (KUMMATTI() && !state.today.kummatti) { kummatti(c, 200, 704, .9, t); kummatti(c, 240, 710, .95, t + 1); kummatti(c, 278, 702, .85, t + 2); person(c, 160, 708, .7, { sex: 'm', bare: true, mundu: '#f3ecd8' }, 0); line(c, 150, 660, 170, 690, '#c9a060', 2); }
    if (POTTAN() && !state.today.pottan) onappottan(c, 236, 706, .95, t);
    if (scene._spark > 0) { scene._spark -= 1 / 60; const sx = 90, sy = 668; line(c, sx, 690, sx, sy, '#9a9a9a', 1.2); glow(c, sx, sy, 30, '#ffd080', .5); for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, r = 6 + Math.random() * 22; line(c, sx, sy, sx + Math.cos(a) * r, sy + Math.sin(a) * r, Math.random() < .5 ? '#fff3c0' : '#ffb040', 1); } }
    if (F().star === yr() && fest().christmasWeek) { line(c, 330, 346, 330, 366, '#8a7a6a', 1); paperStar(c, 330, 380, .8, clock.daylight < .5, t); }
  }
  if (n === 'pallikkoodam' && VIDYARAMBHAM()) {
    // the uruli of rice on a mat, the master seated, the child in his lap, parents around; the letters appear in the rice as you write
    rect(c, 150, 560, 130, 70, '#b8a070'); ellipse(c, 215, 606, 48, 18, P.brassDk); ellipse(c, 215, 602, 48, 18, P.brass); ellipse(c, 215, 600, 40, 13, '#f3ecd8');
    person(c, 150, 600, .78, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', pose: 'sit' }, 0); person(c, 162, 604, .5, { sex: 'boy', top: '#e0b43a', mundu: '#f3ecd8', pose: 'sit' }, 0);
    for (let i = 0; i < 6; i++) person(c, 40 + i * 62, 662 + (i % 2) * 10, .68, { sex: i % 2 ? 'm' : 'f', top: ['#f1e6d0', '#8a2a3a', '#2d6b5a'][i % 3], mundu: P.kasavu, flip: i % 2 }, 0);
    const k = state.today.harisree ? 1 : (scene._hari || 0); if (k > 0) { c.save(); c.beginPath(); c.rect(175, 586, 80 * k, 30); c.clip(); c.fillStyle = '#8a6a3a'; c.font = `12px ${FONT_ML}`; c.textAlign = 'left'; c.fillText('ഹരിശ്രീ ഗണപതയേ നമഃ', 176, 604); c.restore(); }
  }
  if (n === 'pally' && MARGAM()) {
    const cT = scene._clapT = Math.max(0, (scene._clapT || 0) - 1 / 60); ellipse(c, 215, 640, 10, 4, P.brassDk); rect(c, 213, 606, 4, 34, P.brass); ellipse(c, 215, 606, 11, 4, P.brass); for (let k = 0; k < 5; k++) { const a = k * 1.2566, fl = 1 + Math.sin(t * 11 + k) * .15; circle(c, 215 + Math.cos(a) * 9, 603 - 3 * fl, 1.4, P.flameHi); } glow(c, 215, 604, 60, '#ffb050', .45);
    for (let i = 0; i < 12; i++) { const a = t * .25 + i * .5236, x = 215 + Math.cos(a) * 86, y = 650 + Math.sin(a) * 34, bob = Math.abs(Math.sin(t * 3 + i)) * -2 - cT * 4; person(c, x, y + bob, .74, { sex: 'f', top: '#f7f2e6', mundu: '#f7f2e6', hair: '#2a1a10' }, 0); }
  }
  if (n === 'masjid' && DUFF()) {
    const dT = scene._duffT = Math.max(0, (scene._duffT || 0) - 1 / 60);
    for (let i = 0; i < 6; i++) { const x = 100 + i * 46, y = 640, sway = Math.sin(t * 2.4 + i * .3) * 4; person(c, x + sway, y, .78, { sex: 'm', top: '#f7f2e6', mundu: '#f7f2e6', cap: '#f7f2e6' }, 0); duff(c, x + sway - 12, y - 40 - dT * 6, .9); }
    for (let i = 0; i < 6; i++) person(c, 60 + i * 56, 712 + (i % 2) * 8, .64, { sex: i % 3 === 2 ? 'f' : 'm', top: '#f7f2e6', mundu: '#f7f2e6', cap: i % 3 === 2 ? null : '#f7f2e6', flip: i % 2 }, 0);
  }
}
// ------------------------------------------------------------------------------------------------ sound and tasks
export function perfAmbience(scene) {
  const n = scene.name, m = {};
  if (n === 'ambalam') { if (KATHAKALI()) { m.chenda = .75; m.murmur = .1; } if (THULLAL()) m.murmur = .25; }
  if (n === 'kavala' && PULIKALI()) { m.chenda = .55; m.murmur = .35; }
  if (n === 'poomukham' && (KUMMATTI() || POTTAN())) m.murmur = .1;
  if (n === 'pally' && MARGAM()) m.njattupattu = .4;
  if (n === 'masjid' && DUFF()) m.murmur = .3;
  if (n === 'pallikkoodam' && VIDYARAMBHAM()) m.murmur = .25;
  return m;
}
export function perfTasks() {
  const L = [], f = fest();
  if (f.utsavam) L.push({ t: 'Kathakali at the ambalam after the fireworks', ml: 'കഥകളി', done: () => !!state.today.kathakali });
  if (f.utsavamMain) L.push({ t: 'Kudamattom on the elephants this evening', ml: 'കുടമാറ്റം', done: () => !!state.today.kuda });
  if (f.pulikali) L.push({ t: 'Pulikali at the kavala this afternoon', ml: 'പുലികളി', done: () => !!state.today.pulikali });
  if (f.onam && (f.onamDay === 8 || f.onamDay === 9)) L.push({ t: 'Rice for the Kummattis at the gate', ml: 'കുമ്മാട്ടി', done: () => !!state.today.kummatti });
  if (f.thiruvonam) L.push({ t: 'The Onappottan comes in the morning', ml: 'ഓണപ്പൊട്ടൻ', done: () => !!state.today.pottan });
  if (f.vijayadashami) L.push({ t: 'Vidyarambham at the school', ml: 'വിദ്യാരംഭം', done: () => !!state.today.harisree });
  if (f.christmas) L.push({ t: 'Margamkali at the pally tonight', ml: 'മാർഗ്ഗംകളി', done: () => !!state.today.margam });
  if (f.christmasWeek && !f.christmas) L.push({ t: 'A paper star from the kavala', ml: 'നക്ഷത്രം', done: () => F().star === yr() });
  if (f.eid || f.bakrid) L.push({ t: 'Duffmuttu at the masjid this evening', ml: 'ദഫ്മുട്ട്', done: () => !!state.today.duff });
  if (f.vishuEve || f.vishu) L.push({ t: 'Sparklers at the gate', ml: 'കമ്പിത്തിരി', done: () => !!state.today.spark });
  return L;
}
