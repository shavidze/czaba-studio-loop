import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const read = () => page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const pick = (f) => { const b = btns.find(f); return b ? { title: b.title, aria: b.getAttribute('aria-keyshortcuts'), name: b.getAttribute('aria-label') ?? b.textContent.trim() } : null; };
  return {
    play: pick((b) => b.getAttribute('aria-label') === 'Play'),
    back: pick((b) => b.getAttribute('aria-label') === 'Back to start'),
    undo: pick((b) => b.textContent.trim().startsWith('Undo')),
    redo: pick((b) => b.textContent.trim().startsWith('Redo')),
    split: pick((b) => b.textContent.trim().startsWith('Split')),
    del: pick((b) => b.textContent.trim().startsWith('Delete')),
    loop: pick((b) => b.textContent.trim().startsWith('Loop')),
    fit: pick((b) => b.dataset.testid === 'arrangement-fit'),
  };
});
const s0 = await read();
await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
const markerBtn = page.locator('button[aria-keyshortcuts="M"]').first();
console.log('marker button', await markerBtn.count(), await markerBtn.getAttribute('title'));
await markerBtn.click(); await page.waitForTimeout(300); console.log('active', await page.evaluate(() => document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('aria-label') ?? ''))); await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const s3 = await read(); console.log(JSON.stringify({ s0, s3 }, null, 1));
const undo = page.getByRole('button', { name: /^Undo/ });
await undo.hover();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${out}/self-check-1280-undo-hover.png` });
await ctx.storageState({ path: `${out}/../a-browse.json` });
console.log(JSON.stringify({ s0, s3, errors }, null, 1));
await browser.close();
