#!/usr/bin/env bash
# B round 410 -> 411 claims (L29/L56). Run: bash b-round-410/claims-411.sh   (ROOT= repository, LOOP= loop folder)
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-410
cd "$ROOT" || exit 2
PRE=app/components/arrangement/ArrangementLibraryPreview.tsx
MOD=app/lib/arrangement/precomputed-peaks.ts
DEMO=app/data/studio-lab-demo.ts
CTX=app/contexts/ArrangementContext.tsx
D263=docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md
D264=docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r411-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r411-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-411.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-411.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc264-exists $(test -f $D264 && echo 1 || echo 0) l4 $(test -f $D264 && sed -n 4p $D264) | doc263-l4 $(sed -n 4p $D263)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 demo peaksUrl-lines $(grep -c '  peaksUrl: (source) =>' $DEMO) demoPeaksUrls-entries $(grep -cE "^  'demo-(middle-east|hero-music)': '/peaks/" $DEMO) previewUrl-line $(grep -c '  previewUrl: (source) =>' $DEMO) origin-demo-lines $(grep -c "origin: 'demo'," $DEMO)"
echo "K8 strip unavailable-title-uses $(grep -c 'title={previewUnavailableTitle ?? undefined}' $PRE) loading-dim $(grep -c "isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'" $PRE) tabIndex $(grep -c 'tabIndex={isReady ? 0 : -1}' $PRE) strings $(grep -cE "preview(NeedsSound|Loading|Failed)Title: 'Preview — " app/lib/arrangement/strings.ts)"
echo "K9 sourceDurations-ready-only $(grep -cF ".filter(([, state]) => state.status === 'ready')" $CTX)"
echo "K10 SWEEP peaksUrl app+perf+e2e $(grep -rl 'peaksUrl' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K11 fetch credentials-omit $(grep -c "await fetchPeaks(url, { credentials: 'omit', signal });" $MOD) body-cancel $(grep -c 'void response.body?.cancel().catch(() => undefined);' $MOD)"
echo "K12 shipped peaks $(for f in public/peaks/middle-east.peaks.json public/peaks/hero-music.peaks.json; do test -f $f && echo -n "$f $(sha256sum < $f | cut -c1-16) $(wc -c < $f) " || echo -n "$f absent "; done) scripts $(test -f scripts/peaks/generate-demo-peaks.mjs && echo 1 || echo 0)$(test -f scripts/peaks/demo-peaks-meta.json && echo 1 || echo 0)"
echo "K13 sketch-sha $(sha256sum < $B/sketch-411.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md 2>/dev/null)"
for f in sketch-411.patch.txt sketch-411-v2.patch.txt sketch-411-v3.patch.txt sketch-dispatched.sha256 sketch-review.md consult-product-designer.md grants-411.txt r411-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full.log precheck-lint.log sketch-logs/covering.txt sketch-logs/covering.json sketch-logs/slowest.txt sketch-logs/rc.txt fixtures/gen-peaks.mjs fixtures/gen-meta.json probe/peaks-before-ready-411.mjs probe/heights-compare.txt probe/head-real-1440x900.json probe/head-real-1280x720.json probe/sketch-real-1440x900.json probe/sketch-real-1280x720.json probe/sketch-404-1440x900.json probe/sketch-404-1280x720.json probe/sketch-8bit-1440x900.json probe/sketch-8bit-1280x720.json probe/sketch-p410-1440x900.json probe/sketch-p410-1280x720.json probe/sketch-lane-1440x900.json probe/sketch-lane-1280x720.json sketch-411-v4.patch.txt sketch-logs/v4-v5-runtime-delta.txt probe/v2/sketch-cold-warmup-attempt.json claims-411-planning-vs-sketch.diff sketch-logs/tsc.log sketch-logs/biome.log; do echo "K14 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K15 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0 failed \[\]' $B/mutants/summary.txt) scratch $(grep 'SCRATCH-STATUS' $B/mutants/summary.txt)"
echo "K16 gate410 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-410.json'));print(d['status'],d['commit'][:7])")"
echo "K17 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K18 archive-equal $(cmp -s $LOOP/tasks/round-410.md $B/current-task-before-411.md && echo 1 || echo 0)"
echo "K19 precheck-full $(cat $B/precheck-full.log | tr '\n' ' ')"
echo "K20 covering $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/covering.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])")"
echo "K21 probe $(for f in head-real-1440x900 head-real-1280x720 sketch-real-1440x900 sketch-real-1280x720 sketch-404-1440x900 sketch-404-1280x720 sketch-8bit-1440x900 sketch-8bit-1280x720; do python3 -I -c "import json;d=json.load(open('$B/probe/$f.json'));h=d['whileAudioHeld'];r=d['afterReady'];print('$f', 'held', h['rects'], h['ariaDisabled'], h.get('title'), 'ready', r['rects'], r.get('title'), 'meBegins', d['middleEastBegins'], 'heroBegins', d['heroBegins'], 'peaksReq', len(d['peaksRequests']), 'errors', len(d['pageErrors']), end=' ')"; echo -n '; '; done) heights $(tr '\n' ' ' < $B/probe/heights-compare.txt)"
echo "K22 p410-on-sketch $(for v in 1440x900 1280x720; do python3 -I -c "import json;d=json.load(open('$B/probe/sketch-p410-$v.json'));print('$v', 'ok', d['ok'], 'peaksRequests', sorted(u.split('/')[-1] for u in d['peaksRequests']), 'rects', sorted(set(s['rects'] for s in d['sources'].values())), 'errors', len(d['pageErrors']), end=' ')"; echo -n '; '; done)"
echo "K23 lane-probe $(for v in 1440x900 1280x720; do python3 -I -c "import json;d=json.load(open('$B/probe/sketch-lane-$v.json'));print('$v', d['ok'], sum(1 for s in d['steps'].values() if s['pass']), len(d['steps']), end=' ')"; echo -n '; '; done)"
echo "K24 mp3-bytes $(wc -c < public/middle-east.mp3) $(wc -c < public/videos/hero/hero-music.mp3)"
echo "K25 audio-credentials-omit $(grep -c "await fetchSource(url, { credentials: 'omit', signal });" app/lib/arrangement/source-fetch.ts)"
