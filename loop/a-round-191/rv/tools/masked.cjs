// masked diff of a191 rest-full vs c190 baseline; mask = the four level faders' input box + 4 css px
const X = require('./lib122.cjs'); const { L, sleep } = X; const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2];
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  const net = []; const o = await L.openStudio(b, X.VPS[W], 'a191m-' + W, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page;
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
  const rects = await p.evaluate(() => [...document.querySelectorAll('input[type=range]')].map((e) => { const r = e.getBoundingClientRect(); return { label: e.getAttribute('aria-label'), level: /^Volume — |^Master Volume$|^Clip Gain/.test(e.getAttribute('aria-label') || ''), x: r.x, y: r.y, w: r.width, h: r.height }; }));
  await b.close();
  const A = decode(fs.readFileSync(path.join(__dirname, '..', 'shots', `a191-${W}-1`, 'rest-full.png')));
  const B = decode(fs.readFileSync(path.join(__dirname, '../../../c-round-190/shots', `c190-${W}-1`, 'rest-full.png')));
  const masks = rects.filter((r) => r.level).map((r) => [r.x - 4, r.y - 4, r.x + r.w + 4, r.y + r.h + 4]);
  let n = 0; const bb = [1e9, 1e9, -1, -1]; const inMask = (x, y) => masks.some((m) => x >= m[0] && x < m[2] && y >= m[1] && y < m[3]);
  const perCtl = {};
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const q = A.px(x, y), r = B.px(x, y); if (q[0] !== r[0] || q[1] !== r[1] || q[2] !== r[2]) { const X2 = x / 2, Y2 = y / 2; if (inMask(X2, Y2)) continue; n++; bb[0] = Math.min(bb[0], X2); bb[1] = Math.min(bb[1], Y2); bb[2] = Math.max(bb[2], X2); bb[3] = Math.max(bb[3], Y2); for (const r2 of rects) if (X2 >= r2.x && X2 < r2.x + r2.w && Y2 >= r2.y && Y2 < r2.y + r2.h) perCtl[r2.label] = (perCtl[r2.label] || 0) + 1; } }
  const res = { W, rects, changedOutsideMask: n, bboxCss: n ? bb : null, perCtl };
  fs.writeFileSync(path.join(__dirname, '..', `masked-${W}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ W, changedOutsideMask: n, bboxCss: n ? bb : null, perCtl }));
})().catch((e) => { console.error(e); process.exit(1); });
