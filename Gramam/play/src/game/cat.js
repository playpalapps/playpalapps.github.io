import { ellipse, circle, poly } from '../art/draw.js';
import { say } from '../ui/caption.js';
import { audio } from '../engine/audio.js';
import { remember } from './state.js';
export const CAT = { body: '#e4d6bb', dk: '#b9a78a', stripe: '#9d8a6b', nose: '#d99a8e' };
let purrT = 0;
// curled sleeping cat, facing left; s = scale
export function drawCat(c, x, y, t, s = 1, flip = false) {
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); c.scale(s, s);
  const br = 1 + Math.sin(t * 1.3) * .02;
  // shadow
  ellipse(c, 0, 12, 30, 7, 'rgba(30,18,8,.22)');
  // tail curled around
  c.strokeStyle = CAT.dk; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(22, 6); c.quadraticCurveTo(34, 10, 30, -2 + Math.sin(t * .8) * 1.5); c.quadraticCurveTo(26, -8, 16, -4); c.stroke();
  // body
  c.save(); c.scale(br, 1 / br); ellipse(c, 0, 0, 28, 16, CAT.body); c.restore();
  // stripes on back
  c.strokeStyle = CAT.stripe; c.lineWidth = 2.2; c.globalAlpha = .6;
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 9 + 2, -14); c.quadraticCurveTo(i * 9 + 4, -8, i * 9 + 6, -3); c.stroke(); }
  c.globalAlpha = 1;
  // head
  circle(c, -20, -4, 11, CAT.body);
  poly(c, [[-29, -11], [-27, -20], [-21, -13]], CAT.body); poly(c, [[-12, -12], [-13, -20], [-19, -13]], CAT.body);
  poly(c, [[-27.5, -12], [-26.5, -17.5], [-23, -13]], CAT.nose); poly(c, [[-13.5, -13], [-14.5, -17.5], [-18, -13]], CAT.nose);
  // closed eyes + nose
  c.strokeStyle = '#6b5a45'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-26, -5); c.quadraticCurveTo(-24, -3, -22, -5); c.moveTo(-18, -5); c.quadraticCurveTo(-16, -3, -14, -5); c.stroke();
  circle(c, -20, -1, 1.3, CAT.nose);
  // whiskers
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-24, 0); c.lineTo(-33, -1); c.moveTo(-24, 1); c.lineTo(-33, 3); c.stroke();
  c.restore();
}
export function catTap() { audio.sfx('chime'); say('Poocha stretches, yawns, and goes back to sleep.', 'പൂച്ച'); remember('cat', 'The house cat has decided the charupadi belongs to her. I have not argued.'); }
