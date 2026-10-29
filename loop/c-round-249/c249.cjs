// C round 249: independent browser rows for SABA-B-10a stage 1 (Insert Marker).
// usage: node c249.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c249.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/';
const LEAD = 0.05;

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};

const wavInfo = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    if (!Number.isFinite(x)) nan += 1;
    s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a;
  }
  return { bytes: buf.length, rate, bits, ch, frames, seconds: frames / rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

async function open(browser, vp, withPulse = true) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
  await sleep(800);
  if (withPulse) await addPulse(page);
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(900);
  await blur(page);
}
const st = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return {
    t: performance.now(),
    ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    m: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
    playing: !!document.querySelector('button[aria-label="Pause"]'),
    range: !!document.querySelector('[data-testid="arrangement-range"]'),
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.tagName).slice(0, 60) : 'BODY',
    rms: Math.max(0, ...(window.__rms ? window.__rms() : [0])),
  };
});
const geo = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
  const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent);
  const lane = (id) => { const b = document.querySelector(`[data-track-id="${id}"]`)?.getBoundingClientRect(); return b ? { y: b.y, h: b.height } : null; };
  const bars = document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getBoundingClientRect();
  const strip = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')?.getBoundingClientRect();
  return { rx: r.x, ry: r.y, rh: r.height, pps, music: lane('music'), stems: lane('stems'), sfx: lane('sfx'), bars: bars && { y: bars.y, h: bars.height }, strip: strip && { y: strip.y, h: strip.height } };
});
async function ruler(page, s, wait = 900) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g.ry + g.rh / 2); await sleep(wait); }
async function lane(page, id, s, wait = 900) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g[id].y + g[id].h / 2); await sleep(wait); }
async function barsLower(page, s, wait = 900) { const g = await geo(page); const y = g.strip.y + g.strip.h + (g.bars.y + g.bars.h - g.strip.y - g.strip.h) / 2; await page.mouse.click(g.rx + s * g.pps, y); await sleep(wait); }
async function strip(page, s, wait = 400) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g.strip.y + g.strip.h / 2); await sleep(wait); }
async function dragRange(page, id, a, b) { const g = await geo(page); const y = g[id].y + g[id].h / 2; await page.mouse.move(g.rx + a * g.pps, y); await page.mouse.down(); await page.mouse.move(g.rx + ((a + b) / 2) * g.pps, y, { steps: 5 }); await page.mouse.move(g.rx + b * g.pps, y, { steps: 5 }); await page.mouse.up(); await sleep(900); }
async function clipClick(page, s, wait = 900) { const g = await geo(page); const x = g.rx + s * g.pps; const info = await page.evaluate((x) => { const c = [...document.querySelectorAll('[data-clip-id]')].find((e) => { const b = e.getBoundingClientRect(); return b.left < x && b.right > x && b.height > 20; }); if (!c) return null; const b = c.getBoundingClientRect(); return { y: b.y + b.height * 0.5, track: c.closest('[data-track-id]')?.dataset.trackId, id: c.dataset.clipId }; }, x); if (!info) throw new Error('no clip at ' + s); await page.mouse.click(x, info.y); await sleep(wait); return info; }
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const ST_PLAYING = (t) => `Insert marker at ${t} — playback continues. Stop, then Space plays from here.`;
const ST_TOPH = (t) => `Insert marker moved to the playhead (${t}). Space plays from here.`;
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s - m * 60; return `${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`; };

