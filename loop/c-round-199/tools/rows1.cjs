const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const sel = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).map((e) => e.closest('[data-track-id]').dataset.trackId + '@' + e.dataset.clipStart));
const loopInfo = (p) => p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-loop-strip]'); const lb = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Loop on / off')); return { times: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null, pressed: lb ? lb.getAttribute('aria-pressed') : null, strip: s ? s.innerHTML.slice(0, 600) : null, braces: s ? s.querySelectorAll('[data-testid=arrangement-loop-brace], [data-loop-start]').length : null }; });
async function header(p, id) { const b = await X.clipBox(p, id); return { x: b.x + Math.min(30, b.width / 2), y: b.y + 8 }; }
const rows = {
  async 'RG-02'(p, res) {
    await L.loadVideo(p, 'beeps-6s-vp9-opus.webm'); res.t1 = (await X.clipTable(p)).filter((r) => r.lane === 'video');
    await L.loadVideo(p, 'clip-4s-vp9-opus.webm');
    await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 1, null, { timeout: 30000 }); await sleep(1500);
    res.t2 = (await X.clipTable(p)).filter((r) => r.lane === 'video'); res.st = await L.status(p);
    await X.shot(p, `${res.id}-two-videos.png`);
    res.undo = await X.key(p, 'Control+z'); res.t3 = (await X.clipTable(p)).filter((r) => r.lane === 'video');
    const f = 1 / 30 + 0.001; const [a, b2] = res.t2;
    res.checks = { two: res.t2.length === 2, a: a && a.start === 0 && Math.abs(a.end - 6) <= f, b: b2 && Math.abs(b2.start - 6) <= f && Math.abs(b2.end - 10) <= f, noOverlap: b2 && b2.start >= a.end - 1e-6, undo: X.tblKey(res.t3) === X.tblKey(res.t1) };
  },
  async 'RG-04'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.seekTo(p, 2);
    const h = await p.locator('[data-testid=arrangement-playhead-handle]').boundingBox(); const hx = h.x + h.width / 2, hy = h.y + h.height / 2;
    const x4 = await X.tx(p, 4), x6 = await X.tx(p, 6);
    await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(x4, hy, { steps: 8 }); await sleep(150);
    const mid = await p.locator('[data-testid=arrangement-playhead-handle]').boundingBox();
    const line = await p.locator('[data-testid=arrangement-playhead]').boundingBox().catch(() => null);
    await p.mouse.move(x6, hy, { steps: 8 }); await sleep(150);
    const end = await p.locator('[data-testid=arrangement-playhead-handle]').boundingBox();
    await p.mouse.up(); await sleep(300);
    res.drag = { midDx: +(mid.x + mid.width / 2 - x4).toFixed(2), endDx: +(end.x + end.width / 2 - x6).toFixed(2), pos: await L.posNow(p), playing: await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]')) };
    const mus = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    await p.evaluate(() => window.__hStart());
    await L.blur(p); await p.keyboard.press('Space');
    await sleep(1000);
    const tr0 = await p.evaluate(() => performance.now());
    res.rangeSt = await X.rangeDrag(p, mus.id, 10, 11);
    const tr1 = await p.evaluate(() => performance.now());
    res.range = await p.evaluate(() => [document.querySelector('[data-testid=arrangement-detail-start]').value, document.querySelector('[data-testid=arrangement-detail-end]').value]);
    await p.waitForFunction(() => +document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow') >= 8, null, { timeout: 10000 });
    await L.blur(p); await p.keyboard.press('Space'); await sleep(500);
    const paused = await L.posNow(p);
    await p.evaluate(() => { window.__h.mark = performance.now(); });
    await L.blur(p); await p.keyboard.press('Space'); await sleep(600);
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    await p.evaluate(() => window.__hStop());
    const S = await p.evaluate(() => ({ S: window.__h.samples, mark: window.__h.mark }));
    const win = S.S.filter((s) => s.t >= tr0 - 200 && s.t <= tr1 + 300 && Number.isFinite(s.pos));
    let mono = true, maxStep = 0; for (let i = 1; i < win.length; i++) { const d = win[i].pos - win[i - 1].pos; if (d < -1e-9) mono = false; if (d > maxStep) maxStep = d; }
    const after = S.S.filter((s) => s.t > S.mark && Number.isFinite(s.pos));
    const firstMove = after.find((s) => s.pos !== paused);
    res.home = await X.key(p, 'Home'); const home = await L.posNow(p);
    res.transport = { paused, firstAfterPlay: firstMove ? firstMove.pos : null, firstAfterDt: firstMove ? +(firstMove.t - S.mark).toFixed(0) : null, mono, maxStep: +maxStep.toFixed(4), nWin: win.length, home };
    // resume check: first moving sample minus elapsed estimate; require it within paused..paused+0.05+elapsed
    const resumeErr = firstMove ? firstMove.pos - paused - (firstMove.t - S.mark) / 1000 : 99;
    res.transport.resumeErr = +resumeErr.toFixed(4);
    res.checks = { follow: Math.abs(res.drag.midDx) <= 1 && Math.abs(res.drag.endDx) <= 1, pos6: Math.abs(res.drag.pos - 6) <= 0.05, notPlaying: !res.drag.playing, mono, step: maxStep <= 0.1, resume: !!firstMove && firstMove.pos >= paused - 0.05 && Math.abs(resumeErr) <= 0.05 + 0.1, home: home === 0, rangeMade: Math.abs(+res.range[0] - 10) < 0.05 && Math.abs(+res.range[1] - 11) < 0.05 };
    res.note = 'resume: first moving sample after Play compared with paused pos + elapsed wallclock; ±0.05 + 0.1 s of start latency allowance reported as resumeErr';
  },
  async 'RG-05'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0);
    const mus = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    await X.rangeDrag(p, mus.id, 2, 4); res.l1 = await X.key(p, 'Control+l'); res.i1 = await loopInfo(p);
    await X.rangeDrag(p, mus.id, 6, 8); res.l2 = await X.key(p, 'Control+l'); res.i2 = await loopInfo(p);
    await X.shot(p, `${res.id}-loop-6-8.png`);
    res.undo = await X.key(p, 'Control+z'); res.i3 = await loopInfo(p);
    const lb = p.locator('button[title^="Loop on / off"]'); await lb.click(); await sleep(300); res.i4 = await loopInfo(p);
    await X.shot(p, `${res.id}-loop-off.png`);
    await lb.click(); await sleep(300); res.i5 = await loopInfo(p);
    await L.seekTo(p, 1.5); res.pos0 = await L.posNow(p);
    await p.evaluate(() => window.__hStart()); await L.blur(p); await p.keyboard.press('Space'); await sleep(4000); await p.keyboard.press('Space'); await sleep(200);
    await p.evaluate(() => window.__hStop());
    const P = (await p.evaluate(() => window.__h.samples)).map((s) => s.pos).filter(Number.isFinite);
    let wraps = 0; const wp = []; for (let i = 1; i < P.length; i++) if (P[i] < P[i - 1] - 0.5) { wraps++; wp.push([P[i - 1], P[i]]); }
    res.play = { wp, wraps, max: Math.max(...P), min: Math.min(...P.slice(5)) };
    res.checks = { second: /^Loop replaced/.test(res.l2) && /06\.000/.test(res.i2.times || '') , undo: /02\.000/.test(res.i3.times || '') && /04\.000/.test(res.i3.times || ''), offStays: res.i4.pressed === 'false' && /dashed/.test(res.i4.strip || ''), on: res.i5.pressed === 'true', wraps: wraps >= 1 && wp.every(([a, c]) => a > 3.9 && c >= 2 && c < 2.1), max: res.play.max <= 4.05 };
  },
  async 'RG-06'(p, res) {
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'sfx', 3); await L.addAt(p, 'demo-stem-pulse', 'stems', 6);
    const cs = await L.clipsDom(p); const g = (ln) => cs.find((c) => c.lane === ln).id;
    await p.keyboard.press('Escape');
    await L.selectClip(p, g('music')); res.s1 = await sel(p);
    await L.selectClip(p, g('sfx'), ['Control']); res.s2 = await sel(p); res.d2 = (await L.detailInfo(p)).text;
    await L.selectClip(p, g('stems'), ['Shift']); res.s3 = await sel(p); res.d3 = (await L.detailInfo(p)).text;
    await L.selectClip(p, g('sfx'), ['Control']); res.s4 = await sel(p);
    await p.keyboard.press('Escape'); await sleep(200); res.s5esc = await sel(p);
    { const lb = await p.evaluate(() => document.querySelector('[data-track-id="sfx"]').getBoundingClientRect().toJSON()); const xe = await X.tx(p, 12); res.bgEl = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-clip-id]') ? 'CLIP' : (e.dataset.testid || e.tagName)) : null; }, [xe, lb.top + lb.height / 2]); await p.mouse.click(xe, lb.top + lb.height / 2); await sleep(300); }
    res.s5 = await sel(p);
    // marquee on empty background: from music lane at t=18 (empty) to stems lane at t=7
    const lane = async (ln) => (await p.locator(`[data-track-id=${ln}] [data-clip-id]`).first().boundingBox());
    const mb = await lane('music'), sb = await lane('stems');
    const x0 = await X.tx(p, 18), x1 = await X.tx(p, 7.5);
    const y0 = mb.y + mb.height * 0.5, y1 = sb.y + sb.height * 0.5;
    res.startEl = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.tagName) + (e.closest('[data-clip-id]') ? ' IN-CLIP' : '') : null; }, [x0, y0]);
    await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 6 }); await p.mouse.move(x1, y1, { steps: 6 }); await sleep(150);
    await X.shot(p, `${res.id}-marquee-drag.png`);
    await p.mouse.up(); await sleep(400); res.s6 = await sel(p); res.st6 = await L.status(p);
    await X.shot(p, `${res.id}-marquee.png`);
    res.checks = { two: res.s2.length === 2, three: res.s3.length === 3, ctrlRemove: res.s4.length === 2 && !res.s4.some((s) => s.startsWith('sfx')), deselBg: res.s5.length === 0, marquee: res.s6.length === 2 && res.s6.some((s) => s.startsWith('music')) && res.s6.some((s) => s.startsWith('stems')) };
  },
  async 'RG-07'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'sfx', 3);
    res.t0 = await X.clipTable(p);
    const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); await L.selectClip(p, m.id);
    res.dup = await X.key(p, 'Control+d'); res.sel = await sel(p); res.t1 = await X.clipTable(p);
    res.undo = await X.key(p, 'Control+z'); res.t2 = await X.clipTable(p);
    const copy = res.t1.find((r) => r.lane === 'music' && r.start === 16);
    res.checks = { copy: !!copy && copy.end === 32 && copy.offset === 0 && res.t1.length === res.t0.length + 1, onlyCopy: res.sel.length === 1 && res.sel[0] === 'music@16.000', undo: X.tblKey(res.t2) === X.tblKey(res.t0) };
  },
  async 'RG-08'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'music', 17);
    res.t0 = await X.clipTable(p);
    const cs = await L.clipsDom(p); const a = cs.find((c) => c.start === 0), b2 = cs.find((c) => c.start === 17);
    const g = await L.geo(p);
    const laneH = await p.evaluate(() => { const m = document.querySelector('[data-track-id=music]').getBoundingClientRect(); const s = document.querySelector('[data-track-id=stems]').getBoundingClientRect(); return s.top - m.top; });
    let h = await header(p, a.id);
    await p.mouse.move(h.x, h.y); await p.mouse.down(); await p.mouse.move(h.x + g.pps * 0.5, h.y + laneH * 0.5, { steps: 6 }); await p.mouse.move(h.x + g.pps, h.y + laneH, { steps: 6 }); await sleep(150); await p.mouse.up(); await sleep(400);
    res.t1 = await X.clipTable(p);
    res.undo = await X.key(p, 'Control+z'); res.t2 = await X.clipTable(p);
    h = await header(p, b2.id);
    await p.mouse.move(h.x, h.y); await p.mouse.down(); await p.mouse.move(h.x + 15, h.y + 5, { steps: 4 });
    await p.keyboard.down('Shift'); await p.mouse.move(h.x + g.pps * 1.3, h.y + laneH * 0.6, { steps: 6 }); await p.mouse.move(h.x + g.pps * 1.3, h.y + laneH, { steps: 6 }); await sleep(250);
    res.hint = await p.evaluate(() => ({ status: (document.querySelector('[data-testid=arrangement-status]') || {}).textContent, body: [...document.querySelectorAll('[role=status],[aria-live]')].map((e) => e.textContent.trim()).filter((t) => /Shift/.test(t)).slice(0, 3), anyShift: [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && /Shift/.test(e.textContent) && e.offsetParent && !/Space · Home/.test(e.textContent)).map((e) => e.textContent.trim().slice(0, 120)).slice(0, 4) }));
    await X.shot(p, `${res.id}-shift-drag.png`);
    await p.mouse.up(); await p.keyboard.up('Shift'); await sleep(400);
    res.t3 = await X.clipTable(p);
    const mv = res.t1.find((r) => r.lane === 'stems'); const mv2 = res.t3.find((r) => r.lane === 'stems' && r.end - r.start < 3);
    const tol = 1 / g.pps + 0.001;
    res.checks = { plainLane: !!mv && res.t1.filter((r) => r.lane === 'music').length === 1, plainStart: !!mv && Math.abs(mv.start - 1) <= tol, undo: X.tblKey(res.t2) === X.tblKey(res.t0), shiftStart: !!mv2 && mv2.start === 17, shiftLane: !!mv2, hint: (res.hint.anyShift.length + res.hint.body.length) > 0 || /Shift/.test(res.hint.status || '') };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p } = await L.openStudio(b, X.VPS[vp], id, net); res.geo = await L.geo(p); await rows[ROW](p, res); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
