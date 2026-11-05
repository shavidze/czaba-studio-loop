import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-347';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const label = process.argv[3] ?? 'after';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  const r = { lane: {}, cg: {} };
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1500);
  await page.getByRole('button', { name: 'Fit', exact: true }).first().click(); await sleep(1000);
  const vols = page.locator('input[aria-label^="Volume — "]');
  const mv = vols.nth(1);
  const undo = async () => { await page.keyboard.press('Control+KeyZ'); await sleep(300); };
  const undoBtn = async () => (await page.getByRole('button', { name: /^Undo/ }).first().innerText());
  // lane (b): keyboard ArrowDown commit is one undo entry
  const histBefore = await undoBtn();
  await mv.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await sleep(300);
  const kv = await mv.inputValue(); const histKey = await undoBtn();
  await page.evaluate(() => document.activeElement?.blur()); await sleep(200);
  r.lane.b = { histBefore, kv, histKey, afterBlur: await mv.inputValue() };
  await undo(); r.lane.b.afterUndo = await mv.inputValue(); r.lane.b.histAfterUndo = await undoBtn();
  // lane (f) video lane
  const vv = vols.nth(0);
  r.lane.f = { title: await vv.evaluate((e) => e.title), label: await vv.getAttribute('aria-label'), before: await vv.inputValue() };
  await vv.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await sleep(250);
  r.lane.f.afterKeys = await vv.inputValue();
  await vv.dblclick(); await sleep(250); r.lane.f.afterDbl = await vv.inputValue();
  // pan reset-click focus + disabled state transitions
  const lane = mv.locator('xpath=ancestor::*[@data-track-id][1]');
  const pan = lane.getByTestId('arrangement-track-pan'); const reset = lane.getByTestId('arrangement-track-pan-reset');
  await pan.focus(); for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft'); await sleep(200);
  r.lane.pan = { afterKeys: await pan.inputValue(), disabled: await reset.isDisabled() };
  await reset.click(); await sleep(250);
  r.lane.pan.afterResetClick = await pan.inputValue(); r.lane.pan.disabledAfter = await reset.isDisabled(); r.lane.pan.focus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  // clip gain: panel state
  const cgFader = page.getByTestId('arrangement-detail-clip-gain-fader');
  const cgInput = page.getByTestId('arrangement-detail-clip-gain-input');
  const cgReset = page.getByTestId('arrangement-detail-clip-gain-reset');
  const clips = page.locator('[data-clip-kind="audio"]');
  const hdr = (n) => clips.nth(n).getByTitle(/ — drag to move$/).first();
  await hdr(0).click(); await sleep(600);
  if (!(await cgFader.isVisible())) { await page.getByTestId('arrangement-detail-toggle').click(); await sleep(700); }
  // 2-clip selection drag; verify each clip individually
  await hdr(1).click({ modifiers: ['Shift'] }); await sleep(500);
  const gb = await cgFader.boundingBox();
  await page.mouse.move(gb.x + gb.width * 0.5, gb.y + gb.height / 2); await page.mouse.down();
  await page.mouse.move(gb.x + gb.width * 0.2, gb.y + gb.height / 2, { steps: 5 }); await sleep(150);
  const mid = await cgInput.inputValue(); await page.mouse.up(); await sleep(400);
  const committed = await cgInput.inputValue();
  await hdr(0).click(); await sleep(400); const c0 = await cgInput.inputValue();
  await hdr(1).click(); await sleep(400); const c1 = await cgInput.inputValue();
  r.cg.multi = { mid, committed, clip0: c0, clip1: c1, bothChanged: c0 === c1 && c0 !== '0.0' };
  // undo one step reverts both
  await undo(); await hdr(0).click(); await sleep(300); const u0 = await cgInput.inputValue(); await hdr(1).click(); await sleep(300); const u1 = await cgInput.inputValue();
  r.cg.multi.afterUndo = [u0, u1];
  // reset button keeps focus on fader
  await cgFader.focus(); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await sleep(200);
  await page.keyboard.press('Tab'); await sleep(100);
  r.cg.reset = { before: await cgInput.inputValue(), focusBeforeClick: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) };
  await cgFader.focus(); await cgReset.click(); await sleep(300);
  r.cg.reset.after = await cgInput.inputValue(); r.cg.reset.focusAfter = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName);
  // synthetic video import
  const b64 = await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 160; c.height = 90;
    const g = c.getContext('2d'); const stream = c.captureStream(15);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' }); const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((res) => (rec.onstop = res)); rec.start();
    for (let i = 0; i < 30; i++) { g.fillStyle = `hsl(${i * 10},60%,40%)`; g.fillRect(0, 0, 160, 90); await new Promise((res) => setTimeout(res, 66)); }
    rec.stop(); await done;
    const buf = new Uint8Array(await new Blob(chunks).arrayBuffer()); let s = ''; for (const x of buf) s += String.fromCharCode(x); return btoa(s);
  });
  await page.locator('input[type="file"][accept*="video"]').first().setInputFiles({ name: 'film.webm', mimeType: 'video/webm', buffer: Buffer.from(b64, 'base64') });
  await sleep(5000);
  r.cg.videoClips = await page.locator('[data-clip-kind="video"]').count();
  if (r.cg.videoClips) {
    await page.locator('[data-clip-kind="video"]').first().getByTitle(/ — drag to move$/).first().click(); await sleep(600);
    r.cg.videoSel = { faderDisabled: await cgFader.isDisabled(), inputDisabled: await cgInput.isDisabled(), reason: await page.getByTestId('arrangement-detail-clip-gain-reason').innerText().catch(() => null), title: await cgFader.getAttribute('title') };
    await hdr(0).click(); await sleep(600);
    r.cg.audioAgain = { faderDisabled: await cgFader.isDisabled(), inputDisabled: await cgInput.isDisabled() };
  }
  await page.screenshot({ path: `${outDir}/faders2-${label}-${w}.png` });
  out[w] = r; await ctx.close();
}
writeFileSync(`${outDir}/faders2-${label}.json`, JSON.stringify(out, null, 1));
console.log('done');
await browser.close();
