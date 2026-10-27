// C round 209 independent probe (written by C; does not import perf/ code; commit counter pattern from C's own c208probe).
// Per fader (track, master, pan, group): keyboard to a start value below max, then a REAL mouse drag (Playwright mouse)
// with display samples at 25/50/75 %, React commits per phase, live AudioParam writes, realtime source starts,
// undo title after release, Ctrl+Z restore. Group: pointercancel mid-drag. Track: blur mid-drag.
// usage: node c209probe.cjs <baseUrl> <outJson> [vw vh]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const base = process.argv[2];
const out = process.argv[3];
const vw = Number(process.argv[4] || 1440);
const vh = Number(process.argv[5] || 900);

const init = () => {
  const TAGS = new Set([0, 1, 11, 14, 15]);
  const st = { commits: [], starts: [], downs: [], ups: [], moves: [], gw: [] };
  window.__c = st;
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
    isDisabled: false, supportsFiber: true, renderers: new Map(),
    inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; },
    onCommitFiberRoot(_id, root) { st.commits.push({ t: performance.now(), n: count(root) }); },
    onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, checkDCE() {},
  };
  const P = window.AudioBufferSourceNode && window.AudioBufferSourceNode.prototype;
  if (P) { const o = P.start; P.start = function (...a) { if (!(this.context instanceof OfflineAudioContext)) st.starts.push(performance.now()); return o.apply(this, a); }; }
  const ids = new WeakMap(); let next = 1;
  const pid = (p) => { if (!ids.has(p)) ids.set(p, next++); return ids.get(p); };
  const AP = AudioParam.prototype;
  for (const m of ['setTargetAtTime', 'setValueAtTime', 'linearRampToValueAtTime']) {
    const o = AP[m];
    AP[m] = function (v, ...rest) { st.gw.push({ t: performance.now(), id: pid(this), v, m }); return o.call(this, v, ...rest); };
  }
  const opt = { capture: true, passive: true };
  addEventListener('pointermove', () => st.moves.push(performance.now()), opt);
  addEventListener('pointerdown', () => st.downs.push(performance.now()), opt);
  addEventListener('pointerup', () => st.ups.push(performance.now()), opt);
  try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {}
};

const dbOf = (txt) => { if (!txt) return null; const m = txt.replace('−', '-').match(/(-?\+?[\d.]+|-inf|−∞)/); return m ? Number(m[1].replace('+', '')) : null; };

async function quiet(page, ms = 600, cap = 8000) {
  const t0 = Date.now();
  let last = await page.evaluate(() => window.__c.commits.length);
  let since = Date.now();
  while (Date.now() - t0 < cap) {
    await page.waitForTimeout(100);
    const n = await page.evaluate(() => window.__c.commits.length);
    if (n !== last) { last = n; since = Date.now(); } else if (Date.now() - since >= ms) break;
  }
}
const playState = (page) => page.evaluate(() => { const b = document.querySelector('button[aria-label="Pause"],button[aria-label="Play"]'); return b ? b.getAttribute('aria-label') : null; });
const undoTitle = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null; });
const display = (loc) => loc.evaluate((el) => {
  const row = el.closest('div');
  return { value: el.value, vt: el.getAttribute('aria-valuetext'), title: el.getAttribute('title'), fill: el.getAttribute('style'), rowText: row ? row.innerText.replace(/\s+/g, ' ').slice(0, 80) : null };
});
async function space(page, want) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.keyboard.press('Space');
  for (let i = 0; i < 50 && (await playState(page)) !== want; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(800);
}
async function keyTo(page, loc, target, key) {
  await loc.focus();
  let n = 0;
  for (; n < 300; n++) {
    const v = Number(await loc.inputValue());
    if ((key === 'ArrowDown' && v <= target) || (key === 'ArrowUp' && v >= target)) break;
    await page.keyboard.press(key);
  }
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(400);
  return { presses: n, value: Number(await loc.inputValue()), vt: await loc.getAttribute('aria-valuetext'), undo: await undoTitle(page) };
}

