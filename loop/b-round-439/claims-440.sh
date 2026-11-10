#!/usr/bin/env bash
# Round 440 claims (SYS-1 stage 1, test-only). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-439
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate439 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-439.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-440.txt" | wc -l)"
sha256sum --quiet -c "$B/r440-frozen-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 frozen $(wc -l < "$B/r440-frozen-sha256.txt") rc $K3RC"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K4RC=$?; echo "K4 protected rc $K4RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-440.txt")"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K5 tree-equals-sketch $eq/6"
if git apply --check -p1 "$B/sketch-440.patch.txt" 2>/dev/null; then echo "K6 sketch-applies yes"; else echo "K6 sketch-applies no"; fi
echo "K7 class-finders $(cat "$B/covering-files.txt" | xargs grep -hcE "querySelector(All)?(<[^>]+>)?\(['\"][a-z]*\.(text-|font-)" | paste -sd+ | bc)"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 self-compares $(grep -hcE 'studioExportStrings\.(exportCancelled|exportCancelledEncoder|wavWorkerStalled)\b' $T/export-cancel.test.ts $T/export-wav.test.ts | paste -sd+ | bc)"
echo "K10 lrs-exact-classname $(grep -cE 'className\)\.toBe\($' $T/library-row-strings-ui.test.tsx) $(grep -cE "className\)\.toBe\('flex gap-2" $T/library-row-strings-ui.test.tsx)"
for f in sketch-440.patch.txt sketch-440.sha256 sketch-paths.txt grants-440.txt covering-files.txt r440-frozen-sha256.txt typecheck-sketch.log lint-sketch.log precheck-full.clean.log covering-sketch.json l31-headroom.txt mutants/run-mutants.sh mutants/results.jsonl sketch-review.md tech-lead-review-v1.md claims-440-planning-output.txt claims-440-expected-after-A.diff.txt c5-sweep-sketch.txt sketch-files/app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx wrapper-rerun/results.jsonl ../b-round-437/probe/play-status.mjs ../b-round-436/probe/press-export-probe.mjs; do test -f "$B/$f" && echo "K11 exists $f" || echo "K11 MISSING $f"; done
echo "K12 archive-439 $(cmp -s "$LOOP/tasks/round-439.md" "$B/current-task-before-440.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-1 RETRO200-CLASS-SELECTORS GATE146-S4-LRS3-CLASSNAME-PINS C-R127-L1f-SELF-COMPARE-TESTS GATE164-OV1-FRAGILE GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR GATE81-S2-UM8-SOURCE-TEXT SYS-R435-SOURCE-SCAN-HELPER C-R438-01-NF2-WRAPPER-TAG-NARROWING A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG 2>/dev/null | awk '{$2="";print "K13",$0}'
echo "K14 open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[e['id'] for e in b['open_findings'] if str(e.get('severity','')).lower() in ('critical','high','medium') and not str(e.get('status','')).lower().startswith(('closed','done','resolved','fixed','wontfix','deferred_user','merged'))]
print(len(o),' '.join(sorted(o)))")"
echo "K15 backlog $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));d=b['decisions_log_b'];print('v'+str(b['version']),d[-1]['id'])")"
echo "K16 c439 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-439.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K17 review-names-sha $(grep -c "$(cut -c1-64 "$B/sketch-440.sha256")" "$B/sketch-review.md" 2>/dev/null) $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
echo "K18 mutants $(python3 -I -c "
import json
rows=[json.loads(l) for l in open('$B/mutants/results.jsonl')]
print(' '.join(r['tree'][0]+':'+r['id'].split('-')[0]+':'+str(r['rc']) for r in rows))")"
echo "K19 full-sketch $(grep -E 'Test Files|Tests  |^rc ' "$B/precheck-full.clean.log" | tr -s ' ' | tr '\n' ' ')"
echo "K20 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K21 doc286 $(ls $Q/286-* 2>/dev/null | wc -l) last-doc $(ls $Q/ | sort | tail -1) template $(test -f docs/implementation/TEMPLATE.md && echo yes || echo no)"
echo "K22 wrapper-rerun $(python3 -I -c "
import json
print(' '.join(r['tree'][:3]+':'+r['id'].split('-')[0]+':'+str(r['rc']) for r in map(json.loads,open('$B/wrapper-rerun/results.jsonl'))))")"
echo "K23 overview-hooks $(grep -cE 'data-overview-(lane|bar|outline)' app/components/arrangement/ArrangementOverview.tsx) testids $(grep -c 'data-testid=' app/components/arrangement/ArrangementOverview.tsx)"
echo "K24 video-sound-line-tests $(grep -rlE 'arrangement-export-video-sound' app perf e2e --include='*.test.*' --include='*.spec.*' 2>/dev/null | wc -l)"
echo "K25 wav-failed-composition $(grep -n 'wavWorkerFailed} boom' app/lib/arrangement/__tests__/export-wav.test.ts | cut -d: -f1)"
echo "K26 lrs-describe-timeout $(grep -n "describe('library row status strings (V-0.5a)', { timeout: 15_000 }" app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx | cut -d: -f1) lrs4-line $(grep -n "it('LRS4:" app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx | cut -d: -f1)"
echo "K27 strings-test-literal-pins $(grep -cE "'Export cancelled — no file was created\.',|'Export cancelled — no file was created\. The MP3 encoder will load again on the next MP3 export\.',|'Writing WAV stalled — the worker has not responded for 30 seconds\.'," app/lib/arrangement/__tests__/strings.test.ts)"
echo "K28 c5-sweep-on-sketch $(tail -1 "$B/c5-sweep-sketch.txt")"
