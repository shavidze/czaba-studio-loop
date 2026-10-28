// C round 227: real Chromium checks (sheet rows, wide row, search, open, waveform-zoom, fit, footer slot).
// usage: node c227.cjs <width> <height>
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
const save = () => fs.writeFileSync(path.join(OUT, `c227-${KEY}.json`), JSON.stringify(R, null, 1));
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
const V = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const sc = q('[data-testid="arrangement-timeline-scroller"]');
  const scr = sc.getBoundingClientRect();
  const clips = [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => { const r = c.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right) }; });
  return {
    zoom: q('[data-testid="arrangement-zoom-readout"]')?.textContent,
    scrollLeft: Math.round(sc.scrollLeft), scrollWidth: sc.scrollWidth, clientWidth: sc.clientWidth,
    scLeft: Math.round(scr.left), scRight: Math.round(scr.right),
    clips,
    allClipsVisible: clips.every((c) => c.l >= scr.left + 200 && c.r <= scr.right + 1),
    range: q('[data-testid="arrangement-range"]')?.textContent || null,
    selectedLine: q('[data-testid="arrangement-selected-clip"]')?.textContent || null,
    status: q('[data-testid="arrangement-status"]')?.textContent,
    active: (() => { const a = document.activeElement; return a === document.body ? 'BODY' : a?.getAttribute('data-testid') || a?.getAttribute('aria-label') || a?.tagName; })(),
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
async function rulerDbl(page) {
  const b = await page.getByTestId('arrangement-ruler').boundingBox();
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  await page.mouse.dblclick(sc.x + 224 + 120, b.y + b.height - 4);
  await sleep(500);
}
async function overviewDbl(page) {
  const ob = await page.getByTestId('arrangement-overview').boundingBox();
  await page.mouse.dblclick(ob.x + ob.width * 0.5, ob.y + ob.height * 0.6);
  await sleep(500);
}
async function zoomIn(page, n = 3) {
  await blur(page);
  for (let i = 0; i < n; i += 1) await page.keyboard.press('Equal');
  await sleep(300);
}
const footerGeom = (page) => page.evaluate(() => {
  const btn = [...document.querySelectorAll('footer button')].find((b) => b.getAttribute('aria-label') === 'Keyboard shortcuts (?)' || b.textContent.includes('Shortcuts'));
  const f = btn.closest('footer');
  const row = btn.parentElement;
  const slot = ['arrangement-selected-clip-reserve', 'arrangement-selected-clip', 'arrangement-lane-move-hint'].map((t) => document.querySelector(`[data-testid="${t}"]`)).find(Boolean);
  const br = btn.getBoundingClientRect();
  const sr = slot?.getBoundingClientRect();
  return {
    footerH: f.getBoundingClientRect().height,
    slot: slot ? { testid: slot.getAttribute('data-testid'), h: sr.height, w: Math.round(sr.width), y: Math.round(sr.top), sameRowAsButton: slot.parentElement === row, truncated: slot.scrollWidth > slot.clientWidth, text: slot.textContent.slice(0, 90) } : null,
    button: { h: br.height, w: Math.round(br.width), y: Math.round(br.top), text: btn.textContent },
    rowChildren: row.children.length,
    rowH: row.getBoundingClientRect().height,
    footerTextLines: [...f.querySelectorAll('p,div')].filter((e) => e.children.length === 0 || e.tagName === 'P').filter((e) => e.getBoundingClientRect().height > 0 && e.textContent.trim()).length,
    docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
    footerOverflowX: f.scrollWidth > f.clientWidth,
  };
});

async function sheetChecks(browser) {
  const { ctx, page } = await fresh(browser);
  await row('C-OPEN-footer', async () => {
    await footerBtn(page).click();
    await sleep(400);
    const o = { open: await sheetOpen(page), focus: await active(page) };
    return o;
  });
  await row('C-ROWS-227', async () => {
    const dom = await domRows(page);
    const mism = [];
    const n = Math.max(dom.length, EXP.length);
    for (let i = 0; i < n; i += 1) {
      const a = dom[i]; const e = EXP[i];
      if (!a || !e || a.id !== e.id || a.group !== e.group || a.action !== e.action || JSON.stringify(a.keys) !== JSON.stringify(e.keys)) mism.push({ i, dom: a || null, exp: e || null });
    }
    return { domCount: dom.length, expCount: EXP.length, mismatches: mism, extra: dom.filter((d) => !EXP.some((e) => e.id === d.id)).map((d) => d.id), pass: mism.length === 0 && dom.length === 43 };
  });
  await row('C-WIDE-227', async () => {
    const out = {};
    for (const id of ['fit', 'waveform-zoom']) {
      const li = page.locator(`[role="dialog"] li[data-shortcut-id="${id}"]`);
      await li.scrollIntoViewIfNeeded();
      await sleep(150);
      out[id] = await li.evaluate((l) => ({ li: { w: l.getBoundingClientRect().width, h: l.getBoundingClientRect().height }, kbds: [...l.querySelectorAll('kbd')].map((k) => { const r = k.getBoundingClientRect(); return { text: k.textContent, w: Math.round(r.width), h: r.height, sw: k.scrollWidth, cw: k.clientWidth }; }) }));
      await li.screenshot({ path: path.join(OUT, `${KEY}-row-${id}.png`) });
    }
    out.sheet = await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role="dialog"]')].pop();
      const scrollersX = [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.tagName);
      const kbdOverflow = [...d.querySelectorAll('kbd')].filter((k) => k.scrollWidth > k.clientWidth + 1 || k.getBoundingClientRect().height > 18).map((k) => k.textContent);
      return { dialogSW: d.scrollWidth, dialogCW: d.clientWidth, scrollersX, kbdOverflow, docOverflowX: document.documentElement.scrollWidth > window.innerWidth };
    });
    await shot(page, 'sheet-fit-row');
    out.pass = out.fit.kbds.length === 2 && out.fit.kbds.every((k) => k.h <= 18 && k.sw === k.cw) && out.sheet.kbdOverflow.length === 0 && out.sheet.scrollersX.length === 0 && !out.sheet.docOverflowX;
    return out;
  });
  await row('C-SEARCH-227', async () => {
    const box = page.getByRole('searchbox', { name: 'Search shortcuts' });
    const out = {};
    for (const q of ['ruler', 'menu', 'split', 'cut', 'CUT', 'zzzz', 'ctrl+e', 'overview', 'Waveform Zoom menu']) {
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
    r.bodyQuestionOpens = await sheetOpen(page);
    r.focusInSheet = await active(page);
    await page.keyboard.press('Escape');
    await sleep(300);
    r.closed2 = !(await sheetOpen(page));
    r.focusAfter2 = await active(page);
    return r;
  });
  await ctx.close();
}

