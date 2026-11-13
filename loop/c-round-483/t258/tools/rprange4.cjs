const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1280], 'RP-RANGE-why', net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  const st = (await L.clipsDom(p)).find((c) => c.lane === 'stems'); await L.selectClip(p, st.id);
  const snap = () => p.evaluate(() => { const o = {}; for (const e of document.querySelectorAll('[data-testid]')) { const r = e.getBoundingClientRect(); if (r.height > 0) o[e.dataset.testid + (e.closest('[data-track-id]') ? '@' + e.closest('[data-track-id]').dataset.trackId : '')] = [Math.round(r.top), Math.round(r.height)]; } o.scrollTop = document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop; return o; });
  const a = await snap(); await X.rangeDrag(p, st.id, 5, 8); const c = await snap();
  const diff = Object.keys({ ...a, ...c }).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(c[k])).map((k) => `${k}: ${JSON.stringify(a[k])} -> ${JSON.stringify(c[k])}`);
  console.log(diff.join('\n')); await b.close(); })();
