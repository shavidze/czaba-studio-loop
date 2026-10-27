// C round 211 — shared probe helpers (copied from c210lib, extended for clip gain) (written by C; does not import perf/ code).
// Commit counter pattern from C's own c208/c209 probes.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const SHOTS = path.join(ROOT, 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function init() {
  const TAGS = new Set([0, 1, 11, 14, 15]);
  const st = { commits: [], starts: [], cbs: [], downs: [], ups: [], moves: [], inputs: [], gw: [], status: [], keys: [] };
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
  const online = (p) => { try { return !(p.__ctx instanceof OfflineAudioContext); } catch (e) { return true; } };
  for (const m of ['setTargetAtTime', 'setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime']) {
    const o = AP[m];
    AP[m] = function (v, ...rest) { if (online(this)) st.gw.push({ t: performance.now(), id: pid(this), v, m }); return o.call(this, v, ...rest); };
  }
  const vd = Object.getOwnPropertyDescriptor(AP, 'value');
  Object.defineProperty(AP, 'value', { configurable: true, enumerable: vd.enumerable, get() { return vd.get.call(this); }, set(v) { if (online(this)) st.gw.push({ t: performance.now(), id: pid(this), v, m: 'value=' }); vd.set.call(this, v); } });
  // tag params created by offline contexts (export) so they are not mixed with the live graph
  const BAC = window.BaseAudioContext && window.BaseAudioContext.prototype;
  if (BAC) {
    for (const k of ['createGain', 'createStereoPanner']) {
      const o = BAC[k];
      BAC[k] = function (...a) { const n = o.apply(this, a); try { (n.gain || n.pan).__ctx = this; } catch (e) {} return n; };
    }
  }
  const opt = { capture: true, passive: true };
  addEventListener('pointermove', () => st.moves.push(performance.now()), opt);
  addEventListener('pointerdown', () => st.downs.push(performance.now()), opt);
  addEventListener('pointerup', () => st.ups.push(performance.now()), opt);
  addEventListener('input', (e) => { const el = e.target; if (el && el.type === 'range') st.inputs.push({ t: performance.now(), v: el.value, label: el.getAttribute('aria-label') }); }, opt);
  addEventListener('keydown', (e) => st.keys.push({ t: performance.now(), k: e.key, target: e.target && e.target.getAttribute ? e.target.getAttribute('aria-label') : null }), opt);
  const watch = () => {
    const s = document.querySelector('[data-testid=arrangement-status]');
    if (!s || s.__w) return;
    s.__w = 1;
    new MutationObserver(() => st.status.push({ t: performance.now(), text: s.textContent })).observe(s, { subtree: true, childList: true, characterData: true });
  };
  new MutationObserver(watch).observe(document, { subtree: true, childList: true });
  try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {}
}

async function launch() {
  return chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
}

async function openLab(browser, base, vw, vh, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, acceptDownloads: true });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 90000 });
  await sleep(2500);
  if (opts.add !== false) {
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await sleep(2000);
  }
  const tg = page.getByTestId('arrangement-detail-toggle');
  if ((await tg.count()) && (await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); await sleep(600); }
  return { ctx, page, errors };
}

