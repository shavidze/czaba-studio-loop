// C round 226 C-ROWS: perform each shortcut-sheet row once in the real Studio (sheet closed).
// usage: node rows.cjs <width> <height> [groups]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173/studio-lab';
const W = Number(process.argv[2]);
const H = Number(process.argv[3]);
const KEY = `${W}x${H}`;
const OUT = path.join(__dirname, 'rows');
fs.mkdirSync(OUT, { recursive: true });
const R = { viewport: KEY, started: new Date().toISOString(), rows: {}, pageErrors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(OUT, `rows-${KEY}${process.argv[4] ? '-' + process.argv[4].replace(/,/g, '_') : ''}.json`), JSON.stringify(R, null, 1));

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
const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
async function addClip(page) {
  const n = await page.locator('[data-clip-kind="audio"]').count();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForFunction((k) => document.querySelectorAll('[data-clip-kind="audio"]').length > k, n, { timeout: 20000 });
  await sleep(400);
}
const S = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const btnTitle = (p) => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith(p));
  const sc = q('[data-testid="arrangement-timeline-scroller"]');
  return {
    clips: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ id: c.getAttribute('data-clip-id'), start: c.getAttribute('data-clip-start'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id'), w: Math.round(c.getBoundingClientRect().width), env: c.getAttribute('data-envelope') })),
    selectedLine: q('[data-testid="arrangement-selected-clip"]')?.textContent || null,
    selectedCount: [...document.querySelectorAll('footer p')].map((p) => p.textContent).find((t) => /clips selected/.test(t)) || null,
    playing: !!q('button[aria-label="Pause"]'),
    position: q('[data-testid="arrangement-position"]')?.textContent,
    undoTitle: btnTitle('Undo')?.getAttribute('title'),
    redoTitle: btnTitle('Redo')?.getAttribute('title'),
    markers: document.querySelectorAll('[data-testid="arrangement-marker"]').length,
    markerEditor: !!q('[data-testid="arrangement-marker-name-input"]'),
    snap: q('[data-testid="arrangement-snap-toggle"]')?.getAttribute('aria-pressed'),
    envelope: q('[data-testid="arrangement-envelope-toggle"]')?.getAttribute('aria-pressed'),
    gridSeconds: q('[data-grid-seconds]')?.getAttribute('data-grid-seconds'),
    gridLines: q('[data-grid-lines]')?.getAttribute('data-grid-lines'),
    zoom: q('[data-testid="arrangement-zoom-readout"]')?.textContent,
    zoomSlider: q('[data-testid="arrangement-zoom"]')?.value ?? q('[data-testid="arrangement-zoom"] input')?.value,
    scrollLeft: sc ? Math.round(sc.scrollLeft) : null,
    range: q('[data-testid="arrangement-range"]')?.textContent || null,
    allLaneRange: document.querySelectorAll('[data-testid="arrangement-lane-range"]').length,
    loopBrace: !!q('[data-testid="arrangement-loop-brace"]'),
    loopBtn: (() => { const b = [...document.querySelectorAll('button')].find((x) => /loop/i.test(x.getAttribute('title') || '') && x.hasAttribute('aria-pressed')); return b ? b.getAttribute('aria-pressed') : null; })(),
    groups: [...document.querySelectorAll('[data-group-id]')].map((g) => ({ id: g.getAttribute('data-group-id'), collapsed: g.getAttribute('data-group-collapsed') })),
    status: q('[data-testid="arrangement-status"]')?.textContent,
    waveformZoom: q('[data-testid="arrangement-waveform-zoom"]')?.value,
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
    const hit = document.elementFromPoint(x, y);
    return { x, y, hitClip: !!hit?.closest('[data-clip-id]'), hitTestid: hit?.getAttribute('data-testid') };
  }, [idx, zone]);
}
async function clickClip(page, idx = 0, mods = []) {
  const p = await clipPoint(page, idx);
  if (!p) throw new Error(`clip ${idx} not visible`);
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.click(p.x, p.y);
  for (const m of mods) await page.keyboard.up(m);
  await sleep(250);
  return p;
}
async function fit(page) {
  const b = await page.getByTestId('arrangement-ruler').boundingBox();
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  await page.mouse.dblclick(sc.x + 224 + 120, b.y + b.height / 2);
  await sleep(500);
}
async function dragBody(page, idx = 0, dx0 = 10, dx1 = 120) {
  const p = await clipPoint(page, idx, 'body');
  if (!p) throw new Error('clip body not visible');
  await page.mouse.move(p.x + dx0 - 40 > 0 ? p.x - 30 + dx0 : p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x - 30 + dx1, p.y, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
  return p;
}
async function emptyLanePoint(page, laneIdx, fracX = 0.6) {
  return page.evaluate(([li, fx]) => {
    const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]'));
    const lane = lanes[li];
    const b = lane.getBoundingClientRect();
    const y = b.top + b.height / 2;
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
    const start = sc.left + 240 + (sc.width - 260) * fx;
    for (let x = start; x < sc.right - 10; x += 6) {
      const hit = document.elementFromPoint(x, y);
      if (hit && hit.closest('[data-track-id]') === lane && !hit.closest('[data-clip-id]') && !hit.closest('button,input,select')) return { x, y, track: lane.getAttribute('data-track-id') };
    }
    return null;
  }, [laneIdx, fracX]);
}
async function dragRange(page, laneIdx, f0 = 0.3, f1 = 0.5) {
  const a = await emptyLanePoint(page, laneIdx, f0);
  const b = await emptyLanePoint(page, laneIdx, f1);
  if (!a || !b) throw new Error('no empty lane point');
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
  return { a, b };
}
async function row(id, fn) {
  try {
    R.rows[id] = await fn();
  } catch (e) {
    R.rows[id] = { error: String(e).slice(0, 400) };
  }
  save();
}

