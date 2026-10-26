import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:5173/';

const initProbe = () => {
  const probe = { inserted: [], removed: [], maxH1: 0, h1Samples: 0, opacity: [], errors: [] };
  window.__probe = probe;
  const sel = '[data-testid="entrance-loader"]';
  let current = null;
  new MutationObserver(() => {
    const el = document.querySelector(sel);
    if (el && !current) {
      current = el;
      probe.inserted.push(performance.now());
    } else if (!el && current) {
      current = null;
      probe.removed.push(performance.now());
    }
  }).observe(document, { childList: true, subtree: true });
  const tick = () => {
    const n = document.querySelectorAll('h1').length;
    probe.h1Samples += 1;
    if (n > probe.maxH1) probe.maxH1 = n;
    const root = document.querySelector(sel);
    if (root) {
      const span = root.querySelector('span.block');
      const wrap = span?.parentElement;
      const o = Number(getComputedStyle(root).opacity) * (wrap ? Number(getComputedStyle(wrap).opacity) : 0);
      probe.opacity.push([performance.now(), o, getComputedStyle(root).pointerEvents]);
    }
    const lastRemoved = probe.removed[probe.removed.length - 1];
    if (!lastRemoved || performance.now() - lastRemoved < 1000 || document.querySelector(sel)) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
};

const result = {};
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(initProbe);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.error('probe after DCL', JSON.stringify(await page.evaluate(() => window.__probe && { i: window.__probe.inserted.length, s: window.__probe.h1Samples })));
  await page.waitForFunction(() => window.__probe.inserted.length > 0, null, { timeout: 15000 });
  await page.waitForTimeout(550);
  await page.screenshot({ path: `${OUT}/mid-loader-1440.png` });
  await page.waitForFunction(() => window.__probe.removed.length > 0, null, { timeout: 10000 });
  await page.waitForTimeout(1200);
  const p1 = await page.evaluate(() => window.__probe);
  result.samples = p1.opacity.map(([t, o, pe]) => [Math.round(t - p1.inserted[0]), Number(o.toFixed(3)), pe]);
  const visible = p1.opacity.filter(([, o]) => o >= 0.9);
  result.first = {
    insertedAt: p1.inserted[0],
    removedAt: p1.removed[0],
    durationMs: p1.removed[0] - p1.inserted[0],
    maxH1: p1.maxH1,
    h1Samples: p1.h1Samples,
    maxLogoOpacity: Math.max(...p1.opacity.map(([, o]) => o)),
    logoAtLeast09Ms: visible.length ? visible[visible.length - 1][0] - visible[0][0] : 0,
    pointerEventsNoneFromMs: (p1.opacity.find(([, , pe]) => pe === 'none') ?? [null])[0] - p1.inserted[0],
    sessionKey: await page.evaluate(() => sessionStorage.getItem('czaba_entrance_seen')),
    oldLocalKey: await page.evaluate(() => localStorage.getItem('czaba_spotlight_last_shown')),
    pageErrors: [...pageErrors],
  };
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  result.reloadSameContext = await page.evaluate(() => ({
    insertions: window.__probe.inserted.length,
    maxH1: window.__probe.maxH1,
  }));
  await ctx.close();

  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await rm.addInitScript(initProbe);
  const rmPage = await rm.newPage();
  await rmPage.goto(BASE, { waitUntil: 'domcontentloaded' });
  await rmPage.waitForTimeout(3000);
  result.reducedMotion = await rmPage.evaluate(() => ({
    insertions: window.__probe.inserted.length,
    sessionKey: sessionStorage.getItem('czaba_entrance_seen'),
    h1: document.querySelectorAll('h1').length,
  }));
  await rm.close();
} finally {
  await browser.close();
}
writeFileSync(`${OUT}/probe-result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
