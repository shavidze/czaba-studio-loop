#!/usr/bin/env bash
# Round 426 claims (SYS-2 stage 2a: held Enter on lane, group, master and tempo-row buttons). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-425
A=app/components/arrangement
LA=$A/ArrangementLane.tsx; GH=$A/ArrangementGroupHeader.tsx; MA=$A/ArrangementMaster.tsx; TE=$A/ArrangementTempoRow.tsx; TR=$A/ArrangementTransport.tsx
SD=$A/studio-soft-disabled.ts; RS=$A/studio-repeat-safe.ts
T=app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx
TH=app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx
D=docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate424 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-424.json'));print(a['status'],a['commit'][:7])") gate425 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-425.json'));print(a['status'])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-426.txt" | wc -l)"
sha256sum --quiet -c "$B/r426-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r426-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-426.txt")"
if git apply --check "$B/sketch-426.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc274-l4 $(sed -n 4p $D 2>/dev/null || echo absent)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K8 helper transport-local-fn $(grep -c '^function preventRepeatedEnterKeyDown' $TR) transport-onKeyDown-helper $(grep -c 'onKeyDown={preventRepeatedEnterKeyDown}' $TR) transport-inline-enter-repeat $(grep -c "event.key === 'Enter' && event.repeat" $TR) shared-module $(test -f $RS && echo present || echo absent) soft-never $(grep -c 'onKeyDown?: never;' $SD)"
echo "K9 scan-2a $(python3 -I "$B/button-guard-scan-enter.py" $LA $GH $MA $TE | awk -F'\t' '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K10 sketch-sha $(sha256sum "$B/sketch-426.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-426.sha256")"
for f in sketch-426.patch.txt sketch-426.sha256 sketch-review.md precheck-typecheck.log precheck-lint.log precheck-biome8.log precheck-a2.log covering-files.txt grants-426.txt r426-frozen-sha256.txt mutants/run.py mutants/summary.txt probe/held-enter-2a.mjs probe/compare.py probe/compare.txt probe/fade-names.mjs probe/names-head-fade.json probe/names-head-trim.json probe/names-sketch-fade.json probe/names-sketch-trim.json probe/smoke-focus.mjs probe/head/smoke-focus-1440x900.json probe/head/smoke-focus-1280x720.json precheck-full.log sketch-delta-68e6c66a-to-c97f080f.patch.txt probe/rvm-cold-1440.json button-guard-scan-enter.py data/scan-2a-head.txt data/scan-2a-sketch.txt data/scan-all-head.txt l57-check-c425.txt update-backlog.py update-backlog.done; do test -f "$B/$f" || echo "K11 MISSING $f"; done; echo "K11 artifacts checked"
echo "K12 archive-425 $(cmp -s "$LOOP/tasks/round-425.md" "$B/current-task-before-426.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-2 A-R107-SWEEP-HELD-ENTER-TOOLBAR A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER C-R425-01-RVM-COLD-DEV-EMPTY C-R425-02-FOLLOW-SCROLL-OFFSET INFO-B425-SCANNER-SPACE-AS-ENTER | sed 's/^/K13 /'
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt")"
echo "K16 mutants $(wc -l < "$B/mutants/summary.txt") single-row $(grep -cE '^MU-(LANE|PAN|GROUP|MASTER|METRONOME)[A-Z-]*: red HM[0-9]+b?( \(| ,)' "$B/mutants/summary.txt") two-row $(grep -cE '^MU-GROUP-(NAME|INPUT): red HM1[01]b?,HM11b? \(' "$B/mutants/summary.txt") tsc $(grep -c '^MU-SPREAD-TYPE: tsc rc 2' "$B/mutants/summary.txt") logs-17 $(cat "$B"/mutants/mutant-*.log | sed 's/\x1b\[[0-9;]*m//g' | grep -cE '^ +Tests .*\(17\)$')"
echo "K17 tests rows-HM $(grep -cE "^    it\('HM[0-9]+b? " $T 2>/dev/null || echo 0) TH5-fit-unguarded $(grep -c "TH5: a repeated Enter on the toolbar Fit button is not prevented" $TH) fit-onKeyDown $(grep -B2 -A3 'onClick={onFit}' $TR | grep -c 'onKeyDown')"
echo "K18 covering $(grep -c '^app/' "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 names-sketch fade $(python3 -I -c "import json;o=json.load(open('$B/probe/names-sketch-fade.json'));print(o['maxSize'],o['meanSize'],o['freq'].get('ArrangementLane',0),o['freq'].get('Memo(ArrangementLaneViewInner)',0),o['freq'].get('ArrangementLaneViewInner',0))") trim $(python3 -I -c "import json;o=json.load(open('$B/probe/names-sketch-trim.json'));print(o['maxSize'],o['meanSize'],o['freq'].get('ArrangementLane',0),o['freq'].get('Memo(ArrangementLaneViewInner)',0))")"
echo "K20b names-head fade $(python3 -I -c "import json;o=json.load(open('$B/probe/names-head-fade.json'));print(o['maxSize'],o['meanSize'],o['freq'].get('ArrangementLane',0),o['freq'].get('Memo(ArrangementLaneViewInner)',0),o['freq'].get('ArrangementLaneViewInner',0))") trim $(python3 -I -c "import json;o=json.load(open('$B/probe/names-head-trim.json'));print(o['maxSize'],o['meanSize'],o['freq'].get('ArrangementLane',0),o['freq'].get('Memo(ArrangementLaneViewInner)',0))")"
echo "K21 c425 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-425.json'));print(c['taskStatus'],len(c['failed']),len(c['bugs']),c['bugs'][0]['severity'],c['browserVerified'],c['realVerified'])")"
echo "K22 stem-lanes-answer transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-mentions-answer $(grep -ciE 'saba.s answer|პასუხი:|approved by saba|decision:' "$LOOP/user-review/AGREE-STEM-LANES.md")"
echo "K23 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K24 smoke-focus-head $(for v in 1440x900 1280x720; do python3 -I -c "import json;r=json.load(open('$B/probe/head/smoke-focus-$v.json'));print('$v', 'err' in r or 'error' in r, r['clicks']['metronome'], r['ctrlSolo'], r['groupFold'], r['panReset']['active']['type'], r['panReset']['active']['focusVisible'], r['groupEnter']['active']['testid'], r['groupEnter']['active']['outlineStyle'], r['groupEnter']['active']['outlineWidth'], len(r['pageErrors']))"; done | tr '\n' ' ')"
echo "K25 precheck-full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ')$(tail -1 "$B/precheck-full.log")"
