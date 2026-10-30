const X = require('./lib122.cjs'); const { L, sleep } = X;
const W = +process.argv[2]; const res = { W };
(async () => { const b = await L.launch(); const net = [];
  // RP-SPACE-EMPTY
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `rp-space-${W}`, net);
    await L.blur(p); const p0 = await L.posNow(p); await p.keyboard.press('Space'); await sleep(1500); const p1 = await L.posNow(p);
    res.space = { p0, p1, playing: await p.evaluate(() => (document.querySelector('button[aria-label="Play"]')?.dataset.playing === 'true')), status: await L.status(p) }; await p.keyboard.press('Space'); await ctx.close(); }
  // RP-METRO-MUTE
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `rp-metro-${W}`, net, { extraInit: X.tapInit });
    await L.addAt(p, 'demo-synth-mix', 'music', 0); await X.muteLanes(p, ['music']);
    await p.fill('[data-testid=arrangement-tempo-input]', '90'); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
    await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(300); res.metroPressed = await p.getAttribute('[data-testid=arrangement-metronome-toggle]', 'aria-pressed');
    await L.blur(p); await p.keyboard.press('Home'); await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(2000);
    const t1 = await p.evaluate(() => performance.now()); await p.click('button[aria-label="Master Mute"]'); await L.blur(p); await sleep(2500); await p.keyboard.press('Space');
    const S = await p.evaluate(() => window.__tapStop());
    const before = S.filter((s) => s.t < t1).map((s) => s.peak), after = S.filter((s) => s.t > t1 + 150).map((s) => s.peak);
    res.metro = { peakBefore: Math.max(...before), peakAfterMute: Math.max(...after), nAfter: after.length, masterPressed: await p.getAttribute('button[aria-label="Master Mute"]', 'aria-pressed'), method: 'output tap (music lane muted so only the click sounds)' }; await ctx.close(); }
  // RP-VIDEO-MARKER
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `rp-vm-${W}`, net);
    await L.loadVideo(p, 'clip-4s-vp9-opus.webm'); await L.seekTo(p, 7.3); await L.blur(p); await p.keyboard.press('m'); await sleep(300); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
    res.marker = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.getAttribute('aria-label') || m.title));
    res.snap0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap); if (res.snap0 !== 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); await L.blur(p); } res.snap = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap); res.division = await p.$eval('[data-testid=arrangement-grid-division]', (e) => e.value);
    const v = (await L.clipsDom(p)).find((c) => c.kind === 'video'); const t0 = await X.clipTable(p);
    const hb = await p.locator(`[data-clip-id="${v.id}"] > div`).first().boundingBox(); const g = await L.geo(p);
    const x0 = hb.x + 20, y = hb.y + hb.height / 2; const target = x0 + 7.3 * g.pps + 0.12 * g.pps;
    await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + 40, y, { steps: 5 }); await p.mouse.move(target, y, { steps: 10 }); await sleep(200); await p.mouse.up(); await sleep(500);
    const t1 = await X.clipTable(p); res.vm = { t0, t1, status: await L.status(p) };
    await X.key(p, 'Control+z'); res.vm.undo = await X.clipTable(p); res.vm.undoExact = X.tblKey(res.vm.undo) === X.tblKey(t0); await ctx.close(); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `RP-${W}.json`, res); console.log(JSON.stringify(res, null, 1)); })().catch((e) => { console.error(e); process.exit(1); });
