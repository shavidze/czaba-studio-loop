import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2] ?? 'http://127.0.0.1:5173';
const TAG = process.argv[3] ?? 'after';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-265';
const SHOT = `${DIR}/shots`;
mkdirSync(SHOT, { recursive: true });
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const browser = await chromium.launch();
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };

const read = (page) => page.evaluate(() => {
  const lanes = [...document.querySelectorAll('[data-grid-seconds]:not([data-testid])')];
  const overlays = [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((o) => ({
    lane: lanes.findIndex((l) => l.contains(o)),
    start: o.getAttribute('data-range-start'),
    end: o.getAttribute('data-range-end'),
    ariaHidden: o.getAttribute('aria-hidden'),
    text: o.textContent.trim(),
  }));
  const im = document.querySelector('[data-testid="arrangement-insert-marker"]');
  const a = document.activeElement;
  const clipEls = [...document.querySelectorAll('[data-clip-id]')];
  return {
    clips: clipEls.map((c) => c.getAttribute('data-clip-start')),
    clipLanes: clipEls.map((c) => lanes.findIndex((l) => l.contains(c))),
    overlays,
    rangeStartEls: document.querySelectorAll('[data-range-start]').length,
    clipRangeLabels: [...document.querySelectorAll('[data-clip-id] span.font-mono')].map((s) => s.textContent),
    marquee: document.querySelectorAll('[data-testid="arrangement-marquee"]').length,
    rangeReadout: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim(),
    hasRange: !!document.querySelector('[data-testid="arrangement-range"]'),
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    insertMarker: im ? { pos: im.getAttribute('data-insert-marker'), hidden: im.hidden } : null,
    selectedClips: clipEls.filter((c) => c.getAttribute('aria-selected') === 'true' || c.getAttribute('data-selected') === 'true').length,
    playback: (document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent ?? '').trim(),
    position: (document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? '').trim(),
    active: !a || a === document.body ? 'BODY' : `${a.tagName}|${a.getAttribute('aria-label') ?? a.textContent?.trim().slice(0, 30) ?? ''}`,
    loop: (document.querySelector('[data-testid="arrangement-loop-region"]') ? 'loop-region' : null),
  };
});

async function open(w, h, doSetup = true) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  let setup = null;
  if (doSetup) {
    const lb = await lane.boundingBox();
    await page.mouse.click(lb.x + 400, lb.y + lb.height * 0.7);
    await page.waitForTimeout(300);
    await page.getByRole('option').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    const snapBtn = page.locator('button[aria-keyshortcuts="G 4"]').first();
    setup = {
      ...(await read(page)),
      clipXminusLaneX: Math.round(clip.x - lb.x),
      clipW: Math.round(clip.width),
      snapPressed: await snapBtn.getAttribute('aria-pressed'),
      gridSeconds: await lane.getAttribute('data-grid-seconds'),
    };
  }
  const lb = await lane.boundingBox();
  const clipLoc = page.locator('[data-clip-id]').first();
  const clip = doSetup ? await clipLoc.boundingBox() : null;
  const y = lb.y + lb.height * 0.7;
  return { ctx, page, errors, lb, clip, y, setup };
}
async function drag(page, x0, y0, x1, y1 = y0, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.move(x0, y0); await page.mouse.down();
  await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 4 });
  const mid = await read(page);
  await page.mouse.move(x1, y1, { steps: 4 }); await page.mouse.up();
  for (const m of mods) await page.keyboard.up(m);
  await page.waitForTimeout(300);
  return { mid, after: await read(page) };
}
const clear = async (s) => { await s.page.mouse.click(s.lb.x + 60, s.y); await s.page.waitForTimeout(300); };
const want = (k) => !ONLY || ONLY.includes(k);

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  if (want('main')) {
    const s = await open(w, h);
    const { page, lb, clip, y } = s;
    r.setup = s.setup; r.laneBox = lb; r.clipBox = clip;
    await page.screenshot({ path: `${SHOT}/${TAG}-setupS-${vp}.png` });
    r.BG_RANGE = await drag(page, lb.x + 40, y, lb.x + 300);
    await page.screenshot({ path: `${SHOT}/${TAG}-bg-range-${vp}.png` });
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.BG_EMPTY_DELETE = await read(page);
    await clear(s);
    await drag(page, lb.x + 40, y, lb.x + 300);
    await page.keyboard.press('Control+Shift+KeyL'); await page.waitForTimeout(300);
    r.ALL_TRACKS = await read(page);
    r.ALL_TRACKS.laneCount = await page.locator('[data-grid-seconds]:not([data-testid])').count();
    await page.screenshot({ path: `${SHOT}/${TAG}-all-tracks-${vp}.png` });
    await clear(s);
    await drag(page, lb.x + 40, y, lb.x + 300);
    await page.keyboard.press('Control+KeyL'); await page.waitForTimeout(300);
    r.NB_LOOP_ON_BG_RANGE = await read(page);
    r.NB_LOOP_ON_BG_RANGE.loopAttr = await page.evaluate(() => [...document.querySelectorAll('[data-loop-start],[data-testid*="loop"]')].map((e) => `${e.getAttribute('data-testid')}|${e.getAttribute('data-loop-start')}|${e.getAttribute('data-loop-end')}|${e.getAttribute('aria-pressed')}`).slice(0, 6));
    await page.keyboard.press('Control+KeyL'); await page.waitForTimeout(300);
    await clear(s);
    await page.mouse.click(lb.x + 120, y); await page.waitForTimeout(300);
    r.CLICK_SAME = await read(page);
    await clear(s);
    const lane2 = await page.locator('[data-grid-seconds]:not([data-testid])').nth(1).boundingBox();
    r.VERTICAL = await drag(page, lb.x + 40, y, lb.x + 300, lane2.y + lane2.height * 0.5);
    await clear(s);
    r.VERTICAL_ONLY_before = await read(page);
    r.VERTICAL_ONLY = await drag(page, lb.x + 200, lb.y + lb.height * 0.3, lb.x + 200, lb.y + lb.height * 0.9);
    await clear(s);
    r.CLIP_PAST_START = await drag(page, clip.x + 100, y, clip.x - 150);
    await page.screenshot({ path: `${SHOT}/${TAG}-clip-past-start-${vp}.png` });
    await clear(s);
    r.IN_CLIP_SAME = await drag(page, clip.x + 100, y, clip.x + 400);
    await page.screenshot({ path: `${SHOT}/${TAG}-in-clip-${vp}.png` });
    await clear(s);
    await page.keyboard.press('g'); await page.waitForTimeout(300);
    r.SNAP_pressed = await page.locator('button[aria-keyshortcuts="G 4"]').first().getAttribute('aria-pressed');
    r.SNAP_1 = (await drag(page, lb.x + 52, y, lb.x + 304)).after; await clear(s);
    r.SNAP_2_alt = (await drag(page, lb.x + 52, y, lb.x + 304, y, ['Alt'])).after; await clear(s);
    r.SNAP_3 = (await drag(page, lb.x + 44, y, lb.x + 52)).after; await clear(s);
    await page.keyboard.press('g'); await page.waitForTimeout(300);
    r.SNAP_restored = await page.locator('button[aria-keyshortcuts="G 4"]').first().getAttribute('aria-pressed');
    // BG-INTO-CLIP + neighbours
    r.BG_INTO_CLIP = await drag(page, lb.x + 40, y, clip.x + 200);
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.BG_INTO_CLIP_delete = await read(page);
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(400);
    r.BG_INTO_CLIP_undo = await read(page);
    await clear(s);
    await drag(page, lb.x + 40, y, clip.x + 200);
    await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300);
    r.NB_SPLIT = await read(page);
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(400);
    r.NB_SPLIT_undo = await read(page);
    await clear(s);
    await drag(page, lb.x + 40, y, clip.x + 200);
    await page.keyboard.press('Control+Shift+KeyX'); await page.waitForTimeout(300);
    r.NB_CUT_TIME = await read(page);
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(400);
    r.NB_CUT_TIME_undo = await read(page);
    await clear(s);
    // FOCUS-SAME
    await page.locator('button[aria-keyshortcuts="G 4"]').first().focus();
    r.FOCUS_1_before = (await read(page)).active;
    r.FOCUS_1 = (await drag(page, lb.x + 40, y, lb.x + 300)).after.active;
    r.FOCUS_1_ring = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { matchesFV: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}` }; });
    await clear(s);
    await page.getByRole('searchbox').first().focus().catch(() => {});
    r.FOCUS_2_before = (await read(page)).active;
    r.FOCUS_2 = (await drag(page, lb.x + 40, y, lb.x + 300)).after.active;
    await clear(s);
    // MARQUEE-CTRL control half (deletes the clip)
    await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
    r.MARQUEE_CTRL = await drag(page, lb.x + 40, y, clip.x + 200, y, ['Control']);
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.MARQUEE_CTRL_delete = await read(page);
    r.errors = s.errors; await s.ctx.close();
  }
  if (want('shift')) {
    const s = await open(w, h);
    await s.page.mouse.click(s.lb.x + 60, s.y); await s.page.waitForTimeout(300);
    r.MARQUEE_SHIFT = await drag(s.page, s.lb.x + 40, s.y, s.clip.x + 200, s.y, ['Shift']);
    await s.page.keyboard.press('Delete'); await s.page.waitForTimeout(300);
    r.MARQUEE_SHIFT_delete = await read(s.page);
    r.shiftErrors = s.errors; await s.ctx.close();
  }
  if (want('playing')) {
    const s = await open(w, h);
    const { page, lb, y } = s;
    await page.keyboard.press('Space'); await page.waitForTimeout(500);
    r.PLAY_beforeDrag = await read(page);
    const dragRes = await drag(page, lb.x + 40, y, lb.x + 300);
    r.PLAY_mid = dragRes.mid; r.PLAY_afterDrag = dragRes.after;
    await page.waitForTimeout(500);
    r.PLAY_after500 = await read(page);
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
    r.PLAY_stopped = await read(page);
    await page.keyboard.press('Space'); await page.waitForTimeout(500);
    r.PLAY_restart500 = await read(page);
    await page.keyboard.press('Space');
    r.playErrors = s.errors; await s.ctx.close();
  }
  if (want('empty')) {
    const s = await open(w, h, false);
    await s.page.screenshot({ path: `${SHOT}/${TAG}-empty-${vp}.png` });
    await s.page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    await s.page.keyboard.press('Shift+Slash'); await s.page.waitForTimeout(600);
    r.SHEET = await s.page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return { dialog: false };
      const rect = d.getBoundingClientRect();
      const scrollers = [d, ...d.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflowY !== 'visible').map((e) => ({ tag: e.tagName, sh: e.scrollHeight, ch: e.clientHeight }));
      const rowEls = [...d.querySelectorAll('tr, li, [role="row"]')];
      const overflowX = [...d.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > rect.right + 0.5).length;
      const texts = rowEls.map((e) => e.textContent.replace(/\s+/g, ' ').trim());
      return { dialog: true, rows: rowEls.length, scrollers, overflowX, texts };
    });
    for (const name of ['Add clips in an area to the selection', 'Select time']) {
      const loc = s.page.getByRole('dialog').getByText(name, { exact: true }).first();
      if (await loc.count()) {
        await loc.scrollIntoViewIfNeeded();
        await s.page.waitForTimeout(200);
        const row = await loc.evaluate((e) => { const r = (e.closest('tr, li, [role="row"]') ?? e).getBoundingClientRect(); const d = e.closest('[role="dialog"]').getBoundingClientRect(); const sc = [...e.closest('[role="dialog"]').querySelectorAll('*')].find((x) => x.scrollHeight > x.clientHeight + 1 && getComputedStyle(x).overflowY !== 'visible'); const sr = sc ? sc.getBoundingClientRect() : d; return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, inScroller: r.top >= sr.top - 0.5 && r.bottom <= sr.bottom + 0.5 && r.right <= sr.right + 0.5 }; });
        (r.SHEET.rowBoxes ??= {})[name] = row;
        await s.page.screenshot({ path: `${SHOT}/${TAG}-sheet-${name.split(' ')[0]}-${vp}.png` });
      }
    }
    r.emptyErrors = s.errors; await s.ctx.close();
  }
}
res.finishedUtc = new Date().toISOString();
writeFileSync(`${DIR}/browser-${TAG}.json`, JSON.stringify(res, null, 1));
await browser.close();
console.log('ok');
