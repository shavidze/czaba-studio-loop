// C round 143 — CLIP-GAIN-AUDIO: real output RMS through an analyser tapped at the AudioDestination.
// node audio142.cjs <1440|1280> <tag> <runs>
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || `r${Date.now()}`;
const RUNS = +process.argv[4] || 1;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const OUTF = path.join(L.OUT, `audio143-${W}-${TAG}.json`);
const sleep = L.sleep;
const net = [];
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), runs: [], invalidRuns: [] };
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
function tapInit() {
  const W0 = window; W0.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = oc.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) { const c = this.context; let an = W0.__tap.an.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W0.__tap.an.set(c, an); } oc.call(this, an); } } catch (e) { W0.__tap.err = String(e); }
    return r;
  };
  W0.__tapStart = () => {
    W0.__tap.on = true; W0.__tap.S = []; const buf = new Float32Array(2048);
    const tick = () => {
      if (!W0.__tap.on) return;
      let peak = 0, ss = 0, n = 0;
      for (const an of W0.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; ss += buf[i] * buf[i]; n++; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      W0.__tap.S.push({ t: performance.now(), peak, rms: n ? Math.sqrt(ss / n) : 0, pos: h ? +h.getAttribute('aria-valuenow') : NaN });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  W0.__tapStop = () => { W0.__tap.on = false; return W0.__tap.S; };
}
const db = (v) => (v > 0 ? +(20 * Math.log10(v)).toFixed(2) : -200);
(async () => {
  const b = await L.launch();
  const O = await L.openStudio(b, VP, `audio143-${W}-${TAG}`, net, { extraInit: tapInit });
  const p = O.page;
  res.snap = await L.setSnapOff(p);
  async function seekExact(t) { await L.blur(p); await p.keyboard.press('Home'); await sleep(200); if (t > 0) { await p.focus('[data-testid=arrangement-playhead-handle]'); for (let i = 0; i < Math.round(t * 10); i++) await p.keyboard.press('ArrowRight'); await sleep(250); } await L.blur(p); return L.posNow(p); }
  async function rmsWin(from, dur, w0, w1) {
    const pos = await seekExact(from);
    await p.evaluate(() => window.__tapStart());
    await p.keyboard.press('Space'); await sleep(dur * 1000); await p.keyboard.press('Space'); await sleep(300);
    const S = await p.evaluate(() => window.__tapStop());
    const win = S.filter((f) => f.pos >= w0 && f.pos <= w1);
    const ms = win.length ? win.reduce((a, f) => a + f.rms * f.rms, 0) / win.length : 0;
    return { pos, frames: S.length, winFrames: win.length, rmsDb: db(Math.sqrt(ms)), peakDb: db(win.reduce((a, f) => Math.max(a, f.peak), 0)), firstPos: (S.find((f) => f.pos > from) || {}).pos };
  }
  // only clip in the project: Middle East on Music at 0
  await p.click(L.nameSel('music')); await sleep(200); await seekExact(0);
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded(); await o.focus(); await p.keyboard.press('Enter'); await sleep(900); await L.blur(p);
  const clips = await L.clipsDom(p); res.clips = clips;
  const tg = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); await sleep(600); }
  const gi = '[data-testid=arrangement-detail-clip-gain-input]';
  for (let r = 0; r < RUNS; r++) {
    const run = { r };
    run.base = await rmsWin(1.0, 2.4, 1.3, 3.0);
    await L.selectClip(p, clips[0].id);
    await p.click(gi, { clickCount: 3 }); await p.keyboard.type('-20'); await p.keyboard.press('Enter'); await sleep(400);
    run.statusSet = await L.status(p); run.inputSet = await p.inputValue(gi); await L.blur(p);
    run.cut = await rmsWin(1.0, 2.4, 1.3, 3.0);
    await L.selectClip(p, clips[0].id);
    await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(400);
    run.statusReset = await L.status(p); run.inputReset = await p.inputValue(gi); await L.blur(p);
    run.restored = await rmsWin(1.0, 2.4, 1.3, 3.0);
    run.drop = +(run.base.rmsDb - run.cut.rmsDb).toFixed(2); run.restoreDelta = +(run.restored.rmsDb - run.base.rmsDb).toFixed(2);
    run.valid = run.base.winFrames >= 20 && run.cut.winFrames >= 20 && run.restored.winFrames >= 20 && run.base.rmsDb > -60;
    run.pass = run.valid && Math.abs(run.drop - 20) <= 1 && Math.abs(run.restoreDelta) <= 1;
    (run.valid ? res.runs : res.invalidRuns).push(run); save();
    console.log(JSON.stringify(run));
  }
  res.tapErr = await p.evaluate(() => window.__tap.err || null);
  await O.ctx.close(); await b.close(); res.endedUtc = new Date().toISOString(); save();
})().catch((e) => { console.error(e); res.fatal = String(e); save(); process.exit(1); });
