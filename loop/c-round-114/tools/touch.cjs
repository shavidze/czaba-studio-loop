// C round 113 — touch/mouse/keyboard fader rows. Method from c-round-112/tools/touch.cjs (CDP Input.dispatchTouchEvent,
// touchStart at 15 % from the end opposite the thumb, read 100 ms after touchStart, 5 moves, touchEnd); moves are -4 px (task §4).
// Usage: node touch.cjs <vp:1440|1280> <runs> [targets comma list] [modes comma list]
const L = require('./lib.cjs');
const path = require('path');
const fs = require('fs');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUNS = +(process.argv[3] || 1);
const TARGETS = (process.argv[4] || 'zoom,clipgain').split(',');
const MODES = (process.argv[5] || 'touch').split(',');

const SEL = {
  zoom: '[data-testid=arrangement-zoom]',
  volume: '[data-track-id=music] input[aria-label^="Volume"]',
  pan: '[data-track-id=music] input[aria-label^="Pan"]',
  master: 'input[aria-label="Master Volume"]',
  group: '[data-testid=arrangement-group-volume]',
  video: '[data-c113-video-volume]',
  clipgain: '[data-testid=arrangement-detail-clip-gain-fader]',
};
const STEP = { zoom: null, volume: 0.01, pan: 1, master: 0.5, group: 0.01, video: 0.01, clipgain: 0.1 };
const DEFAULT = { volume: 1, pan: 0, master: 0, group: 1, video: 1, clipgain: 0 };

const read = (p, sel) => p.evaluate((sel) => {
  const e = document.querySelector(sel);
  if (!e) return null;
  const b = e.getBoundingClientRect();
  const v = +e.value, mn = +(e.min || 0), mx = +(e.max || 100);
  const frac = (v - mn) / (mx - mn);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  return { v, min: mn, max: mx, step: e.step, label: e.getAttribute('aria-label'), box: { x: b.x, y: b.y, w: b.width, h: b.height }, frac, thumbX: b.x + frac * b.width, ariaText: e.getAttribute('aria-valuetext'), undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null, status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim().slice(0, 140), active: document.activeElement === e };
}, sel);

async function setup(browser, tag, net, target) {
  const o = await L.openStudio(browser, VP, tag, net, { hasTouch: true, isMobile: false });
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await L.blur(p);
  if (target === 'group') {
    await p.click(L.nameSel('stems'));
    await L.sleep(150);
    await p.keyboard.down('Shift');
    await p.click(L.nameSel('sfx'));
    await p.keyboard.up('Shift');
    await L.sleep(150);
    await p.keyboard.press('Control+g');
    await p.waitForSelector(SEL.group, { timeout: 10000 });
    await L.sleep(300);
    await L.blur(p);
  }
  if (target === 'video') {
    await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    const ok = await p.evaluate(() => {
      const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => l.querySelector('[data-clip-kind=video]'));
      const inp = lanes.map((l) => l.querySelector('input[aria-label^="Volume"]')).find(Boolean);
      if (!inp) return null;
      inp.setAttribute('data-c113-video-volume', '1');
      return { track: inp.closest('[data-track-id]').getAttribute('data-track-id'), label: inp.getAttribute('aria-label') };
    });
    if (!ok) throw new Error('video volume input not found');
    o.videoTrack = ok;
    await L.blur(p);
  }
  await p.keyboard.press('Home');
  await L.sleep(300);
  if (target === 'clipgain' || target === 'zoom') {
    const st = (await L.clipsDom(p)).find((c) => c.lane === 'stems');
    await L.selectClip(p, st.id);
    const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
    if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
    await L.blur(p);
    await L.sleep(200);
  }
  return o;
}

const farPoint = (r) => (r.frac > 0.5 ? r.box.x + 0.15 * r.box.w : r.box.x + 0.85 * r.box.w);
const near = (a, b) => Math.abs(a - b) < 1e-6;

const CDP = new WeakMap();
async function touchAt(page, type, x, y) {
  if (!CDP.has(page)) CDP.set(page, await page.context().newCDPSession(page));
  await CDP.get(page).send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
}

