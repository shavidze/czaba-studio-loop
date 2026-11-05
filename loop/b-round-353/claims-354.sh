#!/usr/bin/env bash
# Round 354 claims: PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (12 video rows record -> assert). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b353-scratch/sc; K2/K8 read no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$S/perf/budgets.interactions.json
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
STR=$S/app/lib/arrangement/strings.ts
TOK=$S/app/routes/api.studio-token.ts
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;g=lambda n:json.load(open('gates/gate-round-%d.json'%n));a=g(352);print(a['status'],a['commit'][:7],'g353',g(353)['status'])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(python3 -I - "$B" <<'PY'
import json,sys
from collections import Counter
r=json.load(open(sys.argv[1]))
own=[x for x in r if x['owner']=='PERF-CAND-VIDEO-TRIM-FADE-COST-2']
vt=[x for x in r if x['owner']=='PERF-CAND-VIDEO-TRIM-FADE-ROWS']
print('rows',len(r),'assert',Counter(x['mode'] for x in r)['assert'],'stage2-owned',len(own),'still-rows-owner',len(vt),
      'budgets',' '.join(x['id'].replace('interact.','')+'='+x['budget']['op']+str(x['budget']['value']) for x in own),
      'record-left',' '.join(sorted(x['id'].replace('interact.drag.','') for x in vt if x['mode']=='record')))
PY
)"
echo "K4 dock-sha $(sha256sum $DOCK | cut -c1-16) ctx-sha $(sha256sum $CTX | cut -c1-16) mb2p-anchor $(c '  const videoLane = useVideoLanePreviewReader(arrangement, getArrangement);' $DOCK) preview-hook-in-dock $(c 'useArrangementPreview,' $DOCK)"
echo "K5 doc232 h2 $(c '^## ' $D232) pending-352 $(c 'C round 352 pending' $D232) pass-354 $(c 'video-trim-fade-cost-1, video-trim-fade-cost-2; C round 354 PASS)' $D232) stage2-section $(c '^### ეტაპი video-trim-fade-cost-2' $D232) d1138 $(c 'D-29z1138' $D232) pending-any-impl-docs $(grep -rl 'C round [0-9]* pending' $S/docs/implementation 2>/dev/null | wc -l)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 diff-lines-outside-2 $(git -C $S diff --stat HEAD -- app perf e2e docs scripts 2>/dev/null | grep -v 'budgets.interactions.json\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K8 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K9 strings l701 $(sed -n 701p $STR | grep -c 'historyMoveToTrack: (name: string): string => `Move to track — ${name}`,') l702 $(sed -n 702p $STR | grep -c "historyMoveClip: 'Move clip',") token-param-check-400 $(c "{ error: 'Invalid product or file parameters' }, { status: 400 }" $TOK)"
echo "K10 perf-lib-reads-budgets $(c 'budgets.interactions' $S/perf/lib/report.test.ts) spec-sha $(sha256sum $S/perf/studio-lab-interactions.perf.spec.ts | cut -c1-16)"
echo "K11 cited $(n=0; m=0; while read -r f; do n=$((n+1)); [ -f "$L/$f" ] || { m=$((m+1)); echo -n "MISSING:$f "; }; done < $L/b-round-353/cited-artifacts.txt; echo "$n listed, $m missing")"
