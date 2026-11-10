// C round 258 RV-SABA-1-2: overview corner notch (round-163 metric copied verbatim from notch-metric.cjs) on
// [data-testid=arrangement-overview] (SA-1), playhead off 0 (OBS-R199-OV-PLAYHEAD-CORNER), empty + one clip, DPR 4.
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
const OUT = path.join(__dirname, '..', 'out', 'ov258'); fs.mkdirSync(OUT, { recursive: true });
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

(async () => { const b = await L.chromium.launch(); const res = {};
  const mctx = await b.newContext(); const mp = await mctx.newPage(); await mp.goto('about:blank');
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}`;
    for (const scene of ['empty', 'clip']) {
      const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 4 }); await ctx.addInitScript(L.INIT); const q = await ctx.newPage();
      await q.goto(`${L.BASE}/studio-lab`, { waitUntil: 'load' });
      await q.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
      if (scene === 'clip') await L.addPulse(q);
      const rb = await q.locator('[data-testid="arrangement-ruler"]').boundingBox(); await q.mouse.click(rb.x + 3 * 40, rb.y + rb.height / 2); await sleep(500);
      await q.mouse.move(2, 2); await sleep(400);
      const info = await q.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-overview]'); const r = o.getBoundingClientRect(); return { state: o.getAttribute('data-overview-state'), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)), radius: getComputedStyle(o).borderTopLeftRadius, ph: document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow') }; });
      const o = await q.locator('[data-testid=arrangement-overview]').boundingBox();
      const corners = {};
      for (const [n, x, y] of [['tl', o.x - 2, o.y - 2], ['tr', o.x + o.width - 14, o.y - 2], ['bl', o.x - 2, o.y + o.height - 14], ['br', o.x + o.width - 14, o.y + o.height - 14]]) {
        const f = path.join(OUT, `ov-${k}-${scene}-${n}.png`); await q.screenshot({ path: f, clip: { x, y, width: 16, height: 16 } });
        corners[n] = await mp.evaluate(metricInPage, { b64: fs.readFileSync(f).toString('base64') });
      }
      await q.screenshot({ path: path.join(OUT, `ov-${k}-${scene}-whole.png`), clip: { x: o.x - 4, y: o.y - 4, width: o.width + 8, height: o.height + 8 } });
      res[`${k}-${scene}`] = { info, corners, notchSum: Object.values(corners).reduce((a, c) => a + c.notch, 0) };
      console.log(k, scene, JSON.stringify(info), JSON.stringify(Object.fromEntries(Object.entries(corners).map(([n, c]) => [n, [c.band, c.notch]]))));
      await ctx.close();
    } }
  fs.writeFileSync(path.join(OUT, 'ov258.json'), JSON.stringify(res, null, 1)); await b.close(); })();
