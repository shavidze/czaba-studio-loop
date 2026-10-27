// C round 208 independent probe (written by C; does not import or copy perf/ code).
// Measures: React commits per drag phase (before-first-move / move window / after pointerup),
// move -> rAF -> MessageChannel latency (paired by payload id), injected 30 ms listener liveness,
// slider values at drag ends, realtime AudioScheduledSourceNode.start() calls during drags.
// usage: node c208probe.cjs <baseUrl> <outJson> [vw vh] [passes]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const base = process.argv[2];
const out = process.argv[3];
const vw = Number(process.argv[4] || 1440);
const vh = Number(process.argv[5] || 900);
const passes = Number(process.argv[6] || 1);
const BUSY = 30;

const init = () => {
  const TAGS = new Set([0, 1, 11, 14, 15]);
  const st = { commits: [], starts: [], downs: [], ups: [], moves: [], lat: [] };
  window.__c208 = st;
  const count = (root) => {
    let n = 0;
    const stack = [];
    const cur = root.current;
    if (cur && cur.child) stack.push(cur.child);
    while (stack.length) {
      let f = stack.pop();
      for (; f; f = f.sibling) {
        const alt = f.alternate;
        if (TAGS.has(f.tag) && (alt === null || (f.flags & 1) === 1)) n += 1;
        if (f.child && (alt === null || f.child !== alt.child)) stack.push(f.child);
      }
    }
    return n;
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: false,
    supportsFiber: true,
    renderers: new Map(),
    inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; },
    onCommitFiberRoot(_id, root) { st.commits.push({ t: performance.now(), n: count(root) }); },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    checkDCE() {},
  };
  const P = window.AudioBufferSourceNode && window.AudioBufferSourceNode.prototype;
  if (P) {
    const o = P.start;
    P.start = function (...a) {
      if (!(this.context instanceof OfflineAudioContext)) st.starts.push(performance.now());
      return o.apply(this, a);
    };
  }
  const ch = new MessageChannel();
  ch.port1.onmessage = (e) => { const { id, t0 } = e.data; st.lat.push({ id, t0, d: performance.now() - t0 }); };
  const opt = { capture: true, passive: true };
  addEventListener('pointermove', () => {
    const t0 = performance.now();
    const id = st.moves.length;
    st.moves.push(t0);
    requestAnimationFrame(() => ch.port2.postMessage({ id, t0 }));
  }, opt);
  addEventListener('pointerdown', () => st.downs.push(performance.now()), opt);
  addEventListener('pointerup', () => st.ups.push(performance.now()), opt);
  try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {}
};

const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
const r1 = (x) => (x === null ? null : Math.round(x * 10) / 10);

async function quiet(page, ms = 600, cap = 8000) {
  const t0 = Date.now();
  let last = await page.evaluate(() => window.__c208.commits.length);
  let since = Date.now();
  while (Date.now() - t0 < cap) {
    await page.waitForTimeout(100);
    const n = await page.evaluate(() => window.__c208.commits.length);
    if (n !== last) { last = n; since = Date.now(); } else if (Date.now() - since >= ms) break;
  }
}

async function playing(page) {
  return page.evaluate(() => {
    const b = [...document.querySelectorAll('button[aria-label="Pause"],button[aria-label="Play"]')][0];
    return b ? b.getAttribute('aria-label') : null;
  });
}

