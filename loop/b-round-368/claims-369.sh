#!/usr/bin/env bash
# Claims for task round 369 (L29 + L56). Run from the loop root: bash b-round-368/claims-369.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-368.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < b-round-368/git-status-at-planning.txt) $(cut -c1-7 b-round-368/head-at-planning.txt)"
echo "K3 $(wc -l < b-round-368/r369-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" b-round-368/r369-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n 'data-playing' $S/app/components/arrangement/ArrangementTransport.tsx | tr -s ' ' | cut -c1-80) | $(grep -n "playLabel: 'Play'" $S/app/lib/arrangement/strings.ts | tr -s ' ') | $(grep -c "'Demo collection ready\." $S/app/lib/arrangement/collection.ts)"
echo "K6 $(python3 -I -c "import json;d=json.load(open('b-round-368/screens/screen369.json'));print({k:len(v) for k,v in d['screens'].items()}, d.get('laneErrors'))")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat b-round-368/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls b-round-368/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 $(python3 -I tools/l57-check.py c-round-368.json | tail -1) rc=$(python3 -I tools/l57-check.py c-round-368.json >/dev/null; echo $?)"
echo "K12 $(python3 -I -c "import json;d=json.load(open('b-round-368/screens/screen369.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],v['positionAfterPlay'],len(v['clips'])) for k,v in d.items()])")"
echo "K13 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(grep -m1 '^23\. ' lessons.md | wc -c) $(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K16 $(cmp tasks/round-368.md b-round-368/current-task-before-369.md && echo archive-equal)"
echo "K17 $(python3 -I -c "import json;from statistics import median;R=json.load(open('b-round-368/data/cost-rows.json'));print(round(median(x[1] for x in R),2), round(sum((x[1] or 0)+x[2]+x[3] for x in R),2))")"
echo "K18 $(awk '$2>0{printf "%s ",$1}' b-round-368/data/stops-count.txt)"
echo "K19 $(grep -oE 'SR-369-[0-9]+' user-review/screen-review-369.md | sort -u | tr '\n' ' ')| backlog: $(python3 -I -c "import json;print(' '.join(sorted(x['id'] for x in json.load(open('backlog.json'))['screen_review_candidates'] if x['id'].startswith('SR-369'))))")"
echo "K20 $(diff b-round-368/lessons-before-369.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K21 $(grep -rlE 'C round [0-9]+ pending' $S/docs/implementation | sed "s|$S/||" | tr '\n' ' ')"
echo "K22 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K23 $(python3 -I -c "
import json
from statistics import median
R=json.load(open('b-round-368/data/rounds-353-368.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'])")"
echo "K24 $(grep -c . b-round-368/data/l57-coverage.txt) $(grep -o 'rounds with all 12 fields present.*' b-round-368/data/l57-coverage.txt | grep -oE '[0-9]+$')"
