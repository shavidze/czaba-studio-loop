const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
async function iso(p) {
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-synth-mix', 'music', 0], [process.env.STEM || 'demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await X.muteLanes(p, ['music', 'sfx']);
  return (await L.clipsDom(p)).find((c) => c.lane === 'stems');
}
const info = (w) => ({ sha: w.sha, sr: w.fmt.sr, bits: w.fmt.bits, ch: w.fmt.ch, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(6), rms: +w.rms.toFixed(6), nan: w.nan });
const rel = (f) => f.replace(/.*c-round-122\//, 'c-round-122/');
const rows = {
  async 'RG-15'(p, res, log) {
    const rulerTxt = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').textContent.replace(/\s+/g, ' ').slice(0, 300));
    res.r0 = await rulerTxt();
    const t = p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('90'); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p);
    res.r1 = await rulerTxt();
    res.bars = await p.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-bars-ruler]'); const r = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); if (!b) return null; const bb = b.getBoundingClientRect(); return { text: b.textContent.replace(/\s+/g, ' ').slice(0, 120), top: bb.top, rulerBottom: r.bottom, h: bb.height, visible: bb.height > 0 && bb.width > 0 }; });
    res.noStretch = await p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-tempo-input]'); const near = t.closest('div'); const all = [t.getAttribute('title'), t.getAttribute('aria-description'), near && near.getAttribute('title'), ...[...document.querySelectorAll('[title],[aria-description]')].map((e) => (e.getAttribute('title') || '') + ' ' + (e.getAttribute('aria-description') || ''))].filter(Boolean); return [...new Set(all.filter((s) => /stretch|არ იჭიმ|არ იცვლ|warp|ტემპ/i.test(s)))].slice(0, 4); });
    res.status = await L.status(p);
    await X.shot(p, `${res.id}-bars.png`);
    if (vp === '1440') {
      await iso(p);
      await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(300); res.metOn = await p.locator('[data-testid=arrangement-metronome-toggle]').getAttribute('aria-pressed');
      const eA = await X.exportWav(p, log, `${res.id}-met-on`); res.dlgOn = (eA.st0.text || '').match(/მეტრონომ[^.]*\./g);
      await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(300); res.metOff = await p.locator('[data-testid=arrangement-metronome-toggle]').getAttribute('aria-pressed');
      const eB = await X.exportWav(p, log, `${res.id}-met-off`);
      const a = X.wav(eA.files[0]), b2 = X.wav(eB.files[0]); res.eOn = info(a); res.eOff = info(b2); res.maxLsb = X.maxLsb(a.w, b2.w).max; res.bytesSame = a.buf.equals(b2.buf); res.files = [...eA.files, ...eB.files].map(rel);
    }
    res.checks = { bars: !!res.bars && res.bars.visible && /1/.test(res.bars.text) && /2/.test(res.bars.text) && /3/.test(res.bars.text) && res.bars.top >= res.bars.rulerBottom - 1, secondsUnchanged: res.r0 === res.r1, noStretch: res.noStretch.length > 0 };
    if (vp === '1440') Object.assign(res.checks, { metToggle: res.metOn === 'true' && res.metOff === 'false', exportSame: res.bytesSame || res.maxLsb <= 1 });
  },
  async 'RG-18'(p, res, log) {
    const st = await iso(p);
    const e0 = await X.exportWav(p, log, `${res.id}-nofade`);
    const b = await X.clipBox(p, st.id); await p.mouse.move(b.x + b.width / 2, b.y + b.height * 0.7, { steps: 3 }); await sleep(300);
    const h = await p.locator(`[data-clip-id="${st.id}"] [data-testid=arrangement-clip-fade-in-handle]`).boundingBox();
    const g = await L.geo(p); const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
    await p.mouse.move(hx, hy, { steps: 2 }); await sleep(100); await p.mouse.down(); await p.mouse.move(hx + g.pps / 2, hy, { steps: 5 }); await p.mouse.move(hx + g.pps, hy, { steps: 5 }); await sleep(150); await p.mouse.up(); await sleep(400);
    res.fadeIn = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeIn, st.id); res.st = await L.status(p);
    await X.shot(p, `${res.id}-fade.png`);
    const e1 = await X.exportWav(p, log, `${res.id}-fade`);
    const a = X.wav(e0.files[0]), f = X.wav(e1.files[0]); const S = 2, F = +res.fadeIn;
    res.q = [0, 1, 2, 3].map((k) => ({ fade: +X.winStats(f.w, S + k * F / 4, S + (k + 1) * F / 4).rms.toFixed(6), ref: +X.winStats(a.w, S + k * F / 4, S + (k + 1) * F / 4).rms.toFixed(6) }));
    const sr = 48000; const skip = (fr) => fr >= Math.floor(S * sr) && fr < Math.ceil((S + 1.01) * sr);
    res.outside = X.maxLsb(a.w, f.w, 0, 0, null, skip); res.inside = X.maxLsb(a.w, f.w, Math.floor(S * sr), Math.floor(S * sr), sr).max;
    res.gainQ = res.q.map((x) => +(x.fade / x.ref).toFixed(4));
    { const ch = a.fmt.ch; const g = []; for (let k = 0; k < 20; k++) { let sf = 0, sa = 0; for (let fr = Math.floor((S + k * 0.05) * sr); fr < Math.floor((S + (k + 1) * 0.05) * sr); fr++) for (let c = 0; c < ch; c++) { sf += Math.abs(f.w.read(fr * ch + c)); sa += Math.abs(a.w.read(fr * ch + c)); } g.push(sa > 0 ? +(sf / sa).toFixed(4) : null); } res.gain20 = g; }
    res.stem = process.env.STEM || 'demo-stem-pulse';
    res.e0 = info(a); res.e1 = info(f); res.files = [...e0.files, ...e1.files].map(rel);
    res.checks = { fade1: Math.abs(F - 1) <= 0.0251, rising: res.q.every((x, i) => i === 0 || x.fade > res.q[i - 1].fade), gainRising: res.gain20.every((x, i) => i === 0 || (x !== null && x >= res.gain20[i - 1])) && res.gain20[0] < 0.1 && res.gain20[19] > 0.9, changed: res.inside > 1000, outside: res.outside.max <= 1 };
    res.note = 'quarter windows over [S, S+fadeIn]; "rising" is strict monotonic of the faded export RMS';
  },
  async 'RG-T3A'(p, res, log) {
    const st = await iso(p);
    const VOL = '[data-track-id="stems"] input[type=range][aria-label^="Volume"]';
    const read = () => p.evaluate((sel) => { const s = document.querySelector(sel); return { value: s.value, min: s.min, text: s.getAttribute('aria-valuetext'), readout: s.nextElementSibling ? s.nextElementSibling.textContent : null }; }, VOL);
    res.v0 = await read(); const b = await p.locator(VOL).boundingBox(); const x0 = b.x + b.width / 2, y = b.y + b.height / 2;
    await p.mouse.move(x0, y); await p.mouse.down(); await sleep(60); for (let k = 1; k <= 30; k++) await p.mouse.move(x0 - k * 12, y); await sleep(100); await p.mouse.up(); await sleep(300); await L.blur(p);
    res.v1 = await read(); res.st = await L.status(p);
    await X.shot(p, `${res.id}-inf.png`);
    const e = await X.exportWav(p, log, `${res.id}-inf`); const w = X.wav(e.files[0]);
    res.win = X.winStats(w.w, 2, 18); res.all = info(w); res.files = e.files.map(rel);
    res.checks = { readoutInf: /−∞|-∞/.test(res.v1.readout || '') , stored0: res.v1.value === '-60' && res.v1.min === '-60', silent: res.win.nz === 0 && w.frames > 0 };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net, { extraInit: X.tapInit }); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
