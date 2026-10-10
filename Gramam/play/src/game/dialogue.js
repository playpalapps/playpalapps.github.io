import { say } from '../ui/caption.js';
// lines: array of [english, malayalam?] or strings
export function talk(lines, hold = 3.4) { for (const l of lines) { if (Array.isArray(l)) say(l[0], l[1], hold); else say(l, '', hold); } }
