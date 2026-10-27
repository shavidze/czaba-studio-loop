// B planning: does active:cursor-grabbing apply during a real pointer drag (clip title bar, marker-less) in Chromium?
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], 'b206grab', net, { noFontWait: true });
  await L.setSnapOff(p); await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
  const h = await p.locator(`[data-clip-id="${cid}"] > div`).first().boundingBox();
  const at = (x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { c: getComputedStyle(e).cursor, active: e.matches(':active') || !!e.closest(':active') }; }, [x, y]);
  const x0 = h.x + 30, y0 = h.y + h.height / 2;
  const r = { rest: await at(x0, y0) };
  await p.mouse.move(x0, y0); await p.mouse.down(); r.down = await at(x0, y0);
  await p.mouse.move(x0 + 40, y0, { steps: 4 }); r.drag = await at(x0 + 40, y0);
  await p.mouse.up(); await sleep(300);
  console.log(JSON.stringify(r)); fs.writeFileSync(path.join(__dirname, '..', 'out', 'grabcheck-1440.json'), JSON.stringify(r, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
