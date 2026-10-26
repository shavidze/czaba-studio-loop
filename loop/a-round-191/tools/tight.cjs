// reviewer L4/M4: ring at the minimum (tight) lane height; is it clipped by the header's overflow-hidden?
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] }); const res = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await sleep(2500);
    const h = p.locator('[data-track-id=music] [data-testid=arrangement-track-height]'); const hb = await h.boundingBox();
    await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down(); await p.mouse.move(hb.x + hb.width / 2, hb.y - 300, { steps: 15 }); await p.mouse.up(); await sleep(500);
    const laneH = await p.evaluate(() => document.querySelector('[data-track-id=music]').getBoundingClientRect().height);
    const hdr = await p.evaluate(() => { const r = document.querySelector('[data-track-id=music] [data-testid=arrangement-track-header]').getBoundingClientRect(); return { y: r.y, h: r.height }; });
    const out = { laneH, hdr };
    for (const [name, sel] of [['pan', '[data-track-id=music] [data-testid=arrangement-track-pan]'], ['trackVol', '[data-track-id=music] input[aria-label^="Volume — "]']]) {
      const f = p.locator(sel); await f.focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(200);
      const bb = await f.boundingBox(); const vb = { x: bb.x, y: bb.y + bb.height / 2 - 8, w: bb.width, h: 16 };
      const crop = { x: vb.x - 8, y: vb.y - 8, width: vb.w + 16, height: 32 };
      const file = path.join(__dirname, '..', 'final', `tight-${W}-${name}.png`); await p.screenshot({ path: file, clip: crop });
      const I = decode(fs.readFileSync(file)); const cx = I.w >> 1; const col = []; for (let y = 0; y < I.h; y++) col.push(near(I.px(cx, y), [201, 164, 106], 24) ? 'B' : '.');
      out[name] = { fv: await f.evaluate((el) => el.matches(':focus-visible')), ringTopCss: vb.y - 4, hdrTop: hdr.y, colAtCentre: col.join(''), shot: path.basename(file) };
      await p.mouse.click(5, H - 5); await sleep(100);
    }
    res[W] = out; await p.close();
  }
  console.log(JSON.stringify(res, null, 1)); fs.writeFileSync(path.join(__dirname, '..', 'final', 'tight.json'), JSON.stringify(res, null, 1)); await b.close();
})();
