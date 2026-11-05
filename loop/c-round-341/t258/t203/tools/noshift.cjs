// C round 203 — NO-SHIFT-203: element boxes, tree vs ref. node noshift.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const boxes = (p, scope) => p.evaluate((sc) => [...document.querySelectorAll(sc)].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 24), +r.x.toFixed(1), +(r.y + scrollY).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; }), scope);
const ALL = 'a, button, input, select, textarea, h1, h2, h3, img, p, article, section';
const MODAL = '[role=dialog] *:is(input,button,a,h2,p,label,form), .fixed *:is(input,button,a,h2,p,label,form)';
(async () => { const b = await F.launch(); const R = {};
  for (const [name, url] of [['store', '/store'], ['product', '/products/pulse-loop-kit']]) {
    const { ctx, page } = await F.newPage(b, W, H);
    await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await page.evaluate(() => document.fonts.ready); await F.sleep(800);
    await page.mouse.move(1, H - 2); await F.sleep(300); R[name] = await boxes(page, ALL); await ctx.close(); }
  for (const form of ['signin', 'signup']) {
    const { ctx, page } = await F.newPage(b, W, H);
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await page.evaluate(() => document.fonts.ready);
    await page.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1400);
    if (form === 'signup') { await page.getByRole('button', { name: 'Sign up', exact: true }).click(); await F.sleep(900); }
    await page.mouse.move(1, H - 2); await F.sleep(300);
    R[`${form}-before`] = await boxes(page, MODAL);
    await page.locator('form button[type=submit]').filter({ visible: true }).first().click(); await F.sleep(900);
    await page.evaluate(() => document.activeElement.blur()); await page.mouse.move(1, H - 2); await F.sleep(500);
    R[`${form}-after`] = await boxes(page, MODAL); await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'noshift', `${TAG}.json`), R); console.log(TAG, Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.length]))); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
