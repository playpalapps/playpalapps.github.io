// Session notes: a private, local summary a tester can send by WhatsApp. No server, nothing leaves the phone unless they share it.
import { state } from './state.js';
import { clock } from './clock.js';
import { ARCS, arcProgress } from './people.js';
import { FINDS } from './finds.js';
export function sessionNotes(perf) {
  const L = [];
  L.push(`Gramam session notes · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
  L.push(`device: ${navigator.userAgent.slice(0, 90)} · ${innerWidth}×${innerHeight} @${devicePixelRatio}`);
  L.push(`mode: ${clock.mode} · lang: ${state.lang || 'en'} · text ${state.textScale || 1} · motion ${state.reduceMotion ? 'reduced' : 'full'} · contrast ${state.highContrast ? 'high' : 'soft'}`);
  L.push(`days home: ${state.days + 1} · good days: ${state.goodDays || 0} · sessions: ${state.stats.sessions || 0} · diary lines: ${state.diary.length}`);
  L.push(`letters read: ${state.lettersRead}/10 · Ravi home: ${state.raviHome >= 0 ? 'yes' : 'no'} · Amma pages: ${state.ammaRead} · finds: ${FINDS.filter(f => state.finds[f.id]).length}/${FINDS.length} · dishes: ${Object.keys(state.dishes).length} · postcards: ${state.stats.postcards || 0}`);
  L.push('people: ' + Object.keys(ARCS).map(k => `${k} ${arcProgress(k)}/${ARCS[k].beats.length}`).join(', '));
  const sc = Object.entries(state.stats.scenes || {}).sort((a, b) => b[1] - a[1]); L.push('places (visits): ' + sc.map(([k, v]) => `${k} ${v}`).join(', '));
  const vb = Object.entries(state.stats.verbs || {}).sort((a, b) => b[1] - a[1]); L.push('things done: ' + (vb.length ? vb.map(([k, v]) => `${k} ${v}`).join(', ') : 'none yet'));
  if (perf) L.push(`frame: ${perf.frame.toFixed(1)} ms · draw: ${perf.work.toFixed(1)} ms · worst: ${perf.worst.toFixed(1)} ms`);
  L.push('What confused you? What made you smile? Reply to this message.');
  return L.join('\n');
}
