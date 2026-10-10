import { text, FONT, roundRect, circle, line, palm, glow } from '../art/draw.js';
import { boat, bus } from '../art/lib.js';
import { makeLayer } from '../engine/canvas.js';
import { fest } from '../game/festivals.js';
import { anyDue } from '../game/people.js';
import { state } from '../game/state.js';
import { audio } from '../engine/audio.js';
import { t, pick, lang, FONT_ML, sub, mode } from '../i18n/t.js';
export const map = { open: false };
// positions as fractions of the panel
export const PLACES = [
  { id: 'thattinpuram', n: 'Thattinpuram', ml: 'തട്ടിൻപുറം', x: .14, y: .04, home: true },
  { id: 'ara', n: 'Ara', ml: 'അറ', x: .14, y: .13, home: true },
  { id: 'nadumuttam', n: 'Nadumuttam', ml: 'നടുമുറ്റം', x: .36, y: .11, home: true },
  { id: 'adukkala', n: 'Adukkala', ml: 'അടുക്കള', x: .58, y: .06, home: true },
  { id: 'poomukham', n: 'Poomukham', ml: 'പൂമുഖം', x: .36, y: .22, home: true },
  { id: 'thodi', n: 'Thodi', ml: 'തൊടി', x: .70, y: .18, home: true },
  { id: 'kulam', n: 'Kulam', ml: 'കുളം', x: .86, y: .13, home: true },
  { id: 'kaavu', n: 'Kaavu', ml: 'കാവ്', x: .08, y: .32 },
  { id: 'ambalam', n: 'Ambalam', ml: 'അമ്പലം', x: .14, y: .42 },
  { id: 'chayakkada', n: 'Chayakkada', ml: 'ചായക്കട', x: .40, y: .42 },
  { id: 'kada', n: 'Kada', ml: 'പലചരക്കുകട', x: .62, y: .36 },
  { id: 'vayanasala', n: 'Vayanasala', ml: 'വായനശാല', x: .86, y: .36 },
  { id: 'angadi', n: 'Angadi', ml: 'അങ്ങാടി', x: .68, y: .50 },
  { id: 'pallikkoodam', n: 'Pallikkoodam', ml: 'പള്ളിക്കൂടം', x: .90, y: .50 },
  { id: 'talkies', n: 'Talkies', ml: 'ടാക്കീസ്', x: .86, y: .62 },
  { id: 'kavala', n: 'Kavala', ml: 'കവല', x: .46, y: .56 },
  { id: 'vayal', n: 'Vayal', ml: 'വയൽ', x: .16, y: .60 },
  { id: 'kadavu', n: 'Kadavu', ml: 'കടവ്', x: .58, y: .68 },
  { id: 'pally', n: 'Pally', ml: 'പള്ളി', x: .44, y: .80 },
  { id: 'masjid', n: 'Masjid', ml: 'മസ്ജിദ്', x: .12, y: .79 },
  { id: 'station', n: 'Station', ml: 'സ്റ്റേഷൻ', x: .3, y: .875 },
  { id: 'kadappuram', n: 'Kadappuram', ml: 'കടപ്പുറം', x: .76, y: .885 }
];
export const TRAVEL = {
  back: 'You walk back the way you came, the light a little different now.',
  ambalam: 'You walk the idavazhi, between laterite walls, past the sarpakkavu, to the temple.',
  chayakkada: 'Down the lane to the junction. Velayudhan’s chayakkada is where the lane bends.',
  kada: 'Past the chayakkada to Kunjappan’s palacharakku kada, the one with the gunny sacks out front.',
  vayanasala: 'Up the little hill to the vayanasala. Somebody is always reading on the step.',
  kavala: 'To the kavala, where the bus stops and the post office keeps its own time.',
  vayal: 'Along the bund between the paddy. Dragonflies lift as you pass.',
  kadavu: 'Down the mud steps to the kadavu, where the river is slow and brown.',
  poomukham: 'Back along the idavazhi, home. The roof shows first, then the palms.',
  pallikkoodam: 'Past the angadi to the school, where the bell hangs in the mango tree and the ground is red with forty years of games.',
  angadi: 'Up to the angadi: a row of shops under one roof, the tailor\u2019s machine audible before the shops are visible.',
  talkies: 'Behind the angadi to Paradise Talkies, the loudspeaker on its pole and the bicycles leaning like drunks.',
  kaavu: 'Behind the ambalam, through the gap in the wall, into the dark of the sarpakkavu. Lower your voice.',
  station: 'Along the road past the pally to the station, the rails humming before anything shows.',
  pally: 'Across the river on Pappan\u2019s thoni, then up the lane to the pally, white between the palms.',
  masjid: 'Along the river road, past the tamarind, to the masjid, white under its tiled roofs, the hauz full of sky.',
  kadappuram: 'Past the pally, down the sandy path through the coconut groves, until the sound of the sea arrives before the sea.',
  thattinpuram: 'Up the ladder in the ara, through the hatch, into the dust and the heat under the tiles.',
  thodi: 'Round the side of the house to the thodi.', kulam: 'Through the thodi, down the stone steps to the kulam.', ara: 'Into the cool dark of the ara.', nadumuttam: 'In through the door.', adukkala: 'Through to the smoky adukkala.'
};
// The map: a folded paper village map, drawn the way a child draws the places that matter, with the real little landmarks on it.
// The paper is painted once and cached; the lamp that marks where you are, and the small signs of what is happening now, are drawn each frame.
let paper = null, paperKey = '';
function layout(w, h, safeTop, safeBottom) { const px = 20, py = safeTop + 50, pw = w - 40, ph = h - py - safeBottom - 60; return { px, py, pw, ph }; }
function P_(id) { return PLACES.find(p => p.id === id); }
function pos(p, L) { return { x: L.px + p.x * L.pw, y: L.py + p.y * L.ph }; }
function miniPalm(c, x, y, s = 1, lean = 6) { palm(c, x, y, y - 26 * s, lean, .22 * s, ['#8a6a3a', '#5a4428', '#4f7a3a', '#6f9a4a']); }
function pencil(c, col = 'rgba(70,50,30,.6)', wdt = 1) { c.strokeStyle = col; c.lineWidth = wdt; c.lineCap = 'round'; c.lineJoin = 'round'; }
function wobble(c, pts, col, wdt, dash) { pencil(c, col, wdt); if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach(([x, y], i) => { const jx = Math.sin(x * .37 + y * .11) * 1.2, jy = Math.cos(x * .21 + y * .29) * 1.2; i ? c.lineTo(x + jx, y + jy) : c.moveTo(x + jx, y + jy); }); c.stroke(); c.setLineDash([]); }
function hatch(c, x, y, w, h, col, gap = 5, ang = -.35) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); pencil(c, col, 1); for (let i = -h; i < w + h; i += gap) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + h * Math.tan(ang + 1.2), y); c.stroke(); } c.restore(); }
function paintPaper(c, L, w, h) {
  const { px, py, pw, ph } = L, ml = lang() === 'ml';
  // aged paper with darker edges, three fold creases (the map in the corner is folded in three), worn corners
  c.save(); c.beginPath(); c.roundRect(px, py, pw, ph, 5); c.clip();
  c.fillStyle = '#e8dab6'; c.fillRect(px, py, pw, ph);
  const eg = c.createRadialGradient(px + pw / 2, py + ph / 2, pw * .3, px + pw / 2, py + ph / 2, pw * .95); eg.addColorStop(0, 'rgba(255,245,220,.25)'); eg.addColorStop(1, 'rgba(120,80,40,.28)'); c.fillStyle = eg; c.fillRect(px, py, pw, ph);
  for (let i = 0; i < 180; i++) { const x = px + ((i * 97.3) % pw), y = py + ((i * 53.7) % ph); c.fillStyle = i % 3 ? 'rgba(120,90,50,.07)' : 'rgba(255,255,255,.12)'; c.fillRect(x, y, 1 + (i % 2), 1); }
  for (const fy of [ph / 3, ph * 2 / 3]) { const g = c.createLinearGradient(0, py + fy - 6, 0, py + fy + 6); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.45, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(90,60,30,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(px, py + fy - 6, pw, 12); }
  { const g = c.createLinearGradient(px + pw / 2 - 6, 0, px + pw / 2 + 6, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(90,60,30,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(px + pw / 2 - 6, py, 12, ph); }
  // ---- regions, from far to near: the sea at the foot, the river, the paddy, the lanes, the compound at the top
  const sea = py + ph * .955; c.fillStyle = 'rgba(120,170,185,.45)'; c.beginPath(); c.moveTo(px, sea + 10); for (let x = px; x <= px + pw; x += 10) c.lineTo(x, sea + Math.sin(x / 30) * 3); c.lineTo(px + pw, py + ph); c.lineTo(px, py + ph); c.fill();
  pencil(c, 'rgba(60,100,120,.6)', 1); for (let r = 0; r < 3; r++) { c.beginPath(); for (let x = px + 8; x < px + pw; x += 14) { c.moveTo(x, sea + 14 + r * 9); c.quadraticCurveTo(x + 4, sea + 10 + r * 9, x + 8, sea + 14 + r * 9); } c.stroke(); }
  // lighthouse on the right of the shore
  { const lx = px + pw * .93, ly = sea - 4; c.fillStyle = '#f1e4c8'; c.fillRect(lx - 3, ly - 20, 6, 20); c.fillStyle = '#c8322a'; c.fillRect(lx - 3, ly - 20, 6, 4); c.fillRect(lx - 3, ly - 11, 6, 3); }
  // the river: a wash with pencil edges and a little thoni
  const ry = py + ph * .74; c.fillStyle = 'rgba(120,160,175,.42)'; c.beginPath(); c.moveTo(px, ry - 8); c.quadraticCurveTo(px + pw * .5, ry - 26, px + pw, ry - 6); c.lineTo(px + pw, ry + 12); c.quadraticCurveTo(px + pw * .5, ry - 6, px, ry + 12); c.fill();
  wobble(c, Array.from({ length: 12 }, (_, i) => [px + i * pw / 11, ry - 8 - Math.sin(i / 11 * Math.PI) * 18]), 'rgba(50,90,110,.55)', 1); wobble(c, Array.from({ length: 12 }, (_, i) => [px + i * pw / 11, ry + 12 - Math.sin(i / 11 * Math.PI) * 18]), 'rgba(50,90,110,.55)', 1);
  boat(c, px + pw * .3, ry - 12, .35, 0); text(c, ml ? 'പുഴ' : 'the river', px + pw * .82, ry - 14, 9, 'rgba(50,80,100,.75)', 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic');
  // paddy: hatched green block with the bund
  const vx = px + pw * .04, vy = py + ph * .5, vw = pw * .26, vh = ph * .2; c.fillStyle = 'rgba(140,180,90,.35)'; c.beginPath(); c.roundRect(vx, vy, vw, vh, 10); c.fill(); hatch(c, vx, vy, vw, vh, 'rgba(70,110,40,.45)', 5); wobble(c, [[vx + vw * .5, vy + vh], [vx + vw * .5, vy]], 'rgba(120,80,40,.7)', 2);
  // the tar road through the kavala to the angadi and off to town, and the railway from the station
  { const k = pos(P_('kavala'), L), a = pos(P_('angadi'), L); c.strokeStyle = 'rgba(90,90,95,.5)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - 4, k.y + 30); c.quadraticCurveTo(k.x, k.y + 6, a.x, a.y + 8); c.lineTo(px + pw + 4, a.y - 10); c.stroke(); c.setLineDash([4, 6]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px - 4, k.y + 30); c.quadraticCurveTo(k.x, k.y + 6, a.x, a.y + 8); c.lineTo(px + pw + 4, a.y - 10); c.stroke(); c.setLineDash([]); bus(c, k.x + 28, k.y - 4, .26); }
  { const st = pos(P_('station'), L); pencil(c, 'rgba(60,50,45,.7)', 1.2); c.beginPath(); c.moveTo(px - 4, st.y + 42); c.lineTo(px + pw * .6, st.y + 36); c.moveTo(px - 4, st.y + 47); c.lineTo(px + pw * .6, st.y + 41); c.stroke(); for (let x = px; x < px + pw * .6; x += 7) { c.beginPath(); c.moveTo(x, st.y + 41 - (x - px) * .012); c.lineTo(x, st.y + 48 - (x - px) * .012); c.stroke(); } }
  // the lanes: idavazhi as a double pencil line, footpaths dotted
  const seg = (a, b, dbl) => { const A = pos(P_(a), L), B = pos(P_(b), L); if (dbl) { const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy), nx = -dy / l * 2.2, ny = dx / l * 2.2; wobble(c, [[A.x + nx, A.y + ny], [B.x + nx, B.y + ny]], 'rgba(120,80,40,.55)', 1); wobble(c, [[A.x - nx, A.y - ny], [B.x - nx, B.y - ny]], 'rgba(120,80,40,.55)', 1); } else wobble(c, [[A.x, A.y], [B.x, B.y]], 'rgba(90,60,30,.6)', 1.2, [2, 5]); };
  [['poomukham', 'ambalam', 1], ['poomukham', 'chayakkada', 1], ['chayakkada', 'kada', 1], ['kada', 'vayanasala', 0], ['chayakkada', 'kavala', 1], ['kavala', 'vayal', 0], ['kavala', 'kadavu', 0], ['poomukham', 'thodi', 0], ['thodi', 'kulam', 0], ['poomukham', 'nadumuttam', 0], ['nadumuttam', 'adukkala', 0], ['nadumuttam', 'ara', 0], ['ara', 'thattinpuram', 0], ['kavala', 'angadi', 0], ['angadi', 'pallikkoodam', 0], ['angadi', 'talkies', 0], ['ambalam', 'kaavu', 0], ['kadavu', 'pally', 0], ['pally', 'station', 0], ['pally', 'kadappuram', 0], ['pally', 'masjid', 0], ['masjid', 'station', 0]].forEach(([a, b, d]) => seg(a, b, d));
  // ---- the tharavad compound: laterite wall, the nalukettu roof plan with the nadumuttam open, the pond, the kinar, palms
  { const cx0 = px + pw * .06, cy0 = py + ph * .02, cw = pw * .66, ch = ph * .25; c.fillStyle = 'rgba(200,120,80,.12)'; c.beginPath(); c.roundRect(cx0, cy0, cw, ch, 8); c.fill(); wobble(c, [[cx0, cy0], [cx0 + cw, cy0], [cx0 + cw, cy0 + ch], [cx0, cy0 + ch], [cx0, cy0]], 'rgba(150,80,40,.7)', 1.6);
    const n = pos(P_('nadumuttam'), L); const R = 26; c.fillStyle = '#b8603c'; c.beginPath(); c.roundRect(n.x - R, n.y - R * .75, R * 2, R * 1.5, 3); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 1; i < 5; i++) c.fillRect(n.x - R, n.y - R * .75 + i * R * .3, R * 2, 1); c.fillStyle = '#d8c8a0'; c.fillRect(n.x - 7, n.y - 5, 14, 10); c.fillStyle = 'rgba(120,160,175,.6)'; c.fillRect(n.x - 4, n.y - 2, 8, 4);
    const k = pos(P_('kulam'), L); c.fillStyle = 'rgba(120,170,185,.55)'; c.beginPath(); c.ellipse(k.x, k.y + 2, 18, 10, 0, 0, 7); c.fill(); pencil(c, 'rgba(50,90,110,.6)', 1); c.stroke();
    const th = pos(P_('thodi'), L); miniPalm(c, th.x - 14, th.y + 10, 1, 5); miniPalm(c, th.x + 12, th.y + 12, .85, -6); c.fillStyle = '#8a5a3a'; c.beginPath(); c.ellipse(th.x, th.y + 6, 5, 3, 0, 0, 7); c.fill();
    const po = pos(P_('poomukham'), L); c.strokeStyle = 'rgba(90,60,30,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(po.x + 26, po.y + 2, 4, 0, 7); c.stroke(); c.beginPath(); c.moveTo(po.x + 22, po.y - 8); c.lineTo(po.x + 30, po.y - 8); c.moveTo(po.x + 26, po.y - 8); c.lineTo(po.x + 26, po.y + 2); c.stroke();
    text(c, ml ? 'തറവാട്' : 'Tharavad', cx0 + cw - 34, cy0 + ch + 10, 10, 'rgba(90,60,30,.7)', 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic'); }
  // ---- landmarks, each a little drawing of itself
  const land = {
    ambalam: p => { c.fillStyle = '#a65c3c'; c.beginPath(); c.moveTo(p.x - 12, p.y + 4); c.lineTo(p.x + 12, p.y + 4); c.lineTo(p.x + 5, p.y - 10); c.lineTo(p.x - 5, p.y - 10); c.fill(); c.fillStyle = '#c9962e'; c.fillRect(p.x - 1, p.y - 18, 2, 8); c.fillStyle = '#d8402c'; c.beginPath(); c.moveTo(p.x + 14, p.y - 14); c.lineTo(p.x + 22, p.y - 11); c.lineTo(p.x + 14, p.y - 8); c.fill(); c.fillStyle = '#c9962e'; c.fillRect(p.x + 13, p.y - 16, 1.5, 20); },
    kaavu: p => { for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#2f4a24' : '#3f6030'; c.beginPath(); c.ellipse(p.x - 10 + i * 5, p.y - 4 + (i % 2) * 4, 9, 7, 0, 0, 7); c.fill(); } c.fillStyle = '#6a6a60'; c.fillRect(p.x - 2, p.y + 2, 4, 6); },
    chayakkada: p => { c.fillStyle = '#c9a46a'; c.beginPath(); c.moveTo(p.x - 12, p.y); c.lineTo(p.x + 12, p.y); c.lineTo(p.x, p.y - 10); c.fill(); c.fillStyle = '#6b4226'; c.fillRect(p.x - 10, p.y, 20, 8); c.fillStyle = '#c9962e'; c.beginPath(); c.ellipse(p.x + 16, p.y + 4, 3, 4, 0, 0, 7); c.fill(); },
    kada: p => { c.fillStyle = '#e0b43a'; c.fillRect(p.x - 12, p.y - 6, 24, 4); c.fillStyle = '#6b4226'; c.fillRect(p.x - 10, p.y - 2, 20, 10); c.fillStyle = '#b89a6a'; c.beginPath(); c.ellipse(p.x - 14, p.y + 6, 4, 5, 0, 0, 7); c.fill(); },
    vayanasala: p => { c.fillStyle = '#2d6b5a'; c.fillRect(p.x - 12, p.y - 8, 24, 5); c.fillStyle = '#f1e4c8'; c.fillRect(p.x - 10, p.y - 3, 20, 10); for (let i = 0; i < 4; i++) { c.fillStyle = ['#8a2a1c', '#2a3a8a', '#e0b43a', '#2d6b5a'][i]; c.fillRect(p.x - 8 + i * 4, p.y - 1, 3, 6); } },
    angadi: p => { for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? '#b8603c' : '#a65c3c'; c.fillRect(p.x - 15 + i * 10, p.y - 6, 9, 5); c.fillStyle = '#f1e4c8'; c.fillRect(p.x - 15 + i * 10, p.y - 1, 9, 8); } },
    pallikkoodam: p => { c.fillStyle = '#f1dfa8'; c.fillRect(p.x - 12, p.y - 2, 24, 9); c.fillStyle = '#b8603c'; c.fillRect(p.x - 13, p.y - 6, 26, 4); c.fillStyle = '#555'; c.fillRect(p.x + 14, p.y - 16, 1, 22); c.fillStyle = '#ff9933'; c.fillRect(p.x + 15, p.y - 16, 7, 2); c.fillStyle = '#fff'; c.fillRect(p.x + 15, p.y - 14, 7, 2); c.fillStyle = '#138808'; c.fillRect(p.x + 15, p.y - 12, 7, 2); },
    talkies: p => { c.fillStyle = '#2a2a30'; c.fillRect(p.x - 10, p.y - 8, 20, 14); c.fillStyle = '#f1c232'; c.fillRect(p.x - 8, p.y - 6, 16, 4); c.fillStyle = '#8a2a3a'; c.fillRect(p.x - 7, p.y - 1, 6, 6); c.fillStyle = '#2a6fa0'; c.fillRect(p.x + 1, p.y - 1, 6, 6); },
    kavala: p => { c.fillStyle = '#c8322a'; c.fillRect(p.x + 10, p.y - 10, 5, 8); c.fillStyle = '#444'; c.fillRect(p.x + 12, p.y - 2, 1, 8); },
    vayal: p => { c.fillStyle = '#f1e6d0'; c.fillRect(p.x - 1, p.y - 12, 2, 10); c.fillStyle = '#8a7a4a'; c.beginPath(); c.arc(p.x, p.y - 13, 3, 0, 7); c.fill(); c.fillStyle = '#f1e6d0'; c.fillRect(p.x - 6, p.y - 9, 12, 5); },
    kadavu: p => { c.fillStyle = '#8a5a3a'; for (let i = 0; i < 3; i++) c.fillRect(p.x - 12 + i * 2, p.y - 6 + i * 3, 24 - i * 4, 2.5); },
    pally: p => { c.fillStyle = '#f6f1e6'; c.fillRect(p.x - 12, p.y - 6, 24, 12); for (const dx of [-9, 9]) { c.fillRect(p.x + dx - 3, p.y - 16, 6, 12); c.fillStyle = '#c8322a'; c.beginPath(); c.moveTo(p.x + dx - 4, p.y - 16); c.lineTo(p.x + dx + 4, p.y - 16); c.lineTo(p.x + dx, p.y - 21); c.fill(); c.fillStyle = '#f6f1e6'; } c.fillStyle = '#2b2118'; c.fillRect(p.x - .5, p.y - 24, 1, 6); c.fillRect(p.x - 2, p.y - 22, 4, 1); },
    masjid: p => { c.fillStyle = '#f6f1e6'; c.fillRect(p.x - 13, p.y - 4, 26, 10); c.fillStyle = '#b8603c'; c.fillRect(p.x - 15, p.y - 8, 30, 4); c.fillRect(p.x - 8, p.y - 14, 16, 3); c.fillStyle = '#f6f1e6'; c.fillRect(p.x - 6, p.y - 11, 12, 3); c.fillRect(p.x + 10, p.y - 16, 5, 12); c.fillStyle = '#2f6a4a'; c.fillRect(p.x - 2, p.y - 2, 4, 8); c.fillStyle = '#c9962e'; c.fillRect(p.x + 12, p.y - 19, 1, 3); },
    station: p => { c.fillStyle = '#f1dfa8'; c.fillRect(p.x - 12, p.y - 4, 24, 8); c.fillStyle = '#b8603c'; c.fillRect(p.x - 13, p.y - 8, 26, 4); c.fillStyle = '#2a2a30'; c.fillRect(p.x - 34, p.y + 32, 14, 7); c.fillStyle = '#c8322a'; c.fillRect(p.x - 34, p.y + 32, 14, 2); c.fillStyle = '#8a2a1c'; c.fillRect(p.x - 18, p.y + 33, 12, 6); },
    kadappuram: p => { c.fillStyle = '#e8d8b0'; c.beginPath(); c.ellipse(p.x, p.y + 6, 22, 7, 0, 0, 7); c.fill(); miniPalm(c, p.x + 16, p.y + 4, .9, -5); c.save(); c.translate(p.x - 6, p.y + 4); c.rotate(-.1); for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? '#a67c4a' : '#8a6a3a'; c.fillRect(-10, -3 + i * 2.2, 20, 2); } c.restore(); },
    ara: p => { c.fillStyle = '#5a3a22'; c.fillRect(p.x - 6, p.y - 4, 12, 8); c.fillStyle = '#c9962e'; c.fillRect(p.x - 1, p.y - 1, 2, 2); },
    adukkala: p => { c.fillStyle = '#8a4a30'; c.fillRect(p.x - 7, p.y - 2, 14, 6); c.fillStyle = 'rgba(200,200,200,.5)'; c.beginPath(); c.arc(p.x - 2, p.y - 8, 2.5, 0, 7); c.arc(p.x + 2, p.y - 12, 3, 0, 7); c.fill(); },
    thattinpuram: p => { c.fillStyle = '#6b4226'; c.beginPath(); c.moveTo(p.x - 9, p.y + 4); c.lineTo(p.x + 9, p.y + 4); c.lineTo(p.x, p.y - 6); c.fill(); c.fillStyle = '#f1e4c8'; c.fillRect(p.x - 1.5, p.y - 1, 3, 3); },
    poomukham: p => { c.fillStyle = '#c9962e'; c.fillRect(p.x - .8, p.y - 10, 1.6, 10); for (const d of [-8, -5, -2]) { c.beginPath(); c.ellipse(p.x, p.y + d, 3 - (d + 8) * .15, 1.2, 0, 0, 7); c.fill(); } },
    kulam: () => {}, thodi: () => {}, nadumuttam: () => {}
  };
  // palms scattered like a child draws them
  for (const [fx, fy, s, l] of [[.9, .3, 1, 6], [.95, .45, .8, -5], [.04, .42, .9, 5], [.3, .6, .8, -4], [.6, .78, .9, 5], [.1, .86, .8, -5], [.5, .9, .7, 4], [.36, .3, .7, 3]]) miniPalm(c, px + fx * pw, py + fy * ph, s, l);
  for (const p of PLACES) { const q = pos(p, L); (land[p.id] || (() => {}))(q); }
  // names: the place in a round hand, the Malayalam beneath (or alone)
  for (const p of PLACES) { const q = pos(p, L), home = !!p.home; const dy = p.id === 'kadappuram' ? 18 : p.id === 'station' ? 16 : 14;
    if (ml) text(c, p.ml, q.x, q.y + dy + 1, home ? 9.5 : 10.5, '#2b2118', 'center', FONT_ML);
    else { text(c, p.n, q.x, q.y + dy, home ? 9.5 : 10.5, '#2b2118', 'center', FONT); const sl = sub(p.ml); if (sl) text(c, sl, q.x, q.y + dy + 11, 8, 'rgba(43,33,24,.6)', 'center', FONT, mode() === 'en' ? 'italic' : ''); } }
  // title block, compass, legend
  text(c, 'ഗ്രാമം', px + pw * .84, py + ph * .055, 22, '#2b2118', 'center', FONT_ML);
  text(c, ml ? 'ഓർമ്മയിലെ ഗ്രാമം' : 'the village, as I remember it', px + pw * .84, py + ph * .085, 9.5, 'rgba(43,33,24,.65)', 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic');
  { const cx = px + pw * .93, cy = py + ph * .79, r = 11; pencil(c, 'rgba(43,33,24,.6)', 1); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + 3, cy); c.lineTo(cx, cy + r); c.lineTo(cx - 3, cy); c.closePath(); c.fillStyle = '#a3522f'; c.fill(); text(c, ml ? 'വ' : 'N', cx, cy - r - 7, 8, 'rgba(43,33,24,.7)', 'center', ml ? FONT_ML : FONT); }
  text(c, ml ? 'ഒരു സ്ഥലം തൊടുക · നടന്നെത്താം' : 'tap a place · you walk there', px + pw / 2, py + ph - 10, 9.5, 'rgba(43,33,24,.6)', 'center', ml ? FONT_ML : FONT, ml ? '' : 'italic');
  c.restore();
}
export function drawMap(c, w, h, safeTop, safeBottom) {
  if (!map.open) return;
  const L = layout(w, h, safeTop, safeBottom), key = `${w}|${h}|${safeTop}|${safeBottom}|${mode()}`;
  if (!paper || paperKey !== key) { paper = makeLayer(w, h); paintPaper(paper.x, L, w, h); paperKey = key; }
  c.save(); c.fillStyle = 'rgba(20,12,6,.6)'; c.fillRect(0, 0, w, h);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 24; c.fillStyle = '#e8dab6'; c.beginPath(); c.roundRect(L.px, L.py, L.pw, L.ph, 5); c.fill(); c.shadowBlur = 0;
  c.drawImage(paper.c, 0, 0, w, h);
  // you are here: a small brass lamp with a live flame on the place you stand
  const t = performance.now() / 1000, here = P_(state.scene); if (here) { const q = pos(here, L); const fl = 1 + Math.sin(t * 11) * .1; glow(c, q.x, q.y - 22, 22, '#ffa040', .45); c.fillStyle = '#c9962e'; c.fillRect(q.x - 1, q.y - 22, 2, 10); c.beginPath(); c.ellipse(q.x, q.y - 12, 5, 1.6, 0, 0, 7); c.fill(); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(q.x - 2.2, q.y - 22); c.quadraticCurveTo(q.x - 2.4, q.y - 28 * fl, q.x, q.y - 31 * fl); c.quadraticCurveTo(q.x + 2.4, q.y - 28 * fl, q.x + 2.2, q.y - 22); c.fill(); c.fillStyle = '#fff2c0'; c.beginPath(); c.ellipse(q.x, q.y - 24, 1, 2.2, 0, 0, 7); c.fill(); }
  // what is happening now: a speech mark where someone has something to say, a flag at the temple in the utsavam, smoke at the station when the train has been called
  const f = fest(), marks = [];
  for (const [id, place] of [['velayudhan', 'chayakkada'], ['kunjappan', 'kada'], ['pappan', 'kadavu'], ['kids', 'pallikkoodam'], ['ammini', 'thodi']]) if (anyDue(id)) marks.push([place, 'talk']);
  if (f.utsavam) marks.push(['ambalam', 'fest']); if (f.onam) marks.push(['poomukham', 'fest']); if (f.christmasWeek || f.perunnal) marks.push(['pally', 'fest']); if (f.eid || f.bakrid || (f.ramzan && t % 1 > .5)) marks.push(['masjid', 'fest']); if (f.chanta) marks.push(['angadi', 'fest']);
  for (const [place, kind] of marks) { if (place === state.scene) continue; const q = pos(P_(place), L), a = .6 + .3 * Math.sin(t * 3 + q.x); c.save(); c.globalAlpha = a; if (kind === 'talk') { c.strokeStyle = '#a3522f'; c.lineWidth = 1.2; c.beginPath(); c.arc(q.x + 14, q.y - 16, 6, 0, 7); c.stroke(); circle(c, q.x + 12, q.y - 17, 1, '#a3522f'); circle(c, q.x + 16, q.y - 17, 1, '#a3522f'); } else { c.fillStyle = '#d8402c'; c.beginPath(); c.moveTo(q.x + 14, q.y - 22); c.lineTo(q.x + 24, q.y - 19); c.lineTo(q.x + 14, q.y - 16); c.fill(); c.fillStyle = '#c9962e'; c.fillRect(q.x + 13, q.y - 23, 1.2, 12); } c.restore(); }
  text(c, pick('close', 'അടയ്ക്കുക'), L.px + L.pw / 2, L.py + L.ph + 30, 13, '#fff7e6', 'center', lang() === 'ml' ? FONT_ML : FONT);
  c.restore();
}
export function mapTap(p, w, h, safeTop, safeBottom) {
  const { px, py, pw, ph } = layout(w, h, safeTop, safeBottom);
  for (const pl of PLACES) { const x = px + pl.x * pw, y = py + pl.y * ph; if (Math.hypot(p.x - x, p.y - y) < 26) { map.open = false; return pl.id; } }
  map.open = false; audio.sfx('page'); return null;
}
export function drawMapIcon(c, x, y) { // small folded map
  c.save(); c.translate(x, y); c.fillStyle = '#f1e4c8'; c.beginPath(); c.moveTo(-11, -8); c.lineTo(-4, -11); c.lineTo(4, -8); c.lineTo(11, -11); c.lineTo(11, 8); c.lineTo(4, 11); c.lineTo(-4, 8); c.lineTo(-11, 11); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(100,70,40,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -11); c.lineTo(-4, 8); c.moveTo(4, -8); c.lineTo(4, 11); c.stroke(); c.strokeStyle = '#a3522f'; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(-8, 4); c.quadraticCurveTo(0, -4, 8, 0); c.stroke(); c.restore();
}
