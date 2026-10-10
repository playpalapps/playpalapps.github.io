import { Scene } from '../game/scene.js';
import { P } from '../art/palette.js';
import { roundRect, poly, ellipse, circle, rect, vgrad, shadow, glow, line, text, FONT, palm, tileRoof } from '../art/draw.js';
import { person, jackfruitTree, lateriteWall, grassTuft, water, crowBird } from '../art/lib.js';
import { state, remember } from '../game/state.js';
import { clock } from '../game/clock.js';
import { tween, delay } from '../engine/tween.js';
import { hash } from '../engine/ease.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { router } from '../game/router.js';
import { did } from '../game/tasks.js';
import { fest } from '../game/festivals.js';
import { talk } from '../game/dialogue.js';
import { add } from '../game/pantry.js';
import { drops } from '../engine/particles.js';
import { haptics } from '../engine/haptics.js';
import { pick } from '../i18n/t.js';

// The masjid by the river road: a Kerala mosque of the period, whitewashed under two tiers of tiled roof, a wooden minaret, the hauz full of sky,
// a madrasa bench where the children recite, and Hamsakka who has rung the drum for the bang since before you were born.
const PRAYERS = [5.4, 12.6, 15.9, 18.65, 19.9];
export class Masjid extends Scene {
  constructor() {
    super('masjid', 'Masjid', 'മസ്ജിദ്'); this.horizon = 320; this.ground = '#d9c9a0'; this.bangT = 0; this.lastBang = -1;
    this.hotspots = [
      { x: 96, y: 628, r: 44, label: 'hauz · wash', action: () => this.wash() },
      { x: 262, y: 520, r: 36, label: 'Hamsakka', action: () => this.hamsa() },
      { x: 312, y: 352, r: 40, label: 'minaret · the bang', action: () => this.bang() },
      { x: 330, y: 612, r: 40, label: 'madrasa', enabled: () => this.madrasaOpen(), action: () => this.madrasa() },
      { x: 190, y: 660, r: 44, label: 'iftar', enabled: () => fest().ramzan && clock.hour >= 18.3 && clock.hour < 20.5, action: () => this.iftar() },
      { x: 190, y: 660, r: 44, label: 'perunnal', enabled: () => (fest().eid || fest().bakrid) && clock.hour >= 8 && clock.hour < 20, action: () => this.perunnal() },
    ];
    this.exits = [{ side: 'right', y: 640, label: 'Pally', go: () => router.go('pally') }, { side: 'bottom', label: 'Station', go: () => router.go('station') }];
  }
  madrasaOpen() { const h = clock.hour, f = fest(); return f.schoolDay && ((h >= 6.5 && h < 9) || (h >= 16 && h < 18.5)); }
  nextPrayer() { const h = clock.hour; for (const p of PRAYERS) if (p > h + .3) return p; return PRAYERS[0] + 24; }
  wash() { this.busy = true; audio.sfx('pour'); const ps = this.ps; let n = 0; const iv = setInterval(() => { drops(ps, 96, 606, 3); if (++n > 7) clearInterval(iv); }, 90); delay(1.2, () => { this.busy = false; say('Cold water from the hauz over your hands and face, the stone step worn into hollows by a hundred years of feet.', 'ഹൗള്'); remember('hauz', 'Washed at the masjid hauz. The water is from the same spring as our kinar, Hamsakka says, which is the kind of thing he knows.'); }); }
  hamsa() {
    const f = fest(), h = clock.hour;
    if (f.ramzan) talk([['Hamsakka, thinner than last month and cheerful about it: “Nombu. Twenty days left. Come at sunset; there is kanji for anyone who stands at the gate looking hungry, and you qualify.”', 'ഹംസക്ക']]);
    else if (f.eid || f.bakrid) talk([['Hamsakka in a new mundu, a plate in each hand: “Perunnal. Biriyani from the big pot. No, you cannot say no; your Achan never managed it either.”', 'ഹംസക്ക']]);
    else if (h < 7) talk([['Hamsakka, the drumstick still in his hand: “You heard the bang? Thirty-one years I have beaten that drum for it. The sparrows wake before me now; it is a disgrace.”', 'ഹംസക്ക']]);
    else talk([['Hamsakka, on the step with the account book of the madrasa: “Your Achan sat here on Fridays after the juma, waiting for me, pretending to read the notice board. We fixed the whole country, every week, and it stayed fixed till Monday.”', 'ഹംസക്ക'], ['“The children ask who the man in the photograph by the door is. I tell them: the one who gave the madrasa its roof. They think I mean Allah. I do not correct them in a hurry.”']]);
    remember('hamsakka', 'Hamsakka at the masjid, who beat the drum for the bang for thirty-one years and fixed the country with Achan every Friday after the juma. The madrasa roof was Achan’s doing, it turns out.');
  }
  bang() {
    const h = clock.hour, near = PRAYERS.find(p => Math.abs(p - h) < .5);
    if (near === undefined) { const np = this.nextPrayer(), hh = Math.floor(np % 24), mm = Math.round((np % 1) * 60); say(pick(`The minaret is quiet. The next bang is at about ${hh % 12 || 12}:${mm < 10 ? '0' : ''}${mm}${hh >= 12 ? ' pm' : ' am'}.`, `മിനാരം നിശ്ശബ്ദം. അടുത്ത ബാങ്ക് ഏകദേശം ${hh % 12 || 12}:${mm < 10 ? '0' : ''}${mm}-ന്.`), 'ബാങ്ക്', 4); return; }
    if (this.bangT > 0) return; this.bangT = 1; audio.sfx('azan'); this.lastBang = near;
    say('The bang, from the wooden minaret, unhurried, the voice going out over the paddy and the river and coming back a little later from the hills.', 'ബാങ്ക്', 8);
    remember('bang', 'Heard the bang from the masjid minaret at sandhya, Hamsakka’s voice going out over the paddy. From the charupadi at home it arrives a few seconds after the temple bell, and they have never once argued.');
    delay(22, () => { this.bangT = 0; });
  }
  madrasa() { this.busy = true; audio.hold('madrasa', .5, 6); say('The children on the madrasa bench, slates on their knees, reciting together in a rise and fall that is nearly a song. The smallest one is a beat behind and louder than all the rest.', 'മദ്രസ', 6); delay(5, () => { this.busy = false; remember('madrasa', 'Sat at the back of the madrasa for a lesson. The recitation rises and falls like the njattupattu, and the smallest child, as everywhere, is a beat behind and twice as loud.'); }); }
  iftar() { this.busy = true; audio.sfx('chime'); delay(1.2, () => { this.busy = false; add('banana', 1); did('iftar'); say('Sunset. The bang, then dates, then kanji from the big pot ladled into leaves, then pathiri and chicken. Nobody asks who you are; everybody tells you to eat.', 'ഇഫ്താർ', 7); remember('iftar', 'Iftar at the masjid in the nombu month: dates, the kanji from the big pot, pathiri. Hamsakka put three pieces on my leaf and dared me to object.'); }); }
  perunnal() { this.busy = true; audio.sfx('chime'); delay(1.2, () => { this.busy = false; did('perunnal'); say('Perunnal. New clothes, attar on everyone’s wrists, the big pot of biriyani under the jackfruit tree, children with coins from every uncle in the compound.', 'പെരുന്നാൾ', 7); remember('perunnal_masjid', 'Perunnal at the masjid: biriyani from the big pot under the plavu, attar, new mundus, and children richer than the panchayat by noon. Hamsakka sent a plate home for Ammini chechi without being asked.'); }); }
  ambience() { const f = fest(), h = clock.hour; const m = { birds: clock.phase === 'ravile' ? .3 : 0, wind: .2, crows: .15, murmur: .1 }; if (this.madrasaOpen()) m.madrasa = .3; if (f.eid || f.bakrid) m.murmur = .4; return m; }
  tick(dt) { // the bang at its hours when you are here
    const h = clock.hour; for (const p of PRAYERS) if (Math.abs(h - p) < .02 && this.lastBang !== p && this.bangT === 0) { this.lastBang = p; this.bangT = 1; audio.sfx('azan'); delay(22, () => { this.bangT = 0; }); }
  }
  glows() { return clock.daylight < .5 ? [{ x: 215, y: 470, r: 130, a: .7 }, { x: 312, y: 346, r: 50, a: .6 }] : []; }
  drawStatic(c, w, h) {
    const cx = 215;
    rect(c, 0, 300, w, 60, vgrad(c, 0, 300, 360, [[0, '#9fc27a'], [1, P.paddy]])); for (let i = 0; i < 10; i++) ellipse(c, hash(i + 31) * w, 318, 18, 14, P.cocoDeep);
    palm(c, 26, 360, 160, 18, 1, [P.teakLt, P.teakDk, P.cocoDk, P.coco]); palm(c, w - 20, 380, 170, -16, 1.05, [P.teakLt, P.teakDk, P.cocoDk, P.coco]);
    // the mosque: lime-washed walls, two tiers of tiled gabled roof, green wooden doors and shutters, a timber minaret with its own small roof
    rect(c, cx - 110, 420, 220, 110, vgrad(c, 0, 420, 530, [[0, '#f6f1e6'], [1, '#e6dfcc']]));
    tileRoof(c, cx - 128, 388, 256, 40, P.tile, P.tileLt, P.tileDk); rect(c, cx - 128, 426, 256, 4, P.teakDk);
    rect(c, cx - 70, 352, 140, 40, '#f6f1e6'); tileRoof(c, cx - 84, 328, 168, 30, P.tile, P.tileLt, P.tileDk); rect(c, cx - 84, 356, 168, 3, P.teakDk);
    poly(c, [[cx - 40, 328], [cx + 40, 328], [cx, 300]], '#f6f1e6'); rect(c, cx - 1.5, 286, 3, 16, '#c9962e');
    // minaret, right: square timber tower with louvred openings and a tiny tiled cap
    rect(c, 290, 330, 44, 200, vgrad(c, 0, 330, 530, [[0, '#f6f1e6'], [1, '#e6dfcc']])); for (let i = 0; i < 3; i++) { rect(c, 300, 350 + i * 50, 24, 26, '#2f6a4a'); for (let k = 0; k < 4; k++) rect(c, 300, 353 + i * 50 + k * 6, 24, 2, 'rgba(0,0,0,.25)'); }
    tileRoof(c, 282, 314, 60, 18, P.tile, P.tileLt, P.tileDk); rect(c, 310, 300, 4, 16, '#c9962e'); circle(c, 312, 298, 3, '#c9962e');
    // door (green, arched) and windows
    rect(c, cx - 22, 456, 44, 74, '#2f6a4a'); c.fillStyle = '#2f6a4a'; c.beginPath(); c.arc(cx, 456, 22, Math.PI, 0); c.fill(); rect(c, cx - 1, 440, 2, 90, 'rgba(0,0,0,.3)'); for (let i = 0; i < 3; i++) { circle(c, cx - 9, 470 + i * 18, 1.6, P.brass); circle(c, cx + 9, 470 + i * 18, 1.6, P.brass); }
    for (const wx of [cx - 72, cx + 72]) { rect(c, wx - 12, 450, 24, 36, '#2f6a4a'); c.fillStyle = '#2f6a4a'; c.beginPath(); c.arc(wx, 450, 12, Math.PI, 0); c.fill(); rect(c, wx - 9, 453, 18, 30, '#9fc2cc'); for (let k = 0; k < 3; k++) rect(c, wx - 9, 458 + k * 8, 18, 1.5, '#2f6a4a'); }
    // a framed photograph by the door, the notice board, the step
    rect(c, cx - 48, 496, 14, 18, '#5a3a22'); rect(c, cx - 46, 498, 10, 14, '#e8dcc0'); circle(c, cx - 41, 503, 3, '#2a1a10');
    rect(c, cx + 34, 492, 34, 26, '#5a3a22'); rect(c, cx + 36, 494, 30, 22, '#8a7a4a'); text(c, 'മദ്രസ', cx + 51, 505, 7, '#f1e4c8', 'center', 'sans-serif');
    rect(c, cx - 118, 530, 236, 10, '#d9cfb8'); rect(c, cx - 112, 540, 224, 8, '#c8b89a');
    // ground: swept sand, the compound wall far right, grass
    rect(c, 0, 548, w, h - 548, vgrad(c, 0, 548, h, [[0, '#e3d6b4'], [1, '#c9b48a']]));
    lateriteWall(c, 0, 760, w, 36, .3); for (let i = 0; i < 14; i++) grassTuft(c, hash(i + 80) * w, 560 + hash(i + 81) * 190, .7, '#9aa86a');
    // the hauz: a stone tank with steps, left front
    poly(c, [[30, 600], [160, 600], [166, 660], [24, 660]], P.stoneDk); rect(c, 36, 604, 118, 50, '#6f8a90'); rect(c, 30, 596, 136, 6, P.stone); for (let i = 0; i < 3; i++) rect(c, 44 + i * 4, 612 + i * 12, 100 - i * 8, 4, 'rgba(255,255,255,.25)');
    // the madrasa bench, right front, and the jackfruit tree over it
    jackfruitTree(c, 372, 600, .8); rect(c, 290, 616, 90, 8, P.teakLt); rect(c, 296, 624, 6, 22, P.teak); rect(c, 368, 624, 6, 22, P.teak);
    // the big pot on three stones under the tree, for the feast days (always there, waiting)
    ellipse(c, 190, 668, 26, 10, '#3a2a1c'); ellipse(c, 190, 652, 24, 14, '#4a4a50'); ellipse(c, 190, 640, 16, 5, '#2a2a30');
  }
  drawDynamic(c, w, h) {
    const t = this.t, f = fest(), ph = clock.phase, cx = 215;
    water(c, 36, 604, 118, 50, t, ['#7f9aa8', '#5f7a88'], clock.daylight > .5 ? '#d8e0e8' : null);
    // Hamsakka at the step; the children on the bench in madrasa hours
    person(c, 262, 540, .88, { sex: 'm', top: '#f6f1e6', mundu: '#f6f1e6', cap: '#f6f1e6', skin: '#9c6a48', moustache: false }, t);
    if (this.madrasaOpen()) { for (let i = 0; i < 4; i++) person(c, 300 + i * 20, 620, .62, { sex: i % 2 ? 'boy' : 'f', top: ['#e0b43a', '#2d6b5a', '#c8322a', '#8a2a3a'][i], mundu: i % 2 ? '#f3ecd8' : '#efe6cf', pose: 'sit' }, t + i); }
    // the mukri on the minaret while the bang is called
    if (this.bangT > 0) { person(c, 312, 346, .5, { sex: 'm', top: '#f6f1e6', mundu: '#f6f1e6', cap: '#f6f1e6', skin: '#9c6a48' }, t); const a = .4 + .3 * Math.sin(t * 2); c.save(); c.globalAlpha = a; c.strokeStyle = '#fff6e0'; c.lineWidth = 1; for (let r = 0; r < 3; r++) { c.beginPath(); c.arc(312, 330, 14 + r * 10 + ((t * 20) % 10), -.6, .6); c.stroke(); } c.restore(); }
    // feast days: a cloth awning, people, the pot steaming
    if (f.eid || f.bakrid || (f.ramzan && clock.hour >= 18)) { for (let i = 0; i < 8; i++) person(c, 60 + i * 38 + (i % 2) * 6, 700 + (i % 3) * 12, .7, { sex: i % 3 ? 'm' : 'f', top: ['#f6f1e6', '#2d6b5a', '#e0b43a', '#8a2a3a'][i % 4], mundu: '#f3ecd8', cap: i % 3 ? '#f6f1e6' : null, flip: i % 2 }, t + i); for (let i = 0; i < 5; i++) { const k = ((t * .5 + i * .2) % 1); c.globalAlpha = (1 - k) * .4; circle(c, 190 + Math.sin(i) * 6, 636 - k * 40, 5 + k * 10, '#d8d0c4'); } c.globalAlpha = 1; }
    if (ph === 'sandhya' || ph === 'velupp') { person(c, 160, 560, .8, { sex: 'm', top: '#f6f1e6', mundu: '#f3ecd8', cap: '#f6f1e6', pose: 'walk' }, t); person(c, 100, 574, .8, { sex: 'm', top: '#2d6b5a', mundu: '#f3ecd8', cap: '#f6f1e6', pose: 'walk', flip: true }, t + 1); }
    if (clock.daylight < .5) { glow(c, cx, 470, 40, '#ffd27a', .5); circle(c, cx - 30, 500, 1.6, P.flameHi); circle(c, cx + 30, 500, 1.6, P.flameHi); }
    crowBird(c, cx - 60, 384, .9, t);
  }
}
