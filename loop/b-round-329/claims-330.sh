#!/usr/bin/env bash
# Round 330 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx
TR=$S/app/components/arrangement/ArrangementTransport.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-329.json'));print(a['status'],a.get('commit','-'))") $(python3 -I -c "import json;a=json.load(open('gates/gate-round-328.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F "import { type KeyboardEvent, useCallback, useId, useRef } from 'react';" $TR) $(grep -c -F "import { type KeyboardEvent, memo, useCallback, useId, useRef } from 'react';" $TR)"
echo "K4 $(grep -c -F 'function ArrangementProjectEndText({ committedProjectEnd }: { committedProjectEnd: number }) {' $TR) $(grep -c -F 'function ArrangementProjectEndTextInner({ committedProjectEnd }: { committedProjectEnd: number }) {' $TR) $(grep -c -F 'const ArrangementProjectEndText = memo(ArrangementProjectEndTextInner);' $TR) $(grep -c -F '<span data-testid="arrangement-project-end">' $TR) $(grep -c -F '<ArrangementProjectEndText committedProjectEnd={committedProjectEnd} />' $TR)"
echo "K5 $(grep -c -F 'extent={timelineExtent(projectEnd, arrangement.loop)}' $WS) $(grep -c -F 'const timelineSeconds = useArrangementPreview((state) =>' $WS)"
echo "K6 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP2[34] " $DP) $(grep -c -F "rendersOf('ArrangementProjectEndText')" $DP) $(grep -c -F "rendersOf('ArrangementProjectEndTextInner')" $DP) $(grep -c -F 'loop: ArrangementLoop | null = null,' $DP)"
echo "K7 $(sed -n 4p $D232)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K11 $(grep -rlE "ArrangementProjectEndText|arrangement-project-end" $S/app --include=*.test.ts --include=*.test.tsx $S/perf $S/e2e 2>/dev/null | wc -l) $(grep -rnE "ArrangementProjectEndText[A-Za-z]*'\)\)?\.toBeGreaterThan" $S/app --include=*.test.tsx 2>/dev/null | wc -l)"
echo "K12 $(for f in tasks/round-329.md c-round-329.json c-round-329.md a-round-329.md gates/gate-round-329.json gates/gate-round-328.json b-round-329/sketch/sketch.patch.txt b-round-329/run-mutants.sh b-round-329/mutants-summary.txt b-round-329/sketch-unit.log b-round-329/sketch-typecheck.log b-round-329/head-parity-dp23-24.log b-round-329/precheck-full.log b-round-329/perf-sketch-results/latest-interactions.json b-round-329/perf-rowcmp-vs-c328.txt b-round-329/perf-rowcmp.py b-round-329/claims-330-planning-output.txt b-round-329/claims-330-sketch-output.txt c-round-329/perf-rowcmp-vs-c328.txt c-round-329/click-names-vs-head.txt c-round-328/perf-interactions-atree-results/latest-interactions.json b-round-328/names-probe.mjs b-round-328/end-bound-probe.mjs b-round-328/rows.mjs b-round-328/rows-diff.py b-round-328/names-sketch-final.json b-round-328/end-bound-head-dae81bf.json c-round-328/g328-auth.cjs b-round-318/protected-sha256.txt b-round-328/k13-covering-files.txt; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K13 $(cmp -s tasks/round-329.md b-round-329/current-task-before.md && echo archive-equal)"
echo "K14 $(grep -E '^\s+Tests ' b-round-329/precheck-full.log 2>/dev/null | tr -s ' ') $(grep -c '^rc=0' b-round-329/sketch-typecheck.log)"
echo "K15 $(grep -c -E '×' b-round-329/mutants-summary.txt) $(grep -A1 '^== restored' b-round-329/mutants-summary.txt | grep -c '26 passed')"
echo "K16 $(grep -c -E '×' b-round-329/head-parity-dp23-24.log 2>/dev/null) $(grep -c -E '× DP23 ' b-round-329/head-parity-dp23-24.log 2>/dev/null)"
echo "K17 $(grep -c '^EQUAL' b-round-329/perf-rowcmp-vs-c328.txt 2>/dev/null) $(grep -c '^DIFF' b-round-329/perf-rowcmp-vs-c328.txt 2>/dev/null)"
