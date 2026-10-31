const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const [dirA, dirB] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const rows = [];
  for (const f of fs.readdirSync(dirA).sort()) {
    if (!fs.existsSync(`${dirB}/${f}`)) { rows.push({ f, missing: true }); continue; }
    const A = 'data:image/png;base64,' + fs.readFileSync(`${dirA}/${f}`).toString('base64');
    const B = 'data:image/png;base64,' + fs.readFileSync(`${dirB}/${f}`).toString('base64');
    rows.push(await p.evaluate(async ({ A, B, f }) => {
      const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      const [a, b] = await Promise.all([load(A), load(B)]);
      if (a.width !== b.width || a.height !== b.height) return { f, size: [a.width, a.height, b.width, b.height] };
      const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const x = c.getContext('2d');
      x.drawImage(a, 0, 0); const da = x.getImageData(0, 0, a.width, a.height).data; x.clearRect(0,0,a.width,a.height); x.drawImage(b, 0, 0); const db = x.getImageData(0, 0, a.width, a.height).data;
      let sum = 0, big = 0, n = a.width * a.height;
      for (let i = 0; i < da.length; i += 4) { const d = (Math.abs(da[i]-db[i]) + Math.abs(da[i+1]-db[i+1]) + Math.abs(da[i+2]-db[i+2])) / 3; sum += d; if (d > 32) big++; }
      return { f, w: a.width, h: a.height, meanAbs: +(sum / n).toFixed(3), over32: big, over32Pct: +(100 * big / n).toFixed(3) };
    }, { A, B, f }));
  }
  console.log(JSON.stringify(rows)); await b.close();
})();
