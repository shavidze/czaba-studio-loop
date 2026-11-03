#!/usr/bin/env bash
# Round 314 unit mutants: round 313's three (injectedLoafEntries) plus two on timelineScrollProblem.
# Run from a SCRATCH store copy (never store/) that has vitest.perf-scratch.config.ts
# (test.include: ['perf/**/*.test.ts']). Usage: bash <loop>/b-round-313/unit-mutants.sh > out.txt
set -u
cp perf/lib/report.ts /tmp/report.ts.mut314-orig
run() {
  cp /tmp/report.ts.mut314-orig perf/lib/report.ts
  python3 -I -c "p='perf/lib/report.ts';s=open(p).read();a,b=$2;assert a in s;open(p,'w').write(s.replace(a,b,1))"
  n=$(npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE 'Tests +[0-9]+ failed' | grep -oE '[0-9]+')
  echo "$1 -> ${n:-0} red"
}
run MU-OVERLAP-ONLY "('entry.t <= callbackStart + LOAF_EDGE_TOLERANCE_MS &&','true &&')"
run MU-START-INSIDE "('entry.t <= callbackStart + LOAF_EDGE_TOLERANCE_MS &&','entry.t >= callbackStart &&')"
run MU-NO-TOLERANCE "('export const LOAF_EDGE_TOLERANCE_MS = 1;','export const LOAF_EDGE_TOLERANCE_MS = 0;')"
run MU-SCROLL-NOOP "('return before === after','return true')"
run MU-SCROLL-TOLERANCE-1PX "('return before === after','return Math.abs(before - after) < 1')"
cp /tmp/report.ts.mut314-orig perf/lib/report.ts
n=$(npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')
echo "restored: $n passed"
