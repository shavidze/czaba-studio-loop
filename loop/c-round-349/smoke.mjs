import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
import fs from 'node:fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-349';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const results = { auth: {}, video: {} };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  const tag = `${vp.width}x${vp.height}`;
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  const a = {};
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1500);
  a.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  a.title = await page.title();
  a.badge = await page.getByText(/demo/i).first().innerText().catch(() => null);
  a.workspace = await page.locator('[data-clip-kind], [data-testid^="arrangement"]').count();
  await page.screenshot({ path: `${out}/auth-studio-lab-${tag}.png` });
  const r = await page.goto(`${base}/studio/demo-product-1`, { waitUntil: 'networkidle' }).catch((e) => String(e));
  await page.waitForTimeout(1500);
  a.studioSignIn = await page.getByText('Sign in required').count();
  a.audioSrc = await page.locator('audio[src]').count();
  a.studioUrl = page.url();
  await page.screenshot({ path: `${out}/auth-studio-product-${tag}.png` });
  for (const m of ['GET', 'POST']) {
    const resp = await ctx.request.fetch(`${base}/api/studio-token`, { method: m, data: m === 'POST' ? {} : undefined, failOnStatusCode: false });
    a[`token${m}`] = resp.status();
  }
  results.auth[tag] = a;
  // video smoke
  const v = {};
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 30000 }).catch(() => {});
  await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
  const vc = page.locator('[data-clip-kind="video"]');
  await vc.first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  const clip = vc.first();
  const undoBtn = page.getByRole('button', { name: /^Undo/ }).first();
  const undoTitle = async () => await undoBtn.getAttribute('title');
  const state = async () => ({ start: await clip.getAttribute('data-clip-start'), fade: await clip.getAttribute('data-fade-in'), undo: await undoTitle() });
  let z = 0;
  const mb = async () => (await clip.getByTitle(/ clip$|move/i).first().boundingBox().catch(() => null))?.width ?? 0;
  const trim = clip.getByTitle('Trim — left edge', { exact: true });
  while (z < 16 && ((await clip.boundingBox())?.width ?? 0) < 480) { await page.keyboard.press('='); await page.waitForTimeout(250); z++; }
  v.zoomKeys = z; v.clipWidth = (await clip.boundingBox())?.width;
  v.initial = await state();
  async function drag(loc, dx, label, frac = 0.5) {
    const bb = await loc.boundingBox();
    if (!bb) { v[label] = 'no target'; return; }
    const x = bb.x + bb.width / 2, y = bb.y + bb.height * frac;
    v[label + 'Box'] = bb;
    v[label + 'Hit'] = await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return e ? (e.getAttribute('title') ?? e.getAttribute('data-testid') ?? e.tagName) : null; }, [x, y]);
    await page.mouse.move(x, y); await page.mouse.down();
    const before = await state();
    await page.mouse.move(x + dx / 2, y, { steps: 8 });
    const mid = await state();
    await page.mouse.move(x + dx, y, { steps: 8 });
    const end = await state();
    await page.screenshot({ path: `${out}/video-${label}-during-${tag}.png` });
    await page.mouse.up(); await page.waitForTimeout(400);
    const after = await state();
    v[label] = { before, mid, end, afterRelease: after };
  }
  v.fadeBoxPre = await clip.getByTestId('arrangement-video-fade-in-handle').boundingBox();
  const tb = await trim.boundingBox(); v.trimBoxPre = tb;
  let tf = 0.5; for (const f of [0.5, 0.8, 0.9, 0.2]) { const hit = await page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.getAttribute('title') ?? null, [tb.x + tb.width / 2, tb.y + tb.height * f]); if (hit === 'Trim — left edge') { tf = f; break; } }
  v.trimFrac = tf;
  await drag(trim, 60, 'trim', tf);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
  v.afterUndoTrim = await state();
  const fade = clip.getByTestId('arrangement-video-fade-in-handle');
  await drag(fade, 60, 'fade');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
  v.afterUndoFade = await state();
  results.video[tag] = v;
  results.video[tag].errors = errs;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/smoke-results.json`, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
