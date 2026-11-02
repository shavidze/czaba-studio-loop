const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || 'http://127.0.0.1:5173';
const tag = process.argv[3] || 'new';
const only = process.argv[4] ? process.argv[4].split(',') : null;
const dir = __dirname;
const outFile = `${dir}/probe-r274-${tag}.json`;
const out = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
const save = () => fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
const st = (p) => p.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]');
  return {
    marker: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'),
    pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
    playing: document.querySelector('[data-playing]')?.getAttribute('data-playing') === 'true',
    follow: document.querySelector('[data-testid="arrangement-follow"]')?.getAttribute('data-follow-mode'),
    status: s?.textContent,
    range: document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null,
    rms: window.__c272rms ? window.__c272rms() : null,
  };
});
const AUDIO_TAP = () => {
  const analysers = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    if (dest instanceof AudioDestinationNode) {
      const ctx = dest.context;
      if (!ctx.__tap) { ctx.__tap = ctx.createAnalyser(); ctx.__tap.fftSize = 2048; orig.call(ctx.__tap, dest); analysers.push(ctx.__tap); }
      orig.call(this, ctx.__tap, ...rest);
      return orig.call(this, dest, ...rest) && dest;
    }
    return orig.call(this, dest, ...rest);
  };
  window.__c272rms = () => {
    let best = 0;
    for (const a of analysers) { const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; best = Math.max(best, Math.sqrt(s / b.length)); }
    return Math.round(best * 10000) / 10000;
  };
};
async function setup(b, vp) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(AUDIO_TAP);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(base + '/studio-lab');
  await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
  await sleep(800);
  await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
  await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
  await p.evaluate(() => document.activeElement?.blur());
  const g = await p.evaluate(() => {
    const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft = 0;
    const r = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect();
    const strip = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]').getBoundingClientRect();
    return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: r.y + r.height - 3, sy: strip.y + strip.height / 2 };
  });
  await sleep(300);
  g.x0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
  return { ctx, p, g, errors };
}
const lowerClick = (p, g, t, opts) => p.mouse.click(g.x0 + t * g.pps, g.by, opts);
// state: a stopped T text at marker 4
async function stoppedAt4(p, g) {
  await p.keyboard.press('Space'); await sleep(600);
  await lowerClick(p, g, 4); await sleep(350);
  await p.keyboard.press('Space'); await sleep(500);
}
const countMutations = (p) => p.evaluate(() => { const o = document.querySelector('[data-testid="arrangement-status"]'); window.__mut = 0; window.__mo && window.__mo.disconnect(); window.__mo = new MutationObserver((m) => { window.__mut += m.length; }); window.__mo.observe(o, { childList: true, subtree: true, characterData: true }); });
const readMutations = (p) => p.evaluate(() => window.__mut);
async function laneDrag(p, g, from, to) {
  const lane = await p.evaluate(() => { const e = document.querySelector('[data-track-id="music"] [data-grid-seconds]'); const b = e.getBoundingClientRect(); return { y: b.y, h: b.height }; });
  const y = lane.y + lane.h * 0.75;
  await p.mouse.move(g.x0 + from * g.pps, y); await p.mouse.down();
  const mid = (from + to) / 2;
  await p.mouse.move(g.x0 + mid * g.pps, y, { steps: 6 }); await p.mouse.move(g.x0 + to * g.pps, y, { steps: 6 });
  return async () => { await p.mouse.up(); await sleep(400); };
}
const clipInfo = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), start: e.getAttribute('data-clip-start'), sel: e.className.includes('ring-brand'), x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y, w: e.getBoundingClientRect().width })));
const seq = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"] span')?.outerHTML?.length ?? null);
async function selectFirstClip(p) {
  const c = (await clipInfo(p))[0];
  await p.mouse.click(c.x + Math.min(40, c.w / 2), c.y + 5); await sleep(350);
  await p.evaluate(() => document.activeElement?.blur && document.activeElement.tagName !== 'BODY' && null);
}

