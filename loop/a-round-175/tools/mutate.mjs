import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-175/mutations';
const C = 'app/components/arrangement/';
const T = 'app/lib/arrangement/__tests__/';
const AFF = `${T}affordance-colour-ui.test.tsx`;
const LAYOUT = `${T}track-layout.test.tsx`;

const mutations = [
  ['m248', `${C}ArrangementLane.tsx`, 'h-1 min-w-0 flex-1 touch-none accent-foreground', 'h-1 min-w-0 flex-1 touch-none accent-brand', [AFF]],
  ['m249', `${C}ArrangementTransport.tsx`, 'w-20 accent-foreground', 'w-20 accent-brand', [AFF]],
  ['m250', `${C}ArrangementClip.tsx`, 'border border-foreground bg-background', 'border border-foreground bg-brand', [AFF]],
  ['m251', `${C}ArrangementClip.tsx`, 'left-0 z-20 w-2 cursor-ew-resize hover:bg-foreground/50', 'left-0 z-20 w-2 cursor-ew-resize hover:bg-accent/60', [AFF]],
  ['m252', `${C}ArrangementLoopBrace.tsx`, 'right-0 w-2 cursor-ew-resize hover:bg-foreground/50', 'right-0 w-2 cursor-ew-resize hover:bg-accent/60', [AFF]],
  ['m253', `${C}ArrangementLane.tsx`, "isHeightDragging && 'bg-foreground/50'", "isHeightDragging && 'bg-accent/60'", [AFF]],
  ['m254', `${C}studio-scrollbar.ts`, '-thumb:hover]:bg-foreground', '-thumb:hover]:bg-brand', [AFF]],
  ['m255', `${C}ArrangementGroupHeader.tsx`, "'border-outline-hover bg-foreground/25'", "'border-outline-hover bg-brand/25'", [AFF]],
  ['m256', `${C}ArrangementGroupHeader.tsx`, "'border-brand bg-brand/60'", "'border-brand bg-foreground/25'", [AFF]],
  ['m257', `${C}ArrangementLane.tsx`, 'cursor-row-resize touch-none hover:bg-foreground/50', 'cursor-row-resize touch-none hover:bg-accent/60', [AFF, LAYOUT]],
];

const sha = (text) => createHash('sha256').update(text).digest('hex');
const only = process.argv[2];

for (const [id, file, from, to, tests] of mutations) {
  if (only && only !== id) continue;
  const original = readFileSync(file, 'utf8');
  const startSha = sha(original);
  const count = original.split(from).length - 1;
  const result = { id, file, from, to, occurrencesOfFrom: count, tests: {} };
  if (count !== 1) {
    result.error = `expected exactly 1 occurrence, found ${count}`;
  } else {
    writeFileSync(file, original.replace(from, to));
    try {
      for (const test of tests) {
        const json = `/tmp/a175-${id}-${test.split('/').pop()}.json`;
        try {
          execFileSync('npx', ['vitest', 'run', test, '--reporter=json', `--outputFile=${json}`], {
            stdio: 'ignore',
          });
        } catch {}
        const report = JSON.parse(readFileSync(json, 'utf8'));
        const failed = report.testResults
          .flatMap((suite) => suite.assertionResults)
          .filter((a) => a.status !== 'passed')
          .map((a) => a.title.split(':')[0]);
        result.tests[test] = {
          passed: report.numPassedTests,
          total: report.numTotalTests,
          failed,
        };
      }
    } finally {
      writeFileSync(file, original);
    }
  }
  result.restoredShaOk = sha(readFileSync(file, 'utf8')) === startSha;
  writeFileSync(`${OUT}/${id}.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(id, JSON.stringify(result.tests), result.error ?? '', 'restored', result.restoredShaOk);
}
