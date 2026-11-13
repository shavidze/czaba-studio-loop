// Usage: node library-probe.cjs <baseUrl> <outJson>; per library source: item text, Add aria-disabled, preview wave rect count; final status; status log
const fs = require('fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const [base, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const R = { base, rows: {} };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.addInitScript(() => { window.__log = []; const h = () => { const s = document.querySelector('[data-testid="arrangement-status"]'); if (!s) { requestAnimationFrame(h); return; } window.__log.push(s.textContent); new MutationObserver(() => window.__log.push(s.textContent)).observe(s, { childList: true, subtree: true, characterData: true }); }; requestAnimationFrame(h); });
    await page.goto(base + '/studio-lab');
    await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 120000 });
    await sleep(1500);
    const ids = await page.locator('[data-source-id]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-source-id')))]);
    const items = {};
    for (const id of ids) {
      const item = page.locator(`[data-source-id="${id}"]`).first();
      await item.click(); await sleep(400);
      const add = page.locator('button', { hasText: /^Add/ }).first();
      items[id] = { text: (await item.innerText()).replace(/\s+/g, ' ').trim(), addDisabled: await add.getAttribute('aria-disabled'), waveRects: await page.locator('[data-testid="arrangement-library-preview-wave"] rect').count() };
    }
    const k = `${vp.width}x${vp.height}`;
    R.rows[k] = { ids, items, finalStatus: await page.getByTestId('arrangement-status').textContent(), statusLog: await page.evaluate(() => window.__log), errors };
    await ctx.close();
  }
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})();
