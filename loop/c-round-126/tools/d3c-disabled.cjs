// C round 126 — S0 disabled controls: is a reason visible (title / aria-describedby / visible text)? 1440 + 1280.
const X = require('./lib122.cjs'); const { L } = X; const fs = require('fs'); const path = require('path');
const RUNID = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15); const net = [];
(async () => { const b = await L.launch(); const res = { runId: RUNID };
  for (const W of [1440, 1280]) { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d3cdis-${W}-${RUNID}`, net);
    res[W] = await p.evaluate(() => [...document.querySelectorAll('.studio-container button:disabled, .studio-container input:disabled, .studio-container select:disabled, .studio-container [aria-disabled=true]')].filter((e) => e.getClientRects().length).map((e) => { const d = e.getAttribute('aria-describedby'); return { key: e.getAttribute('data-testid') || e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30), title: e.getAttribute('title') || (e.closest('[title]') || { getAttribute: () => null }).getAttribute('title'), describedby: d ? (document.getElementById(d) || {}).textContent : null }; }));
    res[W + 'wz'] = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-waveform-zoom]'); return e && { text: e.textContent.trim().slice(0, 40), title: e.getAttribute('title'), label: e.getAttribute('aria-label') }; });
    await ctx.close(); }
  res.net = X.netOk(net); fs.writeFileSync(path.join(L.ROOT, 'out', 'd3c', `d3c-disabled-${RUNID}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close(); })();
