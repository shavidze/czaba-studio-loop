// crop helper: renders a PNG region enlarged using Chromium. usage: node crop.cjs in.png x y w h out.png
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  const [inp, x, y, w, h, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w * 6, height: h * 6 } });
  const data = fs.readFileSync(inp).toString('base64');
  await p.setContent(`<body style="margin:0"><div style="width:${w * 6}px;height:${h * 6}px;background:url(data:image/png;base64,${data}) -${x * 6}px -${y * 6}px / auto ${'auto'};image-rendering:pixelated;"></div><canvas id=c></canvas></body>`);
  const n = await p.evaluate(async ([src, x, y, w, h]) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, -x, -y); const d = g.getImageData(0, 0, w, h).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 120 && d[i] - d[i + 2] > 50) n++; document.body.innerHTML = ''; c.style.width = w * 6 + 'px'; c.style.imageRendering = 'pixelated'; document.body.appendChild(c); return n; }, ['data:image/png;base64,' + data, +x, +y, +w, +h]);
  await p.screenshot({ path: out }); console.log(out, 'brassPx', n); await b.close();
})();
