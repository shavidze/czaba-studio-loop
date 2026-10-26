// C round 196 — STORE-FOCUS probe. node store.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const K = require('./rk-lib.cjs'); const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'store', TAG); fs.mkdirSync(OUT, { recursive: true });
const sleep = L.sleep; const BASE = process.env.C_BASE;
const PAGES = {
  home: { url: '/', targets: { navStore: 'header a[href="/store"]', freeSamples: 'header a[href*="free"]', card: 'a[href^="/products/"]', newsletter: 'input[placeholder="Enter your email"]' } },
  store: { url: '/store', targets: { search: 'input[placeholder="Search packs, genres, sounds..."]', card: 'a[href^="/products/"]' } },
  support: { url: '/support', chat: true, targets: { guestName: '#guest-name', guestEmail: '#guest-email' } },
};
const boxesOf = (p) => p.evaluate(() => [...document.querySelectorAll('header a, header button, main a, main input, main button, form input, h1, h2')].slice(0, 120).map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, (e.getAttribute('href') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 30), +r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; }));
(async () => {
  const browser = await L.launch(); const net = []; const R = { W, PORT, pages: {} };
  const { page, log, ctx } = await L.openCtx(browser, { width: W, height: H }, `store-${TAG}`, net, { deviceScaleFactor: 2 });
  for (const [name, P] of Object.entries(PAGES)) {
    const r = { url: P.url };
    await page.goto(BASE + P.url, { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    if (P.chat) { try { await page.locator('button', { hasText: 'Live Chat' }).first().click({ timeout: 30000 }); await page.waitForSelector('#guest-name', { timeout: 15000 }); await sleep(1200); } catch (e) { r.chatErr = String(e).slice(0, 120); } }
    await page.mouse.move(1, 1); await sleep(300);
    r.popup = await page.evaluate(() => /FREE DOWNLOAD/i.test(document.body.innerText));
    await page.screenshot({ path: path.join(OUT, `${name}-rest.png`) }); r.boxes = await boxesOf(page);
    r.focusSourceAttr = await page.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
    r.targets = {};
    let i = 0;
    for (const [tn, sel] of Object.entries(P.targets)) {
      i++; const loc = page.locator(sel).first(); if (!(await loc.count()) || !(await loc.isVisible())) { r.targets[tn] = 'not-visible'; continue; }
      await loc.scrollIntoViewIfNeeded(); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(100);
      const b = await loc.boundingBox(); const m = 8; const clip = { x: Math.max(0, Math.floor(b.x - m)), y: Math.max(0, Math.floor(b.y - m)) }; clip.width = Math.min(W - clip.x, Math.ceil(b.width + 2 * m + 1)); clip.height = Math.min(H - clip.y, Math.ceil(b.height + 2 * m + 1));
      const fu = path.join(OUT, `${name}-${tn}-u.png`); await page.screenshot({ path: fu, clip });
      await page.keyboard.press('Shift'); await page.keyboard.down('Tab'); await page.keyboard.up('Tab'); await sleep(60); // keyboard modality
      await loc.focus(); await sleep(200);
      const d = await K.recordFocusedOnly(page, `${name}-${tn}`, OUT, W, H);
      const ff = path.join(OUT, `${name}-${tn}-f.png`); await page.screenshot({ path: ff, clip });
      const A = decode(fs.readFileSync(ff)), B = decode(fs.readFileSync(fu)); let outside = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const xc = clip.x + (x + 0.5) / 2, yc = clip.y + (y + 0.5) / 2; if (xc > b.x - 0.5 && xc < b.x + b.width + 0.5 && yc > b.y - 0.5 && yc < b.y + b.height + 0.5) continue; const a = A.px(x, y), c = B.px(x, y); if (Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]) > 24) outside++; }
      r.targets[tn] = { id: d && d.id, fv: d && d.fv, os: d && d.os, ow: d && d.ow, oc: d && d.oc, oo: d && d.oo, bs: d && d.bs, contrast: d && d.px1.contrast, ringMed: d && d.px1.ringMed, outsideMed: d && d.px1.outsideMed, changedOutsideBox: outside, fs: d && d.fs };
    }
    r.focusSourceAfter = await page.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
    R.pages[name] = r;
    L.save(OUT, 'result.json', R);
  }
  if (W === 1440) { // client navigation /studio-lab -> /
    await page.goto(BASE + '/studio-lab', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(2000);
    await page.mouse.click(W - 3, H - 3); await sleep(100);
    const inLab = await page.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
    await page.click('[data-testid=arrangement-exit]'); await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 30000 }); await sleep(1500);
    const afterNav = await page.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
    await page.keyboard.press('Tab'); await page.mouse.click(5, 300); await sleep(200);
    const afterInteract = await page.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
    const navEntries = await page.evaluate(() => performance.getEntriesByType('navigation').map((e) => e.name));
    R.nav = { inLab, afterNav, afterInteract, navEntries };
  }
  R.net = log; L.save(OUT, 'result.json', R);
  console.log(TAG, 'done', JSON.stringify(R.nav || {}), 'errors', log.errors.length, 'hyd', log.hydration.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
