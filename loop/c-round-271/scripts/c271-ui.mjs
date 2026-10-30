// C round 271: relative snap browser rows. usage: node c271-ui.mjs <BASE> <TAG> [export=1]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2] ?? 'http://127.0.0.1:5173';
const TAG = process.argv[3] ?? 'new';
const DO_EXPORT = (process.argv[4] ?? '1') === '1';
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-271';
const SHOTS = path.join(OUT, 'shots'); mkdirSync(SHOTS, { recursive: true });
const out = { base: BASE, tag: TAG, started: new Date().toISOString() };
const save = () => writeFileSync(path.join(OUT, `ui-${TAG}.json`), JSON.stringify(out, null, 1));
const browser = await chromium.launch();

async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(800);
  return { ctx, page, errors };
}
const laneBox = (page, id) => page.locator(`[data-track-id="${id}"] [data-grid-seconds]`).first().boundingBox();
async function addClip(page, lane, x, optIdx) {
  const b = await laneBox(page, lane); await page.mouse.click(b.x + x, b.y + b.height * 0.7); await page.waitForTimeout(300);
  await page.getByRole('option').nth(optIdx).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
}
const state = (page) => page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ start: c.getAttribute('data-clip-start'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') })),
    snap: g?.dataset.snap, snapPaused: g?.dataset.snapPaused, gridSeconds: g?.dataset.gridSeconds,
    snapTitle: btns.find((b) => /^Snap/.test(b.getAttribute('title') ?? ''))?.getAttribute('title') ?? null,
    undoTitle: btns.find((b) => /^Undo/.test(b.getAttribute('title') ?? b.getAttribute('aria-label') ?? ''))?.getAttribute('title') ?? null,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
  };
});
const header = (page, i = 0) => page.locator('[data-clip-id]').nth(i).locator(':scope > *').first().boundingBox();
async function drag(page, dx, { mods = [], i = 0, toY = null, peek = false } = {}) {
  const b = await header(page, i); const x = b.x + Math.min(20, b.width / 2); const y = b.y + b.height / 2; const y1 = toY ?? y;
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + dx / 2, (y + y1) / 2, { steps: 3 }); await page.mouse.move(x + dx, y1, { steps: 3 });
  await page.waitForTimeout(200);
  const ghosts = peek ? await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')].map((g) => g.getAttribute('data-ghost-start'))) : undefined;
  await page.mouse.up(); for (const m of mods) await page.keyboard.up(m); await page.waitForTimeout(350);
  return ghosts;
}
async function screenLines(page) {
  return page.evaluate(() => {
    const ex = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const lines = new Set(); let texts = 0; let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim(); if (!t) continue;
      const el = n.parentElement; if (!el || (ex && ex.contains(el))) continue;
      if (el.closest('[role=dialog],[role=tooltip],script,style,noscript,[aria-hidden=true],.sr-only')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const rc of r.getClientRects()) { if (rc.width < 1 || rc.height < 1 || rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) continue; lines.add(`${Math.round(rc.top)}:${Math.round(rc.left / 4)}`); }
      texts++;
    }
    return { lineBoxes: lines.size, rows: new Set([...lines].map((k) => k.split(':')[0])).size, texts };
  });
}
async function exportWav(page, name) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog'); await dlg.waitFor();
  await page.getByTestId('arrangement-export-format-wav').click(); await page.waitForTimeout(200);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), dlg.getByRole('button', { name: 'Export WAV', exact: true }).click()]);
  const file = path.join(OUT, `${TAG}-${name}.wav`); await dl.saveAs(file); await page.waitForTimeout(500);
  if (await dlg.isVisible()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  if (await dlg.isVisible()) { const c = dlg.getByRole('button', { name: /Close|Done/ }); if (await c.count()) await c.first().click(); }
  await page.waitForTimeout(300); return file;
}

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = {});
  // --- A: offset, jitter, undo, export shift, cross-lane, trim, titles
  {
    const { ctx, page, errors } = await open(w, h);
    r.screenEmpty = await screenLines(page);
    await addClip(page, 'music', 400, 0);
    r.added = await state(page);
    const pxPerSec = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return parseFloat(c.style.left) / Number(c.getAttribute('data-clip-start')); });
    r.pxPerSec = pxPerSec;
    if (DO_EXPORT) r.wav10 = await exportWav(page, `${vp}-start10`);
    r.titleSnapOff = (await state(page)).snapTitle;
    await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(300);
    r.snapOn = await state(page);
    await drag(page, 12, { mods: ['Alt'] }); r.alt12 = await state(page);
    r.undoBeforeJitter = r.alt12.undoTitle;
    await drag(page, 5); r.jitterPlus = await state(page);
    await drag(page, -5); r.jitterMinus = await state(page);
    await drag(page, 48); r.plus48a = await state(page);
    await drag(page, 48); r.plus48b = await state(page);
    r.screenAfterOffset = await screenLines(page);
    await page.screenshot({ path: path.join(SHOTS, `${TAG}-offset-${vp}.png`) });
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.undo1 = await state(page);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.undo2 = await state(page);
    await drag(page, 48); await drag(page, 48); r.redrag = await state(page);
    if (DO_EXPORT) r.wav123 = await exportWav(page, `${vp}-start12.3`);
    const stems = await laneBox(page, 'stems');
    r.xlaneGhosts = await drag(page, 48, { toY: stems.y + stems.height / 2, peek: true });
    r.xlane = await state(page);
    await page.screenshot({ path: path.join(SHOTS, `${TAG}-xlane-${vp}.png`) });
    const trim = page.locator('[data-clip-id]').first().locator('[title="Trim — left edge"]').first();
    r.trimHandleCount = await page.locator('[data-clip-id] [title="Trim — left edge"]').count();
    const tb = await trim.boundingBox();
    if (tb) { const x = tb.x + tb.width / 2; const y = tb.y + tb.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 15, y, { steps: 3 }); await page.mouse.move(x + 30, y, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(350); }
    r.trim = await state(page);
    // snap titles: off, on, paused (narrow the grid with 1 until lines hide)
    await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(250); r.titleOff2 = (await state(page)).snapTitle;
    await page.keyboard.press('g'); await page.waitForTimeout(250); r.titleOn2 = (await state(page)).snapTitle;
    r.narrow = [];
    for (let k = 0; k < 8; k++) { const s = await state(page); r.narrow.push([s.gridSeconds, s.snapPaused, s.snapTitle]); if (s.snapPaused === 'true') break; await page.keyboard.press('1'); await page.waitForTimeout(250); }
    r.titlePaused = (await state(page)).snapTitle;
    r.errors = errors; await ctx.close(); save();
  }
  // --- B: on-grid guard in a fresh context
  {
    const { ctx, page, errors } = await open(w, h);
    await addClip(page, 'music', 400, 0);
    await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(300);
    await drag(page, 56); r.ongrid = await state(page);
    r.ongridErrors = errors; await ctx.close(); save();
  }
  // --- C: nudge guard + group drag (B recipe)
  {
    const { ctx, page, errors } = await open(w, h);
    await addClip(page, 'music', 400, 0);
    await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(300);
    await drag(page, 12, { mods: ['Alt'] }); r.gAlt = await state(page);
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300); r.nudge = await state(page);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.nudgeUndo = await state(page);
    await addClip(page, 'stems', 600, 1); r.second = await state(page);
    const b0 = await header(page, 0); await page.mouse.click(b0.x + 20, b0.y + b0.height / 2); await page.waitForTimeout(200);
    const b1 = await header(page, 1); await page.keyboard.down('Control'); await page.mouse.click(b1.x + 20, b1.y + b1.height / 2); await page.keyboard.up('Control'); await page.waitForTimeout(300);
    r.groupSelected = await page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('aria-selected') ?? c.getAttribute('data-selected')));
    await drag(page, 48, { i: 0 }); r.group = await state(page);
    await page.screenshot({ path: path.join(SHOTS, `${TAG}-group-${vp}.png`) });
    r.groupErrors = errors; await ctx.close(); save();
  }
}
out.finished = new Date().toISOString(); save(); await browser.close(); console.log('done', TAG);
