#!/usr/bin/env bash
set -u
STORE=/home/runner/czaba-project/store
T=/home/runner/czaba-project/tmp/studio-real-loop/a-round-186/tools
M=$T/mutants
mkdir -p "$M"
SRC="$STORE/app/routes/products.\$handle.tsx"
mk() { local name=$1 expr=$2; cp "$SRC" "$M/$name.tsx"; sed -i "$expr" "$M/$name.tsx"; if cmp -s "$SRC" "$M/$name.tsx"; then echo "MUTANT $name NOT APPLIED"; fi; }
mk m-truthy-active 's/if (product.isActive === false) {/if (!product.isActive) {/'
mk m-api404-to-400 's/error.status === 404/error.status === 400/'
mk m-503-to-500 's/{ status: 503 }/{ status: 500 }/'
mk m-og-image-fallback 's|/og-image.jpg|/og-default.jpg|'
mk m-og-type 's/content: .product. }/content: "website" }/'
mk m-no-collapse "s/.replace(\/\\\\s+\/g, ' ')//"
mk m-no-word-cut 's/lastSpace > 0 ? lastSpace : cutLimit/cutLimit/'
mk m-first-space "s/collapsed.lastIndexOf(' ', cutLimit)/collapsed.indexOf(' ')/"
mk m-boundary-158 "s/lastIndexOf(' ', cutLimit)/lastIndexOf(' ', cutLimit - 1)/"
mk m-boundary-160 "s/lastIndexOf(' ', cutLimit)/lastIndexOf(' ', cutLimit + 1)/"
python3 - "$SRC" "$M/m-check-inside-try.tsx" <<'PY'
import sys
s=open(sys.argv[1]).read()
block="\n  if (product.isActive === false) {\n    throw new Response('Product not found', { status: 404 });\n  }\n"
assert block in s
s=s.replace(block,"\n")
s=s.replace("    product = await apiClient.getProductByHandle(handle);\n","    product = await apiClient.getProductByHandle(handle);\n    if (product.isActive === false) throw new Response('Product not found', { status: 404 });\n")
open(sys.argv[2],'w').write(s)
PY
cd "$STORE"
for f in "$M"/*.tsx; do
  echo "=== $(basename "$f")"
  ROUTE_UNDER_TEST="$f" npx vitest run --config "$T/vitest.start-copy.config.ts" 2>&1 | grep -E " FAIL .*> |Tests " | sed 's/\x1b\[[0-9;]*m//g'
done
echo "=== tree (no mutant)"
npx vitest run app/lib/__tests__/product-handle-route.test.tsx 2>&1 | grep -E "Tests " | sed 's/\x1b\[[0-9;]*m//g'
