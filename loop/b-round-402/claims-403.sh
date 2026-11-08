#!/usr/bin/env bash
# Round 403 claims (B round 402 -> 403 planning). Run from the loop root: bash b-round-402/claims-403.sh
# Optional: S=<tree> to run against another tree (B ran it on the sketch-applied scratch: claims-403-sketch-output.txt).
# Each line: K# <value>. Read-only; writes nothing.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${S:-/home/runner/czaba-project/store}
B=$L/b-round-402
P=$B/sketch-403.patch.txt
D=docs/implementation/2026/quarter-IV
cd "$S" || exit 1
echo "K1 gate402 $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-402.json'));print(d['status'],d['commit'][:7])")"
echo "K2 head $(git rev-parse --short=7 HEAD) status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 manifest-entries $(wc -l < $B/r403-frozen-sha256.txt) fails $(sha256sum -c --quiet $B/r403-frozen-sha256.txt 2>/dev/null | wc -l)"
echo "K4 protected-entries $(wc -l < $L/b-round-318/protected-sha256.txt) fails $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>/dev/null | wc -l) protected-in-grants $(grep -cFf <(awk '{print $2}' $L/b-round-318/protected-sha256.txt) $B/grants-403.txt)"
echo "K5 patch-sha $(sha256sum < $P | cut -c1-16) applies-on-tree $(git apply --check "$P" 2>/dev/null && echo yes || echo no) files $(grep -c '^diff --git' $P)"
echo "K6 doc257-free $(ls $D/ | grep -c '^257-') doc228-l4 $(sed -n 4p $D/228-perf-peaks-worker.md | grep -c 'Completed (C round 315 PASS)') doc228-browser-314 $(grep -c 'Browser (C round 314, stage 1)' $D/228-perf-peaks-worker.md) doc228-browser-312 $(grep -c 'Browser (C round 312, stage 1)' $D/228-perf-peaks-worker.md) doc254-l4 $(sed -n 4p $D/254-perf-scale-harness.md | grep -c 'In Progress (stage 1 of 4; C round 398 PASS)') doc254-steps-heading $(grep -c '^### Spec-ის ნაბიჯები (a–h)' $D/254-perf-scale-harness.md)"
echo "K7 in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K8 mutants-red $(grep -c ' RED ' $B/mutants/summary.txt) survived $(grep -c SURVIVED $B/mutants/summary.txt) pristine-rc0 $(grep -c '^pristine.* rc 0' $B/mutants/summary.txt)"
echo "K9 full-vitest-sketch $(sed 's/\x1b\[[0-9;]*m//g' $B/sketch-full-vitest.log | grep -E 'Test Files|Tests ' | tr -s ' ' | tr '\n' ' ') rc $(cat $B/sketch-full-vitest.rc)"
echo "K10 scale-sketch $(python3 -I -c "
import json
d=json.load(open('$B/perf-sketch-scale-v2.json')); h=json.load(open('$L/c-round-402/perf-scale.json'))
hm={r['id']:r for r in h['rows']}
new={r['id']:r['samples'] for r in d['rows'] if r['id'] not in hm}
print('complete',d['complete'],'failures',len(d['failures']),'rows',len(d['rows']),'det-diff-vs-c402',sum(1 for r in d['rows'] if r['id'] in hm and r['kind']=='deterministic' and r['samples']!=hm[r['id']]['samples']),'new',len(new),'min-comps',new['scale.zoom.min.components-per-key'],new['scale.zoom.min.components-per-key.6x'],'min-commits',new['scale.zoom.min.commits-per-key'],new['scale.zoom.min.commits-per-key.6x'])
")"
echo "K11 premise $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
  for r in (1,6):
    d=json.load(open('$B/probe/head-minzoom-'+str(r)+'x-'+vp+'.json'))
    print(vp,str(r)+'x','default',d['defaultZoom']['max'],'nearMin',d['nearMin']['max'],'mounted',min(k['mounted'] for k in d['nearMin']['keys']),max(k['mounted'] for k in d['nearMin']['keys']),'cols',max(k['maxColumns'] for k in d['nearMin']['keys']),'model',d['full']['model'],end='; ')
