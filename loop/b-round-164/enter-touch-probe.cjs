// B round 164 planning probe: ROOT-RECON-MARKER-ENTER with a touch clip-move gesture (touch keeps input focus until tap end) at HEAD 7952439.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-marker-label]')].map((s) => s.textContent));
const inputOpen = (p) => p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-name-input]'));
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.testid || a.tagName) : null; });
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b164t-${W}`, net, { hasTouch: true });
    const cdp = await ctx.newCDPSession(p);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
    for (const mode of ['add', 'rename']) {
      const r = {};
      r.pos = await L.seekTo(p, mode === 'add' ? 5 : 9); await sleep(200);
      if (mode === 'add') { await p.click('[data-testid=arrangement-marker-add]'); }
      else { const f = p.locator('[data-marker-label]').first(); await f.click(); await sleep(150); await p.keyboard.press('F2'); }
      await sleep(300);
      await p.keyboard.press('Control+A'); await p.keyboard.type(mode === 'add' ? 'Probe' : 'Renamed');
      r.inputOpenBefore = await inputOpen(p); r.activeBefore = await active(p); r.undoBefore = await X.undoTitle(p); r.flagsBefore = await flags(p);
      const cb0 = await X.clipBox(p, cid);
      const sx = Math.round(cb0.x + 120), sy = Math.round(cb0.y + cb0.height * 0.6);
      await touch('touchStart', sx, sy); await sleep(80);
      for (let i = 1; i <= 5; i++) { await touch('touchMove', sx + i * 8, sy); await sleep(30); }
      await sleep(200);
      r.during = { active: await active(p), inputOpen: await inputOpen(p), status: await L.status(p) };
      await p.keyboard.press('Enter'); await sleep(250);
      r.afterEnter = { inputOpen: await inputOpen(p), active: await active(p), status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p) };
      for (let i = 6; i <= 10; i++) { await touch('touchMove', sx + i * 8, sy); await sleep(30); }
      await touch('touchEnd'); await sleep(500);
      const cb1 = await X.clipBox(p, cid);
      r.afterRelease = { inputOpen: await inputOpen(p), active: await active(p), status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p), clipDx: +(cb1.x - cb0.x).toFixed(1) };
      await p.screenshot({ path: out.replace('.json', `-${W}-${mode}.png`) });
      res[`${W}-${mode}`] = r; console.log(W, mode, JSON.stringify(r));
      await p.keyboard.press('Escape'); await L.blur(p); await sleep(200);
    }
    res[`${W}-net`] = X.netOk ? X.netOk(net) : net;
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