async function gTransport(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await blur(page);
  await row('play-stop', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Space');
    await sleep(1800);
    const s1 = await S(page);
    await page.keyboard.press('Space');
    await sleep(400);
    const s2 = await S(page);
    return { pos0: s0.position, playingAfterSpace: s1.playing, pos1: s1.position, stoppedAfterSecondSpace: !s2.playing, pos2: s2.position, effect: s1.playing && !s2.playing && s1.position !== s0.position };
  });
  await row('back-to-start', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Home');
    await sleep(300);
    const s1 = await S(page);
    return { before: s0.position, after: s1.position, effect: s0.position !== s1.position && /^00:00[.:]000/.test(s1.position || '') };
  });
  await row('loop', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Control+l');
    await sleep(300);
    const s1 = await S(page);
    await dragBody(page, 0, 10, 140);
    const s2 = await S(page);
    await page.keyboard.press('Control+l');
    await sleep(300);
    const s3 = await S(page);
    const ep = await emptyLanePoint(page, 3, 0.7);
    await page.mouse.click(ep.x, ep.y);
    await sleep(200);
    await blur(page);
    const s4pre = await S(page);
    await page.keyboard.press('Control+l');
    await sleep(300);
    const s4 = await S(page);
    await page.keyboard.press('Control+l');
    await sleep(300);
    const s5 = await S(page);
    return { rangeBeforeToggle: s4pre.range, loopOff: { btn: s4.loopBtn, status: s4.status }, loopOn: { btn: s5.loopBtn, status: s5.status }, effectToggle: s4.loopBtn === 'false' && s5.loopBtn === 'true', loopBtn0: s0.loopBtn, brace0: s0.loopBrace, loopBtn1: s1.loopBtn, brace1: s1.loopBrace, status1: s1.status, rangeSet: s2.range, loopBtn3: s3.loopBtn, brace3: s3.loopBrace, status3: s3.status, effect: s3.loopBtn === 'true' && !!s3.loopBrace && s4.loopBtn === 'false' && s5.loopBtn === 'true' };
  });
  await ctx.close();
}

