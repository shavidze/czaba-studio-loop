const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
    const boxes = () => p.evaluate(() => [...document.querySelectorAll('header,nav,main,footer,h1,h2,button,a,input,[role=dialog]')].slice(0, 120).map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, (e.textContent || '').trim().slice(0, 24), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }));
    const res = {};
    for (const [k, u] of [['product', '/products/pulse-loop-kit'], ['store', '/store']]) {
      await p.goto('http://127.0.0.1:5173' + u, { waitUntil: 'load' }); await p.waitForTimeout(3500);
      res[k] = await boxes(); await p.screenshot({ path: `noshift/${k}-${w}.png` });
    }
    await p.goto('http://127.0.0.1:5173/store', { waitUntil: 'load' }); await p.waitForTimeout(3000);
    const signin = p.getByRole('button', { name: /sign in|log in/i }).first();
    if (await signin.count()) { await signin.click(); await p.waitForTimeout(800);
      res.authBefore = await boxes();
      const dlg = p.getByRole('dialog').first();
      const sub = dlg.getByRole('button', { name: /^(sign in|log in|continue|submit)/i }).last();
      if (await sub.count()) { await sub.click(); await p.waitForTimeout(800); }
      res.authAfterEmptySubmit = await boxes(); await p.screenshot({ path: `noshift/auth-${w}.png` });
    } else res.authNote = 'no sign-in button found';
    res.errs = errs;
    fs.writeFileSync(`noshift/boxes-${w}.json`, JSON.stringify(res)); console.log(w, Object.keys(res), res.authNote || '', errs.length);
    await ctx.close();
  }
  await b.close();
})();
