#!/usr/bin/env bash
# Round 402 claims (B round 401 -> 402 planning). Run from the loop root: bash b-round-401/claims-402.sh
# Each line: K# <value>. Read-only; writes nothing.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=/home/runner/czaba-project/store
P=$L/b-round-401/sketch-402.patch.txt
cd "$S" || exit 1
echo "K1 gate400 $(python3 -I -c "import json;d=json.load(open('$L/gates/gate-round-400.json'));print(d['status'],d['reason'].split()[1][:7])") gate401 $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-401.json'))['status'])")"
echo "K2 head $(git rev-parse --short=7 HEAD) status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 manifest-entries $(wc -l < $L/b-round-401/r402-frozen-sha256.txt) fails $(sha256sum -c --quiet $L/b-round-401/r402-frozen-sha256.txt 2>/dev/null | wc -l)"
echo "K4 protected-entries $(wc -l < $L/b-round-318/protected-sha256.txt) fails $(sha256sum -c --quiet $L/b-round-318/protected-sha256.txt 2>/dev/null | wc -l) protected-in-grants $(grep -cFf <(awk '{print $2}' $L/b-round-318/protected-sha256.txt) $L/b-round-401/grants-402.txt)"
echo "K5 patch-sha $(sha256sum < $P | cut -c1-16) applies-on-tree $(git apply --check "$P" 2>/dev/null && echo yes || echo no) files $(grep -c '^diff --git' $P)"
echo "K6 doc256-free $(ls docs/implementation/2026/quarter-IV/ | grep -c '^256-') doc254-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/254-perf-scale-harness.md | grep -c 'In Progress (stage 1 of 4; C round 398 PASS)') doc255-l4 $(sed -n 4p docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md | grep -c 'In Progress (stage 2 of 4; C round 400 PASS)')"
echo "K7 in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K8 scroller-width-stub-tests $(grep -rln 'arrangement-timeline-scroller' app --include=*.test.tsx | xargs grep -ln 'clientWidth' | wc -l)"
echo "K9 mutants-red $(grep -c ' RED ' $L/b-round-401/mutants/summary.txt) survived $(grep -c SURVIVED $L/b-round-401/mutants/summary.txt) pristine $(grep -c '^pristine.* rc 0' $L/b-round-401/mutants/summary.txt)"
echo "K10 scale-sketch $(python3 -I -c "
import json
d=json.load(open('$L/b-round-401/perf-sketch-scale-final.json'))
m={r['id']:r for r in d['rows']}
ids=['scale.dom.page','scale.dom.page.min-zoom','scale.dom.page.min-zoom-mid','scale.clips.model','scale.zoom.components-per-key','scale.zoom.components-per-key.6x','scale.scroll.components-per-step']
print(' '.join(str(m[i]['median']) for i in ids), 'asserts-failing', sum(1 for r in d['rows'] if r.get('mode')=='assert' and r.get('pass') is False), 'failures', len(d.get('failures',[])))
")"
echo "K11 interactions-sketch $(python3 -I -c "
import json
d=json.load(open('$L/b-round-401/perf-sketch-interactions-final.json'))
m={r['id']:r for r in d['rows']}
r=m['interact.zoom.30.out.path-rewrites']; g=m['interact.harness.drag-group-live']
print('complete',d['complete'],'failures',len(d['failures']),'rows',len(d['rows']),'path-rewrites',r['samples'],r['details'][0]['perKey'],'group-live',g['samples'],'ownObserved',[x['stoppedOwnCopyObserved'] for x in g['details']],'reveals',[x['stoppedCopyReveals'] for x in g['details']])
")"
echo "K12 lessons-lines $(wc -l < $L/lessons.md) diff $(diff $L/b-round-401/lessons-before-402.md $L/lessons.md | grep -E '^[0-9]' | tr '\n' ' ') pointer $(sed -n 3p $L/lessons.md | grep -c 'retro-401.md` (windows 123–199 … 385–400)')"
echo "K13 regression-last $(python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])")"
echo "K14 archive-round401 $(cmp -s $L/tasks/round-401.md $L/b-round-401/current-task-before-402.md && echo equal || echo differ)"
echo "K15 claim-blur $(grep -c "window.addEventListener('blur', abortIfStillActive)" app/contexts/ArrangementContext.tsx) lane-move-source-key $(grep -c 'selectLaneMoveSourceKey(' app/components/arrangement/ArrangementLane.tsx)"
echo "K16 reviews $(test -f $L/b-round-401/sketch-review.md && echo exists || echo MISSING) reviewed-sha-in-review $(grep -c "$(sha256sum < $P | cut -c1-16)" $L/b-round-401/sketch-review.md)"
echo "K17 c401 $(python3 -I -c "import json;d=json.load(open('$L/c-round-401.json'));print(d['taskStatus'],[b['id']+':'+b['severity'] for b in d['bugs']],d['browserVerified'])")"
echo "K18 cited $(while read -r f; do test -e "$L/$f" || echo "MISSING:$f"; done < $L/b-round-401/cited-artifacts.txt | wc -l) of $(wc -l < $L/b-round-401/cited-artifacts.txt) missing"
echo "K19 full-vitest-sketch $(grep -E 'Test Files|Tests ' $L/b-round-401/sketch-full-vitest.log | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ' | tr '\n' ' ')"
echo "K20 probe $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
  d=json.load(open('$L/b-round-401/probe/sketch-pin-'+vp+'.json'))
  a,b=d['A'],d['B']
  print(vp,'A',a['heldMounted'],a['mountedAfterBlurWhileHeld'],a['model'],a['undoUnchanged'],'B',b['memberMountedAtRestScroll0'],b['memberMountedMidDragScroll0'],b['memberMountedMidDrag'],b['deltaPressed'],b['deltaMember'],b['memberAfterUndo']==b['memberRest'],'errors',len(d['pageErrors']),end='; ')
")"
echo "K21 frames $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
  d=json.load(open('$L/b-round-401/probe/sketch-frames-'+vp+'.json'))
  print(vp,d['frames']['n']>0,d['frames']['gapFrames'],d['selectAll']['mounted'],d['heldMounted'],d['modelAfter'],len(d['pageErrors']),end='; ')
")"
echo "K22 res+studio-lab-sketch $(for s in resources studio-lab; do printf '%s rc %s ' $s "$(cat $L/b-round-401/perf-sketch-$s.rc 2>/dev/null || echo NA)"; python3 -I -c "
import json,sys
try:
  d=json.load(open('$L/b-round-401/perf-sketch-$s.json'))
  print('failures',len(d.get('failures',[])),'complete',d.get('complete'),end='; ')
except Exception as e: print('NA',end='; ')
"; done)"
