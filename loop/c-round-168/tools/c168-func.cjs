// C round 168 — FUNC-SMOKE-V3C4B. Real mouse clicks at the button centre, real output tap. node c168-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const hdr = (t) => `[data-track-id=${t}] [data-testid=arrangement-track-header]`;
const MUTE = (t) => `${hdr(t)} button[title=Mute]`; const SOLO = (t) => `${hdr(t)} button[title^=Solo]`;
const NAME = (t) => `${hdr(t)} button[aria-pressed]:not([title])`;
const centreClick = async (p, s, mods = []) => { const bb = await p.locator(s).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s }); await p.mouse.move(x, y); for (const m of mods) await p.keyboard.down(m); await p.mouse.down(); await p.mouse.up(); for (const m of mods) await p.keyboard.up(m); await sleep(350); return hit; };
const attr = (p, s, a) => p.evaluate(([s, a]) => { const e = document.querySelector(s); return e ? e.getAttribute(a) : null; }, [s, a]);
// click during playback; returns ms until the tap stays below 0.001, or peak after
async function clickTap(p, s, mods, ms = 700) {
  await p.evaluate(() => window.__tapStart()); await sleep(200);
  const tClick = await p.evaluate(() => performance.now()); const hit = await centreClick(p, s, mods); await sleep(ms);
  const S = await p.evaluate(() => window.__tapStop());
  const before = S.filter((q) => q.t < tClick), after = S.filter((q) => q.t >= tClick);
  const firstSilent = after.find((q, i) => after.slice(i).every((r) => r.peak < 0.001));
  const late = after.filter((q) => q.t - tClick > 500);
  return { hit, prePeak: +before.reduce((m, q) => Math.max(m, q.peak), 0).toFixed(5), silentAfterMs: firstSilent ? +(firstSilent.t - tClick).toFixed(1) : null, peakAfter500: +late.reduce((m, q) => Math.max(m, q.peak), 0).toFixed(5), n: after.length };
}
const playing = (p) => p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state));
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c168func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady && log.fontsReady.ok; res.lanes = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId))]);
  await L.setSnapOff(p);
  // --- lane mute / solo with real audio (demo on music only)
  const a = res.lane = {};
  a.add = await L.addAt(p, 'demo-middle-east', 'music', 0);
  await L.seekTo(p, 0); await L.blur(p); await p.keyboard.press('Space'); await sleep(1200);
  a.ctx = await playing(p);
  a.mute = { pressed0: await attr(p, MUTE('music'), 'aria-pressed'), ...(await clickTap(p, MUTE('music'))), pressed1: await attr(p, MUTE('music'), 'aria-pressed') };
  a.unmute = { ...(await clickTap(p, MUTE('music'))), pressed2: await attr(p, MUTE('music'), 'aria-pressed') };
  a.soloEmpty = { ...(await clickTap(p, SOLO('sfx'))), sfx: await attr(p, SOLO('sfx'), 'aria-pressed'), music: await attr(p, SOLO('music'), 'aria-pressed') };
  a.soloAddDemo = { ...(await clickTap(p, SOLO('music'), ['Control'])), sfx: await attr(p, SOLO('sfx'), 'aria-pressed'), music: await attr(p, SOLO('music'), 'aria-pressed') };
  await centreClick(p, SOLO('music'), ['Control']); await centreClick(p, SOLO('sfx'), ['Control']);
  a.cleared = { sfx: await attr(p, SOLO('sfx'), 'aria-pressed'), music: await attr(p, SOLO('music'), 'aria-pressed'), stems: await attr(p, SOLO('stems'), 'aria-pressed') };
  await L.blur(p); await p.keyboard.press('Space'); await sleep(400);
  // --- group mute / solo: demo on stems, music muted so only the group carries it
  const g = res.group = {};
  g.add = await L.addAt(p, 'demo-middle-east', 'stems', 0);
  await centreClick(p, MUTE('music')); g.musicMuted = await attr(p, MUTE('music'), 'aria-pressed');
  await p.click(NAME('stems')); await sleep(150); await p.click(NAME('sfx'), { modifiers: ['Control'] }); await sleep(150); await p.keyboard.press('Control+g'); await sleep(500);
  g.groups = await p.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-mute]').length);
  await L.seekTo(p, 0); await L.blur(p); await p.keyboard.press('Space'); await sleep(1200);
  const GM = '[data-testid=arrangement-group-mute]', GS = '[data-testid=arrangement-group-solo]';
  g.mute = { ...(await clickTap(p, GM)), dmute: await attr(p, GM, 'data-mute'), pressed: await attr(p, GM, 'aria-pressed') };
  g.unmute = { ...(await clickTap(p, GM)), dmute: await attr(p, GM, 'data-mute'), pressed: await attr(p, GM, 'aria-pressed') };
  g.soloMember = { ...(await clickTap(p, SOLO('stems'))), dsolo: await attr(p, GS, 'data-solo'), pressed: await attr(p, GS, 'aria-pressed') };
  await p.mouse.move(2, 2); await sleep(300); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-group-mixed.png`) });
  g.soloGroup = { ...(await clickTap(p, GS)), dsolo: await attr(p, GS, 'data-solo'), pressed: await attr(p, GS, 'aria-pressed'), stemsSolo: await attr(p, SOLO('stems'), 'aria-pressed'), sfxSolo: await attr(p, SOLO('sfx'), 'aria-pressed') };
  g.soloGroupOff = { hit: await centreClick(p, GS), dsolo: await attr(p, GS, 'data-solo'), stemsSolo: await attr(p, SOLO('stems'), 'aria-pressed') };
  await L.blur(p); await p.keyboard.press('Space'); await sleep(400);
  // --- fold
  const f = res.fold = {};
  const LF = `[data-track-id=music] [data-testid=arrangement-track-fold]`, GF = '[data-testid=arrangement-group-fold]';
  f.lane0 = await attr(p, LF, 'aria-expanded'); f.laneHit = await centreClick(p, LF); f.lane1 = await attr(p, LF, 'aria-expanded'); await centreClick(p, LF); f.lane2 = await attr(p, LF, 'aria-expanded');
  f.group0 = await attr(p, GF, 'aria-expanded'); f.groupHit = await centreClick(p, GF); f.group1 = await attr(p, GF, 'aria-expanded'); await centreClick(p, GF); f.group2 = await attr(p, GF, 'aria-expanded');
  // --- name select
  const n = res.name = {};
  n.hit = await centreClick(p, NAME('music')); n.music = await attr(p, NAME('music'), 'aria-pressed');
  n.ctrlHit = await centreClick(p, NAME('sfx'), ['Control']); n.music2 = await attr(p, NAME('music'), 'aria-pressed'); n.sfx2 = await attr(p, NAME('sfx'), 'aria-pressed');
  await L.blur(p);
  // --- pan reset
  const pr = res.pan = {}; const PS = '[data-track-id=music] [data-testid=arrangement-track-pan]', PR = '[data-track-id=music] [data-testid=arrangement-track-pan-reset]';
  pr.before = { text: (await p.textContent(PR)).trim(), disabled: await p.isDisabled(PR) };
  await p.focus(PS); for (let i = 0; i < 5; i++) { await p.keyboard.press('ArrowRight'); await sleep(60); } await sleep(300); await L.blur(p); await sleep(300);
  pr.moved = { text: (await p.textContent(PR)).trim(), disabled: await p.isDisabled(PR), value: await p.inputValue(PS) };
  pr.hit = await centreClick(p, PR); await sleep(300);
  pr.after = { text: (await p.textContent(PR)).trim(), disabled: await p.isDisabled(PR), value: await p.inputValue(PS), focused: await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-testid')) };
  await L.blur(p);
  // --- rename + undo
  const r = res.rename = {}; const GN = '[data-testid=arrangement-group-name]', GI = '[data-testid=arrangement-group-name-input]';
  r.before = (await p.textContent(GN)).trim();
  await p.focus(GN); await p.keyboard.press('F2'); await sleep(300); r.inputOpen = await p.locator(GI).count();
  await p.keyboard.press('Control+A'); await p.keyboard.type('Drums168'); await p.keyboard.press('Enter'); await sleep(400);
  r.after = (await p.textContent(GN)).trim(); r.status = await L.status(p);
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); r.undone = (await p.textContent(GN)).trim(); r.undoStatus = await L.status(p);
  // --- video import via file chooser
  const v = res.video = {}; const VIMP = '[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)';
  v.fullText = (await p.textContent(VIMP)).trim();
  { const bb = await p.locator(VIMP).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; v.hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s: VIMP });
    const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 8000 }), p.mouse.click(x, y)]); v.chooser = !!fc; v.multiple = fc.isMultiple();
    await fc.setFiles(L.MEDIA + 'beeps-6s-h264-aac.mp4'); }
  await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 }).catch(() => {}); await sleep(2500);
  v.clips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ lane: e.closest('[data-track-id]').dataset.trackId, start: e.getAttribute('data-clip-start'), w: e.getBoundingClientRect().width })));
  v.dock = await p.evaluate(() => [...document.querySelectorAll('video')].map((e) => ({ role: e.dataset.videoRole, rs: e.readyState, vw: e.videoWidth, vh: e.videoHeight, src: (e.currentSrc || '').slice(0, 20) })));
  v.status = await L.status(p);
  await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-video.png`) });
  await centreClick(p, '[data-track-id=video] [data-testid=arrangement-track-fold]'); await sleep(400);
  v.folded = await attr(p, '[data-track-id=video] [data-testid=arrangement-track-fold]', 'aria-expanded');
  { const bb = await p.locator(VIMP).first().boundingBox(); v.compactBox = bb; const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; v.compactHit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s: VIMP });
    const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null), p.mouse.click(x, y)]); v.compactChooser = !!fc; }
  await ctx.close();
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
