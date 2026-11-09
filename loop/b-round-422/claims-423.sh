#!/usr/bin/env bash
# Round 423 claims (REGRESSION-2026-11-10 part 1). ROOT/LOOP may be overridden. One line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive). No root-consumed request file is an input.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-422
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status total $(git status --short --untracked-files=all | wc -l)"
sha256sum --quiet -c "$B/r423-tree-sha256.txt" >/dev/null 2>&1; echo "K3 tree $(wc -l < "$B/r423-tree-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected $(wc -l < "$LOOP/b-round-318/protected-sha256.txt") rc $?"
echo "K5 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K6 gate422 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-422.json'));print(a['status'],a['commit'][:7])")"
echo "K7 perf specs $(ls perf/*.spec.ts | wc -l) last-perf-change $(git log -1 --format=%h -- perf/)"
for f in b-round-334/vitest.perf-lib.config.mjs c-round-392/probe.mjs c-round-392/nb.mjs c-round-393/probe.mjs c-round-395/rows.mjs c-round-396/rows.mjs c-round-397/rows.cjs b-round-397/probe/clips200.cjs b-round-398/probe/frames200.cjs b-round-401/probe/pin-blur-group.cjs b-round-402/probe/peaks-fallback.cjs b-round-403/probe/minzoom200.cjs c-round-403/fallback-failing-1440x900.json c-round-404/tools/leaf.cjs c-round-406/tools/video-probe-c406.mjs c-round-407/tools/video-extra-c407.mjs b-round-407/lane/lane-actions-probe.mjs b-round-408/probe/leaf-probe-409.mjs b-round-409/probe/peaks-probe-410.mjs b-round-412/probe/peaks-before-ready-413.mjs c-round-414/browser-probe.cjs c-round-414/worker-server.mjs c-round-415/meter-probe.mjs c-round-418/probe/rows-418.mjs c-round-419/probe/stem-integrity-probe.mjs c-round-421/probe/rows-421.mjs c-round-422/probe/held-enter.mjs c-round-422/probe/compare.py c-round-422/scripts/smoke.mjs c-round-386/export-wav.mjs c-round-389/tools/journey.cjs c-round-389/tools/auth-smoke.mjs mock-api/server.mjs tasks/round-390.md b-round-422/probe/marker-seek.cjs b-round-422/probe/head/marker-seek.json b-round-422/probe/head/marker-seek-nomarker.json b-round-422/update-backlog.py b-round-422/update-backlog.done c-round-422/probe/head c-round-421/probe/sketch c-round-421/probe/compare.py c-round-418/probe/sketch c-round-418/probe/compare.py c-round-419/probe/out/sketch c-round-419/probe/run-probe.sh c-round-419/probe/compare.py c-round-414/summarize-414.py c-round-403/fallback-failing-1280x720.json c-round-382/lib.mjs; do test -e "$LOOP/$f" || echo "K8 MISSING $f"; done; echo "K8 artifacts checked"
echo "K9 facts transport-repeat-guard $(grep -c 'onKeyDown={preventRepeatedEnterKeyDown}' app/components/arrangement/ArrangementTransport.tsx) lane-data-clip-count $(grep -c 'data-clip-count={clips.length}' app/components/arrangement/ArrangementLane.tsx) demo-peaksUrl $(grep -c 'peaksUrl' app/data/studio-lab-demo.ts) preview-client $(test -f app/lib/arrangement/preview.client.ts && echo present || echo absent)"
echo "K10 marker-seek-baseline $(python3 -I -c "
import json
a=json.load(open('$B/probe/head/marker-seek.json'));c=json.load(open('$B/probe/head/marker-seek-nomarker.json'))
print(' '.join(f\"{k}:flag={v['flagLabel'].split(chr(8212))[-1].strip()},second={v['posAfterSecondClick']},next={v['posAfterNext']},errs={len(v['errs'])}\" for k,v in a.items()), '| control', ' '.join(f\"{k}:next={v['posAfterNext']}\" for k,v in c.items()))")"
echo "K11 archive-422 $(cmp -s "$LOOP/tasks/round-422.md" "$B/current-task-before-423.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" INFO-C404-MARKER-SEEK-RECIPE A-R107-SWEEP-HELD-ENTER-TOOLBAR A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER A-R422-REVIEW-L2-HE4-HE5-PREVENTED-ONLY GATE304-M1-PERF-LIB-NOT-IN-GATE SYS-2 | sed 's/^/K12 /'
echo "K13 regression-entry $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print([r['status'][:40] for r in b['regression_rounds'] if r['id']=='REGRESSION-2026-11-10'])")"
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K16 lessons lines $(wc -l < "$LOOP/lessons.md")"
echo "K17 smoke-config $(test -f playwright.smoke.config.ts && echo present || echo absent) perf-config $(test -f playwright.perf.config.ts && echo present || echo absent)"
