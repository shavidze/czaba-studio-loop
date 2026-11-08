#!/usr/bin/env bash
# B round 407 -> 408 claims (L29/L56). Run from anywhere: bash b-round-407/claims-408.sh
# Env ROOT = repository to check (default the real store); LOOP = loop folder.
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-407
cd "$ROOT" || exit 2
CTX=app/contexts/ArrangementContext.tsx
LANE=app/components/arrangement/ArrangementLane.tsx
AC=app/lib/arrangement/__tests__/actions-context.test.tsx
D261=docs/implementation/2026/quarter-IV/261-perf-lane-actions.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r408-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r408-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-408.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-408.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc261-exists $(test -f $D261 && echo 1 || echo 0) l4 $(test -f $D261 && sed -n 4p $D261)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 pick-keys $(python3 -I -c "import re;s=open('$CTX').read();m=re.search(r'type ArrangementActions = Pick<\s*ArrangementContextValue,([^>]*)>;',s);print(len(re.findall(r\"'([A-Za-z]+)'\",m.group(1))))")"
echo "K8 livePosition-word-in-ctx $(grep -cw 'livePosition' $CTX) getLivePosition-alias $(grep -c 'getLivePosition: livePosition' $CTX)"
echo "K9 lane-use-arrangement $(grep -c '  const { arrangement, collection, sourcePeaks, sourceDurations, pxPerSecond, videoSources } =' $LANE) lane-actions-hook $(grep -c '  } = useArrangementActions();' $LANE) lane-old-destructure-end $(grep -c '^  } = useArrangement();$' $LANE)"
echo "K10 tests AC8 $(grep -c "it('AC8 " $AC) count-literal $(grep -c 'ACTION_KEY_COUNT' $AC) declared-keys-fn $(grep -c 'function declaredActionKeys' $AC)"
echo "K11 SWEEP livePosition-word app/perf/e2e outside ctx $(grep -rnw 'livePosition' app perf e2e 2>/dev/null | grep -v "^$CTX:" | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';')"
echo "K12 SWEEP vi.mock-of-ArrangementContext $(grep -rln "vi.mock(['\"]~/contexts/ArrangementContext" app perf e2e 2>/dev/null | wc -l)"
echo "K13 SWEEP actions-consumers $(grep -rln 'useArrangementActions()' app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K14 sketch-sha $(sha256sum < $B/sketch-408.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md 2>/dev/null)"
for f in sketch-408.patch.txt sketch-dispatched.sha256 grants-408.txt r408-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full.log sketch-review.md consult-performance-optimizer.md deps-trace.txt tools/make-sketch.py tools/make-sketch-tests.py probe/leaf-probe-408.mjs probe/leaf-head-408.json probe/leaf-sketch-408.json probe/leaf-sketch-vs-head-408.txt lane/lane-actions-probe.mjs lane/head-1440x900.json lane/head-1280x720.json lane/sketch-1440x900.json lane/sketch-1280x720.json lane/mutant-MISMAP-SOLO-1440x900.json sketch-logs/covering.txt sketch-logs/l31-headroom.txt current-task-before-408.md; do echo "K15 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K16 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0' $B/mutants/summary.txt)"
echo "K17 gate407 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-407.json'));print(d['status'],d['commit'][:7])")"
echo "K18 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K19 archive-equal $(cmp -s $LOOP/tasks/round-407.md $B/current-task-before-408.md && echo 1 || echo 0)"
echo "K20 precheck-full $(tr '\n' ' ' < $B/precheck-full.log | sed 's/\x1b\[[0-9;]*m//g')"
echo "K21 leaf $(grep -c '^DIFFERENCES 0$' $B/probe/leaf-sketch-vs-head-408.txt) lane-1440 $(grep -c '1440x900 ArrangementLane: head \[0, 12, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 8\] sketch \[0, 12, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 8\]' $B/probe/leaf-sketch-vs-head-408.txt)"
echo "K22 lane-probe $(for f in head-1440x900 head-1280x720 sketch-1440x900 sketch-1280x720 mutant-MISMAP-SOLO-1440x900; do python3 -I -c "import json;d=json.load(open('$B/lane/$f.json'));print('$f', d['ok'], 'solo', d['steps'].get('solo',{}).get('pass'), end=' ')"; echo -n '; '; done)"
echo "K23 deps-trace keys $(wc -l < $B/deps-trace.txt) not-found $(grep -c NOT-FOUND $B/deps-trace.txt) arrangement-or-history-dep $(grep -cE '\[[^]]*\b(arrangement|history)\b' $B/deps-trace.txt)"
