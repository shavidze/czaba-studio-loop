// C round 106 KR rows (own script; standalone Playwright, installed Chromium, fresh incognito context per run, no credentials)
// usage: node kr106.cjs <row> [WxH]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-107/browser';
const OUT = ROOT;
const SHOTS = ROOT;
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

const TXT = { prev: 'უკან მარკერი აღარ არის', loopOff: 'Loop გამორთულია; დიაპაზონი შენარჩუნებულია.' };
(async () => {
  const { browser, page: p, S } = await session();
  const R = { row, vp: VPS, startedUtc: new Date().toISOString() };
  try {
    await observe(p);
    if (row === 'marker-add') {
      R.before = await st(p);
      await p.focus('[data-testid=arrangement-marker-add]');
      const m0 = await mark(p);
      await hold(p, 'Enter', 6);
      R.hold = await since(p, m0);
      R.afterHold = await st(p);
      R.editorOpen = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-name-input]'));
      R.editorFocused = await p.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'arrangement-marker-name-input');
      await p.keyboard.type('Intro'); await p.keyboard.press('Enter'); await sleep(400);
      R.final = await st(p);
      R.names = await p.$$eval('[data-testid=arrangement-marker]', (els) => els.map((e) => e.getAttribute('aria-label')));
      R.pass = R.editorOpen && R.editorFocused && R.afterHold.markers.length === 0 && R.afterHold.undo === R.before.undo && R.final.markers.length === 1 && /Intro/.test(R.names[0] || '');
    } else if (row === 'marker-prev') {
      await p.focus('[data-testid=arrangement-marker-prev]');
      const m0 = await mark(p);
      await hold(p, 'Enter', 10);
      R.hold = await since(p, m0);
      await sleep(500);
      const m1 = await mark(p);
      await p.keyboard.press('Enter'); await sleep(400);
      R.press = await since(p, m1);
      R.pass = R.hold.added.filter((a) => a.text === TXT.prev).length === 1 && R.press.added.filter((a) => a.text === TXT.prev).length === 1;
    } else if (row === 'ctrl-l') {
      await addME(p, 1);
      R.snap = await setSnap(p, true);
      const geo = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent }));
      const pps = +/([\d.]+)/.exec(geo.z)[1]; const tx = (t) => Math.round(geo.rl + t * pps);
      const cb = (await clipBoxes(p))[0]; const y = Math.round(cb.y + cb.h * 0.75);
      await p.mouse.move(tx(3), y); await p.mouse.down(); await p.mouse.move(tx(3) + 5, y, { steps: 2 }); await p.mouse.move(tx(12), y, { steps: 12 }); await p.mouse.up(); await sleep(400);
      await blur(p);
      await p.keyboard.press('Control+l'); await sleep(400);
      R.created = await st(p);
      await p.keyboard.down('Control');
      const m0 = await mark(p);
      R.steps = await hold(p, 'l', 10, async () => (await st(p)).loopPressed);
      R.hold = await since(p, m0);
      R.afterHold = await st(p);
      await p.keyboard.press('z'); await sleep(400);
      R.afterUndo = await st(p);
      const m1 = await mark(p);
      await p.keyboard.press('l'); await sleep(400);
      await p.keyboard.up('Control');
      R.press = await since(p, m1);
      R.final = await st(p);
      await p.screenshot({ path: `${SHOTS}/a107-ctrl-l-${VPS}.png` });
      R.pass = R.created.loopPressed === 'true' && R.steps.every((s) => s === 'false') && R.hold.added.length === 1 && R.hold.added[0].text === TXT.loopOff && /Undo: Loop გამორთვა/.test(R.afterHold.undo) && R.afterUndo.loopPressed === 'true' && R.final.loopPressed === 'false' && R.press.added.filter((a) => a.text === TXT.loopOff).length === 1;
    } else if (row === 'gain-reset') {
      await addME(p, 1);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(400);
      if (VPS.endsWith('-primed') || process.argv[4] === 'primed') {
        await p.fill('[data-testid=arrangement-detail-clip-gain-input]', '1'); await p.press('[data-testid=arrangement-detail-clip-gain-input]', 'Enter'); await sleep(300);
        R.afterOne = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]')?.hasAttribute('disabled'));
        await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(300);
        R.primedStatus = (await st(p)).status;
      }
      R.disabled = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]')?.hasAttribute('disabled') ?? null);
      R.input = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-input]')?.value ?? null);
      if (R.disabled === false) {
        await p.focus('[data-testid=arrangement-detail-clip-gain-reset]');
        const m0 = await mark(p);
        await hold(p, 'Enter', 10);
        R.hold = await since(p, m0);
        await sleep(500);
        const m1 = await mark(p);
        await p.keyboard.press('Enter'); await sleep(400);
        R.press = await since(p, m1);
        const G = 'Clip Gain უცვლელია: 0.0 dB.';
        R.pass = R.hold.added.map((a) => a.text).join('|') === G && R.press.added.map((a) => a.text).join('|') === G;
      } else { R.pass = false; }
    } else if (row === 'gain-reset-one') {
      await addME(p, 1);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(400);
      await p.fill('[data-testid=arrangement-detail-clip-gain-input]', '1'); await p.press('[data-testid=arrangement-detail-clip-gain-input]', 'Enter'); await sleep(300);
      R.undoBefore = (await st(p)).undo;
      await p.focus('[data-testid=arrangement-detail-clip-gain-reset]');
      const m0 = await mark(p);
      await hold(p, 'Enter', 10);
      R.hold = await since(p, m0);
      R.after = await st(p);
      R.disabled = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]')?.hasAttribute('disabled'));
      R.input = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-input]')?.value ?? null);
      R.pass = R.hold.added.length === 1 && /^Clip Gain: .* — 0\.0 dB\.$/.test(R.hold.added[0].text) && R.input === '0.0';
    } else if (row === 'nz-time0') {
      await addME(p, 1);
      R.snap = await setSnap(p, false);
      const cb = await clipBoxes(p); await clickClip(p, cb[0]); await blur(p);
      R.before = await st(p);
      const m0 = await mark(p);
      await p.keyboard.press('ArrowLeft'); await sleep(300);
      R.first = await since(p, m0);
      const m1 = await mark(p);
      await hold(p, 'ArrowLeft', 30);
      R.hold = await since(p, m1);
      await sleep(500);
      const m2 = await mark(p);
      await p.keyboard.press('ArrowLeft'); await sleep(300);
      R.last = await since(p, m2);
      R.final = await st(p); R.integ = await integrity(p);
      const T0 = 'ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.';
      R.pass = R.first.added.map((a) => a.text).join('|') === T0 && R.hold.added.map((a) => a.text).join('|') === T0 && R.last.added.map((a) => a.text).join('|') === T0 && R.final.undo === R.before.undo && JSON.stringify(R.final.clips) === JSON.stringify(R.before.clips) && R.integ.same && R.integ.bad.length === 0;
    }
  } catch (e) { R.exception = String(e).slice(0, 500); }
  R.session = S;
  fs.writeFileSync(path.join(OUT, `a107-${row}-${VPS}.json`), JSON.stringify(R, null, 1));
  console.log(JSON.stringify({ row, vp: VPS, pass: R.pass, disabled: R.disabled, input: R.input, afterOne: R.afterOne, primedStatus: R.primedStatus, undoBefore: R.undoBefore, undoAfter: R.after && R.after.undo, holdTexts: R.hold && R.hold.added.map((a) => a.text), pressTexts: R.press && R.press.added.map((a) => a.text), exception: R.exception, hold: R.hold && { repeats: R.hold.repeats, texts: R.hold.added.map((a) => a.text) }, steps: R.steps, errors: S.errors.length, hyd: S.hydration.length, forbidden: S.forbidden.length, auth: S.authHeaders.length }));
  await browser.close();
})();
