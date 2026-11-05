#!/usr/bin/env bash
# Round 344 claims: PERF-DRAG-PREVIEW c5-i (video clip move drag rows) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (e.g. B's scratch /home/runner/b343-scratch/sc).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
SPEC=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
REP=$S/perf/lib/report.test.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
R=b-round-343
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-343.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F "  rows: 'all' | 'thirty';" $SPEC) $(grep -c -F "  rows: 'all' | 'all-but-ratio' | 'thirty';" $SPEC) $(grep -c -F "    if (measure.rows === 'all') {" $SPEC) $(grep -c -F "    if (measure.rows !== 'thirty') {" $SPEC) $(grep -c -F 'await measureSelectSameLane(page, result);' $SPEC) $(grep -c -F 'const dragSteps = 60;' $SPEC) $(grep -c -F 'const dragDistancePx = 120;' $SPEC) $(grep -c -F "type DragName = 'range' | 'fade' | 'trim' | 'move';" $SPEC)"
echo "K4 $(grep -rlE 'setupVideoClip|teardownVideoClip|drag-video-live|interact\.drag\.video|videoFixturePath' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K5 $(grep -c -F 'const previewGeometry = isVideo' $CLIP) $(grep -c -F '    ? previewArrangement' $CLIP) $(grep -c -F 'const previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry;' $CLIP) $(grep -c -F "data-clip-kind={isVideo ? 'video' : 'audio'}" $CLIP)"
echo "K6 $(grep -c -F '}, [arrangement, isPlaying, positionStore, videoSources]);' $DOCK) $(grep -c -F 'const current = getArrangement();' $DOCK) $(grep -c -F 'resolveVideoTarget(arrangement, positionStore.getPosition())' $DOCK) $(grep -c -F 'useVideoSourceIdAtPlayhead(arrangement)' $DOCK) $(grep -c -F 'videoFadeOpacityAt(arrangement, positionStore.getPosition())' $DOCK) $(grep -c -F 'data-testid="arrangement-video-input"' $S/app/components/arrangement/ArrangementLane.tsx)"
echo "K7 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
vid=[r for r in rows if r['id'].startswith('interact.drag.video.') or r['id']=='interact.harness.drag-video-live']
print(len(rows), len(vid), sum(1 for r in vid if r.get('mode')=='assert'), sum(1 for r in rows if r.get('mode')=='assert'), sum(1 for r in vid if r['id'].endswith('.6x')), sum(1 for r in rows if r.get('metric')=='commits-per-move'), sorted(set(r.get('owner') for r in vid)))" $BUD)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c -F 'DC-KINDS' $REP) $(grep -c -F 'expect(drag).toHaveLength(16);' $REP) $(grep -c -F 'measured row without a budget row' $S/perf/lib/report.ts)"
echo "K11 $(git -C $S diff --stat HEAD -- app perf/lib e2e 2>/dev/null | wc -l)"
echo "K12 $(sed -n 4p $D232 | grep -oE 'stage c[0-9a-z-]+ of' | head -1) $(grep -c '^## ' $D232) $(grep -c '^### ეტაპი c5-i' $D232) $(grep -c '^## ' $D168) $(grep -c -F 'drag-video-live' $D168)"
echo "K13 $(python3 -I -c "
import json
p=json.load(open('c-round-343/perf-results/latest-interactions.json'))
rows=p['rows']; print(p['complete'], len(p['failures']), len(rows))")"
echo "K14 $(cat $R/probe/head-summary.txt | grep -E '^1440 (move|trim|fade)-stopped' | sed -E 's/^1440 ([a-z]+-stopped): perMove ([0-9.]+) max ([0-9]+).* provider ([0-9]+) workspace ([0-9]+) dock ([0-9]+).*/\1=\2\/\3\/p\4w\5d\6/' | tr '\n' ' ')"
echo "K15 $(python3 -I -c "
import struct
d=open('$S/public/videos/hero/1.mp4','rb').read(); i=d.find(b'mvhd'); v=d[i+4]
ts,du=(struct.unpack('>II',d[i+16:i+24]) if v==0 else struct.unpack('>IQ',d[i+24:i+36])); print(round(du/ts,2), len(d))") $(git -C $S ls-files --error-unmatch public/videos/hero/1.mp4 >/dev/null 2>&1 && echo tracked || echo untracked)"
echo "K16 $(for f in tasks/round-343.md c-round-343.json c-round-343.md a-round-343.md gates/gate-round-343.json b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-343/perf-results/latest-interactions.json $R/video-probe.mjs $R/probe/head-1440.json $R/probe/head-1280.json $R/probe/head-summary.txt $R/sketch/apply-sketch.py $R/sketch/spec.patch.txt $R/sketch/budgets.patch.txt $R/perf-sketch.log $R/perf-sketch-results/latest-interactions.json $R/perf-rowcmp-sketch-vs-c343.txt $R/sketch-typecheck.log $R/sketch-format.log $R/perf-sketch-v1.log $R/perf-sketch-v2.log $R/perf-sketch-v2-results/latest-interactions.json $R/perf-rowcmp-sketch-v2-vs-c343.txt $R/sketch-summary.json $R/perf-lib-sketch.log; do test -f "$f" && echo -n 1 || echo -n "0($f)"; done)"
