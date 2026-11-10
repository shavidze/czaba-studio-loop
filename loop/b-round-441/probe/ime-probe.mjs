import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = {};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
await page.getByText('Demo collection ready').first().waitFor({ timeout: 60000 }).catch(() => {});
await page.evaluate(() => {
  window.__keys = [];
  window.addEventListener('keydown', (e) => window.__keys.push({ key: e.key, isComposing: e.isComposing, keyCode: e.keyCode, phase: 'win-capture' }), true);
  window.addEventListener('compositionstart', () => window.__keys.push({ ev: 'compositionstart' }), true);
  window.addEventListener('compositionend', (e) => window.__keys.push({ ev: 'compositionend', data: e.data }), true);
});
const cdp = await page.context().newCDPSession(page);
const input = page.getByTestId('arrangement-tempo-input');
out.before = await input.inputValue();
await input.click();
await page.keyboard.press('Control+A');
await cdp.send('Input.imeSetComposition', { text: '96', selectionStart: 2, selectionEnd: 2 });
out.duringValue = await input.inputValue();
await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await page.waitForTimeout(300);
out.afterEnter = {
  focused: await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName),
  value: await input.inputValue(),
};
out.keys = await page.evaluate(() => window.__keys);
console.log(JSON.stringify(out, null, 1));
await browser.close();
