#!/usr/bin/env bash
# Round 349 claims: PERF-CAND-VIDEO-TRIM-FADE-ROWS (video trim-start and fade-in drag rows, record) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b348-scratch/sk; K2 shows no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
SPEC=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
RT=$S/perf/lib/report.test.ts
CFG=$S/playwright.perf.config.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-348.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(python3 -I - "$BUD" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
own = [r for r in d if r['owner'] == 'PERF-CAND-VIDEO-TRIM-FADE-ROWS']
print(len(d), 'assert', sum(r['mode'] == 'assert' for r in d), 'owned', len(own),
      'owned-assert', sum(r['mode'] == 'assert' for r in own),
      'video-trim', sum(r['id'].startswith('interact.drag.video-trim.') for r in d),
      'video-fade', sum(r['id'].startswith('interact.drag.video-fade.') for r in d),
      'live', sum(r['id'] in ('interact.harness.drag-video-trim-live', 'interact.harness.drag-video-fade-live') for r in d),
      'video-move', sum(r['id'].startswith('interact.drag.video.') for r in d))
PY
)"
echo "K4 spec video-fade-testid $(c "'arrangement-video-fade-in-handle'" $SPEC) audio-fade-testid $(c "'arrangement-clip-fade-in-handle'" $SPEC) videoDrags-const $(c "^const videoDrags: VideoDrag\[\] = \['move', 'trim', 'fade'\];" $SPEC) old-move-liveId-literal $(c "liveId: 'interact.harness.drag-video-live'" $SPEC) all-but-ratio $(c "rows: 'all-but-ratio'" $SPEC)"
echo "K5 clip fade-prefix $(c "const fadeTestIdPrefix = isVideo ? 'arrangement-video-fade' : 'arrangement-clip-fade';" $CLIP) trim-start-title $(c 'title={studioClipStrings.trimStartLabel}' $CLIP) fade-min-px $(c '^const FADE_HANDLE_MIN_CLIP_PX = 24;' $CLIP) data-fade-in $(c 'data-fade-in={fadeInSeconds.toFixed(3)}' $CLIP) setFade $(c 'const setFade = isVideo ? setVideoClipFade : setClipFade;' $CLIP) previewGeometry $(c 'const previewGeometry = previewClipGeometry ?? previewArrangement;' $CLIP)"
echo "K6 report.test windowed-drag-16 $(c 'expect(drag).toHaveLength(16);' $RT) budgets-reader $(c 'budgets.interactions.json' $RT)"
echo "K7 perf-config timeout $(c '  timeout: 15 \* 60 \* 1000,' $CFG)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 diff-lines-outside-3 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'budgets.interactions.json\|studio-lab-interactions.perf.spec.ts\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K11 doc232 h2 $(c '^## ' $D232) video-section $(c '^### ეტაპი video-trim-fade' $D232) pending-348 $(c 'C round 348 pending' $D232) pending-349 $(c 'C round 349 pending' $D232)"
echo "K12 sweep drag.video in app+perf+e2e (excluding budgets json): $(grep -rlE 'drag\.video|drag-video' $S/app $S/perf $S/e2e 2>/dev/null | grep -v budgets.interactions.json | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K13 kept $(for f in sketch/apply-spec.py sketch/apply-budgets.py sketch/spec.patch.txt sketch/budgets.patch.txt perf-sketch-results/latest-interactions.json perf-head-results/latest-interactions.json perf-summary.txt; do [ -f $L/b-round-348/$f ] && echo -n 1 || echo -n 0; done)"
echo "K14 report assert-reported-when-complete $(c 'const assertReported = complete || (options.assertWhenPartial && values.length > 0);' $S/perf/lib/report.ts) short-by-abort $(c 'rows short of ${passesPerRate} samples because a pass aborted' $S/perf/lib/report.ts)"
