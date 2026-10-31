#!/usr/bin/env bash
# B round 287 -> 288 planning: claims for tasks round 288 (run from store/). Output must equal b-round-287/claims-288-output.txt.
set -u
echo "K1 HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo '(archive)')"
echo "K2 status:"; git status --short 2>/dev/null | sort || echo "(archive)"
echo "K2 sha256 of A's round-287 paths:"
sha256sum app/lib/product-utils.ts app/components/product/VersionSelector.tsx app/routes/store.tsx app/components/product/ProductCard.tsx app/lib/__tests__/product-utils.test.ts app/lib/__tests__/product-price-cards.test.tsx docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md
echo "K3 store.tsx unknown/known price span classes:"; grep -n "'text-sm font-light text-muted'\|'text-2xl font-bold text-foreground'\|pack.isPriceUnknown$" app/routes/store.tsx
echo "K4 ProductCard.tsx unknown/known price span classes:"; grep -n "'text-sm font-light text-muted'\|'text-lg font-bold text-foreground'\|^\s*isPriceUnknown$\|const isPriceUnknown" app/components/product/ProductCard.tsx
echo "K5 product-utils.ts synthetic Premium:"; grep -n "if (product.premiumPrice) {\|price: product.premiumPrice,\|function isValidCatalogPrice" app/lib/product-utils.ts
echo "K6 VersionSelector.tsx unknown span:"; grep -n 'Price unavailable' app/components/product/VersionSelector.tsx
echo "K7 class pins in product-price-cards.test.tsx:"; grep -n "text-sm font-light text-muted" app/lib/__tests__/product-price-cards.test.tsx
echo "K8 numeric leading-N tokens in app tsx:"; grep -rhoE "\bleading-[0-9]+\b" app --include=*.tsx | sort | uniq -c
echo "K8 spacing multiplier utilities in use (min-h-11 count):"; grep -rhoE "\bmin-h-11\b" app --include=*.tsx | wc -l
echo "K9 doc 215 line 4:"; sed -n 4p docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md
echo "K10 adapters consumers outside tests:"; grep -rln "createVariants\|adapters" app --include=*.ts --include=*.tsx | grep -v __tests__ | sort
echo "K11 last implementation docs:"; ls docs/implementation/2026/quarter-IV/ | sort | tail -2
echo "K12 premium tests:"; grep -n "premiumPrice: 99\|PR6:\|premiumPrice: 39.99" app/lib/__tests__/product-utils.test.ts app/lib/__tests__/product-price-cards.test.tsx
echo "K13 ProductDetailPage default selection (Standard unless ?upgrade=premium):"; grep -n "const shouldDefaultToPremium = upgradeParam === 'premium';\|displayVersions.find((v) => v.name.toLowerCase() === 'standard')" app/components/product/ProductDetailPage.tsx
echo "K14 real variants are mapped before the synthetic path (synthetic Standard/Premium only without variants, non-SFX):"; grep -n "if (product.variants && product.variants.length > 0) {\|if (mapProductType(product.category) === 'Sound Effects') return \[\];" app/lib/product-utils.ts
