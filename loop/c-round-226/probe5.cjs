const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab'); await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(1000);
    const btn = page.locator('footer button', { hasText: 'Shortcuts' });
    await btn.click(); await sleep(300);
    const close = page.getByRole('button', { name: 'Close (Esc)' });
    const cb = await close.boundingBox();
    await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.mouse.down();
    const ring = await close.evaluate((e) => ({ focused: document.activeElement === e, fv: e.matches(':focus-visible'), outline: getComputedStyle(e).outlineStyle }));
    await page.mouse.up(); await sleep(300);
    // Tab sequence from the last status-ish element: Shift+Tab from body end
    await page.evaluate(() => document.activeElement.blur());
    const stops = [];
    for (let i = 0; i < 120; i += 1) {
      await page.keyboard.press('Tab');
      const a = await page.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { l: e.getAttribute('aria-label') || e.getAttribute('data-testid') || e.textContent.trim().slice(0, 20), inFooter: !!e.closest('footer'), visible: r.width > 0 && r.height > 0, fv: e.matches(':focus-visible'), outline: getComputedStyle(e).outlineStyle }; });
      stops.push(a);
      if (a.inFooter) break;
    }
    res[`${W}x${H}`] = { closePointerPress: ring, tabsToFooter: stops.length, footerStop: stops[stops.length - 1] };
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
