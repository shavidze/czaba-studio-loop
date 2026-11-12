const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const out = process.argv[2];
const seen = () => {
  localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastShown: Date.now(), dismissed: true, submitted: true }));
};
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const [tag, port] of [['before', 3468], ['after', 3469]]) {
      const ctx = await b.newContext({ viewport: vp });
      await ctx.addInitScript(seen);
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
      await p.waitForTimeout(3000);
      const secs = await p.evaluate(() => [...document.querySelectorAll('.homepage > div')].slice(0, 2).map((d) => {
        const r = d.getBoundingClientRect();
        return { top: Math.round(r.top + scrollY), h: Math.round(r.height) };
      }));
      const names = ['product-section', 'studio-showcase'];
      for (let k = 0; k < 2; k++) {
        await p.evaluate((y) => window.scrollTo(0, y), secs[k].top - 100);
        await p.waitForTimeout(2500);
        await p.addStyleTag({ content: 'header{visibility:hidden!important}' });
        const el = (await p.$$('.homepage > div'))[k];
        await el.screenshot({ path: `${out}/${names[k]}-${vp.width}-${tag}.png`, animations: 'disabled' });
      }
      await ctx.close();
    }
  }
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const stats = [];
  for (const vp of [1440, 1280]) {
    for (const n of ['product-section', 'studio-showcase']) {
      const a = fs.readFileSync(`${out}/${n}-${vp}-before.png`).toString('base64');
      const c = fs.readFileSync(`${out}/${n}-${vp}-after.png`).toString('base64');
      const r = await p.evaluate(async ([a, c]) => {
        const load = (s) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s; });
        const [ia, ic] = await Promise.all([load(a), load(c)]);
        const w = Math.min(ia.width, ic.width);
        const h = Math.min(ia.height, ic.height);
        const g = (img) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
        const da = g(ia);
        const dc = g(ic);
        let sum = 0; let max = 0; let n10 = 0; let la = 0; let lc = 0;
        for (let q = 0; q < da.length; q += 4) {
          const d = (Math.abs(da[q] - dc[q]) + Math.abs(da[q + 1] - dc[q + 1]) + Math.abs(da[q + 2] - dc[q + 2])) / 3;
          sum += d; if (d > max) max = d; if (d > 10) n10++;
          la += da[q] + da[q + 1] + da[q + 2]; lc += dc[q] + dc[q + 1] + dc[q + 2];
        }
        const N = da.length / 4;
        return { w, h, sizeBefore: [ia.width, ia.height], sizeAfter: [ic.width, ic.height], meanAbsDiff: +(sum / N).toFixed(3), maxDiff: +max.toFixed(1), pctPixelsOver10: +(100 * n10 / N).toFixed(3), meanLumBefore: +(la / N / 3).toFixed(2), meanLumAfter: +(lc / N / 3).toFixed(2) };
      }, [a, c]);
      stats.push({ section: n, vp, ...r });
    }
  }
  fs.writeFileSync(`${out}/diff-stats.json`, JSON.stringify(stats, null, 1));
  console.log(JSON.stringify(stats, null, 1));
  await b.close();
})();
