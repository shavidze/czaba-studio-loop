#!/usr/bin/env bash
# Round 308 claims (B round 307 -> 308 planning). Run from the loop root: bash b-round-307/claims-308.sh
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
G=$S/app/lib/arrangement/graph.client.ts; T=$S/app/lib/arrangement/__tests__/graph.test.ts; C=$S/app/contexts/ArrangementContext.tsx
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-307.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"
echo "K3 $(wc -l < b-round-307-r308-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-307-r308-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -n 'if (state.ended || (state.stopAt !== null && state.stopAt <= ctx.currentTime)) {' $G | cut -d: -f1 | tr '\n' ' ')"
echo "K6 $(awk '/^export interface ReplaceClipShapes \{/{f=1;print NR;next} f&&/^\}/{f=0} f' $G | tr -s ' ' | tr '\n' '|')"
echo "K7 $(grep -n '^    replaceClips(clipIds, items, from, startAt, shapes) {' $G | cut -d: -f1) $(grep -n '^          state.source.stop(startAt);' $G | cut -d: -f1)"
echo "K8 $(grep -nE '\.stop\(' $C | sed -E 's/^([0-9]+):\s*/\1 /' | tr '\n' '|')"
echo "K9 $(grep -n "^describe('replaceClips', () => {" $T | cut -d: -f1) $(grep -cE ', \{\}\);$' $T) $(grep -c 'replaceClips(' $T)"
echo "K10 $(grep -cE "^  it\('RC[0-9]+ " $T) $(grep -cE "^  it\('RC1[23] " $T)"
echo "K11 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md)"
echo "K12 $(python3 -I -c "import json;d=json.load(open('b-round-307/probe/onended-probe.json'));print(d['stopBeforeStart'],d['stopEqualStart'],d['stopTwiceLaterWins'],d['secondStopThrew'])")"
echo "K13 $(python3 -I -c "
import json
for f in ('continuity-head-dev.json','continuity-head-dev-30.json'):
    d=json.load(open('b-round-307/probe/'+f)); rs=[r for v in d['vp'].values() for r in v]
    ok=[r for r in rs if r['valid']]
    print(f, len(ok),'/',len(rs), 'starts', sorted({r['starts'] for r in ok}), 'maxStep<=p999', all(r['spliceMaxDiff']<=r['baseP999'] for r in ok), 'zeroRun0', all(r['zeroRunMaxSamples']==0 for r in ok), end='; ')
")"
echo "K14 $(grep -c 'handle.stop(21);' $S/app/lib/arrangement/__tests__/metronome.test.ts) $(grep -c 'toEqual(\[21, undefined\])' $S/app/lib/arrangement/__tests__/metronome.test.ts)"
echo "K15 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K16 $(cmp -s tasks/round-307.md b-round-307/round-307-task-copy.md && echo archive-equal-307)"
echo "K17 $(python3 -I -c "
import json
r={x['id']:x for x in json.load(open('$S/perf/budgets.interactions.json'))}
i='interact.drag.fade.30.playing.release-restarts';print(r[i]['mode'],r[i]['budget'])")"
echo "K18 $(grep -c 'TODO' $G) $(grep -c 'TODO' $S/app/lib/arrangement/reschedule.ts)"
echo "K19 $(grep -n 'graph.test.ts' gates/round-307/verify.log | head -1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE '[0-9]+ tests\)  ?[0-9]+ms' | tr -s ' ')"
echo "K21 $(grep -rln 'replaceClips\|diffClipSchedule\|planChangedClips' $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l)"
printf 'K20 '; for f in b-round-307/probe/onended-probe.cjs b-round-307/probe/onended-probe.json b-round-307/probe/continuity-probe.cjs b-round-307/probe/continuity-head-dev.json b-round-307/probe/continuity-head-dev-30.json b-round-306/probe/release-probe.cjs b-round-306/probe/head-1440.json b-round-306/probe/head-1280.json c-round-307/probe/a-1440.json c-round-307/probe/a-1280.json c-round-307/smoke/smoke307.cjs c-round-307/auth/g307-auth.cjs gates/round-307/review.md; do test -f $f || printf 'MISSING:%s ' $f; done; echo done
