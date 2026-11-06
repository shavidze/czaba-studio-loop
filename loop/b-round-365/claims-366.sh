#!/usr/bin/env bash
# B round 365 -> 366 claims (PERF-9b stem-cache perf rows). Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
SPEC=$S/perf/studio-lab-stem-cache.perf.spec.ts
BUD=$S/perf/budgets.stem-cache.json
DOC=$S/docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-365.json'));print('g365',g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
  echo "K7 app-changes $(git -C $S status --short --untracked-files=all -- app | wc -l) perf-lib-changes $(git -C $S status --short --untracked-files=all -- perf/lib | wc -l) old-specs-changes $(git -C $S status --short -- perf/studio-lab.perf.spec.ts perf/studio-lab-resources.perf.spec.ts perf/studio-lab-interactions.perf.spec.ts perf/budgets.json perf/budgets.resources.json perf/budgets.interactions.json | wc -l)"
else
  echo "K2 scratch n/a"
  echo "K7 scratch n/a"
fi
echo "K3 files spec $(test -f $SPEC && echo 1 || echo 0) budgets $(test -f $BUD && echo 1 || echo 0)"
if [ -f "$BUD" ]; then
  echo "K4 $(python3 -I -c "import json;r=json.load(open('$BUD'));a=sorted(x['id']+' '+x['budget']['op']+' '+str(x['budget']['value']) for x in r if x['mode']=='assert');print('rows',len(r),'assert',len(a),'owner-9b',sum(x['owner']=='PERF-9b' for x in r),'|',' ; '.join(a))")"
else echo "K4 budgets absent"; fi
echo "K5 protected-ok $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K6 package.json-sha $(sha256sum $S/package.json | cut -c1-12) lock-sha $(sha256sum $S/package-lock.json | cut -c1-12)"
echo "K8 doc236-l4 $(sed -n '4p' $DOC) | pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l) | stage-hits $(grep -rln 'In Progress (stage' $S/docs/implementation | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K9 perf-config testMatch $(grep -c "testMatch: '\*.perf.spec.ts'" $S/playwright.perf.config.ts) port5188 $(grep -c "PORT: '5188'" $S/playwright.perf.config.ts) build-in-webserver $(grep -c "command: 'npm run build && npx remix-serve build/server/index.js'" $S/playwright.perf.config.ts)"
echo "K10 cache-db-name $(grep -c "STEM_CACHE_DB_NAME = 'czaba-stem-cache-v2'" $S/app/lib/arrangement/stem-cache.ts) store-name $(grep -c "STORE_NAME = 'entries'" $S/app/lib/arrangement/stem-cache.client.ts) hit-no-store $(grep -c "cache: 'no-store'" $S/app/lib/arrangement/stem-cache.client.ts) preview-wiring $(grep -c 'fetchAndDecodeSource(url, ctx, signal, publicPreviewSourceFetch())' $S/app/data/studio-lab-demo.ts)"
echo "K11 biome-includes $(grep -c '"includes": \["app/\*\*/\*.ts", "app/\*\*/\*.tsx"\]' $S/biome.json) determinism-units $(grep -cE "^  '(count|bytes|boolean \(1 = true\))',$" $S/perf/lib/determinism.ts)"
echo "K12 doc236-headings $(grep -c '^## ' $DOC)"
echo "K13 artifacts-missing $(for f in b-round-365/sketch.patch.txt b-round-365/sketch-dispatched.sha256 b-round-365/sketch-typecheck.log b-round-365/sketch-biome.log b-round-365/perf-sketch/run2.log b-round-365/perf-sketch/run2-latest-stem-cache.json b-round-365/perf-sketch/run3-loaded.log b-round-365/perf-sketch/run4-assert.log b-round-365/perf-sketch/run4-assert-latest.json b-round-365/perf-sketch/run-v3.log b-round-365/perf-sketch/run-v3-latest.json b-round-365/perf-sketch/run-v4.log b-round-365/perf-sketch/run-v4-latest.json b-round-365/sketch-v3/sketch-v3.patch.txt b-round-365/perf-sketch/mutant-cache-off-v3.log b-round-365/perf-sketch/mutant-cache-off-assert.log b-round-365/perf-sketch/mutant-cache-off.diff.txt b-round-365/perf-sketch/mutant-counter-zero.log b-round-365/perf-sketch/mutant-counter-zero.diff.txt b-round-365/perf-sketch/headers-prod.json b-round-365/perf-sketch/run1.log b-round-365/probe/stem-prod-probe.mjs b-round-365/probe/stem-prod-1440x900.json b-round-365/probe/stem-prod-1280x720.json b-round-365/sketch-review.md; do test -f $L/$f || echo -n "$f "; done; echo)"
