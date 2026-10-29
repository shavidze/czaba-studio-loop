const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NAME = '[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]';
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 180000 });
    await sleep(600);
    const names = page.locator(NAME); await names.nth(1).click(); await sleep(300); await names.nth(2).click({ modifiers: ['Control'] }); await sleep(300);
    await page.keyboard.press('Control+g'); await sleep(600);
    const v = page.getByTestId('arrangement-group-volume'); await v.focus();
    await page.keyboard.press('ArrowDown'); await sleep(150); await page.keyboard.press('ArrowDown'); await sleep(400);
    const snap = async () => page.evaluate(() => { const a = document.activeElement; return { focus: a === document.body ? 'BODY' : (a.getAttribute('data-testid') || '') + ' ' + (a.getAttribute('aria-label') || ''), groups: document.querySelectorAll('[data-testid=arrangement-group-row]').length, status: document.querySelector('[data-testid=arrangement-status]')?.textContent, undo: [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('aria-label') || ''))?.getAttribute('aria-label'), redo: [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.getAttribute('aria-label') || ''))?.getAttribute('aria-label') }; });
    const steps = [{ after: 'ArrowDown x2', ...(await snap()), value: await v.inputValue() }];
    for (let i = 1; i <= 3; i++) { await page.keyboard.press('Control+z'); await sleep(600); steps.push({ after: `Ctrl+Z #${i}`, ...(await snap()) }); }
    await page.screenshot({ path: `vol3-${vp.width}.png` });
    out[`${vp.width}x${vp.height}`] = { steps, errors }; await ctx.close();
  }
  await b.close(); fs.writeFileSync('vol3-probe.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
