// MEM-WAV10: fresh browser, 10M WAV export, renderer VmHWM before/after (GC before each reading)
const X = require('./lib91.cjs'); const M = require('./mem.cjs'); const fs = require('fs'); const { execSync } = require('child_process');
const run = process.argv[2] || '1';
(async () => {
  const others = M.renderers(); // must be empty: nothing else running
  const b = await X.launch();
  const { ctx, page, S } = await X.newCtx(b, { width: 1440, height: 900 }, `mem10-${run}`);
  const R = { run, preexistingRenderers: others, head: execSync('git -C /home/runner/czaba-project/store rev-parse HEAD').toString().trim() };
  R.scope = await X.setup(page, 5);
  const cdp = await ctx.newCDPSession(page);
  await X.selectFormat(page, 'wav');
  await cdp.send('HeapProfiler.collectGarbage'); await X.sleep(2000);
  R.beforeAll = M.renderers(); R.before = M.main(R.beforeAll);
  const full = await X.exportFull(page, { timeout: 600000 });
  R.ms = full.ms; R.status = full.final && full.final.status; R.alert = full.final && full.final.alert;
  R.files = full.files.map((f) => ({ name: f.name, size: f.size }));
  await cdp.send('HeapProfiler.collectGarbage'); await X.sleep(500);
  R.afterAll = M.renderers(); R.after = M.main(R.afterAll);
  R.dHWM = R.after.hwmMB - R.before.hwmMB; R.samePid = R.after.pid === R.before.pid;
  for (const f of full.files) { if (f.file) { R.wav = X.wavInfo(f.file); fs.unlinkSync(f.file); } }
  R.errors = S.errors; R.noise = S.noise; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
  X.save(`mem10-run${run}.json`, R);
  console.log(JSON.stringify({ run, before: R.before, after: R.after, dHWM: R.dHWM, samePid: R.samePid, ms: R.ms, status: R.status, alert: R.alert, files: R.files, wav: R.wav, errors: R.errors, pre: others }, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