async function gEdit(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await blur(page);
  await row('undo', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Control+z');
    await sleep(300);
    const s1 = await S(page);
    return { clips0: s0.clips.length, clips1: s1.clips.length, undo0: s0.undoTitle, effect: s1.clips.length === s0.clips.length - 1 };
  });
  await row('redo', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Control+Shift+z');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('Control+z');
    await sleep(300);
    const s2 = await S(page);
    await page.keyboard.press('Control+y');
    await sleep(300);
    const s3 = await S(page);
    return { c0: s0.clips.length, afterCtrlShiftZ: s1.clips.length, afterUndo: s2.clips.length, afterCtrlY: s3.clips.length, effect: s1.clips.length === s0.clips.length + 1 && s3.clips.length === s2.clips.length + 1 };
  });
  await fit(page);
  await row('copy-cut-paste', async () => {
    await clickClip(page, 0);
    const s0 = await S(page);
    await page.keyboard.press('Control+c');
    await sleep(200);
    await page.keyboard.press('Control+ArrowRight');
    await page.keyboard.press('Control+ArrowRight');
    await sleep(200);
    await page.keyboard.press('Control+v');
    await sleep(400);
    const s1 = await S(page);
    await page.keyboard.press('Control+x');
    await sleep(400);
    const s2 = await S(page);
    await page.keyboard.press('Control+v');
    await sleep(400);
    const s3 = await S(page);
    return { c0: s0.clips.length, afterPaste: s1.clips.length, afterCut: s2.clips.length, afterPaste2: s3.clips.length, status: s3.status, undo: s3.undoTitle, effect: s1.clips.length === s0.clips.length + 1 && s2.clips.length === s1.clips.length - 1 && s3.clips.length === s2.clips.length + 1 };
  });
  await fit(page);
  await row('duplicate', async () => {
    await clickClip(page, 0);
    const s0 = await S(page);
    await page.keyboard.press('Control+d');
    await sleep(400);
    const s1 = await S(page);
    return { c0: s0.clips.length, c1: s1.clips.length, undo: s1.undoTitle, effect: s1.clips.length === s0.clips.length + 1 };
  });
  await fit(page);
  await row('select-all', async () => {
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('Control+a');
    await sleep(300);
    const s1 = await S(page);
    return { clips: s1.clips.length, before: s0.selectedCount, after: s1.selectedCount, effect: s1.selectedCount === `${s1.clips.length} clips selected` || new RegExp(`^${s1.clips.length}`).test(s1.selectedCount || '') };
  });
  await row('add-to-selection', async () => {
    const ep = await emptyLanePoint(page, 3, 0.7);
    await page.mouse.click(ep.x, ep.y);
    await sleep(200);
    await clickClip(page, 0);
    const a = await S(page);
    await clickClip(page, 1, ['Control']);
    const b = await S(page);
    await page.mouse.click(ep.x, ep.y);
    await sleep(200);
    await clickClip(page, 0);
    await clickClip(page, 1, ['Shift']);
    const c = await S(page);
    return { single: a.selectedCount || a.selectedLine, ctrl: b.selectedCount, shift: c.selectedCount, effect: /^2/.test(b.selectedCount || '') && /^2/.test(c.selectedCount || '') };
  });
  await row('delete', async () => {
    await fit(page);
    await blur(page);
    await clickClip(page, 0);
    const s0 = await S(page);
    await page.keyboard.press('Delete');
    await sleep(300);
    const s1 = await S(page);
    await fit(page);
    await clickClip(page, 0);
    await page.keyboard.press('Backspace');
    await sleep(300);
    const s2 = await S(page);
    return { c0: s0.clips.length, afterDelete: s1.clips.length, afterBackspace: s2.clips.length, undo: s2.undoTitle, effect: s1.clips.length === s0.clips.length - 1 && s2.clips.length === s1.clips.length - 1 };
  });
  await row('rename-marker', async () => {
    await blur(page);
    await page.keyboard.press('m');
    await sleep(300);
    await page.keyboard.press('Enter');
    await sleep(300);
    const s0 = await S(page);
    const flag = page.getByTestId('arrangement-marker').first();
    await flag.focus();
    await page.keyboard.press('F2');
    await sleep(300);
    const s1 = await S(page);
    let renamed = null;
    if (s1.markerEditor) {
      await page.keyboard.press('Control+a');
      await page.keyboard.type('Hit C226');
      await page.keyboard.press('Enter');
      await sleep(300);
      renamed = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('aria-label') || m.textContent));
    }
    return { markers: s0.markers, editorAfterF2: s1.markerEditor, renamed, effect: s1.markerEditor && JSON.stringify(renamed || []).includes('Hit C226') };
  });
  await ctx.close();
}

