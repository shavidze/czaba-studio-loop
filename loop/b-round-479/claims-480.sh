#!/usr/bin/env bash
# Claims for task round 480 (RETRO 480; L29 + L56). Run from the loop root: bash b-round-479/claims-480.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=b-round-479
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-479.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(cat $B/git-status-at-planning.txt) $(head -1 $B/head-at-planning.txt | cut -c1-7)"
echo "K3 $(wc -l < $B/r480-tree-sha256.txt)"
echo "K4 $(awk '{print $2}' b-round-318/protected-sha256.txt | while read f; do grep -cF "  $f" $B/r480-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen480.json'));print({k:len(v) for k,v in d['screens'].items()}, 'outside', [sum(1 for r in v if not r['inClip'] and not r['inLibraryList']) for v in d['screens'].values()])")"
echo "K6 $(python3 -I -c "import json;d=json.load(open('$B/screens/screen480.json'))['journey'];print([(k,v['studioUrl'].split('5173')[1],len(v['clips']),[c['left'] for c in v['clips']],v['status'][-40:]) for k,v in d.items()])")"
echo "K7 $(wc -l < lessons.md) $(wc -c < lessons.md)"
echo "K8 $(for p in $(cat $B/cited-artifacts.txt); do test -e "$p" || printf 'MISSING %s ' "$p"; done; echo done)"
echo "K9 $(ls $B/screens/*.png | wc -l)"
echo "K10 $(python3 -I -c "import json;b=json.load(open('backlog.json'));print(b['version'],b['decisions_log_b'][-1]['id'])")"
echo "K11 rc=$(python3 -I tools/l57-check.py c-round-479.json >/dev/null 2>&1; echo $?)"
echo "K12 $(cmp -s <(grep -oE '^[0-9]+\.' lessons.md | tr -d . | sort -n | tr '\n' ' ') <(grep -oE '^[0-9]+\.' $B/lessons-before-480.md | tr -d . | sort -n | tr '\n' ' ') && echo ids-equal || echo ids-DIFF)"
echo "K13 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K14 L23=$(grep -m1 '^23\. ' lessons.md | wc -c) L58=$(grep -m1 '^58\. ' lessons.md | wc -c) L29=$(grep -m1 '^29\. ' lessons.md | wc -c) L37=$(grep -m1 '^37\. ' lessons.md | wc -c)"
echo "K15 $(cmp tasks/round-479.md $B/current-task-before-480.md && echo archive-equal)"
echo "K16 $(python3 -I -c "import json;from statistics import median;R=json.load(open('$B/data/cost-rows.json'));print('B-median',median(x[1] for x in R),'round-median',median(round(x[1]+x[2]+x[3],2) for x in R),'all',round(sum(x[1]+x[2]+x[3] for x in R),2),'B',round(sum(x[1] for x in R),2),'A',round(sum(x[2] for x in R),2),'C',round(sum(x[3] for x in R),2))")"
echo "K17 $(awk '$2>0{printf "%s ",$1}' $B/data/stops-head.txt)| old-regex $(awk '$2>0{printf "%s ",$1}' $B/data/stops-count.txt)"
echo "K18 $(diff $B/lessons-before-480.md lessons.md | grep -E '^[0-9]' | tr '\n' ' ')"
echo "K19 $(git -C $S rev-parse --short=7 HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K20 $(python3 -I -c "
import json
R=json.load(open('$B/data/rounds-465-479.json'))
print('fail',[r['round'] for r in R if r['c_status']=='FAIL'],'blocked',[r['round'] for r in R if r['c_status']=='BLOCKED'],'gate-skipped',[r['round'] for r in R if r['gate']=='skipped'],'browser-true',sum(1 for r in R if r['browser'] is True),'of',len(R))")"
echo "K21 $(for n in $(seq 466 479); do printf '%s:%s ' $n "$(python3 -I tools/l58-check.py tasks/round-$n.md >/dev/null 2>&1; echo $?)"; done)"
echo "K22 $(grep -c '^## Q' user-review/questions-retro-480.md)"
echo "K23 $(python3 -I -c "import json;print(json.load(open('$B/backlog-retro-input.json'))['version'])")"
echo "K24 $(python3 -I -c "
import json;b=json.load(open('backlog.json'))
def has(sec,i): return any(isinstance(e,dict) and e.get('id')==i for e in b.get(sec,[]))
chk=[('screen_review_candidates','SR-480-%d'%n) for n in range(1,4)]+[('open_findings','GATE479-M1-ROUTE-ANNOUNCE'),('architecture_signals','SIG-R479-INTERNAL-LINK-WRAPPER'),('deferred_low_polish','B-R479-LEADMAGNET-TIMER-CLIENT-NAV'),('open_findings','FIREFOX-CHECKS'),('open_findings','SAFARI-CHECKS'),('open_findings','HIREUS-EMAIL-CLIENTS')]
print(' '.join(('%s=%s'%(i,'found' if has(s,i) else 'MISSING')) for s,i in chk))
print('retro_runs-480', any(r.get('round')==480 for r in b['retro_runs']), 'next_due', b['retro_policy']['next_due'][:40])
")"
echo "K25 tree=$(cd $S && sha256sum -c --quiet ../tmp/studio-real-loop/$B/r480-tree-sha256.txt >/dev/null 2>&1; echo $?) protected=$(cd $S && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K26 $(for f in .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md docs/design/DESIGN_SYSTEM.md; do printf '%s=%s ' "$(basename $f)" "$(grep -ciE '13d9cc|teal|19,217,204|hsl\(175' $S/$f)"; done)"
echo "K27 $(ls ~/.cache/ms-playwright 2>/dev/null | tr '\n' ' ')"
echo "K28 $(python3 -I tools/l58-check.py current-task.md 2>&1 | tail -1)"
echo "K29 $(python3 -I -c "
import json;from statistics import median
R=json.load(open('$B/data/cost-rows.json'));t=sum(x[1]+x[2]+x[3] for x in R);print('B-share',round(sum(x[1] for x in R)/t*100,1))")"
echo "K30 header-links-at-75a6028=$(git -C $S show 75a6028:app/components/layout/Header.tsx | grep -c '<Link') root-studio-guard=$(grep -n "isStudioPage" $S/app/root.tsx | cut -d: -f1 | tr '\n' ',') root-meta=$(grep -c 'export const meta\|export function meta' $S/app/root.tsx)"
echo "K31 no-meta: $(for r in cart search account account_.login account.orders 'account.reset.$id.$token' account.downloads; do printf '%s=%s ' "$r" "$(grep -c 'export const meta\|export function meta' "$S/app/routes/$r.tsx")"; done)"
echo "K32 teal-lines: $(cd $S && grep -niE '13d9cc|teal|19,217,204|hsl\(175' .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md docs/design/DESIGN_SYSTEM.md | cut -d: -f1,2 | tr '\n' ' ')"
echo "K33 font-lines: $(cd $S && grep -niE '\bInter\b|Playfair' .claude/primitives/DESIGN_TOKENS.md .claude/primitives/TAILWIND_FIRST.md | cut -d: -f1,2 | tr '\n' ' ') design-system-750-761=$(sed -n '750,761p' $S/docs/design/DESIGN_SYSTEM.md | grep -ciE 'Inter|Playfair') app.css-113-115=$(sed -n '113,115p' $S/app/styles/app.css | grep -c 'Instrument Sans\|IBM Plex Mono')"
