const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => { const br = await chromium.launch(); const p = await br.newPage(); const [f, g] = process.argv.slice(2);
  const A = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), B = 'data:image/png;base64,' + fs.readFileSync(g).toString('base64');
  console.log(JSON.stringify(await p.evaluate(async ([A, B]) => { const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; }); const [a, b] = [await load(A), await load(B)];
    const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const x = cv.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
    const da = c(a), db = c(b); const out = []; for (let i = 0; i < da.length; i += 4) { if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) out.push([(i / 4) % a.width, Math.floor(i / 4 / a.width), [da[i], da[i + 1], da[i + 2]], [db[i], db[i + 1], db[i + 2]]]); } return out; }, [A, B])));
  await br.close(); })();
