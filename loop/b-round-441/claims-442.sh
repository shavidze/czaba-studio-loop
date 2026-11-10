#!/usr/bin/env bash
# Round 442 claims (SYS-3 stage 1). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-441
A=app/components/arrangement
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate441 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-441.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-442.txt" | wc -l)"
sha256sum --quiet -c "$B/r442-frozen-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 frozen $(wc -l < "$B/r442-frozen-sha256.txt") rc $K3RC"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K4RC=$?; echo "K4 protected rc $K4RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-442.txt")"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K5 tree-equals-sketch $eq/$(wc -l < "$B/sketch-paths.txt")"
if git apply --check -p1 "$B/sketch-442.patch.txt" 2>/dev/null; then echo "K6 sketch-applies yes"; else echo "K6 sketch-applies no"; fi
echo "K7 isComposing-in-arrangement $(grep -rn 'isComposing' $A | wc -l) helper-calls $(grep -rn 'isImeCompositionKeyDown(event)' $A | wc -l)"
echo "K8 handlers tempo $(grep -c 'const handleTempoKeyDown = ' $A/ArrangementTempoRow.tsx) range $(grep -c 'const handleRangeInputKeyDown = ' $A/ArrangementDetailPanel.tsx) gain $(grep -c 'const handleClipGainKeyDown = ' $A/ArrangementDetailPanel.tsx) marker-editor $(grep -c "if (event.key === 'Enter' || event.key === 'Escape') {" $A/ArrangementMarkerRow.tsx) group-editor $(grep -c "if (event.key === 'Enter' || event.key === 'Escape') {" $A/ArrangementGroupHeader.tsx)"
echo "K9 input-inventory $(grep -rnE '<input\b|<textarea\b|contentEditable' $A --include=*.tsx | grep -v __tests__ | wc -l) text-entry-with-keydown $(for l in $(grep -rnE '<input\b' $A --include=*.tsx | grep -v __tests__ | cut -d: -f1,2); do f=${l%%:*}; n=${l##*:}; sed -n "$n,$((n+10))p" $f | tr '\n' ' ' | grep -qE 'type="(text|search|number)".*onKeyDown=\{(handle|onField|\(event)' && echo x; done | wc -l)"
echo "K10 testids $(for id in arrangement-tempo-input arrangement-marker-name-input arrangement-group-name-input arrangement-detail-start arrangement-detail-end arrangement-detail-clip-gain-input; do printf '%s=%s ' $id $(grep -rc "data-testid=\"$id\"" $A | awk -F: '{s+=$2} END {print s}'); done)"
echo "K11 typing-target-early-return $(grep -c 'isTypingTarget(event.target)$' $A/StudioWorkspace.tsx) modal-escape $(grep -c "if (e.key === 'Escape') {" app/components/ui/Modal.tsx) library-search-escape $(grep -c "const handleSearchKeyDown = " $A/ArrangementLibrary.tsx)"
echo "K12 archive-441 $(cmp -s "$LOOP/tasks/round-441.md" "$B/current-task-before-442.md" && echo identical || echo differs)"
echo "K13 new-paths-absent-at-HEAD $(git cat-file -e HEAD:$A/studio-ime-composition.ts 2>/dev/null && echo present || echo absent) $(git cat-file -e HEAD:$T/ime-composition-ui.test.tsx 2>/dev/null && echo present || echo absent) doc288 $(git ls-tree --name-only HEAD $Q/ | grep -c '/288-') last-doc $(git ls-tree --name-only HEAD $Q/ | sort | tail -1 | xargs basename)"
echo "K14 open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[e['id'] for e in b['open_findings'] if str(e.get('severity','')).lower() in ('critical','high','medium') and not str(e.get('status','')).lower().startswith(('closed','done','resolved','fixed','wontfix','deferred_user','merged'))]
print(len(o))")"
echo "K15 backlog $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));d=b['decisions_log_b'];print('v'+str(b['version']),d[-1]['id'])")"
echo "K16 c441 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-441.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K17 review-names-sha $(grep -c "$(cut -c1-64 "$B/sketch-442.sha256")" "$B/sketch-review.md" 2>/dev/null) $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
echo "K18 mutants $(python3 -I -c "
import json
rows=[json.loads(l) for l in open('$B/mutants/results.jsonl')]
print(len(rows),'red',sum(1 for r in rows if r['rc']!=0))")"
echo "K19 full-sketch-v2 $(grep -E 'Test Files|Tests |^rc ' "$B/precheck-full-v2.log" | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ' | tr '\n' ' ')"
echo "K20 covering $(wc -l < "$B/covering-files.txt") $(grep -E 'Tests |^rc' "$B/covering-sketch.log" | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ' | tr '\n' ' ')"
echo "K21 browser sketch: $(tail -1 "$B/probe/compare-sketch.txt") | head: $(tail -1 "$B/probe/compare-head.txt")"
echo "K22 perf-locators $(grep -cE 'arrangement-(tempo-input|marker-name-input|group-name-input|detail-start|detail-end|detail-clip-gain-input)' perf/studio-lab-interactions.perf.spec.ts)"
for f in sketch-442.patch.txt sketch-442.sha256 sketch-442-v1.patch.txt sketch-paths.txt grants-442.txt covering-files.txt r442-frozen-sha256.txt typecheck-sketch.log lint-sketch.log precheck-full.log covering-sketch.log sketch-review.md inventory-inputs.txt mutants/run-mutants.py mutants/results.jsonl probe/ime-sites.mjs probe/compare.py probe/sketch-server.sh probe/ime-sites-sketch.json probe/ime-sites-head.json probe/compare-sketch.txt probe/compare-head.txt precheck-full-v2.log biome-scoped-sketch.log claims-442-planning-output.txt claims-442-expected-after-A.diff.txt sketch-files/app/components/arrangement/studio-ime-composition.ts sketch-files/app/lib/arrangement/__tests__/ime-composition-ui.test.tsx; do test -f "$B/$f" || echo "K23 MISSING $f"; done; for f in b-round-440/probe/head-server.sh b-round-428/probe/held-enter-s5.mjs b-round-425/probe/held-enter-2a.mjs b-round-318/protected-sha256.txt tools/l58-check.py; do test -f "$LOOP/$f" || echo "K23 MISSING $f"; done; echo "K23 artifacts checked"
echo "K24 lint-warnings sketch $(grep -oE 'Found [0-9]+ warning' "$B/lint-sketch.log" | grep -oE '[0-9]+')"
echo "K25 template $(test -f docs/implementation/TEMPLATE.md && echo yes || echo no)"
