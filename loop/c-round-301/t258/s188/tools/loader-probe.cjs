// C round 188 — which h1s exist on / while the entrance loader is up (fresh context). node loader-probe.cjs
const L = require('./lib.cjs'); const path = require('path');
(async () => { const b = await L.chromium.launch({ headless: true }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto(L.BASE + '/', { waitUntil: 'commit' }); const samples = []; const t0 = Date.now();
  while (Date.now() - t0 < 9000) { samples.push({ t: Date.now() - t0, ...(await p.evaluate(() => { const ov = [...document.querySelectorAll('div.fixed.inset-0')].filter((d) => d.style.backgroundColor === 'rgb(0, 0, 0)'); return { loader: ov.length, h1: [...document.querySelectorAll('h1')].map((h) => ({ t: h.textContent.trim().slice(0, 40), inLoader: ov.some((o) => o.contains(h)), cls: h.className.slice(0, 80) })) }; }).catch(() => ({ err: 1 }))) }); await L.sleep(300); }
  const comp = samples.reduce((a, s) => { const k = JSON.stringify([s.loader, s.h1]); if (!a.length || a[a.length - 1].k !== k) a.push({ k, from: s.t, s }); return a; }, []).map((x) => ({ fromMs: x.from, loader: x.s.loader, h1: x.s.h1 }));
  L.save(path.join(__dirname, '..', 'out'), 'loader-probe.json', comp); console.log(JSON.stringify(comp, null, 1)); await b.close(); })();
