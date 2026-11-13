// usage: node noname-probe.mjs <base> <out.json>  -- auth_user without accessToken and without name (L1: no backend call) -> 'Click to add name'
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT] = process.argv.slice(2); const out = {};
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', registrationSource: 'email' })); });
  const p = await ctx.newPage(); await p.goto(`${BASE}/account`, { waitUntil: 'load' }); await p.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 }); await p.waitForTimeout(1500);
  const aria = (await p.locator('body').ariaSnapshot()).split('\n').filter((l) => /Full Name|Click to add|change password/.test(l));
  await p.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  const stops = []; for (let i = 0; i < 16; i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(100); stops.push(await p.evaluate(() => `${document.activeElement.tagName}:${document.activeElement.textContent.trim().slice(0, 30)}`)); }
  out[`${w}x${h}`] = { aria, stops }; await ctx.close();
}
await b.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log('ok');
