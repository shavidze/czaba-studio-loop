#!/usr/bin/env bash
# B round 359 -> 360 claims. Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
BJ=$S/perf/budgets.interactions.json
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-359.json'));print(g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K3 $(python3 -I -c "
import json
d=json.load(open('$BJ'))
ids=['interact.play.start-commits','interact.play.start-components','interact.play.start-sources','interact.play.stop-commits','interact.play.stop-components','interact.drag.fade.stopped.release-commits','interact.drag.fade.playing.release-commits','interact.drag.video-fade.stopped.release-commits','interact.drag.video-fade.playing.release-commits']
m={r['id']:r for r in d}
print('rows',len(d),'asserted',sum(r['mode']=='assert' for r in d),'nine',' '.join(m[i]['mode'][0]+(m[i]['budget']['op']+str(m[i]['budget']['value']) if m[i]['budget'] else '-') for i in ids),'play6x-asserted',sum(1 for r in d if r['id'].startswith('interact.play.') and r['id'].endswith('.6x') and r['mode']=='assert'))
")"
echo "K4 budgets-sha $(sha256sum $BJ | cut -c1-12)"
echo "K5 doc234-l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md | md5sum | cut -c1-8) doc234-h2 $(grep -c '^## ' $S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md) doc232-l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md | md5sum | cut -c1-8) pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 app-sha $(cd $S && find app perf/lib perf/*.spec.ts -type f -not -path 'app/components/studio/export/*' -not -path 'app/components/studio/StudioToolbar.tsx' | sort | xargs sha256sum | sha256sum | cut -c1-12)"
echo "K8 play-prefix $(grep -c "interact.play.start' : 'interact.play.stop'" $S/perf/studio-lab-interactions.perf.spec.ts) fail-msg $(grep -c "playFailed: 'Video playback failed — try MP4 (H.264) or WebM.'" $S/app/lib/arrangement/strings.ts) fail-call $(grep -c 'pauseWithStatusRef.current(VIDEO_PLAY_FAILED_MESSAGE)' $S/app/components/arrangement/ArrangementVideoDock.tsx)"
echo "K9 package.json-sha $(sha256sum $S/package.json | cut -c1-12)"
echo "K10 cited $(for f in b-round-359/sketch/budgets.patch.txt b-round-359/sketch/budgets-dispatched.sha256 b-round-359/mutants/mu-a.diff.txt b-round-359/mutants/mu-b.diff.txt b-round-359/perf-sketch.log b-round-359/perf-mu-a.log b-round-359/perf-mu-b.log b-round-359/perf-sketch-results/latest-interactions.json b-round-359/perf-mu-a-results/latest-interactions.json b-round-359/perf-mu-b-results/latest-interactions.json b-round-359/perf-summary.txt b-round-359/sketch-perf-lib.log b-round-359/checkpoint.md b-round-359/sketch-review.md b-round-359/perf-rowcmp-sketch-vs-c359.txt b-round-359/vfs-probe.mjs b-round-359/vfs-v2-1440x900.json b-round-359/vfs-v3-1440x900.json b-round-359/vfs-probe.sha256 c-round-359/latest-interactions.json c-round-358/behaviour-probe.mjs b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-358/auth.mjs tools/l57-check.py; do [ -f $L/$f ] || echo MISSING:$f; done | wc -l) missing"
echo "K11 follow-attr $(grep -c 'data-follow-mode={navigation.followMode}' $S/app/components/arrangement/ArrangementTransport.tsx) follow-paused-text $(grep -c "followPaused: 'Follow paused by manual navigation" $S/app/lib/arrangement/strings.ts) pause-fn $(grep -c 'const pausePlaybackWithStatus = useCallback' $S/app/contexts/ArrangementContext.tsx)"
D4=$S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md
echo "K12 doc234-6x-sentence $(grep -c '70 → 28 (1× და 6×)' $D4) doc234-perf-bullet $(grep -c 'ამ რაუნდში არ შეცვლილა: play row-ები `record` რჩება' $D4) report-count-check $(grep -c 'nondeterministic count' $S/perf/lib/report.ts) report-kind-gate $(grep -c "if (row.kind !== 'deterministic') return null;" $S/perf/lib/report.ts)"
