import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173'; const out = process.argv[3];
const res = {}; const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 60000 }).catch(()=>{});
  const count = () => p.evaluate(() => new Set([...document.querySelectorAll('[data-clip-id]')].map(e => e.getAttribute('data-clip-id'))).size);
  const raw = () => p.locator('[data-clip-id]').count();
  const r = { before: await count(), rawBefore: await raw() };
  const items = p.locator('[role="option"]');
  r.options = await items.count();
  await items.first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  r.after = await count(); r.rawAfter = await raw();
  res[`${w}x${h}`] = r;
}
await b.close(); writeFileSync(`${out}/clip-probe.json`, JSON.stringify(res)); console.log(JSON.stringify(res));
