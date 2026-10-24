const X = require('./lib122.cjs'); const { L, sleep } = X; const path = require('path');
(async () => { const b = await L.launch(); const net = []; const out = {};
  for (const W of [1440, 1280]) { const { ctx, page: p } = await L.openStudio(b, X.VPS[W], `hdr90-${W}`, net);
    const t = p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('90'); await p.keyboard.press('Enter'); await sleep(600); await L.blur(p);
    out[W] = await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); const s = document.querySelector('[data-testid=arrangement-grid-division]'); const z = document.querySelector('[data-testid=arrangement-waveform-zoom]'); const gb = g.getBoundingClientRect(), zb = z.getBoundingClientRect(); return { sw: g.scrollWidth, cw: g.clientWidth, selectW: s.getBoundingClientRect().width, groups: [...s.querySelectorAll('optgroup')].map((o) => o.label), zoomRight: zb.right, gridRight: gb.right, zoomInside: zb.right <= gb.right + 0.5 }; });
    const gb = await p.locator('[data-testid=arrangement-grid-control]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, `hdr90-${W}.png`), clip: { x: gb.x - 4, y: gb.y - 4, width: gb.width + 60, height: gb.height + 8 } });
    await ctx.close(); }
  out.net = X.netOk(net); L.save(L.OUT, 'hdr90.json', out); console.log(JSON.stringify(out)); await b.close(); })();
