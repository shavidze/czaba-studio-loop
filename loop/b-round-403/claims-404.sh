#!/usr/bin/env bash
# Round 404 claims (B round 403 -> 404 planning). Run from anywhere: bash b-round-403/claims-404.sh
# Optional: S=<tree> to run against another tree. Each line: K# <value>. Read-only; writes nothing.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${S:-/home/runner/czaba-project/store}
B=$L/b-round-403
P=$B/sketch-404.patch.txt
CTX=app/contexts/ArrangementContext.tsx
cd "$S" || exit 1
echo "K1 gate403 $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-403.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head $(git rev-parse --short=7 HEAD) status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 manifest-entries $(wc -l < $B/r404-frozen-sha256.txt) fails $(sha256sum -c --quiet $B/r404-frozen-sha256.txt 2>/dev/null | wc -l) tracked $(git ls-files | wc -l)"
echo "K4 protected-entries $(wc -l < $L/b-round-318/protected-sha256.txt) fails $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>/dev/null | wc -l) protected-in-grants $(grep -cFf <(awk '{print $2}' $L/b-round-318/protected-sha256.txt) $B/grants-404.txt)"
echo "K5 patch-sha $(sha256sum < $P | cut -c1-16) applies-on-tree $(git apply --check "$P" 2>/dev/null && echo yes || echo no) files $(grep -c '^diff --git' $P) grants $(wc -l < $B/grants-404.txt)"
echo "K6 doc258-free $(ls docs/implementation/2026/quarter-IV/ | grep -c '^258-') in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l)"
echo "K7 value-fields-34 $(for f in addSourceToActiveTrack beginLibraryDrag beginMasterGainGesture blurMasterGain claimPointerGesture commitArrangement commitLoopRange commitMasterGain deleteSelection endLibraryDrag getArrangement getLibraryPreviewOffset getLocatorPosition getStatus getStatusPreviewText isPointerGestureActive playFrom previewArrangement previewLoopArrangement previewMasterGain redo resetMasterPeak returnToStart seekTo selectSource setStatus splitSelection startLibraryPreview stepLoopRange stopLibraryPreview toggleLoopSelection toggleMasterMute togglePlayback undo; do grep -cE "^  $f: " $CTX; done | grep -c '^1$')"
echo "K8 bundle-hooks-take-workspace $(grep -c 'workspace: ArrangementContextValue,' app/components/arrangement/ArrangementLoopBrace.tsx app/components/arrangement/ArrangementMaster.tsx app/components/arrangement/ArrangementTransport.tsx app/components/arrangement/ArrangementMarkerRow.tsx | tr '\n' ' ') library-narrow $(grep -c 'workspace: ArrangementLibraryActions,' app/components/arrangement/ArrangementLibrary.tsx)"
echo "K9 hook-callsites $(grep -c 'Actions(workspace)' app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementLoopBrace.tsx app/components/arrangement/ArrangementLibrary.tsx app/components/arrangement/ArrangementMaster.tsx app/components/arrangement/ArrangementTransport.tsx | tr '\n' ' ')"
echo "K10 actions-ctx-at-tree $(grep -c 'ArrangementActionsContext' $CTX) useArrangementActions-callers $(grep -rln 'useArrangementActions()' app --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K11 transition-api-hits $(grep -rlE '\b(startTransition|useTransition|useDeferredValue)\b' app/components/arrangement app/contexts --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) entry-client $(grep -cE 'startTransition' app/entry.client.tsx)"
echo "K12 provider-mounts $(grep -rln '<ArrangementProvider' app --include=*.tsx | grep -v __tests__ | tr '\n' ' ')"
echo "K13 mutants-red $(grep -c ' RED ' $B/mutants/summary.txt) survived $(grep -c SURVIVED $B/mutants/summary.txt) pristine-rc0 $(grep -c '^pristine.* rc 0' $B/mutants/summary.txt)"
echo "K14 full-vitest-sketch $(sed 's/\x1b\[[0-9;]*m//g' $B/sketch-full-vitest.log | grep -E 'Test Files|Tests ' | tr -s ' ' | tr '\n' ' ') rc $(cat $B/sketch-full-vitest.rc) tsc $(cat $B/sketch-tsc.rc) lint $(cat $B/sketch-lint.rc) biome $(cat $B/sketch-biome.rc)"
echo "K15 interactions-sketch $(tail -1 $B/interactions-compare.txt) rc $(cat $B/perf-sketch-interactions.rc)"
echo "K16 review $(test -f $B/sketch-review.md && echo exists || echo MISSING) dispatched-sha-in-review $(grep -c "$(sha256sum < $P | cut -c1-64)" $B/sketch-review.md 2>/dev/null)"
echo "K17 c403 $(python3 -I -c "import json;d=json.load(open('$L/c-round-403.json'));print(d['taskStatus'],len(d['bugs']),d['browserVerified'],d['realVerified'])")"
echo "K18 archive-round403 $(cmp -s $L/tasks/round-403.md $B/current-task-before-404.md && echo equal || echo differ)"
echo "K19 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K20 measurement $(test -f $B/probe/medians.txt && grep -c 'nearMin median' $B/probe/medians.txt) variants $(ls $B/probe/*-6x-*.json | wc -l)"
echo "K21 cited $(for f in b-round-403/consult-tech-lead-sys-r385.md b-round-403/root-request-arch-checkpoint-perf14.md user-review/questions-perf14c-pyramid-canvas.md b-round-403/mutants/run.py b-round-403/perf-sketch-interactions.json c-round-402/perf-interactions.json b-round-403/grants-404.txt; do test -e "$L/$f" || echo "MISSING:$f"; done | wc -l) of 7 missing"
echo "K22 rb-leaf-rows $(grep -cE "it\('RB-LEAF[1-6]b? " app/lib/arrangement/__tests__/render-budget.test.tsx)"
