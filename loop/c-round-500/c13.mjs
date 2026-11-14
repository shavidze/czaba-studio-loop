import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-500/c13/';
const B = 'http://127.0.0.1:5173';
const res = [];
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const p of ['/studio/1', '/account/downloads', '/studio-lab']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
    const page = await ctx.newPage();
    try { await page.goto(B + p, { waitUntil: 'load', timeout: 45000 }); } catch (e) {}
    await page.waitForTimeout(4000);
    const info = await page.evaluate(() => ({
      url: location.pathname,
      body: document.body.innerText.slice(0, 400),
      signIn: /sign in required/i.test(document.body.innerText),
      dl: [...document.querySelectorAll('a[href*="download"],a[download]')].map(a => a.getAttribute('href')).slice(0, 8),
      ls: Object.keys(localStorage),
    }));
    await page.screenshot({ path: `${O}${p.replace(/\//g, '_')}-${w}.png` });
    res.push({ p, vp: `${w}x${h}`, ...info });
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(O + 'c13.json', JSON.stringify(res, null, 1));
for (const r of res) console.log(r.vp, r.p, r.url, 'signIn=', r.signIn, 'dl=', JSON.stringify(r.dl), 'ls=', r.ls.join(','), '|', r.body.replace(/\n+/g, ' / ').slice(0, 150));