async function nudge(page, sel, key, n) {
  await page.locator(sel).focus();
  for (let k = 0; k < n; k++) { await page.keyboard.press(key); await L.sleep(40); }
  await L.sleep(100);
  await L.blur(page);
  await L.sleep(250);
}

async function undoCheck(page, sel, res, r0) {
  await L.blur(page);
  await L.sleep(250);
  await page.keyboard.press('Control+z');
  await L.sleep(300);
  res.afterUndo = await read(page, sel);
  res.undoRestores = near(res.afterUndo.v, r0.v);
  res.undoBackToPrevTitle = res.afterUndo.undoTitle === r0.undoTitle && res.afterUndo.undoDisabled === r0.undoDisabled;
}

async function run(page, target, mode) {
  const sel = SEL[target];
  await page.locator(sel).scrollIntoViewIfNeeded();
  const res = { target, mode };
  const step = STEP[target];
  if (mode === 'dtap' || mode === 'mdbl') {
    if (target === 'pan') await nudge(page, sel, 'ArrowRight', 5);
    else if (target !== 'zoom') await nudge(page, sel, 'ArrowLeft', 10);
  }
  const r0 = await read(page, sel);
  res.before = r0;
  const far = farPoint(r0);
  const y = r0.box.y + r0.box.h / 2;
  res.touchX = +far.toFixed(1);
  res.farSide = r0.frac > 0.5 ? 'left15' : 'right15';
  res.touchValue = +(r0.min + ((far - r0.box.x) / r0.box.w) * (r0.max - r0.min)).toFixed(3);
  res.px20Value = +((r0.max - r0.min) * 20 / r0.box.w).toFixed(4);
  if (mode === 'touch' || mode === 'mdrag' || mode === 'mpress') {
    const isTouch = mode === 'touch';
    if (isTouch) await touchAt(page, 'touchStart', far, y);
    else { await page.mouse.move(far, y); await page.mouse.down(); }
    await L.sleep(100);
    res.afterStart = await read(page, sel);
    res.moves = [];
    if (mode !== 'mpress') {
      for (let k = 1; k <= 5; k++) {
        if (isTouch) await touchAt(page, 'touchMove', far - 4 * k, y);
        else await page.mouse.move(far - 4 * k, y);
        await L.sleep(40);
        res.moves.push((await read(page, sel)).v);
      }
    }
    if (isTouch) await touchAt(page, 'touchEnd', 0, 0);
    else await page.mouse.up();
    await L.sleep(250);
    res.afterEnd = await read(page, sel);
    res.startUnchanged = near(res.afterStart.v, r0.v);
    if (target === 'zoom') { res.zoomJumped = !res.startUnchanged; return res; }
    const d = res.afterEnd.v - r0.v;
    res.delta = +d.toFixed(4);
    res.maxAbsDuringMoves = +Math.max(0, ...res.moves.map((v) => Math.abs(v - r0.v))).toFixed(4);
    res.limit = +(res.px20Value + step).toFixed(4);
    if (mode === 'mpress') {
      res.pass = res.startUnchanged && near(res.afterEnd.v, r0.v);
      res.historyUnchanged = res.afterEnd.undoTitle === r0.undoTitle;
      return res;
    }
    res.relOk = d < 0 && Math.abs(d) >= step - 1e-9 && Math.abs(d) <= res.limit + 1e-9 && res.maxAbsDuringMoves <= res.limit + 1e-9 && res.moves.every((v) => v <= r0.v + 1e-9);
    res.movedAtAll = res.moves.some((v) => !near(v, r0.v));
    res.newTitle = res.afterEnd.undoTitle;
    res.titleChanged = res.afterEnd.undoTitle !== r0.undoTitle;
    await undoCheck(page, sel, res, r0);
    res.pass = res.startUnchanged && res.relOk && res.titleChanged && res.undoRestores && res.undoBackToPrevTitle;
    return res;
  }
  if (mode === 'tap' || mode === 'dtap') {
    await touchAt(page, 'touchStart', far, y);
    await L.sleep(60);
    await touchAt(page, 'touchEnd', 0, 0);
    if (mode === 'dtap') {
      await L.sleep(120);
      await touchAt(page, 'touchStart', far, y);
      await L.sleep(60);
      await touchAt(page, 'touchEnd', 0, 0);
    }
    await L.sleep(350);
    res.afterEnd = await read(page, sel);
    res.valueUnchanged = near(res.afterEnd.v, r0.v);
    res.historyUnchanged = res.afterEnd.undoTitle === r0.undoTitle && res.afterEnd.undoDisabled === r0.undoDisabled;
    if (target === 'zoom') return res;
    if (mode === 'dtap') res.resetToDefault = near(res.afterEnd.v, DEFAULT[target]);
    res.pass = res.valueUnchanged && res.historyUnchanged;
    return res;
  }
  if (mode === 'mdbl') {
    const tx = r0.thumbX;
    await page.mouse.dblclick(tx, y);
    await L.sleep(350);
    res.afterEnd = await read(page, sel);
    res.reset = near(res.afterEnd.v, DEFAULT[target]);
    res.newTitle = res.afterEnd.undoTitle;
    await undoCheck(page, sel, res, r0);
    await page.keyboard.press('Control+z');
    await L.sleep(300);
    res.afterUndo2 = await read(page, sel);
    res.secondUndoMovesAwayFromNudge = !near(res.afterUndo2.v, r0.v);
    res.pass = res.reset && res.undoRestores && res.undoBackToPrevTitle;
    return res;
  }
  if (mode === 'kb') {
    await page.locator(sel).focus();
    await page.keyboard.press('ArrowRight');
    await L.sleep(200);
    res.afterEnd = await read(page, sel);
    res.delta = +(res.afterEnd.v - r0.v).toFixed(4);
    res.pass = near(res.delta, step);
    await L.blur(page);
    await L.sleep(250);
    res.afterBlur = await read(page, sel);
    return res;
  }
  throw new Error('unknown mode ' + mode);
}

