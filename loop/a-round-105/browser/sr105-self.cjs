// C round 104 browser rows: SR-REPEAT-SPACE, SR-REGION-STABLE, SR-TEXT-REG, SR-REPEAT-FAILED-ROW, SR-DRAG-STREAM, BLOCKED-MOVE
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-105/browser/out';
const SHOTS = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-105/browser/shots';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HYD = /hydrat|did not match|Text content does not match|server rendered/i;
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
const EMPTY = 'დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.';
const row = process.argv[2];
const VPS = process.argv[3] || '1280x720';
const VP = { width: +VPS.split('x')[0], height: +VPS.split('x')[1] };

async function session(abortHero) {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: VP });
  if (abortHero) await ctx.route('**/videos/hero/hero-music.mp3', (r) => r.abort());
  const page = await ctx.newPage();
  const S = { row, vp: VPS, errors: [], hydration: [], noise: [], forbidden: [], authHeaders: [], requestFailed: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (HYD.test(t)) S.hydration.push(t.slice(0, 300));
    if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(t)) S.noise.push(t.slice(0, 200)); else S.errors.push(`[${m.type()}] ${t.slice(0, 300)}`); }
  });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 300)));
  page.on('requestfailed', (q) => S.requestFailed.push(`${q.url().replace('http://127.0.0.1:5173', '')} ${q.failure()?.errorText}`));
  page.on('request', (q) => {
    const u = q.url();
    if (/studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev/.test(u)) S.forbidden.push(u);
    if (q.headers().authorization) S.authHeaders.push(u);
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(300);
  // wait for library to settle: no option shows loading
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const loading = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length);
    if (loading === 0) break; await sleep(250);
  }
  S.settleMs = Date.now() - t0;
  await sleep(500);
  // observer
  await page.evaluate(() => {
    const region = document.querySelector('[data-testid=arrangement-status]');
    const W = { region, records: [], t0: performance.now(), pm: 0, longtasks: [] };
    window.__sr = W;
    const push = (rs) => { for (const r of rs) W.records.push({ type: r.type, t: Math.round(performance.now() - W.t0), added: [...r.addedNodes].map((n) => ({ el: n.nodeType === 1, text: n.textContent })), removed: r.removedNodes.length }); };
    W.mo = new MutationObserver(push);
    W.mo.observe(region, { childList: true, subtree: true, characterData: true });
    W.flush = () => push(W.mo.takeRecords());
    // detect region replacement at the parent level
    W.replaced = 0;
    new MutationObserver((rs) => { for (const r of rs) for (const n of r.removedNodes) if (n === region || (n.contains && n.contains(region))) W.replaced++; }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('pointermove', () => { W.pm++; }, true);
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) W.longtasks.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] }); } catch (e) { W.ltErr = String(e); }
  });
  const cdp = await ctx.newCDPSession(page);
  return { browser, ctx, page, S, cdp };
}
const read = (p) => p.evaluate(() => {
  window.__sr.flush();
  const cur = document.querySelector('[data-testid=arrangement-status]');
  const r = cur.getBoundingClientRect();
  const cs = getComputedStyle(cur);
  return {
    text: cur.textContent, same: cur === window.__sr.region, tag: cur.tagName, live: cur.getAttribute('aria-live'), connected: window.__sr.region.isConnected,
    children: cur.childElementCount, childTag: cur.firstElementChild?.tagName ?? null, replaced: window.__sr.replaced,
    pos: document.querySelector('[data-testid=arrangement-position]')?.textContent, records: window.__sr.records.length,
    clips: document.querySelectorAll('[data-clip-id]').length,
    rect: { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) }, lineHeight: cs.lineHeight, fontSize: cs.fontSize,
  };
});
const recsFrom = (p, n) => p.evaluate((n) => { window.__sr.flush(); return window.__sr.records.slice(n); }, n);
const axCount = async (cdp, text) => { const { nodes } = await cdp.send('Accessibility.getFullAXTree'); return nodes.filter((n) => n.name?.value === text || n.value?.value === text).length; };
const blur = (p) => p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); return document.activeElement ? document.activeElement.tagName : null; });
const save = (name, o) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(o, null, 1));
const undoLabel = (p) => p.evaluate(() => { const b = document.querySelector('button[title^="Undo"]'); return b ? `${b.title}${b.disabled ? ' (disabled)' : ''}` : null; });

async function addByEnter(p, id) {
  const o = p.locator(`[role=option][data-source-id="${id}"]`);
  await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await p.keyboard.press('Enter'); await sleep(900);
}

