// B round 468->469 look analyser. Usage: node look-profile.cjs <look2.json> <outTxt> <variant>... (the "hidden" variant is the control)
// Per viewport, section and variant: glow contribution = mean lum(variant) - mean lum(hidden), and its ratio to head's.
// Per glow: the centre band (rows cy-10..cy+10, clamped) of lum(variant) - lum(hidden), averaged in 32 px column bins:
// peak (max over bins), maxStep (max |bin[i+1]-bin[i]|), and the edge jump at the shot's top and bottom rows
// (max over x of |lum(variant)-lum(hidden)| row 0 vs row 1 and last vs last-1 differences).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [inPath, outPath, ...variants] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(inPath, 'utf8'));
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext()).newPage();
  const lines = [];
  const get = (vp, v, s) => rows.find((r) => r.vp === vp && r.variant === v && r.section === s);
  for (const vp of [1440, 1280]) for (const s of ['product-section', 'studio-showcase']) {
    const hid = get(vp, 'hidden', s); const head = get(vp, 'head', s);
    const headC = head.lum - hid.lum;
    for (const v of variants) {
      const r = get(vp, v, s); if (!r) continue;
      const c = r.lum - hid.lum;
      const res = await p.evaluate(async ([a, h, cys]) => {
        const load = (s) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s; });
        const px = (im) => { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; };
        const A = px(await load(a)); const H = px(await load(h));
        const lum = (P, x, y) => { const i = (y * P.w + x) * 4; return (P.d[i] + P.d[i + 1] + P.d[i + 2]) / 3; };
        const W = Math.min(A.w, H.w), HH = Math.min(A.h, H.h);
        const out = cys.map((cy0) => {
          const cy = Math.max(10, Math.min(HH - 11, cy0)); const d = [];
          for (let x0 = 0; x0 + 32 <= W; x0 += 32) { let t = 0; for (let y = cy - 10; y <= cy + 10; y++) for (let x = x0; x < x0 + 32; x++) t += lum(A, x, y) - lum(H, x, y); d.push(t / (21 * 32)); }
          let peak = -1e9, step = 0; for (let x = 0; x < d.length; x++) { if (d[x] > peak) peak = d[x]; if (x) step = Math.max(step, Math.abs(d[x] - d[x - 1])); }
          return { cy, peak: +peak.toFixed(2), maxStep: +step.toFixed(2) };
        });
        let topJ = 0, botJ = 0;
        for (let x = 0; x < W; x++) {
          topJ = Math.max(topJ, Math.abs((lum(A, x, 0) - lum(H, x, 0)) - (lum(A, x, 1) - lum(H, x, 1))));
          botJ = Math.max(botJ, Math.abs((lum(A, x, HH - 1) - lum(H, x, HH - 1)) - (lum(A, x, HH - 2) - lum(H, x, HH - 2))));
        }
        return { glows: out, topEdgeJump: +topJ.toFixed(2), bottomEdgeJump: +botJ.toFixed(2), sizeA: [A.w, A.h], sizeH: [H.w, H.h] };
      }, [fs.readFileSync(r.shot).toString('base64'), fs.readFileSync(hid.shot).toString('base64'), r.glows.map((g) => g.cy)]);
      lines.push(`${vp} ${s} ${v} contribution ${c.toFixed(3)} ratioToHead ${(c / headC).toFixed(2)} glows ${JSON.stringify(res.glows)} edgeJump top ${res.topEdgeJump} bottom ${res.bottomEdgeJump} size ${res.sizeA}/${res.sizeH}`);
    }
  }
  await b.close();
  fs.writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
})();
