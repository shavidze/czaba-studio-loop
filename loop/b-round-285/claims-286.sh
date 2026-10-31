#!/usr/bin/env bash
# Round 286 claims block (L29). Run from store/ before editing. Output must equal b-round-285/claims-286-output.txt (K1 may read "(archive)").
set -u
echo "K1 HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo '(archive)')"
echo "K2 tree: $(git status --porcelain 2>/dev/null | wc -l) changed paths"
echo "K3 ProductDetailPage price fallback:"; grep -n "selectedVersion?.price ?? 0" app/components/product/ProductDetailPage.tsx
echo "K4 PurchaseHeader version name fallback:"; grep -n "selectedVersion?.name ?? 'Standard'" app/components/product/ProductDetailPage.tsx
echo "K5 SFX without variants returns []:"; grep -n "if (mapProductType(product.category) === 'Sound Effects') return \[\];" app/lib/product-utils.ts
echo "K6 synthetic Standard price chain:"; grep -n "price: product.standardPrice ?? product.minPrice ?? product.variants?.\[0\]?.price ?? 0," app/lib/product-utils.ts
echo "K7 PurchaseHeader price prop + default figure + isDisabled:"; grep -n "^  price: number;\|\${price.toFixed(2)}\|const isDisabled = " app/components/product/PurchaseHeader.tsx
echo "K8 PurchaseHeader consumers:"; grep -rln "PurchaseHeader" app --include=*.tsx | sort
echo "K9 Sidebar free rule:"; grep -n "const isFree = standardPrice === 0;\|Complimentary Download" app/components/product/ProductSidebar.tsx
echo "K10 frozen SFX test:"; grep -n "does not invent a purchasable SFX variant when none exists" app/lib/__tests__/product-utils.test.ts
echo "K11 support route:"; ls app/routes/support.tsx
echo "K12 existing PurchaseHeader tests (none expected):"; grep -rln "PurchaseHeader" app --include=*.test.* | wc -l
echo "K13 next free implementation doc number:"; ls docs/implementation/2026/quarter-IV | tail -1
echo "K14 sha256 of the five owned files:"; sha256sum app/lib/product-utils.ts app/components/product/ProductDetailPage.tsx app/components/product/PurchaseHeader.tsx app/components/product/ProductSidebar.tsx app/lib/__tests__/product-utils.test.ts