async function gTime(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await fit(page);
  await row('split', async () => {
    const ruler = page.getByTestId('arrangement-ruler');
    const rb = await ruler.boundingBox();
    const cp = await clipPoint(page, 0);
    await page.mouse.click(cp.x + 80, rb.y + rb.height / 2);
    await sleep(300);
    await clickClip(page, 0);
    const s0 = await S(page);
    await page.keyboard.press('Control+e');
    await sleep(400);
    const s1 = await S(page);
    return { pos: s0.position, c0: s0.clips.length, c1: s1.clips.length, undo: s1.undoTitle, effect: s1.clips.length === s0.clips.length + 1 };
  });
  await row('extend-all-tracks', async () => {
    await fit(page);
    await dragBody(page, 1, 10, 120);
    const s0 = await S(page);
    await page.keyboard.press('Control+Shift+l');
    await sleep(300);
    const s1 = await S(page);
    return { range0: s0.range, allLane0: s0.allLaneRange, range1: s1.range, allLane1: s1.allLaneRange, effect: s0.range !== null && s0.allLaneRange === 0 && s1.allLaneRange > 0 };
  });
  await row('cut-time', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Control+Shift+x');
    await sleep(500);
    const s1 = await S(page);
    return { clips0: s0.clips, clips1: s1.clips, undo1: s1.undoTitle, status: s1.status, effect: /cut time/i.test(s1.undoTitle || '') && JSON.stringify(s0.clips) !== JSON.stringify(s1.clips) };
  });
  await fit(page);
  await row('nudge', async () => {
    await clickClip(page, 0);
    const focusAfterClipClick = (await S(page)).active;
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('ArrowRight');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('ArrowLeft');
    await sleep(300);
    const s2 = await S(page);
    const sel = (s) => s.clips.map((c) => c.start);
    return { focusAfterClipClick, starts0: sel(s0), starts1: sel(s1), starts2: sel(s2), effect: JSON.stringify(sel(s0)) !== JSON.stringify(sel(s1)) && JSON.stringify(sel(s0)) === JSON.stringify(sel(s2)) };
  });
  await row('edge-nav', async () => {
    await page.keyboard.press('Home');
    await sleep(200);
    const s0 = await S(page);
    await page.keyboard.press('Control+ArrowRight');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('Control+ArrowRight');
    await sleep(300);
    const s2 = await S(page);
    await page.keyboard.press('Control+ArrowLeft');
    await sleep(300);
    const s3 = await S(page);
    return { p0: s0.position, p1: s1.position, p2: s2.position, p3: s3.position, starts: s0.clips.map((c) => c.start), effect: s1.position !== s0.position && s2.position !== s1.position && s3.position === s1.position };
  });
  await row('marker', async () => {
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('m');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('Enter');
    await sleep(300);
    const s2 = await S(page);
    return { m0: s0.markers, editorAfterM: s1.markerEditor, m2: s2.markers, effect: s1.markerEditor && s2.markers === s0.markers + 1 };
  });
  await row('add-sound', async () => {
    const opt = page.locator('[role="option"]').nth(1);
    await opt.click();
    await sleep(300);
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('Enter');
    await sleep(800);
    const s1 = await S(page);
    await opt.dblclick();
    await sleep(800);
    const s2 = await S(page);
    return { c0: s0.clips.length, afterEnter: s1.clips.length, afterDblclick: s2.clips.length, effect: s1.clips.length === s0.clips.length + 1 && s2.clips.length === s1.clips.length + 1 };
  });
  await ctx.close();
}

async function gLaneLock(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await fit(page);
  await row('lane-lock+C-SLOT', async () => {
    await clickClip(page, 0);
    const s0 = await S(page);
    const p = await clipPoint(page, 0, 'title');
    const target = await emptyLanePoint(page, 2, 0.1);
    const footerH = () => page.evaluate(() => Math.round(document.querySelector('[data-testid="arrangement-status"]').closest('footer').getBoundingClientRect().height * 100) / 100);
    const slot = () => page.evaluate(() => ({ hint: document.querySelector('[data-testid="arrangement-lane-move-hint"]')?.textContent || null, sel: !!document.querySelector('[data-testid="arrangement-selected-clip"]'), refusal: document.querySelector('[data-testid="arrangement-lane-move-refusal"]')?.textContent || null }));
    const h0 = await footerH();
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 30, p.y + 10, { steps: 4 });
    await page.mouse.move(p.x + 30, target.y, { steps: 8 });
    await sleep(200);
    const dStart = { h: await footerH(), slot: await slot() };
    await page.evaluate(() => { window.__q = null; window.addEventListener('keydown', (e) => { if (e.key === '?') window.__q = { prevented: e.defaultPrevented }; }, { once: true }); });
    await page.keyboard.press('Shift+Slash');
    await sleep(200);
    dStart.questionDuringMoveDrag = { sheetOpen: await page.evaluate(() => !!document.querySelector('[role="dialog"]')), ev: await page.evaluate(() => window.__q) };
    await page.screenshot({ path: path.join(OUT, `${KEY}-drag-unlocked.png`) });
    await page.keyboard.down('Shift');
    await page.mouse.move(p.x + 35, target.y + 2, { steps: 2 });
    await sleep(200);
    const dShift = { h: await footerH(), slot: await slot() };
    await page.screenshot({ path: path.join(OUT, `${KEY}-drag-shift.png`) });
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await sleep(400);
    const dEnd = { h: await footerH(), slot: await slot() };
    const s1 = await S(page);
    return { before: s0.clips, after: s1.clips, footerH0: h0, dStart, dShift, dEnd, effect: s1.clips[0].track !== s0.clips[0].track && s1.clips[0].start === s0.clips[0].start };
  });
  await row('C-SLOT-refusal', async () => {
    await fit(page);
    const p = await clipPoint(page, 0, 'title');
    const video = await emptyLanePoint(page, 0, 0.1);
    const footerH = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').closest('footer').getBoundingClientRect().height);
    const h0 = await footerH();
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 20, p.y + 5, { steps: 4 });
    await page.mouse.move(p.x + 20, video.y, { steps: 10 });
    await sleep(250);
    const info = await page.evaluate(() => {
      const h = document.querySelector('[data-testid="arrangement-lane-move-hint"]');
      if (!h) return null;
      const r = h.getBoundingClientRect();
      return { text: h.textContent, h: r.height, w: r.width, sw: h.scrollWidth, cw: h.clientWidth, truncated: h.scrollWidth > h.clientWidth, lh: parseFloat(getComputedStyle(h).lineHeight), refusal: document.querySelector('[data-testid="arrangement-lane-move-refusal"]')?.textContent || null, sel: !!document.querySelector('[data-testid="arrangement-selected-clip"]') };
    });
    const h1 = await footerH();
    await page.screenshot({ path: path.join(OUT, `${KEY}-drag-refusal.png`) });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await sleep(300);
    return { h0, h1, info, effect: !!info && Math.abs(h1 - h0) <= 1 && !info.truncated && info.h <= 17 && info.sel === false };
  });
  await ctx.close();
}

