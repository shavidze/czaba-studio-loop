const X = require('./tools/lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], 'b163-list', net);
const r = await p.evaluate(() => ({ src: [...document.querySelectorAll('[role=option][data-source-id]')].map(e => e.dataset.sourceId + '|' + e.textContent.trim().slice(0, 40)), tracks: [...document.querySelectorAll('[data-track-id]')].map(e => e.dataset.trackId), clips: document.querySelectorAll('[data-clip-id]').length }));
console.log(JSON.stringify(r, null, 1)); await ctx.close(); await b.close(); })();
