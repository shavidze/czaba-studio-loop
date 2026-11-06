#!/usr/bin/env bash
# Round 371 claims (L29 + L56). Run from the loop root: bash b-round-370/claims-371.sh
# STORE=<tree> runs the same commands on another tree (the sketch: STORE=/home/runner/b371-scratch/sc).
S=${STORE:-/home/runner/czaba-project/store}
L=$(pwd)
A=$S/app/components/arrangement
T=$S/app/lib/arrangement/__tests__
echo "K1 gate370: $(python3 -I -c "import json;d=json.load(open('gates/gate-round-370.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head: $(git -C $S rev-parse --short=7 HEAD 2>/dev/null) status-lines: $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 GroupHeader useArrangement lines: $(grep -c 'useArrangement' $A/ArrangementGroupHeader.tsx) soloState from arrangement: $(grep -c 'trackGroupSoloState(arrangement, group.id)' $A/ArrangementGroupHeader.tsx)"
echo "K4 wrapper plain memo: $(grep -c '^const ArrangementGroupHeaderWithSelection = memo(ArrangementGroupHeaderWithSelectionInner);' $A/StudioWorkspace.tsx) overview per edit: $(grep -c 'overviews.set(row.id, trackGroupOverviewClips(arrangement, row.id));' $A/StudioWorkspace.tsx) candidates per edit: $(grep -c 'candidates.set(row.id, trackGroupDescendantTrackIds(arrangement, row.id));' $A/StudioWorkspace.tsx)"
echo "K5 leaf render sites (app, perf): $(grep -rn '<ArrangementGroupHeader$' $S/app $S/perf | wc -l)"
echo "K6 playback store error text: $(grep -c "'useArrangementIsPlaying must be used within an ArrangementProvider'" $S/app/contexts/ArrangementContext.tsx) no-arg lines (definition + callers): $(grep -c 'useArrangementPlaybackStoreContext()' $S/app/contexts/ArrangementContext.tsx)"
echo "K7 tests asserting 'useArrangementIsPlaying must be used' (app, perf, e2e): $(grep -rl 'useArrangementIsPlaying must be used' $S/app $S/perf $S/e2e --include='*.test.*' --include='*.spec.*' 2>/dev/null | wc -l)"
echo "K8 runtime-name keys 'ArrangementGroupHeader' (tests, perf): $(grep -rl "'ArrangementGroupHeader'" $S/app $S/perf --include='*.test.*' --include='*.spec.*' --include='*.ts' 2>/dev/null | grep -E '__tests__|perf/' | xargs -r -n1 basename | sort | tr '\n' ' ')"
echo "K9 source scanners reading ArrangementGroupHeader.tsx: $(grep -rlE "ArrangementGroupHeader\.tsx" $T | sort | xargs -n1 basename | tr '\n' ' ')"
echo "K10 protected: $(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>&1 | wc -l) failing lines"
echo "K11 doc 238 free: $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^238-') last: $(ls $S/docs/implementation/2026/quarter-IV/ | sort | tail -1)"
echo "K12 frozen: $(cd $S && sha256sum -c --quiet $L/b-round-370/r371-frozen-sha256.txt 2>&1 | wc -l) failing lines, entries $(wc -l < b-round-370/r371-frozen-sha256.txt)"
echo "K13 demo track groups: $(grep -c 'groups' $S/app/data/studio-lab-demo.ts) interactions spec Ctrl+G: $(grep -cE "Control\+g|Control\+G|'KeyG'" $S/perf/studio-lab-interactions.perf.spec.ts) fader spec group step: $(grep -c "step = 'stop + Ctrl+G group';" $S/perf/studio-lab.perf.spec.ts)"
echo "K14 HEAD red rows (new tests on HEAD): $(sed 's/\x1b\[[0-9;]*m//g' b-round-370/head-new-rows.log | grep -E '^ +×' | sed -E 's/^ +× ([A-Za-z0-9]+).*/\1/' | sort | tr '\n' ' ')"
for m in b-round-370/mutants/mutant-*.log; do echo "K15 $(basename $m .log) red: $(sed 's/\x1b\[[0-9;]*m//g' $m | grep -E '^ +×' | sed -E 's/^ +× ([A-Za-z0-9]+).*/\1/' | sort | tr '\n' ' ')"; done
echo "K16 precheck-full: $(sed 's/\x1b\[[0-9;]*m//g' b-round-370/precheck-full.log | grep -E '^ +(Test Files|Tests) ' | tr -s ' ' | tr '\n' ';')"
echo "K17 interactions spec on sketch v1: $(grep -v WebServer b-round-370/perf-sketch.log | grep -E '^rc |passed' | tr '\n' ';') rowcmp: $(grep -E 'differing|failures' b-round-370/perf-sketch-rowcmp.txt | tr '\n' ';')"
echo "K17b fader spec on sketch v2: $(grep -v WebServer b-round-370/perf-fader-sketch.log | grep -E '^rc |passed|failed' | tr '\n' ';')"
for f in b-round-370/sketch.patch.txt b-round-370/sketch-dispatched.sha256 b-round-370/sketch-files-sha256.txt b-round-370/sketch-v1.patch.txt b-round-370/sketch-v1.sha256 b-round-370/sketch-v1-to-v2.diff.txt b-round-370/sketch-review.md b-round-370/sketch-review-v1.txt b-round-370/sketch-typecheck.log b-round-370/sketch-biome.log b-round-370/sketch-lint.log b-round-370/precheck-full.log b-round-370/head-new-rows.log b-round-370/perf-sketch.log b-round-370/perf-sketch-latest-interactions.json b-round-370/perf-sketch-rowcmp.txt b-round-370/perf-fader-sketch.log b-round-370/perf-fader-sketch-latest.json b-round-370/r371-frozen-sha256.txt b-round-370/claims-371-output.txt b-round-370/claims-371-sketch-output.txt b-round-370/probe/group-probe.mjs b-round-370/probe/group-head.json b-round-370/mutants.py; do test -f $f && echo "K18 ok $f" || echo "K18 MISSING $f"; done
echo "K19 lessons lines: $(wc -l < lessons.md)"
echo "K20 regression-last: $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K21 tasks/round-370.md sha256: $(sha256sum tasks/round-370.md | cut -c1-16)"
echo "K22 l57 c-round-370: $(python3 -I tools/l57-check.py c-round-370.json /tmp/l57-370-claims.txt >/dev/null 2>&1; echo rc $?)"
echo "K26 sketch files sha: $(cd $S && sha256sum -c --quiet $L/b-round-370/sketch-files-sha256.txt 2>/dev/null | wc -l) failing lines (0 = the five files equal B sketch)"
echo "K23 SS8a row: $(grep -c "'SS8a a folded group header does not re-render" $T/selection-wrappers-render.test.tsx)"
echo "K24 useArrangement() consumer files (components/arrangement, non-test): $(grep -l 'useArrangement()' $A/*.tsx | wc -l)"
echo "K25 HEAD browser probe (group-head.json): $(python3 -I -c "
import json;d=json.load(open('b-round-370/probe/group-head.json'))
for v in ('1440x900','1280x720'):
  r=d[v];print(v,'groups',r.get('groupHeadersAfter'),'solo',r.get('soloInitial'),r.get('soloAfterClick',{}).get('data'),r.get('soloAfterSecondClick'),'member',(r.get('soloAfterMemberSolo') or {}).get('data'),'mute',r.get('muteAfterClick'),r.get('muteAfterUndo'),'vol',r.get('volumeBefore'),r.get('volumeAfterArrowDown'),r.get('volumeAfterUndo'),'rename',r.get('nameAfterRename'),r.get('focusAfterRename'),'renders',r.get('rendersOnOutsideMute'),'err',r.get('error'),end='; ')")"
