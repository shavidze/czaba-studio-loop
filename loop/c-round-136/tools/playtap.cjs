// C round 136: MARKER-MENU "Play from here" — real output tap (AnalyserNode on the live destination) + transport position. node playtap.cjs <1440|1280>
const W = +process.argv[2] || 1440;
const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = []; const res = { vp: W };
  const { page: p } = await L.openStudio(b, X.VPS[W], `playtap-${W}`, net, { extraInit: X.tapInit });
  await L.setSnapOff(p);
  res.add = await L.addAt(p, 'demo-stem-pulse', 'stems', 0); await p.keyboard.press('Escape'); await sleep(200); await L.blur(p);
  await L.blur(p); await p.keyboard.press('Home'); await p.focus('[data-testid=arrangement-playhead-handle]'); for (let i = 0; i < 60; i++) await p.keyboard.press('ArrowRight'); await L.blur(p);
  await p.keyboard.press('m'); await sleep(200); await p.keyboard.press('Control+a'); await p.keyboard.type('PlayHere'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
  await p.keyboard.press('Home'); await sleep(300); res.posBefore = await L.posNow(p);
  await p.locator('[data-testid=arrangement-marker]').first().click({ button: 'right' }); await sleep(400);
  res.menu = await p.evaluate(() => { const m = document.querySelector('[role=menu]'); return m && { aria: m.getAttribute('aria-label'), items: [...m.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()) }; });
  await p.evaluate(() => window.__tapStart());
  await p.getByRole('menuitem', { name: 'Play from here' }).click();
  const samples = [];
  for (let i = 0; i < 8; i++) { await sleep(250); samples.push(await L.posNow(p)); }
  const S = await p.evaluate(() => window.__tapStop());
  res.positions = samples; res.tapFrames = S.length; res.tapPeak = Math.max(0, ...S.map((s) => s.peak)); res.tapNonzeroFrames = S.filter((s) => s.peak > 1e-4).length;
  res.playBtn = await p.evaluate(() => ([...document.querySelectorAll('button')].find((x) => /Play|Pause/.test(x.textContent)) || {}).textContent);
  await L.blur(p); await p.keyboard.press('Space'); await sleep(400);
  res.afterStop = await p.evaluate(() => ([...document.querySelectorAll('button')].find((x) => /Play|Pause/.test(x.textContent)) || {}).textContent);
  res.net = X.netOk(net);
  L.save(L.OUT, `playtap-${W}.json`, res); console.log(JSON.stringify(res));
  await b.close();
})();
