#!/usr/bin/env bash
# Claims for task round 416 (L29 + L56). Run from the loop root: bash b-round-415/claims-416.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=b-round-415
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-415.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r416-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r416-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen416.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen416.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-415.json >/dev/null; echo $?)"
echo "K12 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L22=$(grep -m1 '^22\. ' lessons.md | wc -c) L23=$(grep -m1 '^23\. ' lessons.md | wc -c) L38=$(grep -m1 '^38\. ' lessons.md | wc -c) L56=$(grep -m1 '^56\. ' lessons.md | wc -c) L57=$(grep -m1 '^57\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-415.md $B/current-task-before-416.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print(median(x[1] for x in R), round(sum(x[1]+x[2]+x[3] for x in R),2), round(sum(x[1] for x in R),2), round(sum(x[2] for x in R),2), round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-count.txt)"
echo "K18 $(diff $B/lessons-before-416.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-401-415.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'])")"
echo "K21 $(awk '{print $1, $3}' $B/data/l58-check-window.txt | tr '\n' ' ')"
echo "K22 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
F={}
for k in ('open_findings','deferred_low_polish','systemic_tasks','retro_candidates','tech_lead_manual_checks','screen_review_candidates'):
  for f in b[k]:
    if isinstance(f,dict) and 'id' in f: F.setdefault(f['id'],f)
for i in ['SYS-R388-FAKE-WEB-AUDIO-HELPER','A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB','A-R415-REVIEW-L1-CALLSITE-FLAG','B-R411-SKETCH-M1-MISSED','TL-R413-I1','ARCH-CHECKPOINT-PREVIEW-AFTER-13C','SYS-R416-PREVIEW-CONTROLLER','RC-R401-ORIGIN-RETAG','RC-R416-L58-CHECKER','RC-R416-PREDECODE-CAPTURE','SR-416-1','TLM-PERF15-FIREFOX','GATE395-L1-CURRENTTIME-READ']: print(i, F[i]['status'].split(' ')[0], end='; ')
")"
echo "K23 policy-mentions=$(grep -c 'PREVIEW-AFTER-13C\|root-request-arch-checkpoint-preview' /home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md) user-review-mentions=$(grep -rl 'PREVIEW-AFTER-13C\|root-request-arch-checkpoint-preview' user-review/ | wc -l) answer-files=$(ls b-round-393/ | grep -ci answer)"
echo "K24 $(python3 -I -c "import json;d=json.load(open('c-round-411.json'));print('l57-fields-present',sum(1 for f in ['manifestPaths','missingPaths','countMismatches','claimCheckMinutes','assertsSpecified','mutantsRecorded','mutantRedOnSketch','gateChecksNamed','gateChecksRunOnSketch','chainHeadGateRunGreen','affectedChecksNamed','affectedChecksRunOnSketch'] if f in d),'origins',[b.get('origin') for b in d['bugs']])")"
echo "K25 $(python3 -I -c "import json;R={r['round']:r for r in json.load(open('$B/data/rounds-401-415.json'))};print(round(R[401]['c_cost'],2),round(R[411]['c_cost'],2))")"
echo "K26 $(python3 -I -c "import json;d=json.load(open('$B/screens/melody-probe.json'));print({k:(v['before'][-1][-6:],v['afterScrollEnd'],len(v['afterScrollBack'])) for k,v in d.items()})")"
echo "K27 $(head -c 64 b-round-414/sketch-415.sha256) $(test -e b-round-414/sketch-review.md && echo review-exists || echo no-review)"
echo "K28 rc=$(python3 -I tools/l58-check.py current-task.md >/dev/null; echo $?)"
