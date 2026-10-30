const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const W = +(process.argv[2] || 1440); const H = W === 1440 ? 900 : 720; const OUT = path.join(__dirname, '..', 'out', 'rvstatic', `${W}`);
(async () => { const b = await L.launch(); const net = []; const res = {};
  const { page: p } = await L.openStudio(b, { width: W, height: H }, `rvfollow-${W}`, net, { deviceScaleFactor: 2 });
  await L.setSnapOff(p); await L.addAt(p, 'demo-middle-east', 'music', 1); await L.addAt(p, 'demo-stem-pulse', 'stems', 0);
  const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  const sfx = await p.evaluate(() => { const r = document.querySelector('[data-track-id=sfx]').getBoundingClientRect(); return { x: r.right - 40, y: r.top + r.height / 2 }; });
  await p.mouse.click(sfx.x, sfx.y); await sleep(300); await p.mouse.move(W - 2, 2); await sleep(300);
  res.selected = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);
  const brass = async (sel, name) => { const bb = await p.locator(sel).first().boundingBox(); const vis = { x: Math.max(0, Math.floor(bb.x)), y: Math.max(0, Math.floor(bb.y)) }; vis.width = Math.min(W - vis.x, Math.ceil(bb.width)); vis.height = Math.min(H - vis.y, Math.ceil(bb.height)); const f = path.join(OUT, `${name}.png`); await p.screenshot({ path: f, clip: vis }); const A = decode(fs.readFileSync(f)); let n = 0, tot = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const c = A.px(x, y); tot++; if (c[0] - c[2] >= 45) n++; } return { brassPx: n, tot }; };
  res.brass = { music: await brass('[data-track-id=music] [data-clip-id]', 'unsel-music'), stems: await brass('[data-track-id=stems] [data-clip-id]', 'unsel-stems'), overview: await brass('[data-testid=arrangement-overview-frame]', 'unsel-overview') };
  res.radius = await p.evaluate(() => { const chain = (s) => { const out = []; let e = document.querySelector(s); for (let i = 0; e && i < 5; i++, e = e.parentElement) { const c = getComputedStyle(e); out.push({ tag: e.tagName, testid: e.dataset.testid || null, r: c.borderTopLeftRadius, bw: c.borderTopWidth, w: Math.round(e.getBoundingClientRect().width) }); } return out; };
    const inner = (s) => [...(document.querySelector(s) || document.body).querySelectorAll('*')].map((e) => ({ testid: e.dataset.testid || e.tagName, r: getComputedStyle(e).borderTopLeftRadius, w: Math.round(e.getBoundingClientRect().width) })).filter((x) => x.r === '10px').slice(0, 5);
    return { detail: chain('[data-testid=arrangement-detail-panel]'), detailIn: inner('[data-testid=arrangement-detail-panel]'), dock: chain('[data-testid=arrangement-video-dock]'), dockIn: inner('[data-testid=arrangement-video-dock]'), ov: chain('[data-testid=arrangement-overview]') }; });
  res.groupMS = null;
  await p.screenshot({ path: path.join(OUT, 'unselected.png') });
  console.log(JSON.stringify(res, null, 1)); await b.close(); })();
