#!/usr/bin/env bash
# Round 324 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
# K1..K27 = round-322 claims (b-round-321/claims-322.sh), unchanged. K28..K37 = round-323 claims re-worded for round 324. K38..K44 new.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx; RB=app/lib/arrangement/__tests__/render-budget.test.tsx
SS8=$S/app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx
bash b-round-321/claims-322.sh
echo "K28 $(git -C $S show 53c5c79:$RB | grep -c 'expect(') $(grep -c 'expect(' $S/$RB)"
echo "K29 $(python3 -I -c "import json;s=json.load(open('b-round-322/setup-probe-a-tree.json'))['steps'];print(s['addToSfx']['clipsByTrack'], len(s['ctrlG']['groups']), s['collapse']['groups'][0].split('|')[1])")"
echo "K30 $(python3 -I -c "import json;print(json.load(open('gates/gate-round-323.json'))['status'])")"
echo "K31 $(cmp -s b-round-323/claims-324-planning-k1-k27.txt b-round-323/a-stop-k1-k27.txt && echo planning-equals-stop)"
echo "K32 $(grep -c -E 'memo\((ArrangementGroupHeaderWithSelectionInner|ArrangementDetailPanelWithSelectionInner)\)' $WS)"
echo "K33 $(grep -l -x '\*\*სტატუსი:\*\* Completed (C round 324 PASS)' $S/docs/implementation/2026/quarter-IV/230-perf-range-store.md $S/docs/implementation/2026/quarter-IV/231-perf-selection-store.md 2>/dev/null | wc -l)"
echo "K34 $(cmp -s tasks/round-323.md b-round-323/before-current-task.md && echo archive-equal)"
echo "K35 $(for f in a-round-323/option-a-r11p1e.patch.txt a-round-323/option-a-mutant-nomemo.log c-round-323/option-a-c.log c-round-323/option-a-mutant-nomemo-c.log c-round-323/c-mutant-group-nomemo.log c-round-323/c-mutant-group-files.txt c-round-323/claims-c.txt b-round-323/fold-select-probe.mjs b-round-323/fold-select-probe-a-tree.json; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K36 $(cd $S && grep -rln "Escape" app/components/arrangement app/lib/arrangement app/contexts/ArrangementContext.tsx --include=*.ts --include=*.tsx | grep -v __tests__ | xargs grep -l -E "setSelection\(|selectClips\(\[\]|clearSelection|NO_SELECTION" | xargs -r grep -n -A3 "'Escape'" | grep -c -E "setSelection|selectClips|clearSelection|NO_SELECTION")"
echo "K37 $(grep -c -E "if \(isToggle \|\| event.shiftKey\) \{|toggleClipSelection\(clip.id, isToggle \? 'toggle' : 'add'\);" $S/app/components/arrangement/ArrangementClip.tsx)"
echo "K38 $(test -f $SS8 && echo present $(grep -c 'expect(' $SS8) || echo absent)"
echo "K39 $(awk '/R9-L2, C-R6-02/{f=1} f&&/counts\.clear\(\)/{c++} f&&/^  \}, 15000\);/{print c+0; exit}' $S/$RB)"
echo "K40 $(grep -c -E '^  \} = useArrangement\(\);$' $S/app/components/arrangement/ArrangementTransport.tsx) $(grep -c -E '^    isPlaying,$' $S/app/components/arrangement/ArrangementTransport.tsx) $(grep -c -E 'useArrangement\(\)' $S/app/components/arrangement/ArrangementDetailPanel.tsx)"
echo "K41 $(grep -c -E '^(async )?function (pressGroupKey|clickLane|mountGroupsWorkspace)\(' $S/app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx)"
echo "K42 $(python3 -I -c "import json;s=json.load(open('b-round-323/fold-select-probe-a-tree.json'))['steps'];print(s['collapse']['overviewBlocks'], s['collapse']['overviewSelected'], s['ctrlA-folded-after-fold-click']['overviewSelected'], s['ctrlA-folded-after-fold-click']['groups'][0].split('|')[1])")"
echo "K43 $(cd $S && grep -rn -E "counts\.get\('[A-Za-z]+'\) \?\? 0\)\.toBeGreaterThan\(0\)" app --include=*.tsx | wc -l)"
echo "K44 $(grep -c -x '    expect(renderLog.counts.get(.ArrangementDetailPanel.) ?? 0).toBeGreaterThan(0);' $S/$RB)"
