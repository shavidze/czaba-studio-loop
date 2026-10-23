// C round 100: HOLD-TOGGLE (both viewports), FRESH-TOGGLE, WAVE-REG, HOLD-PLUS-REG, HOLD-ROW-REG + EXPORT-REG (1280)
// node run100.cjs <WxH> [scenario,...]. Fresh incognito Playwright Chromium context per scenario, no credentials.
// Real keyboard/mouse input. Recorder modelled on c-round-99/tools/run99.cjs; RMS tap + rms() copied verbatim from c-round-96/tools/r96.cjs.
const X = require('./lib100.cjs');
const { sleep, blur } = X;
const vpArg = process.argv[2] || '1280x720';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const [w, h] = vpArg.split('x').map(Number);
const want = (n) => !only || only.includes(n);
const OUTF = `run100-${vpArg}-${only ? only.join('_') : 'all'}.json`;
const PLUS = '＋ დამატება';
const PLAY = '▶ მოუსმინე';
const STOP = '■ შეჩერება';
const TID = 'arrangement-library-preview-toggle';

const TAP = () => {
  const orig = AudioNode.prototype.connect; window.__taps = [];
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const c = dest.context; if (!c.__tap) { c.__tap = c.createAnalyser(); c.__tap.fftSize = 2048; window.__taps.push(c.__tap); } orig.call(this, c.__tap); } } catch (e) { /* measurement only */ }
    return r;
  };
};
const rms = (p) => p.evaluate(async () => { let best = 0; for (let k = 0; k < 6; k++) { for (const a of window.__taps || []) { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const v of d) s += v * v; best = Math.max(best, Math.sqrt(s / d.length)); } await new Promise((r) => setTimeout(r, 50)); } return +best.toFixed(5); });

const RECORDER = () => {
  if (window.__c100) return;
  window.__c100 = []; window.__lab = [];
  const txt = (a) => (a ? `${a.tagName}${a.dataset && a.dataset.testid ? '[' + a.dataset.testid + ']' : ''}${a.dataset && a.dataset.sourceId ? '#' + a.dataset.sourceId : ''}:${(a.getAttribute('aria-label') || (a.textContent || '').trim()).slice(0, 30)}` : null);
  window.__c100txt = txt;
  window.addEventListener('keydown', (e) => { const r = { t: Math.round(performance.now()), type: 'keydown', key: e.key, repeat: e.repeat, active: txt(document.activeElement), trusted: e.isTrusted, dpEarlyBubble: 'NOT-REACHED', dpLate: 'NOT-REACHED' }; window.__c100.push(r); e.__c100 = r; }, true);
  window.addEventListener('keydown', (e) => { if (e.__c100) e.__c100.dpEarlyBubble = e.defaultPrevented; }, false);
  window.addEventListener('click', (e) => { const b = e.target.closest ? e.target.closest('button,[role=option],[role=slider]') || e.target : e.target; window.__c100.push({ t: Math.round(performance.now()), type: 'click', target: txt(b), tid: b && b.dataset ? b.dataset.testid || null : null, detail: e.detail, trusted: e.isTrusted }); }, true);
  const lab = () => { const b = document.querySelector('[data-testid=arrangement-library-preview-toggle]'); return b ? b.textContent.trim() : null; };
  window.__labNow = lab;
  const start = () => new MutationObserver(() => { const v = lab(); const last = window.__lab.at(-1); if (!last || last.v !== v) window.__lab.push({ t: Math.round(performance.now()), v }); }).observe(document, { subtree: true, childList: true, characterData: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
};
const installLate = (p) => p.evaluate(() => { if (window.__c100late) return; window.__c100late = true; window.addEventListener('keydown', (e) => { if (e.__c100) e.__c100.dpLate = e.defaultPrevented; }, false); });
const ev = (p) => p.evaluate(() => window.__c100.slice());
const labs = (p) => p.evaluate(() => window.__lab.slice());
const evClear = (p) => p.evaluate(() => { window.__c100.length = 0; window.__lab.length = 0; window.__lab.push({ t: Math.round(performance.now()), v: window.__labNow(), seed: true }); });
const active = (p) => p.evaluate(() => window.__c100txt(document.activeElement));
const clips = (p) => p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
const statusText = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null);
const label = (p) => p.evaluate(() => window.__labNow());
const row = (p, id) => p.locator(`[role=option][data-source-id="${id}"]`);
const playLabel = (p) => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label') || '')); return b ? b.getAttribute('aria-label') : null; });

async function bare(b, tag) {
  const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `${tag}-${vpArg}`);
  await p.addInitScript(TAP);
  await p.addInitScript(RECORDER);
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
  for (let i = 0; i < 20; i++) { const d = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) { x.click(); return true; } return false; }); if (d) break; await sleep(250); }
  await sleep(300);
  await installLate(p);
  const o = row(p, 'demo-middle-east'); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  return { ctx, p, S, ready: (await o.getAttribute('draggable')) === 'true', readyMs: Date.now() - t0 };
}
async function pickMiddleEast(p) {
  await row(p, 'demo-middle-east').click(); await sleep(300);
  const tg = p.getByTestId(TID);
  const t0 = Date.now(); while (Date.now() - t0 < 15000 && !(await tg.isEnabled())) await sleep(100);
  return tg;
}
async function heldEnter4(p) {
  await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await p.keyboard.up('Enter');
  await sleep(1200);
}
const enterKds = (evs) => evs.filter((e) => e.type === 'keydown' && e.key === 'Enter');
const changes = (l) => l.filter((x) => !x.seed).map((x) => x.v);
function fin(R, S) { R.errors = S.errors.slice(); R.noise = S.noise; R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice(); R.downloadsAll = S.downloads.map((d) => d.name); R.thirdParty = [...new Set(S.thirdParty)]; }

