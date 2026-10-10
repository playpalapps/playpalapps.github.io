// The year: Amma's diary, a page a month, and the epilogue on the second Thiruvonam.
// In real time the year is calendar days since the first evening; in story time a day is 24 minutes and the pages come faster.
import { state, save, remember } from './state.js';
import { clock } from './clock.js';
import { LETTERS } from './letters.js';
export const AMMA = [
  'Chingam. He has gone to Madras with one shirt too few. I counted. The pookalam this year was small; the thumba would not come. Lit the lamp for both boys.',
  'Kanni. The rain stopped on the ninth. Lakshmi calved: a girl, naturally. Velayudhan brought jaggery and talked for an hour about nothing, which was kind.',
  'Thulam. Thunder at three every afternoon like a clock. The elder one wrote that the city is loud. I wrote back that so is the courtyard when it rains and he did not mind that.',
  'Vrischikam. Pilgrims in black on the road, singing. Gave them water at the kinar. One was from Palakkad and knew my father’s name. The world is a small courtyard.',
  'Dhanu. Thiruvathira. Danced with the women around the lamp and my knees told me the truth afterwards. The puzhukku was good. The younger one wrote: cold in Madras. Madras is not cold. He is homesick.',
  'Makaram. Harvest. Four para more than last year. Settled with Kunjappan and he rounded it down again and I pretended not to notice again. This is a kind of friendship.',
  'Kumbham. The utsavam. Three elephants, and the small one was frightened of the fireworks and so was I. Sat with Ammini on the wall until the chenda stopped at two.',
  'Meenam. Hot. The kulam is low. Mangoes from the tree by the pond, the sour ones, with salt and chilli, standing in the kitchen like a child. Nobody to scold me.',
  'Medam. Vishu. Set the kani alone for the first time and woke to see it alone and that is all I will write about that. The konna was gold. Kaineettam for the hens.',
  'Edavam. The first rain on the eighth. Stood in the nadumuttam until I was wet through. The boys used to do this and I would shout. I did not shout.',
  'Mithunam. Planting. Sang the njattupattu with the women and forgot the second verse, which I have known for forty years. The field laughed. The field was right.',
  'Karkidakam. The lean month. Kanji at night, the Ramayanam in the evening, the roof holding. A letter from each boy in the same week. I am not lean this month.'
];
export function ammaPagesAvailable() { const per = clock.mode === 'real' ? 30 : 3; return Math.min(AMMA.length, 1 + Math.floor(state.days / per)); }
export function readAmmaPage() { const avail = ammaPagesAvailable(); if (state.ammaRead >= avail) return null; const i = state.ammaRead; state.ammaRead++; save(); remember('amma_' + i, 'From Amma’s diary: ' + AMMA[i]); return AMMA[i]; }
// the ending: every letter read, Ravi has been and gone, and it is Thiruvonam evening again (a year of calendar days in real time; story time skips the year at sleep)
export function epilogueDue(f) { return !state.epilogueDone && state.lettersRead >= LETTERS.length && state.raviHome >= 0 && f.thiruvonam && clock.hour >= 17.5 && (clock.mode === 'story' || state.days >= 300); }
// how long Ravi stays on leave, in game days
export function raviStay() { return clock.mode === 'story' ? 6 : 60; }
export function raviAtHome() { return state.raviHome >= 0 && state.days - state.raviHome < raviStay(); }
// story time only: after Ravi has gone back, the next sleep carries the year round to Uthradam
export function yearSkipDue() { return clock.mode === 'story' && !state.skipped && state.lettersRead >= LETTERS.length && state.raviHome >= 0 && state.days - state.raviHome >= raviStay() + 1; }
export const EPILOGUE = ['A year. Thiruvonam again, the pookalam complete, the sadya on the leaf, the lamp lit at the first bell.', 'Ravi came for Onam, and Ammini chechi, and the children with their ball, and Velayudhan with his knee, and Lakshmi stood at the thodi gate as if invited.', 'The house was as full as it used to be, for one evening, and then it was quiet, and the quiet was not empty.', 'The lamp is lit. The year begins again. You are home.'];
