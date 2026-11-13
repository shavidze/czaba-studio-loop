import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = 'http://127.0.0.1:5173'; const out = process.argv[2];
const res = {}; const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage(); const r = {};
  for (const [k, path] of [['account', '/account'], ['studio', '/studio/middle-east']]) {
    await p.goto(base + path, { waitUntil: 'domcontentloaded' }); await p.waitForLoadState('load').catch(()=>{}); await p.waitForTimeout(5000);
    r[k] = await p.evaluate(() => ({ signIn: /Sign in required/i.test((document.body?.innerText||'')), changePw: /Change Password/i.test((document.body?.innerText||'')), audioSrc: document.querySelectorAll('audio[src]').length, url: location.pathname }));
  }
  await p.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 90000 }).catch(() => {});
  const count = () => p.evaluate(() => new Set([...document.querySelectorAll('[data-clip-id]')].map(e => e.getAttribute('data-clip-id'))).size);
  const state = () => p.locator('[data-testid="arrangement-playback-state"]').first().textContent();
  const clock = () => p.locator('[data-testid="arrangement-position"]').first().textContent();
  const lab = { authUser: await p.evaluate(() => localStorage.getItem('auth_user')), demoReady: await p.getByText('Demo collection ready').first().isVisible().catch(() => false), before: await count() };
  await p.locator('[role="option"]').first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  lab.after = await count(); lab.stateBefore = await state();
  await p.mouse.click(w / 2, 5); await p.locator('body').press('Space'); await p.waitForTimeout(1800);
  lab.state1 = await state(); lab.clock1 = await clock();
  await p.locator('body').press('Space'); await p.waitForTimeout(500);
  lab.state2 = await state(); lab.clock2 = await clock();
  r.lab = lab; await p.screenshot({ path: `${out}/shots/c8-lab-${w}x${h}.png` });
  res[`${w}x${h}`] = r; await ctx.close();
}
await b.close(); writeFileSync(`${out}/c8.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
