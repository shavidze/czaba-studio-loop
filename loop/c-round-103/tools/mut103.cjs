// C round 103 independent fail-before + mutations m1,m3,m5,m6 (+control, CU10 3x) in scratch c-round-103/mut
const fs = require('fs'); const { execFileSync } = require('child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop', M = `${L}/c-round-103/mut`, S = '/home/runner/czaba-project/store', SNAP = `${L}/b-round-102-r103-snapshots`;
const C = 'app/lib/arrangement/export-wav.client.ts', T = 'app/lib/arrangement/__tests__/export-wav.test.ts';
const CU = 'app/lib/arrangement/__tests__/export-cancel-ui.test.tsx', CTX = 'app/contexts/ArrangementContext.tsx';
for (const f of [C, T, CU, CTX]) fs.copyFileSync(`${S}/${f}`, `${M}/${f}`);
const cur = { [C]: fs.readFileSync(`${S}/${C}`, 'utf8'), [CTX]: fs.readFileSync(`${S}/${CTX}`, 'utf8') };
const rep = (f, a, b) => { const s = cur[f]; if (s.split(a).length !== 2) return null; return s.replace(a, b); };
const ctxLines = cur[CTX].split('\n');
const m6 = (ctxLines[2914].trim() === 'if (signal.aborted) {' && ctxLines[2915].trim() === 'return;' && ctxLines[2916].trim() === '}') ? [...ctxLines.slice(0, 2914), ...ctxLines.slice(2917)].join('\n') : null;
const variants = [
  ['control', C, cur[C], T, 1],
  ['failBefore', C, fs.readFileSync(`${SNAP}/export-wav.client.ts`, 'utf8'), T, 1],
  ['m1_noTimer', C, rep(C, 'stallTimer = window.setTimeout(handleStall, ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS);', ''), T, 1],
  ['m3_completeNoClear', C, rep(C, "if (message.type === 'complete') {\n        detachWorker();", "if (message.type === 'complete') {\n        signal?.removeEventListener('abort', handleAbort);\n        worker.onmessage = null;\n        worker.terminate();"), T, 1],
  ['m5_dropErrorText', C, rep(C, 'fail(message.message);', 'fail();'), T, 1],
  ['cuControl', CTX, cur[CTX], CU, 3],
  ['m6_noPreDownloadAbortCheck', CTX, m6, CU, 3],
];
const out = {};
for (const [k, f, src, test, n] of variants) {
  if (src === null) { out[k] = 'MUTATION-NOT-APPLIED'; console.log(k, out[k]); continue; }
  fs.writeFileSync(`${M}/${f}`, src);
  out[k] = [];
  for (let i = 0; i < n; i++) {
    let o; try { o = execFileSync('npx', ['vitest', 'run', '--reporter=json', test], { cwd: M, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { o = e.stdout; }
    const d = JSON.parse(o.slice(o.indexOf('{')));
    const red = []; for (const t of d.testResults) for (const a of t.assertionResults) if (a.status === 'failed') red.push(a.title.slice(0, 40) + ' :: ' + (a.failureMessages[0] || '').split('\n')[0].slice(0, 140));
    out[k].push({ passed: d.numPassedTests, failed: d.numFailedTests, red });
    console.log(k, i + 1, d.numPassedTests, d.numFailedTests, JSON.stringify(red));
  }
  fs.writeFileSync(`${M}/${f}`, cur[f]);
}
fs.writeFileSync(`${L}/c-round-103/out/mut103.json`, JSON.stringify(out, null, 1));
