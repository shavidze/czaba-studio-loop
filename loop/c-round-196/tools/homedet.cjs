const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs');
(async () => { const b = await L.launch(); const out = {};
  for (const W of [1280, 375]) { const H = W === 1280 ? 720 : 812; const shots = [];
    for (const port of [5173, 5173, 5174]) { const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 }); const p = await c.newPage(); await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 90000 }); await L.sleep(3500); await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); }); await p.mouse.move(1, 1); await L.sleep(300); const f = `../out/store/homedet-${W}-${shots.length}-${port}.png`; await p.screenshot({ path: f }); shots.push(f); await c.close(); }
    const diff = (a, c) => { const A = decode(fs.readFileSync(a)), B = decode(fs.readFileSync(c)); let n = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const p = A.px(x, y), q = B.px(x, y); if (p[0] !== q[0] || p[1] !== q[1] || p[2] !== q[2]) n++; } return n; };
    out[W] = { treeVsTree: diff(shots[0], shots[1]), tree2VsRef: diff(shots[1], shots[2]) }; }
  console.log(JSON.stringify(out)); fs.writeFileSync('../out/store/homedet.json', JSON.stringify(out)); await b.close(); })();
