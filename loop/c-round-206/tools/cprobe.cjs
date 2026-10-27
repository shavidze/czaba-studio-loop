// C round 206 independent probe: components re-rendered per commit during fader drags,
// and AudioScheduledSourceNode start() calls on realtime contexts. Written by C, not derived from perf/.
// usage: node cprobe.cjs <baseUrl> <outJson> [viewportW viewportH]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const base = process.argv[2];
const out = process.argv[3];
const vw = Number(process.argv[4] || 1440);
const vh = Number(process.argv[5] || 900);

const init = () => {
  const COMPONENT_TAGS = new Set([0, 1, 11, 14, 15]);
  const st = { commits: [], starts: [], ctxs: [] };
  window.__cprobe = st;
  const countRendered = (root) => {
    let n = 0;
    const visit = (f) => {
      // iterative over siblings, recursive into children only where re-rendered subtree changed
      for (let fiber = f; fiber; fiber = fiber.sibling) {
        const alt = fiber.alternate;
        const rendered = alt === null || (fiber.flags & 1) === 1;
        if (COMPONENT_TAGS.has(fiber.tag) && rendered) n += 1;
        if (fiber.child && (alt === null || fiber.child !== alt.child)) visit(fiber.child);
      }
    };
    const cur = root.current;
    if (cur && cur.child) visit(cur.child);
    return n;
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: false,
    supportsFiber: true,
    renderers: new Map(),
    inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; },
    onCommitFiberRoot(_id, root) { st.commits.push({ t: performance.now(), n: countRendered(root) }); },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    checkDCE() {},
  };
  const proto = window.AudioScheduledSourceNode && window.AudioScheduledSourceNode.prototype;
  if (proto) {
    const orig = proto.start;
    proto.start = function (...a) {
      const offline = typeof OfflineAudioContext !== 'undefined' && this.context instanceof OfflineAudioContext;
      if (!offline) st.starts.push({ t: performance.now(), type: this.constructor.name });
      return orig.apply(this, a);
    };
    for (const C of ['AudioBufferSourceNode', 'OscillatorNode', 'ConstantSourceNode']) {
      const P = window[C] && window[C].prototype;
      if (P && Object.prototype.hasOwnProperty.call(P, 'start')) {
        const o2 = P.start;
        P.start = function (...a) {
          const offline = this.context instanceof OfflineAudioContext;
          if (!offline) st.starts.push({ t: performance.now(), type: C });
          return o2.apply(this, a);
        };
      }
    }
  }
  const AC = window.AudioContext;
  if (AC) {
    window.AudioContext = class extends AC { constructor(...a) { super(...a); st.ctxs.push(this); } };
  }
  st.events = []; st.inputs = 0;
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) st.events.push({ t: e.startTime, name: e.name, d: e.duration }); }).observe({ type: 'event', durationThreshold: 16, buffered: true }); } catch (e) { st.obsErr = String(e); }
  window.addEventListener('input', () => { st.inputs += 1; }, true);
  try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {}
};

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null; };

async function drag(page, name) {
  const loc = page.getByRole('slider', { name, exact: true });
  if ((await loc.count()) !== 1) throw new Error('slider not unique: ' + name + ' ' + (await loc.count()));
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width / 2, y);
  const in0 = await page.evaluate(() => window.__cprobe.inputs);
  const t0 = await page.evaluate(() => performance.now());
  await page.mouse.down();
  const v0 = await loc.inputValue();
  await page.mouse.move(b.x + b.width * 0.05, y, { steps: 60 });
  const vLow = await loc.inputValue();
  await page.mouse.move(b.x + b.width * 0.95, y, { steps: 60 });
  const vHigh = await loc.inputValue();
  await page.mouse.up();
  await page.waitForTimeout(800);
  const t1 = await page.evaluate(() => performance.now());
  const r = await page.evaluate(([a, z]) => {
    const st = window.__cprobe;
    const c = st.commits.filter((x) => x.t >= a && x.t <= z);
    const s = st.starts.filter((x) => x.t >= a && x.t <= z);
    const ev = st.events.filter((x) => x.t >= a && x.t <= z);
    const names = {}; for (const e of ev) names[e.name] = Math.max(names[e.name] || 0, Math.round(e.d));
    return { counts: c.map((x) => x.n), starts: s.length, states: st.ctxs.map((x) => x.state), eventNamesMaxDur: names, eventCount: ev.length };
  }, [t0, t1]);
  const inputEvents = (await page.evaluate(() => window.__cprobe.inputs)) - in0;
  return { name, inputEvents, eventNamesMaxDur: r.eventNamesMaxDur, eventCount: r.eventCount, v0, vLow, vHigh, commits: r.counts.length, cpcMedian: median(r.counts), cpcMax: Math.max(...r.counts, 0), starts: r.starts, ctxStates: r.states };
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = [];
  for (let pass = 0; pass < 3; pass++) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    await ctx.addInitScript(init);
    const page = await ctx.newPage();
    await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 60000 });
    await page.waitForTimeout(2500);
    const hookCommitsBefore = await page.evaluate(() => window.__cprobe.commits.length);
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await page.waitForTimeout(2000);
    const hookCommitsAfter = await page.evaluate(() => window.__cprobe.commits.length);
    const pr = { pass, hookCommitsBefore, hookCommitsAfter, rows: [] };
    for (const n of ['Volume — Music', 'Pan — Music']) pr.rows.push({ state: 'stopped', ...(await drag(page, n)) });
    await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); });
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    const playLabel = await page.getByRole('button', { name: /^(Play|Pause)$/ }).first().getAttribute('aria-label');
    pr.playLabel = playLabel;
    for (const n of ['Volume — Music', 'Pan — Music']) pr.rows.push({ state: 'playing', ...(await drag(page, n)) });
    pr.playLabelAfter = await page.getByRole('button', { name: /^(Play|Pause)$/ }).first().getAttribute('aria-label');
    if (pass === 2) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
      for (const n of ['Volume — Music', 'Pan — Music']) pr.rows.push({ state: 'playing-6x', ...(await drag(page, n)) });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
    pr.totalStarts = await page.evaluate(() => window.__cprobe.starts.length);
    await page.keyboard.press('Space');
    results.push(pr);
    console.log(JSON.stringify(pr));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
