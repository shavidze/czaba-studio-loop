#!/usr/bin/env bash
# Round 432 claims (SABA-B-12 stage 2b = Export dialog <progress>). ROOT/LOOP may be overridden. One line per claim.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-431
A=app/components/arrangement
ED=$A/ArrangementExportDialog.tsx
T=app/lib/arrangement/__tests__
Q=docs/implementation/2026/quarter-IV
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD) gate431 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-431.json'));print(a['status'],a['commit'][:7])")"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-432.txt" | wc -l)"
sha256sum --quiet -c "$B/r432-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r432-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-432.txt")"
if git apply --check "$B/sketch-432.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls $Q/ | sort | tail -1) | doc280-l4 $(sed -n 4p $Q/280-saba-b-12-export-progress.md 2>/dev/null || echo absent) | doc279-l4 $(sed -n 4p $Q/279-saba-b-12-export-radios.md)"
echo "K7 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])") today $(date -u +%F)"
echo "K8 progress-tags $(grep -c '<progress' $ED) old-class $(grep -c 'h-2 w-full accent-foreground' $ED) progress-class-uses $(grep -c 'className={STUDIO_PROGRESS_CLASS}' $ED) constant-file $(test -f $A/studio-progress.ts && echo present || echo absent) progress-files $(grep -rl '<progress' $A --include=*.tsx | xargs -r -n1 basename | tr '\n' ' ')"
echo "K8b value-attr $(grep -c 'value={progress.fraction ?? undefined}' $ED) aria-valuetext $(grep -c 'aria-valuetext={progressText ?? undefined}' $ED) render-guard $(grep -c '{isRendering && progress ? (' $ED)"
echo "K8c pinned DXL7c-accent-foreground $(grep -c "\['accent-foreground'\], \['accent-brand'\]" $T/label-status-colour-ui.test.tsx) DXL8-old-class-1 $(grep -c "expectCount(EXPORT_DIALOG_PATH, 'h-2 w-full accent-foreground', 1)" $T/label-status-colour-ui.test.tsx)"
echo "K8e tokens outline-hover $(grep -c -- '--color-outline-hover:' app/styles/app.css) foreground $(grep -c -- '--color-foreground:' app/styles/app.css) global-progress-rule $(grep -cE '^\s*progress\b' app/styles/app.css)"
echo "K8f encoder-module $(test -f app/lib/arrangement/mp3-encoder.client.ts && echo present || echo absent) dynamic-import $(grep -c "import('~/lib/arrangement/mp3-encoder.client')" app/contexts/ArrangementContext.tsx) load-null $(grep -c "setProgress({ phase: 'load', fraction: null })" app/contexts/ArrangementContext.tsx)"
echo "K10 sketch-sha $(sha256sum "$B/sketch-432.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-432.sha256") review-names $(grep -c "$(cut -c1-64 "$B/sketch-432.sha256")" "$B/sketch-review.md" 2>/dev/null) diff-headers $(grep -c '^diff --git' "$B/sketch-432.patch.txt")"
for f in sketch-432.patch.txt sketch-432.sha256 sketch-review.md mutants/run.py mutants/summary.txt precheck-a2.log precheck-typecheck.log precheck-lint.log precheck-biome4.log precheck-full.log covering-files.txt grants-432.txt r432-frozen-sha256.txt probe/progress-probe.mjs probe/compare-progress.py probe/compare.txt probe/compare-head.txt probe/contrast.txt probe/forced-determinate.txt probe/head/progress-hold.json probe/head-final/progress-probe.json probe/sketch/progress-probe.json update-backlog.py update-backlog-2.py archive-open-scan.txt probe/compare-neighbours.py probe/compare-neighbours.txt l57-check-c431.txt recompare/compare.txt recompare/compare-extra.txt current-task-before-432.md; do test -f "$B/$f" && printf 'ok ' || printf 'MISSING:%s ' "$f"; done | sed 's/^/K11 artifacts /'; echo
echo "K12 archive-431 $(cmp -s "$LOOP/tasks/round-431.md" "$B/current-task-before-432.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" SABA-B-12 STUDIO-VIS-2 SABA-B-12-STAGE-2B-PROGRESS TLM-SABA-B-12-FIREFOX-SAFARI A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE B-R431-DUP-ENCODER-LOADING-TEXT SABA-Q-EXPORT-PROGRESS-OVERALL ARCH-SIGNAL-STUDIO-CONTROLS | sed 's/^/K13 /' | cut -c1-160
echo "K14 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K15 browser-compare $(tail -1 "$B/probe/compare.txt") | head $(tail -1 "$B/probe/compare-head.txt")"
echo "K15c full-sketch $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') lint $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-lint.log" | grep -E '^Found [0-9]+ warnings')"
echo "K16 mutants lines $(wc -l < "$B/mutants/summary.txt") all-red $(grep -c ' rc=1 red=' "$B/mutants/summary.txt")"
echo "K17 rows PG $(grep -oE "'PG[0-9]" $T/studio-progress.test.ts 2>/dev/null | awk -F"'" '{print $2}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')"
echo "K18 covering $(wc -l < "$B/covering-files.txt") a2 $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-a2.log" | grep -E '^ +Tests ' | tr -s ' ')"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 c431 $(python3 -I -c "import json;c=json.load(open('$LOOP/c-round-431.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K21 stem-lanes transcripts $(test -f "$LOOP/reference/youtube/STEM-LANES-transcripts.md" && echo present || echo absent) agree-answer $(grep -ciE "saba.s answer|approved by saba|^decision:" "$LOOP/user-review/AGREE-STEM-LANES.md" 2>/dev/null)"
echo "K22 lessons lines $(wc -l < "$LOOP/lessons.md") L61 $(grep -c '^61\. ' "$LOOP/lessons.md")"
