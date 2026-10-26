// C round 191 — STORE-AFTER-191 (copied from c-round-190 c190-store.cjs; unchanged)
// C round 190 — STORE-AFTER-190 (copied from c-round-189 c189-store.cjs; unchanged)
// C round 188 — STORE-AFTER-188 capture (185seq/c186 visit method) for /, /store, /products/middle-east + home perf. node c188-store.cjs <W>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const W = process.argv[2]; const ROOT = path.join(__dirname, '..'); const SH = path.join(ROOT, 'shots', 'store-after'); fs.mkdirSync(SH, { recursive: true });
const init = () => { window.__perf = { lcp: 0, cls: 0, lcpEl: null }; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; window.__perf.lcpEl = e.element ? e.element.tagName : null; window.__perf.lcpInOv = !!(e.element && e.element.closest && e.element.closest('[data-testid=entrance-loader]')); window.__perf.lcpCls = e.element ? String(e.element.className).slice(0,60) : null; } }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'] });
  const res = { W, utc: new Date().toISOString(), pages: {}, perf: [], pageerror: [] };
  const ctx = await b.newContext({ viewport: VPS[W], deviceScaleFactor: 2 }); await ctx.addInitScript(init);
  const page = await ctx.newPage(); page.on('pageerror', (e) => res.pageerror.push(String(e).slice(0, 200)));
  const popupUp = () => page.evaluate(() => !!document.querySelector('div.fixed.inset-0.z-\\[9999\\]'));
  const closePopup = async () => { if (await popupUp()) { await page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]').click(); await L.sleep(500); await page.mouse.move(1, 1); await L.sleep(400); return true; } return false; };
  const scrollAll = async () => { await page.evaluate(async () => { const s = (ms) => new Promise((r) => setTimeout(r, ms)); const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H(); y += Math.floor(innerHeight / 2)) { scrollTo(0, y); await s(250); } scrollTo(0, H()); await s(800); }); await page.waitForFunction(() => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)), null, { timeout: 30000 }).catch(() => {}); };
  await page.goto(L.BASE + '/', { waitUntil: 'load', timeout: 90000 }); await L.sleep(3000);
  for (const [name, url] of [['home', '/'], ['store', '/store'], ['product-middle-east', '/products/middle-east']]) {
    const r = { url }; const resp = await page.goto(L.BASE + url, { waitUntil: 'load', timeout: 90000 }); r.status = resp.status(); await L.sleep(4000);
    r.popupAtShot = await popupUp();
    if (name === 'home') r.heroBox = await page.evaluate(() => { const s = document.querySelector('main section, section'); const q = s.getBoundingClientRect(); return { x: q.x, y: q.y + scrollY, w: q.width, h: q.height }; });
    r.header = await page.evaluate(() => { const h = document.querySelector('header').getBoundingClientRect(); return { y: h.y + scrollY, h: h.height }; });
    r.footerCopy = await page.evaluate(() => { const f = document.querySelector('footer'); if (!f) return null; const p = [...f.querySelectorAll('*')].find((e) => e.children.length === 0 && /©/.test(e.textContent)); const q = p.getBoundingClientRect(); return { x: q.x, y: q.y + scrollY, w: q.width, h: q.height, text: p.textContent.trim() }; });
    await page.mouse.move(1, 1); await L.sleep(300); r.loaderInShot = await page.evaluate(() => !!document.querySelector('[data-testid=entrance-loader]')); await page.screenshot({ path: path.join(SH, `${W}-${name}.png`), fullPage: true });
    await scrollAll(); r.popupAfterScroll = await closePopup(); await page.evaluate(() => scrollTo(0, 0)); await L.sleep(700); r.popupAtScrolledShot = await popupUp();
    await page.screenshot({ path: path.join(SH, `${W}-${name}-scrolled.png`), fullPage: true });
    r.unloaded = await page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => (i.currentSrc || i.src).slice(0, 100)));
    res.pages[name] = r;
  }
  await page.close();
  for (let i = 0; i < 3; i++) { const pg = await ctx.newPage(); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(4000); await pg.mouse.move(1, 1); res.perf.push(await pg.evaluate(() => window.__perf)); await pg.close(); }
  res.perfFresh = []; for (let i = 0; i < 3; i++) { const c2 = await b.newContext({ viewport: VPS[W], deviceScaleFactor: 2 }); await c2.addInitScript(init); const pg = await c2.newPage(); pg.on('pageerror', (e) => res.pageerror.push(String(e).slice(0, 200))); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(4000); await pg.mouse.move(1, 1); res.perfFresh.push({ ...(await pg.evaluate(() => window.__perf)), loaderSeen: await pg.evaluate(() => sessionStorage.getItem('czaba_entrance_seen')) }); await c2.close(); }
  const med = (a) => [...a].sort((x, y) => x - y)[1]; res.perfFreshMedian = { lcp: med(res.perfFresh.map((p) => p.lcp)), cls: med(res.perfFresh.map((p) => p.cls)) }; res.perfMedian = { lcp: med(res.perf.map((p) => p.lcp)), cls: med(res.perf.map((p) => p.cls)) };
  await b.close(); L.save(path.join(ROOT, 'out'), `store-${W}.json`, res); console.log(JSON.stringify(res));
})();
