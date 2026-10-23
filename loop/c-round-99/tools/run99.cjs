// C round 99: HOLD-ROW, HOLD-BODY, HOLD-PLUS (both viewports), FRESH-ADD, HELD-ARROW-REG, SPACE-REG, CLOSE-HOLD-REG, EXPORT-REG (1280)
// Real keyboard/mouse input. Fresh incognito context per scenario, no credentials.
const X = require('./lib99.cjs');
const { sleep, blur } = X;
const vpArg = process.argv[2] || '1280x720';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const [w, h] = vpArg.split('x').map(Number);
const want = (n) => !only || only.includes(n);
const OUTF = `run99-${vpArg}-${only ? only.join('_') : 'all'}.json`;
const PLUS = '＋ დამატება';

const RECORDER = () => {
  if (window.__c99) return;
  window.__c99 = [];
  const txt = (a) => (a ? `${a.tagName}${a.dataset && a.dataset.sourceId ? '#' + a.dataset.sourceId : ''}:${(a.getAttribute('aria-label') || (a.textContent || '').trim()).slice(0, 30)}` : null);
  window.__c99txt = txt;
  window.addEventListener('keydown', (e) => { const r = { t: Math.round(performance.now()), type: 'keydown', key: e.key, repeat: e.repeat, active: txt(document.activeElement), trusted: e.isTrusted, dpEarlyBubble: 'NOT-REACHED', dpLate: 'NOT-REACHED' }; window.__c99.push(r); e.__c99 = r; }, true);
  window.addEventListener('keydown', (e) => { if (e.__c99) e.__c99.dpEarlyBubble = e.defaultPrevented; }, false);
  window.addEventListener('click', (e) => { const b = e.target.closest ? e.target.closest('button,[role=option]') || e.target : e.target; window.__c99.push({ t: Math.round(performance.now()), type: 'click', target: txt(b), detail: e.detail, trusted: e.isTrusted }); }, true);
  window.addEventListener('dblclick', (e) => { window.__c99.push({ t: Math.round(performance.now()), type: 'dblclick', target: txt(e.target.closest ? e.target.closest('[role=option]') || e.target : e.target) }); }, true);
};
// late bubble listener, registered after the app's own window listeners (C-R98-N4)
const installLate = (p) => p.evaluate(() => { if (window.__c99late) return; window.__c99late = true; window.addEventListener('keydown', (e) => { if (e.__c99) e.__c99.dpLate = e.defaultPrevented; }, false); });
const ev = (p) => p.evaluate(() => window.__c99.slice());
const evClear = (p) => p.evaluate(() => { window.__c99.length = 0; });
const active = (p) => p.evaluate(() => window.__c99txt(document.activeElement));
const clips = (p) => p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
const statusText = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null);
const dlgOpen = (p) => p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
const row = (p, id) => p.locator(`[role=option][data-source-id="${id}"]`);
const selected = (p) => p.evaluate(() => [...document.querySelectorAll('[role=option][aria-selected=true]')].map((o) => o.dataset.sourceId));
const playLabel = (p) => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label') || '')); return b ? b.getAttribute('aria-label') : null; });
async function waitFor(p, fn, arg, ms = 5000) { const t = Date.now(); while (Date.now() - t < ms) { if (await p.evaluate(fn, arg)) return Date.now() - t; await sleep(5); } return -1; }

async function bare(b, tag) {
  const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `${tag}-${vpArg}`);
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
async function heldEnter(p) {
  await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await p.keyboard.up('Enter');
  await sleep(1200);
}
const enterKds = (evs) => evs.filter((e) => e.type === 'keydown' && e.key === 'Enter');
function fin(R, S) { R.errors = S.errors.slice(); R.noise = S.noise; R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice(); R.downloadsAll = S.downloads.map((d) => d.name); }

