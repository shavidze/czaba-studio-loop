#!/usr/bin/env bash
# Round 310 claims (B round 309 -> 310 planning). Run from the loop root: bash b-round-309/claims-310.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
P=$S/workers/r2-proxy.js; W=$S/cloudflare/r2-worker.js; T=$S/workers/r2-proxy.test.mjs
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-309.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l) $(git -C $S rev-parse --short=7 HEAD 2>/dev/null)"
echo "K3 $(wc -l < b-round-309-r310-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-309-r310-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n '^const PUBLIC_EXPOSE_HEADERS' $P | cut -d: -f1) $(grep -n '^const PUBLIC_EXPOSE_HEADERS' $W | cut -d: -f1) $(wc -l < $P) $(wc -l < $W)"
echo "K6 $(grep -c 'R2_BUCKET.head(r2Key)' $P) $(grep -c 'R2_BUCKET.get(r2Key' $P) $(grep -c 'R2_BUCKET.head(r2Key)' $W) $(grep -c 'R2_BUCKET.get(r2Key' $W)"
echo "K7 $(grep -c "'no-store'" $P) $(grep -c "'no-store'" $W) $(grep -c "'private, no-store'" $P) $(grep -c "'private, no-store'" $W)"
echo "K8 $(grep -c "'Image Not Found'" $P) $(grep -c "'File Not Found: ' + r2Key" $P) $(grep -c "'File Not Found: ' + r2Key" $W) $(grep -c "'Internal Error'" $P) $(grep -c "'Internal Error'" $W)"
echo "K9 $(cd $S && node --test workers/r2-proxy.test.mjs 2>&1 | grep -E '^# (tests|pass|fail) ' | tr '\n' ' ')"
echo "K10 $(grep -c 'node --test workers' $S/package.json 2>/dev/null) $(grep -c 'r2-proxy' gates/round-309/verify.log)"
echo "K11 $(diff <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $P) <(sed -n '/^const PUBLIC_EXPOSE_HEADERS/,$p' $W) | wc -l)"
echo "K12 $(grep -c 'onlyIf' $P) $(grep -c 'onlyIf' $W)"
echo "K13 $(python3 -I - <<'PY'
import json
def ops(f,k):
    s=json.load(open('b-round-309/probe/'+f))['steps'][k]['server']
    return ','.join(f"{e['status']}:h{e['r2']['heads']}g{e['r2']['gets']}c{e['r2']['cancels']}" for e in s)
for f in ['head-proxy-throw-1440.json','sketch-proxy-throw-1440.json','sketch-proxy-short-1440.json']:
    print(f.split('-1440')[0], 'reval', ops(f,'revalidate'), 'range', ops(f,'rangeFetch'), 'unsat', ops(f,'unsatisfiable'), 'seek', ops(f,'audioSeek'), end=' | ')
PY
)"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(cmp -s tasks/round-309.md b-round-308/../tasks/round-309.md && cmp -s tasks/round-309.md b-round-309/round-309-task-copy.md && echo archive-equal-309)"
echo "K16 $(ls $S/docs/implementation/2026/quarter-IV/ 2>/dev/null | grep -c '^226-') $(ls $S/docs/implementation/2026/quarter-IV/ 2>/dev/null | tail -1)"
echo "K17 $(grep -c ' -> ' b-round-309/sketch/sketch-mutants.txt) $(grep -c 'restored: # pass 69 # fail 0' b-round-309/sketch/sketch-mutants.txt)"
echo "K18 $(for f in b-round-309/probe/worker-server.mjs b-round-309/probe/browser-probe.cjs b-round-309/probe/head-proxy-throw-1440.json b-round-309/probe/sketch-proxy-throw-1440.json b-round-309/probe/sketch-proxy-short-1440.json b-round-309/probe/sketch-alt-throw-1440.json b-round-309/probe/sketch-alt-short-1440.json b-round-309/probe/summary.txt b-round-309/sketch/helper-block.js.txt b-round-309/sketch/sketch-tests-on-v1.txt b-round-309/sketch/sketch-r2-proxy.js.txt b-round-309/sketch/sketch-r2-worker.js.txt b-round-309/sketch/sketch-r2-proxy.test.mjs.txt b-round-309/sketch/sketch-mutants.txt b-round-309/sketch/mutants.py b-round-309/sketch/sketch-tests-on-head.txt b-round-309/claims-310-sketch-output.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K19 $(grep -c '^not ok' b-round-309/sketch/sketch-tests-on-head.txt)"
