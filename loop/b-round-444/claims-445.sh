#!/usr/bin/env bash
# Round 445 claims (SYS-3 stage 2b: shared inline-editor key intent, held Escape keeps the floating video). One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-444
A=app/components/arrangement
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
strip() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate444 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-444.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-445.txt" | wc -l)"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 protected rc $K3RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-445.txt")"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K4 tree-equals-sketch $eq/$(wc -l < "$B/sketch-paths.txt")"
if git apply --check -p1 "$B/sketch-445.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 sketch-sha $(sha256sum "$B/sketch-445.patch.txt" | cut -c1-16) expected $(cut -c1-16 "$B/sketch-445.sha256")"
echo "K7 composing-helper-calls tempo $(grep -c 'isImeCompositionKeyDown(event)' $A/ArrangementTempoRow.tsx) marker $(grep -c 'isImeCompositionKeyDown(event)' $A/ArrangementMarkerRow.tsx) group $(grep -c 'isImeCompositionKeyDown(event)' $A/ArrangementGroupHeader.tsx) detail $(grep -c 'isImeCompositionKeyDown(event)' $A/ArrangementDetailPanel.tsx) library $(grep -c 'isImeCompositionKeyDown(event)' $A/ArrangementLibrary.tsx)"
echo "K8 intent-helper $(grep -rc 'inlineEditorKeyIntent' app --include=*.ts --include=*.tsx | awk -F: '{s+=$2} END {print s}') video-escape-repeat-guard $(python3 -I -c "import re;s=open('$A/StudioWorkspace.tsx').read();print(len(re.findall(r'event\.preventDefault\(\);\n\s*if \(!event\.repeat\) \{\n\s*returnFloatingVideo\(\);',s)))") video-escape-unguarded $(python3 -I -c "import re;s=open('$A/StudioWorkspace.tsx').read();print(len(re.findall(r'isVideoExpanded\n\s*\) \{\n\s*event\.preventDefault\(\);\n\s*returnFloatingVideo\(\);',s)))")"
echo "K9 rows IME11 $(grep -c "'IME11 " $T/ime-composition-stage2b-ui.test.tsx 2>/dev/null || echo 0) IME12 $(grep -c "IME12 %s" $T/ime-composition-stage2b-ui.test.tsx 2>/dev/null || echo 0) IME13 $(grep -c "'IME13 " $T/ime-composition-stage2b-ui.test.tsx 2>/dev/null || echo 0) IME14 $(grep -c "'IME14:" $T/ime-composition-source-scan.test.ts 2>/dev/null || echo 0) IME15 $(grep -c "'IME15:" $T/ime-composition-source-scan.test.ts 2>/dev/null || echo 0) FV-HELD $(grep -c "'FV-HELD " $T/floating-video.test.tsx) IME6-split $(grep -c 'IME6 held key after a composing key, %s editor' $T/ime-composition-ui.test.tsx)"
echo "K10 docs 288-l4 '$(sed -n 4p $Q/288-sys-3-stage-1-ime-composition.md)' 289-l4 '$(sed -n 4p $Q/289-sys-3-stage-2a-ime-search-fields.md)' 290 $(ls $Q/290-*.md 2>/dev/null | wc -l)"
echo "K11 archive444 $(test -f "$LOOP/tasks/round-444.md" && echo present || echo absent)"
echo "K12 c444 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-444.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K13 mutants $(wc -l < "$B/mutants/results.jsonl") red $(python3 -I -c "import json;print(sum(1 for l in open('$B/mutants/results.jsonl') if json.loads(l)['rc']!=0 and json.loads(l)['failedRows']))")"
echo "K14 covering-on-sketch files $(wc -l < "$B/covering-files.txt") $(strip "$B/logs/covering-sketch.log" | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+ passed')"
echo "K15 full-on-sketch $(strip "$B/logs/precheck-full.log" | grep -oE 'Test Files +[0-9]+ passed' | grep -oE '[0-9]+') files $(strip "$B/logs/precheck-full.log" | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+') tests"
echo "K16 browser sketch '$(head -1 "$B/probe/compare-sketch.txt")' '$(sed -n 2p "$B/probe/compare-sketch.txt")' head '$(head -1 "$B/probe/compare-head.txt")'"
echo "K17 typecheck-errors $(grep -c 'error TS' "$B/logs/typecheck-sketch.log") lint '$(grep -oE 'Found [0-9]+ warnings' "$B/logs/lint-sketch.log")' biome-errors $(grep -cE '✖|error\[' "$B/logs/biome-scoped-sketch.log")"
n=0; for f in sketch-445.patch.txt sketch-445.sha256 sketch-paths.txt grants-445.txt covering-files.txt sketch-review.md mutants/run-mutants.py mutants/results.jsonl probe/held-escape-video.mjs probe/compare-video.py probe/head.json probe/sketch-merged.json probe/compare-head.txt probe/compare-sketch.txt probe/sketch-server.sh probe/headrun-stage2b.test.tsx.txt logs/headrun-truth-table.log logs/l50-focus-origins.txt logs/l31-headroom.txt claims-445-planning-output.txt logs/l50-changed-lines.txt claims-445-sketch-output.txt; do test -f "$B/$f" && n=$((n+1)); done; echo "K18 artifacts $n/22"
echo "K19 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K20 probe-server-source $(cat "$B/logs/probe-server-source-equals-sketch.txt")"
echo "K21 neighbours sites '$(cat "$B/probe/c6-sites-sketch-compare.txt")' held '$(cat "$B/probe/c6-held-sketch-compare.txt")' plain '$(tail -1 "$B/probe/compare-plain.txt")' stage2a '$(cat "$B/probe/stage2a-sketch-compare.txt")'"
echo "K22 head-truth-table $(strip "$B/logs/headrun-truth-table.log" | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+ passed') $(tail -1 "$B/logs/headrun-truth-table.log")"
echo "K23 l50 head-hits $(wc -l < "$B/logs/l50-focus-origins.txt")"
echo "K24 floating-video-escape-branches $(grep -c "event.key === 'Escape' &&" $A/StudioWorkspace.tsx)"
echo "K25 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K26 typing-target-return $(grep -c 'isTypingTarget(event.target)' $A/StudioWorkspace.tsx)"
echo "K27 pending-status-lines $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K28 doc-facts 289-option-phrase $(grep -cF '(Windows AltGr, macOS Option)' $Q/289-sys-3-stage-2a-ime-search-fields.md) 288-old-ime6 $(grep -cF 'IME6 held key after a composing key (%s): ' $Q/288-sys-3-stage-1-ime-composition.md)"
