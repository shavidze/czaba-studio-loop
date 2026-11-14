#!/usr/bin/env bash
# usage: bash claims-502.sh [store-tree]   (default: /home/runner/czaba-project/store). K1, K2, K4 always read the store git repo. Prints "K# value"; MISSING marks a failed claim.
S=${1:-/home/runner/czaba-project/store}; G=/home/runner/czaba-project/store; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-501
k() { local id=$1; shift; local v; v=$("$@" 2>/dev/null); [ -n "$v" ] && echo "$id $v" || echo "$id MISSING"; }
k K1 git -C "$G" rev-parse --short HEAD
k K2 bash -c "git -C '$G' status --short --untracked-files=all | wc -l"
k K3 bash -c "grep -n 'className=\"h-\[calc(100vh-80px)\] bg-background overflow-hidden\"\|className=\"min-h-\[calc(100vh-80px)\] bg-background lg:h-\[calc(100vh-80px)\] lg:overflow-hidden\"' '$S/app/routes/cart.tsx' | cut -c1-140"
k K4 bash -c "git -C '$G' log --format='%h %ad' --date=short -S 'h-[calc(100vh-80px)] bg-background overflow-hidden' -- app/routes/cart.tsx | tail -1"
k K5 bash -c "grep -rl 'h-\[calc(100vh' '$S/app' --include=*.tsx | grep -v __tests__ | sed 's#$S/##' | tr '\n' ' '"
k K6 bash -c "grep -c 'grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0\|lg:col-span-2 overflow-y-auto overscroll-contain styled-scrollbar pr-2' '$S/app/routes/cart.tsx'"
k K7 bash -c "grep -rl 'calc(100vh-80px)' '$S/app/lib/__tests__' '$S/e2e' 2>/dev/null | sed 's#$S/##' | tr '\n' ' '; echo '(list end)'"
k K8 bash -c "grep -n \"openModal('signin')\|aria-label=\\\"Remove item\\\"\" '$S/app/routes/cart.tsx' | cut -c1-80 | tr '\n' ' '"
k K9 python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-501.json'));print(g['status'],g['commit'][:7])"
k K10 python3 -I -c "import json;c=json.load(open('$L/c-round-501.json'));print(c['taskStatus'],c['browserVerified'],c['realVerified'],len(c['bugs']))"
k K11 bash -c "cd $B && for f in sketch-502.patch.txt sketch-sha.txt r502-tree-sha256.txt r502-pre-sha.txt r502-post-sketch-sha.txt covering-files.txt mutants-502.py mutant-logs/summary.txt precheck-tsc.log precheck-lint.log precheck-biome.log precheck-covering.log precheck-full.log precheck-build-sketch.log probe/cart-states.mjs probe/cart-actions.mjs probe/cart-empty.mjs probe/cart-wheel.mjs probe/items-wheel.mjs probe/head/head-wheel.json probe/sketch/sketch-wheel.json probe/head/head-items-wheel.json probe/sketch/sketch-items-wheel.json consult-product-designer-2.md sketch-502-v1.patch.txt sketch-502-v2.patch.txt sketch-502-v3.patch.txt sketch-sha-history.txt probe/below-lg-wheel.mjs probe/head/head-below-lg.json probe/sketch/sketch-below-lg.json final-v3.sh probe/measure-502.mjs probe/c7-journey.mjs probe/head/head-c7.json probe/sketch/sketch-c7.json mutants-502.py claims-502-sketch-output.txt probe/compare-502.py probe/compare-sketch.txt probe/head/head-cart.json probe/sketch/sketch-cart.json probe/head/head-actions.json probe/sketch/sketch-actions.json probe/head/head-empty.json probe/sketch/sketch-empty.json probe/head/cart375-full.png consult-product-designer.md sketch-review.md; do test -f \$f || echo MISSING-\$f; done; echo checked"
k K12 bash -c "cd $B && sha256sum sketch-502.patch.txt | cut -c1-16; cut -c1-16 sketch-sha.txt"
k K13 bash -c "wc -l < $B/covering-files.txt; grep -E 'Tests ' $B/precheck-covering.log | tr -s ' '"
k K14 bash -c "sed 's/\x1b\[[0-9;]*m//g' $B/precheck-full.log | grep -E 'Test Files|Tests ' | tr -s ' ' | tr '\n' ' '; tail -1 $B/precheck-full.log"
k K15 bash -c "grep -c ' OK ' $B/mutant-logs/summary.txt; tail -1 $B/mutant-logs/summary.txt"
k K16 bash -c "tail -1 $B/probe/compare-sketch.txt; python3 -I -c \"import json;d={(r['state'],r['vp']):r for r in json.load(open('$B/probe/head/head-cart.json'))};print('head OWNED-1 375 col', d[('OWNED-1','375x812')]['col']['h'], 'ANON-1 375', d[('ANON-1','375x812')]['col']['h'], 'ANON-1 390', d[('ANON-1','390x844')]['col']['h'])\""
k K17 python3 -I -c "import json;print(json.load(open('$L/regression-last.json'))['date'])"
k K18 bash -c "ls '$S/docs/implementation/2026/quarter-IV' | grep -E '^32[0-9]-' | tr '\n' ' '"
k K19 bash -c "grep -c 'cart.tsx\|recordings\|StudioShowcase' $L/b-round-318/protected-sha256.txt"
k K20 bash -c "python3 -I -c \"import json;a=json.load(open('$B/probe/head/head-empty.json'));b=json.load(open('$B/probe/sketch/sketch-empty.json'));print('empty-equal', a==b)\""
k K21 bash -c "python3 -I -c \"import json;r=json.load(open('$B/probe/head/head-actions.json'));s=json.load(open('$B/probe/sketch/sketch-actions.json'));print('head', [(x['vp'],x['signedIn'],x['removeClicked'],x['checkoutPosts'],x['signinModal']) for x in r]);print('sketch', [(x['vp'],x['signedIn'],x['removeClicked'],x['dialogClosed'],x['checkoutPosts'],x['signinModal']) for x in s])\""
k K22 bash -c "grep -E 'rc |error' $B/precheck-build-sketch.log | tail -2"
k K23 bash -c "grep -c 'Found 179 warnings' $B/precheck-lint.log; grep -E 'Found [0-9]+ warning' $B/precheck-biome.log"
k K24 bash -c "python3 -I -c \"import json
for n in ('head','sketch'):
  d=json.load(open('$B/probe/'+n+'/'+n+'-wheel.json'));print(n,'afterWheel.inView false at',[r['state']+'@'+r['vp'] for r in d if not r['afterWheel']['inView']])\""