function wavInfo(buf) {
  const id = (o) => buf.toString('ascii', o, o + 4);
  let o = 12, fmt = null, data = null;
  while (o + 8 <= buf.length) { const c = id(o), n = buf.readUInt32LE(o + 4); if (c === 'fmt ') fmt = { tag: buf.readUInt16LE(o + 8), ch: buf.readUInt16LE(o + 10), sr: buf.readUInt32LE(o + 12), bits: buf.readUInt16LE(o + 22) }; if (c === 'data') data = { off: o + 8, len: Math.min(n, buf.length - o - 8) }; o += 8 + n + (n % 2); }
  const bps = fmt.bits / 8, frames = Math.floor(data.len / (bps * fmt.ch));
  const rd = (i) => fmt.tag === 3 ? buf.readFloatLE(data.off + i * bps) : fmt.bits === 16 ? buf.readInt16LE(data.off + i * 2) / 32768 : fmt.bits === 24 ? buf.readIntLE(data.off + i * 3, 3) / 8388608 : buf.readInt32LE(data.off + i * 4) / 2147483648;
  let first = -1, nan = 0, clip = 0, peak = 0; const winRms = [];
  for (let f = 0; f < frames; f++) { let m = 0; for (let c = 0; c < fmt.ch; c++) { const v = rd(f * fmt.ch + c); if (!Number.isFinite(v)) nan++; const a = Math.abs(v); if (a >= 0.9999) clip++; if (a > m) m = a; } if (m > peak) peak = m; if (first < 0 && m > 1e-4) first = f; }
  for (const [a, b] of [[0, 0.95], [1.0, 1.5], [0, 0.5]]) { let s = 0, n = 0; for (let f = Math.floor(a * fmt.sr); f < Math.min(frames, Math.floor(b * fmt.sr)); f++) { const v = rd(f * fmt.ch); s += v * v; n++; } winRms.push({ a, b, rms: n ? Math.sqrt(s / n) : null }); }
  return { ...fmt, frames, duration: frames / fmt.sr, firstAudibleFrame: first, firstAudibleSec: first / fmt.sr, nan, clip, peak, winRms, sha256: require('crypto').createHash('sha256').update(buf).digest('hex') };
}
async function exportCase(p, r, nudge) {
  if (nudge) { await selectFirstClip(p); await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); }
  r.clips = await clipInfo(p);
  await p.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = p.getByRole('dialog'); await dlg.waitFor();
  const dlP = p.waitForEvent('download', { timeout: 120000 });
  await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const dl = await dlP; const file = `${dir}/export-${tag}-${nudge ? 'nudged' : 'control'}-${r.vp}.wav`; await dl.saveAs(file);
  r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
  r.statusAfterExport = await st(p);
}
const scenarios = {
  async nudgeSingle(p, g, r) {
    r.clipsBefore = await clipInfo(p); r.before = await st(p);
    await selectFirstClip(p); r.afterSelect = await st(p); r.clipsSel = await clipInfo(p);
    r.active = await p.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName);
    await countMutations(p);
    await p.keyboard.press('ArrowRight'); await sleep(400);
    r.afterRight = await st(p); r.clipsAfter = await clipInfo(p); r.mutAfterRight = await readMutations(p);
    r.undoTitle = await p.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.title).find((t) => t && t.startsWith('Undo')) ?? null);
    await countMutations(p);
    await p.keyboard.down('ArrowRight'); await sleep(60); await p.keyboard.down('ArrowRight'); await sleep(60); await p.keyboard.down('ArrowRight'); await sleep(60); await p.keyboard.up('ArrowRight'); await sleep(400);
    r.afterHeld = await st(p); r.clipsHeld = await clipInfo(p); r.mutHeld = await readMutations(p);
    await p.keyboard.press('ArrowLeft'); await sleep(400); r.afterLeft = await st(p); r.clipsLeft = await clipInfo(p);
  },
  async nudgeGroup(p, g, r) {
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    r.clipsBefore = await clipInfo(p); r.before = await st(p);
    await selectFirstClip(p);
    await p.keyboard.press('Control+a'); await sleep(400); r.afterSelAll = await st(p); r.clipsSel = await clipInfo(p);
    await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); r.clipsAfter = await clipInfo(p);
  },
  async detailEnterTwice(p, g, r) {
    await selectFirstClip(p);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterDrag = await st(p);
    const start = p.locator('[data-testid="arrangement-detail-start"]');
    r.startVisible = await start.isVisible().catch(() => false);
    if (!r.startVisible) return;
    await start.click(); await sleep(200);
    await countMutations(p);
    await p.keyboard.press('Enter'); await sleep(400); r.afterEnter1 = await st(p); r.mut1 = await readMutations(p);
    await countMutations(p);
    await p.keyboard.press('Enter'); await sleep(400); r.afterEnter2 = await st(p); r.mut2 = await readMutations(p);
    const gain = p.locator('[data-testid="arrangement-detail-clip-gain-input"]');
    r.gainVisible = await gain.isVisible().catch(() => false);
    if (r.gainVisible) {
      await gain.click(); await sleep(200);
      await countMutations(p);
      await p.keyboard.press('Enter'); await sleep(400); r.gainEnter1 = await st(p); r.gmut1 = await readMutations(p);
      await countMutations(p);
      await p.keyboard.press('Enter'); await sleep(400); r.gainEnter2 = await st(p); r.gmut2 = await readMutations(p);
    }
  },
  async repeatPastEnd(p, g, r) {
    await lowerClick(p, g, 17); await sleep(350); r.marker17 = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(500); r.refused = await st(p);
    await selectFirstClip(p); r.afterSelect = await st(p);
    await countMutations(p);
    await p.keyboard.down('ArrowRight'); await sleep(80); r.d1 = await st(p);
    await p.keyboard.down('ArrowRight'); await sleep(80); r.d2 = await st(p);
    await p.keyboard.down('ArrowRight'); await sleep(80); r.d3 = await st(p);
    await p.keyboard.up('ArrowRight'); await sleep(400);
    r.afterHeld = await st(p); r.mutHeld = await readMutations(p); r.clips = await clipInfo(p);
  },
  async playingWithRange(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.playing = await st(p);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterRangeDrag = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Control+ArrowLeft'); await sleep(400); r.afterCtrlLeft = await st(p);
    await p.mouse.click(g.x0 + 6 * g.pps, g.sy); await sleep(500); r.afterStrip = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace2 = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop2 = await st(p);
  },
  async ctrlLeftRangeStop(p, g, r) {
    await stoppedAt4(p, g);
    await p.keyboard.press('Space'); await sleep(500); r.playing = await st(p);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterRangeDrag = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Control+ArrowLeft'); await sleep(400); r.afterCtrlLeft = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace2 = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop2 = await st(p);
  },
  async nudgeAudio(p, g, r) {
    await selectFirstClip(p);
    await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); r.clips = await clipInfo(p);
    await p.keyboard.press('Home'); await sleep(300); r.afterHome = await st(p);
    await p.keyboard.press('Space');
    r.samples = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 3200) { const s = await st(p); r.samples.push({ t: Date.now() - t0, pos: s.pos, rms: s.rms, playing: s.playing }); await sleep(100); }
    await p.keyboard.press('Space'); await sleep(300);
  },
  async baselineAudio(p, g, r) {
    await p.keyboard.press('Home'); await sleep(300);
    await p.keyboard.press('Space');
    r.samples = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 3200) { const s = await st(p); r.samples.push({ t: Date.now() - t0, pos: s.pos, rms: s.rms }); await sleep(100); }
    await p.keyboard.press('Space'); await sleep(300);
  },

  async heldPerStep(p, g, r) {
    await selectFirstClip(p);
    await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); r.clipsRight = await clipInfo(p);
    r.reads = [];
    await countMutations(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('ArrowRight'); await sleep(120); const s = await st(p); const c = await clipInfo(p); r.reads.push({ status: s.status, start: c[0].start, mut: await readMutations(p) }); }
    await p.keyboard.up('ArrowRight'); await sleep(400);
    r.afterHeld = await st(p); r.clipsHeld = await clipInfo(p);
    await countMutations(p);
    await p.keyboard.press('ArrowLeft'); await sleep(400); r.afterLeft = await st(p); r.clipsLeft = await clipInfo(p); r.mutLeft = await readMutations(p);
  },
  async groupBoth(p, g, r) {
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    r.before = await st(p);
    r.boxBefore = await p.evaluate(() => { const b = document.querySelector('[data-testid="arrangement-status"]').getBoundingClientRect(); return { h: b.height, w: b.width }; });
    await selectFirstClip(p);
    await p.keyboard.press('Control+a'); await sleep(400);
    await countMutations(p);
    await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); r.clipsRight = await clipInfo(p); r.mutRight = await readMutations(p);
    r.boxRight = await p.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const b = s.getBoundingClientRect(); return { h: b.height, w: b.width, sw: s.scrollWidth, cw: s.clientWidth, docOverflow: document.documentElement.scrollWidth > innerWidth }; });
    await p.screenshot({ path: `${dir}/shots/width-group-${r.vp}.png` });
    await countMutations(p);
    await p.keyboard.press('ArrowLeft'); await sleep(400); r.afterLeft = await st(p); r.clipsLeft = await clipInfo(p); r.mutLeft = await readMutations(p);
    // held group: fresh down, then 2 repeats
    await countMutations(p);
    await p.keyboard.down('ArrowRight'); await sleep(150); r.heldFirst = await st(p); r.mutHeldFirst = await readMutations(p); r.clipsHeldFirst = await clipInfo(p);
    await countMutations(p);
    await p.keyboard.down('ArrowRight'); await sleep(150); await p.keyboard.down('ArrowRight'); await sleep(150);
    r.heldRepeats = await st(p); r.mutHeldRepeats = await readMutations(p); r.clipsHeldRepeats = await clipInfo(p);
    await p.keyboard.up('ArrowRight'); await sleep(300);
  },
  async nudgeUndo(p, g, r) {
    await selectFirstClip(p);
    await p.keyboard.press('ArrowRight'); await sleep(400); r.afterRight = await st(p); r.clipsRight = await clipInfo(p);
    await p.keyboard.press('Control+z'); await sleep(400); r.afterUndo = await st(p); r.clipsUndo = await clipInfo(p);
    await p.keyboard.press('Control+Shift+z'); await sleep(400); r.afterRedo = await st(p); r.clipsRedo = await clipInfo(p);
  },
  async nudgeBlocked(p, g, r) {
    await selectFirstClip(p); r.clips0 = await clipInfo(p);
    await countMutations(p);
    await p.keyboard.press('ArrowLeft'); await sleep(400); r.afterPress = await st(p); r.mutPress = await readMutations(p);
    await countMutations(p);
    await p.keyboard.down('ArrowLeft'); await sleep(150); r.mutHoldFirstDown = await readMutations(p);
    await countMutations(p);
    await p.keyboard.down('ArrowLeft'); await sleep(150); await p.keyboard.down('ArrowLeft'); await sleep(150);
    r.mutHoldRepeats = await readMutations(p); r.afterHold = await st(p);
    await p.keyboard.up('ArrowLeft'); await sleep(300); r.clipsEnd = await clipInfo(p);
  },
  async pastEndPlay(p, g, r) {
    await lowerClick(p, g, 17); await sleep(350); r.marker17 = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(500); r.refused = await st(p);
    await selectFirstClip(p);
    await p.keyboard.down('ArrowRight'); await sleep(100); await p.keyboard.down('ArrowRight'); await sleep(100); await p.keyboard.down('ArrowRight'); await sleep(100);
    await p.keyboard.up('ArrowRight'); await sleep(400);
    r.afterHeld = await st(p); r.clips = await clipInfo(p);
    await countMutations(p);
    await p.keyboard.press('Space');
    r.play = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 1500) { const s = await st(p); r.play.push({ t: Date.now() - t0, pos: s.pos, rms: s.rms, playing: s.playing, status: s.status }); await sleep(150); }
    r.mutDuringPlay = await readMutations(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop = await st(p); r.mutAfterStop = await readMutations(p);
  },
  async enterTwiceExpand(p, g, r) {
    await selectFirstClip(p);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterDrag = await st(p);
    const start = p.locator('[data-testid="arrangement-detail-start"]');
    r.startVisibleBefore = await start.isVisible().catch(() => false);
    if (!r.startVisibleBefore) {
      const exp = p.locator('[data-testid="arrangement-detail-panel"] button', { hasText: /Expand/ });
      r.expandCount = await exp.count();
      if (r.expandCount) { await exp.first().click(); await sleep(500); }
      r.afterExpand = await st(p);
    }
    r.startVisible = await start.isVisible().catch(() => false);
    if (!r.startVisible) return;
    await start.click(); await sleep(200);
    await countMutations(p);
    await p.keyboard.press('Enter'); await sleep(400); r.afterEnter1 = await st(p); r.mut1 = await readMutations(p);
    await countMutations(p);
    await p.keyboard.press('Enter'); await sleep(400); r.afterEnter2 = await st(p); r.mut2 = await readMutations(p);
    const gain = p.locator('[data-testid="arrangement-detail-clip-gain-input"]');
    r.gainVisible = await gain.isVisible().catch(() => false);
    if (r.gainVisible) {
      await gain.click(); await sleep(200);
      await countMutations(p);
      await p.keyboard.press('Enter'); await sleep(400); r.gainEnter1 = await st(p); r.gmut1 = await readMutations(p);
      await countMutations(p);
      await p.keyboard.press('Enter'); await sleep(400); r.gainEnter2 = await st(p); r.gmut2 = await readMutations(p);
    }
  },
  async floatDrift(p, g, r) {
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    await p.locator('[data-testid="arrangement-snap-toggle"]').click(); await sleep(300);
    r.snap = await p.locator('[data-testid="arrangement-snap-toggle"]').getAttribute('aria-pressed');
    await p.evaluate(() => document.activeElement?.blur());
    await selectFirstClip(p);
    await p.keyboard.press('Control+a'); await sleep(300);
    r.steps = [];
    for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowRight'); await sleep(250); r.steps.push({ status: (await st(p)).status, starts: (await clipInfo(p)).map((c) => c.start) }); }
  },
  async exportNudged(p, g, r) { await exportCase(p, r, true); },
  async exportControl(p, g, r) { await exportCase(p, r, false); },
  async detail1280(p, g, r) {
    await selectFirstClip(p);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterDrag = await st(p);
    r.dom = await p.evaluate(() => {
      const q = (id) => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), display: cs.display, vis: cs.visibility, text: e.textContent.slice(0, 120) }; };
      return { panel: q('arrangement-detail-panel'), content: q('arrangement-detail-content'), hint: q('arrangement-detail-hint'), reason: q('arrangement-detail-reason'), range: q('arrangement-detail-range'), start: q('arrangement-detail-start'), sep: q('arrangement-detail-separator'), vh: innerHeight, vw: innerWidth };
    });
    await p.screenshot({ path: `${dir}/shots/head-detail1280-${r.vp}.png` });
  },
};
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`; out[key] = out[key] || {};
    for (const [name, fn] of Object.entries(scenarios)) {
      if (only && !only.includes(name)) continue;
      const { ctx, p, g, errors } = await setup(b, vp);
      const r = { vp: key, g };
      try { await fn(p, g, r); } catch (e) { r.exception = String(e).slice(0, 300); }
      r.errors = errors;
      await p.screenshot({ path: `${dir}/shots/${tag}-${name}-${key}.png` });
      out[key][name] = r; save(); await ctx.close();
      console.log(key, name, 'done', r.exception || '');
    }
  }
  await b.close();
})();
