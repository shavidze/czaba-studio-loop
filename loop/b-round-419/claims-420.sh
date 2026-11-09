#!/usr/bin/env bash
# Claims for task round 420 (L29 + L56). Run from the loop root: bash b-round-419/claims-420.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=b-round-419
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-419.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r420-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r420-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen420.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen420.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-419.json >/dev/null; echo $?)"
echo "K12 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L7=$(grep -m1 '^7\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-419.md $B/current-task-before-420.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print(median(x[1] for x in R), round(sum(x[1]+x[2]+x[3] for x in R),2), round(sum(x[1] for x in R),2), round(sum(x[2] for x in R),2), round(sum(x[3] for x in R),2), 'Bshare', round(100*sum(x[1] for x in R)/sum(x[1]+x[2]+x[3] for x in R),1), 'noRetro', round(100*sum(x[1] for x in R[1:])/sum(x[1]+x[2]+x[3] for x in R[1:]),1))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-count.txt)none-above-0"
echo "K18 $(diff $B/lessons-before-420.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-416-419.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'],'browser',[r['browser'] for r in R])")"
echo "K21 $(for n in 417 418 419; do printf '%s:%s ' $n "$(python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1; echo $?)"; done)"
echo "K22 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
F={}
for k in ('open_findings','deferred_low_polish','systemic_tasks','retro_candidates','tech_lead_manual_checks','screen_review_candidates','architecture_signals','architecture_checkpoint_requests'):
  for f in b[k]:
    if isinstance(f,dict) and 'id' in f: F.setdefault(f['id'],f)
for q in b['post_current_stage_queue']:
  F[q['id']]=q
  for s in q.get('stages',[]) or []:
    if isinstance(s,dict) and 'id' in s: F.setdefault(s['id'],s)
for i in ['SYS-R369-STEM-CACHE-WRITE-COORDINATOR','A-R368-REVIEW-L1','B-R367-TL3-1-JOIN-MICROTASK-GAP','A-R367-REVIEW-L-c','A-R367-REVIEW-L-d','A-R367-REVIEW-L-e','GATE368-L1-REMOVEFILE-SAME-NAME','A-R368-REVIEW-L3','A-R367-REVIEW-L-g','TL-R419-L1-OPEN-INVARIANT','A-R419-REVIEW-CR-1-SWEEP-CANCEL-CHECK','SIG-R419-STEM-CACHE-STORE-COORDINATOR-MODULE','STUDIO-PERFORMANCE','STEM-LANES','GATE368-L3-QUEUED-BUFFER-RETENTION','ARCH-CHECKPOINT-STEM-LANES','SYS-R418-PREVIEW-LIFECYCLE','RC-R420-COST-COUNTER','SR-420-1','SR-420-2','TLM-PERF15-FIREFOX']:
  f=F.get(i); print(i,'=',(str(f.get('status'))[:40] if f else 'MISSING'),end='; ')
")"
echo "K23 $(grep -nE "id: '(video|music|stems|sfx)'" $S/app/routes/studio-lab.tsx | cut -c1-60 | tr '\n' ' ') groups-in-route=$(grep -c 'group' $S/app/routes/studio-lab.tsx) groups-in-demo=$(grep -ci 'group' $S/app/data/studio-lab-demo.ts)"
echo "K24 $(python3 -I -c "import json;print(json.load(open('youtube-request.json'))['task'], len(json.load(open('youtube-request.json'))['queries']))")"
echo "K25 $(grep -c 'LIVE-MEAS-STEM-DROP' user-review/live-checks.md) measured=$(ls reference/ | grep -ci 'stem')"
echo "K28 rc=$(python3 -I tools/l58-check.py current-task.md >/dev/null 2>&1; echo $?)"
