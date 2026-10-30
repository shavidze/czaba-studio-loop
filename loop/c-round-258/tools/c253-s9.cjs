// C round 253: independent browser rows (SABA-B-10a 2b fix-up: stopped status, paused Follow copy).
// usage: node c253.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c253.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';

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
  window.__statusLog = [];
  const hook = () => {
    const s = document.querySelector('[data-testid="arrangement-status"]');
    if (!s) { requestAnimationFrame(hook); return; }
    new MutationObserver(() => window.__statusLog.push({ t: performance.now(), text: s.textContent })).observe(s, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', hook);
};

const readWav = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  const data = Array.from({ length: ch }, () => new Float64Array(frames));
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    data[c][f] = x;
  }
  return { ch, rate, bits, frames, data };
};
const wavInfo = (buf) => {
  const w = readWav(buf); let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (const d of w.data) for (const x of d) { if (!Number.isFinite(x)) nan += 1; s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a; }
  return { bytes: buf.length, rate: w.rate, bits: w.bits, ch: w.ch, frames: w.frames, seconds: w.frames / w.rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(1000);
  await blur(page);
}
async function open(browser, vp, { pulse = true, zoom = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
  await sleep(800);
  const setup = {};
  if (pulse) {
    await addPulse(page);
    setup.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    if (zoom) { for (let i = 0; i < 4; i += 1) { await page.keyboard.press('Equal'); await sleep(150); } await sleep(400); }
    setup.zoom = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
    setup.bpm = await page.evaluate(() => document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('data-bpm'));
  }
  return { ctx, page, errors, setup };
}
const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const a = document.activeElement;
  const f = q('[data-testid="arrangement-follow"]');
  const sc = q('[data-testid="arrangement-timeline-scroller"]');
  const pl = q('[data-testid="arrangement-playhead"]');
  return {
    t: performance.now(),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
    playing: (q('button[aria-label="Play"]')?.dataset.playing === 'true'),
    follow: f?.getAttribute('data-follow-mode') ?? null, followText: f?.textContent ?? null, followTitle: f?.getAttribute('title') ?? null,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    scrollLeft: sc?.scrollLeft ?? null,
    playheadX: pl ? +pl.getBoundingClientRect().x.toFixed(1) : null,
    selMarkers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].filter((m) => m.getAttribute('aria-current') === 'true').map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.tagName).slice(0, 60) : 'BODY',
    rms: Math.max(0, ...(window.__rms ? window.__rms() : [0])),
  };
});
const geo = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
  const b = document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getBoundingClientRect();
  const s = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')?.getBoundingClientRect();
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
  const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent);
  const lane = (id) => { const x = document.querySelector(`[data-track-id="${id}"]`)?.getBoundingClientRect(); return x ? { y: x.y, h: x.height } : null; };
  const clip = document.querySelector('[data-track-id="music"] [data-clip-id]')?.getBoundingClientRect();
  return { rx: r.x, ry: r.y, rh: r.height, bx: b?.x, by: b?.y, bh: b?.height, sy: s?.y, sh: s?.height, scLeft: sc.left, scRight: sc.right, pps, sfx: lane('sfx'), music: lane('music'), clip: clip && { y: clip.y, h: clip.height } };
});
const hit = (page, x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const t = e?.closest('[data-testid]'); return t ? t.getAttribute('data-testid') : e?.tagName ?? null; }, [x, y]);
// click at viewport x on a target band; refuse when elementFromPoint is not the named target
async function aimClick(page, x, y, want, mods) {
  const h = await hit(page, x, y);
  if (!want.includes(h)) throw new Error(`aim ${x.toFixed(0)},${y.toFixed(0)} hit ${h}, want ${want}`);
  if (mods) await page.keyboard.down(mods);
  await page.mouse.click(x, y);
  if (mods) await page.keyboard.up(mods);
  return h;
}
const lowerY = (g) => g.by + g.bh - 3;
const stripY = (g) => g.sy + g.sh / 2;
const secY = (g) => g.ry + g.rh / 2;
const safeX = (g) => g.scRight - 300; // right of the metronome toggle (A's aim note), well inside the scroller
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s - m * 60; return `${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`; };
const PAUSED_TXT = (t) => `Insert marker at ${t} — playback continues, Follow paused. Stop, then Space plays from here.`;
const PLAYING_TXT = (t) => `Insert marker at ${t} — playback continues. Stop, then Space plays from here.`;
const RESUMED = 'Follow is following the playback position again.';
const FOLLOW_PAUSED = 'Follow paused by manual navigation. Press Follow, or stop playback, to resume it.';
const FOLLOW_PAUSED_OLD = 'Follow paused by manual navigation. Follow or Play resumes it.';
const STOPPED_TXT = (t) => `Stopped — Space plays from the insert marker at ${t}.`;
const TITLE_PAUSED = 'Follow paused — press Follow, or stop playback, to resume';
const TITLE_ON = 'Follow: the view follows the playback position';
const statusLog = (page) => page.evaluate(() => window.__statusLog.slice());
const statusBox = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
  const tr = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]')?.getBoundingClientRect();
  const overlapsTransport = tr ? !(r.bottom <= tr.top || r.top >= tr.bottom || r.right <= tr.left || r.left >= tr.right) : null;
  const rg = document.createRange(); rg.selectNodeContents(s); const rects = [...rg.getClientRects()].filter((x) => x.width > 0);
  return { h: +r.height.toFixed(1), lines: Math.round(r.height / lh), textLines: new Set(rects.map((x) => Math.round(x.top))).size, sw: s.scrollWidth, cw: s.clientWidth, sh: s.scrollHeight, ch: s.clientHeight, overlapsTransport, text: s.textContent };
});
async function samples(page, n, every) { const out = []; for (let i = 0; i < n; i += 1) { await sleep(every); const s = await st(page); out.push({ dt: (i + 1) * every, follow: s.follow, scrollLeft: s.scrollLeft, ph: s.ph, playing: s.playing }); } return out; }

