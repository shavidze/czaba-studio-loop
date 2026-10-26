// A round 198 live proof for R91 (keyboard-gated focus reveal). Based on B's b-round-197/probe-scroll-margin.cjs, mode "none" against the real tree.
// Usage: node probe-a198.cjs <1280|1440> <rich|default>
const fs = require('fs');
const path = require('path');
const L = require('./lib-b197.cjs');
const { decode } = require('./png.cjs');
const W = +(process.argv[2] || 1280);
const SCENE = process.argv[3] || 'rich';
const SC = '[data-testid=arrangement-timeline-scroller]';
const st = (page) => page.evaluate((s) => document.querySelector(s).scrollTop, SC);
const sl = (page) => page.evaluate((s) => document.querySelector(s).scrollLeft, SC);
const toBottom = (page) => page.evaluate((s) => { const sc = document.querySelector(s); sc.scrollTop = sc.scrollHeight; return sc.scrollTop; }, SC);

async function ringChanged(page, box) {
  const clip = { x: Math.max(0, box.x - 4), y: Math.max(0, box.y - 4), width: box.w + 8, height: box.h + 8 };
  const f = decode(await page.screenshot({ clip }));
  await page.evaluate(() => { window.__a198 = document.activeElement; document.activeElement.blur(); });
  await L.sleep(60);
  const u = decode(await page.screenshot({ clip }));
  await page.evaluate(() => { const el = window.__a198; if (el) el.focus({ preventScroll: true }); });
  await L.sleep(40);
  let changed = 0, topBand = 0;
  const band = Math.min(box.y, 4) * 2;
  for (let y = 0; y < Math.min(f.h, u.h); y++) for (let x = 0; x < Math.min(f.w, u.w); x++) {
    const a = f.px(x, y), b = u.px(x, y);
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 24) { changed++; if (y < band) topBand++; }
  }
  ringChanged.lastTopBand = topBand;
  return changed;
}

