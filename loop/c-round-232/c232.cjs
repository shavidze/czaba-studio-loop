// C round 232: CALM-3 browser rows. usage: node c232.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const outDir = path.resolve(process.argv[2]);
fs.mkdirSync(outDir, { recursive: true });
const VIDEO = path.resolve(__dirname, 'media', fs.readdirSync(path.join(__dirname, 'media'))[0]);
const KEY = 'czaba-studio-overview-hidden';
const R = { started: new Date().toISOString() };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(outDir, 'c232.json'), JSON.stringify(R, null, 1));
let analyzer;

async function pix(buf, fn) {
  const data = 'data:image/png;base64,' + buf.toString('base64');
  return analyzer.evaluate(async ([src, fnSrc]) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const f = new Function('d', 'w', 'h', fnSrc);
    return f(d, c.width, c.height);
  }, [data, fn]);
}
const PIX_STATS = `
  const bg = [d[(Math.floor(h/2)*w + 1)*4], d[(Math.floor(h/2)*w + 1)*4+1], d[(Math.floor(h/2)*w + 1)*4+2]];
  let bright = 0, brass = 0, off = 0; const rowsOff = []; const colsOff = new Array(w).fill(0);
  for (let y = 0; y < h; y++) { let r = 0; for (let x = 0; x < w; x++) { const i = (y*w + x)*4;
    const L = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
    if (L > 100) bright++;
    if (d[i] > 120 && d[i] - d[i+2] > 50) brass++;
    if (Math.abs(d[i]-bg[0]) + Math.abs(d[i+1]-bg[1]) + Math.abs(d[i+2]-bg[2]) > 12) { off++; r++; colsOff[x]++; } }
    rowsOff.push(r); }
  const fullRows = rowsOff.map((r, y) => [y, r]).filter(([, r]) => r > w * 0.8).map(([y]) => y);
  const fullCols = colsOff.map((c, x) => [x, c]).filter(([, c]) => c > h * 0.8).map(([x]) => x);
  return { w, h, bg, bright, brass, off, fullRows, fullCols };
`;

async function open(ctx, opts = {}) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (opts.init) await page.addInitScript(opts.init);
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 120000 });
  await sleep(900);
  return { page, errors };
}
const m = (page) => page.evaluate((KEY) => {
  const t = (id) => document.querySelector(`[data-testid="${id}"]`);
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const ov = t('arrangement-overview');
  const slot = t('arrangement-overview-hidden-slot');
  const capRow = (ov ?? slot)?.parentElement?.firstElementChild;
  const oneBorder = ov ? [...ov.querySelectorAll('*'), ov].filter((e) => { const s = cs(e); return s.borderTopWidth === '1px' && s.borderTopStyle !== 'none'; }).map((e) => ({ tid: e.getAttribute('data-testid'), color: cs(e).borderTopColor, vis: cs(e).visibility })) : null;
  const rows = ov ? ov.children[1] : null;
  const bars = rows ? [...rows.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && cs(e).backgroundColor !== 'rgba(0, 0, 0, 0)'; }).length : null;
  return {
    clips: document.querySelectorAll('[data-clip-id]').length,
    state: ov?.getAttribute('data-overview-state') ?? null,
    ov: box(ov), ovBg: cs(ov)?.backgroundColor ?? null,
    child0: ov ? { tid: ov.children[0]?.getAttribute('data-testid'), border: cs(ov.children[0]).borderTopWidth + ' ' + cs(ov.children[0]).borderTopColor, box: box(ov.children[0]) } : null,
    child1IsRows: rows ? rows.className.includes('flex-col') : null,
    oneBorder, bars,
    baseline: box(t('arrangement-overview-baseline')), baselineBg: cs(t('arrangement-overview-baseline'))?.backgroundColor ?? null,
    frame: box(t('arrangement-overview-frame')), frameVis: cs(t('arrangement-overview-frame'))?.visibility ?? null,
    playheadVis: cs(t('arrangement-overview-playhead'))?.visibility ?? null,
    slot: box(slot), slotAria: slot?.getAttribute('aria-hidden') ?? null,
    dock: box(t('arrangement-video-dock')), dockBg: cs(t('arrangement-video-dock'))?.backgroundColor,
    cap: box(capRow), capText: t('arrangement-video-caption')?.textContent ?? null, capEl: box(t('arrangement-video-caption')),
    sc: t('arrangement-timeline-scroller')?.clientHeight,
    aria: ov ? { now: ov.getAttribute('aria-valuenow'), max: ov.getAttribute('aria-valuemax'), text: ov.getAttribute('aria-valuetext') } : null,
    active: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName,
    status: t('arrangement-status')?.textContent ?? null,
    key: localStorage.getItem(KEY),
    dialog: document.querySelectorAll('[role="dialog"]').length,
  };
}, KEY);
const blur = async (page) => { await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await page.mouse.click(3, 3); await sleep(150); };
const ringInfo = (page, tid) => page.evaluate((tid) => { const e = document.querySelector(`[data-testid="${tid}"]`); if (!e) return null; const s = getComputedStyle(e); return { focused: document.activeElement === e, fv: e.matches(':focus-visible'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset, boxShadow: s.boxShadow }; }, tid);
const shotAround = async (page, tid, pad) => { const b = await page.getByTestId(tid).boundingBox(); return page.screenshot({ clip: { x: b.x - pad, y: b.y - pad, width: b.width + 2 * pad, height: b.height + 2 * pad } }); };
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
const parseRgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);

