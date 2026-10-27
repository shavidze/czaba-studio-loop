// C round 200 R200-P1b: unselected clip bodies + overview with the playhead at ~10 s (ruler click). Default scene + 3 Library clips added by keyboard (the default scene has 0 clips). No masks. node p1b.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const VAR = process.env.P1B_VAR || ''; const TAG = `c200p1b${VAR}-${W}-${ATT}`; const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, TAG, utc: new Date().toISOString() }; const D = 2;
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), path: location.pathname })); res.snap = await L.setSnapOff(p);
    res.adds = [await L.addAt(p, 'demo-middle-east', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 4), await L.addAt(p, 'demo-soft-impact', 'sfx', 9)];
    res.seek = await L.seekTo(p, 10); if (VAR === 'sel') { const cb = await p.locator('[data-track-id=stems] [data-clip-kind=audio]').first().boundingBox(); await p.mouse.click(cb.x + cb.width - 40, cb.y + cb.height * 0.65); await sleep(500); res.posAfterClipClick = await L.posNow(p); } await p.keyboard.press('Escape'); await sleep(300); await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    const st = await p.evaluate(() => { const ph = document.querySelector('[data-testid=arrangement-playhead]').getBoundingClientRect(); const op = document.querySelector('[data-testid=arrangement-overview-playhead]'); const ov = document.querySelector('[data-testid=arrangement-overview-frame]').getBoundingClientRect(); const ova = document.querySelector('[data-testid=arrangement-overview]').getBoundingClientRect();
      return { ph: [ph.x, ph.y, ph.width, ph.height], pos: document.querySelector('[data-testid=arrangement-position]').textContent, ovPh: op && (() => { const r = op.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })(), ov: [ov.x, ov.y, ov.width, ov.height], ovAll: [ova.x, ova.y, ova.width, ova.height],
        clips: [...document.querySelectorAll('[data-clip-kind]')].map((c) => { const r = c.getBoundingClientRect(); return { id: c.dataset.clipId.slice(0, 8), kind: c.dataset.clipKind, lane: c.closest('[data-track-id]').dataset.trackId, selected: /ring-brand/.test(c.className) || c.getAttribute('aria-selected') === 'true', box: [r.x, r.y, r.width, r.height] }; }) }; });
    const f = path.join(SHD, 'bodies.png'); const img = decode(await p.screenshot({ path: f })); res.shot = path.relative(L.ROOT, f);
    const run = (rect, col) => { const [x, y, w, h] = rect; let n = 0, inC = 0, el = 0; const s = [];
      for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(Math.max(0, x) * D); Xp < Math.floor(Math.min(W, x + w) * D); Xp++) { if (Y >= img.h) continue; n++; const c = img.px(Xp, Y); if (c[0] - c[2] >= 45) { const cx = Xp / D; if (col && cx >= col[0] && cx < col[1]) inC++; else { el++; if (s.length < 5) s.push([cx, Y / D, c]); } } }
      return { n, brassInColumn: inC, brassElsewhere: el, samples: s }; };
    const col = [st.ph[0] - 1, st.ph[0] + st.ph[2] + 1];
    res.state = st; res.clipScans = st.clips.map((c) => ({ ...c, crossesPlayhead: c.box[0] < col[1] && c.box[0] + c.box[2] > col[0], ...run(c.box, col) }));
    res.overview = { ovPh: st.ovPh, ...run(st.ov, st.ovPh ? [st.ovPh[0] - 1, st.ovPh[0] + st.ovPh[2] + 1] : null) };
    res.overviewAll = { box: st.ovAll, ...run(st.ovAll, st.ovPh ? [st.ovPh[0] - 1, st.ovPh[0] + st.ovPh[2] + 1] : null) };
    res.playheadLine = run([st.ph[0] - 1, st.ph[1], st.ph[2] + 2, st.ph[3]], col);
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close(); res.net = X.netOk(net); L.save(L.OUT, `${TAG}.json`, res);
  console.log(JSON.stringify({ TAG, posAfterClipClick: res.posAfterClipClick, error: res.error, net: res.net, adds: res.adds && res.adds.map((a) => a.status), seek: res.seek, pos: res.state && res.state.pos, ph: res.state && res.state.ph, clips: res.clipScans && res.clipScans.map((c) => `${c.lane}/${c.kind} sel=${c.selected} x=${c.box.map((v) => +v.toFixed(1))} cross=${c.crossesPlayhead} col=${c.brassInColumn} else=${c.brassElsewhere}/${c.n}`), overview: res.overview, overviewAll: res.overviewAll, line: res.playheadLine }, null, 1));
})();
