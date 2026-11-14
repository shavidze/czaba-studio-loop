const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const w of [1440, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 720 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed','1'); sessionStorage.setItem('czaba_entrance_seen','1'); } catch {} });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('http://127.0.0.1:5173/products/middle-east', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const buy = page.getByRole('button', { name: 'Buy Now' });
    await buy.focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);
    const dialogs = await page.locator('[role=dialog]').count(); const modalClose = await page.getByRole('button', { name: 'Close' }).count(); const emailField = await page.locator('input[type=email]').count();
    const toast = await page.getByText('Please sign in to continue with your purchase').count();
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    const active = await page.evaluate(() => { const a = document.activeElement; return { tag: a && a.tagName, name: a && (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 40)), fv: a ? a.matches(':focus-visible') : null }; });
    res[w] = { dialogs, modalClose, emailField, toast, active, dialogsAfterEsc: await page.locator('[role=dialog]').count(), errs };
    await ctx.close();
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
})();
