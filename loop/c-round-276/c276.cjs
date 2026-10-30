// C round 276: SYS-5 stage 1 browser rows. usage: node c276.cjs <base> <label> [onlyRegex]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const LABEL = process.argv[3] || 'new';
const ONLY = process.argv[4] ? new RegExp(process.argv[4]) : null;
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-276';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base: BASE, label: LABEL, startedAt: new Date().toISOString(), rows: {} };
const outFile = path.join(outDir, `c276-${LABEL}${process.argv[4] ? '-' + process.argv[4].replace(/[^a-z0-9]/gi, '_') : ''}.json`);
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));

const INIT = () => {
  window.__T = () => {
    const tr = document.querySelector('[data-testid="arrangement-transport"]');
    if (!tr) return {};
    const edit = [...tr.querySelectorAll('[data-testid="arrangement-transport-edit"] button')];
    const byLabel = (re) => [...tr.querySelectorAll('button')].find((b) => re.test(b.getAttribute('aria-label') || ''));
    const byText = (re) => [...tr.querySelectorAll('button')].find((b) => re.test((b.textContent || '').trim()));
    return {
      undo: byText(/^Undo/), redo: byText(/^Redo/), split: byText(/^Split/),
      delete: edit.find((b) => /^Delete/.test(b.getAttribute('aria-label') || b.textContent.trim())) || byLabel(/^Delete/),
      follow: tr.querySelector('[data-testid="arrangement-follow"]'),
      play: byLabel(/^Play$/), stop: byLabel(/^Stop$/), back: byLabel(/start/i),
      loop: [...tr.querySelectorAll('button[aria-pressed]')].find((b) => /Loop/i.test(b.textContent + (b.getAttribute('title') || ''))),
      zoomRange: tr.querySelector('[data-testid="arrangement-zoom-range"]'),
      zoomBack: tr.querySelector('[data-testid="arrangement-zoom-back"]'),
      fit: tr.querySelector('[data-testid="arrangement-fit"]'),
      export: byText(/^Export$/),
    };
  };
  window.__name = (el) => {
    if (!el || el === document.body) return el ? 'BODY' : null;
    const T = window.__T();
    for (const [k, v] of Object.entries(T)) if (v === el) return k;
    return (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40) + '|' + el.tagName + (el.dataset.testid ? '#' + el.dataset.testid : '');
  };
  window.__snap = () => {
    const q = (s) => document.querySelector(s);
    const T = window.__T();
    return {
      status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
      undoTitle: T.undo?.getAttribute('title') ?? null,
      undoText: T.undo?.textContent.trim() ?? null,
      redoTitle: T.redo?.getAttribute('title') ?? null,
      clips: document.querySelectorAll('[data-clip-kind="audio"]').length,
      ranges: document.querySelectorAll('[data-testid="arrangement-range"]').length,
      rangeText: q('[data-testid="arrangement-range"]')?.textContent ?? null,
      loopPressed: T.loop?.getAttribute('aria-pressed') ?? null,
      loopBrace: document.querySelectorAll('[data-testid="arrangement-loop-brace"]').length,
      zoom: q('[data-testid="arrangement-zoom-readout"]')?.textContent ?? null,
      zoomBackDisabled: T.zoomBack ? (T.zoomBack.disabled || T.zoomBack.getAttribute('aria-disabled') === 'true') : null,
      scrollLeft: q('[data-testid="arrangement-timeline-scroller"]')?.scrollLeft ?? null,
      playing: q('[data-playing]')?.getAttribute('data-playing') ?? null,
      active: window.__name(document.activeElement),
    };
  };
};
const SEVEN = ['undo', 'redo', 'split', 'delete', 'loop', 'zoomRange', 'zoomBack'];
const TITLES_AFTER = {
  undo: 'Undo — nothing to undo yet (Ctrl+Z)', redo: 'Redo — nothing to redo (Ctrl+Shift+Z)',
  split: 'Split — select a clip or make a time selection first (Ctrl+E)', delete: 'Delete — select a clip or make a time selection first (Delete)',
  loop: 'Loop: make a time selection first (Ctrl+L)', zoomRange: 'Zoom to selection: make a time selection first (Z)',
  zoomBack: 'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
};
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await sleep(2000);
  return { ctx, page, errors };
}
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(1000);
  await blur(page);
}
async function clipPoint(page) {
  return page.evaluate(() => {
    const c = document.querySelector('[data-clip-kind="audio"]'); if (!c) return null;
    const r = c.getBoundingClientRect();
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
    const left = Math.max(r.left, sc.left + 224 + 4); const right = Math.min(r.right, sc.right - 14);
    return { x: left + Math.min(40, (right - left) / 2), y: r.top + r.height * 0.65, ty: r.top + 10 };
  });
}
async function timeSelect(page) {
  const p = await clipPoint(page);
  await page.mouse.move(p.x - 10, p.y); await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y, { steps: 8 }); await page.mouse.up(); await sleep(400);
}
async function selectClip(page) {
  const p = await clipPoint(page);
  await page.mouse.click(p.x, p.ty); await sleep(400);
}
const snap = (page) => page.evaluate(() => window.__snap());
const focusKey = async (page, k) => { await page.evaluate((key) => window.__T()[key].focus(), k); await sleep(100); };
const attrs = (page, k) => page.evaluate((key) => { const b = window.__T()[key]; return b ? { ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.disabled, hasDisabledAttr: b.hasAttribute('disabled'), title: b.getAttribute('title'), ariaLabel: b.getAttribute('aria-label') } : null; }, k);
async function tabTo(page, k, max = 40) {
  for (let i = 0; i < max; i += 1) {
    if (await page.evaluate((key) => document.activeElement === window.__T()[key], k)) return true;
    await page.keyboard.press('Tab'); await sleep(80);
  }
  return page.evaluate((key) => document.activeElement === window.__T()[key], k);
}
const ring = (page, k) => page.evaluate((key) => {
  const b = key === '__active' ? document.activeElement : window.__T()[key]; const cs = getComputedStyle(b);
  let op = 1; for (let e = b; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity);
  const child = b.firstElementChild ? getComputedStyle(b.firstElementChild).opacity : null;
  return { focusVisible: b.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, opacity: cs.opacity, effOpacity: +op.toFixed(3), childOpacity: child, bg: cs.backgroundColor, cursor: cs.cursor, transform: cs.transform };
}, k);

