const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const L = require('./pwlib.cjs');
eval(fs.readFileSync(path.join(__dirname, 'analyse.part'), 'utf8').replace('function analyse', 'global.analyse = function'));

const VP = process.argv[2] || '1440x900';
const SESSION = process.argv[3] || 'silent';
const ROWS = (process.argv[4] || 'all').split(',');
const TAG = process.argv[5] || '';
const want = (id) => ROWS.includes('all') || ROWS.includes(id);
const log = L.logger('mt71-' + VP + '-' + SESSION + '-' + ROWS.join('_') + (TAG ? '-' + TAG : ''));
const results = [];
const verdict = (id, pass, detail) => { results.push({ id, pass }); log('VERDICT', id, pass ? 'PASS' : 'FAIL', typeof detail === 'string' ? detail : JSON.stringify(detail)); };

const INPUT = '[data-testid=arrangement-tempo-input]';
const TOG = '[data-testid=arrangement-metronome-toggle]';
const FORBID = /studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/;
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
const parsePos = (t) => { const m = /(\d+):(\d+(?:\.\d+)?)/.exec(t || ''); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; };
const dbNum = (s) => (!s || s === '-inf' ? -60 : Number(s));
const DETECTOR = 'INFO-C69-METER-POST-ACCENT: onset when level >= -15 dB and level - runMin >= 3 dB and >= 250 ms (wall) since the previous onset; runMin tracks the level during the 250 ms refractory, then the running minimum; peak = max level within 150 ms after onset; 10 ms DOM sampler of data-level-db on arrangement-master-meter; tolerance 0.15 s';

async function go(page) {
  const t0 = Date.now();
  await page.goto(L.URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 60000 });
  log('ENV-EXT-LOAD-HANG: domcontentloaded + selector after', Date.now() - t0, 'ms; then 4 s');
  await L.sleep(4000);
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await L.sleep(300);
}

async function st(page) {
  return page.evaluate(([inp, tog]) => {
    const t = document.querySelector(tog);
    const s = document.querySelector('[data-testid=arrangement-status]');
    const g = document.querySelector('[data-testid=arrangement-grid-control]');
    const undo = Array.from(document.querySelectorAll('button')).find((b) => /^Undo/.test(b.getAttribute('title') || ''));
    const lt = document.querySelector('[data-testid=arrangement-loop-times]');
    const mp = document.querySelector('[data-testid=arrangement-master-peak]');
    return {
      tog: t ? { disabled: t.disabled, pressed: t.getAttribute('aria-pressed') } : null,
      status: s ? s.textContent.trim() : null, input: document.querySelector(inp).value,
      snap: g.dataset.snap, grid: g.dataset.gridSeconds, undo: undo ? undo.getAttribute('title') : null,
      pos: (document.querySelector('[data-testid=arrangement-position]') || {}).textContent,
      loop: lt ? lt.textContent.trim() : null, masterPeak: mp ? [mp.textContent.trim(), mp.dataset.state] : null,
      zoom: (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent,
    };
  }, [INPUT, TOG]);
}

async function clickEl(page, sel) {
  const b = await page.locator(sel).first().boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await L.sleep(120);
}
async function typeBpm(page, text) {
  await clickEl(page, INPUT);
  await page.keyboard.press('Control+a');
  if (text === '') await page.keyboard.press('Backspace'); else await page.keyboard.type(text, { delay: 20 });
  await page.keyboard.press('Enter');
  await L.sleep(250);
}
async function setSnap(page, on) { await blur(page); const s = await st(page); if ((s.snap === 'on') !== on) { await page.keyboard.press('g'); await L.sleep(150); } }
async function rulerPoint(page, t) {
  const r = await page.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); return { left: e.left, y: e.top + e.height - 4 }; });
  return { x: r.left + t * (await L.pps(page)), y: r.y };
}
async function seek(page, t) {
  await blur(page);
  await page.keyboard.press('Home');
  await L.sleep(300);
  if (t === 0) return (await st(page)).pos;
  const p = await rulerPoint(page, t);
  const vw = await page.evaluate(() => innerWidth);
  if (p.x < 0 || p.x > vw) log('SEEK WARNING ruler point off-screen', t, p.x, vw);
  await page.mouse.click(p.x, p.y);
  await L.sleep(250);
  return (await st(page)).pos;
}
async function isPlaying(page) { const a = (await st(page)).pos; await L.sleep(300); const b = (await st(page)).pos; return a !== b; }
const toggleTo = async (page, on) => { const s = await st(page); if ((s.tog.pressed === 'true') !== on) await clickEl(page, TOG); await blur(page); };

