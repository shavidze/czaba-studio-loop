// C round 107 rows (head copied from C round 106 kr106.cjs) (own script; standalone Playwright, installed Chromium, fresh incognito context per run, no credentials)
// usage: node kr106.cjs <row> [WxH]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-107';
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

(async () => {
  const { browser, page: p, S } = await session();
  const R = { row, vp: VPS, startedUtc: new Date().toISOString() };
  let checks = [];
  try {
    if (row === 'ctrl-l') {
      await addME(p, 1);
      R.snap = await setSnap(p, true);
      await dragRange(p, 3, 12);
      R.afterDrag = await st(p);
      await blur(p); await p.keyboard.press('Control+l'); await sleep(400);
      R.afterCreate = await st(p);
      await blur(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'l', 11, ['Control']);
      const h = await since(p, m0); R.hold = summ(h);
      R.afterHold = await st(p);
      await p.screenshot({ path: `${SHOTS}/hk-ctrl-l-${VPS}.png` });
      await blur(p); await p.keyboard.press('Control+z'); await sleep(400);
      R.afterUndo = await st(p);
      const m1 = await mark(p);
      await p.keyboard.press('Control+l'); await sleep(400);
      R.press = summ(await since(p, m1));
      R.afterPress = await st(p);
      R.integ = await integrity(p);
      checks = [
        ['loop created (pressed true) before hold', R.afterCreate.loopPressed === 'true'],
        ['ctrl repeats >= 10', R.hold.repeatsCtrl >= 10],
        ['aria-pressed false at every step (changed once)', R.steps.every((s) => s.loopPressed === 'false')],
        ['hold: exactly one span, loopOff', R.hold.texts.length === 1 && R.hold.texts[0] === T.loopOff],
        ['undo label Undo: Loop გამორთვა', /^Undo: Loop გამორთვა/.test(R.afterHold.undo || '')],
        ['Ctrl+Z -> pressed true', R.afterUndo.loopPressed === 'true'],
        ['separate Ctrl+L -> false + one loopOff', R.afterPress.loopPressed === 'false' && R.press.texts.length === 1 && R.press.texts[0] === T.loopOff],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'ctrl-e') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const g = await geom(p); await p.mouse.click(g.tx(10), g.ry); await sleep(300);
      R.posAfterRuler = (await st(p)).pos;
      const cb = await clipBoxes(p); await p.mouse.click(g.tx(10), Math.round(cb[0].y + cb[0].h - 8)); await sleep(300); await blur(p);
      R.recipe = 'ruler click at t=10 (Snap off), then select the clip by clicking its title strip at the same x (a title-strip click also moves the playhead)';
      R.before = await st(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'e', 11, ['Control']);
      R.hold = summ(await since(p, m0));
      R.afterHold = await st(p);
      await p.screenshot({ path: `${SHOTS}/hk-ctrl-e-${VPS}.png` });
      await blur(p); await p.keyboard.press('Control+z'); await sleep(400);
      R.afterUndo = await st(p); R.integ = await integrity(p);
      checks = [
        ['playhead at ~10 s', /00:1[0]\./.test(R.before.pos || '') || /00:09\.9/.test(R.before.pos || '')],
        ['ctrl repeats >= 10', R.hold.repeatsCtrl >= 10],
        ['clips 1 -> 2 at every step', R.before.clips.length === 1 && R.steps.every((s) => s.clips === 2)],
        ['exactly one span, split text', R.hold.texts.length === 1 && T.split.test(R.hold.texts[0])],
        ['no playhead-outside text', !R.hold.texts.includes(T.playheadOutside)],
        ['Ctrl+Z -> 1 clip', R.afterUndo.clips.length === 1],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'ctrl-shift-l') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      await dragRange(p, 3, 12);
      R.before = await st(p); await blur(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'L', 11, ['Control', 'Shift']);
      R.hold = summ(await since(p, m0));
      R.after = await st(p); R.integ = await integrity(p);
      R.keys = await p.evaluate(() => window.__kr.keys.slice(0, 4));
      await p.screenshot({ path: `${SHOTS}/hk-ctrl-shift-l-${VPS}.png` });
      checks = [
        ['range exists before', !!R.before.range],
        ['ctrl repeats >= 10', R.hold.repeatsCtrl >= 10],
        ['exactly one span, all-lanes text', R.hold.texts.length === 1 && T.allLanes.test(R.hold.texts[0])],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'ctrl-c') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.collapsed = await p.evaluate(() => { const s = window.getSelection(); return s ? s.isCollapsed : null; });
      R.before = await st(p);
      await observe(p);
      await p.evaluate(() => { window.__kc = []; window.addEventListener('keydown', (e) => { if (e.ctrlKey && e.code === 'KeyC') setTimeout(() => window.__kc.push({ r: e.repeat, prevented: e.defaultPrevented }), 0); }, true); });
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'c', 11, ['Control']);
      R.hold = summ(await since(p, m0));
      await sleep(500);
      const m1 = await mark(p);
      await p.keyboard.press('Control+c'); await sleep(400);
      R.press = summ(await since(p, m1));
      R.prevented = await p.evaluate(() => window.__kc);
      R.after = await st(p); R.integ = await integrity(p);
      checks = [
        ['selection collapsed (valid)', R.collapsed !== false],
        ['ctrl repeats >= 10', R.hold.repeatsCtrl >= 10],
        ['hold: one copy span', R.hold.texts.length === 1 && R.hold.texts[0] === T.copy1],
        ['press: one more copy span', R.press.texts.length === 1 && R.press.texts[0] === T.copy1],
        ['every Ctrl+C keydown prevented', R.prevented.length >= 12 && R.prevented.every((x) => x.prevented)],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'undo-repeats') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await sleep(250); }
      R.afterRight = await st(p); await blur(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'z', 2, ['Control']);
      R.hold = summ(await since(p, m0));
      R.after = await st(p);
      checks = [
        ['moved to 0.300', R.afterRight.clips[0] === '0.300'],
        ['ctrl repeats == 2', R.hold.repeatsCtrl === 2],
        ['back at 0.000 (three undo steps)', R.after.clips[0] === '0.000'],
      ];
    } else if (row === 'marker-prev') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      await blur(p); await p.keyboard.press('Home'); await sleep(300);
      await p.locator('[data-testid=arrangement-marker-prev]').focus(); await sleep(150);
      R.before = await sample(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'Enter', 11);
      R.hold = summ(await since(p, m0));
      await sleep(500);
      R.activeBeforePress = (await sample(p)).active;
      const m1 = await mark(p);
      await p.keyboard.press('Enter'); await sleep(400);
      R.press = summ(await since(p, m1));
      R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/he-marker-prev-${VPS}.png` });
      checks = [
        ['no markers, focus on prev', R.before.markers.length === 0 && R.before.active === 'arrangement-marker-prev'],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['hold: prev text once, nothing else', R.hold.texts.length === 1 && R.hold.texts[0] === T.prev],
        ['focus stays on prev', R.steps.every((s) => s.active === 'arrangement-marker-prev') && R.activeBeforePress === 'arrangement-marker-prev'],
        ['press: one more', R.press.texts.length === 1 && R.press.texts[0] === T.prev],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'marker-next') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const g = await geom(p); await p.mouse.click(g.tx(5), g.ry); await sleep(300); await blur(p);
      R.posAt = (await st(p)).pos;
      await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(400);
      await blur(p); await p.keyboard.press('Home'); await sleep(300);
      await p.locator('[data-testid=arrangement-marker-next]').focus(); await sleep(150);
      R.before = await sample(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'Enter', 11);
      R.hold = summ(await since(p, m0));
      R.after = await sample(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/he-marker-next-${VPS}.png` });
      const mt = R.before.markers[0] ? +R.before.markers[0].split('|')[0] : null;
      const sec = (t) => { const m = /(\d+):(\d+)\.(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] + +m[3] / 1000 : null; };
      R.markerTime = mt;
      checks = [
        ['one marker ~5 s', R.before.markers.length === 1 && Math.abs(mt - 5) < 0.3],
        ['playhead at 0 before', sec(R.before.pos) === 0],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['playhead = marker time at every step', R.steps.every((s) => Math.abs(sec(s.pos) - mt) < 0.0015)],
        ['0 spans added', R.hold.texts.length === 0],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'marker-add') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      await blur(p); await p.keyboard.press('Home'); await sleep(300);
      await p.locator('[data-testid=arrangement-marker-add]').focus(); await sleep(150);
      R.before = await sample(p);
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'Enter', 6);
      R.hold = summ(await since(p, m0));
      R.afterHold = await sample(p);
      R.inputState = await p.evaluate(() => { const i = document.querySelector('[data-testid=arrangement-marker-name-input]'); return i ? { value: i.value, ss: i.selectionStart, se: i.selectionEnd, focused: document.activeElement === i } : null; });
      await p.screenshot({ path: `${SHOTS}/he-marker-add-held-${VPS}.png` });
      await p.keyboard.type('Intro'); await sleep(150);
      await p.keyboard.press('Enter'); await sleep(500);
      R.afterType = await sample(p); R.integ = await integrity(p);
      R.afterTypeTexts = (await since(p, m0)).added.map((a) => a.text);
      await p.screenshot({ path: `${SHOTS}/he-marker-add-${VPS}.png` });
      checks = [
        ['repeats >= 5', R.hold.repeats >= 5],
        ['after hold: editor open and focused', R.afterHold.editor && R.inputState && R.inputState.focused],
        ['after hold: 0 markers', R.afterHold.markers.length === 0],
        ['after hold: undo unchanged', R.afterHold.undo === R.before.undo],
        ['after typing: one marker named Intro', R.afterType.markers.length === 1 && /«Intro»/.test(R.afterType.markers[0])],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'gain-literal' || row === 'gain-reset') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.toggle = await openDetail(p);
      const inp = p.locator('[data-testid=arrangement-detail-clip-gain-input]'); await inp.waitFor({ state: 'visible', timeout: 10000 });
      R.fresh = await sample(p);
      if (row === 'gain-reset') { await inp.click(); await inp.fill('1'); await p.keyboard.press('Enter'); await sleep(400); }
      R.before = await sample(p);
      R.focusOk = await p.locator('[data-testid=arrangement-detail-clip-gain-reset]').evaluate((b) => { b.focus(); return document.activeElement === b; });
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'Enter', 11);
      R.hold = summ(await since(p, m0));
      R.afterHold = await sample(p);
      await sleep(500);
      const m1 = await mark(p);
      await p.keyboard.press('Enter'); await sleep(400);
      R.press = summ(await since(p, m1));
      R.after = await sample(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/he-${row}-${VPS}.png` });
      if (row === 'gain-literal') checks = [['literal: 0 dB enabled on fresh clip', R.fresh.gainDisabled === false]];
      else checks = [
        ['gain 1 dB, button enabled & focused', R.before.gainValue === '1.0' || R.before.gainValue === '1' ? R.before.gainDisabled === false && R.focusOk : false],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['hold: exactly one Clip Gain 0.0 span', R.hold.texts.length === 1 && /^Clip Gain: .* — 0\.0 dB\.$/.test(R.hold.texts[0])],
        ['value 0.0', R.afterHold.gainValue === '0.0'],
        ['undo Clip Gain', /^Undo: Clip Gain/.test(R.afterHold.undo || '')],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'detail-apply') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.toggle = await openDetail(p);
      const s = p.locator('[data-testid=arrangement-detail-start]'); await s.waitFor({ state: 'visible', timeout: 10000 });
      await s.click(); await p.keyboard.press('Control+a'); await p.keyboard.type('2'); await p.keyboard.press('Tab'); await sleep(100);
      R.activeAfterTab = (await sample(p)).active;
      await p.keyboard.press('Control+a'); await p.keyboard.type('4'); await sleep(100);
      R.inputs = await p.evaluate(() => [document.querySelector('[data-testid=arrangement-detail-start]').value, document.querySelector('[data-testid=arrangement-detail-end]').value]);
      await p.locator('[data-testid=arrangement-detail-apply]').focus(); await sleep(150);
      R.before = { ...(await st(p)), sample: await sample(p) };
      await observe(p);
      const m0 = await mark(p);
      R.steps = await holdSampled(p, 'Enter', 11);
      R.hold = summ(await since(p, m0));
      R.after = await st(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/he-detail-apply-${VPS}.png` });
      checks = [
        ['inputs 2 and 4 via Tab', R.activeAfterTab === 'arrangement-detail-end' && R.inputs[0] === '2' && R.inputs[1] === '4'],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['exactly one span', R.hold.texts.length === 1],
        ['range 2-4', /00:02\.000/.test(R.after.range || '') && /00:04\.000/.test(R.after.range || '')],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'time0' || row === 'snapon-same' || row === 'time0-range') {
      await addME(p, 1);
      R.snap = await setSnap(p, row === 'snapon-same');
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      if (row === 'time0-range') { await dragRange(p, 3, 6); await blur(p); }
      R.before = await st(p);
      await observe(p);
      const m0 = await mark(p);
      await p.keyboard.press('ArrowLeft'); await sleep(400);
      R.first = summ(await since(p, m0));
      if (row === 'snapon-same' || row === 'time0-range') {
        R.after = await st(p); R.integ = await integrity(p);
        checks = row === 'snapon-same' ? [['one span = time-start text', R.first.texts.length === 1 && R.first.texts[0] === T.snapStart]] : [['one span = time-start text', R.first.texts.length === 1 && R.first.texts[0] === T.snapStart], ['observation: range kept', !!R.after.range]];
      } else {
        await sleep(300);
        R.res = await holdThenPress(p, 'ArrowLeft', 31, T.snapStart);
        R.after = await st(p); R.integ = await integrity(p);
        await p.screenshot({ path: `${SHOTS}/nz-time0-${VPS}.png` });
        checks = [
          ['clip at 0 selected', R.before.clips[0] === '0.000'],
          ['first press: one time-start span', R.first.texts.length === 1 && R.first.texts[0] === T.snapStart],
          ['repeats >= 30', R.res.hold.repeats >= 30],
          ['hold: exactly one span (time-start)', R.res.hold.addedElements === 1 && R.res.hold.textCount === 1],
          ['press: one more', R.res.press.addedElements === 1 && R.res.press.textCount === 1],
          ['clip stays 0.000', R.after.clips[0] === '0.000'],
          ['undo unchanged', R.after.undo === R.before.undo],
          ['same output, 1 child every sample', R.integ.same && R.integ.children === 1 && R.integ.bad.length === 0 && R.integ.tag === 'OUTPUT'],
        ];
      }
    } else if (row === 'moves') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await sleep(250); }
      R.afterRight = await st(p);
      await observe(p);
      const m0 = await mark(p);
      R.perStep = await hold(p, 'ArrowLeft', 11, async () => (await st(p)).clips[0]);
      R.hold = summ(await since(p, m0));
      R.afterHold = await st(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/nz-moves-${VPS}.png` });
      R.undoSteps = [];
      for (let i = 0; i < 3; i++) { await blur(p); await p.keyboard.press('Control+z'); await sleep(400); R.undoSteps.push((await st(p)).clips[0]); }
      checks = [
        ['moved to 0.300', R.afterRight.clips[0] === '0.300'],
        ['repeats >= 10', R.hold.repeats >= 10],
        ['reaches 0.000', R.afterHold.clips[0] === '0.000'],
        ['time-start text once, nothing else', R.hold.texts.length === 1 && R.hold.texts[0] === T.snapStart],
        ['Ctrl+Z x3 -> 0.100, 0.200, 0.300', JSON.stringify(R.undoSteps) === JSON.stringify(['0.100', '0.200', '0.300'])],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'neighbour') {
      await addME(p, 2);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); R.clips0 = cb.map((c) => c.start);
      await clickClip(p, cb[1]); await blur(p);
      R.before = await st(p);
      await observe(p);
      R.res = await holdThenPress(p, 'ArrowLeft', 31, T.single);
      R.after = await st(p); R.integ = await integrity(p);
      checks = [
        ['repeats >= 30', R.res.hold.repeats >= 30],
        ['hold: neighbour text once', R.res.hold.textCount === 1 && R.res.hold.addedElements === 1],
        ['press: one more', R.res.press.addedElements === 1 && R.res.press.textCount === 1],
        ['clips unchanged', JSON.stringify(R.after.clips) === JSON.stringify(R.before.clips)],
        ['undo unchanged', R.after.undo === R.before.undo],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else throw new Error('unknown row ' + row);
  } catch (e) { R.exception = String(e.stack || e); }
  R.checks = checks; R.pass = !R.exception && checks.length > 0 && checks.every((c) => c[1]);
  R.final = { errors: S.errors, hydration: S.hydration, forbidden: S.forbidden, authHeaders: S.authHeaders, noiseCount: S.noise };
  save(`${row}-${VPS}.json`, R);
  console.log(JSON.stringify({ row, vp: VPS, pass: R.pass, checks, exception: R.exception, hold: R.hold, press: R.press, res: R.res, first: R.first, final: R.final }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
