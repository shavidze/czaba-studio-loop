#!/usr/bin/env bash
# Round 431 claims (SABA-B-12 stage 2a = STUDIO-VIS-2 radios). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-430
A=app/components/arrangement
ED=$A/ArrangementExportDialog.tsx
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate430 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-430.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-431.txt" | wc -l)"
sha256sum --quiet -c "$B/r431-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r431-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-431.txt")"
if git apply --check "$B/sketch-431.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc279-l4 $(sed -n 4p $Q/279-saba-b-12-export-radios.md 2>/dev/null || echo absent) | doc278-l4 $(sed -n 4p $Q/278-saba-b-12-number-spinbuttons.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 radios $(grep -c 'type="radio"' $ED) accent-brand $(grep -c 'accent-brand' $ED) radio-class-uses $(grep -c 'className={STUDIO_RADIO_CLASS}' $ED) constant-file $(test -f $A/studio-radio.ts && echo present || echo absent) radio-files $(grep -rl 'type="radio"' $A --include=*.tsx | xargs -r -n1 basename | tr '\n' ' ')"
echo "K8b progress $(grep -c '<progress' $ED) progress-class $(grep -c 'h-2 w-full accent-foreground' $ED)"
echo "K8c pinned DXA7-kept $(grep -c "\[EXPORT_DIALOG_PATH, 'accent-brand', 5\]" $T/affordance-colour-ui.test.tsx) DXL8-accent5 $(grep -c "expectCount(EXPORT_DIALOG_PATH, 'accent-brand', 5)" $T/label-status-colour-ui.test.tsx) DXL7c-progress $(grep -c "\['accent-foreground'\], \['accent-brand'\]" $T/label-status-colour-ui.test.tsx)"
echo "K8d focus-visible-global $(grep -c '^:focus-visible {' app/styles/app.css) pointer-suppress $(grep -c 'data-focus-source="pointer"\] :focus-visible' app/styles/app.css)"
echo "K8e tokens outline-strong $(grep -c -- '--color-outline-strong:' app/styles/app.css) brand-hover $(grep -c -- '--color-brand-hover:' app/styles/app.css) brand-foreground $(grep -c -- '--color-brand-foreground:' app/styles/app.css)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-431.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-431.sha256") review-names $(grep -c "$(cat "$B/sketch-431.sha256")" "$B/sketch-review.md" 2>/dev/null) diff-headers $(grep -c '^diff --git' "$B/sketch-431.patch.txt")"
for f in sketch-431.patch.txt sketch-431.sha256 sketch-review.md mutants/run.py mutants/summary.txt precheck-a2.log precheck-typecheck.log precheck-biome6.log covering-files.txt grants-431.txt r431-frozen-sha256.txt probe/radio-probe.mjs probe/compare-radio.py probe/compare.txt probe/contrast.txt probe/head/radio-probe.json probe/sketch/radio-probe.json probe/radio-extra-probe.mjs probe/compare-extra.py probe/compare-extra.txt probe/sketch-extra/radio-extra-probe.json probe/head-extra/radio-extra-probe.json precheck-full.log precheck-lint.log update-backlog-2.py l57-check-c430.txt recompare/compare.txt update-backlog.py; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-430 $(cmp -s "$LOOP/tasks/round-430.md" "$LOOP/b-round-430/current-task-before-431.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-12 STUDIO-VIS-2 SABA-B-12-STAGE-2B-PROGRESS ARCH-SPLIT SABA-LANE-RESIZE-HANDLE A-R430-REVIEW-NF2-TYPE-BOUNDARY A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT TLM-SABA-B-12-FIREFOX-SAFARI | sed 's/^/K13 /' | cut -c1-160
echo "K13b legacy-policy $(grep -c '"id": "LEGACY-REMOVAL-POLICY"' "$LOOP/backlog.json")"
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt")"
echo "K15b browser-extra $(tail -1 "$B/probe/compare-extra.txt")"
echo "K15c full-sketch $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') lint $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-lint.log" | grep -E '^Found [0-9]+ warnings')"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") all-red $(grep -c ' rc=1 red=' "$B/mutants/summary.txt")"
echo "K17 rows RD $(grep -oE "'RD[0-9]" $T/studio-radio.test.ts $T/export-dialog-a11y-copy.test.tsx 2>/dev/null | awk -F"'" '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K18 covering $(wc -l < "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c430 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-430.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K21 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null)"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md") L61 $(grep -c '^61\. ' "$LOOP/lessons.md")"
