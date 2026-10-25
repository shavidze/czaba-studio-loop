// B round 164: which Tab press ends a held clip-move gesture? HEAD 7952439.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
(async () => {
  const b = await L.launch(); const res = {}; const W = 1440;
  const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b164ta-${W}`, net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
  const h = await p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const e = [...c.querySelectorAll('div[title]')].find((d) => /drag to move/i.test(d.title)); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, h: b.height }; }, cid);
  const cb0 = await X.clipBox(p, cid); const sx = h.x + 80, sy = h.y + h.h / 2;
  await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 40, sy, { steps: 5 }); await sleep(150);
  const steps = []; let x = sx + 40;
  for (let i = 1; i <= 70; i++) {
    await p.keyboard.press('Tab'); x += 2; await p.mouse.move(x, sy); await sleep(40);
    const cb = await X.clipBox(p, cid);
    const a = await p.evaluate(() => { const e = document.activeElement; return e ? (e.dataset.testid || e.getAttribute('aria-label') || e.tagName).slice(0, 70) : null; });
    steps.push({ i, active: a, dx: +(cb.x - cb0.x).toFixed(1), expect: +(x - sx).toFixed(1), status: (await L.status(p)).slice(0, 90) });
    if (Math.abs((cb.x - cb0.x) - (x - sx)) > 3) { break; }
  }
  await p.mouse.up();
  res.steps = steps; fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(steps.slice(-4)));
  await ctx.close(); await b.close();
})();
