import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const out = process.argv[2]; const label = process.argv[3] ?? 'after';
const browser = await chromium.launch();
const res = {};
const desc = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a) return null;
  const cs = getComputedStyle(a);
  return { s: `${a.tagName}|${a.getAttribute('aria-label') ?? ''}|${a.getAttribute('data-testid') ?? ''}|${(a.textContent ?? '').trim().slice(0, 24)}|${a.closest('header') ? 'H' : a.closest('footer') ? 'F' : ''}`, fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, ow: parseFloat(cs.outlineWidth) };
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const v = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const undoDisabled = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^(Undo|Redo)/.test((b.textContent ?? '').trim())).map((b) => b.disabled));
  await page.getByTestId('arrangement-exit').focus();
  const fwd = [];
  for (let i = 0; i < 300; i++) {
    await page.keyboard.press('Tab');
    const d = await desc(page);
    fwd.push(d.s);
    if (/Shortcuts/.test(d.s)) break;
  }
  const sc = page.locator('footer button').filter({ hasText: 'Shortcuts' });
  await sc.focus();
  await page.keyboard.press('Shift+Tab'); // ensure keyboard modality
  await page.keyboard.press('Tab');
  const back = [await desc(page)];
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); back.push(await desc(page)); }
  await sc.focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const fromSc = [];
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); fromSc.push((await desc(page))?.s ?? 'null'); }
  const names = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-master"]');
    const mute = g.querySelector('button[aria-pressed]');
    const fader = g.querySelector('input[type="range"]');
    return { group: g.getAttribute('aria-label'), groupTag: g.tagName, visible: g.querySelector('span[aria-hidden="true"]')?.textContent, mute: mute?.getAttribute('aria-label'), muteTitle: mute?.getAttribute('title'), fader: fader?.getAttribute('aria-label') };
  });
  const ax = {
    group: await page.getByRole('group', { name: 'Master', exact: true }).count(),
    mute: await page.getByRole('button', { name: 'Master Mute', exact: true }).count(),
    fader: await page.getByRole('slider', { name: 'Master Volume', exact: true }).count(),
  };
  res[v] = { undoDisabled, fwd, firstStop: fwd[0], masterIndex: fwd.findIndex((s) => /Master/.test(s)), bodyInFwd: fwd.filter((s) => s.startsWith('BODY')).length, shiftTabFromShortcuts: back, tabFromShortcuts: fromSc, names, ax, errors };
  await page.locator('[data-testid="arrangement-master"]').screenshot({ path: `${out}/${label}-master-focus-${v}.png` }).catch(() => {});
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/${label}-tab-full.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
