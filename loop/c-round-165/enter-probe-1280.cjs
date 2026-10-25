// B round 164 planning probe: ROOT-RECON-MARKER-ENTER at HEAD 7952439. Add/rename editor open, clip move gesture held, Enter, release.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const markers = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker-row] button[aria-label]')].map((b) => b.getAttribute('aria-label')).filter((s) => /marker/i.test(s)));
const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-marker-label]')].map((s) => s.textContent));
const inputOpen = (p) => p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-name-input]'));
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.testid || a.tagName) : null; });
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1280]) {
    const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b164-${W}`, net);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
    for (const mode of ['add', 'rename']) {
      const r = {};
      await L.seekTo(p, 30); await sleep(200);
      if (mode === 'add') { await p.click('[data-testid=arrangement-marker-add]'); }
      else { const f = p.locator('[data-marker-label]').first(); const fb = await f.boundingBox(); await p.mouse.click(fb.x + 3, fb.y + 3); await p.keyboard.press('F2'); }
      await sleep(300);
      await p.keyboard.type(mode === 'add' ? 'Probe' : 'Renamed');
      r.inputOpenBefore = await inputOpen(p); r.activeBefore = await active(p);
      const cb0 = await X.clipBox(p, cid);
      const sx = cb0.x + cb0.width * 0.3, sy = cb0.y + cb0.height * 0.6;
      await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 30, sy, { steps: 5 }); await sleep(200);
      r.activeDuring = await active(p); r.inputOpenDuring = await inputOpen(p);
      r.statusBeforeEnter = await L.status(p);
      await p.keyboard.press('Enter'); await sleep(200);
      r.afterEnter = { inputOpen: await inputOpen(p), status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p) };
      await p.mouse.move(sx + 60, sy, { steps: 5 }); await p.mouse.up(); await sleep(400);
      const cb1 = await X.clipBox(p, cid);
      r.afterRelease = { inputOpen: await inputOpen(p), status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p), clipDx: +(cb1.x - cb0.x).toFixed(1), active: await active(p) };
      await p.keyboard.press('Escape'); await L.blur(p);
      res[`${W}-${mode}`] = r; console.log(W, mode, JSON.stringify(r));
      await p.screenshot({ path: out.replace('.json', `-${W}-${mode}.png`) });
    }
    res.net = X.netOk ? X.netOk(net) : null;
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
