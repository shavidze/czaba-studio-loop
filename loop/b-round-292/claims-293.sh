#!/usr/bin/env bash
# Round 293 claims (run from store/). Output must equal claims-293-output.txt before A edits.
L=../tmp/studio-real-loop
echo "K1 HEAD $(git rev-parse --short HEAD); gate292 $(python3 -c "import json;print(json.load(open('$L/gates/gate-round-292.json'))['status'])"); gate291 $(python3 -c "import json;print(json.load(open('$L/gates/gate-round-291.json'))['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-292-r293-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-292-r293-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-292-r293-tree-sha256.txt)"; done
echo "K5 route lines $(wc -l < app/routes/studio-lab.tsx); StopPlaybackOnNarrow at $(grep -n '^function StopPlaybackOnNarrow' app/routes/studio-lab.tsx | cut -d: -f1); useArrangement destructure: $(grep -n 'useArrangement();' app/routes/studio-lab.tsx | tr -s ' ')"
echo "K6 route stopLibraryPreview count $(grep -c stopLibraryPreview app/routes/studio-lab.tsx)"
echo "K7 context type stopLibraryPreview l.$(grep -n 'stopLibraryPreview: () => void' app/contexts/ArrangementContext.tsx | cut -d: -f1); useCallback l.$(grep -n 'const stopLibraryPreview = useCallback' app/contexts/ArrangementContext.tsx | cut -d: -f1); unmount cleanup effect l.3904-3949 stops preview at l.$(awk 'NR>=3904 && NR<=3949 && /previewPlayerRef.current\?\.stopLibraryPreview\(\)/{print NR}' app/contexts/ArrangementContext.tsx)"
echo "K8 strings previewPlay l.$(grep -n "previewPlay: 'Preview'" app/lib/arrangement/strings.ts | cut -d: -f1) previewStop l.$(grep -n "previewStop: 'Stop'" app/lib/arrangement/strings.ts | cut -d: -f1)"
echo "K9 SWEEP sound sources under ArrangementProvider (app/components/arrangement + app/contexts/ArrangementContext.tsx + app/lib/arrangement, non-test): createBufferSource/.play()/new Audio( hits:"
grep -rn "createBufferSource()\|\.play()\|new Audio(" app/components/arrangement app/contexts/ArrangementContext.tsx app/lib/arrangement --include=*.ts --include=*.tsx | grep -v __tests__ | sed 's/^/  K9 /'
echo "K10 gate test file lines $(wc -l < app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx); rows $(grep -c "^\s*it('NG" app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx); describe timeout $(grep -c '{ timeout: 15_000 }' app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx); NG5c $(grep -c "it('NG5c" app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx)"
echo "K11 doc218 l.4: $(sed -n 4p docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md)"
echo "K12 docs starting 219: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^219')"
echo "K13 c-round-292 evidence: $(for p in c292.json mix-probe.json shots/libpreview-1440-narrow.png; do test -f $L/c-round-292/$p && echo -n 'ok '; done)"
echo "K14 b-round-292 artifacts: $(for p in sketch-route.diff sketch-ng5c.diff sketch-tests.log backlog-before-293.json; do test -f $L/b-round-292/$p && echo -n 'ok '; done)"
echo "K15 NG5b uses demo-soft-impact: $(grep -c 'demo-soft-impact' app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx)"
echo "K16 FakeAudioContext l.$(grep -n 'class FakeAudioContext' app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts | cut -d: -f1); createBufferSource() l.$(grep -n '^    createBufferSource() {' app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts | cut -d: -f1)"
