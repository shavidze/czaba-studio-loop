// B round 202 planning: does replacing the overlay button teal glow with a dark shadow lift the ring contrast? Style injection only; source untouched.
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs'); const { decode } = require('./png.cjs');
const VARIANTS = {
  current: null,
  dark: '.audio-preview-overlay-button{box-shadow:0 4px 20px color-mix(in srgb, var(--color-background) 60%, transparent) !important}',
  none: '.audio-preview-overlay-button{box-shadow:none !important}',
};
const pages = [['product', '/products/pulse-loop-kit'], ['home', '/']];
(async () => { const b = await F.launch(); const R = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) for (const [pn, url] of pages) for (const [vn, css] of Object.entries(VARIANTS)) {
    const { ctx, page } = await F.newPage(b, W, H, { deviceScaleFactor: 3 });
    await page.goto('http://127.0.0.1:5173' + url, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
    if (css) await page.addStyleTag({ content: css }); await F.sleep(400);
    const loc = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first();
    if (!(await loc.count())) { R[`${W}-${pn}-${vn}`] = 'no button'; await ctx.close(); continue; }
    await loc.scrollIntoViewIfNeeded(); await F.sleep(400); await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(800);
    const d = await F.describeActive(page); const bb = d.box; const f = path.join(__dirname, '..', 'out', `shadow-${W}-${pn}-${vn}.png`);
    await page.screenshot({ path: f, clip: { x: bb[0] - 10, y: bb[1] - 10, width: bb[2] + 20, height: bb[3] + 20 } });
    const im = decode(fs.readFileSync(f)); const cx = Math.floor(im.w / 2), cy = Math.floor(im.h / 2);
    const lines = { top: [...Array(40).keys()].map((y) => im.px(cx, y)), left: [...Array(40).keys()].map((x) => im.px(x, cy)),
      bottom: [...Array(40).keys()].map((y) => im.px(cx, im.h - 1 - y)), right: [...Array(40).keys()].map((x) => im.px(im.w - 1 - x, cy)) };
    const side = {}; for (const [k, arr] of Object.entries(lines)) { let i = arr.findIndex((p, j) => j > 3 && F.isBrass(p));
      side[k] = (i < 2 || !arr[i + 4]) ? "no ring px" : { cOut: +F.contrast(arr[i + 1] || arr[i], arr[i - 2]).toFixed(2), cIn: +F.contrast(arr[i + 1] || arr[i], arr[i + 4]).toFixed(2) }; }
    R[`${W}-${pn}-${vn}`] = { name: d.name, os: d.os, side }; await ctx.close(); }
  F.save(path.join(__dirname, '..', 'out', 'shadow-probe.json'), R); console.log(JSON.stringify(R, null, 0)); await b.close(); })();
