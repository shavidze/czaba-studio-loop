// C round 126 — effective hit area (elementFromPoint) of undersized targets, S0 1440 + 1280, real scrollbars.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const RUNID = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15); const net = [];
(async () => {
  const b = await L.chromium.launch({ headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] }); const res = { runId: RUNID };
  for (const W of [1440, 1280]) {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d3chit-${W}-${RUNID}`, net);
    res[W] = await p.evaluate(() => {
      const sels = { librarySep: '[data-testid=arrangement-library-separator]', detailSep: '[data-testid=arrangement-detail-separator]', trackHeight: '[data-track-id=music] [data-testid=arrangement-track-height]', folderFold: '[aria-label$="დაკეცვა"]', trackFold: '[data-track-id=music] [data-testid=arrangement-track-fold]', pan: '[data-track-id=music] [data-testid=arrangement-track-pan]', vol: '[data-track-id=music] input[aria-label^="Volume"]', masterVol: 'input[aria-label="Master Volume"]', markerAdd: '[data-testid=arrangement-marker-add]', tempo: '[data-testid=arrangement-tempo-input]', playhead: '[data-testid=arrangement-playhead-handle]' };
      const out = {};
      for (const [k, s] of Object.entries(sels)) {
        const e = document.querySelector(s); if (!e) { out[k] = null; continue; }
        const b = e.getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2; const horiz = b.width >= b.height;
        const span = (axis) => { let lo = 0, hi = 0; for (let d = 1; d <= 20; d++) { const el = axis === 'y' ? document.elementFromPoint(cx, cy - d) : document.elementFromPoint(cx - d, cy); if (el === e || e.contains(el)) lo = d; else break; } for (let d = 1; d <= 20; d++) { const el = axis === 'y' ? document.elementFromPoint(cx, cy + d) : document.elementFromPoint(cx + d, cy); if (el === e || e.contains(el)) hi = d; else break; } return lo + hi + 1; };
        out[k] = { box: [Math.round(b.width), Math.round(b.height)], effectiveH: span('y'), effectiveW: span('x'), cursor: getComputedStyle(e).cursor };
      }
      return out;
    });
    await ctx.close();
  }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.ROOT, 'out', 'd3c', `d3c-hit-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); await b.close();
})();
