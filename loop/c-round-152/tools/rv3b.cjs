// C round 152 — FONTS-SCOPED (R4 wording): untouched load, then hover, then focus of the header "Studio Lab" link on / and /cart.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:5173';
const SHOTS = path.join(__dirname, '..', 'shots');
const F2CSS = /fonts\.googleapis\.com\/css2.*(Instrument\+Sans|IBM\+Plex|Noto\+Sans\+Georgian)/i;
const FAMWOFF = /fonts\.gstatic\.com\/s\/(instrumentsans|ibmplexmono|notosansgeorgian)\//i;
const FORBIDDEN = /studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage|r2-proxy|workers\.dev|shopify|identitytoolkit|securetoken|brevo|sendinblue/i;
const snap = () => ({
  bodyFF: getComputedStyle(document.body).fontFamily,
  themeAttr: document.querySelectorAll('[data-studio-theme]').length,
  prefetchLinks: [...document.querySelectorAll('link[rel=prefetch],link[rel=modulepreload],link[rel=stylesheet]')].map((l) => ({ rel: l.rel, href: l.href.slice(0, 200) })).filter((l) => /fonts\.googleapis|studio/i.test(l.href)),
  faces: [...document.fonts].filter((f) => f.status !== 'unloaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.status}`),
  path: location.pathname,
});
(async () => {
  const out = { utc: new Date().toISOString(), pages: {} };
  const browser = await chromium.launch();
  for (const vp of [[1440, 900], [1280, 720]]) {
    for (const pg of ['/', '/cart']) {
      for (let attempt = 1; attempt <= 3; attempt++) {
      const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] } });
      const page = await ctx.newPage();
      let phase = 'load';
      const reqs = []; const errors = []; const hyd = []; const forbidden = []; const auth = [];
      page.on('request', (q) => { const u = q.url(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) reqs.push({ phase, u: u.slice(0, 220), type: q.resourceType(), f2css: F2CSS.test(u), famWoff2: FAMWOFF.test(u) }); if (FORBIDDEN.test(u)) forbidden.push(u); if (q.headers().authorization) auth.push(u); });
      page.on('response', (r) => { const x = reqs.find((q) => q.u === r.url().slice(0, 220) && q.status == null); if (x) x.status = r.status(); });
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
      page.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) hyd.push(m.text().slice(0, 200)); });
      const rec = { vp: vp[0], page: pg };
      try {
        const r = await page.goto(BASE + pg, { waitUntil: 'networkidle', timeout: 60000 }); rec.status = r ? r.status() : null;
        await page.waitForTimeout(2000);
        rec.untouched = await page.evaluate(snap);
        const link = page.locator('header a[href="/studio-lab"]:visible').first();
        rec.linkCount = await page.locator('header a[href="/studio-lab"]:visible').count();
        rec.linkText = rec.linkCount ? (await link.innerText()).trim() : null;
        phase = 'hover';
        if (rec.linkCount && process.env.ORDER !== 'focus') { await link.hover(); await page.waitForTimeout(3000); }
        rec.afterHover = await page.evaluate(snap);
        await page.mouse.move(2, vp[1] - 2); await page.waitForTimeout(500);
        phase = 'focus';
        if (rec.linkCount) { await link.focus(); await page.waitForTimeout(3000); }
        rec.afterFocus = await page.evaluate(snap);
        rec.focused = await page.evaluate(() => (document.activeElement && document.activeElement.getAttribute('href')) || null);
        await page.screenshot({ path: path.join(SHOTS, `rv3b-${pg === '/' ? 'home' : 'cart'}-${vp[0]}.png`) });
      } catch (e) { errors.push('run ' + e.message.slice(0, 200)); }
      rec.fontReqs = reqs;
      rec.counts = Object.fromEntries(['load', 'hover', 'focus'].map((ph) => [ph, { f2css: reqs.filter((q) => q.phase === ph && q.f2css).length, f2cssTypes: reqs.filter((q) => q.phase === ph && q.f2css).map((q) => q.type), famWoff2: reqs.filter((q) => q.phase === ph && q.famWoff2).length }]));
      rec.forbidden = forbidden; rec.auth = auth; rec.errors = errors; rec.hydration = hyd;
      rec.attempt = attempt; rec.order = process.env.ORDER || 'hover-then-focus';
      out.pages[`${pg}@${vp[0]}`] = rec;
      await ctx.close();
      if (!errors.some((e) => /context was destroyed/.test(e))) break;
      await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  await browser.close();
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out.pages)) console.log(k, v.status, v.linkCount, v.linkText, JSON.stringify(v.counts), v.untouched && v.untouched.bodyFF.slice(0, 40), v.untouched && v.untouched.themeAttr, 'focus', v.focused, 'err', v.errors.length, 'hyd', v.hydration.length, 'forb', v.forbidden.length, 'auth', v.auth.length);
})();
