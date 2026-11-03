#!/usr/bin/env bash
# Round 307 claims (B round 306 -> 307 planning). Run from the loop root: bash b-round-306/claims-307.sh
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-306.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"
echo "K3 $(wc -l < b-round-306-r307-tree-sha256.txt)"
echo "K4 $(for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do grep -c "  $f\$" b-round-306-r307-tree-sha256.txt; done | tr '\n' ' ')"
echo "K5 $(grep -nE '^export interface ScheduleHandle|^  appendPlan\(|^  activeSourceCount\(\): number;|^export function applySchedule' $S/app/lib/arrangement/graph.client.ts | cut -d'(' -f1 | tr '\n' '|')"
echo "K6 $(grep -nE 'const fadeShape = options.clipFades\?.get\(item.clipId\);|const envelopeShape = options.clipEnvelopes\?.get\(item.clipId\);|const clipGainTargets = new Map<string, number>\(options.clipGains \?\? \[\]\);' $S/app/lib/arrangement/graph.client.ts | cut -d: -f1 | tr '\n' ' ')"
echo "K7 $(grep -n '^export function planSchedule(' $S/app/lib/arrangement/schedule.ts | cut -d: -f1) $(grep -c 'sourceOffset: clip.sourceOffset + Math.max(0, from - clip.start),' $S/app/lib/arrangement/schedule.ts)"
echo "K8 $(grep -n '^function scheduleKey(arrangement: Arrangement): string {' $S/app/contexts/ArrangementContext.tsx | cut -d: -f1) $(grep -c "key === 'gainDb' ? undefined : value" $S/app/contexts/ArrangementContext.tsx)"
echo "K9 $(grep -nE '^  const (startGraph|syncPlayback) = useCallback\(' $S/app/contexts/ArrangementContext.tsx | cut -d: -f1 | tr '\n' ' ')"
echo "K10 $(grep -rn 'replaceClips\|diffClipSchedule\|planChangedClips\|ClipScheduleDiff\|ReplaceClipShapes' $S/app $S/perf | wc -l)"
echo "K11 $(test -f $S/app/lib/arrangement/reschedule.ts && echo present || echo absent) $(test -f $S/app/lib/arrangement/__tests__/reschedule.test.ts && echo present || echo absent)"
echo "K12 $(grep -rln 'appendPlan *[(:]' $S/app --include=*.ts --include=*.tsx | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K13 $(grep -rn 'ScheduleHandle = {\|: ScheduleHandle = \|implements ScheduleHandle' $S/app | wc -l)"
echo "K14 $(grep -cE '^  it\(' $S/app/lib/arrangement/__tests__/graph.test.ts) $(wc -l < $S/app/lib/arrangement/__tests__/graph.test.ts)"
echo "K15 $(grep -nE '^class Fake(Source|Context|Gain)' $S/app/lib/arrangement/__tests__/graph.test.ts | cut -d' ' -f1-2 | tr '\n' ' ')"
echo "K16 $(ls $S/docs/implementation/2026/quarter-IV | sort -V | tail -1) $(ls $S/docs/implementation/2026/quarter-IV | grep -c '^224-')"
echo "K17 $(cmp -s tasks/round-306.md b-round-306/round-306-task-copy.md && echo archive-equal-306)"
echo "K18 $(python3 -I -c "
import json
r={x['id']:x for x in json.load(open('$S/perf/budgets.interactions.json'))}
i='interact.drag.fade.30.playing.release-restarts';print(r[i]['mode'],r[i]['budget'])")"
echo "K19 $(grep -n 'graph.test.ts' gates/round-306/verify.log | head -1 | sed 's/\x1b\[[0-9;]*m//g' | grep -oE '[0-9]+ tests\)  ?[0-9]+ms' | tr -s ' ')"
printf 'K20 '; for f in b-round-306/probe/release-probe.cjs b-round-306/probe/head-1440.json b-round-306/probe/head-1280.json b-round-306/probe/head-1440-v1-with-invalid-move.json b-round-306/probe/continuity-probe.cjs b-round-306/probe/continuity-head-1440.json b-round-306/consults.md b-round-306/round-306-task-copy.md b-round-306-r307-tree-sha256.txt b-round-306/claims-307-head-output.txt b-round-306-checkpoint-request.md c-round-306/perf/perf-1b-i-2026-11-03T01-00-39-178Z.json gates/round-306/review.md; do test -f "$f" || echo "MISSING $f"; done; echo done
