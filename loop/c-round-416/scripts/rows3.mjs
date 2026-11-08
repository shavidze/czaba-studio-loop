import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const res = {};
const browser = await chromium.launch();
const B = 'http://127.0.0.1:5173';
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = res[k] = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0,150)));
  await page.goto(B + '/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  r.authUserLab = await page.evaluate(() => localStorage.getItem('auth_user'));
  r.workspaceOpens = true;
  await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }).catch(() => { r.readyTimeout = true; });
  await page.waitForTimeout(1000);
  // Row 3
  r.clipsBefore = await page.locator('[data-clip-id]').count();
  await page.getByTestId('arrangement-library-list').getByRole('option').first().click();
  r.libItem = (await page.locator('[role="option"][aria-selected="true"]').first().textContent().catch(()=>''))?.replace(/\s+/g,' ').trim().slice(0,60);
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  r.clipsAfter = await page.locator('[data-clip-id]').count();
  r.status = (await page.getByTestId('arrangement-status').textContent().catch(()=>''))?.trim();
  const pos = async () => (await page.getByTestId('arrangement-position').textContent().catch(()=>''))?.trim();
  r.pos0 = await pos();
  await page.getByRole('button', { name: /^Play/ }).first().click();
  await page.waitForTimeout(1500);
  r.posPlaying = await pos();
  await page.screenshot({ path: `${out}/smoke-playing-${k}.png` });
  await page.getByRole('button', { name: /^Stop/ }).first().click().catch(()=>{});
  await page.waitForTimeout(300);
  r.posStopped1 = await pos(); await page.waitForTimeout(700); r.posStopped2 = await pos();
  r.playBtnBack = await page.getByRole('button', { name: /^Play/ }).first().isVisible().catch(()=>false);
  await page.getByRole('button', { name: /^Export/ }).first().click();
  await page.waitForTimeout(800);
  r.dialogOpen = await page.getByRole('dialog').first().isVisible().catch(()=>false);
  r.dialogText = (await page.getByRole('dialog').first().innerText().catch(()=>'')).replace(/\s+/g,' ').slice(0,200);
  await page.screenshot({ path: `${out}/smoke-export-${k}.png` });
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  if (await page.getByRole('dialog').first().isVisible().catch(()=>false)) {
    await page.getByRole('dialog').first().getByRole('button', { name: /Close|Cancel|Done/ }).first().click().catch(()=>{});
    await page.waitForTimeout(400);
  }
  r.dialogClosed = !(await page.getByRole('dialog').first().isVisible().catch(()=>false));
  r.audioSrc = await page.locator('audio[src]').count();
  await ctx.close();
  r.errs = errs;
}
await browser.close();
writeFileSync(`${out}/rows23.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
