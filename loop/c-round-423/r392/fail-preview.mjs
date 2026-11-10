import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const r = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.message)));
  await p.route('**/middle-east.mp3', (rt) => rt.abort());
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first().waitFor({ timeout: 90000 }); await p.waitForTimeout(8000); r['pre'+w] = await p.getByTestId('arrangement-status').textContent();
  const st = () => p.getByTestId('arrangement-status').textContent();
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Middle East/ }).first().click();
  await p.waitForTimeout(1500);
  const opt = await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Middle East/ }).first().innerText();
  const tog = await p.getByTestId('arrangement-library-preview-toggle').getAttribute('aria-disabled').catch(() => 'n/a');
  await p.getByRole('button', { name: /^Preview|Stop/ }).first().click({ timeout: 5000 }).catch((e) => { r.clickErr = String(e).slice(0, 100); });
  await p.waitForTimeout(3000);
  await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  r[`${w}x${h}`] = { opt: opt.replace(/\s+/g, ' ').slice(0, 200), toggleDisabled: tog, status: await st(), clips: await p.locator('[data-clip-count]').evaluateAll((es) => es.map((e) => e.getAttribute('data-clip-count'))), errs };
  await p.screenshot({ path: `fail-preview-${w}.png` }); await ctx.close();
}
fs.writeFileSync('fail-preview.json', JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1)); await b.close();