async function viewChecks(browser) {
  const { ctx, page } = await fresh(browser);
  await row('C-SLOT-S0', async () => footerGeom(page));
  await shot(page, 'S0');
  await row('C-WZ-227', async () => {
    const cb = page.getByRole('combobox', { name: /^Waveform Zoom/ });
    const info = await cb.evaluate((e) => ({ tag: e.tagName, name: e.getAttribute('aria-label') || e.getAttribute('title'), options: [...e.options].map((o) => o.textContent), value: e.value }));
    const count = await cb.count();
    await cb.selectOption({ label: '2×' });
    await sleep(400);
    const s = await V(page);
    const after = await cb.evaluate((e) => e.value);
    await cb.selectOption({ index: info.options.indexOf(info.options.find((o) => o === '1×')) });
    await sleep(300);
    return { count, info, after, status: s.status, viewOnly: /view only/i.test(s.status || '') };
  });
  await addClip(page);
  await addClip(page);
  await row('C-SLOT-S1', async () => {
    const p = await clipPoint(page, 0, 'title');
    await page.mouse.click(p.x, p.y);
    await sleep(300);
    return footerGeom(page);
  });
  await shot(page, 'S1');
  await row('C-FIT-227', async () => {
    const out = {};
    // (a) no selection: ruler double-click fits
    const ep = await page.evaluate(() => { const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect(); return { x: sc.right - 30, y: sc.bottom - 10 }; });
    await page.keyboard.press('Escape');
    await zoomIn(page, 4);
    out.a0 = await V(page);
    await rulerDbl(page);
    out.a1 = await V(page);
    // (b) overview double-click fits
    await zoomIn(page, 4);
    out.b0 = await V(page);
    await overviewDbl(page);
    out.b1 = await V(page);
    // (c) time selection: ruler double-click zooms to the selection
    const p = await clipPoint(page, 0, 'body');
    await page.mouse.move(p.x - 10, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 60, p.y, { steps: 8 });
    await page.mouse.up();
    await sleep(300);
    out.c0 = await V(page);
    await rulerDbl(page);
    out.c1 = await V(page);
    // (c') overview double-click with a selection still fits
    await overviewDbl(page);
    out.c2 = await V(page);
    // (d, probe) clip selected, no time range: ruler double-click
    await page.keyboard.press('Escape');
    await sleep(200);
    const t = await clipPoint(page, 0, 'title');
    await page.mouse.click(t.x, t.y);
    await sleep(300);
    await zoomIn(page, 4);
    out.d0 = await V(page);
    await rulerDbl(page);
    out.d1 = await V(page);
    out.ep = ep;
    const pps = (s) => parseFloat(String(s.zoom).replace(/[^0-9.]/g, ''));
    out.summary = {
      a: [pps(out.a0), pps(out.a1)], aFits: out.a1.allClipsVisible,
      b: [pps(out.b0), pps(out.b1)], bFits: out.b1.allClipsVisible,
      c: [pps(out.c0), pps(out.c1)], cRange: out.c0.range, cZoomedToSel: pps(out.c1) > pps(out.c0) && pps(out.c1) !== pps(out.a1),
      cOverview: pps(out.c2), d: [pps(out.d0), pps(out.d1)], dSelectedLine: out.d0.selectedLine, dRange: out.d0.range,
    };
    out.pass = out.summary.aFits && out.summary.bFits && pps(out.a1) === pps(out.b1) && out.summary.cZoomedToSel && !!out.c0.range;
    return out;
  });
  await ctx.close();
}

