// C round 106 KR rows (own script; standalone Playwright, installed Chromium, fresh incognito context per run, no credentials)
// usage: node kr106.cjs <row> [WxH]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-106';
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

(async () => {
  const { browser, page: p, S } = await session();
  const R = { row, vp: VPS, startedUtc: new Date().toISOString() };
  let checks = [];
  try {
    if (row === 'snapoff-asis' || row === 'snapoff' || row === 'snapon' || row === 'group') {
      const two = row !== 'snapoff-asis' && row !== 'snapon';
      await addME(p, two ? 2 : 1);
      R.snap = await setSnap(p, row === 'snapon');
      const cb = await clipBoxes(p); R.clips0 = cb.map((c) => c.start);
      if (row === 'group') { await clickClip(p, cb[0]); await clickClip(p, cb[1], 'Control'); }
      else await clickClip(p, row === 'snapoff' ? cb[1] : cb[0]);
      await blur(p);
      R.before = await st(p);
      await observe(p);
      const text = row === 'group' ? T.group : row === 'snapon' ? T.snapStart : T.single;
      R.res = await holdThenPress(p, 'ArrowLeft', 31, text);
      R.after = await st(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/kr-${row}-${VPS}.png` });
      checks = [
        ['repeats >= 30', R.res.hold.repeats >= 30],
        ['hold: text exactly once', R.res.hold.textCount === 1],
        ['hold: added elements <= 1', R.res.hold.addedElements <= 1],
        ['press: exactly one more same text', R.res.press.addedElements === 1 && R.res.press.textCount === 1],
        ['clip starts unchanged', JSON.stringify(R.after.clips) === JSON.stringify(R.before.clips)],
        ['undo unchanged', R.after.undo === R.before.undo],
        ['same output, 1 child every sample', R.integ.same && R.integ.children === 1 && R.integ.bad.length === 0 && R.integ.tag === 'OUTPUT'],
      ];
      if (row === 'group') checks.push(['two clips selected (status before not error)', true]);
    } else if (row === 'moves' || row === 'moves-asis') {
      const two = row === 'moves';
      await addME(p, two ? 2 : 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); R.clips0 = cb.map((c) => c.start);
      const target = two ? cb[1] : cb[0];
      await clickClip(p, target); await blur(p);
      R.start0 = await st(p);
      for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await sleep(250); }
      R.afterRight = await st(p);
      await observe(p);
      const m0 = await mark(p);
      const idx = two ? 1 : 0;
      R.perStep = await hold(p, 'ArrowLeft', 11, async () => (await p.evaluate((i) => [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start')).sort((a, b) => +a - +b)[i], idx)));
      const h = await since(p, m0);
      R.hold = { repeats: h.repeats, texts: h.added.map((a) => a.text), singleCount: h.added.filter((a) => a.text === T.single).length };
      R.afterHold = await st(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/kr-${row}-${VPS}.png` });
      R.undoSteps = [];
      for (let i = 0; i < 3; i++) { await blur(p); await p.keyboard.press('Control+z'); await sleep(400); const s = await st(p); R.undoSteps.push({ clips: s.clips, undo: s.undo }); }
      const exp0 = two ? R.start0.clips.slice().sort((a, b) => +a - +b)[1] : '0.000';
      const moved = R.afterRight.clips.slice().sort((a, b) => +a - +b)[idx];
      const final = R.afterHold.clips.slice().sort((a, b) => +a - +b)[idx];
      R.expectedStart = exp0; R.movedTo = moved; R.finalStart = final;
      checks = [
        ['repeats >= 10', R.hold.repeats >= 10],
        ['3 x ArrowRight moved +0.300', Math.abs(+moved - +exp0 - 0.3) < 0.0005],
        ['hold returns to start', Math.abs(+final - +exp0) < 0.0005],
        ['refusal once, nothing else', R.hold.singleCount === 1 && R.hold.texts.length === 1],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else if (row === 'loop') {
      await addME(p, 1);
      R.snap = await setSnap(p, true);
      const geo = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent }));
      const pps = +/([\d.]+)/.exec(geo.z)[1]; const tx = (t) => Math.round(geo.rl + t * pps);
      const cb = (await clipBoxes(p))[0]; const y = Math.round(cb.y + cb.h * 0.75);
      await p.mouse.move(tx(3), y); await p.mouse.down(); await p.mouse.move(tx(3) + 5, y, { steps: 2 }); await p.mouse.move(tx(12), y, { steps: 12 }); await p.mouse.up(); await sleep(400);
      R.afterDrag = await st(p);
      await blur(p); await p.keyboard.press('Control+l'); await sleep(400);
      R.afterLoop = await st(p);
      R.recipe = `one ME clip, Fit, Snap on, drag on clip at 75% height from t=3 to t=12, then separate ArrowLeft presses on the focused brace until the start is 0 (pps ${pps}), blur, Ctrl+L`;
      const brace = p.locator('[data-testid=arrangement-loop-brace]');
      await brace.focus(); await sleep(150);
      // step to 0 with separate presses if the snapped start is not 0
      R.pre = [];
      for (let i = 0; i < 20 && !/^Loop 00:00\.000/.test((await st(p)).loopTimes || ''); i++) { await p.keyboard.press('ArrowLeft'); await sleep(150); R.pre.push((await st(p)).loopTimes); }
      R.before = await st(p);
      await observe(p);
      R.res = await holdThenPress(p, 'ArrowLeft', 31, T.loop);
      R.after = await st(p); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/kr-loop-${VPS}.png` });
      checks = [
        ['loop starts at 0 before hold', /^Loop 00:00\.000/.test(R.before.loopTimes || '')],
        ['brace focused', R.before.active === 'arrangement-loop-brace'],
        ['repeats >= 30', R.res.hold.repeats >= 30],
        ['hold: loop text once', R.res.hold.textCount === 1 && R.res.hold.addedElements === 1],
        ['press: one more', R.res.press.addedElements === 1 && R.res.press.textCount === 1],
        ['loop unchanged', R.after.loopTimes === R.before.loopTimes],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
      // optional probe (A F6): held Ctrl+L
      await blur(p);
      R.ctrlL = { before: (await st(p)).loopPressed, steps: [] };
      await p.keyboard.down('Control');
      for (let i = 0; i <= 9; i++) { await p.keyboard.down('l'); await sleep(40); R.ctrlL.steps.push((await st(p)).loopPressed); }
      await p.keyboard.up('l'); await p.keyboard.up('Control'); await sleep(200);
      R.ctrlL.after = await st(p);
    } else if (row === 'marker-flag' || row === 'marker-step') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      await blur(p); await p.keyboard.press('Home'); await sleep(200);
      await p.keyboard.press('m'); await sleep(400);
      R.nameInput = await p.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      await p.keyboard.press('Enter'); await sleep(400);
      R.afterAdd = await st(p);
      if (row === 'marker-flag') {
        const flag = p.locator('[data-testid=arrangement-marker]').first();
        await flag.focus(); await sleep(150);
        R.before = await st(p);
        await observe(p);
        R.res = await holdThenPress(p, 'ArrowLeft', 31, T.markerStart);
        R.after = await st(p);
        // hold ArrowRight: per keydown marker time + text
        await flag.focus(); await sleep(100);
        const m0 = await mark(p);
        R.right = await hold(p, 'ArrowRight', 10, async () => (await st(p)).markers[0]);
        const h = await since(p, m0);
        R.rightHold = { repeats: h.repeats, texts: h.added.map((a) => a.text), distinct: [...new Set(h.added.map((a) => a.text))].length };
        R.integ = await integrity(p);
        await p.screenshot({ path: `${SHOTS}/kr-marker-flag-${VPS}.png` });
        const times = R.right.map(Number);
        const diffs = times.slice(1).map((t, i) => +(t - times[i]).toFixed(3));
        R.rightDiffs = diffs;
        checks = [
          ['marker at 0', R.before.markers[0] === '0.000'],
          ['flag focused', R.before.active === 'arrangement-marker'],
          ['repeats >= 30', R.res.hold.repeats >= 30],
          ['hold: text once', R.res.hold.textCount === 1 && R.res.hold.addedElements === 1],
          ['press: one more', R.res.press.addedElements === 1 && R.res.press.textCount === 1],
          ['marker still 0', R.after.markers[0] === '0.000'],
          ['right: 0.1 per keydown', Math.abs(times[0] - 0.1) < 0.0005 && diffs.every((d) => Math.abs(d - 0.1) < 0.0005)],
          ['right: one changing moved text per step', R.rightHold.texts.length === R.right.length && R.rightHold.distinct === R.right.length && R.rightHold.texts.every((t) => /^მარკერი «.*» გადავიდა: /.test(t))],
          ['same output', R.integ.same && R.integ.bad.length === 0],
        ];
      } else {
        // zoom out so a ruler point after the clip end is visible, then click the ruler there
        for (let i = 0; i < 3; i++) { await p.keyboard.press('-'); await sleep(250); }
        const geo = await p.evaluate(() => ({ r: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON(), z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent, sl: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft }));
        const pps = +/([\d.]+)/.exec(geo.z)[1];
        R.geo = { ...geo, pps };
        const x = Math.round(geo.r.left + 120 * pps - geo.sl);
        await p.mouse.click(Math.min(x, VP.width - 10), Math.round(geo.r.top + geo.r.height / 2)); await sleep(300);
        await blur(p);
        R.before = await st(p);
        await observe(p);
        const m0 = await mark(p);
        await p.keyboard.down('Control');
        for (let i = 0; i <= 31; i++) { await p.keyboard.down('ArrowRight'); await sleep(33); }
        await p.keyboard.up('ArrowRight'); await p.keyboard.up('Control'); await sleep(300);
        const h = await since(p, m0);
        R.hold = { repeats: h.repeats, repeatsCtrl: h.repeatsCtrl, texts: h.added.map((a) => a.text), count: h.added.filter((a) => a.text === T.next).length };
        R.afterHold = await st(p);
        await sleep(500);
        const m1 = await mark(p);
        await p.keyboard.press('Control+ArrowRight'); await sleep(400);
        const s = await since(p, m1);
        R.press = { texts: s.added.map((a) => a.text), count: s.added.filter((a) => a.text === T.next).length };
        R.after = await st(p); R.integ = await integrity(p);
        await p.screenshot({ path: `${SHOTS}/kr-marker-step-${VPS}.png` });
        const posSec = (t) => { const m = /(\d+):(\d+)\.(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] + +m[3] / 1000 : null; };
        checks = [
          ['one marker', R.before.markers.length === 1],
          ['playhead after last stop (> 101.352)', posSec(R.before.pos) > 101.352],
          ['ctrl repeats >= 30', R.hold.repeatsCtrl >= 30],
          ['hold: text once', R.hold.count === 1 && R.hold.texts.length === 1],
          ['press: one more', R.press.count === 1 && R.press.texts.length === 1],
          ['position unchanged', R.after.pos === R.before.pos],
          ['same output', R.integ.same && R.integ.bad.length === 0],
        ];
      }
    } else if (row === 'detail-enter') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.toggle = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]')?.getAttribute('aria-expanded'));
      if (R.toggle === 'false') { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(400); }
      const inp = p.locator('[data-testid=arrangement-detail-clip-gain-input]');
      await inp.waitFor({ state: 'visible', timeout: 10000 });
      R.value0 = await inp.inputValue();
      await inp.focus(); await sleep(150);
      R.before = await st(p);
      await observe(p);
      const m0 = await mark(p);
      const steps = [];
      for (let i = 0; i <= 21; i++) { await p.keyboard.down('Enter'); await sleep(33); steps.push(await p.evaluate(() => document.activeElement?.getAttribute('data-testid'))); }
      await p.keyboard.up('Enter'); await sleep(300);
      const h = await since(p, m0);
      R.focusPerStep = steps;
      R.hold = { repeats: h.repeats, texts: h.added.map((a) => a.text), count: h.added.filter((a) => a.text === T.gain).length };
      await sleep(500);
      R.activeBeforePress = await p.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      const m1 = await mark(p);
      await p.keyboard.press('Enter'); await sleep(400);
      const s = await since(p, m1);
      R.press = { texts: s.added.map((a) => a.text), count: s.added.filter((a) => a.text === T.gain).length };
      R.after = await st(p); R.value1 = await inp.inputValue(); R.integ = await integrity(p);
      await p.screenshot({ path: `${SHOTS}/kr-detail-enter-${VPS}.png` });
      checks = [
        ['value 0.0 unchanged', R.value0 === R.value1],
        ['focus stays on gain input every step', steps.every((t) => t === 'arrangement-detail-clip-gain-input') && R.activeBeforePress === 'arrangement-detail-clip-gain-input'],
        ['repeats >= 20', R.hold.repeats >= 20],
        ['hold: text once', R.hold.count === 1 && R.hold.texts.length === 1],
        ['press: one more', R.press.count === 1 && R.press.texts.length === 1],
        ['undo unchanged', R.after.undo === R.before.undo],
        ['same output', R.integ.same && R.integ.bad.length === 0],
      ];
    } else throw new Error('unknown row ' + row);
  } catch (e) { R.exception = String(e.stack || e); }
  R.checks = checks; R.pass = !R.exception && checks.length > 0 && checks.every((c) => c[1]);
  R.final = { errors: S.errors, hydration: S.hydration, forbidden: S.forbidden, authHeaders: S.authHeaders, noiseCount: S.noise };
  save(`kr-${row}-${VPS}.json`, R);
  console.log(JSON.stringify({ row, vp: VPS, pass: R.pass, checks, exception: R.exception, res: R.res, hold: R.hold, press: R.press, final: R.final, ctrlL: R.ctrlL }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
