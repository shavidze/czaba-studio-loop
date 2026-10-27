const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const base = 'http://127.0.0.1:5173';
const lum = (c) => { const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
(async () => {
  const b = await chromium.launch(); const out = {};
  const dec = await b.newPage();
  const pixels = async (file) => dec.evaluate(async (src) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { w: c.width, h: c.height, d: Array.from(x.getImageData(0, 0, c.width, c.height).data) }; }, 'data:image/png;base64,' + fs.readFileSync(file).toString('base64'));
  // ring sample: middle row, scan from left edge for the first brass pixel; outer neighbour = 2 px further left
  const sampleRing = async (file) => { const { w, h, d } = await pixels(file); const y = Math.floor(h / 2); for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; const p = [d[i], d[i + 1], d[i + 2]]; if (p[0] > 120 && p[1] > 90 && p[2] < 140 && p[0] - p[2] > 40) { const j = (y * w + Math.max(0, x - 2)) * 4; const q = [d[j], d[j + 1], d[j + 2]]; const k = (y * w + x + 2) * 4; const inner = [d[k], d[k + 1], d[k + 2]]; return { x, ring: p, outer: q, inner, vsOuter: +ratio(p, q).toFixed(2), vsInner: +ratio(p, inner).toFixed(2) }; } } return null; };
  for (const f of ['tree-play-preview-focus-1280.png', 'tree-palette-input-1280.png', 'choose-video-focus-1280.png', 'tree-cardlink-1280.png']) out[f] = await sampleRing(`${__dirname}/${f}`);
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 120; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(60); if (await page.evaluate(() => /play preview/i.test(document.activeElement?.getAttribute('aria-label') || ''))) break; }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  out.audioPlayerInputs = await page.evaluate(() => [...document.querySelectorAll('.audio-player-progress, .audio-player-volume-slider')].map((e) => ({ cls: e.className, visible: e.getBoundingClientRect().width > 0 })));
  out.sliders = [];
  for (let i = 0; i < 250 && out.sliders.length < 2; i++) {
    await page.keyboard.press('Tab'); await page.waitForTimeout(50);
    const hit = await page.evaluate(() => { const e = document.activeElement; return e && /audio-player-(progress|volume-slider)/.test(e.className) ? e.className : null; });
    if (hit && !out.sliders.some((s) => s.cls === hit)) {
      await page.waitForTimeout(400);
      const info = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { cls: e.className, outline: `${cs.outlineStyle} ${cs.outlineWidth} offset ${cs.outlineOffset}`, boxShadow: cs.boxShadow, rect: { x: r.x, y: r.y, w: r.width, h: r.height } }; });
      const f = `${__dirname}/tree-${hit.split(' ')[0]}-1280.png`;
      await page.screenshot({ path: f, clip: { x: info.rect.x - 12, y: info.rect.y - 12, width: info.rect.w + 24, height: info.rect.h + 24 } });
      info.ringSample = await sampleRing(f);
      out.sliders.push(info);
    }
  }
  fs.writeFileSync(`${__dirname}/audio-contrast-tree.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
