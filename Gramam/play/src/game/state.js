import { clock } from './clock.js';
import { haptics } from '../engine/haptics.js';
const KEY = 'gramam.save.v1';
const DEFAULTS = () => ({
  version: 2,
  scene: 'poomukham', started: false,
  lamp: false, lampLitDay: -1,
  thulasiWater: .4, potFull: false,
  fire: 0, kaapi: false, kaapiAt: 0, chammanthi: false,
  radio: false, swept: false, sweptDay: -1, paperRead: false, paperDay: -1,
  diary: [], firsts: {}, totalMinutes: 0, days: 0,
  weather: 'clear', rainT: 0, sound: true, hints: true,
  cat: { scene: 'poomukham', spot: 0 },
  // pantry & cooking
  pantry: { rice: 3, coconut: 2, jaggery: 1, banana: 1, jackfruit: 0, tapioca: 0, milk: 0, fish: 0, tea: 2, coffee: 2, oil: 1, vegetables: 1, eggs: 0, flour: 0, paddy: 4 },
  dishes: {}, served: null,
  // house & village
  letters: [], unread: 0, lettersRead: 0, nextLetterDay: 3,
  items: {}, itemDay: -1, ledger: [], booksRead: {}, bookBorrowed: null,
  visitorsMet: {}, milkedDay: -1, fedCowDay: -1, laundryDay: -1, laundryUp: false, bathedDay: -1, eggsDay: -1, pluckedDay: -1,
  chayaDay: -1, templeDay: -1, boatDay: -1, fieldDay: -1, postDay: -1, shopDay: -1, libraryDay: -1,
  milkAtStep: false,
  festival: { pookalam: 0, pookalamDay: -1, kaniSet: false, kaniSeen: -1, sadyaDay: -1, puzhukkuDay: -1, ramayanamDay: -1, kanjiDay: -1, utsavamSeen: -1, vallamkali: -1, harvestDay: -1 },
  flash: 0, raviArriving: false, raviHome: -1,
  timeMode: 'real', music: true, today: { key: '' }, finds: {}, goodDays: 0, ammaRead: 0, epilogueDone: false, lastDayKey: '',
  startedAt: 0, lastSeenAt: 0, rel: {}, thulasiGrowth: 0, thodiSwept: false, coconutDay: -1, shopping: {}, textScale: 1, reduceMotion: false, highContrast: false, reminders: false, replyTopic: null, letterReplies: {}, stats: { scenes: {}, verbs: {}, sessions: 0, frames: [] }, lastMusicAt: 0, lang: 'en', prologue: false, skipped: false, showFps: false
});
export const state = DEFAULTS();
function deepMerge(target, src) { for (const k in src) { if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && target[k] && typeof target[k] === 'object') deepMerge(target[k], src[k]); else target[k] = src[k]; } }
export function remember(key, text) {
  if (state.firsts[key]) return false;
  state.firsts[key] = true; haptics.success();
  state.diary.push({ t: `${clock.dateStr()}, ${clock.phaseName()}`, text });
  save(); return true;
}
export function note(text) { state.diary.push({ t: `${clock.dateStr()}, ${clock.phaseName()}`, text }); save(); }
export function save() {
  if (!state.started) return;
  state.lastSeenAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify({ state, clock: { minutes: clock.minutes, day: clock.day, month: clock.month } })); } catch (e) { }
}
export function load() {
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return false;
    const d = JSON.parse(raw); if (!d.state || !d.state.started) return false;
    deepMerge(state, d.state); state.flash = 0; state.served = null; Object.assign(clock, d.clock); clock.speed = 1; clock.mode = state.timeMode || 'real'; if (clock.mode === 'real') clock.syncReal(); return true;
  } catch (e) { return false; }
}
export function reset() { try { localStorage.removeItem(KEY); } catch (e) { } }