(async () => {
  const { browser, page, log, H } = await L.openStudio(W);
  const load = await page.evaluate((s) => { const sc = document.querySelector(s); return { scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft }; }, SC);
  const servedR91 = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const c = document.querySelector('[data-testid=arrangement-timeline-chrome]');
    return c !== null && sc.firstElementChild.firstElementChild === c;
  });
  if (SCENE === 'rich') await L.richScene(page, H);
  const out = { W, SCENE, load, servedR91, ua: await page.evaluate(() => navigator.userAgent) };
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const fwd = []; let first = null;
  for (let i = 0; i < 220; i++) {
    await page.keyboard.press('Tab'); await L.sleep(80);
    const d = await L.focusInfo(page);
    if (!d) { fwd.push({ i, body: true }); continue; }
    const key = `${d.label}|${Math.round(d.box.x)}|${d.testid}`;
    if (first && key === first && i > 3) break;
    if (!first) first = key;
    if (d.inScroller) { d.ringChanged = await ringChanged(page, d.box); d.topBandChanged = ringChanged.lastTopBand; d.outlineOffset = await page.evaluate(() => getComputedStyle(document.activeElement).outlineOffset); }
    fwd.push({ i, ...d });
  }
  const back = [];
  for (let i = 0; i < fwd.length; i++) { await page.keyboard.press('Shift+Tab'); await L.sleep(80); const d = await L.focusInfo(page); back.push(d ? { i, ...d } : { i, body: true }); }
  out.stops = fwd.length;
  out.scrollerStops = fwd.filter((x) => x.inScroller).length;
  out.hiddenF = fwd.filter((x) => x.hidden).map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}<${x.chromeBottom.toFixed(1)}`);
  out.hiddenB = back.filter((x) => x.hidden).map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}`);
  out.noRingF = fwd.filter((x) => x.inScroller && !(x.ringChanged > 0)).map((x) => `${x.i}:${x.label}`);
  out.scrollLeftValues = [...new Set(fwd.filter((x) => !x.body).map((x) => x.scrollLeft))];
  out.scrollTopSeq = fwd.filter((x) => !x.body).map((x) => x.scrollTop);
  if (SCENE === 'rich') {
    out.maxA = await toBottom(page); await L.sleep(200);
    const h = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-playhead-handle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(h.x, h.y); await page.mouse.down(); await L.sleep(100); out.playheadDown = await st(page);
    await page.mouse.move(h.x + 40, h.y, { steps: 5 }); out.playheadDrag = await st(page); await page.mouse.up(); await L.sleep(200);
    out.maxB = await toBottom(page);
    await page.evaluate(() => { document.documentElement.dataset.focusSource = 'keyboard'; document.querySelector('[data-testid=arrangement-marker]').focus(); }); await L.sleep(150); out.flagFocusKeyboardSource = await st(page);
    out.maxC = await toBottom(page);
    await page.keyboard.press('F2'); await L.sleep(400); out.f2 = await st(page); await page.keyboard.press('Escape'); await L.sleep(200);
    out.maxD = await toBottom(page); await L.sleep(200);
    await page.evaluate(() => { document.documentElement.dataset.focusSource = 'keyboard'; document.querySelector('[data-testid=arrangement-marker]').focus(); }); await L.sleep(150);
    await page.keyboard.press('Shift+F10'); await L.sleep(400);
    out.menuShiftF10 = await page.evaluate((s) => { const m = document.querySelector('[data-testid=arrangement-marker-menu]'); return { scrollTop: document.querySelector(s).scrollTop, menuOpen: !!m, focusInMenu: !!m && m.contains(document.activeElement), src: document.documentElement.dataset.focusSource }; }, SC);
    await page.keyboard.press('ArrowDown'); await L.sleep(150); out.menuArrowDown = await st(page);
    await page.keyboard.press('Escape'); await L.sleep(300); out.menuEscape = await st(page);
    out.maxD2 = await toBottom(page); await L.sleep(200);
    const snap = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-snap-toggle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.click(snap.x, snap.y); await L.sleep(200); out.snapClick = await st(page); await page.mouse.click(snap.x, snap.y); await L.sleep(200);
    out.maxE = await toBottom(page); await L.sleep(200);
    const target = await page.evaluate((s) => { const sc = document.querySelector(s); const c = sc.firstElementChild.firstElementChild.getBoundingClientRect(); const r0 = sc.getBoundingClientRect(); const ms = [...sc.querySelectorAll('button[aria-label^="Mute — "]')].map((e) => e.getBoundingClientRect()).filter((r) => r.top >= c.bottom && r.bottom <= r0.bottom); const r = ms[ms.length - 1]; return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }, SC);
    if (target) { const b = await st(page); await page.mouse.click(target.x, target.y); await L.sleep(250); await page.mouse.click(target.x, target.y); await L.sleep(250); out.muteClick = `${b}->${await st(page)}`; }
    out.maxF = await toBottom(page); await L.sleep(200);
    const partial = await page.evaluate((s) => {
      const sc = document.querySelector(s); const chrome = sc.firstElementChild.firstElementChild;
      const cb = chrome.getBoundingClientRect().bottom;
      const cands = [...sc.querySelectorAll('button')].filter((b) => !chrome.contains(b) && b.getClientRects().length && b.getBoundingClientRect().height >= 14);
      for (const b of cands) { const r = b.getBoundingClientRect(); const cut = cb - r.top; if (cut > 6 && sc.scrollTop - (cut - 6) >= 0) return { label: b.getAttribute('aria-label'), cutAtMax: cut }; }
      return null;
    }, SC);
    out.partial = partial;
    if (partial) {
      await page.evaluate(({ s, label }) => {
        const sc = document.querySelector(s); const chrome = sc.firstElementChild.firstElementChild;
        const b = [...sc.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === label);
        const cut = chrome.getBoundingClientRect().bottom - b.getBoundingClientRect().top; sc.scrollTop -= cut - 6;
      }, { s: SC, label: partial.label });
      await L.sleep(200);
      const info = await page.evaluate(({ s, label }) => { const sc = document.querySelector(s); const chrome = sc.firstElementChild.firstElementChild; const b = [...sc.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === label); const r = b.getBoundingClientRect(); return { cut: chrome.getBoundingClientRect().bottom - r.top, x: r.left + r.width / 2, y: r.bottom - 3, top: sc.scrollTop }; }, { s: SC, label: partial.label });
      await page.mouse.click(info.x, info.y); await L.sleep(250);
      const after = await page.evaluate(({ s }) => { const a = document.activeElement; return { top: document.querySelector(s).scrollTop, label: a && a.getAttribute('aria-label'), outline: a ? getComputedStyle(a).outlineStyle : null, src: document.documentElement.dataset.focusSource }; }, { s: SC });
      out.partialClick = { cut: +info.cut.toFixed(1), before: info.top, ...after };
      await page.mouse.click(info.x, info.y); await L.sleep(250);
      out.partialAfterSecondClick = await st(page);
      const probeActive = () => page.evaluate(({ s }) => { const sc = document.querySelector(s); const chrome = sc.firstElementChild.firstElementChild; const a = document.activeElement; const r = a.getBoundingClientRect(); return { top: sc.scrollTop, label: a.getAttribute('aria-label'), elTop: +r.top.toFixed(1), chromeBottom: +chrome.getBoundingClientRect().bottom.toFixed(1), outline: getComputedStyle(a).outlineStyle, src: document.documentElement.dataset.focusSource }; }, { s: SC });
      await page.keyboard.press('ArrowUp'); await L.sleep(250); out.partialThenArrowUp = await probeActive();
      await page.keyboard.press('Tab'); await L.sleep(250); out.partialThenTab = await probeActive();
    }
    out.maxG = await toBottom(page); await L.sleep(200);
    await page.evaluate((s) => { const sc = document.querySelector(s); const c = sc.firstElementChild.firstElementChild; const f = [...sc.querySelectorAll('button')].filter((b) => !c.contains(b) && b.getBoundingClientRect().top >= c.getBoundingClientRect().bottom)[0]; f.focus(); }, SC);
    await L.sleep(150); out.firstVisibleLaneFocus = await st(page);
    const back2 = [];
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); await L.sleep(120); const d = await L.focusInfo(page); back2.push(`${d && d.label}:${await st(page)}:${d && d.hidden}`); }
    out.shiftTabIntoChrome = back2;
    out.maxH = await toBottom(page); await L.sleep(200);
    await page.evaluate(() => { const all = [...document.querySelectorAll('button,select,input,[tabindex]')].filter((e) => e.tabIndex >= 0 && !e.disabled && e.getClientRects().length); const i = all.indexOf(document.querySelector('[data-testid=arrangement-snap-toggle]')); all[i - 1].focus(); });
    await L.sleep(150); const pre = await st(page); await page.keyboard.press('Tab'); await L.sleep(200);
    out.tabOntoSnap = `${pre}->${await st(page)} active=${await page.evaluate(() => document.activeElement.dataset.testid)}`;
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await L.sleep(120); }
    out.tabThroughChrome = `${await st(page)} active=${await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.dataset.testid)}`;
    out.finalScrollLeft = await sl(page);
  }
  out.pageErrors = log.errors; out.consoleErrors = log.console.filter((t) => !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|Failed to load resource/i.test(t)); out.consoleAll = log.console.length; out.hyd = log.hydration.length;
  fs.writeFileSync(path.join(__dirname, `probe-a198-${SCENE}-${W}.json`), JSON.stringify({ out, fwd, back }, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
