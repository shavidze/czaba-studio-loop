#!/usr/bin/env bash
# Round 309 claims (B round 308 -> 309 planning). Run from the loop root: bash b-round-308/claims-309.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
P=$S/workers/r2-proxy.js; W=$S/cloudflare/r2-worker.js; T=$S/workers/r2-proxy.test.mjs
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-308.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"
echo "K3 $(wc -l < b-round-308-r309-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-308-r309-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n '^async function \(handleImage\|handlePreview\|handleProtected\)' $P | cut -d'(' -f1 | tr '\n' ' ')| $(grep -n '^async function \(handleImage\|handlePreview\|handleProtected\)' $W | cut -d'(' -f1 | tr '\n' ' ')"
echo "K6 $(grep -c "headers.set('Cache-Control', 'public, max-age=86400')" $P) $(grep -c "headers.set('Cache-Control', 'public, max-age=86400')" $W) $(grep -c "headers.set('Cache-Control', 'public, max-age=604800')" $P) $(grep -c "headers.set('Cache-Control', 'private, no-store')" $P) $(grep -c "headers.set('Cache-Control', 'private, no-store')" $W)"
echo "K7 $(grep -c 'ETag\|If-None-Match\|Content-Range' $P) $(grep -c 'ETag\|If-None-Match' $W) $(grep -c "Content-Range" $W)"
echo "K8 $(grep -n "'Image Not Found'" $P | cut -d: -f1) $(grep -c "'File Not Found: ' + r2Key" $P) $(grep -c "'File Not Found: ' + r2Key" $W)"
echo "K9 $(cd $S && node --test workers/r2-proxy.test.mjs 2>&1 | grep -E '^# (tests|pass|fail) ' | tr '\n' ' ')"
echo "K10 $(grep -c 'node --test workers' $S/package.json) $(grep -o '"includes": \[[^]]*\]' $S/biome.json | head -1)"
echo "K11 $(grep -c 'r2-proxy' gates/round-308/verify.log)"
echo "K12 $(grep -n 'audioUrl: `${stem.audioUrl}?token=' "$S/app/routes/studio.\$productId.tsx" | cut -d: -f1)"
echo "K13 $(grep -n "audioPreviewUrl: '/" mock-api/server.mjs | wc -l) $(grep -c "url = url.searchParams.get('url')\|const response = await fetch(audioUrl);" $S/app/routes/api.proxy.audio.ts) $(grep -c "public, max-age=31536000" $S/app/routes/api.proxy.audio.ts)"
echo "K14 $(python3 -I - <<'PY'
import json
def srv(f,k):
    s=json.load(open('b-round-308/probe/'+f))['steps'][k]['server']
    return ','.join(f"{e['status']}:{e['bodyBytes']}" for e in s)
for f in ['head-proxy-1440.json','sketch-proxy-1440.json']:
    print(f.split('-')[0], 'reval', srv(f,'revalidate'), 'range', srv(f,'rangeFetch'), 'unsat', srv(f,'unsatisfiable'), 'seek', srv(f,'audioSeek').split(',')[1], 'cover', srv(f,'coverTwice'), end=' | ')
PY
)"
echo "K15 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K16 $(cmp -s tasks/round-308.md b-round-308/round-308-task-copy.md && echo archive-equal-308)"
echo "K17 $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^225-') $(ls $S/docs/implementation/2026/quarter-IV/ | tail -1)"
echo "K18 $(cd b-round-308 && cat sketch-mutants.txt | sed -E 's/ ->.*red: \[/ /; s/\]$//' | awk '{print $1}' | tr '\n' ' ') $(grep -c 'red' b-round-308/sketch-mutants.txt)"
echo "K19 $(for f in b-round-308/probe/worker-server.mjs b-round-308/probe/browser-probe.cjs b-round-308/probe/head-proxy-1440.json b-round-308/probe/head-alt-1440.json b-round-308/probe/sketch-proxy-1440.json b-round-308/probe/sketch-alt-1440.json b-round-308/sketch.patch.txt b-round-308/sketch-public.sketch.test.mjs.txt b-round-308/sketch-r2-proxy.js.txt b-round-308/sketch-r2-worker.js.txt b-round-308/sketch-mutants.txt b-round-308/claims-309-sketch-output.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K20 $(grep -rln 'workers/r2-proxy\|cloudflare/r2-worker' $S/app $S/package.json 2>/dev/null | wc -l) $(git -C $S ls-files | grep -ciE 'wrangler')"
echo "K21 $(grep -c '"allowJs": true' $S/tsconfig.json) $(grep -o '"include": \[[^]]*\]' $S/tsconfig.json)"
