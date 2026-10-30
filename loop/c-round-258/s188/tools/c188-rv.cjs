// C round 188 — STUDIO-RV-187 (copied from c-round-185/tools/c185-rv.cjs; tag name only)
// node c185-rv.cjs <1440|1280> <attempt> <baselinePng>
const X = require('./lib122.cjs'); const { L, sleep } = X; const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const BASE_PNG = process.argv[4];
const TAG = `c188-${W}-${ATT}`; const ROOT = path.join(__dirname, '..'); const OUT = path.join(ROOT, 'out'); const SHD = path.join(ROOT, 'shots', TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, base: L.BASE, utc: new Date().toISOString(), baseline: BASE_PNG };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page;
    res.fonts = o.log.fontsReady;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, path: location.pathname, ls: Object.keys(localStorage), demo: document.body.innerText.includes('Demo collection — no sign-in required') }));
    res.anonCookies = (await o.ctx.cookies()).length;
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    const f = path.join(SHD, 'rest-full.png'); await p.screenshot({ path: f }); res.shot = path.relative(ROOT, f);
    const A = decode(fs.readFileSync(f)), B = decode(fs.readFileSync(BASE_PNG));
    if (A.w !== B.w || A.h !== B.h) res.diff = { size: [A.w, A.h, B.w, B.h] };
    else { let n = 0, max = 0; const bb = [1e9, 1e9, -1, -1]; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const q = A.px(x, y), r = B.px(x, y); const d = Math.max(Math.abs(q[0] - r[0]), Math.abs(q[1] - r[1]), Math.abs(q[2] - r[2])); if (d) { n++; max = Math.max(max, d); bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.max(bb[2], x); bb[3] = Math.max(bb[3], y); } } res.diff = { w: A.w, h: A.h, changed: n, maxDelta: max, bboxDevPx: n ? bb : null }; }
    res.clips = await p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
  } catch (e) { res.error = String((e && e.stack) || e).slice(0, 1000); }
  await b.close();
  res.net = net; L.save(OUT, `${TAG}.json`, res);
  console.log(JSON.stringify({ TAG, fonts: res.fonts && res.fonts.ok, anon: res.anon, cookies: res.anonCookies, diff: res.diff, err: res.error, net: net.map((n) => ({ e: n.errors, h: n.hydration, f: n.forbidden, a: n.authHeaders, noise: n.noise })) }));
})();