async function gGrid(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await blur(page);
  await row('snap', async () => {
    const s0 = await S(page);
    await page.keyboard.press('g');
    await sleep(250);
    const s1 = await S(page);
    return { snap0: s0.snap, snap1: s1.snap, effect: s0.snap !== s1.snap };
  });
  await row('grid-width', async () => {
    const s0 = await S(page);
    await page.keyboard.press('1');
    await sleep(250);
    const s1 = await S(page);
    await page.keyboard.press('2');
    await sleep(250);
    await page.keyboard.press('2');
    await sleep(250);
    const s2 = await S(page);
    return { g0: s0.gridSeconds, afterNarrow: s1.gridSeconds, afterWiden2: s2.gridSeconds, status: s2.status, effect: Number(s1.gridSeconds) < Number(s0.gridSeconds) && Number(s2.gridSeconds) > Number(s1.gridSeconds) };
  });
  await row('triplet', async () => {
    const t = page.getByTestId('arrangement-tempo-input');
    await t.click();
    await t.fill('120');
    await page.keyboard.press('Enter');
    await sleep(300);
    const lp = await emptyLanePoint(page, 2, 0.5);
    await page.mouse.click(lp.x, lp.y, { button: 'right' });
    await sleep(300);
    await page.getByRole('menuitemradio', { name: '1/4', exact: true }).click();
    await sleep(300);
    await page.keyboard.press('Escape');
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('3');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('3');
    await sleep(300);
    const s2 = await S(page);
    return { g0: s0.gridSeconds, triplet: s1.gridSeconds, back: s2.gridSeconds, status: s1.status, effect: s1.gridSeconds !== s0.gridSeconds && s2.gridSeconds === s0.gridSeconds && Math.abs(Number(s1.gridSeconds) / Number(s0.gridSeconds) - 2 / 3) < 0.01 };
  });
  await row('snap-bypass', async () => {
    await fit(page);
    const snapState = (await S(page)).snap;
    if (snapState !== 'true') { await blur(page); await page.keyboard.press('g'); await sleep(200); }
    const drag = async (alt) => {
      const p = await clipPoint(page, 0, 'title');
      if (!p) throw new Error('clip title not visible');
      if (alt) await page.keyboard.down('Alt');
      await page.mouse.move(p.x, p.y);
      await page.mouse.down();
      await page.mouse.move(p.x + 13, p.y, { steps: 6 });
      await page.mouse.move(p.x + 27, p.y, { steps: 6 });
      await page.mouse.up();
      if (alt) await page.keyboard.up('Alt');
      await sleep(300);
      return (await S(page)).clips[0].start;
    };
    const s0 = (await S(page));
    const plain = await drag(false);
    await page.keyboard.press('Control+z');
    await sleep(300);
    const alt = await drag(true);
    const gs = Number(s0.gridSeconds);
    const onGrid = (v) => Math.abs(Number(v) / gs - Math.round(Number(v) / gs)) < 0.01;
    return { grid: s0.gridSeconds, snap: (await S(page)).snap, start0: s0.clips[0].start, plain, alt, plainOnGrid: onGrid(plain), altOnGrid: onGrid(alt), effect: onGrid(plain) && !onGrid(alt) };
  });
  await row('envelope', async () => {
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('a');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('a');
    await sleep(200);
    return { env0: s0.envelope, env1: s1.envelope, clipEnv: s1.clips.map((c) => c.env), editors: await page.getByTestId('arrangement-clip-envelope-editor').count(), effect: s0.envelope !== s1.envelope };
  });
  await ctx.close();
}

