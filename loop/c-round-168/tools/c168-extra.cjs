// C round 168 — extra: reduced motion on the FULL import button (S0, no group) + rendered dock frame pixel after a real import. node c168-extra.cjs <W>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const VIMP = '[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)';
(async () => {
  const b = await L.launch(); const net = []; const res = { W };
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c168rmfull-${W}`, net, { reducedMotion: 'reduce' });
    res.rmFull = await p.evaluate((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); return { text: e.textContent.trim(), w: e.getBoundingClientRect().width, tp: cs.transitionProperty, mm: matchMedia('(prefers-reduced-motion: reduce)').matches }; }, VIMP);
    await ctx.close(); }
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c168dock-${W}`, net);
    const bb = await p.locator(VIMP).first().boundingBox();
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)]); await fc.setFiles(L.MEDIA + 'clip-4s-vp9-opus.webm');
    await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 }); await L.seekTo(p, 1); await sleep(2500);
    const v = p.locator('video[data-video-role=active]'); const vb = await v.boundingBox(); res.videoBox = vb;
    const f = path.join(L.SHOTS, 'func', `extra-${W}-dock.png`); const buf = await p.screenshot({ path: f, clip: vb });
    res.dock = await p.evaluate(async (b64) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0, nonDark = 0; const set = new Set(); for (let i = 0; i < d.length; i += 4 * 17) { n++; if (d[i] + d[i + 1] + d[i + 2] > 60) nonDark++; set.add(`${d[i] >> 4},${d[i + 1] >> 4},${d[i + 2] >> 4}`); } return { samples: n, nonDarkFrac: +(nonDark / n).toFixed(3), distinctColours: set.size }; }, buf.toString('base64'));
    res.video = await p.evaluate(() => { const e = document.querySelector('video[data-video-role=active]'); return { rs: e.readyState, ct: e.currentTime, vw: e.videoWidth }; });
    await ctx.close(); }
  res.net = X.netOk(net); await b.close();
  fs.writeFileSync(path.join(L.OUT, `extra-${W}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
