// Gentle reminders: opt-in, never more than a few a week, only about things that are yours. Thiruvonam tomorrow, the kani tonight, Raghavan's bell.
import { state } from './state.js';
import { clock } from './clock.js';
import { upcoming } from './festivals.js';
import { platform } from '../engine/platform.js';
import { pick } from '../i18n/t.js';
export async function syncReminders() {
  if (!state.reminders) { await platform.reminders.clear(); return; }
  const u = upcoming(), list = [];
  const at = (d, h, m) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
  if (u.uthradam) list.push({ id: 101, title: pick('Uthradam', 'ഉത്രാടം'), body: pick('Thiruvonam is tomorrow. The pookalam wants its last ring.', 'നാളെ തിരുവോണം. പൂക്കളത്തിന് അവസാനത്തെ വട്ടം വേണം.'), at: at(u.uthradam, 8, 0) });
  if (u.vishuEve) list.push({ id: 102, title: pick('Vishu', 'വിഷു'), body: pick('Set the kani in the ara before you sleep.', 'ഉറങ്ങും മുമ്പ് അറയിൽ കണി ഒരുക്കുക.'), at: at(u.vishuEve, 20, 0) });
  if (clock.mode === 'real' && state.startedAt && state.nextLetterDay > state.days && state.nextLetterDay - state.days <= 14 && state.letters.length < 10) { const d = new Date(state.startedAt); d.setDate(d.getDate() + state.nextLetterDay); list.push({ id: 103, title: pick('The postman', 'പോസ്റ്റുമാൻ'), body: pick('Raghavan’s cycle bell at the gate, around eleven.', 'പതിനൊന്നു മണിയോടെ രാഘവന്റെ സൈക്കിൾ ബെൽ.'), at: at(d, 11, 15) }); }
  await platform.reminders.schedule(list);
}
