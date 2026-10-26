// C round 176 FUNC-SMOKE-ONSTATE: real-mouse Mute / Solo / group / mixed / Master during playback, real output tap + meters; Undo of a Mute; separator drag.
// node c176-func.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const MUTE = (id) => `[data-track-id=${id}] button[aria-label^="Mute — "]`;
const SOLO = (id) => `[data-track-id=${id}] button[aria-label^="Solo — "]`;
const GM = (n) => `[data-testid=arrangement-group-mute][aria-label^="Mute — ${n} "]`;
const GS = (n) => `[data-testid=arrangement-group-solo][aria-label^="Solo — ${n} "]`;
const GN = (n) => `[data-testid=arrangement-group-name][aria-label*="${n}"]`;
const MM = 'button[aria-label="Master Mute"]';
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const net = []; const r = { W, ATT, utc: new Date().toISOString(), steps: {} };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c176func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  const attr = (sel, a) => p.evaluate(({ sel, a }) => { const e = document.querySelector(sel); return e ? e.getAttribute(a) : null; }, { sel, a });
  const click = async (sel, mods) => { const bb = await p.locator(sel).first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { modifiers: mods }); await sleep(250); await p.mouse.move(2, 2); };
  // 900 ms window: overall output peak + per-track meter peaks (max over the window)
  const measure = async (ms = 900) => { await sleep(250); await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); const t0 = S.length ? S[0].t : 0; const W2 = S.filter((s) => s.t - t0 > 150); const out = { peak: +W2.reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5), n: W2.length, meters: {} }; for (const s of W2) for (const [k, v] of Object.entries(s.meters)) { const x = parseFloat(String(v).replace(/\u2212/g, '-')); if (Number.isFinite(x)) out.meters[k] = Math.max(out.meters[k] ?? -Infinity, x); } return out; };
  const step = async (name, fn, extra = {}) => { await fn(); const m = await measure(); const e = {}; for (const [k, s] of Object.entries(extra)) e[k] = await attr(s, 'aria-pressed'); r.steps[name] = { ...m, ...e, status: await L.status(p) }; return r.steps[name]; };
  try {
    r.fonts = log.fontsReady && log.fontsReady.ok;
    await p.mouse.move(2, 2); await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    // all clips overlap 0..6 s so every track is audible in the measured window
    r.adds = [await L.addAt(p, 'demo-middle-east', 'music', 0), await L.addAt(p, 'demo-middle-east', 'stems', 0), await L.addAt(p, 'demo-middle-east', 'sfx', 0)];
    await L.seekTo(p, 0.5); await L.blur(p); await p.keyboard.press('Space'); await sleep(500);
    r.playing = await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state));
    await step('baseline', async () => {});
    await step('trackMuteMusic', () => click(MUTE('music')), { music: MUTE('music') });
    await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300);
    await step('undoMute', async () => {}, { music: MUTE('music') });
    await step('trackSoloSfx', () => click(SOLO('sfx')), { sfx: SOLO('sfx') });
    await step('trackSoloOff', () => click(SOLO('sfx')), { sfx: SOLO('sfx') });
    // group music + stems
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    await p.click(L.nameSel('music')); await sleep(200); await p.click(L.nameSel('stems'), { modifiers: ['Shift'] }); await sleep(200);
    r.group1 = await X.key(p, 'Control+g');
    await L.seekTo(p, 0.5); await L.blur(p); await p.keyboard.press('Space'); await sleep(500);
    await step('groupBaseline', async () => {});
    await step('groupMute', () => click(GM('Group 1')), { g: GM('Group 1') });
    await step('groupUnmute', () => click(GM('Group 1')), { g: GM('Group 1') });
    await step('groupSolo', () => click(GS('Group 1')), { g: GS('Group 1') });
    await step('groupSoloOff', () => click(GS('Group 1')), { g: GS('Group 1') });
    // nest sfx + Group 1 -> Group 2, solo Group 1 => Group 2 mixed: sfx silent, music/stems audible
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    await p.click(L.nameSel('sfx')); await sleep(200); await p.click(GN('Group 1'), { modifiers: ['Shift'] }); await sleep(200);
    r.group2 = await X.key(p, 'Control+g');
    await L.seekTo(p, 0.5); await L.blur(p); await p.keyboard.press('Space'); await sleep(500);
    await step('mixed', () => click(GS('Group 1')), { g1: GS('Group 1'), g2: GS('Group 2') });
    await step('mixedOff', () => click(GS('Group 1')), { g1: GS('Group 1'), g2: GS('Group 2') });
    await step('masterMute', () => click(MM), { m: MM });
    await step('masterUnmute', () => click(MM), { m: MM });
    r.pos = await L.posNow(p);
    await L.blur(p); await p.keyboard.press('Space'); await sleep(300);
    // separator drag
    const was = await X.openDetail(p); const sel = '[data-testid=arrangement-detail-separator]'; const bb = await p.locator(sel).boundingBox(); const h0 = await attr(sel, 'aria-valuenow');
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2, bb.y - 30, { steps: 6 }); await p.mouse.up(); await sleep(400);
    r.sepDrag = { was, h0, h1: await attr(sel, 'aria-valuenow') }; r.sepDrag.changed = r.sepDrag.h0 !== r.sepDrag.h1;
  } catch (e) { r.error = String(e && e.stack || e).slice(0, 1200); }
  r.net = X.netOk(net); await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(r, null, 1));
  const brief = Object.fromEntries(Object.entries(r.steps).map(([k, v]) => [k, `peak ${v.peak} n ${v.n} meters ${JSON.stringify(v.meters)} ${Object.entries(v).filter(([kk]) => !['peak', 'n', 'meters', 'status'].includes(kk)).map(([kk, vv]) => `${kk}=${vv}`).join(' ')}`]));
  console.log(JSON.stringify({ error: r.error, fonts: r.fonts, playing: r.playing, group1: r.group1, group2: r.group2, pos: r.pos, sep: r.sepDrag, net: r.net, steps: brief }, null, 1));
})();
