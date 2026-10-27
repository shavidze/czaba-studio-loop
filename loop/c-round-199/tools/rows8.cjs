const X = require('./lib122.cjs'); const { L, sleep } = X; const crypto = require('crypto');
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const sha = (s) => crypto.createHash('sha256').update(s || '').digest('hex').slice(0, 16);
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[^\d.\-]/g, ''));
function parseD(d) { const re = /M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g; const c = []; let m; while ((m = re.exec(d))) c.push({ y: +m[2], ys: m[2], y2: +m[3] }); return c; }
function ratio(w0, w1, s) {
  const r = { s: +s.toFixed(6), judged: 0, clamped: 0, floor: 0, unjudged: 0, violations: [] };
  if (!w0 || !w1 || !w0.d || !w1.d) { r.valid = false; r.reason = 'missing drawing'; return r; }
  const a = parseD(w0.d), b = parseD(w1.d);
  if (a.length !== b.length || w0.cols !== w1.cols) { r.valid = false; r.reason = `column count differs ${a.length}/${b.length}`; return r; }
  let maxErr = 0, overEdge = 0;
  for (let i = 0; i < a.length; i++) { const h0 = 1 - a[i].y, h = 1 - b[i].y; if (b[i].y < 0 || b[i].y2 > 2) overEdge++;
    if (h0 >= 0.021 && h0 <= 0.999 && s * h0 >= 0.021 && s * h0 <= 0.999) { r.judged++; const e = Math.abs(h - s * h0); maxErr = Math.max(maxErr, e); if (e > 0.0006 * (1 + s) + 1e-12) r.violations.push({ i, kind: 'ratio', h0, h }); }
    else if (h0 <= 0.999 && s * (h0 - 0.0005) >= 1) { r.clamped++; if (b[i].ys !== '0.000') r.violations.push({ i, kind: 'clamp', y: b[i].ys }); }
    else if (s * (h0 + 0.0005) < 0.02) { r.floor++; if (b[i].ys !== '0.980') r.violations.push({ i, kind: 'floor', y: b[i].ys }); } else r.unjudged++; }
  r.maxErr = +maxErr.toFixed(6); r.overEdge = overEdge; r.violations = r.violations.slice(0, 5); r.valid = r.judged >= 10; r.pass = r.valid && r.violations.length === 0 && overEdge === 0; return r;
}
const wave = (p, cid) => p.evaluate((cid) => { const s = document.querySelector(`[data-clip-id="${cid}"] [data-testid="arrangement-clip-waveform"]`); const pa = s && s.querySelector('path'); return s ? { d: pa ? pa.getAttribute('d') : null, cols: +s.getAttribute('viewBox').split(' ')[2] } : null; }, cid);
const detailWave = (p) => p.evaluate(() => { const c = document.querySelector('[data-testid="arrangement-detail-waveform"]'); const s = c && c.querySelector('svg'); if (!s) return null; const pa = s.querySelector('path'); return { d: pa ? pa.getAttribute('d') : null, cols: +s.getAttribute('viewBox').split(' ')[2] }; });
const F = '[data-testid=arrangement-detail-clip-gain-fader]', FI = '[data-testid=arrangement-detail-clip-gain-input]';
const cg = (p) => p.evaluate(([F, FI]) => { const f = document.querySelector(F), fi = document.querySelector(FI); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); const rg = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]') || [...document.querySelectorAll('[id]')].find((e) => fi && (fi.getAttribute('aria-describedby') || '').split(' ').includes(e.id)); return { v: f ? f.value : null, text: f && f.getAttribute('aria-valuetext'), field: fi ? fi.value : null, undo: u && u.getAttribute('title'), range: rg ? rg.textContent.trim() : null }; }, [F, FI]);
async function setup(p, video) {
  await L.setSnapOff(p); if (video) await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  for (const [s, ln, t] of [['demo-synth-mix', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  return Object.fromEntries((await L.clipsDom(p)).map((c) => [c.lane, c]));
}
async function chooseZoom(p, level) {
  const SEL = '[data-testid=arrangement-waveform-zoom]'; const LEVELS = ['0.5', '1', '2', '4', '8']; await L.blur(p);
  const cur = await p.$eval(SEL, (s) => s.value); const diff = LEVELS.indexOf(String(level)) - LEVELS.indexOf(cur);
  const b = await p.locator(SEL).boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(250);
  for (let i = 0; i < Math.abs(diff); i++) { await p.keyboard.press(diff > 0 ? 'ArrowDown' : 'ArrowUp'); await sleep(80); }
  await p.keyboard.press('Enter'); await sleep(300); const value = await p.$eval(SEL, (s) => s.value); await L.blur(p);
  return { value, method: 'mouse click opens popup + ArrowDown + Enter', status: await L.status(p) };
}
const rows = {
  async 'RG-T1'(p, res) {
    const o = await setup(p, false); await L.selectClip(p, o.stems.id); await X.openDetail(p);
    res.s0 = await cg(p); await p.locator(F).focus(); res.seq = [];
    for (let k = 0; k < 3; k++) { await p.keyboard.press('ArrowUp'); await sleep(200); res.seq.push(await cg(p)); }
    const fb = await p.locator(F).boundingBox(); await p.mouse.dblclick(fb.x + fb.width / 2, fb.y + fb.height / 2); await sleep(400); res.dbl = await cg(p);
    res.undos = []; for (let k = 0; k < 4; k++) { await L.blur(p); await p.keyboard.press('Control+z'); await sleep(350); res.undos.push(await cg(p)); }
    const vals = res.seq.map((s) => num(s.field)); const fv = res.seq.map((s) => +s.v);
    res.checks = { steps: vals.join() === '0.1,0.2,0.3', sync: res.seq.every((s) => Math.abs(+s.v - num(s.field)) < 1e-9 && s.text.includes(s.field.replace('-', '−'))), entryEach: res.seq.every((s) => s.undo === 'Undo: Clip Gain'), dbl: num(res.dbl.field) === 0 && +res.dbl.v === 0 && res.dbl.undo === 'Undo: Clip Gain', undoChain: res.undos.map((u) => num(u.field)).join() === '0.3,0.2,0.1,0' };
  },
  async 'RG-T2'(p, res) {
    const o = await setup(p, false); await X.openDetail(p);
    const setF = async (txt) => { await p.fill(FI, txt); await p.locator(FI).press('Enter'); await sleep(250); await L.blur(p); await sleep(200); };
    await L.selectClip(p, o.stems.id); await setF('-6'); await L.selectClip(p, o.sfx.id); await setF('0');
    await L.selectClip(p, o.stems.id); await L.selectClip(p, o.sfx.id, ['Shift']); res.sel = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);
    res.m0 = await cg(p);
    // Shift fine drag: 84 dB span over fader width; fine = 1/10; dx for +3.0
    const fb = await p.locator(F).boundingBox(); const per = 84 / fb.width / 10; const dx = 3 / per;
    const x0 = fb.x + ((+res.m0.v + 60) / 84) * fb.width, y = fb.y + fb.height / 2;
    await p.keyboard.down('Shift'); await p.mouse.move(x0, y); await p.mouse.down(); await sleep(60); const n = 30; for (let k = 1; k <= n; k++) await p.mouse.move(x0 + (dx * k) / n, y); await sleep(60); await p.mouse.up(); await p.keyboard.up('Shift'); await sleep(300); await L.blur(p);
    res.dx = +dx.toFixed(3); res.m1 = await cg(p); res.st = await L.status(p);
    const readOne = async (c) => { const lb = await p.evaluate(() => document.querySelector('[data-track-id="video"]').getBoundingClientRect().toJSON()); await p.mouse.click(await X.tx(p, 12), lb.top + lb.height / 2); await sleep(300); await L.selectClip(p, c.id); const r = await cg(p); return r.field === '' ? NaN : num(r.field); };
    res.after = { stems: await readOne(o.stems), sfx: await readOne(o.sfx) };
    await L.selectClip(p, o.stems.id); await L.selectClip(p, o.sfx.id, ['Shift']);
    await L.blur(p); await p.keyboard.press('Control+z'); await sleep(350); res.mu = await cg(p);
    res.undone = { stems: await readOne(o.stems), sfx: await readOne(o.sfx) };
    res.checks = { two: res.sel === 2, mixedBefore: /−6\.0 … \+0\.0 dB|−6\.0 … 0\.0 dB/.test(res.m0.range || res.m0.text || ''), raised: res.after.stems === -3 && res.after.sfx === 3, mixedAfter: /−3\.0 … \+3\.0 dB/.test(res.m1.range || res.m1.text || ''), oneUndo: res.undone.stems === -6 && res.undone.sfx === 0 };
  },
  async 'RG-T4A'(p, res) {
    const o = await setup(p, false); await L.selectClip(p, o.stems.id); await X.openDetail(p);
    const w0 = await wave(p, o.stems.id), d0 = await detailWave(p);
    await p.fill(FI, '-6'); await p.locator(FI).press('Enter'); await sleep(400); await L.blur(p); await sleep(300);
    const w6 = await wave(p, o.stems.id), d6 = await detailWave(p); res.g = await cg(p);
    const s = 10 ** (num(res.g.field) / 20); res.lane = ratio(w0, w6, s); res.detail = ratio(d0, d6, s);
    await X.shot(p, `${res.id}-minus6.png`);
    await p.keyboard.press('Control+z'); await sleep(400); const wu = await wave(p, o.stems.id), du = await detailWave(p);
    res.sha = { w0: sha(w0.d), w6: sha(w6.d), wu: sha(wu.d), d0: sha(d0 && d0.d), du: sha(du && du.d) };
    res.checks = { s: Math.abs(s - 0.501187) < 1e-6, lane: res.lane.pass, detail: res.detail.pass, changed: res.sha.w0 !== res.sha.w6, undoExact: res.sha.wu === res.sha.w0 && res.sha.du === res.sha.d0 };
  },
  async 'RG-T4B'(p, res) {
    const o = await setup(p, true);
    const W1 = { stems: await wave(p, o.stems.id), music: await wave(p, o.music.id), video: await wave(p, o.video.id) };
    res.choose = await chooseZoom(p, 2); res.attr = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom);
    const W2 = { stems: await wave(p, o.stems.id), music: await wave(p, o.music.id), video: await wave(p, o.video.id) };
    res.r = { stems: ratio(W1.stems, W2.stems, 2), music: ratio(W1.music, W2.music, 2) };
    res.videoD = { has: !!(W1.video && W1.video.d), same: (W1.video && W1.video.d) === (W2.video && W2.video.d) };
    await X.shot(p, `${res.id}-2x.png`);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(2500);
    res.after = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-waveform-zoom]'); return { attr: document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom, value: s.value, shown: s.options[s.selectedIndex].textContent.trim() }; });
    res.checks = { chose2: res.choose.value === '2' && res.attr === '2', ratio: res.r.stems.pass && res.r.music.pass, videoSame: res.videoD.same, reload: res.after.attr === '1' && res.after.value === '1' && res.after.shown === '1×' };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, (k, v) => (k === 'd' ? undefined : v), 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
