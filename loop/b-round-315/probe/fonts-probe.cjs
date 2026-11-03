const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:5316';
const paths = (process.argv[3] || '/studio-lab,/').split(',');
const runs = Number(process.argv[4] || 3);
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const p of paths) for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const failed = []; const fontReqs = []; const consoleWarn = []; page.on('console', c => { if (/preload/i.test(c.text())) consoleWarn.push(c.text().slice(0,140)); }); const googleReqs = [];
    page.on('request', r => { const u = r.url(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) googleReqs.push(u.slice(0,90)); if (r.resourceType() === 'font') fontReqs.push(u.replace(/^.*\//,'').slice(0,60)); });
    page.on('requestfailed', r => failed.push(r.url().slice(0, 100) + ' ' + (r.failure() || {}).errorText));
    await page.goto(base + p, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(Number(process.env.HOLD || 1500));
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const res = performance.getEntriesByType('resource').map(r => ({ url: r.name, host: new URL(r.name).host, type: r.initiatorType, blocking: r.renderBlockingStatus, end: Math.round(r.responseEnd), bytes: r.transferSize }));
      const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style);
      return { dcl: Math.round(nav.domContentLoadedEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, res, fonts: [...new Set(fonts)] };
    });
    const third = m.res.filter(r => r.host !== new URL(base).host);
    out.push({ path: p, run: i, dcl: m.dcl, fcp: m.fcp, fcpMinusDcl: m.fcp - m.dcl, renderBlockingThirdParty: third.filter(r => r.blocking === 'blocking').map(r => r.url.slice(0, 110)), thirdParty: third.map(r => `${r.type} ${r.blocking} ${r.url.slice(0, 90)}`), fontsLoaded: m.fonts, fontReqs, googleReqs, consoleWarn, failed });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
