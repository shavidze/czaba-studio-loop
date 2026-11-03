#!/usr/bin/env bash
# Round 311 claims (B round 310 -> 311 planning). Run from the loop root: bash b-round-310/claims-311.sh
# Sketch run: CLAIMS_STORE=/tmp/b310s bash b-round-310/claims-311.sh (K2, K10, K16 empty there: no git, package.json or docs).
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
P=$S/workers/r2-proxy.js; W=$S/cloudflare/r2-worker.js; T=$S/workers/r2-proxy.test.mjs
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-310.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l) $(git -C $S rev-parse --short=7 HEAD 2>/dev/null)"
echo "K3 $(wc -l < b-round-310-r311-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-310-r311-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n '^const PUBLIC_EXPOSE_HEADERS' $P | cut -d: -f1) $(grep -n '^const PUBLIC_EXPOSE_HEADERS' $W | cut -d: -f1) $(wc -l < $P) $(wc -l < $W)"
echo "K6 $(grep -c 'R2_BUCKET.head(r2Key)' $P) $(grep -c 'R2_BUCKET.get(r2Key' $P) $(grep -c 'R2_BUCKET.head(r2Key)' $W) $(grep -c 'R2_BUCKET.get(r2Key' $W)"
echo "K7 $(grep -c 'Number.isSafeInteger' $P) $(grep -c 'Number.isSafeInteger' $W) $(grep -c "etagMatches(request.headers.get('If-None-Match')" $P) $(grep -c "etagMatches(request.headers.get('If-None-Match')" $W)"
echo "K8 $(grep -c "'Image Not Found'" $P) $(grep -c "'File Not Found: ' + r2Key" $P) $(grep -c "'File Not Found: ' + r2Key" $W) $(grep -c "'Internal Error'" $P) $(grep -c "'Internal Error'" $W)"
echo "K9 $(cd $S && node --test workers/r2-proxy.test.mjs 2>&1 | grep -E '^# (tests|pass|fail) ' | tr '\n' ' ')"
echo "K10 $(grep -c 'node --test workers' $S/package.json 2>/dev/null) $(grep -c 'r2-proxy' gates/round-310/verify.log)"
echo "K11 $(diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $P) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $W) | wc -l)"
echo "K12 $(grep -c 'onlyIf' $P) $(grep -c 'onlyIf' $W) $(grep -c "'no-store'" $P) $(grep -c "'no-store'" $W)"
echo "K13 $(python3 -I - <<'PY'
import json
def ops(f,k):
    s=[e for e in json.load(open('b-round-310/probe/'+f))['steps'][k]['server'] if e['method']!='OPTIONS']
    return ','.join(f"{e['status']}:h{e['r2']['heads']}g{e['r2']['gets']}c{e['r2']['cancels']}" for e in s)
for f in ['head-proxy-throw-1440.json','sketch-proxy-throw-1440.json','sketch-proxy-short-1440.json']:
    print(f.split('-1440')[0], 'hugeEnd', ops(f,'hugeEnd'), 'hugeSuffix', ops(f,'hugeSuffix'), 'hugeStart', ops(f,'hugeStart'), 'rereadInm', ops(f,'rereadInm'), 'rereadFarInm', ops(f,'rereadFarInm'), end=' | ')
PY
)"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(cmp -s tasks/round-310.md b-round-310/round-310-task-copy.md && echo archive-equal-310)"
echo "K16 $(ls $S/docs/implementation/2026/quarter-IV/ 2>/dev/null | grep -c '^227-') $(ls $S/docs/implementation/2026/quarter-IV/ 2>/dev/null | tail -1)"
echo "K17 $(grep -c ' -> ' b-round-310/sketch/sketch-mutants.txt) $(grep -c 'restored: # pass 75 # fail 0' b-round-310/sketch/sketch-mutants.txt) $(grep -c ' -> 0 red' b-round-310/sketch/sketch-mutants.txt)"
echo "K18 $(for f in b-round-310/probe/worker-server.mjs b-round-310/probe/browser-probe-311.cjs b-round-310/probe/summarize.py b-round-310/probe/swap-etag.txt b-round-310/probe/head-proxy-throw-1440.json b-round-310/probe/sketch-proxy-throw-1440.json b-round-310/probe/sketch-proxy-short-1440.json b-round-310/probe/sketch-alt-throw-1440.json b-round-310/probe/sketch-alt-short-1440.json b-round-310/probe/reg-sketch-proxy-throw-1440.json b-round-310/probe/summary.txt b-round-310/sketch/head-helper-block.js.txt b-round-310/sketch/helper-block.js.txt b-round-310/sketch/helper-block.patch.txt b-round-310/sketch/sketch-r2-proxy.js.txt b-round-310/sketch/sketch-r2-worker.js.txt b-round-310/sketch/sketch-r2-proxy.test.mjs.txt b-round-310/sketch/sketch-r2-proxy.test.patch.txt b-round-310/sketch/sketch-mutants.txt b-round-310/sketch/mutants.py b-round-310/sketch/sketch-tests-on-head.txt b-round-310/sketch/sketch-tests-on-sketch.txt b-round-310/sketch/sketch-r2-proxy.test-v1.mjs.txt b-round-310/sketch/make-sketch.py b-round-310/sketch/make-test-sketch.py b-round-310/sketch/mutant-logs/MU-HEAD-INM-SKIPPED.log b-round-310/sketch/mutant-logs/MU-THROW-REREAD-KEEPS-HEAD-ETAG.patch.txt b-round-310/r2-workers-api-reference-2026-11-03.md.txt b-round-310/rfc9110-2026-11-03.txt b-round-310/claims-311-head-output.txt b-round-310/claims-311-sketch-output.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K19 $(grep -c '^not ok' b-round-310/sketch/sketch-tests-on-head.txt)"
echo "K20 $(sed -n '231p;233p' b-round-310/r2-workers-api-reference-2026-11-03.md.txt | grep -c 'fewer bytes than this number may be returned')"
echo "K21 $(grep -c 'GET is the only method for which' b-round-310/rfc9110-2026-11-03.txt) $(grep -c 'SHOULD send the same header fields in response to a HEAD' b-round-310/rfc9110-2026-11-03.txt)"
echo "K22 $(grep -c "method: 'HEAD', headers: { Range: 'bytes=0-9' }" $T)"