async function startSampler(page) {
  await page.evaluate(() => {
    const w = window;
    if (w.__c71s) clearInterval(w.__c71s.id);
    const pos = document.querySelector('[data-testid=arrangement-position]');
    const met = document.querySelector('[data-testid=arrangement-master-meter]');
    const rows = [];
    const id = setInterval(() => { rows.push([performance.now(), pos.textContent, met.getAttribute('data-level-db')]); }, 10);
    w.__c71s = { id, rows };
  });
}
const readSampler = (page) => page.evaluate(() => { const w = window; clearInterval(w.__c71s.id); return w.__c71s.rows.slice(); });
async function waitPos(page, t, maxMs = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) { const p = parsePos((await st(page)).pos); if (p >= t) return p; await L.sleep(15); }
  return NaN;
}
function onsets(rows) {
  const parsed = rows.map((r) => ({ t: r[0], pos: parsePos(r[1]), db: dbNum(r[2]) }));
  const out = [];
  let runMin = parsed.length ? parsed[0].db : -60;
  let last = null;
  for (let i = 0; i < parsed.length; i++) {
    const r = parsed[i];
    const inRefractory = last !== null && r.t - last.t < 250;
    if (!inRefractory && r.db >= -15 && r.db - runMin >= 3) {
      let peak = r.db;
      for (let j = i; j < parsed.length && parsed[j].t - r.t <= 150; j++) peak = Math.max(peak, parsed[j].db);
      out.push({ pos: +r.pos.toFixed(3), wall: +r.t.toFixed(1), db: r.db, peak, from: runMin });
      last = r;
      runMin = r.db;
    } else if (inRefractory) {
      runMin = r.db;
    } else {
      runMin = Math.min(runMin, r.db);
    }
  }
  let backwards = 0;
  for (let i = 1; i < parsed.length; i++) if (parsed[i].pos < parsed[i - 1].pos - 1e-6) backwards++;
  return { rises: out, n: parsed.length, backwards, parsed };
}
const near = (list, t, tol = 0.15) => list.filter((r) => Math.abs(r.pos - t) <= tol);
function matchBeats(rs, expected, tol = 0.15) {
  const matched = expected.map((t) => ({ t, hit: near(rs, t, tol) }));
  const extra = rs.filter((r) => !expected.some((t) => Math.abs(r.pos - t) <= tol));
  return { allHit: matched.every((m) => m.hit.length === 1), missing: matched.filter((m) => m.hit.length !== 1).map((m) => [m.t, m.hit.length]), matched: matched.map((m) => [m.t, m.hit.map((h) => [h.pos, h.peak])]), extra: extra.map((r) => [r.pos, r.db, r.peak]) };
}
function accentCheck(rs, accents, others) {
  const acc = accents.map((t) => near(rs, t)[0]).filter(Boolean).map((r) => r.peak);
  const non = others.map((t) => near(rs, t)[0]).filter(Boolean).map((r) => r.peak);
  const diff = acc.length && non.length ? +(Math.min(...acc) - Math.max(...non)).toFixed(1) : null;
  return { ok: acc.length === accents.length && non.length === others.length && diff !== null && diff >= 4, diff, acc, non };
}

async function playWindow(page, fromT, untilPos, opts = {}) {
  if (fromT !== null) await seek(page, fromT);
  await blur(page);
  await startSampler(page);
  await page.keyboard.press('Space');
  if (opts.during) await opts.during();
  const reached = await waitPos(page, untilPos, (untilPos - (fromT || 0)) * 1000 + 20000);
  const rows = await readSampler(page);
  await blur(page);
  if (!opts.noStop) { await page.keyboard.press('Space'); await L.sleep(400); }
  const r = onsets(rows);
  log('WINDOW', JSON.stringify({ fromT, untilPos, reached, n: r.n, backwards: r.backwards, firstPos: r.parsed[0] && r.parsed[0].pos, lastPos: r.parsed.length && r.parsed[r.parsed.length - 1].pos, rises: r.rises.map((x) => [x.pos, x.db, x.peak]) }));
  return r;
}

async function drag(page, id, track, t) {
  const opt = page.locator('[role=option][data-source-id="' + id + '"]');
  await opt.scrollIntoViewIfNeeded();
  const t0 = Date.now();
  while (Date.now() - t0 < 60000 && (await opt.getAttribute('draggable')) !== 'true') await L.sleep(200);
  const ob = await opt.boundingBox();
  const lb = await L.laneBox(page, track);
  const x = Math.round(lb.x + t * (await L.pps(page)));
  const y = lb.y + lb.h / 2;
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
  await page.mouse.down();
  await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await page.mouse.move(x, y, { steps: 14 });
  await L.sleep(300);
  await page.mouse.up();
  await L.sleep(600);
  return { status: (await st(page)).status, x };
}
const clips = (page) => page.evaluate(() => {
  const z = Number((/([\d.]+)/.exec((document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent || '') || [])[1]);
  return Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => [e.closest('[data-track-id]').getAttribute('data-track-id'), e.getAttribute('data-clip-start'), +(Number(e.getAttribute('data-clip-start')) + e.getBoundingClientRect().width / z).toFixed(3), e.textContent.trim().slice(0, 20)]);
});