const sl = (page, n) => page.getByRole('slider', { name: n, exact: typeof n === 'string' });
const playState = (page) => page.evaluate(() => { const b = document.querySelector('button[aria-label="Pause"],button[aria-label="Play"]'); return b ? b.getAttribute('aria-label') : null; });
const undoTitle = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null; });
const redoTitle = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.getAttribute('title') || '')); return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null; });
const statusText = (page) => page.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-status]'); return s ? s.textContent : null; });
const display = (loc) => loc.evaluate((el) => {
  const h = (str) => { let x = 5381; for (let i = 0; i < str.length; i++) x = ((x * 33) ^ str.charCodeAt(i)) >>> 0; return x.toString(16); };
  const row = el.parentElement;
  const base = { value: el.value, vt: el.getAttribute('aria-valuetext'), title: el.getAttribute('title'), fill: el.getAttribute('style'), rowText: row ? row.innerText.replace(/\s+/g, ' ').slice(0, 80) : null };
  if (el.getAttribute('aria-label') !== 'Clip Gain — fader') return base;
  const q = (id) => document.querySelector('[data-testid=' + id + ']');
  const f = q('arrangement-detail-clip-gain-input');
  const rs = q('arrangement-detail-clip-gain-reset');
  const rg = q('arrangement-detail-clip-gain-range');
  const pend = q('arrangement-detail-clip-gain-pending');
  const lanes = [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => { const p = c.querySelector('[data-testid=arrangement-clip-waveform] > path'); return p ? h(p.getAttribute('d') || '') : null; });
  const meters = [...document.querySelectorAll('[data-testid=arrangement-track-meter]')].map((e) => { const c = e.querySelector('span.origin-right'); return c ? c.style.transform : null; });
  const dw = q('arrangement-detail-waveform');
  const dp = dw ? dw.querySelector('svg[viewBox$=" 2"] > path') : null;
  return { ...base, field: f ? f.value : null, fieldTitle: f ? f.getAttribute('title') : null, fieldPending: f ? f.getAttribute('data-pending') : null, fieldWarn: f ? f.className.includes('border-warning') : null, fieldDescribedBy: f ? f.getAttribute('aria-describedby') : null,
    range: rg ? rg.textContent : null, resetDisabled: rs ? rs.disabled : null, resetTitle: rs ? rs.getAttribute('title') : null, pendingMarker: pend ? pend.textContent : null,
    laneD: lanes, detailD: dp ? h(dp.getAttribute('d') || '') : null, meters };
});
async function blurActive(page) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
}
async function space(page, want) {
  await blurActive(page);
  await page.keyboard.press('Space');
  for (let i = 0; i < 50 && (await playState(page)) !== want; i++) await sleep(100);
  await sleep(800);
}
async function quiet(page, ms = 600, cap = 8000) {
  const t0 = Date.now();
  let last = await page.evaluate(() => window.__c.commits.length);
  let since = Date.now();
  while (Date.now() - t0 < cap) {
    await sleep(100);
    const n = await page.evaluate(() => window.__c.commits.length);
    if (n !== last) { last = n; since = Date.now(); } else if (Date.now() - since >= ms) break;
  }
}
async function keyTo(page, loc, target, key) {
  await loc.focus();
  let n = 0;
  for (; n < 300; n++) {
    const v = Number(await loc.inputValue());
    if ((key === 'ArrowDown' && v <= target) || (key === 'ArrowUp' && v >= target)) break;
    await page.keyboard.press(key);
  }
  await blurActive(page);
  await sleep(400);
  return { presses: n, value: Number(await loc.inputValue()), vt: await loc.getAttribute('aria-valuetext'), undo: await undoTitle(page) };
}
const now = (page) => page.evaluate(() => performance.now());
const gwSince = (page, tA) => page.evaluate((tA) => { const by = {}; for (const w of window.__c.gw) if (w.t >= tA) by[w.id] = w.v; return by; }, tA);