async function laneMove(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await rulerDbl(page);
  await row('C-SLOT-drag', async () => {
    const p = await clipPoint(page, 0, 'title');
    await page.mouse.click(p.x, p.y);
    await sleep(300);
    const h0 = await footerGeom(page);
    const target = await page.evaluate(() => {
      const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]'));
      const b = lanes[2].getBoundingClientRect();
      return { y: b.top + b.height / 2, id: lanes[2].getAttribute('data-track-id') };
    });
    const video = await page.evaluate(() => {
      const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]'));
      const b = lanes[0].getBoundingClientRect();
      return { y: b.top + b.height / 2 };
    });
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 30, p.y + 10, { steps: 4 });
    await page.mouse.move(p.x + 30, target.y, { steps: 8 });
    await sleep(250);
    const during = await footerGeom(page);
    await shot(page, 'drag-hint');
    await page.keyboard.down('Shift');
    await page.mouse.move(p.x + 35, target.y + 2, { steps: 2 });
    await sleep(200);
    const shift = await footerGeom(page);
    await page.mouse.move(p.x + 35, video.y, { steps: 10 });
    await sleep(250);
    const refusal = await footerGeom(page);
    await shot(page, 'drag-refusal');
    await page.mouse.move(p.x + 35, target.y + 2, { steps: 6 });
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await sleep(400);
    const end = await footerGeom(page);
    return { h0, during, shift, refusal, end };
  });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await sheetChecks(browser);
    await viewChecks(browser);
    await laneMove(browser);
  } finally {
    R.finished = new Date().toISOString();
    save();
    await browser.close();
  }
})();
