// B round 306 -> 307 audio-continuity probe for PERF-COMMIT-RESCHEDULE. args: base out W H
// Taps every non-offline connection into ctx.destination with a ScriptProcessor recorder (stereo, 4096 frames).
// 30 clips, zoom out 4 keys so clip 2 is on screen, play from Home; while clip 1 sounds, drag the fade-in handle of
// clip 2 (not yet sounding) -> the commit restarts all 30 clips; clip 1's audio should be continuous.
// Per window (edit and control, 3 each) reports: start() calls, max |2nd difference| inside +-20 ms of the restart
// time (scheduled startAt from the start() 'when' argument) vs the max over the rest of the window, and min/max RMS (5 ms).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out, W = '1440', H = '900'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.addInitScript(() => {
    window.__whens = []; window.__rec = null; window.__recOn = false;
    const st = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { st.apply(this, a); if (!(this.context instanceof OfflineAudioContext)) window.__whens.push(a[0] ?? 0); };
    const conn = AudioNode.prototype.connect;
    const taps = new WeakMap();
    AudioNode.prototype.connect = function (dest, ...rest) {
      const r = conn.call(this, dest, ...rest);
      if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext) && !this.__isRec) {
        const ctx = this.context;
        let sp = taps.get(ctx);
        if (!sp) {
          sp = ctx.createScriptProcessor(4096, 2, 2); sp.__isRec = true;
          const z = ctx.createGain(); z.gain.value = 0; z.__isRec = true;
          sp.onaudioprocess = (e) => { if (!window.__recOn) return; window.__rec.push({ t: e.playbackTime, l: e.inputBuffer.getChannelData(0).slice(), r: e.inputBuffer.getChannelData(1).slice(), sr: ctx.sampleRate }); };
          conn.call(sp, z); conn.call(z, ctx.destination);
          taps.set(ctx, sp);
        }
        conn.call(this, sp);
      }
      return r;
    };
  });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const first = page.locator('[data-clip-id]').first();
  const box = await first.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1000);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('-'); await page.waitForTimeout(300); }
  const second = page.locator('[data-clip-id]').nth(1);
  const res = { viewport: [W, H], clips: await page.locator('[data-clip-id]').count(), windows: [] };
  const analyse = (label, edited) => page.evaluate(([label, edited]) => {
    const rec = window.__rec; const sr = rec[0].sr;
    const t0 = rec[0].t; const L = []; for (const c of rec) for (let i = 0; i < c.l.length; i++) L.push(c.l[i]);
    const restartAt = window.__whens.length ? Math.min(...window.__whens) : null;
    let near = 0, rest = 0, nearAt = null;
    const idx = restartAt === null ? -1 : Math.round((restartAt - t0) * sr);
    for (let n = 2; n < L.length; n++) {
      const d2 = Math.abs(L[n] - 2 * L[n - 1] + L[n - 2]);
      if (idx >= 0 && Math.abs(n - idx) <= sr * 0.02) { if (d2 > near) { near = d2; nearAt = n - idx; } } else if (d2 > rest) rest = d2;
    }
    const w = Math.round(sr * 0.005); const rms = [];
    for (let n = 0; n + w <= L.length; n += w) { let s = 0; for (let i = n; i < n + w; i++) s += L[i] * L[i]; rms.push(Math.sqrt(s / w)); }
    const mid = rms.slice(2, -2);
    return { label, edited, starts: window.__whens.length, restartOffsetS: restartAt === null ? null : Math.round((restartAt - t0) * 1000) / 1000, samples: L.length, d2NearRestart: near, d2NearAtSamples: nearAt, d2Rest: rest, ratio: rest ? Math.round((near / rest) * 1000) / 1000 : null, rmsMin: Math.min(...mid), rmsMax: Math.max(...mid) };
  }, [label, edited]);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let pass = 1; pass <= 3; pass++) {
    await page.keyboard.press('Home');
    if (pass === 1) await page.keyboard.press('Space');
    await page.waitForTimeout(800);
    await page.evaluate(() => { window.__rec = []; window.__whens = []; window.__recOn = true; });
    await page.waitForTimeout(400);
    const h = second.getByTestId('arrangement-clip-fade-in-handle');
    const b = await h.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    await page.evaluate(() => { window.__recOn = false; });
    res.windows.push(await analyse(`edit p${pass}`, true));
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
    await page.keyboard.press('Home'); await page.waitForTimeout(800);
    await page.evaluate(() => { window.__rec = []; window.__whens = []; window.__recOn = true; });
    await page.waitForTimeout(1000);
    await page.evaluate(() => { window.__recOn = false; });
    res.windows.push(await analyse(`control p${pass}`, false));
  }
  res.playing = await page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
