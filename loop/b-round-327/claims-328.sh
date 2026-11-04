#!/usr/bin/env bash
# Round 328 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CTX=$S/app/contexts/ArrangementContext.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-327.json'));print(a['status'])") $(python3 -I -c "import json;a=json.load(open('gates/gate-round-326.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(awk '/const flushStatusPreview = useCallback/,/\}, \[statusPreviewStore\]\);/' $CTX | grep -c 'clearPreview()') $(grep -c -F 'statusPreviewStore.getState().clearPreview();' $CTX)"
echo "K4 $(grep -c -F 'const adoptedPreviewSequenceRef = useRef(0);' $CTX) $(grep -c -F 'const committedStatusTextRef = useRef(status);' $CTX)"
echo "K5 $(grep -c -F 'if (pending === null && text === committedStatusTextRef.current) {' $CTX) $(grep -c -F 'if (!pending || pending.sequence <= adoptedPreviewSequenceRef.current) {' $CTX)"
echo "K6 $(grep -c -F '}, [statusEntry, statusPreviewStore]);' $CTX)"
echo "K7 $(grep -c -F 'lastNonRefusalStatusRef.current = settledCollectionStatus(' $CTX) $(grep -c -F 'setStatus((current) => settledCollectionStatus(current, copy, failedCount));' $CTX)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP1[789] " $DP)"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(cd $S && npx biome lint --max-diagnostics=500 app/contexts/ArrangementContext.tsx 2>&1 | grep -c 'useExhaustiveDependencies')"
echo "K13 $(grep -c -F '<ArrangementStatusText status={status} statusKey={statusKey} />' $WS) $(grep -c -F 'return preview ? (' $WS)"
echo "K14 $(for f in tasks/round-327.md c-round-327.json c-round-327/probe-settle-remount.mjs b-round-327/probe-settle-remount.mjs b-round-327/probe-refusal-mid-drag.mjs b-round-327/probe-settle-head.json b-round-327/probe-settle-atree.json b-round-327/probe-settle-sketch-final.json b-round-327/probe-refusal-sketch-final.json b-round-327/probe-refusal-head.json b-round-327/sketch/sketch.patch.txt b-round-327/sketch/drag-preview-render.test.tsx.txt b-round-327/mutants-summary.txt b-round-327/run-mutants.sh b-round-327/head-parity-dp17-19.log b-round-327/precheck-full.log b-round-327/sketch-typecheck.log gates/gate-round-327.json; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(cmp -s tasks/round-327.md b-round-327/before-current-task.md && echo archive-equal)"
echo "K16 $(sed 's/\x1b\[[0-9;]*m//g' b-round-327/precheck-full.log | grep -E '^\s+Tests ' | tr -s ' ') $(grep -c '^rc=0' b-round-327/sketch-typecheck.log)"
echo "K17 $(grep -c -E 'FAIL .*DP1[789] ' b-round-327/mutants-summary.txt) $(grep -A3 '^== MU-SYNC-CLEAR' b-round-327/mutants-summary.txt | grep -c 'passed')"
