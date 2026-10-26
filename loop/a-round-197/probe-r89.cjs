const L = require('./lib197.cjs');
const W = +(process.argv[2] || 1280);
const MODE = process.argv[3] || 'inject';
const TAG = process.argv[4] || `${MODE}-${W}`;
(async () => {
  const { browser, page, log, H } = await L.openStudio(W);
  const load = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    return { scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft, spt: sc.style.scrollPaddingTop, chromeH: sc.firstElementChild.firstElementChild.offsetHeight };
  });
  await L.richScene(page, H);
  if (MODE === 'inject') {
    await page.evaluate(() => {
      const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
      sc.style.scrollPaddingTop = `${sc.firstElementChild.firstElementChild.offsetHeight}px`;
    });
  }
  const scene = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    return { scrollTop: sc.scrollTop, spt: sc.style.scrollPaddingTop, chromeH: sc.firstElementChild.firstElementChild.offsetHeight, sh: sc.scrollHeight, ch: sc.clientHeight };
  });
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const fwd = [];
  let first = null;
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab');
    await L.sleep(90);
    const d = await L.focusInfo(page);
    if (!d) { fwd.push({ i, body: true }); continue; }
    const key = `${d.label}|${Math.round(d.box.x)}`;
    if (first && key === first && i > 3) break;
    if (!first) first = key;
    fwd.push({ i, ...d });
  }
  const back = [];
  for (let i = 0; i < fwd.length; i++) {
    await page.keyboard.press('Shift+Tab');
    await L.sleep(90);
    const d = await L.focusInfo(page);
    back.push(d ? { i, ...d } : { i, body: true });
  }
  const click = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    sc.scrollTop = sc.scrollHeight;
    return { max: sc.scrollTop };
  });
  await L.sleep(300);
  const target = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const chrome = sc.firstElementChild.firstElementChild.getBoundingClientRect();
    const scr = sc.getBoundingClientRect();
    const ms = [...sc.querySelectorAll('button[aria-label^="Mute — "]')].map((e) => e.getBoundingClientRect()).filter((r) => r.top >= chrome.bottom && r.bottom <= scr.bottom);
    const r = ms[ms.length - 1];
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  });
  if (target) {
    const before = await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
    await page.mouse.click(target.x, target.y);
    await L.sleep(300);
    await page.mouse.click(target.x, target.y);
    await L.sleep(300);
    const after = await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
    click.before = before;
    click.after = after;
    click.target = target;
  }
  const hiddenF = fwd.filter((x) => x.hidden);
  const hiddenB = back.filter((x) => x.hidden);
  L.save(`probe-r89-${TAG}.json`, { W, MODE, load, scene, fwd, back, click, log });
  console.log(TAG, JSON.stringify({ load, scene, stops: fwd.length, inScroller: fwd.filter((x) => x.inScroller).length, hiddenF: hiddenF.map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}<${x.chromeBottom.toFixed(1)}`), hiddenB: hiddenB.map((x) => `${x.i}:${x.label}@${x.box.y.toFixed(1)}`), click, errors: log.errors.length, hyd: log.hydration.length }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
