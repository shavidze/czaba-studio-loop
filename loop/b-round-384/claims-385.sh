#!/usr/bin/env bash
# Claims for task round 385 (L29 + L56). Run from the loop root: bash b-round-384/claims-385.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-384.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < b-round-384/git-status-at-planning.txt) $(cut -c1-7 b-round-384/head-at-planning.txt)"
echo "K3 $(wc -l < b-round-384/r385-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" b-round-384/r385-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('b-round-384/screens/screen385.json'));print({k:len(v) for k,v in d['screens'].items()}, d.get('laneErrors'))")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('b-round-384/screens/screen385.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat b-round-384/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls b-round-384/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 $(python3 -I tools/l57-check.py c-round-384.json | tail -1) rc=$(python3 -I tools/l57-check.py c-round-384.json >/dev/null; echo $?)"
echo "K12 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 $(grep -m1 '^23\. ' lessons.md | wc -c) $(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-384.md b-round-384/current-task-before-385.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('b-round-384/data/cost-rows.json'));print(median(x[1] for x in R), round(sum(x[1]+x[2]+x[3] for x in R),2), round(sum(x[1] for x in R),2), round(sum(x[2] for x in R),2), round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' b-round-384/data/stops-count.txt)"
echo "K18 $(diff b-round-384/lessons-before-385.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('b-round-384/data/rounds-369-384.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'])")"
echo "K21 $(grep -c 'progress.json\|progressFile' c-round-383.json) $(test -e c-round-383/progress.json && echo has-progress || echo no-progress)"
echo "K22 $(sed -n 1409p $S/app/contexts/ArrangementContext.tsx | tr -s ' ') | $(grep -n 'void ensureDecoded' $S/app/contexts/ArrangementContext.tsx | cut -d: -f1 | tr '\n' ' ')"
echo "K23 $(ls b-round-381/sketch-review*.md 2>/dev/null | wc -l) sketch-review files in b-round-381 (round 382 planning)"
echo "K24 $(grep -n 'K32 |' tasks/round-382.md | cut -c1-120)"
echo "K25 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
F={f['id']:f for f in b['open_findings']+b['deferred_low_polish']}
for i in ['C-R382-01','B-R383-AUTH-ROW-BARE-URL','TL-R376-M1-HANDOFF-ARM-LIFETIME','GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION','GATE384-L2-PREVIEW-STOP-ON-FAILED-DECODE']: print(i, F[i]['status'].split(' ')[0], end='; ')")"
echo "K26 $(grep -c 'FL11' c-round-377.json) $(python3 -I -c "import json;print(json.load(open('c-round-377.json'))['taskStatus'])")"
