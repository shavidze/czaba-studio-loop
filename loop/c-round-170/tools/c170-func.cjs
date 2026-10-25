// C round 170 — FUNC-SMOKE-V3C4C2. Real mouse clicks at button centres (elementFromPoint hit-checked), real AudioDestination tap.
// node c170-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const APPLY = '[data-testid=arrangement-detail-apply]', RESET = '[data-testid=arrangement-detail-clip-gain-reset]', TOG = '[data-testid=arrangement-detail-toggle]';
const FROM = '[data-testid=arrangement-detail-start]', TO = '[data-testid=arrangement-detail-end]', GAIN = '[data-testid=arrangement-detail-clip-gain-input]';
const centre = async (p, s) => { const bb = await p.locator(s).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); const e = document.querySelector(s); return !!(t && e && (t === e || e.contains(t))); }, { x, y, s }); return { x, y, hit }; };
const centreClick = async (p, s) => { const c = await centre(p, s); await p.mouse.move(c.x, c.y, { steps: 2 }); await p.mouse.click(c.x, c.y); await sleep(400); return c.hit; };
const focusInfo = (p) => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, testid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label') } : null; });
const val = (p, s) => p.inputValue(s);
const rangeInfo = (p) => p.evaluate(() => ({ text: ((document.querySelector('[data-testid=arrangement-range]') || {}).textContent || '').replace(/\s+/g, ' ').trim(), lanes: [...document.querySelectorAll('[data-testid=arrangement-lane-range]')].map((e) => { const r = e.getBoundingClientRect(); return { lane: (e.closest('[data-track-id]') || {}).dataset?.trackId || null, x: +r.x.toFixed(1), w: +r.width.toFixed(1) }; }), clipOverlay: [...document.querySelectorAll('[data-clip-id] div')].filter((e) => e.classList.contains('bg-foreground/30') && e.classList.contains('border-x-2')).map((e) => { const r = e.getBoundingClientRect(); const rl = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left; const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; return { lane: e.closest('[data-track-id]').dataset.trackId, clip: e.closest('[data-clip-id]').getAttribute('data-clip-id'), t0: +((r.left - rl) / pps).toFixed(3), t1: +((r.right - rl) / pps).toFixed(3), label: e.textContent.replace(/\s+/g, ' ').trim() }; }) }));
const nClips = (p) => p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
const playing = (p) => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(Play|Stop|Pause)/.test(x.getAttribute('aria-label') || '')); return b ? `${b.getAttribute('aria-label')}|${b.getAttribute('aria-pressed')}` : null; });
async function typeField(p, sel, v, enter) { await p.click(sel, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type(v, { delay: 30 }); if (enter) await p.keyboard.press('Enter'); await sleep(450); }
async function playWindow(p, t0, ms) {
  await L.seekTo(p, t0); const pos0 = await L.posNow(p);
  await L.blur(p); await p.evaluate(() => window.__tapStart()); await sleep(100);
  await p.keyboard.press('Space'); const ts = await p.evaluate(() => performance.now());
  await sleep(ms);
  await p.keyboard.press('Space'); await sleep(300);
  const S = await p.evaluate(() => window.__tapStop());
  const win = S.filter((q) => q.t >= ts + 300 && q.t <= ts + ms - 50).map((q) => q.peak).sort((a, b) => a - b);
  const pos1 = await L.posNow(p);
  return { pos0, pos1, n: win.length, peakMax: +(win[win.length - 1] || 0).toFixed(5), peakMed: +(win[Math.floor(win.length / 2)] || 0).toFixed(5) };
}
const db = (a, b) => +(20 * Math.log10(a / b)).toFixed(2);
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c170func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady; res.toggleWas = await X.openDetail(p);
  res.snap = await L.setSnapOff(p);
  res.add = await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(800);
  const clipId = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-track-id=music] [data-clip-id]')].find((e) => Math.abs(+e.getAttribute('data-clip-start') - 1) < 0.01); return c ? c.getAttribute('data-clip-id') : null; });
  res.clipId = clipId;
  await L.selectClip(p, clipId); await L.blur(p);
  // --- Set selection, valid
  const s = res.setSel = {};
  s.applyDisabled = await p.isDisabled(APPLY);
  s.from0 = await val(p, FROM); s.to0 = await val(p, TO); s.range0 = await rangeInfo(p);
  await typeField(p, FROM, '2', false); await typeField(p, TO, '4', false);
  s.hit = await centreClick(p, APPLY);
  s.status = await L.status(p); s.range1 = await rangeInfo(p); s.from1 = await val(p, FROM); s.to1 = await val(p, TO); s.focus = await focusInfo(p);
  await p.mouse.move(2, 2); await sleep(200); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-setsel.png`) });
  // --- Set selection, invalid (From > To)
  await typeField(p, FROM, '6', false); await typeField(p, TO, '3', false);
  s.invHit = await centreClick(p, APPLY);
  s.invStatus = await L.status(p); s.range2 = await rangeInfo(p);
  s.rangeUnchanged = JSON.stringify(s.range2) === JSON.stringify(s.range1);
  // clear the time selection so playback is not loop/range-limited
  await L.blur(p); await p.keyboard.press('Escape'); await sleep(300); s.rangeAfterEsc = await rangeInfo(p);
  // --- Clip Gain with real audio
  const g = res.gain = {};
  g.p0 = await playWindow(p, 3, 2000);
  g.tap = await p.evaluate(() => window.__tap.an.size);
  await L.selectClip(p, clipId); await L.blur(p);
  await typeField(p, GAIN, '-20', true); g.statusM20 = await L.status(p); g.fieldM20 = await val(p, GAIN); g.resetEnabled = !(await p.isDisabled(RESET));
  g.p1 = await playWindow(p, 3, 2000);
  await L.selectClip(p, clipId); await L.blur(p);
  g.resetHit = await centreClick(p, RESET); g.field0 = await val(p, GAIN); g.status0 = await L.status(p); g.focusAfterReset = await focusInfo(p); g.resetDisabledAfter = await p.isDisabled(RESET);
  g.undoTitleAfterReset = await X.undoTitle(p);
  g.p2 = await playWindow(p, 3, 2000);
  g.dropDb = db(g.p1.peakMax, g.p0.peakMax); g.dropDbMed = db(g.p1.peakMed, g.p0.peakMed); g.restoreDb = db(g.p2.peakMax, g.p0.peakMax); g.restoreDbMed = db(g.p2.peakMed, g.p0.peakMed);
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500);
  g.undoStatus = await L.status(p);
  await L.selectClip(p, clipId); await L.blur(p); g.fieldAfterUndo = await val(p, GAIN); g.undoTitleAfterUndo = await X.undoTitle(p);
  // --- Toggle
  const t = res.toggle = {};
  await p.mouse.move(2, 2);
  t.ex0 = await p.getAttribute(TOG, 'aria-expanded');
  t.hit1 = await centreClick(p, TOG); t.ex1 = await p.getAttribute(TOG, 'aria-expanded'); t.txt1 = (await p.textContent(TOG)).trim(); t.contentVisible1 = await p.locator(FROM).isVisible(); t.focus1 = await focusInfo(p);
  await p.mouse.move(2, 2); await sleep(200); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-collapsed.png`) });
  t.hit2 = await centreClick(p, TOG); t.ex2 = await p.getAttribute(TOG, 'aria-expanded'); t.txt2 = (await p.textContent(TOG)).trim(); t.contentVisible2 = await p.locator(FROM).isVisible(); t.focus2 = await focusInfo(p);
  // keyboard: Space
  await L.seekTo(p, 5); await p.focus(TOG); await sleep(200);
  t.pos3a = await L.posNow(p); t.play3a = await playing(p); t.clips3a = await nClips(p);
  await p.keyboard.press('Space'); await sleep(900);
  t.ex3 = await p.getAttribute(TOG, 'aria-expanded'); t.pos3b = await L.posNow(p); t.play3b = await playing(p); t.focus3 = await focusInfo(p);
  await p.keyboard.press('Enter'); await sleep(900);
  t.ex4 = await p.getAttribute(TOG, 'aria-expanded'); t.pos4 = await L.posNow(p); t.clips4 = await nClips(p); t.focus4 = await focusInfo(p);
  await p.keyboard.press('Space'); await sleep(500); t.ex5 = await p.getAttribute(TOG, 'aria-expanded'); t.pos5 = await L.posNow(p);
  await p.keyboard.press('Enter'); await sleep(500); t.ex6 = await p.getAttribute(TOG, 'aria-expanded'); t.clips6 = await nClips(p); t.focus6 = await focusInfo(p);
  await ctx.close();
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
