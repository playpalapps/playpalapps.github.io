import { clock } from './clock.js';
import { state, remember, save, note } from './state.js';
import { talk } from './dialogue.js';
import { audio } from '../engine/audio.js';
import { add } from './pantry.js';
import { LETTERS } from './letters.js';
import { fest } from './festivals.js';
import { say } from '../ui/caption.js';
import { t } from '../i18n/t.js';
import { anyDue, playBeat } from './people.js';
export const visitors = { active: null };
let lastKey = '';
const PEOPLE = {
  milkman: { name: 'Kuttan, the paalkaran', opts: { sex: 'm', top: '#e9e2cf', mundu: '#f3ecd8', item: 'can', moustache: true }, scene: 'poomukham' },
  meenkari: { name: 'Kalyani, the meenkari', opts: { sex: 'f', top: '#2d6b5a', mundu: '#efe6cf', pose: 'carryHead', item: 'basket' }, scene: 'poomukham' },
  postman: { name: 'Raghavan, the postman', opts: { sex: 'm', top: '#8a7a4a', mundu: '#8a7a4a', cap: '#8a7a4a', item: 'bag' }, scene: 'poomukham' },
  ammini: { name: 'Ammini chechi', opts: { sex: 'f', top: '#b8443a', mundu: '#f3ecd8' }, scene: 'poomukham' },
  kids: { name: 'the neighbour’s children', opts: { sex: 'boy', top: '#e0b43a', mundu: '#6a7fa0' }, scene: 'poomukham' },
  maveli: { name: 'Maveli', opts: { sex: 'm', top: '#e8c04a', mundu: '#f3ecd8', moustache: true, cap: '#d8a020', item: 'umbrella' }, scene: 'poomukham' },
  vaidyan: { name: 'the vaidyan', opts: { sex: 'm', top: '#f1e6d0', mundu: '#f3ecd8', item: 'bag', skin: '#9c6a48' }, scene: 'poomukham' }
};
function schedule() {
  const m = clock.minutes, d = state.days, f = fest();
  if (m >= 370 && m < 410) return ['milkman', 410];
  if (m >= 520 && m < 560 && d % 3 === 1) return ['meenkari', 560];
  if (m >= 650 && m < 690 && d >= state.nextLetterDay && state.letters.length < LETTERS.length) return ['postman', 690];
  if (m >= 960 && m < 1000 && (d % 4 === 2 || f.onam || f.vishu)) return ['ammini', 1000];
  if (m >= 960 && m < 1090 && anyDue('ammini')) return ['ammini', 1090];
  if (m >= 1010 && m < 1040 && d % 5 === 3) return ['kids', 1040];
  if (m >= 1000 && m < 1100 && anyDue('kids')) return ['kids', 1100];
  if (f.thiruvonam && m >= 900 && m < 950) return ['maveli', 950];
  if (f.karkidakam && clock.day === 5 && m >= 600 && m < 640) return ['vaidyan', 640];
  return null;
}
export function updateVisitors() {
  const s = schedule(); const key = s ? s[0] + ':' + state.days : '';
  if (visitors.active && (!s || key !== lastKey)) { leave(visitors.active); visitors.active = null; }
  if (s && key !== lastKey) { lastKey = key; const p = PEOPLE[s[0]]; visitors.active = { id: s[0], ...p, leaveAt: s[1], met: false, arrived: clock.minutes }; }
  if (!s) lastKey = '';
}
function leave(v) {
  if (v.met) return;
  if (v.id === 'milkman') { state.milkAtStep = true; }
  if (v.id === 'postman') deliver();
}
export function deliver() {
  const idx = state.letters.length; if (idx >= LETTERS.length) return;
  state.letters.push(idx); state.unread++; if (state.replyTopic) { state.letterReplies[idx] = state.replyTopic; state.replyTopic = null; } state.nextLetterDay = state.days + (clock.mode === 'story' ? 1 + (idx % 2) : 4 + (idx % 3)); save();
}
export function meet() {
  const v = visitors.active; if (!v || v.met) return; v.met = true; const f = fest();
  audio.sfx('tap');
  if (v.id === 'milkman') { add('milk', 1); state.milkedDay = clock.day; talk([['Kuttan, the paalkaran: “Half a litre, like always. She gave well today.”', 'പാൽക്കാരൻ'], ['He pours from the brass can into your kudam and is gone down the lane, whistling.']]); remember('milkman', 'Kuttan the paalkaran still comes at dawn with the brass can, and still will not take money until the end of the month.'); }
  if (v.id === 'meenkari') { add('fish', 2); talk([['Kalyani lifts the basket off her head: “Mathi, fresh from the kadavu. Ayala if you want it.”', 'മീൻകാരി'], ['You give her a measure of rice and she gives you two hands of silver sardines.', 'മത്തി']]); remember('meenkari', 'Kalyani the meenkari, the basket on her head, calling meeeen down the lane. She still takes rice instead of coins from this house.'); }
  if (v.id === 'postman') { deliver(); talk([['Raghavan the postman rings the cycle bell twice and holds out an envelope.', 'പോസ്റ്റുമാൻ'], ['“From Madras,” he says, as if you could not read. The letter is on the charupadi.']]); audio.sfx('cycleBell'); remember('postman', 'Raghavan the postman reads every postcard in the village and denies it. A letter from Ravi today.'); }
  if (v.id === 'ammini' && playBeat('ammini')) { state.visitorsMet[v.id] = (state.visitorsMet[v.id] || 0) + 1; save(); return; }
  if (v.id === 'kids' && playBeat('kids')) { state.visitorsMet[v.id] = (state.visitorsMet[v.id] || 0) + 1; save(); return; }
  if (v.id === 'ammini') {
    if (f.onam) { add('banana', 2); talk([['Ammini chechi: “Onam and you have no bananas? Here. And the pookalam needs more thumba, go to the thodi.”', 'അമ്മിണി ചേച്ചി']]); }
    else if (f.vishu) { talk([['Ammini chechi: “Did you see the kani properly? Eyes closed till the uruli? Good. Here is your kaineettam.”', 'വിഷുക്കൈനീട്ടം']]); audio.sfx('coin'); }
    else { const r = state.days % 3; if (r === 0) { add('jackfruit', 1); talk([['Ammini chechi: “The plavu dropped two more. Take one before the squirrels do.”', 'അമ്മിണി ചേച്ചി']]); } else if (r === 1) talk([['Ammini chechi settles on the charupadi: “Your Amma sat exactly there. Exactly. Now, have you heard about Velayudhan’s daughter?”', 'അമ്മിണി ചേച്ചി'], ['Forty minutes pass. You learn everything about everyone.']]); else talk([['Ammini chechi: “You are thin. Madras does that. Come for dinner, I have made ulli theeyal.”', 'അമ്മിണി ചേച്ചി']]); }
    remember('ammini', 'Ammini chechi from the next parambu, who has decided that I am her responsibility now. I am not going to argue with her either.');
  }
  if (v.id === 'kids') { talk([['The neighbour’s children, at the gate: “Chettaa, our ball is on your roof.” It is always on your roof.', 'കുട്ടികൾ'], ['You throw it down. They are gone before it lands, shouting about a kite.']]); remember('kids', 'The children from the next house, who treat our roof as their ball’s second home. Their grandmother did the same, apparently.'); }
  if (v.id === 'maveli') { talk([['A large man in a paper crown and a palm-leaf umbrella, belly first: \u201cMaveli, from Pathalam, once a year. Is everyone equal and happy in this house?\u201d', 'മാവേലി'], ['\u201cGood. Then I will have payasam.\u201d It is Velayudhan\u2019s cousin under the moustache. Everybody knows. Nobody says.']]); remember('maveli', 'Maveli came on Thiruvonam, as he does, to see that his people are still happy. Gave him payasam. He asked after Ravi, out of character.'); }
  if (v.id === 'vaidyan') { talk([['The vaidyan opens his cloth bag: \u201cKarkidakam. Fenugreek, cumin, dashapushpam, a little ashtachoornam. Boil it with the navara rice. Tonight, and for ten nights.\u201d', 'വൈദ്യൻ'], ['He feels your pulse without asking, nods, and says what he said to your Amma: \u201cLess kaapi.\u201d']]); remember('vaidyan', 'The vaidyan came with the Karkidakam herbs for the kanji. He read my pulse and prescribed less coffee, which is the family diagnosis.'); }
  state.visitorsMet[v.id] = (state.visitorsMet[v.id] || 0) + 1; save();
}
export function pickupStep() { if (state.milkAtStep) { state.milkAtStep = false; add('milk', 1); say('Kuttan left the milk at the step, covered with a plavila.', 'പാൽ'); } }

