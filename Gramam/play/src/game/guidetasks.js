// Where each small thing is done, so a tap on the Today list can take you there and point.
export const TASK_PLACE = {
  lamp: { scene: 'poomukham', label: 'nilavilakku', text: 'Tap the lamp to light it.', ml: 'വിളക്ക് കൊളുത്താൻ തൊടുക.' },
  water: { scene: 'poomukham', label: 'kinar', text: 'Pull the rope down, then up.', ml: 'കയർ താഴേക്ക് വലിക്കുക, പിന്നെ മേലോട്ട്.', gesture: 'updown' },
  thulasi: { scene: 'poomukham', label: 'thulasi', text: 'Tap the thulasi to water it. Draw water first.', ml: 'വെള്ളം ഒഴിക്കാൻ തുളസിയെ തൊടുക.' },
  kaapi: { scene: 'adukkala', label: 'chembu', text: 'Tap the chembu and choose Kaapi.', ml: 'ചെമ്പ് തൊട്ട് കാപ്പി തിരഞ്ഞെടുക്കുക.' },
  cook: { scene: 'adukkala', label: 'Amma’s notebook', text: 'Open Amma’s notebook and pick a dish.', ml: 'അമ്മയുടെ നോട്ടുബുക്ക് തുറന്ന് ഒരു വിഭവം തിരഞ്ഞെടുക്കുക.' },
  cow: { scene: 'thodi', label: 'Lakshmi', text: 'Tap Lakshmi to feed her.', ml: 'ലക്ഷ്മിക്ക് തീറ്റ കൊടുക്കാൻ തൊടുക.' },
  milk: { scene: 'thodi', label: 'Lakshmi', text: 'Tap Lakshmi in the morning to milk her.', ml: 'രാവിലെ പാൽ കറക്കാൻ ലക്ഷ്മിയെ തൊടുക.' },
  sweep: { scene: 'nadumuttam', label: 'chool · sweep the leaves', text: 'Sweep the leaves side to side.', ml: 'ഇലകൾ അങ്ങോട്ടുമിങ്ങോട്ടും അടിച്ചുവാരുക.', gesture: 'side' },
  paper: { scene: 'poomukham', label: 'charupadi', text: 'Tap the bench to read the paper.', ml: 'പത്രം വായിക്കാൻ ചാരുപടി തൊടുക.' },
  chaya: { scene: 'chayakkada', label: 'chaya', text: 'Tap for a chaya.', ml: 'ചായയ്ക്ക് തൊടുക.' },
  temple: { scene: 'ambalam', label: 'sreekovil', text: 'Tap the sreekovil to walk around it.', ml: 'പ്രദക്ഷിണം വെക്കാൻ ശ്രീകോവിൽ തൊടുക.' },
  bathe: { scene: 'kulam', label: 'bathe', text: 'Tap the water to bathe.', ml: 'കുളിക്കാൻ വെള്ളം തൊടുക.' },
  eggs: { scene: 'thodi', label: 'kozhi', text: 'Tap the hens for the eggs.', ml: 'മുട്ടയ്ക്ക് കോഴികളെ തൊടുക.' },
  library: { scene: 'vayanasala', label: 'books', text: 'Tap the shelf to borrow a book.', ml: 'പുസ്തകം എടുക്കാൻ അലമാര തൊടുക.' },
  kada: { scene: 'kada', label: 'Kunjappan', text: 'Tap a sack to buy; Kunjappan writes it down.', ml: 'വാങ്ങാൻ ഒരു ചാക്ക് തൊടുക.' },
  letter: { scene: 'poomukham', label: 'letter', text: 'Tap the letter on the bench.', ml: 'ചാരുപടിയിലെ കത്ത് തൊടുക.' },
  post: { scene: 'kavala', label: 'post box', text: 'Tap the red box to post a letter.', ml: 'കത്തയയ്ക്കാൻ ചുവന്ന പെട്ടി തൊടുക.' },
  radio: { scene: 'nadumuttam', label: 'Murphy radio', text: 'Tap the radio.', ml: 'റേഡിയോ തൊടുക.' },
  kadavu: { scene: 'kadavu', label: 'steps', text: 'Tap the steps to sit by the river.', ml: 'പുഴയരികിൽ ഇരിക്കാൻ പടവ് തൊടുക.' },
  find: { hud: 'diary', text: 'The Found page says where things hide.', ml: 'കണ്ടെത്തിയത് പേജിൽ എവിടെയെന്ന് കാണാം.' },
  school: { scene: 'pallikkoodam', label: 'school bell', text: 'Tap the bell.', ml: 'മണി തൊടുക.' },
  beach: { scene: 'kadappuram', label: 'walk the shore', text: 'Tap the wet sand to walk.', ml: 'നടക്കാൻ നനഞ്ഞ മണൽ തൊടുക.' },
  sleep: { scene: 'ara', label: 'kattil', text: 'Tap the cot to sleep.', ml: 'ഉറങ്ങാൻ കട്ടിൽ തൊടുക.' }
};
// the first time a hands-on thing is met, show how
export const VERB_HINTS = {
  'kinar': { text: 'Pull the rope down, then up, hand over hand.', ml: 'കയർ താഴേക്ക്, പിന്നെ മേലോട്ട്.', gesture: 'updown' },
  'pookalam': { text: 'Lay the flowers round in a circle with your finger.', ml: 'വിരൽകൊണ്ട് വട്ടത്തിൽ പൂക്കൾ നിരത്തുക.', gesture: 'circle' },
  'ammikkallu': { text: 'Rub the stone side to side.', ml: 'കല്ല് അങ്ങോട്ടുമിങ്ങോട്ടും ഉരയ്ക്കുക.', gesture: 'side' },
  'chool · sweep the leaves': { text: 'Sweep side to side.', ml: 'അങ്ങോട്ടുമിങ്ങോട്ടും അടിച്ചുവാരുക.', gesture: 'side' },
  'bell rope': { text: 'Pull the rope right down and let go.', ml: 'കയർ താഴെ വരെ വലിച്ചു വിടുക.', gesture: 'down' },
  'deepastambham': { text: 'Draw your finger up the pillar to light it.', ml: 'വിരൽ തൂണിലൂടെ മേലോട്ട് വലിക്കുക.', gesture: 'up' },
  'harmonium': { text: 'Press the keys, or slide along them.', ml: 'കട്ടകൾ അമർത്തുക, അല്ലെങ്കിൽ തെന്നി നീങ്ങുക.', gesture: 'side' },
  'karamadi · haul the net': { text: 'Haul the rope towards the land, stroke by stroke.', ml: 'കയർ കരയിലേക്ക് വലിക്കുക, ഓരോ വലിയായി.', gesture: 'side' },
  'kite · tug the thread': { text: 'Tug the thread upward.', ml: 'നൂൽ മേലോട്ട് വലിക്കുക.', gesture: 'up' },
  'carrom · flick the striker': { text: 'Pull the striker back and let go.', ml: 'സ്ട്രൈക്കർ പിന്നോട്ട് വലിച്ച് വിടുക.', gesture: 'down' },
  'bench · wait for the train': { text: 'Sit here and the train will come.', ml: 'ഇവിടെ ഇരുന്നാൽ വണ്ടി വരും.' },
  'kadathu · call the ferry': { text: 'Tap to call Pappan across.', ml: 'പാപ്പനെ വിളിക്കാൻ തൊടുക.' },
  'bus stop · wave it down': { text: 'Tap to wave the bus down.', ml: 'ബസ്സിന് കൈ കാണിക്കാൻ തൊടുക.' },
  'pole it yourself': { text: 'Push the pole down, stroke by stroke.', ml: 'കഴ താഴേക്ക് തള്ളുക.', gesture: 'down' }
};