async function zoomOutToFit(page, endT) {
  for (let i = 0; i < 30; i++) {
    const lb = await L.laneBox(page, 'music');
    const z = await L.pps(page);
    const vw = await page.evaluate(() => innerWidth);
    if (lb.x + endT * z < vw - 30) break;
    await blur(page); await page.keyboard.press('-'); await L.sleep(250);
  }
  return L.pps(page);
}

async function fixtureSilent(page) {
  await setSnap(page, true);
  let lb = await L.laneBox(page, 'sfx');
  let z = await L.pps(page);
  const visRight = await page.evaluate(() => innerWidth);
  let guard = 0;
  while (lb.x + 21 * z > visRight - 40 && guard++ < 10) { await blur(page); await page.keyboard.press('-'); await L.sleep(250); z = await L.pps(page); lb = await L.laneBox(page, 'sfx'); }
  const r = await drag(page, 'demo-soft-impact', 'sfx', 20);
  const c = await clips(page);
  log('F-SILENT drop (REAL-mouse PW)', JSON.stringify(r), JSON.stringify(c), 'pps', z);
  return c;
}
async function fixtureLongSilent(page) {
  await setSnap(page, true);
  const r = await drag(page, 'demo-middle-east', 'music', 1);
  const mMute = page.locator('[data-track-id=music] button[title=Mute]').first();
  const mb = await mMute.boundingBox();
  await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await L.sleep(200);
  const c = await clips(page);
  const sfxClip = c.some((x) => x[0] === 'sfx');
  const end = Math.max(...c.map((x) => x[2]));
  const loopStrip = await page.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-loop-strip]'); return e ? e.style.width : null; });
  log('F-LONG-SILENT drop (REAL-mouse PW)', JSON.stringify(r), 'music Mute aria-pressed', await mMute.getAttribute('aria-pressed'), 'sfx clip', sfxClip, 'clips', JSON.stringify(c), 'end', end, 'loop-strip width', loopStrip, 'pps', await L.pps(page));
  return { clips: c, end, muted: (await mMute.getAttribute('aria-pressed')) === 'true' };
}

const cbs = (page) => page.evaluate(() => window.__cbs.slice());
function bursts(times, gap = 30) {
  const out = [];
  for (const t of times) { if (out.length && t - out[out.length - 1].last < gap) { const b = out[out.length - 1]; b.n++; b.last = t; } else out.push({ first: t, last: t, n: 1 }); }
  return out;
}
async function perfProbe(page) {
  await page.evaluate(() => {
    const w = window; w.__c71lt = []; w.__c71gap = 0; let last = performance.now();
    try { if (!w.__c71po) { w.__c71po = new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__c71lt.push([+e.startTime.toFixed(0), +e.duration.toFixed(0)]); }); w.__c71po.observe({ type: 'longtask', buffered: false }); } } catch (e) { w.__c71lt.push(['unsupported', String(e)]); }
    if (w.__c71raf) cancelAnimationFrame(w.__c71raf);
    const tick = () => { const n = performance.now(); w.__c71gap = Math.max(w.__c71gap, n - last); last = n; w.__c71raf = requestAnimationFrame(tick); };
    w.__c71raf = requestAnimationFrame(tick);
  });
}

async function nodesRow(page, bpmOn) {
  const startReadout = await seek(page, 0);
  log('MH-NODES start readout', startReadout);
  await blur(page);
  await page.evaluate(() => { window.__c71kd = null; window.addEventListener('keydown', (e) => { if (e.code === 'Space' && window.__c71kd === null) window.__c71kd = performance.now(); }, { capture: true, once: true }); });
  await page.keyboard.press('Space');
  await L.sleep(3300);
  const kd = await page.evaluate(() => window.__c71kd);
  const all = await cbs(page);
  await blur(page); await page.keyboard.press('Space'); await L.sleep(400);
  const after = all.filter((t) => t >= kd);
  const c05 = after.filter((t) => t <= kd + 500).length;
  const c3 = after.filter((t) => t <= kd + 3000).length;
  log('MH-NODES', bpmOn ? 'on' : 'off', JSON.stringify({ keydown: kd, upTo0_5s: c05, upTo3s: c3, bursts: bursts(after.filter((t) => t <= kd + 3000)).map((b) => [+(b.first - kd).toFixed(0), b.n]) }));
  return { c05, c3 };
}

