// C round 98: CLOSE-HOLD, FRESH-OPEN, CANCEL-CLOSE-HOLD (1440), OPEN-HOLD (1280), ENTER-ADD-REG (1280), EXPORT-REG (1280)
// Real keyboard/mouse input only. Fresh incognito context per scenario, no credentials.
const X = require('./lib98.cjs');
const { sleep, blur, MSG } = X;
const vpArg = process.argv[2] || '1280x720';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const [w, h] = vpArg.split('x').map(Number);
const want = (n) => !only || only.includes(n);
const OUTF = `run98-${vpArg}-${only ? only.join('_') : 'all'}.json`;

const RECORDER = () => {
  if (window.__c98) return;
  window.__c98 = [];
  const txt = (a) => (a ? (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 30) || a.tagName) : null);
  const where = (a) => (a && a.closest ? (a.closest('[role=dialog]') ? 'dialog' : 'page') : null);
  window.addEventListener('keydown', (e) => { const r = { t: Math.round(performance.now()), type: 'keydown', key: e.key, repeat: e.repeat, active: txt(document.activeElement), in: where(document.activeElement), trusted: e.isTrusted, defaultPrevented: 'NOT-REACHED-BUBBLE' }; window.__c98.push(r); e.__c98 = r; }, true);
  window.addEventListener('keydown', (e) => { if (e.__c98) e.__c98.defaultPrevented = e.defaultPrevented; }, false);
  window.addEventListener('click', (e) => { const b = e.target.closest ? e.target.closest('button') || e.target : e.target; window.__c98.push({ t: Math.round(performance.now()), type: 'click', target: txt(b), in: where(b), detail: e.detail }); }, true);
};
const ev = (p) => p.evaluate(() => window.__c98.slice());
const evClear = (p) => p.evaluate(() => { window.__c98.length = 0; });
const activeText = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 30) || a.tagName) : null; });
const dlgOpen = (p) => p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
const onToolbarExport = (p) => p.evaluate(() => { const a = document.activeElement; return !!a && a.tagName === 'BUTTON' && a.textContent.trim() === 'Export' && !a.closest('[role=dialog]'); });
async function waitFor(p, fn, arg, ms = 5000) { const t = Date.now(); while (Date.now() - t < ms) { if (await p.evaluate(fn, arg)) return Date.now() - t; await sleep(5); } return -1; }
const focusIs = (t) => { const a = document.activeElement; return !!a && (a.textContent || '').trim() === t; };
const focusToolbarExport = () => { const a = document.activeElement; return !!a && a.tagName === 'BUTTON' && a.textContent.trim() === 'Export' && !a.closest('[role=dialog]'); };
const noDialog = () => !document.querySelector('#arrangement-export-title');
const exportBtn = (p) => p.getByRole('button', { name: 'Export', exact: true });
const clips = (p) => p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);

async function bare(b, tag) {
  const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `${tag}-${vpArg}`);
  await p.addInitScript(RECORDER);
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
  for (let i = 0; i < 20; i++) { const d = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) { x.click(); return true; } return false; }); if (d) break; await sleep(250); }
  await sleep(300);
  return { ctx, p, S };
}
async function clickClose(p) {
  if (!(await dlgOpen(p))) return 'NO-DIALOG';
  const bx = await p.getByRole('button', { name: 'დახურვა', exact: true }).boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  return waitFor(p, noDialog, null, 3000);
}
// the held-Enter sequence from a dialog whose focus is on დახურვა
async function holdFromClose(p, R) {
  R.focusBeforeHold = await activeText(p);
  await evClear(p);
  await p.keyboard.down('Enter');
  R.msDialogGone = await waitFor(p, noDialog, null, 3000);
  R.msFocusOnToolbarExport = await waitFor(p, focusToolbarExport, null, 3000);
  for (let i = 0; i < 2; i++) { await sleep(50); await p.keyboard.down('Enter'); }
  await p.keyboard.up('Enter');
  await sleep(1000);
  R.after1s = { open: await dlgOpen(p), active: await activeText(p), onToolbarExport: await onToolbarExport(p) };
  R.events = await ev(p);
  const kds = R.events.filter((e) => e.type === 'keydown' && e.key === 'Enter');
  const clicks = R.events.filter((e) => e.type === 'click');
  R.verdict = {
    firstKdOnClose: !!kds[0] && kds[0].repeat === false && kds[0].active === 'დახურვა',
    clickOnClose: clicks.some((c) => c.target === 'დახურვა'),
    repeatsOnExportPrevented: kds.length === 3 && kds.slice(1).every((k) => k.repeat === true && k.active === 'Export' && k.in === 'page' && k.defaultPrevented === true),
    noClickOnExport: !clicks.some((c) => c.target === 'Export'),
    closedAndFocusExport: R.after1s.open === false && R.after1s.onToolbarExport === true,
  };
  R.pass = Object.values(R.verdict).every(Boolean);
}
function fin(R, S) { R.errors = S.errors.slice(); R.noise = S.noise; R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice(); R.downloadsAll = S.downloads.map((d) => d.name); }

