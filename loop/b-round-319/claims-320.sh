#!/usr/bin/env bash
# B round 319 -> 320 claims (PERF-8a fix-up 2). Usage: bash claims-320.sh ; CLAIMS_STORE overrides store path.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
cd "$S" || exit 1
WS=app/components/arrangement/StudioWorkspace.tsx
DP=app/components/arrangement/ArrangementDetailPanel.tsx
CL=app/components/arrangement/ArrangementClip.tsx
RB=app/lib/arrangement/__tests__/render-budget.test.tsx
CG=app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx
DT=app/lib/arrangement/__tests__/detail-panel.test.tsx
echo "K1 gate319: $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-319.json'));print(d['status'],d.get('reason',''))")"
echo "K2 head+status: $(git rev-parse --short HEAD) $(git status --short --untracked-files=all | wc -l)"
echo "K3 zustand in package.json: $(grep -c '"zustand": "5.0.16"' package.json) ; in lock: $(grep -c '"node_modules/zustand"' package-lock.json)"
echo "K4 'range' lines in ArrangementContext value memo/deps: $(grep -cE '^ {6}range,$' app/contexts/ArrangementContext.tsx)"
echo "K5 latestRef.current.range reads: $(grep -c 'latestRef.current.range' app/contexts/ArrangementContext.tsx)"
echo "K6 .range in StudioWorkspace: $(grep -cE '\.range\b' $WS)"
echo "K7 useState range in provider: $(grep -c 'useState<TimeRange | null>(null)' app/contexts/ArrangementContext.tsx)"
echo "K8 protected (b-round-318 baseline): $(sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$') OK"
echo "K9 regression-last: $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K11 Lane clipRange line: $(grep -c 'const clipRange = isRangeInClip(clip) ? range : null;' app/components/arrangement/ArrangementLane.tsx)"
echo "K12 files importing zustand in app/: $(grep -rlE "from 'zustand" app | wc -l)"
echo "K13 range-store module exists: $(test -f app/lib/arrangement/range-store.ts && echo 1 || echo 0)"
echo "K14 range budget rows in assert mode (all 5): $(python3 -I -c "
import json;b=json.load(open('perf/budgets.interactions.json'));rows=b if isinstance(b,list) else b.get('rows',b.get('budgets'))
ids=['interact.drag.range.stopped.move-components-per-move','interact.drag.range.playing.move-components-per-move','interact.drag.range.stopped.move-components-max','interact.drag.range.playing.move-components-max','interact.drag.range.playing.move-restarts']
print(sum(1 for r in rows if r['id'] in ids and r['mode']=='assert'))")"
echo "K15 detail-panel start/end layout effect present: $(grep -c 'setStartText(rangeInputText(onClipStart ?? clipStart));' $DP)"
echo "K16 artifacts: $(n=0; for f in b-round-317/range-test-files.txt b-round-317/expect-count.py b-round-318/protected-sha256.txt b-round-319/claims-320.sh b-round-319/claims-320-head-output.txt a-round-319/memo-wrappers.patch.txt a-round-318/diag-range-components-from-down.mjs c-round-319/rowcmp-interactions.txt c-round-319/rowcmp-load.txt c-round-319/mutants.txt c-round-319/c319-rows.mjs c-round-319/c319-diag.mjs; do test -f $L/$f && n=$((n+1)); done; echo $n)/12"
echo "K17 Inner+memo ArrangementRangeReadout: $(grep -cE '^function ArrangementRangeReadoutInner\(' $WS) / $(grep -cE '^const ArrangementRangeReadout = memo\(ArrangementRangeReadoutInner\);' $WS)"
echo "K18 clip-level range selector lines in ArrangementClip.tsx: $(grep -c 'selectArrangementClipRange(state.range,' $CL)"
echo "K19 Inner+memo PeakPath / ClipRangeOverlay / DetailPlayhead / DetailWaveform: $(grep -cE '^function ArrangementPeakPathInner\(' $CL)+$(grep -cE '^export const ArrangementPeakPath = memo\(ArrangementPeakPathInner\);' $CL) / $(grep -cE '^function ArrangementClipRangeOverlayInner\(' $CL)+$(grep -cE '^const ArrangementClipRangeOverlay = memo\(ArrangementClipRangeOverlayInner\);' $CL) / $(grep -cE '^function ArrangementDetailPlayheadInner\(' $DP)+$(grep -cE '^const ArrangementDetailPlayhead = memo\(ArrangementDetailPlayheadInner\);' $DP) / $(grep -cE '^function ArrangementDetailWaveformInner\(' $DP)+$(grep -cE '^const ArrangementDetailWaveform = memo\(ArrangementDetailWaveformInner\);' $DP)"
echo "K20 notices runtime heading: $(grep -oE '^## Runtime packages \([0-9]+\)' THIRD_PARTY_NOTICES.md) ; zustand rows: $(grep -c '^| zustand | 5.0.16 | MIT' THIRD_PARTY_NOTICES.md)"
echo "K21 doc 230 exists: $(ls docs/implementation/2026/quarter-IV/230-*.md 2>/dev/null | wc -l)"
echo "K22 transport file sha prefix: $(sha256sum app/components/arrangement/ArrangementTransport.tsx | cut -c1-16)"
echo "K23 ArrangementRangeDetailPanel occurrences in StudioWorkspace: $(grep -c 'ArrangementRangeDetailPanel' $WS)"
echo "K24 'memo(function' in the three source files: $(cat $CL $DP $WS | grep -c 'memo(function')"
echo "K25 name keys old (Playhead/PeakPath/Waveform) / new Inner: $(grep -c "'ArrangementDetailPlayhead'" $RB)+$(grep -c "'ArrangementPeakPath'" $CG)+$(grep -c "'ArrangementDetailWaveform'," $CG) / $(grep -c "'ArrangementDetailPlayheadInner'" $RB)+$(grep -c "'ArrangementPeakPathInner'" $CG)+$(grep -c "'ArrangementDetailWaveformInner'," $CG)"
echo "K26 RS8 test title in detail-panel.test.tsx: $(grep -c 'RS8' $DT)"
echo "K27 expect( in render-budget / clip-gain-pointer-preview: $(grep -o 'expect(' $RB | wc -l) / $(grep -o 'expect(' $CG | wc -l)"