async function drag(page, loc, label) {
  if ((await loc.count()) !== 1) throw new Error('not unique: ' + label);
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const max = Number(await loc.getAttribute('max'));
  const min = Number(await loc.getAttribute('min'));
  const y = b.y + b.height / 2;
  const tA = await page.evaluate(() => performance.now());
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  const v0 = Number(await loc.inputValue());
  await page.mouse.move(b.x + b.width * 0.05, y, { steps: 60 });
  const vL = Number(await loc.inputValue());
  await page.mouse.move(b.x + b.width * 0.95, y, { steps: 60 });
  const vH = Number(await loc.inputValue());
  await page.mouse.up();
  await quiet(page);
  await page.waitForTimeout(200);
  const r = await page.evaluate((tA) => {
    const s = window.__c208;
    const down = s.downs.filter((t) => t >= tA).at(-1);
    const up = s.ups.find((t) => t > down);
    const moves = s.moves.filter((t) => t >= tA && t <= up);
    const winMoves = moves.filter((t) => t > down && t < up);
    const first = winMoves[0];
    const cs = s.commits.filter((c) => c.t >= tA);
    const pre = cs.filter((c) => c.t <= first);
    const win = cs.filter((c) => c.t > first && c.t < up);
    const post = cs.filter((c) => c.t >= up);
    const lat = s.lat.filter((x) => x.t0 >= tA && x.t0 <= up).map((x) => x.d);
    return {
      moves: moves.length, winMoves: winMoves.length,
      pre: pre.map((c) => c.n), win: win.map((c) => c.n), post: post.map((c) => c.n),
      lat, starts: s.starts.filter((t) => t >= tA).length,
    };
  }, tA);
  const mx = (a) => (a.length ? Math.max(...a) : 0);
  const res = {
    label, min, max, v0, vL, vH,
    ends: vL < v0 && v0 < vH ? 'strict' : vL < v0 && v0 === max && vH === max ? 'max' : 'NONE',
    moves: r.moves, winMoves: r.winMoves,
    preCommits: r.pre.length, preMax: mx(r.pre),
    winCommits: r.win.length, winMax: mx(r.win), winPerMove: r.winMoves ? Math.round((r.win.reduce((a, b) => a + b, 0) / r.winMoves) * 1000) / 1000 : 0,
    releaseCommits: r.post.length, releaseMax: mx(r.post),
    latSamples: r.lat.length, latP95: r1(pct(r.lat, 0.95)), latMedian: r1(pct(r.lat, 0.5)),
    over16: r.lat.length ? Math.round((r.lat.filter((x) => x > 16).length / r.lat.length) * 1000) / 1000 : 0,
    startsDuringDrag: r.starts,
    playState: await playing(page),
  };
  console.log(JSON.stringify(res));
  return res;
}

async function inject(page, mode) {
  await page.evaluate(({ mode, busy }) => {
    const spin = () => { const e = performance.now() + busy; while (performance.now() < e) {} };
    const ch = new MessageChannel();
    ch.port1.onmessage = spin;
    const fn = mode === 'sync' ? spin : () => ch.port2.postMessage(0);
    addEventListener('pointermove', fn);
    window.__c208rm = () => { removeEventListener('pointermove', fn); ch.port1.close(); };
  }, { mode, busy: BUSY });
}

async function listenerCount(cdp) {
  const { result } = await cdp.send('Runtime.evaluate', { expression: 'window' });
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
  return listeners.filter((l) => l.type === 'pointermove').length;
}

async function space(page, want) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.keyboard.press('Space');
  for (let i = 0; i < 50 && (await playing(page)) !== want; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(1000);
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const all = [];
  for (let pass = 0; pass < passes; pass++) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    await ctx.addInitScript(init);
    const page = await ctx.newPage();
    await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await page.waitForTimeout(2000);
    const sl = (n) => page.getByRole('slider', { name: n, exact: typeof n === 'string' });
    const rows = [];
    rows.push({ state: 'stopped', ...(await drag(page, sl('Volume — Music'), 'track')) });
    rows.push({ state: 'stopped', ...(await drag(page, sl('Master Volume'), 'master')) });
    rows.push({ state: 'stopped', ...(await drag(page, sl('Pan — Music'), 'pan')) });
    // liveness
    const cdp = await ctx.newCDPSession(page);
    const l0 = await listenerCount(cdp);
    const live = {};
    for (const mode of ['sync', 'deferred']) {
      await inject(page, mode);
      const lInj = await listenerCount(cdp);
      live[mode] = { listenersWhileInjected: lInj, ...(await drag(page, sl('Pan — Music'), 'pan-' + mode)) };
      await page.evaluate(() => { window.__c208rm(); window.__c208rm = undefined; });
    }
    const l1 = await listenerCount(cdp);
    live.control = await drag(page, sl('Pan — Music'), 'pan-control');
    live.listenersStart = l0; live.listenersAfterRemoval = l1;
    await space(page, 'Pause');
    rows.push({ state: 'playing', ...(await drag(page, sl('Volume — Music'), 'track')) });
    rows.push({ state: 'playing', ...(await drag(page, sl('Master Volume'), 'master')) });
    await space(page, 'Play');
    await page.getByRole('button', { name: 'Stems — set as the active track', exact: true }).click();
    await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click({ modifiers: ['Shift'] });
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await page.keyboard.press('Control+g');
    await page.waitForTimeout(800);
    const g = sl(/^Volume — .+ \(group\)$/);
    rows.push({ state: 'stopped', ...(await drag(page, g, 'group')) });
    await space(page, 'Pause');
    rows.push({ state: 'playing', ...(await drag(page, g, 'group')) });
    await space(page, 'Play');
    await page.screenshot({ path: out.replace(/\.json$/, `-pass${pass}.png`) });
    all.push({ pass, vw, vh, rows, live });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(all, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
