// C round 150 — RV-3b, adapted from b-round-148/tools/storebase149.cjs (same reads), with one retry when a page navigates during the read.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const BASE = 'http://127.0.0.1:5173';
const PAGES = ['/', '/studio-lab', '/login', '/cart'];
const TOKENS = ['background','surface','elevated','muted-bg','outline','outline-hover','outline-strong','outline-light','foreground','muted','dim','brand','brand-hover','brand-foreground','accent','positive','warning','destructive'];
const read = (TOKENS) => {
  const rd = (el) => { const cs = getComputedStyle(el); const o = {}; for (const t of TOKENS) o[t] = cs.getPropertyValue('--color-' + t).trim(); return o; };
  const ws = document.querySelector('.studio-container');
  const ffv = (el) => { const cs = getComputedStyle(el); return { ff: cs.fontFamily, sans: cs.getPropertyValue('--font-sans').trim(), mono: cs.getPropertyValue('--font-mono').trim(), serif: cs.getPropertyValue('--font-serif').trim() }; };
  return { fonts: { html: ffv(document.documentElement), body: ffv(document.body), workspace: ws ? ffv(ws) : null }, faces: [...new Set([...document.fonts].filter((f) => f.status !== 'unloaded').map((f) => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.status))], path: location.pathname, root: rd(document.documentElement), body: rd(document.body), bodyBg: getComputedStyle(document.body).backgroundColor, workspace: ws ? rd(ws) : null, workspaceBg: ws ? getComputedStyle(ws).backgroundColor : null, themeAttrCount: document.querySelectorAll('[data-studio-theme]').length, title: document.title };
};
(async () => {
  const out = { label: process.argv[2], utc: new Date().toISOString(), pages: {} };
  const browser = await chromium.launch();
  for (const vp of [[1440, 900], [1280, 720]]) {
    for (const p of PAGES) {
      const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
      const page = await ctx.newPage();
      const errors = []; const navs = []; const fontReq = [];
      page.on('request', (q) => { const u = q.url(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) fontReq.push({ u: u.slice(0, 160), type: q.resourceType() }); });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('framenavigated', (f) => { if (f === page.mainFrame()) navs.push(f.url()); });
      let status = null;
      try { const r = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 45000 }); status = r ? r.status() : null; } catch (e) { errors.push('goto ' + e.message); }
      await page.waitForTimeout(1500);
      let info = null; let attempts = 0;
      for (; attempts < 3 && !info; attempts++) { try { info = await page.evaluate(read, TOKENS); } catch (e) { errors.push('evaluate ' + e.message.slice(0, 120)); await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(1500); } }
      const shot = `/home/runner/czaba-project/tmp/studio-real-loop/c-round-153/shots/rv3-152-${p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')}-${vp[0]}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      const f2 = fontReq.filter((r) => /Instrument\+Sans|IBM\+Plex|Noto\+Sans\+Georgian|instrumentsans|ibmplexmono|notosansgeorgian/i.test(r.u));
      out.pages[`${p}@${vp[0]}`] = { fontReq, f2Requests: f2, status, errors, navs, attempts, shot, ...info };
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  console.log('ok');
})();
