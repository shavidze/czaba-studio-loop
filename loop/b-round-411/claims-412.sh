#!/usr/bin/env bash
# B round 411 -> 412 claims (L29/L56). Run: bash b-round-411/claims-412.sh   (ROOT= repository, LOOP= loop folder)
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-411
cd "$ROOT" || exit 2
GEN=scripts/peaks/generate-demo-peaks.mjs
PS=app/data/__tests__/studio-lab-demo.test.ts
D263=docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md
D264=docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -cvxF -f $B/grants-412.txt)"
echo "K3 frozen-entries $(wc -l < $B/r412-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r412-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-412.txt)"
echo "K5 delta-applies-on-tree $(git apply --check $B/sketch-412-delta.patch.txt >/dev/null 2>&1 && echo yes || echo no) delta-files $(grep '^diff --git' $B/sketch-412-delta.patch.txt | awk '{print $3}' | sed 's#^a/##' | tr '\n' ' ')"
echo "K6 doc264 l4 $(sed -n 4p $D264) | doc263 l4 $(sed -n 4p $D263) | doc264-round411-mentions $(grep -c '411' $D264) doc264-mutant-lines $(grep -cE '^MU-41[12]-' $D264)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 generator unpinned-ctx $(grep -c 'new AudioContext()' $GEN) pinned-ctx $(grep -c 'new AudioContext({ sampleRate: contextRate })' $GEN) rate-const $(grep -c '^const sampleRate = 44100;' $GEN) ok-check $(grep -c 'if (!response.ok) throw' $GEN) finally $(grep -c '^} finally {' $GEN) braceless-for $(grep -cE 'for \(.*\) channels\.push' $GEN)"
echo "K8 PS17 hardcoded-44100-match $(grep -c 'decodedLength, 44100)' $PS) meta-rate-pin $(grep -c 'expect(sampleRate, id).toBe(44100);' $PS) header-rate $(grep -c "expect(numberField(raw, 'sample_rate'), id).toBe(sampleRate);" $PS) header-spp $(grep -c "expect(numberField(raw, 'samples_per_pixel'), id).toBe(sampleRate / PEAK_BUCKETS_PER_SECOND);" $PS) row-ids $(grep -oE "it\('(PS1[5-7]|DL[0-9A-Z-]*)" $PS | wc -l)"
echo "K9 shipped peaks $(for f in public/peaks/middle-east.peaks.json public/peaks/hero-music.peaks.json scripts/peaks/demo-peaks-meta.json; do test -f $f && echo -n "$f $(sha256sum < $f | cut -c1-16) " || echo -n "$f absent "; done)"
echo "K10 regen-identity $(grep -c ' \([0-9a-f]\{16\}\) store \1$' $B/sketch-logs/regen-v6-identity.txt) of $(wc -l < $B/sketch-logs/regen-v6-identity.txt) committed-match $(for f in public/peaks/middle-east.peaks.json public/peaks/hero-music.peaks.json scripts/peaks/demo-peaks-meta.json; do grep -c "^$f $(sha256sum < $f | cut -c1-16) " $B/sketch-logs/regen-v6-identity.txt; done | tr '\n' ' ')"
echo "K11 runtime-files-in-delta $(grep '^diff --git' $B/sketch-412-delta.patch.txt | awk '{print $3}' | grep -cE '^a/app/(components|contexts|lib|data)/[^_]*\.tsx?$|^a/public/')"
echo "K12 cumulative-identity $(grep -c '^same ' $B/sketch-logs/cumulative-identity.txt) diff $(grep -c '^DIFF ' $B/sketch-logs/cumulative-identity.txt)"
echo "K13 delta-sha $(sha256sum < $B/sketch-412-delta.patch.txt | cut -c1-16) cumulative-sha $(sha256sum < $B/sketch-412-cumulative.patch.txt | cut -c1-16) review-line1-names-delta $(head -1 $B/sketch-review.md 2>/dev/null | grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)")"
for f in sketch-412-delta.patch.txt sketch-412-cumulative.patch.txt sketch-dispatched.sha256 sketch-review.md grants-412.txt r412-frozen-sha256.txt mutants/run.py mutants/summary.txt mutants/on-v5-test/summary.txt fixtures/regen-48k/middle-east.peaks.json fixtures/regen-48k/hero-music.peaks.json fixtures/regen-48k/demo-peaks-meta.json fixtures/ps17-v5-test.ts.txt sketch-logs/regen-v6-identity.txt sketch-logs/regen-v6.log sketch-logs/cumulative-identity.txt sketch-logs/covering.txt sketch-logs/covering.json sketch-logs/slowest.txt sketch-logs/rc.txt sketch-logs/tsc.log sketch-logs/biome.log sketch-logs/full.json sketch-logs/full.rc current-task-before-412.md; do echo "K14 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K15 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0 failed \[\]' $B/mutants/summary.txt) scratch $(grep 'SCRATCH-STATUS' $B/mutants/summary.txt) | on-v5-test survived $(grep -o '^MU-412-[A-Z0-9-]* SURVIVED' $B/mutants/on-v5-test/summary.txt | awk '{print $1}' | tr '\n' ' ')"
echo "K16 gate411 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-411.json'));print(d['status'],d.get('reason'))") gate410 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-410.json'));print(d['status'],d['commit'][:7])")"
echo "K17 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K18 archive-equal $(cmp -s $LOOP/tasks/round-411.md $B/current-task-before-412.md && echo 1 || echo 0)"
echo "K19 covering $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/covering.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])") full $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/full.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])" 2>/dev/null) full-rc $(cat $B/sketch-logs/full.rc 2>/dev/null)"
echo "K20 c411-browser $(for f in probe-real-1440x900 probe-real-1280x720; do python3 -I -c "import json;d=json.load(open('$LOOP/c-round-411/$f.json'));h=d['whileAudioHeld'];r=d['afterReady'];print('$f', 'held', h['rects'], h['ariaDisabled'], 'ready', r['rects'], 'meBegins', d['middleEastBegins'], 'peaksReq', len(d['peaksRequests']), 'errors', len(d['pageErrors']), end=' ')"; echo -n '; '; done)"
echo "K22 doc264-l17-names-v5-patch $(sed -n 17p $D264 | grep -c 'sketch-411.patch.txt')"
echo "K23 doc264-l31-bearer-claim $(sed -n 31p $D264 | grep -c 'bearer header')"
for f in b-round-411/claims-412-planning-output.txt b-round-411/claims-412-sketch-output.txt b-round-411/claims-412-planning-vs-sketch.diff b-round-410/probe/peaks-before-ready-411.mjs b-round-408/lane/lane-actions-probe.mjs b-round-409/probe/peaks-probe-410.mjs tools/l57-check.py tasks/round-411.md; do echo "K14b exists $f $(test -f $LOOP/$f && echo 1 || echo 0)"; done
echo "K21 mp3-bytes $(wc -c < public/middle-east.mp3) $(wc -c < public/videos/hero/hero-music.mp3)"
