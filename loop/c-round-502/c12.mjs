import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-502/c12';
const B = 'http://127.0.0.1:5173';
const b = await chromium.launch(); const rows = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  for (const path of ['/studio/1', '/account/downloads', '/studio-lab']) {
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    await p.goto(B + path, { waitUntil: 'load', timeout: 60000 }).catch((e) => errs.push('goto ' + e.message.slice(0, 80)));
    await p.waitForTimeout(4000);
    const m = await p.evaluate(() => ({ url: location.pathname, signIn: /sign in required/i.test(document.body.innerText), dl: [...document.querySelectorAll('a[href*="download"],a[download]')].map((a) => a.getAttribute('href')).slice(0, 5), studioLab: !!document.querySelector('[data-testid],canvas,main') , text: document.body.innerText.slice(0, 160).replace(/\n/g, ' | '), play: [...document.querySelectorAll('button')].some((x) => /play/i.test(x.getAttribute('aria-label') || x.textContent || '')) }));
    rows.push({ vp: `${w}x${h}`, path, ...m, errs });
    if (path === '/studio-lab') await p.screenshot({ path: `${out}/studio-lab-${w}x${h}.png` });
    await p.close();
  }
  await ctx.close();
}
await b.close(); fs.writeFileSync(out + '/c12.json', JSON.stringify(rows, null, 1)); console.log(JSON.stringify(rows.map(r=>({vp:r.vp,path:r.path,url:r.url,signIn:r.signIn,dl:r.dl,play:r.play,text:r.text.slice(0,90),errs:r.errs.length}))));