const now = (page) => page.evaluate(() => performance.now());
// a stop with a write count: MutationObserver callbacks after the stop key, and distinct text changes
async function stopCount(page, how = 'Space', wait = 600) {
  const before = await st(page); const t0 = await now(page);
  if (how === 'Space') await page.keyboard.press('Space');
  else if (how === 'Escape') await page.keyboard.press('Escape');
  else if (how === 'button') await page.locator('button[aria-label="Stop"]').first().click();
  await sleep(wait);
  const after = await st(page);
  const log = (await statusLog(page)).filter((x) => x.t > t0);
  let changes = 0; let prev = before.status; for (const e of log) { if (e.text !== prev) changes += 1; prev = e.text; }
  return { before, after, callbacks: log.length, changes, texts: log.map((x) => x.text) };
}
async function pauseByLower(page) {
  const g = await geo(page);
  const aim = await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']);
  await sleep(150); return { aim, s: await st(page) };
}
async function scrollBy(page, d) { await page.evaluate((d) => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft += d; }, d); await sleep(300); }
const ROWS = {
  // C-FOLLOW-STOP-253 (+ C-TITLES paused-by-click, + C-STATUS-WIDE stopped text)
  async followStop(page, k) {
    const r = {};
    await key(page, 'Space', 700); r.playing = await st(page);
    const p = await pauseByLower(page); r.aim = p.aim; r.paused = p.s;
    r.pausedBox = await statusBox(page);
    await sleep(800);
    r.stop = await stopCount(page, 'Space');
    r.stopBox = await statusBox(page);
    await shot(page, 'follow-stop', k);
    const t = fmt(Number(r.paused.m));
    r.t = t; r.markerAfter = r.stop.after.m;
    r.pausedTextOk = r.paused.status === PAUSED_TXT(t);
    r.titlePaused = r.paused.followTitle; r.titleAfter = r.stop.after.followTitle;
    r.isFix = r.stop.after.status === STOPPED_TXT(t);
    r.pass = r.playing.playing && r.paused.follow === 'paused' && r.pausedTextOk && !r.stop.after.playing && r.stop.after.follow === 'on' && r.stop.after.followText === 'Follow'
      && r.stop.after.status === STOPPED_TXT(t) && fmt(Number(r.stop.after.m)) === t && r.stop.changes === 1;
    r.controlPausedStays = r.stop.after.status === PAUSED_TXT(t) && r.stop.changes === 0;
    return r;
  },
  // C-STOP-PLAIN-253
  async stopPlain(page, k) {
    const r = {};
    await page.getByTestId('arrangement-follow').click(); await sleep(200); await blur(page);
    r.off = await st(page);
    await key(page, 'Space', 700);
    const p = await pauseByLower(page); r.aim = p.aim; r.click = p.s;
    await sleep(600);
    r.stop = await stopCount(page, 'Space');
    await shot(page, 'stop-plain', k);
    const t = fmt(Number(r.click.m)); r.t = t;
    r.pass = r.off.follow === 'off' && r.click.follow === 'off' && r.click.status === PLAYING_TXT(t) && r.stop.after.follow === 'off' && r.stop.after.status === STOPPED_TXT(t) && r.stop.changes === 1 && !r.stop.after.playing;
    r.controlPlayingStays = r.stop.after.status === PLAYING_TXT(t) && r.stop.changes === 0;
    return r;
  },
  // C-STOP-SCROLL-253 (+ C-TITLES paused-by-scroll, C-STATUS-WIDE followPaused)
  async stopScroll(page, k) {
    const r = {};
    r.s0 = await st(page);
    await key(page, 'Space', 900);
    await scrollBy(page, 200); r.paused = await st(page);
    r.pausedBox = await statusBox(page);
    await shot(page, 'scroll-paused', k);
    await sleep(500);
    r.stop = await stopCount(page, 'Space');
    await shot(page, 'stop-scroll', k);
    const t = fmt(Number(r.stop.after.m)); r.t = t;
    r.pass = r.paused.follow === 'paused' && r.paused.status === FOLLOW_PAUSED && r.paused.followTitle === TITLE_PAUSED && r.stop.after.follow === 'on' && r.stop.after.followTitle === TITLE_ON
      && r.stop.after.status === STOPPED_TXT(t) && r.stop.after.m === r.s0.m && r.stop.changes === 1;
    r.controlOld = r.paused.status === FOLLOW_PAUSED_OLD;
    return r;
  },
  // C-STOP-UNRELATED-253 (a) plain stop (b) project-end auto-stop after a strip click at >=13 s; (c) probe: auto-stop with a playing-only text
  async unrelated(page, k) {
    const r = {};
    await key(page, 'Space', 1200);
    r.plain = await stopCount(page, 'Space');
    // (b) strip click at 13.2 s
    let g = await geo(page);
    await scrollBy(page, g.rx + 15 * g.pps - (g.scLeft + g.scRight) / 2);
    g = await geo(page);
    const x13 = g.rx + 13.2 * g.pps;
    await aimClick(page, x13, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(100);
    r.stripStart = await st(page);
    const t0 = await now(page);
    r.preAutoStatus = r.stripStart.status;
    for (let i = 0; i < 40; i += 1) { await sleep(200); const s = await st(page); if (!s.playing) { r.autoStopped = s; break; } }
    await sleep(500);
    r.afterAuto = await st(page);
    const log = (await statusLog(page)).filter((x) => x.t > t0);
    r.autoLog = log.map((x) => x.text);
    r.autoWrites = log.length;
    r.pass = r.plain.changes === 0 && r.plain.callbacks === 0 && r.plain.after.status === r.plain.before.status && !r.plain.after.playing
      && r.stripStart.playing && !!r.autoStopped && r.autoWrites === 0 && r.afterAuto.status === r.preAutoStatus;
    // (c) probe: strip at 13.2, lower-zone click at ~14.5 while playing, then auto-stop
    g = await geo(page);
    await aimClick(page, g.rx + 12.4 * g.pps, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(150);
    g = await geo(page);
    const xl = g.rx + 14.6 * g.pps;
    r.probeAimHit = await hit(page, xl, lowerY(g));
    if (r.probeAimHit === 'arrangement-bars-ruler') {
      await page.mouse.click(xl, lowerY(g)); await sleep(150); r.probeClick = await st(page);
      for (let i = 0; i < 40; i += 1) { await sleep(200); const s = await st(page); if (!s.playing) break; }
      await sleep(500); r.probeAfter = await st(page);
      r.probeExpected = STOPPED_TXT(fmt(Number(r.probeClick.m)));
      r.probeAutoStopReplaces = r.probeAfter.status === r.probeExpected;
    }
    await shot(page, 'unrelated', k);
    return r;
  },
  // C-TITLES-253 (title on after a resume by Follow button too)
  async titles(page, k) {
    const r = {};
    r.on0 = (await st(page)).followTitle;
    await key(page, 'Space', 700);
    await pauseByLower(page); r.pausedClick = (await st(page)).followTitle;
    await page.getByTestId('arrangement-follow').click(); await sleep(200); await blur(page);
    r.afterButton = await st(page);
    await scrollBy(page, 200); r.pausedScroll = (await st(page)).followTitle;
    r.pausedScrollStatus = (await st(page)).status;
    await key(page, 'Space', 400); r.afterStop = (await st(page)).followTitle;
    r.pass = r.on0 === TITLE_ON && r.pausedClick === TITLE_PAUSED && r.afterButton.followTitle === TITLE_ON && r.pausedScroll === TITLE_PAUSED && r.afterStop === TITLE_ON;
    return r;
  },
  // §6 probes: Escape stop, transport-button stop, residual (Ctrl+→ during playback), stop after an edit, BR3, past-end
  async probes(page, k) {
    const r = {};
    // Escape
    await key(page, 'Space', 700); let p = await pauseByLower(page); await sleep(300);
    r.esc = await stopCount(page, 'Escape'); r.escT = fmt(Number(p.s.m));
    r.escOk = !r.esc.after.playing ? r.esc.after.status === STOPPED_TXT(r.escT) : 'escape did not stop';
    if (r.esc.after.playing) await key(page, 'Space', 500);
    // transport button
    await key(page, 'Space', 700); r.btnPre = await st(page); p = await pauseByLower(page); await sleep(300);
    r.btn = await stopCount(page, 'button'); r.btnT = fmt(Number(p.s.m));
    r.btnOk = !r.btn.after.playing && r.btn.after.status === STOPPED_TXT(r.btnT) && r.btn.after.follow === 'on';
    await blur(page);
    // residual: marker at 2 and 6, ruler click while playing, Ctrl+→ then Space
    await key(page, 'Home', 200);
    const at = async (t) => { const g = await geo(page); await aimClick(page, g.rx + t * g.pps, secY(g), ['arrangement-ruler']); await sleep(200); };
    for (const t of [2, 6]) { await at(t); await key(page, 'm', 250); await key(page, 'Enter', 250); await blur(page); }
    await at(0.5); await key(page, 'Space', 600);
    p = await pauseByLower(page); r.resClick = p.s;
    await key(page, 'Control+ArrowRight', 300); r.resNav = await st(page);
    r.res = await stopCount(page, 'Space');
    // stop right after an edit during playback: lower click then 'm' (add marker) then Space
    await key(page, 'Space', 700); p = await pauseByLower(page);
    await key(page, 'm', 300); r.editAfterM = await st(page);
    await key(page, 'Escape', 200); await blur(page);
    r.editStop = await stopCount(page, 'Space');
    // BR3: strip click playing with Follow on
    await key(page, 'Home', 200); await key(page, 'Space', 700);
    const t0 = await now(page); let g = await geo(page);
    await aimClick(page, g.scRight - 100, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(150);
    r.br3 = await st(page); r.br3Writes = (await statusLog(page)).filter((x) => x.t > t0).length;
    r.br3Stop = await stopCount(page, 'Space');
    // past-end: play from 13 via strip, lower-zone click past 16 s, Space
    g = await geo(page);
    await scrollBy(page, g.rx + 16 * g.pps - (g.scLeft + g.scRight) / 2);
    g = await geo(page);
    for (const t of [13, 13.6, 14.2, 12.4, 14.8]) { const h = await hit(page, g.rx + t * g.pps, stripY(g)); if (['arrangement-bars-scrub-strip', 'arrangement-bars-ruler'].includes(h)) { r.pastStripT = t; await page.mouse.click(g.rx + t * g.pps, stripY(g)); break; } }
    await sleep(150);
    g = await geo(page);
    const xp = g.rx + 16.4 * g.pps; r.pastHit = xp < g.scRight ? await hit(page, xp, lowerY(g)) : 'out of view';
    if (r.pastHit === 'arrangement-bars-ruler') {
      await page.mouse.click(xp, lowerY(g)); await sleep(150); r.pastClick = await st(page);
      r.pastStop = r.pastClick.playing ? await stopCount(page, 'Space') : null;
      if (r.pastStop) { await key(page, 'Space', 500); r.pastSpaceAgain = await st(page); if (r.pastSpaceAgain.playing) await key(page, 'Space', 300); }
    }
    await shot(page, 'probes', k);
    return r;
  },
  // C-STATUS-WIDE-253 control: composed text box (round-252 control text)
  async navOrigin(page, k) {
    const r = {};
    const at = async (t, wait = 200) => { const g = await geo(page); const x = g.rx + t * g.pps; await aimClick(page, x, secY(g), ['arrangement-ruler']); await sleep(wait); };
    for (const t of [2, 6]) { await at(t); await key(page, 'm', 250); await key(page, 'Enter', 250); await blur(page); }
    r.markers = (await st(page)).markers;
    await at(1, 300);
    await key(page, 'Space', 3000); await key(page, 'Space', 400); r.stopped = await st(page);
    await key(page, 'Control+ArrowRight', 400); r.next = await st(page);
    r.steps = [];
    for (let i = 0; i < 5; i += 1) { await key(page, 'Control+ArrowRight', 300); const s = await st(page); r.steps.push({ m: s.m, ph: s.ph, status: s.status, playing: s.playing }); if ((s.status || '').startsWith('No more markers')) break; }
    await key(page, 'Home', 300); await key(page, 'Space', 250);
    await page.keyboard.press('Control+ArrowLeft'); await sleep(30); await page.keyboard.press('Control+ArrowLeft'); await sleep(200);
    r.playNone = await st(page);
    await key(page, 'Space', 300);
    const last = r.steps[r.steps.length - 1];
    r.pass = r.stopped.ph > 3.4 && r.stopped.m === '1.000' && r.next.m === '2.000' && r.next.pos === '00:02.000' && last.status === 'No more markers after the insert marker' && r.playNone.playing && r.playNone.status === 'No more markers before the playhead';
    await shot(page, 'nav-origin', k);
    return r;
  },
};
const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: false });
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
    const empty = await inv(); await shot(page, 'budget-empty', k);
    await addPulse(page);
    const demo = await inv(); await shot(page, 'budget-demo', k);
    await ctx.close();
    const exp = k === '1440x900' ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, exp, pass: empty.length === exp[0] && demo.length === exp[1], errors };
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const r = {}; r.s0 = await st(page);
    await key(page, 'Space', 1200); r.playing = await st(page);
    await key(page, 'Space', 400);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 120000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `smoke-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.wav.sha256 === SHA && r.wav.nan === 0 && Math.abs(r.wav.seconds - 16) < 0.001 && errors.length === 0;
    await ctx.close(); return r;
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
    for (const [name, fn] of Object.entries(STANDALONE)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { R.rows[key2] = await fn(browser, vp, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      console.log(key2, 'pass=', R.rows[key2].pass, R.rows[key2].error ? R.rows[key2].error.slice(0, 300) : '');
    }
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { const { ctx, page, errors, setup } = await open(browser, vp); R.rows[key2] = await fn(page, k, name); R.rows[key2].setup = setup; R.rows[key2].errors = errors; await ctx.close(); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '', 'err', (x.errors || []).length);
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
