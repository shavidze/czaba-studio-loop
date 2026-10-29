// B round-250 planning: status box + shortcut sheet rows (L3). usage: node box-probe-250.cjs <base> <out.json>
const fs = require('node:fs'); const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, outFile] = [process.argv[2], process.argv[3]];
const shotDir = path.join(path.dirname(outFile), 'shots-' + path.basename(outFile, '.json')); fs.mkdirSync(shotDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch(); const R = { base, rows: {} };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
    await sleep(800);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(900);
    const seed = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); return { h: r.height, sw: s.scrollWidth, cw: s.clientWidth, text: s.textContent }; });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
    const pps = await page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
    await page.mouse.click(ruler.x + 18 * pps, ruler.y + ruler.height / 2); await sleep(900);
    await page.keyboard.press('Space'); await sleep(400);
    const past = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); return { h: r.height, sw: s.scrollWidth, cw: s.clientWidth, text: s.textContent }; });
    await page.screenshot({ path: path.join(shotDir, `pastend@${vp.width}.png`) });
    await page.keyboard.press('?'); await sleep(600);
    const sheet = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] *')].filter((e) => /insert marker|at the playhead/.test(e.textContent) && e.children.length === 0).map((e) => { const r = e.getBoundingClientRect(); return { text: e.textContent, h: r.height, w: r.width, sw: e.scrollWidth, cw: e.clientWidth }; }));
    await page.screenshot({ path: path.join(shotDir, `sheet@${vp.width}.png`) });
    R.rows[vp.width] = { seed, past, sheet, errors }; await ctx.close();
  }
  fs.writeFileSync(outFile, JSON.stringify(R, null, 1)); await browser.close();
})();