// Generic drag. opts: mode 'release'|'cancel'|'blur'|'esc'; startFrac; perMove (read value after every move);
// delay ms per move; mid(i, ctx) async hook called after move i of leg 2; stopAt (moves of leg 2 before abort).
async function drag(page, loc, label, opts = {}) {
  const mode = opts.mode || 'release';
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  const before = await display(loc);
  const undoBefore = await undoTitle(page);
  const statusBefore = await statusText(page);
  const tA = await now(page);
  const startFrac = opts.startFrac ?? 0.5;
  await page.mouse.move(b.x + b.width * startFrac, y);
  await page.mouse.down();
  const values = [];
  const samples = [];
  const leg1 = [];
  for (let i = 1; i <= 60; i++) leg1.push(b.x + b.width * (startFrac + ((0.05 - startFrac) * i) / 60));
  for (const x of leg1) {
    await page.mouse.move(x, y);
    if (opts.delay) await sleep(opts.delay);
    if (opts.perMove) values.push(await loc.evaluate((el) => el.value));
  }
  const xs = [];
  for (let i = 1; i <= 60; i++) xs.push(b.x + b.width * (0.05 + (0.9 * i) / 60));
  const stopAt = opts.stopAt ?? 60;
  for (let i = 0; i < stopAt; i++) {
    await page.mouse.move(xs[i], y);
    if (opts.delay) await sleep(opts.delay);
    if (opts.perMove) values.push(await loc.evaluate((el) => el.value));
    if (i === 14 || i === 29 || i === 44) {
      await sleep(60);
      const d = await display(loc);
      samples.push({ at: Math.round(((i + 1) / 60) * 100), ...d, liveParams: await gwSince(page, tA) });
      if (opts.shot) await page.screenshot({ path: opts.shot.replace('-mid.png', '-' + Math.round(((i + 1) / 60) * 100) + '.png') });
    }
    if (opts.mid) await opts.mid(i, { b, y });
  }
  const mid = await display(loc);
  const statusMid = await statusText(page);
  if (mode === 'cancel') {
    await loc.evaluate((el) => el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1, pointerType: 'mouse' })));
  } else if (mode === 'blur') {
    await loc.evaluate((el) => el.blur());
  } else if (mode === 'esc') {
    await page.keyboard.press('Escape');
  }
  await sleep(150);
  const afterAbort = mode === 'release' ? null : await display(loc);
  const liveAfterAbort = mode === 'release' ? null : await gwSince(page, tA);
  await page.mouse.up();
  await quiet(page);
  await sleep(200);
  const after = await display(loc);
  const undoAfter = await undoTitle(page);
  const statusAfter = await statusText(page);
  const r = await page.evaluate((tA) => {
    const s = window.__c;
    const down = s.downs.filter((t) => t >= tA).at(-1);
    const up = s.ups.find((t) => t > down);
    const winMoves = s.moves.filter((t) => t > down && t < up);
    const first = winMoves[0];
    const cs = s.commits.filter((c) => c.t >= tA);
    const pre = cs.filter((c) => c.t <= first).map((c) => c.n);
    const win = cs.filter((c) => c.t > first && c.t < up);
    const post = cs.filter((c) => c.t >= up).map((c) => c.n);
    const gwDrag = s.gw.filter((w) => w.t > down && w.t < up);
    const gwPost = s.gw.filter((w) => w.t >= up);
    const lastBy = (arr) => { const by = {}; for (const w of arr) by[w.id] = w.v; return by; };
    // inputs (value changes) inside the window; a lagging thumb = an input with no commit before the next input or up
    const ins = s.inputs.filter((x) => x.t > down && x.t < up);
    let lag = 0;
    for (let i = 0; i < ins.length; i++) {
      const end = i + 1 < ins.length ? ins[i + 1].t : up;
      if (!win.some((c) => c.t >= ins[i].t && c.t <= end)) lag += 1;
    }
    const statusDuring = s.status.filter((x) => x.t > down && x.t < up).map((x) => x.text);
    const statusPost = s.status.filter((x) => x.t >= up).map((x) => x.text);
    const startsDuring = s.starts.filter((t) => t > down && t < up);
    return { winMoves: winMoves.length, pre, win: win.map((c) => c.n), post, starts: startsDuring.length, startTimes: startsDuring.map((t) => t - down),
      inputsInWindow: ins.length, laggingInputs: lag, statusDuring, statusPost,
      gwDragCount: gwDrag.length, gwDragIds: [...new Set(gwDrag.map((w) => w.id))], lastDuring: lastBy(gwDrag), lastAfter: lastBy(gwPost),
      gwDragSeq: gwDrag.map((w) => ({ dt: Math.round(w.t - down), id: w.id, v: Math.round(w.v * 1e4) / 1e4 })) };
  }, tA);
  const mx = (a) => (a.length ? Math.max(...a) : 0);
  let changes = 0;
  for (let i = 1; i < values.length; i++) if (values[i] !== values[i - 1]) changes += 1;
  return {
    label, mode, playState: await playState(page), before, undoBefore, statusBefore, samples, mid, statusMid, afterAbort, liveAfterAbort, after, undoAfter, statusAfter,
    winMoves: r.winMoves, preCommits: r.pre.length, preMax: mx(r.pre),
    winCommits: r.win.length, winMax: mx(r.win), winPerMove: r.winMoves ? Math.round((r.win.reduce((a, c) => a + c, 0) / r.winMoves) * 1000) / 1000 : 0,
    releaseCommits: r.post.length, releaseMax: mx(r.post),
    perMoveValueChanges: opts.perMove ? changes : null, inputsInWindow: r.inputsInWindow, laggingInputs: r.laggingInputs,
    statusDuring: r.statusDuring, statusPost: r.statusPost,
    sourceStartsDuringDrag: r.starts, startTimes: r.startTimes, gainWritesDuringDrag: r.gwDragCount, gainParamIds: r.gwDragIds, lastGainDuring: r.lastDuring, lastGainAfter: r.lastAfter,
    gwDragSeq: opts.keepSeq ? r.gwDragSeq : undefined,
  };
}

async function undoCheck(page, loc) {
  await blurActive(page);
  const tA = await now(page);
  await page.keyboard.press('Control+z');
  await quiet(page);
  return { afterUndo: await display(loc), undo: await undoTitle(page), redo: await redoTitle(page), gainWritesAfterUndo: await gwSince(page, tA) };
}

async function makeGroup(page) {
  await page.getByRole('button', { name: 'Stems — set as the active track', exact: true }).click();
  await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click({ modifiers: ['Shift'] });
  await blurActive(page);
  await page.keyboard.press('Control+g');
  await sleep(800);
  return sl(page, /^Volume — .+ \(group\)$/);
}

