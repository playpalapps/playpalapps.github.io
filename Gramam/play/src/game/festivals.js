import { clock } from './clock.js';
// Real-mode anchors (verified for 2025–2027, approximate after): Thiruvonam, Vishu, Thiruvathira, Makaram 1.
const THIRUVONAM = { 2025: [9, 5], 2026: [8, 26], 2027: [9, 12], 2028: [9, 1], 2029: [8, 22], 2030: [9, 9], 2031: [8, 29] };
const VISHU = { 2026: [4, 15], 2027: [4, 15] };
const EID = { 2026: [3, 20], 2027: [3, 9], 2028: [2, 26], 2029: [2, 14] }, BAKRID = { 2026: [5, 27], 2027: [5, 16], 2028: [5, 5], 2029: [4, 24] }, RAMZAN = { 2026: [2, 18], 2027: [2, 8], 2028: [1, 28], 2029: [1, 16] }; // approximate: the moon decides
const VIJAYADASHAMI = { 2025: [10, 2], 2026: [10, 20], 2027: [10, 9], 2028: [9, 27], 2029: [10, 17], 2030: [10, 6] };
const THIRUVATHIRA = { 2025: [12, 5], 2026: [12, 24], 2027: [12, 23], 2028: [12, 12] };
function key(m, d) { return m * 100 + d; }
function today() { const n = new Date(); return { y: n.getFullYear(), k: key(n.getMonth() + 1, n.getDate()), dow: n.getDay(), n }; }
function daysBetween(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
export function fest() {
  const m = clock.month, d = clock.day, h = clock.hour, real = clock.mode === 'real';
  let onamIdx = 0, thiruvonam, uthradam, uthrattathi, pulikali = false, vijayadashami = false, vishu, vishuEve, thiruvathira, christmas, christmasWeek, chanta, schoolDay, eid = false, bakrid = false, ramzan = false;
  if (real) {
    const T = today(); const tv = THIRUVONAM[T.y] || [9, 1]; const tvDate = new Date(T.y, tv[0] - 1, tv[1]); const diff = daysBetween(T.n, tvDate); // days until Thiruvonam
    onamIdx = diff >= 0 && diff <= 9 ? 10 - diff : 0; thiruvonam = diff === 0; uthradam = diff === 1; uthrattathi = diff === -1; pulikali = diff === -3;
    const vd = VIJAYADASHAMI[T.y] || [10, 10]; vijayadashami = T.k === key(vd[0], vd[1]);
    const vs = VISHU[T.y] || [4, 14]; vishu = T.k === key(vs[0], vs[1]); const ve = new Date(T.y, vs[0] - 1, vs[1] - 1); vishuEve = T.k === key(ve.getMonth() + 1, ve.getDate());
    const ta = THIRUVATHIRA[T.y] || [12, 24]; thiruvathira = T.k === key(ta[0], ta[1]);
    christmas = T.k === key(12, 25); christmasWeek = T.k >= key(12, 18) && T.k <= key(12, 31); chanta = T.dow === 3; schoolDay = T.dow !== 0;
    const e = EID[T.y], b = BAKRID[T.y], r = RAMZAN[T.y]; if (e) eid = T.k === key(e[0], e[1]); if (b) bakrid = T.k === key(b[0], b[1]); if (r && e) { const rs = new Date(T.y, r[0] - 1, r[1]), ed = new Date(T.y, e[0] - 1, e[1]); ramzan = T.n >= rs && T.n < ed; }
  } else {
    onamIdx = m === 0 && d >= 13 && d <= 22 ? d - 12 : 0; thiruvonam = m === 0 && d === 22; uthradam = m === 0 && d === 21; uthrattathi = m === 0 && d === 23; pulikali = m === 0 && d === 25; vijayadashami = m === 1 && d === 24;
    ramzan = m === 6; eid = m === 7 && d === 1; bakrid = m === 9 && d === 10;
    vishuEve = m === 7 && d === 30; vishu = m === 8 && d === 1; thiruvathira = m === 4 && d === 15; christmas = m === 4 && d === 10; christmasWeek = m === 4 && d >= 4 && d <= 16; chanta = (d + m) % 7 === 3; schoolDay = d % 7 !== 0;
  }
  return {
    onam: onamIdx > 0, onamDay: onamIdx, thiruvonam, uthradam, uthrattathi, pulikali, vijayadashami,
    vishuEve, vishu, thiruvathira, dhanu: m === 4,
    karkidakam: m === 11, vavu: m === 11 && d === 15,
    utsavam: m === 6 && d >= 20 && d <= 22, utsavamMain: m === 6 && d === 22,
    harvest: m === 5 && d >= 5 && d <= 20, ploughing: m === 9 && d <= 20, planting: m === 10 && d >= 5 && d <= 20, paddyGreen: m >= 10 || m <= 3, paddyGold: m === 4 || (m === 5 && d < 5),
    konna: m === 8 ? 1 : (m === 7 && d > 20 ? (d - 20) / 10 : 0),
    mango: m === 7 || m === 8, jackfruit: m === 8 || m === 9 || m === 10,
    monsoon: m === 9 || m === 10 || m === 11, mistMorning: (m === 3 || m === 4 || m === 5) && h < 8.5,
    fullMoon: clock.moon > .9, newMoon: clock.moon < .1,
    wedding: m === 1 && d === 18, christmas, christmasWeek, eid, bakrid, ramzan, perunnal: m === 5 && d === 24, theyyam: m === 5 && d === 10, chanta, schoolDay
  };
}
// the next Uthradam (eve of Thiruvonam) and Vishu eve as real dates, for reminders
export function upcoming() {
  const n = new Date(), y = n.getFullYear(), out = {};
  for (const yy of [y, y + 1]) { const tv = THIRUVONAM[yy] || [9, 1], d = new Date(yy, tv[0] - 1, tv[1] - 1); if (d > n && !out.uthradam) out.uthradam = d; const vs = VISHU[yy] || [4, 14], v = new Date(yy, vs[0] - 1, vs[1] - 1); if (v > n && !out.vishuEve) out.vishuEve = v; }
  return out;
}
export const MONTH_NOTE = ['Chingam. Onam is coming; the courtyard waits for flowers.', 'Kanni. The rains thin out and the paddy turns.', 'Thulam. Thulavarsham: afternoon thunder and quick rain.', 'Vrischikam. Cool mornings; pilgrims in black pass on the road.', 'Dhanu. Mist on the paddy at dawn. Thiruvathira night is near.', 'Makaram. Harvest. The whole village is in the field.', 'Kumbham. The temple utsavam; chenda from across the paddy.', 'Meenam. Hot. Mangoes. The pond is lower every day.', 'Medam. Vishu. The konna has turned to gold.', 'Edavam. The first rain breaks the heat. Ploughing begins.', 'Mithunam. Monsoon proper. Women sing in the flooded field.', 'Karkidakam. The lean month. Ramayanam in the evenings, kanji at night.'];
