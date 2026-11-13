import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = {};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); // fresh incognito, no creds
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await p.waitForFunction(() => document.body.innerText.includes('Demo collection ready'), null, { timeout: 60000 }).catch(() => {});
  const lab = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), demo: document.body.innerText.includes('Demo collection ready'), title: document.title }));
  await p.screenshot({ path: `c-round-485/auth-lab-${w}.png` });
  await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load' });
  await p.waitForTimeout(5000);
  const prod = await p.evaluate(() => ({ text: document.body.innerText.slice(0, 300), audioSrc: document.querySelectorAll('audio[src]').length, auth: localStorage.getItem('auth_user') }));
  await p.screenshot({ path: `c-round-485/auth-product-${w}.png` });
  out[w] = { lab, prod };
  await ctx.close();
}
fs.writeFileSync('c-round-485/auth.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
await b.close();
