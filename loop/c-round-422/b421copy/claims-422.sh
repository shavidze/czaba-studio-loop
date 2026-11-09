#!/usr/bin/env bash
# Round 422 claims (SYS-2 stage 1, held Enter on the transport and marker flag). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-421
TR=app/components/arrangement/ArrangementTransport.tsx
MR=app/components/arrangement/ArrangementMarkerRow.tsx
T=app/lib/arrangement/__tests__/transport-centre-ui.test.tsx
TH=app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx
D=docs/implementation/2026/quarter-IV/272-sys-held-enter-transport.md
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-422.txt" | wc -l)"
sha256sum --quiet -c "$B/r422-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r422-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-422.txt")"
if git apply --check "$B/sketch-422.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc272-l4 $(sed -n 4p $D 2>/dev/null || echo absent)"
echo "K7 gate421 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-421.json'));print(a['status'],a['commit'][:7])")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 guards transport-onKeyDown-helper $(grep -c 'onKeyDown={preventRepeatedEnterKeyDown}' $TR) export-inline $(grep -c "if (event.key === 'Enter' && event.repeat) {" $TR) flag-first-guard $(grep -A2 -F 'marker: ArrangementMarker,' $MR | grep -c "if (event.key === 'Enter' && event.repeat) {") markerrow-enter-repeat $(grep -c "event.key === 'Enter' && event.repeat" $MR)"
echo "K10 scan $(python3 -I "$B/button-guard-scan.py" $TR $MR | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K11 sketch-sha $(sha256sum "$B/sketch-422.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-422.sha256")"
for f in sketch-422.patch.txt sketch-422.sha256 sketch-review.md precheck-full.log precheck-typecheck.log precheck-lint.log precheck-biome3.log precheck-a2.log covering-files.txt grants-422.txt r422-frozen-sha256.txt mutants/run.py mutants/summary.txt probe/held-enter.mjs probe/compare.py probe/compare-head-vs-sketch.txt button-guard-scan.py data/button-guard-scan.txt; do test -f "$B/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-421 $(cmp -s "$LOOP/tasks/round-421.md" "$B/current-task-before-422.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" GATE107-S1-MARKER-FLAG-HELD-ENTER A-R107-SWEEP-HELD-ENTER-TOOLBAR SYS-2 A-R421-REVIEW-L1-DECODED-STOP-ROW SYS-R418-PREVIEW-LIFECYCLE | sed 's/^/K14 /'
echo "K15 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K16 browser-compare $(tail -1 "$B/probe/compare-head-vs-sketch.txt")"
echo "K17 mutants $(wc -l < "$B/mutants/summary.txt") single-row $(grep -cE '^MU-(SPLIT|FOLLOW|BACK|LOOP|ZOOMRANGE|FLAG): red HE[1-6]$' "$B/mutants/summary.txt") head-src $(grep -c '^MU-HEAD-SRC: red HE1,HE2,HE3,HE4,HE5,HE6$' "$B/mutants/summary.txt") logs-17-tests $(cat "$B"/mutants/mutant-*.log | sed 's/\x1b\[[0-9;]*m//g' | grep -cE '^ +Tests .*\(17\)$')"
echo "K18 precheck full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') $(tail -1 "$B/precheck-full.log")"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 tests rows-TC $(grep -cE "^    it\('TC[0-9]+ " $T) rows-HE $(grep -cE "^    it\('HE[0-9]+ " $T) TH5-fit-unguarded $(grep -c "TH5: a repeated Enter on the toolbar Fit button is not prevented" $TH)"
echo "K21 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K22 fit-unguarded $(grep -B2 -A3 'onClick={onFit}' $TR | grep -c 'onKeyDown')"
echo "K23 covering $(grep -c '^app/' "$B/covering-files.txt") app + $(grep -vc '^app/' "$B/covering-files.txt") perf; a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K24 timeout transport-centre-gate421 $(grep -o 'transport-centre-ui.test.tsx.*' "$LOOP/gates/round-421/verify.log" | sed 's/\x1b\[[0-9;]*m//g' | head -1 | tr -s ' ')"
