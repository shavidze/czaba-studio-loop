import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const NEEDLE = 'Server timeout elapsed without receiving a message from the server.';
const out = {};
const browser = await chromium.launch();
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  // NO-SIGNALR on prod (5190), also HEAD-equivalent control: scan dev? only prod
  for (const [name, url] of [['studio-lab', '/studio-lab'], ['home', '/']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const scripts = [];
    page.on('response', async (res) => { if (res.request().resourceType() === 'script') { try { const t = await res.text(); scripts.push({ url: res.url().replace(/^.*\/\/[^/]+/, ''), len: t.length, hit: t.includes(NEEDLE) }); } catch {} } });
    await page.goto('http://127.0.0.1:5190' + url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(1500);
    r['noSignalr_' + name] = { scripts: scripts.length, hits: scripts.filter((s) => s.hit).map((s) => s.url) };
    await ctx.close();
  }
  // PAINT
  const dcl = [], fcpd = [], shots = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.addInitScript(() => { window.__fcp = null; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); });
    await page.goto('http://127.0.0.1:5190/studio-lab', { waitUntil: 'load' });
    await page.waitForFunction(() => window.__fcp !== null, null, { timeout: 30000 });
    const m = await page.evaluate(() => ({ fcp: window.__fcp, dcl: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }));
    dcl.push(m.dcl); fcpd.push(m.fcp - m.dcl);
    await page.waitForTimeout(100);
    if (i === 0) { await page.screenshot({ path: `c-round-371/screens/paint-fcp100-${w}x${h}.png` }); r.opacityAtFcp100 = await page.evaluate(() => getComputedStyle(document.querySelector('.page-transition-wrapper')).opacity); r.bodyChars = (await page.locator('body').innerText()).length; }
    await ctx.close();
  }
  r.paint = { dclMedian: med(dcl), fcpMinusDclMedian: med(fcpd), fcpMinusDcl: fcpd, dcl };
  // FADE + NAV (dev 5190 prod for fade)
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errs = []; page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); }); page.on('pageerror', (e) => errs.push('PAGEERR ' + String(e).slice(0, 140)));
    await page.goto('http://127.0.0.1:5190/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const link = page.locator('a[href="/about"]').first();
    r.aboutLinkCount = await page.locator('a[href="/about"]').count();
    await link.click();
    const ops = [];
    for (let i = 0; i < 14; i++) { ops.push(await page.evaluate(() => { const e = document.querySelector('.page-transition-wrapper'); return e ? +getComputedStyle(e).opacity : null; })); await page.waitForTimeout(40); }
    await page.waitForTimeout(800);
    const fin = await page.evaluate(() => +getComputedStyle(document.querySelector('.page-transition-wrapper')).opacity);
    r.fade = { url: page.url(), samples: ops, minSeen: Math.min(...ops.filter((x) => x !== null)), final: fin };
    await page.goBack(); await page.waitForTimeout(1500);
    // NAV: Studio link
    const studioLink = page.locator('header a[href="/studio-lab"], nav a[href="/studio-lab"], a[href="/studio-lab"]').first();
    r.studioLinkCount = await page.locator('a[href="/studio-lab"]').count();
    await studioLink.click();
    await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 60000 });
    await page.waitForTimeout(800);
    r.nav1 = { url: page.url(), workspace: await page.locator('[data-testid="arrangement-timeline-scroller"]').count(), wrapperOpacity: await page.evaluate(() => getComputedStyle(document.querySelector('.page-transition-wrapper')).opacity) };
    await page.screenshot({ path: `c-round-371/screens/nav-studio-${w}x${h}.png` });
    const back = page.getByRole('link', { name: /CZABA/ }).first();
    r.backLinkCount = await page.getByRole('link', { name: /CZABA/ }).count();
    await back.click(); await page.waitForTimeout(1800);
    r.nav2 = { url: page.url(), opacity: await page.evaluate(() => { const e=document.querySelector('.page-transition-wrapper'); return e? +getComputedStyle(e).opacity : null; }), h1: (await page.locator('h1').first().innerText().catch(() => '')).slice(0, 60) };
    await page.screenshot({ path: `c-round-371/screens/nav-back-${w}x${h}.png` });
    r.consoleErrors = errs;
    await ctx.close();
  }
}
await browser.close();
writeFileSync('c-round-371/nav.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
