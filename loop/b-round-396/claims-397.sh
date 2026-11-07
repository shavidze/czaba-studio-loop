#!/usr/bin/env bash
# Round 397 PERF-13d claims (L29 + L56). Run from the loop root. CLAIMS_STORE overrides the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}; D=$S/app/data/studio-lab-demo.ts; Y=$S/app/lib/arrangement/demo-synth.ts; T=$S/app/data/__tests__/studio-lab-demo-synth-buffer.test.ts; X=$S/app/contexts/ArrangementContext.tsx; D7=$S/docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md; D3=$S/docs/implementation/2026/quarter-IV/253-perf-demo-synth-buffers.md; B=b-round-396
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-396.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/$B/r397-frozen-sha256.txt 2>/dev/null | grep -vc ': OK$') $(wc -l < $B/r397-frozen-sha256.txt)"
echo "K5 $(python3 -I -c "import json;d=json.load(open('regression-last.json'));print(d['date'],d['round'])")"
echo "K6 $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:5173/studio-lab)"
echo "K7 $(python3 -I -c "import json;c=json.load(open('c-round-396.json'));print(c['taskStatus'],len(c['bugs']),c['browserVerified'],c['realVerified'])")"
echo "K8 loader stereo-helper $(grep -c 'generateDemoStereoChannels' $D) copy-same $(grep -c 'buffer.copyToChannel(samples, ' $D) channels-literal $(grep -c 'numberOfChannels: 2,' $D) yield-call $(grep -c 'await yieldToNextTask();' $D) abort-check $(grep -c 'signal.throwIfAborted();' $D) set-timeout $(grep -c 'setTimeout(' $D) worker-call $(grep -c 'await synthesizeDemoCompositionOffMainThread()' $D)"
echo "K9 synth export-stereo $(grep -c 'export function generateDemoStereoChannels' $Y) copy-ctor $(grep -c 'new Float32Array(left)' $Y)"
echo "K10 SWEEP generateDemoStereoChannels (roots app/** perf/** e2e/**): $(grep -rl 'generateDemoStereoChannels' $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K11 consumers loadSource-calls $(grep -rn '\.loadSource(' $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) abort-guards-signal $(grep -c 'if (signal.aborted) {' $X) abort-guards-controller $(grep -c 'if (controller.signal.aborted) {' $X)"
echo "K12 rows SB-ids $( [ -f $T ] && grep -oE "'SB[0-9]+ " $T | sort -u | tr -d "' " | tr '\n' ' ' || echo none)"
echo "K13 doc247 l4 $(sed -n 4p $D7) | doc253 $( [ -f $D3 ] && echo exists l4 "$(sed -n 4p $D3)" headings $(grep -c '^## ' $D3) || echo absent) | in-progress-docs $(grep -rln 'In Progress (stage' $S/docs/implementation | wc -l)"
echo "K14 SWEEP fake-timer suites that import the demo collection (app/**/__tests__): $(for f in $(grep -rlE 'studio-lab-demo|routes/studio-lab' $S/app --include=*.ts --include=*.tsx | grep __tests__); do grep -l 'useFakeTimers' $f; done | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K15 mutants $(grep -c ' RED ' $B/mutants/summary.txt) red, $(grep -c SURVIVED $B/mutants/summary.txt) survived, $(grep pristine $B/mutants/summary.txt | tr '\n' ' ')"
echo "K16 probe $(python3 -I -c "
import json,glob
for k in ['head','sketch']:
    fs=sorted(glob.glob('$B/probe/'+k+'-6x-1*x*-[123].json'))
    d=[json.load(open(f)) for f in fs]
    print(k,len(fs),'builds',sorted({x['synthBuilds'] for x in d}),'same',sorted({x['sameArrayBuilds'] for x in d}),'maxPerLT',sorted({x['maxSynthBuildsPerLongtask'] for x in d}),'ltMs',[t['ms'] for x in d for t in x['longtasksWithBuilds']],end=' | ')
