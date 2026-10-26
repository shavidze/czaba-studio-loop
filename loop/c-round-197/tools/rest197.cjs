// C round 197 — REST-197: tree (:5173) vs ref (:5184) rest shots, default scene and one-marker scene, both live in the same run.
// node rest197.cjs <W>
const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const W = +(process.argv[2] || 1440); const H = W === 1440 ? 900 : 720;
const OUT = path.join(__dirname, '..', 'out', 'rest'); const SHD = path.join(__dirname, '..', 'shots', 'rest'); fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SHD, { recursive: true });
const boxes = () => { const q = (s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return [e.dataset.testid || e.getAttribute('aria-label') || e.tagName, +r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; });
  const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const chrome = sc.querySelector('.sticky.top-0'); const cr = chrome.getBoundingClientRect();
  return { chrome: [+cr.x.toFixed(2), +cr.y.toFixed(2), +cr.width.toFixed(2), +cr.height.toFixed(2)], markerRow: q('[data-testid=arrangement-marker-row]'), markerStrip: q('[data-testid=arrangement-marker-strip]'), loopStrip: q('[data-testid=arrangement-loop-strip]'), flags: q('[data-testid=arrangement-marker]'), labels: q('[data-marker-label]'),
    rows: q('[data-track-id] [data-testid=arrangement-track-header]'), lanes: q('[data-track-id]'), scroll: { st: sc.scrollTop, sl: sc.scrollLeft, spt: getComputedStyle(sc).scrollPaddingTop } }; };
async function shoot(port, scene) {
  process.env.C_BASE = `http://127.0.0.1:${port}`; // lib reads BASE at require time; use explicit goto instead
  const browser = await L.launch(); const net = [];
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  const log = { errors: [], hyd: [], forbidden: [], auth: [] };
  page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) log.hyd.push(t.slice(0, 200)); if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199/i.test(t)) log.errors.push(t.slice(0, 200)); });
  page.on('pageerror', (e) => log.errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('request', (q) => { if (q.headers().authorization) log.auth.push(q.url()); if (!/^http:\/\/127\.0\.0\.1|^data:|^blob:|fonts\.(googleapis|gstatic)\.com/.test(q.url())) log.forbidden.push(q.url()); });
  await page.goto(`http://127.0.0.1:${port}/studio-lab`, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(2000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const t0 = Date.now(); while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')]; return o.length === 0 ? -1 : o.filter((x) => /იტვირთება…|Loading…/.test(x.textContent)).length; }); if (n === 0) break; await sleep(250); }
  await L.fontsWait(page); await sleep(500);
  const load = await page.evaluate(boxes);
  if (scene === 'marker') { await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400); }
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await sleep(600);
  const f = path.join(SHD, `${port === 5184 ? 'ref' : 'tree'}-${W}-${scene}.png`); await page.screenshot({ path: f });
  const b = await page.evaluate(boxes); await ctx.close(); await browser.close(); return { f, b, load: load.scroll, log };
}
(async () => {
  const res = { W };
  for (const scene of ['default', 'marker']) {
    const t = await shoot(5173, scene), r = await shoot(5184, scene);
    const A = decode(fs.readFileSync(t.f)), B = decode(fs.readFileSync(r.f));
    const flagBoxes = [...t.b.flags, ...r.b.flags].map((x) => [x[1], x[2], x[1] + x[3], x[2] + x[4]]);
    const inFlag = (x, y) => flagBoxes.some((q) => x >= q[0] && x < q[2] && y >= q[1] && y < q[3]);
    let out = 0, inside = 0; const bb = [1e9, 1e9, -1, -1];
    for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const p = A.px(x, y), q = B.px(x, y); if (p[0] !== q[0] || p[1] !== q[1] || p[2] !== q[2]) { if (inFlag(x / 2, y / 2)) inside++; else { out++; bb[0] = Math.min(bb[0], x / 2); bb[1] = Math.min(bb[1], y / 2); bb[2] = Math.max(bb[2], x / 2); bb[3] = Math.max(bb[3], y / 2); } } }
    const boxDelta = {}; for (const k of Object.keys(t.b)) if (JSON.stringify(t.b[k]) !== JSON.stringify(r.b[k])) boxDelta[k] = { tree: t.b[k], ref: r.b[k] };
    res[scene] = { changedOutsideFlag: out, changedInsideFlag: inside, bbox: out ? bb : null, boxDelta, loadTree: t.load, loadRef: r.load, logTree: t.log, logRef: r.log };
    console.log(W, scene, 'outside', out, 'inside', inside, 'boxDelta', JSON.stringify(boxDelta), 'load', JSON.stringify(t.load), JSON.stringify(r.load), 'err', t.log.errors.length, r.log.errors.length, 'hyd', t.log.hyd.length, r.log.hyd.length, 'remote', t.log.forbidden.length, r.log.forbidden.length, 'auth', t.log.auth.length, r.log.auth.length);
  }
  L.save(OUT, `rest-${W}.json`, res);
})().catch((e) => { console.error(e); process.exit(1); });
