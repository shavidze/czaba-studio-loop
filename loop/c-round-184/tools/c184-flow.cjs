// C round 184 — informational flow smoke (not an acceptance row): find sound -> add -> video -> play (audio tap) -> export WAV -> parse.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +(process.argv[2] || 1440); const TAG = `c184-flow-${W}`; const ROOT = path.join(__dirname, '..'); const OUT = path.join(ROOT, 'out'); const SHD = path.join(ROOT, 'shots'); const net = []; const res = { W, utc: new Date().toISOString() };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { extraInit: X.tapInit }); const p = o.page;
    res.lanes = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId));
    res.sources = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.dataset.sourceId));
    res.clips0 = await L.clipsDom(p);
    await L.setSnapOff(p);
    const lane = res.lanes.find((l) => /music/.test(l)) || res.lanes[0];
    res.add = await L.addAt(p, res.sources[0], lane, 2);
    res.clips1 = await L.clipsDom(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.clips2 = await L.clipsDom(p);
    await p.screenshot({ path: path.join(SHD, `${TAG}-arranged.png`) });
    await L.seekTo(p, 0);
    await p.evaluate(() => window.__tapStart());
    await L.blur(p); await p.keyboard.press('Space'); const t0 = Date.now(); await sleep(3000);
    res.posDuring = await L.posNow(p); res.videoT = await p.evaluate(() => { const v = document.querySelector('video'); return v ? { t: v.currentTime, paused: v.paused, rs: v.readyState } : null; });
    await p.keyboard.press('Space'); res.wallMs = Date.now() - t0; await sleep(300);
    const S = await p.evaluate(() => window.__tapStop()); res.tap = { samples: S.length, maxPeak: Math.max(0, ...S.map((s) => s.peak)), nonzero: S.filter((s) => s.peak > 1e-4).length };
    res.posAfter = await L.posNow(p);
    const ex = await X.exportWav(p, o.log, TAG, { scope: 'project', format: 'wav' });
    res.export = { recs: ex.recs, files: ex.files.map((f) => path.relative(ROOT, f)), status: ex.st1 && ex.st1.status };
    if (ex.files[0]) { const w = X.wav(ex.files[0]); res.wav = { sha: w.sha, fmt: w.fmt, frames: w.frames, seconds: w.seconds, peak: w.peak, rms: w.rms, nan: w.nan, riff: w.w.riff, win_0_2: X.winStats(w.w, 0, 1.9), win_2_4: X.winStats(w.w, 2.1, 4) }; }
    res.clipsEnd = await L.clipsDom(p);
  } catch (e) { res.error = String((e && e.stack) || e).slice(0, 1200); }
  await b.close(); res.net = net.map((n) => ({ e: n.errors, h: n.hydration, f: n.forbidden, a: n.authHeaders, noise: n.noise, dl: n.downloads }));
  L.save(OUT, `${TAG}.json`, res); const { net: _n, ...brief } = res; console.log(JSON.stringify(brief, null, 1).slice(0, 5000)); console.log(JSON.stringify(res.net));
})();
