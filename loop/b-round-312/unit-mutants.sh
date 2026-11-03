#!/usr/bin/env bash
# Round 313 unit mutants on injectedLoafEntries. Run from a SCRATCH store copy (never store/) that has
# vitest.perf-scratch.config.ts (test.include: ['perf/**/*.test.ts']). Usage: bash <loop>/b-round-312/unit-mutants.sh > out.txt
set -u
cp perf/lib/report.ts /tmp/report.ts.mut-orig
run() {
  cp /tmp/report.ts.mut-orig perf/lib/report.ts
  python3 -I -c "p='perf/lib/report.ts';s=open(p).read();a,b=$2;assert a in s;open(p,'w').write(s.replace(a,b,1))"
  n=$(npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE 'Tests +[0-9]+ failed' | grep -oE '[0-9]+')
  echo "$1 -> ${n:-0} red"
}
run MU-OVERLAP-ONLY "('entry.t <= callbackStart + LOAF_EDGE_TOLERANCE_MS &&','true &&')"
run MU-START-INSIDE "('entry.t <= callbackStart + LOAF_EDGE_TOLERANCE_MS &&','entry.t >= callbackStart &&')"
run MU-NO-TOLERANCE "('export const LOAF_EDGE_TOLERANCE_MS = 1;','export const LOAF_EDGE_TOLERANCE_MS = 0;')"
cp /tmp/report.ts.mut-orig perf/lib/report.ts
n=$(npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')
echo "restored: $n passed"
