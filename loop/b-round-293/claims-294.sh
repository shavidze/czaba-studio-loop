#!/usr/bin/env bash
# Round 294 claims (run from store/). Output must equal claims-294-output.txt before A edits.
L=../tmp/studio-real-loop
echo "K1 HEAD $(git rev-parse --short HEAD); gate293 $(python3 -c "import json;print(json.load(open('$L/gates/gate-round-293.json'))['status'])"); gate291 commit $(python3 -c "import json;print(json.load(open('$L/gates/gate-round-291.json'))['commit'][:7])")"
echo "K2 status lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen $(wc -l < $L/b-round-293-r294-tree-sha256.txt) rc $(sha256sum -c --quiet $L/b-round-293-r294-tree-sha256.txt >/dev/null 2>&1; echo $?)"
for f in app/routes/studio.\$productId.tsx app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/auth.ts app/contexts/AuthContext.tsx app/lib/firebase.client.ts app/services/api/client.ts; do echo "K4 $f $(grep -cF "  $f" $L/b-round-293-r294-tree-sha256.txt)"; done
echo "K5 gate293 verify ST6 failure: $(grep -c 'expected { total: 4, script: 2 } to deeply equal { total: 3, script: 1 }' $L/gates/round-293/verify.log) hits; failed test files line: $(grep -a 'Test Files' $L/gates/round-293/verify.log | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ')"
echo "K6 store-theme-tokens.test.ts lines $(wc -l < app/lib/__tests__/store-theme-tokens.test.ts); ST6 at l.$(grep -n "it('ST6" app/lib/__tests__/store-theme-tokens.test.ts | cut -d: -f1); totals l.$(grep -n 'toEqual({ total: 3, script: 1 })' app/lib/__tests__/store-theme-tokens.test.ts | cut -d: -f1); StudioNarrowScreen in file: $(grep -c StudioNarrowScreen app/lib/__tests__/store-theme-tokens.test.ts)"
echo "K7 SWEEP data-studio-theme in non-test app source:"
grep -rn 'data-studio-theme' app --include=*.ts --include=*.tsx --include=*.css | grep -v __tests__ | cut -d: -f1,2 | sed 's/^/  K7 /'
echo "K8 SWEEP test files that mention data-studio-theme (roots app perf e2e tests):"
grep -rl 'data-studio-theme' app perf e2e tests 2>/dev/null | grep -E '__tests__|^perf/|^e2e/|^tests/' | sort | sed 's/^/  K8 /'
echo "K9 TH4 title l.$(grep -n "it('TH4" app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx | cut -d: -f1): $(grep -c "it('TH4: the data-studio-theme marker exists only on StudioWorkspace and in the app.css selector'" app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx) old-title hit; TH4 map has StudioNarrowScreen: $(sed -n 187,197p app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx | grep -c StudioNarrowScreen.tsx)"
D=docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md
echo "K10 doc218 l.4: $(sed -n 4p $D)"
echo "K11 doc218 l.21 latched bullet: $(sed -n 21p $D | grep -c 'wide-ის შემდეგ შევიწროებული') ; stopLibraryPreview on l.21: $(sed -n 21p $D | grep -c stopLibraryPreview); ST6/GATE293 mentions: $(grep -c 'ST6\|GATE293' $D); TH4 testing line l.$(grep -n '^- TH4 და TH10' $D | cut -d: -f1)"
echo "K12 docs starting 219: $(ls docs/implementation/2026/quarter-IV/ | grep -c '^219')"
echo "K13 B artifacts: $(for p in b-round-293/sketch-st6.diff b-round-293/sketch-th4-title.diff b-round-293/sketch-tests.log b-round-293/mutant-st6-store-marker.log b-round-293/mutant-st6-old-map.log b-round-293/scratch-build.log b-round-293/backlog-before-294.json; do test -f $L/$p && echo -n 'ok '; done)"
echo "K14 Footer has 0 markers and a <footer: $(grep -c data-studio-theme app/components/layout/Footer.tsx) $(grep -c '<footer' app/components/layout/Footer.tsx)"
echo "K15 C-293 evidence: $(for p in c-round-293.json c-round-293/c293.cjs c-round-293/c293.json b-round-291/probe/desk-5173-1440x900.png b-round-291/probe/desk-5173-1280x720.png; do test -f $L/$p && echo -n 'ok '; done)"