async function gZoom(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await blur(page);
  await row('zoom', async () => {
    const s0 = await S(page);
    await page.keyboard.press('Equal');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('Minus');
    await sleep(300);
    const s2 = await S(page);
    const sb = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    await page.mouse.move(sb.x + sb.width * 0.6, sb.y + sb.height * 0.5);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -300);
    await page.keyboard.up('Control');
    await sleep(400);
    const s3 = await S(page);
    return { z0: s0.zoom, plus: s1.zoom, minus: s2.zoom, ctrlWheel: s3.zoom, effect: s1.zoom !== s0.zoom && s2.zoom !== s1.zoom && s3.zoom !== s2.zoom };
  });
  await row('scroll', async () => {
    const s0 = await S(page);
    const sb = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    await page.mouse.move(sb.x + sb.width * 0.6, sb.y + sb.height * 0.5);
    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, 300);
    await page.keyboard.up('Shift');
    await sleep(300);
    const s1 = await S(page);
    return { sl0: s0.scrollLeft, sl1: s1.scrollLeft, effect: s1.scrollLeft > s0.scrollLeft };
  });
  await row('zoom-range', async () => {
    await fit(page);
    await dragBody(page, 0, 10, 160);
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('z');
    await sleep(400);
    const s1 = await S(page);
    await page.keyboard.press('x');
    await sleep(400);
    const s2 = await S(page);
    return { range: s0.range, z0: s0.zoom, zRange: s1.zoom, zBack: s2.zoom, effect: s1.zoom !== s0.zoom && s2.zoom === s0.zoom };
  });
  await row('fit', async () => {
    const ep = await emptyLanePoint(page, 3, 0.7);
    await page.mouse.click(ep.x, ep.y);
    await sleep(200);
    await blur(page);
    await page.keyboard.press('Equal'); await page.keyboard.press('Equal'); await sleep(300);
    const s0 = await S(page);
    await fit(page);
    const s1 = await S(page);
    await blur(page);
    await page.keyboard.press('Equal'); await page.keyboard.press('Equal'); await sleep(300);
    const s2 = await S(page);
    const ob = await page.getByTestId('arrangement-overview').boundingBox();
    await page.mouse.dblclick(ob.x + ob.width * 0.5, ob.y + ob.height * 0.6);
    await sleep(500);
    const s3 = await S(page);
    return { range0: s0.range, statusRulerFit: s1.status, statusOverviewFit: s3.status, zoomed: s0.zoom, rulerFit: s1.zoom, zoomed2: s2.zoom, overviewFit: s3.zoom, effect: s1.zoom !== s0.zoom && s3.zoom === s1.zoom && s2.zoom !== s1.zoom };
  });
  await row('overview-scroll', async () => {
    await blur(page);
    for (let i = 0; i < 4; i += 1) { await page.keyboard.press('Equal'); }
    await sleep(300);
    await page.getByTestId('arrangement-overview').focus();
    const s0 = await S(page);
    const pps = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
    await page.keyboard.press('ArrowRight');
    await sleep(400);
    const s1 = await S(page);
    await page.keyboard.press('ArrowLeft');
    await sleep(400);
    const s2 = await S(page);
    return { zoom: pps, sl0: s0.scrollLeft, sl1: s1.scrollLeft, sl2: s2.scrollLeft, active: s0.active, effect: s1.scrollLeft > s0.scrollLeft && s2.scrollLeft < s1.scrollLeft };
  });
  await row('waveform-zoom', async () => {
    const sel = page.getByTestId('arrangement-waveform-zoom');
    const info = await sel.evaluate((e) => ({ tag: e.tagName, role: e.getAttribute('role'), label: e.getAttribute('aria-label'), options: [...e.options].map((o) => o.textContent), value: e.value, visibleText: e.selectedOptions[0]?.textContent }));
    const wf0 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-clip-waveform"]')?.outerHTML.length);
    await sel.selectOption({ index: 2 });
    await sleep(400);
    const s1 = await S(page);
    const wf1 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-clip-waveform"]')?.outerHTML.length);
    return { info, after: s1.waveformZoom, status: s1.status, undo: s1.undoTitle, wf0, wf1, effect: s1.waveformZoom !== info.value };
  });
  await ctx.close();
}

