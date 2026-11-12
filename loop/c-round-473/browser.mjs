import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-473';
const b = await chromium.launch();
const res = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const audioSrc = [];
  for (const path of ['/', '/store']) {
    await p.goto('http://127.0.0.1:5173'+path, { waitUntil: 'load' }).catch(()=>{});
    await p.waitForSelector('body h1, body', {timeout:15000}); await p.waitForTimeout(2500);
    res[`${w}${path}`] = await p.evaluate(() => ({
      body: getComputedStyle(document.body).fontFamily,
      h1: document.querySelector('h1') ? getComputedStyle(document.querySelector('h1')).fontFamily : null,
    }));
    await p.screenshot({ path: `${out}/${w}-${path==='/'?'home':'store'}.png` });
  }
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' }).catch(()=>{});
  await p.waitForTimeout(2500);
  res[`${w}/studio-lab`] = { url: p.url(), text: (await p.evaluate(() => document.body.innerText)).slice(0,200), signin: /Sign in required/i.test(await p.content()) };
  await p.screenshot({ path: `${out}/${w}-studio-lab.png` });
  await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load' }).catch(()=>{});
  await p.waitForTimeout(2500);
  res[`${w}/studio/middle-east`] = await p.evaluate(() => ({
    url: location.href,
    signin: /Sign in required/i.test(document.body.innerText),
    audioSrc: [...document.querySelectorAll('audio')].map(a=>a.src).filter(Boolean).length,
    text: document.body.innerText.slice(0,160),
  }));
  await p.screenshot({ path: `${out}/${w}-premium.png` });
  const r = await ctx.request.get('http://127.0.0.1:5173/api/studio-token');
  res[`${w}/api/studio-token`] = r.status();
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${out}/browser.json`, JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