")"
echo "K12 sync-throw-callers $(grep -c 'requestSourcePeaks(buffer, signal, (peaks)' app/contexts/ArrangementContext.tsx) $(grep -c 'requestSourcePeaks(buffer, controller.signal, (peaks)' app/contexts/ArrangementContext.tsx) video-catch $(grep -c "settle({ audio: 'error', audioNote: videoAudioNote('decode-failed') })" app/contexts/ArrangementContext.tsx)"
echo "K13 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K14 archive-round402 $(cmp -s $L/tasks/round-402.md $B/current-task-before-403.md && echo equal || echo differ)"
echo "K15 review $(test -f $B/sketch-review.md && echo exists || echo MISSING) dispatched-sha-in-review $(grep -c "$(sha256sum < $P | cut -c1-64)" $B/sketch-review.md)"
echo "K16 c402 $(python3 -I -c "import json;d=json.load(open('$L/c-round-402.json'));print(d['taskStatus'],len(d['bugs']),d['browserVerified'],d['realVerified'])")"
echo "K17 cited $(while read -r f; do test -e "$L/$f" || echo "MISSING:$f"; done < $B/cited-artifacts.txt | wc -l) of $(wc -l < $B/cited-artifacts.txt) missing"
echo "K18 gate402-peaks-worker $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-402/verify.log | grep -E 'peaks-worker\.test\.ts' | tr -s ' ')"
echo "K19 timeouts $(grep -c 'PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000' app/lib/arrangement/peaks.client.ts) $(grep -c 'PEAKS_WORKER_STALL_TIMEOUT_MS = 3_000' app/lib/arrangement/peaks.client.ts) workerReplied-resets $(grep -c 'workerReplied = false' app/lib/arrangement/peaks.client.ts)"
echo "K20 tests-at-tree PW-ids $(grep -oE "it\('PW[0-9]+b?" app/lib/arrangement/__tests__/peaks-worker.test.ts | sort -u | wc -l) useRealTimers $(grep -c 'vi.useRealTimers();' app/lib/arrangement/__tests__/peaks-worker.test.ts) pw18-inline-unmount $(grep -c '^    view.unmount();' app/lib/arrangement/__tests__/peaks-worker.test.ts)"
echo "K21 scale-budget-rows $(python3 -I -c "import json;r=json.load(open('perf/budgets.scale.json'));print(len(r),sum(1 for x in r if x['mode']=='assert'),sum(1 for x in r if x['id'].startswith('scale.zoom.min.')))")"
echo "K22 l57-c402 $(cd $L && python3 -I tools/l57-check.py c-round-402.json /dev/null >/dev/null 2>&1; echo rc $?)"
echo "K23 covering-files $(for f in peaks-worker.test.ts peaks-worker-video.test.tsx clip-gain-waveform.test.tsx content-colour-ui.test.tsx clip-gain-pointer-preview.test.tsx waveform-zoom.test.tsx failed-source-refusal.test.tsx video-import-status-ui.test.tsx export-mp3.test.tsx; do test -f app/lib/arrangement/__tests__/$f && echo y; done | wc -l) of 9"
echo "K24 fallback $(python3 -I -c "
import json
for side in ('head','sketch'):
  for vp in ('1440x900','1280x720'):
    for m in ('normal','none','failing'):
      d=json.load(open('$B/probe/'+side+'-fallback-'+m+'-'+vp+'.json'))
      c=d['clip']
      print(side[0]+vp[:4]+m[:2],int(d['ready']),d['status'].startswith('Demo collection ready'),d['loadingText'],c['columns'],c['pathChars'],d['workers']['created'],d['workers']['failed'],len(d['pageErrors']),end='; ')
")"
echo "K25 doc228-todo-anchor $(grep -c '^- \*\*Round 315-ის review-ის Low შენიშვნები' $D/228-perf-peaks-worker.md) suffix-present $(grep -c 'დაიხურა PERF-14c-i-ში (round 403, doc 257)' $D/228-perf-peaks-worker.md)"
echo "K26 l31 cp12d-gate402 $(sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-402/verify.log | grep -oE 'CP12d: .* [0-9]+ms' | grep -oE '[0-9]+ms$') declared-timeout $(grep -c "{ timeout: 30_000 }" app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx)"
