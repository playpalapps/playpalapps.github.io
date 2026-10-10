// Feeds the home-screen widget: a small JSON with the date, the lamp, the rain, today's small things and the last diary line. Native only; silent elsewhere.
import { state } from './state.js';
import { clock } from './clock.js';
import { tasksForToday } from './tasks.js';
import { t } from '../i18n/t.js';
let plugin = null, lastJson = '', lastAt = 0;
function get() { if (plugin !== null) return plugin; try { const C = window.Capacitor; plugin = (C && C.isNativePlatform && C.isNativePlatform() && C.registerPlugin) ? C.registerPlugin('WidgetBridge') : false; } catch (e) { plugin = false; } return plugin; }
export function pushWidget(force = false) {
  const p = get(); if (!p) return;
  const now = Date.now(); if (!force && now - lastAt < 30000) return;
  const T = tasksForToday(), last = state.diary.length ? state.diary[state.diary.length - 1].text : '';
  const v = { date: clock.dateStr(), dateML: clock.dateStrML(), lamp: !!state.lamp, lang: state.lang || 'en', rain: state.rainT > .2, tasks: T.map(x => x.t), tasksML: T.map(x => x.ml), done: T.map(x => !!x.done()), line: last.length > 90 ? last.slice(0, 88) + '…' : last, lineML: last ? t(last) : '' };
  if (state.lang === 'ml') v.tasks = v.tasksML;
  const json = JSON.stringify(v); if (json === lastJson && !force) return; lastJson = json; lastAt = now;
  try { p.update({ json }); } catch (e) { }
}
