#!/usr/bin/env bash
# Round 430 claims (SABA-B-12 stage 1 = STUDIO-VIS-1). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-429
A=app/components/arrangement
DP=$A/ArrangementDetailPanel.tsx
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate429 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-429.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-430.txt" | wc -l)"
sha256sum --quiet -c "$B/r430-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r430-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-430.txt")"
if git apply --check "$B/sketch-430.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc278-l4 $(sed -n 4p $Q/278-saba-b-12-number-spinbuttons.md 2>/dev/null || echo absent) | doc277-l4 $(sed -n 4p $Q/277-sys-held-enter-closing.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 number-inputs $(grep -rn 'type="number"' $A --include=*.tsx | grep -v __tests__ | awk -F: '{print $1":"$2}' | xargs -r -n1 basename | tr '\n' ' ')"
echo "K8b inputClass $(grep -c 'const inputClass' $DP) uses $(grep -cE 'className=\{inputClass\}|cn\(inputClass' $DP) constant-in-dp $(grep -c 'STUDIO_NUMBER_FIELD_CLASS' $DP) constant-file $(test -f $A/studio-number-field.ts && echo present || echo absent)"
echo "K8c native-controls-arrangement $(grep -rnoE 'type="(number|radio|search|checkbox|range|file)"|<select|<progress' $A --include=*.tsx | grep -v __tests__ | awk -F: '{print $3}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K8d search-cancel-hidden library $(grep -c 'webkit-search-cancel-button' $A/ArrangementLibrary.tsx) shortcut-sheet $(grep -c 'webkit-search-cancel-button' $A/ArrangementShortcutSheet.tsx)"
echo "K8e legacy-export-dialog-users $(grep -rlnw "ExportDialog" app --include=*.tsx --include=*.ts | grep -v __tests__ | grep -v '^app/components/arrangement/' | sort | tr '\n' ' ')"
echo "K9 wheel-guard $(grep -c 'preventFocusedNumberInputWheel' $DP) arrow-handler $(grep -c "event.key !== 'ArrowUp' && event.key !== 'ArrowDown'" $DP)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-430.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-430.sha256") review-names $(grep -c "$(cat "$B/sketch-430.sha256")" "$B/sketch-review.md" 2>/dev/null) diff-headers $(grep -c '^diff --git' "$B/sketch-430.patch.txt")"
for f in sketch-430.patch.txt sketch-430.sha256 sketch-review.md mutants/run.py mutants/summary.txt precheck-a2.log precheck-new-rows.log precheck-typecheck.log precheck-lint.log precheck-biome4.log covering-files.txt grants-430.txt r430-frozen-sha256.txt probe/spin-probe.mjs probe/compare.py probe/compare.txt probe/g430-auth.cjs claims-430-sketch-output.txt claims-430-planning-vs-sketch.diff precheck-full.log l57-check-c429.txt recompare/compare.txt lessons-before-430.md current-task-before-430.md update-backlog.py; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K11b probe-json head $(ls "$B/probe/head/"spin-*.json 2>/dev/null | wc -l) sketch $(ls "$B/probe/sketch/"spin-*.json 2>/dev/null | wc -l) sketch-rep $(ls "$B/probe/sketch-rep/"spin-*.json 2>/dev/null | wc -l)"
echo "K12 archive-429 $(cmp -s "$LOOP/tasks/round-429.md" "$B/current-task-before-430.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-12 SYS-2 A-R107-SWEEP-HELD-ENTER-TOOLBAR A-R429-REVIEW-SCAN-NEGATED-REPEAT A-R429-REVIEW-EDITOR-REPEAT-ESCAPE A-R429-REVIEW-ROW-ID-COLLISIONS STUDIO-VIS-4 STUDIO-VIS-10 TLM-SABA-B-12-FIREFOX-SAFARI | sed 's/^/K13 /' | cut -c1-160
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") head-spin-cells $(python3 -I -c "
import json,glob
print(sum(1 for f in glob.glob('$B/probe/head/spin-*.json') for v in json.load(open(f))['fields'].values() if v['spinVisibleOnHover']))")"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") all-red $(grep -c ' rc=1 red=' "$B/mutants/summary.txt")"
echo "K17 rows NF $(grep -oE "'NF[0-9]" $T/studio-number-field.test.ts 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')F10 $(grep -c "'F10:" $T/detail-panel-fit.test.tsx)"
echo "K18 covering $(wc -l < "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c429 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-429.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K21 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md") L61 $(grep -c '^61\. ' "$LOOP/lessons.md")"
echo "K23 gate429-review lows $(grep -cE '^[0-9]+\. \*\*Low' "$LOOP/gates/round-429/review.md") medium-plus $(grep -ciE '\*\*(medium|high|critical) ' "$LOOP/gates/round-429/review.md")"
echo "K24 gate429-time detail-panel-fit $(sed 's/\x1b\[[0-9;]*m//g' "$LOOP/gates/round-429/verify.log" | grep -oE 'detail-panel-fit\.test\.tsx \([0-9]+ tests\) [0-9]+ms') timeout-decls $(grep -c 'timeout' $T/detail-panel-fit.test.tsx)"
echo "K25 auth-c429 $(python3 -I -c "import json;o=json.load(open('$LOOP/c-round-429/auth/g428-auth.json'));print('pass',o['pass'])")"
echo "K26 mock-api $(test -f "$LOOP/mock-api/server.mjs" && echo present || echo absent)"
echo "K27 precheck-full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')"
echo "K28 probe-final $(tail -1 "$B/probe/compare.txt") focus-head-px $(python3 -I -c "
import json,glob
print(sorted({v['focus']['innerFocusVsRest']['changedPx'] for f in glob.glob('$B/probe/head/spin-*.json') for v in json.load(open(f))['fields'].values()}))")"
