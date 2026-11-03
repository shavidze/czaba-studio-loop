// C312 browser rows: PK-READY-ORDER, PK-COPY-BOUND, PK-CLIP-PATHS (1440x900 + 1280x720, zoom x2), PK-VIDEO, PK-ABORT.
// Usage: node rows.cjs <base> <outJson> [rowsCsv]. Owned media only (public/videos/hero/1.mp4); local only.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const base = process.argv[2]; const outFile = process.argv[3];
const only = process.argv[4] ? process.argv[4].split(',') : null;
const SH = path.join(__dirname, 'shots'); fs.mkdirSync(SH, { recursive: true });
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const tag = base.endsWith('5173') ? 'a' : 'head';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const READY = () => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || '');
const INIT = () => {
  window.__copies = []; window.__done = 0; window.__frames = [];
  const orig = AudioBuffer.prototype.copyFromChannel;
  AudioBuffer.prototype.copyFromChannel = function (dest, ch, start) {
    const t = performance.now(); const r = orig.call(this, dest, ch, start);
    window.__copies.push({ len: dest.length, sr: this.sampleRate, bufLen: this.length, ch, start: start || 0, ms: performance.now() - t, at: t });
    return r;
  };
  const W = window.Worker;
  const Wrapped = function (url, opts) {
    const w = new W(url, opts);
    if (String(url).includes('peaks.worker')) w.addEventListener('message', (e) => { if (e.data && e.data.type === 'done') window.__done += 1; });
    return w;
  };
  Wrapped.prototype = W.prototype; window.Worker = Wrapped;
  const poll = () => {
    const st = document.querySelector('[data-testid="arrangement-status"]')?.textContent || '';
    const opts = [...document.querySelectorAll('[role=option][data-source-id]')];
    const ready = opts.filter((o) => o.getAttribute('draggable') === 'true').length;
    const rects = document.querySelectorAll('[data-testid="arrangement-library-preview-wave"] rect').length;
    const last = window.__frames[window.__frames.length - 1];
    const f = { t: Math.round(performance.now()), st: st.slice(0, 40), ready, opts: opts.length, rects, done: window.__done };
    if (!last || last.st !== f.st || last.ready !== f.ready || last.rects !== f.rects || last.done !== f.done || last.opts !== f.opts) window.__frames.push(f);
    if (!/^Demo collection ready/.test(st) || window.__frames.length < 2) requestAnimationFrame(poll);
    else window.__frames.push({ final: true, ...f });
  };
  requestAnimationFrame(poll);
};
async function fresh(b, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(INIT);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  const workers = []; p.on('worker', (wk) => { const rec = { url: wk.url().split('/').pop().split('?')[0], closed: false }; workers.push(rec); wk.on('close', () => { rec.closed = true; }); });
  return { ctx, p, errs, workers };
}
async function expand(p) { for (let i = 0; i < 8; i++) { const c = p.locator('[data-testid="arrangement-library-folder"][aria-expanded="false"]'); if ((await c.count()) === 0) break; await c.first().click(); await sleep(150); } }
async function waves(p) {
  await expand(p); const o = p.locator('[data-testid="arrangement-library"] [role="option"]'); const n = await o.count(); const out = [];
  for (let i = 0; i < n; i++) { await o.nth(i).click(); await sleep(300); const html = (await p.locator('[data-testid="arrangement-library-preview-wave"]').innerHTML()).replace(/class="[^"]*"/g, ''); out.push({ rects: (html.match(/<rect/g) || []).length, sha: sha(html) }); }
  return out;
}
const clipPaths = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.getAttribute('data-clip-id'), kind: c.getAttribute('data-clip-kind'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id'), w: Math.round(c.getBoundingClientRect().width * 10) / 10, d: [...c.querySelectorAll('[data-testid="arrangement-clip-waveform"] path')].map((x) => x.getAttribute('d')) })));
const detailPath = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-detail-waveform"] path')].map((x) => x.getAttribute('d')));
const out = { base, at: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(base + '/studio-lab', { timeout: 300000 }); await p.waitForFunction(READY, null, { timeout: 300000 }); await c.close(); }
  const run = async (name, fn) => { if (only && !only.includes(name)) return; try { out.rows[name] = await fn(); } catch (e) { out.rows[name] = { error: String(e).slice(0, 400) }; } save(); };
  await run('readyCopy', async () => {
    const { ctx, p, errs, workers } = await fresh(b, 1440, 900);
    await p.goto(base + '/studio-lab'); await p.waitForFunction(READY, null, { timeout: 120000 }); await sleep(800);
    const frames = await p.evaluate(() => window.__frames); const copies = await p.evaluate(() => window.__copies); const done = await p.evaluate(() => window.__done);
    const firstReady = frames.find((f) => /^Demo collection ready/.test(f.st));
    const readyBeyondDone = frames.filter((f) => f.ready > f.done);
    const bound = copies.filter((c) => c.len > 2 * c.sr);
    const r = { errs, workers, done, frames: frames.length, firstReady, readyBeyondDoneFrames: readyBeyondDone.length, readyBeyondDoneSample: readyBeyondDone.slice(0, 3), copyCalls: copies.length, copyOverBound: bound.length, copyMaxLen: Math.max(0, ...copies.map((c) => c.len)), copyTotalMs: Math.round(copies.reduce((s, c) => s + c.ms, 0) * 100) / 100, copyMaxMs: Math.round(Math.max(0, ...copies.map((c) => c.ms)) * 100) / 100, copyLensBySr: [...new Set(copies.map((c) => c.len + '@' + c.sr))], framesLog: frames };
    await ctx.close(); return r;
  });
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    await run('clipPaths' + w, async () => {
      const { ctx, p, errs } = await fresh(b, w, h);
      await p.goto(base + '/studio-lab'); await p.waitForFunction(READY, null, { timeout: 120000 }); await sleep(600);
      await expand(p); const ids = await p.locator('[role=option][data-source-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-source-id')));
      const statuses = [];
      for (const id of ids) { const o = p.locator(`[role=option][data-source-id="${id}"]`); await o.scrollIntoViewIfNeeded(); await o.focus(); await p.keyboard.press('Enter'); await sleep(900); statuses.push(await p.locator('[data-testid="arrangement-status"]').textContent()); }
      const clips0 = await clipPaths(p);
      const detail0 = [];
      for (const c of clips0) { const el = p.locator(`[data-clip-id="${c.id}"]`); await el.scrollIntoViewIfNeeded(); const bx = await el.boundingBox(); if (!bx) { detail0.push(null); continue; } await p.mouse.click(bx.x + Math.min(20, bx.width / 2), bx.y + 6); await sleep(250); detail0.push(await detailPath(p)); }
      await p.screenshot({ path: path.join(SH, `${tag}-clips-${w}.png`) });
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await p.mouse.click(5, h - 5).catch(() => {});
      await p.keyboard.press('+'); await sleep(500); await p.keyboard.press('+'); await sleep(800);
      const clips1 = await clipPaths(p);
      const detail1 = [];
      for (const c of clips1) { const el = p.locator(`[data-clip-id="${c.id}"]`); await el.scrollIntoViewIfNeeded(); const bx = await el.boundingBox(); if (!bx) { detail1.push(null); continue; } await p.mouse.click(bx.x + Math.min(20, bx.width / 2), bx.y + 6); await sleep(250); detail1.push(await detailPath(p)); }
      await p.screenshot({ path: path.join(SH, `${tag}-clips-zoom-${w}.png`) });
      const r = { errs, ids, statuses, clipCount: clips0.length, clips0, detail0, clips1, detail1, zoomChanged: clips0.some((c, i) => clips1[i] && clips1[i].w !== c.w) };
      await ctx.close(); return r;
    });
  }
  await run('video', async () => {
    const { ctx, p, errs } = await fresh(b, 1440, 900);
    await p.goto(base + '/studio-lab'); await p.waitForFunction(READY, null, { timeout: 120000 }); await sleep(600);
    await p.evaluate(() => { window.__st = []; const o = document.querySelector('[data-testid="arrangement-status"]'); const push = () => { const t = o.textContent; if (window.__st[window.__st.length - 1] !== t) window.__st.push(t); }; push(); new MutationObserver(push).observe(o, { subtree: true, childList: true, characterData: true }); });
    await p.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
    await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind="video"]').length > 0, null, { timeout: 60000 });
    await sleep(6000);
    const vids = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind="video"]')].map((c) => ({ text: c.textContent.slice(0, 120), d: [...c.querySelectorAll('[data-testid="arrangement-clip-waveform"] path')].map((x) => x.getAttribute('d')), attrs: [...c.attributes].filter((a) => a.name.startsWith('data-') || a.name.startsWith('aria-')).map((a) => a.name + '=' + a.value) })));
    const statuses = await p.evaluate(() => window.__st);
    const copies = await p.evaluate(() => window.__copies.length); const done = await p.evaluate(() => window.__done);
    await p.screenshot({ path: path.join(SH, `${tag}-video-1440.png`) });
    const r = { errs, vids: vids.map((v) => ({ ...v, dSha: v.d.map(sha), d: undefined })), statuses, copies, done }; await ctx.close(); return r;
  });
  await run('abort', async () => {
    const { ctx, p, errs, workers } = await fresh(b, 1440, 900);
    await p.goto(base + '/studio-lab');
    let firstCopyMs = null;
    try { await p.waitForFunction(() => window.__copies && window.__copies.length > 0, null, { timeout: 60000, polling: 5 }); firstCopyMs = Date.now(); } catch (e) { /* HEAD has no copies */ }
    const tNav = Date.now();
    const clientNav = await p.evaluate(() => { const a = document.querySelector('a[href="/"]'); if (a) { a.click(); return true; } return false; });
    if (!clientNav) await p.goto(base + '/', { waitUntil: 'commit' });
    await p.waitForURL((u) => u.pathname === '/', { timeout: 30000 });
    const workersAfterLeave = workers.map((w) => ({ ...w }));
    await sleep(1500);
    const workersAfterLeave2 = workers.map((w) => ({ ...w }));
    await p.goBack(); await p.waitForURL((u) => u.pathname === '/studio-lab', { timeout: 30000 }); await p.waitForFunction(READY, null, { timeout: 120000 }); await sleep(800);
    const wv = await waves(p);
    const r = { clientNav, errs, firstCopySeen: firstCopyMs !== null, navDelayMs: firstCopyMs ? tNav - firstCopyMs : null, workersAfterLeave, workersAfterLeave2, workersEnd: workers, waves: wv, status: await p.locator('[data-testid="arrangement-status"]').textContent() };
    await ctx.close(); return r;
  });
  await b.close();
})();
