#!/usr/bin/env bash
# Claims for task round 401 (L29 + L56). Run from the loop root: bash b-round-400/claims-401.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-400.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(wc -c < b-round-400/git-status-at-planning.txt) $(head -1 b-round-400/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < b-round-400/r401-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" b-round-400/r401-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('b-round-400/screens/screen401.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('b-round-400/screens/screen401.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md)"
echo "K8 $(for p in $(cat b-round-400/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls b-round-400/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-400.json >/dev/null; echo $?)"
echo "K12 $(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L4=$(grep -m1 '^4\. ' lessons.md | wc -c) L23=$(grep -m1 '^23\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-400.md b-round-400/current-task-before-401.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('b-round-400/data/cost-rows.json'));print(median(x[1] for x in R), round(sum(x[1]+x[2]+x[3] for x in R),2), round(sum(x[1] for x in R),2), round(sum(x[2] for x in R),2), round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' b-round-400/data/stops-count.txt)"
echo "K18 $(diff b-round-400/lessons-before-401.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('b-round-400/data/rounds-385-400.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'])")"
echo "K21 $(awk '/sketchpatch=[1-9]/ && /sketch-review=0/ {print $3}' b-round-400/data/l58-sketch-review-application.txt | tr -d ')' | tr '\n' ' ')"
echo "K22 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
F={f['id']:f for k in ('open_findings','deferred_low_polish','systemic_tasks','architecture_checkpoint_requests','retro_candidates') for f in b[k] if isinstance(f,dict) and 'id' in f}
for i in ['C-R399-01','TL-R398-SK-M2','SYS-R385-LEAF-ACTIONS-CONTEXT','SYS-R369-STEM-CACHE-WRITE-COORDINATOR','SYS-R388-FAKE-WEB-AUDIO-HELPER','ARCH-CHECKPOINT-PREVIEW-AFTER-13C','B-R382-SCOPED-LOCATORS','RC-R394-GESTURE-IN-DEGRADED-STATE','RC-R399-RULE-NOOP-AT-HEAD','A-R400-REVIEW-SPEC-LOWS']: print(i, F[i]['status'].split(' ')[0], end='; ')")"
echo "K23 $(grep -c '^\*\*პასუხი:\*\* ჩაწერეთ აქ' user-review/questions-arch-leaf-plumbing.md) $(ls user-review | grep -ci 'leaf-plumbing.*decision')"
echo "K24 $(python3 -I -c "import json;v=json.load(open('c-round-399.json'))['affectedChecksRunOnSketch'];print('interactions/resources migrated specs were not run on a sketch by B' in str(v))")"
echo "K25 $(python3 -I -c "import json;R={r['round']:r for r in json.load(open('b-round-400/data/rounds-385-400.json'))};print(round(sum(R[n]['c_cost'] for n in (387,391,394,399)),2))")"
