#!/usr/bin/env bash
# Round 434 claims (SABA-B-12 stage 3b = Studio dialog scrollbar). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-433
A=app/components/arrangement
M=app/components/ui/Modal.tsx
SK=$A/studio-scrollbar.ts
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate433 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-433.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-434.txt" | wc -l)"
sha256sum --quiet -c "$B/r434-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r434-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-434.txt")"
if git apply --check "$B/sketch-434.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc282-l4 $(sed -n 4p $Q/282-saba-b-12-dialog-scrollbar.md 2>/dev/null || echo absent) | doc281-l4 $(sed -n 4p $Q/281-saba-b-12-search-clear.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 modal styled-scrollbar-literal $(grep -c "styled-scrollbar" $M) prop-decl $(grep -c 'scrollbarClassName?: string;' $M) default $(grep -c "scrollbarClassName = 'styled-scrollbar'," $M)"
echo "K8b skin dialog-const $(grep -c 'export const STUDIO_DIALOG_SCROLLBAR_CLASS' $SK) gutter $(grep -c 'scrollbar-gutter:stable' $SK) lane-const $(grep -c 'export const STUDIO_SCROLLBAR_CLASS' $SK)"
echo "K8c dialogs-pass-skin sheet $(grep -c 'scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}' $A/ArrangementShortcutSheet.tsx) export $(grep -c 'scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}' $A/ArrangementExportDialog.tsx) legacy $(grep -c 'scrollbarClassName' app/components/studio/ExportDialog.tsx)"
echo "K8d modal-files-in-arrangement $(grep -lE '<Modal(\s|$)' $A/*.tsx | xargs -r -n1 basename | sort | tr '\n' ' ')modal-users-app $(grep -rlE '<Modal(\s|$)' app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K8e teal-css $(grep -c 'scrollbar-color: hsl(175 85% 46% / 0.4) transparent' app/styles/base/utilities.css) utilities-unlayered $(grep -c '@layer' app/styles/base/utilities.css)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-434.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-434.sha256") review-names $(grep -c "$(cat "$B/sketch-434.sha256")" "$B/sketch-review.md") diff-headers $(grep -c '^diff --git' "$B/sketch-434.patch.txt")"
for f in sketch-434.patch.txt sketch-434.sha256 sketch-review.md mutants/summary.txt mutants/run.py precheck-covering.log precheck-typecheck.log precheck-lint.log covering-files.txt grants-434.txt r434-frozen-sha256.txt probe/scrollbar-probe.mjs probe/compare-scrollbar.py probe/compare.txt probe/compare-head.txt probe/contrast.txt probe/head/scrollbar.json probe/sketch/scrollbar.json current-task-before-434.md l57-check-c433.txt probe/neighbour-clear/compare.txt lessons-before-434.md reference-scrollbar.txt; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-433 $(cmp -s "$LOOP/tasks/round-433.md" "$B/current-task-before-434.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-12 SABA-B-12-SEARCH-CANCEL SABA-B-12-DIALOG-SCROLLBAR TLM-SABA-B-12-FIREFOX-SAFARI ARCH-SIGNAL-STUDIO-CONTROLS | sed 's/^/K13 /' | cut -c1-160
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") | head $(tail -1 "$B/probe/compare-head.txt" | cut -c1-40)"
echo "K15c lint $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-lint.log" | grep -E '^Found [0-9]+ warnings')"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") red $(grep -c '^M[0-9].* red: DS' "$B/mutants/summary.txt") green-sketch $(grep -c '^sketch-green red: none' "$B/mutants/summary.txt")"
echo "K17 rows DS $(grep -oE "it\('DS[0-9]" $T/studio-dialog-scrollbar.test.tsx 2>/dev/null | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K18 covering $(wc -l < "$B/covering-files.txt") run $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-covering.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c433 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-433.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md") L61 $(grep -c '^61\. ' "$LOOP/lessons.md") L61-scrollbar $(grep '^61\. ' "$LOOP/lessons.md" | grep -c 'progress bar, scrollbar)') L61-hide-scrollbars $(grep '^61\. ' "$LOOP/lessons.md" | grep -c 'hide-scrollbars')"
echo "K21 stem-lanes agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null) direction-decision $(test -f /home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md && echo present || echo absent)"
echo "K8f store-modal-users confirmdialog $(grep -rlE '<ConfirmDialog(\s|$)' app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K13b root-req $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([x['status'][:40] for x in b['root_requests_b'] if x.get('id')=='ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS'])") request-file $(test -f $LOOP/b-round-433-checkpoint-request.md && echo present || echo absent)"
