const X = require('./lib122.cjs'); const { L, sleep } = X;
const RUN = process.argv[2] || '1'; const id = `RG-03-1440`;
(async () => {
  const b = await L.launch(); const net = []; const res = { id, run: RUN };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[1440], `${id}-${RUN}`, net);
    await L.setSnapOff(p); await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    await L.addAt(p, 'demo-synth-mix', 'music', 0);
    res.tbl = await X.clipTable(p);
    await L.blur(p); await p.keyboard.press('Home'); await sleep(400);
    await p.evaluate(() => window.__hStart()); await sleep(150);
    await p.keyboard.press('Space'); const tPlay = await p.evaluate(() => performance.now());
    await sleep(5000);
    // mute toggle during play (still within 0–6.008 clip)
    const mb = p.locator('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]');
    const before = await p.evaluate(() => { const v = document.querySelector('video[data-video-role=active]'); return { muted: v.muted, paused: v.paused }; });
    const tM0 = await p.evaluate(() => performance.now());
    await mb.click(); await sleep(250);
    const m1 = await p.evaluate(() => { const v = document.querySelector('video[data-video-role=active]'); return { muted: v.muted, paused: v.paused, pressed: document.querySelector('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]').getAttribute('aria-pressed') }; });
    await mb.click(); await sleep(250);
    const m2 = await p.evaluate(() => { const v = document.querySelector('video[data-video-role=active]'); return { muted: v.muted, paused: v.paused, pressed: document.querySelector('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]').getAttribute('aria-pressed') }; });
    const tM1 = await p.evaluate(() => performance.now());
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    await p.evaluate(() => window.__hStop());
    const raw = await p.evaluate(() => ({ S: window.__h.samples, loaf: window.__h.loaf, dock: window.__h.dock, q0: window.__h.q0, q1: window.__h.q1 }));
    const S = raw.S.filter((s) => Number.isFinite(s.pos) && s.vt != null);
    const p0 = S[0].pos;
    const play = S.filter((s) => s.t >= tPlay && s.t < tM0 && s.pos > p0 && s.pos < 5.99);
    // stall windows: LoAF blocking > 50ms covering sample, or pos frozen > 300 ms
    const stall = (s) => raw.loaf.some((l) => s.t >= l.start && s.t <= l.start + l.dur + 50 && l.blocking > 50);
    const d = play.map((s) => ({ t: s.t, pos: s.pos, vt: s.vt, d: s.vt - s.pos, stall: stall(s) }));
    const abs = (a) => a.map((x) => Math.abs(x.d)).sort((x, y) => x - y);
    const med = (a) => (a.length ? a[Math.floor(a.length / 2)] : NaN);
    const ex = d.filter((x) => !x.stall);
    res.drift = { n: d.length, nEx: ex.length, rawMedian: +med(abs(d)).toFixed(4), rawMax: +Math.max(...abs(d)).toFixed(4), median: +med(abs(ex)).toFixed(4), max: +Math.max(...abs(ex)).toFixed(4), maxAt: ex.reduce((m, x) => (Math.abs(x.d) > Math.abs(m.d) ? x : m), ex[0]), loafInPlay: raw.loaf.filter((l) => l.start >= tPlay && l.start < tM0).length, appLoaf: raw.loaf.filter((l) => l.start >= tPlay && l.start < tM0 && l.scripts.some((s) => (s.url || '').startsWith('http://127.0.0.1:5173/app/'))).length, dock: raw.dock, q0: raw.q0, q1: raw.q1 };
    const mw = S.filter((s) => s.t >= tM0 - 100 && s.t <= tM1 + 100);
    let mono = true, maxJump = 0, anyPaused = false; for (let i = 1; i < mw.length; i++) { const dd = mw[i].pos - mw[i - 1].pos; if (dd < -1e-9) mono = false; if (dd > maxJump) maxJump = dd; } for (const s of mw) if (s.paused) anyPaused = true;
    res.mute = { before, m1, m2, mono, maxJump: +maxJump.toFixed(4), anyPaused, n: mw.length };
    res.checks = { drift: res.drift.median <= 0.05 && res.drift.max <= 0.1, keepPlaying: !anyPaused && !m1.paused && !m2.paused, mono, jump: maxJump <= 0.1, mutedFollows: m1.muted === true && m2.muted === false && before.muted === false };
    await X.shot(p, `${id}-${RUN}.png`);
    await p.context().close();
  } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}-${RUN}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 3000)); console.log('PASS?', res.pass);
})();
