// C round 189 — SESSION-189 (a)-(e), RM-189 (1440, 375), SSR JS-off h1.
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const obs = async (p, ms = 3000) => { await L.sleep(ms); return p.evaluate(() => ({ ins: window.__ld.ins.length, rem: window.__ld.rem.length, h1max: window.__ld.h1max, path: location.pathname })); };
const st = (p) => p.evaluate(() => ({ ss: sessionStorage.getItem('czaba_entrance_seen'), ls: localStorage.getItem('czaba_spotlight_last_shown'), lsKeys: Object.keys(localStorage), auth: localStorage.getItem('auth_user') }));
const wordmark = (p) => p.locator('header a[href="/"]').first();
(async () => {
  const b = await L.chromium.launch({ headless: true }); const res = {}; const evs = [];
  // (a) + (d) + (b)
  { const { ctx, page, ev } = await D.fresh(b, 1440); evs.push(['a', ev]);
    await page.goto(L.BASE + '/', { waitUntil: 'load' }); res.a_first = { shown: await D.waitIns(page, 5000) }; await D.waitRem(page); res.d_storage = await st(page);
    await page.reload({ waitUntil: 'load' }); res.a_reload = await obs(page);
    const col = page.locator('header a', { hasText: 'Collections' }).first(); res.b_colHref = await col.getAttribute('href'); await col.click(); await page.waitForLoadState('load'); await L.sleep(800); res.b_onCol = await page.evaluate(() => location.pathname);
    await page.evaluate(() => { window.__navMark = 1; }); await wordmark(page).click(); await L.sleep(300);
    res.b_back = { ...(await obs(page)), clientNav: await page.evaluate(() => window.__navMark === 1) };
    await ctx.close(); }
  // (c)
  { const { ctx, page, ev } = await D.fresh(b, 1440); evs.push(['c', ev]);
    await page.goto(L.BASE + '/store', { waitUntil: 'load' }); res.c_store = await obs(page, 2500);
    await page.evaluate(() => { window.__navMark = 1; }); await wordmark(page).click();
    res.c_wordmark = { shown: await D.waitIns(page, 5000), clientNav: await page.evaluate(() => window.__navMark === 1) }; await D.waitRem(page); res.c_wordmark.dur = await page.evaluate(() => window.__ld.rem[0] - window.__ld.ins[0]); res.c_storage = await st(page);
    await page.reload({ waitUntil: 'load' }); res.c_reload = await obs(page);
    // (e) new page in the same context = same storage partition? sessionStorage is per tab: new page should show again
    const p2 = await ctx.newPage(); await p2.goto(L.BASE + '/', { waitUntil: 'load' }); res.c_newTabSameCtx = { shown: await D.waitIns(p2, 5000) };
    await ctx.close(); }
  // (e) new context
  { const { ctx, page, ev } = await D.fresh(b, 1440); evs.push(['e', ev]); await page.goto(L.BASE + '/', { waitUntil: 'load' }); res.e_newCtx = { shown: await D.waitIns(page, 5000), lsFresh: await st(page) }; await ctx.close(); }
  // RM
  for (const W of [1440, 375]) {
    const { ctx, page, ev } = await D.fresh(b, W, { reducedMotion: 'reduce' }); evs.push(['rm' + W, ev]);
    await page.goto(L.BASE + '/', { waitUntil: 'commit' }); const o = await obs(page, 3500); const s = await st(page);
    const rr = await page.evaluate(() => ({ heroH1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()), cards: document.querySelectorAll('button[class*="audio-preview"]').length, mm: matchMedia('(prefers-reduced-motion: reduce)').matches }));
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.reload({ waitUntil: 'commit' }); const shownAfter = await D.waitIns(page, 6000); await D.waitRem(page); const after = await obs(page, 2500); const s2 = await st(page);
    await page.reload({ waitUntil: 'commit' }); const third = await obs(page, 3000);
    res['rm' + W] = { reduce: { ...o, ...rr, ss: s.ss }, noPref: { shown: shownAfter, ...after, ss: s2.ss }, reloadAgain: third };
    await ctx.close(); }
  // SSR JS off
  for (const u of ['/', '/store']) { const ctx = await b.newContext({ viewport: D.VPS[1440], javaScriptEnabled: false }); const p = await ctx.newPage(); await p.goto(L.BASE + u, { waitUntil: 'load' }); res['ssr' + u] = await p.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()), overlay: document.querySelectorAll('[data-testid=entrance-loader]').length })); const html = await (await ctx.request.get(L.BASE + u)).text(); res['ssrHtml' + u] = { h1: (html.match(/<h1[\s>]/g) || []).length, testid: html.includes('entrance-loader') }; await ctx.close(); }
  res.ev = evs.map(([k, e]) => ({ k, pageerror: e.pageerror.length, hyd: e.hyd.length, foreignNonFont: e.foreign.filter((f) => !f.font).map((f) => f.h), auth: e.auth.length, errors: e.errors.filter((x) => !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/i.test(x)) }));
  await b.close(); L.save(path.join(__dirname, '..', 'out'), 'session.json', res); console.log(JSON.stringify(res, null, 1));
})();
