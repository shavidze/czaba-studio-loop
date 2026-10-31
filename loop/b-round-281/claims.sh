#!/usr/bin/env bash
# Round 282 claims block (L29). Run from store/ at HEAD 000da42 (or a clean `git archive 000da42` copy).
# Expected output: b-round-281/claims-output-at-000da42.txt
D=docs/implementation/2026/quarter-IV
echo "== K1 HEAD"; git rev-parse --short HEAD 2>/dev/null || echo "(archive)"
echo "== K2 synchronous composition calls in the demo collection"; grep -n "getDemoStemComposition()" app/data/studio-lab-demo.ts
echo "== K3 the load effect calls loadSource for every source"; grep -n "\.loadSource(source, decodeContext, controller.signal)" app/contexts/ArrangementContext.tsx
echo "== K4 peaks are computed on the main thread after each source resolves"; grep -n "computePeaks(channels, buffer.sampleRate, PEAK_BUCKETS_PER_SECOND)" app/contexts/ArrangementContext.tsx
echo "== K5 the LoAF/longtask observer stores t, duration and name only"; grep -n "target.push({ t: entry.startTime, duration: entry.duration, name: entry.name });" perf/lib/instrumentation.ts
echo "== K6 the load window ends at ready; the status wait follows"; grep -n "snapshot(page, 0, readyMs)\|await waitForCollectionReady(page, result.problems, 'after load');" perf/studio-lab.perf.spec.ts
echo "== K7 the PERF-1a load rows (id kind mode owner)"; python3 -I -c "import json;[print(r['id'],r['kind'],r['mode'],r['owner']) for r in json.load(open('perf/budgets.json')) if r['id'].startswith('load.')]"
echo "== K8 demo-synth files in app/lib/arrangement"; ls app/lib/arrangement | grep '^demo-synth'
echo "== K9 importers of the demo collection or the synth (roots app perf e2e)"; grep -rlE "studio-lab-demo'|demo-synth'" app perf e2e | sort
echo "== K10 module-worker precedent"; grep -rn "new Worker(new URL(" app --include=*.ts | sort
echo "== K11 FakeWorker precedent"; grep -n "^class FakeWorker\|vi.stubGlobal('Worker'" app/lib/arrangement/__tests__/export-cancel.test.ts
echo "== K12 vitest and Biome include app/** only"; grep -n "include" vitest.config.ts biome.json
echo "== K13 last implementation doc"; ls $D | tail -1
echo "== K14 In Progress (stage lines"; grep -rn 'In Progress (stage' docs/implementation | wc -l
echo "== K15 doc 163 load-row text"; grep -n "load.commits\|load.longtask-max" $D/163-studio-perf-harness.md | cut -c1-80
echo "== K16 doc 169 says instrumentation stores only duration"; grep -n 'მხოლოდ `duration`-ს ინახავს' $D/169-perf-resources-baseline.md | cut -c1-60
echo "== K17 load rows are recorded at 1x only"; grep -n "if (!record) result.samples.clear();" perf/studio-lab.perf.spec.ts
echo "== K18 ST51 walks app/lib/arrangement"; grep -n "it('ST51" app/lib/arrangement/__tests__/strings.test.ts | cut -c1-60
echo "== K19 generateDemoStereoChannels callers outside tests"; grep -rn "generateDemoStereoChannels" app --include=*.ts --include=*.tsx | grep -v __tests__ | sort
echo "== K20 the demo collection is used only by /studio-lab"; grep -rn "studioLabDemoCollection" app --include=*.ts --include=*.tsx | grep -v __tests__ | sort
echo "== SW-A new names absent at HEAD (roots app perf e2e)"; grep -rnE "synthesizeDemoCompositionOffMainThread|demo-synth\.worker|demo-synth\.client|load\.script-max|load\.settled|scriptMax" app perf e2e | wc -l
echo "== SW-B consumers of load.commits / load.components (roots app perf e2e)"; grep -rlE "load\.commits|load\.components" app perf e2e | sort
echo "== SW-C consumers of PerfTimedEntry / state.loafs (roots app perf e2e)"; grep -rnE "PerfTimedEntry|\.loafs\b" app perf e2e | cut -d: -f1 | sort | uniq -c
echo "== K21 the load effect drops results after abort"; sed -n '3874,3900p' app/contexts/ArrangementContext.tsx | grep -c "if (controller.signal.aborted) {"
echo "== K22 strings.test names neither demo-synth file (ST4 lists export files only)"; grep -c "demo-synth" app/lib/arrangement/__tests__/strings.test.ts
