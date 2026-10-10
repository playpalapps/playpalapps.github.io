import { state, remember, note, save } from './state.js';
import { clock } from './clock.js';
import { fest } from './festivals.js';
export const ITEMS = {
  rice: ['Rice', 'അരി'], coconut: ['Coconut', 'തേങ്ങ'], jaggery: ['Jaggery', 'ശർക്കര'], banana: ['Bananas', 'പഴം'], jackfruit: ['Jackfruit', 'ചക്ക'], tapioca: ['Tapioca', 'കപ്പ'], milk: ['Milk', 'പാൽ'], fish: ['Sardines', 'മത്തി'], tea: ['Tea dust', 'ചായപ്പൊടി'], coffee: ['Coffee', 'കാപ്പിപ്പൊടി'], oil: ['Coconut oil', 'വെളിച്ചെണ്ണ'], vegetables: ['Vegetables', 'പച്ചക്കറി'], eggs: ['Eggs', 'മുട്ട'], flour: ['Rice flour', 'അരിപ്പൊടി'], paddy: ['Paddy (para)', 'നെല്ല്']
};
// where: chembu (kettle), chatti (pot), ammi (grinding stone), ural (mortar), chirava (scraper), puttu (steamer)
export const RECIPES = [
  { id: 'kaapi', name: 'Kaapi', ml: 'കാപ്പി', where: 'chembu', needs: { coffee: 1, jaggery: 1 }, line: 'Black kaapi, sweet with jaggery, in a steel glass.', diary: 'Made kaapi on the aduppu, in the chembu that has been on that fire since before I was born. Jaggery, not sugar.' },
  { id: 'chaya', name: 'Chaya', ml: 'ചായ', where: 'chembu', needs: { tea: 1, milk: 1 }, line: 'Milky chaya, pulled long between two glasses.', diary: 'Pulled chaya the way they do at the kada, a metre of it in the air. Spilled a third.' },
  { id: 'kanji', name: 'Kanji & chammanthi', ml: 'കഞ്ഞിയും ചമ്മന്തിയും', where: 'chatti', needs: { rice: 1, coconut: 1 }, line: 'Hot kanji in a wide bowl, chammanthi on the side, a spoon made of a jackfruit leaf.', diary: 'Kanji for lunch, with chammanthi and a plavila spoon. The simplest meal in the world and I had missed it the most.' },
  { id: 'puttu', name: 'Puttu & kadala', ml: 'പുട്ടും കടലയും', where: 'puttu', needs: { flour: 1, coconut: 1 }, line: 'Steamed puttu, layered with coconut, with black chickpea curry.', diary: 'Puttu from the bamboo puttukutti, with kadala curry. The steam fogged the kitchen window.' },
  { id: 'dosa', name: 'Dosa', ml: 'ദോശ', where: 'chatti', needs: { rice: 1, oil: 1 }, line: 'Thin crisp dosa off the iron kallu.', diary: 'Dosa on the iron kallu, the batter hissing as it hit. The first one is always for the crows.' },
  { id: 'kappa', name: 'Kappa & meen curry', ml: 'കപ്പയും മീൻകറിയും', where: 'chatti', needs: { tapioca: 1, fish: 1, coconut: 1 }, line: 'Boiled kappa with a fiery red sardine curry from the manchatti.', diary: 'Kappa and meen curry, the curry cooked in the clay manchatti so it tastes of the earth and the river both.' },
  { id: 'meencurry', name: 'Meen curry', ml: 'മീൻകറി', where: 'chatti', needs: { fish: 1, coconut: 1 }, line: 'Sardines in a kudampuli-sour red gravy, left overnight to deepen.', diary: 'Mathi curry in the manchatti with kudampuli. Better tomorrow, Amma always said, and she was right.' },
  { id: 'avial', name: 'Avial', ml: 'അവിയൽ', where: 'chatti', needs: { vegetables: 1, coconut: 1 }, line: 'Mixed vegetables in ground coconut and curd, a spoon of raw coconut oil on top.', diary: 'Avial, every vegetable in the thodi cut long and cooked together. The smell of raw coconut oil at the end.' },
  { id: 'pazhampori', name: 'Pazhampori', ml: 'പഴംപൊരി', where: 'chatti', needs: { banana: 1, flour: 1, oil: 1 }, line: 'Ripe plantain in a crisp golden batter.', diary: 'Fried pazhampori for four o’clock chaya. Ate one standing at the stove, which is the correct way.' },
  { id: 'chakka', name: 'Chakka puzhukku', ml: 'ചക്ക പുഴുക്ക്', where: 'chatti', needs: { jackfruit: 1, coconut: 1 }, line: 'Raw jackfruit mashed with coconut, cumin and a splash of oil.', diary: 'Chakka puzhukku from the tree in the thodi. The whole house smelled of jackfruit for a day.' },
  { id: 'payasam', name: 'Palada payasam', ml: 'പാലട പായസം', where: 'chatti', needs: { milk: 1, rice: 1, jaggery: 1 }, line: 'Pink-tinged palada payasam, slow-cooked until the milk thickens.', diary: 'Palada payasam, stirred for an hour in the uruli. The spoon stood up on its own at the end.' },
  { id: 'unniyappam', name: 'Unniyappam', ml: 'ഉണ്ണിയപ്പം', where: 'chatti', needs: { flour: 1, jaggery: 1, banana: 1 }, line: 'Little dark sweet appams from the appakkara.', diary: 'Unniyappam from the iron appakkara. Burnt my fingers, as is tradition.' },
  { id: 'eggroast', name: 'Mutta roast', ml: 'മുട്ട റോസ്റ്റ്', where: 'chatti', needs: { eggs: 1, oil: 1 }, line: 'Boiled eggs tossed in slow-fried onion masala.', diary: 'Mutta roast from the hens’ eggs. The hens looked at me differently afterwards.' },
  { id: 'thiruvathira', name: 'Thiruvathira puzhukku', ml: 'തിരുവാതിര പുഴുക്ക്', where: 'chatti', needs: { tapioca: 1, coconut: 1, vegetables: 1 }, line: 'Ettangadi: eight tubers roasted and cooked with coconut for the Thiruvathira night.', diary: 'Thiruvathira puzhukku, eight tubers, for the long night of the women’s festival.', when: () => fest().thiruvathira },
  { id: 'karkidakakanji', name: 'Karkidaka kanji', ml: 'കർക്കടക കഞ്ഞി', where: 'chatti', needs: { rice: 1, milk: 1, jaggery: 1 }, line: 'Medicinal rice gruel with fenugreek and jaggery, for the rain month.', diary: 'Karkidaka kanji with the herbs from the kada. Bitter, warm, and apparently good for a hundred things.', when: () => fest().karkidakam },
  { id: 'sadya', name: 'Onasadya', ml: 'ഓണസദ്യ', where: 'chatti', needs: { rice: 2, coconut: 2, vegetables: 1, jaggery: 1, milk: 1 }, line: 'The full sadya on a banana leaf: sambar, avial, thoran, olan, kalan, pachadi, pappadam, payasam.', diary: 'Onasadya on a vazhayila, twenty-six things in their right places on the leaf. Ate until the leaf was folded towards me.', when: () => fest().thiruvonam }
];
// where each thing comes from, for the notebook: the kada sells the dry goods; the rest is the thodi, the cow, the river and the sea
export const SOURCES = { rice: 'kada', jaggery: 'kada', oil: 'kada', tea: 'kada', coffee: 'kada', vegetables: 'kada', flour: 'kada', milk: 'Lakshmi at dawn, or Kuttan', eggs: 'the hens in the thodi', fish: 'the meenkari, the kadavu, the kadappuram', jackfruit: 'the plavu in the thodi', banana: 'the vazha in the thodi', tapioca: 'the kappa patch in the thodi', coconut: 'the thengu in the thodi', paddy: 'the harvest, or the pathayam' };
export function kadaSells(k) { return SOURCES[k] === 'kada'; }
// put the kada things a recipe lacks on the list; returns the names added
export function listFor(r) { const added = []; for (const k in r.needs) { const short = r.needs[k] - (state.pantry[k] || 0); if (short > 0 && kadaSells(k)) { state.shopping[k] = Math.max(state.shopping[k] || 0, short); added.push(ITEMS[k][0].toLowerCase()); } } save(); return added; }
export function available(r) { if (r.when && !r.when()) return false; return true; }
export function canCook(r) { for (const k in r.needs) if ((state.pantry[k] || 0) < r.needs[k]) return false; return true; }
export function missing(r) { const m = []; for (const k in r.needs) if ((state.pantry[k] || 0) < r.needs[k]) m.push(ITEMS[k][0].toLowerCase()); return m; }
export function cook(r) {
  for (const k in r.needs) state.pantry[k] -= r.needs[k];
  state.dishes[r.id] = (state.dishes[r.id] || 0) + 1;
  state.served = { id: r.id, at: clock.minutes, day: clock.day };
  if (!remember('dish_' + r.id, r.diary)) save();
  if (r.id === 'sadya') state.festival.sadyaDay = clock.day;
  if (r.id === 'thiruvathira') state.festival.puzhukkuDay = clock.day;
  if (r.id === 'karkidakakanji') state.festival.kanjiDay = clock.day;
}
export function add(k, n = 1) { state.pantry[k] = (state.pantry[k] || 0) + n; save(); }
