#!/usr/bin/env bash
# Round 323 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
# K1..K27 are the round-322 claims (b-round-321/claims-322.sh), unchanged; K28..K35 are new for round 323.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx; RB=app/lib/arrangement/__tests__/render-budget.test.tsx
bash b-round-321/claims-322.sh
echo "K28 $(git -C $S show 53c5c79:$RB | grep -c 'expect(') $(grep -c 'expect(' $S/$RB)"
echo "K29 $(test -f b-round-322/setup-probe-a-tree.json && python3 -I -c "import json;s=json.load(open('b-round-322/setup-probe-a-tree.json'))['steps'];print(s['addToSfx']['clipsByTrack'], len(s['ctrlG']['groups']), s['collapse']['groups'][0].split('|')[1])")"
echo "K30 $(python3 -I -c "import json;print(json.load(open('gates/gate-round-322.json'))['status'])")"
echo "K31 $(cmp -s b-round-322/claims-at-planning-323.txt a-round-322/claims-after-stop.txt && echo planning-equals-stop)"
echo "K32 $(grep -c -E 'memo\((ArrangementGroupHeaderWithSelectionInner|ArrangementDetailPanelWithSelectionInner)\)' $WS)"
echo "K33 $(grep -l -x '\*\*სტატუსი:\*\* Completed (C round 323 PASS)' $S/docs/implementation/2026/quarter-IV/230-perf-range-store.md $S/docs/implementation/2026/quarter-IV/231-perf-selection-store.md 2>/dev/null | wc -l)"
echo "K34 $(cmp -s tasks/round-322.md b-round-322/before-current-task.md && echo archive-equal)"
echo "K35 $(for f in c-round-322/render-budget-option-a.log c-round-322/probe/selnames-summary.txt c-round-322/probe/selnames-diff.txt b-round-322/claims-at-planning-323.txt b-round-322/setup-probe.mjs b-round-322/setup-probe-a-tree.png; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K36 $(cd $S && grep -rln "Escape" app/components/arrangement app/lib/arrangement app/contexts/ArrangementContext.tsx --include=*.ts --include=*.tsx | grep -v __tests__ | xargs grep -l -E "setSelection\(|selectClips\(\[\]|clearSelection|NO_SELECTION" | xargs -r grep -n -A3 "'Escape'" | grep -c -E "setSelection|selectClips|clearSelection|NO_SELECTION")"
echo "K37 $(grep -c -E "if \(isToggle \|\| event.shiftKey\) \{|toggleClipSelection\(clip.id, isToggle \? 'toggle' : 'add'\);" $S/app/components/arrangement/ArrangementClip.tsx)"
