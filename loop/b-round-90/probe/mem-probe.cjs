// B round 90 planning probe: renderer peak memory (VmHWM) during a 10M WAV export on the published tree 35c8403 (before GATE89-S2).
const X = require('./lib.cjs');
const fs = require('fs');
const { execSync } = require('child_process');
function renderers() {
  const out = execSync("pgrep -f -- '--type=renderer' || true").toString().trim().split(/\s+/).filter(Boolean);
  return out.map((pid) => {
    try {
      const s = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
      const kb = (k) => +(new RegExp(k + ':\\s+(\\d+)').exec(s) || [0, 0])[1];
      return { pid: +pid, rssMB: Math.round(kb('VmRSS') / 1024), hwmMB: Math.round(kb('VmHWM') / 1024) };
    } catch { return null; }
  }).filter(Boolean);
}
(async () => {
  const dups = +(process.argv[2] || 5);
  const b = await X.launch();
  const { ctx, page, S } = await X.newCtx(b, { width: 1440, height: 900 }, `mem-${dups}`);
  const R = { dups, head: execSync('git -C /home/runner/czaba-project/store rev-parse HEAD').toString().trim() };
  R.scope = await X.setup(page, dups);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  await X.sleep(2000);
  R.before = renderers();
  await X.selectFormat(page, 'wav');
  const full = await X.exportFull(page, { timeout: 600000 });
  R.ms = full.ms; R.status = full.final && full.final.status;
  R.files = full.files.map((f) => ({ name: f.name, size: f.size }));
  R.after = renderers();
  for (const f of full.files) { if (f.file) { R.wav = X.wavInfo(f.file); fs.unlinkSync(f.file); } }
  R.errors = S.errors;
  fs.writeFileSync(`${__dirname}/out/mem-${dups}.json`, JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
