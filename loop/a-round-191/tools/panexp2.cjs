const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const { decode } = require('./png.cjs');
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.addStyleTag({ content: 'input[data-x="t1"]::-webkit-slider-runnable-track{height:4px}' });
  const f = p.locator('[data-track-id=music] [data-testid=arrangement-track-pan]');
  const snap = async (k) => { const bb = await f.boundingBox(); const cy = bb.y + bb.height / 2; const I = decode(await p.screenshot({ clip: { x: bb.x - 4, y: cy - 10, width: bb.width + 8, height: 20 } })); let rows = []; for (let y = 0; y < I.h; y += 2) { let r = ''; for (let x = 0; x < I.w; x += 4) { const q = I.px(x, y); r += q[0] > 200 ? '#' : q[0] > 100 ? '+' : q[0] > 45 ? '.' : ' '; } rows.push(r); } console.log(k, JSON.stringify(bb)); console.log(rows.join('\n')); };
  await snap('base');
  await f.evaluate((el) => { el.style.height = '16px'; el.setAttribute('data-x', 't1'); });
  await snap('h16+track4px');
  await b.close();
})();
