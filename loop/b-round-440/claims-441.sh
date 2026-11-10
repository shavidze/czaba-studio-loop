#!/usr/bin/env bash
# Round 441 claims (SYS-1 stage 2). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-440
T=app/lib/arrangement/__tests__
OV=app/components/arrangement/ArrangementOverview.tsx
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD | cut -c1-7) gate440 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-440.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status total $(git status --short --untracked-files=all | wc -l) outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-441.txt" | wc -l)"
sha256sum --quiet -c "$B/r441-frozen-sha256.txt" >/dev/null 2>&1; K3RC=$?; echo "K3 frozen $(wc -l < "$B/r441-frozen-sha256.txt") rc $K3RC"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; K4RC=$?; echo "K4 protected rc $K4RC granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-441.txt")"
eq=0; while read p; do cmp -s "$p" "$B/sketch-files/$p" && eq=$((eq+1)); done < "$B/sketch-paths.txt"; echo "K5 tree-equals-sketch $eq/$(wc -l < "$B/sketch-paths.txt")"
if git apply --check -p1 "$B/sketch-441.patch.txt" 2>/dev/null; then echo "K6 sketch-applies yes"; else echo "K6 sketch-applies no"; fi
echo "K7 ov1-source-pin $(grep -c 'inset-0 rounded-panel border border-outline" />' $T/studio-theme-obsidian.test.tsx)"
echo "K8 positional-overview-finders $(grep -hcE "overview(\?)?\.children\[|overview(\?)?\.firstElementChild|root\?\.children\[1\]" $T/panel-radius-ui.test.tsx $T/content-colour-ui.test.tsx $T/overview-visibility-ui.test.tsx | paste -sd+ | bc)"
echo "K9 um8-dialog-source-read $(grep -c 'ArrangementExportDialog.tsx' $T/track-group-mix-ui.test.tsx)"
echo "K10 overview-hooks $(grep -cE 'data-overview-(lane|bar)=|arrangement-overview-(outline|lanes)"' $OV) testids $(grep -c 'data-testid=' $OV)"
for f in sketch-441.patch.txt sketch-441.sha256 sketch-441-v2.patch.txt sketch-441-v2-to-v3.diff.txt sketch-paths.txt grants-441.txt covering-files.txt r441-frozen-sha256.txt typecheck-sketch.log lint-sketch.log precheck-full.clean.log precheck-full-v1.log covering-sketch.log mutants/run-mutants.sh mutants/results.jsonl sketch-review.md tech-lead-review-v2.md tech-lead-review-v3-delta.md claims-441-planning-output.txt claims-441-expected-after-A.diff.txt probe/overview-hooks.mjs probe/pxdiff.mjs probe/head/overview-hooks.json probe/head/overview-full-1440.png probe/head/overview-full-1280.png probe/head/overview-empty-1440.png probe/head/overview-empty-1280.png probe/sketch/overview-hooks.json probe/hooks-check.py probe/head-server.sh probe/pxdiff-head-5177.txt probe/hooks-check-head.txt probe/pxdiff-full-window.txt l31-headroom.txt ../b-round-437/probe/play-status.mjs ../b-round-436/probe/press-export-probe.mjs; do test -f "$B/$f" && echo "K11 exists $f" || echo "K11 MISSING $f"; done
echo "K12 archive-440 $(cmp -s "$LOOP/tasks/round-440.md" "$B/current-task-before-441.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SYS-1 GATE164-OV1-FRAGILE GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR GATE81-S2-UM8-SOURCE-TEXT RETRO200-CLASS-SELECTORS GATE146-S4-LRS3-CLASSNAME-PINS C-R127-L1f-SELF-COMPARE-TESTS GATE440-L3-DETAIL-LABEL-ALLOWLIST A-R440-REVIEW-L4-L5-LRS3-NITS TL-R440-UM8-GROUP-MUTE 2>/dev/null | awk '{$2="";print "K13",$0}' | cut -c1-160
echo "K14 open-CHM $(python3 -I -c "
import json
b=json.load(open('$LOOP/backlog.json'))
o=[e['id'] for e in b['open_findings'] if str(e.get('severity','')).lower() in ('critical','high','medium') and not str(e.get('status','')).lower().startswith(('closed','done','resolved','fixed','wontfix','deferred_user','merged'))]
print(len(o),' '.join(sorted(o)))")"
echo "K15 backlog $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));d=b['decisions_log_b'];print('v'+str(b['version']),d[-1]['id'])")"
echo "K16 c440 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-440.json'));print(c['taskStatus'],c['browserVerified'],len(c['bugs']))")"
echo "K17 review-names-sha $(grep -c "$(cut -c1-64 "$B/sketch-441.sha256")" "$B/sketch-review.md" 2>/dev/null) $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>/dev/null | tail -1)"
echo "K18 mutants $(python3 -I -c "
import json
rows=[json.loads(l) for l in open('$B/mutants/results.jsonl')]
print(' '.join(r['tree'][0]+':'+r['id'].split('-')[0]+':'+r['suite'].split('.')[0][:14]+':'+str(r['rc']) for r in rows))")"
echo "K19 full-sketch $(grep -E 'Test Files|Tests  |^rc ' "$B/precheck-full.clean.log" | tr -s ' ' | tr '\n' ' ')"
echo "K20 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K21 doc287 $(ls $Q/287-* 2>/dev/null | wc -l) last-doc $(ls $Q/ | sort | tail -1) template $(test -f docs/implementation/TEMPLATE.md && echo yes || echo no)"
echo "K22 ssr-empty-premise $(grep -c 'OV1: the Overview root and view frame share' "$B/covering-sketch.log") covering $(grep -E 'Tests  ' "$B/covering-sketch.log" | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ')"
echo "K23 browser-head $(python3 -I -c "
import json;d=json.load(open('$B/probe/head/overview-hooks.json'))
print(' '.join(w+':'+k+':'+v[k]['state']+':outline'+str(v[k]['outline'])+':lanes'+str(v[k]['lanesContainer'])+':bbox'+'x'.join(str(int(n)) for n in v[k]['bbox']) for w,v in d.items() for k in ('empty','full')))")"
echo "K24 hook-sweep $(grep -rlE 'arrangement-overview-(outline|lanes)|data-overview-(lane|bar)\b' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K25 tgm-describe-timeout $(grep -c "describe('SRW-17 stage 3 group Mute / Solo / Volume in the workspace', { timeout: 20_000 }" $T/track-group-mix-ui.test.tsx) um8b-ms $(grep -oE 'UM8b .* [0-9]+ms' "$B/precheck-full.clean.log" | grep -oE '[0-9]+ms$')"
echo "K26 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K27 lint-sketch $(grep -oE 'Found [0-9]+ warnings' "$B/lint-sketch.log") $(tail -1 "$B/lint-sketch.log") typecheck $(tail -1 "$B/typecheck-sketch.log")"
echo "K28 browser-sketch-outline $(python3 -I -c "
import json;d=json.load(open('$B/probe/sketch/overview-hooks.json'))
print(' '.join(w+':'+k+':outline'+str(v[k]['outline'])+':lanes'+str(v[k]['lanesContainer']) for w,v in d.items() for k in ('empty','full')))")"
echo "K29 l31 $(tail -1 "$B/l31-headroom.txt")"
echo "K30 in-progress-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) sys1 $(grep -rln 'In Progress (stage' docs/implementation | xargs -r grep -l 'SYS-1' | wc -l) doc286 $(sed -n 4p $Q/286-sys-1-stage-1-test-selectors.md | grep -c 'Completed (C round 440 PASS)') overview-hunk-v2-eq-v3 $(diff <(sed -n '/^diff --git a\/app\/components/,/^diff --git a\/app\/lib/p' "$B/sketch-441-v2.patch.txt") <(sed -n '/^diff --git a\/app\/components/,/^diff --git a\/app\/lib/p' "$B/sketch-441.patch.txt") >/dev/null && echo yes || echo no)"
