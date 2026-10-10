// Today's small things: four a day drawn from a pool, plus festival checklists. No streaks, no punishment.
import { perfTasks } from './performances.js';
import { state, save, remember } from './state.js';
import { clock } from './clock.js';
import { fest } from './festivals.js';
import { say } from '../ui/caption.js';
import { audio } from '../engine/audio.js';
import { haptics } from '../engine/haptics.js';
import { pick } from '../i18n/t.js';
const POOL = [
  { id: 'lamp', t: 'Light the nilavilakku at sandhya', ml: 'വിളക്ക് കൊളുത്തുക', done: () => state.lamp, when: () => true },
  { id: 'water', t: 'Draw water from the kinar', ml: 'വെള്ളം കോരുക', done: () => !!state.today.water },
  { id: 'thulasi', t: 'Water the thulasi', ml: 'തുളസിക്ക് വെള്ളം', done: () => !!state.today.thulasi },
  { id: 'kaapi', t: 'Make kaapi on the aduppu', ml: 'കാപ്പി ഉണ്ടാക്കുക', done: () => !!state.today.kaapi },
  { id: 'cook', t: 'Cook something from Amma’s notebook', ml: 'എന്തെങ്കിലും വെക്കുക', done: () => !!state.today.cook },
  { id: 'cow', t: 'Feed Lakshmi', ml: 'ലക്ഷ്മിക്ക് തീറ്റ', done: () => state.fedCowDay === clock.day },
  { id: 'milk', t: 'Milk Lakshmi before nine', ml: 'പാൽ കറക്കുക', done: () => state.milkedDay === clock.day, when: () => clock.hour < 9.5 || state.milkedDay === clock.day },
  { id: 'sweep', t: 'Sweep the nadumuttam', ml: 'മുറ്റം അടിക്കുക', done: () => state.swept },
  { id: 'paper', t: 'Read the Mathrubhumi on the charupadi', ml: 'പത്രം വായിക്കുക', done: () => state.paperRead },
  { id: 'chaya', t: 'A chaya at Velayudhan’s', ml: 'ചായ കുടിക്കുക', done: () => state.chayaDay === clock.day },
  { id: 'temple', t: 'Pradakshinam at the ambalam', ml: 'അമ്പലത്തിൽ പോകുക', done: () => state.templeDay === clock.day },
  { id: 'bathe', t: 'Bathe in the kulam', ml: 'കുളത്തിൽ കുളിക്കുക', done: () => state.bathedDay === clock.day },
  { id: 'eggs', t: 'Collect the eggs', ml: 'മുട്ട എടുക്കുക', done: () => state.eggsDay === clock.day },
  { id: 'library', t: 'Visit the vayanasala', ml: 'വായനശാലയിൽ പോകുക', done: () => !!state.today.library },
  { id: 'kada', t: 'Buy something at Kunjappan’s', ml: 'കടയിൽ പോകുക', done: () => state.shopDay === clock.day && !!state.today.bought },
  { id: 'letter', t: 'Read the letter on the charupadi', ml: 'കത്ത് വായിക്കുക', done: () => state.unread === 0, when: () => state.unread > 0 },
  { id: 'post', t: 'Post a reply to Ravi', ml: 'കത്തയക്കുക', done: () => state.postDay === clock.day, when: () => state.lettersRead > 0 },
  { id: 'radio', t: 'Listen to Akashvani', ml: 'റേഡിയോ കേൾക്കുക', done: () => !!state.today.radio },
  { id: 'kadavu', t: 'Sit at the kadavu', ml: 'കടവിൽ ഇരിക്കുക', done: () => !!state.today.kadavu },
  { id: 'find', t: 'Find something new', ml: 'പുതിയത് കണ്ടെത്തുക', done: () => !!state.today.find },
  { id: 'school', t: 'Ring the school bell', ml: 'സ്കൂൾ മണി അടിക്കുക', done: () => !!state.today.school, when: () => fest().schoolDay },
  { id: 'beach', t: 'Walk the kadappuram', ml: 'കടപ്പുറത്ത് നടക്കുക', done: () => !!state.today.beach },
  { id: 'sleep', t: 'Sleep in the ara', ml: 'ഉറങ്ങുക', done: () => !!state.today.sleep, when: () => clock.mode === 'story' }
];
export function did(key) { state.today[key] = true; state.stats.verbs[key] = (state.stats.verbs[key] || 0) + 1; checkTasks(); }
export function tasksForToday() {
  const key = clock.dayKey();
  if (state.today.key !== key) { state.today = { key }; }
  const avail = POOL.filter(p => !p.when || p.when());
  const seed = state.days * 7 + clock.month; const picked = [];
  for (let i = 0; i < avail.length && picked.length < 4; i++) { const j = (seed * 31 + i * 17) % avail.length; const p = avail[j]; if (!picked.includes(p)) picked.push(p); }
  for (const p of avail) if (picked.length < 4 && !picked.includes(p)) picked.push(p);
  return picked;
}
export function festivalTasks() {
  const f = fest(), L = [];
  if (f.onam) { L.push({ t: f.thiruvonam ? 'Finish the pookalam' : pick(`Pookalam ring ${f.onamDay} of 10`, `പൂക്കളം: ${f.onamDay}-ാം വട്ടം (10-ൽ)`), ml: 'പൂക്കളം', done: () => state.festival.pookalamDay === clock.day }); L.push({ t: 'Thumba from the vayal', ml: 'തുമ്പപ്പൂ', done: () => !!state.finds.thumba }); if (f.uthradam) L.push({ t: 'Onakkodi from the tailor', ml: 'ഓണക്കോടി', done: () => !!state.firsts.onakkodi }); if (f.thiruvonam) { L.push({ t: 'Make the Onasadya', ml: 'ഓണസദ്യ', done: () => state.festival.sadyaDay === clock.day }); L.push({ t: 'Light the lamp for Maveli', ml: 'വിളക്ക്', done: () => state.lamp }); } }
  if (f.vishuEve) { L.push({ t: 'Konna from the thodi', ml: 'കൊന്നപ്പൂ', done: () => !!state.firsts.konna }); L.push({ t: 'Set up the Vishukkani', ml: 'വിഷുക്കണി', done: () => state.festival.kaniSet }); }
  if (f.vishu) L.push({ t: 'See the kani first thing', ml: 'കണി കാണുക', done: () => state.festival.kaniSeen === clock.day });
  if (f.thiruvathira) L.push({ t: 'Thiruvathira puzhukku', ml: 'പുഴുക്ക്', done: () => state.festival.puzhukkuDay === clock.day });
  if (f.karkidakam) L.push({ t: 'Read the Ramayanam this evening', ml: 'രാമായണം', done: () => state.festival.ramayanamDay === clock.day });
  if (f.ramzan) L.push({ t: 'Iftar at the masjid after the bang', ml: 'ഇഫ്താർ', done: () => !!state.today.iftar });
  if (f.eid || f.bakrid) L.push({ t: 'Perunnal at the masjid', ml: 'പെരുന്നാൾ', done: () => !!state.today.perunnal });
  if (f.christmasWeek) L.push({ t: 'Carols at the pally after dark', ml: 'കരോൾ', done: () => !!state.firsts.carols });
  if (f.theyyam) L.push({ t: 'Theyyam at the kaavu tonight', ml: 'തെയ്യം', done: () => !!state.today.theyyam });
  if (f.utsavamMain) L.push({ t: 'The utsavam at the ambalam tonight', ml: 'ഉത്സവം', done: () => !!state.firsts.utsavam });
  L.push(...perfTasks());
  if (state.raviArriving) L.push({ t: 'Meet Ravi at the station', ml: 'രവിയെ കൂട്ടുക', done: () => state.raviHome >= 0 });
  return L;
}
export function checkTasks() {
  const T = tasksForToday(); if (!T.length) return;
  const all = T.every(p => p.done());
  if (all && state.today.allDone !== true) { state.today.allDone = true; state.goodDays = (state.goodDays || 0) + 1; audio.sfx('chime'); haptics.success(); say('A good day. Everything on the list, and the evening still ahead.', 'നല്ല ദിവസം', 4); remember('goodday', 'Did everything there was to do today and sat down with nothing left. Ammamma would call that a sin. It is not.'); save(); }
}
export function openTasks() { return tasksForToday().filter(p => !p.done()).length + festivalTasks().filter(p => !p.done()).length; }
