const L = require('./lib.cjs');
const SEL = {
  zoom: '[data-testid=arrangement-zoom]',
  volume: '[data-track-id=music] input[aria-label^="Volume"]',
  pan: '[data-track-id=music] input[aria-label^="Pan"]',
  master: 'input[aria-label="Master Volume"]',
};
const read = (p, sel) => p.evaluate((sel) => {
  const e = document.querySelector(sel);
  if (!e) return null;
  const b = e.getBoundingClientRect();
  const v = +e.value, mn = +(e.min || 0), mx = +(e.max || 100);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  return { v, min: mn, max: mx, box: { x: b.x, y: b.y, w: b.width, h: b.height }, frac: (v - mn) / (mx - mn), undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null };
}, sel);
async function setup(browser, tag, net) {
  const o = await L.openStudio(browser, { width: 1440, height: 900 }, tag, net, { hasTouch: true, isMobile: false });
  await L.setSnapOff(o.page);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(o.page, s, ln, t);
  await L.blur(o.page);
  await o.page.keyboard.press('Home');
  await L.sleep(300);
  return o;
}
async function run(page, target, mode) {
  const sel = SEL[target];
  await page.locator(sel).scrollIntoViewIfNeeded();
  const r0 = await read(page, sel);
  const far = r0.frac > 0.5 ? r0.box.x + 0.15 * r0.box.w : r0.box.x + 0.85 * r0.box.w;
  const y = r0.box.y + r0.box.h / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: far, y }] });
  await L.sleep(100);
  const afterStart = await read(page, sel);
  const moves = [];
  if (mode === 'drag') {
    for (let k = 1; k <= 5; k++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: far - 4 * k, y }] });
      await L.sleep(40);
      moves.push((await read(page, sel)).v);
    }
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await L.sleep(200);
  const afterEnd = await read(page, sel);
  await cdp.detach();
  return { target, mode, v0: r0.v, start: afterStart.v, moves, end: afterEnd.v, px20: +((r0.max - r0.min) * 20 / r0.box.w).toFixed(4), undoBefore: r0.undoTitle, undoAfter: afterEnd.undoTitle, undoDisabledBefore: r0.undoDisabled, undoDisabledAfter: afterEnd.undoDisabled };
}
(async () => {
  const browser = await L.launch();
  const net = [];
  const out = { utc: new Date().toISOString(), runs: [] };
  for (const [t, m] of [['zoom', 'drag'], ['volume', 'drag'], ['pan', 'drag'], ['master', 'drag'], ['volume', 'tap'], ['master', 'tap']]) {
    const { ctx, page } = await setup(browser, `${t}-${m}`, net);
    try { const r = await run(page, t, m); out.runs.push(r); console.log(JSON.stringify(r)); }
    catch (e) { out.runs.push({ t, m, error: String(e).slice(0, 300) }); console.log(t, m, 'ERROR', String(e).slice(0, 300)); }
    await ctx.close();
  }
  out.net = net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, auth: n.authHeaders }));
  L.save(L.OUT, 'touch-probe.json', out);
  await browser.close();
})();
