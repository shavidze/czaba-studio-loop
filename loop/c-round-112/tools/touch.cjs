// §4.5 TOUCH: node touch.cjs  -> runs Zoom x3 first (discriminator), then Volume/Pan/Master x3 + mouse control each
const L = require('./lib.cjs');
const path = require('path');
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
  const frac = (v - mn) / (mx - mn);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  return { v, min: mn, max: mx, step: e.step, box: { x: b.x, y: b.y, w: b.width, h: b.height }, frac, thumbX: b.x + frac * b.width, ariaText: e.getAttribute('aria-valuetext'), undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null, status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim().slice(0, 140), zoomReadout: (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent };
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

async function touchRun(page, target, mode) {
  const sel = SEL[target];
  await page.locator(sel).scrollIntoViewIfNeeded();
  const r0 = await read(page, sel);
  const far = r0.frac > 0.5 ? r0.box.x + 0.15 * r0.box.w : r0.box.x + 0.85 * r0.box.w;
  const y = r0.box.y + r0.box.h / 2;
  const touchFrac = (far - r0.box.x) / r0.box.w;
  const res = { target, mode, before: r0, touchX: +far.toFixed(1), touchFrac: +touchFrac.toFixed(3), touchValue: +(r0.min + touchFrac * (r0.max - r0.min)).toFixed(3), px20Value: +((r0.max - r0.min) * 20 / r0.box.w).toFixed(4) };
  if (mode === 'touch') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: far, y }] });
    await L.sleep(100);
    res.afterStart = await read(page, sel);
    res.moves = [];
    for (let k = 1; k <= 5; k++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: far + 4 * k, y }] });
      await L.sleep(40);
      res.moves.push((await read(page, sel)).v);
    }
    res.afterMoves = await read(page, sel);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await L.sleep(200);
    res.afterEnd = await read(page, sel);
    await cdp.detach();
  } else {
    await page.mouse.move(far, y);
    await page.mouse.down();
    await L.sleep(100);
    res.afterStart = await read(page, sel);
    res.moves = [];
    for (let k = 1; k <= 5; k++) { await page.mouse.move(far + 4 * k, y); await L.sleep(40); res.moves.push((await read(page, sel)).v); }
    res.afterMoves = await read(page, sel);
    await page.mouse.up();
    await L.sleep(200);
    res.afterEnd = await read(page, sel);
  }
  const v0 = r0.v, dir = Math.sign(res.touchValue - v0);
  const towards = (v) => Math.sign(v - v0) === dir && Math.abs(v - v0) > 1e-9;
  res.jumpOnStart = Math.abs(res.afterStart.v - v0) > 1e-9;
  res.firstMoveTowardTouch = towards(res.moves[0]) && Math.abs(res.moves[0] - v0) > res.px20Value + 1e-9;
  res.distToTouchStart = +Math.abs(res.afterStart.v - res.touchValue).toFixed(4);
  res.distToTouchFirstMove = +Math.abs(res.moves[0] - res.touchValue).toFixed(4);
  res.distToTouchBefore = +Math.abs(v0 - res.touchValue).toFixed(4);
  res.maxChangeOverMoves = +Math.max(...res.moves.map((v) => Math.abs(v - v0)), Math.abs(res.afterEnd.v - v0)).toFixed(4);
  res.jumped = res.jumpOnStart || res.firstMoveTowardTouch || res.maxChangeOverMoves > res.px20Value + 1e-9;
  res.movedAtAll = res.moves.some((v) => Math.abs(v - v0) > 1e-9);
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const out = { utc: new Date().toISOString(), runs: [] };
  const plan = [];
  for (let n = 1; n <= 3; n++) plan.push(['zoom', 'touch', n]);
  for (const t of ['volume', 'pan', 'master']) { for (let n = 1; n <= 3; n++) plan.push([t, 'touch', n]); plan.push([t, 'mouse', 1]); }
  for (const [t, m, n] of plan) {
    const tag = `touch-${t}-${m}-${n}`;
    const { ctx, page } = await setup(browser, tag, net);
    try {
      const r = await touchRun(page, t, m);
      r.run = n;
      out.runs.push(r);
      console.log(tag, JSON.stringify({ v0: r.before.v, start: r.afterStart.v, moves: r.moves, end: r.afterEnd.v, touchValue: r.touchValue, jumped: r.jumped, undo: r.afterEnd.undoTitle, status: r.afterEnd.status }));
      if (n === 1) await page.screenshot({ path: path.join(L.SHOTS, `touch-${t}${m === 'mouse' ? '-mouse' : ''}-1440.png`) });
    } catch (e) { out.runs.push({ target: t, mode: m, run: n, error: String(e).slice(0, 400) }); console.log(tag, 'ERROR', String(e).slice(0, 300)); }
    await ctx.close();
    out.net = net;
    L.save(L.OUT, 'touch.json', out);
  }
  await browser.close();
})();
