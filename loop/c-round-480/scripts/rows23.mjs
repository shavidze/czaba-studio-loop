import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-480';
const res = {};
const browser = await chromium.launch();
const warm = await browser.newPage();
for (const u of ['/studio-lab', '/studio/middle-east']) { await warm.goto('http://127.0.0.1:5173' + u, { waitUntil: 'networkidle', timeout: 180000 }).catch(() => {}); await warm.waitForTimeout(3000); }
await warm.close();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = res[k] = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  const audioReq = []; page.on('request', (q) => { if (/studio-token|\.(mp3|wav)/.test(q.url())) audioReq.push(q.url().slice(0,120)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  r.ready = await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1000);
  r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  r.workspaceOpen = await page.getByTestId('arrangement-timeline-scroller').isVisible();
  r.beforeClips = await page.locator('[data-clip-id]').count();
  await page.screenshot({ path: `${out}/g480-lab-open-${k}.png` });
  // smoke
  await page.getByTestId('arrangement-library-list').getByRole('option').first().click();
  await page.waitForTimeout(250);
  r.addedOption = (await page.locator('[role="option"][aria-selected="true"]').first().textContent().catch(()=>''))?.replace(/\s+/g,' ').trim().slice(0,60);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  r.afterClips = await page.locator('[data-clip-id]').count();
  r.pos0 = (await page.getByTestId('arrangement-position').textContent())?.trim();
  await page.getByRole('button', { name: /^Play/ }).first().click();
  await page.waitForTimeout(1500);
  r.posPlaying = (await page.getByTestId('arrangement-position').textContent())?.trim();
  await page.screenshot({ path: `${out}/g480-playing-${k}.png` });
  await page.getByRole('button', { name: /^Stop/ }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  r.posStopped1 = (await page.getByTestId('arrangement-position').textContent())?.trim();
  await page.waitForTimeout(800);
  r.posStopped2 = (await page.getByTestId('arrangement-position').textContent())?.trim();
  await page.getByRole('button', { name: /^Export/ }).first().click();
  await page.waitForTimeout(700);
  r.dialogOpen = await page.getByRole('dialog').first().isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/g480-export-open-${k}.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  r.dialogAfterEsc = await page.getByRole('dialog').count();
  if (r.dialogAfterEsc) { await page.getByRole('button', { name: /Cancel|Close|Done/ }).first().click().catch(()=>{}); await page.waitForTimeout(400); r.dialogAfterClose = await page.getByRole('dialog').count(); }
  r.pageErrors = errs; r.audioReq = audioReq;
  // premium page
  const resp = await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => ({ status: () => 'err' }));
  await page.waitForTimeout(2500);
  r.premiumStatus = resp.status();
  r.premiumUrl = page.url();
  r.signInRequired = await page.getByText(/Sign in required/i).count();
  r.premiumAudioSrc = await page.locator('audio[src]').count();
  r.premiumWorkspace = await page.getByTestId('arrangement-timeline-scroller').count();
  r.premiumAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  r.premiumBody = (await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,300);
  await page.screenshot({ path: `${out}/g480-premium-${k}.png` });
  const api = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem.mp3', { headers: {} });
  r.tokenStatus = api.status(); r.tokenBody = (await api.text()).slice(0,150);
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/rows23.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
