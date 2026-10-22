// MEM-CANCEL (GATE90-S1 evidence): mode cancel|control, VmRSS of the page renderer, GC before every reading
const X = require('./lib91.cjs'); const M = require('./mem.cjs');
const mode = process.argv[2]; const pair = process.argv[3];
(async () => {
  const pre = M.renderers();
  const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: 1440, height: 900 }, `memc-${mode}-${pair}`);
  const cdp = await ctx.newCDPSession(page); const gc = async () => { await cdp.send('HeapProfiler.collectGarbage'); await X.sleep(2000); };
  const R = { mode, pair, pre: pre.length }; R.scope = await X.setup(page, 2); await X.selectFormat(page, 'wav');
  const w = await X.exportFull(page); R.warm = { status: w.final.status, files: w.files.map((f) => f.name) };
  await gc(); R.R0 = M.main(M.renderers());
  R.steps = [];
  for (let i = 0; i < 3; i++) {
    if (mode === 'cancel') { const c = await X.exportAndCancel(page, 'render'); R.steps.push({ valid: c.valid, lbl: c.clickProbe && c.clickProbe.label, status: c.after.status, dl: c.downloadsIn15s }); }
    else { const f = await X.exportFull(page); R.steps.push({ status: f.final.status, files: f.files.map((x) => x.name) }); await X.sleep(1000); }
  }
  await gc(); await X.sleep(15000); await gc(); R.R1 = M.main(M.renderers());
  R.delta = R.R1.rssMB - R.R0.rssMB; R.samePid = R.R0.pid === R.R1.pid;
  R.allValid = mode !== 'cancel' || R.steps.every((s) => s.valid && /^რენდერი · /.test(s.lbl || '') && s.dl.length === 0);
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg.length;
  for (const d of S.downloads) if (d.file) require('fs').unlinkSync(d.file);
  X.save(`memc-${mode}-${pair}.json`, R); console.log(JSON.stringify({ mode, pair, R0: R.R0, R1: R.R1, delta: R.delta, samePid: R.samePid, allValid: R.allValid, steps: R.steps, errors: R.errors, pre: R.pre }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
