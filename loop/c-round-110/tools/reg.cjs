const { chromium, sleep, openStudio, arm, st, save, SHOTS } = require('./lib.cjs');
const path = require('path');

const startSampler = (page) =>
  page.evaluate(() => {
    const lib = document.querySelector('[data-testid=arrangement-library]');
    const samples = [];
    window.__samples = samples;
    const t0 = performance.now();
    const tick = () => {
      const r = lib.getBoundingClientRect();
      samples.push({ t: Math.round(performance.now() - t0), w: Math.round(r.width * 10) / 10, sl: lib.scrollLeft, st: lib.scrollTop });
      if (performance.now() - t0 < 900) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
const readSamples = async (page) => {
  await sleep(1000);
  const s = await page.evaluate(() => window.__samples);
  const ws = s.map((x) => x.w);
  return { n: s.length, first: ws[0], last: ws[ws.length - 1], distinctWidths: [...new Set(ws)].length, maxScrollLeft: Math.max(...s.map((x) => x.sl)), maxScrollTop: Math.max(...s.map((x) => x.st)), samples: s };
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = [];
  const res = { utc: new Date().toISOString() };
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const tag = `${vp.width}x${vp.height}`;
    const { ctx, page } = await openStudio(browser, vp, `reg-${tag}`, net);
    const r = {};
    if (vp.width === 1280) {
      // R12-L2-ENTER-ADD
      const opt = page.locator('[role=option][data-source-id="demo-middle-east"]');
      await opt.focus(); await sleep(150);
      const b = await st(page, 'focus option');
      await page.keyboard.press('Enter'); await sleep(1000);
      const a = await st(page, 'after Enter on option');
      r.r12 = { before: b, after: a };
      // ArrowDown/ArrowUp
      await opt.focus(); await sleep(100);
      const s0 = await st(page, 'focus ME');
      await page.keyboard.press('ArrowDown'); await sleep(200);
      const s1 = await st(page, 'ArrowDown');
      await page.keyboard.press('ArrowUp'); await sleep(200);
      const s2 = await st(page, 'ArrowUp');
      r.arrows = [s0, s1, s2].map((x) => [x.label, x.selected, x.active]);
      // Escape in search
      await page.locator('[data-testid=arrangement-library-search]').fill('mid'); await sleep(300);
      await page.keyboard.press('Escape'); await sleep(300);
      r.escSearch = await st(page, 'Escape in search');
      // separator
      const sep = page.locator('[data-testid=arrangement-library-separator]');
      await sep.focus();
      const w0 = await sep.getAttribute('aria-valuenow');
      const lw0 = (await st(page, 'sep')).libWidth;
      await page.keyboard.press('ArrowRight'); await sleep(300);
      const w1 = await sep.getAttribute('aria-valuenow');
      const lw1 = (await st(page, 'sep')).libWidth;
      await page.keyboard.press('ArrowLeft'); await sleep(300);
      const w2 = await sep.getAttribute('aria-valuenow');
      const lw2 = (await st(page, 'sep')).libWidth;
      r.separator = { valuenow: [w0, w1, w2], rectWidth: [lw0, lw1, lw2] };
    }
    // Mouse collapse/expand animation
    await startSampler(page);
    await page.locator('[data-testid=arrangement-library-collapse]').click();
    r.mouseCollapse = await readSamples(page);
    await startSampler(page);
    await page.locator('[data-testid=arrangement-library-expand]').click();
    r.mouseExpand = await readSamples(page);
    // Keyboard ◀ / ▶ with scrollLeft sampling
    await page.locator('[data-testid=arrangement-library-collapse]').focus();
    await startSampler(page);
    await page.keyboard.press('Enter');
    r.keyCollapse = await readSamples(page);
    r.keyCollapse.activeAfter = (await st(page, 'k')).active;
    await startSampler(page);
    await page.keyboard.press('Enter');
    r.keyExpand = await readSamples(page);
    r.keyExpand.activeAfter = (await st(page, 'k')).active;
    await page.screenshot({ path: path.join(SHOTS, `reg-lib-${tag}.png`) });
    res[tag] = r;
    const sum = (x) => `n=${x.n} ${x.first}->${x.last} distinct=${x.distinctWidths} maxSL=${x.maxScrollLeft} maxST=${x.maxScrollTop}${x.activeAfter ? ' active=' + x.activeAfter : ''}`;
    console.log(tag, JSON.stringify({ r12: r.r12 && [r.r12.before.clips, r.r12.after.clips, r.r12.after.status], arrows: r.arrows, esc: r.escSearch && [r.escSearch.query, r.escSearch.active], sep: r.separator }));
    for (const k of ['mouseCollapse', 'mouseExpand', 'keyCollapse', 'keyExpand']) console.log(tag, k, sum(r[k]));
    await ctx.close();
  }
  // S5 also at 1280
  {
    const { ctx, page } = await openStudio(browser, { width: 1280, height: 720 }, 's5-1280x720', net);
    await arm(page);
    const steps = [];
    await page.locator('[data-testid=arrangement-library-collapse]').click(); await sleep(600);
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await page.locator('[data-testid=arrangement-library-collapse]').focus();
    steps.push(await st(page, 'lib opened by ⤢, focus ◀'));
    await page.keyboard.press('Escape'); await sleep(900);
    steps.push(await st(page, 'after Escape'));
    await page.keyboard.press('Enter'); await sleep(900);
    steps.push(await st(page, 'after Enter'));
    await page.screenshot({ path: path.join(SHOTS, 's5-collapse-button-1280x720.png') });
    res.s5_1280 = steps;
    console.log('s5-1280', JSON.stringify(steps.map((x) => [x.label, x.active, x.collapsed, x.clips, x.status])));
    await ctx.close();
  }
  await browser.close();
  res.net = net;
  save('reg.json', res);
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors, n.hydration.length, n.forbidden.length, n.authHeaders.length])));
})();
