const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'px');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const before = JSON.parse(fs.readFileSync(path.join(dir, 'before-meta.json')));
  const after = JSON.parse(fs.readFileSync(path.join(dir, 'after-meta.json')));
  const out = {};
  for (const key of Object.keys(before)) {
    const a = path.join(dir, `before-${key}.png`); const b = path.join(dir, `after-${key}.png`);
    if (!fs.existsSync(a) || !fs.existsSync(b)) { out[key] = 'missing'; continue; }
    const r = await page.evaluate(async ([A, B]) => {
      const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
      const [ia, ib] = await Promise.all([load(A), load(B)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { sizeMismatch: [ia.width, ia.height, ib.width, ib.height] };
      const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const x = cv.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
      const da = c(ia), db = c(ib); let diff = 0, maxd = 0, over8 = 0;
      for (let p = 0; p < da.length; p += 4) { const d = Math.max(Math.abs(da[p] - db[p]), Math.abs(da[p + 1] - db[p + 1]), Math.abs(da[p + 2] - db[p + 2])); if (d) diff++; if (d > 8) over8++; maxd = Math.max(maxd, d); }
      return { w: ia.width, h: ia.height, pixels: da.length / 4, differing: diff, over8, maxChannelDelta: maxd };
    }, [fs.readFileSync(a).toString('base64'), fs.readFileSync(b).toString('base64')]);
    const mb = before[key], ma = after[key];
    r.sameViewBox = mb.viewBox === ma.viewBox; r.sameBox = JSON.stringify(mb.box) === JSON.stringify(ma.box); r.sameColor = mb.color === ma.color; r.afterHead = ma.dHead;
    out[key] = r;
  }
  fs.writeFileSync(path.join(__dirname, 'pixdiff-a212.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out));
  await browser.close();
})();
