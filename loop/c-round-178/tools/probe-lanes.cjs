const L = require('./lib.cjs');
(async () => { const b = await L.launch(); const net = []; const { page: p, ctx } = await L.openStudio(b, { width: 1440, height: 900 }, 'lanes', net);
 const r = await p.evaluate(() => ({ tracks: [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId), opts: [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => o.dataset.sourceId + '|' + o.textContent.trim().slice(0, 40)), badge: document.body.innerText.match(/demo[^\n]{0,40}/i)?.[0] }));
 console.log(JSON.stringify(r, null, 1)); await ctx.close(); await b.close(); })();