// ---------- rows ----------
async function rowTab(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = { forward: [], backward: [] };
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await blur(page);
  for (let i = 0; i < 60; i += 1) {
    await page.keyboard.press('Tab'); await sleep(120);
    const s = await page.evaluate(() => { const a = document.activeElement; if (!a || !a.closest('[data-testid="arrangement-transport"]')) return null; const cs = getComputedStyle(a); let op = 1; for (let e = a; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity); return { name: window.__name(a), ariaDisabled: a.getAttribute('aria-disabled'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, fv: a.matches(':focus-visible'), effOpacity: +op.toFixed(3) }; });
    if (s && !(r.forward.length && r.forward[r.forward.length - 1].name === s.name)) r.forward.push(s);
  }
  await blur(page);
  await page.keyboard.press('End'); await sleep(1200);
  await blur(page);
  for (let i = 0; i < 140; i += 1) {
    await page.keyboard.press('Shift+Tab'); await sleep(100);
    const s = await page.evaluate(() => { const a = document.activeElement; return a && a.closest('[data-testid="arrangement-transport"]') ? window.__name(a) : null; });
    if (s && r.backward[r.backward.length - 1] !== s) r.backward.push(s);
    if (r.backward.length >= 14 && !s) break;
  }
  r.forwardNames = r.forward.map((s) => s.name);
  await page.screenshot({ path: path.join(outDir, `${LABEL}-tab-${vp.width}x${vp.height}.png`) });
  await ctx.close(); return r;
}
async function rowAx(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  await page.evaluate((keys) => { const T = window.__T(); for (const k of keys) T[k]?.setAttribute('data-c276', k); }, SEVEN);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const r = {};
  for (const k of SEVEN) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-c276="${k}"]` });
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const n = nodes[0];
    const prop = (name) => n.properties?.find((p) => p.name === name)?.value?.value;
    r[k] = { role: n.role?.value, name: n.name?.value, description: n.description?.value ?? null, disabled: prop('disabled') ?? false, focusable: prop('focusable') ?? false };
  }
  await ctx.close(); return r;
}
async function rowNoop(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = { before: await snap(page), per: {} };
  for (const k of SEVEN) {
    const a = await attrs(page, k);
    const res = { attrs: a };
    await page.keyboard.press('Shift'); await focusKey(page, k);
    res.focused = await page.evaluate((key) => document.activeElement === window.__T()[key], k);
    await page.keyboard.press('Enter'); await sleep(500); res.enter = await snap(page);
    await focusKey(page, k);
    await page.keyboard.press('Control+Space'); await sleep(500); res.ctrlSpace = await snap(page);
    if (await page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing') === 'true')) { await page.keyboard.press('Space'); await sleep(400); }
    const bb = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, k);
    await page.mouse.click(bb.x, bb.y); await sleep(500); res.click = await snap(page);
    r.per[k] = res;
  }
  const strip = (s) => { const { active, playing, ...rest } = s; return JSON.stringify(rest); };
  r.allSame = Object.values(r.per).every((p) => [p.enter, p.ctrlSpace, p.click].every((s) => strip(s) === strip(r.before)));
  r.diffs = [];
  for (const [k, p] of Object.entries(r.per)) for (const w of ['enter', 'ctrlSpace', 'click']) if (strip(p[w]) !== strip(r.before)) r.diffs.push({ k, w, s: p[w] });
  await ctx.close(); return r;
}
async function rowMouseFocus(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  await page.locator('[data-source-id]').first().focus(); await sleep(200);
  r.before = await page.evaluate(() => window.__name(document.activeElement));
  const bb = await page.evaluate(() => { const b = window.__T().split.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  await page.mouse.click(bb.x, bb.y); await sleep(400);
  r.after = await page.evaluate(() => window.__name(document.activeElement));
  r.same = r.before === r.after;
  await ctx.close(); return r;
}
async function rowTitles(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = { empty: {}, clip: {}, range: {} };
  for (const k of SEVEN) {
    const bb = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, k);
    await page.mouse.move(bb.x, bb.y); await sleep(1500);
    const a = await attrs(page, k);
    r.empty[k] = { title: a.title, matches: a.title === TITLES_AFTER[k], hovered: await page.evaluate((key) => window.__T()[key].matches(':hover'), k) };
  }
  await addPulse(page); await selectClip(page);
  r.clip = { split: await attrs(page, 'split'), delete: await attrs(page, 'delete'), selectedClips: await page.evaluate(() => document.querySelectorAll('[data-clip-kind="audio"][aria-selected="true"], [data-clip-kind="audio"][data-selected="true"]').length) };
  await timeSelect(page);
  r.range = { split: await attrs(page, 'split'), delete: await attrs(page, 'delete'), ranges: await page.evaluate(() => document.querySelectorAll('[data-testid="arrangement-range"]').length) };
  await ctx.close(); return r;
}
async function rowHandoffs(browser, vp) {
  const r = {};
  // DELETE
  { const { ctx, page } = await open(browser, vp);
    await addPulse(page); await selectClip(page);
    await page.keyboard.press('Shift'); await focusKey(page, 'split'); await page.keyboard.press('Tab'); await sleep(150);
    const d = { onDelete: await page.evaluate(() => window.__name(document.activeElement)), before: await snap(page) };
    await page.keyboard.press('Enter'); await sleep(600);
    d.after = await snap(page); d.ring = await ring(page, '__active');
    await page.keyboard.press('Enter'); await sleep(600);
    d.after2 = await snap(page);
    d.pass = d.onDelete === 'delete' && d.after.clips === d.before.clips - 1 && d.after.active === 'undo' && d.after2.clips === d.before.clips && d.ring.outlineStyle !== 'none';
    await page.screenshot({ path: path.join(outDir, `${LABEL}-handoff-delete-${vp.width}.png`) });
    r.delete = d; await ctx.close(); }
  // UNDO + ENABLE-WHILE-FOCUSED
  { const { ctx, page } = await open(browser, vp);
    await addPulse(page);
    await page.keyboard.press('Shift'); await focusKey(page, 'undo');
    const u = { before: await snap(page) };
    await page.keyboard.press('Enter'); await sleep(600); u.after = await snap(page); u.ring = await ring(page, '__active');
    u.pass = u.after.clips === u.before.clips - 1 && u.after.active === 'redo';
    r.undo = u;
    const e = {};
    await page.keyboard.press('Enter'); await sleep(600); e.afterRedo = await snap(page);
    e.redoAttrs = await attrs(page, 'redo');
    await page.keyboard.press('Tab'); await sleep(150);
    e.onRedo = await page.evaluate(() => window.__name(document.activeElement));
    e.redoAttrs2 = await attrs(page, 'redo');
    await page.keyboard.press('Control+z'); await sleep(600);
    e.afterCtrlZ = await snap(page); e.redoAttrs3 = await attrs(page, 'redo');
    await page.keyboard.press('Enter'); await sleep(600); e.afterEnter = await snap(page);
    e.pass = e.afterRedo.clips === u.before.clips && e.afterRedo.active === 'undo' && e.onRedo === 'redo' && e.redoAttrs2.ariaDisabled === 'true'
      && e.afterCtrlZ.clips === u.before.clips - 1 && e.redoAttrs3.ariaDisabled === null && e.afterCtrlZ.active === 'redo' && e.afterEnter.clips === u.before.clips;
    r.enableWhileFocused = e; await ctx.close(); }
  // ZOOM
  { const { ctx, page } = await open(browser, vp);
    await addPulse(page); await timeSelect(page);
    const z = { start: await snap(page) };
    await blur(page);
    await page.keyboard.press('z'); await sleep(500); await page.keyboard.press('z'); await sleep(500);
    z.afterZ = await snap(page);
    await page.keyboard.press('Shift'); await focusKey(page, 'zoomRange'); await page.keyboard.press('Tab'); await sleep(100);
    if (await page.evaluate(() => window.__name(document.activeElement)) !== 'zoomBack') { /* zoom input between */ await page.keyboard.press('Tab'); await sleep(100); }
    z.onBack = await page.evaluate(() => window.__name(document.activeElement));
    z.steps = [];
    for (let i = 0; i < 6; i += 1) {
      const a = await attrs(page, 'zoomBack');
      if (a.ariaDisabled === 'true' || a.disabled) break;
      if (await page.evaluate(() => window.__name(document.activeElement)) !== 'zoomBack') break;
      await page.keyboard.press('Enter'); await sleep(500);
      z.steps.push(await snap(page));
    }
    z.final = await snap(page); z.ring = await ring(page, '__active');
    z.pass = z.onBack === 'zoomBack' && z.steps.length >= 1 && z.final.active === 'fit';
    r.zoom = z; await ctx.close(); }
  return r;
}
async function rowSpace(browser, vp) {
  const r = {};
  for (const target of ['zoomRange', 'fit']) {
    const { ctx, page } = await open(browser, vp);
    await addPulse(page);
    const t = { attrs: await attrs(page, target) };
    await page.keyboard.press('Shift'); await focusKey(page, target);
    t.before = await snap(page);
    await page.keyboard.press('Space'); await sleep(1200); t.after1 = await snap(page);
    await page.keyboard.press('Space'); await sleep(1200); t.after2 = await snap(page);
    t.seq = [t.before.playing, t.after1.playing, t.after2.playing].join('>');
    t.zoomSame = t.before.zoom === t.after2.zoom;
    t.focusKept = t.after2.active === target;
    r[target] = t; await ctx.close();
  }
  return r;
}
async function rowShortcuts(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  for (const k of ['Control+z', 'Control+e', 'Delete', 'Control+l', 'z', 'x']) {
    await page.locator('[data-testid="arrangement-timeline-scroller"]').focus(); await sleep(150);
    await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); window.__st0 = s.textContent; });
    await page.keyboard.press(k); await sleep(500);
    r[k] = { status: await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent), active: await page.evaluate(() => window.__name(document.activeElement)) };
  }
  await ctx.close(); return r;
}
async function rowSheet(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  await page.keyboard.press('Shift'); await focusKey(page, 'undo');
  r.focusedBefore = await page.evaluate(() => window.__name(document.activeElement));
  await page.keyboard.press('Shift+Slash'); await sleep(700);
  r.dialogOpen = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => (d.getAttribute('aria-label') || d.textContent).slice(0, 40)));
  r.focusInSheet = await page.evaluate(() => window.__name(document.activeElement));
  await page.keyboard.press('Escape'); await sleep(700);
  r.dialogAfter = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
  r.focusAfter = await page.evaluate(() => window.__name(document.activeElement));
  await ctx.close(); return r;
}
async function rowLook(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = { rest: {}, boxes: {}, hoverSoft: {}, press: {}, ring: {} };
  // pixels at rest via screenshot decode in page
  const pix = async (k) => {
    const box = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, k);
    const buf = await page.screenshot({ clip: { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 } });
    return page.evaluate(async ([b64, bx]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const dpr = img.width / (bx.width + 12);
      const fill = at(Math.round((6 + 4) * dpr), Math.round((6 + bx.height / 2) * dpr));
      let best = [0, 0, 0]; let bl = -1;
      for (let y = Math.round(6 * dpr); y < Math.round((6 + bx.height) * dpr); y += 1) for (let x = Math.round(6 * dpr); x < Math.round((6 + bx.width) * dpr); x += 1) { const p = at(x, y); const l = p[0] + p[1] + p[2]; if (l > bl) { bl = l; best = p; } }
      const ringPx = at(Math.round((6 - 2.5) * dpr), Math.round((6 + bx.height / 2) * dpr));
      const outside = at(0, Math.round((6 + bx.height / 2) * dpr));
      return { fill, text: best, ringPx, outside, dpr };
    }, [buf.toString('base64'), box]);
  };
  for (const k of [...SEVEN, 'fit']) { r.rest[k] = await pix(k); r.boxes[k] = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)); }, k); }
  for (const k of [...SEVEN, 'fit']) {
    const rest = await ring(page, k);
    const bb = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, k);
    await page.mouse.move(bb.x, bb.y); await sleep(450);
    const hov = await ring(page, k);
    await page.mouse.down(); await sleep(450);
    const pr = await ring(page, k);
    await page.mouse.up(); await sleep(200);
    await page.mouse.move(2, vp.height - 2); await sleep(400);
    r.hoverSoft[k] = { restBg: rest.bg, hoverBg: hov.bg, cursor: hov.cursor, childOpacity: rest.childOpacity, opacity: rest.opacity };
    r.press[k] = { pressBg: pr.bg, transform: pr.transform };
  }
  await blur(page);
  // keyboard focus ring
  for (const k of [...SEVEN, 'fit']) {
    await page.keyboard.press('Shift'); await focusKey(page, k);
    if (!(await page.evaluate((key) => window.__T()[key].matches(':focus-visible'), k))) { await page.keyboard.press('Shift+Tab'); await sleep(60); await page.keyboard.press('Tab'); await sleep(100); }
    const rg = await ring(page, k);
    const px = await pix(k);
    r.ring[k] = { ...rg, ringPx: px.ringPx, outsidePx: px.outside };
  }
  await page.screenshot({ path: path.join(outDir, `${LABEL}-look-${vp.width}x${vp.height}.png`) });
  await ctx.close(); return r;
}
async function rowHoverEnabled(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  await addPulse(page); await timeSelect(page);
  await page.keyboard.press('Control+l'); await sleep(500);
  const r = { loopPressed: await page.evaluate(() => window.__T().loop?.getAttribute('aria-pressed')), follow: await page.evaluate(() => ({ text: window.__T().follow.textContent, cls: window.__T().follow.className.includes('bg-foreground/20') })) };
  await blur(page);
  for (const k of ['fit', 'follow', 'play', 'loop', 'stop']) {
    const rest = await ring(page, k);
    const bb = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, k);
    await page.mouse.move(bb.x, bb.y); await sleep(450); const hov = await ring(page, k);
    if (k === 'play' || k === 'stop') { r[k] = { rest: rest.bg, hover: hov.bg, cursor: hov.cursor }; await page.mouse.move(2, vp.height - 2); await sleep(400); continue; }
    await page.mouse.down(); await sleep(450); const pr = await ring(page, k);
    await page.mouse.move(2, vp.height - 2); await page.mouse.up(); await sleep(400);
    r[k] = { rest: rest.bg, hover: hov.bg, press: pr.bg, pressTransform: pr.transform, cursor: hov.cursor };
  }
  await ctx.close(); return r;
}
async function rowBudget(browser, vp) {
  const r = {};
  const count = (page) => page.evaluate(() => {
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const ws = document.querySelector('[data-testid="arrangement-transport"]')?.closest('main') || document.body;
    const lines = new Set(); const texts = [];
    const tw = document.createTreeWalker(ws, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const n = tw.currentNode; if (!n.textContent.trim()) continue; if (sc && sc.contains(n)) continue;
      const el = n.parentElement; if (!el || el.closest('[hidden],[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const rc of rg.getClientRects()) { if (rc.width < 1 || rc.height < 1 || rc.bottom < 0 || rc.top > innerHeight) continue; lines.add(`${Math.round(rc.top / 4)}:${Math.round(rc.left / 400)}`); }
      texts.push(n.textContent.trim().slice(0, 30));
    }
    return { lines: lines.size, textNodes: texts.length, texts };
  });
  const { ctx, page } = await open(browser, vp);
  r.empty = await count(page);
  await page.screenshot({ path: path.join(outDir, `${LABEL}-budget-empty-${vp.width}x${vp.height}.png`) });
  await addPulse(page);
  r.clip = await count(page);
  await page.screenshot({ path: path.join(outDir, `${LABEL}-budget-clip-${vp.width}x${vp.height}.png`) });
  await ctx.close(); return r;
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const rows = [['tab', rowTab], ['ax', rowAx], ['noop', rowNoop], ['mousefocus', rowMouseFocus], ['titles', rowTitles], ['handoff', rowHandoffs], ['space', rowSpace], ['shortcuts', rowShortcuts], ['sheet', rowSheet], ['look', rowLook], ['hoverenabled', rowHoverEnabled], ['budget', rowBudget]];
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }];
  if (!ONLY || ONLY.test('tab@375x812')) vps.push({ width: 375, height: 812 });
  for (const vp of vps) {
    const vk = `${vp.width}x${vp.height}`;
    for (const [name, fn] of rows) {
      if (vp.width === 375 && name !== 'tab') continue;
      if (ONLY && !ONLY.test(`${name}@${vk}`)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${vk}`] = await fn(browser, vp); } catch (e) { R.rows[`${name}@${vk}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${vk}`].ms = Date.now() - t0; save();
      console.log(LABEL, `${name}@${vk}`, R.rows[`${name}@${vk}`].error ? 'ERROR ' + R.rows[`${name}@${vk}`].error.slice(0, 200) : 'done', Date.now() - t0);
    }
  }
  await browser.close();
})();
