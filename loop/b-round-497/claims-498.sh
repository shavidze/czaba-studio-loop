#!/usr/bin/env bash
# usage: bash claims-498.sh [store-tree]   (default /home/runner/czaba-project/store). Run from anywhere.
S="${1:-/home/runner/czaba-project/store}"; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-497
cd "$S" || exit 2
echo "K1 store HEAD $(git -C /home/runner/czaba-project/store rev-parse --short HEAD 2>/dev/null)"
echo "K2 cancel primary literal: $(grep -c 'px-6 py-3 bg-brand text-background font-semibold rounded-md hover:bg-brand-hover transition-all' app/routes/checkout.cancel.tsx)"
echo "K3 cancel+success ghost literals: $(grep -c 'bg-transparent text-muted font-semibold rounded-' app/routes/checkout.cancel.tsx) $(grep -c 'bg-transparent text-muted font-semibold rounded-' app/routes/checkout.success.tsx)"
echo "K4 success primary literal: $(grep -c 'px-6 py-3 bg-brand text-background font-semibold rounded-lg hover:bg-brand-hover transition-all' app/routes/checkout.success.tsx)"
echo "K5 faq Contact Us literal + releaseLinkFocus onClick: $(grep -c 'inline-block px-8 py-3 bg-brand text-background' app/routes/faq.tsx) $(grep -c 'onClick={releaseLinkFocus}' app/routes/faq.tsx)"
echo "K6 orders literal + plain anchor: $(grep -c 'inline-block px-6 py-3 bg-brand text-brand-foreground font-medium' app/routes/account.orders.tsx) $(grep -c 'href="/store"' app/routes/account.orders.tsx)"
echo "K7 builder calls in the 4 files: $(cat app/routes/checkout.cancel.tsx app/routes/checkout.success.tsx app/routes/faq.tsx app/routes/account.orders.tsx | grep -c 'buildButtonClassName(')"
echo "K8 success reveal timer: $(grep -c 'setTimeout(() => setShowContent(true), 800)' app/routes/checkout.success.tsx)"
echo "K9 ST5 old orders block ('inline-block' token pin): $(grep -c "      'inline-block'," app/lib/__tests__/store-theme-tokens.test.ts)"
echo "K10 SWEEP accessible names (app/**/__tests__, perf/**, e2e/**):"
grep -rlE "Return to Cart|Continue Shopping|Access Your Downloads|Discover More|Contact Us|Browse Music|checkout\.cancel|checkout\.success|routes/faq|account\.orders" app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/|\.spec\.' | sort | sed 's/^/  /'
echo "K11 scanner (any/solid): $(python3 -I $B/scan-brand.py . /tmp/claims-498-scan.json)"
echo "K12 doc 319 present / doc 320 present: $(ls docs/implementation/2026/quarter-IV/319-* 2>/dev/null | wc -l) $(ls docs/implementation/2026/quarter-IV/320-* 2>/dev/null | wc -l)"
echo "K13 DESIGN_SYSTEM ghost text-link line / PD-R498 marker / old pill row / new pill row: $(grep -c 'ღილაკი კი არა, მშვიდი text link-ია' docs/design/DESIGN_SYSTEM.md) $(grep -c 'PD-R498-404-SECONDARY-ALIGN' docs/design/DESIGN_SYSTEM.md) $(grep -c 'Header Sign In, "Back to Home") |' docs/design/DESIGN_SYSTEM.md) $(grep -c 'orders "Browse Music") |' docs/design/DESIGN_SYSTEM.md) (lines: $(grep -n '| `pill` | `rounded-full` |' docs/design/DESIGN_SYSTEM.md | cut -d: -f1) $(grep -n '^\*\*Use for:\*\* Less important actions' docs/design/DESIGN_SYSTEM.md | cut -d: -f1))"
echo "K14 artifacts:"; for f in sketch-498-v3.patch.txt sketch-review.md sketch-sha.txt r498-tree-sha256.txt r498-pre-sha.txt r498-post-sketch-sha.txt mutants-498.sh mutants-498.txt m498-N11.log measure/nav-498.mjs measure/head-nav.json precheck-full.log precheck-covering.log precheck-tsc.log precheck-biome.log precheck-build-sketch.log covering-files.txt scan-brand.py scan-head.json scan-mutant.txt stage2-inventory.md consult-product-designer.md other-handrolled-count.txt measure/measure-498.mjs measure/head.json measure/sketch.json; do test -f $B/$f && echo "  ok $f" || echo "  MISSING $f"; done
echo "K15 gate 497 CSS bundle: $(grep -oE 'app-[A-Za-z0-9_-]+\.css' $L/gates/round-497/verify.log | sort -u | tr '\n' ' ')"
echo "K16 ids: "; (cd $L && python3 -I tools/find-ids.py . B-R496-404-BROWSE-STORE-UNSTYLED A-R496-CR-GS3-GUARD A-R496-CR-BC1-PIN DPG-BUTTON-CLEANUP-2 GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED B-R492-PASSWORD-SUBMIT-FOCUS-LOST | cut -d' ' -f1-2 | sed 's/^/  /')
echo "K17 l58: $(cd $L && python3 -I tools/l58-check.py current-task.md | tail -1)"