k K25 bash -c "python3 -I -c \"import json
for n in ('head','sketch'):
  d=json.load(open('$B/probe/'+n+'/'+n+'-items-wheel.json'));print(n,[(r['vp'],r['st'],r['lastVisible'],r['col']['lenisPrevent']) for r in d])\""
k K26 bash -c "grep -o '\"lenis\": \"[^\"]*\"' '$S/package.json'; grep -c 'allowNestedScroll' '$S/app/hooks/useSmoothScroll.ts'"
k K27 bash -c "grep -c 'data-lenis-prevent' '$S/app/components/ui/Modal.tsx'; grep -n 'sticky top-24' '$S/app/routes/cart.tsx' | cut -c1-60"
k K28 bash -c "python3 -I -c \"import json
for n in ('head','sketch'):
  d=json.load(open('$B/probe/'+n+'/'+n+'-below-lg.json'));print(n,[(r['vp'],r['input'],r['col']['ovY'],r['col']['h'],r['scrollY']) for r in d])\""
k K29 bash -c "grep -c 'data-lenis-prevent-wheel' '$S/node_modules/lenis/dist/lenis.mjs'; sed -n '627,629p' '$S/node_modules/lenis/dist/lenis.mjs' | grep -c 'data-lenis-prevent'"
k K30 bash -c "grep -n -A2 '^.styled-scrollbar {' '$S/app/styles/base/utilities.css' | grep -c 'overscroll-behavior-y: contain'"
k K31 bash -c "grep -l 'routes/cart.tsx' '$S/app/lib/__tests__/store-focus-ring.test.ts' '$S/app/lib/__tests__/store-theme-tokens.test.ts' | wc -l"
k K32 bash -c "f='$S/docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md'; if [ -f \"\$f\" ]; then sed -n 4p \"\$f\"; else echo 'absent (planning tree)'; fi"
k K33 bash -c "cd $L && python3 -I tools/l58-check.py current-task.md | tail -2 | tr '\n' ' '"
k K34 bash -c "cd $B/mutant-logs && for f in mutant-M*.log; do id=\${f#mutant-}; id=\${id%.log}; r=\$(grep -oE '(×|✗) .*CML[0-9]' \$f | grep -oE 'CML[0-9]' | sort -u | tr '\n' ','); echo -n \"\$id:\$r \"; done; echo"
k K35 bash -c "python3 -I -c \"import json
for n in ('head','sketch'):
  d=json.load(open('$B/probe/'+n+'/'+n+'-c7.json'));s={x['step']:x for x in d['steps']};print(n,s['titles-visible-on-the-way-down']['seen'],s['remove-cancel']['removeSeen'],s['checkout']['signIn'],len(d['errors']))\""
k K36 bash -c "git -C '$G' ls-files | wc -l; wc -l < $B/r502-tree-sha256.txt"
