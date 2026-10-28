// C round 228: real Chromium checks for CALM-1b (transport titles, aria-keyshortcuts, parity, keys, hover, sheet rows, search, open, neighbours).
// usage: node c228.cjs <width> <height>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173/studio-lab';
const W = Number(process.argv[2]);
const H = Number(process.argv[3]);
const KEY = `${W}x${H}`;
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const EXP = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-rows.json'), 'utf8'));
const R = { viewport: KEY, started: new Date().toISOString(), rows: {}, pageErrors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(OUT, `c228-${KEY}.json`), JSON.stringify(R, null, 1));
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${KEY}-${name}.png`) });

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
async function row(id, fn) {
  try { R.rows[id] = await fn(); } catch (e) { R.rows[id] = { error: String(e).slice(0, 400) }; }
  save();
}
const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
async function addClip(page) {
  const n = await page.locator('[data-clip-kind="audio"]').count();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForFunction((k) => document.querySelectorAll('[data-clip-kind="audio"]').length > k, n, { timeout: 20000 });
  await sleep(400);
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
const footerBtn = (page) => page.getByRole('button', { name: 'Keyboard shortcuts (?)' });
const domRows = (page) => page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => document.getElementById(x.getAttribute('aria-labelledby') || '')?.textContent === 'Keyboard shortcuts');
  return [...d.querySelectorAll('section')].flatMap((s) => {
    const g = document.getElementById(s.getAttribute('aria-labelledby') || '')?.textContent || null;
    return [...s.querySelectorAll('li[data-shortcut-id]')].map((li) => ({ group: g, id: li.getAttribute('data-shortcut-id'), action: li.querySelector('span')?.textContent, keys: [...li.querySelectorAll('kbd')].map((k) => k.textContent) }));
  });
});

// transport + view + other keyed buttons
const dumpButtons = (page) => page.evaluate(() => {
  const info = (b) => b && ({
    title: b.getAttribute('title'), aks: b.getAttribute('aria-keyshortcuts'), hasAks: b.hasAttribute('aria-keyshortcuts'),
    ariaLabel: b.getAttribute('aria-label'), text: b.textContent.trim(), disabled: b.disabled, pressed: b.getAttribute('aria-pressed'),
    box: (() => { const r = b.getBoundingClientRect(); return { x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
  });
  const btns = [...document.querySelectorAll('button')];
  const byTitle = (re) => btns.find((b) => re.test(b.getAttribute('title') || ''));
  const byLabel = (re) => btns.find((b) => re.test(b.getAttribute('aria-label') || ''));
  const tid = (t) => document.querySelector(`[data-testid="${t}"]`);
  return {
    play: info(byLabel(/^(Play|Pause)$/)),
    backToStart: info(byLabel(/^Back to start$/)),
    undo: info(btns.find((b) => /^Undo/.test(b.textContent.trim()))),
    redo: info(btns.find((b) => /^Redo/.test(b.textContent.trim()))),
    split: info(byTitle(/^Split /)),
    delete: info(btns.find((b) => b.hasAttribute('aria-keyshortcuts') && /^Delete/.test(b.getAttribute('aria-keyshortcuts') || ''))) || info(byLabel(/^Delete/)),
    loop: info(byTitle(/^Loop (on|the)/)),
    zoomRange: info(tid('arrangement-zoom-range')),
    zoomBack: info(tid('arrangement-zoom-back')),
    fit: info(tid('arrangement-fit')),
    follow: info(tid('arrangement-follow')),
    footer: info(byLabel(/^Keyboard shortcuts/)),
    snap: info(tid('arrangement-snap-toggle')),
    envelope: info(tid('arrangement-envelope-toggle')),
    markerAdd: info(tid('arrangement-marker-add')),
    markerPrev: info(tid('arrangement-marker-prev')),
    markerNext: info(tid('arrangement-marker-next')),
    position: tid('arrangement-position')?.textContent || null,
    status: tid('arrangement-status')?.textContent || null,
    clips: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => { const r = c.getBoundingClientRect(); return { l: +r.left.toFixed(1), w: +r.width.toFixed(1) }; }),
    markers: document.querySelectorAll('[data-testid="arrangement-marker"]').length,
    range: document.querySelector('[data-testid="arrangement-range"]')?.textContent || null,
  };
});

async function clipPoint(page, idx = 0, zone = 'title') {
  return page.evaluate(([i, zn]) => {
    const c = [...document.querySelectorAll('[data-clip-kind="audio"]')][i];
    if (!c) return null;
    const r = c.getBoundingClientRect();
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
    const left = Math.max(r.left, sc.left + 224 + 4);
    const right = Math.min(r.right, sc.right - 14);
    if (right - left < 12) return null;
    const x = left + Math.min(40, (right - left) / 2);
    const y = zn === 'title' ? r.top + 10 : r.top + r.height * 0.65;
    return { x, y };
  }, [idx, zone]);
}
async function selectClip(page, idx = 0) {
  const p = await clipPoint(page, idx, 'title');
  await page.mouse.click(p.x, p.y);
  await sleep(300);
}
async function timeSelect(page) {
  const p = await clipPoint(page, 0, 'body');
  await page.mouse.move(p.x - 10, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
}
async function addMarker(page) {
  await page.getByTestId('arrangement-marker-add').click();
  await sleep(300);
  const input = page.getByTestId('arrangement-marker-name-input');
  if (await input.count()) { await input.press('Enter'); await sleep(300); }
}
const lastParen = (t) => { const m = /\(([^()]*)\)\s*$/.exec(t || ''); return m ? m[1] : null; };

async function parity(page, state) {
  const b = await dumpButtons(page);
  await blur(page);
  await footerBtn(page).click();
  await sleep(400);
  const rows = await domRows(page);
  await page.keyboard.press('Escape');
  await sleep(300);
  const keysOf = (id) => rows.find((r) => r.id === id)?.keys || null;
  const checks = [
    ['play', 'play-stop', 'exact'], ['backToStart', 'back-to-start', 'exact'], ['undo', 'undo', 'exact'], ['redo', 'redo', 'exact'],
    ['split', 'split', 'exact'], ['delete', 'delete', 'exact'], ['loop', 'loop', 'exact'], ['zoomRange', 'zoom-range', 'exact'], ['zoomBack', 'zoom-range', 'exact'],
    ['snap', 'snap', 'contains'], ['envelope', 'envelope', 'contains'], ['markerAdd', 'marker', 'contains'], ['markerPrev', 'edge-nav', 'contains'], ['markerNext', 'edge-nav', 'contains'],
  ];
  const out = [];
  for (const [btn, id, mode] of checks) {
    const t = b[btn]?.title;
    const k = lastParen(t);
    const ks = keysOf(id);
    let ok = false;
    if (k && ks) ok = mode === 'exact' ? ks.includes(k) : ks.some((x) => x.includes(k) || k.includes(x));
    out.push({ btn, row: id, title: t, key: k, sheetKeys: ks, ok, listedOnly: mode === 'contains' });
  }
  return { state, checks: out, mismatchesCore: out.filter((c) => !c.listedOnly && !c.ok).length, mismatchesListed: out.filter((c) => c.listedOnly && !c.ok).map((c) => c.btn) };
}

async function titlesFlow(browser) {
  const { ctx, page } = await fresh(browser);
  await row('S0', () => dumpButtons(page));
  await row('PARITY-S0', () => parity(page, 'S0'));
  await addClip(page);
  await addClip(page);
  await selectClip(page, 0);
  await row('S1', () => dumpButtons(page));
  await row('PARITY-S1', () => parity(page, 'S1'));
  await row('S1-playing', async () => {
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await sleep(700);
    const d = await dumpButtons(page);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await sleep(400);
    const after = await dumpButtons(page);
    return { playing: d.play, after: after.play };
  });
  await selectClip(page, 0);
  await timeSelect(page);
  await row('S2', () => dumpButtons(page));
  await shot(page, 'S2');
  await ctx.close();
  const f2 = await fresh(browser);
  const page2 = f2.page;
  await titlesS3(page2);
  await f2.ctx.close();
}

async function titlesS3(page) {
  await addClip(page);
  await selectClip(page, 0);
  await addMarker(page);
  await selectClip(page, 0);
  await row('S3', () => dumpButtons(page));
  await row('PARITY-S3', () => parity(page, 'S3'));
  await row('C-HOVER-228', async () => {
    const u = page.locator('button', { hasText: /^Undo/ }).first();
    const bb = await u.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 5 });
    await sleep(1700);
    await shot(page, 'S3-undo-hover');
    return { title: await u.getAttribute('title'), hoverBox: bb, note: 'see screenshot for native tooltip paint' };
  });
  await page.mouse.move(5, 5);
  await row('S4', async () => {
    await page.locator('button', { hasText: /^Undo/ }).first().click();
    await sleep(400);
    return dumpButtons(page);
  });
}

async function keysFlow(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await addClip(page);
  const st = () => dumpButtons(page);
  const K = {};
  // Home: move playhead first by clicking the ruler
  const rb = await page.getByTestId('arrangement-ruler').boundingBox();
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  await page.mouse.click(sc.x + 224 + 200, rb.y + rb.height - 4);
  await sleep(300);
  await blur(page);
  const h0 = await st();
  await page.keyboard.press('Home');
  await sleep(300);
  const h1 = await st();
  K.home = { before: h0.position, after: h1.position };
  // Space
  await blur(page);
  const s0 = await st();
  await page.keyboard.press('Space');
  await sleep(900);
  const s1 = await st();
  await page.keyboard.press('Space');
  await sleep(500);
  const s2 = await st();
  await sleep(500);
  const s3 = await st();
  K.space = { before: [s0.position, s0.play.ariaLabel], playing: [s1.position, s1.play.ariaLabel], stopped: [s2.position, s2.play.ariaLabel], stoppedLater: s3.position };
  if (W === 1280) { R.rows['C-KEYS-228'] = K; save(); await ctx.close(); return; }
  // S1: split with Ctrl+E
  await page.keyboard.press('Home');
  await selectClip(page, 0);
  const p = await clipPoint(page, 0, 'title');
  // put playhead inside the first clip via ruler click at clip x + 60
  await page.mouse.click(p.x + 60, rb.y + rb.height - 4);
  await sleep(300);
  await selectClip(page, 0);
  await blur(page);
  const e0 = await st();
  await page.keyboard.press('Control+e');
  await sleep(400);
  const e1 = await st();
  K.ctrlE = { clipsBefore: e0.clips.length, clipsAfter: e1.clips.length, undoAfter: e1.undo.text };
  // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
  await page.keyboard.press('Control+z');
  await sleep(400);
  const z1 = await st();
  await page.keyboard.press('Control+Shift+z');
  await sleep(400);
  const z2 = await st();
  await page.keyboard.press('Control+z');
  await sleep(400);
  const z3 = await st();
  await page.keyboard.press('Control+y');
  await sleep(400);
  const z4 = await st();
  K.undoRedo = { afterUndo: [z1.clips.length, z1.redo.text], afterCtrlShiftZ: [z2.clips.length, z2.undo.text], afterUndo2: z3.clips.length, afterCtrlY: [z4.clips.length, z4.undo.text] };
  await page.keyboard.press('Control+z');
  await sleep(400);
  // Delete on S1: gap remains
  await selectClip(page, 0);
  await blur(page);
  const d0 = await st();
  await page.keyboard.press('Delete');
  await sleep(400);
  const d1 = await st();
  K.delete = { before: d0.clips, after: d1.clips, undo: d1.undo.text };
  await page.keyboard.press('Control+z');
  await sleep(400);
  // Ctrl+L on S2
  await selectClip(page, 0);
  await timeSelect(page);
  await blur(page);
  const l0 = await st();
  await page.keyboard.press('Control+l');
  await sleep(400);
  const l1 = await st();
  K.ctrlL = { range: l0.range, pressedBefore: l0.loop.pressed, pressedAfter: l1.loop.pressed, status: l1.status };
  R.rows['C-KEYS-228'] = K; save();
  // neighbour HK1: held Ctrl+L gives one toggle
  await row('N-HK1', async () => {
    const statuses = [];
    await page.keyboard.down('Control');
    for (let i = 0; i < 6; i += 1) { await page.keyboard.down('l'); statuses.push(await page.getByTestId('arrangement-status').textContent()); await sleep(60); }
    await page.keyboard.up('l');
    await page.keyboard.up('Control');
    await sleep(300);
    const after = await st();
    return { pressedBefore: l1.loop.pressed, pressedAfter: after.loop.pressed, statuses: [...new Set(statuses)], historyUndo: after.undo.text };
  });
  // neighbour FL: one Delete button click -> focus on Undo
  await row('N-FL', async () => {
    await page.keyboard.press('Escape');
    await selectClip(page, 0);
    const delBtn = page.locator('button[aria-keyshortcuts="Delete Backspace"]');
    await delBtn.click();
    await sleep(400);
    return { focus: await active(page), focusText: await page.evaluate(() => document.activeElement?.textContent.trim().slice(0, 40)) };
  });
  await ctx.close();
}

async function sheetChecks(browser) {
  const { ctx, page } = await fresh(browser);
  await row('C-OPEN-footer', async () => {
    await footerBtn(page).click();
    await sleep(400);
    return { open: await sheetOpen(page), focus: await active(page) };
  });
  await row('C-ROWS-228', async () => {
    const dom = await domRows(page);
    const mism = [];
    const n = Math.max(dom.length, EXP.length);
    for (let i = 0; i < n; i += 1) {
      const a = dom[i]; const e = EXP[i];
      if (!a || !e || a.id !== e.id || a.group !== e.group || a.action !== e.action || JSON.stringify(a.keys) !== JSON.stringify(e.keys)) mism.push({ i, dom: a || null, exp: e || null });
    }
    const li = page.locator('[role="dialog"] li[data-shortcut-id="fit"]');
    await li.scrollIntoViewIfNeeded();
    await sleep(150);
    const fit = await li.evaluate((l) => ({ li: { w: l.getBoundingClientRect().width, h: l.getBoundingClientRect().height }, kbds: [...l.querySelectorAll('kbd')].map((k) => { const r = k.getBoundingClientRect(); return { text: k.textContent, w: Math.round(r.width), h: r.height, sw: k.scrollWidth, cw: k.clientWidth }; }) }));
    await li.screenshot({ path: path.join(OUT, `${KEY}-row-fit.png`) });
    const sheet = await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role="dialog"]')].pop();
      const scrollersX = [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.tagName);
      const kbdOverflow = [...d.querySelectorAll('kbd')].filter((k) => k.scrollWidth > k.clientWidth + 1 || k.getBoundingClientRect().height > 18).map((k) => k.textContent);
      return { scrollersX, kbdOverflow, docOverflowX: document.documentElement.scrollWidth > window.innerWidth };
    });
    await shot(page, 'sheet-fit-row');
    return { domCount: dom.length, expCount: EXP.length, mismatches: mism, extra: dom.filter((d) => !EXP.some((e) => e.id === d.id)).map((d) => d.id), fit, sheet, pass: mism.length === 0 && dom.length === 43 && fit.kbds.every((k) => k.h <= 18 && k.sw === k.cw) && sheet.kbdOverflow.length === 0 };
  });
  await row('C-SEARCH-228', async () => {
    const box = page.getByRole('searchbox', { name: 'Search shortcuts' });
    const out = {};
    for (const q of ['time selection', 'ruler', 'menu', 'split', 'cut', 'zzzz', 'ctrl+e']) {
      await box.fill(q);
      await sleep(250);
      out[q] = await page.evaluate(() => {
        const d = [...document.querySelectorAll('[role="dialog"]')].pop();
        return { ids: [...d.querySelectorAll('li[data-shortcut-id]')].map((l) => l.getAttribute('data-shortcut-id')), noMatch: d.querySelector('[data-testid="shortcut-sheet-no-match"]')?.textContent || null };
      });
    }
    await box.fill('');
    return out;
  });
  await row('C-OPEN-esc', async () => {
    await page.keyboard.press('Escape');
    await sleep(300);
    const r = { closed: !(await sheetOpen(page)), focusAfter: await active(page) };
    await blur(page);
    await page.keyboard.press('Shift+Slash');
    await sleep(300);
    r.questionOpens = await sheetOpen(page);
    await page.keyboard.press('Escape');
    await sleep(300);
    r.closed2 = !(await sheetOpen(page));
    r.focusAfter2 = await active(page);
    return r;
  });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await titlesFlow(browser);
    await keysFlow(browser);
    await sheetChecks(browser);
  } finally {
    R.finished = new Date().toISOString();
    save();
    await browser.close();
  }
})();