// mode: 'release' | 'cancel' | 'blur'
async function drag(page, loc, label, mode = 'release', shot) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  const before = await display(loc);
  const undoBefore = await undoTitle(page);
  const tA = await page.evaluate(() => performance.now());
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  const samples = [];
  // 50% -> 5% (60 steps), then 5% -> 95% (60 steps); sample at 25/50/75 % of the second leg
  await page.mouse.move(b.x + b.width * 0.05, y, { steps: 60 });
  const xs = [];
  for (let i = 1; i <= 60; i++) xs.push(b.x + b.width * (0.05 + (0.9 * i) / 60));
  const stopAt = mode === 'release' ? 60 : 30;
  for (let i = 0; i < stopAt; i++) {
    await page.mouse.move(xs[i], y);
    if (i === 14 || i === 29 || i === 44) {
      await page.waitForTimeout(60);
      const d = await display(loc);
      const gw = await page.evaluate((tA) => { const by = {}; for (const w of window.__c.gw) if (w.t >= tA) by[w.id] = w.v; return by; }, tA);
      samples.push({ at: Math.round(((i + 1) / 60) * 100), ...d, liveParams: gw });
      if (shot && i === 29) await page.screenshot({ path: shot });
    }
  }
  const mid = await display(loc);
  if (mode === 'cancel') {
    await loc.evaluate((el) => el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1, pointerType: 'mouse' })));
  } else if (mode === 'blur') {
    await loc.evaluate((el) => el.blur());
  }
  await page.waitForTimeout(150);
  const afterAbort = mode === 'release' ? null : await display(loc);
  await page.mouse.up();
  await quiet(page);
  await page.waitForTimeout(200);
  const after = await display(loc);
  const undoAfter = await undoTitle(page);
  const r = await page.evaluate((tA) => {
    const s = window.__c;
    const down = s.downs.filter((t) => t >= tA).at(-1);
    const up = s.ups.find((t) => t > down);
    const winMoves = s.moves.filter((t) => t > down && t < up);
    const first = winMoves[0];
    const cs = s.commits.filter((c) => c.t >= tA);
    const pre = cs.filter((c) => c.t <= first).map((c) => c.n);
    const win = cs.filter((c) => c.t > first && c.t < up).map((c) => c.n);
    const post = cs.filter((c) => c.t >= up).map((c) => c.n);
    const gwDrag = s.gw.filter((w) => w.t > down && w.t < up);
    const gwPost = s.gw.filter((w) => w.t >= up);
    const lastBy = (arr) => { const by = {}; for (const w of arr) by[w.id] = w.v; return by; };
    return { winMoves: winMoves.length, pre, win, post, starts: s.starts.filter((t) => t > down && t < up).length,
      gwDragCount: gwDrag.length, gwDragIds: [...new Set(gwDrag.map((w) => w.id))], lastDuring: lastBy(gwDrag), lastAfter: lastBy(gwPost) };
  }, tA);
  const mx = (a) => (a.length ? Math.max(...a) : 0);
  const res = {
    label, mode, playState: await playState(page), before, undoBefore, samples, mid, afterAbort, after, undoAfter,
    winMoves: r.winMoves, preCommits: r.pre.length, preMax: mx(r.pre),
    winCommits: r.win.length, winMax: mx(r.win), winPerMove: r.winMoves ? Math.round((r.win.reduce((a, c) => a + c, 0) / r.winMoves) * 1000) / 1000 : 0,
    releaseCommits: r.post.length, releaseMax: mx(r.post),
    sourceStartsDuringDrag: r.starts, gainWritesDuringDrag: r.gwDragCount, gainParamIds: r.gwDragIds, lastGainDuring: r.lastDuring, lastGainAfter: r.lastAfter,
  };
  return res;
}

async function undoCheck(page, loc) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  const tA = await page.evaluate(() => performance.now());
  await page.keyboard.press('Control+z');
  await quiet(page);
  const d = await display(loc);
  const gw = await page.evaluate((tA) => { const by = {}; for (const w of window.__c.gw) if (w.t >= tA) by[w.id] = w.v; return by; }, tA);
  return { afterUndo: d, undo: await undoTitle(page), gainWritesAfterUndo: gw };
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.waitForTimeout(2000);
  const sl = (n) => page.getByRole('slider', { name: n, exact: typeof n === 'string' });
  const tag = `${vw}x${vh}`;
  const shots = out.replace(/\.json$/, '');
  const R = { vw, vh, utc: new Date().toISOString() };

  // TRACK: keyboard to <= -12 dB (pending path), then playing drag with release
  const tv = sl('Volume — Music');
  R.trackKey = await keyTo(page, tv, -12, 'ArrowDown');
  await space(page, 'Pause');
  R.trackPlaying = await drag(page, tv, 'track', 'release', `${shots}-track-mid.png`);
  R.trackUndo = await undoCheck(page, tv);
  // TRACK blur mid-drag (playing)
  R.trackBlur = await drag(page, tv, 'track', 'blur');
  // MASTER: keyboard to <= -6 dB, playing drag
  const mv = sl('Master Volume');
  R.masterKey = await keyTo(page, mv, -6, 'ArrowDown');
  await space(page, 'Pause').catch(() => {});
  if ((await playState(page)) !== 'Pause') await space(page, 'Pause');
  R.masterPlaying = await drag(page, mv, 'master', 'release', `${shots}-master-mid.png`);
  R.masterUndo = await undoCheck(page, mv);
  // PAN
  const pv = sl('Pan — Music');
  if ((await playState(page)) !== 'Pause') await space(page, 'Pause');
  R.panPlaying = await drag(page, pv, 'pan', 'release', `${shots}-pan-mid.png`);
  R.panUndo = await undoCheck(page, pv);
  await space(page, 'Play');
  // GROUP
  await page.getByRole('button', { name: 'Stems — set as the active track', exact: true }).click();
  await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click({ modifiers: ['Shift'] });
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.keyboard.press('Control+g');
  await page.waitForTimeout(800);
  const gv = sl(/^Volume — .+ \(group\)$/);
  R.groupName = await gv.getAttribute('aria-label');
  R.groupKey = await keyTo(page, gv, -12, 'ArrowDown');
  await space(page, 'Pause');
  R.groupCancel = await drag(page, gv, 'group', 'cancel');
  R.groupPlaying = await drag(page, gv, 'group', 'release', `${shots}-group-mid.png`);
  R.groupUndo = await undoCheck(page, gv);
  await space(page, 'Play');
  R.errors = errors;
  await page.screenshot({ path: `${shots}-end.png` });
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(R, null, 2));
  console.log('done', tag);
})().catch((e) => { console.error(e); process.exit(1); });
