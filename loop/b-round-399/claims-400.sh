#!/usr/bin/env bash
# Claims for round 400 (PERF-14b-i completion: R-b ruling for the Ctrl+D group copy, C-R399-01). Run from the loop root: bash b-round-399/claims-400.sh
# A runs it before editing; C runs it at SOURCE-SCOPE start (must equal b-round-399/claims-400-planning-output.txt)
# and at the end (only the facts in task section 7 may differ).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-399
IS=$S/perf/studio-lab-interactions.perf.spec.ts
D255=$S/docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md
cd "$L" || exit 1
echo "K1 gate399 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-399.json'));print(g['status'],g.get('reason',''))") gate398 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-398.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --porcelain | wc -l) app-diff $(git -C $S diff --stat -- app | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 entries $(grep -c '' $B/r400-frozen-sha256.txt) failures $(cd $S && sha256sum -c --quiet $B/r400-frozen-sha256.txt 2>/dev/null | wc -l)"
echo "K5 $(python3 -I -c "import json;r=json.load(open('regression-last.json'));print(r['date'],r['round'])")"
echo "K6 doc255 l4 $(sed -n 4p $D255) headings $(grep -c '^## ' $D255) stop-word $(grep -c 'STOP' $D255)"
echo "K7 in-progress-docs $(grep -rln 'In Progress (stage' $S/docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' $S/docs/implementation | wc -l) doc254-l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md)"
echo "K8 a399-tracked-diff-at-planning $(sha256sum $B/a399-diff.patch.txt | cut -c1-16) doc255-at-planning $(sha256sum $B/a399-doc255.md | cut -c1-16) doc255-now $(sha256sum $D255 | cut -c1-16)"
echo "K9 interactions-sha $(sha256sum $IS | cut -c1-16) group-copy-sketch-sha $(sha256sum $B/sketch-400-group-copy.patch.txt | cut -c1-16) applies-to-tree $(cd $S && git apply --check $B/sketch-400-group-copy.patch.txt 2>/dev/null && echo yes || echo no) lane-applies $(cd $S && git apply --check $L/b-round-398/sketch-14bii-lane.patch.txt 2>/dev/null && echo yes || echo no)"
echo "K9b reviewed-equals-dispatched review-sha $(grep -o 'dispatched sha256 [0-9a-f]\{16\}' $B/sketch-review-400.md | head -1 | cut -d' ' -f3) equals-patch $(test "$(grep -o 'dispatched sha256 [0-9a-f]\{16\}' $B/sketch-review-400.md | head -1 | cut -d' ' -f3)" = "$(sha256sum $B/sketch-400-group-copy.patch.txt | cut -c1-16)" && echo yes || echo no) sketch-spec-sha $(sha256sum $B/sketch/interactions.sketch.ts | cut -c1-16)"
echo "K10 copy-reads raw-copy-reads $(grep -cE 'readClipState\(copy\)|clipLaneTrackId\(copy\)' $IS) mounted-copy-scan $(grep -c "const copyId = ids.find((id) => id !== '' && id !== clipId);" $IS) reveal-helper $(grep -c 'async function readBesideClip' $IS) follow-attr $(grep -c 'data-follow-mode={followMode}' $S/app/components/arrangement/ArrangementTransport.tsx) follow-testid $(grep -c 'data-testid=\"arrangement-follow\"' $S/app/components/arrangement/ArrangementTransport.tsx)"
echo "K11 follow-pause-on-scroll $(grep -c 'pauseFollowForNavigation' $S/app/components/arrangement/StudioWorkspace.tsx) follow-paused-title $(grep -c "followPausedTitle: 'Follow paused — press Follow, or stop playback, to resume'," $S/app/lib/arrangement/strings.ts)"
echo "K12 lane-pin-set $(grep -c 'laneMoveSourceIds.has(clip.id) ||' $L/b-round-398/sketch-14bii-lane.patch.txt) gesture-pin $(grep -c 'gestureClipIdsRef.current.has(clip.id) ||' $L/b-round-398/sketch-14bii-lane.patch.txt)"
echo "K13 sketch-runs $(cat $B/sketch/rc.txt 2>/dev/null | tr '\n' ' ')"
echo "K14 sketch-head-compare $(head -6 $B/sketch/compare-head.txt 2>/dev/null | sed -n '3,6p' | tr '\n' ' ')"
echo "K15 sketch-virt $(sed -n '2,5p' $B/sketch/summary-virt.txt 2>/dev/null | cut -c1-300 | tr '\n' ' ')"
echo "K16 sketch-virt-group $(cat $B/sketch/group-virt.txt 2>/dev/null | tr '\n' ' ')"
echo "K17 head-baselines interactions $(python3 -I -c "import json;d=json.load(open('$L/b-round-398/perf-head-interactions.json'));r=d['rows'];print(d['complete'],len(r),sum(1 for x in r if x['kind']=='deterministic'))") resources $(python3 -I -c "import json;d=json.load(open('$L/c-round-398/perf-results/latest-resources.json'));r=d['rows'];print(d['complete'],len(r),sum(1 for x in r if x['kind']=='deterministic'))") scale $(python3 -I -c "import json;d=json.load(open('$L/b-round-398/perf-head-harness-scale.json'));r=d['rows'];print(d['complete'],len(r),sum(1 for x in r if x['kind']=='deterministic'))")"
echo "K18 a399-evidence $(for f in a4-interactions.json a4-resources.json a4-scale.json a5-interactions.json a5-resources.json a5-scale.json a4-interactions-compare.txt a4-resources-compare.txt a4-scale-compare.txt probe/follow-probe.txt; do test -e $L/a-round-399/$f && printf 'ok ' || printf "MISSING:$f "; done) c399 $(test -e $L/c-round-399/virt-interactions.json && echo ok || echo missing)"
echo "K19 a399-a4 $(for s in interactions resources scale; do printf '%s:%s ' $s "$(grep -o 'differing [0-9]*' $L/a-round-399/a4-$s-compare.txt | head -1)"; done)"
echo "K20 perf-dom-clip-grep $(cd $S && grep -rnE 'audioClips\(|videoClips\(|toHaveCount\(|data-clip-start|data-clip-kind|data-clip-id|\[data-clip' perf --include=*.ts | wc -l) per-file $(cd $S && grep -rnE 'audioClips\(|videoClips\(|toHaveCount\(|data-clip-start|data-clip-kind|data-clip-id|\[data-clip' perf --include=*.ts | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';') model-helper $(grep -cE "export (const modelClipCount|async function expectModelClipCount)" $S/perf/lib/page.ts)"
echo "K21 interactions-test-timeout $(grep -c 'timeout: 15 \* 60 \* 1000' $S/playwright.perf.config.ts) a399-interactions-seconds $(grep -o 'interactions rc=[0-9]* seconds=[0-9]*' $L/a-round-399/a4-rc.txt | head -1)"
echo "K23 retro-last $(ls $L/retros | sort -V | tail -1)"
echo "K27 superseded-docs $(grep -rlE 'studio-lab-interactions\.perf|studio-lab-resources\.perf' $S/docs/implementation | wc -l)"
