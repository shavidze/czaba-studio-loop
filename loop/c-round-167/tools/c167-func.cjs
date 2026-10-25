// C round 167 — FUNC-SMOKE-V3C4A (+ S4 Master Peak over attempt). Real mouse clicks at the button centre. node c167-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const centreClick = async (p, s) => { const bb = await p.locator(s).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s }); await p.mouse.click(x, y); await sleep(400); return hit; };
const attr = (p, s, a) => p.evaluate(([s, a]) => { const e = document.querySelector(s); return e ? e.getAttribute(a) : null; }, [s, a]);
const snapState = (p) => p.evaluate(() => ({ snap: document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap, pressed: document.querySelector('[data-testid=arrangement-snap-toggle]').getAttribute('aria-pressed') }));
const markers = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => +m.dataset.markerTime));
const menuState = (p) => p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-grid-menu]'); if (!m) return null; return [...m.querySelectorAll('[role^=menuitem]')].map((e) => `${e.textContent.trim()}:${e.getAttribute('aria-checked')}:${e.querySelectorAll('svg.lucide-check').length}`); });
const openMenu = async (p) => { const body = p.locator('[data-track-id="music"] [data-grid-seconds]').first(); const bb = await body.boundingBox(); await p.mouse.click(bb.x + 300, bb.y + bb.height / 2, { button: 'right' }); await p.waitForSelector('[data-testid=arrangement-grid-menu]', { timeout: 5000 }); await sleep(300); };
const peakInfo = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-master-peak]'); return { text: e.textContent.trim(), state: e.dataset.state, label: e.getAttribute('aria-label') }; });
async function tapWindow(p, ms) { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); return S; }
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c167func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady && log.fontsReady.ok; res.lanes = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId))]);
  await p.mouse.move(2, 2); await sleep(300);
  // Snap: click + G
  const sn = res.snap = { s0: await snapState(p) };
  sn.hit1 = await centreClick(p, '[data-testid=arrangement-snap-toggle]'); sn.c1 = { ...(await snapState(p)), status: await L.status(p) };
  sn.hit2 = await centreClick(p, '[data-testid=arrangement-snap-toggle]'); sn.c2 = { ...(await snapState(p)), status: await L.status(p) };
  await L.blur(p); await p.keyboard.press('g'); await sleep(400); sn.g1 = { ...(await snapState(p)), status: await L.status(p) };
  await L.blur(p); await p.keyboard.press('g'); await sleep(400); sn.g2 = { ...(await snapState(p)), status: await L.status(p) };
  // Env: click + A
  const ev = res.env = { s0: await attr(p, '[data-testid=arrangement-envelope-toggle]', 'aria-pressed') };
  ev.hit1 = await centreClick(p, '[data-testid=arrangement-envelope-toggle]'); ev.c1 = await attr(p, '[data-testid=arrangement-envelope-toggle]', 'aria-pressed');
  ev.hit2 = await centreClick(p, '[data-testid=arrangement-envelope-toggle]'); ev.c2 = await attr(p, '[data-testid=arrangement-envelope-toggle]', 'aria-pressed');
  await L.blur(p); await p.keyboard.press('a'); await sleep(400); ev.a1 = await attr(p, '[data-testid=arrangement-envelope-toggle]', 'aria-pressed');
  await L.blur(p); await p.keyboard.press('a'); await sleep(400); ev.a2 = await attr(p, '[data-testid=arrangement-envelope-toggle]', 'aria-pressed');
  // selects
  const sl = res.selects = {};
  for (const id of ['arrangement-grid-division', 'arrangement-waveform-zoom']) {
    const s = `[data-testid=${id}]`; const opts = await p.evaluate((s) => { const e = document.querySelector(s); return { v: e.value, all: [...e.options].map((o) => o.value) }; }, s);
    const target = opts.all.find((v) => v !== opts.v);
    await p.selectOption(s, target); await sleep(400); const after = await p.evaluate((s) => document.querySelector(s).value, s); const st = await L.status(p);
    await p.selectOption(s, opts.v); await sleep(400); const back = await p.evaluate((s) => document.querySelector(s).value, s); const st2 = await L.status(p);
    sl[id] = { from: opts.v, options: opts.all, target, after, status: st, back, statusBack: st2, zoomReadout: await p.evaluate(() => (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent) };
    await L.blur(p);
  }
  // BPM + metronome
  const mt = res.metro = { disabled0: await p.evaluate(() => document.querySelector('[data-testid=arrangement-metronome-toggle]').disabled) };
  await p.click('[data-testid=arrangement-tempo-input]'); await p.keyboard.press('Control+A'); await p.keyboard.type('120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
  mt.bpmStatus = await L.status(p); mt.disabled1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-metronome-toggle]').disabled);
  mt.hit = await centreClick(p, '[data-testid=arrangement-metronome-toggle]'); mt.pressed = await attr(p, '[data-testid=arrangement-metronome-toggle]', 'aria-pressed');
  mt.hitOff = await centreClick(p, '[data-testid=arrangement-metronome-toggle]'); mt.pressedOff = await attr(p, '[data-testid=arrangement-metronome-toggle]', 'aria-pressed');
  // Triplets checked icon
  const tr = res.triplets = {};
  await openMenu(p); tr.open0 = await menuState(p);
  const trip = p.locator('[data-testid=arrangement-grid-menu] [role^=menuitem]', { hasText: /Triplets/ }).first(); tr.count = await trip.count();
  if (tr.count) { await trip.click(); await sleep(400); tr.status = await L.status(p); await openMenu(p); tr.open1 = await menuState(p); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-triplets.png`) }); }
  if (await menuState(p)) { await p.keyboard.press('Escape'); await sleep(300); } tr.closed = (await menuState(p)) === null;
  await L.blur(p);
  // markers
  res.snapBeforeMarkers = await L.setSnapOff(p);
  const mk = res.marker = { steps: [] };
  for (const [t, nm] of [[2, 'Two'], [6, 'Six']]) { const pos = await L.seekTo(p, t); await L.blur(p); await p.keyboard.press('m'); await sleep(300); await p.keyboard.press('Control+A'); await p.keyboard.type(nm); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p); mk.steps.push({ t, pos, status: await L.status(p) }); }
  mk.markers = await markers(p);
  await L.seekTo(p, 0); mk.start = await L.posNow(p);
  mk.next1hit = await centreClick(p, '[data-testid=arrangement-marker-next]'); mk.next1 = await L.posNow(p);
  mk.next2hit = await centreClick(p, '[data-testid=arrangement-marker-next]'); mk.next2 = await L.posNow(p);
  mk.prev1hit = await centreClick(p, '[data-testid=arrangement-marker-prev]'); mk.prev1 = await L.posNow(p);
  await L.seekTo(p, 4); const n0 = (await markers(p)).length;
  mk.addHit = await centreClick(p, '[data-testid=arrangement-marker-add]'); mk.addEditor = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-name-input]'));
  await p.keyboard.press('Enter'); await sleep(300); await L.blur(p); mk.add = { before: n0, after: await markers(p), status: await L.status(p) };
  await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-markers.png`) });
  // audio: play, Master Mute during playback
  const a = res.audio = {};
  a.add = await L.addAt(p, 'demo-middle-east', 'music', 0);
  await L.seekTo(p, 0); await L.blur(p);
  await p.evaluate(() => window.__tapStart()); const t0 = Date.now(); await p.keyboard.press('Space'); await sleep(1500);
  a.pos = await L.posNow(p); a.wall = Date.now() - t0; let S = await p.evaluate(() => window.__tapStop()); a.peakPlay = +S.reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5);
  a.peakReadoutPlaying = await peakInfo(p);
  // mute click during playback
  await p.evaluate(() => window.__tapStart()); await sleep(200);
  const tClick = await p.evaluate(() => performance.now()); a.muteHit = await centreClick(p, 'button[aria-label="Master Mute"]'); await sleep(500);
  S = await p.evaluate(() => window.__tapStop()); a.mutePressed = await attr(p, 'button[aria-label="Master Mute"]', 'aria-pressed');
  const before = S.filter((s) => s.t < tClick); const after = S.filter((s) => s.t >= tClick);
  a.preMutePeak = +before.reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5);
  const firstSilent = after.find((s, i) => after.slice(i).every((q) => q.peak < 0.001));
  a.silentAfterMs = firstSilent ? +(firstSilent.t - tClick).toFixed(1) : null; a.lastPeaks = after.slice(-5).map((s) => +s.peak.toFixed(6)); a.windowEndMs = after.length ? +(after[after.length - 1].t - tClick).toFixed(1) : null;
  a.unmuteHit = await centreClick(p, 'button[aria-label="Master Mute"]'); await sleep(300);
  S = await tapWindow(p, 600); a.unmutePressed = await attr(p, 'button[aria-label="Master Mute"]', 'aria-pressed'); a.unmutePeak = +S.reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5);
  a.playing = await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state));
  await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
  // Peak click resets readout
  a.peakBeforeReset = await peakInfo(p); a.peakHit = await centreClick(p, '[data-testid=arrangement-master-peak]'); a.peakAfterReset = await peakInfo(p);
  // S4: try a real overload: demo on extra lanes at 0 + master +6 dB
  const s4 = res.S4 = { lanes: [] };
  for (const ln of res.lanes.filter((x) => x !== 'music' && !/video/i.test(x)).slice(0, 3)) { try { s4.lanes.push({ ln, st: await L.addAt(p, 'demo-middle-east', ln, 0) }); } catch (e) { s4.lanes.push({ ln, err: String(e).slice(0, 120) }); } }
  await p.focus('input[aria-label="Master Volume"]'); await p.keyboard.press('End'); await sleep(300); s4.master = await p.evaluate(() => document.querySelector('input[aria-label="Master Volume"]').value); await L.blur(p);
  await L.seekTo(p, 0); await L.blur(p); await p.keyboard.press('Space');
  const tS = Date.now(); while (Date.now() - tS < 6000) { const pi = await peakInfo(p); if (pi.state === 'over') break; await sleep(100); }
  s4.peak = await peakInfo(p);
  if (s4.peak.state === 'over') {
    const m = async () => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-master-peak]'); const cs = getComputedStyle(e); return { bg: cs.backgroundColor, border: cs.borderTopColor, color: cs.color, radius: cs.borderTopLeftRadius, state: e.dataset.state }; });
    await p.mouse.move(2, 2); await sleep(450); s4.rest = await m();
    const bb = await p.locator('[data-testid=arrangement-master-peak]').boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 3 }); await sleep(450); s4.hover = await m();
    await p.mouse.down(); await sleep(450); s4.active = await m(); await p.mouse.move(2, 2, { steps: 3 }); await sleep(100); await p.mouse.up(); await sleep(300);
    const cb = await p.locator('[data-testid=arrangement-master-peak]').boundingBox(); s4.box = cb;
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-S4-over.png`) });
    await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-S4-over-crop.png`), clip: { x: cb.x - 8, y: cb.y - 6, width: cb.width + 16, height: cb.height + 12 } });
  }
  await L.blur(p); await p.keyboard.press('Space'); await sleep(400);
  s4.afterStop = await peakInfo(p); s4.resetHit = await centreClick(p, '[data-testid=arrangement-master-peak]'); s4.afterReset = await peakInfo(p);
  s4.clearBg = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid=arrangement-master-peak]')).backgroundColor);
  await ctx.close();
  res.net = X.netOk(net); res.netRaw = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise, fontBad: n.fontResp.filter((r) => r.s !== 200).length + n.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
