import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = {}; const b = await chromium.launch();
for (const base of ['http://127.0.0.1:5173', 'http://127.0.0.1:5174']) for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(base + '/studio-lab', { waitUntil: 'networkidle' }); await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
  await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  const lane = page.locator('[data-track-id="music"]').first(); const lb = await lane.boundingBox(); const cb = await page.locator('[data-clip-id]').first().boundingBox();
  const x0 = Math.min(cb.x + cb.width + 40, w - 220), y0 = lb.y + lb.height / 2; await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + 120, y0, { steps: 6 }); await page.mouse.up();
  const zs = page.getByTestId('arrangement-transport').getByRole('button', { name: /^Zoom to selection/ }).first();
  await zs.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const zb = page.getByTestId('arrangement-zoom-back'); await zb.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const info = await page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { id: e.getAttribute('data-testid'), fv: e.matches(':focus-visible'), outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`, offset: c.outlineOffset, disabled: document.querySelector('[data-testid=arrangement-zoom-back]').getAttribute('aria-disabled') }; });
  out[base + ' ' + w] = info; await page.screenshot({ path: `ring-${base.slice(-4)}-${w}.png`, clip: { x: 0, y: 0, width: w, height: 120 } });
}
await b.close(); writeFileSync('ring.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
