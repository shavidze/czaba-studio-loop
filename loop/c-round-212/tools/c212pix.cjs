// C round 212 — PIX-212 capture: lane + detail waveform element screenshots and geometry, per state. Run on baseline and current builds.
// usage: node c212pix.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const path = require('path');
const fs = require('fs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const DIR = path.join(L.SHOTS, 'pix');
fs.mkdirSync(DIR, { recursive: true });
const LANE = '[data-clip-kind="audio"] [data-testid=arrangement-clip-waveform]';
const DETAIL = '[data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"]';
async function geo(page, sel) {
  return page.evaluate((sel) => {
    const s = document.querySelector(sel);
    if (!s) return null;
    const p = s.querySelector(':scope > path');
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const pcs = p ? getComputedStyle(p) : null;
    return { box: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100), viewBox: s.getAttribute('viewBox'), par: s.getAttribute('preserveAspectRatio'), cls: s.getAttribute('class'), color: cs.color, fill: pcs && pcs.fill, opacity: cs.opacity, paths: s.querySelectorAll('path').length, d: p ? p.getAttribute('d') : null };
  }, sel);
}
async function capture(page, R, state) {
  R[state] = {};
  for (const [k, sel] of [['lane', LANE], ['detail', DETAIL]]) {
    const g = await geo(page, sel);
    const f = path.join(DIR, `${tag}-${vw}-${state}-${k}.png`);
    let shot = null;
    try { await page.locator(sel).first().screenshot({ path: f, animations: 'disabled', timeout: 10000 }); shot = path.basename(f); } catch (e) { shot = 'ERR ' + String(e).slice(0, 120); }
    R[state][k] = { ...g, shot };
  }
  R[state].fader = await L.sl(page, 'Clip Gain — fader').getAttribute('aria-valuetext');
}
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    await L.selectFirstClip(page);
    await page.mouse.move(5, vh - 5);
    await L.sleep(500);
    await capture(page, R, 'rest0');
    // mid-drag held at about -12 and about +6 (1 px steps; same pixel path on both builds)
    const f = L.sl(page, 'Clip Gain — fader');
    await f.scrollIntoViewIfNeeded();
    const b = await f.boundingBox();
    const y = b.y + b.height / 2;
    let x = b.x + b.width / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    let v = Number(await f.inputValue());
    let steps = 0;
    while (v > -12 && steps < 400) { x -= 1; steps += 1; await page.mouse.move(x, y); v = Number(await f.inputValue()); }
    await L.sleep(400);
    await capture(page, R, 'dragm12');
    R.dragm12.value = v;
    while (v < 6 && steps < 900) { x += 1; steps += 1; await page.mouse.move(x, y); v = Number(await f.inputValue()); }
    await L.sleep(400);
    await capture(page, R, 'dragp6');
    R.dragp6.value = v;
    await page.mouse.up();
    await L.quiet(page);
    await page.keyboard.press('Control+z');
    await L.quiet(page);
    await L.blurActive(page);
    await page.mouse.move(5, vh - 5);
    await L.sleep(400);
    R.afterUndo = await L.sl(page, 'Clip Gain — fader').getAttribute('aria-valuetext');
    const z = page.getByTestId('arrangement-waveform-zoom');
    R.zoomOptions = await z.evaluate((s) => [...s.options].map((o) => o.value));
    for (const zv of ['2', '8']) {
      await z.selectOption(zv);
      await L.blurActive(page);
      await page.mouse.move(5, vh - 5);
      await L.sleep(600);
      await capture(page, R, 'zoom' + zv);
    }
    await z.selectOption('1');
    await L.sleep(400);
    for (const [db, st] of [[-60, 'floorm60'], [24, 'clipp24']]) {
      await L.typeClipGain(page, db);
      await page.mouse.move(5, vh - 5);
      await L.sleep(500);
      await capture(page, R, st);
    }
    R.errors = errors;
    await ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`pix-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '', R.dragm12 && R.dragm12.value, R.dragp6 && R.dragp6.value);
})();
