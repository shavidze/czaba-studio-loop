const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const [a, b, out] = process.argv.slice(2);
(async () => { const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1200, height: 260 } });
 const A = 'data:image/png;base64,' + fs.readFileSync(a).toString('base64'); const B = 'data:image/png;base64,' + fs.readFileSync(b).toString('base64');
 await p.setContent(`<body style="margin:0;background:#000"><div style="width:600px;height:100px;overflow:hidden;transform:scale(2);transform-origin:0 0;image-rendering:pixelated"><img src="${A}" style="display:block;margin-left:-300px"><div style="height:2px;background:red"></div><img src="${B}" style="display:block;margin-left:-300px"></div></body>`);
 await p.waitForTimeout(300); await p.screenshot({ path: out }); await br.close(); })();
