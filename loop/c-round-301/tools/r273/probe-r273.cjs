const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || 'http://127.0.0.1:5173';
const tag = process.argv[3] || 'new';
const only = process.argv[4] ? process.argv[4].split(',') : null;
const dir = __dirname;
const outFile = `${dir}/probe-r273-${tag}.json`;
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
const scenarios = {

  async naturalEnd(p, g, r) {
    await p.keyboard.press('Space'); await sleep(600);
    await lowerClick(p, g, 14.5); await sleep(350);
    await p.keyboard.press('Space'); await sleep(500); r.stopped = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.playing = await st(p);
    await sleep(2400); r.afterEnd = await st(p);
  },
  async shiftSpace(p, g, r) {
    await stoppedAt4(p, g);
    await p.keyboard.press('Space'); await sleep(1200);
    await p.keyboard.press('Space'); await sleep(400); r.stopped = await st(p);
    await p.keyboard.press('Shift+Space'); await sleep(500); r.afterShiftSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop = await st(p);
    await p.keyboard.press('Control+Shift+Space'); await sleep(400); r.afterToPlayhead = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop2 = await st(p);
  },
  async loopOn(p, g, r) {
    await stoppedAt4(p, g);
    await p.keyboard.press('Control+l'); await sleep(400); r.afterLoopKey = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(400); r.afterStop = await st(p);
  },

  async spaceFromStart(p, g, r) {
    await p.keyboard.press('Space'); await sleep(600);
    await lowerClick(p, g, 16); await sleep(350);
    await p.keyboard.press('Space'); await sleep(500); r.stopped = await st(p);
    await p.keyboard.press('Space'); r.samples = [];
    for (let i = 0; i < 4; i++) { await sleep(250); r.samples.push(await st(p)); }
    r.afterSpace = r.samples[0];
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async audioPlaying(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await p.keyboard.press('Space'); r.samples = [];
    for (let i = 0; i < 5; i++) { await sleep(250); r.samples.push(await st(p)); }
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
    await sleep(400); r.silentAfterStop = await st(p);
  },
  async followResumed(p, g, r) {
    await p.mouse.click(g.x0 + 2.1 * g.pps, g.sy); await sleep(600); r.afterStrip = await st(p);
    await p.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft += 200; s.dispatchEvent(new Event('scroll')); }); await sleep(400);
    r.afterScroll = await st(p);
    await p.locator('[data-testid="arrangement-follow"]').click(); await sleep(400); r.afterFollow = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace2 = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop2 = await st(p);
  },
  async width(p, g, r) {
    const box = () => p.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const b = s.getBoundingClientRect(); return { h: b.height, w: b.width, sw: s.scrollWidth, cw: s.clientWidth, docOverflow: document.documentElement.scrollWidth > innerWidth, text: s.textContent }; });
    await p.keyboard.press('Space'); await sleep(600);
    await lowerClick(p, g, 16); await sleep(350);
    await p.keyboard.press('Space'); await sleep(500); r.fromStartStopped = await box();
    await p.screenshot({ path: `${dir}/shots/${tag}-width-fromstart-${r.vp}.png` });
    await p.keyboard.press('Home'); await sleep(300);
    await lowerClick(p, g, 4); await sleep(350);
    await p.keyboard.press('Space'); await sleep(600); r.playingFrom = await box();
    await p.screenshot({ path: `${dir}/shots/${tag}-width-playingfrom-${r.vp}.png` });
    await p.keyboard.press('Space'); await sleep(400);
  },
  async rangeWhilePlaying(p, g, r) {
    await stoppedAt4(p, g); await p.keyboard.press('Space'); await sleep(500); r.playing = await st(p);
    await countMutations(p);
    const up = await laneDrag(p, g, 2, 5); r.duringDrag = await st(p); r.mutationsDuringDrag = await readMutations(p);
    await up(); r.afterDrag = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async rangeThenClear(p, g, r) {
    await stoppedAt4(p, g);
    const up = await laneDrag(p, g, 2, 5); await up(); r.afterDrag = await st(p);
    await p.keyboard.press('Control+z'); await sleep(400); r.afterUndo = await st(p);
    await lowerClick(p, g, 7); await sleep(400); r.afterLowerClick7 = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async faderRelease(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    const f = await p.evaluate(() => { const e = document.querySelector('[data-track-id="music"] input[type="range"]') || document.querySelector('input[type="range"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, label: e.getAttribute('aria-label') }; });
    r.fader = f;
    if (f) { await countMutations(p); await p.mouse.move(f.x, f.y); await p.mouse.down(); await p.mouse.move(f.x - 15, f.y, { steps: 5 }); r.during = await st(p); r.mutDuring = await readMutations(p); await p.mouse.up(); await sleep(400); r.afterRelease = await st(p); r.mutTotal = await readMutations(p); }
  },
  async rangeDrag(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await countMutations(p);
    const up = await laneDrag(p, g, 2, 5);
    r.duringDrag = await st(p); r.mutationsDuringDrag = await readMutations(p);
    await up(); r.afterDrag = await st(p); r.mutationsTotal = await readMutations(p);
    await p.screenshot({ path: `${dir}/shots/${tag}-rangeDrag-afterDrag-${r.vp}.png` });
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async spaceFromStopped(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async spaceCtrlLeft(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace = await st(p);
    await p.keyboard.press('Control+ArrowLeft'); await sleep(400); r.afterCtrlLeft = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async clobberAdded(p, g, r) {
    r.before = await st(p);
    await p.keyboard.press('Space'); await sleep(600); r.afterSpace = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async stripFromStopped(p, g, r) {
    await stoppedAt4(p, g); r.stopped = await st(p);
    await p.mouse.click(g.x0 + 6 * g.pps, g.sy); await sleep(500); r.afterStrip = await st(p);
    await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p);
  },
  async selPastEndHome(p, g, r) {
    const up = await laneDrag(p, g, 17, 18); await up(); r.afterDrag = await st(p);
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press('Space'); await sleep(500); r.refused = await st(p);
    await p.keyboard.press('Home'); await sleep(400); r.afterHome = await st(p);
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
