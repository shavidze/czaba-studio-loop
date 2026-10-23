const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { utc: new Date().toISOString(), viewport: '1440x900', runs: [] };
  for (const target of ['collapse', 'option']) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid=arrangement-library-collapse]', { timeout: 90000 });
    await sleep(2500);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
    const st = (label) => page.evaluate((label) => ({ label, active: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('data-source-id') || document.activeElement.tagName) : null, clips: document.querySelectorAll('[data-clip-id]').length, collapsed: document.querySelector('[data-testid=arrangement-library]')?.dataset.collapsed, floating: document.querySelector('[data-testid=arrangement-video-box]')?.dataset.videoFloating }), label);
    const run = { target, steps: [] };
    await page.locator('[role=option][data-source-id="demo-middle-east"]').focus(); await page.keyboard.press('ArrowDown'); await sleep(200);
    await page.click('[data-testid=arrangement-library-collapse]'); await sleep(500);
    await page.click('[data-testid=arrangement-video-expand]'); await sleep(900);
    run.steps.push(await st('after mouse ⤢ (library opened for video)'));
    if (target === 'collapse') await page.focus('[data-testid=arrangement-library-collapse]');
    else await page.locator('[role=option][aria-selected=true]').focus();
    run.steps.push(await st('focus inside library'));
    await page.keyboard.press('Escape'); await sleep(600);
    run.steps.push(await st('after Escape'));
    await page.keyboard.press('Enter'); await sleep(800);
    run.steps.push(await st('after Enter'));
    out.runs.push(run);
    await page.screenshot({ path: `s5-${target}-1440.png` });
    await page.context().close();
  }
  await browser.close();
  fs.writeFileSync('s5-probe-result.json', JSON.stringify(out, null, 1));
  for (const r of out.runs) for (const s of r.steps) console.log(r.target, JSON.stringify(s));
})();
