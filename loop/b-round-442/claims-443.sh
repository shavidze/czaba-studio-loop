#!/usr/bin/env bash
# Round 443 claims (SYS-3 stage 1 fix-up, C-R442-M1). One line per claim. ROOT/LOOP may be overridden.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-442
A=app/components/arrangement
T=app/lib/arrangement/__tests__
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate442 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-442.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-443.txt" | wc -l)"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 protected rc $K3RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-443.txt")"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K4 tree-equals-sketch $eq/$(wc -l < "$B/sketch-paths.txt")"
if git apply --check -p1 "$B/sketch-443.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 sketch-sha $(sha256sum "$B/sketch-443.patch.txt" | cut -c1-16) expected $(cut -c1-16 "$B/sketch-443.sha256")"
echo "K7 tempo-handler $(grep -c 'const handleTempoKeyDown' $A/ArrangementTempoRow.tsx) gain-handler $(grep -c 'const handleClipGainKeyDown' $A/ArrangementDetailPanel.tsx) marker-editor-testid $(grep -c 'data-testid="arrangement-marker-name-input"' $A/ArrangementMarkerRow.tsx)"
echo "K8 ime-guard-calls $(grep -rn 'isImeCompositionKeyDown(event)' $A | wc -l)"
echo "K9 ime-rows IME6 $(grep -c "'IME6 " $T/ime-composition-ui.test.tsx) IME7 $(grep -c "'IME7 " $T/ime-composition-ui.test.tsx)"
echo "K10 hm11b-precedent $(grep -c 'HM11b the group name editor ignores a repeated Escape' $T/mixer-held-enter-ui.test.tsx)"
echo "K11 doc288 $(test -f docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md && echo present || echo absent) line4 $(sed -n 4p docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md)"
echo "K12 archive $(cmp -s "$LOOP/current-task.md" "$LOOP/tasks/round-442.md" && echo current-equals-442 || echo current-is-new) archive442 $(test -f "$LOOP/tasks/round-442.md" && echo present)"
echo "K13 c442 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-442.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K14 mutants $(wc -l < "$B/mutants/results.jsonl") red $(grep -c '"rc": 1' "$B/mutants/results.jsonl")"
echo "K15 covering $(wc -l < "$LOOP/b-round-441/covering-files.txt") $(grep -E 'Tests ' "$B/logs/covering60-sketch.log" | grep -oE '[0-9]+ passed' | head -1) $(grep '^rc' "$B/logs/covering60-sketch.log")"
echo "K16 browser sketch '$(tail -1 "$B/probe/compare-sketch-v2.txt")' head '$(tail -1 "$B/probe/compare-head.txt")'"
echo "K17 typecheck-sketch '$(tail -1 "$B/logs/typecheck-sketch.log")' biome-scoped '$(tail -1 "$B/logs/biome-scoped-sketch.log")'"
m=0; for f in probe/compare-sketch-v2.txt probe/compare-sites-v2.txt probe/compare-plain-planning.txt probe/plain-held.mjs probe/compare-plain.py logs/lint-head.log logs/lint-sketch.log sketch-443.patch.txt sketch-443.sha256 sketch-paths.txt grants-443.txt mutants/run-mutants.py mutants/results.jsonl probe/ime-held.mjs probe/compare-held.py probe/compare-head.txt probe/compare-sketch.txt logs/covering60-sketch.log sketch-review.md; do test -f "$B/$f" || { echo "MISSING $f"; m=1; }; done; echo "K18 artifacts $([ $m = 0 ] && echo checked || echo MISSING)"
echo "K19 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 v2-probes held '$(tail -1 "$B/probe/compare-sketch-v2.txt")' sites '$(tail -1 "$B/probe/compare-sites-v2.txt")' plain '$(tail -1 "$B/probe/compare-plain-planning.txt")'"
