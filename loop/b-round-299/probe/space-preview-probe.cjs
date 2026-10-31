const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = process.argv[2]; const out = __dirname;
const active = (page) => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, role: a?.getAttribute('role'), id: a?.getAttribute('data-source-id') }; });
const previewing = (page) => page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]')).map((n) => n.closest('[data-source-id]')?.getAttribute('data-source-id')));
(async () => {
  const browser = await chromium.launch(); const result = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const r = {}; const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent?.includes('ready'), null, { timeout: 30000 }).catch(() => {});
    const mapped = page.locator('[role="option"][data-source-id="demo-middle-east"]');
    const clock = () => page.locator('[data-testid="arrangement-clock"], [data-testid="arrangement-time"]').first().textContent().catch(() => null);
    await mapped.click(); await page.waitForTimeout(150);
    await page.keyboard.press('Shift+F10'); await page.waitForTimeout(200);
    r.menuBeforeSpace = await page.getByRole('menu').count();
    const clockBefore = await clock();
    const pP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null);
    await page.keyboard.press(' ');
    const p = await pP; if (p) { await p.waitForLoadState('domcontentloaded').catch(() => {}); r.spacePopup = p.url(); await p.close(); } else r.spacePopup = null;
    await page.bringToFront(); await page.waitForTimeout(1000);
    r.menuAfterSpace = await page.getByRole('menu').count();
    r.activeAfterSpace = await active(page);
    r.clockBefore = clockBefore; r.clockAfter1s = await clock();
    r.playButton = await page.getByRole('button', { name: /^(Play|Stop|Pause)/ }).first().getAttribute('aria-label').catch(() => null);
    // preview parity
    await page.locator('[role="option"][data-source-id="demo-hero-music"]').click(); await page.waitForTimeout(300);
    const previewBtn = page.getByRole('button', { name: /^Preview/ }).first();
    r.previewBtnLabel = await previewBtn.getAttribute('aria-label').catch(() => null) ?? await previewBtn.textContent().catch(() => null);
    await previewBtn.click().catch((e) => { r.previewClickErr = String(e).slice(0, 80); });
    await page.waitForTimeout(600);
    r.previewingBefore = await previewing(page);
    await mapped.click({ button: 'right' }); await page.waitForTimeout(400);
    r.menuOnRight = await page.getByRole('menu').count();
    r.previewingAfterRight = await previewing(page);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    r.previewingAfterEsc = await previewing(page);
    r.activeAfterEsc = await active(page);
    r.errors = errors; result[w] = r; await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${out}/space-preview-sketch.json`, JSON.stringify(result, null, 1)); console.log(JSON.stringify(result, null, 1));
})();
