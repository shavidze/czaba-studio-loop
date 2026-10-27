const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const vp of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
    await page.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(2500);
    const clip = page.locator('[data-clip-kind="audio"]').first();
    const cb = await clip.boundingBox();
    await page.mouse.click(cb.x + Math.min(200, cb.width / 2), cb.y + 10);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(600);
    const targets = { lane: '[data-testid="arrangement-clip-waveform"]', detail: '[data-testid="arrangement-detail-waveform"]' };
    for (const [k, sel] of Object.entries(targets)) {
      const loc = page.locator(sel).first();
      if (!(await loc.isVisible())) { out[vp.join('x') + ':' + k] = 'not visible'; continue; }
      const a = await loc.screenshot();
      await page.evaluate(() => {
        document.querySelectorAll('[data-testid="arrangement-clip-waveform"] path, [data-testid="arrangement-detail-waveform"] svg path').forEach((p) => {
          const d = p.getAttribute('d'); const re = /M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g; let m; const top = [], bot = [];
          while ((m = re.exec(d))) { top.push([+m[1], m[2]]); bot.push([+m[1], m[3]]); }
          if (!top.length) return; let o = 'M' + top[0][0] + ' ' + top[0][1];
          for (const [c, y] of top) o += 'V' + y + 'H' + (c + 1);
          for (let i = bot.length - 1; i >= 0; i--) { const [c, y] = bot[i]; o += 'V' + y + 'H' + c; }
          p.dataset.orig = d; p.setAttribute('d', o + 'Z');
        });
      });
      await page.waitForTimeout(300);
      const b = await loc.screenshot();
      await page.evaluate(() => document.querySelectorAll('path[data-orig]').forEach((p) => { p.setAttribute('d', p.dataset.orig); delete p.dataset.orig; }));
      await page.waitForTimeout(300);
      fs.writeFileSync(`px-${vp.join('x')}-${k}-rects.png`, a); fs.writeFileSync(`px-${vp.join('x')}-${k}-outline.png`, b);
      const r = await page.evaluate(async ([A, B]) => {
        const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
        const [ia, ib] = await Promise.all([load(A), load(B)]);
        const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const x = cv.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
        const da = c(ia), db = c(ib); let diff = 0, maxd = 0, over8 = 0;
        for (let p = 0; p < da.length; p += 4) { const d = Math.max(Math.abs(da[p] - db[p]), Math.abs(da[p + 1] - db[p + 1]), Math.abs(da[p + 2] - db[p + 2])); if (d) diff++; if (d > 8) over8++; maxd = Math.max(maxd, d); }
        return { w: ia.width, h: ia.height, pixels: da.length / 4, differing: diff, over8, maxChannelDelta: maxd };
      }, [a.toString('base64'), b.toString('base64')]);
      out[vp.join('x') + ':' + k] = r;
    }
    await page.close();
  }
  console.log(JSON.stringify(out, null, 1)); fs.writeFileSync('pixdiff.json', JSON.stringify(out, null, 1));
  await browser.close();
})();