async function scrubPerf(page, on) {
  await toggleTo(page, on);
  const sr = await seek(page, 5);
  log('MH-SCRUB-PERF start readout', sr);
  await blur(page); await page.keyboard.press('Space'); await L.sleep(900);
  await perfProbe(page);
  await page.evaluate(() => { window.__c71lt = []; window.__c71gap = 0; });
  const hb = await page.locator('[data-testid=arrangement-playhead-handle]').boundingBox();
  const z = await L.pps(page);
  const x0 = hb.x + hb.width / 2; const y = hb.y + hb.height / 2;
  const tStart = await page.evaluate(() => performance.now());
  const w0 = Date.now();
  await page.mouse.move(x0, y); await page.mouse.down();
  let i = 0;
  while (Date.now() - w0 < 5000) { i++; const phase = (i % 40) / 40; const off = (phase < 0.5 ? phase : 1 - phase) * 2 * 8 * z; await page.mouse.move(x0 + off, y); await L.sleep(25); }
  await page.mouse.up();
  const tEnd = await page.evaluate(() => performance.now());
  const all = await cbs(page);
  const r = await page.evaluate(() => ({ longtasks: window.__c71lt.slice(), maxGap: +window.__c71gap.toFixed(1) }));
  await L.sleep(300);
  await blur(page); await page.keyboard.press('Space'); await L.sleep(400);
  const during = all.filter((t) => t >= tStart && t <= tEnd + 50);
  const b = bursts(during);
  const perBurst = b.map((x) => x.n);
  const out = { metronome: on ? 'on' : 'off', scrubMs: +(tEnd - tStart).toFixed(0), moves: i, total: during.length, bursts: b.length, maxPerBurst: Math.max(0, ...perBurst), perBurstHist: perBurst.reduce((m, n) => { m[n] = (m[n] || 0) + 1; return m; }, {}), longtasks: r.longtasks, longtaskCount: r.longtasks.length, longtaskMax: Math.max(0, ...r.longtasks.map((x) => (typeof x[1] === 'number' ? x[1] : 0))), maxFrameGap: r.maxGap };
  log('MH-SCRUB-PERF', JSON.stringify(out));
  return out;
}

function decode(buf) {
  let o = 12; let fmt = null; let off = 0; let size = 0;
  while (o + 8 <= buf.length) { const id = buf.toString('ascii', o, o + 4); const sz = buf.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { format: buf.readUInt16LE(o + 8), ch: buf.readUInt16LE(o + 10), sr: buf.readUInt32LE(o + 12), bits: buf.readUInt16LE(o + 22) }; if (id === 'data') { off = o + 8; size = Math.min(sz, buf.length - off); break; } o += 8 + sz + (sz % 2); }
  const step = fmt.bits / 8; const n = Math.floor(size / step);
  const read = (i) => (fmt.bits === 24 ? buf.readIntLE(off + i * step, 3) : fmt.bits === 16 ? buf.readInt16LE(off + i * step) : fmt.format === 3 ? buf.readFloatLE(off + i * step) : buf.readInt32LE(off + i * step));
  return { fmt, n, read };
}
function compareWav(a, b) {
  const A = decode(a); const B = decode(b);
  let maxDelta = 0; const n = Math.min(A.n, B.n);
  for (let i = 0; i < n; i++) { const d = Math.abs(A.read(i) - B.read(i)); if (d > maxDelta) maxDelta = d; }
  return { fmtEqual: JSON.stringify(A.fmt) === JSON.stringify(B.fmt), samples: [A.n, B.n], maxDeltaLsb: maxDelta };
}
function zerosBefore(buf, seconds) {
  const D = decode(buf); const lim = Math.min(D.n, Math.floor(seconds * D.fmt.sr) * D.fmt.ch);
  let nonzero = 0; let first = -1; let maxAbs = 0;
  for (let i = 0; i < lim; i++) { const v = D.read(i); if (v !== 0) { nonzero++; if (first < 0) first = Math.floor(i / D.fmt.ch); maxAbs = Math.max(maxAbs, Math.abs(v)); } }
  return { checkedFrames: lim / D.fmt.ch, nonzero, firstNonzeroFrame: first, maxAbsLsb: maxAbs };
}
async function exportWav(page, name) {
  await blur(page);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.waitForSelector('#arrangement-export-title', { timeout: 10000 });
  const dlP = page.waitForEvent('download', { timeout: 180000 });
  await page.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click();
  const dl = await dlP;
  const out = path.join(L.OUT, 'runs', `export-${VP}-${name}.wav`);
  await dl.saveAs(out);
  await L.sleep(500);
  await page.keyboard.press('Escape');
  await L.sleep(300);
  const buf = fs.readFileSync(out);
  const a = global.analyse(buf);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  log('EXPORT', name, 'bytes', buf.length, 'sha256', sha, JSON.stringify(a));
  return { name, buf, a, sha, file: out };
}

