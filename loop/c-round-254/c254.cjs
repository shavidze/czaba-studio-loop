// C round 254: SABA-B-10b visible insert marker rows (C, independent).
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
const resultFile = path.join(outDir, 'c254.json');
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
async function open(browser, vp, { pulse = true, zoom = true, rm = 'no-preference', base = BASE } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, reducedMotion: rm });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${base}/studio-lab`, { waitUntil: "load" });
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
    playing: !!q('button[aria-label="Pause"]'),
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
const HEADB = 'http://127.0.0.1:5180';
const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
const ratio = (a, b) => { const x = lum(a); const y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const INK = 'rgb(236, 230, 218)';
const L = (page) => page.evaluate(() => {
  const ls = document.querySelectorAll('[data-testid="arrangement-insert-marker"]'); const l = ls[0];
  const p = document.querySelector('[data-testid="arrangement-playhead"]');
  const o = { count: ls.length };
  if (l) { const b = l.getBoundingClientRect(); const cs = getComputedStyle(l); Object.assign(o, { hidden: l.hidden, display: cs.display, x: +b.x.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(1), top: +b.y.toFixed(1), bg: cs.backgroundColor, pe: cs.pointerEvents, anim: cs.animationName, opacity: cs.opacity, z: cs.zIndex, ariaHidden: l.getAttribute('aria-hidden'), tabindex: l.getAttribute('tabindex'), m: l.getAttribute('data-insert-marker'), parentSame: !!p && l.parentElement === p.parentElement, beforePlayhead: !!p && !!(l.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) }); }
  if (p) { const b = p.getBoundingClientRect(); const cs = getComputedStyle(p); o.ph = { x: +b.x.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(1), top: +b.y.toFixed(1), bg: cs.backgroundColor, z: cs.zIndex, cls: p.className }; }
  o.pos = document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null;
  o.phv = Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'));
  o.playing = !!document.querySelector('button[aria-label="Pause"]');
  o.range = document.querySelectorAll('[data-testid="arrangement-range"]').length;
  return o;
});
const tickX = (page, label) => page.evaluate((label) => { const s = [...document.querySelectorAll('[data-testid="arrangement-ruler"] span')].find((e) => e.textContent.trim() === label); return s ? +s.parentElement.getBoundingClientRect().x.toFixed(2) : null; }, label);
async function pixel(page, x, y) {
  const buf = await page.screenshot({ clip: { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 } });
  return page.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = 1; c.height = 1; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]}, ${d[1]}, ${d[2]})`; }, buf.toString('base64'));
}
async function origin(page) { const s = await L(page); const g = await geo(page); return { x0: s.ph.x, pps: g.pps, g }; }
async function laneClick(page, o, t, track = 'sfx') {
  const g = await geo(page); const ln = g[track]; const x = o.x0 + t * o.pps; const y = ln.y + ln.h / 2;
  const target = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { lane: e?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null, scrub: !!e?.closest('[data-testid="arrangement-bars-scrub-strip"]'), tid: e?.closest('[data-testid]')?.getAttribute('data-testid') ?? e?.tagName }; }, [x, y]);
  if (target.lane !== track || target.scrub) throw new Error('lane aim ' + JSON.stringify(target));
  await page.mouse.click(x, y); await sleep(350); return { x, y, target };
}
async function samplesOpacity(page) { const out = []; for (let i = 0; i < 24; i += 1) { out.push(Number(await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="arrangement-insert-marker"]')).opacity))); await sleep(100); } return out; }
const changes = (a) => a.reduce((n, v, i) => n + (i && v !== a[i - 1] ? 1 : 0), 0);
const minChanges2s = (a) => { let m = 99; for (let i = 0; i + 20 < a.length; i += 1) m = Math.min(m, changes(a.slice(i, i + 21))); return m; };
async function bgBehind(page, x, y) {
  return page.evaluate(([x, y]) => {
    const hide = [...document.querySelectorAll('[data-testid="arrangement-insert-marker"],[data-testid="arrangement-playhead"],[data-testid="arrangement-playhead-handle"]')];
    hide.forEach((e) => { e.dataset.cvis = e.style.visibility; e.style.visibility = 'hidden'; });
    let e = document.elementFromPoint(x, y); const id = e?.closest('[data-testid]')?.getAttribute('data-testid') ?? e?.tagName; let bg = null; const chain = [];
    while (e) { const c = getComputedStyle(e).backgroundColor; chain.push(c); const am = c.match(/\/\s*([\d.]+)\)$/) || c.match(/^rgba\([^)]*,\s*([\d.]+)\)$/); const alpha = am ? Number(am[1]) : 1; if (alpha >= 0.999) { bg = c; break; } e = e.parentElement; }
    hide.forEach((h) => { h.style.visibility = h.dataset.cvis; });
    return { id, bg, chain: chain.slice(0, 6) };
  }, [x, y]);
}

const ROWS = {
  // C-MARKER-VISIBLE + C-CONTRAST + coincide pixel (reduce ctx => opacity 1 always)
  async visible(browser, vp, k) {
    const { ctx, page, errors, setup } = await open(browser, vp, { rm: 'reduce' }); const r = { setup };
    const o = await origin(page); r.origin = { x0: o.x0, pps: o.pps };
    r.click = await laneClick(page, o, 2);
    r.line = await L(page);
    r.expectedX = o.x0 + 2 * o.pps; r.dx = +(r.line.x - r.expectedX).toFixed(2);
    r.tick002 = await tickX(page, '0:02'); r.dxTick = r.tick002 == null ? null : +(r.line.x - r.tick002).toFixed(2);
    const g = await geo(page);
    // painted pixel on an empty lane at the line x (line 1px => center at x+0.5)
    await page.evaluate(() => { const p = document.querySelector('[data-testid="arrangement-playhead"]'); p.style.visibility = 'hidden'; document.querySelector('[data-testid="arrangement-playhead-handle"]').style.visibility = 'hidden'; });
    r.pxLineOnSfx = await pixel(page, r.line.x, g.sfx.y + g.sfx.h / 2);
    r.pxBeside = await pixel(page, r.line.x + 4, g.sfx.y + g.sfx.h / 2);
    await page.evaluate(() => { document.querySelector('[data-testid="arrangement-playhead"]').style.visibility = ''; document.querySelector('[data-testid="arrangement-playhead-handle"]').style.visibility = ''; });
    r.pxCoincideSfx = await pixel(page, r.line.x, g.sfx.y + g.sfx.h / 2);
    r.pxCoincideSfxP1 = await pixel(page, r.line.x + 1, g.sfx.y + g.sfx.h / 2);
    r.clickThrough = await page.evaluate(([x, y]) => { const l = document.querySelector('[data-testid="arrangement-insert-marker"]'); const e = document.elementFromPoint(x, y); return { hitIsLine: e === l, lane: e?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null }; }, [r.line.x + 0.5, g.sfx.y + g.sfx.h / 2]);
    // contrast backgrounds
    const cx = r.line.x + 0.5; const bg = {};
    bg.sfxLane = await bgBehind(page, cx, g.sfx.y + g.sfx.h / 2);
    bg.secondsRuler = await bgBehind(page, cx, g.ry + g.rh / 2);
    if (g.by != null) bg.barsRuler = await bgBehind(page, cx, g.by + g.bh / 2);
    const mk = await page.evaluate(() => document.querySelector('[data-testid="arrangement-marker-strip"]')?.getBoundingClientRect().toJSON() ?? null);
    if (mk) bg.markerStrip = await bgBehind(page, cx, mk.y + mk.height / 2);
    const vid = await page.evaluate(() => document.querySelector('[data-track-id="video"]')?.getBoundingClientRect().toJSON() ?? null);
    if (vid) bg.videoLane = await bgBehind(page, cx, vid.y + vid.height / 2);
    // clip: selected after Add? record selection then deselect via sfx click (done above)
    const clip = await page.evaluate(() => { const c = document.querySelector('[data-track-id="music"] [data-clip-id]') || document.querySelector('[data-clip-id]'); if (!c) return null; const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, sel: c.className.includes('ring-2'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') }; });
    r.clip = clip;
    if (clip) {
      bg.clipBodyUnselected = await bgBehind(page, cx, clip.y + clip.h * 0.6);
      bg.clipTitleUnselected = await bgBehind(page, cx, clip.y + 8);
      await page.evaluate(() => { document.querySelector('[data-testid="arrangement-playhead"]').style.visibility = 'hidden'; });
      r.pxLineOnClipBody = await pixel(page, r.line.x, clip.y + clip.h * 0.6); r.pxBesideOnClipBody = await pixel(page, r.line.x + 4, clip.y + clip.h * 0.6);
      await page.evaluate(() => { document.querySelector('[data-testid="arrangement-playhead"]').style.visibility = ''; });
      await shot(page, 'visible-unselected', k);
      // select the clip by clicking its title area away from the line, then measure title bar
      await page.mouse.click(clip.x + 80, clip.y + 8); await sleep(300);
      r.clipAfterSelect = await page.evaluate(() => { const c = document.querySelector('[data-track-id="music"] [data-clip-id]') || document.querySelector('[data-clip-id]'); return c.className.includes('ring-2'); });
      r.lineAfterSelect = await L(page);
      bg.clipTitleSelected = await bgBehind(page, r.lineAfterSelect.x + 0.5, clip.y + 8);
      bg.clipBodySelected = await bgBehind(page, r.lineAfterSelect.x + 0.5, clip.y + clip.h * 0.6);
      await shot(page, 'visible-selected', k);
    }
    for (const v of Object.values(bg)) if (v.bg) v.ratio = ratio(INK, v.bg);
    r.bg = bg;
    await shot(page, 'visible', k);
    r.errors = errors; await ctx.close();
    const req = ['sfxLane', 'secondsRuler', 'clipBodyUnselected'];
    r.pass = r.line.count === 1 && !r.line.hidden && r.line.display !== 'none' && r.line.w >= 1 && r.line.bg === INK && r.line.m === '2.000' && Math.abs(r.dx) <= 1 && r.line.pe === 'none' && !r.clickThrough.hitIsLine && r.clickThrough.lane === 'sfx' && r.pxLineOnSfx === INK && req.every((q) => bg[q] && bg[q].ratio >= 3) && r.line.ariaHidden === 'true' && r.line.tabindex === null && r.line.beforePlayhead && r.line.parentSame && Math.abs(r.line.h - r.line.ph.h) < 1 && errors.length === 0;
    return r;
  },
  async headControl(browser, vp, k) {
    const { ctx, page, errors, setup } = await open(browser, vp, { base: HEADB, rm: 'reduce' }); const r = { setup };
    const o = await origin(page); r.click = await laneClick(page, o, 2);
    r.line = await page.evaluate(() => { const ls = document.querySelectorAll('[data-testid="arrangement-insert-marker"]'); const l = ls[0]; const b = l.getBoundingClientRect(); return { count: ls.length, hidden: l.hidden, w: b.width, h: b.height, m: l.getAttribute('data-insert-marker') }; });
    r.playhead = (await L(page)).ph;
    r.titles = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^(Play|Pause|Back to start)/.test(b.getAttribute('title') || '')).map((b) => ({ title: b.getAttribute('title'), keys: b.getAttribute('aria-keyshortcuts') })));
    await shot(page, 'head-stopped-2s', k);
    r.errors = errors; await ctx.close();
    r.pass = r.line.count === 1 && r.line.hidden === true && r.line.w === 0 && r.line.h === 0 && r.line.m === '2.000';
    return r;
  },
  async blink(browser, vp, k) {
    const r = {};
    for (const rm of ['no-preference', 'reduce']) {
      const { ctx, page, errors } = await open(browser, vp, { rm });
      const o = await origin(page); await laneClick(page, o, 2);
      const s = await samplesOpacity(page); const a = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('[data-testid="arrangement-insert-marker"]')); return { name: cs.animationName, dur: cs.animationDuration, tf: cs.animationTimingFunction, it: cs.animationIterationCount }; });
      // also while playing
      await key(page, 'Space', 300); const sp = []; for (let i = 0; i < 14; i += 1) { sp.push(Number(await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="arrangement-insert-marker"]')).opacity))); await sleep(100); } await key(page, 'Space', 200);
      r[rm] = { samples: s, changes: changes(s), minChanges2s: minChanges2s(s), anim: a, values: [...new Set(s)], playingSamples: sp, playingValues: [...new Set(sp)], errors };
      await ctx.close();
    }
    const n = r['no-preference']; const d = r.reduce;
    r.pass = n.anim.name === 'insert-marker-blink' && n.minChanges2s >= 2 && n.values.every((v) => v === 1 || v === 0.25) && d.anim.name === 'none' && d.samples.every((v) => v === 1) && d.playingSamples.every((v) => v === 1);
    return r;
  },
  async twoLines(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { rm: 'reduce' }); const r = {};
    const o = await origin(page); r.origin = o.pps; await laneClick(page, o, 2);
    r.s0 = await L(page);
    await key(page, 'Space', 1500); await key(page, 'Space', 400);
    r.s1 = await L(page);
    r.markerDx = +(r.s1.x - (o.x0 + 2 * o.pps)).toFixed(2);
    r.phDxOwn = +(r.s1.ph.x - (o.x0 + r.s1.phv * o.pps)).toFixed(2);
    r.sep = +(r.s1.ph.x - r.s1.x).toFixed(1);
    await shot(page, 'two-lines', k);
    // next Space: clock start
    await page.keyboard.press('Space');
    const starts = []; for (let i = 0; i < 6; i += 1) { await sleep(40); starts.push((await L(page)).pos); }
    r.replay = starts; await sleep(300); await key(page, 'Space', 300);
    r.errors = errors; await ctx.close();
    r.pass = Math.abs(r.markerDx) <= 1 && r.s1.m === '2.000' && Math.abs(r.phDxOwn) <= 1 && r.sep >= 20 && !r.s1.hidden && r.s1.display !== 'none' && r.s1.ph.w > 0 && /^00:02\.[01]/.test(r.replay[0]) && errors.length === 0;
    return r;
  },
  async playing(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp); const r = {};
    const o = await origin(page); const g = await geo(page);
    await key(page, 'Space', 600);
    await page.evaluate(() => { window.__mm = []; window.__pd = []; window.__fr = []; const l = document.querySelector('[data-testid="arrangement-insert-marker"]'); new MutationObserver(() => window.__mm.push({ t: performance.now(), m: l.getAttribute('data-insert-marker'), left: l.style.left })).observe(l, { attributes: true, attributeFilter: ['data-insert-marker'] }); window.addEventListener('pointerdown', (e) => window.__pd.push(performance.now()), true); const f = (t) => { window.__fr.push(t); if (window.__fr.length < 2000) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const a = await L(page);
    // lower zone of the bars ruler at ~6 s
    const x6 = o.x0 + 6 * o.pps; r.rulerHit = await hit(page, x6, lowerY(g));
    await page.mouse.click(x6, lowerY(g)); await sleep(250);
    const b = await L(page);
    const lane4 = await laneClick(page, o, 4);
    const c = await L(page); await sleep(400); const d = await L(page);
    const ev = await page.evaluate(() => ({ mm: window.__mm, pd: window.__pd, fr: window.__fr }));
    const lag = (pd) => { const m = ev.mm.find((x) => x.t >= pd); if (!m) return null; const frames = ev.fr.filter((t) => t > pd && t <= m.t).length; return { ms: +(m.t - pd).toFixed(1), framesBetween: frames, m: m.m }; };
    r.lags = ev.pd.map(lag);
    r.a = { m: a.m, pos: a.pos, phv: a.phv, playing: a.playing }; r.b = { m: b.m, x: b.x, pos: b.pos, phv: b.phv, playing: b.playing, phx: b.ph.x }; r.c = { m: c.m, x: c.x, pos: c.pos, phv: c.phv, playing: c.playing, phx: c.ph.x }; r.d = { pos: d.pos, phv: d.phv, playing: d.playing, phx: d.ph.x };
    r.dxB = b.m ? +(b.x - (o.x0 + Number(b.m) * o.pps)).toFixed(2) : null;
    r.dxC = +(c.x - (o.x0 + 4 * o.pps)).toFixed(2);
    await shot(page, 'playing-click', k);
    await key(page, 'Space', 300); r.errors = errors; await ctx.close();
    r.pass = a.playing && b.playing && c.playing && d.playing && Math.abs(Number(b.m) - 6) < 0.15 && c.m === '4.000' && Math.abs(r.dxB) <= 1 && Math.abs(r.dxC) <= 1 && d.phv > c.phv && c.phv > a.phv && r.lags.every((l) => l && l.framesBetween <= 1) && Math.abs(c.ph.x - c.x) > 5 && errors.length === 0;
    return r;
  },
  async range(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp); const r = {};
    const o = await origin(page); const g = await geo(page);
    await laneClick(page, o, 1);
    const clip = await page.evaluate(() => { const c = document.querySelector('[data-track-id="music"] [data-clip-id]'); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    const ry = clip.y + clip.h * 0.7; r.dragHit = await hit(page, o.x0 + 5 * o.pps, ry);
    await page.mouse.move(o.x0 + 5 * o.pps, ry); await page.mouse.down(); await page.mouse.move(o.x0 + 6 * o.pps, ry, { steps: 6 }); await page.mouse.move(o.x0 + 7 * o.pps, ry, { steps: 6 }); await page.mouse.up(); await sleep(350);
    r.withRange = await L(page); await shot(page, 'range', k);
    await page.keyboard.press('Space'); const st0 = []; for (let i = 0; i < 4; i += 1) { await sleep(50); st0.push((await L(page)).pos); } r.spaceFromRange = st0;
    r.lineWhilePlayingRange = (await L(page)).hidden;
    await key(page, 'Space', 400);
    r.afterStop = await L(page);
    const t = k === '1440x900' ? 8 : 3; await laneClick(page, o, t);
    r.cleared = await L(page); r.clearedDx = +(r.cleared.x - (o.x0 + t * o.pps)).toFixed(2); r.clearT = t;
    await shot(page, 'range-cleared', k);
    r.errors = errors; await ctx.close();
    r.pass = r.withRange.range === 1 && r.withRange.hidden === true && /^00:0(4\.9|5\.0)/.test(r.spaceFromRange[0]) && r.cleared.range === 0 && r.cleared.hidden === false && r.cleared.m === `${t}.000` && Math.abs(r.clearedDx) <= 1 && errors.length === 0;
    return r;
  },
  async home(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp); const r = {};
    const o = await origin(page); await laneClick(page, o, 6);
    r.before = (await L(page)).m;
    await page.evaluate(() => { window.__hm = []; const l = document.querySelector('[data-testid="arrangement-insert-marker"]'); window.__hmo = new MutationObserver((ms) => ms.forEach(() => window.__hm.push({ m: l.getAttribute('data-insert-marker'), left: l.style.left }))).observe(l, { attributes: true, attributeFilter: ['data-insert-marker', 'style'] }); });
    await key(page, 'Home', 400);
    r.muts = await page.evaluate(() => window.__hm);
    r.after = await L(page); r.dxHeader = +(r.after.x - o.x0).toFixed(2);
    r.markerMuts = r.muts.length;
    // Home during playback
    await laneClick(page, o, 3); await key(page, 'Space', 1000);
    const p0 = await L(page); await page.keyboard.press('Home'); await sleep(150); const p1 = await L(page); await sleep(500); const p2 = await L(page);
    r.playHome = { p0: { pos: p0.pos, phv: p0.phv, playing: p0.playing, m: p0.m }, p1: { pos: p1.pos, phv: p1.phv, playing: p1.playing, m: p1.m }, p2: { pos: p2.pos, phv: p2.phv, playing: p2.playing, m: p2.m } };
    await key(page, 'Space', 300); r.errors = errors; await ctx.close();
    const vals = r.muts.map((x) => x.m);
    r.pass = r.before === '6.000' && r.after.m === '0.000' && Math.abs(r.dxHeader) <= 1 && vals.filter((v, i) => i === 0 || v !== vals[i - 1]).length <= 2 && vals.every((v) => v === '0.000' || v === '6.000') && p1.playing && p2.playing && p1.phv < 0.5 && p2.phv > p1.phv && p1.m === '0.000' && errors.length === 0;
    return r;
  },
  async zoom(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { rm: 'reduce' }); const r = { steps: [] };
    const o = await origin(page); await laneClick(page, o, 2); await blur(page);
    const m = async (tag) => { const s = await L(page); const t = await tickX(page, '0:02'); const g = await geo(page); r.steps.push({ tag, m: s.m, x: s.x, tick: t, dTick: t == null ? null : +(s.x - t).toFixed(2), pps: g.pps, phx: s.ph.x }); };
    await m('start'); await key(page, 'Minus', 400); await m('-'); await key(page, 'Equal', 400); await m('='); await key(page, 'Minus', 400); await key(page, 'Minus', 400); await m('--');
    const sc = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); return { sw: s.scrollWidth, cw: s.clientWidth }; }); r.sc = sc;
    await key(page, 'Equal', 300); await key(page, 'Equal', 300); await key(page, 'Equal', 300); await m('+++');
    const box = await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect().toJSON());
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.keyboard.down('Shift'); await page.mouse.wheel(0, 120); await page.keyboard.up('Shift'); await sleep(400);
    r.scrollLeft = await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft);
    await m('scroll');
    await shot(page, 'zoom-scroll', k);
    r.errors = errors; await ctx.close();
    r.pass = r.steps.every((s) => s.m === '2.000' && s.dTick != null && Math.abs(s.dTick) <= 1) && r.scrollLeft > 0 && errors.length === 0;
    return r;
  },
  async sheet(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      const prev = await page.evaluate(() => (document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName));
      await page.keyboard.press('Shift+Slash'); await sleep(500);
      const d = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return null;
        const rows = [...dlg.querySelectorAll('[data-shortcut-id]')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), action: li.querySelector('span').textContent, keys: [...li.querySelectorAll('kbd')].map((x) => x.textContent), h: Math.round(li.getBoundingClientRect().height) }));
        let sc = null; for (let e = dlg.querySelector('[data-shortcut-id]'); e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { sc = { tag: e.tagName, cls: e.className.slice(0, 80), sh: e.scrollHeight, ch: e.clientHeight }; break; } }
        const tr = dlg.querySelector('section[aria-labelledby$="-transport"]') || [...dlg.querySelectorAll('section')].find((s) => s.querySelector('h3')?.textContent === 'Transport');
        return { rows, sc, transport: tr ? [...tr.querySelectorAll('[data-shortcut-id]')].map((li) => li.getAttribute('data-shortcut-id')) : null, transportH: tr ? Math.round(tr.getBoundingClientRect().height) : null, dlgH: Math.round(dlg.getBoundingClientRect().height) };
      });
      r[tag] = d; await shot(page, `sheet-${tag}`, k);
      await page.keyboard.type('insert marker'); await sleep(400);
      r[tag + 'Search'] = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((li) => li.getAttribute('data-shortcut-id')));
      await shot(page, `sheet-search-${tag}`, k);
      await page.keyboard.press('Escape'); await sleep(400);
      r[tag + 'AfterEsc'] = await page.evaluate(() => ({ open: !!document.querySelector('[role="dialog"]'), active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName }));
      r[tag + 'Prev'] = prev; r[tag + 'Errors'] = errors; await ctx.close();
    }
    const EXP = [['play-stop', 'Play from the insert marker or the selection start · Stop', ['Space']], ['continue-playback', 'Continue from where playback stopped', ['Shift+Space']], ['insert-marker-to-playhead', 'Move the insert marker to the playhead', ['Ctrl+Shift+Space']], ['back-to-start', 'Back to start (the insert marker too)', ['Home']], ['play-from-point', null, null], ['loop', null, null]];
    const by = Object.fromEntries((r.new?.rows || []).map((x) => [x.id, x]));
    r.textOk = EXP.every(([id, a, kk]) => by[id] && (a == null || (by[id].action === a && JSON.stringify(by[id].keys) === JSON.stringify(kk))));
    r.orderOk = JSON.stringify(r.new?.transport) === JSON.stringify(EXP.map((e) => e[0]));
    r.markerOk = by.marker?.action === 'Add a marker at the selection start, the insert marker, or the playhead while playing';
    r.searchOk = ['play-stop', 'insert-marker-to-playhead', 'back-to-start', 'marker'].every((id) => r.newSearch.includes(id));
    r.scrollDelta = r.new?.sc && r.head?.sc ? r.new.sc.sh - r.head.sc.sh : null;
    const hb = Object.fromEntries((r.head?.rows || []).map((x) => [x.id, x.h])); r.heightChanges = (r.new?.rows || []).filter((x) => hb[x.id] !== x.h).map((x) => ({ id: x.id, head: hb[x.id] ?? null, new: x.h }));
    r.escOk = !r.newAfterEsc.open && r.newAfterEsc.active === r.headAfterEsc.active;
    r.pass = r.textOk && r.orderOk && r.markerOk && r.searchOk && r.escOk && r.scrollDelta !== null && r.scrollDelta <= 0;
    return r;
  },
  async titles(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page } = await open(browser, vp, { base, zoom: false });
      const get = () => page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^(Play|Pause|Back to start)/.test(b.getAttribute('title') || '')).map((b) => ({ title: b.getAttribute('title'), keys: b.getAttribute('aria-keyshortcuts'), label: b.getAttribute('aria-label') })));
      r[tag] = { stopped: await get() }; await key(page, 'Space', 400); r[tag].playing = await get(); await key(page, 'Space', 300); await ctx.close();
    }
    r.pass = JSON.stringify(r.new) === JSON.stringify(r.head) && JSON.stringify(r.new).includes('Play (Space)') && JSON.stringify(r.new).includes('Pause (Space)') && JSON.stringify(r.new).includes('Back to start (Home)');
    return r;
  },
  async focus(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page } = await open(browser, vp, { base, zoom: false });
      await page.locator('button[aria-label="Play"]').first().focus();
      const seq = []; let lineFocused = false;
      for (let i = 0; i < 45; i += 1) { await page.keyboard.press('Tab'); await sleep(40); const a = await page.evaluate(() => { const a = document.activeElement; return { id: (a?.getAttribute('data-testid') || '') + '|' + (a?.getAttribute('aria-label') || a?.getAttribute('title') || a?.tagName || '').slice(0, 50), line: a?.getAttribute('data-testid') === 'arrangement-insert-marker' }; }); if (a.line) lineFocused = true; seq.push(a.id); }
      r[tag] = { seq, lineFocused }; await ctx.close();
    }
    r.same = JSON.stringify(r.new.seq) === JSON.stringify(r.head.seq);
    if (!r.same) r.diff = r.new.seq.map((s, i) => (s !== r.head.seq[i] ? { i, new: s, head: r.head.seq[i] } : null)).filter(Boolean).slice(0, 10);
    r.pass = r.same && !r.new.lineFocused;
    return r;
  },
  async neighbours(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { rm: 'reduce' }); const r = {};
    const o = await origin(page); await laneClick(page, o, 2);
    const ln = await L(page); const clip0 = await page.evaluate(() => { const c = document.querySelector('[data-track-id="music"] [data-clip-id]'); const b = c.getBoundingClientRect(); return { start: c.getAttribute('data-clip-start'), y: b.y, h: b.height, x: b.x }; });
    const y = clip0.y + clip0.h * 0.35;
    r.hitAtLine = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { tid: e?.closest('[data-testid]')?.getAttribute('data-testid'), clip: !!e?.closest('[data-clip-id]') }; }, [ln.x + 0.5, clip0.y + 8]);
    // drag the clip by its title bar starting exactly at the line x, +1 s, Alt free
    await page.mouse.move(ln.x + 0.5, clip0.y + 8); await page.mouse.down(); await page.mouse.move(ln.x + 0.5 + o.pps * 0.5, clip0.y + 8, { steps: 5 }); await page.mouse.move(ln.x + 0.5 + o.pps, clip0.y + 8, { steps: 5 }); await page.mouse.up(); await sleep(400);
    r.clipStartAfterDrag = await page.evaluate(() => document.querySelector('[data-track-id="music"] [data-clip-id]').getAttribute('data-clip-start'));
    r.lineAfterDrag = (await L(page)).m;
    await key(page, 'Control+z', 400); r.clipStartAfterUndo = await page.evaluate(() => document.querySelector('[data-track-id="music"] [data-clip-id]').getAttribute('data-clip-start'));
    r.y = y; r.errors = errors; await shot(page, 'neighbours', k); await ctx.close();
    r.pass = r.hitAtLine.clip && r.clipStartAfterDrag !== clip0.start && r.clipStartAfterUndo === clip0.start && errors.length === 0;
    r.clipStart0 = clip0.start;
    return r;
  },
  async pastEnd(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { zoom: false }); const r = {};
    const o = await origin(page); const g = await geo(page); r.pps = o.pps;
    await key(page, 'Space', 500);
    const x = o.x0 + 16.4 * o.pps; r.inView = x < g.scRight; r.hit = await hit(page, x, lowerY(g));
    if (r.inView) { await page.mouse.click(x, lowerY(g)); await sleep(300); r.l = await L(page); r.dx = +(r.l.x - (o.x0 + Number(r.l.m) * o.pps)).toFixed(2); r.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent); }
    await key(page, 'Space', 400); r.stopStatus = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    await key(page, 'Space', 500); r.afterSpace = await L(page); r.afterStatus = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    await shot(page, 'past-end', k); r.errors = errors; await ctx.close(); r.observe = true; return r;
  },
};
const STANDALONE = {
  async budget(browser, vp, k, base = BASE) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: false, base });
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
    const exp = k.startsWith('1440x900') ? [85, 101] : [69, 85];
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
STANDALONE.storeHome = async (browser, vp, k) => {
  const r = {}; const shots = {};
  for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' }); const page = await ctx.newPage(); const cons = []; const perr = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') cons.push(m.type() + ':' + m.text().slice(0, 160)); }); page.on('pageerror', (e) => perr.push(String(e).slice(0, 200)));
    await page.goto(`${base}/`, { waitUntil: 'load' }); await sleep(5000);
    shots[tag] = await page.screenshot(); fs.writeFileSync(path.join(outDir, `store-home-${tag}-${k}.png`), shots[tag]);
    r[tag] = { console: [...new Set(cons)].sort(), pageErrors: perr, kf: await page.evaluate(() => { const out = []; for (const ss of document.styleSheets) { try { for (const ru of ss.cssRules) if (ru.type === 7 && ru.name === 'insert-marker-blink') out.push(ru.name); } catch (e) {} } return out; }) };
    if (tag === 'new') r.cmpPage = page; else { await page.close(); }
    r[tag + 'Ctx'] = ctx;
  }
  const page = r.cmpPage;
  r.diff = await page.evaluate(async ([a, b]) => { const ld = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; }; const x = await ld(a); const y = await ld(b); let n = 0; for (let j = 0; j < x.length; j += 4) if (Math.abs(x[j] - y[j]) + Math.abs(x[j + 1] - y[j + 1]) + Math.abs(x[j + 2] - y[j + 2]) > 30) n += 1; return { diffPx: n, total: x.length / 4 }; }, [shots.new.toString('base64'), shots.head.toString('base64')]);
  await r.newCtx.close(); await r.headCtx.close(); delete r.cmpPage; delete r.newCtx; delete r.headCtx;
  r.consoleSame = JSON.stringify(r.new.console) === JSON.stringify(r.head.console);
  r.pass = r.consoleSame && r.new.pageErrors.length === r.head.pageErrors.length && r.diff.diffPx / r.diff.total < 0.01;
  return r;
};
STANDALONE.budgetHead = async (browser, vp, k) => {return STANDALONE.budget(browser, vp, k + '-head', HEADB); };
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of [...Object.entries(ROWS), ...Object.entries(STANDALONE)]) {
      if (filter && !filter.test(name)) continue;
      if (name === 'storeHome' && k !== '1280x720') continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { R.rows[key2] = await fn(browser, vp, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