async function gTracks(browser) {
  const { ctx, page } = await fresh(browser);
  await addClip(page);
  await row('group', async () => {
    await page.getByRole('button', { name: /^Music — set as the active track/ }).click();
    await page.keyboard.down('Control');
    await page.getByRole('button', { name: /^Stems — set as the active track/ }).click();
    await page.keyboard.up('Control');
    await sleep(200);
    await blur(page);
    const s0 = await S(page);
    await page.keyboard.press('Control+g');
    await sleep(400);
    const s1 = await S(page);
    await blur(page);
    await page.keyboard.press('Control+Shift+g');
    await sleep(400);
    const s2 = await S(page);
    await page.keyboard.press('Control+z');
    await sleep(400);
    const s3 = await S(page);
    return { g0: s0.groups.length, afterCtrlG: s1.groups.length, status1: s1.status, afterCtrlShiftG: s2.groups.length, afterUndo: s3.groups.length, effect: s1.groups.length === s0.groups.length + 1 && s2.groups.length === s0.groups.length };
  });
  await row('fold', async () => {
    await page.getByRole('button', { name: /^Group 1 — group/ }).first().click();
    await sleep(200);
    const s0 = await S(page);
    await page.keyboard.press('u');
    await sleep(300);
    const s1 = await S(page);
    await page.keyboard.press('u');
    await sleep(300);
    const s2 = await S(page);
    return { g0: s0.groups, g1: s1.groups, g2: s2.groups, effect: s0.groups.length > 0 && s1.groups[0]?.collapsed !== s0.groups[0]?.collapsed && s2.groups[0]?.collapsed === s0.groups[0]?.collapsed };
  });
  await row('rename-group', async () => {
    const nameBtn = page.locator('[data-group-id] button').filter({ hasNotText: '' }).first();
    const groupName = await page.evaluate(() => {
      const g = document.querySelector('[data-group-id]');
      return [...g.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')).filter(Boolean);
    });
    const target = page.getByRole('button', { name: /^Group 1 — group/ }).first();
    await target.focus();
    const focused = await page.evaluate(() => document.activeElement.getAttribute('aria-label'));
    await page.keyboard.press('F2');
    await sleep(300);
    const editor = await page.evaluate(() => { const i = document.querySelector('[data-group-id] input[type="text"], [data-group-id] input:not([type])'); return i ? { value: i.value, focused: document.activeElement === i } : null; });
    let renamed = null;
    if (editor) {
      await page.keyboard.press('Control+a');
      await page.keyboard.type('Bus C226');
      await page.keyboard.press('Enter');
      await sleep(300);
      renamed = await page.evaluate(() => document.querySelector('[data-group-id]').textContent.slice(0, 80));
    }
    return { buttons: groupName, focused, editor, renamed, effect: !!editor && /Bus C226/.test(renamed || '') };
  });
  await row('solo-add', async () => {
    const s1 = page.getByRole('button', { name: /^Solo — Music/ });
    const s2 = page.getByRole('button', { name: /^Solo — SFX/ });
    await s1.click();
    await sleep(200);
    await s2.click({ modifiers: ['Control'] });
    await sleep(200);
    const st = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^Solo — /.test(b.getAttribute('aria-label') || '')).map((b) => [b.getAttribute('aria-label').slice(0, 20), b.getAttribute('aria-pressed')]));
    await s2.click();
    await sleep(200);
    const plain = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^Solo — /.test(b.getAttribute('aria-label') || '')).map((b) => [b.getAttribute('aria-label').slice(0, 20), b.getAttribute('aria-pressed')]));
    return { afterCtrlClick: st, afterPlainClick: plain, effect: st.filter(([, p]) => p === 'true').length === 2 && plain.filter(([, p]) => p === 'true').length === 1 };
  });
  const vol = page.locator('input[aria-label^="Volume — SFX"]');
  const val = () => vol.evaluate((e) => Number(e.value));
  await row('fader-step', async () => {
    await vol.focus();
    const v0 = await val();
    await page.keyboard.press('ArrowDown');
    await sleep(150);
    const v1 = await val();
    await page.keyboard.press('ArrowUp');
    await sleep(150);
    const v2 = await val();
    return { v0, v1, v2, effect: Math.abs(v1 - v0 + 0.1) < 1e-6 && Math.abs(v2 - v0) < 1e-6 };
  });
  await row('fader-page', async () => {
    const v0 = await val();
    await page.keyboard.press('PageDown');
    await sleep(150);
    const v1 = await val();
    await page.keyboard.press('PageUp');
    await sleep(150);
    const v2 = await val();
    const attrs = await vol.evaluate((e) => ({ min: e.min, max: e.max, step: e.step }));
    return { attrs, v0, v1, v2, effect: v0 - v1 > 1 && Math.abs(v2 - v0) < 1e-6 };
  });
  await row('fader-fine', async () => {
    const b = await vol.boundingBox();
    const horizontal = b.width > b.height;
    const v0 = await val();
    const drag = async (shift, dist) => {
      const thumb = await vol.evaluate((e) => { const r = e.getBoundingClientRect(); const f = (Number(e.value) - Number(e.min)) / (Number(e.max) - Number(e.min)); return { x: r.left + r.width * f, y: r.top + r.height / 2, h: r.height, w: r.width }; });
      const sx = horizontal ? Math.min(Math.max(thumb.x, b.x + 6), b.x + b.width - 6) : b.x + b.width / 2;
      const sy = horizontal ? b.y + b.height / 2 : thumb.y;
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      if (shift) await page.keyboard.down('Shift');
      await page.mouse.move(horizontal ? sx - dist : sx, horizontal ? sy : sy + dist, { steps: 8 });
      await page.mouse.up();
      if (shift) await page.keyboard.up('Shift');
      await sleep(200);
      return val();
    };
    const afterPlain = await drag(false, 20);
    const d1 = afterPlain - v0;
    await page.keyboard.press('Control+z'); await sleep(200);
    const vMid = await val();
    const afterShift = await drag(true, 20);
    const d2 = afterShift - vMid;
    return { horizontal, box: b, v0, afterPlain, vMid, afterShift, plainDelta: d1, shiftDelta: d2, ratio: d2 !== 0 ? d1 / d2 : null, effect: Math.abs(d2) > 0 && Math.abs(d1) > Math.abs(d2) * 3 };
  });
  await row('fader-reset', async () => {
    await vol.focus();
    await page.keyboard.press('PageDown');
    await sleep(150);
    const v0 = await val();
    const b = await vol.boundingBox();
    await page.mouse.dblclick(b.x + b.width / 2, b.y + b.height / 2);
    await sleep(300);
    const v1 = await val();
    return { v0, v1, effect: v0 !== 0 && v1 === 0 };
  });
  await ctx.close();
}

