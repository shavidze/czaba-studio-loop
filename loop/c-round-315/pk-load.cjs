// C315 PK-LOAD: production build, fresh context per load. Wraps window.Worker (no delay), taps every connect() to
// the AudioContext destination with an AnalyserNode, records AudioBufferSourceNode.start calls.
// Usage: node pk-load.cjs <baseURL> <WxH> <runs> <out.json> [--play]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const [base, vp, runsArg, out, playFlag] = process.argv.slice(2);
const [w, h] = vp.split('x').map(Number); const runs = Number(runsArg);
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = { base, vp, loads: [] };
  for (let i = 0; i < runs; i += 1) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await ctx.addInitScript(() => {
      const log = []; window.__c315Workers = log; const Native = window.Worker;
      window.Worker = class extends Native { constructor(url, o) { super(url, o); const e = { url: String(url).split('/').pop(), created: Math.round(performance.now()), terminated: null }; log.push(e); const t = this.terminate.bind(this); this.terminate = () => { if (e.terminated === null) e.terminated = Math.round(performance.now()); t(); }; } };
      window.__c315Starts = [];
      const nativeStart = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...a) { window.__c315Starts.push({ t: Math.round(performance.now()), dur: this.buffer ? Number(this.buffer.duration.toFixed(3)) : null, ch: this.buffer ? this.buffer.numberOfChannels : null }); return nativeStart.apply(this, a); };
      const nativeConnect = AudioNode.prototype.connect;
      window.__c315Analysers = new Map();
      AudioNode.prototype.connect = function (dest, ...rest) {
        if (dest instanceof AudioDestinationNode) { const c = dest.context; let an = window.__c315Analysers.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; window.__c315Analysers.set(c, an); } nativeConnect.call(this, an); }
        return nativeConnect.call(this, dest, ...rest);
      };
      window.__c315Level = () => { let peak = 0; for (const an of window.__c315Analysers.values()) { const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); for (const v of d) peak = Math.max(peak, Math.abs(v)); } return peak; };
    });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    const t0 = Date.now();
    await p.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const samples = [];
    let readyText = false;
    while (Date.now() - t0 < 30000) {
      const s = await p.evaluate(() => {
        const opts = [...document.querySelectorAll('[role="option"][data-source-id]')];
        return { ready: opts.filter((o) => o.getAttribute('draggable') === 'true').length, total: opts.length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '' };
      });
      samples.push(s.ready);
      if (/^Demo collection ready/.test(s.status)) readyText = true;
      if (readyText && s.ready === s.total && s.total > 0 && samples.length > 5) { break; }
      await p.waitForTimeout(100);
    }
    await p.waitForTimeout(2500);
    const after = await p.evaluate(() => {
      const opts = [...document.querySelectorAll('[role="option"][data-source-id]')];
      return { ids: opts.map((o) => o.getAttribute('data-source-id')), ready: opts.filter((o) => o.getAttribute('draggable') === 'true').length, loadingText: opts.filter((o) => /Loading/i.test(o.textContent)).length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '', previewWaveRects: document.querySelectorAll('[data-testid="arrangement-library-preview-wave"] rect').length, workers: window.__c315Workers };
    });
    let drop = false; let max = 0; for (const v of samples) { if (v < max) drop = true; max = Math.max(max, v); }
    const r = { run: i + 1, msToSettled: Date.now() - t0, readyDropDuringLoad: drop, readySamplesTail: samples.slice(-3), ...after, startsBeforePlay: await p.evaluate(() => window.__c315Starts.length) };
    if (playFlag === '--play') {
      await p.getByRole('button', { name: 'Add', exact: true }).click(); await p.waitForTimeout(800);
      r.clips = await p.locator('[data-clip-kind="audio"]').count();
      await p.getByRole('button', { name: 'Play', exact: true }).click();
      await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
      const lv = []; for (let k = 0; k < 15; k += 1) { await p.waitForTimeout(200); lv.push(Number((await p.evaluate(() => window.__c315Level())).toFixed(4))); }
      r.levelsWhilePlaying = lv; r.startsAfterPlay = await p.evaluate(() => window.__c315Starts);
      await p.keyboard.press('Space'); await p.waitForTimeout(300);
    }
    r.errors = errs;
    await p.screenshot({ path: path.join(path.dirname(out), 'shots', `pkload-${path.basename(out, '.json')}-${i + 1}.png`) });
    res.loads.push(r); console.log(JSON.stringify({ run: r.run, ready: r.ready, total: r.ids.length, drop: r.readyDropDuringLoad, wave: r.previewWaveRects, workers: r.workers, errs: errs.length, clips: r.clips, lvMax: r.levelsWhilePlaying ? Math.max(...r.levelsWhilePlaying) : null }));
    await ctx.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); await b.close();
})();
