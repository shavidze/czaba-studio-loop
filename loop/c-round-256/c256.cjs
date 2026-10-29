// C round 256: SABA-B-9 stage 1 (C, independent). usage: node c256.cjs <rowRegex> [onlyVp]
const path = require('node:path');
const fs = require('node:fs');
var crypto = require('node:crypto');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173';
var outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-256/browser';
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)'));
eval(helpers.replace('const sleep', 'var sleep').replace('const SHA', 'var SHA').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const helpers2 = src.slice(src.indexOf('const geo = (page)'), src.indexOf('const ROWS')).split('\n').filter((l) => !/^const (HEADB|MEDIA|INK) =/.test(l)).join('\n');
eval(helpers2.replace(/^async function (\w+)/gm, 'var $1 = async function').replace(/^const (\w+) =/gm, 'var $1 ='));
const HEADB = 'http://127.0.0.1:5180';
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const onlyVp = process.argv[3] || null;
const resultFile = path.join(outDir, 'c256.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const ck = (m) => fs.appendFileSync(path.join(outDir, '..', 'checkpoint.txt'), `${new Date().toISOString().slice(11, 19)} ${m}\n`);

const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const a = document.activeElement;
  const play = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Play');
  return {
    t: Math.round(performance.now()),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
    playing: !!q('button[aria-label="Pause"]') || play?.dataset.playing === 'true',
    dp: play?.dataset.playing ?? null,
    pauseBtns: document.querySelectorAll('button[aria-label="Pause"]').length,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    statusN: window.__statusLog?.length ?? 0,
    undo: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('aria-label') || b.textContent.trim()))?.getAttribute('title') ?? null,
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.textContent.trim() || a.tagName).slice(0, 50) : 'BODY',
    rms: +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5),
  };
});
const toolbarOf = (page) => page.evaluate(() => {
  let t = document.querySelector('[data-testid="arrangement-transport"]');
  if (!t) { const fit = document.querySelector('[data-testid="arrangement-fit"]'); t = document.querySelector('[data-testid="arrangement-position"]'); while (t && !(t.classList.contains('flex-wrap') && t.contains(fit))) t = t.parentElement; }
  t?.setAttribute('data-c256-toolbar', '1');
  return !!t;
});
const geometry = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`);
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) }; };
  const root = document.querySelector('[data-c256-toolbar]');
  const groups = { edit: q('arrangement-transport-edit'), centre: q('arrangement-transport-centre'), view: q('arrangement-transport-view') };
  const out = { vw: innerWidth, toolbar: r(root), rootOverflow: root.scrollWidth - root.clientWidth };
  if (groups.centre) {
    out.rects = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, r(e)]));
    out.groupOverflow = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, e.scrollWidth - e.clientWidth]));
    const c = out.rects.centre; out.centreOffset = +((c.x + c.w / 2) - (out.toolbar.x + out.toolbar.w / 2)).toFixed(1);
    const ov = (a, b) => !(a.r <= b.x || b.r <= a.x || a.b <= b.y || b.b <= a.y);
    out.overlaps = [ov(out.rects.edit, c), ov(c, out.rects.view), ov(out.rects.edit, out.rects.view)];
    out.rowTops = Object.fromEntries(Object.entries(out.rects).map(([k, v]) => [k, v.y]));
    const name = (e) => e.getAttribute('data-testid') === 'arrangement-position' || e.querySelector?.('[data-testid="arrangement-position"]') ? 'CLOCK' : (e.tagName === 'BUTTON' ? (e.getAttribute('aria-label') || e.textContent.trim()) : (e.querySelector('input,button') ? (e.querySelector('input')?.getAttribute('aria-label') || e.textContent.trim().slice(0, 30)) : (e.getAttribute('role') === 'separator' || e.children.length === 0 ? 'SEP' : e.textContent.trim().slice(0, 30))));
    out.childOrder = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, [...e.children].map(name)]));
  }
  out.controls = [...root.querySelectorAll('button,input')].map((e) => e.getAttribute('aria-label') || e.textContent.trim() || e.tagName);
  const pos = q('arrangement-position'); const clock = pos.parentElement;
  out.clock = { h: r(clock).h, posH: r(pos).h, line: parseFloat(getComputedStyle(pos).lineHeight), y: r(clock).y };
  out.header = r(root.parentElement?.firstElementChild === root ? null : root.previousElementSibling);
  out.tops = { library: r(q('arrangement-library'))?.y, dock: r(q('arrangement-video-dock'))?.y, videoBox: r(q('arrangement-video-box')), ruler: r(q('arrangement-ruler'))?.y, firstLane: r(document.querySelector('[data-track-id]'))?.y, scroller: r(q('arrangement-timeline-scroller')) };
  out.master = r(q('arrangement-master') || document.querySelector('[data-testid^="arrangement-master"]'));
  return out;
});

const ROWS = {
  async layout(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      await toolbarOf(page); await sleep(300);
      r[tag] = await geometry(page); await shot(page, `layout-${tag}`, k);
      if (['1440x900', '1280x720'].includes(k)) {
        await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA);
        await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
        await sleep(2500); await page.mouse.click(5, 5); await sleep(300); await blur(page);
        r[tag].withVideo = await geometry(page);
        await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
        r[tag].float = await page.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-video-box]'); const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), pos: getComputedStyle(e).position }; });
        await shot(page, `layout-float-${tag}`, k);
      }
      r[tag].errors = errors; await ctx.close();
    }
    const n = r.new; const h = r.head;
    const isCanon = k === '1440x900' || k === '1280x720';
    const oneRow = n.rowTops && new Set(Object.values(n.rowTops).map(Math.round)).size === 1;
    r.checks = {
      height: k === '1440x900' ? n.toolbar.h === 49 : (n.toolbar.h === 49 || n.toolbar.h <= 87),
      h1280: k !== '1280x720' || (n.toolbar.h <= 87 && !oneRow && n.rects.centre.y < n.rects.edit.y && Math.abs(n.rects.edit.y - n.rects.view.y) < 1),
      oneRowAt1440: k !== '1440x900' || oneRow,
      noOverlap: n.overlaps.every((x) => !x),
      noOverflow: n.rootOverflow === 0 && Object.values(n.groupOverflow).every((x) => x === 0),
      clockOneLine: n.clock.posH <= n.clock.line + 0.5,
      centred: Math.abs(n.centreOffset) <= 24,
      order: JSON.stringify(n.childOrder.centre.filter((x) => x !== 'SEP')) === JSON.stringify(['Follow', 'CLOCK', 'Play', 'Stop', 'Back to start', 'Loop']),
      tops: !isCanon || ['library', 'dock', 'ruler', 'firstLane'].every((t) => n.tops[t] != null && Math.abs(n.tops[t] - h.tops[t]) <= 1),
      float: !isCanon || (n.float && h.float && Math.abs(n.float.x - h.float.x) <= 1 && Math.abs(n.float.y - h.float.y) <= 1 && n.float.w === h.float.w && n.float.h === h.float.h),
      errors: n.errors.length === 0,
    };
    r.heightsNewHead = [n.toolbar.h, h.toolbar.h];
    r.pass = Object.values(r.checks).every(Boolean);
    return r;
  },
  async stop(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const o = await origin(page); await laneClick(page, o, 2); await blur(page);
    const play = page.getByRole('button', { name: 'Play', exact: true }); const stop = page.getByRole('button', { name: 'Stop', exact: true });
    const r = { s0: await st(page) };
    await play.click(); const samples = [];
    for (let i = 0; i < 6; i += 1) { await sleep(150); samples.push(await st(page)); }
    r.afterPlay = samples[samples.length - 1];
    const startCount = await page.evaluate(() => window.__taps.length);
    await play.click(); const s2 = [];
    for (let i = 0; i < 6; i += 1) { await sleep(100); s2.push(await st(page)); }
    r.playAgain = s2; r.tapsBefore = startCount; r.tapsAfter = await page.evaluate(() => window.__taps.length);
    const seq = [...samples, ...s2].map((x) => x.ph);
    r.monotonic = seq.every((v, i) => i === 0 || v >= seq[i - 1]);
    await stop.click(); const t0 = Date.now(); await sleep(300); r.stop300 = await st(page); r.stopRms = []; for (let i = 0; i < 14; i += 1) { await sleep(50); r.stopRms.push((await st(page)).rms); } r.stop1s = await st(page); r.stopAtMs = Date.now() - t0;
    await shot(page, 'stop-stopped', k);
    await key(page, 'Space', 700); r.spacePlay = await st(page); await key(page, 'Space', 500);
    r.beforeSingle = await st(page);
    await stop.click(); await sleep(500); r.afterSingle = await st(page);
    await stop.dblclick(); await sleep(500); r.afterDbl = await st(page);
    await play.click(); await sleep(900); r.beforeDblPlaying = await st(page);
    await stop.dblclick(); await sleep(300); r.dblPlay300 = await st(page); r.dblRms = []; for (let i = 0; i < 14; i += 1) { await sleep(50); r.dblRms.push((await st(page)).rms); } r.dblPlay1s = await st(page);
    r.errors = errors;
    const c = {
      play: r.afterPlay.playing && Math.max(...samples.map((x) => x.rms)) > 0.01 && r.afterPlay.ph > 2 && samples[0].ph >= 2,
      playAgain: s2.every((x) => x.playing) && Math.max(...s2.map((x) => x.rms)) > 0.01 && r.tapsAfter === r.tapsBefore && r.monotonic && s2[0].ph >= r.afterPlay.ph,
      stop: !r.stop300.playing && r.stop300.rms < 0.001 && Math.max(...r.stopRms) < 0.001 && r.stop300.ph === r.stop1s.ph && r.stop1s.m === '2.000',
      space: r.spacePlay.playing && r.spacePlay.ph >= 2 && r.spacePlay.ph < 2.9,
      single: ['ph', 'pos', 'm', 'status', 'statusN', 'undo', 'playing'].every((f) => r.beforeSingle[f] === r.afterSingle[f]),
      dbl: !r.afterDbl.playing && r.afterDbl.m === '0.000' && r.afterDbl.pos === '00:00.000' && r.afterDbl.undo === r.afterSingle.undo,
      dblPlaying: r.beforeDblPlaying.playing && !r.dblPlay300.playing && !r.dblPlay1s.playing && r.dblPlay300.pos === '00:00.000' && r.dblPlay1s.pos === '00:00.000' && r.dblPlay1s.m === '0.000' && r.dblPlay300.rms < 0.001 && r.dblPlay1s.rms < 0.001 && Math.max(...r.dblRms) < 0.001,
      noPause: [r.afterPlay, ...s2].every((x) => x.pauseBtns === 0),
      errors: errors.length === 0,
    };
    r.checks = c; r.pass = Object.values(c).every(Boolean); await ctx.close(); return r;
  },
  async status(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      const o = await origin(page); await laneClick(page, o, 2); await blur(page);
      const x = { s0: await st(page) };
      if (tag === 'new') {
        await page.getByRole('button', { name: 'Play', exact: true }).click(); await sleep(1000);
        await page.getByRole('button', { name: 'Stop', exact: true }).click(); await sleep(600);
        await page.getByRole('button', { name: 'Stop', exact: true }).dblclick();
      } else {
        await key(page, 'Space', 1000); await key(page, 'Space', 600); await page.keyboard.press('Home');
      }
      await sleep(500); x.end = await st(page);
      x.log = await page.evaluate(() => window.__statusLog.map((e) => e.text));
      x.errors = errors; r[tag] = x; await ctx.close();
    }
    r.pass = r.new.end.status === r.head.end.status && r.new.end.m === r.head.end.m && r.new.end.pos === r.head.end.pos && r.new.errors.length === 0;
    return r;
  },
  async keys(browser, vp, k) {
    const r = {};
    // new build: focused Play / Stop
    {
      const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
      const o = await origin(page); await laneClick(page, o, 2); await blur(page);
      const tabTo = async (label) => { await page.locator('body').focus(); for (let i = 0; i < 200; i += 1) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')); if (a === label) return i + 1; } return -1; };
      r.tabsToPlay = await tabTo('Play'); const a0 = await st(page);
      await page.keyboard.press('Space'); await sleep(700); const a1 = await st(page);
      r.spaceOnPlay = { a0, a1, flips: a1.statusN - a0.statusN };
      r.tabsToStop = await tabTo('Stop'); const b0 = await st(page);
      await page.keyboard.press('Space'); await sleep(700); const b1 = await st(page);
      r.spaceOnStop = { b0, b1 };
      // Enter on Stop while playing
      await page.getByRole('button', { name: 'Play', exact: true }).click(); await sleep(700);
      await page.getByRole('button', { name: 'Stop', exact: true }).focus(); const e0 = await st(page);
      await page.keyboard.press('Enter'); await sleep(600); const e1 = await st(page); r.enterStop = { e0, e1 };
      // Held Enter with real auto-repeat via CDP
      const cdp = await ctx.newCDPSession(page);
      const hold = async (label) => {
        await page.getByRole('button', { name: label, exact: true }).focus(); await sleep(100);
        const h0 = await st(page); const log0 = h0.statusN;
        const ev = { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' };
        await cdp.send('Input.dispatchKeyEvent', ev);
        await sleep(250); const h1 = await st(page);
        for (let i = 0; i < 20; i += 1) { await cdp.send('Input.dispatchKeyEvent', { ...ev, autoRepeat: true }); await sleep(40); }
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        await sleep(500); const h2 = await st(page);
        return { h0, h1, h2, statusAfterFirst: h1.statusN - log0, statusTotal: h2.statusN - log0 };
      };
      // count repeats really seen by the page
      await page.evaluate(() => { window.__rep = 0; window.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.repeat) window.__rep += 1; }, true); });
      // Play stopped -> held Enter: first plays, repeats nothing
      if ((await st(page)).playing) { await page.getByRole('button', { name: 'Stop', exact: true }).click(); await sleep(400); }
      r.holdPlay = await hold('Play');
      // Stop while playing -> held Enter: first stops, repeats nothing
      r.holdStop = await hold('Stop');
      // Stop while playing again then Space once by window handler on Stop and double hold confirm
      r.repeatsSeen = await page.evaluate(() => window.__rep);
      // Space elsewhere (body focus)
      await blur(page); await page.mouse.click(5, 5); await blur(page);
      if ((await st(page)).playing) { await key(page, 'Space', 400); }
      const o2 = await origin(page).catch(() => null);
      r.errors = errors; await ctx.close();
    }
    // Space with no focus: new vs head
    for (const [tag, base] of [['newBody', BASE], ['headBody', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      const o = await origin(page); await laneClick(page, o, 2); await blur(page);
      await key(page, 'Space', 800); const p1 = await st(page); await key(page, 'Space', 500); const p2 = await st(page); await key(page, 'Space', 500); const p3 = await st(page); await key(page, 'Space', 400);
      r[tag] = { p1: { playing: p1.playing, m: p1.m, status: p1.status }, p2: { playing: p2.playing, m: p2.m, status: p2.status }, p3: { playing: p3.playing, ph: p3.ph, status: p3.status }, errors }; await ctx.close();
    }
    const c = {
      spacePlay: r.tabsToPlay > 0 && !r.spaceOnPlay.a0.playing && r.spaceOnPlay.a1.playing && r.spaceOnPlay.a1.active.includes('Play'),
      spaceStop: r.tabsToStop > 0 && r.spaceOnStop.b0.playing && !r.spaceOnStop.b1.playing,
      enterStop: r.enterStop.e0.playing && !r.enterStop.e1.playing,
      holdPlay: !r.holdPlay.h0.playing && r.holdPlay.h1.playing && r.holdPlay.h2.playing && r.holdPlay.statusTotal === r.holdPlay.statusAfterFirst,
      holdStop: r.holdStop.h0.playing && !r.holdStop.h1.playing && !r.holdStop.h2.playing && r.holdStop.h2.ph === r.holdStop.h1.ph && r.holdStop.statusTotal === r.holdStop.statusAfterFirst && r.holdStop.h2.m === r.holdStop.h1.m,
      repeatsReal: r.repeatsSeen >= 30,
      bodySame: ['p1', 'p2'].every((p) => r.newBody[p].playing === r.headBody[p].playing && r.newBody[p].m === r.headBody[p].m && r.newBody[p].status === r.headBody[p].status) && r.newBody.p3.playing === r.headBody.p3.playing,
      errors: r.errors.length === 0,
    };
    r.checks = c; r.pass = Object.values(c).every(Boolean); return r;
  },
  async onstate(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const read = () => page.evaluate(() => {
      const toRgb = (c) => { const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d'); g.clearRect(0, 0, 1, 1); g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const over = (t, b) => [0, 1, 2].map((i) => t[i] * t[3] + b[i] * (1 - t[3])).concat(1);
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
      const tb = toRgb(getComputedStyle(document.querySelector('[data-testid="arrangement-transport"]')).backgroundColor);
      const one = (label) => { const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === label); const cs = getComputedStyle(b); const svg = b.querySelector('svg'); const fill = over(toRgb(cs.backgroundColor), tb); const glyph = over(toRgb(getComputedStyle(svg).color), fill); const bx = b.getBoundingClientRect(); return { rawBg: cs.backgroundColor, rawGlyph: getComputedStyle(svg).color, fill, glyph, ratio: ratio(glyph, fill), ratioFillVsToolbar: ratio(fill, tb), box: [bx.x, bx.y, bx.width, bx.height], label: b.getAttribute('aria-label'), title: b.title, keys: b.getAttribute('aria-keyshortcuts'), dp: b.dataset.playing ?? null, svgClass: svg.getAttribute('class') }; };
      return { toolbar: tb, play: one('Play'), stop: one('Stop') };
    });
    await page.mouse.move(2, 2);
    const r = { stopped: await read() };
    const playBox = await page.getByRole('button', { name: 'Play', exact: true }).boundingBox();
    await page.screenshot({ path: path.join(outDir, `onstate-stopped-${k}.png`), clip: { x: Math.max(0, playBox.x - 260), y: playBox.y - 12, width: 560, height: 56 } });
    await page.getByRole('button', { name: 'Play', exact: true }).click(); await page.mouse.move(2, 2); await sleep(800);
    r.playing = await read();
    await page.screenshot({ path: path.join(outDir, `onstate-playing-${k}.png`), clip: { x: Math.max(0, playBox.x - 260), y: playBox.y - 12, width: 560, height: 56 } });
    await page.getByRole('button', { name: 'Stop', exact: true }).click(); await sleep(300);
    r.errors = errors; await ctx.close();
    const S = r.stopped; const P = r.playing;
    r.checks = {
      differ: S.play.rawBg !== P.play.rawBg,
      contrastPlay: S.play.ratio >= 3 && P.play.ratio >= 3,
      contrastStop: S.stop.ratio >= 3 && P.stop.ratio >= 3,
      dpFlip: S.play.dp === 'false' && P.play.dp === 'true',
      constName: S.play.label === 'Play' && P.play.label === 'Play' && S.play.title === 'Play (Space)' && P.play.title === 'Play (Space)' && P.play.keys === 'Space',
      stopName: S.stop.label === 'Stop' && S.stop.title === 'Stop (Space)' && S.stop.keys === 'Space',
      boxStill: JSON.stringify(S.play.box) === JSON.stringify(P.play.box),
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async focus(browser, vp, k) {
    const r = {};
    const seq = async (page) => { await page.locator('body').focus(); await page.evaluate(() => document.activeElement?.blur()); const out = []; for (let i = 0; i < 160; i += 1) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'BODY'; const t = e.closest('[data-c256-toolbar]') ? 'T:' : ''; return t + (e.getAttribute('data-testid') ? e.getAttribute('data-testid') + '|' : '') + (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent.trim() || e.tagName).slice(0, 40); }); if (out.length && a === out[0]) break; out.push(a); } return out; };
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      await toolbarOf(page);
      r[tag] = { seq: await seq(page), errors };
      if (tag === 'new') {
        const ring = () => page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { who: e.getAttribute('aria-label'), fv: e.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`, shadow: cs.boxShadow }; });
        const stop = page.getByRole('button', { name: 'Stop', exact: true });
        await page.mouse.click(5, 5); await stop.click(); await page.mouse.move(2, 2); await sleep(300); r.mouseRing = await ring();
        await page.screenshot({ path: path.join(outDir, `focus-mouse-${k}.png`), clip: await (async () => { const b = await stop.boundingBox(); return { x: b.x - 40, y: b.y - 12, width: 112, height: 56 }; })() });
        await page.mouse.click(5, 5); await blur(page);
        await page.getByRole('button', { name: 'Play', exact: true }).focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await sleep(300); r.kbRing = await ring();
        await page.screenshot({ path: path.join(outDir, `focus-kb-${k}.png`), clip: await (async () => { const b = await stop.boundingBox(); return { x: b.x - 40, y: b.y - 12, width: 112, height: 56 }; })() });
        await page.mouse.click(5, 5); await stop.dblclick(); await sleep(400);
        r.afterDbl = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      }
      await ctx.close();
    }
    const strip = (s) => s.filter((x) => !x.startsWith('T:'));
    const tb = (s) => s.filter((x) => x.startsWith('T:'));
    r.newToolbar = tb(r.new.seq); r.headToolbar = tb(r.head.seq);
    const firstT = (s) => s.findIndex((x) => x.startsWith('T:'));
    r.nonToolbarSame = JSON.stringify(strip(r.new.seq)) === JSON.stringify(strip(r.head.seq));
    r.toolbarContiguous = [r.new.seq, r.head.seq].map((s) => { const i = firstT(s); const n = tb(s).length; return s.slice(i, i + n).every((x) => x.startsWith('T:')); });
    r.sameSet = JSON.stringify([...r.newToolbar].sort()) === JSON.stringify([...r.headToolbar, 'T:Stop'].sort());
    const lab = r.newToolbar.map((x) => x.replace(/^T:/, '').split('|').pop());
    const idx = (n) => lab.findIndex((x) => x.startsWith(n));
    r.checks = {
      orderEditCentreView: idx('Undo') < idx('Follow') && idx('Delete') < idx('Follow') && idx('Follow') < idx('Play') && idx('Play') < idx('Stop') && idx('Stop') < idx('Back to start') && idx('Back to start') < idx('Fit') && idx('Fit') < idx('Export'),
      ringKbOnly: r.kbRing.who === 'Stop' && r.kbRing.fv && !/none/.test(r.kbRing.outline) && r.mouseRing.who === 'Stop' && !r.mouseRing.fv && (/none/.test(r.mouseRing.outline) || /0px/.test(r.mouseRing.outline)),
      dblFocus: r.afterDbl === 'Stop',
      nonToolbarSame: r.nonToolbarSame,
      contiguous: r.toolbarContiguous.every(Boolean),
      sameSet: r.sameSet,
      errors: r.new.errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async sheet(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      await page.keyboard.press('Shift+Slash'); await sleep(600);
      r[tag] = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return null;
        const rows = [...dlg.querySelectorAll('[data-shortcut-id]')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), action: li.querySelector('span').textContent, keys: [...li.querySelectorAll('kbd')].map((x) => x.textContent), h: +li.getBoundingClientRect().height.toFixed(1) }));
        let sc = null; for (let e = dlg.querySelector('[data-shortcut-id]'); e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { sc = { sh: e.scrollHeight, ch: e.clientHeight, sw: e.scrollWidth, cw: e.clientWidth }; break; } }
        return { rows, sc, dlgSW: dlg.scrollWidth, dlgCW: dlg.clientWidth };
      });
      await shot(page, `sheet-${tag}`, k);
      await page.evaluate(() => document.querySelector('[role="dialog"] [data-shortcut-id="back-to-start"]')?.scrollIntoView({ block: 'center' })); await sleep(200); await shot(page, `sheet-bts-${tag}`, k);
      await page.keyboard.press('Escape'); await sleep(400);
      const btn = page.getByRole('button', { name: /Keyboard shortcuts/ }).first();
      if (await btn.count()) { await btn.click(); await sleep(500); r[tag + 'Opened'] = await page.locator('[role="dialog"]').count(); await page.keyboard.press('Escape'); await sleep(400); r[tag + 'AfterEsc'] = await page.evaluate(() => ({ open: !!document.querySelector('[role="dialog"]'), active: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 40) })); }
      r[tag + 'Errors'] = errors; await ctx.close();
    }
    const by = Object.fromEntries(r.new.rows.map((x) => [x.id, x])); const hb = Object.fromEntries(r.head.rows.map((x) => [x.id, x]));
    r.bts = by['back-to-start']; r.btsHead = hb['back-to-start'];
    r.otherDiffs = r.new.rows.filter((x) => x.id !== 'back-to-start' && (!hb[x.id] || hb[x.id].h !== x.h || hb[x.id].action !== x.action || JSON.stringify(hb[x.id].keys) !== JSON.stringify(x.keys)));
    r.headOnly = r.head.rows.filter((x) => !by[x.id]).map((x) => x.id);
    r.checks = {
      keys: JSON.stringify(r.bts?.keys) === JSON.stringify(['Home', 'Double-click Stop']) && r.bts.action === r.btsHead.action,
      rowH: r.bts?.h <= 40,
      bound: r.new.sc && r.new.sc.sh <= 1280 && r.new.sc.ch === (k === '1440x900' ? 808 : 646) && r.new.sc.sw === r.new.sc.cw && r.new.dlgSW === r.new.dlgCW,
      others: r.otherDiffs.length === 0 && r.headOnly.length === 0 && r.new.rows.length === r.head.rows.length,
      esc: r.newOpened === 1 && r.newAfterEsc && !r.newAfterEsc.open && /Keyboard shortcuts|Shortcuts/.test(r.newAfterEsc.active || ''),
      errors: r.newErrors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async budget(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { pulse: false, base });
      const inv = () => page.evaluate(() => {
        const rows = [];
        const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
        for (const el of document.body.querySelectorAll('*')) {
          if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
          const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
          if (!own || el.closest('.sr-only') || !vis(el)) continue;
          if (el.closest('[data-testid="arrangement-timeline-scroller"]')) continue;
          if (el.closest('[data-testid="arrangement-status"]')) continue;
          rows.push(own.slice(0, 140));
        }
        return rows;
      });
      const empty = await inv(); await page.screenshot({ path: path.join(outDir, `budget-empty-${tag}-${k}.png`) });
      await addPulse(page);
      const demo = await inv(); await page.screenshot({ path: path.join(outDir, `budget-demo-${tag}-${k}.png`) });
      r[tag] = { empty, demo, errors }; await ctx.close();
    }
    const diff = (a, b) => ({ added: a.filter((x) => !b.includes(x)), removed: b.filter((x) => !a.includes(x)) });
    r.counts = { newEmpty: r.new.empty.length, headEmpty: r.head.empty.length, newDemo: r.new.demo.length, headDemo: r.head.demo.length };
    r.emptyDiff = diff(r.new.empty, r.head.empty); r.demoDiff = diff(r.new.demo, r.head.demo);
    r.pass = r.counts.newEmpty === r.counts.headEmpty && r.counts.newDemo === r.counts.headDemo && r.new.errors.length === 0;
    delete r.new.empty; delete r.head.empty; delete r.new.demo; delete r.head.demo;
    return r;
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const r = {}; r.s0 = await st(page);
    await key(page, 'Space', 1200); r.playing = await st(page);
    await key(page, 'Space', 400);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 120000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `smoke-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.wav.sha256 === SHA && r.wav.nan === 0 && Math.abs(r.wav.seconds - 16) < 0.001 && errors.length === 0;
    await ctx.close(); return r;
  },
  async auth(browser, vp, k) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
    const tokenResponses = []; page.on('response', (res) => { if (res.url().includes('/api/studio-token')) tokenResponses.push(res.status()); });
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 150000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    await shot(page, 'auth-guard', k);
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    r.pageTokenResponses = tokenResponses;
    r.pass = r.labWorkspace === 1 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status !== 200 && r.tokenFake.status !== 200 && !tokenResponses.includes(200);
    await ctx.close(); return r;
  },
};
const VPS = { layout: [[1440, 900], [1280, 720], [1366, 768], [1408, 800], [1407, 800]] };
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const [name, fn] of Object.entries(ROWS)) {
    if (filter && !filter.test(name)) continue;
    const vps = (VPS[name] || [[1440, 900], [1280, 720]]).filter((v) => !onlyVp || String(v[0]) === onlyVp);
    for (const [w, h] of vps) {
      const k = `${w}x${h}`; const key2 = `${name}@${k}`; const t0 = Date.now();
      try { R.rows[key2] = await fn(browser, { width: w, height: h }, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.checks ? JSON.stringify(x.checks) : '', x.error ? x.error.slice(0, 300) : '');
      ck(`${key2} pass=${x.pass}`);
    }
  }
  await browser.close(); save();
})();
