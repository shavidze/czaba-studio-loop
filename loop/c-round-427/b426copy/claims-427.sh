#!/usr/bin/env bash
# Round 427 claims (SYS-2 stage 2b-i: held Enter on the footer toggles, library tree, detail toggle and video dock). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-426
A=app/components/arrangement
LI=$A/ArrangementLibrary.tsx; LP=$A/ArrangementLibraryPreview.tsx; DP=$A/ArrangementDetailPanel.tsx; VD=$A/ArrangementVideoDock.tsx; WS=$A/StudioWorkspace.tsx
FIVE="$LI $LP $DP $VD $WS"
TP=app/lib/arrangement/__tests__/panel-held-enter-ui.test.tsx
TM=app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx
D=docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate426 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-426.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-427.txt" | wc -l)"
sha256sum --quiet -c "$B/r427-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r427-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-427.txt")"
if git apply --check "$B/sketch-427.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc275-l4 $(sed -n 4p $D 2>/dev/null || echo absent) doc274-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K8 inline-enter-repeat $(for f in $FIVE; do printf '%s=%s ' "$(basename $f .tsx)" "$(grep -c "event.key === 'Enter' && event.repeat" $f)"; done)library-private-fn $(grep -c 'preventRepeatedLibraryEnter' $LI) helper-uses $(for f in $FIVE; do printf '%s=%s ' "$(basename $f .tsx)" "$(grep -c 'preventRepeatedEnterKeyDown' $f)"; done)"
echo "K9 scan-2bi $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $FIVE | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9b scan-folder $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K9c stage-2b-ii-left $(python3 -I "$LOOP/b-round-425/button-guard-scan-enter.py" $A/*.tsx | grep -vE 'ENTER-GUARD' | awk -F'\t' '{split($1,a,":"); print a[1]}' | xargs -n1 basename | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K10 sketch-sha $(sha256sum "$B/sketch-427.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-427.sha256")"
for f in sketch-427.patch.txt sketch-427.sha256 sketch-review.md precheck-typecheck.log precheck-lint.log precheck-biome7.log precheck-a2.log precheck-full.log covering-files.txt grants-427.txt r427-frozen-sha256.txt mutants/run.py mutants/summary.txt probe/held-enter-2bi.mjs probe/compare.py probe/compare.txt probe/smoke-2bi.mjs probe/smoke-compare.txt probe/head/smoke-1440x900.json probe/head/smoke-1280x720.json tools/make-sketch.py data/scan-all-head.txt data/l50-focus-origins.txt update-backlog.py update-backlog-2.py update-backlog-3.py sketch-delta-82a785ce-to-final.patch.txt sketch-427-v1-82a785ce.patch.txt; do test -f "$B/$f" && echo "K11 exists $f" || echo "K11 MISSING $f"; done
echo "K12 archive-426 $(cmp -s "$LOOP/tasks/round-426.md" "$B/current-task-before-427.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-2 A-R107-SWEEP-HELD-ENTER-TOOLBAR A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER TL-R425-09-HM5-GESTURE-ROW B-R426-GESTURE-REFUSAL-REPEAT-STATUS INFO-TL-R426-MOVING-DRAG-REPEAT | sed 's/^/K13 /'
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") head-defect-cells $(python3 -I -c "
import json,glob
print(sum(1 for f in glob.glob('$B/probe/head/*.json') if json.load(open(f)).get('heldChanged')))")"
echo "K16 mutants $(wc -l < "$B/mutants/summary.txt") head-src $(grep -c '^MU-HEAD-SRC: red HP1,HP2,HP3,HP4,HP5,HP6,HP7,HP8,HP9 (9 failed | 18 passed (27))' "$B/mutants/summary.txt") single-row $(grep -cE '^MU-[A-Z-]+: red HP[0-9] \(1 failed \| 26 passed \(27\)\)' "$B/mutants/summary.txt") expand $(grep -c '^MU-VIDEO-EXPAND: red HP7,HP8,HP9 (3 failed' "$B/mutants/summary.txt")"
echo "K17 tests rows-HP $(grep -cE "^    it\('HP[0-9]+ " $TP 2>/dev/null || echo 0) rows-HM $(grep -cE "^    it\('HM[0-9]+b? " $TM)"
echo "K18 covering $(grep -c '^app/' "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K21 c426 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-426.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K22 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K23 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K24 gesture-enter-branch $(grep -c "event.key === 'Enter')))" $WS) blocked-status $(grep -c 'current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)' $WS) window-enter-add $(grep -c "current.addSourceToActiveTrack();" $WS)"
echo "K25 precheck-full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 "$B/precheck-full.log")"
echo "K26 search-enter $(sed -n '/const handleSearchKeyDown/,/^  };/p' $LI | grep -c "'Enter'")"
echo "K27 smoke $(tr "\n" " " < "$B/probe/smoke-compare.txt")"
echo "K28 signal $(python3 -I -c "import json;b=json.load(open(\"$LOOP/backlog.json\"));print([s[\"id\"] for s in b[\"architecture_signals\"] if s.get(\"id\")==\"SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT\"])")"
echo "K29 detail-toggle-space-only $(sed -n '/const handleToggleKeyDown/,/^  };/p' $DP | grep -c "event.key !== ' '") option-enter-not-repeat $(sed -n '/const handleOptionKeyDown/,/^  };/p' $LI | grep -c 'if (!event.repeat) {')"
echo "K30 window-skips-typing $(grep -c 'isTypingTarget(event.target)' $WS) dock-focus-expand $(grep -c 'expandButtonRef.current?.focus();' $VD)"
echo "K31 l50 $(grep -E '^(app|[0-9])' "$B/data/l50-focus-origins.txt" | tr '\n' ' ')"
echo "K32 gate426-times $(sed 's/\x1b\[[0-9;]*m//g' "$LOOP/gates/round-426/verify.log" | grep -oE '(TC10|CP12c|CP12d)[^0-9]*[^ ].* ([0-9]+)ms' | grep -oE '^(TC10|CP12c|CP12d)|[0-9]+ms$' | tr '\n' ' ')"
