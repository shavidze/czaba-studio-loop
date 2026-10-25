const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => { const b = await L.launch(); const net = []; const res = {};
 try { const { page: p } = await L.openStudio(b, X.VPS[1440], 'rdel-1440', net); await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); const hero = (await H.byLane(p, 'music')).id;
  await X.rangeDrag(p, hero, 3, 5); res.range = await H.range(p);
  const btn = p.locator('button', { hasText: /^Delete$/ }); res.nDeleteButtons = await btn.count();
  await btn.click(); await sleep(500);
  res.status = await L.status(p); res.statusRole = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-status]'); return s && (s.getAttribute('role') + '|' + s.getAttribute('aria-live')); });
  res.clips = H.brief(await H.cl(p)); res.focus = await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
 } catch (e) { res.err = String(e.stack || e).slice(0, 500); }
 res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, 'rdel-1440.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close(); })();
