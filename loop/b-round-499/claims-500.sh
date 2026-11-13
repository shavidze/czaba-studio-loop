#!/usr/bin/env bash
# usage: bash claims-500.sh [store-tree]   (default /home/runner/czaba-project/store = A's round-499 tree). Run from anywhere.
S="${1:-/home/runner/czaba-project/store}"; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-499
cd "$S" || exit 2
D321=docs/implementation/2026/quarter-IV/321-dpg-button-cleanup-stage-2b-1.md
echo "K1 store HEAD $(git -C /home/runner/czaba-project/store rev-parse --short HEAD 2>/dev/null)"
echo "K2 store worktree vs HEAD (modified/untracked): $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^ M') $(git -C /home/runner/czaba-project/store status --short --untracked-files=all | grep -c '^??')"
echo "K3 ErrorBoundary Try Again Button without / with type=button: $(grep -c '<Button size="lg" shape="pill" onClick={() => window.location.reload()}>' app/components/errors/ErrorBoundary.tsx) $(grep -c '<Button type="button" size="lg" shape="pill" onClick={() => window.location.reload()}>' app/components/errors/ErrorBoundary.tsx)"
echo "K4 store.tsx error Link line: $(grep -c "<Link to=\"/store\" className={buildButtonClassName({ size: 'lg', shape: 'pill' })}>" app/routes/store.tsx)"
echo "K5 store.tsx loader error value / role=alert blocks: $(grep -c "error: 'Failed to load products'" app/routes/store.tsx) $(grep -c 'role="alert"' app/routes/store.tsx)"
echo "K6 product-price-cards Link mock passes className / SE1 rows: $(grep -c 'Link: ({ children, to, className }' app/lib/__tests__/product-price-cards.test.tsx) $(grep -c "it('SE1:" app/lib/__tests__/product-price-cards.test.tsx)"
echo "K7 2b test isBefore( uses / reload pin / type asserts: $(grep -c 'isBefore(' app/lib/__tests__/store-button-cleanup-2b.test.tsx) $(grep -c "pins: \['onClick={() => window.location.reload()}'\]" app/lib/__tests__/store-button-cleanup-2b.test.tsx) $(grep -c "getAttribute('type')).toBe('button')" app/lib/__tests__/store-button-cleanup-2b.test.tsx)"
echo "K8 builder calls (EmptyState, ErrorBoundary, store): $(grep -c 'buildButtonClassName(' app/components/ui/EmptyState.tsx) $(grep -c 'buildButtonClassName(' app/components/errors/ErrorBoundary.tsx) $(grep -c 'buildButtonClassName(' app/routes/store.tsx)"
echo "K9 scanner (any/solid): $(python3 -I $L/b-round-497/scan-brand.py . /tmp/claims-500-scan.json)"
echo "K10 SWEEP accessible names and module paths (app/**/__tests__, perf/**, e2e/**):"
grep -rlE "Discover the Collection|Go to Downloads|Browse the store|Go Home|Try Again|Try again|could not be loaded|EmptyState|components/errors|RootErrorBoundary|RouteErrorBoundary|routes/store'" app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/|\.spec\.' | sort | sed 's/^/  /'
echo "K11 doc 321 l.4 / headings: $(sed -n 4p $D321) | $(grep -c '^## ' $D321)"
echo "K12 DESIGN_SYSTEM ambiguous / explicit rule phrase: $(grep -c 'PD-R498-404-SECONDARY-ALIGN). იგივე წესი ეხება' docs/design/DESIGN_SYSTEM.md) $(grep -c 'Store-ის CTA წყვილის წესი (`ghost` `lg` `pill`) ეხება' docs/design/DESIGN_SYSTEM.md)"
echo "K13 doc 320 l.4: $(sed -n 4p docs/implementation/2026/quarter-IV/320-dpg-button-cleanup-stage-2a.md)"
echo "K14 L31 timings at gate 498 (UT2 has describe timeout 30_000; BC1b file default 5 s):"
sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-498/verify.log | grep -E '✓ (UT2|BC1b):' | grep -oE '^ *✓ (UT2|BC1b)|[0-9]+ms$' | paste -sd' ' | sed 's/^/  /'
echo "  describe timeout: $(grep -c "describe('Store undefined tokens (DPG-P0-2)', { timeout: 30_000 }" app/lib/__tests__/store-undefined-tokens.test.ts) store-button-cleanup timeouts: $(grep -c 'timeout' app/lib/__tests__/store-button-cleanup.test.tsx)"
echo "K15 gate 499 status: $(python3 -I -c "import json;print(json.load(open('$L/gates/gate-round-499.json'))['status'])")"
echo "K16 c-round-499 L57: $(tail -1 $L/c-round-499/l57-check.txt)"
echo "K17 artifacts:"; for f in reload-spy-probe.txt doc321-tokens.txt pending-grep.txt claims-500-sketch-output.txt sketch-500.patch.txt sketch-sha.txt sketch-review.md r500-tree-sha256.txt r500-pre-sha.txt r500-post-sketch-sha.txt mutants-500.py mutants-500.txt mutants-500-failing-rows.txt mutants-499-on-500-tree.txt mutant-logs/mutant-N5b.log mutant-logs/mutant-N10.log mutant-logs/mutant-N13.log mutant-logs/mutant-N14.log mutant-logs/mutant-N16.log mutant-logs/mutant-N17.log mutant-logs/mutant-N18.log precheck-full.log precheck-covering.log precheck-tsc.log precheck-biome.log precheck-lint.log precheck-build-sketch.log covering-files.txt scan-sketch.txt builder-calls-sketch.txt doc-ledger.md ../b-round-498/measure/measure-499.mjs ../b-round-498/measure/nav-499.mjs ../b-round-498/measure/summary.txt ../b-round-498/measure/sketch/sketch-on.json ../b-round-498/measure/sketch/sketch-off.json ../b-round-498/measure/head/head-nav-on.json ../b-round-498/measure/head/head-nav-off.json ../b-round-498/mutants-499.sh ../b-round-498/mutants-499-failing-rows.txt ../b-round-498/probe/reach.mjs ../a-round-499.md ../c-round-499.json; do test -f $B/$f && echo "  ok $f" || echo "  MISSING $f"; done
echo "K18 ids: "; (cd $L && python3 -I tools/find-ids.py . A-R499-CR-STORE-TRY-UNPINNED A-R499-CR-PAIR-ORDER A-R499-CR-TRYAGAIN-TYPE A-R499-CR-DS-SAME-RULE A-R499-CR-DOC321-WORDING DPG-BUTTON-CLEANUP-2 B-R498-DOC320-L28 | cut -d' ' -f1-2 | sed 's/^/  /')
echo "K19 l58: $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
echo "K20 ErrorBoundary useRouteError uses / Link mock prop list: $(grep -c 'useRouteError' app/components/errors/ErrorBoundary.tsx) | $(grep -o 'Link: ({ [^}]* }' app/lib/__tests__/product-price-cards.test.tsx)"
echo "K21 doc 321 l.89 / l.103: $(sed -n 89p $D321) | $(sed -n 103p $D321 | cut -c1-60)"
echo "K22 frozen list sizes (r500 tree, protected): $(wc -l < $B/r500-tree-sha256.txt) $(wc -l < $L/b-round-318/protected-sha256.txt)"
echo "K23 doc 321 line numbers of the D1 bullet / coverage sentence: $(grep -n 'D1: ათივე' $D321 | cut -d: -f1) $(grep -n 'B2B-0 ამოწმებს' $D321 | cut -d: -f1)"
echo "K24 SE1 literal equals PRIMARY_LG_PILL: $(python3 -I -c "
import re,sys
a=open('app/lib/__tests__/product-price-cards.test.tsx').read(); b=open('app/lib/__tests__/store-button-cleanup-2b.test.tsx').read()
m=re.search(r\"STORE_ERROR_TRY_AGAIN_CLASS =\s*'([^']*)'\",a); n=re.search(r\"PRIMARY_LG_PILL =\s*'([^']*)'\",b)
print('absent' if not m else ('equal' if n and m.group(1)==n.group(1) else 'differ'))")"
