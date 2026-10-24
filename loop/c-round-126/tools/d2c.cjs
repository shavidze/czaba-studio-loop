// C round 125 — D2 remaining rows: Ctrl/Shift+click clips, Ctrl+Delete, Shift+wheel, Escape in Export dialog, library folder arrows. node d2c.cjs
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const net = []; const r = {};
(async () => { const b = await L.launch(); const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], 'd2c-1440', net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4); await L.addAt(p, 'demo-slow-rise', 'sfx', 8);
  const cs = await L.clipsDom(p); const sfx = cs.filter((c) => c.lane === 'sfx').sort((a, b2) => a.start - b2.start); const st = cs.find((c) => c.lane === 'stems');
  await L.selectClip(p, sfx[0].id); await L.selectClip(p, sfx[1].id, ['Control']); r.ctrlClick = H.brief(await H.cl(p));
  await L.selectClip(p, st.id); await L.selectClip(p, sfx[1].id, ['Shift']); r.shiftClick = H.brief(await H.cl(p));
  await L.selectClip(p, sfx[0].id); await L.blur(p); await p.keyboard.press('Control+Delete'); await sleep(400); r.ctrlDelete = { clips: H.brief(await H.cl(p)), status: await L.status(p) }; await p.keyboard.press('Control+z'); await sleep(400);
  const sc = await p.locator('[data-testid=arrangement-timeline-scroller]').boundingBox(); const s0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  await p.mouse.move(sc.x + sc.width / 2, sc.y + 80); await p.keyboard.down('Shift'); await p.mouse.wheel(0, 400); await p.keyboard.up('Shift'); await sleep(400);
  r.shiftWheel = { before: s0, after: await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft) };
  await p.mouse.wheel(0, 400); await sleep(400); r.plainWheel = { scrollLeft: await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft), scrollTop: await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop) };
  await X.openDlg(p); r.dlgOpen = await p.evaluate(() => !!document.querySelector('#arrangement-export-title')); await p.keyboard.press('Escape'); await sleep(400); r.dlgAfterEscape = await p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
  const folder = p.locator('[data-testid=arrangement-library-folder]').first(); await folder.focus(); const exp0 = await folder.getAttribute('aria-expanded'); await p.keyboard.press('ArrowLeft'); await sleep(300); const exp1 = await folder.getAttribute('aria-expanded'); await p.keyboard.press('Enter'); await sleep(300); const exp2 = await folder.getAttribute('aria-expanded'); await p.keyboard.press('Enter'); await sleep(300);
  r.folder = { label: await folder.getAttribute('aria-label'), exp0, afterArrowLeft: exp1, afterEnter: exp2, nOptions: await p.locator('[role=option][data-source-id]').count() };
  r.net = X.netOk(net); fs.writeFileSync(path.join(L.ROOT, 'out', 'd2', 'd2c.json'), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1)); await b.close(); })();