(async () => {
  const { browser, page: p, S, cdp } = await session(row === 'failed');
  const R = { S };
  try {
    if (row === 'space') {
      R.clips0 = (await read(p)).clips;
      R.active = await blur(p);
      R.before = await read(p);
      await p.keyboard.press('Space'); await sleep(500);
      R.after1 = await read(p); R.ax1 = await axCount(cdp, EMPTY);
      const n1 = R.after1.records;
      R.firstSpanText = await p.evaluate(() => { window.__sr.span1 = window.__sr.region.firstElementChild; return window.__sr.span1?.textContent ?? null; });
      await p.keyboard.press('Space'); await sleep(500);
      R.after2 = await read(p); R.ax2 = await axCount(cdp, EMPTY);
      R.spanReplaced = await p.evaluate(() => window.__sr.region.firstElementChild !== window.__sr.span1);
      R.press2 = await recsFrom(p, n1);
      await sleep(1000); R.after3 = await read(p);
      await p.screenshot({ path: `${SHOTS}/sr-repeat-space-${VPS}.png` });
      const c = [];
      c.push(['text1', R.after1.text === EMPTY]); c.push(['text2', R.after2.text === EMPTY]);
      c.push(['press2 childList adds exact text', R.press2.some((r) => r.type === 'childList' && r.added.some((a) => a.text === EMPTY))]);
      c.push(['region same/output/polite', R.after2.same && R.after2.tag === 'OUTPUT' && R.after2.live === 'polite' && R.after2.replaced === 0 && R.after3.same]);
      c.push(['no transport advance', R.before.pos === R.after1.pos && R.after1.pos === R.after2.pos && R.after2.pos === R.after3.pos]);
      c.push(['ax equal', R.ax1 === R.ax2 && R.ax1 > 0]);
      c.push(['0 clips', R.clips0 === 0 && R.after3.clips === 0]);
      c.push(['active body', R.active === 'BODY']);
      R.checks = c; R.pass = c.every((x) => x[1]);
    } else if (row === 'stable') {
      const texts = [];
      const snap = async (lbl) => { const r = await read(p); texts.push({ lbl, text: r.text, same: r.same, children: r.children, pos: r.pos, replaced: r.replaced }); return r; };
      await snap('start');
      await addByEnter(p, 'demo-middle-east'); await snap('afterEnter');
      await blur(p);
      await p.keyboard.press('Space'); await sleep(400); const a = await snap('play+400');
      await sleep(700); const b = await snap('play+1100');
      R.audio = await p.evaluate(() => ({ ctxs: 0 }));
      await p.keyboard.press('Space'); await sleep(500); await snap('pause');
      await sleep(600); await snap('pause+600');
      R.texts = texts;
      R.advanced = a.pos !== b.pos;
      const d = [texts[1].text, texts[2].text, texts[5].text];
      R.distinct = d;
      R.allRecs = await recsFrom(p, 0);
      R.pass = R.advanced && new Set(d).size === 3 && texts.every((t) => t.same && t.children === 1 && t.replaced === 0) && texts[1].text !== texts[0].text;
      await p.screenshot({ path: `${SHOTS}/sr-region-stable-${VPS}.png` });
    } else if (row === 'textreg') {
      const steps = [];
      const snap = async (lbl) => { const r = await read(p); steps.push({ lbl, text: r.text, rect: r.rect, lineHeight: r.lineHeight, children: r.children, same: r.same }); };
      await addByEnter(p, 'demo-middle-east'); await snap('enter');
      await blur(p);
      await p.click('[data-testid=arrangement-fit]'); await sleep(500); await snap('fit(button click; no keyboard shortcut in source)');
      await blur(p);
      const cb = await p.$eval('[data-clip-id]', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + Math.min(r.width / 2, 30), y: r.y + r.height - 8 }; });
      await p.mouse.click(Math.round(cb.x), Math.round(cb.y)); await sleep(300); await snap('select');
      await p.keyboard.press('Delete'); await sleep(500); await snap('delete'); R.clipsAfterDelete = (await read(p)).clips;
      await p.keyboard.press('Control+z'); await sleep(600); await snap('undo'); R.clipsAfterUndo = (await read(p)).clips;
      R.steps = steps;
      await p.screenshot({ path: `${SHOTS}/sr-text-reg-${VPS}.png` });
    } else if (row === 'failed') {
      const o = p.locator('[role=option][data-source-id="demo-hero-music"]');
      await o.scrollIntoViewIfNeeded();
      const t0 = Date.now(); let st = '';
      while (Date.now() - t0 < 60000) { st = await o.textContent(); if (/შეცდომა:/.test(st)) break; await sleep(200); }
      R.rowText = st; R.title = await o.getAttribute('title');
      R.clips0 = (await read(p)).clips;
      // keyboard focus: focus the listbox's focus target then ArrowDown/Up to the failed row
      await blur(p);
      await p.locator('[role=option][tabindex="0"]').first().focus();
      R.focusPath = [];
      for (let i = 0; i < 40; i++) {
        const id = await p.evaluate(() => document.activeElement?.dataset?.sourceId ?? null);
        R.focusPath.push(id);
        if (id === 'demo-hero-music') break;
        await p.keyboard.press('ArrowDown'); await sleep(80);
      }
      R.focused = await p.evaluate(() => document.activeElement?.dataset?.sourceId ?? null);
      const expected = `„${R.title}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;
      R.expected = expected;
      await p.keyboard.press('Enter'); await sleep(500);
      R.after1 = await read(p); R.ax1 = await axCount(cdp, expected);
      const n1 = R.after1.records;
      await p.evaluate(() => { window.__sr.span1 = window.__sr.region.firstElementChild; });
      await p.keyboard.press('Enter'); await sleep(500);
      R.after2 = await read(p); R.ax2 = await axCount(cdp, expected);
      R.spanReplaced = await p.evaluate(() => window.__sr.region.firstElementChild !== window.__sr.span1);
      R.press2 = await recsFrom(p, n1);
      await p.screenshot({ path: `${SHOTS}/sr-repeat-failed-row-${VPS}.png` });
      R.pass = R.focused === 'demo-hero-music' && R.after1.text === expected && R.after2.text === expected && R.press2.some((r) => r.type === 'childList' && r.added.some((a) => a.text === expected)) && R.after2.same && R.after2.replaced === 0 && R.after2.clips === 0 && R.clips0 === 0;
    } else if (row === 'drag' || row === 'blocked') {
      await addByEnter(p, 'demo-middle-east');
      if (row === 'blocked') await addByEnter(p, 'demo-middle-east');
      await blur(p);
      { await p.click('[data-testid=arrangement-fit]'); await sleep(600); await blur(p); }
      R.clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.clipId, x: r.x, y: r.y, w: r.width, h: r.height, fi: e.dataset.fadeIn, lane: e.closest('[data-track-id]')?.dataset.trackId }; }));
      R.undo0 = await undoLabel(p);
      const runs = [];
      const nRuns = row === 'drag' ? +(process.argv[4] || 1) : 1;
      for (let k = 0; k < nRuns; k++) {
        const r0 = await read(p);
        await p.evaluate(() => { window.__sr.pm = 0; window.__sr.longtasks = []; });
        let sx, sy, ex;
        if (row === 'drag') {
          const hb = await p.locator('[data-testid=arrangement-clip-fade-in-handle]').first().boundingBox();
          R.handle = hb; sx = hb.x + hb.width / 2; sy = hb.y + hb.height / 2; const cl = await p.$eval('[data-clip-id]', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, w: r.width }; }); R.clipBox = cl; ex = Math.min(VP.width - 5, cl.x + cl.w + 200);
        } else {
          const c1 = R.clips[0], c2 = R.clips[1];
          const first = c1.x < c2.x ? c1 : c2, second = c1.x < c2.x ? c2 : c1;
          R.blockedPair = { first, second };
          sx = second.x + Math.min(second.w / 2, 40); sy = second.y + 7; ex = first.x + 10;
        }
        await p.mouse.move(sx, sy); await p.mouse.down();
        const steps = 60;
        for (let i = 1; i <= steps; i++) { await p.mouse.move(sx + ((ex - sx) * i) / steps, sy + (i % 2), { steps: 1 }); await sleep(16); }
        R.statusDuring = (await read(p)).text;
        // hold at the end, wiggle 1px (still clamped / blocked)
        for (let i = 0; i < 20; i++) { await p.mouse.move(ex + (i % 2), sy); await sleep(16); }
        await p.mouse.up(); await sleep(600);
        const r1 = await read(p);
        const recs = await recsFrom(p, r0.records);
        const W = await p.evaluate(() => ({ pm: window.__sr.pm, lt: window.__sr.longtasks.slice() }));
        const addedEls = recs.reduce((s, r) => s + r.added.filter((a) => a.el).length, 0);
        const addedTexts = recs.flatMap((r) => r.added.filter((a) => a.el).map((a) => a.text));
        const uniq = {}; for (const t of addedTexts) uniq[t] = (uniq[t] || 0) + 1;
        runs.push({ pointermoves: W.pm, addedElementNodes: addedEls, childListRecords: recs.filter((r) => r.type === 'childList').length, characterDataRecords: recs.filter((r) => r.type === 'characterData').length, addedTextCounts: uniq, longtasks: W.lt, maxLongtask: W.lt.length ? Math.max(...W.lt) : 0, statusAfter: r1.text, same: r1.same, replaced: r1.replaced });
        R.fiAfter = await p.$$eval('[data-clip-id]', (els) => els.map((e) => ({ id: e.dataset.clipId, fi: e.dataset.fadeIn, x: Math.round(e.getBoundingClientRect().x) })));
        R.undoAfter = await undoLabel(p);
        if (row === 'drag') {
          await blur(p);
          await p.keyboard.press('Control+z'); await sleep(600);
          R.fiAfterUndo = await p.$$eval('[data-clip-id]', (els) => els.map((e) => e.dataset.fadeIn));
          R.undoAfterUndo = await undoLabel(p);
          runs[k].fiAfter = R.fiAfter; runs[k].undoAfter = R.undoAfter; runs[k].fiAfterUndo = R.fiAfterUndo; runs[k].undoAfterUndo = R.undoAfterUndo;
          await sleep(300);
        }
      }
      R.runs = runs;
      await p.screenshot({ path: `${SHOTS}/sr-${row}-${VPS}.png` });
    }
  } catch (e) { R.exception = String(e.stack || e); }
  R.final = { errors: S.errors, hydration: S.hydration, forbidden: S.forbidden, authHeaders: S.authHeaders, requestFailed: S.requestFailed, noiseCount: S.noise.length };
  save(`${row}-${VPS}.json`, R);
  console.log(JSON.stringify(R, null, 1).slice(0, 6000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
