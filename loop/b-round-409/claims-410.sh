#!/usr/bin/env bash
# B round 409 -> 410 claims (L29/L56). Run: bash b-round-409/claims-410.sh   (ROOT= repository, LOOP= loop folder)
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-409
cd "$ROOT" || exit 2
CTX=app/contexts/ArrangementContext.tsx
PRE=app/components/arrangement/ArrangementLibraryPreview.tsx
MOD=app/lib/arrangement/precomputed-peaks.ts
D263=docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r410-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r410-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-410.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-410.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc263-exists $(test -f $D263 && echo 1 || echo 0) l4 $(test -f $D263 && sed -n 4p $D263)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 load-sites loadSource-calls $(grep -c '\.loadSource(source' $CTX) requestSourcePeaks-calls $(grep -c 'requestSourcePeaks(buffer' $CTX) storeSourcePeaks-calls $(grep -c 'storeSourcePeaks(source' $CTX) video-site $(grep -c 'storeSourcePeaks(sourceId, peaks);' $CTX)"
echo "K8 preview-draws-peaks-any-state peaks-line $(grep -c "const peaks = source ? sourcePeaks.get(source.id) : undefined;" $PRE) columns-line $(grep -c 'const columns = useMemo(() => previewWaveColumns(peaks), \[peaks\]);' $PRE) loading-dim $(grep -c "isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'" $PRE)"
echo "K9 sourceDurations-ready-only $(grep -cF ".filter(([, state]) => state.status === 'ready')" $CTX)"
echo "K10 SWEEP peaksUrl app+perf+e2e $(grep -rl 'peaksUrl' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K11 sketch-shape module-exports $(test -f $MOD && grep -cE '^export (async )?(function|const|interface) ' $MOD || echo absent) ctx-import $(grep -c "} from '~/lib/arrangement/precomputed-peaks';" $CTX) dropSourcePeaks $(grep -c 'const dropSourcePeaks = useCallback(' $CTX) skip-16bit $(grep -c "precomputed?.bits === 16 &&" $CTX)"
echo "K12 types-peaksUrl $(grep -c '  peaksUrl?: (source: WorkspaceSource) => string | null;' app/types/arrangement.ts)"
echo "K13 sketch-sha $(sha256sum < $B/sketch-410.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md 2>/dev/null)"
for f in sketch-410.patch.txt sketch-410-v1.patch.txt sketch-dispatched.sha256 sketch-review.md grants-410.txt r410-frozen-sha256.txt mutants/run.py mutants/summary.txt mutants/equivalent.txt precheck-full.log precheck-lint.log consult-performance-optimizer.md sketch-logs/covering.txt sketch-logs/covering.json sketch-logs/slowest.txt sketch-logs/rc.txt probe/peaks-probe-410.mjs probe/head-1440x900.json probe/head-1280x720.json probe/sketch-1440x900.json probe/sketch-1280x720.json; do echo "K14 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K15 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0 failed \[\]' $B/mutants/summary.txt)"
echo "K16 gate409 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-409.json'));print(d['status'],d['commit'][:7])")"
echo "K17 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K18 archive-equal $(cmp -s $LOOP/tasks/round-409.md $LOOP/b-round-409/current-task-before-410.md && echo 1 || echo 0)"
echo "K19 precheck-full $(cat $B/precheck-full.log | tr '\n' ' ')"
echo "K20 covering $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/covering.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])")"
echo "K21 probe $(for f in head-1440x900 head-1280x720 sketch-1440x900 sketch-1280x720; do python3 -I -c "import json;d=json.load(open('$B/probe/$f.json'));print('$f', d['ok'], 'peaksRequests', len(d['peaksRequests']), 'pageErrors', len(d['pageErrors']), 'sources', len(d['sources']), 'rects', sorted(set(s['rects'] for s in d['sources'].values())), end=' ')"; echo -n '; '; done)"
echo "K23 lane-probe $(tr '\n' ' ' < $B/lane/summary.txt)"
echo "K22 handoff-note $(test -f /home/runner/czaba-project/docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md && echo 1 || echo 0)"
