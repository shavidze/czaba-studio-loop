// C round 126 — volume "dead zone": thumb-centre start vs track start, 1440x900, no clips needed.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const RUNID = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15); const net = [];
(async () => {
  const b = await L.launch(); const res = { runId: RUNID, rows: [] };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[1440], `d3bdead-${RUNID}`, net);
    const sl = p.locator('[data-track-id=music] input[aria-label^="Volume"]');
    res.attrs = await sl.evaluate((s) => ({ min: s.min, max: s.max, step: s.step, value: s.value, w: s.getBoundingClientRect().width, h: s.getBoundingClientRect().height, cls: s.className.slice(0, 200) }));
    const trial = async (name, startFrac, dx, steps) => {
      await sl.dblclick(); await sleep(250); await L.blur(p);
      const bx = await sl.boundingBox(); const min = +res.attrs.min, max = +res.attrs.max; const v0 = +(await sl.inputValue());
      const x0 = typeof startFrac === 'string' && startFrac.startsWith('edge-') ? bx.x + bx.width - +startFrac.slice(5) : startFrac === 'thumb' ? bx.x + bx.width * (v0 - min) / (max - min) : bx.x + bx.width * startFrac; const y = bx.y + bx.height / 2;
      const hit = await p.evaluate(([a, c]) => { const e = document.elementFromPoint(a, c); return e ? e.tagName + ':' + (e.getAttribute('aria-label') || e.getAttribute('data-testid') || '') : null; }, [x0, y]); await p.mouse.move(x0, y); await p.mouse.down(); const atDown = await sl.inputValue();
      const seq = []; for (let i = 1; i <= Math.abs(dx); i++) { await p.mouse.move(x0 + Math.sign(dx) * i, y, { steps }); seq.push(await sl.inputValue()); }
      await p.mouse.up(); await sleep(200);
      res.rows.push({ name, hit, x0: +x0.toFixed(1), v0, atDown, seq, after: await sl.inputValue(), readout: await p.evaluate(() => document.querySelector('[data-track-id=music]').innerText.replace(/\s+/g, ' ').slice(0, 40)) });
    };
    await trial('computed thumb centre (= right edge for value max), -6', 'thumb', -6, 1);
    for (const e of [1, 3, 6, 8]) await trial(`right edge -${e} px (visual thumb), -6`, `edge-${e}`, -6, 1);
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.ROOT, 'out', 'd3b', `d3b-dead2-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 0).slice(0, 3000)); await b.close();
})();
