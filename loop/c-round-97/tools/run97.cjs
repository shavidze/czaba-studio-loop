// C round 97: HOLD-ENTER, FRESH-ENTER-CLOSES, CANCEL-CLASS, CX-REG, DONE-REG, ESC-REG (+ OPEN-HOLD/SPACE-REG at 1280, HOLD-ENTER-MP3 at 1440)
// Real keyboard/mouse input only (page.keyboard / page.mouse). Fresh incognito context per scenario, no credentials.
const X = require('./lib97.cjs');
const { sleep, blur, MSG } = X;
const vpArg = process.argv[2] || '1280x720';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const [w, h] = vpArg.split('x').map(Number);
const want = (n) => !only || only.includes(n);

const RECORDER = () => {
  if (window.__c97kd) return;
  window.__c97kd = [];
  const txt = (a) => (a ? (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 30) || a.tagName) : null);
  window.addEventListener('keydown', (e) => { window.__c97kd.push({ t: Math.round(performance.now()), key: e.key, repeat: e.repeat, active: txt(document.activeElement), trusted: e.isTrusted }); }, true);
  window.addEventListener('keydown', (e) => { const r = window.__c97kd.at(-1); if (r) r.defaultPrevented = e.defaultPrevented; }, false);
  window.addEventListener('click', (e) => { window.__c97kd.push({ t: Math.round(performance.now()), click: txt(e.target.closest ? e.target.closest('button') || e.target : e.target), detail: e.detail }); }, true);
};
const kd = (p) => p.evaluate(() => window.__c97kd.slice());
const kdClear = (p) => p.evaluate(() => { window.__c97kd.length = 0; });
const activeText = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 30) || a.tagName) : null; });
const dlgOpen = (p) => p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
async function waitFor(p, fn, arg, ms = 5000) { const t = Date.now(); while (Date.now() - t < ms) { if (await p.evaluate(fn, arg)) return Date.now() - t; await sleep(5); } return -1; }
const focusIs = (txt) => (t) => { const a = document.activeElement; return !!a && (a.textContent || '').trim() === t; };

async function session(b, tag) {
  const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `${tag}-${vpArg}`);
  await p.addInitScript(RECORDER);
  await X.setup(p, 3);
  return { ctx, p, S };
}
// mouse-click the primary export button, then wait until the Cancel button exists (render running)
async function startExport(p) {
  const eb = await X.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
  const t0 = Date.now(); while (Date.now() - t0 < 30000 && !(await p.$('[data-testid=arrangement-export-cancel]'))) await sleep(5);
  return { exportText: eb.text, cancelAfterMs: Date.now() - t0 };
}
// real Tab presses until focus is on Cancel (max 14)
async function tabToCancel(p) {
  const path = [];
  for (let i = 0; i < 14; i++) {
    const a = await p.evaluate(() => document.activeElement?.dataset?.testid || (document.activeElement?.textContent || '').trim().slice(0, 20));
    if (a === 'arrangement-export-cancel') return { ok: true, path };
    await p.keyboard.press('Tab'); await sleep(25); path.push(await activeText(p));
  }
  return { ok: (await p.evaluate(() => document.activeElement?.dataset?.testid)) === 'arrangement-export-cancel', path };
}
async function waitDl(S, n0, ms) { await sleep(ms); return S.downloads.slice(n0).map((d) => d.name); }

async function holdEnter(b, fmt, tag) {
  const R = { fmt };
  const { ctx, p, S } = await session(b, tag);
  await X.selectFormat(p, fmt);
  const n0 = S.downloads.length;
  R.start = await startExport(p);
  R.tab = await tabToCancel(p);
  R.labelAtEnter = await X.label(p);
  R.before = await X.probe(p);
  await kdClear(p);
  await p.keyboard.down('Enter');
  R.msToFocusClose = await waitFor(p, focusIs('დახურვა'), 'დახურვა', 3000);
  R.afterFirst = await X.probe(p);
  for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await sleep(50); }
  await p.keyboard.up('Enter'); await sleep(400);
  R.afterRepeats = await X.probe(p);
  R.keydowns = await kd(p);
  await p.screenshot({ path: `${X.SHOTS}/${tag}-${vpArg}.png` });
  R.downloads10s = await waitDl(S, n0, 10000);
  R.after10s = await X.probe(p);
  return { R, ctx, p, S };
}

