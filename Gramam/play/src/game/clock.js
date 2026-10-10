// Game clock + Malayalam calendar. Two modes: 'real' (the phone's clock and the real Kollavarsham date) and 'story' (1 real second = 1 game minute).
export const MONTHS = ['Chingam', 'Kanni', 'Thulam', 'Vrischikam', 'Dhanu', 'Makaram', 'Kumbham', 'Meenam', 'Medam', 'Edavam', 'Mithunam', 'Karkidakam'];
export const MONTHS_ML = ['ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം', 'കുംഭം', 'മീനം', 'മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം'];
export const RAIN = [.45, .35, .5, .3, .1, .02, .02, .05, .15, .7, .9, .95];
// approximate sankranti (month start) dates, [gregorianMonth(1-12), day]; good to within a day
const STARTS = [[8, 17], [9, 17], [10, 17], [11, 16], [12, 16], [1, 14], [2, 13], [3, 14], [4, 14], [5, 15], [6, 15], [7, 17]];
export function malayalamDate(d = new Date()) {
  const y = d.getFullYear(), t = Date.UTC(y, d.getMonth(), d.getDate());
  let best = null;
  for (let i = 0; i < 12; i++) { for (const yy of [y - 1, y]) { const s = Date.UTC(yy, STARTS[i][0] - 1, STARTS[i][1]); if (s <= t && (!best || s > best.s)) best = { s, i }; } }
  const day = Math.round((t - best.s) / 86400000) + 1;
  return { month: best.i, day };
}
export const clock = {
  mode: 'real',
  minutes: 7 * 60 + 15, day: 1, month: 0, speed: 1,
  get hour() { return this.minutes / 60; },
  get phase() { const h = this.hour; if (h < 5) return 'rathri'; if (h < 7) return 'velupp'; if (h < 11) return 'ravile'; if (h < 16) return 'uchha'; if (h < 19) return 'sandhya'; return 'rathri'; },
  phaseName() { return { velupp: 'Velupp', ravile: 'Ravile', uchha: 'Uchha', sandhya: 'Sandhya', rathri: 'Rathri' }[this.phase]; },
  phaseNameML() { return { velupp: 'വെളുപ്പ്', ravile: 'രാവിലെ', uchha: 'ഉച്ച', sandhya: 'സന്ധ്യ', rathri: 'രാത്രി' }[this.phase]; },
  timeStr() { const h = Math.floor(this.hour), m = Math.floor(this.minutes % 60); const hh = h % 12 || 12; return `${hh}:${m < 10 ? '0' : ''}${m} ${h >= 12 ? 'pm' : 'am'}`; },
  dateStr() { return `${MONTHS[this.month]} ${this.day}`; },
  dateStrML() { return `${MONTHS_ML[this.month]} ${this.day}`; },
  weekday() { return this.mode === 'real' ? new Date().getDay() : (this.day + this.month * 30) % 7; },
  syncReal() { const n = new Date(); this.minutes = n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60; const md = malayalamDate(n); this.month = md.month; this.day = md.day; },
  advance(dt) {
    if (this.mode === 'real') { this.syncReal(); return; }
    this.minutes += dt * this.speed;
    while (this.minutes >= 1440) { this.minutes -= 1440; this.day++; if (this.day > 30) { this.day = 1; this.month = (this.month + 1) % 12; } }
  },
  get daylight() { const h = this.hour; const rise = sm((h - 5.3) / 1.6), set = 1 - sm((h - 17.6) / 1.6); return Math.max(0, Math.min(rise, set)); },
  get warmth() { const h = this.hour; return Math.max(bump(h, 6.3, 1.2), bump(h, 18.1, 1.3)); },
  rainChance() { return RAIN[this.month]; },
  get moon() { if (this.mode === 'real') { const phase = ((Date.now() / 86400000 - 10.9) % 29.53 + 29.53) % 29.53; return 1 - Math.abs(phase - 14.77) / 14.77; } const d = Math.abs(this.day - 15); return Math.max(0, 1 - d / 15); },
  dayKey() { return this.mode === 'real' ? new Date().toDateString() : `${this.month}-${this.day}`; }
};
function sm(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
function bump(h, c, w) { const d = Math.abs(h - c) / w; return d >= 1 ? 0 : 1 - d * d; }
