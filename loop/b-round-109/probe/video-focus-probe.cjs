const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { utc: new Date().toISOString(), head: process.argv[2] || '?', steps: [], errors: [] };
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }])
  for (const kind of ['placeholder-return', 'float-close', 'float-expand-toggle', 'pan-reset-mouse']) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => out.errors.push(kind + ' pageerror ' + String(e).slice(0, 200)));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    await sleep(2500);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
    await sleep(500);
    const st = (label) => page.evaluate((label) => { const a = document.activeElement; return { label, active: a ? (a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName) : null, clips: document.querySelectorAll('[data-clip-id]').length, expanded: document.querySelector('[data-testid=arrangement-video-box]')?.dataset.videoExpanded, floating: document.querySelector('[data-testid=arrangement-video-box]')?.dataset.videoFloating }; }, label);
    const o = page.locator('[role=option][data-source-id="demo-middle-east"]');
    await o.focus(); await sleep(150); await page.keyboard.press('ArrowDown'); await sleep(150);
    const step = async (l) => out.steps.push({ vp: vp.width, kind, ...(await st(l)) });
    if (kind === 'pan-reset-mouse') {
      await page.keyboard.press('Enter'); await sleep(800);
      const pan = page.locator('[data-testid=arrangement-track-pan]').first();
      await pan.focus(); await page.keyboard.press('ArrowRight'); await sleep(200);
      await page.locator('[data-testid=search-dummy]').count();
      await page.locator('[data-testid=arrangement-library-search]').focus(); await sleep(100);
      await step('pan R, focus moved to search');
      await page.locator('[data-testid=arrangement-track-pan-reset]').first().click(); await sleep(300);
      await step('after mouse click on pan reset');
      await ctx.close(); continue;
    }
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await step('after mouse expand');
    if (kind === 'placeholder-return') await page.focus('[data-testid=arrangement-video-placeholder-return]');
    if (kind === 'float-close') await page.focus('[data-testid=arrangement-video-close]');
    if (kind === 'float-expand-toggle') await page.focus('[data-testid=arrangement-video-expand]');
    await step('focused');
    await page.keyboard.press('Enter'); await sleep(600);
    await step('after Enter 1');
    await page.keyboard.press('Enter'); await sleep(900);
    await step('after Enter 2');
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync('video-focus-probe-result.json', JSON.stringify(out, null, 1));
  for (const s of out.steps) console.log(JSON.stringify(s));
  console.log('errors', out.errors);
})();