async function gLibrary(browser) {
  const { ctx, page } = await fresh(browser);
  const search = page.getByTestId('arrangement-library-search');
  const activeOpt = () => page.evaluate(() => ({ active: document.activeElement?.getAttribute('data-source-id') || document.activeElement?.getAttribute('data-testid'), selected: document.querySelector('[role="option"][aria-selected="true"]')?.getAttribute('data-source-id') }));
  await row('library-results', async () => {
    await search.click();
    const a0 = await activeOpt();
    await page.keyboard.press('ArrowDown');
    await sleep(250);
    const a1 = await activeOpt();
    await page.keyboard.press('ArrowDown');
    await sleep(250);
    const a2 = await activeOpt();
    await page.keyboard.press('ArrowUp');
    await sleep(250);
    const a3 = await activeOpt();
    return { a0, a1, a2, a3, effect: a1.active && a1.active !== 'arrangement-library-search' && a2.active !== a1.active && a3.active === a1.active };
  });
  await row('library-add', async () => {
    const c0 = await page.locator('[data-clip-kind="audio"]').count();
    await page.keyboard.press('Enter');
    await sleep(1000);
    const c1 = await page.locator('[data-clip-kind="audio"]').count();
    return { c0, c1, effect: c1 === c0 + 1 };
  });
  await row('library-clear', async () => {
    await search.click();
    await page.keyboard.type('zz');
    const v0 = await search.inputValue();
    await page.keyboard.press('Escape');
    await sleep(200);
    return { v0, v1: await search.inputValue(), effect: v0 === 'zz' && (await search.inputValue()) === '' };
  });
  await row('library-preview', async () => {
    await page.locator('[role="option"]').first().click();
    await sleep(600);
    const wave = page.getByTestId('arrangement-library-preview-wave');
    const st = () => page.evaluate(() => ({ now: document.querySelector('[data-testid="arrangement-library-preview-wave"]')?.getAttribute('aria-valuenow'), toggle: document.querySelector('[data-testid="arrangement-library-preview-toggle"]')?.textContent, playhead: document.querySelector('[data-testid="arrangement-library-playhead"]')?.getAttribute('style') }));
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-library-preview-wave"]')?.getAttribute('aria-disabled') !== 'true', undefined, { timeout: 20000 }).catch(() => null);
    const s0 = await st();
    const wb = await wave.boundingBox();
    await page.mouse.click(wb.x + wb.width * 0.5, wb.y + wb.height / 2);
    await sleep(1200);
    const s1 = await st();
    await page.keyboard.press('Space');
    await sleep(800);
    const s2 = await st();
    await sleep(800);
    const s3 = await st();
    await page.keyboard.press('Space');
    await sleep(800);
    const s4 = await st();
    await sleep(800);
    const s5 = await st();
    return { effect: s1.toggle === 'Stop' && Number(s1.now) > 0 && s2.toggle === 'Preview' && s4.toggle === 'Stop', s0, s1, s2, s3, s4, s5, active: (await S(page)).active, studioPlaying: (await S(page)).playing };
  });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  const fns = { transport: gTransport, edit: gEdit, time: gTime, lanelock: gLaneLock, grid: gGrid, zoom: gZoom, tracks: gTracks, library: gLibrary };
  const which = process.argv[4] ? process.argv[4].split(',') : Object.keys(fns);
  for (const w of which) {
    try { await fns[w](browser); } catch (e) { R.rows[`group-${w}`] = { error: String(e).slice(0, 400) }; save(); }
  }
  R.finished = new Date().toISOString();
  save();
  await browser.close();
})();
