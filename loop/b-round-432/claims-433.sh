#!/usr/bin/env bash
# Round 433 claims (SABA-B-12 stage 3 = shortcut sheet search clear). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-432
A=app/components/arrangement
SH=$A/ArrangementShortcutSheet.tsx
LB=$A/ArrangementLibrary.tsx
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate432 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-432.json'));print(a['status'],a['commit'][:7],'head-field',a['head'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-433.txt" | wc -l)"
sha256sum --quiet -c "$B/r433-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r433-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-433.txt")"
if git apply --check "$B/sketch-433.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc281-l4 $(sed -n 4p $Q/281-saba-b-12-search-clear.md 2>/dev/null || echo absent) | doc280-l4 $(sed -n 4p $Q/280-saba-b-12-export-progress.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 sheet search-inputs $(grep -c 'type="search"' $SH) cancel-hidden $(grep -c '\[&::-webkit-search-cancel-button\]:hidden' $SH) clear-label $(grep -c 'studioShortcutSheetStrings.clearSearch' $SH) px-3-input $(grep -c 'bg-background px-3 py-2 text-sm' $SH)"
echo "K8b library cancel-hidden $(grep -c '\[&::-webkit-search-cancel-button\]:hidden' $LB) clear-testid $(grep -c 'data-testid="arrangement-library-search-clear"' $LB) esc-clears $(grep -c "if (event.key === 'Escape') {" $LB) hadfocus-guard $(grep -c 'const hadFocus = document.activeElement === event.currentTarget;' $LB)"
echo "K8c sheet esc-capture-prevent $(grep -c "if (event.key === 'Escape') {" $SH) focusable-selector $(grep -c "'button:not(\[disabled\]), input:not(\[disabled\]), \[href\], \[tabindex\]:not(\[tabindex=\"-1\"\])'" $SH) modal-esc $(grep -c "if (e.key === 'Escape') {" app/components/ui/Modal.tsx)"
echo "K8d search-files $(grep -rl 'type="search"' $A --include=*.tsx | xargs -r -n1 basename | sort | tr '\n' ' ')"
echo "K8e strings sheet-clearSearch $(python3 -I -c "import re;s=open('app/lib/arrangement/strings.ts').read();m=re.search(r'export const studioShortcutSheetStrings = \{(.*?)\n\};',s,re.S);print(m.group(1).count('clearSearch'))") library-clearSearch-pin $(grep -c "clearSearch: 'Clear search'," $T/strings.test.ts)"
echo "K8f modal-scrollbar styled-scrollbar $(grep -c 'styled-scrollbar' app/components/ui/Modal.tsx) teal-color $(grep -c 'scrollbar-color: hsl(175 85% 46% / 0.4) transparent' app/styles/base/utilities.css)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-433.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-433.sha256") review-names $(grep -c "$(cut -c1-16 "$B/sketch-433.sha256")" "$B/sketch-review.md" 2>/dev/null) diff-headers $(grep -c '^diff --git' "$B/sketch-433.patch.txt")"
for f in sketch-433.patch.txt sketch-433.sha256 sketch-review.md mutants/summary.txt mutants/run.py precheck-covering.log precheck-typecheck.log precheck-lint.log precheck-full.log covering-files.txt grants-433.txt r433-frozen-sha256.txt probe/clear-probe.mjs probe/sheet-probe.mjs probe/compare-clear.py probe/compare.txt probe/compare-head.txt probe/contrast.txt probe/head/clear.json probe/sketch/clear.json update-backlog.py recompare/compare.txt recompare/compare-neighbours.txt l57-check-c432.txt current-task-before-433.md; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-432 $(cmp -s "$LOOP/tasks/round-432.md" "$B/current-task-before-433.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-12 SABA-B-12-STAGE-2B-PROGRESS SABA-B-12-SEARCH-CANCEL SABA-B-12-DIALOG-SCROLLBAR TLM-SABA-B-12-FIREFOX-SAFARI ARCH-SIGNAL-STUDIO-CONTROLS A-R432-REVIEW-RV432-5-PG2-SPREAD | sed 's/^/K13 /' | cut -c1-160
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") | head $(tail -1 "$B/probe/compare-head.txt")"
echo "K15b full-sketch $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K15c lint $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-lint.log" | grep -E '^Found [0-9]+ warnings')"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") red $(grep -c '^M[0-9].* red: [A-Z]' "$B/mutants/summary.txt") green-sketch $(grep -c '^sketch-green red: none' "$B/mutants/summary.txt")"
echo "K17 rows SC $(grep -oE "it\('SC[0-9]" $T/shortcut-sheet-ui.test.tsx | sort | uniq -c | tr -s ' ' | tr '\n' ' ') SF $(grep -oE "it\('SF[0-9]" $T/studio-search-field.test.ts 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K18 covering $(wc -l < "$B/covering-files.txt") run $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-covering.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c432 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-432.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K21 stem-lanes agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null) direction-decision $(test -f /home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md && echo present || echo absent)"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md") L61 $(grep -c '^61\. ' "$LOOP/lessons.md") L47 $(grep -c '^47\. ' "$LOOP/lessons.md")"
