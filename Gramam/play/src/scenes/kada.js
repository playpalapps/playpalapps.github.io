import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT } from '../art/draw.js';
import { person, jar, gunnySack, hurricaneLamp } from '../art/lib.js';
import { state, remember, save, note } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { found } from '../game/finds.js';

import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { add, ITEMS } from '../game/pantry.js';
import { HOUSE_ITEMS } from '../game/items.js';
import { t, pick, lang, FONT_ML } from '../i18n/t.js';
import { anyDue, playBeat, has } from '../game/people.js';

const GOODS = [
  { k: 'rice', x: 70, y: 690, label: 'matta rice', line: 'Two measures of matta rice from the sack, red and fat.' },
  { k: 'jaggery', x: 150, y: 700, label: 'sharkara', line: 'A block of dark sharkara wrapped in a dry leaf.' },
  { k: 'oil', x: 330, y: 470, label: 'velichenna', line: 'Coconut oil from the tin, poured into your bottle through a paper funnel.' },
  { k: 'tea', x: 120, y: 470, label: 'chayappodi', line: 'A paper cone of tea dust, Kannan Devan.' },
  { k: 'coffee', x: 160, y: 470, label: 'kaappippodi', line: 'Coffee powder, ground this morning, the whole shop smelling of it.' },
  { k: 'vegetables', x: 260, y: 690, label: 'pachakkari', line: 'Drumsticks, a yam, two brinjals, a bitter gourd, green chillies thrown in free.' },
  { k: 'flour', x: 210, y: 470, label: 'arippodi', line: 'Rice flour, roasted, for puttu and appam.' },
];
export class Kada extends Scene {
  constructor() {
    super('kada', 'Palacharakku kada', 'പലചരക്കുകട'); this.outdoor = false; this.bought = 0;
    this.hotspots = GOODS.map(g => ({ x: g.x, y: g.y, r: 30, label: g.label, action: () => this.buy(g) }));
    this.hotspots.push({ x: 310, y: 450, r: 44, label: 'Kunjappan', due: () => anyDue('kunjappan'), action: () => { if (!playBeat('kunjappan')) this.kunjappan(); } });
    this.hotspots.push({ x: 180, y: 540, r: 40, label: 'your list', enabled: () => Object.keys(state.shopping || {}).length > 0, action: () => this.buyList() });
    this.hotspots.push({ x: 262, y: 504, r: 30, label: 'pattu-pusthakam', enabled: () => state.ledger.length > 0 && fest().harvest, action: () => this.settle() });
    this.hotspots.push({ x: 60, y: 420, r: 34, label: 'things for the house', enabled: () => HOUSE_ITEMS.some(i => !state.items[i.id]), action: () => this.houseItem() });
    this.hotspots.push({ x: 40, y: 560, r: 26, label: 'Chandrika soap', action: () => { audio.sfx('tap'); say('A bar of Chandrika, green and smelling of a hundred herbs. Kunjappan writes it down.', 'ചന്ദ്രിക'); state.ledger.push({ m: clock.month, d: clock.day, text: 'Chandrika soap' }); remember('soap', 'Bought Chandrika soap at the kada. The smell of it is the smell of every bath of my childhood.'); } });
    this.exits = [{ side: 'left', y: 640, label: 'Chayakkada', go: () => router.go('chayakkada') }, { side: 'right', y: 640, label: 'Vayanasala', go: () => router.go('vayanasala') }];
  }
  enter() { super.enter(); if (state.shopDay !== clock.day) { state.shopDay = clock.day; this.bought = 0; } }
  buyList() {
    const L = Object.keys(state.shopping || {}); if (!L.length) return; this.busy = true; audio.sfx('page');
    delay(1, () => { const names = []; for (const k of L) { const n = Math.max(2, state.shopping[k] || 1); add(k, n); names.push(ITEMS[k][0].toLowerCase()); state.ledger.push({ m: clock.month, d: clock.day, text: ITEMS[k][0] }); } state.shopping = {}; save(); this.busy = false; audio.sfx('wood'); did('bought'); say(`Kunjappan reads the list back to you, slowly, weighs everything twice, and writes it all down: ${names.join(', ')}.`, 'ലിസ്റ്റ്', 5); remember('list', 'Took a list to Kunjappan’s. He read it back as if it were a court document and then gave me the kuzhalappam jar to hold while he weighed.'); });
  }
  buy(g) {
    if (this.bought >= 3) { say('Kunjappan: “Enough for today. The book has pages but my patience is thin.”', 'കുഞ്ഞപ്പൻ'); return; }
    this.busy = true; audio.sfx('wood'); delay(.8, () => { add(g.k, 2); this.bought++; did('bought'); state.ledger.push({ m: clock.month, d: clock.day, text: ITEMS[g.k][0] }); save(); this.busy = false; audio.sfx('page'); say(g.line + ' He writes it in the pattu-pusthakam.', ITEMS[g.k][1]); remember('kada', 'Kunjappan’s palacharakku kada: gunny sacks, glass jars, the brass scale, and the pattu-pusthakam where this house’s debts have been written and forgiven for three generations.'); });
  }
  houseItem() {
    if (state.itemDay === clock.day) { say('Kunjappan: \u201cOne big thing a day. The book is only so wide.\u201d', 'കുഞ്ഞപ്പൻ'); return; }
    const it = HOUSE_ITEMS.find(i => !state.items[i.id]); if (!it) return;
    this.busy = true; audio.sfx('wood'); delay(1, () => { state.items[it.id] = true; state.itemDay = clock.day; state.ledger.push({ m: clock.month, d: clock.day, text: it.name }); save(); this.busy = false; audio.sfx('page'); say(it.line + ' Written in the book.', it.ml, 5); remember('item_' + it.id, it.diary); });
  }
  kunjappan() { const lines = [['Kunjappan, over his glasses: “Your account is in your Amma’s name still. I see no reason to change it.”', 'കുഞ്ഞപ്പൻ'], ['“The rice is from Palakkad. The jaggery is from Marayur. The prices are from God.”', 'കുഞ്ഞപ്പൻ'], ['“Settle after the harvest, like everyone. A para of paddy for the whole page. Bring it to the kada, I will not come for it.”', 'കുഞ്ഞപ്പൻ'], ['“I have Parle-G now. The children want nothing else. Civilisation is ending.”', 'കുഞ്ഞപ്പൻ']]; talk([lines[(state.days + clock.day) % lines.length]]); }
  settle() { if ((state.pantry.paddy || 0) < 2) { say('You need two para of paddy to settle the page. The pathayam in the ara, or the harvest.', 'നെല്ല്'); return; } this.busy = true; audio.sfx('page'); delay(1.2, () => { state.pantry.paddy -= 2; const n = state.ledger.length; state.ledger = []; save(); this.busy = false; audio.sfx('coin'); say(pick(`Two para of paddy on the scale. Kunjappan draws a line under ${n} entries and writes your name again at the top of a new page.`, `രണ്ടു പറ നെല്ല് തുലാസിൽ. കുഞ്ഞപ്പൻ ${n} കണക്കുകൾക്കു താഴെ ഒരു വര വരച്ച്, പുതിയ പേജിന്റെ മുകളിൽ വീണ്ടും പേരെഴുതുന്നു.`), 'കണക്ക് തീർത്തു'); remember('settle', 'Settled the pattu-pusthakam after the harvest with paddy from our own field. Kunjappan did the sum twice, out loud, and rounded it down.'); }); }
  ambience() { return { murmur: .12, crows: .15, wind: .08 }; }
  glows() { return clock.daylight < .6 ? [{ x: 230, y: 360, r: 170, a: .85 }] : []; }
  drawStatic(c, w, h) {
    // interior: wooden shelves on the back wall floor to ceiling, counter in front, sacks on the floor
    rect(c, 0, 0, w, 560, vgrad(c, 0, 0, 560, [[0, '#3a2a1c'], [.3, '#5a4230'], [1, '#6a4e36']]));
    rect(c, 0, 0, w, 60, '#2a1c12');
    // shelves (4 rows)
    for (let r = 0; r < 4; r++) { const y = 150 + r * 70; rect(c, 20, y, w - 40, 7, P.teakLt); rect(c, 20, y + 7, w - 40, 3, P.teakDk); }
    // row 1: tins (Horlicks, oil), row 2: jars (sweets, chillies, tamarind), row 3: packets (tea, coffee, flour, soap), row 4: matchboxes, beedi bundles, candles
    for (let i = 0; i < 7; i++) { const x = 34 + i * 54; roundRect(c, x, 112, 36, 38, 2, i % 2 ? '#c8c8c8' : '#2a6a3a'); rect(c, x + 4, 120, 28, 14, i % 2 ? '#2a3a8a' : '#e0b43a'); }
    for (let i = 0; i < 8; i++) { const x = 30 + i * 46; jar(c, x, 182, 32, 38, ['#e07a3a', '#d8402c', '#5a3a22', '#f2c230', '#8a5a2a', '#e8d8a0', '#c9a050', '#2d6b5a'][i]); }
    for (let i = 0; i < 9; i++) { const x = 28 + i * 42; roundRect(c, x, 258, 30, 32, 2, ['#e0b43a', '#8a2a1c', '#f1e4c8', '#2a6a3a', '#e0b43a', '#8a2a1c', '#f1e4c8', '#2d6b5a', '#c8322a'][i]); rect(c, x + 4, 268, 22, 8, 'rgba(255,255,255,.55)'); }
    for (let i = 0; i < 12; i++) { const x = 26 + i * 32; rect(c, x, 342, 24, 16, i % 3 ? '#e8dcc0' : '#8a2a1c'); rect(c, x + 2, 346, 20, 2, '#c8322a'); }
    // hanging strings of sachets and bananas from the ceiling beam
    rect(c, 0, 96, w, 8, P.teakDk); for (let i = 0; i < 4; i++) { const x = 90 + i * 70; line(c, x, 104, x, 146, '#c9b48a', 1); for (let k = 0; k < 4; k++) rect(c, x - 5, 106 + k * 10, 10, 8, k % 2 ? '#d8402c' : '#2a3a8a'); }
    // counter with the brass scale, the ledger, a Parle-G stack
    rect(c, 0, 480, w, 14, P.teakLt); rect(c, 0, 494, w, 66, P.teak); rect(c, 0, 494, w, 3, P.teakHi); rect(c, 0, 556, w, 6, P.teakDk);
    // scale
    const scx = 230, scy = 480; rect(c, scx - 2, scy - 60, 4, 60, P.brassDk); rect(c, scx - 50, scy - 60, 100, 3, P.brass); for (const dx of [-44, 44]) { line(c, scx + dx, scy - 58, scx + dx - 10, scy - 30, P.brassDk, 1); line(c, scx + dx, scy - 58, scx + dx + 10, scy - 30, P.brassDk, 1); ellipse(c, scx + dx, scy - 28, 16, 4, P.brass); } rect(c, scx - 12, scy - 8, 24, 8, P.brassDk);
    // tea/coffee/flour tins near the scale (hotspots)
    for (const [x, col, lab] of [[120, '#2a6a3a', 'TEA'], [160, '#5a3a22', 'KAAPI'], [210, '#f1e4c8', 'PODI']]) { roundRect(c, x - 14, 446, 28, 34, 2, col); rect(c, x - 10, 456, 20, 10, 'rgba(255,255,255,.6)'); }
    // oil tin on the right with a tap
    roundRect(c, 312, 430, 40, 50, 2, '#c8c8c8'); rect(c, 316, 440, 32, 14, '#2a3a8a'); rect(c, 330, 476, 6, 8, P.brassDk);
    // ledger (pattu-pusthakam) on the counter, pen, spectacles
    c.save(); c.translate(262, 504); c.rotate(.08); rect(c, -22, -14, 44, 28, '#8a2a1c'); rect(c, -18, -10, 36, 20, '#f1e4c8'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let i = 0; i < 5; i++) c.fillRect(-14, -6 + i * 3.4, 26, .8); c.restore();
    // floor: packed earth; sacks in front
    rect(c, 0, 560, w, h - 560, vgrad(c, 0, 560, h, [[0, P.earthLt], [1, P.earthDk]]));
    gunnySack(c, 36, 650, 70, 80, '#e0c0a0'); gunnySack(c, 116, 666, 66, 66, '#5a3a22'); gunnySack(c, 236, 660, 60, 70, '#8fb05a'); gunnySack(c, 300, 672, 50, 58, '#e8dcc0');
    // soap stack and matchboxes on the left end of the counter
    for (let i = 0; i < 3; i++) rect(c, 28, 466 - i * 7, 28, 7, i % 2 ? '#2d6b5a' : '#3a8a6a'); rect(c, 60, 470, 10, 8, '#d8402c');
    // a glass case of things for the house on the left: clock face, gramophone horn, lamp, chembu, a rolled print
    rect(c, 26, 380, 70, 90, '#3a2a1c'); rect(c, 30, 384, 62, 82, 'rgba(200,220,230,.18)'); circle(c, 48, 402, 10, '#f1e4c8'); c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.moveTo(48, 402); c.lineTo(48, 396); c.moveTo(48, 402); c.lineTo(53, 402); c.stroke(); poly(c, [[66, 410], [86, 398], [86, 418]], P.brass); rect(c, 60, 408, 8, 6, P.teak); rect(c, 36, 430, 10, 16, '#888'); rect(c, 34, 428, 14, 3, '#444'); ellipse(c, 70, 446, 10, 7, P.brass); rect(c, 42, 452, 36, 6, '#c9a050');
    // kerosene lamp hanging
    hurricaneLamp(c, 300, 110, 1, false);
    // signboard above
    /* sign drawn in drawDynamic */ if (false) text(c, 'K. KUNJAPPAN  ·  PALACHARAKKU', 200, 537, 8.5, '#8a2a1c', 'center', 'sans-serif', 'bold');
  }
  drawDynamic(c, w, h) {
    // the wedding pandal across the shop front in the week of Kunjappan's daughter's wedding
    if (has('kunjappan', 'invited') && clock.month === 1 && clock.day >= 14 && clock.day <= 20) { for (let i = 0; i < 14; i++) { const x = 20 + i * 24; c.fillStyle = i % 2 ? '#f2c230' : '#c8322a'; c.beginPath(); c.moveTo(x, 300); c.lineTo(x + 6, 316); c.lineTo(x + 12, 300); c.fill(); } for (const px of [30, 330]) { rect(c, px - 3, 300, 6, 120, '#7a9a3a'); for (let k = 0; k < 4; k++) ellipse(c, px, 320 + k * 24, 10, 5, k % 2 ? '#8fb05a' : '#6f9a44'); } }
    const t = this.t;
    person(c, 310, 500, 1.05, { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', skin: '#b08060', moustache: true }, t);
    c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.arc(306, 430, 3, 0, 7); c.arc(315, 430, 3, 0, 7); c.stroke();
    // counter front over him
    rect(c, 0, 480, w, 14, P.teakLt); rect(c, 0, 494, w, 66, P.teak); rect(c, 0, 494, w, 3, P.teakHi); rect(c, 0, 556, w, 6, P.teakDk); c.save(); c.translate(262, 504); c.rotate(.08); rect(c, -22, -14, 44, 28, '#8a2a1c'); rect(c, -18, -10, 36, 20, '#f1e4c8'); c.fillStyle = 'rgba(43,33,24,.5)'; for (let i = 0; i < 5; i++) c.fillRect(-14, -6 + i * 3.4, 26, .8); c.restore();
    rect(c, 100, 522, 200, 26, '#f1e4c8'); rect(c, 100, 522, 200, 3, '#8a2a1c'); text(c, 'K. KUNJAPPAN  \u00b7  PALACHARAKKU', 200, 537, 8.5, '#8a2a1c', 'center', 'sans-serif', 'bold');
    if (clock.daylight < .6) { glow(c, 300, 92, 40, '#ffb050', .5); circle(c, 300, 98, 2.2, P.flameHi); }
    // a cat asleep on the rice sack in the afternoon
    if (clock.phase === 'uchha') { ellipse(c, 70, 650, 18, 9, '#e4d6bb'); circle(c, 56, 646, 7, '#e4d6bb'); }
  }
}
