// C round 231: C-DETAIL, C-NOTICE, C-FIRSTRUN, C-LANEHINT, C-VIDEO-SOLO, C-BUDGET rows. usage: node c231.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const R = { started: new Date().toISOString() };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(outDir, 'c231.json'), JSON.stringify(R, null, 2));
const KEY = 'czaba-studio-notice-dismissed:studio-lab-demo';

async function open(browser, vp, opts = {}) {
  const ctx = opts.ctx || (await browser.newContext({ viewport: vp, acceptDownloads: true }));
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled;
  }, undefined, { timeout: 90000 });
  await sleep(1200);
  return { ctx, page, errs };
}

const rowsOf = (page, sel) => page.evaluate((sel) => {
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const tops = new Set();
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 0 && r.height > 0) tops.add(Math.round(r.top));
    }
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out.push({ text: el.textContent, rows: tops.size, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)), clip: cs.clip, clipPath: cs.clipPath, position: cs.position, track: el.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null });
  }
  return out;
}, sel);

const clips = (page) => page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ kind: c.getAttribute('data-clip-kind'), start: c.getAttribute('data-clip-start'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') })));
const hints = (page) => rowsOf(page, '[data-testid="arrangement-lane-empty-hint"]');
const status = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
const active = (page) => page.evaluate(() => document.activeElement && (document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName));

async function axDesc(page, testid) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const dom = await cdp.send('DOM.getDocument', { depth: -1 });
  const out = {};
  for (const id of testid) {
    const q = await cdp.send('DOM.querySelector', { nodeId: dom.root.nodeId, selector: `[data-testid="${id}"]` });
    if (!q.nodeId) { out[id] = 'missing'; continue; }
    const desc = await cdp.send('DOM.describeNode', { nodeId: q.nodeId });
    const n = nodes.find((x) => x.backendDOMNodeId === desc.node.backendNodeId);
    out[id] = n ? { role: n.role?.value, name: n.name?.value, description: n.description?.value ?? null, disabled: (n.properties || []).find((p) => p.name === 'disabled')?.value?.value ?? null } : 'no-ax-node';
  }
  await cdp.detach();
  return out;
}

const DETAIL_FIELDS = ['arrangement-detail-start', 'arrangement-detail-end', 'arrangement-detail-apply', 'arrangement-detail-clip-gain-input'];

async function detailState(page) {
  return page.evaluate((ids) => {
    const g = (id) => document.querySelector(`[data-testid="${id}"]`);
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)); };
    const panel = g('arrangement-detail-panel') || g('arrangement-detail-header-label')?.closest('section');
    const visibleTexts = [];
    if (panel) {
      const w = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim(); if (!t) continue;
        const el = n.parentElement; const r = el.getBoundingClientRect();
        let hidden = false; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || c.opacity === '0') hidden = true; }
        if (!hidden && r.width > 1 && r.height > 1) visibleTexts.push(t);
      }
    }
    const fields = {};
    for (const el of panel ? panel.querySelectorAll('input, button, [role="slider"]') : []) {
      const k = el.getAttribute('data-testid') || el.getAttribute('aria-label') || el.textContent.trim().slice(0, 20);
      fields[k] = { box: box(el), title: el.getAttribute('title'), disabled: el.disabled ?? null, describedby: el.getAttribute('aria-describedby'), describedText: (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean).map((i) => document.getElementById(i)?.textContent ?? null) };
    }
    const reason = (id) => { const el = g(id); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { text: el.textContent, box: [r.width, r.height].map((v) => +v.toFixed(1)), clip: cs.clip, position: cs.position, overflow: cs.overflow }; };
    return { header: g('arrangement-detail-header-label')?.textContent ?? null, hint: g('arrangement-detail-hint')?.textContent ?? null, visibleTexts, reason: reason('arrangement-detail-reason'), cgReason: reason('arrangement-detail-clip-gain-reason'), fields };
  }, DETAIL_FIELDS);
}

async function ensureDetailOpen(page) {
  const t = page.getByTestId('arrangement-detail-toggle');
  if (await t.count()) {
    const exp = await t.getAttribute('aria-expanded');
    if (exp === 'false') { await t.click(); await sleep(500); }
    return exp;
  }
  return 'no-toggle';
}

