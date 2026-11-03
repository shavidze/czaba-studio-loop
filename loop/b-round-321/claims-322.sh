#!/usr/bin/env bash
# Round 322 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CTX=$S/app/contexts/ArrangementContext.tsx; WS=$S/app/components/arrangement/StudioWorkspace.tsx
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-321.json'));b=json.load(open('gates/gate-round-320.json'));print(a['status'],b['status'],b['reason'].split()[1][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(grep -c -E '^\s+selectedClipIds,$|selectedClipId: selectedClipIds\.at\(-1\)' $CTX)"
echo "K4 $(grep -c -E 'latestRef\.current\.selectedClipIds|latest\.selectedClipIds' $CTX)"
echo "K5 $(grep -c 'useState<readonly string\[\]>(NO_SELECTION)' $CTX)"
echo "K6 $(grep -c 'error TS' b-round-321/sketch-type-tsc.log) $(grep 'error TS' b-round-321/sketch-type-tsc.log | cut -d'(' -f1 | sort -u | grep -vc __tests__) $(wc -l < b-round-321/selection-test-files.txt)"
echo "K7 $(python3 -I b-round-321/expect-count.py $S | tail -1)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c 'setSelectedClipIdsState(next);' $CTX)"
echo "K11 $(grep -c -E '\bselectedClipId\b' $S/app/components/arrangement/ArrangementTransport.tsx)"
echo "K12 $(test -f $S/app/lib/arrangement/selection-store.ts && echo 1 || echo 0)"
echo "K13 $(grep -rn 'In Progress (stage' $S/docs/implementation | sed "s#$S/##")"
echo "K14 $(python3 -I -c "
import json
d=json.load(open('b-round-321/click-hooks-head.json'));s=json.load(open('b-round-321/select-same-lane-head.json'))
f=lambda v:[sorted(h['hook'] for h in c.get('changed',[])) for c in v if c.get('changed')]
print('harness-click',f(d['clip-header-click']),'reclick',f(d['clip-header-click-again']),'same-lane',f(s['click-original-same-lane']),s['click-original-same-lane'][0]['rendered'],'reclick',s['click-original-again'][0]['rendered'])")"
echo "K15 $(python3 -I -c "
import json
s=json.load(open('b-round-321/select-same-lane-head.json'))['click-original-same-lane'][0]['names']
need=['ArrangementRuler','ArrangementTempoRow','ArrangementVideoDock','ArrangementLibrary','ArrangementLibraryPreview','ArrangementMaster','ArrangementShortcutSheet','ArrangementExportDialog','ArrangementTransport','StudioWorkspace']
print(sum(n in s for n in need),'of',len(need),'live at HEAD')")"
echo "K16 $(cd $S/app/components/arrangement && for f in ArrangementRuler ArrangementTempoRow ArrangementVideoDock ArrangementLibrary ArrangementLibraryPreview ArrangementMaster ArrangementShortcutSheet ArrangementExportDialog; do grep -c -E 'selectedClipIds?|getSelectedClipIds|primarySelectedClipId|selectClip' $f.tsx; done | tr '\n' ' ')"
echo "K17 $(python3 -I -c "
import json
d=json.load(open('b-round-321/s2-video-head.json'))
print(sum(1 for c in d['commits'] if c['range']=='' and c['selected']!=''),'commits with range cleared and old selection;',len(d['frames']),'frames observed')")"
echo "K18 $(grep -c 'setRange(null);' $CTX)"
echo "K19 $(grep -c '"interact\.select' $S/perf/budgets.interactions.json)"
echo "K20 $(grep -n '^### გადაწყვეტილებები (rulings)' $S/docs/implementation/2026/quarter-IV/230-perf-range-store.md | cut -d: -f1)"
echo "K21 $(grep -c -E '\bselectedClipIds?\b' $WS)"
echo "K22 $(grep -c -E '^\s+selectedClipIds,$' $CTX) $(grep -n -E '\[[^]]*selectedClipIds[^]]*\]\);' $WS | cut -d: -f1 | tr '\n' ' ')"
echo "K23 $(cmp -s tasks/round-321.md b-round-321/current-task-before-322.md && echo archive-equal || echo archive-DIFF)"
T=$(mktemp -d); echo "K24 $(python3 -I -c "import json;[print(n,json.load(open(f'c-round-{n}.json')).get('assertsSpecified')) for n in range(305,321)]" | cmp -s - b-round-321/asserts-specified-305-320.txt && echo asserts-equal || echo asserts-DIFF) $(python3 -I b-round-321/retro321-mentions-v2.py b-round-320/backlog-before-321.json $T >/dev/null; cmp -s $T/retro321-mention-ids-v2.txt b-round-321/retro321-mention-ids-v2.txt && cmp -s $T/retro321-mentions-v2.txt b-round-321/retro321-mentions-v2.txt && echo inventory-equal || echo inventory-DIFF) $(wc -l < $T/retro321-mention-ids-v2.txt)"; rm -rf $T
echo "K25 $(grep -c 'interact.click.components' $S/perf/budgets.interactions.json) $(python3 -I -c "import json;print([r['mode'] for r in json.load(open('$S/perf/budgets.interactions.json')) if r['id']=='interact.click.components'][0])")"
miss=0; for f in b-round-321/claims-322.sh b-round-321/click-hooks-probe.mjs b-round-321/click-hooks-head.json b-round-321/select-same-lane-head.json b-round-321/select-same-lane-head.log b-round-321/s2-probe.mjs b-round-321/s2-head.json b-round-321/s2-video-head.json b-round-321/sketch-type-tsc.log b-round-321/selection-test-files.txt b-round-321/expect-count.py b-round-321/expect-count-head.txt b-round-321/asserts-specified-305-320.txt b-round-321/retro321-mentions-v2.py b-round-321/retro321-mentions-v2.txt b-round-321/retro321-mention-ids-v2.txt b-round-321/retro-321-fix.diff.txt b-round-321/retro-321-before-fix.md b-round-321/backlog-before-322.json b-round-321/lessons-before-322.md b-round-321/feature-status-before-322.md b-round-321/b-next-before-322.json b-round-321/current-task-before-322.md b-round-318/protected-sha256.txt b-round-321/precheck-full.log b-round-321/precheck-classify.txt b-round-321/precheck-outside-list.txt b-round-321/precheck-failing-files.txt; do test -f "$f" || { echo "MISSING $f"; miss=1; }; done
echo "K26 $([ $miss = 0 ] && echo done)"
echo "K27 $(sed 's/\x1b\[[0-9;]*m//g' b-round-321/precheck-classify.txt | grep -oE '[0-9]+ failed \| [0-9]+ passed' | head -1); $(wc -l < b-round-321/precheck-outside-list.txt); $(tail -1 b-round-321/precheck-classify.txt | awk '{print $NF}')"
