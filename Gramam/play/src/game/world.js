import { perfAmbience } from './performances.js';
import { clock, MONTHS, MONTHS_ML } from './clock.js';
import { state, save, remember, note } from './state.js';
import { audio } from '../engine/audio.js';
import { say } from '../ui/caption.js';
import { fest, MONTH_NOTE } from './festivals.js';
import { updateVisitors } from './visitors.js';
import { music } from '../engine/music.js';
import { checkTasks } from './tasks.js';
import { epilogueDue, EPILOGUE } from './arc.js';
import { router } from './router.js';
import { pushWidget } from './widget.js';
import { pick } from '../i18n/t.js';
let taskT = 0, rainWas = 0, introT = 45, saveT = 0, bellDay = -1, rainTarget = 0, weatherT = 0, noteDay = -1, festDay = -1, lightningT = 0, sessionT = 0, launchMusic = false;
function daysBetween(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
function playMusic(name, secs) { state.lastMusicAt = Date.now(); music.play(name, secs); }
export const world = { scene: null, sceneName: 'poomukham', indoor: false, courtyard: false };
export function updateWorld(dt, scene) {
  world.scene = scene;
  const before = clock.hour;
  clock.advance(dt);
  state.totalMinutes += dt * clock.speed;
  const h = clock.hour, f = fest();
  // new day: in story mode at 5am, in real mode when the date changes
  if (clock.mode === 'real') { const k = clock.dayKey(); if (state.lastDayKey && state.lastDayKey !== k) newDay(); state.lastDayKey = k;
    // in real time the days are calendar days since the first evening, whether or not the app was opened
    if (state.startedAt) { const cd = daysBetween(new Date(state.startedAt), new Date()); if (cd > state.days) state.days = cd; } }
  else if ((before < 5 && h >= 5) || (before > h && h >= 5)) newDay();
  sessionT += dt;
  // rainbow: a few minutes after rain ends with the sun out
  if (rainWas > .3 && state.rainT < .05 && clock.daylight > .5) state.rainbow = 1; rainWas = state.rainT; if (state.rainbow > 0) state.rainbow = Math.max(0, state.rainbow - dt / 240);
  // tasks
  taskT += dt; if (taskT > 2) { taskT = 0; checkTasks(); }
  // music: a theme at dawn, at sandhya after the bell, a lullaby at night in the house, and on festival mornings
  const home = !world.sceneName || ['poomukham', 'nadumuttam', 'adukkala', 'ara', 'thodi', 'kulam', 'thattinpuram'].includes(world.sceneName);
  if (!music.playing && !state.prologue) {
    if (h >= 6 && h < 6.7 && !state.today.mDawn) { state.today.mDawn = true; playMusic((f.thiruvonam || f.vishu) ? 'hamsadhwani' : 'mohanam', 80); }
    else if (h >= 18.6 && h < 19.3 && !state.today.mDusk) { state.today.mDusk = true; playMusic('kalyani', 90); }
    else if (h >= 21.4 && h < 22.4 && home && !state.today.mNight) { state.today.mNight = true; playMusic('neelambari', 70); }
    // one piece a little after you arrive, whatever the hour, if none has played in the last while: nobody should miss the flute for living at the wrong time of day
    else if (!launchMusic && sessionT > 25 && Date.now() - (state.lastMusicAt || 0) > 45 * 60000) { launchMusic = true; playMusic(h < 11 ? 'mohanam' : h < 17 ? ((f.onam || f.vishu) ? 'hamsadhwani' : 'mohanam') : h < 20.5 ? 'kalyani' : 'neelambari', 70); }
  }
  // the epilogue on the second Thiruvonam
  if (epilogueDue(f) && world.sceneName === 'poomukham' && !state.epilogueRunning) { state.epilogueRunning = true; let i = 0; const next = () => { if (i >= EPILOGUE.length) { state.epilogueDone = true; state.epilogueRunning = false; remember('epilogue', 'A whole year in the village, Thiruvonam to Thiruvonam. The house is kept. The lamp is lit. I am not going anywhere.'); save(); return; } router.interlude(EPILOGUE[i++], () => {}, 4.5); setTimeout(next, 6500); }; setTimeout(next, 800); }
  const gm = dt * clock.speed;
  state.thulasiWater = Math.max(0, state.thulasiWater - gm / 1800);
  state.fire = Math.max(0, state.fire - gm / 240);
  if (state.kaapi && clock.minutes - state.kaapiAt > 180) state.kaapi = false;
  if (state.served && (clock.day !== state.served.day || clock.minutes - state.served.at > 150)) state.served = null;
  // weather: roll every game hour, season-weighted
  weatherT += gm;
  if (weatherT > 60) {
    weatherT = 0; const p = clock.rainChance();
    const thula = clock.month === 2 && h >= 14 && h <= 18; // thulavarsham afternoons
    if (rainTarget > 0) rainTarget = Math.random() < (f.monsoon ? .75 : .45) ? rainTarget : 0;
    else if (Math.random() < p * (thula ? 1.2 : .5)) rainTarget = .45 + Math.random() * .55;
    if (rainTarget > 0 && state.rainT < .05) { say(f.monsoon ? 'The monsoon comes in over the palms, grey and steady.' : 'A shower comes in over the palms.', 'മഴ'); remember('rain', 'First rain of the season on the tiled roof. The whole house went quiet to listen.'); }
  }
  state.rainT += (rainTarget - state.rainT) * Math.min(1, dt * .15); if (state.rainT < .01) state.rainT = 0;
  // lightning in heavy rain
  state.flash = Math.max(0, state.flash - dt * 4);
  lightningT -= dt; if (state.rainT > .6 && lightningT <= 0) { lightningT = 6 + Math.random() * 20; if (Math.random() < .5) { state.flash = 1; const dist = 1 + Math.random() * 3; setTimeout(() => audio.sfx('thunder', { dist }), dist * 500); } }
  // temple bell at 18:30
  if (h >= 18.5 && h < 18.6 && bellDay !== clock.day) { bellDay = clock.day; const dist = world.indoor ? 2.2 : world.sceneName === 'ambalam' ? .6 : 1.3; audio.sfx('bell', { dist }); setTimeout(() => audio.sfx('bell', { dist }), 2600); setTimeout(() => audio.sfx('bell', { dist }), 5200); if (world.sceneName !== 'ambalam') say('The temple bell, from across the paddy.', 'അമ്പലമണി'); remember('bell', 'At sandhya the bell from the ambalam carries all the way across the paddy. Amma used to light the lamp at the first ring.'); }
  // month and festival notes around 7am
  if (h >= 7 && h < 7.2 && noteDay !== clock.day) {
    noteDay = clock.day;
    if (clock.day === 1) say(MONTH_NOTE[clock.month], MONTHS_ML[clock.month], 5);
    if (f.onamDay === 1) say('Atham. Ten days to Thiruvonam. The pookalam begins today, one ring of flowers.', 'അത്തം', 5);
    if (f.onamDay > 1 && f.onamDay < 10) say(pick(`Onam, day ${f.onamDay}. Add a ring to the pookalam.`, `ഓണം, ${f.onamDay}-ാം ദിവസം. പൂക്കളത്തിന് ഒരു വട്ടം കൂടി.`), 'ഓണം', 4);
    if (f.uthradam) say('Uthradam. The day of buying everything. Tomorrow is Thiruvonam.', 'ഉത്രാടം', 5);
    if (f.thiruvonam) say('Thiruvonam. Maveli comes today. Finish the pookalam, make the sadya, light the lamp.', 'തിരുവോണം', 6);
    if (f.vishuEve) say('Tomorrow is Vishu. Tonight, set up the kani in the ara before you sleep.', 'വിഷു', 5);
    if (f.vishu) say('Vishu. The first thing you see today should be the kani.', 'വിഷു', 5);
    if (f.thiruvathira) say('Thiruvathira. The women will dance around the lamp tonight. Make puzhukku.', 'തിരുവാതിര', 5);
    if (f.karkidakam && clock.day === 1) say('Karkidakam. Read the Ramayanam in the evenings this month.', 'രാമായണ മാസം', 5);
    if (f.vavu) say('Karkidaka vavu. People go to the kadavu at dawn to offer bali for the ancestors.', 'വാവ്', 5);
    if (f.utsavam) say(f.utsavamMain ? 'The main day of the utsavam. Elephants at the temple tonight, and fireworks.' : 'The temple utsavam has begun. You can hear the chenda from here.', 'ഉത്സവം', 5);
    if (f.harvest && clock.day === 5) say('Koythu. The harvest begins in the vayal today.', 'കൊയ്ത്ത്', 5);
    if (f.christmasWeek && clock.day === 4) say('Dhanu. Paper stars go up on the pally and on half the houses; the carol party is practising somewhere.', 'നക്ഷത്രം', 5);
    if (f.christmas) say('Christmas. Bells from the pally at dawn, cake from Ammini chechi\u2019s neighbour, a star over every door.', 'ക്രിസ്മസ്', 5);
    if (f.theyyam) say('Theyyam at the kaavu tonight. The drums start at dusk; go after the lamp.', 'തെയ്യം', 5);
    if (f.perunnal) say('Perunnal at the pally: the procession this evening, the band, fireworks over the river.', 'പെരുന്നാൾ', 5);
    if (f.chanta) say('Wednesday. Chanta day on the angadi: pots, fish, bangles, everybody.', 'ചന്ത', 4);
    if (state.raviArriving) say('Ravi\u2019s train reaches this morning. The station, by the second bench.', 'രവി', 5);
    if (f.ploughing && clock.day === 1) say('The field is being ploughed for the first crop. The bullocks are out at dawn.', 'ഉഴവ്', 5);
    if (f.planting && clock.day === 5) say('Njaru nadal. The women are transplanting seedlings in the flooded field, singing.', 'ഞാറുനടീൽ', 5);
  }
  updateVisitors();
  // ambience
  const ph = clock.phase, r = state.rainT, ind = world.indoor ? .35 : 1, cy = world.courtyard ? .7 : 1;
  const mix = { wind: .25 * ind, leaves: .1 * ind };
  if (ph === 'velupp') { mix.birds = .5; mix.crows = .3; }
  if (ph === 'ravile') { mix.birds = .3; mix.crows = .4; }
  if (ph === 'uchha') { mix.crows = .12; mix.wind = .35 * ind; mix.leaves = .15 * ind; }
  if (ph === 'sandhya') { mix.cicadas = .35; mix.crows = .15; }
  if (ph === 'rathri') { mix.crickets = .16; mix.leaves = 0; mix.wind = .15 * ind; if (f.monsoon) mix.frogs = .2; }
  if ((clock.month === 7 || clock.month === 8) && (ph === 'ravile' || ph === 'uchha')) mix.koel = .4;
  for (const k of ['birds', 'crows', 'cicadas', 'crickets', 'koel']) if (mix[k]) mix[k] *= ind * cy * (1 - r * .7);
  if (r > 0) { mix.rain = r * (world.indoor ? .25 : world.courtyard ? .45 : .6); if (world.courtyard) mix.courtyardRain = r * .5; }
  if (world.indoor) mix.fire = state.fire * .6;
  if (state.radio) mix.radio = world.courtyard ? .55 : world.indoor ? .15 : .1;
  if (f.utsavam && h >= 17 && h < 23) mix.chenda = world.sceneName === 'ambalam' ? .7 : .12 * ind;
  if (f.wedding && h >= 9 && h < 13) mix.chenda = Math.max(mix.chenda || 0, world.sceneName === 'ambalam' ? .5 : .08 * ind);
  if (scene && scene.ambience) Object.assign(mix, scene.ambience(mix));
  if (scene) Object.assign(mix, perfAmbience(scene));
  audio.setAmbience(mix);
  saveT += dt; if (saveT > 8) { saveT = 0; save(); pushWidget(); }
}
function newDay() {
  if (clock.mode !== 'real') state.days++; state.today = { key: clock.dayKey() }; if (state.lettersRead >= 9 && state.raviHome < 0 && !state.raviArriving) state.raviArriving = true; state.lamp = false; state.kaapi = false; state.swept = false; state.thodiSwept = false; state.paperRead = false; state.chammanthi = false; state.laundryUp = false; state.served = null;
  const f = fest();
  if (f.onamDay === 1) state.festival.pookalam = 0;
  if (!(f.onam)) state.festival.pookalam = 0;
  if (state.festival.kaniSet && f.vishu) { /* kani waits in the ara */ } else if (!f.vishuEve) state.festival.kaniSet = false;
  save();
}