(async () => {
  const b = await X.launch(); const OUT = { vp: vpArg, when: new Date().toISOString() };
  if (want('closehold')) {
    const R = {};
    const { ctx, p, S } = await bare(b, 'closehold');
    await exportBtn(p).click();
    await p.waitForSelector('#arrangement-export-title');
    R.msFocusClose = await waitFor(p, focusIs, 'დახურვა', 3000);
    await holdFromClose(p, R);
    await p.screenshot({ path: `${X.SHOTS}/closehold-${vpArg}.png` });
    fin(R, S); OUT.closehold = R; X.save(OUTF, OUT);
    // FRESH-OPEN, same context
    const F = {};
    await evClear(p);
    F.before = await activeText(p);
    await p.keyboard.press('Enter');
    F.enter = { msDialog: await waitFor(p, () => !!document.querySelector('#arrangement-export-title'), null, 3000), msFocusClose: await waitFor(p, focusIs, 'დახურვა', 3000) };
    F.enter.events = await ev(p);
    const k0 = F.enter.events.find((e) => e.type === 'keydown' && e.key === 'Enter');
    F.enter.kd = k0;
    F.enter.ok = F.enter.msDialog >= 0 && F.enter.msFocusClose >= 0 && !!k0 && k0.repeat === false && k0.defaultPrevented === false && k0.active === 'Export';
    await p.screenshot({ path: `${X.SHOTS}/fresh-enter-${vpArg}.png` });
    F.close1 = { ms: await clickClose(p), active: await activeText(p) };
    await exportBtn(p).focus();
    const playLabel = () => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label') || '')); return b ? b.getAttribute('aria-label') : null; });
    await evClear(p);
    const pl0 = await playLabel();
    await p.keyboard.press('Space');
    F.space = { playBefore: pl0, msDialog: await waitFor(p, () => !!document.querySelector('#arrangement-export-title'), null, 3000), msFocusClose: await waitFor(p, focusIs, 'დახურვა', 3000), events: await ev(p), playAfter: await playLabel(), activeAfter: await activeText(p) };
    F.space.ok = F.space.msDialog >= 0 && F.space.msFocusClose >= 0;
    await p.screenshot({ path: `${X.SHOTS}/fresh-space-${vpArg}.png` });
    if (!F.space.ok && F.space.playAfter === 'Pause') { await p.keyboard.press('Space'); await sleep(300); F.space.playAfterSecondSpace = await playLabel(); }
    F.close2 = { ms: await clickClose(p), active: await activeText(p) };
    await blur(p);
    const eb = await exportBtn(p).boundingBox();
    await p.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2);
    F.click = { msDialog: await waitFor(p, () => !!document.querySelector('#arrangement-export-title'), null, 3000), msFocusClose: await waitFor(p, focusIs, 'დახურვა', 3000) };
    F.click.ok = F.click.msDialog >= 0 && F.click.msFocusClose >= 0;
    await p.screenshot({ path: `${X.SHOTS}/fresh-click-${vpArg}.png` });
    F.pass = F.enter.ok && F.space.ok && F.click.ok;
    fin(R, S);
    OUT.closehold = R; OUT.freshopen = F; X.save(OUTF, OUT); await ctx.close();
  }
  if (want('cancelhold')) {
    const attempts = [];
    for (let a = 0; a < 5; a++) {
      const R = { attempt: a + 1 };
      const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `cancelhold${a}-${vpArg}`);
      await p.addInitScript(RECORDER);
      await X.setup(p, 3);
      await X.selectFormat(p, 'wav');
      const n0 = S.downloads.length;
      const ebx = await X.exportBtnBox(p); await p.mouse.click(ebx.x, ebx.y);
      let cb = null; const t0 = Date.now();
      while (Date.now() - t0 < 30000) { const l = await X.label(p); if (X.phaseOf(l) === 'render') { cb = await p.locator('[data-testid=arrangement-export-cancel]').boundingBox().catch(() => null); if (cb) { R.labelAtClick = l; break; } } await sleep(5); }
      if (!cb) { R.valid = false; R.reason = 'render phase/cancel not seen'; fin(R, S); attempts.push(R); await ctx.close(); continue; }
      await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
      R.msCancelled = await waitFor(p, (m) => { const s = document.querySelector('[data-testid=arrangement-export-footer] [role=status]'); return !!s && s.textContent === m; }, MSG.cancel, 5000);
      R.msFocusClose = await waitFor(p, focusIs, 'დახურვა', 3000);
      R.probeAfterCancel = await X.probe(p);
      R.valid = R.msCancelled >= 0;
      if (!R.valid) { R.reason = 'CANCELLED status not seen'; fin(R, S); attempts.push(R); await ctx.close(); continue; }
      if (R.msFocusClose < 0) { R.preconditionFailed = 'focus not on დახურვა after mouse cancel'; }
      await holdFromClose(p, R);
      await p.screenshot({ path: `${X.SHOTS}/cancelhold-${vpArg}.png` });
      await sleep(9000);
      R.downloads10s = S.downloads.slice(n0).map((d) => d.name);
      R.after10s = { open: await dlgOpen(p), active: await activeText(p) };
      R.pass = R.pass && !R.preconditionFailed && R.downloads10s.length === 0 && R.after10s.open === false;
      fin(R, S); attempts.push(R); await ctx.close();
      if (R.valid) break;
    }
    OUT.cancelhold = attempts; X.save(OUTF, OUT);
  }
  if (want('openhold')) {
    const R = {};
    const { ctx, p, S } = await bare(b, 'openhold');
    await blur(p);
    await exportBtn(p).focus();
    R.focusedBefore = await activeText(p);
    await evClear(p);
    await p.keyboard.down('Enter');
    R.msDialog = await waitFor(p, () => !!document.querySelector('#arrangement-export-title'), null, 3000);
    R.msFocusClose = await waitFor(p, focusIs, 'დახურვა', 3000);
    for (let i = 0; i < 2; i++) { await sleep(50); await p.keyboard.down('Enter'); }
    await p.keyboard.up('Enter'); await sleep(600);
    R.after = { open: await dlgOpen(p), active: await activeText(p) };
    R.events = await ev(p);
    const kds = R.events.filter((e) => e.type === 'keydown' && e.key === 'Enter');
    R.verdict = {
      first: !!kds[0] && kds[0].repeat === false && kds[0].active === 'Export' && kds[0].defaultPrevented === false,
      repeatsOnClosePrevented: kds.length === 3 && kds.slice(1).every((k) => k.repeat === true && k.active === 'დახურვა' && k.defaultPrevented === true),
      openOnce: R.events.filter((e) => e.type === 'click' && e.target === 'Export').length === 1 && R.events.filter((e) => e.type === 'click' && e.target === 'დახურვა').length === 0,
      stillOpen: R.after.open === true,
    };
    R.pass = Object.values(R.verdict).every(Boolean);
    await p.screenshot({ path: `${X.SHOTS}/openhold-${vpArg}.png` });
    fin(R, S); OUT.openhold = R; X.save(OUTF, OUT); await ctx.close();
  }
  if (want('enteradd')) {
    const R = {};
    const { ctx, p, S } = await bare(b, 'enteradd');
    const statusText = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null);
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
    R.dialogOpen = await dlgOpen(p);
    R.clipsBefore = await clips(p); R.statusBefore = await statusText();
    await o.click(); await sleep(300);
    R.activeAfterRowClick = await activeText(p);
    await evClear(p);
    await p.keyboard.press('Enter'); await sleep(900);
    R.clipsAfter = await clips(p); R.statusAfter = await statusText();
    R.clipLanes = await p.$$eval('[data-clip-id]', (els) => els.map((e) => e.closest('[data-track-id]')?.getAttribute('data-track-id')));
    R.events = await ev(p);
    await p.screenshot({ path: `${X.SHOTS}/enteradd-${vpArg}.png` });
    await blur(p);
    await p.keyboard.press('Control+z'); await sleep(700);
    R.clipsAfterUndo = await clips(p); R.statusAfterUndo = await statusText();
    R.pass = R.clipsAfter === R.clipsBefore + 1 && R.clipsAfterUndo === R.clipsBefore && R.dialogOpen === false;
    fin(R, S); OUT.enteradd = R; X.save(OUTF, OUT); await ctx.close();
  }
  if (want('exportreg')) {
    const R = {};
    const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `exportreg-${vpArg}`);
    await p.addInitScript(RECORDER);
    await X.setup(p, 0);
    await X.selectFormat(p, 'wav');
    const n1 = S.downloads.length;
    R.full = await X.exportFull(p);
    const t0 = Date.now(); while (Date.now() - t0 < 30000 && S.downloads.length - n1 < 1) await sleep(200); await sleep(1500);
    const files = S.downloads.slice(n1);
    R.files = files.map((f) => ({ name: f.name, size: f.size }));
    R.wav = files[0] && files[0].file ? X.wavInfo(files[0].file) : null;
    R.doneProbe = await X.probe(p);
    await p.screenshot({ path: `${X.SHOTS}/exportreg-done-${vpArg}.png` });
    R.focusBeforeEnter = await activeText(p);
    await evClear(p);
    await p.keyboard.press('Enter'); await sleep(600);
    R.afterEnter = { open: await dlgOpen(p), active: await activeText(p), onToolbarExport: await onToolbarExport(p), events: await ev(p) };
    R.pass = files.length === 1 && !!R.wav && R.wav.seconds > 0 && R.wav.nan === 0 && R.afterEnter.open === false && R.afterEnter.onToolbarExport === true;
    fin(R, S); OUT.exportreg = R; X.save(OUTF, OUT); await ctx.close();
  }
  X.save(OUTF, OUT);
  console.log('DONE', vpArg);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