async function sessionSilent(page) {
  const fx = await fixtureSilent(page);
  await typeBpm(page, '40');
  const s1 = await st(page);
  log('after BPM 40', JSON.stringify(s1));
  if (want('beats')) {
    await toggleTo(page, true);
    const rb = await playWindow(page, 0, 13.0);
    const mb = matchBeats(rb.rises, [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12]);
    const ac = accentCheck(rb.rises, [0, 6, 12], [1.5, 3, 4.5, 7.5, 9, 10.5]);
    verdict('MT-BEATS*' + VP, mb.allHit && mb.extra.length === 0 && ac.ok, { mb, ac, n: rb.n, backwards: rb.backwards });
  }
  if (want('off')) {
    await toggleTo(page, false);
    const ro = await playWindow(page, 0, 8.0);
    const maxDb = Math.max(...ro.parsed.map((p) => p.db));
    verdict('MT-OFF', ro.rises.length === 0 && maxDb <= -60, { rises: ro.rises.length, maxDb, n: ro.n, posRange: [ro.parsed[0] && ro.parsed[0].pos, ro.parsed.length && ro.parsed[ro.parsed.length - 1].pos] });
  }
  if (want('seek')) {
    await toggleTo(page, true);
    let seekAt = null; let landed = null;
    const rs = await playWindow(page, 0, 10.6, { during: async () => { await waitPos(page, 5.2); seekAt = await page.evaluate(() => performance.now()); const p = await rulerPoint(page, 7.0); await page.mouse.click(p.x, p.y); await L.sleep(40); landed = (await st(page)).pos; } });
    const after = rs.rises.filter((r) => r.wall > seekAt);
    const before = rs.rises.filter((r) => r.wall <= seekAt);
    const firstTwo = after.slice(0, 2).map((r) => r.pos);
    verdict('MT-SEEK', firstTwo.length === 2 && Math.abs(firstTwo[0] - 7.5) <= 0.15 && Math.abs(firstTwo[1] - 9.0) <= 0.15 && after.every((r, i) => i === 0 || r.pos - after[i - 1].pos >= 1.0), { landedReadout: landed, before: before.map((r) => r.pos), after: after.map((r) => [r.pos, r.peak]) });
  }
  if (want('toggle')) {
    await toggleTo(page, false);
    const marks = {};
    const rl = await playWindow(page, 0, 11.0, { during: async () => {
      await waitPos(page, 3.7); marks.on = { wall: await page.evaluate(() => performance.now()), pos: parsePos((await st(page)).pos) }; await clickEl(page, TOG); marks.onPressed = (await st(page)).tog.pressed;
      await waitPos(page, 8.0); marks.off = { wall: await page.evaluate(() => performance.now()), pos: parsePos((await st(page)).pos) }; await clickEl(page, TOG); marks.offPressed = (await st(page)).tog.pressed;
    } });
    const before = rl.rises.filter((r) => r.wall < marks.on.wall);
    const between = rl.rises.filter((r) => r.wall >= marks.on.wall && r.wall < marks.off.wall);
    const afterOff = rl.rises.filter((r) => r.wall >= marks.off.wall + 60);
    const bm = matchBeats(between, [4.5, 6.0, 7.5]);
    verdict('MT-LIVE-TOGGLE', before.length === 0 && bm.allHit && bm.extra.length === 0 && afterOff.length === 0 && rl.backwards === 0, { marks, before: before.map((r) => r.pos), between: bm, afterOff: afterOff.map((r) => r.pos), backwards: rl.backwards });
    await blur(page);
  }
  if (want('tempo')) {
    await toggleTo(page, true);
    const tc = {};
    const rt = await playWindow(page, 0, 8.2, { during: async () => {
      await waitPos(page, 2.2); tc.pos = parsePos((await st(page)).pos);
      await clickEl(page, INPUT); await page.keyboard.press('Control+a'); await page.keyboard.type('60', { delay: 15 }); await page.keyboard.press('Enter');
      tc.done = await page.evaluate(() => performance.now()); tc.donePos = parsePos((await st(page)).pos);
    } });
    const sT = await st(page);
    const afterTc = rt.rises.filter((r) => r.wall > tc.done);
    const exp60 = [3, 4, 5, 6, 7, 8].filter((t) => t > tc.donePos + 0.05 && t <= 8.05);
    const tm = matchBeats(afterTc, exp60);
    const firstNew = afterTc.length ? afterTc[0].pos : null;
    verdict('MT-TEMPO-CHANGE', firstNew !== null && firstNew - tc.donePos <= 1.0 + 0.15 && tm.allHit && tm.extra.length === 0 && sT.tog.pressed === 'true', { tc, before: rt.rises.filter((r) => r.wall <= tc.done).map((r) => r.pos), after: afterTc.map((r) => [r.pos, r.peak]), tm, status: sT.status, tog: sT.tog });
    await typeBpm(page, '40');
    await blur(page);
  }
  if (want('export')) {
    await toggleTo(page, false);
    const a = await exportWav(page, 'a-off');
    await typeBpm(page, '120');
    await toggleTo(page, true);
    const sOn = await st(page);
    log('export b state', JSON.stringify(sOn.tog), sOn.status);
    const pr = await playWindow(page, 0, 2.2);
    log('live clicks at 120 before export b (sanity: metronome audible live)', JSON.stringify(pr.rises.map((r) => [r.pos, r.peak])));
    const b = await exportWav(page, 'b-on120');
    const cmp = compareWav(a.buf, b.buf);
    const za = zerosBefore(a.buf, 20); const zb = zerosBefore(b.buf, 20);
    const eqRule = a.a.frames === b.a.frames && a.a.nan === 0 && b.a.nan === 0 && cmp.fmtEqual && ((a.a.full === b.a.full && a.a.rms === b.a.rms) || cmp.maxDeltaLsb <= 1);
    verdict('MT-EXPORT-REG', eqRule && cmp.maxDeltaLsb <= 1 && za.nonzero === 0 && zb.nonzero === 0 && pr.rises.length >= 3, { sha: [a.sha, b.sha], byteIdentical: a.sha === b.sha, frames: [a.a.frames, b.a.frames], seconds: [a.a.seconds, b.a.seconds], fmt: a.a.fmt, nan: [a.a.nan, b.a.nan], full: [a.a.full, b.a.full], rms: [a.a.rms, b.a.rms], peak: [a.a.peak, b.a.peak], firstAudible: [a.a.firstAboveThrSec, b.a.firstAboveThrSec], cmp, zerosBefore20s: [za, zb], liveRisesAt120: pr.rises.length });
    await typeBpm(page, '40');
    await blur(page);
  }
  if (want('loop')) {
    await toggleTo(page, true);
    log('MT-LOOP fixture deviation: range selection needs a clip (empty lane: status asks to select on a waveform); drop Middle East muted on music at 0 as in C round 66', JSON.stringify(await drag(page, 'demo-middle-east', 'music', 0)));
    { const mm = page.locator('[data-track-id=music] button[title=Mute]').first(); const bb = await mm.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await L.sleep(200); log('music Mute', await mm.getAttribute('aria-pressed'), JSON.stringify(await clips(page))); }
    await setSnap(page, true);
    const music = await L.laneBox(page, 'music');
    const z = await L.pps(page);
    await L.realDrag(page, music.x + 2 * z + 2, music.y + music.h * 0.75, music.x + 5 * z + 2, music.y + music.h * 0.75);
    log('after range drag status', (await st(page)).status);
    await blur(page);
    await page.keyboard.press('Control+l');
    await L.sleep(300);
    const sLoop = await st(page);
    log('MT-LOOP loop', sLoop.loop, 'status', sLoop.status);
    const r = await playWindow(page, 2, 99, { during: async () => { await L.sleep(10500); } });
    const lr = r.rises;
    const wraps = r.parsed.reduce((n, p, i, a) => n + (i > 0 && p.pos < a[i - 1].pos - 1 ? 1 : 0), 0);
    const at3 = lr.filter((x) => Math.abs(x.pos - 3) <= 0.15).length;
    const at45 = lr.filter((x) => Math.abs(x.pos - 4.5) <= 0.15).length;
    const other = lr.filter((x) => Math.abs(x.pos - 3) > 0.15 && Math.abs(x.pos - 4.5) > 0.15);
    const iters = wraps + 1;
    verdict('MT-LOOP', /00:02\.000/.test(sLoop.loop || '') && /00:05\.000/.test(sLoop.loop || '') && wraps >= 3 && at3 >= wraps && at45 >= wraps && at3 <= iters && at45 <= iters && other.length === 0, { loop: sLoop.loop, wraps, at3, at45, other: other.map((x) => [x.pos, x.db]), rises: lr.map((x) => [x.pos, x.peak]) });
    await blur(page);
    await page.keyboard.press('Control+l');
    await L.sleep(300);
  }
  return fx;
}