async function step(r, name, fn) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { r[name] = await fn(); } catch (e) { r[name] = { error: String(e).slice(0, 500) }; } save(); }

async function run(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = (R[key] = {});
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const { page, errors } = await open(ctx);
  r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));

  // ---------- C-OVERVIEW-EMPTY ----------
  await step(r, 'empty', async () => {
    const o = { S0: await m(page) };
    await page.screenshot({ path: path.join(outDir, `S0-${key}.png`) });
    const crop = await shotAround(page, 'arrangement-overview', 4);
    fs.writeFileSync(path.join(outDir, `ov-empty-${key}.png`), crop);
    o.pixAfter = await pix(crop, PIX_STATS);
    const before = path.join(__dirname, '..', 'b-round-231', 'probe', `ov-empty-${key}.png`);
    if (fs.existsSync(before)) o.pixBefore = await pix(fs.readFileSync(before), PIX_STATS);
    // keyboard focus: separator -> Tab -> overview
    await page.getByTestId('arrangement-library-separator').focus();
    await page.keyboard.press('Tab'); await sleep(200);
    o.kbRing = await ringInfo(page, 'arrangement-overview');
    const ringShot = await shotAround(page, 'arrangement-overview', 6);
    fs.writeFileSync(path.join(outDir, `ring-kb-empty-${key}.png`), ringShot);
    o.kbRingPix = await pix(ringShot, PIX_STATS);
    const ring = parseRgb(o.kbRing.outline.split(' ').slice(2).join(' '));
    const dockBg = parseRgb(o.S0.dockBg);
    if (ring.length >= 3) { const a = ring[3] ?? 1; const comp = [0, 1, 2].map((i) => ring[i] * a + dockBg[i] * (1 - a)); o.ringContrast = contrast(comp, dockBg); o.ringComposite = comp.map((v) => +v.toFixed(1)); }
    const n0 = o.S0.aria.now;
    await page.keyboard.press('ArrowRight'); await sleep(250); o.afterRight = (await m(page)).aria;
    await page.keyboard.press('ArrowLeft'); await sleep(250); o.afterLeft = (await m(page)).aria;
    o.arrowChanges = o.afterRight.now !== n0;
    // mouse press: no ring
    await blur(page);
    const b = await page.getByTestId('arrangement-overview').boundingBox();
    await page.mouse.move(b.x + 30, b.y + 32); await page.mouse.down(); await sleep(150);
    o.mouseRingDuring = await ringInfo(page, 'arrangement-overview');
    const ms = await shotAround(page, 'arrangement-overview', 6);
    fs.writeFileSync(path.join(outDir, `ring-mouse-empty-${key}.png`), ms);
    o.mousePix = await pix(ms, PIX_STATS);
    await page.mouse.up(); await sleep(150);
    o.mouseRingAfter = await ringInfo(page, 'arrangement-overview');
    // double-click = Fit
    await page.mouse.dblclick(b.x + b.width / 2, b.y + 32); await sleep(400);
    o.afterDbl = (await m(page)).status;
    // horizontal drag
    const e0 = errors.length;
    await page.mouse.move(b.x + 100, b.y + 30); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { await page.mouse.move(b.x + 100 + i * 15, b.y + 30); await sleep(16); }
    await page.mouse.up(); await sleep(300);
    o.dragErrors = errors.length - e0; o.afterDrag = await m(page);
    await blur(page);
    return o;
  });

  // ---------- C-TOGGLE (body) ----------
  await step(r, 'toggle', async () => {
    const o = {}; await blur(page);
    o.shown = await m(page);
    o.prevented = await page.evaluate(() => { window.__lastKO = null; window.addEventListener('keydown', (e) => { if (e.code === 'KeyO') window.__lastKO = { dp: e.defaultPrevented, repeat: e.repeat }; }); return true; });
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    o.hidden = await m(page); o.hiddenEvent = await page.evaluate(() => window.__lastKO);
    await page.screenshot({ path: path.join(outDir, `hidden-${key}.png`) });
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    o.reshown = await m(page);
    // Meta variant
    await page.keyboard.press('Meta+Alt+KeyO'); await sleep(350); o.metaHidden = await m(page);
    await page.keyboard.press('Meta+Alt+KeyO'); await sleep(350); o.metaShown = await m(page);
    // from focused overview
    await page.getByTestId('arrangement-library-separator').focus(); await page.keyboard.press('Tab'); await sleep(150);
    o.focusedBefore = (await m(page)).active;
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    o.hiddenFromFocus = await m(page);
    await page.keyboard.press('Tab'); await sleep(150);
    o.tabAfterHide = (await m(page)).active;
    await blur(page); await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    o.shownAfterFocus = await m(page);
    // fresh hide then Shift+Tab
    await page.getByTestId('arrangement-library-separator').focus(); await page.keyboard.press('Tab'); await sleep(150);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
    o.activeAfterHide2 = (await m(page)).active;
    await page.keyboard.press('Shift+Tab'); await sleep(150);
    o.shiftTabAfterHide = (await m(page)).active;
    await blur(page); await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
    o.restored = (await m(page)).state;
    return o;
  });

  // ---------- negatives ----------
  await step(r, 'negative', async () => {
    const o = {}; await blur(page);
    const cnt = () => page.evaluate(() => ({ ov: !!document.querySelector('[data-testid="arrangement-overview"]'), key: localStorage.getItem('czaba-studio-overview-hidden') }));
    await page.getByTestId('arrangement-library-search').click(); await sleep(100);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
    o.search = { ...(await cnt()), value: await page.getByTestId('arrangement-library-search').inputValue() };
    await blur(page);
    await page.keyboard.press('Shift+Slash'); await sleep(400);
    o.sheetOpen = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
    o.sheet = await cnt();
    await page.keyboard.press('Escape'); await sleep(300);
    o.sheetClosed = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
    await blur(page);
    await page.keyboard.press('Control+KeyO'); await sleep(300); o.ctrlO = await cnt();
    await page.keyboard.press('Alt+KeyO'); await sleep(300); o.altO = await cnt();
    await page.keyboard.press('Control+Alt+Shift+KeyO'); await sleep(300); o.ctrlAltShiftO = await cnt();
    // held key auto-repeat
    await page.evaluate(() => { window.__ko = []; window.addEventListener('keydown', (e) => { if (e.code === 'KeyO') window.__ko.push(e.repeat); }); });
    let flips = 0; let prev = (await cnt()).ov;
    await page.keyboard.down('Control'); await page.keyboard.down('Alt');
    for (let i = 0; i < 12; i++) { await page.keyboard.down('KeyO'); await sleep(40); const now = (await cnt()).ov; if (now !== prev) flips++; prev = now; }
    await page.keyboard.up('KeyO'); await page.keyboard.up('Alt'); await page.keyboard.up('Control'); await sleep(300);
    o.held = { events: await page.evaluate(() => window.__ko), flips, final: await cnt() };
    if (!o.held.final.ov) { await blur(page); await page.keyboard.press('Control+Alt+KeyO'); await sleep(300); }
    // export dialog open
    await page.getByRole('button', { name: 'Export', exact: true }).first().click(); await sleep(500);
    o.exportDialog = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(300); o.exportOpen = await cnt();
    await page.keyboard.press('Escape'); await sleep(400);
    o.exportClosed = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
    if (o.exportClosed) { const done = page.getByRole('dialog').getByRole('button', { name: /Close|Done|Cancel/ }); if (await done.count()) { await done.first().click(); await sleep(300); } }
    // during pointer drag on overview
    await blur(page);
    const b = await page.getByTestId('arrangement-overview').boundingBox();
    await page.mouse.move(b.x + 200, b.y + 30); await page.mouse.down(); await page.mouse.move(b.x + 230, b.y + 30); await sleep(100);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(250); o.duringDrag = await cnt();
    await page.mouse.up(); await sleep(300); o.afterDrag = await cnt();
    return o;
  });

  // ---------- C-OVERVIEW-FIRSTCLIP + C-UNDO + neighbours ----------
  await step(r, 'firstclip', async () => {
    const o = {}; await blur(page);
    await page.keyboard.press('Enter'); await sleep(1000);
    o.S1 = await m(page);
    const crop = await shotAround(page, 'arrangement-overview', 4);
    fs.writeFileSync(path.join(outDir, `ov-clip-${key}.png`), crop);
    o.pix = await pix(crop, PIX_STATS);
    await page.screenshot({ path: path.join(outDir, `S1-${key}.png`) });
    await page.keyboard.press('Control+KeyZ'); await sleep(600);
    o.undo = await m(page);
    // C-UNDO-232: add, toggle twice, Ctrl+Z
    await blur(page); await page.keyboard.press('Enter'); await sleep(900);
    o.u0 = (await m(page)).clips;
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(250); await page.keyboard.press('Control+Alt+KeyO'); await sleep(250);
    o.u1 = (await m(page)).clips;
    await page.keyboard.press('Control+KeyZ'); await sleep(600);
    o.u2 = await m(page);
    await page.keyboard.press('Control+Shift+KeyZ'); await sleep(600);
    o.redo = (await m(page)).clips;
    if (!o.redo) { await page.keyboard.press('Control+KeyY'); await sleep(600); o.redoY = (await m(page)).clips; }
    // neighbours with a clip: re-centre, drags, Fit, Space
    const base0 = await m(page);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(250); o.hiddenWithClip = await m(page);
    await page.screenshot({ path: path.join(outDir, `hidden-S1-${key}.png`) });
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(250);
    const b = await page.getByTestId('arrangement-overview').boundingBox();
    o.n = { base: base0.aria, frame: base0.frame };
    await page.mouse.click(b.x + b.width * 0.85, b.y + 32); await sleep(400); o.n.click = await m(page);
    await page.mouse.move(b.x + b.width * 0.5, b.y + 32); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(b.x + b.width * 0.5 - i * 20, b.y + 32); await sleep(16); }
    await page.mouse.up(); await sleep(300); o.n.hdrag = await m(page);
    const fw0 = (await m(page)).frame;
    await page.mouse.move(b.x + b.width * 0.3, b.y + 20); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(b.x + b.width * 0.3, b.y + 20 + i * 4); await sleep(16); }
    await page.mouse.up(); await sleep(300); o.n.vdrag = { before: fw0, after: (await m(page)).frame };
    await page.mouse.dblclick(b.x + b.width / 2, b.y + 32); await sleep(400); o.n.dbl = await m(page);
    await page.getByTestId('arrangement-overview').focus(); await sleep(100);
    await page.keyboard.press('Space'); await sleep(900);
    o.n.spacePlaying = await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => /Pause|Stop/i.test(x.getAttribute('aria-label') || x.textContent)).map((x) => (x.getAttribute('aria-label') || x.textContent).trim()).slice(0, 4));
    o.n.statusPlaying = (await m(page)).status;
    await page.keyboard.press('Space'); await sleep(400);
    await blur(page);
    // other window shortcuts still work: ? opens sheet; Ctrl+Z works (done above)
    await page.keyboard.press('Shift+Slash'); await sleep(300); o.n.sheet = (await m(page)).dialog; await page.keyboard.press('Escape'); await sleep(300);
    o.errors = errors.slice();
    return o;
  });

  // ---------- C-SHEET-232 ----------
  await step(r, 'sheet', async () => {
    const o = {}; await blur(page);
    await page.keyboard.press('Shift+Slash'); await sleep(400);
    o.allRows = await page.evaluate(() => document.querySelectorAll('[role="dialog"] [data-shortcut-id]').length);
    o.allIds = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((e) => e.getAttribute('data-shortcut-id')));
    o.toggleRow = await page.evaluate(() => { const e = document.querySelector('[role="dialog"] [data-shortcut-id="overview-toggle"]'); if (!e) return null; const sec = e.closest('section,[role="group"]') || e.parentElement.closest('div'); const h = sec ? sec.querySelector('h2,h3,h4,[role="heading"]') : null; return { text: e.textContent, heading: h ? h.textContent : null, kbd: [...e.querySelectorAll('kbd')].map((k) => k.textContent) }; });
    await page.keyboard.type('overview'); await sleep(400);
    o.filtered = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((e) => e.getAttribute('data-shortcut-id')));
    await page.screenshot({ path: path.join(outDir, `sheet-overview-${key}.png`) });
    await page.keyboard.press('Escape'); await sleep(300);
    return o;
  });

  // ---------- C-CAPTION-232 with long video name ----------
  await step(r, 'caption', async () => {
    const o = {}; await blur(page);
    o.empty = await m(page);
    const fc = []; page.on('filechooser', (c) => fc.push(c)); await sleep(500);
    await page.getByRole('button', { name: 'Your own video' }).first().click();
    for (let i = 0; i < 30 && !fc.length; i++) await sleep(100);
    if (!fc.length) return { ...o, error: 'no filechooser' };
    await fc[0].setFiles(VIDEO);
    await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-video-caption"]')?.textContent || '').length > 20, undefined, { timeout: 30000 }).catch(() => {});
    await sleep(1500);
    o.loaded = await m(page);
    o.capStyle = await page.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-video-caption"]'); if (!e) return null; const s = getComputedStyle(e); return { scrollW: e.scrollWidth, clientW: e.clientWidth, ws: s.whiteSpace, to: s.textOverflow, h: e.getBoundingClientRect().height }; });
    await page.screenshot({ path: path.join(outDir, `caption-long-${key}.png`) });
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    o.loadedHidden = await m(page);
    await page.screenshot({ path: path.join(outDir, `caption-long-hidden-${key}.png`) });
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(350);
    // floating video expand / Escape with slot
    const exp = page.getByTestId('arrangement-video-expand');
    if (!process.env.NOFLOAT && await exp.count()) {
      await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
      await exp.click(); await sleep(600);
      o.floatHidden = await m(page);
      await page.screenshot({ path: path.join(outDir, `float-hidden-${key}.png`) });
      await blur(page); await page.keyboard.press('Escape'); await sleep(600);
      o.afterEscape = { ...(await m(page)), expandPressed: await exp.getAttribute('aria-pressed'), expandLabel: await exp.getAttribute('aria-label') };
      await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
      o.restored = (await m(page)).state;
    }
    o.errors = errors.slice();
    return o;
  });

  r.pageErrors = errors;
  await ctx.close();

  // ---------- C-TOGGLE-PERSIST ----------
  await step(r, 'persist', async () => {
    const o = {};
    const ctx2 = await browser.newContext({ viewport: vp });
    const init = () => {
      window.__ls = []; window.__frames = []; window.__fcp = null;
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ls.push({ t: e.startTime, v: e.value, had: e.hadRecentInput }); }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch (e) {}
      const tick = () => { const ov = document.querySelector('[data-testid="arrangement-overview"]'); let eff = null; if (ov) { eff = 1; let n = ov; while (n && n.nodeType === 1) { const s = getComputedStyle(n); eff *= Number(s.opacity); if (s.visibility === 'hidden' || s.display === 'none') eff = 0; n = n.parentElement; } } window.__frames.push({ t: performance.now(), ov: !!ov, eff, slot: !!document.querySelector('[data-testid="arrangement-overview-hidden-slot"]') }); if (window.__frames.length < 600) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    };
    const p1 = await open(ctx2, { init });
    await p1.page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    o.hiddenKey = (await m(p1.page)).key;
    const html = await (await ctx2.request.get(`${BASE}/studio-lab`)).text();
    o.ssrHasOverview = html.includes('data-testid="arrangement-overview"');
    o.ssrHasSlot = html.includes('arrangement-overview-hidden-slot');
    await p1.page.reload({ waitUntil: 'load' });
    await p1.page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 120000 });
    await sleep(1500);
    o.afterReload = await m(p1.page);
    const tl = await p1.page.evaluate(() => ({ ls: window.__ls, fcp: window.__fcp, frames: window.__frames }));
    const visFrames = tl.frames.filter((f) => f.ov && f.eff > 0);
    const firstSlot = tl.frames.find((f) => f.slot);
    o.flash = { fcp: tl.fcp, framesWithVisibleOverview: visFrames.length, firstFrame: tl.frames[0], lastVisibleOverviewT: visFrames.length ? visFrames[visFrames.length - 1].t : null, firstSlotT: firstSlot ? firstSlot.t : null, visibleAfterFcp: visFrames.filter((f) => tl.fcp != null && f.t >= tl.fcp).length };
    o.layoutShifts = tl.ls;
    await blur(p1.page); await p1.page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    o.shownKey = (await m(p1.page)).key; o.shownState = (await m(p1.page)).state;
    o.errors = p1.errors;
    await ctx2.close();
    const ctx3 = await browser.newContext({ viewport: vp });
    const p3 = await open(ctx3);
    o.fresh = await m(p3.page);
    await ctx3.close();
    // second context: hide, fresh context still shown
    const ctx4 = await browser.newContext({ viewport: vp });
    const p4 = await open(ctx4); await p4.page.keyboard.press('Control+Alt+KeyO'); await sleep(300); o.ctx4hidden = (await m(p4.page)).key;
    const ctx5 = await browser.newContext({ viewport: vp }); const p5 = await open(ctx5); o.freshWhileOtherHidden = (await m(p5.page)).state;
    await ctx4.close(); await ctx5.close();
    return o;
  });
}

(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  analyzer = await (await browser.newContext()).newPage();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    try { await run(browser, vp); } catch (e) { R[`${vp.width}x${vp.height}`].fatal = String(e).slice(0, 800); }
    save();
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
  console.log('done');
})();
