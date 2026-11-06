#!/usr/bin/env bash
# B round 364 -> 365 claims (PERF-9a stem cache v2). Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
A=$S/app/lib/arrangement
DEMO=$S/app/data/studio-lab-demo.ts
COL=$A/collection.ts
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-364.json'));print('g364',g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K3 demo-urls $(grep -cE "^  'demo-(middle-east|hero-music)': '/(middle-east|videos/hero/hero-music)\.mp3',$" $DEMO) demo-raw-fetch $(grep -c 'await fetch(url' $DEMO) demo-fetchAndDecode $(grep -c 'fetchAndDecodeSource(' $DEMO) demo-cache-import $(grep -c "stem-cache.client'" $DEMO)"
echo "K4 col-raw-fetch-block $(grep -c 'response = await fetchAudio(url' $COL) col-fetchAndDecode $(grep -c 'fetchAndDecodeSource(url, ctx, signal, fetchAudio)' $COL) col-cache-import $(grep -c 'stem-cache' $COL) col-default-fetch $(grep -c 'fetchAudio = (url, init) => fetch(url, init)' $COL)"
echo "K5 files source-fetch $(test -f $A/source-fetch.ts && echo 1 || echo 0) stem-cache $(test -f $A/stem-cache.ts && echo 1 || echo 0) stem-cache-client $(test -f $A/stem-cache.client.ts && echo 1 || echo 0) t-stem-cache $(test -f $A/__tests__/stem-cache.test.ts && echo 1 || echo 0) t-source-fetch $(test -f $A/__tests__/source-fetch.test.ts && echo 1 || echo 0)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 legacy-cache-importers $(grep -rln "lib/audio-cache'" $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K8 package.json-sha $(sha256sum $S/package.json | cut -c1-12) lock-sha $(sha256sum $S/package-lock.json | cut -c1-12) fake-indexeddb $(grep -c 'fake-indexeddb' $S/package.json)"
echo "K9 legacy-db-name $(grep -c "DB_NAME = 'czaba-audio-cache'" $S/app/lib/audio-cache.ts) v2-db-name-in-app $(grep -rn "czaba-stem-cache-v2" $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
echo "K10 narrow-audio $(grep -c "STUDIO_NARROW_PREVIEW_URL = '/middle-east.mp3'" $S/app/components/arrangement/StudioNarrowScreen.tsx) narrow-preload $(grep -c 'preload="metadata"' $S/app/components/arrangement/StudioNarrowScreen.tsx)"
echo "K11 covering-tests $(grep -rlE "studio-lab-demo|createPurchasedWorkspaceCollection|studioSourceLoadStrings|source-fetch|stem-cache" $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|/perf/|/e2e/' | wc -l)"
echo "K12 georgian-demo-guard $(grep -c "resolve(__dirname, '../../../data/studio-lab-demo.ts')" $A/__tests__/strings.test.ts) walk-floor $(grep -c 'expect(walked.length).toBeGreaterThanOrEqual(60);' $A/__tests__/strings.test.ts)"
echo "K13 dl6-once $(grep -c "DL6 success for %s fetches %s once with omitted credentials" $S/app/data/__tests__/studio-lab-demo.test.ts) pc3-exact $(grep -c 'PC3 request: fetchAudio is called once with the stem URL and exactly { credentials: "omit", signal }' $A/__tests__/collection.test.ts)"
echo "K14 doc-next $(ls $S/docs/implementation/2026/quarter-IV | sort -V | tail -1) doc236 $(test -f $S/docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md && echo 1 || echo 0) pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
echo "K15 server-mp3 $(curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://127.0.0.1:5173/middle-east.mp3) etag $(curl -sI --max-time 20 http://127.0.0.1:5173/middle-east.mp3 | grep -ci '^etag:') lastmod $(curl -sI --max-time 20 http://127.0.0.1:5173/middle-east.mp3 | grep -ci '^last-modified:')"
echo "K16 artifacts-missing $(for f in b-round-364/sketch.patch.txt b-round-364/sketch-dispatched.sha256 b-round-364/sketch-typecheck.log b-round-364/sketch-biome.log b-round-364/sketch-covering.log b-round-364/precheck-full.log b-round-364/probe/reopen-1440.json b-round-364/probe/sketch-cache.mjs b-round-364/probe/sketch-cache-1440x900.json b-round-364/probe/sketch-cache-1280x720.json b-round-364/sketch-review.md b-round-364/sketch-v1-to-v2.diff.txt b-round-364/sketch-v1/sketch-v1.patch.txt b-round-364/sketch-v1/stem-cache.client.v2.ts.txt; do test -f $L/$f || echo -n "$f "; done; echo)"
