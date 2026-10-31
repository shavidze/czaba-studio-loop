#!/usr/bin/env bash
# Run from store/ at HEAD 1dbf3af (or on a clean archive of it). Output must equal claims-output-at-1dbf3af.txt.
set -u
R=perf/studio-lab-resources.perf.spec.ts
echo "== K1 heap poll period and observer flush"; grep -nE "^const (heapPollMs|observerSettleMs) =" $R
echo "== K2 HeapSample fields"; grep -nE "^interface HeapSample|^  (sentAt|receivedAt|backingBytes): number;" $R
echo "== K3 timeOrigin read and poll loop timestamps"; grep -nE "const timeOrigin =|const sentAt = Date.now\(\);|receivedAt: Date.now\(\)" $R
echo "== K4 window conversion and endpoint filter"; grep -nE "const window(Start|End)Epoch =|sample.sentAt >= windowStartEpoch && sample.receivedAt <= windowEndEpoch" $R
echo "== K5 mem-polls row, the >= 5 problem and the no-peak problem"; grep -nE "putLive\(\`mem-polls-|inWindow.length < 5|no peak \(" $R
echo "== K6 endSampleLagMs mixes the node clock and the epoch window"; grep -nE "endSampleLagMs: roundTo\(endSentAt - windowEndEpoch, 0\)" $R
echo "== K7 t0 / windowEnd / wall-ms"; grep -nE "const t0 = clickDown \?\? beforeClick;|const windowEnd = t1 \?\? \(await nowIn\(page\)\);|put\('wall-ms'" $R
echo "== K8 budget notes: peak-backing wording, mem-polls observed ranges"; grep -cF "polled in the window (at most every 50 ms) plus one window-end sample" perf/budgets.resources.json; grep -cE "observed across A and C runs in round 216: [0-9]+–[0-9]+\." perf/budgets.resources.json
echo "== K9 kinds of the 8 rows"; python3 -I -c "import json;rows=json.load(open('perf/budgets.resources.json'));rows=rows['rows'] if isinstance(rows,dict) else rows;[print(r['id'],r['kind'],r['mode'],r['budget']) for r in rows if 'mem-polls' in r['id'] or 'peak-backing' in r['id']]"
echo "== K10 resources spec does not use waitForCollectionReady (GATE279-S1 is outside it)"; grep -c "waitForCollectionReady" $R
echo "== K11 last implementation doc"; ls docs/implementation/2026/quarter-IV | tail -1
echo "== K12 multi-stage status lines"; grep -rn 'In Progress (stage' docs/implementation
echo "== K13 vitest include"; grep -nE "include:" vitest.config.ts
echo "== K14 docs that name mem-polls or the window rule"; grep -lE "mem-polls|at most every 50 ms|R216-MEM-POLLS" docs/implementation/2026/quarter-IV/*.md | sort
echo "== K15 b-ii TODO bullets"; grep -nE "PERF-HARNESS-SHARED-LIB-b-ii" docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md docs/implementation/2026/quarter-IV/175-perf-harness-shared-lib.md docs/implementation/2026/quarter-IV/176-perf-determinism-contract.md docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md | cut -c1-140
echo "== K16 doc 169 section headings around the export metrics"; grep -nE "^### (Export-ის მეტრიკები|WAV header)" docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md
echo "== K17 doc 208 D-29z254 leftover bullet"; grep -n "D-29z254" docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md | cut -c1-80
echo "== SW-B identifiers this round adds, roots perf app e2e (expect 0 before)"; grep -rnE "probePageClock|heapSamplesInWindow|clockProbe|endpointRule|clockOffsetMs|expectedPolls" perf app e2e 2>/dev/null; echo "(end SW-B)"
echo "== SW-C consumers of the mem-polls detail and endSampleLagMs outside the spec, roots perf app e2e docs"; grep -rnE "allSamples|endSampleLagMs" perf app e2e docs --include=*.ts --include=*.tsx --include=*.json --include=*.md 2>/dev/null | grep -v "^perf/studio-lab-resources.perf.spec.ts" | cut -c1-120; echo "(end SW-C)"
echo "== K18 who reads budgets.resources.json or imports the resources spec (roots perf, playwright configs)"; grep -rnE "budgets\.resources\.json|studio-lab-resources\.perf" perf playwright*.ts | cut -c1-140
