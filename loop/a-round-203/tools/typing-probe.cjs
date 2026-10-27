// B round-203 planning: R103 typing probe. node typing-probe.cjs <port>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2];
const st = (page) => page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { src: document.documentElement.dataset.focusSource ?? null, tag: e.tagName, type: e.type || null, name: e.getAttribute('aria-label') || e.placeholder || e.textContent.trim().slice(0, 30), os: c.outlineStyle }; });
(async () => { const b = await F.launch(); const R = {};
  for (const [pn, url, sel] of [['store', '/store', 'input[placeholder^="Search packs"]'], ['studio', '/studio-lab', 'input[type="search"], input[placeholder*="Search" i]']]) {
    const { ctx, page } = await F.newPage(b, 1280, 720); await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(300);
    const loc = page.locator(sel).filter({ visible: true }).first(); const bb = await loc.boundingBox();
    await page.mouse.click(bb.x + 10, bb.y + bb.height / 2); await F.sleep(300); const r = { afterClick: await st(page) };
    await page.keyboard.type('ab'); await F.sleep(300); r.afterType = await st(page);
    for (const k of ['ArrowLeft', 'Home', 'End', 'Backspace', 'Escape']) { await page.keyboard.press(k); await F.sleep(150); }
    r.afterEditKeys = await st(page);
    await page.keyboard.down('x'); await page.keyboard.down('x'); await page.keyboard.up('x'); r.afterHeld = await st(page);
    await page.mouse.click(bb.x + 10, bb.y + bb.height / 2); await F.sleep(200); await page.keyboard.press('Tab'); await F.sleep(300); r.afterTab = await st(page);
    R[pn] = r; await ctx.close(); }
  F.save(path.join(__dirname, '..', 'out', `typing-probe-${PORT}.json`), R); console.log(JSON.stringify(R)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
