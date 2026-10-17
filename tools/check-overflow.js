#!/usr/bin/env node
// Loads every page at phone widths and fails if anything is wider than the screen.
//   BASE=http://localhost:8765 CHROME_PATH=/path/to/chrome node tools/check-overflow.js
// Measures against the device width, not window.innerWidth: mobile Chrome zooms out to fit
// overflowing content (so innerWidth grows), while iPhone Safari keeps zoom 1 and lets the page pan.
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8765';
const WIDTHS = [320, 360, 390, 414];
const pages = execSync("git ls-files '*.html'").toString().trim().split('\n')
  .filter(p => !/^(thumbnails|assets-pic)\//.test(p) && !/og-card\.html$/.test(p));
// Fixed, decorative background layers that sit past the edge by design (they never scroll)
const DECOR = /^(canvas|div\.(stars|stars2|stars3|asteroid-bg|atmosphere-branch|mesh|grid-bg|vignette|aurora|grain|ambient|mesh-bg|grid-overlay|orb))/;

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
  const page = await browser.newPage();
  const failures = [];
  for (const path of pages) {
    for (const w of WIDTHS) {
      await page.setViewport({ width: w, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.goto(`${BASE}/${path}`, { waitUntil: 'load', timeout: 45000 });
      await new Promise(r => setTimeout(r, 250));
      const r = await page.evaluate((W) => {
        document.querySelectorAll('.reveal').forEach(e => e.classList.add('in', 'visible'));
        const clipped = el => {
          for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement)
            if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflowX)) return true;
          return false;
        };
        const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
          (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
        const out = [];
        for (const el of document.body.querySelectorAll('*')) {
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          const rc = el.getBoundingClientRect();
          if (!rc.width || !rc.height || (rc.right <= W + 1 && rc.left >= -1) || clipped(el)) continue;
          const pr = el.parentElement.getBoundingClientRect();
          if ((pr.right > W + 1 || pr.left < -1) && el.parentElement !== document.body) continue;
          out.push(`${name(el)} [${Math.round(rc.left)}..${Math.round(rc.right)}]`);
        }
        return { inner: innerWidth, doc: document.documentElement.scrollWidth, out };
      }, w);
      const real = r.out.filter(c => !DECOR.test(c));
      if (Math.max(r.inner, r.doc) > w + 1 || real.length) failures.push(`${path} @${w}px: ${real.slice(0, 3).join(' | ') || 'page ' + Math.max(r.inner, r.doc) + 'px wide'}`);
    }
  }
  await browser.close();
  if (failures.length) {
    console.log(`Pages wider than a phone screen (${failures.length}):`);
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log(`Overflow check passed: ${pages.length} pages at ${WIDTHS.join(', ')} px.`);
})().catch(e => { console.error(e); process.exit(1); });
