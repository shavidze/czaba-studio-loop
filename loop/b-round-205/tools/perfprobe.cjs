// B round 205->206 planning probe: proves the PERF-1 measurement methods on a prod build.
// usage: node perfprobe.cjs <port> <tag>
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const [port, tag] = [process.argv[2] || '5186', process.argv[3] || 'head'];
const OUT = path.join(__dirname, '..', 'out');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const initScript = () => {
  const perf = { commits: 0, committed: [], starts: 0, events: [], loaf: [], longtasks: [], mark: 'load' };
  window.__perf = perf;
  const COMPONENT_TAGS = new Set([0, 1, 11, 14, 15]);
  const countRendered = (root) => {
    let n = 0;
    const visit = (fiber) => {
      let child = fiber.child;
      while (child) {
        const alt = child.alternate;
        if (COMPONENT_TAGS.has(child.tag)) {
          if (alt === null || (child.flags & 1) === 1) n += 1;
        }
        if (alt === null || child.child !== alt.child || (child.flags & 1) === 1) visit(child);
        child = child.sibling;
      }
    };
    visit(root.current);
    return n;
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    isDisabled: false,
    renderers: new Map(),
    inject(renderer) { const id = this.renderers.size + 1; this.renderers.set(id, renderer); return id; },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onCommitFiberRoot(_id, root) { perf.commits += 1; perf.committed.push({ mark: perf.mark, n: countRendered(root) }); },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
  };
  for (const C of [AudioScheduledSourceNode, AudioBufferSourceNode, OscillatorNode, ConstantSourceNode]) {
    if (!Object.prototype.hasOwnProperty.call(C.prototype, 'start')) continue;
    const orig = C.prototype.start;
    C.prototype.start = function (...args) { perf.starts += 1; return orig.apply(this, args); };
  }
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) perf.events.push({ mark: perf.mark, name: e.name, d: e.duration, p: e.processingEnd - e.processingStart }); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
  } catch (e) { perf.eventErr = String(e); }
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) perf.loaf.push({ mark: perf.mark, d: e.duration, block: e.blockingDuration }); }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) { perf.loafErr = String(e); }
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) perf.longtasks.push({ mark: perf.mark, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
  } catch (e) { perf.ltErr = String(e); }
  // handler-time wrapper: time spent synchronously in pointermove dispatch (capture at window start, bubble at window end)
  perf.frames = [];
  let last = 0;
  const tick = (t) => { if (last) perf.frames.push({ mark: perf.mark, d: t - last }); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  perf.moves = [];
  perf.inputs = [];
  let t0 = 0;
  let i0 = 0;
  window.addEventListener('input', () => { i0 = performance.now(); }, true);
  window.addEventListener('input', () => { perf.inputs.push({ mark: perf.mark, d: performance.now() - i0 }); }, false);
  window.addEventListener('pointermove', () => { t0 = performance.now(); }, true);
  window.addEventListener('pointermove', () => { perf.moves.push({ mark: perf.mark, d: performance.now() - t0 }); }, false);
};

const summary = async (page, mark) => page.evaluate((m) => {
  const p = window.__perf;
  const sel = (a) => a.filter((x) => x.mark === m);
  const c = sel(p.committed).map((x) => x.n);
  const mv = sel(p.moves).map((x) => x.d).sort((a, b) => a - b);
  const q = (a, f) => (a.length ? a[Math.min(a.length - 1, Math.floor(a.length * f))] : null);
  return {
    mark: m, commits: c.length, committedMax: c.length ? Math.max(...c) : 0, committedMedian: q([...c].sort((a, b) => a - b), 0.5),
    committedTotal: c.reduce((a, b) => a + b, 0),
    inputs: sel(p.inputs).length, inputP50: q(sel(p.inputs).map((x) => x.d).sort((a, b) => a - b), 0.5), inputP95: q(sel(p.inputs).map((x) => x.d).sort((a, b) => a - b), 0.95), inputMax: Math.max(0, ...sel(p.inputs).map((x) => x.d)),
    frames: sel(p.frames).length, frameP95: q(sel(p.frames).map((x) => x.d).sort((a, b) => a - b), 0.95), frameMax: Math.max(0, ...sel(p.frames).map((x) => x.d)), framesOver33: sel(p.frames).filter((x) => x.d > 33.4).length,
    moves: mv.length, moveHandlerP50: q(mv, 0.5), moveHandlerP95: q(mv, 0.95), moveHandlerMax: mv[mv.length - 1] ?? null,
    events16: sel(p.events).filter((e) => e.name === 'pointermove').length, eventsAll: sel(p.events).length,
    loaf: sel(p.loaf).length, loafMax: Math.max(0, ...sel(p.loaf).map((x) => x.d)), longtasks: sel(p.longtasks).length,
    starts: p.starts, errs: [p.eventErr, p.loafErr, p.ltErr].filter(Boolean),
  };
}, mark);

const setMark = (page, m) => page.evaluate((x) => { window.__perf.mark = x; }, m);
const startsNow = (page) => page.evaluate(() => window.__perf.starts);

async function drag(page, locator, steps) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) return false;
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.05, y, { steps });
  await page.mouse.move(b.x + b.width * 0.95, y, { steps });
  await page.mouse.up();
  return true;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_analytics_consent', 'denied'); });
  await ctx.addInitScript(initScript);
  const page = await ctx.newPage();
  const throttle = Number(process.argv[4] || 1);
  if (throttle > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(4000);
  const res = { tag, hookReceivedCommits: await page.evaluate(() => window.__perf.commits), load: await summary(page, 'load') };
  await setMark(page, 'add');
  await page.locator('button').filter({ hasText: /^\s*Add\s*$/ }).first().click();
  await sleep(2000);
  res.add = await summary(page, 'add');
  const sliders = await page.evaluate(() => [...document.querySelectorAll('input[type=range]')].map((x) => x.getAttribute('aria-label')));
  res.sliders = sliders;
  const vol = page.locator('input[type=range][aria-label="Volume — Music"]').first();
  const pan = page.locator('input[type=range][aria-label="Pan — Music"]').first();
  for (const playing of [false, true]) {
    if (playing) {
      await setMark(page, 'play');
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await page.keyboard.press('Space');
      await sleep(1500);
      res.play = await summary(page, 'play');
      res.playLabel = await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label]')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label'))); return b && b.getAttribute('aria-label'); });
    }
    const master = page.locator('input[type=range][aria-label="Master Volume"]').first();
    for (const [name, loc] of [['volume', vol], ['pan', pan], ['master', master]]) {
      const m = `${name}-${playing ? 'playing' : 'stopped'}`;
      await setMark(page, m);
      const s0 = await startsNow(page);
      const ok = await drag(page, loc, 60);
      await sleep(600);
      res[m] = { ok, ...(await summary(page, m)), startsDuringDrag: (await startsNow(page)) - s0 };
    }
  }
  await setMark(page, 'idle-playing');
  await sleep(3000);
  res.idlePlaying = await summary(page, 'idle-playing');
  res.errors = errors;
  fs.writeFileSync(path.join(OUT, `perfprobe-${tag}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
