#!/usr/bin/env bash
# Round 315 claims (B round 314 -> 315 planning). Run from the loop root: bash b-round-314/claims-315.sh
# Sketch run: CLAIMS_STORE=/tmp/b315k bash b-round-314/claims-315.sh (K2 is empty there: the scratch has no git).
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
A=$S/app/contexts/ArrangementContext.tsx
PC=$S/app/lib/arrangement/peaks.client.ts
T=$S/app/lib/arrangement/__tests__/peaks-worker.test.ts
D=$S/docs/implementation/2026/quarter-IV
L=$(pwd)
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-314.json'));print(g['status'],g['commit'][:7])")"
if [ -z "$CLAIMS_STORE" ]; then echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"; else echo "K2"; fi
echo "K3 $(grep -c '^export const PEAKS_WORKER_STALL_TIMEOUT_MS = 3_000;$' $PC) $(grep -c '^export const PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000;$' $PC) $(grep -c 'job.onPeaks(' $PC) $(grep -c 'window.setTimeout(' $PC)"
echo "K4 $(grep -n 'buffersRef.current.set(' $A | cut -d: -f1 | tr '\n' ' ')| $(grep -n 'requestSourcePeaks(buffer' $A | cut -d: -f1 | tr '\n' ' ')"
echo "K5 $(grep -c 'syncPlayback(present, undefined, true);' $A) $(grep -c '^  }, \[collection, getDecodeContext, patchSourceState, requestSourcePeaks\]);$' $A) $(grep -c '^  }, \[collection, getDecodeContext, patchSourceState, requestSourcePeaks, syncPlayback\]);$' $A)"
echo "K6 $(awk '/const syncPlayback = useCallback/{f=1} f&&/^    \[/{print; exit}' $A | tr -d ' ') $(awk '/const startGraph = useCallback/{f=1} f&&/^    \[/{print; exit}' $A | tr -d ' ') $(for n in fillLoopIterations fillMetronomeHorizon releaseRetiredGraphs; do awk -v n="const $n = useCallback" 'index($0,n){f=1} f&&/^  \}, \[/{print; exit}' $A | tr -d ' '; done | tr '\n' ' ')"
echo "K7 $(cd $S && grep -rlE 'PEAKS_WORKER_STALL_TIMEOUT_MS|PEAKS_WORKER_COLD_START_TIMEOUT_MS|createSourcePeaksComputer' app perf e2e | sort | tr '\n' ' ')"
echo "K8 $(cd $S && grep -rl "stubGlobal('Worker'" app | sort | tr '\n' ' ')"
echo "K9 $(sed -n 4p $D/228-perf-peaks-worker.md)"
echo "K10 $(grep -c 'C-ის შემოწმება მოლოდინშია' $D/228-perf-peaks-worker.md) $(grep -c 'C-ის შემოწმება მოლოდინშია' $D/163-studio-perf-harness.md)"
echo "K11 $(grep -cE '^\s+it(\.each)?\(' $T) $(grep -oE "it(\.each)?\(['(]PW[0-9]+[a-z]?|'PW[0-9]+[a-z]? " $T | grep -oE 'PW[0-9]+[a-z]?' | sort -u | tr '\n' ' ')"
echo "K12 $(python3 -I -c "
import json
out=[]
for rate in ('1x','6x'):
    for r in json.load(open('b-round-314/probe/b315-load-'+rate+'.json')):
        marks=sorted(m['t'] for m in r['marks'] if 'peaks' in m['name'])
        pk=[c for c in r['commits'] if c['t']>=marks[0]]
        gaps=[b-a for a,b in zip(marks,marks[1:])]
        wins=[(m,min(c['t'] for c in r['commits'] if c['t']>=m)) for m in marks]
        inside=[l['d'] for l in r['longtasks'] if l['d']>50 and any(l['t']<b and l['t']+l['d']>a for a,b in wins)]
        other=[l['d'] for l in r['longtasks'] if l['d']>50 and l['t']>=marks[0] and l['d'] not in inside]
        out.append(rate+':'+str(len(marks))+'/'+str(len(pk))+'/'+','.join(sorted(set(str(c['rendered']) for c in pk)))+'/'+str(sum(1 for g in gaps if g<16))+'/'+str(inside)+'/'+str(other))
print(' '.join(out))")"
echo "K13 $(grep -c ': red rows \[\]' b-round-314/precheck-unit-mutants.txt) $(grep -c ": red rows \['" b-round-314/precheck-unit-mutants.txt) $(grep -oE 'restored: [0-9]+ passed' b-round-314/precheck-unit-mutants.txt)"
echo "K14 $(grep -oE 'Tests +[0-9]+ passed \([0-9]+\)' b-round-314/precheck-covering.log | head -1) | $(sed 's/\x1b\[[0-9;]*m//g' b-round-314/precheck-full-suite.log | grep -oE 'Test Files +[0-9]+ passed \([0-9]+\)|Tests +[0-9]+ passed \([0-9]+\)' | tr '\n' ' ')"
echo "K15 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K16 $(cmp -s tasks/round-314.md b-round-314/round-314-task-copy.md && echo archive-equal-314)"
echo "K17 $(for f in b-round-314/precheck-perf.json b-round-314/precheck-perf.log b-round-314/precheck-row-compare.txt b-round-314/probe/cold-start-summary.txt b-round-314/probe/cold-head-1440.json b-round-314/probe/cold-sketch-1440.json b-round-314/probe/cold-sketch-1280.json b-round-314/sketch-ArrangementContext.tsx.txt b-round-314/probe/b315-load-1x.json b-round-314/probe/b315-load-6x.json b-round-314/probe/summary.txt b-round-314/probe/timeline-1x.txt b-round-314/probe/timeline-6x.txt b-round-314/probe/probe.patch.txt b-round-314/probe/load.perf.spec.ts.txt b-round-314/probe/cold-start.cjs b-round-314/sketch.patch.txt b-round-314/sketch-peaks.client.ts.txt b-round-314/sketch-peaks-worker.test.ts.txt b-round-314/unit-mutants.py b-round-314/precheck-unit-mutants.txt b-round-314/precheck-covering.log b-round-314/precheck-full-suite.log b-round-314/precheck-tsc.log b-round-314/precheck-biome.log b-round-314/round-314-task-copy.md b-round-312/protected-sha256.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K18 $(cd $S && sha256sum -c $L/b-round-312/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K19 $(ls $D | tail -1)"
echo "K20 $(grep -c 'clips' $S/app/routes/studio-lab.tsx) $(grep -n 'decodeVideoSourceAudio(file, sourceId' $A | cut -d: -f1) $(grep -n 'remaining.delete(sourceId);' $A | cut -d: -f1)"
echo "K21 $(grep -c "status !== 'ready'" $A) $(grep -c "audio === 'decoding'" $A) $(grep -c 'renderArrangementWav(arrangement, buffersRef.current' $A)"
echo "K22 $(grep -c 'workerFailed = true;' $PC) $(grep -c 'if (workerFailed ||' $PC) $(grep -c 'const job = queue.shift();' $PC) $(grep -c 'buffers: buffersRef.current,' $A) $(grep -c 'buffersRef.current.delete' $A)"
echo "K23 $(awk '/export function planSchedule/,/^}/' $S/app/lib/arrangement/schedule.ts | grep -c '\.filter(') $(awk '/export function planSchedule/,/^}/' $S/app/lib/arrangement/schedule.ts | grep -c 'kind') $(grep -c 'const buffer = options.buffers.get(item.sourceId);' $S/app/lib/arrangement/graph.client.ts) $(awk '/export function createArrangement/,/^}/' $S/app/lib/arrangement/model.ts | grep -c 'mute: false')"
echo "K24 $(python3 -I -c "import json;print(len(json.load(open('b-round-314/precheck-perf.json'))['failures']))") $(cut -d' ' -f2- b-round-314/precheck-row-compare.txt)"
