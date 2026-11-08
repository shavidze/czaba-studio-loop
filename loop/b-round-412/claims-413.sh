#!/usr/bin/env bash
# B round 412 -> 413 claims (L29/L56). Run: bash b-round-412/claims-413.sh   (ROOT= repository, LOOP= loop folder)
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-412
cd "$ROOT" || exit 2
PP=app/lib/arrangement/precomputed-peaks.ts
COL=app/lib/arrangement/collection.ts
CTX=app/contexts/ArrangementContext.tsx
TA=app/types/arrangement.ts
TU=app/types/audio.ts
PPT=app/lib/arrangement/__tests__/precomputed-peaks.test.ts
PCT=app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx
CT=app/lib/arrangement/__tests__/collection.test.ts
PS=app/data/__tests__/studio-lab-demo.test.ts
D263=docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md
D264=docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md
D265=docs/implementation/2026/quarter-IV/265-perf-precomputed-peaks-purchased.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status $(git status --short --untracked-files=all | awk '{print $1}' | sort | uniq -c | tr -s ' ' | tr '\n' ' ')total $(git status --short --untracked-files=all | wc -l)"
echo "K2b status-outside-grants $(git status --short --untracked-files=all | awk '{print $2}' | grep -cvxF -f $B/grants-413.txt)"
echo "K3 frozen-entries $(wc -l < $B/r413-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r413-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-413.txt)"
echo "K5 sketch-applies-on-tree $(git apply --check $B/sketch-413.patch.txt >/dev/null 2>&1 && echo yes || echo no) sketch-files $(grep '^diff --git' $B/sketch-413.patch.txt | awk '{print $3}' | sed 's#^a/##' | tr '\n' ' ')"
echo "K6 doc263 l4 $(sed -n 4p $D263) | doc264 l4 $(sed -n 4p $D264) | doc265 $(test -f $D265 && sed -n 4p $D265 || echo absent)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l) next-free-265 $(ls docs/implementation/2026/quarter-IV | grep -c '^265-')"
echo "K7 peaks-fetch declared-length $(grep -c "Number(response.headers.get('content-length') ?? 0)" $PP) response-json $(grep -c 'await response.json()' $PP) reader $(grep -c 'body.getReader()' $PP) abort-listener $(grep -c "signal.addEventListener('abort', cancel, { once: true })" $PP) caller-abort-check $(grep -c 'if (text === null || signal.aborted) {' $PP)"
echo "K7b context-call no-fetch $(grep -c 'fetchPrecomputedPeaks(peaksUrl, controller.signal)\.then' $CTX) with-fetchPeaks $(grep -c 'fetchPrecomputedPeaks(peaksUrl, controller.signal, collection.fetchPeaks)' $CTX) call-sites $(grep -c 'fetchPrecomputedPeaks(' $CTX)"
echo "K7c adapter default-fetch $(grep -c 'fetchAudio = (url, init) => fetch(url, init),' $COL) previewUrl $(grep -c 'previewUrl: (source) => stemUrls.get(source.id) ?? null,' $COL) peaksUrl $(grep -c 'peaksUrl: (source) => stemPeaksUrls.get(source.id) ?? null,' $COL) fetchPeaks $(grep -c 'fetchPeaks: fetchAudio,' $COL) sameOrigin $(grep -c 'sameOrigin(stem.peaksUrl, stem.audioUrl)' $COL)"
echo "K7d types collection-peaksUrl $(grep -c 'peaksUrl?: (source: WorkspaceSource) => string | null;' $TA) collection-fetchPeaks $(grep -c 'fetchPeaks?: (url: string, init: RequestInit) => Promise<Response>;' $TA) stem-peaksUrl $(grep -c '  peaksUrl?: string;' $TU)"
echo "K8 no-url-keyed-peaks-cache stem-cache-peaks-hits $(cat app/lib/arrangement/stem-cache.ts app/lib/arrangement/stem-cache.client.ts | grep -ci peaks) peaks-storage-hits $(grep -rlE 'indexedDB|caches\.|localStorage|sessionStorage' $PP $COL | wc -l)"
echo "K9 SWEEP AudioStem-importers(app,perf,e2e) $(grep -rlE '\bAudioStem\b' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K10 SWEEP fetchPrecomputedPeaks|peaksUrl|fetchPeaks(app,perf,e2e) $(grep -rlE 'fetchPrecomputedPeaks|peaksUrl|fetchPeaks' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K10b PP7d json-override $(grep -c 'json: async () => {' $PPT) row-ids PPT $(grep -oE "it\('(PP[0-9]+[a-z]?)" $PPT | sed "s/it('//" | tr '\n' ' ')"
echo "K10c row-ids CT-PK $(grep -oE "it\('PK[0-9]+" $CT | sed "s/it('//" | tr '\n' ' ') PCT-PPC12 $(grep -c "it('PPC12 " $PCT) PS18 $(grep -c "it('PS18 " $PS)"
echo "K11 meta-file-fields $(grep -c '"file": "public/peaks/' scripts/peaks/demo-peaks-meta.json)"
echo "K12 sketch-sha $(sha256sum < $B/sketch-413.patch.txt | cut -c1-16) dispatched-file $(cut -c1-16 $B/sketch-dispatched.sha256) review-line1-names-sketch $(head -1 $B/sketch-review.md 2>/dev/null | grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)")"
echo "K13 mutants red $(grep -c ' RED rc 1' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0 failed \[\]' $B/mutants/summary.txt) $(grep 'SCRATCH-STATUS' $B/mutants/summary.txt)"
for f in sketch-413.patch.txt sketch-dispatched.sha256 sketch-review.md sketch-413-v1.patch.txt sketch-413-v3.patch.txt grants-413.txt r413-frozen-sha256.txt mutants/run.py mutants/summary.txt sketch-logs/covering.txt sketch-logs/covering.json sketch-logs/covering.rc sketch-logs/slowest.txt precheck-full.json precheck-full.log precheck-full.rc probe/peaks-before-ready-413.mjs fixtures/middle-east.peaks.json browser/harness-notes.md browser/real-5174-1440x900.json browser/real-5173-1440x900.json browser/v4-real-5174-1440x900.json browser/v4-real-5174-1280x720.json browser/v4-404-5174-1440x900.json browser/v4-404-5174-1280x720.json browser/v4-8bit-5174-1440x900.json browser/v4-8bit-5174-1280x720.json root-request-playwright-firefox.md current-task-before-413.md; do echo "K14 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
for f in b-round-410/probe/peaks-before-ready-411.mjs b-round-408/lane/lane-actions-probe.mjs b-round-409/probe/peaks-probe-410.mjs tools/l57-check.py tasks/round-412.md c-round-412/l57-check.txt; do echo "K14b exists $f $(test -f $LOOP/$f && echo 1 || echo 0)"; done
echo "K15 covering $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/covering.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])") rc $(cat $B/sketch-logs/covering.rc) full $(python3 -I -c "import json;d=json.load(open('$B/precheck-full.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])" 2>/dev/null) full-rc $(cat $B/precheck-full.rc 2>/dev/null)"
echo "K16 gate412 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-412.json'));print(d['status'],d['commit'][:7])")"
echo "K17 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K18 archive-equal $(cmp -s $LOOP/tasks/round-412.md $B/current-task-before-413.md && echo 1 || echo 0)"
echo "K19 playwright-firefox-installed $(ls ~/.cache/ms-playwright 2>/dev/null | grep -c firefox)"
echo "K20 browser-real $(for f in real-5173-1440x900 v4-real-5174-1440x900 v4-real-5174-1280x720 v4-404-5174-1440x900 v4-404-5174-1280x720 v4-8bit-5174-1440x900 v4-8bit-5174-1280x720; do python3 -I -c "import json;d=json.load(open('$B/browser/$f.json'));h=d['whileAudioHeld'];r=d['afterReady'];print('$f','held',h['rects'],h['ariaDisabled'],'ready',r['rects'],r['ariaDisabled'],'meBegins',d['middleEastBegins'],'peaksReq',len(d['peaksRequests']),'errors',len(d['pageErrors']),end=' ')"; echo -n '; '; done)"
echo "K21 c412-json $(python3 -I -c "import json;d=json.load(open('$LOOP/c-round-412.json'));print(d['taskStatus'],'browserVerified',d['browserVerified'],'bugs',len(d['bugs']))")"
echo "K22 purchased-adapter-mounted-in-routes $(grep -rl 'createPurchasedWorkspaceCollection' app/routes | wc -l) PPC-toneCollection-fetchPeaks-at-HEAD-lines $(git show HEAD:app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx | grep -c fetchPeaks)"
echo "K23 console-hits $(cat app/lib/arrangement/precomputed-peaks.ts app/lib/arrangement/collection.ts | grep -cE 'console\.') screen-files-in-sketch $(grep '^diff --git' $B/sketch-413.patch.txt | awk '{print $3}' | grep -cE '^a/app/(components|routes)/')"