(async () => {
  const b = await X.launch(); const OUT = { vp: vpArg, when: new Date().toISOString() };
  const save = () => X.save(OUTF, OUT);

  if (want('holdrow')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdrow'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await row(p, 'demo-middle-east').click(); await sleep(300);
    R.activeBeforeHold = await active(p);
    await evClear(p);
    await heldEnter(p);
    R.clipsAfter = await clips(p); R.status = await statusText(p); R.activeAfter = await active(p);
    R.clipLanes = await p.$$eval('[data-clip-id]', (els) => els.map((e) => e.closest('[data-track-id]')?.getAttribute('data-track-id')));
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/holdrow-${vpArg}.png` });
    await blur(p); await p.keyboard.press('Control+z'); await sleep(800);
    R.clipsAfterUndo = await clips(p); R.statusAfterUndo = await statusText(p);
    const k = enterKds(R.events);
    R.verdict = {
      threeKds: k.length === 3, firstFresh: !!k[0] && k[0].repeat === false, repeats: k.slice(1).every((x) => x.repeat === true),
      allOnRow: k.every((x) => /^BUTTON#demo-middle-east/.test(x.active)),
      oneClip: R.clipsBefore === 0 && R.clipsAfter === 1, undoToZero: R.clipsAfterUndo === 0,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    if (vpArg === '1280x720' && want('exportreg')) {
      const E = {};
      await row(p, 'demo-middle-east').click(); await sleep(300);
      await p.keyboard.press('Enter'); await sleep(900);
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
      E.pass = files.length === 1 && !!E.wav && E.wav.riff === 'RIFF' && E.wav.wave === 'WAVE' && E.wav.seconds > 0 && E.wav.nan === 0 && E.wav.peak > 0;
      OUT.exportreg = E;
    }
    fin(R, S); OUT.holdrow = R; save(); await ctx.close();
  }
  if (want('holdbody')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdbody'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await row(p, 'demo-middle-east').click(); await sleep(300);
    await p.locator('[data-testid=arrangement-status]').click(); await sleep(300);
    R.activeTag = await p.evaluate(() => document.activeElement?.tagName);
    R.selected = await selected(p);
    await evClear(p);
    await heldEnter(p);
    R.clipsAfter = await clips(p); R.status = await statusText(p);
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/holdbody-${vpArg}.png` });
    const k = enterKds(R.events);
    R.verdict = {
      precondBody: R.activeTag === 'BODY', threeKds: k.length === 3, firstFresh: !!k[0] && k[0].repeat === false, repeats: k.slice(1).every((x) => x.repeat === true),
      allOnBody: k.every((x) => /^BODY/.test(x.active)), oneClip: R.clipsBefore === 0 && R.clipsAfter === 1,
    };
    R.info = { dpLate: k.map((x) => x.dpLate), dpEarlyBubble: k.map((x) => x.dpEarlyBubble) };
    R.pass = Object.values(R.verdict).every(Boolean);
    fin(R, S); OUT.holdbody = R; save(); await ctx.close();
  }
  if (want('holdplus')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'holdplus'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await row(p, 'demo-middle-east').click(); await sleep(300);
    const plus = p.getByRole('button', { name: PLUS });
    const t0 = Date.now(); while (Date.now() - t0 < 10000 && !(await plus.isEnabled())) await sleep(100);
    R.plusEnabled = await plus.isEnabled();
    R.focusMethod = 'locator.focus()';
    await plus.focus(); await sleep(200);
    R.activeBeforeHold = await active(p);
    await evClear(p);
    await heldEnter(p);
    R.clipsAfter = await clips(p); R.status = await statusText(p); R.activeAfter = await active(p);
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/holdplus-${vpArg}.png` });
    const k = enterKds(R.events); const cl = R.events.filter((e) => e.type === 'click');
    R.verdict = {
      threeKds: k.length === 3, allOnPlus: k.every((x) => x.active && x.active.endsWith(PLUS)), firstFresh: !!k[0] && k[0].repeat === false && k[0].dpEarlyBubble === false,
      repeatsPrevented: k.slice(1).every((x) => x.repeat === true && x.dpEarlyBubble === true && x.dpLate === true), oneClickOnPlus: cl.length === 1 && cl[0].target.endsWith(PLUS),
      oneClip: R.clipsBefore === 0 && R.clipsAfter === 1,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    fin(R, S); OUT.holdplus = R; save(); await ctx.close();
  }
  if (want('freshadd')) {
    const R = { steps: [] };
    const { ctx, p, S, ready } = await bare(b, 'freshadd'); R.ready = ready;
    const step = async (name, fn) => { const before = await clips(p); await evClear(p); await fn(); await sleep(900); const after = await clips(p); const evs = await ev(p); R.steps.push({ name, before, after, delta: after - before, enterKds: enterKds(evs).map((k) => ({ repeat: k.repeat, active: k.active })), clicks: evs.filter((e) => e.type === 'click').map((c) => c.target), status: await statusText(p) }); };
    await row(p, 'demo-middle-east').click(); await sleep(300);
    await step('rowEnterTwice', async () => { await p.keyboard.press('Enter'); await sleep(300); await p.keyboard.press('Enter'); });
    const plus = p.getByRole('button', { name: PLUS });
    await step('plusClickTwice', async () => { await plus.click(); await sleep(300); await plus.click(); });
    await step('plusFocusEnter', async () => { await plus.focus(); await sleep(100); await p.keyboard.press('Enter'); });
    await step('rowDblclick', async () => { await row(p, 'demo-middle-east').dblclick(); });
    const [s1, s2, s3, s4] = R.steps;
    R.verdict = {
      rowPlus2: s1.delta === 2 && s1.enterKds.length === 2 && s1.enterKds.every((k) => k.repeat === false),
      plusClick2: s2.delta === 2, plusEnter1: s3.delta === 1 && s3.enterKds.length === 1 && s3.enterKds[0].repeat === false,
      dblclick1: s4.delta === 1,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/freshadd-${vpArg}.png` });
    fin(R, S); OUT.freshadd = R; save(); await ctx.close();
  }
  if (want('heldarrow')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'heldarrow'); R.ready = ready;
    R.order = await p.$$eval('[role=option]', (os) => os.map((o) => o.dataset.sourceId));
    await row(p, 'demo-middle-east').focus(); await sleep(200);
    R.clipsBefore = await clips(p); R.activeBefore = await active(p); R.selectedBefore = await selected(p);
    await evClear(p);
    await p.keyboard.down('ArrowDown'); await sleep(50); await p.keyboard.down('ArrowDown'); await sleep(50); await p.keyboard.down('ArrowDown'); await p.keyboard.up('ArrowDown');
    await sleep(800);
    R.clipsAfter = await clips(p); R.activeAfter = await active(p); R.selectedAfter = await selected(p);
    R.kds = (await ev(p)).filter((e) => e.type === 'keydown').map((k) => ({ key: k.key, repeat: k.repeat, active: k.active }));
    R.verdict = { slowRise: /demo-slow-rise/.test(R.activeAfter || '') && R.selectedAfter.includes('demo-slow-rise'), noClip: R.clipsAfter === R.clipsBefore };
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/heldarrow-${vpArg}.png` });
    fin(R, S); OUT.heldarrow = R; save(); await ctx.close();
  }
  if (want('spacereg')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'spacereg'); R.ready = ready;
    await row(p, 'demo-middle-east').click(); await sleep(300);
    await p.keyboard.press('Enter'); await sleep(900);
    R.clips = await clips(p);
    await p.locator('[data-testid=arrangement-status]').click(); await sleep(300);
    R.activeTag = await p.evaluate(() => document.activeElement?.tagName);
    R.play0 = await playLabel(p);
    const pos = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-position]')?.textContent ?? null);
    R.pos0 = await pos();
    await p.keyboard.press('Space'); await sleep(1000);
    R.play1 = await playLabel(p); R.pos1 = await pos();
    await p.screenshot({ path: `${X.SHOTS}/spacereg-playing-${vpArg}.png` });
    await p.keyboard.press('Space'); await sleep(500);
    R.play2 = await playLabel(p); R.pos2 = await pos();
    R.pass = R.clips === 1 && R.play0 === 'Play' && R.play1 === 'Pause' && R.play2 === 'Play';
    fin(R, S); OUT.spacereg = R; save(); await ctx.close();
  }
  if (want('closehold')) {
    const R = {};
    const { ctx, p, S, ready } = await bare(b, 'closehold'); R.ready = ready;
    R.clipsBefore = await clips(p);
    await p.getByRole('button', { name: 'Export', exact: true }).click();
    await p.waitForSelector('#arrangement-export-title');
    R.msFocusClose = await waitFor(p, () => (document.activeElement?.textContent || '').trim() === 'დახურვა', null, 3000);
    await evClear(p);
    await p.keyboard.down('Enter');
    R.msDialogGone = await waitFor(p, () => !document.querySelector('#arrangement-export-title'), null, 3000);
    for (let i = 0; i < 2; i++) { await sleep(50); await p.keyboard.down('Enter'); }
    await p.keyboard.up('Enter'); await sleep(1200);
    R.after = { open: await dlgOpen(p), active: await active(p), clips: await clips(p) };
    R.events = await ev(p);
    const cl = R.events.filter((e) => e.type === 'click');
    R.verdict = {
      closedOnce: R.msDialogGone >= 0 && R.after.open === false, clickOnClose: cl.filter((c) => /დახურვა$/.test(c.target)).length === 1,
      noClickOnExport: !cl.some((c) => /:Export$/.test(c.target)), focusExport: /^BUTTON:Export$/.test(R.after.active || ''), noClip: R.after.clips === 0,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/closehold-${vpArg}.png` });
    fin(R, S); OUT.closehold = R; save(); await ctx.close();
  }
  save();
  console.log('DONE', vpArg, JSON.stringify(Object.fromEntries(Object.entries(OUT).filter(([, v]) => v && typeof v === 'object').map(([k, v]) => [k, v.pass]))));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
