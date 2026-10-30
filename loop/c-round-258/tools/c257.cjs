// C round 257: SABA-B-9 stage 1 fix-up (C, independent). usage: node c257.cjs <rowRegex> [onlyVp]
const path = require('node:path');
const fs = require('node:fs');
var crypto = require('node:crypto');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173';
var outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/r257';
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)'));
eval(helpers.replace('const sleep', 'var sleep').replace('const SHA', 'var SHA').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const helpers2 = src.slice(src.indexOf('const geo = (page)'), src.indexOf('const ROWS')).split('\n').filter((l) => !/^const (HEADB|MEDIA|INK) =/.test(l)).join('\n');
eval(helpers2.replace(/^async function (\w+)/gm, 'var $1 = async function').replace(/^const (\w+) =/gm, 'var $1 ='));
const HEADB = 'http://127.0.0.1:5180';
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const onlyVp = process.argv[3] || null;
const resultFile = path.join(outDir, 'c257.json');
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
  t?.setAttribute('data-c257-toolbar', '1');
  return !!t;
});
const geometry = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`);
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) }; };
  const root = document.querySelector('[data-c257-toolbar]');
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

const REF256 = {
  '1440x900': { h: 49, tops: { library: 84, dock: 84, ruler: 191, firstLane: 275 }, seqLen: 80, budget: { empty: 85, demo: 101 } },
  '1280x720': { h: 87, tops: { library: 122, dock: 122, ruler: 229, firstLane: 313 }, seqLen: 75, budget: { empty: 69, demo: 85 } },
};
const REF_TOOLBAR = ['Undo', 'Split', 'Delete', 'Follow', 'Play', 'Stop', 'Back to start', 'Zoom', 'Fit', 'Export'];
const ax = async (page, cdp) => {
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const one = async (sel) => {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
    if (!nodeId) return null;
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const n = nodes[0];
    const prop = (p) => n.properties?.find((x) => x.name === p)?.value?.value ?? null;
    return { role: n.role?.value, name: n.name?.value ?? null, desc: n.description?.value ?? null, ignored: n.ignored, keys: prop('keyshortcuts'), focusable: prop('focusable') };
  };
  const play = await one('[data-testid="arrangement-transport-centre"] button[aria-label="Play"]');
  const stop = await one('[data-testid="arrangement-transport-centre"] button[aria-label="Stop"]');
  const dom = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="arrangement-playback-state"]');
    const p = document.querySelector('button[aria-label="Play"]'); const t = document.querySelector('button[aria-label="Stop"]');
    return { stateText: s?.textContent ?? null, stateCount: document.querySelectorAll('[data-testid="arrangement-playback-state"]').length, hidden: s?.hasAttribute('hidden'), display: s ? getComputedStyle(s).display : null, tabindex: s?.getAttribute('tabindex'), live: s?.getAttribute('aria-live'), role: s?.getAttribute('role'), inCentre: !!s?.closest('[data-testid="arrangement-transport-centre"]'), id: s?.id, playRef: p?.getAttribute('aria-describedby'), stopRef: t?.getAttribute('aria-describedby'), playTitle: p?.title, stopTitle: t?.title, dp: p?.dataset.playing, activeIsState: document.activeElement === s, refs: [...document.querySelectorAll('[aria-describedby],[aria-labelledby]')].filter((e) => s && ((e.getAttribute('aria-describedby') || '').split(/\s+/).includes(s.id) || (e.getAttribute('aria-labelledby') || '').split(/\s+/).includes(s.id))).map((e) => e.getAttribute('aria-label')) };
  });
  return { play, stop, dom };
};
const ROWS = {
  async a11y(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const o = await origin(page); await laneClick(page, o, 2); await blur(page);
    const cdp = await ctx.newCDPSession(page); await cdp.send('Accessibility.enable');
    const snap = async (label) => { const s = await st(page); const a = await ax(page, cdp); return { label, playing: s.playing, dp: s.dp, ph: s.ph, m: s.m, rms: s.rms, statusN: s.statusN, status: s.status, active: s.active, ...a }; };
    const play = page.getByRole('button', { name: 'Play', exact: true }); const stop = page.getByRole('button', { name: 'Stop', exact: true });
    const steps = [];
    steps.push(await snap('stopped'));
    await play.click(); await page.mouse.move(2, 2); await sleep(700); steps.push(await snap('playing-click'));
    steps[1].aria = await page.getByTestId('arrangement-transport-centre').ariaSnapshot();
    await play.click(); await sleep(400); steps.push(await snap('play-again'));
    await stop.click(); await sleep(400); steps.push(await snap('after-stop'));
    steps[3].aria = await page.getByTestId('arrangement-transport-centre').ariaSnapshot();
    await page.mouse.click(5, 5); await blur(page);
    await key(page, 'Space', 700); steps.push(await snap('space-play'));
    await key(page, 'Space', 500); steps.push(await snap('space-stop'));
    await play.click(); await sleep(900); steps.push(await snap('before-dbl'));
    await stop.dblclick(); await sleep(500); steps.push(await snap('after-dbl-stop'));
    const stateBox = await page.getByTestId('arrangement-playback-state').boundingBox();
    const focusTry = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-playback-state"]'); s.focus(); return document.activeElement === s; });
    const r = { steps, stateBox, focusTry, errors };
    const want = { stopped: 'Stopped', 'playing-click': 'Playing', 'play-again': 'Playing', 'after-stop': 'Stopped', 'space-play': 'Playing', 'space-stop': 'Stopped', 'before-dbl': 'Playing', 'after-dbl-stop': 'Stopped' };
    const statusOnPlay = steps[1].statusN - steps[0].statusN;
    r.statusOnPlay = statusOnPlay;
    r.checks = {
      descriptions: steps.every((s) => s.play?.desc === want[s.label] && s.stop?.desc === want[s.label] && s.dom.stateText === want[s.label]),
      playingTruth: steps.every((s) => (want[s.label] === 'Playing') === (s.dp === 'true')),
      audio: steps.filter((s) => want[s.label] === 'Playing').every((s) => s.rms > 0.001) && steps.filter((s) => want[s.label] === 'Stopped' && s.label !== 'stopped').every((s) => s.rms < 0.001),
      names: steps.every((s) => s.play?.name === 'Play' && s.stop?.name === 'Stop' && s.play.role === 'button' && s.stop.role === 'button'),
      titles: steps.every((s) => s.dom.playTitle === 'Play (Space)' && s.dom.stopTitle === 'Stop (Space)'),
      keys: steps.every((s) => s.play?.keys === 'Space' && s.stop?.keys === 'Space'),
      element: steps.every((s) => s.dom.stateCount === 1 && s.dom.hidden && s.dom.display === 'none' && s.dom.tabindex === null && s.dom.live === null && s.dom.role === null && s.dom.inCentre && s.dom.playRef === s.dom.id && s.dom.stopRef === s.dom.id && JSON.stringify(s.dom.refs) === '["Play","Stop"]' && !s.dom.activeIsState),
      noBox: stateBox === null,
      neverFocused: !focusTry,
      noPause: steps.every((s) => !/Pause/.test(s.aria || '')),
      errors: errors.length === 0,
    };
    r.dv1StatusChangedOnPlay = statusOnPlay !== 0;
    r.pass = Object.values(r.checks).every(Boolean);
    await ctx.close(); return r;
  },
  async keys(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const o = await origin(page); await laneClick(page, o, 2); await blur(page);
    const cdp = await ctx.newCDPSession(page); await cdp.send('Accessibility.enable');
    await page.evaluate(() => { window.__clicks = []; for (const l of ['Play', 'Stop']) document.querySelector(`button[aria-label="${l}"]`).addEventListener('click', (e) => window.__clicks.push(l + ':' + e.detail)); window.__rep = 0; window.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.repeat) window.__rep += 1; }, true); });
    const tabTo = async (label) => { await page.mouse.click(5, 5); await blur(page); await page.locator('body').focus(); for (let i = 0; i < 200; i += 1) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')); if (a === label) return i + 1; } return -1; };
    const r = {};
    r.tabsToPlay = await tabTo('Play'); const a0 = await st(page); const d0 = await ax(page, cdp);
    await page.keyboard.press('Space'); await sleep(700); const a1 = await st(page); const d1 = await ax(page, cdp);
    r.spaceOnPlay = { before: [a0.playing, d0.play.desc], after: [a1.playing, d1.play.desc, a1.rms], active: a1.active };
    r.tabsToStop = await tabTo('Stop'); const b0 = await st(page);
    await page.keyboard.press('Space'); await sleep(700); const b1 = await st(page); const db1 = await ax(page, cdp);
    r.spaceOnStop = { before: b0.playing, after: [b1.playing, db1.stop.desc, db1.play.desc], active: b1.active };
    r.clicksFromSpace = await page.evaluate(() => window.__clicks.slice());
    await page.getByRole('button', { name: 'Play', exact: true }).click(); await sleep(700);
    await page.getByRole('button', { name: 'Stop', exact: true }).focus(); await sleep(100);
    const h0 = await st(page);
    const ev = { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' };
    const c0 = await page.evaluate(() => window.__clicks.length);
    await cdp.send('Input.dispatchKeyEvent', ev); await sleep(250); const h1 = await st(page);
    for (let i = 0; i < 20; i += 1) { await cdp.send('Input.dispatchKeyEvent', { ...ev, autoRepeat: true }); await sleep(40); }
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await sleep(500); const h2 = await st(page); const dh = await ax(page, cdp);
    r.holdEnterStop = { h0: [h0.playing, h0.statusN], h1: [h1.playing, h1.ph, h1.statusN], h2: [h2.playing, h2.ph, h2.statusN, h2.rms], desc: dh.stop.desc, clicksDuringHold: (await page.evaluate(() => window.__clicks.length)) - c0, repeats: await page.evaluate(() => window.__rep) };
    r.errors = errors; await ctx.close();
    r.checks = {
      spacePlay: r.tabsToPlay > 0 && !a0.playing && d0.play.desc === 'Stopped' && a1.playing && d1.play.desc === 'Playing' && d1.stop.desc === 'Playing' && a1.rms > 0.001 && /Play/.test(a1.active),
      spaceStop: r.tabsToStop > 0 && b0.playing && !b1.playing && db1.stop.desc === 'Stopped' && db1.play.desc === 'Stopped',
      noNativeClickFromSpace: r.clicksFromSpace.length === 0,
      holdEnterOneStop: h0.playing && !h1.playing && !h2.playing && h2.ph === h1.ph && h2.statusN === h1.statusN && r.holdEnterStop.clicksDuringHold === 1 && dh.stop.desc === 'Stopped' && r.holdEnterStop.repeats >= 20,
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async focus(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    await toolbarOf(page);
    await page.locator('body').focus(); await page.evaluate(() => document.activeElement?.blur());
    const seq = []; for (let i = 0; i < 160; i += 1) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'BODY'; const t = e.closest('[data-c257-toolbar]') ? 'T:' : ''; return t + (e.getAttribute('data-testid') ? e.getAttribute('data-testid') + '|' : '') + (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent.trim() || e.tagName).slice(0, 40); }); if (seq.length && a === seq[0]) break; seq.push(a); }
    const r = { seqLen: seq.length, toolbar: seq.filter((x) => x.startsWith('T:')), stateFocused: seq.some((x) => x.includes('arrangement-playback-state')) };
    const ring = () => page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { who: e.getAttribute('aria-label'), fv: e.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}` }; });
    const stop = page.getByRole('button', { name: 'Stop', exact: true });
    await page.mouse.click(5, 5); await stop.click(); await page.mouse.move(2, 2); await sleep(300); r.mouseRing = await ring();
    const clip = async () => { const b = await stop.boundingBox(); return { x: b.x - 40, y: b.y - 12, width: 112, height: 56 }; };
    await page.screenshot({ path: path.join(outDir, `focus-mouse-${k}.png`), clip: await clip() });
    await page.mouse.click(5, 5); await blur(page);
    await page.getByRole('button', { name: 'Play', exact: true }).focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await sleep(300); r.kbRing = await ring();
    await page.screenshot({ path: path.join(outDir, `focus-kb-${k}.png`), clip: await clip() });
    await page.mouse.click(5, 5); await page.getByRole('button', { name: 'Play', exact: true }).click(); await sleep(600); await stop.dblclick(); await sleep(400);
    r.afterDbl = await page.evaluate(() => [document.activeElement?.getAttribute('aria-label'), document.activeElement?.matches(':focus-visible')]);
    r.errors = errors; await ctx.close();
    const lab = r.toolbar.map((x) => x.replace(/^T:/, '').split('|').pop());
    r.labels = lab;
    r.checks = {
      toolbarOrder: lab.length === REF_TOOLBAR.length && REF_TOOLBAR.every((p, i) => lab[i].startsWith(p)),
      seqLen: r.seqLen === REF256[k].seqLen,
      stateNotTabStop: !r.stateFocused,
      ringKbOnly: r.kbRing.who === 'Stop' && r.kbRing.fv && !/none/.test(r.kbRing.outline) && r.mouseRing.who === 'Stop' && !r.mouseRing.fv,
      dblFocus: r.afterDbl[0] === 'Stop',
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async layout(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    await toolbarOf(page); await sleep(300);
    const g = await geometry(page); await shot(page, 'layout', k);
    await page.getByRole('button', { name: 'Play', exact: true }).click(); await page.mouse.move(2, 2); await sleep(700);
    const gp = await geometry(page); await shot(page, 'layout-playing', k);
    await page.getByRole('button', { name: 'Stop', exact: true }).click(); await sleep(300);
    const r = { g, playing: { toolbar: gp.toolbar, centre: gp.rects?.centre }, errors }; await ctx.close();
    const ref = REF256[k];
    r.checks = {
      height: g.toolbar.h === ref.h && gp.toolbar.h === ref.h,
      centred: Math.abs(g.centreOffset) <= 24,
      tops: ['library', 'dock', 'ruler', 'firstLane'].every((t) => g.tops[t] != null && Math.abs(g.tops[t] - ref.tops[t]) <= 1),
      noOverlap: g.overlaps.every((x) => !x),
      noOverflow: g.rootOverflow === 0 && Object.values(g.groupOverflow).every((x) => x === 0),
      centreStableWhilePlaying: JSON.stringify(g.rects.centre) === JSON.stringify(gp.rects.centre),
      order: JSON.stringify(g.childOrder.centre.filter((x) => x !== 'SEP' && x !== '')) === JSON.stringify(['Follow', 'CLOCK', 'Play', 'Stop', 'Back to start', 'Loop']),
      errors: errors.length === 0,
    };
    r.centreChildren = g.childOrder.centre;
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: false });
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
    const empty = await inv(); await page.screenshot({ path: path.join(outDir, `budget-empty-${k}.png`) });
    await addPulse(page);
    const demo = await inv(); await page.screenshot({ path: path.join(outDir, `budget-demo-${k}.png`) });
    await page.getByRole('button', { name: 'Play', exact: true }).click(); await page.mouse.move(2, 2); await sleep(600);
    const playingLines = await inv(); await page.getByRole('button', { name: 'Stop', exact: true }).click();
    const r = { counts: { empty: empty.length, demo: demo.length, demoPlaying: playingLines.length }, stateWordVisible: [...empty, ...demo, ...playingLines].some((x) => x === 'Playing' || x === 'Stopped'), errors };
    await ctx.close();
    r.pass = r.counts.empty === REF256[k].budget.empty && r.counts.demo === REF256[k].budget.demo && !r.stateWordVisible && errors.length === 0;
    return r;
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
const VPS = {};
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
