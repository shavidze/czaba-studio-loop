const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const D = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-468/shots';
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext()).newPage();
  for (const n of ['product-section', 'studio-showcase']) for (const v of [1440, 1280]) {
    const a = fs.readFileSync(`${D}/${n}-${v}-before.png`).toString('base64');
    const c = fs.readFileSync(`${D}/${n}-${v}-after.png`).toString('base64');
    const r = await p.evaluate(async ([a, c]) => {
      const load = (s) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s; });
      const [ia, ic] = await Promise.all([load(a), load(c)]);
      const px = (im) => { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
      const A = px(ia), B = px(ic); let s = 0, mx = 0, big = 0, la = 0, lb = 0; const N = A.length / 4;
      for (let i = 0; i < A.length; i += 4) { let m = 0; for (let k = 0; k < 3; k++) { const d = Math.abs(A[i + k] - B[i + k]); s += d; if (d > m) m = d; la += A[i + k]; lb += B[i + k]; } if (m > mx) mx = m; if (m > 10) big++; }
      return { w: ia.width, h: ia.height, w2: ic.width, h2: ic.height, mean: +(s / (N * 3)).toFixed(2), max: mx, pctOver10: +(big / N * 100).toFixed(3), lumB: +(la / (N * 3)).toFixed(2), lumA: +(lb / (N * 3)).toFixed(2) };
    }, [a, c]);
    console.log(n, v, JSON.stringify(r));
  }
  await b.close();
})();
