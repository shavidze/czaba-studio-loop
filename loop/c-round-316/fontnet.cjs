const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [, , base, pathsArg, runsArg, vpArg] = process.argv;
const paths = pathsArg.split(',');
const runs = Number(runsArg || 3);
const [vw, vh] = (vpArg || '1440x900').split('x').map(Number);
(async () => {
  const browser = await chromium.launch();
  // warm-up (L38): one untimed load per path
  {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    const page = await ctx.newPage();
    for (const p of paths) { await page.goto(base + p, { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(800); }
    await ctx.close();
  }
  const out = [];
  for (const p of paths) for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const consoleAll = []; const googleReqs = []; const fontReqs = []; const pageErrors = [];
    const fontResp = [];
    page.on('console', c => { if (c.type() === 'warning' || c.type() === 'error') consoleAll.push(c.type() + ': ' + c.text().slice(0, 160)); });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 160)));
    page.on('request', r => { const u = r.url(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) googleReqs.push(u.slice(0, 100)); if (r.resourceType() === 'font' || /\.woff2/.test(u)) fontReqs.push({ url: u, type: r.resourceType() }); });
    page.on('response', async r => { if (/\.woff2(\?|$)/.test(r.url())) { try { const b = await r.body(); fontResp.push({ file: r.url().replace(/^.*\//, ''), status: r.status(), decoded: b.length, ct: r.headers()['content-type'], cc: r.headers()['cache-control'] }); } catch (e) { fontResp.push({ file: r.url(), err: String(e).slice(0, 80) }); } } });
    await page.goto(base + p, { waitUntil: 'load', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(Number(process.env.HOLD || 2000));
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const res = performance.getEntriesByType('resource').map(r => ({ url: r.name, host: new URL(r.name).host, type: r.initiatorType, blocking: r.renderBlockingStatus, dec: r.decodedBodySize }));
      const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style + ' ' + f.unicodeRange.slice(0, 24));
      const preloads = [...document.head.querySelectorAll('link[rel="preload"]')].map(l => ({ as: l.getAttribute('as'), type: l.getAttribute('type'), co: l.getAttribute('crossorigin'), href: l.getAttribute('href') }));
      const auth = localStorage.getItem('auth_user');
      return { dcl: Math.round(nav.domContentLoadedEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, res, fonts: [...new Set(fonts)].sort(), preloads, auth };
    });
    const third = m.res.filter(r => r.host !== new URL(base).host);
    const counts = {};
    for (const f of fontReqs) { const k = f.url.startsWith('data:') ? 'data:' : f.url.replace(/^.*\//, ''); counts[k] = (counts[k] || 0) + 1; }
    out.push({ vp: `${vw}x${vh}`, path: p, run: i, dcl: m.dcl, fcp: m.fcp, fcpMinusDcl: m.fcp - m.dcl, renderBlockingThirdParty: third.filter(r => r.blocking === 'blocking').map(r => r.url.slice(0, 110)), thirdParty: third.map(r => `${r.type} ${r.blocking} ${r.url.slice(0, 90)}`), fontsLoaded: m.fonts, fontReqCounts: counts, fontResp, decodedTotal: fontResp.reduce((a, b) => a + (b.decoded || 0), 0), googleReqs, preloads: m.preloads, consoleAll, preloadWarnings: consoleAll.filter(c => /preload/i.test(c)), pageErrors, auth: m.auth });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