const ROWS = {
  async xLoop(page, k) {
    const r = {};
    await dragRange(page, 'music', 4, 6); await key(page, 'Control+l', 500); r.loop = await page.evaluate(() => document.querySelector('[data-testid=arrangement-loop-times]')?.textContent ?? null);
    await ruler(page, 4.5); r.c = await st(page);
    await key(page, 'Space', 2500); r.p = await st(page);
    await key(page, 'Space'); r.stop = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.restart = await st(page); await key(page, 'Space');
    await shot(page, 'x-loop', k);
    r.pass = r.loop !== null && r.c.m === '4.500' && r.p.playing && r.p.ph >= 4 && r.p.ph < 6.05 && r.restart.ph >= 4.5 && r.restart.ph <= 4.8 + LEAD;
    return r;
  },
  async xPlayheadLine(page) {
    const r = {};
    await ruler(page, 2); await key(page, 'Space', 1500); await key(page, 'Space', 400);
    const line = () => page.evaluate(() => { const l = document.querySelector('[data-testid=arrangement-playhead]'); const ph = Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')); return { left: parseFloat(l.style.left), ph, clock: document.querySelector('[data-testid*=clock], [data-testid*=position-readout]')?.textContent ?? null }; });
    r.afterStop = await line(); r.pps = (await geo(page)).pps;
    r.lineSec = +((r.afterStop.left - (await page.evaluate(() => { const l = document.querySelector('[data-testid=arrangement-playhead]'); return 0; }))) ).toFixed(1);
    await page.keyboard.press('Space'); await sleep(250); r.afterRestart = await line(); await key(page, 'Space');
    r.dLeftPx = +(r.afterStop.left - r.afterRestart.left).toFixed(1);
    r.dPhPx = +((r.afterStop.ph - r.afterRestart.ph) * r.pps).toFixed(1);
    r.pass = Math.abs(r.dLeftPx - r.dPhPx) <= 3;
    return r;
  },
  async xClipDrag(page) {
    const r = {};
    await ruler(page, 3); r.c = await st(page);
    const g = await geo(page); const y = g.music.y + g.music.h * 0.25;
    r.clipBefore = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return Math.round(c.getBoundingClientRect().left); });
    await page.mouse.move(g.rx + 8 * g.pps, y); await page.mouse.down(); await page.mouse.move(g.rx + 9 * g.pps, y, { steps: 6 }); await page.mouse.move(g.rx + 10 * g.pps, y, { steps: 6 }); await page.mouse.up(); await sleep(900);
    r.clipAfter = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return Math.round(c.getBoundingClientRect().left); });
    r.after = await st(page);
    await key(page, 'Control+z', 500); r.undo = await st(page);
    r.moved = r.clipAfter !== r.clipBefore;
    r.pass = r.after.m === '3.000' || r.after.m === null ? 'info' : 'info';
    return r;
  },
  async xUndoNoop(page) {
    const r = {};
    r.titles0 = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'));
    await ruler(page, 2); await key(page, 'Space', 1200); await key(page, 'Space'); await key(page, 'Control+Shift+Space'); await key(page, 'Shift+Space', 400); await key(page, 'Space');
    r.titles1 = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'));
    r.pass = r.titles0 === r.titles1;
    return r;
  },
  async xPreview(page) {
    const r = {};
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(300);
    const t = page.getByTestId('arrangement-library-preview-toggle');
    r.hasToggle = await t.count();
    if (r.hasToggle) { await t.first().click(); await sleep(800); r.previewLabel = await t.first().getAttribute('aria-label'); }
    await blur(page); await page.mouse.click(5, 5); await sleep(200);
    await ruler(page, 2);
    await page.keyboard.press('Space'); await sleep(300); r.p = await st(page);
    if (r.hasToggle) r.previewLabelAfter = await t.first().getAttribute('aria-label');
    await key(page, 'Space');
    r.pass = r.p.playing && r.p.ph >= 2 && r.p.ph < 2.4 && (!r.hasToggle || r.previewLabel !== r.previewLabelAfter);
    return r;
  },
  async restart(page, k) {
    const r = {};
    await ruler(page, 2); r.click = await st(page);
    await key(page, 'Space', 1500); await key(page, 'Space'); r.stop = await st(page);
    await page.keyboard.press('Space');
    const samples = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 320) { samples.push(await st(page)); await sleep(40); }
    r.after250 = samples.find((s, i) => s.t - samples[0].t >= 230) || samples[samples.length - 1];
    r.maxRms300 = Math.max(...samples.map((s) => s.rms));
    await key(page, 'Space'); r.end = await st(page);
    r.pass = r.click.m === '2.000' && r.stop.ph > 3 && r.stop.m === '2.000' && r.after250.ph >= 2.0 && r.after250.ph <= 2.3 + LEAD && r.after250.m === '2.000' && r.maxRms300 > 0.001 && r.end.m === '2.000';
    await shot(page, 'restart', k); return r;
  },
  async shift(page) {
    const r = {};
    await ruler(page, 2);
    await key(page, 'Space', 1500); await key(page, 'Space'); r.stop = await st(page);
    await page.keyboard.press('Shift+Space'); await sleep(250); r.shift = await st(page);
    await key(page, 'Space'); r.end = await st(page);
    const exp = r.stop.ph + 0.25;
    r.delta = +(r.shift.ph - exp).toFixed(3);
    r.pass = r.shift.playing && near(r.shift.ph, exp, 0.05 + LEAD + 0.05) && r.shift.ph > r.stop.ph && r.shift.m === '2.000' && r.end.m === '2.000' && !r.end.playing;
    return r;
  },
  async ctrlShift(page) {
    const r = {};
    await ruler(page, 2);
    await key(page, 'Space', 1500); await key(page, 'Space'); r.stop = await st(page);
    await key(page, 'Control+Shift+Space'); r.cs = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.space = await st(page);
    await sleep(1000); r.beforeCsPlaying = await st(page);
    await page.keyboard.press('Control+Shift+Space'); r.csPlaying = await st(page); await sleep(400); r.csPlaying2 = await st(page);
    await key(page, 'Space'); r.end = await st(page);
    await blur(page); await page.mouse.click(5, 5); await sleep(200);
    await ruler(page, 2); await key(page, 'Space', 1500); await key(page, 'Space'); r.metaStop = await st(page);
    await key(page, 'Meta+Shift+Space'); r.meta = await st(page);
    r.metaNote = 'CDP metaKey on Linux Chromium, not a Mac';
    r.metaOk = r.meta.m === r.metaStop.ph.toFixed(3) && r.meta.status === ST_TOPH(fmt(r.metaStop.ph)) && !r.meta.playing;
    const stopT = r.stop.ph.toFixed(3);
    r.pass = r.cs.m === stopT && r.cs.status === ST_TOPH(fmt(r.stop.ph)) && !r.cs.playing && r.space.playing && near(r.space.ph, r.stop.ph + 0.25, 0.05 + LEAD + 0.05)
      && r.csPlaying.playing && Math.abs(Number(r.csPlaying.m) - r.csPlaying.ph) < 0.1 && Number(r.csPlaying.m) > r.beforeCsPlaying.ph - 0.01 && r.csPlaying2.playing && r.csPlaying2.ph > r.csPlaying.ph
      && r.csPlaying.status === ST_TOPH(fmt(Number(r.csPlaying.m)));
    return r;
  },
  async ctrlShiftFocus(page, k) {
    const r = { tabs: 0 };
    await page.mouse.click(5, 5); await sleep(200);
    for (let i = 0; i < 120; i += 1) {
      await page.keyboard.press('Tab'); r.tabs += 1;
      const lab = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      if (lab === 'Play') break;
    }
    const focusInfo = () => page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { label: a.getAttribute('aria-label'), fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` }; });
    r.before = { ...(await st(page)), focus: await focusInfo() };
    await key(page, 'Control+Shift+Space', 600);
    r.after = { ...(await st(page)), focus: await focusInfo() };
    await shot(page, 'ctrlshift-focus', k);
    // variant: Shift released before Space (reviewer M1)
    await page.keyboard.down('Control'); await page.keyboard.down('Shift'); await page.keyboard.down('Space'); await page.keyboard.up('Shift'); await page.keyboard.up('Space'); await page.keyboard.up('Control'); await sleep(600);
    r.afterShiftFirst = { ...(await st(page)), focus: await focusInfo() };
    await page.keyboard.down('Control'); await page.keyboard.down('Shift'); await page.keyboard.down('Space'); await page.keyboard.up('Control'); await page.keyboard.up('Space'); await page.keyboard.up('Shift'); await sleep(600);
    r.afterCtrlFirst = { ...(await st(page)), focus: await focusInfo() };
    const ok = (x) => !x.playing && x.focus.label === 'Play' && x.focus.fv && !x.focus.outline.startsWith('none');
    r.pass = r.before.focus.label === 'Play' && ok(r.after) && ok(r.afterShiftFirst) && ok(r.afterCtrlFirst);
    return r;
  },
  async clickPlaying(page, k) {
    const r = {};
    await ruler(page, 1);
    await key(page, 'Space', 700); r.p0 = await st(page);
    const steps = [['lane', () => lane(page, 'sfx', 6, 900), 6], ['clip', async () => { r.clipInfo = await clipClick(page, 11, 900); }, 11], ['ruler', () => ruler(page, 8, 900), 8], ['bars', () => barsLower(page, 4, 900), 4]];
    r.steps = [];
    let prev = r.p0;
    for (const [name, fn, s] of steps) {
      const b = await st(page);
      await fn();
      const a = await st(page);
      const elapsed = (a.t - b.t) / 1000;
      const exp = b.ph + elapsed;
      r.steps.push({ name, s, before: b.ph, after: a.ph, expectedNoJump: +exp.toFixed(3), playing: a.playing, m: a.m, status: a.status, ok: a.playing && near(a.ph, exp, 0.15) && a.m === s.toFixed(3) && a.status === ST_PLAYING(fmt(s)) });
      prev = a;
    }
    await shot(page, 'click-playing', k);
    await key(page, 'Space'); r.stop = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.restart = await st(page);
    await key(page, 'Space');
    r.pass = r.steps.every((x) => x.ok) && r.restart.ph >= 4 && r.restart.ph <= 4.3 + LEAD && r.stop.ph < 6;
    return r;
  },
  async range(page, k) {
    const r = {};
    await ruler(page, 1); r.c1 = await st(page);
    await dragRange(page, 'music', 5, 7); r.sel = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.s1 = await st(page); await key(page, 'Space'); r.stop1 = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.s2 = await st(page); await key(page, 'Space'); r.stop2 = await st(page);
    await page.keyboard.press('Shift+Space'); await sleep(250); r.shift = await st(page); await key(page, 'Space');
    await shot(page, 'range', k);
    const inRange = (x) => x.ph >= 5 && x.ph <= 5.3 + LEAD;
    r.pass = r.sel.range && inRange(r.s1) && inRange(r.s2) && r.s1.range && r.s2.range && r.stop2.range && near(r.shift.ph, r.stop2.ph + 0.25, 0.15) && r.shift.m === r.c1.m;
    return r;
  },
  async pointRange(page, k) {
    const r = {};
    const fresh = async () => { if ((await st(page)).playing) await key(page, 'Space'); await dragRange(page, 'music', 5, 7); return (await st(page)).range; };
    r.ruler = { had: await fresh() }; await ruler(page, 3); r.ruler.after = await st(page);
    r.handle = { had: await fresh() }; await page.getByTestId('arrangement-playhead-handle').focus(); await key(page, 'ArrowRight'); r.handle.after = await st(page); await blur(page);
    r.strip = { had: await fresh() }; await strip(page, 9); r.strip.after = await st(page); await key(page, 'Space'); r.strip.stop = await st(page); await page.keyboard.press('Space'); await sleep(250); r.strip.restart = await st(page); await key(page, 'Space');
    r.home = { had: await fresh() }; await key(page, 'Home'); r.home.after = await st(page);
    r.cs = { had: await fresh() }; await key(page, 'Control+Shift+Space'); r.cs.after = await st(page);
    await shot(page, 'point-range', k);
    const subs = ['ruler', 'handle', 'strip', 'home', 'cs'];
    r.pass = subs.every((s) => r[s].had && !r[s].after.range) && r.strip.restart.ph >= 9 && r.strip.restart.ph <= 9.3 + LEAD;
    return r;
  },
  async ctrlArrow(page, k) {
    const r = {};
    await ruler(page, 10); await key(page, 'm', 600); await blur(page); await page.mouse.click(5, 5); await sleep(300);
    r.flags = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => e.dataset.markerTime));
    await ruler(page, 1);
    await dragRange(page, 'music', 5, 7); r.sel = await st(page);
    await key(page, 'Control+ArrowRight', 500); r.after = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.space = await st(page); await key(page, 'Space');
    await shot(page, 'ctrl-arrow', k);
    r.pass = r.flags.includes('10.000') && r.after.m !== r.sel.m && r.after.range;
    r.note = `marker ${r.sel.m} -> ${r.after.m}; Space played at ${r.space.ph}`;
    return r;
  },
  async home(page) {
    const r = {};
    await ruler(page, 4); await key(page, 'Space', 1000); r.p = await st(page);
    await key(page, 'Home', 300); r.home = await st(page);
    await ruler(page, 5, 700); r.r5 = await st(page);
    await page.getByRole('button', { name: 'Back to start' }).click(); await sleep(300); r.back = await st(page);
    await key(page, 'Space'); await blur(page);
    await ruler(page, 6); r.stoppedAt6 = await st(page);
    await key(page, 'Home'); r.stoppedHome = await st(page);
    r.pass = r.home.playing && r.home.ph < 0.5 && r.home.m === '0.000' && r.r5.m === '5.000' && r.r5.playing && r.back.playing && r.back.ph < 0.5 && r.back.m === '0.000' && r.stoppedHome.ph === 0 && r.stoppedHome.m === '0.000' && !r.stoppedHome.playing;
    return r;
  },
  async strip(page) {
    const r = {};
    await strip(page, 9, 300); r.s9 = await st(page);
    await sleep(900);
    await strip(page, 12, 300); r.s12 = await st(page);
    await key(page, 'Space');
    r.pass = r.s9.playing && r.s9.ph >= 9 && r.s9.ph <= 9.35 + LEAD && r.s9.m === '9.000' && r.s12.playing && r.s12.ph >= 12 && r.s12.ph <= 12.35 + LEAD && r.s12.m === '12.000';
    return r;
  },
  async flag(page, k) {
    const r = {};
    await ruler(page, 10); await key(page, 'm', 600); await page.mouse.click(5, 5); await sleep(300);
    await ruler(page, 1);
    await dragRange(page, 'music', 5, 7); r.sel = await st(page);
    const flag = page.getByTestId('arrangement-marker').first();
    await flag.dblclick(); await sleep(300); r.dbl = await st(page);
    r.dblFlag = await page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-marker]'); return { current: f.getAttribute('aria-current'), focused: document.activeElement === f }; });
    await key(page, 'Space'); await blur(page);
    await ruler(page, 1); await key(page, 'Space', 700); r.p = await st(page);
    await flag.click(); await sleep(300); r.single = await st(page);
    await key(page, 'Space');
    await shot(page, 'flag', k);
    r.pass = r.sel.range && r.dbl.playing && r.dbl.ph >= 10 && r.dbl.ph <= 10.35 + LEAD && !r.dbl.range && r.dbl.m === '10.000' && r.dblFlag.current === 'true' && r.dblFlag.focused
      && r.single.playing && r.single.ph >= 10 && r.single.ph <= 10.35 + LEAD && r.single.m === '10.000';
    return r;
  },
  async handle(page) {
    const r = {};
    await ruler(page, 3);
    const h = page.getByTestId('arrangement-playhead-handle');
    await h.focus(); await key(page, 'ArrowRight'); r.s1 = await st(page); await key(page, 'ArrowRight'); r.s2 = await st(page);
    await blur(page);
    await key(page, 'Space', 800);
    await h.focus(); const b = await st(page); await page.keyboard.press('ArrowRight'); const a = await st(page); r.playBefore = b; r.playAfter = a;
    await blur(page); await key(page, 'Space');
    const elapsed = (a.t - b.t) / 1000;
    r.jump = +(a.ph - b.ph - elapsed).toFixed(3);
    r.pass = near(r.s1.ph, 3.1, 0.001) && r.s1.m === '3.100' && near(r.s2.ph, 3.2, 0.001) && r.s2.m === '3.200' && a.playing && near(r.jump, 0.1, 0.06) && a.m === '3.200';
    return r;
  },
  async d27(page) {
    const r = {};
    const g = await geo(page); r.x18 = g.rx + 18 * g.pps; r.vw = await page.evaluate(() => innerWidth); r.x18Visible = r.x18 < r.vw - 5;
    if (!r.x18Visible) { r.pass = false; r.invalid = '18 s off-screen'; return r; }
    await ruler(page, 18); await key(page, 'Space', 400); r.past = await st(page);
    await ruler(page, 16); await page.keyboard.press('Space'); await sleep(250); r.atEnd = await st(page); await key(page, 'Space'); await blur(page);
    await ruler(page, 14); await key(page, 'Space', 400); await ruler(page, 2, 300); r.markerSet = await st(page);
    await page.waitForFunction(() => !document.querySelector('button[aria-label="Pause"]'), undefined, { timeout: 8000 }); await sleep(300); r.ended1 = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.spaceAfterEnd = await st(page); await key(page, 'Space'); await blur(page);
    await ruler(page, 14); await key(page, 'Space', 400);
    await page.waitForFunction(() => !document.querySelector('button[aria-label="Pause"]'), undefined, { timeout: 8000 }); await sleep(300); r.ended2 = await st(page);
    await page.keyboard.press('Shift+Space'); await sleep(250); r.shiftAfterEnd = await st(page); await key(page, 'Space');
    r.pass = !r.past.playing && /past|end/i.test(r.past.status) && r.atEnd.playing && r.atEnd.ph <= 0.35 + LEAD && r.markerSet.m === '2.000' && r.markerSet.playing
      && r.spaceAfterEnd.playing && r.spaceAfterEnd.ph >= 2 && r.spaceAfterEnd.ph <= 2.35 + LEAD && r.shiftAfterEnd.playing && r.shiftAfterEnd.ph <= 0.35 + LEAD;
    return r;
  },
  async cut(page, k) {
    const r = {};
    await ruler(page, 6); r.c = await st(page);
    await dragRange(page, 'music', 2, 4); await key(page, 'Control+Shift+L', 500); r.sel = await st(page);
    r.rangeAll = await page.evaluate(() => [document.querySelector('[data-range-start]')?.getAttribute('data-range-start'), document.querySelector('[data-range-end]')?.getAttribute('data-range-end')]);
    await key(page, 'Control+Shift+X', 700); r.after = await st(page);
    await shot(page, 'cut', k);
    r.pass = r.c.m === '6.000' && r.after.m === '4.000' && near(r.after.ph, 4, 0.001);
    return r;
  },
  async video(page, k) {
    const r = {};
    await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA + 'beeps-6s-vp9-opus.webm');
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
    await sleep(2500); await page.mouse.click(5, 5); await sleep(300); await blur(page);
    r.videoClip = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind=video]'); return c && { start: c.getAttribute('data-clip-start') ?? c.dataset.start ?? null }; });
    const vt = () => page.evaluate(() => { const v = [...document.querySelectorAll('[data-testid=arrangement-video] video, video[data-testid=arrangement-video]')].find((x) => x.readyState > 0) || document.querySelector('video'); return v ? { ct: +v.currentTime.toFixed(3), paused: v.paused, rs: v.readyState } : null; });
    await ruler(page, 1);
    await key(page, 'Space', 1500); await key(page, 'Space', 400); r.stop = { ...(await st(page)), v: await vt() };
    await page.keyboard.press('Space'); await sleep(300); r.restart = { ...(await st(page)), v: await vt() };
    await sleep(300); r.restart2 = { ...(await st(page)), v: await vt() };
    await key(page, 'Space');
    await shot(page, 'video', k);
    r.d1 = r.restart.v ? +(r.restart.v.ct - r.restart.ph).toFixed(3) : null;
    r.d2 = r.restart2.v ? +(r.restart2.v.ct - r.restart2.ph).toFixed(3) : null;
    r.pass = r.restart.m === '1.000' && r.restart.ph >= 1 && r.restart.ph <= 1.4 && r.d2 !== null && Math.abs(r.d2) <= 0.08;
    return r;
  },
  async keys(page) {
    const r = {};
    await ruler(page, 2); await key(page, 'Space', 1500); await key(page, 'Space'); r.c = await st(page);
    const tempo = page.getByTestId('arrangement-tempo-input');
    await tempo.click(); await sleep(200);
    for (const kk of ['Space', 'Shift+Space', 'Control+Shift+Space']) await key(page, kk, 300);
    r.tempo = await st(page); r.tempoVal = await tempo.inputValue();
    await key(page, 'Escape'); await blur(page);
    const search = page.getByTestId('arrangement-library-search');
    await search.click(); await sleep(200);
    for (const kk of ['Space', 'Shift+Space', 'Control+Shift+Space']) await key(page, kk, 300);
    r.search = await st(page); r.searchVal = await search.inputValue();
    await search.fill(''); await blur(page); await page.mouse.click(5, 5); await sleep(300);
    await key(page, 'Control+Space', 400); r.ctrlSpace = await st(page);
    await page.keyboard.press('Alt+Space'); await sleep(250); r.altSpace = await st(page);
    await page.keyboard.press('Alt+Space'); await sleep(300); r.altSpace2 = await st(page);
    r.pass = !r.tempo.playing && r.tempo.m === '2.000' && !r.search.playing && r.search.m === '2.000' && !r.ctrlSpace.playing && r.ctrlSpace.m === '2.000' && r.c.m === '2.000' && r.c.ph > 3 && r.tempo.ph === r.c.ph && r.search.ph === r.c.ph && r.altSpace.playing && r.altSpace.ph >= 2 && r.altSpace.ph <= 2.35 + LEAD && !r.altSpace2.playing;
    return r;
  },
  async statusBox(page, k) {
    const r = {};
    const box = () => page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const b = s.getBoundingClientRect(); const p = document.querySelector('button[aria-label="Pause"], button[aria-label="Play"]').getBoundingClientRect(); const lh = parseFloat(getComputedStyle(s).lineHeight) || 16; const overlap = !(b.right <= p.left || b.left >= p.right || b.bottom <= p.top || b.top >= p.bottom); return { text: s.textContent, h: +b.height.toFixed(1), w: +b.width.toFixed(1), sw: s.scrollWidth, cw: s.clientWidth, lines: Math.round(b.height / lh), overlapTransport: overlap }; });
    r.seed = await box();
    await ruler(page, 1); await key(page, 'Space', 400); await clipClick(page, 11, 500); r.marker = await box();
    await shot(page, 'status-box', k);
    await key(page, 'Space');
    r.pass = r.marker.text === ST_PLAYING('00:11.000') && r.marker.sw <= r.marker.cw && !r.marker.overlapTransport && r.marker.h <= r.seed.h;
    return r;
  },
  async statusClobber(page) {
    const r = {};
    r.seed = await st(page);
    await key(page, 'Space', 600); await lane(page, 'sfx', 6, 1000); r.after = await st(page);
    await key(page, 'Home', 400); r.home = await st(page);
    await key(page, 'Space');
    r.pass = r.after.status === ST_PLAYING('00:06.000');
    r.info = `after Home: marker ${r.home.m}, status "${r.home.status}"`;
    return r;
  },
  async editDiverge(page, k) {
    const r = {};
    await lane(page, 'music', 0.5); await key(page, 'Control+c', 300);
    await ruler(page, 2); await key(page, 'Space', 1500); await key(page, 'Space'); r.stop = await st(page);
    const clips = () => page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.dataset.clipId, l: Math.round(c.getBoundingClientRect().left), w: Math.round(c.getBoundingClientRect().width), track: c.closest('[data-track-id]')?.dataset.trackId })));
    const g = await geo(page);
    r.clips0 = await clips();
    await key(page, 'Control+v', 600); r.clips1 = await clips();
    await key(page, 'Control+e', 600); r.clips2 = await clips();
    await blur(page); await key(page, 'm', 600); await page.mouse.click(5, 5); await sleep(300);
    r.flags = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => e.dataset.markerTime));
    r.rx = g.rx; r.pps = g.pps;
    r.newClipStartsSec = r.clips1.filter((c) => !r.clips0.find((o) => o.id === c.id)).map((c) => +((c.l - g.rx) / g.pps).toFixed(3));
    r.splitEdgesSec = r.clips2.map((c) => +((c.l - g.rx) / g.pps).toFixed(3));
    r.status = (await st(page)).status;
    await shot(page, 'edit-diverge', k);
    r.pass = 'info';
    return r;
  },
};

const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, false);
    const inv = () => page.evaluate(() => {
      const rows = [];
      const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
      for (const el of document.body.querySelectorAll('*')) {
        if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
        if (!own || el.closest('.sr-only') || !vis(el)) continue;
        if (el.closest('[data-testid="arrangement-timeline-scroller"]')) continue;
        if (el.closest('[data-testid="arrangement-status"]')) continue;
        const region = el.closest('[data-testid]') ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
        rows.push(`${region}|${own.slice(0, 140)}`);
      }
      return rows;
    });
    const sig = () => page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-insert-marker"]'); if (!s) return null; const b = s.getBoundingClientRect(); return { hidden: s.hidden, ariaHidden: s.getAttribute('aria-hidden'), w: b.width, h: b.height, display: getComputedStyle(s).display, tab: s.tabIndex }; });
    const empty = await inv(); const sigEmpty = await sig(); await shot(page, 'budget-empty', k);
    await addPulse(page);
    const demo = await inv(); const sigDemo = await sig(); await shot(page, 'budget-demo', k);
    await ctx.close();
    const exp = k === '1440x900' ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, exp, sigEmpty, sigDemo, pass: empty.length === exp[0] && demo.length === exp[1] && sigDemo && sigDemo.hidden && sigDemo.w === 0 && sigDemo.h === 0, errors };
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, true);
    const r = {}; r.clips = await page.locator('[data-clip-id]').count();
    r.s0 = await st(page);
    await key(page, 'Space', 900); r.playing = await st(page);
    await key(page, 'Space', 400); r.paused = await st(page); await sleep(500); r.paused2 = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.again = await st(page); await key(page, 'Space');
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 90000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `export-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.paused.ph === r.paused2.ph && r.again.ph <= 0.3 + LEAD && r.wav.sha256 === SHA && r.wav.nan === 0 && errors.length === 0;
    await ctx.close(); return r;
  },
  async xEmpty(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, false);
    const r = {};
    await page.mouse.click(5, 5); await key(page, 'Space', 400); r.space = await st(page);
    await key(page, 'Shift+Space', 400); r.shift = await st(page);
    await key(page, 'Control+Shift+Space', 400); r.cs = await st(page);
    r.errors = errors; await ctx.close();
    r.pass = !r.space.playing && /Nothing to play/i.test(r.space.status) && !r.shift.playing && r.cs.m === '0.000' && errors.length === 0;
    return r;
  },
  async auth(browser, vp, k) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 150000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    await shot(page, 'auth-guard', k);
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    r.pass = r.labWorkspace === 1 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && r.tokenFake.status !== 200;
    await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { const { ctx, page, errors } = await open(browser, vp); R.rows[key2] = await fn(page, k, name); R.rows[key2].errors = errors; await ctx.close(); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '', 'err', (x.errors || []).length);
    }
    for (const [name, fn] of Object.entries(STANDALONE)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { R.rows[key2] = await fn(browser, vp, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      console.log(key2, 'pass=', R.rows[key2].pass, R.rows[key2].error ? R.rows[key2].error.slice(0, 300) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