(async () => {
  const b = await X.launch(); const OUT = { vp: vpArg, when: new Date().toISOString() };
  const save = () => X.save(OUTF, OUT);

  if (want('holdtoggle')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdtoggle'); R.ready = ready;
    R.clipsBefore = await clips(p);
    const tg = await pickMiddleEast(p);
    R.toggleEnabled = await tg.isEnabled(); R.labelBefore = await label(p); R.rmsBefore = await rms(p);
    R.focusMethod = 'locator.focus()';
    await tg.focus(); await sleep(200);
    R.activeBeforeHold = await active(p);
    await evClear(p);
    await heldEnter4(p);
    R.labelAt1200 = await label(p); R.rmsAt1200 = await rms(p); R.clipsAfter = await clips(p); R.activeAfter = await active(p); R.transport = await playLabel(p);
    R.events = await ev(p); R.labelTimeline = await labs(p);
    await p.screenshot({ path: `${X.SHOTS}/holdtoggle-${vpArg}.png` });
    await evClear(p);
    await p.keyboard.press('Enter'); await sleep(400);
    R.stop = { label: await label(p), rms: await rms(p), events: await ev(p), timeline: await labs(p) };
    await p.screenshot({ path: `${X.SHOTS}/holdtoggle-stopped-${vpArg}.png` });
    const k = enterKds(R.events); const cl = R.events.filter((e) => e.type === 'click');
    const sk = enterKds(R.stop.events); const scl = R.stop.events.filter((e) => e.type === 'click');
    R.verdict = {
      fourKds: k.length === 4, repeatsFTTT: k.map((x) => x.repeat).join() === 'false,true,true,true', allOnToggle: k.every((x) => (x.active || '').includes(`[${TID}]`)),
      exactlyOneClickOnToggle: cl.length === 1 && cl[0].tid === TID,
      dpLateFTTT: k.map((x) => x.dpLate).join() === 'false,true,true,true',
      labelChangedOnce: changes(R.labelTimeline).join('|') === STOP && R.labelBefore === PLAY,
      stillPlayingAt1200: R.labelAt1200 === STOP, rmsAt1200: R.rmsAt1200 > 0.001, noClips: R.clipsBefore === 0 && R.clipsAfter === 0,
      stopPress: sk.length === 1 && sk[0].repeat === false && scl.length === 1 && scl[0].tid === TID && R.stop.label === PLAY && R.stop.rms < 0.0005,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    fin(R, S); OUT.holdtoggle = R; save(); await ctx.close();
  }
  if (want('freshtoggle')) {
    const R = { steps: [] };
    const { ctx, p, S, ready } = await bare(b, 'freshtoggle'); R.ready = ready;
    const tg = await pickMiddleEast(p);
    await tg.focus(); await sleep(200); R.activeBefore = await active(p);
    const step = async (name, fn) => { await evClear(p); const before = await label(p); await fn(); await sleep(300); const evs = await ev(p); const r = { name, before, after: await label(p), rms: await rms(p), changes: changes(await labs(p)), enterKds: enterKds(evs).map((k) => ({ repeat: k.repeat, active: k.active })), clicks: evs.filter((e) => e.type === 'click').map((c) => c.tid || c.target) }; R.steps.push(r); return r; };
    await step('press1', () => p.keyboard.press('Enter'));
    await step('press2', () => p.keyboard.press('Enter'));
    await step('click1', () => tg.click());
    await step('click2', () => tg.click());
    const exp = [[PLAY, STOP], [STOP, PLAY], [PLAY, STOP], [STOP, PLAY]];
    R.verdict = {};
    R.steps.forEach((s, i) => {
      const isKey = i < 2;
      R.verdict[s.name] = s.before === exp[i][0] && s.after === exp[i][1] && s.changes.length === 1 && s.clicks.length === 1 && s.clicks[0] === TID
        && (isKey ? s.enterKds.length === 1 && s.enterKds[0].repeat === false : s.enterKds.length === 0)
        && (s.after === STOP ? s.rms > 0.001 : s.rms < 0.0005);
    });
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/freshtoggle-${vpArg}.png` });
    fin(R, S); OUT.freshtoggle = R; save(); await ctx.close();
  }
  if (want('wavereg')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'wavereg'); R.ready = ready;
    await pickMiddleEast(p);
    const wv = p.getByTestId('arrangement-library-preview-wave');
    R.waveTabIndex = await wv.getAttribute('tabindex');
    await wv.focus(); await sleep(200); R.activeBeforeHold = await active(p); R.labelBefore = await label(p);
    await evClear(p);
    await heldEnter4(p);
    R.labelAt1200 = await label(p); R.rmsAt1200 = await rms(p); R.clips = await clips(p);
    R.events = await ev(p); R.labelTimeline = await labs(p);
    await p.screenshot({ path: `${X.SHOTS}/wavereg-${vpArg}.png` });
    await evClear(p); await p.keyboard.press('Enter'); await sleep(400);
    R.stop = { label: await label(p), rms: await rms(p) };
    const k = enterKds(R.events);
    R.verdict = {
      fourKdsOnWave: k.length === 4 && k.every((x) => (x.active || '').includes('[arrangement-library-preview-wave]')), repeatsFTTT: k.map((x) => x.repeat).join() === 'false,true,true,true',
      toggledOnce: R.labelBefore === PLAY && changes(R.labelTimeline).join('|') === STOP && R.labelAt1200 === STOP, rmsAt1200: R.rmsAt1200 > 0.001, noClips: R.clips === 0,
      stopEnter: R.stop.label === PLAY && R.stop.rms < 0.0005,
    };
    R.info = { clicks: R.events.filter((e) => e.type === 'click').length, dpLate: k.map((x) => x.dpLate) };
    R.pass = Object.values(R.verdict).every(Boolean);
    fin(R, S); OUT.wavereg = R; save(); await ctx.close();
  }
  if (want('holdplus')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdplus'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await pickMiddleEast(p);
    const plus = p.getByRole('button', { name: PLUS });
    const t0 = Date.now(); while (Date.now() - t0 < 10000 && !(await plus.isEnabled())) await sleep(100);
    await plus.focus(); await sleep(200); R.activeBeforeHold = await active(p);
    await evClear(p);
    await heldEnter4(p);
    R.clipsAfter = await clips(p); R.status = await statusText(p); R.label = await label(p);
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/holdplus-${vpArg}.png` });
    const k = enterKds(R.events); const cl = R.events.filter((e) => e.type === 'click');
    R.verdict = {
      fourKds: k.length === 4 && k.every((x) => (x.active || '').endsWith(PLUS)), repeatsFTTT: k.map((x) => x.repeat).join() === 'false,true,true,true',
      repeatsPrevented: k.slice(1).every((x) => x.dpLate === true), oneClickOnPlus: cl.length === 1 && cl[0].target.endsWith(PLUS), oneClip: R.clipsBefore === 0 && R.clipsAfter === 1,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    fin(R, S); OUT.holdplus = R; save(); await ctx.close();
  }
  if (want('holdrow')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdrow'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await row(p, 'demo-middle-east').click(); await sleep(300);
    R.activeBeforeHold = await active(p);
    await evClear(p);
    await heldEnter4(p);
    R.clipsAfter = await clips(p); R.status = await statusText(p);
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/holdrow-${vpArg}.png` });
    const k = enterKds(R.events);
    R.verdict = {
      fourKds: k.length === 4 && k.every((x) => /#demo-middle-east/.test(x.active || '')), repeatsFTTT: k.map((x) => x.repeat).join() === 'false,true,true,true',
      oneClip: R.clipsBefore === 0 && R.clipsAfter === 1,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    if (want('exportreg') || !only) {
      const E = {};
      E.clipsBeforeExport = await clips(p);
      await blur(p);
      await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(400);
      await X.installClickProbe(p);
      await X.selectFormat(p, 'wav');
      const n1 = S.downloads.length;
      E.full = await X.exportFull(p);
      const t0 = Date.now(); while (Date.now() - t0 < 30000 && S.downloads.length - n1 < 1) await sleep(200); await sleep(1500);
      const files = S.downloads.slice(n1);
      E.files = files.map((f) => ({ name: f.name, size: f.size, file: f.file }));
      E.wav = files[0] && files[0].file ? X.wavInfo(files[0].file) : null;
      await p.screenshot({ path: `${X.SHOTS}/exportreg-${vpArg}.png` });
      E.pass = E.clipsBeforeExport === 1 && files.length === 1 && !!E.wav && E.wav.riff === 'RIFF' && E.wav.wave === 'WAVE' && E.wav.seconds > 0 && E.wav.nan === 0 && E.wav.peak > 0;
      OUT.exportreg = E;
    }
    fin(R, S); OUT.holdrow = R; save(); await ctx.close();
  }
  if (want('freshtight')) {
    const R = { pairs: [] };
    const { ctx, p, S, ready } = await bare(b, 'freshtight'); R.ready = ready;
    const tg = await pickMiddleEast(p);
    await tg.focus(); await sleep(200); R.activeBefore = await active(p);
    await p.keyboard.press('Enter'); await sleep(300); R.single = { label: await label(p), rms: await rms(p) };
    await p.keyboard.press('Enter'); await sleep(500); R.singleStop = { label: await label(p), rms: await rms(p) };
    const pair = async (name, fn) => { await evClear(p); const before = await label(p); await fn(); await sleep(300); await fn(); await sleep(400); const evs = await ev(p); const r = { name, before, after: await label(p), rmsAfter: await rms(p), timeline: await labs(p), enterKds: enterKds(evs).map((k) => ({ t: k.t, repeat: k.repeat, active: k.active })), clicks: evs.filter((e) => e.type === 'click').map((c) => ({ t: c.t, tid: c.tid })) }; R.pairs.push(r); return r; };
    await pair('press2x300', () => p.keyboard.press('Enter'));
    await pair('click2x300', () => tg.click());
    R.verdict = { singleAudible: R.single.label === STOP && R.single.rms > 0.001, singleStop: R.singleStop.label === PLAY && R.singleStop.rms < 0.0005 };
    R.pairs.forEach((r, i) => {
      const gap = r.clicks.length === 2 ? r.clicks[1].t - r.clicks[0].t : null; r.clickGapMs = gap;
      R.verdict[r.name] = r.before === PLAY && changes(r.timeline).join('|') === `${STOP}|${PLAY}` && r.after === PLAY && r.rmsAfter < 0.0005 && r.clicks.length === 2 && r.clicks.every((c) => c.tid === TID) && gap < 450
        && (i === 0 ? r.enterKds.length === 2 && r.enterKds.every((k) => k.repeat === false) : r.enterKds.length === 0);
    });
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/freshtight-${vpArg}.png` });
    fin(R, S); OUT.freshtight = R; save(); await ctx.close();
  }
  save();
  console.log('DONE', vpArg, JSON.stringify(Object.fromEntries(Object.entries(OUT).filter(([, v]) => v && typeof v === 'object').map(([k, v]) => [k, v.pass]))));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
