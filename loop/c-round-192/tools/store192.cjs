// C round 192 — TOKENS-192 probe at HEAD state + Buy Now rendered contrast + PX-NET/REG-HYD
const L = require('./lib.cjs'); const path = require('path');
const KEYS = { background:'#0e0d0c', surface:'#161412', elevated:'#1d1a17', 'muted-bg':'#24201c', 'surface-glass':'#1a1714', 'surface-glass-strong':'#161412', outline:'#24211e', 'outline-hover':'#2e2a26', 'outline-strong':'#736b60', 'outline-light':'rgba(36,33,30,0.5)', brand:'#c9a46a', 'brand-hover':'#d9b87f', 'brand-foreground':'#0e0d0c', accent:'#c9a46a', foreground:'#ece6da', muted:'#a39b8e', dim:'#928a7d', positive:'#8fa382', destructive:'#d2776a', warning:'#d9a35b', secondary:'#cfc7ba', 'bg-alt':'#12100f', 'brand-rgb':'201, 164, 106', 'accent-rgb':'201, 164, 106', buy:'#c9a46a', 'buy-hover':'#d9b87f' };
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|Download the React DevTools/i;
(async () => {
  const browser = await L.launch(); const res = { utc: new Date().toISOString(), runs: [] };
  for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) for (const pg of ['/', '/store', '/products/middle-east']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); const errs = [], hyd = [], auth = [], remote = [], cons = [];
    page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    page.on('console', m => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) hyd.push(t.slice(0, 200)); else if (m.type() === 'error' && !NOISE.test(t)) cons.push(t.slice(0, 200)); });
    page.on('request', q => { const u = q.url(); if (q.headers().authorization) auth.push(u); if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u) && !/^data:|^blob:/.test(u) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) remote.push(u); });
    await page.goto(L.BASE + pg, { waitUntil: 'load' }); await L.sleep(4000);
    const r = await page.evaluate((keys) => {
      const cs = getComputedStyle(document.documentElement); const tok = {};
      for (const k of Object.keys(keys)) tok[k] = cs.getPropertyValue('--color-' + k).trim();
      const norm = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      const cmp = {}; for (const [k, exp] of Object.entries(keys)) { if (k.endsWith('-rgb')) cmp[k] = { got: tok[k], exp, eq: tok[k].replace(/\s/g, '') === exp.replace(/\s/g, '') }; else { const a = norm(tok[k]), b = norm(exp); cmp[k] = { got: tok[k], gotN: a, expN: b, eq: a === b }; } }
      const buy = [...document.querySelectorAll('button')].find(b => /buy now/i.test(b.innerText));
      const bi = buy ? (() => { const s = getComputedStyle(buy); const r = buy.getBoundingClientRect(); return { text: buy.innerText.trim(), color: s.color, bg: s.backgroundColor, cls: buy.className, rect: [r.x, r.y, r.width, r.height] }; })() : null;
      return { bodyBg: getComputedStyle(document.body).backgroundColor, studioTheme: document.querySelectorAll('[data-studio-theme]').length, cmp, buy: bi, title: document.title };
    }, KEYS);
    if (r.buy && pg.startsWith('/products')) { const b = await page.$('button:has-text("Buy Now")'); if (b) { await b.scrollIntoViewIfNeeded(); await L.sleep(300); await b.screenshot({ path: path.join(L.ROOT, 'shots', `buynow-${w}.png`) }); await b.hover(); await L.sleep(400); r.buyHover = await b.evaluate(e => { const s = getComputedStyle(e); return { color: s.color, bg: s.backgroundColor }; }); await b.screenshot({ path: path.join(L.ROOT, 'shots', `buynow-${w}-hover.png`) }); } }
    const mism = Object.entries(r.cmp).filter(([, v]) => !v.eq).map(([k]) => k);
    res.runs.push({ w, h, pg, ...r, mismatchCount: mism.length, mismatches: mism, errs, hyd, auth, remote, cons });
    await ctx.close();
  }
  await browser.close(); L.save(L.OUT, 'store192.json', res);
  for (const x of res.runs) console.log(x.w, x.pg, 'bodyBg', x.bodyBg, 'mismatch', x.mismatchCount + '/26', 'studioTheme', x.studioTheme, 'buy', x.buy && x.buy.bg + ' / ' + x.buy.color, x.buyHover ? 'hover ' + x.buyHover.bg : '', 'errs', x.errs.length, 'hyd', x.hyd.length, 'auth', x.auth.length, 'remote', x.remote.length, 'cons', x.cons.length);
})();
