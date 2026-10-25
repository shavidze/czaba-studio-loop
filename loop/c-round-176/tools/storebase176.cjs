const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const BASE = 'http://127.0.0.1:5173';
const PAGES = ['/', '/studio-lab', '/login', '/cart'];
const TOKENS = ['background','surface','elevated','muted-bg','outline','outline-hover','outline-strong','outline-light','foreground','muted','dim','brand','brand-hover','brand-foreground','accent','positive','warning','destructive'];
(async () => {
  const out = { label: process.argv[2] || 'pre-V-1 Store baseline (b292ff4)', utc: new Date().toISOString(), pages: {} };
  const browser = await chromium.launch();
  for (const vp of [[1440, 900], [1280, 720]]) {
    for (const p of PAGES) {
      const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      let status = null;
      try {
        const r = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 45000 });
        status = r ? r.status() : null;
      } catch (e) { errors.push('goto ' + e.message); }
      await page.waitForTimeout(1500);
      const info = await page.evaluate((TOKENS) => {
        const read = (el) => { const cs = getComputedStyle(el); const o = {}; for (const t of TOKENS) o[t] = cs.getPropertyValue('--color-' + t).trim(); return o; };
        const ws = document.querySelector('.studio-container');
        return {
          root: read(document.documentElement), body: read(document.body),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          workspace: ws ? read(ws) : null, workspaceBg: ws ? getComputedStyle(ws).backgroundColor : null,
          themeAttrCount: document.querySelectorAll('[data-studio-theme]').length,
          title: document.title,
        };
      }, TOKENS);
      const shot = `shots/storebase176-${p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')}-${vp[0]}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      out.pages[`${p}@${vp[0]}`] = { status, errors, shot, ...info };
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(process.argv[3] || 'out/storebase149.json', JSON.stringify(out, null, 1));
  console.log('ok');
})();
