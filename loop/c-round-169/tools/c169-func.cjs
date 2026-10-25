// C round 169 — FUNC-SMOKE-V3C4C1. Real mouse clicks at button centres (elementFromPoint hit-checked), real AudioDestination tap. node c169-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const TOG = '[data-testid=arrangement-library-preview-toggle]';
const ADD = '[data-testid=arrangement-library-preview] button:has(svg.lucide-plus)';
const OPT = '[data-testid=arrangement-library] [role=option]';
const SEARCH = '[data-testid=arrangement-library-search]', CLEAR = '[data-testid=arrangement-library-search-clear]';
const COLL = '[data-testid=arrangement-library-collapse]', EXP = '[data-testid=arrangement-library-expand]';
const centre = async (p, s) => { const bb = await p.locator(s).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); const e = document.querySelector(s); return !!(t && e && (t === e || e.contains(t))); }, { x, y, s }); return { x, y, hit }; };
const centreClick = async (p, s, count = 1) => { const c = await centre(p, s); await p.mouse.move(c.x, c.y, { steps: 2 }); await p.mouse.click(c.x, c.y, { clickCount: count }); await sleep(350); return c.hit; };
const txt = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, s);
const clips = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), lane: e.closest('[data-track-id]').getAttribute('data-track-id'), start: e.getAttribute('data-clip-start'), title: e.textContent.trim().slice(0, 30) })));
const focusInfo = (p) => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, testid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label') } : null; });
async function tapAround(p, action, ms) {
  await p.evaluate(() => window.__tapStart()); await sleep(250);
  const t0 = await p.evaluate(() => performance.now()); const r = await action(); await sleep(ms);
  const S = await p.evaluate(() => window.__tapStop());
  const before = S.filter((q) => q.t < t0), after = S.filter((q) => q.t >= t0);
  const firstLoud = after.find((q) => q.peak > 0.01);
  const firstSilent = after.find((q, i) => after.slice(i).every((z) => z.peak < 0.001));
  return { r, prePeak: +before.reduce((m, q) => Math.max(m, q.peak), 0).toFixed(5), maxAfter: +after.reduce((m, q) => Math.max(m, q.peak), 0).toFixed(5), loudAtMs: firstLoud ? +(firstLoud.t - t0).toFixed(1) : null, silentAtMs: firstSilent ? +(firstSilent.t - t0).toFixed(1) : null, n: after.length };
}
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c169func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady && log.fontsReady.ok;
  // --- Option row click selects
  const o = res.option = {};
  const opt2 = `${OPT}[data-source-id="demo-middle-east"]`;
  o.otherId = await p.getAttribute(`${OPT}[aria-selected=false]`, 'data-source-id');
  const optO = `${OPT}[data-source-id="${o.otherId}"]`;
  o.otherBefore = await p.getAttribute(optO, 'aria-selected');
  o.otherHit = await centreClick(p, optO); await sleep(300);
  o.otherAfter = await p.getAttribute(optO, 'aria-selected'); o.selectedCount = await p.locator(`${OPT}[aria-selected=true]`).count();
  o.before = await p.getAttribute(opt2, 'aria-selected');
  o.hit = await centreClick(p, opt2); await sleep(300);
  o.after = await p.getAttribute(opt2, 'aria-selected'); o.otherAfter2 = await p.getAttribute(optO, 'aria-selected');
  for (let i = 0; i < 40; i++) { if (await p.locator(`${TOG}:enabled`).count()) break; await sleep(250); }
  // --- Preview with real audio
  const pv = res.preview = {};
  pv.text0 = await txt(p, TOG);
  pv.ctxStates0 = await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state));
  pv.start = await tapAround(p, () => centreClick(p, TOG), 1000);
  pv.text1 = await txt(p, TOG); pv.rowText1 = await txt(p, opt2); pv.rowPlaying = /Playing/.test(pv.rowText1 || '');
  pv.tapConnected = await p.evaluate(() => window.__tap.an.size);
  await p.mouse.move(2, 2); await sleep(200); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-previewing.png`) });
  pv.stop = await tapAround(p, () => centreClick(p, TOG), 700);
  pv.text2 = await txt(p, TOG); pv.rowText2 = await txt(p, opt2);
  // --- Add with an audio lane active (music), then Undo
  const a = res.add = {};
  await p.click(L.nameSel('music')); await sleep(300); await L.blur(p);
  await L.seekTo(p, 0);
  a.disabled = await p.isDisabled(ADD);
  a.clips0 = (await clips(p)).length;
  a.hit = await centreClick(p, ADD); await sleep(500);
  const c1 = await clips(p); a.clips1 = c1.length; a.newClip = c1.filter((c) => c.lane === 'music');
  a.status = await L.status(p);
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500);
  a.clipsUndo = (await clips(p)).length; a.undoStatus = await L.status(p);
  // --- Double click on option adds
  const d = res.dbl = {};
  d.clips0 = (await clips(p)).length;
  d.hit = await centreClick(p, `${OPT}[data-source-id="demo-soft-impact"]`, 2); await sleep(600);
  const c2 = await clips(p); d.clips1 = c2.length; d.added = c2.filter((c) => /impact/i.test(c.title)); d.status = await L.status(p);
  await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500); d.clipsUndo = (await clips(p)).length;
  // --- Search + clear
  const s = res.search = {};
  s.n0 = await p.locator(OPT).count();
  { const c = await centre(p, SEARCH); s.hit = c.hit; await p.mouse.click(c.x, c.y); await sleep(200); }
  await p.keyboard.type('impact', { delay: 40 }); await sleep(500);
  s.n1 = await p.locator(OPT).count(); s.value1 = await p.inputValue(SEARCH);
  s.clearHit = await centreClick(p, CLEAR); await sleep(400);
  s.value2 = await p.inputValue(SEARCH); s.n2 = await p.locator(OPT).count(); s.focus = await focusInfo(p);
  s.clearGone = (await p.locator(CLEAR).count()) === 0;
  await p.keyboard.type('x'); await sleep(300); s.typedAfterClear = await p.inputValue(SEARCH); await p.keyboard.press('Backspace'); await sleep(300); s.n3 = await p.locator(OPT).count();
  // --- Collapse / expand with focus hand-off
  const k = res.collapse = {};
  k.hit = await centreClick(p, COLL); await sleep(400);
  k.expandVisible = await p.locator(EXP).isVisible().catch(() => false); k.optionsVisible = await p.locator(OPT).count(); k.focus1 = await focusInfo(p);
  await p.mouse.move(2, 2); await sleep(200); await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-collapsed.png`) });
  k.expHit = await centreClick(p, EXP); await sleep(400);
  k.collapseVisible = await p.locator(COLL).isVisible().catch(() => false); k.optionsAfter = await p.locator(OPT).count(); k.focus2 = await focusInfo(p);
  await ctx.close();
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