function save(name, obj) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2));
}
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const dbToLin = (db) => Math.pow(10, db / 20);
const dbOf = (txt) => { if (!txt) return null; const t = txt.replace('−', '-'); if (/inf|∞/.test(t)) return -Infinity; const m = t.match(/[-+]?[\d.]+/); return m ? Number(m[0]) : null; };

async function clipPoint(page, nth = 0, filterText = null) {
  return page.evaluate(({ nth, filterText }) => {
    let clips = [...document.querySelectorAll('[data-clip-kind="audio"]')];
    if (filterText) clips = clips.filter((c) => c.textContent.includes(filterText));
    const clip = clips[nth];
    if (!clip) return null;
    const box = clip.getBoundingClientRect();
    const y = box.top + 10;
    const hits = [];
    const end = Math.min(box.right, window.innerWidth) - 2;
    for (let x = Math.max(box.left, 0) + 2; x <= end; x += 4) { const hit = document.elementFromPoint(x, y); if (hit && clip.contains(hit)) hits.push(x); }
    return hits.length ? { x: hits[Math.min(hits.length - 1, Math.floor(hits.length / 2))], y, id: clip.getAttribute('data-clip-id') } : null;
  }, { nth, filterText });
}
async function selectFirstClip(page) {
  const p = await clipPoint(page, 0);
  await page.mouse.click(p.x, p.y);
  await sleep(400);
  return p.id;
}
async function addMembers(page, gains = null) {
  await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click();
  await sleep(300);
  await page.getByTestId('arrangement-library-option-title').filter({ hasText: 'Soft impact' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await sleep(2000);
  if (gains) {
    const p0 = await clipPoint(page, 0); await page.mouse.click(p0.x, p0.y); await sleep(400);
    await typeClipGain(page, gains[0]);
    const p1 = await clipPoint(page, 0, 'Soft impact'); await page.mouse.click(p1.x, p1.y); await sleep(400);
    await typeClipGain(page, gains[1]);
  }
  const a = await clipPoint(page, 0);
  const all = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ id: c.getAttribute('data-clip-id'), text: c.textContent.slice(0, 40) })));
  await page.mouse.click(a.x, a.y);
  await sleep(300);
  const b = await clipPoint(page, 0, 'Soft impact');
  await page.keyboard.down('Shift');
  await page.mouse.click(b.x, b.y);
  await page.keyboard.up('Shift');
  await sleep(500);
  const group = await page.getByTestId('arrangement-detail-group').count();
  const range = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]'); return { range: r ? r.textContent : null, vt: f ? f.getAttribute('aria-valuetext') : null }; });
  return { ids: [a.id, b.id], all, group, ...range };
}
async function selectOnly(page, nth, filterText) {
  const p = await clipPoint(page, nth, filterText);
  await page.mouse.click(p.x, p.y);
  await sleep(400);
  return p.id;
}
async function typeClipGain(page, db) {
  const f = page.getByTestId('arrangement-detail-clip-gain-input');
  await f.click();
  await f.fill(String(db));
  await page.keyboard.press('Enter');
  await sleep(400);
  await blurActive(page);
  await sleep(300);
  return f.inputValue();
}
// Release frame sampler: records DOM mutations on the clip gain block and per-frame snapshots for ~12 frames after pointerup.
async function armReleaseWatch(page) {
  await page.evaluate(() => {
    const st = { muts: [], frames: [] };
    window.__rw = st;
    const blk = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
    const snap = () => {
      const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]');
      const fd = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]');
      return { t: performance.now(), field: f && f.value, pend: f && f.getAttribute('data-pending'), marker: !!document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]'), fader: fd && fd.value, vt: fd && fd.getAttribute('aria-valuetext') };
    };
    if (blk) new MutationObserver((ms) => { for (const m of ms) st.muts.push({ t: performance.now(), type: m.type, attr: m.attributeName, tid: m.target.getAttribute ? m.target.getAttribute('data-testid') : null, snap: snap() }); }).observe(blk, { subtree: true, attributes: true, childList: true, characterData: true });
    const onUp = () => { let n = 0; const tick = () => { st.frames.push(snap()); if (++n < 12) requestAnimationFrame(tick); }; requestAnimationFrame(tick); st.upAt = performance.now(); st.atUp = snap(); };
    addEventListener('pointerup', onUp, { once: true, capture: true });
  });
}
const releaseWatch = (page) => page.evaluate(() => window.__rw);

module.exports = { clipPoint, selectFirstClip, addMembers, selectOnly, typeClipGain, armReleaseWatch, releaseWatch, launch, openLab, sl, playState, undoTitle, redoTitle, statusText, display, blurActive, space, quiet, keyTo, now, gwSince, drag, undoCheck, makeGroup, save, sha256, dbToLin, dbOf, sleep, OUT, SHOTS, ROOT };
