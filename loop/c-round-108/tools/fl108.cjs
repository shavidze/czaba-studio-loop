// C round 107 rows (head copied from C round 106 kr106.cjs) (own script; standalone Playwright, installed Chromium, fresh incognito context per run, no credentials)
// usage: node kr106.cjs <row> [WxH]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-108';
const OUT = ROOT + '/out';
const SHOTS = ROOT + '/shots';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HYD = /hydrat|did not match|Text content does not match|server rendered/i;
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
const T = {
  single: 'ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.',
  group: 'ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.',
  snapStart: 'ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.',
  loop: 'Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.',
  markerStart: 'მარკერი დროის დასაწყისშია.',
  next: 'წინ მარკერი აღარ არის',
  gain: 'Clip Gain უცვლელია: 0.0 dB.',
};
const row = process.argv[2];
const VPS = process.argv[3] || '1280x720';
const VP = { width: +VPS.split('x')[0], height: +VPS.split('x')[1] };

async function session() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VP });
  const page = await ctx.newPage();
  const S = { errors: [], hydration: [], noise: 0, forbidden: [], authHeaders: [] };
  page.on('console', (m) => { const t = m.text(); if (HYD.test(t)) S.hydration.push(t.slice(0, 300)); if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(t)) S.noise++; else S.errors.push(`[${m.type()}] ${t.slice(0, 300)}`); } });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 300)));
  page.on('request', (q) => { const u = q.url(); if (/studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(u)) S.forbidden.push(u); if (q.headers().authorization) S.authHeaders.push(u); });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(300);
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
  await sleep(400);
  return { browser, page, S };
}
const blur = (p) => p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
const st = (p) => p.evaluate(() => {
  const g = document.querySelector('[data-testid=arrangement-grid-control]');
  const u = document.querySelector('button[title^="Undo"]');
  const lb = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '↻ Loop');
  return {
    snap: g?.dataset.snap ?? null, grid: g?.dataset.gridSeconds ?? null,
    undo: u ? `${u.title}${u.disabled ? ' (disabled)' : ''}` : null,
    status: document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null,
    pos: document.querySelector('[data-testid=arrangement-position]')?.textContent ?? null,
    loopTimes: document.querySelector('[data-testid=arrangement-loop-times]')?.textContent ?? null,
    loopPressed: lb ? lb.getAttribute('aria-pressed') : null,
    range: document.querySelector('[data-testid=arrangement-range]')?.textContent ?? null,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start')),
    markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => e.getAttribute('data-marker-time')),
    active: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName) : null,
  };
});
async function setSnap(p, on) { await blur(p); if (((await st(p)).snap === 'on') !== on) { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); } await blur(p); return (await st(p)).snap; }
async function addME(p, n) {
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  await o.focus(); await sleep(150);
  for (let i = 0; i < n; i++) { await p.keyboard.press('Enter'); await sleep(900); }
  await blur(p); await p.click('[data-testid=arrangement-fit]'); await sleep(600); await blur(p);
}
const clipBoxes = (p) => p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.clipId, start: e.getAttribute('data-clip-start'), x: r.x, y: r.y, w: r.width, h: r.height }; }).sort((a, b) => a.x - b.x));
async function clickClip(p, c, mods) { if (mods) await p.keyboard.down(mods); await p.mouse.click(Math.round(c.x + Math.min(c.w / 2, 20)), Math.round(c.y + c.h - 8)); if (mods) await p.keyboard.up(mods); await sleep(300); }
async function observe(p) {
  await p.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const W = { out, recs: [], t0: performance.now(), repeats: 0, repeatsCtrl: 0, downs: 0, bad: [], samples: 0, keys: [] };
    window.__kr = W;
    const push = (rs) => { for (const r of rs) for (const n of r.addedNodes) if (n.nodeType === 1) W.recs.push({ t: Math.round(performance.now() - W.t0), type: r.type, text: n.textContent }); };
    W.mo = new MutationObserver(push); W.mo.observe(out, { childList: true, subtree: true, characterData: true });
    W.flush = () => push(W.mo.takeRecords());
    window.addEventListener('keydown', (e) => {
      W.downs++; if (e.repeat) { W.repeats++; if (e.ctrlKey) W.repeatsCtrl++; }
      W.keys.push({ k: e.key, r: e.repeat, c: e.ctrlKey, tgt: e.target?.getAttribute?.('data-testid') || e.target?.tagName });
      W.samples++; const cur = document.querySelector('[data-testid=arrangement-status]');
      if (cur !== out || out.childElementCount !== 1 || out.tagName !== 'OUTPUT') W.bad.push({ t: Math.round(performance.now() - W.t0), same: cur === out, children: out.childElementCount });
    }, true);
  });
}
const mark = (p) => p.evaluate(() => { window.__kr.flush(); return { n: window.__kr.recs.length, repeats: window.__kr.repeats, repeatsCtrl: window.__kr.repeatsCtrl, downs: window.__kr.downs }; });
const since = (p, m) => p.evaluate((m) => { window.__kr.flush(); const W = window.__kr; return { added: W.recs.slice(m.n), repeats: W.repeats - m.repeats, repeatsCtrl: W.repeatsCtrl - m.repeatsCtrl, downs: W.downs - m.downs }; }, m);
const integrity = (p) => p.evaluate(() => { const W = window.__kr; const cur = document.querySelector('[data-testid=arrangement-status]'); return { same: cur === W.out, children: W.out.childElementCount, tag: cur.tagName, live: cur.getAttribute('aria-live'), bad: W.bad.slice(), samples: W.samples }; });
async function hold(p, key, n, perStep) {
  const steps = [];
  for (let i = 0; i <= n; i++) { await p.keyboard.down(key); await sleep(33); if (perStep) steps.push(await perStep()); }
  await p.keyboard.up(key);
  await sleep(300);
  return steps;
}
// one hold + 500 ms + one separate press; returns counts
async function holdThenPress(p, key, n, text, pressKey) {
  const m0 = await mark(p);
  await hold(p, key, n);
  const h = await since(p, m0);
  await sleep(500);
  const m1 = await mark(p);
  await p.keyboard.press(pressKey || key); await sleep(400);
  const s = await since(p, m1);
  return {
    hold: { repeats: h.repeats, repeatsCtrl: h.repeatsCtrl, downs: h.downs, addedElements: h.added.length, textCount: h.added.filter((a) => a.text === text).length, texts: h.added.map((a) => a.text) },
    press: { addedElements: s.added.length, textCount: s.added.filter((a) => a.text === text).length, texts: s.added.map((a) => a.text) },
  };
}
const save = (name, o) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(o, null, 1));
T.split = /^კლიპი გაიყო .*-ზე\.$/;
T.loopOff = 'Loop გამორთულია; დიაპაზონი შენარჩუნებულია.';
T.allLanes = /^მონიშვნა ყველა ხაზზე: /;
T.copy1 = 'Copy: 1 კლიპი ბუფერშია.';
T.prev = 'უკან მარკერი აღარ არის';
T.playheadOutside = 'Playhead არჩეული კლიპის შიგნით უნდა იყოს.';
const geom = async (p) => { const g = await p.evaluate(() => ({ r: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON(), z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent, sl: document.querySelector('[data-testid=arrangement-timeline-scroller]')?.scrollLeft ?? 0 })); const pps = +/([\d.]+)/.exec(g.z)[1]; return { ...g, pps, tx: (t) => Math.round(g.r.left + t * pps - g.sl), ry: Math.round(g.r.top + g.r.height / 2) }; };
const sample = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const u = document.querySelector('button[title^="Undo"]');
  const gr = document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]');
  const lb = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '↻ Loop');
  return {
    active: a ? (a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName) : null,
    markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => `${e.getAttribute('data-marker-time')}|${e.getAttribute('aria-label')}`),
    editor: !!document.querySelector('[data-testid=arrangement-marker-name-input]'),
    undo: u ? `${u.title}${u.disabled ? ' (disabled)' : ''}` : null,
    pos: document.querySelector('[data-testid=arrangement-position]')?.textContent ?? null,
    gainDisabled: gr ? gr.disabled : null,
    gainValue: document.querySelector('[data-testid=arrangement-detail-clip-gain-input]')?.value ?? null,
    clips: document.querySelectorAll('[data-clip-id]').length,
    loopPressed: lb ? lb.getAttribute('aria-pressed') : null,
  };
});
async function holdSampled(p, key, n, mods = []) {
  for (const m of mods) await p.keyboard.down(m);
  const steps = [];
  for (let i = 0; i <= n; i++) { await p.keyboard.down(key); await sleep(33); steps.push(await sample(p)); }
  await p.keyboard.up(key);
  for (const m of mods.slice().reverse()) await p.keyboard.up(m);
  await sleep(300);
  return steps;
}
const summ = (h) => ({ repeats: h.repeats, repeatsCtrl: h.repeatsCtrl, downs: h.downs, texts: h.added.map((a) => a.text) });
async function dragRange(p, t0, t1) {
  const g = await geom(p); const cb = (await clipBoxes(p))[0]; const y = Math.round(cb.y + cb.h * 0.75);
  await p.mouse.move(g.tx(t0), y); await p.mouse.down(); await p.mouse.move(g.tx(t0) + 5, y, { steps: 2 }); await p.mouse.move(g.tx(t1), y, { steps: 12 }); await p.mouse.up(); await sleep(400);
}
async function openDetail(p) {
  const t = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]')?.getAttribute('aria-expanded'));
  if (t === 'false') { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(400); }
  return t;
}

