const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  const r = await page.evaluate(async () => {
    const longTasks = [];
    const po = new PerformanceObserver((l) => { for (const e of l.getEntries()) longTasks.push(Math.round(e.duration)); });
    po.observe({ type: 'longtask', buffered: false });
    const sfx = await import('/app/lib/sfx-edit.ts');
    const sr = 48000, secs = 300, len = sr * secs;
    const src = new AudioBuffer({ numberOfChannels: 2, length: sr * 10, sampleRate: sr });
    for (let c = 0; c < 2; c++) { const d = src.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = Math.sin(i * 0.01 * (c + 1)) * 0.5; }
    let maxGap = 0, last = performance.now(), run = true;
    const tick = () => { const n = performance.now(); maxGap = Math.max(maxGap, n - last); last = n; if (run) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const t0 = performance.now();
    const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: len, sampleRate: sr });
    for (let t = 0; t < secs; t += 10) { const s = ctx.createBufferSource(); s.buffer = src; const g = ctx.createGain(); s.connect(g).connect(ctx.destination); s.start(t); }
    let suspends = 0;
    for (let k = 1; k < 20; k++) { const at = (secs * k) / 20; ctx.suspend(at).then(() => { suspends++; ctx.resume(); }); }
    const rendered = await ctx.startRendering();
    const t1 = performance.now();
    const raw = [0, 1].map((i) => rendered.getChannelData(i));
    const channels = raw.map((d) => { const o = new Float32Array(d.length); for (let i = 0; i < d.length; i++) o[i] = Math.min(8388607 / 8388608, Math.max(-1, d[i])); return o; });
    const t2 = performance.now();
    const bytes = sfx.encodeSfxWav({ sampleRate: sr, channels });
    const t3 = performance.now();
    await new Promise((r) => setTimeout(r, 300));
    run = false; po.disconnect();
    return { renderMs: Math.round(t1 - t0), clampMs: Math.round(t2 - t1), encodeMs: Math.round(t3 - t2), bytes: bytes.byteLength, suspends, longTasks, maxFrameGapMs: Math.round(maxGap) };
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
