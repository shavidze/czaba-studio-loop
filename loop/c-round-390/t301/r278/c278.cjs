// C round 278: SYS-5 stage 2 browser rows. usage: node c278.cjs <base> <label> [onlyRegex]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const LABEL = process.argv[3] || 'new';
const ONLY = process.argv[4] ? new RegExp(process.argv[4]) : null;
const outDir = __dirname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base: BASE, label: LABEL, startedAt: new Date().toISOString(), rows: {} };
const outFile = path.join(outDir, `c278-${LABEL}${process.argv[4] ? '-' + process.argv[4].replace(/[^a-z0-9]/gi, '_') : ''}.json`);
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));

const INIT = () => {
  window.__T = () => {
    const tr = document.querySelector('[data-testid="arrangement-transport"]');
    const lib = document.querySelector('[data-testid="arrangement-library-preview"]');
    const byText = (root, re) => root ? [...root.querySelectorAll('button')].find((b) => re.test((b.textContent || '').trim())) : null;
    const byLabel = (re) => tr ? [...tr.querySelectorAll('button')].find((b) => re.test(b.getAttribute('aria-label') || '')) : null;
    const edit = tr ? [...tr.querySelectorAll('[data-testid="arrangement-transport-edit"] button')] : [];
    return {
      undo: byText(tr, /^Undo/), redo: byText(tr, /^Redo/), split: byText(tr, /^Split/),
      delete: edit.find((b) => /^Delete/.test(b.getAttribute('aria-label') || b.textContent.trim())) || byLabel(/^Delete/),
      loop: tr ? [...tr.querySelectorAll('button[aria-pressed]')].find((b) => /Loop/i.test(b.textContent + (b.getAttribute('title') || ''))) : null,
      fit: tr?.querySelector('[data-testid="arrangement-fit"]'),
      metro: document.querySelector('[data-testid="arrangement-metronome-toggle"]'),
      tempo: document.querySelector('[data-testid="arrangement-tempo-input"]'),
      add: byText(lib, /^Add$/),
      preview: document.querySelector('[data-testid="arrangement-library-preview-toggle"]'),
      videoHeader: document.querySelector('[data-track-id="video"] [data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]'),
    };
  };
  window.__name = (el) => {
    if (!el) return null; if (el === document.body) return 'BODY';
    const T = window.__T();
    for (const [k, v] of Object.entries(T)) if (v === el) return k;
    return (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 50) + '|' + el.tagName + (el.dataset.testid ? '#' + el.dataset.testid : '');
  };
  window.__snap = () => {
    const q = (s) => document.querySelector(s);
    const T = window.__T();
    return {
      status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
      undoTitle: T.undo?.getAttribute('title') ?? null,
      clips: document.querySelectorAll('[data-clip-kind="audio"]').length,
      metroPressed: T.metro?.getAttribute('aria-pressed') ?? null,
      previewing: T.preview?.textContent.trim() ?? null,
      active: window.__name(document.activeElement),
    };
  };
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
const center = (page, k) => page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, k);
const mclick = async (page, k) => { const c = await center(page, k); await page.mouse.click(c.x, c.y); };
async function selectPulse(page) { await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(800); }
async function addPulse(page) { await selectPulse(page); await mclick(page, 'add'); await sleep(1000); await blur(page); }
async function videoActive(page) { await mclick(page, 'videoHeader'); await sleep(600); }
async function audioActive(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]')].find((x) => !x.closest('[data-track-id="video"]')); b.setAttribute('data-c278-audio', '1'); });
  const b = await page.locator('[data-c278-audio]').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(600);
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
async function timeSelect(page) { const p = await clipPoint(page); await page.mouse.move(p.x - 10, p.y); await page.mouse.down(); await page.mouse.move(p.x + 60, p.y, { steps: 8 }); await page.mouse.up(); await sleep(400); }
async function selectClip(page) { const p = await clipPoint(page); await page.mouse.click(p.x, p.ty); await sleep(400); }
const snap = (page) => page.evaluate(() => window.__snap());
const attrs = (page, k) => page.evaluate((key) => { const b = window.__T()[key]; if (!b) return null; const cs = getComputedStyle(b); return { ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.disabled, title: b.getAttribute('title'), ariaLabel: b.getAttribute('aria-label'), cursor: cs.cursor, bg: cs.backgroundColor, transform: cs.transform, box: (() => { const q = b.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map((v) => Math.round(v * 10) / 10); })() }; }, k);
const ring = (page, k) => page.evaluate((key) => {
  const b = key === '__active' ? document.activeElement : window.__T()[key]; const cs = getComputedStyle(b);
  let op = 1; for (let e = b; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity);
  const child = b.firstElementChild ? getComputedStyle(b.firstElementChild).opacity : null;
  return { name: window.__name(b), focusVisible: b.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, opacity: cs.opacity, effOpacity: +op.toFixed(3), childTag: b.firstElementChild?.tagName ?? null, childOpacity: child, bg: cs.backgroundColor };
}, k);
async function avg(page, k) {
  const box = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, k);
  const buf = await page.screenshot({ clip: box });
  return page.evaluate(async (data) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let max = [0, 0, 0], maxL = -1, sum = [0, 0, 0], n = 0;
    for (let i = 0; i < d.length; i += 4) { const L = d[i] + d[i + 1] + d[i + 2]; sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; n++; if (L > maxL) { maxL = L; max = [d[i], d[i + 1], d[i + 2]]; } }
    const corner = [d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1], d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1 + 1], d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1 + 2]];
    return { w: img.width, h: img.height, mean: sum.map((v) => Math.round(v / n)), brightest: max, leftEdgeMid: corner };
  }, buf.toString('base64'));
}
// pixel at the ring (outside the box by offset+width/2) vs further outside
async function ringPixels(page, k) {
  const box = await page.evaluate((key) => { const b = window.__T()[key].getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, k);
  const pad = 8;
  const buf = await page.screenshot({ clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad } });
  return page.evaluate(async ([b64, bx, pad]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const midY = Math.round(pad + bx.height / 2);
    // scan left of the box from x=0..pad, take the brightest pixel as ring, x=0 as background
    let best = [0, 0, 0], bl = -1, bx0 = -1;
    for (let x = 0; x < pad; x += 1) { const p = at(x, midY); const l = p[0] + p[1] + p[2]; if (l > bl) { bl = l; best = p; bx0 = x; } }
    // top edge scan too
    const midX = Math.round(pad + bx.width / 2); let bestT = [0, 0, 0], blT = -1;
    for (let y = 0; y < pad; y += 1) { const p = at(midX, y); const l = p[0] + p[1] + p[2]; if (l > blT) { blT = l; bestT = p; } }
    return { ringLeft: best, ringLeftX: bx0, bgLeft: at(0, midY), ringTop: bestT, bgTop: at(midX, 0) };
  }, [buf.toString('base64'), box, pad]);
}
async function ax(page, ctx, keys) {
  await page.evaluate((ks) => { const T = window.__T(); for (const k of ks) T[k]?.setAttribute('data-c278', k); }, keys);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const r = {};
  for (const k of keys) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-c278="${k}"]` });
    if (!nodeId) { r[k] = null; continue; }
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const n = nodes[0]; const prop = (name) => n.properties?.find((p) => p.name === name)?.value?.value;
    r[k] = { role: n.role?.value, name: n.name?.value, description: n.description?.value ?? null, disabled: prop('disabled') ?? false, focusable: prop('focusable') ?? false, pressed: prop('pressed') ?? null };
  }
  await cdp.detach();
  return r;
}

// ---------- rows ----------
async function rowTab(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await blur(page);
  r.forwardStops = [];
  for (let i = 0; i < 140; i += 1) {
    await page.keyboard.press('Tab'); await sleep(60);
    const n = await page.evaluate(() => window.__name(document.activeElement));
    if (['metro', 'add', 'preview'].includes(n)) { const rg = await ring(page, '__active'); const a = await attrs(page, n); r.forwardStops.push({ i, n, ariaDisabled: a.ariaDisabled, ...rg }); if (n === 'metro') await page.screenshot({ path: path.join(outDir, `${LABEL}-tab-metro-${vp.width}x${vp.height}.png`) }); }
  }
  // video track active, Tab to Add
  await videoActive(page);
  r.afterVideoActive = await page.evaluate(() => window.__name(document.activeElement));
  await page.evaluate(() => window.__T().videoHeader.focus()); await page.keyboard.press('Shift');
  // Forward from the video header to the Add button may wrap; use backward from End also
  r.videoAddForward = null;
  for (let i = 0; i < 160; i += 1) {
    await page.keyboard.press('Tab'); await sleep(50);
    const n = await page.evaluate(() => window.__name(document.activeElement));
    if (n === 'add') { const a = await attrs(page, 'add'); r.videoAddForward = { i, ariaDisabled: a.ariaDisabled, title: a.title, ...(await ring(page, 'add')) }; await page.screenshot({ path: path.join(outDir, `${LABEL}-tab-add-video-${vp.width}x${vp.height}.png`) }); break; }
  }
  // backward from End
  await blur(page); await page.keyboard.press('End'); await sleep(800); await blur(page);
  r.backwardStops = [];
  for (let i = 0; i < 200; i += 1) {
    await page.keyboard.press('Shift+Tab'); await sleep(50);
    const n = await page.evaluate(() => window.__name(document.activeElement));
    if (['metro', 'add', 'preview'].includes(n) && !r.backwardStops.find((s) => s.n === n)) { const a = await attrs(page, n); r.backwardStops.push({ i, n, ariaDisabled: a.ariaDisabled }); }
  }
  r.pass = !!r.forwardStops.find((s) => s.n === 'metro' && s.ariaDisabled === 'true' && s.focusVisible && s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1)
    && !!r.videoAddForward && r.videoAddForward.ariaDisabled === 'true' && r.videoAddForward.focusVisible
    && !!r.backwardStops.find((s) => s.n === 'metro') && !!r.backwardStops.find((s) => s.n === 'add' && s.ariaDisabled === 'true');
  await ctx.close(); return r;
}
async function rowAx(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  r.initial = await ax(page, ctx, ['metro', 'add', 'preview', 'delete']);
  r.initialAttrs = { add: await attrs(page, 'add'), preview: await attrs(page, 'preview'), sourceSelected: await page.evaluate(() => document.querySelector('[data-testid="arrangement-library-preview"] p')?.textContent) };
  await selectPulse(page);
  await videoActive(page);
  r.video = await ax(page, ctx, ['metro', 'add', 'preview']);
  r.pass = r.initial.metro?.role === 'button' && r.initial.metro.disabled === true && r.initial.metro.name === 'Metronome' && r.initial.metro.description === 'Metronome — set a BPM first' && r.initial.metro.focusable === true
    && r.video.add?.role === 'button' && r.video.add.disabled === true && r.video.add.name === 'Add' && r.video.add.description === 'Add — make an audio track active first' && r.video.add.focusable === true;
  await ctx.close(); return r;
}
async function rowNoop(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  // metronome Enter
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await blur(page);
  for (let i = 0; i < 140; i += 1) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => window.__name(document.activeElement)) === 'metro') break; }
  r.metroFocused = await page.evaluate(() => window.__name(document.activeElement));
  const s0 = await snap(page);
  await page.keyboard.press('Enter'); await sleep(600);
  const s1 = await snap(page);
  r.metro = { before: s0, after: s1, same: s0.status === s1.status && s1.metroPressed === 'false' };
  // Add on video track: Tab + Enter, then mouse click
  await selectPulse(page);
  await videoActive(page);
  await page.evaluate(() => window.__T().videoHeader.focus());
  for (let i = 0; i < 160; i += 1) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => window.__name(document.activeElement)) === 'add') break; }
  r.addFocused = await page.evaluate(() => window.__name(document.activeElement));
  const a0 = await snap(page);
  await page.keyboard.press('Enter'); await sleep(700);
  const a1 = await snap(page);
  // mouse click: put focus on the video header button first (as in B's run)
  await page.evaluate(() => window.__T().videoHeader.focus()); await sleep(100);
  const beforeClickActive = await page.evaluate(() => window.__name(document.activeElement));
  await mclick(page, 'add'); await sleep(700);
  const a2 = await snap(page);
  r.add = { before: a0, enter: a1, beforeClickActive, click: a2,
    enterSame: a1.status === a0.status && a1.clips === a0.clips && a1.undoTitle === a0.undoTitle,
    clickSame: a2.status === a0.status && a2.clips === a0.clips && a2.undoTitle === a0.undoTitle,
    clickFocusKept: a2.active === beforeClickActive && a2.active !== 'add' && a2.active !== 'BODY' };
  // Preview soft-disabled? record whether reachable in demo: not ready state
  r.pass = r.metroFocused === 'metro' && r.metro.same && r.addFocused === 'add' && r.add.enterSame && r.add.clickSame && r.add.clickFocusKept;
  await ctx.close(); return r;
}
async function rowVariantX(browser, vp) {
  const r = {};
  for (const [label, text] of [['valid', '120'], ['invalid', 'abc']]) {
    const { ctx, page } = await open(browser, vp);
    const t = {};
    await mclick(page, 'tempo'); await sleep(150);
    await page.keyboard.type(text); await sleep(200);
    t.before = await snap(page); t.metroBefore = await attrs(page, 'metro');
    await mclick(page, 'metro'); await sleep(800);
    t.after = await snap(page); t.metroAfter = await attrs(page, 'metro');
    t.tempo = await page.evaluate(() => window.__T().tempo.value);
    t.active = await page.evaluate(() => window.__name(document.activeElement));
    await page.screenshot({ path: path.join(outDir, `${LABEL}-variantx-${label}-${vp.width}x${vp.height}.png`) });
    r[label] = t; await ctx.close();
  }
  r.pass = r.valid.tempo === '120' && r.valid.after.metroPressed === 'true' && r.valid.metroAfter.ariaDisabled === null
    && r.valid.after.status === 'Metronome is on — 120 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.'
    && r.invalid.after.status === 'Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.' && r.invalid.after.metroPressed === 'false' && r.invalid.active === 'metro';
  return r;
}
async function rowTitlesEnableCursor(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  // cursor on soft-disabled transport + metronome (empty, no BPM)
  r.cursorEmpty = {};
  for (const k of ['split', 'delete', 'loop', 'metro', 'fit']) { const c = await center(page, k); await page.mouse.move(c.x, c.y); await sleep(300); const a = await attrs(page, k); r.cursorEmpty[k] = { cursor: a.cursor, ariaDisabled: a.ariaDisabled, hover: await page.evaluate((key) => window.__T()[key].matches(':hover'), k) }; }
  r.addInitial = await attrs(page, 'add'); r.previewInitial = await attrs(page, 'preview');
  // select a sound, audio track active (default)
  await selectPulse(page);
  { const c = await center(page, 'add'); await page.mouse.move(c.x, c.y); await sleep(1500); }
  r.addAudio = await attrs(page, 'add'); r.addAudioHover = await page.evaluate(() => window.__T().add.matches(':hover'));
  r.previewReady = await attrs(page, 'preview');
  await videoActive(page);
  { const c = await center(page, 'add'); await page.mouse.move(c.x, c.y); await sleep(1500); }
  r.addVideo = await attrs(page, 'add'); r.addVideoHover = await page.evaluate(() => window.__T().add.matches(':hover'));
  await page.screenshot({ path: path.join(outDir, `${LABEL}-add-video-hover-${vp.width}x${vp.height}.png`) });
  // B-ADD-ENABLE: focus Add via Tab, click audio header with the mouse, Shift+Tab back to Add, Enter
  await page.evaluate(() => window.__T().videoHeader.focus());
  for (let i = 0; i < 160; i += 1) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => window.__name(document.activeElement)) === 'add') break; }
  const e = { focusedAdd: await page.evaluate(() => window.__name(document.activeElement)) };
  await audioActive(page);
  e.afterHeaderClick = await page.evaluate(() => window.__name(document.activeElement));
  e.addAttrsAfter = await attrs(page, 'add');
  let steps = 0;
  for (; steps < 200; steps += 1) { if (await page.evaluate(() => window.__name(document.activeElement)) === 'add') break; await page.keyboard.press('Shift+Tab'); await sleep(40); }
  e.shiftTabSteps = steps; e.onAdd = await page.evaluate(() => window.__name(document.activeElement));
  const s0 = await snap(page);
  await page.keyboard.press('Enter'); await sleep(1000);
  const s1 = await snap(page);
  e.clipsBefore = s0.clips; e.clipsAfter = s1.clips; e.statusAfter = s1.status;
  e.pass = e.focusedAdd === 'add' && e.addAttrsAfter.ariaDisabled === null && e.addAttrsAfter.title === 'Add to the active track at the insert marker' && e.onAdd === 'add' && s1.clips === s0.clips + 1;
  r.enable = e;
  // cursor on Add on audio track (control)
  { const c = await center(page, 'add'); await page.mouse.move(c.x, c.y); await sleep(300); r.addAudioCursor = (await attrs(page, 'add')).cursor; }
  await videoActive(page);
  { const c = await center(page, 'add'); await page.mouse.move(c.x, c.y); await sleep(300); r.addVideoCursor = (await attrs(page, 'add')).cursor; }
  r.cursorPass = ['split', 'delete', 'loop', 'metro'].every((k) => r.cursorEmpty[k].cursor === 'not-allowed' && r.cursorEmpty[k].ariaDisabled === 'true') && r.cursorEmpty.fit.cursor === 'pointer' && r.addVideoCursor === 'not-allowed' && r.addAudioCursor === 'pointer';
  r.titlesPass = r.addAudio.title === 'Add to the active track at the insert marker' && r.addAudioHover && r.addVideo.title === 'Add — make an audio track active first' && r.addVideoHover;
  await ctx.close(); return r;
}
async function rowDeleteName(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  r.empty = (await ax(page, ctx, ['delete'])).delete; r.emptyTitle = (await attrs(page, 'delete')).title;
  await addPulse(page); await selectClip(page);
  r.clip = (await ax(page, ctx, ['delete'])).delete; r.clipTitle = (await attrs(page, 'delete')).title;
  await timeSelect(page);
  r.range = (await ax(page, ctx, ['delete'])).delete; r.rangeTitle = (await attrs(page, 'delete')).title;
  r.pass = r.empty.name === 'Delete' && r.empty.description === r.emptyTitle && r.clip.name === 'Delete — the selected clip; leaves a gap' && r.clip.description === r.clipTitle && r.range.name !== r.clip.name && r.range.name !== 'Delete' && /Delete/.test(r.range.name) && (r.range.description === r.rangeTitle || r.range.description === null);
  await ctx.close(); return r;
}
async function rowPerfPredicate(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  await ctx.addInitScript(INIT);
  await ctx.addInitScript(() => {
    window.__pp = [];
    const tick = () => {
      const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add');
      const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
      const neu = add instanceof HTMLButtonElement && add.getAttribute('aria-disabled') !== 'true' && wave !== null;
      const old = add instanceof HTMLButtonElement && !add.disabled && wave !== null;
      const ready = /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || '');
      const last = window.__pp[window.__pp.length - 1];
      if (!last || last.neu !== neu || last.old !== old || last.ready !== ready) window.__pp.push({ t: Math.round(performance.now()), neu, old, ready, addAria: add?.getAttribute('aria-disabled') ?? null, wave: wave !== null });
      if (!ready || window.__pp.length < 50) setTimeout(tick, 100);
    };
    setTimeout(tick, 100);
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await sleep(2500);
  const pred = () => page.evaluate(() => { const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add'); const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); return { neu: add instanceof HTMLButtonElement && add.getAttribute('aria-disabled') !== 'true' && wave !== null, old: add instanceof HTMLButtonElement && !add.disabled && wave !== null, wave: wave !== null }; });
  const r = { timeline: await page.evaluate(() => window.__pp), atReady: await pred() };
  await videoActive(page); r.video = await pred();
  await audioActive(page); await sleep(500); r.audio = await pred();
  r.pass = r.timeline.filter((e) => !e.ready).every((e) => e.neu === false) && r.video.neu === false && r.audio.neu === true;
  await ctx.close(); return r;
}
async function rowHandoff(browser, vp) {
  const r = {};
  { const { ctx, page } = await open(browser, vp);
    await addPulse(page); await selectClip(page);
    await page.keyboard.press('Shift'); await page.evaluate(() => window.__T().split.focus()); await page.keyboard.press('Tab'); await sleep(150);
    const d = { onDelete: await page.evaluate(() => window.__name(document.activeElement)), before: await snap(page) };
    await page.keyboard.press('Enter'); await sleep(600);
    d.after = await snap(page); d.ring = await ring(page, '__active');
    await page.keyboard.press('Enter'); await sleep(600); d.after2 = await snap(page);
    d.pass = d.onDelete === 'delete' && d.after.clips === d.before.clips - 1 && d.after.active === 'undo' && d.after2.clips === d.before.clips && d.ring.outlineStyle !== 'none';
    r.delete = d; await ctx.close(); }
  { const { ctx, page } = await open(browser, vp);
    await addPulse(page);
    await page.keyboard.press('Shift'); await page.evaluate(() => window.__T().undo.focus()); await sleep(100);
    const u = { before: await snap(page) };
    await page.keyboard.press('Enter'); await sleep(600); u.after = await snap(page); u.ring = await ring(page, '__active');
    u.pass = u.after.clips === u.before.clips - 1 && u.after.active === 'redo';
    r.undo = u; await ctx.close(); }
  r.pass = r.delete.pass && r.undo.pass;
  return r;
}
async function rowLook(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  r.metroLook = await avg(page, 'metro'); r.metroAttrs = await attrs(page, 'metro');
  // soft-disabled preview at load (if no sound / not ready)
  r.previewAttrsInitial = await attrs(page, 'preview');
  const hov = async (k) => { const rest = await attrs(page, k); const c = await center(page, k); await page.mouse.move(c.x, c.y); await sleep(450); const h = await attrs(page, k); await page.mouse.down(); await sleep(450); const p = await attrs(page, k); await page.mouse.up(); await sleep(200); await page.mouse.move(2, vp.height - 2); await sleep(400); return { restBg: rest.bg, hoverBg: h.bg, pressBg: p.bg, pressTransform: p.transform, ariaDisabled: rest.ariaDisabled }; };
  r.hoverSoft = { metro: await hov('metro') };
  if (r.previewAttrsInitial?.ariaDisabled === 'true') r.hoverSoft.preview = await hov('preview');
  if (r.previewAttrsInitial?.ariaDisabled === 'true') r.hoverSoft.addInitial = await hov('add');
  await blur(page);
  // keyboard ring on the metronome
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await blur(page);
  for (let i = 0; i < 140; i += 1) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => window.__name(document.activeElement)) === 'metro') break; }
  r.ringMetro = { ...(await ring(page, 'metro')), px: await ringPixels(page, 'metro') };
  await blur(page);
  await selectPulse(page);
  await videoActive(page); await blur(page); await page.mouse.move(2, vp.height - 2); await sleep(400);
  r.addLook = await avg(page, 'add'); r.addAttrs = await attrs(page, 'add');
  r.hoverSoft.addVideo = await hov('add');
  await page.evaluate(() => window.__T().videoHeader.focus());
  for (let i = 0; i < 160; i += 1) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => window.__name(document.activeElement)) === 'add') break; }
  r.ringAdd = { ...(await ring(page, 'add')), px: await ringPixels(page, 'add') };
  await page.screenshot({ path: path.join(outDir, `${LABEL}-ring-add-${vp.width}x${vp.height}.png`) });
  await ctx.close(); return r;
}
async function rowHoverEnabled(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  const hov = async (k) => { const rest = await attrs(page, k); const c = await center(page, k); await page.mouse.move(c.x, c.y); await sleep(450); const h = await attrs(page, k); await page.mouse.down(); await sleep(450); const p = await attrs(page, k); await page.mouse.move(2, vp.height - 2); await page.mouse.up(); await sleep(400); return { restBg: rest.bg, hoverBg: h.bg, pressBg: p.bg, pressTransform: p.transform, cursor: h.cursor, ariaDisabled: rest.ariaDisabled }; };
  // set BPM 120 via Enter
  await mclick(page, 'tempo'); await page.keyboard.type('120'); await page.keyboard.press('Enter'); await sleep(500); await blur(page);
  r.metroOff = await hov('metro');
  await page.evaluate(() => window.__T().metro.click()); await sleep(400); await blur(page);
  r.metroOnPressed = await page.evaluate(() => window.__T().metro.getAttribute('aria-pressed'));
  r.metroOn = await hov('metro');
  await page.evaluate(() => { if (window.__T().metro.getAttribute('aria-pressed') === 'true') window.__T().metro.click(); }); await sleep(300);
  await selectPulse(page); await blur(page);
  r.preview = await hov('preview');
  // stop preview if started by press release? press moved off before up, so no click
  r.add = await hov('add');
  await ctx.close(); return r;
}
async function rowKeep(browser, vp) {
  const { ctx, page } = await open(browser, vp);
  const r = {};
  await mclick(page, 'tempo'); await sleep(150); await page.keyboard.type('9'); await sleep(200);
  r.before = { active: await page.evaluate(() => window.__name(document.activeElement)), value: await page.evaluate(() => window.__T().tempo.value), split: (await attrs(page, 'split')).ariaDisabled };
  await mclick(page, 'split'); await sleep(600);
  r.after = { active: await page.evaluate(() => window.__name(document.activeElement)), value: await page.evaluate(() => window.__T().tempo.value), status: (await snap(page)).status };
  r.pass = r.before.split === 'true' && r.after.active === 'tempo' && r.after.value === '9';
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
  const rows = [['variantx', rowVariantX], ['cursor', rowTitlesEnableCursor], ['tab', rowTab], ['ax', rowAx], ['noop', rowNoop], ['deletename', rowDeleteName], ['perf', rowPerfPredicate], ['handoff', rowHandoff], ['look', rowLook], ['hoverenabled', rowHoverEnabled], ['keep', rowKeep], ['budget', rowBudget]];
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const vk = `${vp.width}x${vp.height}`;
    for (const [name, fn] of rows) {
      if (ONLY && !ONLY.test(`${name}@${vk}`)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${vk}`] = await fn(browser, vp); } catch (e) { R.rows[`${name}@${vk}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${vk}`].ms = Date.now() - t0; save();
      const row = R.rows[`${name}@${vk}`];
      console.log(LABEL, `${name}@${vk}`, row.error ? 'ERROR ' + row.error.slice(0, 300) : `pass=${row.pass ?? row.cursorPass}`, Date.now() - t0);
    }
  }
  await browser.close();
})();
