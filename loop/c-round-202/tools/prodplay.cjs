const F = require('./fl.cjs'); const path = require('path');
(async () => { const b = await F.launch(); const R = {};
  for (const [port, W, H] of [[5173, 1440, 900], [5174, 1440, 900], [5173, 1280, 720]]) {
    const { ctx, page } = await F.newPage(b, W, H, { deviceScaleFactor: 3 });
    await page.goto(`http://127.0.0.1:${port}/products/pulse-loop-kit`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
    const loc = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first(); await loc.scrollIntoViewIfNeeded(); await F.sleep(500);
    await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(500);
    const d = await F.describeActive(page); const bb = d.box; const f = path.join(F.ROOT, 'shots', `prod-play-${port}-${W}.png`);
    await page.screenshot({ path: f, clip: { x: bb[0] - 10, y: bb[1] - 10, width: bb[2] + 20, height: bb[3] + 20 } });
    const { decode } = require('./png.cjs'); const im = decode(require('fs').readFileSync(f)); const cx = Math.floor(im.w / 2);
    const col = []; for (let y = 0; y < 34; y++) col.push(im.px(cx, y)); const row = []; for (let x = 0; x < 34; x++) row.push(im.px(x, Math.floor(im.h / 2)));
    const pick = (arr) => { let best = 0; arr.forEach((p, i) => { if (F.isBrass(p) && best === 0 && i > 3) best = i; }); return best ? { ring: arr[best + 1], out: arr[best - 2], in: arr[best + 4], cOut: F.contrast(arr[best + 1], arr[best - 2]), cIn: F.contrast(arr[best + 1], arr[best + 4]) } : null; };
    R[`${port}-${W}`] = { name: d.name, os: d.os, oo: d.oo, top: pick(col), left: pick(row) };
    await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'prod-play.json'), R); console.log(JSON.stringify(R)); await b.close(); })();
