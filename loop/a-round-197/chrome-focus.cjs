const fs = require('fs');
const path = require('path');
const PORT = process.argv[2] || '5173';
const W = +(process.argv[3] || 1280);
process.env.A_BASE = `http://127.0.0.1:${PORT}`;
const L = require('./lib197.cjs');

(async () => {
  const { browser, page, log, H } = await L.openStudio(W);
  await L.richScene(page, H);
  const st = () => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
  const toBottom = () => page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); sc.scrollTop = sc.scrollHeight; return sc.scrollTop; });
  const out = { PORT, W, spt: await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').style.scrollPaddingTop) };
  out.max = await toBottom();
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await L.sleep(200);
  const tabs = [];
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    await L.sleep(70);
    const d = await page.evaluate(() => {
      const a = document.activeElement;
      const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
      const chrome = sc.firstElementChild.firstElementChild;
      return { label: a.getAttribute('aria-label') || a.getAttribute('data-testid') || a.tagName, inChrome: chrome.contains(a), inScroller: sc.contains(a), scrollTop: sc.scrollTop, testid: a.getAttribute('data-testid') };
    });
    tabs.push(d);
    if (d.inScroller && !d.inChrome) break;
  }
  out.chromeStops = tabs.filter((t) => t.inChrome).map((t) => `${t.label}:${t.scrollTop}`);
  out.firstLaneStop = tabs[tabs.length - 1];
  out.max2 = await toBottom();
  await L.sleep(200);
  const chromeBack = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Shift+Tab');
    await L.sleep(70);
    chromeBack.push(await page.evaluate(() => { const a = document.activeElement; const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return `${a.getAttribute('aria-label') || a.tagName}:${sc.scrollTop}`; }));
  }
  out.shiftTabFromLanes = chromeBack;
  out.max3 = await toBottom();
  await L.sleep(200);
  const handle = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-playhead-handle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(handle.x, handle.y);
  await page.mouse.down();
  await L.sleep(100);
  out.playheadDown = await st();
  await page.mouse.move(handle.x + 40, handle.y, { steps: 5 });
  out.playheadDrag = await st();
  await page.mouse.up();
  await L.sleep(200);
  out.playheadUp = await st();
  out.max4 = await toBottom();
  await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus());
  await L.sleep(150);
  out.afterProgrammaticFlagFocus = await st();
  out.max5 = await toBottom();
  await page.keyboard.press('F2');
  await L.sleep(400);
  out.f2 = await page.evaluate(() => ({ tag: document.activeElement.tagName, scrollTop: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop }));
  await page.keyboard.press('Escape');
  out.errors = log.errors.length;
  fs.writeFileSync(path.join(L.OUT, `chrome-focus-${PORT}-${W}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
