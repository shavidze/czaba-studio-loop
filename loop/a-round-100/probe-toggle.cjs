const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TAG = process.argv[2] || 'before';
const OUT = __dirname + `/repro-${TAG}.json`;
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = {};
  for (const mode of ['held4', 'fresh1']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => {
      window.__ev = [];
      window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd', k: e.key, r: e.repeat, a: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName }), true);
      window.addEventListener('click', (e) => window.__ev.push({ t: 'click', a: e.target?.getAttribute?.('data-testid') || e.target?.tagName }), true);
      new MutationObserver(() => {
        const b = document.querySelector('[data-testid=arrangement-library-preview-toggle]');
        const txt = b ? b.textContent.trim() : null;
        if (txt !== window.__lastLabel) { window.__ev.push({ t: 'label', v: txt, ms: Math.round(performance.now()) }); window.__lastLabel = txt; }
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    const p = await ctx.newPage();
    const R = { errors: [] };
    p.on('pageerror', (e) => R.errors.push(String(e).slice(0, 200)));
    await p.goto('http://127.0.0.1:5173/studio-lab');
    await sleep(1500); await p.locator(`[role=option][data-source-id="demo-middle-east"]`).waitFor({ timeout: 90000 });
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
    await o.scrollIntoViewIfNeeded();
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
    await o.click(); await sleep(300);
    const tg = p.getByTestId('arrangement-library-preview-toggle');
    await tg.focus(); await sleep(200);
    R.labelBefore = (await tg.textContent()).trim();
    R.clipsBefore = await p.$$eval('[data-clip-id]', (e) => e.length);
    await p.evaluate(() => { window.__ev = []; });
    if (mode === 'held4') {
      await p.keyboard.down('Enter'); for (let i = 0; i < 3; i++) { await sleep(50); await p.keyboard.down('Enter'); } await p.keyboard.up('Enter');
    } else {
      await p.keyboard.press('Enter');
    }
    await sleep(1200);
    R.labelAfter = (await tg.textContent()).trim();
    R.clipsAfter = await p.$$eval('[data-clip-id]', (e) => e.length);
    R.events = await p.evaluate(() => window.__ev);
    R.clicksOnToggle = R.events.filter((e) => e.t === 'click' && e.a === 'arrangement-library-preview-toggle').length;
    await p.screenshot({ path: __dirname + `/toggle-${TAG}-${mode}-1280.png` });
    res[mode] = R;
    await ctx.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
