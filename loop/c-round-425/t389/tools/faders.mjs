import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-425/t389/out';
const base = 'http://127.0.0.1:5173';
const browser = await chromium.launch();
const out = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  let page = await ctx.newPage();
  const r = { lane: {}, clipgain: {} };
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1500);
  await page.getByRole('button', { name: 'Fit', exact: true }).first().click(); await sleep(1000);
  r.clipsAtStart = await page.locator('[data-clip-kind="audio"]').count();
  const vols = page.locator('input[aria-label^="Volume — "]');
  r.volLabels = await vols.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') + ' title=' + e.title + ' v=' + e.value));
  // pick the first non-video volume fader
  let idx = 0;
  for (let i = 0; i < r.volLabels.length; i++) if (!/video/i.test(r.volLabels[i])) { idx = i; break; }
  const vol = vols.nth(idx);
  const lane = vol.locator('xpath=ancestor::*[@data-track-id][1]');
  const pan = lane.getByTestId('arrangement-track-pan');
  const reset = lane.getByTestId('arrangement-track-pan-reset');
  const readTxt = async () => (await vol.evaluate((e) => e.parentElement.innerText.replace(/\s+/g, ' ')));
  const undo = async () => { await page.keyboard.press('Control+KeyZ'); await sleep(300); };
  // (a) volume drag
  const v0 = await vol.inputValue();
  const vb = await vol.boundingBox();
  const cy = vb.y + vb.height / 2;
  await page.mouse.move(vb.x + vb.width * 0.5, cy);
  await page.mouse.down();
  await page.mouse.move(vb.x + vb.width * 0.35, cy, { steps: 4 });
  await sleep(150);
  const mid = { value: await vol.inputValue(), text: await readTxt() };
  await page.mouse.move(vb.x + vb.width * 0.3, cy, { steps: 3 });
  await sleep(100);
  await page.mouse.up();
  await sleep(300);
  const after = await vol.inputValue();
  r.lane.a = { v0, mid, after, changedMid: mid.value !== v0, committed: after !== v0 };
  await undo();
  r.lane.a.afterUndo = await vol.inputValue();
  r.lane.a.oneUndoRestores = r.lane.a.afterUndo === v0;
  // (b) keyboard
  await vol.focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await sleep(300);
  const kb = await vol.inputValue();
  await page.evaluate(() => document.activeElement?.blur());
  await sleep(200);
  r.lane.b = { before: v0, afterKeys: kb, afterBlur: await vol.inputValue() };
  await undo();
  r.lane.b.afterUndo1 = await vol.inputValue();
  if (r.lane.b.afterUndo1 !== v0) { await undo(); r.lane.b.afterUndo2 = await vol.inputValue(); }
  r.lane.b.clipsAfterUndo = await page.locator('[data-clip-kind="audio"]').count();
  // (c) double-click reset
  await vol.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  await sleep(200);
  const pre = await vol.inputValue();
  await vol.dblclick();
  await sleep(300);
  r.lane.c = { pre, afterDbl: await vol.inputValue() };
  // (d) pan
  const pb = await pan.boundingBox();
  const py = pb.y + pb.height / 2;
  const p0 = await pan.inputValue();
  const reset0 = await reset.isDisabled();
  await page.mouse.move(pb.x + pb.width * 0.5, py);
  await page.mouse.down();
  await page.mouse.move(pb.x + pb.width * 0.85, py, { steps: 5 });
  await sleep(150);
  const pmid = { value: await pan.inputValue(), readout: await reset.innerText() };
  await page.mouse.up();
  await sleep(300);
  const p1 = await pan.inputValue();
  const reset1 = await reset.isDisabled();
  await pan.dblclick();
  await sleep(300);
  const p2 = await pan.inputValue();
  const reset2 = await reset.isDisabled();
  // set pan again then click reset button
  await pan.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(200);
  const p3 = await pan.inputValue(); const reset3 = await reset.isDisabled();
  await reset.click(); await sleep(300);
  const p4 = await pan.inputValue(); const reset4 = await reset.isDisabled();
  const focusIsPan = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  r.lane.d = { p0, reset0, pmid, p1, reset1, p2, reset2, p3, reset3, p4, reset4, focusAfterReset: focusIsPan };
  // (e) blur mid-drag
  const bpre = await pan.inputValue();
  await page.mouse.move(pb.x + pb.width * 0.5, py);
  await page.mouse.down();
  await page.mouse.move(pb.x + pb.width * 0.9, py, { steps: 4 });
  await sleep(120);
  const eMid = await pan.inputValue();
  await pan.evaluate((e) => e.blur());
  await sleep(300);
  const eAfter = await pan.inputValue();
  await page.mouse.up(); await sleep(300);
  const eRel = await pan.inputValue();
  r.lane.e = { bpre, eMid, eAfterBlur: eAfter, eAfterRelease: eRel, cancelled: eAfter === bpre };
  // (f) video lane
  const vv = page.locator('input[aria-label="Volume — Video"], input[aria-label^="Volume — Video"]').first();
  r.lane.f = { count: await vv.count() };
  if (r.lane.f.count) {
    r.lane.f.title = await vv.evaluate((e) => e.title);
    r.lane.f.before = await vv.inputValue();
    await vv.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await sleep(250);
    r.lane.f.afterKeys = await vv.inputValue();
    await vv.dblclick(); await sleep(250);
    r.lane.f.afterDbl = await vv.inputValue();
  }
  await page.screenshot({ path: `${outDir}/faders-lane-${w}.png` });
  // ---- clip gain
  await page.close();
  page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1500);
  await page.getByRole('button', { name: 'Fit', exact: true }).first().click(); await sleep(1000);
  const clips = page.locator('[data-clip-kind="audio"]');
  const hdr0 = () => clips.nth(0).getByTitle(/ — drag to move$/).first();
  r.clipCount = await clips.count();
  r.clipsForGain = await clips.count();
  while ((await clips.count()) < 2) { await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await sleep(1200); await page.getByRole('button', { name: 'Fit', exact: true }).first().click(); await sleep(900); }
  r.clipsForGain = await clips.count();
  const hdr = (n) => clips.nth(n).getByTitle(/ — drag to move$/).first();
  await hdr(0).click(); await sleep(800);
  const cgFader = page.getByTestId('arrangement-detail-clip-gain-fader');
  const cgInput = page.getByTestId('arrangement-detail-clip-gain-input');
  const cgReset = page.getByTestId('arrangement-detail-clip-gain-reset');
  if (!(await cgFader.isVisible())) { r.clipgain.expandedPanel = true; await page.getByTestId('arrangement-detail-toggle').click(); await sleep(800); }
  await cgFader.waitFor({ state: 'visible', timeout: 8000 }).catch((e) => { r.clipgain.waitErr = String(e).slice(0, 200); });
  r.clipgain.visible = await cgFader.count();
  await page.screenshot({ path: `${outDir}/faders-pre-gain-${w}.png` });
  r.clipgain.preState = await page.evaluate(() => ({ all: [...document.querySelectorAll('[data-testid="arrangement-detail-clip-gain-fader"]')].map((e) => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height, e.disabled, getComputedStyle(e).visibility, getComputedStyle(e).display]; }), w: document.querySelector('[data-testid="arrangement-detail-clip-gain-fader"]')?.getBoundingClientRect().width, det: document.querySelector('[data-testid="arrangement-detail-content"]')?.getBoundingClientRect().height, sel: document.querySelectorAll('[data-clip-kind="audio"][aria-selected="true"]').length, status: document.querySelector('[data-testid="arrangement-status"]')?.innerText }));
  writeFileSync(`${outDir}/faders-partial.json`, JSON.stringify({ out, r }, null, 1));
  const g0 = await cgFader.inputValue();
  const gb = await cgFader.boundingBox();
  const gy = gb.y + gb.height / 2;
  await page.mouse.move(gb.x + gb.width * 0.5, gy);
  await page.mouse.down();
  await page.mouse.move(gb.x + gb.width * 0.75, gy, { steps: 5 });
  await sleep(150);
  const gmid = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  await page.mouse.up(); await sleep(300);
  const g1 = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  await undo();
  const gu = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  r.clipgain.a1 = { g0, gmid, g1, afterUndo: gu };
  // 2-clip selection
  await hdr(1).click({ modifiers: ['Shift'] }); await sleep(400);
  const m0 = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  const gb2 = await cgFader.boundingBox();
  await page.mouse.move(gb2.x + gb2.width * 0.5, gb2.y + gb2.height / 2);
  await page.mouse.down();
  await page.mouse.move(gb2.x + gb2.width * 0.3, gb2.y + gb2.height / 2, { steps: 5 });
  await sleep(150);
  const mmid = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  await page.mouse.up(); await sleep(300);
  const m1 = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  r.clipgain.a2 = { m0, mmid, m1, selected: await page.locator('[data-clip-kind="audio"][aria-selected="true"], [data-clip-kind="audio"][data-selected="true"]').count() };
  // (b) double-click reset
  await cgFader.dblclick(); await sleep(300);
  r.clipgain.b = { fader: await cgFader.inputValue(), field: await cgInput.inputValue() };
  // (c) select A set value 6, select B set value -3 via field; select A, type garbage, Esc => A's value; then B...
  await hdr(0).click(); await sleep(300);
  await cgInput.fill('6'); await cgInput.press('Enter'); await sleep(300);
  const aVal = await cgInput.inputValue();
  await hdr(1).click(); await sleep(400);
  await cgInput.fill('-3'); await cgInput.press('Enter'); await sleep(300);
  const bVal = await cgInput.inputValue();
  await hdr(0).click(); await sleep(400);
  await hdr(1).click(); await sleep(400);
  await cgInput.focus(); await cgInput.fill('12'); await cgInput.press('Escape'); await sleep(300);
  const escVal = await cgInput.inputValue();
  r.clipgain.c = { aVal, bVal, afterEscapeOnB: escVal, restoresB: /-3/.test(escVal) };
  // (d) Enter and blur commit
  await cgInput.fill('4'); await cgInput.press('Enter'); await sleep(300);
  const dEnter = { field: await cgInput.inputValue(), fader: await cgFader.inputValue() };
  await cgInput.fill('-8'); await page.evaluate(() => document.activeElement?.blur()); await sleep(300);
  const dBlur = { field: await cgInput.inputValue(), fader: await cgFader.inputValue() };
  r.clipgain.d = { dEnter, dBlur };
  // (e) reset button
  await cgReset.click(); await sleep(300);
  r.clipgain.e = { field: await cgInput.inputValue(), fader: await cgFader.inputValue(), focus: await page.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName), resetDisabled: await cgReset.isDisabled() };
  await page.screenshot({ path: `${outDir}/faders-clipgain-${w}.png` });
  // (f) video clip: import synthetic video
  r.clipgain.f = { videoClips: await page.locator('[data-clip-kind="video"]').count() };
  const vclip = page.locator('[data-clip-kind="video"]').first();
  if (await vclip.count()) {
    await vclip.getByTitle(/ — drag to move$/).first().click(); await sleep(400);
    r.clipgain.f.videoSelected = { disabled: await cgFader.isDisabled().catch(() => 'n/a'), reason: await page.getByTestId('arrangement-detail-clip-gain-reason').innerText().catch(() => null) };
    await hdr(0).click(); await sleep(400);
    r.clipgain.f.audioAgain = { disabled: await cgFader.isDisabled().catch(() => 'n/a') };
  }
  out[w] = r;
  await ctx.close();
}
writeFileSync(`${outDir}/faders.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
