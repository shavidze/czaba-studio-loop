#!/usr/bin/env bash
# Round 486 claims (B planning 2026-11-13). ROOT=<store copy> LOOP=<loop root> may be overridden.
S=${ROOT:-/home/runner/czaba-project/store}
LP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
B=$LP/b-round-485
F=app/routes/account.orders.tsx
T=app/lib/__tests__/account-orders-card.test.tsx
cd "$S" || exit 2
echo "K1 HEAD $(git rev-parse --short HEAD 2>/dev/null)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
git status --short --untracked-files=all | sed 's/^/K2   /'
echo "K3 frozen-manifest-rc $(sha256sum -c --quiet $B/r486-tree-sha256.txt >/dev/null 2>&1; echo $?) entries $(wc -l < $B/r486-tree-sha256.txt)"
sha256sum -c --quiet $B/r486-tree-sha256.txt 2>/dev/null | sed 's/^/K3   /'
echo "K4 protected-rc $(sha256sum -c --quiet $LP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K5 div-onClick-toggle $(grep -c 'onClick={() => setIsExpanded(!isExpanded)}' $F) button-tags $(grep -c '<button' $F) aria-expanded $(grep -c 'aria-expanded={isExpanded}' $F) hidden-panel $(grep -c 'hidden={!isExpanded}' $F) useId $(grep -c 'useId()' $F) focus-offset-inset $(grep -c '\[--focus-offset:-2px\]' $F)"
echo "K6 biome-lint-diagnostics $F: $(npx biome check "$F" 2>&1 | grep -oE 'lint/[a-zA-Z0-9/]+' | sort | tr '\n' ' ')"
echo "K7 app.css focus-rule $(grep -c 'outline-offset: var(--focus-offset, 2px);' app/styles/app.css) pointer-suppress $(grep -c 'html\[data-focus-source="pointer"\] :focus-visible {' app/styles/app.css) button-active-scale $(grep -c '^button:active:not(:disabled):not(\[aria-disabled="true"\]),' app/styles/app.css) button-cursor $(grep -c '^button { cursor:pointer }' app/styles/app.css)"
echo "K8 SWEEP order-card pins in test roots (app/**/__tests__, perf, e2e): $(grep -rnE 'Order #|account\.orders|cursor-pointer hover:bg-surface/50|OrderCard' app perf e2e --include=*.ts --include=*.tsx --include=*.mjs 2>/dev/null | grep -E '__tests__|perf/|e2e/' | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';')"
echo "K9 SWEEP speakers $(grep -rnE 'role="alert"|aria-live=' app/components app/routes --include=*.tsx | grep -v __tests__ | wc -l) in-orders $(grep -cE 'role="alert"|aria-live=' $F)"
echo "K10 precedent ProductAccordion h2>button $(grep -c '<h2>' app/components/product/ProductAccordion.tsx) aria-controls $(grep -c 'aria-controls=' app/components/product/ProductAccordion.tsx)"
echo "K11 RequireAuth sign-in-required $(grep -c 'Sign in required' app/components/auth/RequireAuth.tsx) orders-token-guard $(grep -c 'if (!user?.accessToken)' $F) orders-endpoint $(grep -c '/api/orders/my?page=' app/services/api/client.ts) page-size-50 $(grep -c 'getMyOrders(1, 50)' $F)"
echo "K12 doc-314 $(ls docs/implementation/2026/quarter-IV | grep -c '^314-') test-file $(test -f $T && echo 1 || echo 0)"
for a in current-task-before-486.md sketch-486.patch.txt sketch-486.sha256 sketch-486/$F sketch-486/$T head-account.orders.tsx sketch-covering.log sketch-tsc.log precheck-full.log mutants.py mutants/mutants-summary.txt sketch-review.md probe/order-card-probe.mjs probe/axname.mjs probe/pxdiff.mjs probe/head.json probe/sketch.json probe/ax-head.json probe/ax-sketch.json probe/pxdiff.txt probe/compare.py probe/extra-486.mjs probe/x-head.json probe/x-sketch.json probe/x-mutant-v1.json probe/x-mutant-select-only.json sketch-486-v1.patch.txt sketch-486-v1.sha256 mouse-only-sweep.txt r486-tree-sha256.txt checkpoint.md claims-486-planning-output.txt claims-486-sketch-output.txt claims-486-sketch-delta.txt; do echo "K13 $a $(test -f $B/$a && echo exists || echo MISSING)"; done
for m in M0-HEAD-FILE M1-NO-ARIA-EXPANDED M2-NO-HIDDEN M3-WRONG-CONTROLS M4-CONST-PANEL-ID M5-REMOUNT-TOGGLE M6-NO-TYPE M7-NO-HEADING M8-PANEL-INSIDE-BUTTON; do echo "K13m $m $(grep "^$m " $B/mutants/mutants-summary.txt | sed 's/^[^ ]* //')"; done
echo "K14 sketch-sha $(sha256sum $B/sketch-486.patch.txt | cut -c1-64) pinned $(cut -c1-64 $B/sketch-486.sha256)"
echo "K15 sketch-files-equal-store $(cd $B/sketch-486 && for f in $(find . -type f | sort); do cmp -s "$f" "$S/$f" && echo "$f"; done | wc -l) of $(cd $B/sketch-486 && find . -type f | wc -l)"
echo "K16 archive-485 $(cmp -s $LP/tasks/round-485.md $B/current-task-before-486.md && echo equal || echo DIFF)"
echo "K17 $(cd $LP && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K18 ids:"; (cd $LP && python3 -I tools/find-ids.py . B-R480-ORDER-CARD-KEYBOARD GATE479-M1-ROUTE-ANNOUNCE B-R485-STUDIO-PRODUCT-TITLE A-R485-REVIEW-L1-TARGET-CASE GATE485-L1-H1-EXIT-WRAPPER) | sed 's/^/K18   /'
echo "K19 regression-last $(python3 -c "import json;d=json.load(open('$LP/regression-last.json'));print(d['date'],d['round'])")"
echo "K20 ports 5173:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/studio-lab) 5199:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5199/api/products 2>/dev/null)"
echo "K22 account-layout-profile-name-p-onClick $(grep -c 'onClick={handleNameClick}' app/routes/account.tsx) click-to-add-name $(grep -c 'Click to add name' app/routes/account.tsx)"
echo "K23 important-utility-precedent $(grep -rlE '[a-z]\]?!' app/components/arrangement --include=*.tsx | xargs grep -lE 'transition-\[[^]]*\]!' 2>/dev/null | wc -l) sketch-classes $(grep -c 'select-text text-left p-4 md:p-6 hover:bg-surface/50 active:transform-none!' $F)"
echo "K21 gate-485 $(python3 -c "import json;d=json.load(open('$LP/gates/gate-round-485.json'));print(d['status'],d['commit'][:7])")"