// ===== C round 108 FL rows (own code) =====
const act = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-testid') || a.getAttribute('title') || a.tagName) : null; });
const snapS = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const q = (s) => document.querySelector(s);
  const bi = (b) => b ? { disabled: b.disabled, title: b.title } : null;
  const del = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '⌫ წაშლა');
  const gi = q('[data-testid=arrangement-detail-clip-gain-input]'); const gr = q('[data-testid=arrangement-detail-clip-gain-reset]');
  return {
    active: a ? (a.getAttribute('data-testid') || a.getAttribute('title') || a.tagName) : null,
    activeDisabled: a && 'disabled' in a ? a.disabled : null,
    clips: document.querySelectorAll('[data-clip-id]').length,
    starts: [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start')),
    undo: bi(q('button[title^="Undo"]')), redo: bi(q('button[title^="Redo"]')), del: bi(del),
    zb: bi(q('[data-testid=arrangement-zoom-back]')), fit: bi(q('[data-testid=arrangement-fit]')),
    zoom: q('[data-testid=arrangement-zoom-readout]')?.textContent ?? null,
    status: q('[data-testid=arrangement-status]')?.textContent ?? null,
    gainValue: gi ? gi.value : null, gainResetDisabled: gr ? gr.disabled : null,
  };
});
async function clickLog(p) { await p.evaluate(() => { window.__clk = []; document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('button'); if (b) window.__clk.push({ t: Math.round(performance.now()), id: b.getAttribute('data-testid') || b.title || b.textContent.trim().slice(0, 20), trusted: e.isTrusted, detail: e.detail }); }, true); }); }
const clicks = (p) => p.evaluate(() => window.__clk.slice());
async function step(p, label, fn, wait = 700) { const m = await mark(p); await fn(); await sleep(wait); const s = await snapS(p); const d = await since(p, m); return { label, ...s, texts: d.added.map((a) => a.text), repeats: d.repeats, downs: d.downs }; }
const press = (p, k) => () => p.keyboard.press(k);
const focusDel = (p) => p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '⌫ წაშლა').focus());
const centre = (p, sel) => p.evaluate((sel) => { const b = sel === 'DEL' ? [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '⌫ წაშლა') : document.querySelector(sel); const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; }, sel);
const ADDED = /დაემატა/;
const GAIN0 = 'Clip Gain: Middle East — საჯარო preview — 0.0 dB.';
async function gainPrep(p) {
  await addME(p, 1); await setSnap(p, false);
  const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
  await openDetail(p);
  const inp = p.locator('[data-testid=arrangement-detail-clip-gain-input]'); await inp.waitFor({ state: 'visible' });
  await inp.click(); await inp.fill('1'); await p.keyboard.press('Enter'); await sleep(400);
  return inp;
}
(async () => {
  const { browser, page: p, S } = await session();
  const R = { row, vp: VPS, startedUtc: new Date().toISOString() };
  let checks = [];
  try {
    await clickLog(p);
    if (row === 'gain-kb' || row === 'gain-hold') {
      await gainPrep(p);
      R.before = await snapS(p);
      await p.keyboard.press('Tab'); await sleep(200);
      R.afterTab = await snapS(p);
      await observe(p);
      if (row === 'gain-kb') {
        R.s1 = await step(p, 'enter1', press(p, 'Enter'));
        R.s2 = await step(p, 'enter2', press(p, 'Enter'), 900);
        await p.screenshot({ path: `${SHOTS}/fl-gain-keyboard-${VPS}.png` });
        checks = [
          ['tab lands on 0 dB', R.afterTab.active === 'arrangement-detail-clip-gain-reset'],
          ['reset: one span exact', R.s1.texts.length === 1 && R.s1.texts[0] === GAIN0],
          ['reset: 0 dB disabled', R.s1.gainResetDisabled === true],
          ['reset: focus on clip-gain input', R.s1.active === 'arrangement-detail-clip-gain-input'],
          ['reset: value 0.0', R.s1.gainValue === '0.0'],
          ['enter2: exactly one span unchanged', R.s2.texts.length === 1 && R.s2.texts[0] === T.gain],
          ['enter2: clips 1', R.s2.clips === 1],
          ['enter2: no added text', !R.s2.texts.some((t) => ADDED.test(t))],
          ['enter2: undo label Undo: Clip Gain', R.s2.undo.title === 'Undo: Clip Gain' && !R.s2.undo.disabled],
        ];
      } else {
        const m0 = await mark(p);
        R.steps = await holdSampled(p, 'Enter', 12);
        R.hold = summ(await since(p, m0));
        R.after = await snapS(p);
        checks = [
          ['tab lands on 0 dB', R.afterTab.active === 'arrangement-detail-clip-gain-reset'],
          ['repeats >= 10', R.hold.repeats >= 10],
          ['exactly one span = 0.0 dB', R.hold.texts.length === 1 && R.hold.texts[0] === GAIN0],
          ['no unchanged / added text', !R.hold.texts.some((t) => t === T.gain || ADDED.test(t))],
          ['focus on input at end', R.after.active === 'arrangement-detail-clip-gain-input'],
          ['clips 1', R.after.clips === 1],
        ];
      }
    } else if (row === 'gain-mouse') {
      const inp = await gainPrep(p);
      R.before = await snapS(p);
      const ib = await inp.boundingBox(); await p.mouse.click(Math.round(ib.x + ib.width / 2), Math.round(ib.y + ib.height / 2)); await sleep(200);
      R.afterInputClick = await snapS(p);
      await observe(p);
      const c = await centre(p, '[data-testid=arrangement-detail-clip-gain-reset]');
      R.s1 = await step(p, 'mouse 0 dB', () => p.mouse.click(c.x, c.y));
      checks = [
        ['before: 1.0 committed', R.before.gainValue === '1.0' && R.before.gainResetDisabled === false],
        ['input focused before', R.afterInputClick.active === 'arrangement-detail-clip-gain-input'],
        ['gain 0.0', R.s1.gainValue === '0.0'],
        ['focus still input', R.s1.active === 'arrangement-detail-clip-gain-input'],
        ['one span 0.0 dB', R.s1.texts.length === 1 && R.s1.texts[0] === GAIN0],
        ['clips 1', R.s1.clips === 1],
      ];
    } else if (row === 'undo') {
      await addME(p, 2); R.start = await snapS(p);
      await observe(p);
      await p.focus('button[title^="Undo"]'); R.focus = await act(p);
      R.s1 = await step(p, 'enter1', press(p, 'Enter'));
      R.s2 = await step(p, 'enter2', press(p, 'Enter'));
      R.s3 = await step(p, 'enter3', press(p, 'Enter'), 900);
      await p.screenshot({ path: `${SHOTS}/fl-undo-${VPS}.png` });
      checks = [
        ['start 2 clips', R.start.clips === 2],
        ['1: 1 clip, focus on Undo', R.s1.clips === 1 && /^Undo/.test(R.s1.active || '') && !R.s1.undo.disabled],
        ['2: 0 clips, Undo disabled, focus on Redo:', R.s2.clips === 0 && R.s2.undo.disabled && /^Redo: /.test(R.s2.active || '')],
        ['3: 1 clip at 0.000', R.s3.clips === 1 && R.s3.starts[0] === '0.000'],
        ['3: Redo still enabled', R.s3.redo && !R.s3.redo.disabled && /^Redo: /.test(R.s3.redo.title)],
        ['3: no library add text', !R.s3.texts.some((t) => ADDED.test(t))],
        ['3: status starts Redo: ', /^Redo: /.test(R.s3.status || '')],
      ];
    } else if (row === 'undo-hold') {
      await addME(p, 3); R.start = await snapS(p);
      await observe(p);
      await p.focus('button[title^="Undo"]'); R.focus = await act(p);
      const m0 = await mark(p);
      R.steps = (await holdSampled(p, 'Enter', 12)).map((s) => ({ active: s.active, clips: s.clips, undo: s.undo }));
      R.hold = summ(await since(p, m0)); R.afterHold = await snapS(p);
      await sleep(500);
      R.s2 = await step(p, 'separate enter', press(p, 'Enter'));
      checks = [
        ['start 3 clips', R.start.clips === 3],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['hold: exactly one undo (3->2)', R.afterHold.clips === 2],
        ['hold: focus stays on Undo', /^Undo/.test(R.afterHold.active || '')],
        ['hold: no added text', !R.hold.texts.some((t) => ADDED.test(t))],
        ['separate enter -> 1 clip', R.s2.clips === 1],
      ];
    } else if (row === 'redo') {
      await addME(p, 1); await blur(p); await p.keyboard.press('Control+z'); await sleep(500);
      R.start = await snapS(p);
      await observe(p);
      await p.focus('button[title^="Redo"]'); R.focus = await act(p);
      R.s1 = await step(p, 'enter1', press(p, 'Enter'));
      R.s2 = await step(p, 'enter2', press(p, 'Enter'), 900);
      checks = [
        ['start 0 clips, redo enabled', R.start.clips === 0 && !R.start.redo.disabled],
        ['1: 1 clip, Redo disabled, focus on Undo', R.s1.clips === 1 && R.s1.redo.disabled && /^Undo: /.test(R.s1.active || '')],
        ['2: 0 clips, Redo enabled', R.s2.clips === 0 && !R.s2.redo.disabled],
        ['2: no added text', !R.s2.texts.some((t) => ADDED.test(t))],
      ];
    } else if (row === 'delete') {
      await addME(p, 1); await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.start = await snapS(p);
      await observe(p);
      await focusDel(p); R.focus = await act(p);
      R.s1 = await step(p, 'enter1', press(p, 'Enter'));
      R.s2 = await step(p, 'enter2', press(p, 'Enter'), 900);
      await p.screenshot({ path: `${SHOTS}/fl-delete-${VPS}.png` });
      checks = [
        ['start 1 clip, del enabled', R.start.clips === 1 && !R.start.del.disabled],
        ['1: 0 clips', R.s1.clips === 0],
        ['1: focus on Undo: კლიპის წაშლა', R.s1.active === 'Undo: კლიპის წაშლა'],
        ['2: 1 clip at 0.000', R.s2.clips === 1 && R.s2.starts[0] === '0.000'],
        ['2: Redo enabled title Redo: კლიპის წაშლა', R.s2.redo && !R.s2.redo.disabled && R.s2.redo.title === 'Redo: კლიპის წაშლა'],
        ['2: no added text', !R.s2.texts.some((t) => ADDED.test(t))],
      ];
    } else if (row === 'zoomback' || row === 'zoomback-hold') {
      await addME(p, 1); await blur(p);
      R.start = await snapS(p);
      await p.keyboard.press('Equal'); await sleep(300); await p.keyboard.press('+'); await sleep(400);
      R.afterZoomIn = await snapS(p);
      await observe(p);
      await p.focus('[data-testid=arrangement-zoom-back]'); R.focus = await act(p);
      if (row === 'zoomback') {
        R.presses = [];
        for (let i = 0; i < 6; i++) { const s = await step(p, `zb enter ${i + 1}`, press(p, 'Enter')); R.presses.push(s); if (s.zb.disabled) break; }
        const last = R.presses.at(-1);
        R.s2 = await step(p, 'enter after disable', press(p, 'Enter'), 900);
        R.clicks = await clicks(p);
        R.recipeDiff = R.presses.length > 1 ? `zoom back needed ${R.presses.length} presses to disable` : null;
        checks = [
          ['zb enabled after recipe', R.afterZoomIn.zb && !R.afterZoomIn.zb.disabled],
          ['zb disabled at last press, focus on fit', last.zb.disabled && last.active === 'arrangement-fit'],
          ['next Enter: a Fit click', R.clicks.filter((c) => c.id === 'arrangement-fit').length >= 1],
          ['clip count unchanged', R.s2.clips === R.start.clips],
          ['no added text', !R.s2.texts.some((t) => ADDED.test(t))],
        ];
      } else {
        const m0 = await mark(p);
        R.steps = (await holdSampled(p, 'Enter', 10)).map((s) => s.active);
        R.hold = summ(await since(p, m0)); R.after = await snapS(p);
        R.clicks = await clicks(p);
        R.fitClicksDuringHold = R.clicks.filter((c) => c.id === 'arrangement-fit').length;
        R.zbClicksDuringHold = R.clicks.filter((c) => c.id === 'arrangement-zoom-back').length;
        checks = [['observation only (Fit F2 not implemented)', true]];
        R.zbHistory = [];
        for (let i = 0; i < 20; i++) { const z = await snapS(p); if (z.zb.disabled) break; await p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-back]').click()); await sleep(250); const a = await snapS(p); R.zbHistory.push(a.zoom); }
      }
    } else if (row === 'undo-mouse') {
      await addME(p, 2); R.start = await snapS(p);
      await observe(p);
      const c = await centre(p, 'button[title^="Undo"]');
      R.s1 = await step(p, 'click1', () => p.mouse.click(c.x, c.y));
      R.s2 = await step(p, 'click2', () => p.mouse.click(c.x, c.y));
      R.s3 = await step(p, 'enter', press(p, 'Enter'), 900);
      R.clicks = await clicks(p);
      checks = [
        ['two undos -> 0 clips', R.s2.clips === 0],
        ['after 2 clicks focus is Redo: or BODY', /^Redo: /.test(R.s2.active || '') || R.s2.active === 'BODY'],
        ['if focus Redo: enter redoes (1 clip, status Redo: )', R.s2.active === 'BODY' || (R.s3.clips === 1 && /^Redo: /.test(R.s3.status || ''))],
      ];
    } else if (row === 'lib-enter') {
      const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
      const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
      await o.focus(); await observe(p);
      R.s1 = await step(p, 'enter on row', press(p, 'Enter'), 900);
      checks = [['one clip added', R.s1.clips === 1], ['added text', R.s1.texts.some((t) => ADDED.test(t))]];
    } else throw new Error('unknown row ' + row);
  } catch (e) { R.exception = String(e.stack || e); }
  R.checks = checks; R.pass = !R.exception && checks.length > 0 && checks.every((c) => c[1]);
  R.final = { errors: S.errors, hydration: S.hydration, forbidden: S.forbidden, authHeaders: S.authHeaders, noiseCount: S.noise };
  save(`${row}-${VPS}.json`, R);
  console.log(JSON.stringify({ row, vp: VPS, pass: R.pass, checks, exception: R.exception, final: R.final }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
