#!/usr/bin/env bash
# Round 312 claims (B round 311 -> 312 planning). Run from the loop root: bash b-round-311/claims-312.sh
# Sketch run: CLAIMS_STORE=/tmp/b311s bash b-round-311/claims-312.sh (K2, K10, K16 differ there: scratch git, no gate history).
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
C=$S/app/contexts/ArrangementContext.tsx; A=$S/app/lib/arrangement
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-311.json'));print(g['status'],g['commit'][:7])")"
if [ -z "$CLAIMS_STORE" ]; then echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"; else echo "K2"; fi
echo "K3 $(wc -l < b-round-311-r312-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-311-r312-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n "import { computePeaks, PEAK_BUCKETS_PER_SECOND } from '~/lib/arrangement/peaks';" $C | cut -d: -f1) $(grep -n 'computePeaks(' $C | cut -d: -f1 | tr '\n' ' ')"
echo "K6 $(grep -n 'setSourcePeaks(' $C | cut -d: -f1 | tr '\n' ' ')"
echo "K7 $(for f in peaks.client.ts peaks.worker.ts peaks.worker-protocol.ts __tests__/peaks-worker.test.ts; do test -f $A/$f && echo 1 || echo 0; done | tr '\n' ' ')"
echo "K8 $(cd $A && ls *.worker.ts | tr '\n' ' ')"
echo "K9 $(cd $S && grep -rlE 'computePeaks|sourcePeaks|setSourcePeaks' app --include='*.ts' --include='*.tsx' perf | grep -E '__tests__/|^perf/' | wc -l)"
if [ -z "$CLAIMS_STORE" ]; then echo "K10 $(sed 's/\x1b\[[0-9;]*m//g' gates/round-311/verify.log | grep -oE 'Test Files +[0-9]+ passed' | grep -oE '[0-9]+') $(sed 's/\x1b\[[0-9;]*m//g' gates/round-311/verify.log | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')"; else echo "K10"; fi
echo "K11 $(python3 -I -c "import json;d=json.load(open('b-round-311/probe/identity-head.json'));print(d['mainPeaksMs'], sum(1 for w in d['workers'] if 'peaks' in w))")"
echo "K12 $(python3 -I -c "
import json;h=json.load(open('b-round-311/probe/identity-head.json'));s=json.load(open('b-round-311/probe/identity-sketch.json'))
print(len(s['mainPeaksMs']), sum(1 for w in s['workers'] if w=='peaks.worker.ts'), f\"{sum(a['sha']==b['sha'] for a,b in zip(h['waves'],s['waves']))}/{len(h['waves'])}\")")"
echo "K13 $(grep -c ' -> ' b-round-311/sketch/sketch-mutants.txt) $(grep -c 'restored: 13 passed' b-round-311/sketch/sketch-mutants.txt) $(grep -c ' -> 0 red' b-round-311/sketch/sketch-mutants.txt)"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(cmp -s tasks/round-311.md b-round-311/round-311-task-copy.md && echo archive-equal-311)"
if [ -z "$CLAIMS_STORE" ]; then echo "K16 $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^228-') $(ls $S/docs/implementation/2026/quarter-IV/ | tail -1)"; else echo "K16"; fi
echo "K17 $(grep -rn 'In Progress (stage' $S/docs/implementation 2>/dev/null | wc -l)"
echo "K18 $(for f in b-round-311/probe/peaks-probe.cjs b-round-311/probe/peaks-identity.cjs b-round-311/probe/analyze.py b-round-311/probe/browser-copy.cjs b-round-311/probe/browser-copy.txt b-round-311/probe/time-peaks.txt b-round-311/probe/identity-head.json b-round-311/probe/identity-sketch.json b-round-311/probe/identity-summary.txt b-round-311/probe/dev-head.json b-round-311/probe/dev-head-b.json b-round-311/sketch/sketch.patch.txt b-round-311/sketch/sketch-peaks.ts.txt b-round-311/sketch/sketch-peaks.client.ts.txt b-round-311/sketch/sketch-peaks.worker.ts.txt b-round-311/sketch/sketch-peaks.worker-protocol.ts.txt b-round-311/sketch/sketch-peaks-worker.test.ts.txt b-round-311/sketch/mutants.py b-round-311/sketch/sketch-mutants.txt b-round-311/sketch-tsc.log b-round-311/precheck-full.log b-round-311/round-311-task-copy.md b-round-311/claims-312-head-output.txt b-round-311/claims-312-sketch-output.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K19 $(sed 's/\x1b\[[0-9;]*m//g' b-round-311/precheck-full.log | grep -oE 'Test Files +[0-9]+ passed' | grep -oE '[0-9]+') $(sed 's/\x1b\[[0-9;]*m//g' b-round-311/precheck-full.log | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')"
echo "K20 $(grep -c '"peaks":\[.*"reuse":{.*"copy300"' b-round-311/probe/browser-copy.txt)"
echo "K21 $(grep -c 'DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS = 10_000' $A/demo-synth.client.ts)"
echo "K22 $(for f in waveform-zoom.test.tsx clip-gain-waveform.test.tsx; do grep -c '^async function flushLoads' $A/__tests__/$f; done | tr '\n' ' ')"
echo "K23 $(grep -c 'arrangement-library-preview-wave\"\] rect' $S/perf/lib/page.ts)"