const APPLIES = {
  touch: ['zoom', 'volume', 'pan', 'master', 'group', 'video', 'clipgain'],
  tap: ['volume', 'pan', 'master', 'group', 'video'],
  dtap: ['volume', 'pan', 'master', 'group'],
  mpress: ['volume', 'pan', 'master', 'group'],
  mdrag: ['volume', 'master'],
  mdbl: ['volume', 'master'],
  kb: ['pan'],
};

(async () => {
  const browser = await L.launch();
  const net = [];
  const file = `touch-${VPN}${process.argv[6] ? '-' + process.argv[6] : ''}.json`;
  const out = { utc: new Date().toISOString(), vp: VP, chromium: browser.version(), runs: [] };
  const plan = [];
  for (const t of TARGETS) for (const m of MODES) {
    if (!APPLIES[m].includes(t)) continue;
    const n = (m === 'touch' || m === 'tap') ? RUNS : 1;
    for (let k = 1; k <= n; k++) plan.push([t, m, k]);
  }
  for (const [t, m, n] of plan) {
    const tag = `${VPN}-${t}-${m}-${n}`;
    let attempt = 0;
    for (;;) {
      attempt++;
      let o;
      try {
        o = await setup(browser, tag, net, t);
        const r = await run(o.page, t, m);
        r.run = n; r.attempt = attempt; r.videoTrack = o.videoTrack;
        out.runs.push(r);
        console.log(tag, JSON.stringify({ v0: r.before.v, start: r.afterStart && r.afterStart.v, moves: r.moves, end: r.afterEnd.v, undo: r.afterUndo && r.afterUndo.v, pass: r.pass, zoomJumped: r.zoomJumped, title: r.afterEnd.undoTitle }));
        if (n === 1) await o.page.screenshot({ path: path.join(L.SHOTS, `${t}-${m}-${VPN}.png`) });
        await o.ctx.close();
        break;
      } catch (e) {
        console.log(tag, 'ERROR', String(e).slice(0, 300));
        if (o) await o.ctx.close().catch(() => {});
        if (attempt >= 2) { out.runs.push({ target: t, mode: m, run: n, error: String(e).slice(0, 400) }); break; }
      }
    }
    out.net = net;
    L.save(L.OUT, file, out);
  }
  await browser.close();
})();
