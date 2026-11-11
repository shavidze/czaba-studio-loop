// usage: node studio-pixel.cjs <out.json> <shotDir> <urlA> <urlB> [urlC...]  - /studio-lab screenshots per URL at 1440 and 1280, diff each vs the first
const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const [OUT, SHOTS, ...URLS] = process.argv.slice(2);
const H = (W) => (W === 1440 ? 900 : 720);
const DIFF = `async ([a, b]) => { const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); };
  const A = await load(a), B = await load(b); if (A.width !== B.width || A.height !== B.height) return { sizeDiffers: true };
  let n = 0, y0 = null, y1 = null; for (let i = 0; i < A.data.length; i += 4) { if (A.data[i] !== B.data[i] || A.data[i+1] !== B.data[i+1] || A.data[i+2] !== B.data[i+2]) { n++; const y = Math.floor(i / 4 / A.width); if (y0 === null) y0 = y; y1 = y; } } return { diffPx: n, yRange: n ? [y0, y1] : null }; }`;
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = {};
  for (const W of [1440, 1280]) {
    const shots = [];
    for (const [k, u] of URLS.entries()) {
      const ctx = await b.newContext({ viewport: { width: W, height: H(W) }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const p = await ctx.newPage();
      await p.goto(u + '/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
      await p.getByText('Demo collection ready').first().waitFor({ timeout: 60000 }).catch(() => {});
      await p.waitForTimeout(3000);
      const buf = await p.screenshot({ animations: 'disabled', caret: 'hide', timeout: 120000 });
      fs.writeFileSync(path.join(SHOTS, `studio-${W}-${k}.png`), buf); shots.push(buf.toString('base64')); await ctx.close();
    }
    const ctx = await b.newContext(); const p = await ctx.newPage(); await p.setContent('<html></html>');
    res[W] = []; for (let k = 1; k < shots.length; k++) res[W].push({ pair: `0-vs-${k}`, url: URLS[k], ...(await p.evaluate(`(${DIFF})(${JSON.stringify([shots[0], shots[k]])})`)) });
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(OUT, JSON.stringify({ urls: URLS, res }, null, 1)); console.log(JSON.stringify(res));
})();
