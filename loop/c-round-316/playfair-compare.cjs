const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [g, l] = process.argv.slice(2).map(f => fs.readFileSync(f).toString('base64'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const r = await p.evaluate(async ([g, l]) => {
    const toBuf = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
    const fg = new FontFace('PG', toBuf(g), { weight: '400 900' }); const fl = new FontFace('PL', toBuf(l), { weight: '400 900' });
    await fg.load(); await fl.load(); document.fonts.add(fg); document.fonts.add(fl);
    const text = 'Curated Sound Collections The Quick Brown Fox 0123456789 &?!';
    const out = [];
    for (const w of [400, 500, 600, 700, 800, 900]) {
      const c = document.createElement('canvas'); c.width = 1400; c.height = 80; const x = c.getContext('2d');
      const draw = fam => { x.clearRect(0, 0, 1400, 80); x.fillStyle = '#000'; x.font = `${w} 40px ${fam}`; x.fillText(text, 4, 55); return { w: x.measureText(text).width, d: x.getImageData(0, 0, 1400, 80).data.slice() }; };
      const A = draw('PG'), B = draw('PL');
      let n = 0, maxd = 0; for (let i = 3; i < A.d.length; i += 4) { const d = Math.abs(A.d[i] - B.d[i]); if (d) { n++; maxd = Math.max(maxd, d); } }
      out.push({ weight: w, widthGoogleChrome: +A.w.toFixed(3), widthMirror: +B.w.toFixed(3), diffPx: n, maxAlphaDiff: maxd });
    }
    return out;
  }, [g, l]);
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
