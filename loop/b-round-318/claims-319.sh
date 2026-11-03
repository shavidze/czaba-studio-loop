#!/usr/bin/env bash
# B round 318 -> 319 claims (PERF-8a fix-up). Usage: bash claims-319.sh ; CLAIMS_STORE overrides store path.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 1
WS=app/components/arrangement/StudioWorkspace.tsx
DP=app/components/arrangement/ArrangementDetailPanel.tsx
CL=app/components/arrangement/ArrangementClip.tsx
echo "K1 gate318: $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-318.json'));print(d['status'],d.get('reason',''))")"
echo "K2 head+status: $(git rev-parse --short HEAD) $(git status --short --untracked-files=all | wc -l)"
echo "K3 zustand in package.json: $(grep -c '"zustand": "5.0.16"' package.json) ; in lock: $(grep -c '"node_modules/zustand"' package-lock.json)"
echo "K4 'range' lines in ArrangementContext value memo/deps: $(grep -cE '^ {6}range,$' app/contexts/ArrangementContext.tsx)"
echo "K5 latestRef.current.range reads: $(grep -c 'latestRef.current.range' app/contexts/ArrangementContext.tsx)"
echo "K6 .range in StudioWorkspace: $(grep -cE '\.range\b' $WS)"
echo "K7 useState range in provider: $(grep -c 'useState<TimeRange | null>(null)' app/contexts/ArrangementContext.tsx)"
echo "K8 protected (re-baselined b-round-318): $(sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$') OK"
echo "K9 regression-last: $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K11 Lane clipRange line: $(grep -c 'const clipRange = isRangeInClip(clip) ? range : null;' app/components/arrangement/ArrangementLane.tsx)"
echo "K12 files importing zustand in app/: $(grep -rlE "from 'zustand" app | wc -l)"
echo "K13 range-store module exists: $(test -f app/lib/arrangement/range-store.ts && echo 1 || echo 0)"
echo "K14 range budget rows in assert mode (all 5): $(python3 -I -c "
import json;b=json.load(open('perf/budgets.interactions.json'));rows=b if isinstance(b,list) else b.get('rows',b.get('budgets'))
ids=['interact.drag.range.stopped.move-components-per-move','interact.drag.range.playing.move-components-per-move','interact.drag.range.stopped.move-components-max','interact.drag.range.playing.move-components-max','interact.drag.range.playing.move-restarts']
print(sum(1 for r in rows if r['id'] in ids and r['mode']=='assert'))")"
echo "K15 detail-panel start/end layout effect present: $(grep -c 'setStartText(rangeInputText(onClipStart ?? clipStart));' $DP)"
echo "K16 artifacts: $(n=0; for f in b-round-317/range-test-files.txt b-round-317/expect-count.py b-round-317/expect-count-head.txt b-round-318/protected-sha256.txt b-round-318/sketch-diag-dev.json b-round-318/sketch.patch.txt b-round-318/claims-319.sh b-round-318/claims-319-head-output.txt c-round-318/rowcmp-interactions.txt c-round-318/rowcmp-load.txt; do test -f $L/$f && n=$((n+1)); done; echo $n)/10"
echo "K17 memo() on ArrangementRangeReadout: $(grep -cE 'const ArrangementRangeReadout = memo\(' $WS)"
echo "K18 clip-level range selector lines in ArrangementClip.tsx: $(grep -c 'selectArrangementClipRange(state.range,' $CL)"
echo "K19 memo() on ArrangementDetailPlayhead / ArrangementPeakPath: $(grep -cE 'const ArrangementDetailPlayhead = memo\(' $DP) / $(grep -cE 'export const ArrangementPeakPath = memo\(' $CL)"
echo "K20 notices runtime heading: $(grep -oE '^## Runtime packages \([0-9]+\)' THIRD_PARTY_NOTICES.md) ; zustand rows: $(grep -c '^| zustand | 5.0.16 | MIT' THIRD_PARTY_NOTICES.md)"
echo "K21 doc 230 exists: $(ls docs/implementation/2026/quarter-IV/230-*.md 2>/dev/null | wc -l)"
echo "K22 transport file unchanged vs A round-318 tree (sha): $(sha256sum app/components/arrangement/ArrangementTransport.tsx | cut -c1-16)"
echo "K23 ArrangementRangeDetailPanel occurrences in StudioWorkspace: $(grep -c 'ArrangementRangeDetailPanel' $WS)"
