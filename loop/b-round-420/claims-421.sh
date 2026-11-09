#!/usr/bin/env bash
# Round 421 claims (SYS-R418-PREVIEW-LIFECYCLE). ROOT/LOOP may be overridden. Prints one line per claim.
# Id lookups go through tools/find-ids.py (backlog + archive, D-29z1468). No root-consumed request file is an input, and no
# file root may create or remove between B and C (e.g. the STEM-LANES transcripts) is claimed present or absent.
ROOT=${ROOT:-/home/runner/czaba-project/store}
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LOOP/b-round-420
C=app/contexts/ArrangementContext.tsx
P=app/lib/arrangement/preview.client.ts
T=app/lib/arrangement/__tests__/library-preview-stream.test.tsx
D=docs/implementation/2026/quarter-IV/271-sys-preview-lifecycle.md
cd "$ROOT" || exit 1
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -vxF -f "$B/grants-421.txt" | wc -l)"
sha256sum --quiet -c "$B/r421-frozen-sha256.txt" >/dev/null 2>&1; echo "K3 frozen $(wc -l < "$B/r421-frozen-sha256.txt") rc $?"
sha256sum --quiet -c "$LOOP/b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K4 protected rc $? granted-protected $(awk '{print $2}' "$LOOP/b-round-318/protected-sha256.txt" | grep -cxF -f "$B/grants-421.txt")"
if git apply --check "$B/sketch-421.patch.txt" 2>/dev/null; then echo "K5 sketch-applies yes"; else echo "K5 sketch-applies no"; fi
echo "K6 last-doc $(ls docs/implementation/2026/quarter-IV/ | sort | tail -1) doc271-l4 $(sed -n 4p $D 2>/dev/null || echo absent)"
echo "K7 gate420 $(python3 -I -c "import json;a=json.load(open('$LOOP/gates/gate-round-420.json'));print(a['status'],a.get('reason'),a['head'][:7])")"
echo "K8 regression-last $(python3 -I -c "import json;d=json.load(open('$LOOP/regression-last.json'));print(d['date'],d['round'])")"
echo "K9 code teardown-stop $(grep -A5 -x '    const resetDecodedBuffers = () => {' $C | grep -cx '      stopLibraryPreview();') stopPlayback-calls $(grep -c 'stopPlayback()' $C) setStart $(grep -c 'setStart' $P) tick-armedAt $(grep -c 'readTime(armedAt)' $P) offset-raw $(grep -c 'return active.element.currentTime;' $P) let-start $(grep -c '      let start = Math.max(0, offset);' $P)"
echo "K10 tests rows-PC $(grep -cE "^  it\('PC[0-9]+ " $T) rows-PS $(grep -cE "^  it\('PS[0-9]+ " $T) rows-PL $(grep -cE "^  it\('PL[0-9]+ " $T) pc12-error-title $(grep -c "PC12 a same-url seek re-targets the stream error: an error after the seek" $T)"
echo "K11 sketch-sha $(sha256sum "$B/sketch-421.patch.txt" | cut -c1-16) recorded $(cut -c1-16 "$B/sketch-421.sha256")"
for f in sketch-421.patch.txt sketch-421.sha256 make-sketch-src.py make-sketch-test.py sketch-review.md precheck-full.log precheck-typecheck.log precheck-lint.log precheck-biome3.log precheck-a2.log precheck-loaded.log covering-files.txt mutants/run.py mutants/summary.txt probe/rows-421.mjs probe/compare.py probe/compare-head-vs-sketch.txt r421-frozen-sha256.txt grants-421.txt current-task-before-421.md; do test -f "$B/$f" || echo "K12 MISSING $f"; done; echo "K12 artifacts checked"
echo "K13 archive-420 $(cmp -s "$LOOP/tasks/round-420.md" "$B/current-task-before-421.md" && echo identical || echo differs)"
python3 -I "$LOOP/tools/find-ids.py" "$LOOP" TL-R418-L1-UNMOUNT-NO-BUMP GATE418-L4-FALLBACK-MICROTASK-UNMOUNT TL-R418-L4-COLLECTION-CHANGE-PREVIEW TL-R418-L2-READTIME-START-FALLBACK TL-R418-L3-OFFSET-RAW-READ A-R418-REVIEW-L1-READTIME-STALE-START A-R418-REVIEW-L2-OFFSET-RAW-READ A-R418-REVIEW-L3-PC12-TITLE SYS-R418-PREVIEW-LIFECYCLE C-R420-CLAIMS-K22-ARCHIVE-AGAIN C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED TL-R419-L1-OPEN-INVARIANT Q-PREVIEW-STOPS-TRANSPORT | sed 's/^/K14 /'
echo "K15 backlog-v $(python3 -I -c "import json;b=json.load(open('$LOOP/backlog.json'));print(b['version'], b['decisions_log_b'][-1]['id'])")"
echo "K16 browser-compare $(tail -1 "$B/probe/compare-head-vs-sketch.txt") cells $(grep -cE '^(EQUAL|DIFF) ' "$B/probe/compare-head-vs-sketch.txt")"
echo "K17 mutants $(wc -l < "$B/mutants/summary.txt") sketch-line $(grep -c '^SKETCH: red none' "$B/mutants/summary.txt")"
echo "K18 precheck full $(sed 's/\x1b\[[0-9;]*m//g' "$B/precheck-full.log" | grep -E '^ +Tests ' | tr -s ' ') $(tail -1 "$B/precheck-full.log")"
echo "K19 l58 $(cd "$LOOP" && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 agree-row5 picks $(grep -c 'B-ის არჩევანი (2026-11-09' "$LOOP/user-review/AGREE-STEM-LANES.md") candidates $(test -f "$LOOP/reference/youtube/STEM-LANES.md" && echo present || echo absent)"
echo "K21 lessons lines $(wc -l < "$LOOP/lessons.md") L56-archive-clause $(grep -c 'find-ids.py' "$LOOP/lessons.md")"
echo "K22 studio-lab collection $(grep -c 'collection={studioLabDemoCollection}' app/routes/studio-lab.tsx)"
