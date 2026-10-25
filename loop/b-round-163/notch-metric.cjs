// B round 163 planning: OV-CORNERS notch metric. Counts device pixels in the outline band rgb(36,33,30)+-6 that are NOT within 1 device px (8-neighbourhood) of a bright pixel (relative luminance > 0.3).
// node notch-metric.cjs <out.json> [png...]   (no pngs: also renders baseline + simulated fix crops at 4x)
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const out = process.argv[2]; const files = process.argv.slice(3);
const metricInPage = async ({ b64 }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data; const W = c.width, H = c.height;
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
  const bright = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) bright[y * W + x] = lum((y * W + x) * 4) > 0.3 ? 1 : 0;
  let notch = 0, band = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (Math.abs(d[i] - 36) <= 6 && Math.abs(d[i + 1] - 33) <= 6 && Math.abs(d[i + 2] - 30) <= 6) { band++; let near = false; for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W && bright[yy * W + xx]) { near = true; break; } } if (!near) notch++; } }
  return { w: W, h: H, band, notch };
};
async function measureFile(page, f) { return page.evaluate(metricInPage, { b64: fs.readFileSync(f).toString('base64') }); }
(async () => {
  const b = await L.launch(); const res = { metric: 'outline-band pixels (rgb(36,33,30)+-6) not within 1 device px of a pixel with relative luminance > 0.3', files: {}, render: {} };
  const ctx0 = await b.newContext(); const mp = await ctx0.newPage(); await mp.goto('about:blank');
  for (const f of files) res.files[path.basename(f)] = await measureFile(mp, f);
  if (!files.length) {
    for (const W of [1440, 1280]) {
      const c2 = await b.newContext({ viewport: X.VPS[W], deviceScaleFactor: 4 }); const q = await c2.newPage();
      await q.goto(`${L.BASE}/studio-lab`); await q.waitForSelector('[data-testid=arrangement-overview]', { timeout: 90000 }); await sleep(3000);
      await q.evaluate(() => { const x = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Decline'); if (x) x.click(); }); await q.mouse.move(2, 2); await sleep(500);
      for (const variant of ['baseline', 'sim-frame-rounded-sm']) {
        if (variant !== 'baseline') { await q.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); f.classList.remove('rounded-xs'); f.classList.add('rounded-sm'); }); await sleep(200); }
        const o = await q.locator('[data-testid=arrangement-overview]').boundingBox();
        for (const [n, x, y] of [['tl', o.x - 2, o.y - 2], ['tr', o.x + o.width - 14, o.y - 2], ['bl', o.x - 2, o.y + o.height - 14], ['br', o.x + o.width - 14, o.y + o.height - 14]]) {
          const f = path.join(path.dirname(out), `notch-${W}-${variant}-${n}.png`); await q.screenshot({ path: f, clip: { x, y, width: 16, height: 16 } });
          res.render[`${W}-${variant}-${n}`] = await measureFile(mp, f);
        }
      }
      await c2.close();
    }
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})();
