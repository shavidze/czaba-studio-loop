# C round 286: own mutant runner on a scratch copy (arg 1 = tree). Live store tree is never touched.
import subprocess, hashlib, re, sys, os
os.chdir(sys.argv[1])
U='app/lib/product-utils.ts'; H='app/components/product/PurchaseHeader.tsx'; S='app/components/product/ProductSidebar.tsx'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
M=[
 ('M1',[(U,"return candidates.find(isValidCatalogPrice);","return candidates.find(isValidCatalogPrice) ?? 0;")]),
 ('M2',[(H,"  const handleBuyNow = async () => {\n    if (price === undefined) return;\n","  const handleBuyNow = async () => {\n")]),
 ('M2b',[(H,"  const handleAddToCart = async () => {\n    if (price === undefined) return;\n","  const handleAddToCart = async () => {\n")]),
 ('M3',[(H,"            disabled={isDisabled}\n            aria-disabled={isPriceUnknown || undefined}","            disabled={isDisabled || isPriceUnknown}"),
        (H,"      disabled={isDisabled && !alreadyInCart}\n      aria-disabled={isPurchaseBlocked || undefined}","      disabled={(isDisabled && !alreadyInCart) || isPurchaseBlocked}")]),
 ('M4',[(S,"const isFree = resolveCatalogPrice(product) === 0;","const isFree = (product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0) === 0;")]),
 ('M5',[(U,"  if (version && version.id !== -1) {\n    return isValidCatalogPrice(version.price) ? version.price : undefined;\n  }\n","")]),
]
for name,edits in M:
  origs={f:open(f).read() for f,_,_ in edits}; hs={f:sha(f) for f in origs}
  for f,a,b in edits:
    s=open(f).read(); assert s.count(a)==1,(name,f,s.count(a)); open(f,'w').write(s.replace(a,b))
  try:
    r=subprocess.run(['npx','vitest','run','app/lib/__tests__/product-utils.test.ts','app/lib/__tests__/product-price-unavailable.test.tsx'],capture_output=True,text=True)
    txt=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    red=sorted(set(re.findall(r'(?:FAIL|×)[^\n]*?\b(P[RU]\d):',txt)))
    tests=re.findall(r'Tests\s+([^\n]+)',txt)
  finally:
    for f,s in origs.items(): open(f,'w').write(s)
  assert all(sha(f)==h for f,h in hs.items())
  print(f"{name}: rc={r.returncode} red={red} tests={tests} restored_sha_ok=True",flush=True)
