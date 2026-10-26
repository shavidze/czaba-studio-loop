const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const { decode } = require('./png.cjs');
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const f = p.locator('[data-testid=arrangement-track-pan]').first();
  const variants = Object.fromEntries([4,6,8,10,12,14,15,16].map((h) => ['h' + h, { height: h + 'px' }]));
  for (const [k, st] of Object.entries(variants)) {
    await f.evaluate((el, st) => { el.removeAttribute('style'); for (const [a, v] of Object.entries(st)) el.style.setProperty(a, v); }, st);
    await p.waitForTimeout(100);
    const bb = await f.boundingBox(); const cy = bb.y + bb.height / 2;
    const buf = await p.screenshot({ clip: { x: bb.x - 4, y: cy - 10, width: bb.width + 8, height: 20 } });
    const I = decode(buf); let out = [];
    for (let y = 0; y < I.h; y += 2) { let r = ''; for (let x = 0; x < I.w; x += 4) { const q = I.px(x, y); r += q[0] > 200 ? '#' : q[0] > 100 ? '+' : q[0] > 45 ? '.' : ' '; } out.push(r); }
    console.log(k, JSON.stringify(bb)); console.log(out.join('\n'));
  }
  await b.close();
})();
