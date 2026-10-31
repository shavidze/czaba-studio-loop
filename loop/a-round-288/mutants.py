import subprocess, hashlib, shutil, re, json, sys
PU='app/lib/product-utils.ts'; VS='app/components/product/VersionSelector.tsx'; PC='app/components/product/ProductCard.tsx'
M={
'N1':[(PU,"      price: resolveCatalogPrice(product),\n","      price: product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0,\n")],
'N2':[(VS,"""{version.price === undefined ? (
                    <span className="text-sm font-light text-muted">Price unavailable</span>
                  ) : isUpgrade && upgradePrice !== undefined ? (""","{isUpgrade ? ("),(VS,"${version.price}","${version.price ?? 0}")],
'N3':[(PU,"price === undefined ? 'Price unavailable' :","price === undefined ? '$0' :")],
'N4':[(PC,"const isFree = priceAmount === 0;","const isFree = (priceAmount ?? 0) === 0;")],
'N5':[(PU,"price: isValidCatalogPrice(variant.price) ? variant.price : undefined,","price: variant.price,")],
'N6':[(VS,"""    if (version.price === undefined) return undefined;
    return version.price - ownedVersionPrice;""","    return (version.price ?? 0) - ownedVersionPrice;"),
      (VS,"{version.price === undefined ? (","{!isUpgrade && version.price === undefined ? ("),
      (VS,": isUpgrade && upgradePrice !== undefined ? (",": isUpgrade ? (")],
}
M['X1']=[(VS,"{version.price === undefined ? (","{!version.price ? (")]
M['X2']=[('app/routes/store.tsx',"isPriceUnknown: catalogPrice === undefined,","isPriceUnknown: !catalogPrice,")]
M['X3']=[(PC,"const isPriceUnknown = priceAmount === undefined;","const isPriceUnknown = !priceAmount;")]
M['N7']=[('app/routes/store.tsx',"'text-sm leading-8 font-light text-muted'","'text-sm font-light text-muted'")]
M['N8']=[(PC,"'text-sm leading-7 font-light text-muted'","'text-sm font-light text-muted'")]
M['N9']=[(PU,"price: isValidCatalogPrice(product.premiumPrice) ? product.premiumPrice : undefined,","price: product.premiumPrice,")]
M['N10']=[(PU,"  if (product.premiumPrice) {","  if (isValidCatalogPrice(product.premiumPrice)) {")]
for k in ('X1','X2','X3'): M.pop(k)
TESTS=['app/lib/__tests__/product-utils.test.ts','app/lib/__tests__/product-price-cards.test.tsx']
sha=lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest()
out={}
for name,edits in M.items():
    files=sorted({f for f,_,_ in edits}); before={f:sha(f) for f in files}
    for f in files: shutil.copy(f,'/tmp/r288mut/'+f.replace('/','_'))
    for f,a,b in edits:
        s=open(f).read(); n=s.count(a)
        assert n>=1,(name,a)
        s=s.replace(a,b); open(f,'w').write(s)
    r=subprocess.run(['npx','vitest','run','--reporter=json']+TESTS,capture_output=True,text=True)
    j=json.loads(r.stdout[r.stdout.index('{'):])
    red=[re.match(r'(\w+\d+)',t['title']).group(1) if re.match(r'[A-Z]+\d+:',t['title']) else t['title'] for tr in j['testResults'] for t in tr['assertionResults'] if t['status']!='passed']
    for f in files: shutil.copy('/tmp/r288mut/'+f.replace('/','_'),f)
    ok=all(sha(f)==before[f] for f in files)
    out[name]={'red':red,'restored_sha_ok':ok}
    print(name,red,'restored' if ok else 'SHA MISMATCH',flush=True)
json.dump(out,open('/tmp/r288mut/result.json','w'),indent=1)
