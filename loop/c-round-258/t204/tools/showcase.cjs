// SHOWCASE-204. node showcase.cjs <port> <W> <label>
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL] = process.argv.slice(2); const W = +Ws; const Hh = L.H(W);
const FIND = `(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__sec = s; window.__cta = [...s.querySelectorAll('a[href="/store"]')].find((a) => /Browse the Collection/.test(a.textContent)); return !!window.__cta; })()`;
const EFF = `(() => { let o = 1, n = window.__cta; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } const r = window.__cta.getBoundingClientRect(); return { eff: +o.toFixed(3), onScreen: r.bottom > 0 && r.top < innerHeight, top: Math.round(r.top), focused: document.activeElement === window.__cta, scrollY: Math.round(scrollY) }; })()`;
const timeline = async (page) => { const t0 = Date.now(); const pts = []; let first = null; while (Date.now() - t0 < 2500) { const e = await page.evaluate(EFF); const t = Date.now() - t0; pts.push([t, e.eff]); if (first === null && e.eff >= 0.99) first = { t, ...e }; await L.sleep(100); } return { first, pts: pts.filter((_, i) => i % 3 === 0), last: await page.evaluate(EFF) }; };
(async () => {
  const browser = await L.launch(); const R = { PORT, W, LABEL };
  const open = async () => { const o = await L.newPage(browser, W); await o.page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(o.page); await L.sleep(400); await o.page.mouse.move(2, Hh - 2); await o.page.evaluate(FIND); return o; };
  // structure
  { const { ctx, page } = await open();
    R.structure = await page.evaluate(() => ({ tabindexInSection: [...window.__sec.querySelectorAll('[tabindex]')].map((e) => e.tagName + ':' + e.getAttribute('tabindex')), ctaNamed: [...window.__sec.querySelectorAll('a,button,[tabindex]')].filter((e) => /Browse the Collection/.test(e.textContent)).map((e) => e.tagName + ':' + (e.getAttribute('href') || '') + ':' + e.tabIndex) }));
    // (a) forward Tab
    let n = 0; for (; n < 60; n++) { await page.keyboard.press('Tab'); await L.sleep(300); if (await page.evaluate(() => document.activeElement === window.__cta)) break; }
    R.a = { tabs: n + 1, ...(await timeline(page)) };
    // stops within the section
    R.a.sectionStops = []; for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await L.sleep(300); R.a.sectionStops.push(await page.evaluate(() => [document.activeElement.tagName, document.activeElement.textContent.trim().slice(0, 25), window.__sec.contains(document.activeElement)])); }
    await page.screenshot({ path: path.join(L.SHOTS, `showcase-${LABEL}-${W}-a.png`) });
    await ctx.close(); }
  // (b) End then Shift+Tab, 1.2 s apart
  { const { ctx, page } = await open();
    await page.keyboard.press('End'); await L.sleep(1500);
    let n = 0; for (; n < 40; n++) { await page.keyboard.press('Shift+Tab'); await L.sleep(1200); if (await page.evaluate(() => document.activeElement === window.__cta)) break; }
    R.b = { shiftTabs: n + 1, popup: await L.popupOpen(page), ...(await timeline(page)) };
    await page.screenshot({ path: path.join(L.SHOTS, `showcase-${LABEL}-${W}-b.png`) });
    await ctx.close(); }
  // (b2) mechanism: focus with preventScroll while off-screen
  { const { ctx, page } = await open();
    const before = await page.evaluate(EFF);
    await page.evaluate(() => window.__cta.focus({ preventScroll: true }));
    R.b2 = { before, ...(await timeline(page)) }; await ctx.close(); }
  // (c) scroll-only reveal point + (e) no re-hide
  { const { ctx, page } = await open();
    const secTop = await page.evaluate(() => window.__sec.getBoundingClientRect().top + scrollY);
    const HEAD = `(() => { const h = window.__sec.querySelector('h2') || window.__sec.querySelector('h1,h3'); let o = 1, n = h; while (n && n !== window.__sec) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return +o.toFixed(3); })()`;
    let y = Math.max(0, secTop - Hh - 100); let firstY = null; const pts = [];
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await L.sleep(600);
    for (let i = 0; i < 200 && firstY === null; i++) { y += 20; await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await L.sleep(120); const o = await page.evaluate(HEAD); const sy = await page.evaluate(() => Math.round(scrollY)); pts.push([sy, o]); if (o > 0.01) firstY = sy; }
    R.c = { secTop: Math.round(secTop), firstRevealScrollY: firstY, relToSecTop: firstY - Math.round(secTop), sectionHeight: await page.evaluate(() => Math.round(window.__sec.getBoundingClientRect().height)), pts: pts.slice(-4) };
    await L.sleep(2500); R.c.revealedCta = await page.evaluate(EFF);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await L.sleep(1500);
    R.e = { atTop: await page.evaluate(EFF), head: await page.evaluate(HEAD) };
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), firstY + 300); await L.sleep(400);
    R.e.back400ms = await page.evaluate(EFF);
    // (d) hover / press on CTA (centre it first)
    await page.evaluate(() => window.__cta.scrollIntoView({ block: 'center', behavior: 'instant' })); await L.sleep(2500);
    const box = await page.evaluate(() => { const r = window.__cta.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
    const rd = async () => page.evaluate(() => { const c = getComputedStyle(window.__cta); return { transform: c.transform, scale: c.scale, bg: c.backgroundColor, tp: c.transitionProperty, td: c.transitionDuration }; });
    const rest = await rd(); await page.mouse.move(box[0] + box[2] / 2, box[1] + box[3] / 2); await L.sleep(40); const h40 = await rd(); await L.sleep(300); const h340 = await rd();
    await page.mouse.down(); await L.sleep(300); const press = await rd(); await page.mouse.up(); await L.sleep(50);
    R.d = { box, rest, h40, h340, press, urlAfterClick: null };
    await L.sleep(1500); R.d.urlAfterClick = page.url();
    await ctx.close(); }
  L.save(path.join(L.OUT, 'showcase', `${LABEL}-${W}.json`), R); console.log(LABEL, W, JSON.stringify({ structure: R.structure, a: { tabs: R.a.tabs, first: R.a.first, last: R.a.last, stops: R.a.sectionStops }, b: { n: R.b.shiftTabs, popup: R.b.popup, first: R.b.first, last: R.b.last }, b2: { before: R.b2.before, first: R.b2.first, last: R.b2.last }, c: R.c, e: R.e, d: R.d }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
