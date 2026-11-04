#!/usr/bin/env bash
# Round 329 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx
TR=$S/app/components/arrangement/ArrangementTransport.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-328.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F 'const projectEnd = useArrangementPreview((state) =>' $WS) $(grep -c -F 'const timelineSeconds = useArrangementPreview((state) =>' $WS) $(grep -c -F 'const timelineSeconds = Math.ceil(Math.max(projectEnd + TIMELINE_TAIL_SECONDS, viewportSeconds));' $WS)"
echo "K4 $(grep -c -F 'extent={extent}' $WS) $(grep -c -F 'committedProjectEnd={committedProjectEnd}' $WS) $(grep -c -F 'extent={timelineExtent(projectEnd, arrangement.loop)}' $WS) $(grep -c -F '() => timelineExtent(projectEnd, arrangement.loop),' $WS)"
echo "K5 $(grep -c -F 'const projectEnd = useArrangementPreview((state) =>' $TR) $(grep -c -F 'function ArrangementProjectEndText({ committedProjectEnd }: { committedProjectEnd: number }) {' $TR) $(grep -c -F '<span data-testid="arrangement-project-end">' $TR) $(grep -c -F '<ArrangementProjectEndText committedProjectEnd={committedProjectEnd} />' $TR)"
echo "K6 $(grep -c -F 'const TIMELINE_TAIL_SECONDS = 30;' $WS) $(grep -c -F 'export const TIMELINE_MIN_EXTENT_SECONDS = 10;' $S/app/lib/arrangement/view.ts) $(grep -c -F 'return Math.max(projectEnd, loop?.end ?? 0, TIMELINE_MIN_EXTENT_SECONDS);' $S/app/lib/arrangement/view.ts)"
echo "K7 $(grep -c -F 'const extent = timelineExtent(current.projectEnd, current.arrangement.loop);' $WS) $(grep -c -F 'if (pending && pending.sequence <= adoptedPreviewSequenceRef.current) {' $CTX)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP2[012] " $DP)"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K13 $(grep -rlE "'ArrangementTransport'|'StudioWorkspace'|'ArrangementRuler'|'ArrangementOverviewWithPreviewInner'|arrangement-project-end|data-extent|dataset\.extent" $S/app --include=*.test.ts --include=*.test.tsx $S/perf $S/e2e 2>/dev/null | wc -l)"
echo "K14 $(for f in tasks/round-328.md c-round-328.json c-round-328.md gates/gate-round-328.json b-round-328/names-probe.mjs b-round-328/names-head-dae81bf.json b-round-328/names-sketch-final.json b-round-328/end-bound-probe.mjs b-round-328/end-bound-head-dae81bf.json b-round-328/end-bound-sketch-final.json b-round-328/head-vs-sketch.txt b-round-328/sketch/sketch.patch.txt b-round-328/sketch/drag-preview-render.test.tsx.txt b-round-328/run-mutants.sh b-round-328/mutants-summary.txt b-round-328/head-parity-dp20-22.log b-round-328/precheck-full.log b-round-328/sketch-typecheck.log b-round-318/protected-sha256.txt b-round-328/rows.mjs b-round-328/rows-diff.py b-round-328/rows/rows-diff.txt b-round-328/k13-covering-files.txt b-round-328/names-sketch-attempts.txt b-round-328/claims-329-planning-output.txt b-round-328/claims-329-sketch-output.txt b-round-328-checkpoint-addendum.md c-round-328/g328-auth.cjs c-round-325/c325-rows.mjs c-round-324/probe/c324-names-probe.mjs; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(cmp -s tasks/round-328.md b-round-328/before-current-task.md && echo archive-equal)"
echo "K16 $(grep -E '^\s+Tests ' b-round-328/precheck-full.log | tr -s ' ') $(grep -c '^rc=0' b-round-328/sketch-typecheck.log)"
echo "K17 $(grep -c -E '×' b-round-328/mutants-summary.txt) $(grep -A1 '^== restored' b-round-328/mutants-summary.txt | grep -c '24 passed')"
echo "K18 $(grep -c -E '×' b-round-328/head-parity-dp20-22.log) $(grep -c -E '× DP2[12] ' b-round-328/head-parity-dp20-22.log)"
echo "K19 $(grep -c -F 'const box = overviewFrame(view, viewportPx, extent);' $S/app/components/arrangement/ArrangementOverview.tsx) $(grep -c -F "root.setAttribute('aria-valuetext', overviewValueText(visibleStart, extent));" $S/app/components/arrangement/ArrangementOverview.tsx) $(grep -c -F 'positionStore.getPosition() / extent' $S/app/components/arrangement/ArrangementOverview.tsx) $(grep -c -F 'data-extent={extent.toFixed(3)}' $S/app/components/arrangement/ArrangementOverview.tsx)"
