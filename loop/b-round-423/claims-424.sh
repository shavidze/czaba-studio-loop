#!/usr/bin/env bash
# Round 424 claims (PERF-FIX-R423-LANE-SHELL, fix-up of C-R423-01). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-423
LANE=app/components/arrangement/ArrangementLane.tsx
DPR=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
sha256sum --quiet -c "$B/r424-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r424-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected $(wc -l < "$LOOP/b-round-318/protected-sha256.txt") rc $?"
git apply --check "$B/sketch-424.patch.txt" >/dev/null 2>&1 && echo "K5 sketch-applies yes" || echo "K5 sketch-applies no"
echo "K6 doc273 $(ls docs/implementation/2026/quarter-IV/273-* 2>/dev/null | wc -l) l4 $(sed -n 4p docs/implementation/2026/quarter-IV/273-perf-fix-lane-shell-subscriptions.md 2>/dev/null)"
echo "K7 gate423 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-423.json'));print(a['status'],a.get('reason'))")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 lane shell-preview-sub $(grep -c 'useArrangementPreviewLaneClips(arrangement, trackId)' $LANE) memo $(grep -c 'memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual)' $LANE) inner-store-sub $(grep -c 'useArrangementPreviewStore(),' $LANE) committedLaneClips $(grep -c 'committedLaneClips' $LANE)"
echo "K10 dpr lane-2 $(grep -c "rendersOf('ArrangementLane')).toBe(2)" $DPR) lane-0 $(grep -c "rendersOf('ArrangementLane')).toBe(0)" $DPR) inner-2 $(grep -c "rendersOf('ArrangementLaneViewInner')).toBe(2)" $DPR) lane-gt0 $(grep -c "rendersOf('ArrangementLane')).toBeGreaterThan(0)" $DPR)"
echo "K11 archive-423 $(cmp -s "$LOOP/tasks/round-423.md" "$B/current-task-before-424.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" C-R423-01-PERF-DRAG-COMPONENTS-BUDGET INFO-C423-DECODE-ORACLE-DRIFT GATE304-M1-PERF-LIB-NOT-IN-GATE | sed 's/^/K12 /'
echo "K13 sketch-sha $(sha256sum "$B/sketch-424.patch.txt" | cut -c1-64) files $(grep -c '^diff --git' "$B/sketch-424.patch.txt")"
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K16 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K17 perf instrumentation tags $(grep -c 'const componentTags = new Set(\[0, 1, 11, 14, 15\]);' perf/lib/instrumentation.ts) perf-specs $(ls perf/*.spec.ts | wc -l) perf-config $(test -f playwright.perf.config.ts && echo present || echo absent)"
echo "K18 budgets fade-max $(python3 -I -c "import json;r={x['id']:x for x in json.load(open('perf/budgets.interactions.json'))};print(r['interact.drag.fade.stopped.move-components-max']['budget']['value'], r['interact.drag.trim.stopped.move-components-max']['budget']['value'], r['interact.drag.video-fade.stopped.move-components-max']['budget']['value'])" 2>&1)"
n=0; for f in sketch-424.patch.txt sketch-review.md precheck-full.log precheck-a2.log precheck-typecheck.log precheck-lint.log precheck-biome2.log covering-files.txt grants-424.txt mutants/summary.txt mutants/mutant-SHELL-SUBSCRIBES-HEAD.log perf-sketch/latest-interactions.json perf-sketch/compare-404-423-sketch.txt probe/fade-names.mjs probe/names-summary.txt probe/fade-names-head.json probe/fade-names-sketch.json probe/trim-names-head.json probe/trim-names-sketch.json move-components-404-vs-423.txt latency-404-vs-423.txt; do test -f "$B/$f" && n=$((n+1)) || echo "K19 MISSING $f"; done; echo "K19 artifacts present $n/21"
n=0; for f in c-round-423/lane/lane-1440x900.json c-round-423/lane/lane-1280x720.json c-round-423/out/leaf.json c-round-423/auth/auth.mjs c-round-423/perf-results/latest-interactions.json c-round-423.json c-round-406/tools/video-probe-c406.mjs c-round-422/scripts/smoke.mjs b-round-408/probe/leaf-probe-409.mjs b-round-407/lane/lane-actions-probe.mjs c-round-404/tools/leaf.cjs c-round-404/perf/interactions.json b-round-423/probe/ghost-title.mjs b-round-423/probe/ghost-title-summary.txt b-round-423/probe/ghost-title-head.json b-round-423/probe/ghost-title-sketch.json tools/l57-check.py; do test -f "$LOOP/$f" && n=$((n+1)) || echo "K20 MISSING $f"; done; echo "K20 oracle paths present $n/17"
n=0; for f in probe/lane-leaf-video-compare.txt probe/lane/leaf-probe-409.mjs probe/lane/lane-actions-probe.mjs probe/lane/leaf-probe-sketch.json probe/lane/lane-sketch-1440x900.json probe/lane/lane-sketch-1280x720.json probe/tools/leaf.cjs probe/out/leaf-sketch.json probe/video/video-probe-c406.mjs probe/video/playsync-sketch-1440x900.json probe/video/playsync-sketch-1280x720.json perf-sketch-full/summary.txt perf-sketch-full/latest-interactions.json perf-sketch-full/latest-scale.json perf-sketch-full/latest-resources.json perf-sketch-full/latest-stem-cache.json perf-sketch-full/latest.json claims-424-a5-stub-output.txt update-backlog-2.done; do test -f "$B/$f" && n=$((n+1)) || echo "K21 MISSING $f"; done; echo "K21 sketch-run artifacts present $n/19"