a=[json.load(open('$B/probe/'+f)) for f in ['head-6x-hash.json','sketch-6x-hash.json','head-6x-hash-1280.json','sketch-6x-hash-1280.json']]
print('hash-equal',len({x['hashes'] for x in a})==1,'play',[x['play']['playing'] for x in a])
")"
echo "K17 sketch-sha256 $(sha256sum $B/sketch-397.patch.txt | cut -c1-16) applies-to-tree $(cd $S && git apply --check $L/$B/sketch-397.patch.txt 2>/dev/null && echo yes || echo no) review-sha $( [ -f $B/sketch-review.md ] && grep -c "$(sha256sum $B/sketch-397.patch.txt | cut -d' ' -f1)" $B/sketch-review.md || echo 0)"
echo "K18 full $(grep -E 'Test Files|Tests |^rc' $B/precheck-full.log | tr -s ' ' | tr '\n' ' ') yield-all-control $(sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full-v1-yield-all.log | grep -cE 'FAIL .*NG5[bc]:')"
echo "K19 covering $( [ -f $B/precheck-covering.log ] && sed 's/\x1b\[[0-9;]*m//g' $B/precheck-covering.log | grep -E 'Test Files|Tests ' | tr -s ' ' | tr '\n' ' ') files $(wc -l < $B/covering-files.txt) slowest $( [ -f $B/covering-slowest.txt ] && head -1 $B/covering-slowest.txt)"
echo "K20 perf-load-sketch $( [ -f $B/perf-sketch-load-rows.txt ] && cat $B/perf-sketch-load-rows.txt || echo pending)"
echo "K22 ready-text $(grep -c "'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.'," $S/app/lib/arrangement/collection.ts) canReload $(grep -c 'canReloadSource: (source) => Object.hasOwn(demoUrls, source.id),' $D)"
echo "K23 doc247 todo-13d $(grep -c '^4\. \*\*13d:\*\*' $D7) todo-heading $(grep -c '^## TODO / შემდეგი ნაბიჯები' $D7)"
echo "K24 SWEEP covering (roots app/** perf/** e2e/**, test files naming studio-lab-demo|demo-synth|routes/studio-lab|generateDemoStereoChannels|loadDemoSource): $(grep -rlE 'studio-lab-demo|demo-synth|routes/studio-lab|generateDemoStereoChannels|loadDemoSource' $S/app $S/perf $S/e2e --include=*.ts --include=*.tsx | grep -E '__tests__|/perf/|/e2e/' | wc -l)"
echo "K25 perf results-dir $(grep -c "const resultsDir = path.join(storeRoot, 'test-results', 'perf');" $S/perf/studio-lab.perf.spec.ts) latest $(grep -c "writeFileSync(path.join(resultsDir, 'latest.json'), json);" $S/perf/studio-lab.perf.spec.ts) script-max-assert $(python3 -I -c "import json;r={x['id']:x for x in json.load(open('$S/perf/budgets.json'))['rows']} if isinstance(json.load(open('$S/perf/budgets.json')),dict) else {x['id']:x for x in json.load(open('$S/perf/budgets.json'))};x=r['load.script-max'];print(x['mode'],x['budget'])")"
echo "K21 $(for f in tasks/round-396.md a-round-396.md c-round-396.json gates/gate-round-396.json $B/grants-397.txt $B/r397-frozen-sha256.txt b-round-318/protected-sha256.txt $B/sketch-397.patch.txt $B/sketch-review.md $B/probe/rows.cjs $B/probe/premise.cjs $B/probe/head-6x-1.json $B/mutants/run.py $B/mutants/summary.txt $B/precheck-full.log $B/precheck-full-v1-yield-all.log $B/covering-files.txt $B/sketch-tsc.log $B/sketch-biome.log; do test -f $f || echo "MISSING $f"; done; echo checked)"
