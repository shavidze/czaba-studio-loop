const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  const res = {};
  for (const f of process.argv.slice(2)) {
    const b64 = fs.readFileSync(f).toString('base64');
    res[f] = await page.evaluate(async (src) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i+1], b = d[i+2]; if (r > 120 && g > 90 && b < 120 && r - b > 50) n++; } return { w: c.width, h: c.height, brassPixels: n }; }, 'data:image/png;base64,' + b64);
  }
  console.log(JSON.stringify(res)); fs.writeFileSync('brass-count.json', JSON.stringify(res, null, 1)); await browser.close();
})();
