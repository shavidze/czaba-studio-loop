// C round 126 — D3-C first-visit clarity (fresh S0, no prior knowledge): actions until (a) a sound plays (real output tap), (b) a clip is on a lane, (c) an export starts (WAV parsed). Plus control-boundary (1.4.11) contrast by pixels.
// node d3c-first.cjs <1440|1280>
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440;
const RUNID = `${W}-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`; const net = [];
const peakFor = async (p, ms) => { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); return { samples: S.length, maxPeak: +Math.max(0, ...S.map((s) => s.peak || 0)).toFixed(4) }; };
async function pixelEdge(ctx, png, box) {
  const pg = await ctx.newPage(); await pg.goto('about:blank');
  const r = await pg.evaluate(async ({ b64, box }) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0);
    const lum = (r, gg, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
    const px = (x, y) => { const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2]]; };
    const [x, y, w, h] = box; const midY = y + h / 2;
    const border = px(x, midY), inside = px(x + 4, midY), outside = px(x - 4, midY);
    const ratio = (a, b) => { const A = lum(...a), B = lum(...b); return +((Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05)).toFixed(2); };
    return { border, inside, outside, borderVsOutside: ratio(border, outside), borderVsInside: ratio(border, inside), insideVsOutside: ratio(inside, outside) }; }, { b64: png.toString('base64'), box });
  await pg.close(); return r;
}
(async () => {
  const b = await L.launch(); const res = { runId: RUNID, vp: W };
  try {
    // ---- (a) a sound plays
    { const { page: p } = await L.openStudio(b, X.VPS[W], `d3cfirst-a-${RUNID}`, net, { extraInit: X.tapInit });
      res.s0Status = await L.status(p);
      res.s0Preview = await p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-library-preview-toggle]'); return t ? { text: t.textContent.trim(), disabled: t.disabled } : null; });
      res.s0AudioLanesHint = await p.evaluate(() => ['music', 'stems', 'sfx'].map((id) => { const r = document.querySelector(`[data-track-id=${id}]`); const hdr = r.querySelector('[data-testid=arrangement-track-header]'); const txt = r.innerText.replace(hdr ? hdr.innerText : '', '').replace(/\s+/g, ' ').trim(); return { id, bodyText: txt.slice(0, 80) }; }));
      res.s0VideoHint = await p.evaluate(() => (document.querySelector('[data-track-id=video]') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 120));
      res.a_play_empty = { before: await L.status(p) }; await p.getByRole('button', { name: /^▶ Play|^Play/ }).first().click(); res.a_play_empty.out = await peakFor(p, 1500); res.a_play_empty.status = await L.status(p); await p.keyboard.press('Space').catch(() => {}); await L.blur(p); await sleep(300);
      await p.getByRole('button', { name: /^Play|^■|Stop/ }).first().evaluate((e) => e.textContent).then((t) => { res.a_play_empty.buttonAfter = t; });
      if (/Stop|■/.test(res.a_play_empty.buttonAfter || '')) { await p.getByRole('button', { name: /Stop|■/ }).first().click(); await sleep(300); }
      res.a_preview = { clicks: 1 }; await p.locator('[data-testid=arrangement-library-preview-toggle]').click(); res.a_preview.out = await peakFor(p, 2000); res.a_preview.toggle = await p.locator('[data-testid=arrangement-library-preview-toggle]').textContent();
      await p.locator('[data-testid=arrangement-library-preview-toggle]').click(); await sleep(300);
      await p.context().close(); }
    // ---- (b) clip on a lane + (c) export
    { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `d3cfirst-bc-${RUNID}`, net, { extraInit: X.tapInit });
      res.b_add = { clicks: 1 }; await p.getByRole('button', { name: /＋ დამატება/ }).click(); await sleep(700);
      res.b_add.status = await L.status(p); res.b_add.clips = (await L.clipsDom(p)).map((c) => `${c.lane}@${c.start}`);
      res.shotAfterAdd = await X.shot(p, `D3C-first-add-${RUNID}.png`);
      // play the arrangement now: 1 click Play
      await p.getByRole('button', { name: /^▶ Play|^Play/ }).first().click(); res.b_play = await peakFor(p, 2000); await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
      // (c) export: Export + WAV-ის ექსპორტი
      await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(300);
      res.c_dialog = await X.dstate(p); res.shotDialog = await X.shot(p, `D3C-first-export-${RUNID}.png`);
      const n0 = log.downloads.length; await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click();
      const t0 = Date.now(); while (Date.now() - t0 < 120000) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(250); }
      res.c_exportMs = Date.now() - t0; const rec = log.downloads[n0];
      if (rec && rec.file) { const w = X.wav(rec.file); res.c_wav = { name: rec.name, size: rec.size, fmt: w.fmt, frames: w.frames, seconds: w.seconds, peak: w.peak, rms: w.rms, nan: w.nan, sha16: w.sha }; }
      res.c_footer = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-footer]') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 200));
      await X.closeDlg(p);
      // ---- 1.4.11 control boundaries (pixel): search input, BPM input, Snap button, track fader track
      await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
      const png = await p.screenshot();
      const targets = { search: '[data-testid=arrangement-library-search]', bpm: '[data-testid=arrangement-tempo-input]', snap: '[data-testid=arrangement-snap-toggle]', follow: '[data-testid=arrangement-follow]', fit: '[data-testid=arrangement-fit]', gridSelect: '[data-testid=arrangement-grid-division]' };
      res.boundaries = {};
      for (const [k, s] of Object.entries(targets)) { const bx = await p.locator(s).first().boundingBox(); if (!bx) continue; res.boundaries[k] = { box: [bx.x, bx.y, bx.width, bx.height].map(Math.round), ...(await pixelEdge(ctx, png, [bx.x, bx.y, bx.width, bx.height])) }; }
      // fader unfilled track: sample a pixel right of the thumb is not possible at max; use Pan (centre) right half
      const pan = await p.locator('[data-track-id=music] [data-testid=arrangement-track-pan]').boundingBox();
      res.panTrack = await (async () => { const pg = await ctx.newPage(); await pg.goto('about:blank'); const r = await pg.evaluate(async ({ b64, bx }) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const px = (x, y) => [...g.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3); return { trackRight: px(bx.x + bx.width - 3, bx.y + bx.height / 2), bgAbove: px(bx.x + bx.width - 3, bx.y - 5), trackLeft: px(bx.x + 3, bx.y + bx.height / 2) }; }, { b64: png.toString('base64'), bx: pan }); await pg.close(); return r; })();
    }
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.ROOT, 'out', 'd3c', `d3c-first-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1).slice(0, 6000)); await b.close();
})();
