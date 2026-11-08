// B round 408 -> 409 probe (PERF-11c-iii-e-ii): copy of b-round-407/lane/lane-actions-probe.mjs with (1) B-R408-PROBE-ACTIVE-TRACK-VACUOUS fixed: the
// active-track step clicks an UNPRESSED lane button and records aria-pressed before and after; (2) a bass-waveform step: the added Bass clip
// shows its waveform (peaks arrive from the worker after the decode state, so a lane-sources comparator that never changes keeps it blank);
// (3) an exclusive-solo step across two lanes (the Solo of the first lane unpresses when the second lane is soloed exclusively).
// B round 407 -> 408 probe (PERF-11c-iii-e-i): drives the ArrangementLane callbacks that move to the actions context.
// Usage: node lane-actions-probe.mjs <baseUrl> <outJson> <WxH>
// Steps on the first non-video lane after adding Bass with Enter: mute click + Ctrl+Z, solo click + Ctrl+Z,
// volume pointer drag, pan pointer drag, transport Undo x2 (volume, pan restored), active-track click on the 2nd lane,
// clip click (selection). Each step records the observed attribute values; `ok` is the AND of the step checks.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const out = { base, at: new Date().toISOString(), viewport: `${w}x${h}`, steps: {}, pageErrors: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
const page = await ctx.newPage();
page.on('pageerror', (e) => out.pageErrors.push(String(e)));
const checks = [];
const check = (name, pass, data) => { out.steps[name] = { pass, ...data }; checks.push(pass); };
try {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByRole('option', { name: /Bass/ }).first().click();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const bassClip = page.locator('[data-clip-id]').filter({ hasText: /Bass/ }).first();
  let wave = 0;
  for (let i = 0; i < 20 && wave === 0; i++) { wave = await bassClip.locator('[data-testid="arrangement-clip-waveform"]').count(); if (wave === 0) await page.waitForTimeout(250); }
  check('bass-waveform', (await bassClip.count()) === 1 && wave === 1, { bassClips: await bassClip.count(), waveforms: wave });
  const mute = page.locator('button[aria-label^="Mute — "]:not([aria-label="Mute — Original video sound"])').first();
  const name = (await mute.getAttribute('aria-label')).replace('Mute — ', '');
  out.lane = name;
  const solo = page.locator(`button[aria-label^="Solo — ${name} ("]`).first();
  const volume = page.locator(`input[aria-label="Volume — ${name}"]`).first();
  const pan = page.locator(`input[aria-label="Pan — ${name}"]`).first();
  const body = page.locator('body');
  const pressed = async (loc) => loc.getAttribute('aria-pressed');
  await mute.click(); await page.waitForTimeout(300);
  const m1 = await pressed(mute), s1 = await pressed(solo);
  await body.press('Control+z'); await page.waitForTimeout(300);
  const m2 = await pressed(mute);
  check('mute', m1 === 'true' && s1 === 'false' && m2 === 'false', { afterClick: m1, soloAfterMuteClick: s1, afterUndo: m2 });
  await solo.click(); await page.waitForTimeout(300);
  const s3 = await pressed(solo), m3 = await pressed(mute);
  await body.press('Control+z'); await page.waitForTimeout(300);
  const s4 = await pressed(solo);
  check('solo', s3 === 'true' && m3 === 'false' && s4 === 'false', { afterClick: s3, muteAfterSoloClick: m3, afterUndo: s4 });
  const drag = async (loc, dx) => {
    const b = await loc.boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 6; i++) { await page.mouse.move(x + (dx * i) / 6, y); await page.waitForTimeout(30); }
    await page.mouse.up(); await page.waitForTimeout(400);
  };
  const v0 = await volume.inputValue();
  await drag(volume, -40);
  const v1 = await volume.inputValue();
  check('volume-drag', Number(v1) < Number(v0), { before: v0, after: v1 });
  const p0 = await pan.inputValue();
  await drag(pan, 25);
  const p1 = await pan.inputValue();
  check('pan-drag', Number(p1) > Number(p0), { before: p0, after: p1 });
  const transport = page.getByTestId('arrangement-transport');
  await transport.getByRole('button', { name: /^Undo/ }).click(); await page.waitForTimeout(300);
  const p2 = await pan.inputValue();
  await transport.getByRole('button', { name: /^Undo/ }).click(); await page.waitForTimeout(300);
  const v2 = await volume.inputValue();
  check('undo-mix', p2 === p0 && v2 === v0, { panAfterUndo: p2, volumeAfterUndo: v2 });
  const active = page.locator('button[aria-pressed][aria-label*="active track" i]');
  out.activeButtons = await active.count();
  const states = [];
  for (let i = 0; i < out.activeButtons; i++) states.push(await active.nth(i).getAttribute('aria-pressed'));
  const idx = states.indexOf('false');
  if (idx >= 0) {
    const target = active.nth(idx);
    const label = await target.getAttribute('aria-label');
    await target.click(); await page.waitForTimeout(300);
    const after = await target.getAttribute('aria-pressed');
    const pressedAfter = [];
    for (let i = 0; i < out.activeButtons; i++) pressedAfter.push(await active.nth(i).getAttribute('aria-pressed'));
    check('active-track', after === 'true' && pressedAfter.filter((v) => v === 'true').length === 1, { label, before: 'false', after, statesBefore: states, statesAfter: pressedAfter });
  } else {
    check('active-track', false, { reason: 'no unpressed active-track button', states });
  }
  const solos = page.locator('button[aria-label^="Solo — "]:not([aria-label*="Original video sound"])');
  out.soloButtons = await solos.count();
  if (out.soloButtons >= 2) {
    const a = solos.nth(0), b = solos.nth(1);
    await a.click(); await page.waitForTimeout(300);
    const a1 = await pressed(a), b1 = await pressed(b);
    await b.click(); await page.waitForTimeout(300);
    const a2 = await pressed(a), b2 = await pressed(b);
    await body.press('Control+z'); await page.waitForTimeout(300);
    await body.press('Control+z'); await page.waitForTimeout(300);
    const a3 = await pressed(a), b3 = await pressed(b);
    check('exclusive-solo', a1 === 'true' && b1 === 'false' && a2 === 'false' && b2 === 'true' && a3 === 'false' && b3 === 'false', { a1, b1, a2, b2, a3, b3, labels: [await a.getAttribute('aria-label'), await b.getAttribute('aria-label')] });
  } else {
    check('exclusive-solo', false, { reason: 'fewer than 2 solo buttons', count: out.soloButtons });
  }
  await page.screenshot({ path: outPath.replace(/\.json$/, '.png') });
} catch (e) {
  out.error = String(e);
  checks.push(false);
}
out.ok = checks.length > 0 && checks.every(Boolean) && out.pageErrors.length === 0;
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ok: out.ok, error: out.error, steps: out.steps }));
