#!/usr/bin/env bash
# Claims for task round 465 (RETRO 465; L29 + L56). Run from the loop root: bash b-round-464/claims-465.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=b-round-464
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-464.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r465-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r465-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen465.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen465.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md) $(wc -c < lessons.md)"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-464.json >/dev/null 2>&1; echo $?)"
echo "K12 $(cmp -s <(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ') <(grep -oE '^[0-9]+\.' $B/lessons-before-465.md | tr -d . | sort -n | tr '\n' ' ') && echo ids-equal || echo ids-DIFF)"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L23=$(grep -m1 '^23\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c) L52=$(grep -m1 '^52\. ' lessons.md | wc -c) L56=$(grep -m1 '^56\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-464.md $B/current-task-before-465.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print('B-median',median(x[1] for x in R),'round-median',median(round(x[1]+x[2]+x[3],2) for x in R),'all',round(sum(x[1]+x[2]+x[3] for x in R),2),'B',round(sum(x[1] for x in R),2),'A',round(sum(x[2] for x in R),2),'C',round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-head.txt)| old-regex $(awk '$2>0{printf "%s ",$1}' $B/data/stops-count.txt)"
echo "K18 $(diff $B/lessons-before-465.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-450-464.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'],'browser-true',sum(1 for r in R if r['browser'] is True),'of',len(R))")"
echo "K21 $(for n in $(seq 451 464); do printf '%s:%s ' $n "$(python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1; echo $?)"; done)"
echo "K22 $(python3 -I tools/find-ids.py . $(cat $B/k22-ids.txt) | awk '{printf "%s=%s; ", $1, ($2=="NOT-FOUND"?"NOT-FOUND":"found")}')"
echo "K23 $(python3 -I -c "import json;print(json.load(open('$B/backlog-retro-input.json'))['version'])")"
echo "K24 $(grep -c '^## Q' user-review/questions-retro-465.md)"
echo "K25 $(grep -ciE 'answer|პასუხ' user-review/AGREE-STEM-LANES.md) stem-transcripts=$(ls reference/youtube/ 2>/dev/null | grep -c 'STEM-LANES-transcripts')"
echo "K26 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
def has(sec,i): return any(isinstance(e,dict) and e.get('id')==i for e in b.get(sec,[]))
chk=[('screen_review_candidates','SR-465-%d'%n) for n in range(1,4)]+[('architecture_signals','SIG-R464-THIRD-COMMENT-STRIPPER'),('systemic_tasks','SYS-R465-DEAD-CSS-MATCHER'),('retro_candidates','RETRO480-PINNED-SKETCH-MICRO-FIX'),('retro_candidates','RETRO480-COLLECTOR-UNDERCOUNT')]
print(' '.join(('%s=%s'%(i,'found' if has(s,i) else 'MISSING')) for s,i in chk))
print('retro_runs-465', any(r.get('round')==465 for r in b['retro_runs']), 'next_due', b['retro_policy']['next_due'][:40])
print('rulings', sum(1 for e in b['retro_candidates'] if e['id'].startswith('RETRO465-') and str(e.get('status','')).startswith('ruled (D-29z1639)')))
")"
echo "K27 $(grep -c 'D-29z1637…D-29z1640' feature-status.md) $(grep -c '^| SR-465-' user-review/screen-review-465.md)"
echo "K28 rc=$(python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo $?)"
echo "K29 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
s=[e for e in b['systemic_tasks'] if e['id']=='SYS-R465-DEAD-CSS-MATCHER'][0]
d={e['id']:e for e in b['deferred_low_polish']}
print(len(s['closes']), ' '.join(s['closes']), '| tagged', sum(1 for i in s['closes'] if d.get(i,{}).get('systemic_task')=='SYS-R465-DEAD-CSS-MATCHER'))
")"
echo "K30 $(cd $S && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo protected-rc=$?) $(cd $S && sha256sum -c --quiet ../tmp/studio-real-loop/$B/r465-tree-sha256.txt >/dev/null 2>&1; echo manifest-rc=$?)"
echo "K31 $(tail -1 $B/l4-check.txt)"
echo "K32 $(ls ~/.cache/ms-playwright 2>/dev/null | tr '\n' ' ')"