async function sessionLong(page) {
  const fx = await fixtureLongSilent(page);
  log('F-LONG-SILENT project end (clip end)', fx.end);
  if (want('long')) {
    await typeBpm(page, '60');
    await toggleTo(page, true);
    const r = await playWindow(page, 0, 30.0);
    const exp = Array.from({ length: 30 }, (_, k) => k);
    const lastSampled = r.parsed.length ? r.parsed[r.parsed.length - 1].pos : 0;
    const optional30 = r.rises.filter((x) => Math.abs(x.pos - 30) <= 0.15 && lastSampled >= 29.85);
    const mb = matchBeats(r.rises.filter((x) => !optional30.includes(x)), exp);
    log('MH-LONG window', JSON.stringify({ firstPos: r.parsed[0] && r.parsed[0].pos, lastSampled, optionalBeat30: optional30.map((x) => [x.pos, x.peak]) }));
    const ac = accentCheck(r.rises, [0, 4, 8, 12, 16, 20, 24, 28], exp.filter((k) => k % 4 !== 0));
    verdict('MH-LONG', r.parsed.length > 0 && r.parsed[0].pos <= 0.05 && fx.muted && mb.allHit && mb.extra.length === 0 && ac.ok, { mb: { allHit: mb.allHit, missing: mb.missing, extra: mb.extra, count: r.rises.length }, accent: { ok: ac.ok, diff: ac.diff }, n: r.n, backwards: r.backwards });
  }
  if (want('scrub')) {
    await typeBpm(page, '60');
    await toggleTo(page, true);
    const mk = {};
    const r = await playWindow(page, 0, 27.5, { during: async () => {
      await waitPos(page, 3.0);
      mk.posBeforeDown = parsePos((await st(page)).pos);
      const hb = await page.locator('[data-testid=arrangement-playhead-handle]').boundingBox();
      const target = await rulerPoint(page, 20);
      const x0 = hb.x + hb.width / 2; const y = hb.y + hb.height / 2;
      mk.handleX = +x0.toFixed(1); mk.targetX = +target.x.toFixed(1); mk.vw = await page.evaluate(() => innerWidth);
      mk.down = await page.evaluate(() => performance.now());
      await page.mouse.move(x0, y); await page.mouse.down();
      for (let i = 1; i <= 20; i++) { await page.mouse.move(x0 + ((target.x - x0) * i) / 20, y); await L.sleep(100); }
      await page.mouse.up();
      mk.up = await page.evaluate(() => performance.now());
      mk.posAfterUp = parsePos((await st(page)).pos);
    } });
    const after = r.rises.filter((x) => x.wall > mk.up + 30);
    const during = r.rises.filter((x) => x.wall >= mk.down && x.wall <= mk.up + 30);
    const span = after.length ? after[after.length - 1].pos - after[0].pos : 0;
    const offGrid = after.filter((x) => Math.abs(x.pos - Math.round(x.pos)) > 0.15);
    const burst = after.filter((x, i) => i > 0 && x.wall - after[i - 1].wall < 500);
    const firstWhole = Math.ceil(mk.posAfterUp + 0.05);
    const expAfter = []; for (let t = firstWhole; t <= 27; t++) expAfter.push(t);
    const mb = matchBeats(after, expAfter);
    verdict('MH-SCRUB', r.parsed.length > 0 && r.parsed[0].pos <= 0.05 && mk.posBeforeDown < 4 && mk.handleX > 0 && mk.handleX < mk.vw && Math.abs(mk.posAfterUp - 20) <= 1 && after.length >= 5 && span >= 5 - 0.3 && offGrid.length === 0 && burst.length === 0 && mb.allHit && mb.extra.length === 0, { marks: { scrubMs: +(mk.up - mk.down).toFixed(0), posBeforeDown: mk.posBeforeDown, handleX: mk.handleX, targetX: mk.targetX, vw: mk.vw, posAfterUp: mk.posAfterUp }, firstPos: r.parsed[0] && r.parsed[0].pos, during: during.map((x) => x.pos), after: after.map((x) => [x.pos, x.peak]), mb: { missing: mb.missing, extra: mb.extra }, offGrid: offGrid.map((x) => x.pos), burst: burst.map((x) => x.pos), backwards: r.backwards });
  }
  if (want('nodes')) {
    await typeBpm(page, '999');
    await toggleTo(page, true);
    const on = await nodesRow(page, true);
    await toggleTo(page, false);
    const off = await nodesRow(page, false);
    verdict('MH-NODES*' + VP, on.c05 <= 120 && on.c3 <= 200, { on, off });
  }
  if (want('scrubperf')) {
    await typeBpm(page, '999');
    const on = await scrubPerf(page, true);
    const off = await scrubPerf(page, false);
    verdict('MH-SCRUB-PERF', on.total <= 5000 && on.maxPerBurst <= 80, { on, off });
  }
  if (want('end')) {
    await typeBpm(page, '40');
    await toggleTo(page, true);
    await setSnap(page, false);
    const z = await zoomOutToFit(page, fx.end);
    const target = fx.end - 6;
    const p0 = await seek(page, target);
    const p = parsePos(p0);
    log('MH-END seek', JSON.stringify({ target, readout: p0, p, end: fx.end, pps: z, snap: (await st(page)).snap }));
    const r = await playWindow(page, null, fx.end + 3, { noStop: true });
    await L.sleep(1500);
    const playingAfter = await isPlaying(page);
    const sE = await st(page);
    const exp = []; for (let k = Math.ceil((p - 1e-6) / 1.5); k * 1.5 < fx.end - 1e-6; k++) exp.push(+(k * 1.5).toFixed(3));
    const mb = matchBeats(r.rises, exp);
    const atOrAfterEnd = r.rises.filter((x) => x.pos >= fx.end - 0.05 && !exp.some((t) => Math.abs(x.pos - t) <= 0.15));
    const lastPos = r.parsed.length ? r.parsed[r.parsed.length - 1].pos : NaN;
    const finalPos = parsePos(sE.pos);
    verdict('MH-END', mb.allHit && mb.extra.length === 0 && atOrAfterEnd.length === 0 && !playingAfter && Math.abs(finalPos - fx.end) <= 0.05, { p, end: fx.end, expected: exp, mb, atOrAfterEnd: atOrAfterEnd.map((x) => x.pos), playingAfter, finalReadout: sE.pos, lastSampledPos: lastPos });
  }
  return fx;
}

