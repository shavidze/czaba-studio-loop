const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => { const br = await chromium.launch(); const p = await br.newPage();
  for (const [f, g] of process.argv.slice(2).reduce((a, x, i, arr) => (i % 2 ? a : [...a, [x, arr[i + 1]]]), [])) {
    const A = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), B = 'data:image/png;base64,' + fs.readFileSync(g).toString('base64');
    const r = await p.evaluate(async ([A, B]) => { const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; }); const [a, b] = [await load(A), await load(B)];
      const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const x = cv.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
      const da = c(a), db = c(b); let d = 0, mx = 0; for (let i = 0; i < da.length; i += 4) { const m = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (m > 0) d++; if (m > mx) mx = m; } return { diffPx: d, maxDelta: mx }; }, [A, B]);
    console.log(f.split('/').pop(), 'vs', g.split('/').slice(-2).join('/'), JSON.stringify(r)); }
  await br.close(); })();
