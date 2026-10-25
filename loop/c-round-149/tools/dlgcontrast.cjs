// C round 149 — RV-2 extension: contrast inside the Export dialog (d6 contrast() reused verbatim, scoped to the dialog). node dlgcontrast.cjs <vp>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'd6.cjs'), 'utf8'); const m = /function contrast\(scopeSel\) \{[\s\S]*?\n\}\n/.exec(src); const fnSrc = m[0];
const W = +process.argv[2] || 1440; const net = [];
(async () => { const b = await L.launch(); const r = { vp: W };
  try { const { page: p } = await L.openStudio(b, X.VPS[W], `dlg-${W}`, net);
    await L.addAt(p, 'demo-soft-impact', 'sfx', 1);
    for (const scope of ['project', 'range']) {
      await X.openDlg(p); await p.mouse.move(2, 2); await sleep(300);
      const c = await p.evaluate(`(${fnSrc})('[role=dialog][aria-labelledby=arrangement-export-title]')`);
      r[scope] = { n: c.length, fails: c.filter((x) => x.ratio !== '?' && !x.pass), unknown: c.filter((x) => x.ratio === '?').map((x) => x.key), min: Math.min(...c.filter((x) => x.ratio !== '?' && !x.disabled).map((x) => x.ratio)) };
      await p.keyboard.press('Escape'); await sleep(300);
      if (scope === 'project') { const id = (await L.clipsDom(p))[0].id; await X.rangeDrag(p, id, 1.2, 2.4); }
    }
  } catch (e) { r.error = String(e.stack || e); }
  r.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `dlgcontrast-${W}.json`), JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ vp: W, error: r.error, project: r.project && { n: r.project.n, min: r.project.min, fails: r.project.fails.map((f) => [f.key, f.ratio, f.disabled]) }, range: r.range && { n: r.range.n, min: r.range.min, fails: r.range.fails.map((f) => [f.key, f.ratio, f.disabled]) }, net: r.net.ok })); await b.close(); })();
