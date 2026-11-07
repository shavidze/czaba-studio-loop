// C303 browser rows: H-FIRST-ENTER, H-SECOND, H-FIRST-DROP, H-SEED, H-UNDO, H-RELOAD, H-VIDEO-FIRST, H-BEHAVIOUR, H-BOX, H-SR, RV-EN.
// Fresh context per row, both viewports. Owned media only (public/videos/hero/1.mp4), local only.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173'; const DIR = __dirname; const SH = path.join(DIR, 'shots');
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const HINT = 'Drag a clip by its name bar to move it.';
const GEO = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const HEAD_SEED = JSON.parse(fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-302/probe-status.json'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const status = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
async function waitReady(p) { await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(600); }
async function fresh(b, w, h) { const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); await p.goto(`${BASE}/studio-lab`); await waitReady(p); return { ctx, p, errs }; }
async function recordStatuses(p) { await p.evaluate(() => { window.__st = []; const o = document.querySelector('[data-testid="arrangement-status"]'); const push = () => { const t = o.textContent; if (window.__st[window.__st.length - 1] !== t) window.__st.push(t); }; push(); new MutationObserver(push).observe(o, { subtree: true, childList: true, characterData: true }); }); }
const statuses = (p) => p.evaluate(() => window.__st || []);
async function enterOn(p, id) { const o = p.locator(`[role=option][data-source-id="${id}"]`); await o.scrollIntoViewIfNeeded(); await o.focus(); await p.keyboard.press('Enter'); await sleep(1200); }
async function expandFolders(p) { for (let i = 0; i < 8; i++) { const c = p.locator('[data-testid="arrangement-library-folder"][aria-expanded="false"]'); if ((await c.count()) === 0) break; await c.first().click(); await sleep(150); } }
const box = (p) => p.evaluate(() => { const o = document.querySelector('[data-testid="arrangement-status"]'); const f = o.closest('footer'); const lh = parseFloat(getComputedStyle(o).lineHeight); const sp = o.querySelector('span'); const rg = document.createRange(); rg.selectNodeContents(sp); const rects = [...rg.getClientRects()]; const tl = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); return { outputH: o.getBoundingClientRect().height, lineH: lh, textRects: rects.length, textW: Math.max(0, ...rects.map((x) => x.width)), outW: o.clientWidth, overflow: sp.scrollWidth > o.clientWidth + 1, footerH: f ? f.getBoundingClientRect().height : null, timelineH: tl ? tl.getBoundingClientRect().height : null, docScrollH: document.documentElement.scrollHeight, innerH: innerHeight }; });
const clipsInfo = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-kind]')].map((c) => ({ id: c.getAttribute('data-clip-id'), kind: c.getAttribute('data-clip-kind'), left: parseFloat(c.style.left), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') })));
async function liveRegions(p) {
  const dom = await p.evaluate((hint) => { const els = [...document.querySelectorAll('[aria-live],[role=status],[role=alert],[role=log],output')]; return els.map((e) => ({ tag: e.tagName, testid: e.getAttribute('data-testid'), live: e.getAttribute('aria-live'), role: e.getAttribute('role'), hasHint: e.textContent.includes(hint), hintCount: e.textContent.split(hint).length - 1 })).filter((e) => e.hasHint); }, HINT);
  const cdp = await p.context().newCDPSession(p); const { nodes } = await cdp.send('Accessibility.getFullAXTree'); await cdp.detach();
  const ax = nodes.filter((n) => !n.ignored).map((n) => ({ role: n.role?.value, name: n.name?.value || '', live: (n.properties || []).find((q) => q.name === 'live')?.value?.value })).filter((n) => n.name.includes('name bar'));
  const statusAx = nodes.filter((n) => !n.ignored && n.role?.value === 'status').map((n) => ({ name: n.name?.value || '', live: (n.properties || []).find((q) => q.name === 'live')?.value?.value }));
  return { dom, ax, statusAx };
}
async function geo(p) { const t = await p.evaluate(() => document.body.innerText); const cdp = await p.context().newCDPSession(p); const { nodes } = await cdp.send('Accessibility.getFullAXTree'); await cdp.detach(); const names = nodes.map((n) => n.name?.value || ''); return [...t.split('\n'), ...names].filter((s) => GEO.test(s)).map((s) => s.slice(0, 80)); }

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), vp: {} };
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(`${BASE}/studio-lab`).catch(() => {}); await waitReady(p).catch(() => {}); await c.close(); }
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; const R = {}; out.vp[k] = R; const run = async (name, fn) => { try { R[name] = await fn(); } catch (e) { R[name] = { error: String(e).slice(0, 300) }; } fs.writeFileSync(path.join(DIR, 'main.json'), JSON.stringify(out, null, 1)); };
    // H-FIRST-ENTER, H-BOX, H-SR, H-SECOND, H-BEHAVIOUR, H-RELOAD
    await run('firstEnter', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {}; r.readyBox = await box(p); await recordStatuses(p);
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await p.keyboard.press('Enter'); await sleep(1500);
      r.status = await status(p); r.statusCount = await p.locator('[data-testid="arrangement-status"]').count(); r.clips = await clipsInfo(p); r.box = await box(p); r.sr = await liveRegions(p); r.seq = await statuses(p);
      r.expected = `“Middle East — public preview” added to the Music track at 00:00.000. ${HINT}`; r.exact = r.status === r.expected;
      await p.screenshot({ path: path.join(SH, `first-enter-${k}.png`) });
      // H-SECOND: another ready source
      await expandFolders(p); await enterOn(p, 'demo-stem-pulse');
      r.second = { status: await status(p), clips: await clipsInfo(p) }; r.second.nameBarCount = (r.second.status.match(/name bar/g) || []).length;
      r.second.plainMatch = /^“[^”]+” added to the [A-Za-z ]+ track at \d\d:\d\d\.\d\d\d( \(nearest free spot\))?\.$/.test(r.second.status);
      await p.screenshot({ path: path.join(SH, `second-${k}.png`) });
      // H-RELOAD
      await p.reload(); await waitReady(p); await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await p.keyboard.press('Enter'); await sleep(1500);
      r.reload = { status: await status(p) }; r.reload.hasHint = r.reload.status.endsWith(` ${HINT}`);
      r.geo = await geo(p); r.errors = errs; await ctx.close(); return r;
    });
    await run('behaviour', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {};
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await p.keyboard.press('Enter'); await sleep(1500);
      r.status = await status(p);
      const clip = p.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); r.clipBox = cb; r.left0 = (await clipsInfo(p))[0].left;
      // (a) body drag 100px
      const by = cb.y + Math.min(cb.height - 6, 40); const bx = cb.x + 60;
      await p.mouse.move(bx, by); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(bx + i * 10, by); await sleep(16); } await p.mouse.up(); await sleep(500);
      r.a = { left: (await clipsInfo(p))[0].left, range: await p.locator('[data-testid="arrangement-range"]').count(), rangeText: await p.locator('[data-testid="arrangement-range"]').textContent().catch(() => null), status: await status(p), cursor: await p.evaluate(([x, y]) => getComputedStyle(document.elementFromPoint(x, y)).cursor, [bx, by]) };
      await p.screenshot({ path: path.join(SH, `behaviour-body-${k}.png`) });
      await p.keyboard.press('Escape'); await sleep(300);
      // (b) name bar drag 100px
      const cb2 = await clip.boundingBox(); const nx = cb2.x + 60; const ny = cb2.y + 9; r.nameCursor = await p.evaluate(([x, y]) => getComputedStyle(document.elementFromPoint(x, y)).cursor, [nx, ny]); r.nameTitle = await p.evaluate(([x, y]) => document.elementFromPoint(x, y).closest('[title]')?.getAttribute('title'), [nx, ny]);
      await p.mouse.move(nx, ny); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(nx + i * 10, ny); await sleep(16); } await p.mouse.up(); await sleep(600);
      r.b = { left: (await clipsInfo(p))[0].left, range: await p.locator('[data-testid="arrangement-range"]').count(), status: await status(p) }; r.b.dx = r.b.left - r.a.left;
      await p.screenshot({ path: path.join(SH, `behaviour-namebar-${k}.png`) }); r.errors = errs; await ctx.close(); return r;
    });
    // H-FIRST-DROP
    await run('firstDrop', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {}; await recordStatuses(p);
      const tracks = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((t) => ({ id: t.getAttribute('data-track-id'), video: !!t.querySelector('[data-testid="arrangement-video-dropzone"]'), clips: t.querySelectorAll('[data-clip-kind]').length, text: t.textContent.slice(0, 40) })));
      r.tracks = tracks; const target = tracks.find((t) => !t.video && t.clips === 0 && /SFX|Sound/i.test(t.text)) || tracks.find((t) => !t.video && t.clips === 0);
      r.target = target.id; const lane = p.locator(`[data-track-id="${target.id}"] [data-grid-seconds]`).first();
      await p.locator('[role=option][data-source-id="demo-middle-east"]').dragTo(lane, { targetPosition: { x: 200, y: 20 } }); await sleep(1500);
      r.status = await status(p); r.clips = await clipsInfo(p); r.endsWithHint = r.status.endsWith(`. ${HINT}`); r.hintCount = (r.status.match(/name bar/g) || []).length; r.seq = await statuses(p);
      await p.screenshot({ path: path.join(SH, `first-drop-${k}.png`) }); r.errors = errs; await ctx.close(); return r;
    });
    // H-SEED + H-BOX longest
    await run('seed', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {}; await expandFolders(p); await recordStatuses(p);
      await p.locator('[role=option][data-source-id="demo-synth-mix"]').click(); await p.keyboard.press('Enter');
      await p.waitForFunction(() => /Tempo/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 10000 }); await sleep(800);
      r.status = await status(p); const head = HEAD_SEED[k].fullmix.added.text; r.head = head;
      const m = head.match(/ at \d\d:\d\d\.\d\d\d(?: \(nearest free spot\))?\./); r.expected = head.slice(0, m.index + m[0].length) + ` ${HINT}` + head.slice(m.index + m[0].length); r.exact = r.status === r.expected;
      r.seq = await statuses(p); r.box = await box(p); await p.screenshot({ path: path.join(SH, `seed-${k}.png`) }); r.errors = errs; await ctx.close(); return r;
    });
    // H-UNDO
    await run('undo', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {}; await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await p.keyboard.press('Enter'); await sleep(1200); r.first = await status(p); r.clips1 = (await clipsInfo(p)).length;
      await p.keyboard.press('Control+z'); await sleep(800); r.undo = await status(p); r.clips2 = (await clipsInfo(p)).length;
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await p.keyboard.press('Enter'); await sleep(1200); r.second = await status(p); r.clips3 = (await clipsInfo(p)).length;
      r.secondHasHint = r.second.includes('name bar'); await p.screenshot({ path: path.join(SH, `undo-${k}.png`) }); r.errors = errs; await ctx.close(); return r;
    });
    // H-VIDEO-FIRST
    await run('videoFirst', async () => {
      const { ctx, p, errs } = await fresh(b, w, h); const r = {}; await recordStatuses(p);
      await p.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
      await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind="video"]').length > 0, null, { timeout: 60000 }).catch((e) => (r.waitErr = String(e).slice(0, 100)));
      await sleep(6000); r.videoStatuses = await statuses(p); r.videoClips = (await clipsInfo(p)).filter((c) => c.kind === 'video').length;
      r.videoWithHint = r.videoStatuses.filter((s) => s.includes('name bar')).length;
      await p.locator('[role=option][data-source-id="demo-middle-east"]').focus(); await p.keyboard.press('Enter'); await sleep(1500);
      r.addStatus = await status(p); r.addHasHint = r.addStatus.endsWith(` ${HINT}`); r.clips = await clipsInfo(p);
      await p.screenshot({ path: path.join(SH, `video-first-${k}.png`) }); r.errors = errs; await ctx.close(); return r;
    });
  }
  fs.writeFileSync(path.join(DIR, 'main.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
