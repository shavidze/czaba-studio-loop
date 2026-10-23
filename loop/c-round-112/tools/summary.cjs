// node summary.cjs <tags...> [--max 0.0301 --tEnd 6.008] [--rf]
const fs = require('fs');
const path = require('path');
const { analyze, rf53 } = require('./ana.cjs');
const args = process.argv.slice(2);
const opt = { maxLimit: 0.1, tEnd: Infinity };
const tags = [];
let rf = false, outName = null;
for (let k = 0; k < args.length; k++) {
  if (args[k] === '--max') opt.maxLimit = +args[++k];
  else if (args[k] === '--tEnd') opt.tEnd = +args[++k];
  else if (args[k] === '--rf') rf = true;
  else if (args[k] === '--out') outName = args[++k];
  else tags.push(args[k]);
}
const rows = [];
for (const t of tags) {
  const f = path.join(__dirname, '..', 'runs', t + '.json');
  if (!fs.existsSync(f)) { console.log(t, 'missing'); continue; }
  const run = JSON.parse(fs.readFileSync(f));
  if (run.error) { console.log(t, 'ERROR', run.error); rows.push({ tag: t, error: run.error }); continue; }
  const a = analyze(run, opt);
  if (rf) a.rf53 = rf53(run);
  a.net = run.net;
  rows.push(a);
  const ex = a.stallExcluded, raw = a.raw;
  console.log([t, a.valid ? 'valid' : 'INVALID ' + a.invalidWhy.join(';'), a.pass === null ? '-' : a.pass ? 'PASS' : 'FAIL', `ex med ${ex.median} max ${ex.max}@${ex.maxAtPos}${ex.maxInClip2 ? '(clip2)' : ''}`, `raw med ${raw.median} max ${raw.max}`, `CORR ${a.skewCorrected.pass ? 'pass' : 'fail'} med ${a.skewCorrected.stallExcluded.median} max ${a.skewCorrected.stallExcluded.max}@${a.skewCorrected.stallExcluded.maxAtPos}`, `stall ${a.stallCoveragePct}%`, `appLoaf ${a.appLoafs.length}`, `loafs ${a.loafsInPlay} max ${a.loafMaxMs}`, `drop ${a.dropRatio}`, `rate≠1 ${a.rate.shareNe1} [${a.rate.min},${a.rate.max}] esc ${a.rate.escalations}`, `dock ${JSON.stringify(a.dock)}`, `skew ${a.boundarySkew.samples.length}`, `panel ${a.pre && a.pre.panelH} sel ${a.pre && a.pre.selected}`, rf ? `RF5-3 ${a.rf53.pass ? 'PASS' : 'FAIL'} play@${a.rf53.playIssueRelStartAtMs} win ${a.rf53.window} paused ${a.rf53.pausedUntilPlay} pre ${a.rf53.preStartAdvanceS} d ${a.rf53.drift0_100}/${a.rf53.drift100_300}` : ''].join(' | '));
}
if (outName) fs.writeFileSync(path.join(__dirname, '..', 'out', outName), JSON.stringify(rows, null, 1));
