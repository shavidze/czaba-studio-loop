// C round 196 — REST-196: rest shot (same recipe as c-round-191 rv.cjs) + diff vs c191 rest-full and neighbour boxes. node rest.cjs <port> <W> <att>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const X = require('./lib122.cjs'); const { L, sleep } = X; const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const ATT = process.argv[4] || '1';
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}-${ATT}`; const ROOT = path.join(__dirname, '..'); const SHD = path.join(ROOT, 'shots', 'rest', TAG); fs.mkdirSync(SHD, { recursive: true });
const BASE_PNG = path.join(ROOT, '..', 'c-round-191', 'shots', `c191-${W}-1`, 'rest-full.png'); const net = []; const res = { W, PORT, ATT, baseline: BASE_PNG };
(async () => { const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try { const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page; res.fonts = o.log.fontsReady;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, demo: document.body.innerText.includes('Demo collection — no sign-in required') }));
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500); const f = path.join(SHD, 'rest-full.png'); await p.screenshot({ path: f });
    res.masks = await p.evaluate(() => [...document.querySelectorAll('input[type=range]')].map((i) => { const r = i.getBoundingClientRect(); return { l: i.getAttribute('aria-label') || i.dataset.testid, x0: r.x - 2, x1: r.right + 2, y0: r.y - 2, y1: r.bottom + 2, box: [r.x, r.y, r.width, r.height] }; }));
    res.boxes = await p.evaluate(() => { const q = (s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return [e.dataset.testid || e.getAttribute('aria-label') || e.tagName, +r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; });
      return { rows: q('[data-track-id] [data-testid=arrangement-track-header]'), lanes: q('[data-track-id]'), ms: q('button[aria-label^="Mute — "],button[aria-label^="Solo — "],button[aria-label="Master Mute"]'), readouts: q('[data-testid*=readout],[data-testid=arrangement-master-peak]'), panReset: q('[data-testid=arrangement-track-pan-reset]'), ranges: q('input[type=range]'), zoomRow: q('[data-testid=arrangement-fit],[data-testid=arrangement-follow]') }; });
    const A = decode(fs.readFileSync(f)); const inMask = (x, y) => res.masks.some((m) => x >= m.x0 && x < m.x1 && y >= m.y0 && y < m.y1);
    const cmp = (file) => { const B = decode(fs.readFileSync(file)); if (A.w !== B.w || A.h !== B.h) return { size: [A.w, A.h, B.w, B.h] }; let n = 0, nm = 0; const bb = [1e9, 1e9, -1, -1];
      for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const q = A.px(x, y), r = B.px(x, y); if (q[0] !== r[0] || q[1] !== r[1] || q[2] !== r[2]) { if (inMask(x / 2, y / 2)) { nm++; continue; } n++; bb[0] = Math.min(bb[0], x / 2); bb[1] = Math.min(bb[1], y / 2); bb[2] = Math.max(bb[2], x / 2); bb[3] = Math.max(bb[3], y / 2); } }
      return { changedOutsideMask: n, changedInsideMask: nm, bboxCss: n ? bb : null }; };
    res.vsC191 = cmp(BASE_PNG);
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 800); }
  await b.close(); res.net = net.map((n) => ({ errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, auth: n.authHeaders })); L.save(path.join(ROOT, 'out', 'rest'), `${TAG}.json`, res);
  console.log(JSON.stringify({ TAG, anon: res.anon, vsC191: res.vsC191, err: res.error, net: res.net })); })();
