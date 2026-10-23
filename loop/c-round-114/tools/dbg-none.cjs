const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const o = await L.openStudio(b, { width: 1440, height: 900 }, 'dbg', net); const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  const c = await L.clipsDom(p); const st = c.find((x) => x.lane === 'stems'); const sf = c.find((x) => x.lane === 'sfx');
  await L.selectClip(p, st.id); await L.selectClip(p, sf.id, ['Control']);
  console.log('sel', (await L.clipsDom(p)).filter((x) => x.sel).map((x) => x.lane));
  const MODE = process.argv[2] || 'drag';
  const t = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (t !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  const fb = await p.locator('[data-testid=arrangement-detail-clip-gain-fader]').boundingBox();
  console.log('fader disabled', await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]').disabled));
  if (MODE.includes('drag')) { await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down(); await p.mouse.move(fb.x + fb.width / 2 + 20, fb.y + fb.height / 2, { steps: 5 }); await p.mouse.up(); await L.sleep(250); console.log('after drag status', await L.status(p), 'sel', (await L.clipsDom(p)).filter((x) => x.sel).map((x) => x.lane)); }
  if (MODE.includes('esc')) { await L.blur(p); await p.keyboard.press('Escape'); await L.sleep(300); console.log('after esc', (await L.clipsDom(p)).filter((x) => x.sel).map((x) => x.lane)); }
  const cb = await p.locator(`[data-clip-id="${sf.id}"]`).boundingBox();
  const x = Math.min(cb.x + cb.width + 80, 1400), y = cb.y + cb.height / 2;
  console.log('pt', x, y, await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.outerHTML.slice(0, 200)); }, [x, y]));
  await p.mouse.click(x, y); await L.sleep(400);
  console.log('sel2', (await L.clipsDom(p)).filter((x) => x.sel).map((x) => x.lane), await L.status(p));
  await p.screenshot({ path: L.SHOTS + '/dbg-none.png' });
  await b.close();
})();
