// C round 226: real Chromium checks of the shortcut sheet.
// usage: node sheet.cjs <width> <height>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173/studio-lab';
const W = Number(process.argv[2]);
const H = Number(process.argv[3]);
const KEY = `${W}x${H}`;
const OUT = path.join(__dirname, 'sheet');
fs.mkdirSync(OUT, { recursive: true });
const R = { viewport: KEY, started: new Date().toISOString(), rows: {}, pageErrors: [] };
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${KEY}-${name}.png`) });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fresh(browser) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled;
  }, undefined, { timeout: 90000 });
  await sleep(800);
  return { ctx, page };
}

const sheetOpen = (page) => page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].some((d) => {
  const id = d.getAttribute('aria-labelledby');
  return id && document.getElementById(id)?.textContent === 'Keyboard shortcuts';
}));
const active = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a) return null;
  return a === document.body ? 'BODY' : (a.getAttribute('data-testid') || a.getAttribute('aria-label') || `${a.tagName}:${a.textContent.trim().slice(0, 30)}`);
});
const btnExpanded = (page) => page.evaluate(() => [...document.querySelectorAll('footer button')].find((b) => b.textContent.includes('Shortcuts'))?.getAttribute('aria-expanded'));
async function addClip(page) {
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 20000 });
  await sleep(400);
}
async function closeSheetEsc(page) {
  await page.keyboard.press('Escape');
  await sleep(250);
}

async function cOpen(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  // 1 body
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const before = await active(page);
  await page.keyboard.press('Shift+Slash');
  await sleep(300);
  out.body = { before, open: await sheetOpen(page), focus: await active(page), expanded: await btnExpanded(page) };
  await shot(page, 'sheet-open');
  await closeSheetEsc(page);
  out.body.closedByEsc = !(await sheetOpen(page));
  out.body.focusAfter = await active(page);
  out.body.expandedAfter = await btnExpanded(page);
  // 2..4 focused elements
  const targets = {
    scroller: '[data-testid="arrangement-timeline-scroller"]',
    overview: '[data-testid="arrangement-overview"]',
    playButton: 'button[aria-label="Play"]',
    backToStart: 'button[aria-label="Back to start"]',
  };
  for (const [name, sel] of Object.entries(targets)) {
    const r = {};
    r.exists = await page.locator(sel).count();
    await page.locator(sel).first().focus();
    r.focusedBefore = await active(page);
    await page.keyboard.press('Shift+Slash');
    await sleep(300);
    r.open = await sheetOpen(page);
    r.focusInSheet = await active(page);
    await closeSheetEsc(page);
    r.closed = !(await sheetOpen(page));
    r.focusAfter = await active(page);
    out[name] = r;
  }
  // 5 footer button click (mouse)
  const btn = page.locator('footer button', { hasText: 'Shortcuts' });
  await btn.click();
  await sleep(300);
  out.footerClick = { open: await sheetOpen(page), focus: await active(page) };
  await closeSheetEsc(page);
  out.footerClick.closed = !(await sheetOpen(page));
  out.footerClick.focusAfter = await active(page);
  // 6 backdrop click from body opener
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Shift+Slash');
  await sleep(300);
  const dlgBox = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"] > *');
    const r = d.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.mouse.click(6, H - 6);
  await sleep(300);
  out.backdrop = { dialogContentBox: dlgBox, closed: !(await sheetOpen(page)), focusAfter: await active(page) };
  // 6b backdrop from focused play button
  await page.locator('button[aria-label="Play"]').focus();
  await page.keyboard.press('Shift+Slash');
  await sleep(300);
  await page.mouse.click(6, H - 6);
  await sleep(300);
  out.backdropFromPlay = { closed: !(await sheetOpen(page)), focusAfter: await active(page) };
  // 7 click inside content does not close
  await btn.click();
  await sleep(300);
  await page.locator('[role="dialog"] h2').click();
  await sleep(200);
  out.clickTitle = { stillOpen: await sheetOpen(page), focus: await active(page) };
  // 8 Close button by mouse
  await page.getByRole('button', { name: 'Close (Esc)' }).click();
  await sleep(300);
  out.closeButtonMouse = { closed: !(await sheetOpen(page)), focusAfter: await active(page) };
  // 9 Space on focused Close button
  await btn.click();
  await sleep(300);
  await page.keyboard.press('Shift+Tab');
  out.spaceOnClose = { focusBeforeSpace: await active(page) };
  await page.keyboard.press('Space');
  await sleep(300);
  out.spaceOnClose.closed = !(await sheetOpen(page));
  out.spaceOnClose.focusAfter = await active(page);
  out.spaceOnClose.playing = await page.locator('button[aria-label="Pause"]').count();
  // 10 ? on focused Close button closes; ? in search keeps open and types
  await btn.click();
  await sleep(300);
  await page.keyboard.press('Shift+Slash');
  await sleep(200);
  out.qInSearch = { open: await sheetOpen(page), value: await page.getByRole('dialog').getByRole('searchbox').inputValue() };
  await page.getByRole('dialog').getByRole('searchbox').fill('');
  await page.getByRole('button', { name: 'Close (Esc)' }).focus();
  await page.keyboard.press('Shift+Slash');
  await sleep(300);
  out.qOnClose = { closed: !(await sheetOpen(page)), focusAfter: await active(page) };
  // 11 Space in the search field types a space
  await btn.click();
  await sleep(300);
  await page.keyboard.type('a b');
  out.spaceInSearch = { value: await page.getByRole('dialog').getByRole('searchbox').inputValue(), open: await sheetOpen(page) };
  await closeSheetEsc(page);
  out.spaceInSearch.queryResetOnReopen = null;
  await btn.click();
  await sleep(300);
  out.spaceInSearch.queryResetOnReopen = await page.getByRole('dialog').getByRole('searchbox').inputValue();
  await closeSheetEsc(page);
  await ctx.close();
  return out;
}

async function cdpKey(cdp, ev) {
  const base = { modifiers: ev.modifiers || 0, key: ev.key, code: ev.code, windowsVirtualKeyCode: ev.vk || 0 };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: ev.text, unmodifiedText: ev.text, autoRepeat: !!ev.autoRepeat });
  if (!ev.noUp) await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
}

async function cLayoutAndHeld(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  const cdp = await ctx.newCDPSession(page);
  const cases = {
    questionOnMinus: { key: '?', code: 'Minus', modifiers: 8, vk: 189, text: '?' },
    underscoreOnSlash: { key: '_', code: 'Slash', modifiers: 8, vk: 191, text: '_' },
    plainSlash: { key: '/', code: 'Slash', modifiers: 0, vk: 191, text: '/' },
  };
  for (const [name, ev] of Object.entries(cases)) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await cdpKey(cdp, ev);
    await sleep(300);
    out[name] = { open: await sheetOpen(page) };
    if (out[name].open) await closeSheetEsc(page);
    out[name].closedAfter = !(await sheetOpen(page));
  }
  // held ? : one keyDown, then autoRepeat keyDowns for 1.2 s, one keyUp
  await page.evaluate(() => {
    document.activeElement && document.activeElement.blur();
    window.__sheetToggles = [];
    const obs = new MutationObserver(() => {
      const open = !!document.querySelector('[role="dialog"]');
      const last = window.__sheetToggles[window.__sheetToggles.length - 1];
      if (last !== open) window.__sheetToggles.push(open);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
  const q = { key: '?', code: 'Slash', modifiers: 8, vk: 191, text: '?', noUp: true };
  await cdpKey(cdp, q);
  const t0 = Date.now();
  let repeats = 0;
  while (Date.now() - t0 < 1200) {
    await sleep(33);
    await cdpKey(cdp, { ...q, autoRepeat: true });
    repeats += 1;
  }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 8, key: '?', code: 'Slash', windowsVirtualKeyCode: 191 });
  await sleep(300);
  out.held = {
    repeats,
    open: await sheetOpen(page),
    toggles: await page.evaluate(() => window.__sheetToggles),
    searchValue: await page.getByRole('dialog').getByRole('searchbox').inputValue().catch(() => 'n/a'),
  };
  await closeSheetEsc(page);
  // held ? to close (sheet open with focus on Close button: first press closes, repeats must not reopen)
  await page.locator('footer button', { hasText: 'Shortcuts' }).click();
  await sleep(300);
  await page.getByRole('button', { name: 'Close (Esc)' }).focus();
  await page.evaluate(() => { window.__sheetToggles = [true]; });
  await cdpKey(cdp, q);
  const t1 = Date.now();
  while (Date.now() - t1 < 1200) {
    await sleep(33);
    await cdpKey(cdp, { ...q, autoRepeat: true });
  }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 8, key: '?', code: 'Slash', windowsVirtualKeyCode: 191 });
  await sleep(300);
  out.heldClose = { open: await sheetOpen(page), toggles: await page.evaluate(() => window.__sheetToggles) };
  if (out.heldClose.open) await closeSheetEsc(page);
  await ctx.close();
  return out;
}

async function cNoOpen(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  // library search
  const search = page.getByTestId('arrangement-library-search');
  await search.click();
  await page.keyboard.press('Shift+Slash');
  await sleep(250);
  out.librarySearch = { open: await sheetOpen(page), value: await search.inputValue(), focus: await active(page) };
  await search.fill('');
  // BPM
  const bpm = page.getByTestId('arrangement-tempo-input');
  out.bpm = { exists: await bpm.count() };
  if (out.bpm.exists) {
    await bpm.click();
    await page.keyboard.press('Shift+Slash');
    await sleep(250);
    out.bpm = { ...out.bpm, open: await sheetOpen(page), focus: await active(page), value: await bpm.inputValue() };
    await page.keyboard.press('Escape');
  }
  // Clip Gain needs a selected clip
  await addClip(page);
  const gain = page.getByTestId('arrangement-detail-clip-gain-input');
  out.clipGain = { exists: await gain.count() };
  if (out.clipGain.exists) {
    if (!(await gain.isVisible())) {
      out.clipGain.openedDetail = true;
      await page.getByTestId('arrangement-detail-toggle').click();
      await sleep(400);
    }
    await gain.scrollIntoViewIfNeeded().catch(() => null);
    out.clipGain.visible = await gain.isVisible();
    out.clipGain.box = await gain.boundingBox();
    await gain.focus();
    const v0 = await gain.inputValue();
    await page.keyboard.press('Shift+Slash');
    await sleep(250);
    out.clipGain = { ...out.clipGain, open: await sheetOpen(page), focus: await active(page), before: v0, value: await gain.inputValue() };
    await page.keyboard.press('Escape');
  }
  // marker name editor
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const addMarker = page.getByTestId('arrangement-marker-add');
  out.marker = { addExists: await addMarker.count() };
  if (out.marker.addExists) {
    await addMarker.click();
    await sleep(300);
    const input = page.getByTestId('arrangement-marker-name-input');
    out.marker.inputExists = await input.count();
    if (out.marker.inputExists) {
      await input.focus();
      await page.keyboard.press('Shift+Slash');
      await sleep(250);
      out.marker = { ...out.marker, open: await sheetOpen(page), value: await input.inputValue(), focus: await active(page) };
      await page.keyboard.press('Escape');
      await sleep(200);
    }
  }
  // Export open
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Shift+Slash');
  await sleep(300);
  out.exportOpen = {
    dialogs: await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.getAttribute('aria-labelledby') && document.getElementById(d.getAttribute('aria-labelledby'))?.textContent)),
    sheetOpen: await sheetOpen(page),
  };
  await page.keyboard.press('Escape');
  await sleep(300);
  out.exportOpen.dialogsAfterEsc = await page.locator('[role="dialog"]').count();
  // grid menu via right click on an empty part of a lane
  const lanePt = await page.evaluate(() => {
    const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]'));
    for (const lane of lanes.slice(1)) {
      const b = lane.getBoundingClientRect();
      const y = b.top + b.height / 2;
      for (let x = window.innerWidth * 0.75; x < Math.min(b.right, window.innerWidth) - 4; x += 8) {
        const hit = document.elementFromPoint(x, y);
        if (hit && hit.closest('[data-track-id]') === lane && !hit.closest('[data-clip-id]') && !hit.closest('button,input')) return { x, y };
      }
    }
    return null;
  });
  out.gridMenu = { lanePt };
  if (lanePt) {
    await page.mouse.click(lanePt.x, lanePt.y, { button: 'right' });
    await sleep(300);
    out.gridMenu.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
    out.gridMenu.focusBefore = await active(page);
    await page.keyboard.press('Shift+Slash');
    await sleep(300);
    out.gridMenu.sheetOpen = await sheetOpen(page);
    out.gridMenu.menuStill = await page.getByTestId('arrangement-grid-menu').count();
    if (out.gridMenu.sheetOpen) await closeSheetEsc(page);
    await page.keyboard.press('Escape');
    await sleep(200);
  }
  // during a clip drag
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const cb = await clip.boundingBox();
  const sx = Math.max(cb.x, 0) + 60; const sy = cb.y + cb.height * 0.6;
  out.drag = { clipBox: cb, start: { sx, sy }, hit: await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.closest('[data-clip-id]') ? 'clip:' + (e.getAttribute('data-testid') || e.tagName) : 'other:' + (e.getAttribute('data-testid') || e.tagName)); }, [sx, sy]) };
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 40, sy, { steps: 6 });
  await sleep(150);
  out.drag.statusDuring = await page.getByTestId('arrangement-status').textContent();
  out.drag.laneHint = await page.getByTestId('arrangement-lane-move-hint').count();
  await page.keyboard.press('Shift+Slash');
  await sleep(250);
  out.drag.sheetOpen = await sheetOpen(page);
  await page.mouse.move(sx + 60, sy, { steps: 3 });
  await page.mouse.up();
  await sleep(250);
  out.drag.sheetOpenAfterUp = await sheetOpen(page);
  if (out.drag.sheetOpenAfterUp) await closeSheetEsc(page);
  // modifiers (sheet must not open; Ctrl+Shift+/ etc.)
  for (const combo of ['Control+Shift+Slash', 'Alt+Shift+Slash']) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press(combo);
    await sleep(250);
    out[combo] = { open: await sheetOpen(page) };
    if (out[combo].open) await closeSheetEsc(page);
  }
  await ctx.close();
  return out;
}

async function cInert(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  // make one undo label and confirm keys work when sheet closed
  const state = () => page.evaluate(() => ({
    playing: !!document.querySelector('button[aria-label="Pause"]'),
    clips: document.querySelectorAll('[data-clip-kind="audio"]').length,
    undoTitle: [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'),
    markers: document.querySelectorAll('[data-testid="arrangement-marker"]').length,
    snap: document.querySelector('[data-testid="arrangement-snap-toggle"]')?.getAttribute('aria-pressed'),
    selected: !!document.querySelector('[data-testid="arrangement-selected-clip"]'),
    position: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
  }));
  out.start = await state();
  await page.locator('footer button', { hasText: 'Shortcuts' }).click();
  await sleep(300);
  // click the sheet title (non-focusable) so focus leaves the search field like a user would
  await page.locator('[role="dialog"] h2').click();
  await sleep(150);
  out.focusAfterTitleClick = await active(page);
  for (const k of ['Space', 'Delete', 'Control+z', 'm', 'g', 'ArrowRight', 'Home', 'Control+a', 'Backspace']) {
    await page.keyboard.press(k);
    await sleep(250);
  }
  out.afterKeys = await state();
  out.stillOpen = await sheetOpen(page);
  await shot(page, 'inert-open');
  await closeSheetEsc(page);
  out.afterClose = await state();
  // control: the same keys work with the sheet closed
  await page.locator('[data-clip-kind="audio"]').first().click();
  await sleep(200);
  await page.keyboard.press('g');
  await sleep(200);
  const snapAfterG = await state();
  await page.keyboard.press('m');
  await sleep(300);
  const afterM = await state();
  await page.keyboard.press('Space');
  await sleep(600);
  const afterSpace = await state();
  await page.keyboard.press('Space');
  await sleep(300);
  out.control = { snapAfterG: snapAfterG.snap, markersAfterM: afterM.markers, playingAfterSpace: afterSpace.playing };
  await ctx.close();
  return out;
}

async function cSearchA11y(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  const btn = page.locator('footer button', { hasText: 'Shortcuts' });
  out.button = await btn.evaluate((b) => ({
    name: b.getAttribute('aria-label'), title: b.getAttribute('title'), keys: b.getAttribute('aria-keyshortcuts'),
    haspopup: b.getAttribute('aria-haspopup'), expanded: b.getAttribute('aria-expanded'), type: b.getAttribute('type'),
  }));
  await btn.click();
  await sleep(400);
  const sb = page.getByRole('dialog').getByRole('searchbox');
  const rowsFor = async (q) => {
    await sb.fill(q);
    await sleep(150);
    return page.evaluate(() => ({
      rows: [...document.querySelectorAll('[role="dialog"] li[data-shortcut-id]')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), keys: [...li.querySelectorAll('kbd')].map((k) => k.textContent) })),
      noMatch: document.querySelector('[data-testid="shortcut-sheet-no-match"]')?.textContent || null,
    }));
  };
  out.search = { split: await rowsFor('split'), cut: await rowsFor('cut'), CUT: await rowsFor('CUT'), zzzz: await rowsFor('zzzz'), ctrlE: await rowsFor('ctrl+e') };
  await sb.fill('');
  await sleep(150);
  out.allRows = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] section')].map((s) => ({
    title: s.querySelector('h3').textContent,
    rows: [...s.querySelectorAll('li')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), action: li.querySelector('span').textContent, keys: [...li.querySelectorAll('kbd')].map((k) => k.textContent) })),
  })));
  out.dialog = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return { role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), name: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent, count: document.querySelectorAll('[role="dialog"]').length };
  });
  out.uniqueNames = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const names = [...d.querySelectorAll('button, input')].map((e) => e.getAttribute('aria-label') || e.textContent.trim());
    return { names, searchboxes: d.querySelectorAll('input[type="search"]').length };
  });
  // Tab cycle
  const seq = [];
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('Tab'); seq.push(await page.evaluate(() => ({ a: document.activeElement.getAttribute('aria-label'), inside: !!document.activeElement.closest('[role="dialog"]') }))); }
  const back = [];
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('Shift+Tab'); back.push(await page.evaluate(() => ({ a: document.activeElement.getAttribute('aria-label'), inside: !!document.activeElement.closest('[role="dialog"]') }))); }
  out.tab = { forward: seq, backward: back };
  // Contrast + font sizes
  out.textMetrics = await page.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
    const rgba = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const parseAlpha = (c) => { const m = /\/\s*([\d.]+)(%?)\s*\)$/.exec(c) || /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/.exec(c); if (!m) return c === 'rgba(0, 0, 0, 0)' || c === 'transparent' ? 0 : 1; return m[2] === '%' ? Number(m[1]) / 100 : Number(m[1]); };
    const col = (c) => { const [r, g, b] = rgba(c.replace(/\/\s*[\d.]+%?\s*\)$/, ')')); return [r, g, b, parseAlpha(c)]; };
    const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = (el) => { const stack = []; let e = el; while (e) { const c = getComputedStyle(e).backgroundColor; const v = col(c); if (v[3] > 0) stack.push(v); e = e.parentElement; } let base = [0, 0, 0]; const bodyBg = col(getComputedStyle(document.body).backgroundColor); if (bodyBg[3] > 0) base = bodyBg.slice(0, 3); for (let i = stack.length - 1; i >= 0; i -= 1) { const [r, g, b, a] = stack[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]; } return base; };
    const ratio = (el) => { const fg = col(getComputedStyle(el).color); const bg = bgOf(el); const f = [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3])]; const L1 = lum(f); const L2 = lum(bg); return +((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2); };
    window.__ratio = ratio;
    const d = document.querySelector('[role="dialog"]');
    const els = [...d.querySelectorAll('h2, h3, p, span, kbd, input, li > span')].filter((e) => e.getBoundingClientRect().height > 0 && e.textContent.trim());
    const items = els.map((e) => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 40), px: parseFloat(getComputedStyle(e).fontSize), ratio: ratio(e), color: getComputedStyle(e).color }));
    const input = d.querySelector('input');
    const ph = getComputedStyle(input, '::placeholder').color;
    return {
      minPx: Math.min(...items.map((i) => i.px)),
      minRatio: Math.min(...items.map((i) => i.ratio)),
      worst: items.sort((a, b) => a.ratio - b.ratio).slice(0, 5),
      smallest: [...items].sort((a, b) => a.px - b.px).slice(0, 3),
      placeholder: { color: ph },
      kbdBorder: getComputedStyle(d.querySelector('kbd')).borderTopColor,
      dialogBgChain: (() => { const out = []; let e = d.querySelector('kbd'); while (e) { const c = getComputedStyle(e).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)') out.push(`${e.tagName}.${(e.className || '').toString().slice(0, 40)}=${c}`); e = e.parentElement; } return out; })(),
    };
  });
  // widest row and overflow
  out.widest = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const scrollers = [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible');
    const li = d.querySelector('li[data-shortcut-id="fit"]');
    const kbds = [...li.querySelectorAll('kbd')].map((k) => { const r = k.getBoundingClientRect(); return { text: k.textContent, w: r.width, h: r.height, sw: k.scrollWidth, cw: k.clientWidth, lineH: parseFloat(getComputedStyle(k).lineHeight) }; });
    const lr = li.getBoundingClientRect();
    const box = d.firstElementChild.getBoundingClientRect();
    const content = d.querySelector('[role="dialog"] > * ');
    const anyKbdOverflow = [...d.querySelectorAll('kbd')].filter((k) => k.scrollWidth > k.clientWidth + 1 || k.getBoundingClientRect().height > 24).map((k) => k.textContent);
    const rowsOutside = [...d.querySelectorAll('li')].filter((l) => { const r = l.getBoundingClientRect(); const s = l.closest('section').getBoundingClientRect(); return r.right > s.right + 1 || r.left < s.left - 1; }).map((l) => l.getAttribute('data-shortcut-id'));
    return { li: { w: lr.width, h: lr.height }, kbds, dialogBox: { x: box.x, y: box.y, w: box.width, h: box.height }, scrollersX: scrollers.map((e) => e.tagName + ':' + e.scrollWidth + '>' + e.clientWidth), anyKbdOverflow, rowsOutside, contentScroll: { sh: content.scrollHeight, ch: content.clientHeight, sw: content.scrollWidth, cw: content.clientWidth }, docOverflowX: document.documentElement.scrollWidth > window.innerWidth };
  });
  await page.locator('li[data-shortcut-id="fit"]').scrollIntoViewIfNeeded();
  await shot(page, 'sheet-widest-fit');
  // glyphs via CDP
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const doc = await cdp.send('DOM.getDocument', { depth: -1 });
  const sub = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '[role="dialog"] h2 + p' });
  out.subline = { text: await page.locator('[role="dialog"] h2 + p').textContent() };
  out.subline.fonts = sub.nodeId ? (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: sub.nodeId })).fonts : null;
  // Close button pointer press vs keyboard focus ring
  const closeBtn = page.getByRole('button', { name: 'Close (Esc)' });
  const ring = (loc) => loc.evaluate((e) => { const s = getComputedStyle(e); return { fv: e.matches(':focus-visible'), style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, offset: s.outlineOffset }; });
  await closeBtn.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  out.closeKeyboardRing = await ring(closeBtn);
  await closeSheetEsc(page);
  // footer button: contrast at rest and hover, ring keyboard vs pointer
  await page.mouse.move(5, 5); await sleep(500);
  out.footerContrast = await btn.evaluate((b) => ({ restColor: getComputedStyle(b).color, rest: window.__ratio(b), kbd: window.__ratio(b.querySelector('kbd')), px: parseFloat(getComputedStyle(b).fontSize), kbdPx: parseFloat(getComputedStyle(b.querySelector('kbd')).fontSize), kbdBorder: getComputedStyle(b.querySelector('kbd')).borderTopColor }));
  await btn.hover();
  await sleep(300);
  out.footerContrast.hover = await btn.evaluate((b) => ({ btn: window.__ratio(b), kbd: window.__ratio(b.querySelector('kbd')), color: getComputedStyle(b).color }));
  await page.mouse.move(5, 5);
  // keyboard ring: Esc after keyboard open restores focus; check ring state
  await btn.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  out.footerKeyboardRing = { focus: await active(page), ...(await ring(btn)) };
  await shot(page, 'footer-keyboard-focus');
  await page.evaluate(() => document.activeElement.blur());
  const bb = await btn.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  out.footerPointerRing = await ring(btn);
  await page.mouse.up();
  await sleep(300);
  await closeSheetEsc(page);
  out.footerAfterEscRing = await ring(btn);
  await ctx.close();
  return out;
}

async function escNeighbours(browser) {
  const out = {};
  const { ctx, page } = await fresh(browser);
  const search = page.getByTestId('arrangement-library-search');
  await search.click();
  await page.keyboard.type('pad');
  await page.keyboard.press('Escape');
  await sleep(200);
  out.librarySearchEsc = { value: await search.inputValue() };
  // floating video: load an owned local site video, expand, Esc returns
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const input = page.getByTestId('arrangement-video-input');
  out.video = { inputs: await input.count() };
  if (out.video.inputs) {
    await input.setInputFiles('/home/runner/czaba-project/store/public/videos/hero/10.mp4');
    await page.waitForSelector('[data-clip-kind="video"]', { timeout: 30000 }).catch(() => null);
    await sleep(1500);
    const expand = page.getByTestId('arrangement-video-expand');
    out.video.expandCount = await expand.count();
    if (out.video.expandCount) {
      await expand.first().click();
      await sleep(500);
      const st = () => page.evaluate(() => ({ placeholder: !!document.querySelector('[data-testid="arrangement-video-placeholder"]'), dockAttr: document.querySelector('[data-testid="arrangement-video-dock"]')?.getAttribute('data-video-mode') || document.querySelector('[data-testid="arrangement-video-box"]')?.getAttribute('data-mode') || null }));
      out.video.afterExpand = await st();
      await shot(page, 'video-expanded');
      // sheet open over expanded video: Esc closes the sheet only
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await page.keyboard.press('Shift+Slash');
      await sleep(300);
      out.video.sheetOpen = await sheetOpen(page);
      await page.keyboard.press('Escape');
      await sleep(300);
      out.video.afterSheetEsc = { sheet: await sheetOpen(page), ...(await st()) };
      await page.keyboard.press('Escape');
      await sleep(400);
      out.video.afterSecondEsc = await st();
    }
  }
  await ctx.close();
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const which = process.argv[4] ? process.argv[4].split(',') : ['open', 'layout', 'noopen', 'inert', 'a11y', 'esc'];
  const fns = { open: cOpen, layout: cLayoutAndHeld, noopen: cNoOpen, inert: cInert, a11y: cSearchA11y, esc: escNeighbours };
  for (const w of which) {
    try { R.rows[w] = await fns[w](browser); } catch (e) { R.rows[w] = { error: String(e).slice(0, 500) }; }
    fs.writeFileSync(path.join(OUT, `sheet-${KEY}${process.argv[4] ? "-" + process.argv[4].replace(/,/g, "_") : ""}.json`), JSON.stringify(R, null, 1));
  }
  R.finished = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, `sheet-${KEY}${process.argv[4] ? "-" + process.argv[4].replace(/,/g, "_") : ""}.json`), JSON.stringify(R, null, 1));
  await browser.close();
})();
