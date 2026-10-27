// A round 203: '/' card Play preview ring sides with a 24 px crop margin; walker starts 8 CSS px inside the button edge.
const F = require('./fl.cjs'); const path = require('path'); const { sides } = require('./ring-sides.cjs');
const PORT = process.argv[2];
(async () => { const b = await F.launch(); const R = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) for (const [pn, url] of [['home', '/'], ['product', '/products/pulse-loop-kit']]) {
    const { ctx, page } = await F.newPage(b, W, H, { deviceScaleFactor: 3 });
    await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(400);
    const loc = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first();
    await loc.scrollIntoViewIfNeeded(); await F.sleep(400); await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(800);
    const d = await F.describeActive(page); const bb = d.box; const f = path.join(__dirname, '..', 'out', `sides-${W}-${pn}.png`);
    const shadow = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
    await page.screenshot({ path: f, clip: { x: bb[0] - 24, y: bb[1] - 24, width: bb[2] + 48, height: bb[3] + 48 } });
    R[`${W}-${pn}`] = { name: d.name, box: bb, os: d.os, shadow, sides: sides(f, Math.round((Math.min(bb[2], bb[3]) / 2 - 8) * 3)) }; await ctx.close(); }
  F.save(path.join(__dirname, '..', 'out', 'home-sides.json'), R); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
