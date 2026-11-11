// Does Playwright keyboard.down('AltGraph') make getModifierState('AltGraph') true in Chromium? (B round 443 planning)
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 });
await p.getByTestId('arrangement-library-search').click();
await p.evaluate(() => { window.__k = []; window.addEventListener('keydown', (e) => window.__k.push({ key: e.key, ctrl: e.ctrlKey, alt: e.altKey, altGraph: e.getModifierState('AltGraph'), fs: document.documentElement.dataset.focusSource }), true); });
await p.keyboard.down('AltGraph'); await p.keyboard.press('q'); await p.keyboard.up('AltGraph');
const cdp = await ctx.newCDPSession(p);
await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: '@', text: '@', modifiers: 3 });
const r = await p.evaluate(() => ({ keys: window.__k, fs: document.documentElement.dataset.focusSource, value: document.querySelector('[data-testid="arrangement-library-search"]').value }));
console.log(JSON.stringify(r)); await b.close();
