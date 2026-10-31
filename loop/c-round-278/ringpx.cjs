const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = process.argv[2];
(async () => { const b = await chromium.launch(); const out = {};
 for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 4 }); const p = await ctx.newPage();
  await p.goto(BASE + '/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 }); await p.waitForTimeout(1500);
  await p.getByTestId('arrangement-tempo-input').focus(); await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  const bb = await p.getByTestId('arrangement-metronome-toggle').boundingBox();
  const buf = await p.screenshot({ clip: { x: bb.x, y: bb.y - 2, width: bb.width, height: bb.height + 4 } });
  out[vp.width] = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const mx = Math.round(c.width / 2); const col = []; for (let y = 0; y < c.height; y++) col.push(at(mx, y));
    return { h: c.height, column: col.map((p) => p.join(',')) };
  }, buf.toString('base64'));
  await ctx.close(); }
 require('fs').writeFileSync(__dirname + '/ringpx-metro.json', JSON.stringify(out)); 
 for (const [k, v] of Object.entries(out)) console.log(k, v.column.slice(0, 22).join(' | '));
 await b.close(); })();
