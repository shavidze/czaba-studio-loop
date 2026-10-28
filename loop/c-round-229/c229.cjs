// C round 229: CALM-2a real Chromium rows. usage: node c229.cjs <W> <H>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.env.LAB_URL || 'http://127.0.0.1:5173/studio-lab';
const W = Number(process.argv[2]);
const H = Number(process.argv[3]);
const KEY = `${W}x${H}${process.env.TAG || ''}`;
const OUT = path.join(__dirname, 'out');
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/';
fs.mkdirSync(OUT, { recursive: true });
const R = { viewport: KEY, base: BASE, started: new Date().toISOString(), rows: {}, pageErrors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(OUT, `c229-${KEY}.json`), JSON.stringify(R, null, 1));
const shot = (page, name, clip) => page.screenshot({ path: path.join(OUT, `${KEY}-${name}.png`), ...(clip ? { clip } : {}) });
async function row(id, fn) {
  try { R.rows[id] = await fn(); } catch (e) { R.rows[id] = { error: String(e).slice(0, 500) }; }
  save();
}
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
  await sleep(600);
}
const loopBtn = (page) => page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { title: b.getAttribute('title'), disabled: b.disabled, pressed: b.getAttribute('aria-pressed'), aks: b.getAttribute('aria-keyshortcuts'), text: b.textContent.trim(), box: { x: r.x, y: r.y, w: r.width, h: r.height } };
});
const state = (page) => page.evaluate(() => {
  const t = (id) => document.querySelector(`[data-testid="${id}"]`);
  const split = [...document.querySelectorAll('button')].find((b) => /^Split /.test(b.getAttribute('title') || ''));
  const brace = t('arrangement-loop-brace');
  return {
    range: t('arrangement-range')?.textContent || null,
    rangeEls: document.querySelectorAll('[data-testid="arrangement-range"]').length,
    splitTitle: split?.getAttribute('title') || null,
    brace: brace ? { enabled: brace.getAttribute('data-loop-enabled'), aria: brace.getAttribute('aria-label'), left: brace.style.left, width: brace.style.width } : null,
    loopStripText: t('arrangement-loop-strip')?.textContent ?? null,
    barsText: t('arrangement-bars-ruler')?.textContent ?? null,
    status: t('arrangement-status')?.textContent || null,
  };
});
async function clipPoint(page, idx = 0, zone = 'body') {
  return page.evaluate(([i, zn]) => {
    const c = [...document.querySelectorAll('[data-clip-kind="audio"]')][i];
    if (!c) return null;
    const r = c.getBoundingClientRect();
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
    const left = Math.max(r.left, sc.left + 224 + 4);
    const right = Math.min(r.right, sc.right - 14);
    const x = left + Math.min(40, (right - left) / 2);
    const y = zn === 'title' ? r.top + 10 : r.top + r.height * 0.65;
    return { x, y };
  }, [idx, zone]);
}
async function timeSelect(page) {
  const p = await clipPoint(page, 0, 'body');
  await page.mouse.move(p.x - 10, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y, { steps: 8 });
  await page.mouse.up();
  await sleep(400);
}
const dock = (page) => page.evaluate(() => {
  const t = (id) => document.querySelector(`[data-testid="${id}"]`);
  const cap = t('arrangement-video-caption');
  const rowEl = cap?.parentElement;
  const box = t('arrangement-video-box');
  const empty = t('arrangement-video-empty');
  const bx = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
  const vids = [...(box?.querySelectorAll('video') || [])].map((v) => ({ aria: v.getAttribute('aria-label'), rs: v.readyState, vw: v.videoWidth, vh: v.videoHeight, t: +v.currentTime.toFixed(3), hidden: getComputedStyle(v).visibility, op: getComputedStyle(v).opacity, box: bx(v) }));
  const gap = t('arrangement-video-gap');
  return {
    captionText: cap ? cap.textContent : null, captionPrev: cap ? !!cap.previousElementSibling : null, captionBox: bx(cap),
    rowH: rowEl ? rowEl.getBoundingClientRect().height : null, rowText: rowEl ? rowEl.textContent : null,
    boxBox: bx(box), boxText: box ? box.innerText : null,
    empty: empty ? { text: empty.textContent, tag: empty.tagName, box: bx(empty), bg: getComputedStyle(empty).backgroundColor, z: getComputedStyle(empty).zIndex } : null,
    videos: vids, gap: gap ? { text: gap.textContent, visible: gap.getBoundingClientRect().height > 0 } : null,
    overview: bx(t('arrangement-overview')), dockBox: bx(t('arrangement-video-dock')),
    placeholder: t('arrangement-video-placeholder')?.textContent || null,
  };
});
const trackCtl = (page, id) => page.evaluate((tid) => {
  const lane = document.querySelector(`[data-track-id="${tid}"]`);
  if (!lane) return null;
  const hdr = lane.querySelector('[data-testid="arrangement-track-header"]') || lane;
  const btns = [...hdr.querySelectorAll('button')];
  const mute = btns.find((b) => /^Mute/.test(b.getAttribute('aria-label') || ''));
  const solo = btns.find((b) => /^Solo/.test(b.getAttribute('aria-label') || ''));
  const vol = [...hdr.querySelectorAll('[role="slider"], input[type="range"]')].find((s) => /^Volume/.test(s.getAttribute('aria-label') || ''));
  const sep = lane.querySelector('[data-testid="arrangement-track-height"]');
  const hb = hdr.getBoundingClientRect();
  const osEl = [...hdr.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Original sound');
  const a = (e) => e && { aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), hasTitle: e.hasAttribute('title'), text: e.textContent.trim(), tag: e.tagName };
  return {
    mute: a(mute), solo: a(solo), volume: a(vol),
    volumeTitleNearest: vol ? (vol.closest('[title]') ? vol.closest('[title]').getAttribute('title') : null) : null,
    height: sep ? { now: sep.getAttribute('aria-valuenow'), min: sep.getAttribute('aria-valuemin'), text: sep.getAttribute('aria-valuetext') } : null,
    headerBox: { y: hb.y, h: hb.height, w: hb.width },
    originalSoundVisible: osEl ? osEl.getBoundingClientRect().height > 0 : false,
    density: lane.getAttribute('data-density') || hdr.getAttribute('data-density') || null,
  };
}, id);

