// C round 127 main session: node main.cjs <1440|1280> <tag>
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const TAG = process.argv[3] || 'r1';
const C = require('./c127lib.cjs'); const { X, L, sleep } = C;
const D6 = require('./d6fns.cjs');
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {} };
const net = [];
const out = (k, v) => { res.rows[k] = v; C.save(`main-${W}-${TAG}.json`, { ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise, downloads: n.downloads.map((d) => d.name) })) }); };
(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `main-${W}-${TAG}`, net, { extraInit: C.obsInit });
    await p.mouse.move(2, 2); await sleep(300);
    const s0 = { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container') };
    await C.shot(p, `S0-${W}-${TAG}.png`);
    out('S0', s0);
    const s1Steps = await D6.buildS1(p);
    const s1 = { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container'), steps: s1Steps.map((s) => s.step) };
    await C.shot(p, `S1-${W}-${TAG}.png`);
    out('S1', s1);
    await C.openDlg(p); await p.mouse.move(2, 2); await sleep(400);
    const s2 = { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, 'body') };
    const dS2 = await C.dump(p);
    await C.shot(p, `S2-idle-range-${W}-${TAG}.png`);
    const roleClose = await p.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).count();
    out('S2', { ...s2, dump: dS2, roleCloseCount: roleClose });
    const tw = await C.tabWalk(p, 7);
    await p.keyboard.press('Escape'); await sleep(500);
    const escClosed = !(await C.isOpen(p));
    const escFocus = await C.focusDesc(p);
    out('KEYS_range', { tw, escClosed, escFocus });
    // project WAV
    const run = await C.runExport(p, log, `run-${W}-${TAG}-project`, { format: 'wav', scope: 'project' });
    run.wav = run.files.map(C.wavInfo);
    await C.shot(p, `RUN-done-${W}-${TAG}.png`);
    run.roleCloseCountDone = await p.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).count();
    const closedAfter = await C.closeByFooter(p);
    run.closedByFooter = !closedAfter; run.focusAfterClose = await C.focusDesc(p);
    out('RUN_project_wav', run);
    // range WAV (2 s range at S fixture)
    const rr = await C.runExport(p, log, `run-${W}-${TAG}-range`, { format: 'wav', scope: 'range' });
    rr.wav = rr.files.map(C.wavInfo);
    await C.shot(p, `RANGE2s-done-${W}-${TAG}.png`);
    await C.closeByFooter(p);
    out('RUN_range_wav', rr);
    // cancel WAV during render
    const cw = await C.runExport(p, log, `run-${W}-${TAG}-cancel`, { format: 'wav', scope: 'project', cancelWhen: () => !!document.querySelector('[data-testid=arrangement-export-progress]') });
    await C.shot(p, `CANCEL-wav-${W}-${TAG}.png`);
    cw.roleCloseCountCancel = await p.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).count();
    await C.closeByFooter(p);
    cw.focusAfterClose = await C.focusDesc(p);
    out('CANCEL_wav', cw);
    if (W === 1440) {
      // MP3
      const m = await C.runExport(p, log, `run-${W}-${TAG}-mp3`, { format: 'mp3', scope: 'project', waitMs: 200000 });
      await C.shot(p, `MP3-done-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      out('MP3', m);
      const bb = await C.runExport(p, log, `run-${W}-${TAG}-both`, { format: 'both', scope: 'project', waitMs: 200000 });
      bb.wav = bb.files.filter((f) => /\.wav$/.test(f)).map(C.wavInfo);
      await C.shot(p, `BOTH-done-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      out('BOTH', bb);
      // MP3 cancel during encode
      const mc = await C.runExport(p, log, `run-${W}-${TAG}-mp3cancel`, { format: 'mp3', scope: 'project', waitMs: 60000, cancelWhen: () => { const pr = document.querySelector('[data-testid=arrangement-export-progress]'); return !!pr && /Creating MP3/.test(pr.getAttribute('aria-valuetext') || ''); } });
      await C.shot(p, `CANCEL-mp3-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      mc.focusAfterClose = await C.focusDesc(p);
      out('CANCEL_mp3', mc);
      // Master mute
      await L.blur(p);
      await p.click('[aria-label="Master Mute"]'); await sleep(300);
      const mutePressed = await p.evaluate(() => document.querySelector('[aria-label="Master Mute"]').getAttribute('aria-pressed'));
      await C.openDlg(p);
      const muteDump = await C.dump(p);
      await C.shot(p, `MUTE-dialog-${W}-${TAG}.png`);
      const mr = await C.runExport(p, log, `run-${W}-${TAG}-muted`, { format: 'wav', scope: 'project' });
      mr.wav = mr.files.map(C.wavInfo);
      await C.shot(p, `MUTE-done-${W}-${TAG}.png`);
      await C.closeByFooter(p);
      await L.blur(p); await p.click('[aria-label="Master Mute"]'); await sleep(300);
      out('MUTE', { mutePressed, muteDump, mr });
      // hold-Enter on footer Close (idle) and on toolbar Export
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
    }
  } catch (e) { res.error = String(e.stack || e); out('error', res.error); }
  out('end', new Date().toISOString());
  console.log(JSON.stringify({ err: res.error, rows: Object.keys(res.rows), net: X.netOk(net) }));
  await b.close();
})();
