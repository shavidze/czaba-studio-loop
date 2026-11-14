import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const BASE = 'http://127.0.0.1:5173';
const browser = await chromium.launch(); const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  const r = {};
  for (const p of ['/studio/1', '/account/downloads']) {
    await page.goto(BASE + p, { waitUntil: 'load' }); await page.waitForLoadState('networkidle').catch(()=>{}); await page.waitForTimeout(4000);
    r[p] = await page.evaluate(() => ({ url: location.pathname, signInReq: /Sign in required/i.test((document.body?.innerText||'')), dl: [...document.querySelectorAll('a')].filter(a => /download|\.wav|\.mp3|\.zip|r2|presign/i.test((a.getAttribute('href') || '') + a.innerText)).map(a => a.getAttribute('href') + '|' + a.innerText.trim().slice(0, 30)).slice(0, 5), body: (document.body?.innerText||'').replace(/\s+/g, ' ').slice(0, 160) }));
  }
  await page.screenshot({ path: `${out}/c12-downloads-${w}.png` });
  await page.goto(BASE + '/studio-lab', { waitUntil: 'load' }); await page.waitForTimeout(4000);
  r.lab = await page.evaluate(() => ({ title: document.title, text: (document.body?.innerText||'').replace(/\s+/g, ' ').slice(0, 220), buttons: document.querySelectorAll('button').length, scrollW: document.documentElement.scrollWidth, innerW: innerWidth, hasPlay: !!document.querySelector('[aria-label*="Play" i]') }));
  await page.screenshot({ path: `${out}/c12-studio-lab-${w}.png` });
  r.errs = errs; res[w] = r; await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/prot.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
