import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, tag] = process.argv.slice(2);
const typeInto = async (page, loc, text) => { await loc.evaluate((el, t) => { el.focus(); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, t); el.dispatchEvent(new Event('input', { bubbles: true })); }, text); };
const focusEl = async (loc) => { await loc.evaluate((el) => el.focus()); };
const L = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/out/b3';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`; const rows = []; out[key] = rows;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 });
  await page.waitForTimeout(1000);
  const sample = async (label) => { await page.waitForTimeout(250); rows.push({ label, ...(await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-detail-start"]'), e = document.querySelector('[data-testid="arrangement-detail-end"]'), g = document.querySelector('[data-testid="arrangement-detail-clip-gain-input"]'); return { start: s?.value, end: e?.value, sDis: s?.disabled, eDis: e?.disabled, gain: g?.value, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent?.slice(0, 120), focus: document.activeElement?.getAttribute('data-testid') }; })) }); };
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1500);
  const exp = page.locator('button').filter({ hasText: /^Expand$/ }); if (await exp.count()) { await exp.last().click(); await page.waitForTimeout(500); }
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const nameBar = clip.getByTitle(/ — drag to move$/).first();
  const shot = async (n) => page.locator('[data-testid="arrangement-detail-start"]').locator('xpath=ancestor::*[contains(@class,"flex")][3]').first().screenshot({ path: `${L}/shots/detail-${tag}-${key}-${n}.png` }).catch(async () => page.screenshot({ path: `${L}/shots/detail-${tag}-${key}-${n}.png` }));
  const drag = async (loc, label, n = 4) => { const b = await loc.first().boundingBox(); const x = b.x + Math.min(b.width / 2, 40), y = b.y + b.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(150); await sample(label + ' down'); for (let i = 1; i <= n; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(150); await sample(`${label} move${i}`); } await page.mouse.up(); await sample(label + ' up'); };
  // step 1
  const b0 = await nameBar.boundingBox(); await page.mouse.click(b0.x + 30, b0.y + b0.height / 2); await sample('s1 click');
  await drag(nameBar, 's1 move'); await shot('s1'); await page.keyboard.press('Control+KeyZ'); await sample('s1 undo');
  // step 2
  await page.screenshot({path:`${L}/shots/dbg-${tag}-${key}.png`}); console.error(JSON.stringify(rows.slice(-3))); console.error('DBG', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-detail-start"]')].map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, getComputedStyle(e).visibility, document.body.contains(e)]; })))); const st = page.getByTestId('arrangement-detail-start'); await typeInto(page, st, '1.5'); await sample('s2 typed 1.5');
  await drag(clip.getByTitle('Trim — left edge', { exact: true }), 's2 trim', 3); await page.keyboard.press('Control+KeyZ'); await sample('s2 undo');
  // step 3
  const cur = await page.evaluate(() => ({ s: parseFloat(document.querySelector('[data-testid="arrangement-detail-start"]').value), e: parseFloat(document.querySelector('[data-testid="arrangement-detail-end"]').value) }));
  await typeInto(page, page.getByTestId('arrangement-detail-start'), String(cur.s + 0.5)); await typeInto(page, page.getByTestId('arrangement-detail-end'), String(cur.e - 0.5)); await sample('s3 typed range');
  const g = page.getByTestId('arrangement-detail-clip-gain-input'); await typeInto(page, g, '-3'); await page.keyboard.press('Enter'); await sample('s3 gain -3 Enter'); await shot('s3');
  // step 4
  await focusEl(page.getByTestId('arrangement-detail-start')); await page.keyboard.press('Enter'); await sample('s4 enter');
  await typeInto(page, page.getByTestId('arrangement-detail-start'), String(cur.s - 1)); await page.keyboard.press('Enter'); await sample('s4 before-start enter');
  // step 5: time selection on the clip body, then on another lane
  const cb = await clip.boundingBox(); const by = cb.y + cb.height * 0.75;
  await page.mouse.move(cb.x + 150, by); await page.mouse.down(); await page.mouse.move(cb.x + 350, by, { steps: 4 }); await page.mouse.up(); await sample('s5 range on clip');
  const lane = await clip.evaluate((el) => { const own = el.closest('[data-track-id]'); const lanes = [...document.querySelectorAll('[data-track-id]')]; for (const l of lanes.slice(lanes.indexOf(own) + 1)) { if (l.contains(own) || own.contains(l)) continue; const r = l.getBoundingClientRect(); if (r.height > 20) return { x: r.x, y: r.y, w: r.width, h: r.height }; } return null; });
  if (lane) { await page.mouse.move(lane.x + lane.w * 0.5, lane.y + lane.h / 2); await page.mouse.down(); await page.mouse.move(lane.x + lane.w * 0.6, lane.y + lane.h / 2, { steps: 4 }); await page.mouse.up(); await sample('s5 range other lane'); }
  // step 6
  if (lane) { await page.mouse.click(lane.x + lane.w * 0.9, lane.y + lane.h / 2); await sample('s6 deselect'); }
  const b1 = await nameBar.boundingBox(); await page.mouse.click(b1.x + 30, b1.y + b1.height / 2); await sample('s6 reselect'); await shot('s6');
  await page.screenshot({ path: `${L}/shots/full-${tag}-${key}.png` });
  rows.push({ label: 'errors', errs, lane: !!lane, expanded: await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => /^Collapse$/.test(b.textContent.trim()))) });
  await ctx.close();
}
writeFileSync(`${L}/detail-${tag}.json`, JSON.stringify(out, null, 1));
await browser.close();
