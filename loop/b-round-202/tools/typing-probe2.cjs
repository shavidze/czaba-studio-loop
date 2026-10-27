// B round-203 planning: revised R103 probe (editing keys keep pointer; Escape/ArrowDown/Tab switch). node typing-probe2.cjs <port>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2];
const st = (page) => page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { src: document.documentElement.dataset.focusSource ?? null, tag: e.tagName, name: (e.getAttribute('aria-label') || e.placeholder || e.textContent.trim()).slice(0, 30), os: c.outlineStyle }; });
(async () => { const b = await F.launch(); const R = {};
  for (const [pn, url, sel] of [['store', '/store', 'input[placeholder^="Search packs"]'], ['studio', '/studio-lab', 'input[type="search"]']]) {
    const { ctx, page } = await F.newPage(b, 1280, 720); await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(300);
    const loc = page.locator(sel).filter({ visible: true }).first(); const bb = await loc.boundingBox();
    const click = async () => { await page.mouse.click(bb.x + 10, bb.y + bb.height / 2); await F.sleep(250); };
    const r = {}; await click(); r.afterClick = await st(page);
    await page.keyboard.type('ab'); r.afterType = await st(page);
    for (const k of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete', 'Shift+A']) { await page.keyboard.press(k); await F.sleep(100); }
    r.afterEditKeys = await st(page);
    await page.keyboard.down('x'); await page.keyboard.down('x'); await page.keyboard.up('x'); r.afterHeld = await st(page);
    await page.keyboard.press('Escape'); await F.sleep(250); r.afterEscape = await st(page);
    await click(); await page.keyboard.type('a'); await page.keyboard.press('Backspace'); await page.keyboard.press('ArrowDown'); await F.sleep(400); r.afterArrowDown = await st(page);
    await click(); await page.keyboard.press('Tab'); await F.sleep(300); r.afterTab = await st(page);
    R[pn] = r; await ctx.close(); }
  F.save(path.join(__dirname, '..', 'out', `typing-probe2-${PORT}.json`), R); console.log(JSON.stringify(R, null, 0)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
