// Things to find: creatures, flowers, shells, stamps, photos, and one hidden moment in every place.
import { state, save, remember } from './state.js';
import { say } from '../ui/caption.js';
import { audio } from '../engine/audio.js';
import { haptics } from '../engine/haptics.js';
import { pick } from '../i18n/t.js';
export const FINDS = [
  // creatures
  { id: 'butterfly_yellow', cat: 'Creatures', n: 'Common grass yellow', ml: 'മഞ്ഞപ്പൂമ്പാറ്റ', where: 'thodi', hint: 'A small yellow one over the hibiscus.' },
  { id: 'butterfly_white', cat: 'Creatures', n: 'Jezebel butterfly', ml: 'വെള്ളപ്പൂമ്പാറ്റ', where: 'thodi', hint: 'White and quick, near the banana clump.' },
  { id: 'dragonfly', cat: 'Creatures', n: 'Dragonfly', ml: 'തുമ്പി', where: 'kulam', hint: 'Hovering over the pond at noon.' },
  { id: 'onathumbi', cat: 'Creatures', n: 'Onathumbi', ml: 'ഓണത്തുമ്പി', where: 'vayal', hint: 'The Onam dragonflies rise from the stubble.' },
  { id: 'kingfisher', cat: 'Creatures', n: 'Kingfisher', ml: 'പൊന്മാൻ', where: 'kulam', hint: 'On his stick at the pond, early.' },
  { id: 'crab', cat: 'Creatures', n: 'Shore crab', ml: 'ഞണ്ട്', where: 'kadappuram', hint: 'Sideways, on the wet sand.' },
  { id: 'squirrel', cat: 'Creatures', n: 'Palm squirrel', ml: 'അണ്ണാൻ', where: 'thodi', hint: 'Three stripes, on the plavu trunk, mornings.' },
  { id: 'gecko', cat: 'Creatures', n: 'House gecko', ml: 'പല്ലി', where: 'ara', hint: 'On the wall near the lamp after dark. If it clicks, it agrees.' },
  { id: 'owl', cat: 'Creatures', n: 'Owl', ml: 'മൂങ്ങ', where: 'kaavu', hint: 'Two eyes in the dark grove, late.' },
  { id: 'civet', cat: 'Creatures', n: 'Civet cat', ml: 'വെരുക്', where: 'poomukham', hint: 'On the roof ridge at night, a long tail.' },
  { id: 'egret', cat: 'Creatures', n: 'Cattle egret', ml: 'കൊക്ക്', where: 'vayal', hint: 'White, following the plough.' },
  { id: 'frog', cat: 'Creatures', n: 'Bullfrog', ml: 'പോക്കാച്ചിത്തവള', where: 'kulam', hint: 'Eyes on a lily pad on a rainy night.' },
  { id: 'firefly', cat: 'Creatures', n: 'Firefly', ml: 'മിന്നാമിനുങ്ങ്', where: 'poomukham', hint: 'In the yard after dark, when it is dry.' },
  // flowers
  { id: 'chembarathi', cat: 'Flowers', n: 'Chembarathi', ml: 'ചെമ്പരത്തി', where: 'thodi', hint: 'Red hibiscus by the path.' },
  { id: 'konna', cat: 'Flowers', n: 'Kanikonna', ml: 'കണിക്കൊന്ന', where: 'thodi', hint: 'Gold in Medam, nowhere else.' },
  { id: 'thumba', cat: 'Flowers', n: 'Thumba', ml: 'തുമ്പപ്പൂ', where: 'vayal', hint: 'Tiny white, on the bund, for the pookalam.' },
  { id: 'ambal', cat: 'Flowers', n: 'Ambal', ml: 'ആമ്പൽ', where: 'kulam', hint: 'Pink on the pond.' },
  { id: 'thetti', cat: 'Flowers', n: 'Thetti', ml: 'തെറ്റി', where: 'ambalam', hint: 'Red ixora by the temple wall, for the deity.' },
  { id: 'thulasi_flower', cat: 'Flowers', n: 'Thulasi', ml: 'തുളസി', where: 'poomukham', hint: 'Water it well; it flowers.' },
  // shells
  { id: 'shell_cowrie', cat: 'Shells', n: 'Cowrie', ml: 'കവടി', where: 'kadappuram', hint: 'The astrologer’s shell, on the sand.' },
  { id: 'shell_conch', cat: 'Shells', n: 'Small conch', ml: 'ശംഖ്', where: 'kadappuram', hint: 'Near the kattamaram, after a storm.' },
  { id: 'shell_clam', cat: 'Shells', n: 'Clam shell', ml: 'കക്ക', where: 'kadappuram', hint: 'Half a kakka, by the net poles.' },
  // hidden moments
  { id: 'shooting_star', cat: 'Moments', n: 'A shooting star', ml: 'കൊള്ളിമീൻ', where: 'thattinpuram', hint: 'Through the gap in the tiles, after ten at night.' },
  { id: 'night_mail', cat: 'Moments', n: 'The night mail', ml: 'രാത്രി തീവണ്ടി', where: 'station', hint: 'The train that does not stop, near midnight.' },
  { id: 'rainbow', cat: 'Moments', n: 'A rainbow over the vayal', ml: 'മഴവില്ല്', where: 'vayal', hint: 'Just as the rain is ending, with the sun out.' },
  { id: 'cat_fish', cat: 'Moments', n: 'The cat and the fish', ml: 'പൂച്ചയും മീനും', where: 'adukkala', hint: 'Leave fish in the pantry; wait by the hearth at one.' },
  { id: 'bats', cat: 'Moments', n: 'Bats leaving the grove', ml: 'വവ്വാലുകൾ', where: 'kaavu', hint: 'At sandhya, all at once.' },
  { id: 'elephant', cat: 'Moments', n: 'The temple elephant', ml: 'ആന', where: 'ambalam', hint: 'Touch the nettipattam at the utsavam.' },
  { id: 'glitter', cat: 'Moments', n: 'Sun on the sea', ml: 'കടലിലെ വെയിൽ', where: 'kadappuram', hint: 'Tap the glitter at sunset.' },
  { id: 'rain_tiles', cat: 'Moments', n: 'Rain in the nadumuttam', ml: 'നടുമുറ്റത്തെ മഴ', where: 'nadumuttam', hint: 'Stand in the courtyard while it rains.' }
];
export function found(id) { if (state.finds[id]) return false; const f = FINDS.find(x => x.id === id); if (!f) return false; state.finds[id] = true; state.today.find = true; audio.sfx('chime'); haptics.success(); say(pick(`Found: ${f.n}`, `കണ്ടെത്തി: ${f.ml}`), f.ml, 2.6); save(); return true; }
export function isFound(id) { return !!state.finds[id]; }
export function findsCount() { return Object.keys(state.finds).length; }
