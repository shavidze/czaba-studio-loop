#!/usr/bin/env bash
# Claims for task round 510 (RETRO 510; L29 + L56). Run from the loop root: bash b-round-509/claims-510.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
L=$(pwd -P)
B=b-round-509
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-509.json'));print(g['status'],g['commit'][:7])")"
echo "K2 status-lines=$(wc -l < $B/git-status-at-planning.txt) head=$(cut -c1-7 $B/head-at-planning.txt)"
echo "K3 $(wc -l < $B/r510-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r510-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen510.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen510.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md) $(wc -c < lessons.md) maxline=$(python3 -I -c "print(max(len(l) for l in open('lessons.md','rb').read().split(b'\n')))")"
echo "K8 $(grep -E '^[0-9]' $B/lessons-diff.txt | tr '\n' ' ')"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 $(cmp tasks/round-509.md $B/current-task-before-510.md && echo archive-equal)"
echo "K12 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));t=round(sum(x[1]+x[2]+x[3] for x in R),2);b=round(sum(x[1] for x in R),2);print('all',t,'B',b,'A',round(sum(x[2] for x in R),2),'C',round(sum(x[3] for x in R),2),'Bshare',round(b/t*100,1),'round-median',median(round(x[1]+x[2]+x[3],2) for x in R),'B-median',median(x[1] for x in R))")"
echo "K13 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-495-509.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'published',[r['round'] for r in R if r['gate']=='published'],'browser-true',sum(1 for r in R if r['browser'] is True),'of',len(R))")"
echo "K14 stops=$(for n in $(seq 495 509); do head -3 a-round-$n.md | grep -qE 'STOP — (needs|routed)' && printf '%s ' $n; done)"
echo "K15 l57=$(for n in $(seq 495 509); do grep -q 'L57 OK' c-round-$n/l57-check.txt 2>/dev/null && printf 1; done | wc -c)/15 l58=$(for n in $(seq 495 509); do python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1 && printf 1; done | wc -c)/15"
echo "K16 ledger-check=$(for n in $(seq 496 509); do python3 -I tools/ledger-check.py tasks/round-$n.md >/dev/null 2>&1; printf '%s:%s ' $n $?; done)"
echo "K17 deferred-new=$(sed -n 1p $B/data/deferred-added.txt | grep -oE '[0-9]+$') closed-in-window=$(sed -n 1p $B/data/deferred-closed.txt | grep -oE '[0-9]+$')"
echo "K18 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
def has(sec,i): return any(isinstance(e,dict) and e.get('id')==i for e in b.get(sec,[]))
chk=[('systemic_tasks','DPG-BUTTON-CONTRACT-TABLE'),('open_findings','INFO-B510-CAPTURE-GAP'),('screen_review_candidates','SR-510-1'),('retro_candidates','RC-R510-SKETCH-SCOPE'),('deferred_low_polish','GATE509-L2-GETFREE-NO-ARIA-BUSY'),('architecture_signals','SIG-R509-SELECTED-VERSION-OFFER')]
print(' '.join(('%s=%s'%(i,'found' if has(s,i) else 'MISSING')) for s,i in chk))
st=[x for x in b['systemic_tasks'] if x.get('id')=='DPG-BUTTON-CONTRACT-TABLE'][0]
print('closes',len(st['closes']),'retro_runs-510',any(r.get('round')==510 for r in b['retro_runs']),'next_due',b['retro_policy']['next_due'][:30])
")"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 tree=$(cd $S && sha256sum -c --quiet $L/$B/r510-tree-sha256.txt >/dev/null 2>&1; echo $?) protected=$(cd $S && sha256sum -c --quiet $L/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K21 teal: $(for f in .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md docs/design/DESIGN_SYSTEM.md; do printf '%s=%s ' "$(basename $f)" "$(grep -ciE '13d9cc|teal|19,217,204|hsl\(175' $S/$f)"; done) focus-lines: $(cd $S && grep -nE 'focus-visible:ring-2|focus:ring|outline-none' .claude/primitives/FORWARDREF_COMPONENT.md .claude/primitives/DESIGN_TOKENS.md | cut -d: -f1,2 | tr '\n' ' ') primitives-commits-since-3bcf8cb=$(git -C $S log --oneline 3bcf8cb..HEAD -- .claude/primitives | wc -l)"
echo "K22 $(grep -c '^## Q' user-review/questions-retro-510.md) questions; placeholders=$(grep -c PLACEHOLDER retros/retro-510.md user-review/questions-retro-510.md | tr '\n' ' ')"
echo "K23 playback-state=$(grep -c 'data-testid="arrangement-playback-state"' $S/app/components/arrangement/ArrangementTransport.tsx) data-clip-id-files=$(grep -rlE 'data-clip-id' $S/app/components/arrangement --include=*.tsx | grep -vc __tests__)"
echo "K24 task-l57-row=$(grep -c 'tools/l57-check.py c-round-510.json c-round-510/l57-check.txt' current-task.md) task-l58=$(python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K25 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K26 $(python3 -I -c "import json;d=json.load(open('$B/probe/play-wav.json'));print({k:(v['wav']['bits'],v['wav']['ch'],v['wav']['sr'],v['wav']['durSec'],v['wav']['peak'],round(v['wav']['rms'],3),v['wav']['bad']) for k,v in d.items()})")"
echo "K27 $(T=$B/probe/ledger-test; cd $T && cp b-round-9999/doc-ledger.md /tmp/k27-led.$$ && rm b-round-9999/doc-ledger.md && python3 -I $L/tools/ledger-check.py task.md >/dev/null; a=$?; echo '| other |' > b-round-9999/doc-ledger.md; python3 -I $L/tools/ledger-check.py task.md >/dev/null; b=$?; cp /tmp/k27-led.$$ b-round-9999/doc-ledger.md; rm -f /tmp/k27-led.$$; python3 -I $L/tools/ledger-check.py task.md >/dev/null; echo "no-ledger=$a ledger-without-ZZ9=$b ledger-with-ZZ9=$?")"
