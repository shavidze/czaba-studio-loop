#!/usr/bin/env bash
# B round 413 -> 414 claims (L29/L56). Run: bash b-round-413/claims-414.sh   (ROOT= repository, LOOP= loop folder)
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-413
cd "$ROOT" || exit 2
T=workers/r2-proxy.test.mjs
WP=workers/r2-proxy.js
WA=cloudflare/r2-worker.js
D266=docs/implementation/2026/quarter-IV/266-sys-r2-fake-fidelity.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -cvxF -f $B/grants-414.txt)"
echo "K3 frozen-entries $(wc -l < $B/r414-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r414-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-414.txt)"
echo "K5 sketch-applies-on-tree $(git apply --check $B/sketch-414.patch.txt >/dev/null 2>&1 && echo yes || echo no) sketch-files $(grep '^diff --git' $B/sketch-414.patch.txt | awk '{print $3}' | sed 's#^a/##' | tr '\n' ' ')"
echo "K6 doc266 $(test -f $D266 && sed -n 4p $D266 || echo absent) taken-266 $(ls docs/implementation/2026/quarter-IV | grep -c '^266-') last $(ls docs/implementation/2026/quarter-IV | tail -1)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 fake head-always-etag1 $(grep -c "return missing ? null : { size: DATA.length, etag: 'etag-1', httpEtag: ETAG };" $T) typeerror-any-mode $(grep -c "if (range && \[range.offset, range.length, range.suffix\].some(" $T) typeerror-throw-only $(grep -c "if (outOfRange === 'throw' && range && \[range.offset" $T) headSeesNewVersion $(grep -c headSeesNewVersion $T) goneOnSecondRead $(grep -c goneOnSecondRead $T)"
echo "K7b rows $(grep -oE "test\(\`\\\$\{name\}: PR[0-9]+" $T | sed 's/.*: //' | tr '\n' ' ') far-heads-1 $(grep -c "assert.equal(far.heads.length, 1, outOfRange);" $T) pr17-acao $(grep -c "fresh.response.headers.get('Access-Control-Allow-Origin'), '\*', label" $T)"
echo "K7c protected-fake-httpEtag $(grep -c "body: 'file', size: 4, etag: 'etag-1', httpEtag" $T) goneOnHead $(grep -c goneOnHead $T)"
echo "K7e protected-rows-l32-134-diff-lines $(diff <(git show HEAD:$T | sed -n 32,134p) <(sed -n 32,134p $T) | wc -l) head-ref $(git rev-parse --short HEAD)"
echo "K8 worker etag-delete-branches proxy $(grep -c "else headers.delete('ETag');" $WP) alt $(grep -c "else headers.delete('ETag');" $WA) accept-ranges-guard proxy $(grep -c "if (allowRange) headers.set('Accept-Ranges', 'bytes');" $WP) range-regex proxy $(grep -c '/^bytes=(\\d\*)-(\\d\*)\$/' $WP) alt $(grep -c '/^bytes=(\\d\*)-(\\d\*)\$/' $WA) trim $(grep -c ".exec((header || '').trim());" $WP) head-range-206 PR6 $(grep -c "assert.equal(part.response.status, 206);" $T)"
echo "K8c cover-route handleImage proxy $(grep -c handleImage $WP) alt $(grep -c handleImage $WA) non-PR-tests $(node --test --test-reporter=tap $T | grep -E '^ok [0-9]+ - ' | grep -vc ': PR')"
echo "K8b parity-helper-block-diff-lines $(diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $WP) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $WA) | wc -l)"
echo "K9 r2-doc httpEtag-l147 $(sed -n 147p $LOOP/b-round-310/r2-workers-api-reference-2026-11-03.md.txt) | range-l155 $(sed -n 155p $LOOP/b-round-310/r2-workers-api-reference-2026-11-03.md.txt)"
echo "K9b rfc9110 l6326 $(sed -n 6326p $LOOP/b-round-310/rfc9110-2026-11-03.txt | tr -s ' ') | l6476 $(sed -n 6476p $LOOP/b-round-310/rfc9110-2026-11-03.txt | tr -s ' ') | l6481-6484 $(sed -n 6481,6484p $LOOP/b-round-310/rfc9110-2026-11-03.txt | tr -s ' ' | tr '\n' ' ')"
echo "K10 node-test $(node --test $T 2>&1 | grep -E '^# (tests|pass|fail) ' | tr '\n' ' ')"
echo "K10b verify-runs-worker-tests $(grep '"verify"' package.json | grep -c 'r2-proxy') biome-includes $(grep -oE '"includes": \[[^]]*\]' biome.json | head -1)"
echo "K11 mutants sketch-red $(grep -c '| SKETCH RED' $B/mutants/summary.txt) expected-row-red $(grep -c 'expected-row-red True' $B/mutants/summary.txt) head-tests-survive $(grep -c 'HEAD-TESTS GREEN(survives)' $B/mutants/summary.txt) equivalent $(grep -c 'SKETCH GREEN' $B/mutants/summary.txt) pristine $(grep -cE 'PRISTINE-(BEFORE|AFTER) .* rc 0 ' $B/mutants/summary.txt) $(grep 'SCRATCH-STATUS' $B/mutants/summary.txt)"
echo "K12 sketch-sha $(sha256sum < $B/sketch-414.patch.txt | cut -c1-16) recorded $(cut -c1-16 $B/sketch-414.sha256)"
echo "K13 gate413 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-413.json'));print(d['status'],d['commit'][:7])")"
echo "K14 c413-json $(python3 -I -c "import json;d=json.load(open('$LOOP/c-round-413.json'));print(d['taskStatus'],'browserVerified',d['browserVerified'],'bugs',len(d['bugs']))")"
echo "K15 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K16 archive-equal $(cmp -s $LOOP/tasks/round-413.md $B/current-task-before-414.md && echo 1 || echo 0)"
echo "K17 browser-head-summary $(tr '\n' ' ' < $B/probe/head-summary.txt | tr -s ' ')"
for f in sketch-414.patch.txt sketch-414.sha256 sketch-414-v1.patch.txt grants-414.txt r414-frozen-sha256.txt mutants/run.py mutants/summary.txt probe/worker-server.mjs probe/browser-probe.cjs probe/summarize-414.py probe/head-proxy-throw-1440.json probe/head-proxy-short-1440.json probe/head-summary.txt sketch-review.md; do echo "K18 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
for f in c-round-413/auth-probe.mjs tools/l57-check.py b-round-310/r2-workers-api-reference-2026-11-03.md.txt b-round-310/rfc9110-2026-11-03.txt b-round-318/protected-sha256.txt; do echo "K18b exists $f $(test -f $LOOP/$f && echo 1 || echo 0)"; done
