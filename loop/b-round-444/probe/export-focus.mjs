// B round 444 planning: which element holds focus after a fresh Escape closes Export (HEAD :5173 or sketch). Records tag, text, accessible name, testid.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const b = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage(); await p.goto(`${base}/studio-lab`, { timeout: 180000 });
  await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 }); await p.waitForTimeout(800);
  const opt = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first(); await opt.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  const exp = p.getByRole('button', { name: /^Export/ }).first(); const opener = { text: (await exp.textContent())?.trim(), aria: await exp.getAttribute('aria-label'), title: await exp.getAttribute('title') };
  await exp.click(); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  out[`${w}x${h}`] = { opener, focused: await p.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, text: a?.textContent?.trim().slice(0, 40), aria: a?.getAttribute('aria-label'), title: a?.getAttribute('title'), testid: a?.getAttribute('data-testid') }; }) };
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1)); await b.close();
