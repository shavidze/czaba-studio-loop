import subprocess, hashlib, re, sys
U='app/lib/product-utils.ts'; H='app/components/product/PurchaseHeader.tsx'; S='app/components/product/ProductSidebar.tsx'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
M={
 'M1':(U,"return candidates.find(isValidCatalogPrice);","return candidates.find(isValidCatalogPrice) ?? 0;"),
 'M2':(H,"  const handleBuyNow = async () => {\n    if (price === undefined) return;\n","  const handleBuyNow = async () => {\n"),
 'M2b':(H,"  const handleAddToCart = async () => {\n    if (price === undefined) return;\n","  const handleAddToCart = async () => {\n"),
 'M3':(H,"aria-disabled={isPriceUnknown || undefined}","disabled={isDisabled || isPriceUnknown}"),
 'M4':(S,"const isFree = resolveCatalogPrice(product) === 0;","const isFree = (product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0) === 0;"),
 'M5':(U,"  if (version && version.id !== -1) {","  if (false) {"),
}
out=[]
for name,(f,a,b) in M.items():
  orig=open(f).read(); h0=sha(f)
  assert orig.count(a)==1,(name,orig.count(a))
  src=orig.replace(a,b)
  if name=='M3':  # also CartButton
    src=src.replace("aria-disabled={isPurchaseBlocked || undefined}","disabled={isPurchaseBlocked || (isDisabled && !alreadyInCart)}")
    src=src.replace("      disabled={isDisabled && !alreadyInCart}\n      disabled=","      disabled=")
    src=src.replace("            disabled={isDisabled}\n            disabled=","            disabled=")
  open(f,'w').write(src)
  try:
    r=subprocess.run(['npx','vitest','run','app/lib/__tests__/product-utils.test.ts','app/lib/__tests__/product-price-unavailable.test.tsx'],capture_output=True,text=True)
    txt=r.stdout+r.stderr
    red=sorted(set(re.findall(r'(?:FAIL|×).*?\b(P[RU]\d)\b',txt)))
  finally:
    open(f,'w').write(orig)
  assert sha(f)==h0
  out.append(f"{name}: rc={r.returncode} red={red} restored_sha_ok=True")
  print(out[-1],flush=True)
