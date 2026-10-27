// C round 212 — PIX-212 compare: base vs cur per state/element: pixels (max delta, px > 8), box/viewBox/colour, and parsed column geometry.
// usage: node c212pixcmp.cjs <vw>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const L = require('./c212lib.cjs');
const fs = require('fs');
const path = require('path');
const vw = process.argv[2];
const A = require(path.join(L.OUT, `pix-base-${vw}.json`));
const B = require(path.join(L.OUT, `pix-cur-${vw}.json`));
const DIR = path.join(L.SHOTS, 'pix');
function cols(d) {
  if (!d) return null;
  const rects = [...d.matchAll(/M(\d+) (\d+\.\d{3})h1V(\d+\.\d{3})h-1Z/g)];
  if (rects.length) return { fmt: 'rects', c: rects.map((m) => m[2] + '/' + m[3]), xs: rects.map((m) => Number(m[1])) };
  const ok = /^M0 1(V\d+\.\d{3}H\d+)+Z$/.test(d);
  const e = [...d.matchAll(/V(\d+\.\d{3})H(\d+)/g)];
  const n = e.length / 2;
  const c = e.slice(0, n).map((m, i) => m[1] + '/' + e[e.length - 1 - i][1]);
  const xs = e.map((m) => Number(m[2]));
  const xsOk = xs.every((x, i) => (i < n ? x === i + 1 : x === 2 * n - 1 - i));
  return { fmt: ok && xsOk ? 'outline' : 'outline-BAD', c, xs: null };
}
(async () => {
  const br = await chromium.launch();
  const p = await br.newPage();
  const out = { vw, rows: [] };
  for (const state of Object.keys(A).filter((k) => A[k] && A[k].lane)) {
    for (const el of ['lane', 'detail']) {
      const a = A[state][el], b = B[state] && B[state][el];
      const row = { state, el };
      if (!a || !b) { row.error = 'missing'; out.rows.push(row); continue; }
      row.sameBox = JSON.stringify(a.box) === JSON.stringify(b.box);
      row.sameViewBox = a.viewBox === b.viewBox;
      row.sameColor = a.color === b.color && a.fill === b.fill && a.opacity === b.opacity && a.cls === b.cls && a.par === b.par;
      row.paths = [a.paths, b.paths];
      const ca = cols(a.d), cb = cols(b.d);
      row.fmt = [ca && ca.fmt, cb && cb.fmt];
      row.columns = [ca && ca.c.length, cb && cb.c.length];
      row.sameGeometry = !!ca && !!cb && JSON.stringify(ca.c) === JSON.stringify(cb.c) && (!ca.xs || ca.xs.every((x, i) => x === i));
      row.dLen = [a.d && a.d.length, b.d && b.d.length];
      const fa = path.join(DIR, a.shot || ''), fb = path.join(DIR, b.shot || '');
      if (fs.existsSync(fa) && fs.existsSync(fb) && fs.statSync(fa).isFile()) {
        const r = await p.evaluate(async ([SA, SB]) => {
          const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
          const [ia, ib] = [await load(SA), await load(SB)];
          if (ia.width !== ib.width || ia.height !== ib.height) return { size: [ia.width, ia.height, ib.width, ib.height] };
          const c = (i) => { const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const x = cv.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
          const da = c(ia), db = c(ib);
          let diff = 0, over8 = 0, mx = 0;
          for (let i = 0; i < da.length; i += 4) {
            const m = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]));
            if (m > 0) diff++; if (m > 8) over8++; if (m > mx) mx = m;
          }
          return { w: ia.width, h: ia.height, px: da.length / 4, diffPx: diff, over8, maxDelta: mx };
        }, ['data:image/png;base64,' + fs.readFileSync(fa).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(fb).toString('base64')]);
        Object.assign(row, r);
      } else row.shotError = [a.shot, b.shot];
      out.rows.push(row);
    }
  }
  out.allOver8Zero = out.rows.every((r) => r.over8 === 0);
  out.maxDelta = Math.max(...out.rows.map((r) => r.maxDelta ?? 999));
  out.allSame = out.rows.every((r) => r.sameBox && r.sameViewBox && r.sameColor && r.sameGeometry);
  out.values = { base: [A.dragm12 && A.dragm12.value, A.dragp6 && A.dragp6.value], cur: [B.dragm12 && B.dragm12.value, B.dragp6 && B.dragp6.value] };
  L.save(`pixcmp-${vw}.json`, out);
  for (const r of out.rows) console.log(r.state, r.el, JSON.stringify({ g: r.sameGeometry, box: r.sameBox, vb: r.sameViewBox, col: r.sameColor, fmt: r.fmt, n: r.columns, diff: r.diffPx, over8: r.over8, max: r.maxDelta, size: r.size }));
  console.log('allOver8Zero', out.allOver8Zero, 'maxDelta', out.maxDelta, 'allSame', out.allSame, JSON.stringify(out.values));
  await br.close();
})();
