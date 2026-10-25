// C round 157 — probe b: loop on, range cleared, Export opened for the FIRST time (scopeChoice null). node p157b.cjs <1440|1280>
const L = require('./lib.cjs'); const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const fs = require('fs'); const path = require('path');
const VP = +process.argv[2] || 1440; const net = []; const res = { vp: VP, utc: new Date().toISOString(), errors: [] }; const OUTF = path.join(L.OUT, `p157b-${VP}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const st = (p) => p.evaluate(() => ({ footerRange: !!document.querySelector('[data-testid=arrangement-range]'), laneRanges: document.querySelectorAll('[data-testid=arrangement-lane-range]').length, detStart: (document.querySelector('[data-testid=arrangement-detail-start]') || {}).value ?? null, loop: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null }));
const dlg = (p) => p.evaluate(() => { const d = document.querySelector('#arrangement-export-title + p'); const n = document.querySelector('[data-testid=arrangement-export-loop-note]'); const r = document.querySelector('[data-testid=arrangement-export-scope-range]'); const pr = document.querySelector('[data-testid=arrangement-export-scope-project]'); const M = 'font-mono font-normal tabular-nums'; const mono = (e) => e ? [...e.querySelectorAll('span')].filter((s) => s.className === M).map((s) => s.textContent) : null; return { desc: d.textContent, descMono: mono(d), note: n && n.textContent, noteMono: mono(n), rangeDisabled: r.disabled, rangeChecked: r.checked, projectChecked: pr.checked, rangeLabel: r.closest('label').textContent }; });
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, X.VPS[VP], `p157b-${VP}`, net);
    await L.setSnapOff(p); await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    const hero = await H.byLane(p, 'music'); await X.rangeDrag(p, hero.id, 3, 5); await p.mouse.move(2, 2);
    res.loop = await X.key(p, 'Control+l'); res.s1 = await st(p);
    const lb = await p.locator('[data-track-id=sfx]').first().boundingBox(); await p.mouse.click(await X.tx(p, 12), lb.y + lb.height / 2); await L.sleep(400); await L.blur(p);
    res.s2 = await st(p);
    await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await L.sleep(500);
    res.dlg = await dlg(p); res.pe = await p.evaluate(() => document.querySelector('[data-testid=arrangement-project-end]').textContent.trim());
    res.expect = { desc: `Entire project · 00:00.000 — ${res.pe}`, note: `Loop does not change the export — the entire project is exported (00:00.000 — ${res.pe}).` };
    res.ok = res.dlg.desc === res.expect.desc && res.dlg.note === res.expect.note && JSON.stringify(res.dlg.descMono) === JSON.stringify(['00:00.000', res.pe]) && JSON.stringify(res.dlg.noteMono) === JSON.stringify(['00:00.000', res.pe]);
    await p.screenshot({ path: path.join(L.SHOTS, `p157b-loop-norange-${VP}.png`) });
    await p.keyboard.press('Escape'); await L.sleep(300);
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save(); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