async function main(browser) {
  // ---------- S0 ----------
  let { ctx, page } = await fresh(browser);
  await page.mouse.click(5, 5);
  await sleep(300);
  await row('S0-loop', () => loopBtn(page));
  await row('S0-state', () => state(page));
  await row('S0-dock', () => dock(page));
  await row('S0-facts', () => page.evaluate(() => {
    const t = (id) => document.querySelector(`[data-testid="${id}"]`);
    const ov = t('arrangement-overview');
    const bpm = t('arrangement-tempo-input');
    const met = t('arrangement-metronome-toggle');
    return { bpmTitle: bpm?.getAttribute('title'), bpmValue: bpm?.value, bpmAria: bpm?.getAttribute('aria-label'), metronomeDisabled: met ? met.disabled : null, overviewAria: ov?.getAttribute('aria-label'), overviewTitle: ov?.getAttribute('title') };
  }));
  await row('S0-video-titles', async () => ({ video: await trackCtl(page, 'video'), music: await trackCtl(page, 'music') }));
  {
    const d = R.rows['S0-dock'];
    if (d && d.boxBox) await shot(page, 'S0-monitor-crop', { x: Math.max(0, d.boxBox.x - 8), y: Math.max(0, d.boxBox.y - 24), width: d.boxBox.w + 16, height: d.boxBox.h + 32 });
  }
  await row('S0-hover-loop', async () => {
    const b = R.rows['S0-loop'].box;
    await page.mouse.move(b.x + b.w / 2, b.y + b.h / 2, { steps: 5 });
    await sleep(1800);
    await shot(page, 'S0-loop-hover');
    return { hovered: b, note: 'native title tooltip may not paint headless; see screenshot' };
  });
  // video lane height: drag to its smallest unfolded size
  await row('VIDEO-SMALL', async () => {
    const before = await trackCtl(page, 'video');
    const sep = page.locator('[data-track-id="video"] [data-testid="arrangement-track-height"]').first();
    const bb = await sep.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + bb.width / 2, bb.y - 400, { steps: 12 });
    await page.mouse.up();
    await sleep(500);
    const after = await trackCtl(page, 'video');
    await shot(page, 'S0-video-small');
    const music = await trackCtl(page, 'music');
    return { before, after, music };
  });
  // tempo neighbour + facts
  await row('TEMPO', async () => {
    const inp = page.getByTestId('arrangement-tempo-input');
    const r = {};
    r.metronomeBefore = await page.getByTestId('arrangement-metronome-toggle').isDisabled();
    await inp.click();
    await inp.fill('120');
    await inp.press('Enter');
    await sleep(500);
    r.afterSet = await state(page);
    r.value = await inp.inputValue();
    r.marks = await page.locator('[data-testid="arrangement-bars-mark"]').count();
    r.metronomeAfter = await page.getByTestId('arrangement-metronome-toggle').isDisabled();
    await inp.click();
    await inp.fill('99');
    await inp.press('Escape');
    await sleep(300);
    r.afterEsc = await inp.inputValue();
    await inp.click();
    await inp.fill('');
    await inp.press('Enter');
    await sleep(500);
    r.afterClear = await state(page);
    r.valueClear = await inp.inputValue();
    r.marksClear = await page.locator('[data-testid="arrangement-bars-mark"]').count();
    r.metronomeClear = await page.getByTestId('arrangement-metronome-toggle').isDisabled();
    await blur(page);
    return r;
  });
  await ctx.close();

  // ---------- S1 / S2 / S3 ----------
  ({ ctx, page } = await fresh(browser));
  await addClip(page);
  await page.mouse.click(5, 5);
  await sleep(300);
  await row('S1-loop', () => loopBtn(page));
  await row('S1-state', () => state(page));
  await row('S1-dock', () => dock(page));
  await timeSelect(page);
  await row('S2-loop', () => loopBtn(page));
  await row('S2-state', () => state(page));
  await blur(page);
  await row('S2-ctrlL', async () => {
    const before = await loopBtn(page);
    await page.keyboard.press('Control+l');
    await sleep(500);
    return { before, after: await loopBtn(page), state: await state(page) };
  });
  await shot(page, 'S2-loop-on');
  await row('S3', async () => {
    const tries = [];
    for (const how of ['scroller-focus', 'blur-body', 'workspace-click', 'empty-lane-click']) {
      if (how === 'empty-lane-click') { const pt = await page.evaluate(() => { const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]') && l.getAttribute('data-track-id') !== 'music' && l.getAttribute('data-track-id') !== 'video'); for (const lane of lanes) { const b = lane.getBoundingClientRect(); const y = b.top + b.height / 2; for (let x = window.innerWidth * 0.6; x < Math.min(b.right, window.innerWidth) - 10; x += 8) { const h = document.elementFromPoint(x, y); if (h && h.closest('[data-track-id]') === lane && !h.closest('[data-clip-id]') && !h.closest('button, input, [role=slider]')) return { x, y, id: lane.getAttribute('data-track-id') }; } } return null; }); if (pt) { await page.mouse.click(pt.x, pt.y); await sleep(300); await page.mouse.click(5, 5); } }
      if (how === 'scroller-focus') await page.locator('[data-testid="arrangement-timeline-scroller"]').focus().catch(() => {});
      if (how === 'blur-body') await blur(page);
      if (how === 'workspace-click') { const ws = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]').getBoundingClientRect(); return { x: s.x + s.width - 20, y: s.y + s.height / 2 }; }); await page.mouse.click(ws.x, ws.y); }
      const focus0 = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName);
      if (how !== 'empty-lane-click') await page.keyboard.press('Escape');
      await sleep(400);
      const st = await state(page);
      tries.push({ how, focus0, rangeEls: st.rangeEls });
      if (st.rangeEls === 0) break;
    }
    return { tries, loop: await loopBtn(page), state: await state(page) };
  });
  await shot(page, 'S3');
  await row('BRACE-KEYS', async () => {
    const brace = page.getByTestId('arrangement-loop-brace');
    await brace.focus();
    const a0 = await state(page);
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    await page.keyboard.press('ArrowRight');
    await sleep(300);
    const a1 = await state(page);
    await page.keyboard.press('Shift+ArrowRight');
    await sleep(300);
    const a2 = await state(page);
    await blur(page);
    return { focused, before: a0.brace, afterRight: a1.brace, afterShiftRight: a2.brace };
  });
  // Overview neighbour (needs wide timeline)
  await row('OVERVIEW', async () => {
    const sc = page.getByTestId('arrangement-timeline-scroller');
    const m = () => page.evaluate(() => {
      const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
      return { sl: Math.round(s.scrollLeft), sw: s.scrollWidth, cw: s.clientWidth, zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent };
    });
    await page.keyboard.press('Home');
    await sleep(300);
    const ov = await page.getByTestId('arrangement-overview').boundingBox();
    const m0 = await m();
    await page.mouse.click(ov.x + ov.width * 0.7, ov.y + ov.height / 2);
    await sleep(500);
    const mClick = await m();
    await page.mouse.move(ov.x + ov.width * 0.7, ov.y + ov.height / 2);
    await page.mouse.down();
    await page.mouse.move(ov.x + ov.width * 0.4, ov.y + ov.height / 2, { steps: 10 });
    await page.mouse.up();
    await sleep(500);
    const mDrag = await m();
    await page.mouse.dblclick(ov.x + ov.width * 0.5, ov.y + ov.height / 2);
    await sleep(700);
    const mDbl = await m();
    void sc;
    return { ov, m0, mClick, mDrag, mDbl };
  });
  await ctx.close();

  // ---------- SV ----------
  ({ ctx, page } = await fresh(browser));
  await addClip(page);
  await page.mouse.click(5, 5);
  await sleep(300);
  await row('SV', async () => {
    await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA + 'beeps-6s-vp9-opus.webm');
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
    await sleep(2500);
    await page.keyboard.press('Home');
    await sleep(300);
    await page.mouse.click(5, 5);
    // seek to 2 s so a frame is drawn
    const g = await page.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, rt: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(), pps: +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1] }));
    await page.mouse.click(g.rl + 2 * g.pps, g.rt.top + g.rt.height / 2);
    await sleep(1200);
    await blur(page);
    const atClip = await dock(page);
    const vclips = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ start: e.getAttribute('data-clip-start'), w: e.getBoundingClientRect().width, text: e.textContent.trim().slice(0, 60) })));
    await shot(page, 'SV-at-clip');
    if (atClip.boxBox) await shot(page, 'SV-monitor-crop', { x: Math.max(0, atClip.boxBox.x - 8), y: Math.max(0, atClip.boxBox.y - 24), width: atClip.boxBox.w + 16, height: atClip.boxBox.h + 32 });
    // frame pixels: sample canvas-free via screenshot of the box
    await page.mouse.click(g.rl + 10 * g.pps, g.rt.top + g.rt.height / 2);
    await sleep(1000);
    await blur(page);
    const inGap = await dock(page);
    await shot(page, 'SV-gap');
    if (inGap.boxBox) await shot(page, 'SV-gap-crop', { x: Math.max(0, inGap.boxBox.x - 8), y: Math.max(0, inGap.boxBox.y - 24), width: inGap.boxBox.w + 16, height: inGap.boxBox.h + 32 });
    const pos = await page.evaluate(() => document.querySelector('[data-testid=arrangement-playhead-handle]')?.getAttribute('aria-valuenow'));
    return { atClip, inGap, vclips, posAfterGapSeek: pos };
  });
  await row('SV-titles', async () => ({ video: await trackCtl(page, 'video') }));
  await row('SV-float', async () => {
    const g = await page.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, rt: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(), pps: +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1] }));
    await page.mouse.click(g.rl + 2 * g.pps, g.rt.top + g.rt.height / 2);
    await sleep(800);
    const r = {};
    await page.getByTestId('arrangement-video-expand').click();
    await sleep(800);
    r.expanded = await dock(page);
    r.dragBtn = await page.getByTestId('arrangement-video-drag').count();
    r.closeBtn = await page.getByTestId('arrangement-video-close').count();
    await shot(page, 'SV-floating');
    const drag = page.getByTestId('arrangement-video-drag');
    if (await drag.count()) {
      const b0 = await page.getByTestId('arrangement-video-box').boundingBox();
      const db = await drag.boundingBox();
      await page.mouse.move(db.x + db.width / 2, db.y + db.height / 2);
      await page.mouse.down();
      await page.mouse.move(db.x - 120, db.y + 80, { steps: 10 });
      await page.mouse.up();
      await sleep(500);
      const b1 = await page.getByTestId('arrangement-video-box').boundingBox();
      r.dragMoved = { b0, b1 };
    }
    const ret = page.getByTestId('arrangement-video-placeholder-return');
    r.returnCount = await ret.count();
    if (r.returnCount) { await ret.click(); await sleep(700); }
    r.afterReturn = await dock(page);
    await page.getByTestId('arrangement-video-expand').click();
    await sleep(700);
    const cl = page.getByTestId('arrangement-video-close');
    r.close2 = await cl.count();
    if (r.close2) { await cl.click(); await sleep(700); }
    r.afterClose = await dock(page);
    return r;
  });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try { await main(browser); } catch (e) { R.fatal = String(e).slice(0, 500); } finally {
    R.finished = new Date().toISOString();
    save();
    await browser.close();
  }
})();
