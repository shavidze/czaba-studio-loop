const X = require('./lib122.cjs'); const { L, sleep } = X;
const id = 'RG-03-mute-1440';
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[1440], id, net, { extraInit: X.tapInit });
    await L.setSnapOff(p); await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    await L.addAt(p, 'demo-synth-mix', 'music', 0);
    await X.muteLanes(p, ['music']);
    await L.blur(p); await p.keyboard.press('Home'); await sleep(400);
    await p.evaluate(() => { window.__hStart(); window.__tapStart(); }); await sleep(100);
    await p.keyboard.press('Space');
    const waitPos = (x) => p.waitForFunction((x) => +document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow') >= x, x, { timeout: 10000 });
    const mb = p.locator('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]');
    await waitPos(1.3); const t1 = await p.evaluate(() => performance.now()); await mb.click(); const t1b = await p.evaluate(() => performance.now());
    const a1 = await p.evaluate(() => ({ pressed: document.querySelector('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]').getAttribute('aria-pressed'), paused: document.querySelector('video[data-video-role=active]').paused, muted: document.querySelector('video[data-video-role=active]').muted }));
    await waitPos(2.6); const t2 = await p.evaluate(() => performance.now()); await mb.click(); const t2b = await p.evaluate(() => performance.now());
    const a2 = await p.evaluate(() => ({ pressed: document.querySelector('button[aria-label="Mute — ვიდეოს ორიგინალი ხმა"]').getAttribute('aria-pressed'), paused: document.querySelector('video[data-video-role=active]').paused, muted: document.querySelector('video[data-video-role=active]').muted }));
    await waitPos(4.0); await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    const T = await p.evaluate(() => window.__tapStop()); await p.evaluate(() => window.__hStop());
    const S = (await p.evaluate(() => window.__h.samples)).filter((s) => Number.isFinite(s.pos));
    const posAt = (t) => { let c = S[0]; for (const s of S) if (s.t <= t) c = s; return c.pos; };
    const win = (ta, tb) => T.filter((s) => s.t >= ta && s.t <= tb);
    const pk = (a) => Math.max(0, ...a.map((s) => s.peak));
    const before = win(t1 - 1200, t1); const muted = win(t1b + 150, t2); const after = win(t2b + 150, t2b + 1400);
    const play = S.filter((s) => s.t >= t1 - 300 && s.t <= t2b + 1000);
    let mono = true, maxJump = 0, paused = false; for (let i = 1; i < play.length; i++) { const d = play[i].pos - play[i - 1].pos; if (d < -1e-9) mono = false; if (d > maxJump) maxJump = d; } for (const s of play) if (s.paused) paused = true;
    res.m = { a1, a2, posMute: posAt(t1b), posUnmute: posAt(t2b), peakBefore: +pk(before).toFixed(4), peakMuted: pk(muted), nMuted: muted.length, peakAfter: +pk(after).toFixed(4), mono, maxJump: +maxJump.toFixed(4), anyPausedSample: paused, nAn: await p.evaluate(() => window.__tap.an.size) };
    res.checks = { pressedFollows: a1.pressed === 'true' && a2.pressed === 'false', silentMuted: res.m.peakMuted === 0 && muted.length > 20, soundBefore: res.m.peakBefore > 0.01, soundAfter: res.m.peakAfter > 0.01, keepsPlaying: !paused && !a1.paused && !a2.paused, mono, jump: maxJump <= 0.1 };
    res.note = 'video element muted=true always (by design since ≤ r116: ArrangementVideoDock sets slot.element.muted = true; sound via Web Audio). Mute verified on the real output tap with music muted.';
    await p.context().close();
  } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 3000)); console.log('PASS?', res.pass);
})();