// While you were away (real time only): the village went on without you. Called at launch and when the app comes back from the background.
// Whole visitor windows that passed while the app was closed are settled: milk at the step, a letter under the stone, a note in the diary.
export function reconcile() {
  if (clock.mode !== 'real' || !state.started) return;
  const now = Date.now(), last = state.lastSeenAt || now; if (now - last < 90 * 1000) { state.lastSeenAt = now; return; }
  const day0 = new Date(); day0.setHours(0, 0, 0, 0); const T0 = day0.getTime();
  const b = clock.minutes, a = (Math.max(last, T0) - T0) / 60000, over = last < T0, lm = (last - (T0 - 86400000)) / 60000; // lm: minutes into yesterday when last seen
  const missedToday = (s, e) => over ? b >= e : (a <= s && b >= e);
  const missedYesterday = (s) => over && lm <= s;
  const d = state.days, ev = [];
  if (missedToday(370, 410) && state.milkedDay !== clock.day && !state.milkAtStep) { state.milkAtStep = true; ev.push('Kuttan left the milk at the step'); }
  if (state.letters.length < LETTERS.length && ((missedToday(650, 690) && d >= state.nextLetterDay) || (missedYesterday(650) && d - 1 >= state.nextLetterDay))) { deliver(); ev.push('Raghavan left a letter on the charupadi, under the stone'); note('Raghavan came while I was out and left the letter under the stone on the charupadi, the way he did for Amma.'); }
  if ((missedToday(960, 1000) && d % 4 === 2) || (missedYesterday(960) && (d - 1) % 4 === 2)) { ev.push('Ammini chechi came by and left a jackfruit'); add('jackfruit', 1); note('Ammini chechi came by while I was out. A jackfruit on the step with a leaf on it, which means she will be back to ask about it.'); }
  if ((missedToday(1010, 1040) && d % 5 === 3) || (missedYesterday(1010) && (d - 1) % 5 === 3)) { ev.push('the children got their ball off the roof themselves'); }
  state.lastSeenAt = now;
  if (ev.length) { const E = ev.map(t); let line = E.length === 1 ? E[0] : E.slice(0, -1).join(', ') + t(' and ') + E[E.length - 1]; say(t('While you were out, ') + line + '.', 'പോയ നേരത്ത്', 6.5); }
}
