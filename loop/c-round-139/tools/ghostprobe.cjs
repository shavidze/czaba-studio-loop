const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: P } = await L.openStudio(b, X.VPS[+process.argv[2] || 1440], 'ghostprobe', net);
  await L.setSnapOff(P);
  const ghosts = () => P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.textContent.trim()}`));
  const start = async (src, lane, t) => {
    const o = P.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
    const ob = await o.boundingBox(); const lb = await P.locator(`[data-track-id="${lane}"]`).last().boundingBox(); const g = await L.geo(P);
    const ox = ob.x + ob.width / 2, oy = ob.y + ob.height / 2;
    await P.mouse.move(ox, oy); await P.mouse.down(); await P.mouse.move(ox + 12, oy, { steps: 3 });
    await P.mouse.move(g.rl + t * g.pps, lb.y + lb.height / 2, { steps: 14 }); await sleep(400);
    return { ox, oy };
  };
  const out = {};
  for (const lane of ['video', 'sfx']) {
    let s = await start('demo-soft-impact', lane, 9); out[`${lane}-held`] = await ghosts();
    await P.mouse.move(s.ox, s.oy, { steps: 14 }); await sleep(300); out[`${lane}-moved-back-to-library`] = await ghosts();
    await P.mouse.up(); await sleep(600); out[`${lane}-released-over-library`] = await ghosts();
    s = await start('demo-soft-impact', lane, 9);
    await P.keyboard.press('Escape'); await sleep(400); out[`${lane}-after-escape`] = await ghosts();
    await P.mouse.move(2, 2, { steps: 5 }); await P.mouse.up(); await sleep(600); out[`${lane}-after-escape-move-up`] = await ghosts();
    out[`${lane}-clips`] = (await L.clipsDom(P)).length; out[`${lane}-status`] = await L.status(P);
    // clear any stale ghost with a fresh drag out
    s = await start('demo-soft-impact', lane, 9); await P.mouse.move(s.ox, s.oy, { steps: 14 }); await P.mouse.up(); await sleep(500);
  }
  // released over video lane (refused)
  await start('demo-soft-impact', 'video', 9); await P.mouse.up(); await sleep(800);
  out['video-release'] = { ghosts: await ghosts(), status: await L.status(P), clips: (await L.clipsDom(P)).length };
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
