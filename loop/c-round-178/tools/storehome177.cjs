// C round 177 RV3-STORE helper: "/" after the SpotlightLoader intro (~5.6 s) ends: wait 8 s, both viewports.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const { decode } = require('./png.cjs'); const fs = require('fs');
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    const r = await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 45000 });
    await p.getByRole('link', { name: 'Free Samples' }).first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => errs.push('nav not visible'));
    await p.waitForTimeout(8000);
    const f = `${L}/c-round-177/shots/storehome177-${w}.png`; await p.screenshot({ path: f });
    const A = decode(fs.readFileSync(`${L}/c-round-176/shots/storebase176-home-${w}.png`)), B = decode(fs.readFileSync(f));
    let d = 0, top = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const a = A.px(x, y), c = B.px(x, y); if (a[0] !== c[0] || a[1] !== c[1] || a[2] !== c[2]) { d++; if (y < 80) top++; } }
    out[w] = { status: r && r.status(), errs, diffVs176: d, pct: +(100 * d / (A.w * A.h)).toFixed(2), diffInHeaderBand: top };
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(`${L}/c-round-177/out/storehome177.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
})();
