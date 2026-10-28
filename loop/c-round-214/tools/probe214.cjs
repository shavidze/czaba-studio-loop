// C round 214 — PROBE-214. C's own commit counter (independent of perf/lib/instrumentation.ts).
// Definition: a component fiber (tags 0,1,11,14,15) counts as rendered in commit N when it is in the
// committed tree, was NOT part of the committed tree at commit N-1 (a fresh work-in-progress object),
// and either has the PerformedWork flag or is a new mount (alternate === null). Full tree walk.
// usage: node probe214.cjs <base> <drag: range|fade> <state: stopped|playing> [runs]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:5189';
const DRAG = process.argv[3] || 'range';
const STATE = process.argv[4] || 'stopped';
const RUNS = Number(process.argv[5] || 3);
const OUT = path.join(__dirname, '..', 'out');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function init() {
  const W = window;
  const P = { commits: [], starts: [], downs: [], moves: [], ups: [], versions: [] };
  W.__P = P;
  const seen = new WeakMap();
  let n = 0;
  const tags = new Set([0, 1, 11, 14, 15]);
  W.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    isDisabled: false,
    renderers: new Map(),
    inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); if (r && typeof r.version === 'string') P.versions.push(r.version); return id; },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onCommitFiberRoot(_id, root) {
      n += 1;
      let rendered = 0;
      const stack = [root.current];
      while (stack.length) {
        const f = stack.pop();
        const prev = seen.get(f);
        if (tags.has(f.tag) && prev !== n - 1 && ((f.flags & 1) === 1 || f.alternate === null)) rendered += 1;
        seen.set(f, n);
        for (let c = f.child; c; c = c.sibling) stack.push(c);
      }
      P.commits.push({ t: performance.now(), rendered });
    },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
  };
  const proto = AudioBufferSourceNode.prototype;
  const o = proto.start;
  proto.start = function (...a) { const r = o.apply(this, a); if (!(this.context instanceof OfflineAudioContext)) P.starts.push(performance.now()); return r; };
  const AC = W.AudioContext;
  W.__ctxs = [];
  W.AudioContext = class extends AC { constructor(...a) { super(...a); W.__ctxs.push(this); } };
  addEventListener('pointerdown', () => P.downs.push(performance.now()), true);
  addEventListener('pointermove', () => P.moves.push(performance.now()), true);
  addEventListener('pointerup', () => P.ups.push(performance.now()), true);
}

async function oneRun(browser, run) {
  const R = { run, drag: DRAG, state: STATE };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  try {
    await page.goto(BASE + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const add = page.getByRole('button', { name: 'Add', exact: true });
    await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); }, null, { timeout: 90000, polling: 'raf' });
    await sleep(1000);
    await add.click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid=arrangement-clip-waveform]').length === 1, null, { timeout: 60000 });
    await sleep(1500);
    R.versions = await page.evaluate(() => window.__P.versions);
    if (STATE === 'playing') {
      await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
      await page.keyboard.press('Home');
      await page.keyboard.press('Space');
      await sleep(1500);
      R.playLabel = await page.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label');
      R.ctxStates = await page.evaluate(() => window.__ctxs.map((c) => c.state));
      R.startsSincePlay = await page.evaluate(() => window.__P.starts.length);
    }
    const clip = page.locator('[data-clip-kind="audio"]').first();
    // grab point
    const g = await clip.evaluate((el, drag) => {
      const t = drag === 'range' ? [...el.querySelectorAll('[title]')].find((x) => x.getAttribute('title') === 'drag = time selection · click = playhead') : el.querySelector('[data-testid=arrangement-clip-fade-in-handle]');
      if (!t) return null;
      const b = t.getBoundingClientRect();
      if (drag === 'fade') return { x: b.left + b.width / 2, y: b.top + b.height / 2, box: [b.left, b.top, b.width, b.height] };
      const y = b.top + b.height * 0.6;
      const x = Math.max(b.left, 0) + 250;
      const h = document.elementFromPoint(x, y);
      return { x, y, ok: !!(h && t.contains(h)), box: [b.left, b.top, b.width, b.height] };
    }, DRAG);
    R.grab = g;
    const before = await clip.evaluate((el) => ({ fade: el.getAttribute('data-fade-in'), text: (el.textContent || '').match(/\d\d:\d\d\.\d{3} – \d\d:\d\d\.\d{3}/)?.[0] || null }));
    R.before = before;
    const t0 = await page.evaluate(() => performance.now());
    await page.mouse.move(g.x, g.y);
    await page.mouse.down();
    await page.mouse.move(g.x + 60, g.y, { steps: 30 });
    R.mid = await clip.evaluate((el) => ({ fade: el.getAttribute('data-fade-in'), text: (el.textContent || '').match(/\d\d:\d\d\.\d{3} – \d\d:\d\d\.\d{3}/)?.[0] || null, rangeEls: document.querySelectorAll('[data-range-start]').length }));
    await page.mouse.move(g.x + 120, g.y, { steps: 30 });
    R.end = await clip.evaluate((el) => ({ fade: el.getAttribute('data-fade-in'), text: (el.textContent || '').match(/\d\d:\d\d\.\d{3} – \d\d:\d\d\.\d{3}/)?.[0] || null, rangeEls: document.querySelectorAll('[data-range-start]').length }));
    await page.mouse.up();
    await sleep(1500);
    const P = await page.evaluate((t0) => { const P = window.__P; const f = (a) => a.filter((t) => t >= t0); return { commits: P.commits.filter((c) => c.t >= t0), starts: f(P.starts), downs: f(P.downs), moves: f(P.moves), ups: f(P.ups) }; }, t0);
    const down = P.downs.at(-1);
    const up = P.ups.find((t) => t > down);
    const moves = P.moves.filter((t) => t > down && t < up);
    const first = moves[0];
    const win = P.commits.filter((c) => c.t > first && c.t < up);
    const sum = win.reduce((s, c) => s + c.rendered, 0);
    R.moves = moves.length;
    R.windowCommits = win.length;
    R.componentsSum = sum;
    R.componentsPerMove = +(sum / moves.length).toFixed(3);
    R.commitsPerMove = +(win.length / moves.length).toFixed(3);
    R.componentsMax = Math.max(0, ...win.map((c) => c.rendered));
    R.perCommitHistogram = win.reduce((h, c) => { h[c.rendered] = (h[c.rendered] || 0) + 1; return h; }, {});
    R.moveRestarts = P.starts.filter((t) => t > first && t < up).length;
    R.releaseRestarts = P.starts.filter((t) => t >= up).length;
    R.releaseCommits = P.commits.filter((c) => c.t >= up).length;
    if (STATE === 'playing') R.playLabelAfter = await page.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label');
  } catch (e) { R.fatal = String(e && e.stack || e).slice(0, 800); }
  R.pageErrors = errs;
  await ctx.close();
  return R;
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const runs = [];
  for (let i = 1; i <= RUNS; i++) runs.push(await oneRun(browser, i));
  await browser.close();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `probe-${DRAG}-${STATE}.json`), JSON.stringify(runs, null, 1));
  for (const r of runs) console.log(JSON.stringify({ run: r.run, drag: r.drag, state: r.state, perMove: r.componentsPerMove, commitsPerMove: r.commitsPerMove, max: r.componentsMax, moves: r.moves, moveRestarts: r.moveRestarts, releaseRestarts: r.releaseRestarts, before: r.before, mid: r.mid, end: r.end, hist: r.perCommitHistogram, play: r.playLabel, ctx: r.ctxStates, v: r.versions, fatal: r.fatal, errs: r.pageErrors }));
})();