(async () => {
  const b = await X.launch(); const OUT = { vp: vpArg, when: new Date().toISOString() };
  // HOLD-ENTER + FRESH-ENTER-CLOSES (Enter press)
  if (want('hold')) {
    const { R, ctx, p, S } = await holdEnter(b, 'wav', 'hold');
    await kdClear(p);
    await p.keyboard.press('Enter'); await sleep(500);
    R.fresh = { open: await dlgOpen(p), active: await activeText(p), activeIsToolbarExport: await p.evaluate(() => { const a = document.activeElement; return !!a && a.tagName === 'BUTTON' && a.textContent.trim() === 'Export' && !a.closest('[role=dialog]'); }), keydowns: await kd(p) };
    R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.hold = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  // CANCEL-CLASS + CX-REG (mouse cancel) + FRESH click close + DONE-REG (second WAV export to end, Enter closes)
  if (want('cx')) {
    const R = {};
    const { ctx, p, S } = await session(b, 'cx');
    await X.selectFormat(p, 'wav');
    const n0 = S.downloads.length;
    R.start = await startExport(p);
    R.classDuring = await p.evaluate(() => {
      const c = document.querySelector('[data-testid=arrangement-export-cancel]');
      const cl = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((x) => x.textContent.trim() === 'დახურვა');
      return { label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
        cancel: c && { disabledAttr: c.hasAttribute('disabled'), cls: c.className, hasDisabledToken: /(^|\s)disabled:/.test(c.className), opacity: getComputedStyle(c).opacity },
        close: cl && { disabledAttr: cl.hasAttribute('disabled'), cls: cl.className, opacity: getComputedStyle(cl).opacity } };
    });
    const foot = await p.$('[data-testid=arrangement-export-footer]');
    if (foot) await foot.screenshot({ path: `${X.SHOTS}/cancel-class-footer-${vpArg}.png` });
    const cb = await p.locator('[data-testid=arrangement-export-cancel]').boundingBox();
    R.labelAtClick = await X.label(p);
    await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(400);
    R.afterCancel = await X.probe(p);
    R.classAfter = await p.evaluate(() => { const cl = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((x) => x.textContent.trim() === 'დახურვა'); return { disabledAttr: cl.hasAttribute('disabled'), opacity: getComputedStyle(cl).opacity }; });
    R.downloads10s = await waitDl(S, n0, 10000);
    R.after10s = await X.probe(p);
    // mouse click on Close after a cancel closes the dialog
    const closeBox = await p.getByRole('button', { name: 'დახურვა', exact: true }).boundingBox();
    await p.mouse.click(closeBox.x + closeBox.width / 2, closeBox.y + closeBox.height / 2); await sleep(500);
    R.clickClose = { open: await dlgOpen(p), active: await activeText(p) };
    // DONE-REG: reopen, run a WAV export to the end
    await X.openDlg(p); await X.selectFormat(p, 'wav');
    const n1 = S.downloads.length;
    R.full = await X.exportFull(p);
    const t0 = Date.now(); while (Date.now() - t0 < 30000 && S.downloads.length - n1 < 1) await sleep(200); await sleep(1500);
    const files = S.downloads.slice(n1);
    R.fullFiles = files.map((f) => ({ name: f.name, size: f.size }));
    R.wav = files[0] && files[0].file ? X.wavInfo(files[0].file) : null;
    R.doneProbe = await X.probe(p);
    await p.screenshot({ path: `${X.SHOTS}/done-${vpArg}.png` });
    await kdClear(p);
    await p.keyboard.press('Enter'); await sleep(500);
    R.doneEnter = { open: await dlgOpen(p), active: await activeText(p), keydowns: await kd(p) };
    R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.cx = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  // ESC-REG
  if (want('esc')) {
    const R = {};
    const { ctx, p, S } = await session(b, 'esc');
    await X.selectFormat(p, 'wav');
    const n0 = S.downloads.length;
    R.start = await startExport(p);
    R.labelAtEsc = await X.label(p);
    await p.keyboard.press('Escape'); await sleep(300);
    R.afterEscDuring = await X.probe(p);
    const cb = await p.locator('[data-testid=arrangement-export-cancel]').boundingBox().catch(() => null);
    if (cb) { await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(400); }
    R.afterCancel = await X.probe(p);
    await p.keyboard.press('Escape'); await sleep(500);
    R.afterEscCancelled = { open: await dlgOpen(p), active: await activeText(p), toolbarExport: await p.evaluate(() => { const a = document.activeElement; return !!a && a.tagName === 'BUTTON' && a.textContent.trim() === 'Export' && !a.closest('[role=dialog]'); }) };
    R.downloads10s = await waitDl(S, n0, 10000);
    R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.esc = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  // OPEN-HOLD (1280)
  if (want('openhold')) {
    const R = {};
    const { ctx, p, S } = await session(b, 'openhold');
    await p.keyboard.press('Escape'); await sleep(500); await blur(p);
    await p.getByRole('button', { name: 'Export', exact: true }).focus();
    R.focusedBefore = await activeText(p);
    await kdClear(p);
    await p.keyboard.down('Enter');
    R.msDialog = await waitFor(p, () => !!document.querySelector('#arrangement-export-title'), null, 3000);
    R.msFocusClose = await waitFor(p, focusIs('დახურვა'), 'დახურვა', 3000);
    for (let i = 0; i < 2; i++) { await p.keyboard.down('Enter'); await sleep(50); }
    await p.keyboard.up('Enter'); await sleep(400);
    R.after = { open: await dlgOpen(p), active: await activeText(p) };
    R.keydowns = await kd(p);
    await p.screenshot({ path: `${X.SHOTS}/openhold-${vpArg}.png` });
    R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.openhold = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  // SPACE-REG (1280)
  if (want('space')) {
    const R = {};
    const { ctx, p, S } = await session(b, 'space');
    await X.selectFormat(p, 'wav');
    const n0 = S.downloads.length;
    R.start = await startExport(p);
    R.tab = await tabToCancel(p);
    R.labelAtSpace = await X.label(p);
    await kdClear(p);
    await p.keyboard.press('Space'); await sleep(400);
    R.afterSpaceCancel = await X.probe(p);
    R.downloads10s = await waitDl(S, n0, 10000);
    await p.keyboard.press('Space'); await sleep(500);
    R.afterSpaceClose = { open: await dlgOpen(p), active: await activeText(p) };
    R.keydowns = await kd(p);
    R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.space = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  // HOLD-ENTER-MP3 (1440)
  if (want('mp3')) {
    const { R, ctx, p, S } = await holdEnter(b, 'mp3', 'holdmp3');
    R.unpkg = S.unpkg.slice(); R.errors = S.errors.slice(); R.forbidden = S.forbidden.slice(); R.auth = S.authHeaders.slice();
    OUT.mp3 = R; X.save(`run97-${vpArg}.json`, OUT); await ctx.close();
  }
  X.save(`run97-${vpArg}.json`, OUT);
  console.log('DONE', vpArg);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
