// B round 445 planning probe: LeadMagnet route exclusion (STORE-2b-1). Usage: node lm-routes.cjs <base> <out.json> [widths]
const L = require('../../c-round-205/tools/lib.cjs');
const fs = require('fs');
const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const OUTF = process.argv[3];
const ONLY = process.env.ONLY || '';
const WIDTHS = (process.argv[4] || '1440,1280,375').split(',').map(Number);
const lmCount = (s) => { try { return JSON.parse(s.lm || 'null')?.viewCount ?? null; } catch { return null; } };
async function scrollable(page) { return page.evaluate(() => document.documentElement.scrollHeight - innerHeight); }
async function open(browser, W, path) {
  const { ctx, page, log } = await L.newPage(browser, W);
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await L.declineCookies(page);
  return { ctx, page, log };
}
async function timerCase(browser, W, path) {
  const { ctx, page, log } = await open(browser, W, path);
  const room = await scrollable(page);
  const t0 = Date.now();
  await L.scrollTo55(page);
  const r = await L.waitPopup(page, 14000);
  const st = await L.state(page);
  await ctx.close();
  return { case: 'TIMER', path, W, scrollRoom: room, popup: r.visible, afterMs: r.visible ? r.afterMs + 1500 : null, sinceLoadMs: Date.now() - t0, viewCount: lmCount(st), errors: log.errors };
}
async function exitCase(browser, W, path) {
  const { ctx, page, log } = await open(browser, W, path);
  const room = await scrollable(page);
  await L.scrollTo55(page);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, clientX: 10 })));
  await L.sleep(800);
  const popup = await L.popupVisible(page);
  const st = await L.state(page);
  await ctx.close();
  return { case: 'EXIT', path, W, scrollRoom: room, popup, viewCount: lmCount(st), errors: log.errors };
}
async function journeyCase(browser, W) {
  const { ctx, page, log } = await open(browser, W, '/');
  await L.scrollTo55(page);
  const href = await page.evaluate(() => { const a = [...document.querySelectorAll('a[href^="/products/"]')][0]; if (!a) return null; a.click(); return a.getAttribute('href'); });
  await page.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {});
  const urlAfterNav = new URL(page.url()).pathname;
  const r = await L.waitPopup(page, 12000);
  const st = await L.state(page);
  await ctx.close();
  return { case: 'JOURNEY home-scroll-then-product', W, href, urlAfterNav, popup: r.visible, viewCount: lmCount(st), errors: log.errors };
}
async function backCase(browser, W, suppress = false) {
  const { ctx, page, log } = await L.newPage(browser, W, { suppress });
  await page.goto(BASE + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
  await L.declineCookies(page);
  await page.evaluate(() => { const a = [...document.querySelectorAll('a[href="/"]')][0]; if (a) a.click(); });
  await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 }).catch(() => {});
  await L.sleep(500);
  await L.scrollTo55(page);
  const shown = suppress ? { visible: false } : await L.waitPopup(page, 14000);
  if (suppress) await L.sleep(9000);
  await page.goBack();
  await page.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {});
  await L.sleep(600);
  const afterBack = { url: new URL(page.url()).pathname, popup: await L.popupVisible(page), st: await L.state(page), active: await L.describeActive(page) };
  const addToCart = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /add to cart/i.test(x.textContent || '')); if (!b) return null; const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { found: true, hitIsButton: !!hit && (hit === b || b.contains(hit)) }; });
  await page.goForward();
  await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 }).catch(() => {});
  await L.sleep(500);
  await L.scrollTo55(page);
  const again = await L.waitPopup(page, 14000);
  const step = await page.evaluate(() => /FREE DOWNLOAD/.test(document.body.innerText) ? 'offer' : /CONTINUE/.test(document.body.innerText) ? 'email' : null);
  const st2 = await L.state(page);
  await ctx.close();
  if (suppress) { await ctx.close(); return { case: 'BACKCTL no-popup-control', W, afterBackUrl: afterBack.url, popup: afterBack.popup, scrollYAfterBack: afterBack.st.scrollY, active: afterBack.active && afterBack.active.tag, errors: log.errors }; }
  return { case: 'BACK open-on-home-then-back-to-product', W, scrollYAfterBack: afterBack.st.scrollY, active: afterBack.active && afterBack.active.tag, shownOnHome: shown.visible, afterBackUrl: afterBack.url, popup: afterBack.popup, bodyOverflow: afterBack.st.body.overflow, bodyPosition: afterBack.st.body.position, lm: afterBack.st.lm, addToCart, reopenOnHome: again.visible, reopenStep: step, viewCount: lmCount(st2), errors: log.errors };
}
async function backHeaderCase(browser, W, suppress = false) {
  const { ctx, page, log } = await L.newPage(browser, W, { suppress });
  await page.goto(BASE + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
  await L.declineCookies(page);
  await page.evaluate(() => { const a = [...document.querySelectorAll('a[href="/"]')][0]; if (a) a.click(); });
  await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await L.sleep(800);
  const focusedName = await page.evaluate(() => { const a = [...document.querySelectorAll('header a[href]')].find((x) => x.getBoundingClientRect().width > 0); if (!a) return null; a.focus(); return (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40); });
  await page.evaluate(() => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.55)));
  await L.sleep(1500);
  const shown = suppress ? { visible: false } : await L.waitPopup(page, 14000);
  if (suppress) await L.sleep(9000);
  await page.goBack();
  await page.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {});
  await L.sleep(600);
  const active = await L.describeActive(page);
  const popup = await L.popupVisible(page);
  await ctx.close();
  return { case: suppress ? 'BACKHCTL header-focus-no-popup-control' : 'BACKH header-focus-open-then-back', W, focusedBefore: focusedName, shownOnHome: shown.visible, popup, active: active && { tag: active.tag, name: active.name, inDialog: active.inDialog }, errors: log.errors };
}
(async () => {
  const browser = await L.launch();
  const rows = [];
  for (const W of WIDTHS) {
    if (ONLY === 'back') { rows.push(await backCase(browser, W)); rows.push(await backCase(browser, W, true)); continue; }
    if (ONLY === 'header') { rows.push(await backHeaderCase(browser, W)); rows.push(await backHeaderCase(browser, W, true)); continue; }
    for (const p of ['/', '/products/pulse-loop-kit', '/cart', '/checkout/success', '/checkout/cancel']) rows.push(await timerCase(browser, W, p));
    for (const p of ['/', '/products/pulse-loop-kit']) rows.push(await exitCase(browser, W, p));
    rows.push(await journeyCase(browser, W));
    rows.push(await backCase(browser, W));
    rows.push(await backCase(browser, W, true));
  }
  await browser.close();
  if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(rows, null, 1));
  for (const r of rows) console.log(r.case, r.path || '', r.W, 'popup', r.popup, 'room', r.scrollRoom ?? '', 'vc', r.viewCount, r.urlAfterNav || r.afterBackUrl || '', r.case.startsWith('BACKH') ? JSON.stringify({before:r.focusedBefore,shown:r.shownOnHome,act:r.active}) : r.case.startsWith('BACK') ? JSON.stringify({y:r.scrollYAfterBack,act:r.active,shown:r.shownOnHome,ov:r.bodyOverflow,pos:r.bodyPosition,lm:r.lm,atc:r.addToCart,re:r.reopenOnHome,step:r.reopenStep}) : '', r.errors.length ? 'ERR ' + r.errors[0] : '');
})();
