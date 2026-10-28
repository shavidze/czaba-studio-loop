const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab'); await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(800);
    await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800);
    const count = () => page.locator('[data-clip-kind="audio"]').count();
    const t = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const r = c.getBoundingClientRect(); return { x: Math.max(r.left, 240) + 30, y: r.top + 10 }; });
    await page.mouse.click(t.x, t.y); await sleep(200);
    await page.evaluate(() => document.activeElement.blur());
    const c0 = await count();
    await page.keyboard.press('Backspace'); await sleep(300);
    const c1 = await count();
    const status = await page.getByTestId('arrangement-status').textContent();
    // Ctrl+V into empty track at playhead 0 (copy first after undo)
    await page.keyboard.press('Control+z'); await sleep(300);
    await page.mouse.click(t.x, t.y); await sleep(200); await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Control+x'); await sleep(300);
    const afterCut = await count();
    await page.keyboard.press('Control+v'); await sleep(400);
    const afterPaste = await count();
    const pasteStatus = await page.getByTestId('arrangement-status').textContent();
    res[`${W}x${H}`] = { c0, afterBackspace: c1, status, afterCut, afterPaste, pasteStatus, backspaceEffect: c1 === c0 - 1, cutPasteEffect: afterCut === 0 && afterPaste === 1 };
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
