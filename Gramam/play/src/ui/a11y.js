// Screen readers cannot see a canvas. This keeps an invisible layer of real buttons over the places you can touch,
// named in the current language, so VoiceOver and TalkBack can walk the scene and activate things with a double-tap.
import { view } from '../engine/canvas.js';
import { t, pick } from '../i18n/t.js';
let root = null, onTap = null, lastKey = '';
export function mountA11y(tapFn) {
  onTap = tapFn; root = document.getElementById('a11y'); if (!root) { root = document.createElement('div'); root.id = 'a11y'; document.body.appendChild(root); }
  root.setAttribute('role', 'group'); root.setAttribute('aria-label', 'Gramam');
}
function btn(label, x, y, r, fn) {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', label); b.textContent = label;
  const s = view.scale; b.style.cssText = `position:absolute;left:${(x - r) * s}px;top:${(y - r) * s}px;width:${r * 2 * s}px;height:${r * 2 * s}px;opacity:0;pointer-events:none;border:0;background:transparent;color:transparent;font-size:1px;`;
  b.addEventListener('click', () => fn && fn()); return b;
}
// rebuild when the scene, its enabled hotspots or the language change
export function updateA11y(scene, extras) {
  if (!root || !scene) return;
  const hs = (scene.hotspots || []).filter(h => !h.enabled || h.enabled()), ex = scene.exits || [];
  const key = scene.name + '|' + hs.map(h => h.label).join(',') + '|' + ex.map(e => e.label).join(',') + '|' + (extras || []).map(e => e.label).join(',') + '|' + document.documentElement.lang;
  if (key === lastKey) return; lastKey = key;
  root.innerHTML = '';
  const ox = scene.ox || 0;
  for (const h of hs) root.appendChild(btn(t(h.label || 'thing'), h.x + ox, h.y, Math.max(22, h.r || 30), () => onTap && onTap({ x: h.x + ox, y: h.y })));
  for (const e of ex) { const p = scene.exitPos(e, Math.min(view.w, 430), view.h); root.appendChild(btn(pick('Go: ', 'പോകുക: ') + t(e.label), p.x + ox, p.y, 30, () => onTap && onTap({ x: p.x + ox, y: p.y }))); }
  for (const e of (extras || [])) root.appendChild(btn(e.label, e.x, e.y, e.r || 26, e.fn));
}
export function setA11yLang(lang) { document.documentElement.lang = lang === 'ml' ? 'ml' : 'en'; lastKey = ''; }
