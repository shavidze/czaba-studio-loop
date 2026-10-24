const L = require('./lib.cjs'); const path = require('path');
(async () => {
  const b = await L.launch(); const net = []; const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const O = await L.openStudio(b, vp, `geogroup142-${vp.width}`, net); const p = O.page; await L.setSnapOff(p);
    await L.addAt(p, 'demo-stem-pad', 'music', 0); await L.addAt(p, 'demo-stem-bass', 'stems', 0);
    await p.click(L.nameSel('music')); await L.sleep(250); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await L.sleep(300);
    await L.blur(p); await p.keyboard.press('Control+g'); await L.sleep(500);
    res[vp.width] = await p.evaluate(() => {
      const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/; const hits = []; const seen = [];
      const sel = '[data-testid=arrangement-group-row],[data-testid=arrangement-track-header],[data-testid=arrangement-master],[data-testid=arrangement-track-meter]';
      for (const root of document.querySelectorAll(sel)) for (const el of [root, ...root.querySelectorAll('*')]) {
        for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { seen.push(1); if (KA.test(n.textContent)) hits.push({ tid: root.dataset.testid, v: n.textContent.trim() }); }
        for (const a of ['aria-label', 'title', 'aria-valuetext', 'placeholder']) { const v = el.getAttribute(a); if (v) { seen.push(1); if (KA.test(v)) hits.push({ tid: root.dataset.testid, a, v }); } }
      }
      return { groupRows: document.querySelectorAll('[data-testid=arrangement-group-row]').length, scanned: seen.length, hits, status: document.querySelector('[data-testid=arrangement-status]').textContent.trim() };
    });
    await O.ctx.close();
  }
  await b.close(); res.net = net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders }));
  L.save(L.OUT, 'geogroup142.json', res); console.log(JSON.stringify(res));
})();
