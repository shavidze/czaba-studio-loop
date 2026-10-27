// B planning: on the floating video box (pointerdown preventDefault), does an injected `cursor-grab active:cursor-grabbing` apply during a drag?
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], 'b206vgrab', net, { noFontWait: true });
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p);
  await p.getByRole('button', { name: 'Expand video' }).first().click(); await sleep(800);
  const box = p.locator('[data-testid=arrangement-video-box]');
  await box.evaluate((e) => { e.classList.remove('cursor-move'); e.classList.add('cursor-grab', 'active:cursor-grabbing'); });
  const vb = await box.boundingBox();
  const at = (x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { t: e.getAttribute('data-testid'), c: getComputedStyle(e).cursor, active: !!e.closest(':active') }; }, [x, y]);
  const x0 = vb.x + vb.width / 2, y0 = vb.y + vb.height / 2;
  const r = { floating: await box.getAttribute('data-video-floating'), rest: await at(x0, y0) };
  await p.mouse.move(x0, y0); await p.mouse.down(); r.down = await at(x0, y0);
  await p.mouse.move(x0 - 40, y0 + 10, { steps: 4 }); r.drag = await at(x0 - 40, y0 + 10);
  const vb2 = await box.boundingBox(); r.moved = [vb2.x - vb.x, vb2.y - vb.y];
  await p.mouse.up(); await sleep(300); r.after = await at(x0 - 40, y0 + 10);
  console.log(JSON.stringify(r)); fs.writeFileSync(path.join(__dirname, '..', 'out', 'videograb-1440.json'), JSON.stringify(r, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
