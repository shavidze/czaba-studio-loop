#!/usr/bin/env bash
# Round 357 claims: PERF-10a (isPlaying leaves the ArrangementContext value). Run from the loop root.
# CLAIMS_STORE may point at another tree.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CTX=$S/app/contexts/ArrangementContext.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
BJ=$S/perf/budgets.interactions.json
c() { local n; n=$(grep -c -E -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-356.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l) outside-root-lanes-since-d49536b $(git -C $S diff --name-only d49536b HEAD 2>/dev/null | grep -v '^app/components/studio/export/\|^app/components/studio/StudioToolbar.tsx$\|^docs/' | wc -l)"
echo "K3 ctx useState-isPlaying $(c 'const \[isPlaying, setIsPlaying\] = useState\(false\)' $CTX) setIsPlaying-calls $(c 'setIsPlaying\((true|false)\)' $CTX) value-field $(c '^      isPlaying,$' $CTX) type-field $(c '^  isPlaying: boolean;$' $CTX) isPlayingRef-uses $(c 'isPlayingRef' $CTX)"
echo "K4 consumers $(grep -rlE '\bisPlaying\b' $S/app/components/arrangement/*.tsx $S/app/routes/studio-lab.tsx 2>/dev/null | xargs -r grep -LE 'isPlayingRef' | wc -l) per-file $(for f in ArrangementTransport ArrangementMarkerRow ArrangementVideoDock StudioWorkspace; do echo -n "$f:$(grep -E '\bisPlaying\b' $S/app/components/arrangement/$f.tsx | grep -vc isPlayingRef) "; done)studio-lab:$(grep -cE '\bisPlaying\b' $S/app/routes/studio-lab.tsx)"
echo "K5 ws workspaceRef-isPlaying $(c 'workspaceRef\.current\.isPlaying|current\.isPlaying' $WS) follow-effect-deps $(c '\[isPlaying, setFollowMode\]' $WS)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 SWEEP tests-isPlaying-files $(grep -rlE '\bisPlaying\b' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l) api-dot-isPlaying-lines $(grep -rnE '\)\.isPlaying\b|\?\.isPlaying\b|current\.isPlaying\b' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l) perf-isPlaying-lines $(grep -rnE '\bisPlaying\b' $S/perf | wc -l) e2e $(grep -rlE '\bisPlaying\b' $S/e2e 2>/dev/null | wc -l)"
echo "K8 $(python3 -I - "$BJ" <<'PY'
import json, sys
rows = json.load(open(sys.argv[1], encoding='utf-8'))
by = {r['id']: r for r in rows}
out = [f"rows {len(rows)}", f"assert {sum(r['mode'] == 'assert' for r in rows)}"]
for i in ('interact.play.start-components', 'interact.play.stop-components', 'interact.play.start-commits', 'interact.play.stop-commits', 'interact.play.start-sources'):
    r = by[i]; out.append(f"{i.split('.')[-1]} {r['mode']}/{r['kind']}/{r['owner']}")
print(' '.join(out))
PY
)"
echo "K9 zustand $(grep -c '"zustand": "5.0.16"' $S/package.json) vanilla-stores-in-ctx $(c "from 'zustand/vanilla'|createStore" $CTX)"
echo "K10 regression-last $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K11 cited $(n=0; m=0; while read -r f; do n=$((n+1)); [ -f "$L/$f" ] || { m=$((m+1)); echo -n "MISSING:$f "; }; done < $L/b-round-356/cited-artifacts.txt; echo "$n listed, $m missing")"
RB=$S/app/lib/arrangement/__tests__/render-budget.test.tsx
echo "K12 rb-clips-test-line $(grep -n 'does not re-render clips' $RB | cut -d: -f1) parent-loop-gt0 $(grep -c "expect(renderLog.counts.get(parent) ?? 0).toBeGreaterThan(0);" $RB) rb-pb-rows $(grep -c "RB-PB[12] " $RB) transport-gt0 $(grep -c "renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0)" $RB)"
echo "K13 new-files store:$(ls $S/app/lib/arrangement/playback-store.ts $S/app/lib/arrangement/__tests__/helpers/workspace-probe.ts $S/app/lib/arrangement/__tests__/playback-store.test.ts 2>/dev/null | wc -l) doc234:$(ls $S/docs/implementation/2026/quarter-IV/234-* 2>/dev/null | wc -l) perf-data-playing $(grep -c 'data-playing' $S/perf/lib/page.ts) transport-data-playing $(grep -c 'data-playing=' $S/app/components/arrangement/ArrangementTransport.tsx)"
echo "K14 sweep-list $(wc -l < $L/b-round-356/tsc-removal-files.txt) helper-users $(grep -rl 'useWorkspaceProbe' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l) raw-useArrangement-in-tests $(grep -rl 'useArrangement()' $S/app --include='*.test.ts' --include='*.test.tsx' | wc -l) patches $(cd $L/b-round-356/sketch && sha256sum -c patches.sha256 2>/dev/null | grep -c ': OK$')"
SA=$S/app/lib/arrangement/status-announcement.ts
echo "K15 reducer-same-text-returns-previous $(grep -c 'if (text === previous.text) {' $SA) fw-pb1 $(grep -c 'FW-PB1 ' $S/app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx) follow-sync-props $(grep -c 'interface ArrangementPlaybackFollowSyncProps' $S/app/components/arrangement/StudioWorkspace.tsx)"