(async () => {
  const { browser, context, page, consoleLines, requests } = await L.open(VP);
  await context.addInitScript(() => {
    const w = window; w.__cbs = [];
    const wrap = (proto) => { if (!proto || typeof proto.createBufferSource !== 'function' || proto.createBufferSource.__c71) return; const orig = proto.createBufferSource; const f = function (...a) { w.__cbs.push(performance.now()); return orig.apply(this, a); }; f.__c71 = true; proto.createBufferSource = f; };
    wrap(window.BaseAudioContext && window.BaseAudioContext.prototype);
    wrap(window.AudioContext && window.AudioContext.prototype);
  });
  log('MT71', VP, SESSION, ROWS.join(','), new Date().toISOString(), 'fresh PW context (installed chromium), no credentials; REAL-mouse (PW) drags/clicks/keys; instrumentation (PW): createBufferSource counter via addInitScript; in-page read-only DOM sampler');
  log('DETECTOR', DETECTOR);
  try {
    await go(page);
    const wrapped = await page.evaluate(() => ({ base: !!(window.BaseAudioContext && window.BaseAudioContext.prototype.createBufferSource.__c71), cbs: window.__cbs.length }));
    log('instrumentation installed', JSON.stringify(wrapped));
    const hyd = consoleLines.filter((l) => /hydrat|did not match|server rendered/i.test(l));
    log('REG-HYD console lines on load', consoleLines.length, 'hydration-like', JSON.stringify(hyd));
    results.push({ id: 'REG-HYD-' + VP + '-' + SESSION, pass: hyd.length === 0 });
    if (SESSION === 'long') await sessionLong(page); else await sessionSilent(page);
    await page.screenshot({ path: path.join(L.OUT, 'shots', `mt71-${VP}-${SESSION}-${ROWS.join('_')}${TAG ? '-' + TAG : ''}.png`) });
  } catch (e) { log('ERROR', e && e.stack ? e.stack.slice(0, 900) : String(e)); results.push({ id: 'SCRIPT-ERROR', pass: false }); }
  const bad = requests.filter((q) => FORBID.test(q.url));
  const hosts = [...new Set(requests.map((q) => { try { return new URL(q.url).host; } catch { return q.url.slice(0, 30); } }))];
  const auth = requests.filter((q) => q.auth);
  log('NET total', requests.length, 'forbidden', bad.length, JSON.stringify(bad.map((q) => q.url).slice(0, 5)), 'withAuth', auth.length, JSON.stringify(auth.map((q) => q.url).slice(0, 5)), 'hosts', JSON.stringify(hosts));
  results.push({ id: 'G71-3-NET-' + VP + '-' + SESSION, pass: bad.length === 0 && auth.length === 0 });
  log('CONSOLE errors', JSON.stringify(consoleLines.filter((l) => /^\[(error|pageerror)\]/.test(l)).map((l) => l.slice(0, 160)).slice(0, 12)));
  log('RESULTS', JSON.stringify(results));
  await browser.close();
})();
