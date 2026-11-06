#!/usr/bin/env bash
# Round 373 claims (L29 + L56). Run from the loop root: bash b-round-372/claims-373.sh
# STORE=<tree> runs the same commands on another tree. B's sketch output (claims-373-sketch-output.txt) came from STORE=<sketch copy>, removed after planning; recreate it with patch -p1 < b-round-372/sketch.patch.txt on a cp -a of store/ at 4900b83.
S=${STORE:-/home/runner/czaba-project/store}
L=$(pwd)
T=$S/app/lib/arrangement/__tests__
C=$S/app/contexts/ArrangementContext.tsx
W=$S/app/components/arrangement/StudioWorkspace.tsx
M=$S/app/components/arrangement/ArrangementMarkerRow.tsx
P=$S/app/lib/arrangement/status-preview-store.ts
echo "K1 gate372: $(python3 -I -c "import json;d=json.load(open('gates/gate-round-372.json'));print(d['status'],d['commit'][:7])")"
echo "K2 status-lines: $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -v node_modules | wc -l)"
echo "K3 interface status fields (status/statusSequence/statusKey on ArrangementContextValue): $(grep -cE '^  (status|statusSequence|statusKey): (string|number);$' $C)"
echo "K4 value/deps shorthand lines (status, statusSequence, statusKey): $(grep -cE '^      (status|statusSequence|statusKey),$' $C)"
echo "K5 status useReducer in provider: $(grep -c 'useReducer(' $C) useReducer import: $(grep -cE '^  useReducer,$' $C) dispatchStatus: $(grep -c 'dispatchStatus' $C)"
echo "K6 status layout effects (committedStatusTextRef / adoptedPreviewSequenceRef): $(grep -cE 'committedStatusTextRef|adoptedPreviewSequenceRef' $C)"
echo "K7 store commitStatus action: $(grep -c 'commitStatus' $P) committed field: $(grep -cE '^  committed: ArrangementCommittedStatus;$' $P)"
echo "K8 getStatus getter in value interface: $(grep -cE '^  getStatus: \(\) => string;$' $C)"
echo "K9 StudioWorkspace status readers: destructure $(grep -cE '^    status(Key)?,$' $W) current.status $(grep -cE 'current\.status\b' $W) current.getStatus() $(grep -c 'current.getStatus()' $W) StatusText props $(grep -c '<ArrangementStatusText status=' $W)"
echo "K10 MarkerRow status readers: destructure $(grep -cE '^    status,$' $M) getStatus() $(grep -c 'getStatus()' $M)"
echo "K11 functional status updaters (SWEEP app/** perf/**): $(grep -rnE 'setStatus\(\(|setStatus\(rewriteStoppedTruth\)' $S/app $S/perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K12 playFrom: line after startPlaybackAt(target, 'insert-marker'): $(grep -A1 "startPlaybackAt(target, 'insert-marker');" $C | sed -n 2p | tr -s ' ')"
echo "K13 positive controls on setStatus in render-budget/selection-wrappers (setStatus('Positive control') / 'Memo control'): $(for f in render-budget selection-wrappers-render; do printf '%s=%s ' $f $(grep -cE "setStatus\('(Positive control|Memo control|GH1 positive control)" $T/$f.test.tsx); done)"
echo "K14 protected: $(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>&1 | wc -l) failing lines"
echo "K15 frozen: $(cd $S && sha256sum -c --quiet $L/b-round-372/r373-frozen-sha256.txt 2>&1 | wc -l) failing lines, entries $(wc -l < b-round-372/r373-frozen-sha256.txt)"
echo "K16 sketch files sha: $(cd $S && sha256sum -c --quiet $L/b-round-372/sketch-files-sha256.txt 2>/dev/null | wc -l) failing lines (0 = the 7 files equal B sketch)"
echo "K17 doc 240 files: $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^240-') doc239-l4: $(sed -n 4p $S/docs/implementation/2026/quarter-IV/239-perf-status-probe-migration.md)"
echo "K18 precheck-full (sketch): $(sed 's/\x1b\[[0-9;]*m//g' b-round-372/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';')"
echo "K19 sketch typecheck/biome: $(tail -1 b-round-372/sketch-typecheck.log) / $(head -1 b-round-372/sketch-biome.log) $(tail -1 b-round-372/sketch-biome.log)"
echo "K20 perf on sketch: PASS $(grep -c ' PASS$' b-round-372/perf-sketch.log) FAIL $(grep -c ' FAIL$' b-round-372/perf-sketch.log) start-components $(grep -E '^interact.play.start-components ' b-round-372/perf-sketch.log | tr -s ' ' | cut -d' ' -f4)"
echo "K21 sketch patch sha: $(sha256sum b-round-372/sketch.patch.txt | cut -c1-16) dispatched: $(cut -c1-16 b-round-372/sketch-dispatched.sha256)"
echo "K22 mutants red: $(for m in MU-STATUS-ON-VALUE MU-ADOPT-KEY-SEQUENCE MU-PLAYFROM-ORDER MU-NO-PREVIEW-CLEAR MU-GESTURE-FLAG-OFF MU-NO-NONREFUSAL-WRITE; do printf '%s=%s ' $m "$(sed 's/\x1b\[[0-9;]*m//g' b-round-372/mutants/mutant-$m.log 2>/dev/null | grep -oE 'Tests +[0-9]+ failed' | grep -oE '[0-9]+' | head -1)"; done)"
echo "K23 expect/it counts: $(tr '\n' ';' < b-round-372/expect-counts-373.txt)"
echo "K24 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])") lessons lines: $(wc -l < lessons.md)"
echo "K25 tasks/round-372.md sha256: $(sha256sum tasks/round-372.md | cut -c1-16)"
echo "K26 covering files: $(wc -l < b-round-372/covering-373.txt)"
echo "K28 ruler strip -> playFrom: playFromRuler calls playFrom $(grep -c "current.playFrom(time);" $W) wired as onPlayFrom $(grep -c "onPlayFrom: playFromRuler," $W) TempoRow calls onPlayFrom $(grep -c "gestures.onPlayFrom(time);" $S/app/components/arrangement/ArrangementTempoRow.tsx)"
for f in b-round-372/sketch.patch.txt b-round-372/sketch-dispatched.sha256 b-round-372/sketch-files-sha256.txt b-round-372/grants-373.txt b-round-372/r373-frozen-sha256.txt b-round-372/precheck-full.log b-round-372/precheck-full-v1.log b-round-372/perf-sketch.log b-round-372/perf-sketch-results/latest-interactions.json b-round-372/perf-mu-b-on-sketch.log b-round-372/mutants/run-mutant.sh b-round-372/mutants/run-all-373.sh b-round-372/covering-373.txt b-round-372/expect-counts-373.txt b-round-372/sketch-review.md b-round-372/mutants/mutant-MU-STATUS-ON-VALUE-deps-unchanged-vacuous.log b-round-372/perf-mu-b-on-sketch-invalid-missing-mp3.log tasks/round-372.md; do echo "K27 exists $f: $(test -f $f && echo yes || echo MISSING)"; done
