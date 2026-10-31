#!/usr/bin/env bash
# Round 287 claims block (L29). Run from store/ before editing. Output must equal b-round-286/claims-287-output.txt (K1 may read "(archive)").
set -u
echo "K1 HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo '(archive)')"
echo "K2 tree: $(git status --porcelain 2>/dev/null | wc -l) changed paths"
echo "K3 DisplayVersion.price type:"; grep -n "^  price: number;" app/lib/product-utils.ts
echo "K4 real-variant price + synthetic Standard chain + Premium guard:"; grep -n "          price: variant.price,\|price: product.standardPrice ?? product.minPrice ?? product.variants?.\[0\]?.price ?? 0,\|if (product.premiumPrice) {" app/lib/product-utils.ts
echo "K5 SFX without variants returns []:"; grep -n "if (mapProductType(product.category) === 'Sound Effects') return \[\];" app/lib/product-utils.ts
echo "K6 validity guard is module-private; resolvers exported:"; grep -n "function isValidCatalogPrice\|^export function resolveCatalogPrice\|^export function resolvePurchasePrice" app/lib/product-utils.ts
echo "K7 VersionSelector price renders + upgrade arithmetic:"; grep -n "return version.price - ownedVersionPrice;\|\${version.price}\|+\${upgradePrice}\|const upgradePrice = isUpgrade" app/components/product/VersionSelector.tsx
echo "K8 /store card chain:"; grep -n "price: \`\\\$\${product.standardPrice ?? product.minPrice ?? product.variants?.\[0\]?.price ?? 0}\`," app/routes/store.tsx
echo "K9 /store card render:"; grep -n "{pack.price}" app/routes/store.tsx
echo "K10 ProductCard API chain + free rule + render:"; grep -n "(product.standardPrice ?? product.minPrice ?? product.variants?.\[0\]?.price ?? 0)\|const isFree = priceAmount === 0;\|const price = isFree ? 'Complimentary'\|>{price}</span>" app/components/product/ProductCard.tsx
echo "K11 account.downloads ProductCard is a local component (protected file, out of scope):"; grep -n "^function ProductCard" app/routes/account.downloads.tsx
echo "K12 the PR5 assertion that changes:"; grep -n "expect(standard?.price).toBe(0);" app/lib/__tests__/product-utils.test.ts
echo "K13 frozen SFX test:"; grep -n "does not invent a purchasable SFX variant when none exists" app/lib/__tests__/product-utils.test.ts
echo "K14 test files that import createDisplayVersions/VersionSelector/ProductCard:"; grep -rlE "createDisplayVersions|VersionSelector|ProductCard" app --include=*.test.* | sort
echo "K15 last implementation doc:"; ls docs/implementation/2026/quarter-IV | tail -1
echo "K16 sha256 of the owned pre-existing files:"; sha256sum app/lib/product-utils.ts app/components/product/VersionSelector.tsx app/components/product/ProductCard.tsx app/routes/store.tsx app/lib/__tests__/product-utils.test.ts
