#!/usr/bin/env bash
# Claims for task round 495 (RETRO 495; L29 + L56). Run from the loop root: bash b-round-494/claims-495.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
L=$(pwd -P)
B=b-round-494
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-494.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(cat $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r495-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r495-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen495.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen495.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md) $(wc -c < lessons.md) maxline=$(python3 -I -c "print(max(len(l) for l in open('lessons.md','rb').read().split(b'\n')))")"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 prev-l57=$(python3 -I tools/l57-check.py c-round-494.json /dev/null 2>&1 | tail -1) c494-l57-file=$(grep -c 'L57 OK' c-round-494/l57-check.txt 2>/dev/null)"
echo "K12 $(cmp -s <(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ') <(grep -oE '^[0-9]+\.' $B/lessons-before-495.md | tr -d . | sort -n | tr '\n' ' ') && echo ids-equal || echo ids-DIFF) lost=$(comm -23 $B/ids-before.txt $B/ids-after.txt | tr '\n' ' ')"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L26=$(grep -m1 '^26\. ' lessons.md | wc -c) L47=$(grep -m1 '^47\. ' lessons.md | wc -c) L57=$(grep -m1 '^57\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-494.md $B/current-task-before-495.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print('B-median',median(x[1] for x in R),'round-median',median(round(x[1]+x[2]+x[3],2) for x in R),'all',round(sum(x[1]+x[2]+x[3] for x in R),2),'B',round(sum(x[1] for x in R),2),'A',round(sum(x[2] for x in R),2),'C',round(sum(x[3] for x in R),2),'B-share',round(sum(x[1] for x in R)/sum(x[1]+x[2]+x[3] for x in R)*100,1))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-head.txt)"
echo "K18 $(grep -E '^[0-9]' $B/lessons-diff.txt | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-480-494.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'published',[r['round'] for r in R if r['gate']=='published'],'browser-true',sum(1 for r in R if r['browser'] is True),'of',len(R))")"
echo "K21 l57=$(tr '\n' ' ' < $B/data/l57-check-window.txt | grep -o 'INCOMPLETE' | wc -l)-incomplete l58=$(for n in $(seq 480 494); do printf '%s:%s ' $n "$(python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1; echo $?)"; done)"
echo "K22 $(grep -c '^## Q' user-review/questions-retro-495.md)"
echo "K23 $(python3 -I -c "import json;print(json.load(open('$B/backlog-retro-input.json'))['version'])")"
echo "K24 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
def has(sec,i): return any(isinstance(e,dict) and e.get('id')==i for e in b.get(sec,[]))
chk=[('systemic_tasks','SYS-R495-SHARED-DIALOG'),('root_requests_b','ROOT-REQ-SHARED-DIALOG-GRANT'),('open_findings','SABA-DEVICE-CHECKS'),('deferred_low_polish','GATE494-L4-TEST-BLANK-LINES'),('retro_candidates','RETRO495-CODE-REVIEWER-ON-B'),('retro_candidates','RETRO495-ATTEMPT-COST-LOST'),('retro_candidates','RETRO495-STOP-LIST-OVERRIDE'),('retro_candidates','RETRO495-SABA-RECURRENCE-ENTRANCE')]
print(' '.join(('%s=%s'%(i,'found' if has(s,i) else 'MISSING')) for s,i in chk))
print('retro_runs-495', any(r.get('round')==495 for r in b['retro_runs']), 'next_due', b['retro_policy']['next_due'][:40])
")"
echo "K24b $(python3 -I tools/find-ids.py "$L" B-R488-PASSWORD-MODAL-DIALOG B-R492-PASSWORD-FIELDS-UNNAMED B-R492-PASSWORD-ERROR-NOT-ANNOUNCED B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED INFO-B495-L57-MISSES INFO-B494-LEDGER-GAPS B-R471-SKETCH-UNREVIEWED 2>&1 | awk '{print $1, $4, $5}' | tr '\n' ';')"
echo "K25 tree=$(cd $S && sha256sum -c --quiet $L/$B/r495-tree-sha256.txt >/dev/null 2>&1; echo $?) protected=$(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K26 teal: $(for f in .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md docs/design/DESIGN_SYSTEM.md; do printf '%s=%s ' "$(basename $f)" "$(grep -ciE '13d9cc|teal|19,217,204|hsl\(175' $S/$f)"; done) fonts: $(for f in .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md docs/design/DESIGN_SYSTEM.md; do printf '%s=%s ' "$(basename $f)" "$(grep -ciE '\bInter\b|Playfair' $S/$f)"; done)"
echo "K27 focus-lines: $(cd $S && grep -nE 'focus-visible:ring-2|focus:ring|outline-none' .claude/primitives/FORWARDREF_COMPONENT.md .claude/primitives/DESIGN_TOKENS.md | cut -d: -f1,2 | tr '\n' ' ') primitives-commits-since-bbb3193=$(git -C $S log --oneline bbb3193..HEAD -- .claude/primitives docs/design | wc -l)"
echo "K28 $(python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K29 deferred-new=$(sed -n 1p $B/data/deferred-added.txt | grep -oE '[0-9]+$') closed=$(grep -oE 'closed: [0-9]+' $B/data/deferred-added.txt) fixup-titles=$(grep -cE 'fix-up|re-dispatch' $B/data/task-titles.txt)"
echo "K30 auth.ts-379-391: $(git -C $S show 3bcf8cb:app/lib/auth.ts | sed -n '379,391p' | grep -c 'apiClient.login\|not yet implemented')"
echo "K31 task-l57-row=$(grep -c 'tools/l57-check.py c-round-495.json c-round-495/l57-check.txt' current-task.md)"
echo "K32 playback-state=$(grep -c 'data-testid="arrangement-playback-state"' $S/app/components/arrangement/ArrangementTransport.tsx) data-clip-id-files=$(grep -rlE 'data-clip-id' $S/app/components/arrangement --include=*.tsx | grep -vc __tests__)"
