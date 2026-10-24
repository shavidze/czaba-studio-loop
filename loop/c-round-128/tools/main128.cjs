// C round 128 main session: node main128.cjs <1440|1280> <tag>
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const TAG = process.argv[3] || 'r1';
const C = require('./c127lib.cjs'); const { X, L, sleep } = C;
const D6 = require('./d6fns.cjs');
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {} };
const net = [];
const out = (k, v) => { res.rows[k] = v; C.save(`main128-${W}-${TAG}.json`, { ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise, downloads: n.downloads.map((d) => d.name) })) }); };

async function census(p) {
  const dlg = p.getByRole('dialog');
  const cnt = async (name) => dlg.getByRole('button', { name, exact: true }).count();
  const r = { Close: await cnt('Close'), Done: await cnt('Done'), Cancel: await cnt('Cancel'), 'Export WAV': await cnt('Export WAV'), 'Rendering…': await cnt('Rendering…') };
  r.dom = await p.evaluate(() => {
    const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]');
    return [...d.querySelectorAll('button')].filter((b) => b.offsetParent !== null || b.getClientRects().length).map((b) => ({ name: b.getAttribute('aria-label') ?? b.textContent.trim(), aria: b.getAttribute('aria-label'), text: b.textContent.trim(), disabled: b.disabled, inFooter: !!b.closest('[data-testid=arrangement-export-footer]') }));
  });
  r.names = r.dom.map((b) => b.name);
  r.unique = new Set(r.names).size === r.names.length;
  try { r.aria = await dlg.ariaSnapshot(); } catch (e) { r.aria = 'ERR ' + e; }
  const ariaBtns = (r.aria.match(/- button "([^"]*)"/g) || []).map((s) => s.replace(/^- button "|"$/g, ''));
  r.ariaButtonNames = ariaBtns;
  r.ariaUnique = new Set(ariaBtns).size === ariaBtns.length;
  const done = r.dom.find((b) => b.inFooter && b.text === 'Done'); const x = r.dom.find((b) => b.aria === 'Close');
  r.doneDisabled = done ? done.disabled : null; r.xDisabled = x ? x.disabled : null;
  return r;
}

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `main128-${W}-${TAG}`, net, { extraInit: C.obsInit });
    await p.mouse.move(2, 2); await sleep(300);
    out('S0', { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container') });
    await C.shot(p, `S0-${W}-${TAG}.png`);
    const s1Steps = await D6.buildS1(p);
    out('S1', { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container'), steps: s1Steps });
    await C.shot(p, `S1-${W}-${TAG}.png`);
    await C.openDlg(p);
    const openFocus = await C.focusDesc(p);
    await p.mouse.move(2, 2); await sleep(400);
    const s2 = { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, 'body') };
    const dS2 = await C.dump(p);
    await C.shot(p, `S2-idle-range-${W}-${TAG}.png`);
    const idle = await census(p);
    out('S2', { ...s2, dump: dS2, openFocus, idleCensus: idle });
    const tw = await C.tabWalk(p, 7);
    await p.keyboard.press('Escape'); await sleep(500);
    out('KEYS_range', { tw, escClosed: !(await C.isOpen(p)), escFocus: await C.focusDesc(p) });
    // project scope note with loop on (W2 b, 4.000 s range loop state from S1)
    await C.openDlg(p);
    await p.click('[data-testid=arrangement-export-scope-project]'); await sleep(300);
    const projNote = await C.dump(p);
    await C.shot(p, `S2-loop-project-${W}-${TAG}.png`);
    await p.click('[data-testid=arrangement-export-scope-range]').catch(() => {}); await sleep(300);
    const rangeNote = await C.dump(p);
    out('LOOP_NOTES_S1', { projectText: projNote.text, rangeText: rangeNote.text, georgProject: projNote.net, georgRange: rangeNote.net });
    // render census during a project WAV render (REG-WAV)
    await p.click('[data-testid=arrangement-export-format-wav]');
    await p.click('[data-testid=arrangement-export-scope-project]'); await sleep(200);
    const n0 = log.downloads.length;
    await C.footerExportBtn(p).click();
    let rc = null; const t0 = Date.now();
    while (Date.now() - t0 < 30000) { if (await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-progress]'))) { rc = await census(p); rc.focus = await C.focusDesc(p); rc.atMs = Date.now() - t0; break; } await sleep(30); }
    if (rc) await C.shot(p, `RENDER-census-${W}-${TAG}.png`);
    const progressStillAfterCensus = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-progress]'));
    while (Date.now() - t0 < 240000) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(200); }
    await sleep(1500);
    const post = await C.dump(p);
    const doneCensus = await census(p);
    const doneFocus = await C.focusDesc(p);
    await C.shot(p, `RUN-done-${W}-${TAG}.png`);
    const files = [];
    for (const rec of log.downloads.slice(n0)) { if (!rec.file) continue; const dst = require('path').join(L.OUT, `regwav-${W}-${TAG}-${rec.name}`); require('fs').renameSync(rec.file, dst); files.push(dst); }
    const closedOpen = await C.closeByFooter(p);
    out('RENDER_REGWAV', { renderCensus: rc, progressStillAfterCensus, doneCensus, doneFocus, status: post.status, georg: post.net, wav: files.map(C.wavInfo), names: log.downloads.slice(n0).map((d) => d.name), closedByDone: !closedOpen, focusAfterDone: await C.focusDesc(p) });
    // WAV cancel during render (c)
    const cw = await C.runExport(p, log, `cancel-${W}-${TAG}`, { format: 'wav', scope: 'project', cancelWhen: () => !!document.querySelector('[data-testid=arrangement-export-progress]') });
    await C.shot(p, `CANCEL-wav-${W}-${TAG}.png`);
    const cancelCensus = await census(p);
    await C.closeByFooter(p);
    out('CANCEL_wav', { cancelled: cw.cancelled, status: cw.post.status, georg: cw.post.net, files: cw.recs, duringRenderClose: cw.duringRender && cw.duringRender.closeBtns, cancelCensus, focusAfterClose: await C.focusDesc(p) });
    if (W === 1440) {
      const mc = await C.runExport(p, log, `mp3cancel-${W}-${TAG}`, { format: 'mp3', scope: 'project', waitMs: 90000, cancelWhen: () => { const pr = document.querySelector('[data-testid=arrangement-export-progress]'); return !!pr && /Creating MP3/.test(pr.getAttribute('aria-valuetext') || ''); } });
      await C.shot(p, `CANCEL-mp3-${W}-${TAG}.png`);
      const mpCensus = await census(p);
      await C.closeByFooter(p);
      out('CANCEL_mp3', { cancelled: mc.cancelled, status: mc.post.status, georg: mc.post.net, files: mc.recs, mpCensus, obsTail: mc.obs.slice(-6) });
    }
    // hold-Enter on footer Done (idle) and toolbar Export
    await p.evaluate(() => { window.__kd = []; window.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.__kd.push({ repeat: e.repeat, prevented: e.defaultPrevented, target: (e.target.getAttribute('data-testid') || e.target.textContent || '').trim().slice(0, 20) }); }); });
    await C.openDlg(p);
    const initFocus = await C.focusDesc(p);
    await C.footerClose(p).focus();
    await p.keyboard.down('Enter'); await sleep(80);
    const afterFirst = await C.isOpen(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await sleep(80); }
    await p.keyboard.up('Enter'); await sleep(1200);
    const holdClose = { initFocus, afterFirstOpen: afterFirst, openAfter: await C.isOpen(p), focus: await C.focusDesc(p), kd: await p.evaluate(() => window.__kd.splice(0)) };
    await L.blur(p);
    const tb = p.getByRole('button', { name: 'Export', exact: true });
    await tb.focus();
    const dl0 = log.downloads.length;
    await p.keyboard.down('Enter'); await sleep(80);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await sleep(80); }
    await p.keyboard.up('Enter'); await sleep(1200);
    const holdExport = { open: await C.isOpen(p), focus: await C.focusDesc(p), rendering: await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-progress]')), downloads: log.downloads.length - dl0, kd: await p.evaluate(() => window.__kd.splice(0)) };
    if (await C.isOpen(p)) await p.keyboard.press('Escape');
    await sleep(400);
    out('HOLD_ENTER', { holdClose, holdExport });
  } catch (e) { res.error = String(e.stack || e); out('error', res.error); }
  out('end', new Date().toISOString());
  console.log(JSON.stringify({ err: res.error, rows: Object.keys(res.rows), net: X.netOk(net) }));
  await b.close();
})();
