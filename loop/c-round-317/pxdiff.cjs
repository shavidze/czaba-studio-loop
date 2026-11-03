const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-317/shots'; const P1=process.argv[2], P2=process.argv[3];
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const files = fs.readdirSync(D).filter(f => f.startsWith(P1 + '-'));
  for (const f of files) {
    const a = fs.readFileSync(D + '/' + f).toString('base64'); const s = fs.readFileSync(D + '/' + f.replace(P1 + '-', P2 + '-')).toString('base64');
    const r = await page.evaluate(async ([a, s]) => {
      const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + src; });
      const [ia, is] = await Promise.all([load(a), load(s)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const x = c.getContext('2d');
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
      x.clearRect(0, 0, c.width, c.height); x.drawImage(is, 0, 0); const ds = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
      for (let i = 0; i < da.length; i += 4) if (da[i] !== ds[i] || da[i+1] !== ds[i+1] || da[i+2] !== ds[i+2]) { n++; const p = i / 4, X = p % c.width, Y = (p / c.width) | 0; minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y); }
      return { w: ia.width, h: ia.height, diffPx: n, bbox: n ? [minX, minY, maxX, maxY] : null };
    }, [a, s]);
    console.log(f, JSON.stringify(r));
  }
  await b.close();
})();
