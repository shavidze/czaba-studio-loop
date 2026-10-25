const X = require('./tools/lib122.cjs'); const { L } = X;
(async () => { const b = await L.launch(); const r = {};
for (const W of [1440, 1280]) { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b165h-${W}`, []);
 r[W] = await p.evaluate(() => { const h = document.querySelector('header'); const t = (h.textContent || '').trim().replace(/\s+/g, ' '); const n = t.replace('← ', '').replace(/\s+/g, ' '); return { old: 'header:' + t.slice(0, 40), new: 'header:' + n.slice(0, 40) }; });
 await ctx.close(); }
await b.close(); console.log(JSON.stringify(r, null, 1)); })();
