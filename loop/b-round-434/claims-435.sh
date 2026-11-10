#!/usr/bin/env bash
# Claims for task round 435 (RETRO 435; L29 + L56). Run from the loop root: bash b-round-434/claims-435.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=b-round-434
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-434.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r435-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r435-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen435.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen435.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-434.json >/dev/null; echo $?)"
echo "K12 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L23=$(grep -m1 '^23\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c) L61=$(grep -m1 '^61\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-434.md $B/current-task-before-435.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print('B-median',median(x[1] for x in R),'round-median',median(round(x[1]+x[2]+x[3],2) for x in R),'all',round(sum(x[1]+x[2]+x[3] for x in R),2),'B',round(sum(x[1] for x in R),2),'A',round(sum(x[2] for x in R),2),'C',round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-count.txt)none-above-0"
echo "K18 $(diff $B/lessons-before-435.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-420-434.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'],'browser-true',sum(1 for r in R if r['browser'] is True),'of',len(R))")"
echo "K21 $(for n in $(seq 421 434); do printf '%s:%s ' $n "$(python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1; echo $?)"; done)"
echo "K22 $(python3 -I tools/find-ids.py . $(cat $B/k22-ids.txt) | awk '{printf "%s=%s; ", $1, ($2=="NOT-FOUND"?"NOT-FOUND":"found")}')"
echo "K23 $(python3 -I -c "import json;print(json.load(open('$B/backlog-retro-input.json'))['version'])")"
echo "K24 $(grep -c '^## Q' user-review/questions-retro-435.md)"
echo "K25 $(grep -ciE 'answer|პასუხ' user-review/AGREE-STEM-LANES.md) stem-transcripts=$(ls reference/youtube/ 2>/dev/null | grep -c 'STEM-LANES-transcripts')"
echo "K28 rc=$(python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo $?)"
