import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' }); await p.waitForTimeout(6000);
const ls = await p.locator('[data-grid-seconds]').evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, e.getAttribute('data-track-id')]; }));
console.log(JSON.stringify(ls));
const [x, y, w, h] = ls[1]; await p.mouse.click(x + w / 2, y + h / 2, { button: 'right' }); await p.waitForTimeout(600);
console.log(await p.evaluate(() => { const m = document.querySelector('[data-testid="arrangement-grid-menu"]'); return m ? [...m.querySelectorAll('[role^=menuitem]')].map((e) => e.getAttribute('tabindex') + ':' + e.textContent.trim()).join('|') + ' active=' + document.activeElement?.textContent?.trim() : 'no menu'; }));
await b.close();
