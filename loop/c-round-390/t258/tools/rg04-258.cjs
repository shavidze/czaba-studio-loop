// C round 258: RG-04 adapted for SABA-B-10a (task §3 table). usage: node rg04-258.cjs <outDir>
const L = require('./lib258.cjs');
const { sleep, fs, path } = L;
const outDir = path.resolve(process.argv[2]); fs.mkdirSync(outDir, { recursive: true });
const S = (page) => page.evaluate(() => ({ ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')), m: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null, playing: document.querySelector('button[aria-label="Play"]')?.dataset.playing === 'true', range: document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null, t: performance.now() }));
const startSampler = (page) => page.evaluate(() => { window.__smp = []; window.__smpId = setInterval(() => window.__smp.push({ t: performance.now(), ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')) }), 20); });
const stopSampler = (page) => page.evaluate(() => { clearInterval(window.__smpId); return window.__smp; });
const LEAD = 0.05;
(async () => {
  const browser = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
    const { ctx, page, errors } = await L.open(browser, vp, { pulse: true, zoom: false });
    if ((await page.getByTestId('arrangement-grid-control').getAttribute('data-snap')) === 'on') { await page.keyboard.press('KeyG'); await sleep(300); }
    r.snap = await page.getByTestId('arrangement-grid-control').getAttribute('data-snap');
    const rb = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
    const pps = parseFloat(await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
    const tx = (t) => rb.x + t * pps;
    r.s0 = await S(page);
    // 1. drag the playhead handle 0 -> 6 while stopped
    const h = await page.locator('[data-testid="arrangement-playhead-handle"]').boundingBox(); const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
    await page.mouse.move(hx, hy); await page.mouse.down(); await page.mouse.move(tx(4.3), hy, { steps: 8 }); await sleep(150);
    const mid = await page.locator('[data-testid="arrangement-playhead-handle"]').boundingBox();
    await page.mouse.move(tx(6), hy, { steps: 8 }); await sleep(150);
    const end = await page.locator('[data-testid="arrangement-playhead-handle"]').boundingBox();
    await page.mouse.up(); await sleep(300);
    r.drag = { midDx: +(mid.x + mid.width / 2 - tx(4.3)).toFixed(2), endDx: +(end.x + end.width / 2 - tx(6)).toFixed(2), after: await S(page) };
    // 2. Space -> playing from 6; after ~1 s drag a 1 s body range on the clip
    await L.blur(page); await page.keyboard.press('Space'); await sleep(1000);
    r.playing1 = await S(page);
    await startSampler(page);
    const clip = await page.locator('[data-track-id="music"] [data-clip-id]').first().boundingBox(); const cy = clip.y + clip.height * 0.65;
    await page.mouse.move(tx(10), cy); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) { await page.mouse.move(tx(10 + i * 0.1), cy); await sleep(20); } await page.mouse.up(); await sleep(300);
    const smp = await stopSampler(page);
    let mono = true; let maxStep = 0; for (let i = 1; i < smp.length; i += 1) { const d = smp[i].ph - smp[i - 1].ph; if (d < -1e-9) mono = false; if (d > maxStep) maxStep = d; }
    r.rangeDrag = { n: smp.length, mono, maxStep: +maxStep.toFixed(3), after: await S(page) };
    // 3. Space -> stopped; click an empty lane point at 6 (clears the range, sets the marker)
    await page.keyboard.press('Space'); await sleep(400); r.stopped1 = await S(page);
    const sfx = await page.locator('[data-track-id="sfx"] [data-grid-lines]').first().boundingBox();
    await page.mouse.click(tx(6), sfx.y + sfx.height / 2); await sleep(400); r.laneClick = await S(page);
    // 4. Space -> playing from 6; Space at ~7.2 -> stopped; Space -> restarts at 6; Space -> stopped t1; Shift+Space -> continues from t1
    await L.blur(page); await page.keyboard.press('Space');
    await page.waitForFunction(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')) >= 7.2, null, { timeout: 8000 });
    await page.keyboard.press('Space'); await sleep(400); r.stop72 = await S(page);
    const tSpace = Date.now(); await page.keyboard.press('Space'); await sleep(250); r.restart = await S(page); r.restartElapsed = (Date.now() - tSpace) / 1000;
    await sleep(500); await page.keyboard.press('Space'); await sleep(400); r.stopT1 = await S(page);
    const tShift = Date.now(); await page.keyboard.press('Shift+Space'); await sleep(250); r.cont = await S(page); r.contElapsed = (Date.now() - tShift) / 1000;
    await page.keyboard.press('Space'); await sleep(400);
    // 5. Stop, then Home
    await page.keyboard.press('Home'); await sleep(400); r.home = await S(page);
    await page.screenshot({ path: path.join(outDir, `rg04-${k}.png`) });
    r.errors = errors; await ctx.close();
    r.checks = {
      snapOff: r.snap === 'off',
      handleTracks: Math.abs(r.drag.midDx) <= 1 && Math.abs(r.drag.endDx) <= 1,
      dragMarker: r.drag.after.m === '6.000' && Math.abs(r.drag.after.ph - 6) <= 0.05 && !r.drag.after.playing,
      playsFrom6: r.playing1.playing && r.playing1.ph >= 6.5 && r.playing1.ph <= 6 + 1.0 + LEAD + 0.15,
      noJumpOnRange: r.rangeDrag.mono && r.rangeDrag.maxStep <= 0.1 && r.rangeDrag.after.playing,
      laneClick: !r.laneClick.playing && r.laneClick.m === '6.000' && r.laneClick.range === null,
      stop72: !r.stop72.playing && r.stop72.ph >= 7.2,
      restartAt6: r.restart.playing && r.restart.m === '6.000' && r.restart.ph >= 6 - 0.05 && r.restart.ph <= 6 + r.restartElapsed + 0.05 + LEAD,
      shiftContinues: r.cont.playing && r.cont.ph >= r.stopT1.ph - 0.05 && r.cont.ph <= r.stopT1.ph + r.contElapsed + 0.05 + LEAD && r.cont.m === '6.000',
      home: !r.home.playing && r.home.m === '0.000' && r.home.ph === 0,
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean);
    console.log(k, r.pass, JSON.stringify(r.checks), JSON.stringify({ drag: r.drag, p1: r.playing1.ph, rd: r.rangeDrag, lc: r.laneClick, s72: r.stop72.ph, rs: [r.restart.ph, r.restartElapsed], t1: r.stopT1.ph, c: [r.cont.ph, r.contElapsed] }));
  }
  fs.writeFileSync(path.join(outDir, 'rg04-258.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
