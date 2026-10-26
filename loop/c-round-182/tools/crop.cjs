const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2880, height: 1800 } });
 const S = path.join(__dirname, '..', 'shots');
 for (const [d, n, clip] of JSON.parse(process.argv[2])) { const f = path.join(S, d, `${n}.png`); const data = fs.readFileSync(f).toString('base64');
  await p.setContent(`<body style="margin:0"><img src="data:image/png;base64,${data}"></body>`); await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(S, d, `crop-${n}.png`), clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } }); }
 await b.close(); })();
