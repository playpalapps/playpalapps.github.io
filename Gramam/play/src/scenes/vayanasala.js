import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { person, mangoTree } from '../art/lib.js';
import { state, remember, save } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';
import { haptics } from '../engine/haptics.js';

import { talk } from '../game/dialogue.js';
import { fest } from '../game/festivals.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';

export const BOOKS = [
  { t: 'Chemmeen', a: 'Thakazhi', ml: 'ചെമ്മീൻ', note: 'Karuthamma and Pareekutty on the beach, the sea keeping its own accounts. Read it on the charupadi in two sittings and did not speak for an hour.' },
  { t: 'Naalukettu', a: 'M. T. Vasudevan Nair', ml: 'നാലുകെട്ട്', note: 'Appunni and the tharavad that will not have him. Too close to home, which is the point of it.' },
  { t: 'Balyakalasakhi', a: 'Basheer', ml: 'ബാല്യകാലസഖി', note: 'Majeed and Suhra. One and one is “immini balya onnu”. Laughed, then did not.' },
  { t: 'Khasakkinte Itihasam', a: 'O. V. Vijayan', ml: 'ഖസാക്കിന്റെ ഇതിഹാസം', note: 'Ravi arrives in Khasak and time stops behaving. Read a page, looked at the paddy, read it again.' },
  { t: 'Pathummayude Aadu', a: 'Basheer', ml: 'പാത്തുമ്മായുടെ ആട്', note: 'A goat eats a manuscript. The funniest book in the language and somehow also about everything.' },
  { t: 'Ummachu', a: 'Uroob', ml: 'ഉമ്മാച്ചു', note: 'Ummachu and Mayan, a whole life in a Malabar village. Finished it by kerosene lamp.' },
  { t: 'Oru Desathinte Katha', a: 'S. K. Pottekkatt', ml: 'ഒരു ദേശത്തിന്റെ കഥ', note: 'Athiranippadam, a village of a hundred small lives. Our village, with the names changed.' },
  { t: 'Yakshi', a: 'Malayattoor', ml: 'യക്ഷി', note: 'Did not read it after dark. Read it after dark. Regretted it, in the good way.' },
  { t: 'Agnisakshi', a: 'Lalithambika Antharjanam', ml: 'അഗ്നിസാക്ഷി', note: 'Thethikutty walks out of the illam and into history. Ammamma would have had opinions.' },
  { t: 'Kaalam', a: 'M. T. Vasudevan Nair', ml: 'കാലം', note: 'Sethu, leaving and returning and leaving. I know him.' }
];
export class Vayanasala extends Scene {
  constructor() {
    super('vayanasala', 'Vayanasala', 'വായനശാല'); this.outdoor = false; this.carromT = 0; this.strikes = 0; this.pocketed = 0; this.aim = null; this.setupBoard();
    this.hotspots = [
      { x: 110, y: 400, r: 60, label: 'books', action: () => this.borrow() },
      { x: 280, y: 510, r: 40, label: 'newspapers', action: () => this.paper() },
      { x: 190, y: 660, r: 64, label: 'carrom · flick the striker', drag: p => this.flick(p), action: () => {} },
      { x: 310, y: 356, r: 34, label: 'notice board', action: () => this.notice() },
      { x: 60, y: 580, r: 36, label: 'librarian', action: () => this.librarian() },
    ];
    this.exits = [{ side: 'left', y: 640, label: 'Kada', go: () => router.go('kada') }, { side: 'bottom', label: 'Idavazhi · home', go: () => router.go('poomukham') }];
  }
  enter() { super.enter(); did('library'); }
  borrow() {
    if (state.bookBorrowed !== null && state.bookBorrowed !== undefined) { const b = BOOKS[state.bookBorrowed]; if (state.booksRead[b.t]) { audio.sfx('page'); say(pick(`You return ${b.t}. The librarian stamps the card and says nothing, which from him is praise.`, `${b.ml} തിരിച്ചു കൊടുത്തു. ലൈബ്രേറിയൻ കാർഡിൽ സീൽ അടിച്ചു, ഒന്നും പറഞ്ഞില്ല; അയാളുടെ കാര്യത്തിൽ അതു പ്രശംസയാണ്.`), 'തിരിച്ചു കൊടുത്തു'); state.bookBorrowed = null; save(); } else say(pick(`You still have ${b.t} at home. Read it on the charupadi first.`, `${b.ml} ഇപ്പോഴും വീട്ടിലുണ്ട്. ആദ്യം അത് ചാരുപടിയിലിരുന്ന് വായിക്കൂ.`), 'പുസ്തകം'); return; }
    const next = BOOKS.findIndex(b => !state.booksRead[b.t]); if (next < 0) { say('You have read everything on the shelf. The librarian is ordering more from Kottayam.', 'വായനശാല'); return; }
    const b = BOOKS[next]; state.bookBorrowed = next; save(); audio.sfx('page'); say(pick(`You borrow ${b.t} by ${b.a}. The card in the back has your Achan’s name on it, twice.`, `${t(b.a)}യുടെ ${b.ml} എടുത്തു. പിന്നിലെ കാർഡിൽ അച്ഛന്റെ പേരുണ്ട്, രണ്ടു തവണ.`), b.ml); remember('library', 'Joined the vayanasala again. Vayichu valaruka, says the board over the door: read and grow. The Grandhasala Sangham built these in every village and it shows.');
  }
  paper() { this.busy = true; clock.speed = 12; audio.sfx('page'); const news = ['Three papers on the long table, each with a stone on it. The Deshabhimani and the Manorama disagree about everything except the weather.', 'A letter to the editor about the bus timings, signed by someone you went to school with.', 'The film page: Sathyan and Sheela at the talkies in town. Below it, paddy prices, going the wrong way.']; say(news[(state.days + 1) % news.length], 'പത്രം', 5); delay(4.2, () => { clock.speed = 1; this.busy = false; state.libraryDay = clock.day; }); }
  // The call to action: a real board. Pull the striker back and let go; coins click, pockets swallow, the boys keep score out loud.
  setupBoard() { this.pieces = [{ x: 190, y: 681, vx: 0, vy: 0, r: 5.2, c: '#f0dcb0', striker: true }, { x: 190, y: 656, vx: 0, vy: 0, r: 4, c: '#c8322a', queen: true }]; const ring = [[-9, -5, '#1a1a1a'], [9, -5, '#f1e4c8'], [0, -10, '#1a1a1a'], [-9, 5, '#f1e4c8'], [9, 5, '#1a1a1a'], [0, 10, '#f1e4c8']]; for (const [dx, dy, c] of ring) this.pieces.push({ x: 190 + dx, y: 656 + dy, vx: 0, vy: 0, r: 4, c }); this.strikes = 0; this.pocketedNow = 0; }
  flick(p) {
    const self = this, st = this.pieces.find(q => q.striker); if (!st || Math.hypot(p.x - st.x, p.y - st.y) > 22 || this.moving()) { let moved = 0; const x0 = p.x, y0 = p.y; return { move(q) { moved = Math.max(moved, Math.hypot(q.x - x0, q.y - y0)); }, end() { if (moved < 10) say(self.moving() ? 'Wait for the coins to stop.' : 'Put a finger on the striker, pull back, and let go.', 'കാരംസ്'); } }; }
    return {
      move(q) { const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy), m = Math.min(d, 56); self.aim = d > 2 ? { x: dx / d * m, y: dy / d * m, k: m / 56 } : null; },
      end() { const a = self.aim; self.aim = null; if (!a || a.k < .12) { say('Pull the striker back a little further, then let go.', 'കാരംസ്'); return; } st.vx = a.x * 4.6; st.vy = a.y * 4.6; self.strikes++; audio.sfx('strike'); haptics.light(); }
    };
  }
  moving() { return this.pieces.some(q => q.vx || q.vy); }
  board(dt) {
    const L = 128, R = 252, T = 634, B = 686, P = [[L, T], [R, T], [L, B], [R, B]]; let clickT = (this.clickT || 0) - dt; const gone = [];
    for (const q of this.pieces) { if (!q.vx && !q.vy) continue; q.x += q.vx * dt; q.y += q.vy * dt; const f = Math.pow(.22, dt); q.vx *= f; q.vy *= f; if (Math.hypot(q.vx, q.vy) < 2.5) { q.vx = q.vy = 0; }
      for (const [px, py] of P) if (Math.hypot(q.x - px, q.y - py) < 9) { gone.push(q); break; }
      if (q.x - q.r < L) { q.x = L + q.r; q.vx = -q.vx * .55; } if (q.x + q.r > R) { q.x = R - q.r; q.vx = -q.vx * .55; } if (q.y - q.r < T) { q.y = T + q.r; q.vy = -q.vy * .55; } if (q.y + q.r > B) { q.y = B - q.r; q.vy = -q.vy * .55; } }
    for (let i = 0; i < this.pieces.length; i++) for (let j = i + 1; j < this.pieces.length; j++) { const a = this.pieces[i], b = this.pieces[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001, min = a.r + b.r; if (d >= min) continue; const nx = dx / d, ny = dy / d, ov = (min - d) / 2; a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov; const ma = a.striker ? 1.6 : 1, mb = b.striker ? 1.6 : 1, va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny; if (va - vb <= 0) continue; const na = (va * (ma - mb) + 2 * mb * vb) / (ma + mb), nb = (vb * (mb - ma) + 2 * ma * va) / (ma + mb); a.vx += (na - va) * nx; a.vy += (na - va) * ny; b.vx += (nb - vb) * nx; b.vy += (nb - vb) * ny; if (clickT <= 0 && va - vb > 18) { audio.sfx('strike'); clickT = .08; } }
    this.clickT = clickT;
    for (const q of gone) { if (q.striker) { q.x = 190; q.y = 681; q.vx = q.vy = 0; say('The striker in the pocket. The boy on the left says nothing, loudly.', 'കാരംസ്', 3); continue; } this.pieces.splice(this.pieces.indexOf(q), 1); this.pocketed++; this.pocketedNow++; audio.sfx('pocket'); haptics.success(); if (this.pocketed === 1) { say(q.queen ? 'The queen, first shot. The boys look at each other.' : 'Pocketed. The boy on the left pretends not to care.', 'കാരംസ്', 4); remember('carrom', 'Carrom at the vayanasala. The board has a crack across it from the year of the big argument about the queen, and my thumb remembered before I did.'); } else if (q.queen) say('The queen. Now cover it, says the small one, who knows the rules better than you.', 'കാരംസ്', 4); }
    const coinsLeft = this.pieces.filter(q => !q.striker).length;
    if ((coinsLeft === 0 || this.strikes >= 10) && !this.moving() && !this.resetT) { this.resetT = 1; delay(2.2, () => { this.resetT = 0; const won = coinsLeft === 0; say(won ? 'The board cleared. The boys set it up again and this time they are not letting you win.' : 'The boys set the board again. Powder on your fingers for the rest of the day.', 'കാരംസ്', 5); this.setupBoard(); }); }
  }
  notice() { const f = fest(); audio.sfx('page'); const n = f.onam ? 'ONAM PROGRAMME: Pookalam competition, vadam vali (tug of war), kathaprasangam by Sambasivan on Uthradam night. All are welcome. Tea.' : f.utsavam ? 'UTSAVAM: Kathakali at the ambalam, 9 pm, Duryodhanavadham. Do not bring children who sleep.' : 'Reading on Sunday evening. Library committee meeting. Drama rehearsal Tuesdays: NINGALENNE COMMUNISTAKKI, parts still available.'; say(n, 'അറിയിപ്പ്', 6); }
  librarian() { talk([['The librarian, without looking up: “Your father read Chemmeen the week it came. Then he read it to your mother. Then she read it to him, properly.”', 'ലൈബ്രേറിയൻ'], ['“The Sangham sends a box every month from Kottayam. Half of it is poetry. Nobody admits to reading the poetry. It is always gone.”', 'ലൈബ്രേറിയൻ']]); }
  tick(dt) { this.board(dt); }
  ambience() { return { murmur: .08, wind: .08, koel: (clock.month === 7 || clock.month === 8) ? .25 : 0 }; }
  glows() { return clock.daylight < .6 ? [{ x: 220, y: 300, r: 190, a: .85 }] : []; }
  drawStatic(c, w, h) {
    // whitewashed room with wooden shelves, window right, long reading table, benches
    rect(c, 0, 0, w, 560, vgrad(c, 0, 0, 560, [[0, '#c9bea0'], [.3, P.lime], [1, P.limeDk]])); rect(c, 0, 0, w, 36, '#8a7a5a');
    // board over the door: VAYICHU VALARUKA
    rect(c, 70, 96, 220, 34, '#2d6b5a'); text(c, 'വായിച്ചു വളരുക', 180, 108, 12, '#f1e4c8', 'center', 'sans-serif'); text(c, 'GRANDHASALA SANGHAM', 180, 123, 7, '#f1e4c8', 'center', 'sans-serif');
    // bookshelves left (4 rows)
    rect(c, 20, 140, 190, 300, P.teakDk); for (let r = 0; r < 5; r++) { const y = 146 + r * 58; rect(c, 26, y + 50, 178, 6, P.teak); let x = 30; while (x < 196) { const bw = 7 + hash(x + r * 13) * 8, col = ['#8a2a1c', '#2a3a8a', '#2d6b5a', '#e0b43a', '#5a3a22', '#f1e4c8', '#c8322a', '#1a1a1a'][Math.floor(hash(x * 3 + r) * 8)]; rect(c, x, y + 8 + hash(x + r) * 6, bw, 42 - hash(x + r) * 6, col); rect(c, x + 1, y + 20, bw - 2, 1.2, 'rgba(255,255,255,.4)'); x += bw + 1.5; } }
    // portrait of P. N. Panicker-style figure with garland and a Gandhi picture
    rect(c, 236, 140, 50, 62, '#3a2a1c'); rect(c, 240, 144, 42, 54, '#e8dcc0'); circle(c, 261, 164, 9, '#2a1a10'); ellipse(c, 261, 182, 12, 12, '#f1e6d0'); c.strokeStyle = '#d8c89a'; c.lineWidth = 2; c.beginPath(); c.moveTo(238, 142); c.quadraticCurveTo(261, 210, 284, 142); c.stroke();
    rect(c, 296, 142, 44, 56, '#3a2a1c'); rect(c, 300, 146, 36, 48, '#e8dcc0'); circle(c, 318, 164, 8, '#f0d8c0'); c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.arc(315, 164, 2.5, 0, 7); c.arc(321, 164, 2.5, 0, 7); c.stroke();
    // window right with mango tree outside
    rect(c, 262, 216, 90, 100, P.teakDk); rect(c, 268, 222, 78, 88, '#9fc27a'); c.save(); c.beginPath(); c.rect(268, 222, 78, 88); c.clip(); mangoTree(c, 306, 330, .55, 0, fest().mango); c.restore(); c.fillStyle = P.teakLt; for (let i = 0; i < 4; i++) c.fillRect(276 + i * 18, 222, 4, 88); rect(c, 262, 316, 90, 8, P.teak);
    // notice board
    rect(c, 270, 326, 80, 60, '#5a3a22'); rect(c, 274, 330, 72, 52, '#8a7a4a'); for (let i = 0; i < 4; i++) rect(c, 278 + (i % 2) * 34, 334 + Math.floor(i / 2) * 24, 30, 20, i % 3 ? '#f1e4c8' : '#e0b43a'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let i = 0; i < 8; i++) c.fillRect(281 + (i % 2) * 34, 338 + Math.floor(i / 2) * 6 + (i > 3 ? 12 : 0), 24, .8);
    // long reading table with newspapers and stone weights
    rect(c, 200, 500, 150, 12, P.teakLt); rect(c, 200, 512, 150, 6, P.teakDk); rect(c, 210, 518, 8, 60, P.teak); rect(c, 332, 518, 8, 60, P.teak);
    for (let i = 0; i < 3; i++) { c.save(); c.translate(236 + i * 44, 496); c.rotate((i - 1) * .08); rect(c, -22, -8, 44, 14, P.paper); c.fillStyle = 'rgba(43,33,24,.5)'; for (let k = 0; k < 5; k++) c.fillRect(-18, -5 + k * 2.6, 34 - (k % 2) * 8, .9); c.fillRect(-18, -7, 34, 1.5); c.restore(); circle(c, 236 + i * 44, 494, 4, P.stoneDk); }
    // librarian's desk left front, with ledger and stamp
    rect(c, 20, 560, 100, 12, P.teakLt); rect(c, 20, 572, 100, 50, P.teak); rect(c, 30, 548, 40, 14, '#8a2a1c'); rect(c, 80, 552, 12, 10, '#222');
    // floor
    rect(c, 0, 622, w, h - 622, vgrad(c, 0, 622, h, [[0, '#7a2e22'], [1, '#4e1c14']])); rect(c, 0, 618, w, 6, '#3a1a12'); rect(c, 120, 560, w, 62, '#7a2e22');
    // carrom board on a stand (bottom centre)
    const bx = 190, by = 660; shadow(c, bx, by + 40, 60, 10, .35); poly(c, [[bx - 60, by - 30], [bx + 60, by - 30], [bx + 72, by + 30], [bx - 72, by + 30]], '#f0dcb0'); c.strokeStyle = '#1a1a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 64, by - 30); c.lineTo(bx + 64, by - 30); c.lineTo(bx + 76, by + 30); c.lineTo(bx - 76, by + 30); c.closePath(); c.stroke(); for (const [dx, dy] of [[-54, -24], [54, -24], [-64, 24], [64, 24]]) circle(c, bx + dx, by + dy, 6, '#1a1a1a'); circle(c, bx, by, 14, '#c8322a'); circle(c, bx, by, 9, '#f0dcb0');
    c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 1; c.strokeRect(128, 634, 124, 52); for (const [px, py] of [[128, 634], [252, 634], [128, 686], [252, 686]]) circle(c, px, py, 6, '#1a1a1a'); c.beginPath(); c.arc(bx, 660, 12, 0, 7); c.stroke(); for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(136, 676 + i * 4); c.lineTo(244, 676 + i * 4); c.stroke(); }
    rect(c, bx - 8, by + 30, 16, 40, P.teak);
    // bench by the window
    rect(c, 220, 600, 130, 8, P.teakLt); rect(c, 230, 608, 6, 20, P.teak); rect(c, 334, 608, 6, 20, P.teak);
    // kerosene lamp on a wall bracket
    rect(c, 230, 300, 14, 4, '#444'); rect(c, 232, 282, 10, 18, 'rgba(255,240,210,.35)');
  }
  drawDynamic(c, w, h) {
    const t = this.t, ph = clock.phase;
    person(c, 60, 560, 1, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', skin: '#9c6a48' }, t);
    c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.arc(56, 492, 3, 0, 7); c.arc(65, 492, 3, 0, 7); c.stroke();
    if (ph !== 'rathri' && ph !== 'velupp') { person(c, 290, 600, .9, { sex: 'm', top: '#e0e0e0', mundu: '#f3ecd8', pose: 'sit', item: 'paper', flip: true }, t); person(c, 130, 690, .85, { sex: 'boy', top: '#e0b43a', mundu: '#6a7fa0', pose: 'sit' }, t); person(c, 250, 700, .85, { sex: 'boy', top: '#c8322a', mundu: '#f3ecd8', pose: 'sit', flip: true }, t); }
    // carrom pieces, shadows first; the aim line while pulling back
    for (const q of this.pieces) ellipse(c, q.x + 1, q.y + 1.5, q.r, q.r * .7, 'rgba(0,0,0,.25)');
    for (const q of this.pieces) { circle(c, q.x, q.y, q.r, q.c); if (q.striker) { c.strokeStyle = '#8a6a3a'; c.lineWidth = 1; c.beginPath(); c.arc(q.x, q.y, q.r - 1.5, 0, 7); c.stroke(); } else circle(c, q.x - 1, q.y - 1, 1.2, 'rgba(255,255,255,.35)'); }
    if (this.aim) { const st = this.pieces.find(q => q.striker); if (st) { c.strokeStyle = `rgba(43,33,24,${.25 + this.aim.k * .4})`; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(st.x, st.y); c.lineTo(st.x + this.aim.x * 1.2, st.y + this.aim.y * 1.2); c.stroke(); c.setLineDash([]); } }
    if (clock.daylight < .6) { glow(c, 237, 290, 36, '#ffb050', .5); circle(c, 237, 292, 2, P.flameHi); }
  }
}