async function ringInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement; const cs = getComputedStyle(el);
    let bg = null; for (let e = el.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; } }
    return { id: el.getAttribute('data-testid'), name: el.getAttribute('aria-label'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, panelBg: bg, focusSource: document.documentElement.getAttribute('data-focus-source') };
  });
}

async function run(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = {};
  R[key] = r;
  // S0 fresh
  let { ctx, page, errs } = await open(browser, vp);
  r.S0 = { status: await status(page), hints: await hints(page), notice: await rowsOf(page, '[data-testid="arrangement-library-notice"]'), statusRows: await rowsOf(page, '[data-testid="arrangement-status"]'), detailHeader: await rowsOf(page, '[data-testid="arrangement-detail-header-label"]'), detailHint: await rowsOf(page, '[data-testid="arrangement-detail-hint"]'), reasons: await rowsOf(page, '[data-testid="arrangement-detail-reason"], [data-testid="arrangement-detail-clip-gain-reason"]') };
  r.S0.soloTitles = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((t) => { const b = [...t.querySelectorAll('button[aria-pressed]')].find((x) => /^Solo/.test(x.getAttribute('aria-label') || '')); const m = [...t.querySelectorAll('button[aria-pressed]')].find((x) => /^Mute/.test(x.getAttribute('aria-label') || '')); return { track: t.getAttribute('data-track-id'), soloTitle: b?.getAttribute('title'), soloLabel: b?.getAttribute('aria-label'), muteTitle: m?.getAttribute('title'), muteLabel: m?.getAttribute('aria-label') }; }));
  r.S0.trackIds = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((t) => t.getAttribute('data-track-id')));
  r.S0.hintStyle = await page.evaluate(() => { const h = document.querySelector('[data-testid="arrangement-lane-empty-hint"]'); if (!h) return null; const cs = getComputedStyle(h); return { pe: cs.pointerEvents, color: cs.color, fontSize: cs.fontSize }; });
  await page.screenshot({ path: path.join(outDir, `S0-${key}.png`) });
  // S0x detail
  r.S0x = { toggleBefore: await ensureDetailOpen(page) };
  Object.assign(r.S0x, await detailState(page));
  r.S0x.ax = await axDesc(page, DETAIL_FIELDS.concat(['arrangement-detail-clip-gain-fader']));
  r.S0x.rows = await rowsOf(page, '[data-testid="arrangement-detail-hint"], [data-testid="arrangement-detail-reason"], [data-testid="arrangement-detail-clip-gain-reason"], [data-testid="arrangement-detail-header-label"]');
  await page.screenshot({ path: path.join(outDir, `S0x-${key}.png`) });
  // Lane hint: active lane switching via name buttons
  const nameBtn = (n) => page.getByRole('button', { name: `${n} — set as the active track`, exact: true });
  r.lane = {};
  for (const n of ['Stems', 'SFX', 'Video', 'Music']) {
    try { await nameBtn(n).click(); await sleep(300); r.lane[`after-${n}`] = (await hints(page)).map((h) => h.track); } catch (e) { r.lane[`after-${n}`] = `err ${String(e).slice(0, 120)}`; }
  }
  // gesture across the hint area: drag in Music lane body over the hint
  const h0 = (await hints(page))[0];
  if (h0) {
    const y = h0.box[1] + h0.box[3] / 2; const x0 = h0.box[0] + 20; const x1 = x0 + 160;
    await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x1, y, { steps: 12 }); await page.mouse.up(); await sleep(400);
    r.lane.gesture = await page.evaluate(() => ({ range: document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null, rangeEls: document.querySelectorAll('[data-range-start]').length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
    r.lane.gestureHints = (await hints(page)).map((h) => h.track);
    await page.screenshot({ path: path.join(outDir, `lane-gesture-${key}.png`) });
    await page.mouse.click(h0.box[0] + 300, y); await sleep(300); // clear range with an empty-lane click
  }
  // fold / unfold the active Music lane
  const musicId = r.S0.trackIds[0];
  const fold = page.locator(`[data-track-id="${musicId}"] [data-testid="arrangement-track-fold"]`).first();
  if (await fold.count()) {
    await fold.click(); await sleep(400); r.lane.folded = (await hints(page)).map((h) => h.track);
    await page.screenshot({ path: path.join(outDir, `lane-folded-${key}.png`) });
    await fold.click(); await sleep(400); r.lane.unfolded = (await hints(page)).map((h) => h.track);
  } else r.lane.folded = 'no fold button in music lane';
  // Library drag held over the Music lane (real mouse)
  const opt = page.locator('[role="option"]').first();
  const ob = await opt.boundingBox();
  const hm = (await hints(page))[0];
  if (ob && hm) {
    await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await page.mouse.down();
    await page.mouse.move(ob.x + ob.width / 2 + 30, ob.y + ob.height / 2, { steps: 5 });
    await page.mouse.move(hm.box[0] + 200, hm.box[1] + hm.box[3] / 2, { steps: 20 }); await sleep(300);
    r.lane.midDrag = { hints: (await hints(page)).map((h) => h.track), ghost: await page.evaluate(() => document.querySelectorAll('[data-testid*="ghost"]').length) };
    await page.screenshot({ path: path.join(outDir, `lane-middrag-${key}.png`) });
    await page.keyboard.press('Escape'); await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2, { steps: 10 }); await page.mouse.up(); await sleep(500);
    r.lane.afterDragCancel = { hints: (await hints(page)).map((h) => h.track), clips: await clips(page) };
  }
  r.errors1 = errs;
  await ctx.close();

  // C-FIRSTRUN: fresh, click (5,5), Enter
  ({ ctx, page, errs } = await open(browser, vp));
  r.first = { status: await status(page) };
  await page.mouse.click(5, 5); await sleep(200);
  await page.keyboard.press('Enter'); await sleep(1500);
  r.first.afterEnter = { clips: await clips(page), hints: (await hints(page)).map((h) => h.track) };
  await page.screenshot({ path: path.join(outDir, `first-enter-${key}.png`) });
  await page.mouse.click(5, 5); await sleep(200);
  await page.keyboard.press('Control+z'); await sleep(800);
  r.first.afterUndo = { clips: await clips(page), hints: (await hints(page)).map((h) => h.track) };
  // S1 detail: add + click (5,5) then select the clip to compare field boxes
  await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(1200);
  await page.mouse.click(5, 5); await sleep(300);
  await ensureDetailOpen(page);
  const c1 = page.locator('[data-clip-kind="audio"]').first(); const cb = await c1.boundingBox();
  await page.mouse.click(cb.x + Math.min(cb.width / 2, 60), cb.y + cb.height * 0.7); await sleep(500);
  r.S1sel = await detailState(page);
  await page.screenshot({ path: path.join(outDir, `S1sel-${key}.png`) });
  // group: add a second clip on another lane, ctrl+click both
  await page.mouse.click(5, 5);
  await nameBtn('SFX').click(); await sleep(200);
  await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(1200);
  const cs = page.locator('[data-clip-kind="audio"]');
  const b0 = await cs.nth(0).boundingBox(); const b1 = await cs.nth(1).boundingBox();
  await page.mouse.click(b0.x + Math.min(b0.width / 2, 60), b0.y + b0.height * 0.7); await sleep(300);
  await page.keyboard.down('Control'); await page.mouse.click(b1.x + Math.min(b1.width / 2, 60), b1.y + b1.height * 0.7); await page.keyboard.up('Control'); await sleep(500);
  r.group = await detailState(page);
  r.group.rows = await rowsOf(page, '[data-testid="arrangement-detail-reason"], [data-testid="arrangement-detail-clip-gain-reason"]');
  await page.screenshot({ path: path.join(outDir, `group-${key}.png`) });
  r.errors2 = errs;
  await ctx.close();

  // drag a library option onto SFX lane (fresh)
  ({ ctx, page, errs } = await open(browser, vp));
  const sfxRow = page.locator(`[data-track-id="${r.S0.trackIds[2]}"]`);
  r.dragAdd = { sfxId: r.S0.trackIds[2] };
  const o2 = await page.locator('[role="option"]').first().boundingBox();
  const sb = await sfxRow.boundingBox();
  await page.mouse.move(o2.x + o2.width / 2, o2.y + o2.height / 2); await page.mouse.down();
  await page.mouse.move(o2.x + o2.width / 2 + 30, o2.y + o2.height / 2, { steps: 5 });
  await page.mouse.move(sb.x + 420, sb.y + sb.height / 2, { steps: 25 }); await sleep(200);
  await page.mouse.up(); await sleep(1500);
  r.dragAdd.realMouse = await clips(page);
  if (!r.dragAdd.realMouse.length) {
    await page.locator('[role="option"]').first().dragTo(sfxRow, { targetPosition: { x: 420, y: sb.height / 2 } }); await sleep(1500);
    r.dragAdd.dragTo = await clips(page);
  }
  await page.screenshot({ path: path.join(outDir, `drag-add-${key}.png`) });
  r.errors3 = errs;
  await ctx.close();

  // ? sheet
  ({ ctx, page, errs } = await open(browser, vp));
  await page.mouse.click(5, 5); await sleep(200);
  await page.keyboard.press('Shift+Slash'); await sleep(600);
  r.sheet = { open: await page.getByRole('dialog').count(), name: await page.getByRole('dialog').first().getAttribute('aria-label').catch(() => null) };
  await page.screenshot({ path: path.join(outDir, `sheet-${key}.png`) });
  await page.keyboard.press('Escape'); await sleep(500);
  r.sheet.afterEsc = await page.getByRole('dialog').count();
  r.sheet.clips = (await clips(page)).length;
  r.errors4 = errs;
  await ctx.close();

  // C-NOTICE keyboard path
  ({ ctx, page, errs } = await open(browser, vp));
  await page.getByTestId('arrangement-library-search').focus();
  await page.keyboard.press('Tab'); await sleep(300);
  r.notice = { afterTab: await ringInfo(page) };
  await page.screenshot({ path: path.join(outDir, `notice-kbfocus-${key}.png`) });
  const db = await page.getByTestId('arrangement-library-notice-dismiss').boundingBox();
  r.notice.dismissBox = db;
  r.notice.dismissTitle = await page.getByTestId('arrangement-library-notice-dismiss').getAttribute('title');
  await page.keyboard.press('Shift+Tab'); await sleep(200);
  r.notice.shiftTabBack = await active(page);
  await page.keyboard.press('Tab'); await sleep(200);
  await page.keyboard.press('Enter'); await sleep(800);
  r.notice.afterEnter = { present: await page.getByTestId('arrangement-library-notice').count(), focus: await active(page), clips: (await clips(page)).length, key: await page.evaluate((k) => localStorage.getItem(k), KEY) };
  await page.keyboard.press('Tab'); await sleep(200);
  r.notice.tabAfterDismiss = await active(page);
  // SD: reload, record early state
  await page.evaluate(() => { window.__c = 1; });
  const shots = [];
  const p = page.reload({ waitUntil: 'commit' });
  await p;
  await page.waitForLoadState('domcontentloaded');
  const t0 = Date.now();
  shots.push({ t: 0, present: await page.locator('[data-testid="arrangement-library-notice"]').count() });
  await page.screenshot({ path: path.join(outDir, `SD-early-${key}.png`) });
  shots.push({ t: Date.now() - t0, present: await page.locator('[data-testid="arrangement-library-notice"]').count() });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 90000 });
  shots.push({ t: Date.now() - t0, present: await page.locator('[data-testid="arrangement-library-notice"]').count() });
  await sleep(1500);
  r.notice.SD = { shots, presentSettled: await page.getByTestId('arrangement-library-notice').count(), dismissPresent: await page.getByTestId('arrangement-library-notice-dismiss').count(), key: await page.evaluate((k) => localStorage.getItem(k), KEY) };
  r.notice.SD.cls = await page.evaluate(() => new Promise((res) => { const out = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) out.push({ v: e.value, t: e.startTime, src: (e.sources || []).map((s) => s.node && (s.node.getAttribute?.('data-testid') || s.node.nodeName)) }); }).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(out), 300); }));
  await page.screenshot({ path: path.join(outDir, `SD-${key}.png`) });
  r.notice.SD.rows = await rowsOf(page, '[data-testid="arrangement-library-notice"]');
  r.errors5 = errs;
  await ctx.close();

  // SD flash measured with a MutationObserver from document start
  {
    const c2 = await browser.newContext({ viewport: vp });
    await c2.addInitScript((k) => {
      try { localStorage.setItem(k, '1'); } catch {}
      window.__noticeLog = [];
      const t0 = performance.now();
      const check = () => window.__noticeLog.push({ t: +(performance.now()).toFixed(1), present: !!document.querySelector('[data-testid="arrangement-library-notice"]') });
      new MutationObserver(() => { const pres = !!document.querySelector('[data-testid="arrangement-library-notice"]'); const last = window.__noticeLog[window.__noticeLog.length - 1]; if (!last || last.present !== pres) check(); }).observe(document, { childList: true, subtree: true });
      void t0;
    }, KEY);
    const pg = await c2.newPage();
    await pg.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await sleep(3000);
    r.notice.SDflash = await pg.evaluate(() => ({ log: window.__noticeLog, fcp: performance.getEntriesByType('paint').map((e) => [e.name, +e.startTime.toFixed(1)]), nav: (() => { const n = performance.getEntriesByType('navigation')[0]; return { domInteractive: +n.domInteractive.toFixed(1), dcl: +n.domContentLoadedEventEnd.toFixed(1), load: +n.loadEventEnd.toFixed(1) }; })(), presentNow: !!document.querySelector('[data-testid="arrangement-library-notice"]') }));
    await c2.close();
  }

  // Mouse click dismiss (fresh) + ring after mouse press
  ({ ctx, page, errs } = await open(browser, vp));
  r.mouse = { rowsBefore: await rowsOf(page, '[data-testid="arrangement-library-notice"]') };
  const dbtn = page.getByTestId('arrangement-library-notice-dismiss');
  const bb = await dbtn.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await sleep(150);
  r.mouse.duringPress = await ringInfo(page);
  await page.screenshot({ path: path.join(outDir, `notice-mousepress-${key}.png`) });
  await page.mouse.up(); await sleep(600);
  r.mouse.after = { present: await page.getByTestId('arrangement-library-notice').count(), focus: await active(page), ring: await ringInfo(page), clips: (await clips(page)).length, key: await page.evaluate((k) => localStorage.getItem(k), KEY) };
  r.errors6 = errs;
  await ctx.close();

  // fresh context shows it again + width at which notice becomes 1 row
  ({ ctx, page, errs } = await open(browser, vp));
  r.fresh = { present: await page.getByTestId('arrangement-library-notice').count(), key: await page.evaluate((k) => localStorage.getItem(k), KEY) };
  const sep = page.getByTestId('arrangement-library-separator');
  const sbx = await sep.boundingBox();
  if (sbx) {
    const widths = [];
    let x = sbx.x + sbx.width / 2; const y = sbx.y + Math.min(sbx.height / 2, 200);
    await page.mouse.move(x, y); await page.mouse.down();
    for (let dx = 8; dx <= 200; dx += 8) {
      await page.mouse.move(x + dx, y, { steps: 2 }); await sleep(60);
      const rr = (await rowsOf(page, '[data-testid="arrangement-library-notice"]'))[0];
      const lib = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-library-separator"]'); return s ? +s.getBoundingClientRect().x.toFixed(1) : null; });
      widths.push({ dx, rows: rr?.rows, noticeW: rr?.box[2], sepX: lib });
      if (rr && rr.rows === 1) break;
    }
    await page.mouse.up();
    r.fresh.widthScan = widths;
    await page.screenshot({ path: path.join(outDir, `notice-1row-${key}.png`) });
  }
  r.errors7 = errs;
  await ctx.close();
  save();
}

(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    try { await run(browser, vp); } catch (e) { R[`${vp.width}x${vp.height}`].error = String(e).slice(0, 800); }
    save();
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
  console.log('done');
})();
