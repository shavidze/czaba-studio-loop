const fs = require('fs');
const path = require('path');
const L = require('./lib-b197.cjs');
const W = +(process.argv[2] || 1280);
const MODE = process.argv[3] || 'margin';
const CSS = `[data-testid=arrangement-timeline-scroller] > div > :not(:first-child), [data-testid=arrangement-timeline-scroller] > div > :not(:first-child) * { scroll-margin-top: var(--b197-chrome, 0px); }`;
const st = (page) => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
const toBottom = (page) => page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); sc.scrollTop = sc.scrollHeight; return sc.scrollTop; });
(async () => {
  const { browser, page, log, H } = await L.openStudio(W);
  const load = await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return { scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft }; });
  await L.richScene(page, H);
  if (MODE === 'margin') {
    await page.addStyleTag({ content: CSS });
    await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); sc.style.setProperty('--b197-chrome', `${sc.firstElementChild.firstElementChild.offsetHeight}px`); });
  }
  if (MODE === 'padneg') {
    await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const h = sc.firstElementChild.firstElementChild.offsetHeight; sc.style.scrollPaddingTop = `${h}px`; const st = document.createElement('style'); st.textContent = `[data-testid=arrangement-timeline-scroller] > div > :first-child, [data-testid=arrangement-timeline-scroller] > div > :first-child * { scroll-margin-top: -${h}px; }`; document.head.appendChild(st); });
  }
  if (MODE === 'reveal') {
    await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const chrome = sc.firstElementChild.firstElementChild; sc.addEventListener('focusin', (e) => { const t = e.target; if (!(t instanceof Element) || chrome.contains(t) || document.documentElement.dataset.focusSource !== 'keyboard') return; const d = chrome.getBoundingClientRect().bottom - t.getBoundingClientRect().top; if (d > 0) sc.scrollTop -= d; }); });
  }
  if (MODE === 'padding') {
    await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); sc.style.scrollPaddingTop = `${sc.firstElementChild.firstElementChild.offsetHeight}px`; });
  }
  const out = { W, MODE, load, chromeH: await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').firstElementChild.firstElementChild.offsetHeight) };
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const fwd = []; let first = null;
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab'); await L.sleep(80);
    const d = await L.focusInfo(page);
    if (!d) { fwd.push({ i, body: true }); continue; }
    const key = `${d.label}|${Math.round(d.box.x)}|${d.testid}`;
    if (first && key === first && i > 3) break;
    if (!first) first = key;
    fwd.push({ i, ...d });
  }
  const back = [];
  for (let i = 0; i < fwd.length; i++) { await page.keyboard.press('Shift+Tab'); await L.sleep(80); const d = await L.focusInfo(page); back.push(d ? { i, ...d } : { i, body: true }); }
  out.stops = fwd.length;
  out.hiddenF = fwd.filter((x) => x.hidden).map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}<${x.chromeBottom.toFixed(1)}`);
  out.hiddenB = back.filter((x) => x.hidden).map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}`);
  out.maxA = await toBottom(page); await L.sleep(200);
  const h = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-playhead-handle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(h.x, h.y); await page.mouse.down(); await L.sleep(100); out.playheadDown = await st(page);
  await page.mouse.move(h.x + 40, h.y, { steps: 5 }); out.playheadDrag = await st(page); await page.mouse.up(); await L.sleep(200);
  out.maxB = await toBottom(page);
  await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); await L.sleep(150); out.flagFocus = await st(page);
  out.maxC = await toBottom(page);
  await page.keyboard.press('F2'); await L.sleep(400); out.f2 = await st(page); await page.keyboard.press('Escape'); await L.sleep(200);
  out.maxD = await toBottom(page); await L.sleep(200);
  const snap = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-snap-toggle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(snap.x, snap.y); await L.sleep(200); out.snapClick = await st(page); await page.mouse.click(snap.x, snap.y); await L.sleep(200);
  out.maxE = await toBottom(page); await L.sleep(200);
  const target = await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const c = sc.firstElementChild.firstElementChild.getBoundingClientRect(); const s = sc.getBoundingClientRect(); const ms = [...sc.querySelectorAll('button[aria-label^="Mute — "]')].map((e) => e.getBoundingClientRect()).filter((r) => r.top >= c.bottom && r.bottom <= s.bottom); const r = ms[ms.length - 1]; return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
  if (target) { const b = await st(page); await page.mouse.click(target.x, target.y); await L.sleep(250); await page.mouse.click(target.x, target.y); await L.sleep(250); out.muteClick = `${b}->${await st(page)}`; }
  out.maxF = await toBottom(page); await L.sleep(200);
  await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const c = sc.firstElementChild.firstElementChild; const f = [...sc.querySelectorAll('button')].filter((b) => !c.contains(b) && b.getBoundingClientRect().top >= c.getBoundingClientRect().bottom)[0]; f.focus(); });
  await L.sleep(150); out.firstVisibleLaneFocus = await st(page);
  const back2 = [];
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); await L.sleep(120); const d = await L.focusInfo(page); back2.push(`${d && d.label}:${await st(page)}`); }
  out.shiftTabIntoChrome = back2;
  out.maxG = await toBottom(page); await L.sleep(200);
  await page.evaluate(() => { const all = [...document.querySelectorAll('button,select,input,[tabindex]')].filter((e) => e.tabIndex >= 0 && !e.disabled && e.getClientRects().length); const i = all.indexOf(document.querySelector('[data-testid=arrangement-snap-toggle]')); all[i - 1].focus(); });
  await L.sleep(150); const pre = await st(page); await page.keyboard.press('Tab'); await L.sleep(200);
  out.tabOntoSnap = `${pre}->${await st(page)} active=${await page.evaluate(() => document.activeElement.dataset.testid)}`;
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await L.sleep(120); }
  out.tabThroughChrome = `${await st(page)} active=${await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.dataset.testid)}`;
  out.errors = log.errors.length; out.hyd = log.hydration.length;
  fs.writeFileSync(path.join(__dirname, `probe-${MODE}-${W}.json`), JSON.stringify({ out, fwd, back }, null, 1));
  console.log(JSON.stringify(out));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
