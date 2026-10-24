const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[+process.argv[2] || 1440], 'dbl', net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'stems', 0); await p.keyboard.press('Escape'); await L.blur(p);
  const out = {};
  for (const mode of ['noscroll', 'scrolled']) {
    if (mode === 'scrolled') { const zl = p.locator('[data-testid=arrangement-zoom]'); const mm = await zl.evaluate((e) => +e.max); await zl.fill(String(Math.round(mm * 0.8))); await sleep(400); const sb = await p.locator('[data-testid=arrangement-timeline-scroller]').boundingBox(); await p.mouse.move(sb.x + 500, sb.y + 300); await p.mouse.wheel(600, 0); await sleep(500); await L.blur(p); }
    const rb = await p.locator('[data-testid=arrangement-ruler]').boundingBox(); const scb = await p.locator('[data-testid=arrangement-timeline-scroller]').boundingBox();
    const x = Math.max(rb.x, scb.x) + 200, y = rb.y + rb.height / 2;
    const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); window.__dbl = 0; document.addEventListener('dblclick', () => { window.__dbl++; }, { capture: true, once: true }); return e ? `${e.tagName}|${e.dataset.testid || ''}|${(e.className || '').toString().slice(0, 50)}` : null; }, [x, y]);
    const v0 = await p.evaluate(() => ({ sl: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent }));
    await p.mouse.dblclick(x, y); await sleep(700);
    const v1 = await p.evaluate(() => ({ sl: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent, dbl: window.__dbl, st: document.querySelector('[data-testid=arrangement-status]').textContent }));
    // second attempt with manual click/click
    await sleep(800);
    await p.mouse.click(x, y, { clickCount: 1 }); await p.mouse.click(x, y, { clickCount: 2 }); await sleep(700);
    const v2 = await p.evaluate(() => ({ sl: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent, st: document.querySelector('[data-testid=arrangement-status]').textContent }));
    out[mode] = { rb, scb, x, y, hit, v0, v1, v2 };
  }
  console.log(JSON.stringify(out, null, 1)); console.log(JSON.stringify(X.netOk(net)));
  await b.close();
})();
