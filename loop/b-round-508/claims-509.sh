#!/usr/bin/env bash
# B round 508 -> 509 claims. usage: bash claims-509.sh [store-tree]   (default: the store repo)
T=${1:-/home/runner/czaba-project/store}; L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-508
cd "$T" || exit 2
c(){ echo "[$1] $2"; }
c K1 "store HEAD $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
c K2 "changed paths: $(git status --short --untracked-files=all 2>/dev/null | wc -l)"
c K3 "gate 508: $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-508.json'));print(g['status'],g['commit'][:7])")"
c K4 "c-round-508: $(python3 -I -c "import json;c=json.load(open('$L/c-round-508.json'));print(c['taskStatus'],c['browserVerified'],c['realVerified'],len(c['bugs']))")"
c K5 "free stub probe: $(python3 -I -c "import json;d=json.load(open('$B/probe/free-stub.json'));print([(w,d[w]['count'],d[w]['info']['tag'],d[w]['info']['href'],d[w]['info']['urlAfterClick']==d[w]['info']['urlBefore'],d[w]['info']['dialog'],len(d[w]['errs'])) for w in sorted(d)])")"
c K6 "HEAD focus probe: $(python3 -I -c "import json;d=json.load(open('$B/probe/focus-head.json'));print([(w,d[w]['dialogs'],d[w]['emailField'],d[w]['modalClose'],d[w]['active']['name'],d[w]['active']['fv']) for w in sorted(d)])")"
c K7 "HEAD covering: $(grep -aoE 'Test Files .*|Tests .*' $B/head-covering.log | sed 's/\x1b\[[0-9;]*m//g' | tr '\n' ' ')"
c K8 "scratch full: $(grep -aE 'Test Files' $B/scratch-full.log | sed 's/\x1b\[[0-9;]*m//g') | failed: $(grep -a ' FAIL ' $B/scratch-full.log | sed 's/\x1b\[[0-9;]*m//g' | grep -o 'PU[0-9]*' | sort -u | tr '\n' ' ')"
c K9 "nonbrand HEAD: $(python3 -I -c "import json;d=json.load(open('$B/nonbrand-head-509.json'));print(len(d),[h['file']+':'+str(h['line']) for h in d if 'ProductSidebar' in h['file']])")"
c K10 "ProductSidebar dead button at HEAD (git show cf89736): $(git show cf89736:app/components/product/ProductSidebar.tsx | grep -c 'Complimentary Download') label, $(git show cf89736:app/components/product/ProductSidebar.tsx | grep -c 'resolveCatalogPrice(product) === 0') catalogue-price rule"
c K11 "grants: $(wc -l < $B/grants-509.txt) paths; tree pins $(wc -l < $B/r509-tree-sha256.txt)"
c K12 "PurchaseHeader at HEAD: sign-in text $(git show cf89736:app/components/product/PurchaseHeader.tsx | grep -c "Please sign in to continue with your purchase"), sellable list $(git show cf89736:app/components/product/PurchaseHeader.tsx | grep -c "\['standard', 'premium', 'universal'\]"), isAddingToCart in isDisabled $(git show cf89736:app/components/product/PurchaseHeader.tsx | grep -c 'const isDisabled = isAddingToCart')"
c K13 "hooks barrel: $(grep -c '^export' app/hooks/index.ts) exports; hook files $(ls app/hooks/*.ts | grep -vc index.ts)"
c K14 "artifacts: $(for f in probe/free-stub.cjs probe/free-stub.json probe/free-1440.png probe/free-1280.png probe/focus-head.cjs probe/focus-head.json head-covering.log covering-files-head.txt scratch-full.log nonbrand-head-509.json r509-tree-sha256.txt r509-pre-sha.txt grants-509.txt consult-product-designer.md; do test -s $B/$f && echo -n "ok " || echo -n "MISSING:$f "; done)"
