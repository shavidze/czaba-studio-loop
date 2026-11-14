#!/usr/bin/env bash
# Round 512 claims (B round 511 -> 512 planning). Run: bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-511/claims-512.sh
# Each block prints its tag and output. C compares with b-round-511/claims-512-planning-output.txt.
L=/home/runner/czaba-project/tmp/studio-real-loop
S=/home/runner/czaba-project/store
B=$L/b-round-511
D=docs/design/DESIGN_SYSTEM.md
U=docs/technical/components/ui-components.md
K=docs/design/components/button.md
I=docs/implementation/2026/quarter-IV/330-dpg-nonbrand-stage-n2-purchase-card.md
cd "$S" || exit 1
echo "== K1 HEAD"; git rev-parse HEAD
echo "== K2 changed paths"; git status --short --untracked-files=all
echo "== K3 gates 509-511"; python3 -I -c "import json;[print(n, json.load(open('$L/gates/gate-round-%d.json'%n)).get('status'), json.load(open('$L/gates/gate-round-%d.json'%n)).get('reason','')) for n in (509,510,511)]"
echo "== K4 c-round-511"; python3 -I -c "import json;d=json.load(open('$L/c-round-511.json'));print(d['taskStatus'],d['browserVerified'],d['realVerified'],[(b['id'],b['severity'],b['origin']) for b in d['bugs']],len(d['passed']))"
echo "== K5 round-511 code/test files unchanged since C 511 (pin) and equal to A's diff.patch"; sha256sum -c --quiet $B/r512-a511-pin-sha.txt && echo "a511 pin rc 0"; diff <(git diff f5d1b9e -- app | grep -v '^index ') <(grep -v '^index ' $L/a-round-511/diff.patch | awk '/^diff --git a\/docs/{s=1} /^diff --git a\/app/{s=0} !s') >/dev/null && echo "app diff == a-round-511/diff.patch app part"
echo "== K6 stale button lines (DESIGN_SYSTEM + ui-components)"; grep -nE 'Primary - Revenue actions|variant="primary" size="lg">Add to Cart|<PrimaryButton>Buy Now|Primary Button \(Revenue Actions\)|"ეს action რევენიუ მოაქვს\?"|checkout buttons \|' $D; grep -nE 'Primary \(Revenue Actions\)|<Button variant="primary">Add to Cart|PrimaryButton( size="lg")?>Buy Now|13D9CC|f9a91f|Use for: Add to Cart' $U; grep -nE 'Add to Cart, Submit, Revenue actions|ring-2 ring-brand ring-offset-2|"იტვირთება\.\.\."|variant\?: "primary" \| "secondary" \| "ghost" \| "accent";|variant="primary" size="md">Add to Cart' $K; grep -c 'Buy Button (Direct Purchase)' $D
echo "== K7 inventory: buy sites and primary revenue sites (non-test app)"; grep -rn 'variant="buy"' app --include=*.tsx | grep -v __tests__; grep -n "Proceed to Checkout\|'Get it free'\|<span>Unlock Premium</span>\|<span>Upgrade to Premium</span>" app/routes/cart.tsx app/components/product/ProductSidebar.tsx app/components/product/PurchaseHeader.tsx; grep -n 'variant="primary"' app/components/product/ProductSidebar.tsx
echo "== K8 Button variants and props"; grep -nE "^export type ButtonVariant|^export type ButtonShape|'bg-buy text-brand-foreground'|'hover:bg-buy-hover'|font-semibold \\$\{shapeStyles" app/components/ui/Button.tsx
echo "== K9 colour tokens"; grep -nE -- '--color-(buy|brand|accent): ' app/styles/app.css | head -3
echo "== K10 tests/scripts that read the granted docs (expect none)"; grep -rlnE "DESIGN_SYSTEM\.md|ui-components\.md|330-dpg" app e2e perf scripts --include=*.ts --include=*.tsx --include=*.mjs --include=*.js 2>/dev/null | grep -E "test|spec|scripts/" || echo none
echo "== K11 frozen pins"; sha256sum -c --quiet $B/r512-tree-sha256.txt && echo "tree rc 0 ($(wc -l < $B/r512-tree-sha256.txt) entries)"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt && echo "protected rc 0"; sha256sum -c --quiet $B/r512-pre-sha.txt && echo "pre-sha rc 0"
echo "== K12 sketch sha and post-sketch pins of the scratch"; sha256sum $B/sketch-512-docs.patch.txt | cut -c1-64; (cd $B/scratch && sha256sum -c --quiet $B/r512-post-sketch-sha.txt && echo "scratch == post-sketch pin rc 0")
echo "== K13 Added-pulse probe on the round-511 tree"; python3 -I -c "
import json
for r in json.load(open('$B/probe/run/b-added.json')): print(r['vp'],r['motion'],r['labels'],r['addedMaxScale'],r['addedRadius'],r['final']['text'],r['final']['radius'],r['posts'],len(r['errors']))"
echo "== K14 lessons cited"; grep -cE '^(10|28|34|5|1)\. ' $L/lessons.md
echo "== K15 other docs with Buy Now as primary (outside the grants)"; grep -rnE 'PrimaryButton[^>]*>Buy Now|variant="primary"[^>]*>(Add to Cart|Buy Now)' .claude docs --include=*.md | grep -vE "^($D|$U|$K):" || echo none
echo "== K17 stale strings left in the sketch scratch (expect only the count lines)"; (cd $B/scratch && grep -cE 'Revenue|<PrimaryButton>Buy Now|PrimaryButton size="lg">Buy Now|variant="primary"( size="(md|lg)")?>Add to Cart|13D9CC|f9a91f|ring-2 ring-brand ring-offset-2|"ეს action რევენიუ' $D $K $U)
echo "== K16 artifacts"; for f in $B/sketch-review.md $B/doc-ledger.md $B/docs-grep-buttons.txt $B/inventory-revenue-variants.txt $B/sketch-512-docs.patch.txt $B/edit-docs-512.py $B/r512-tree-sha256.txt $B/r512-a511-pin-sha.txt $B/r512-pre-sha.txt $B/r512-post-sketch-sha.txt $B/probe/n2-added.mjs $B/probe/run/b-added.json $B/inventory-revenue.txt $B/frozen-511-tree.txt $L/b-round-510/probe/n2-states.mjs $L/c-round-511/prot.mjs $L/c-round-511/extra.mjs $B/dryrun-512.txt; do test -f $f && echo "ok $(basename $f)" || echo "MISSING $f"; done
