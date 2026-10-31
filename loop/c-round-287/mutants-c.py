# C round 287: own mutants on scratch copy (argv[1]); live store never touched.
import subprocess, hashlib, re, json, sys, os
os.chdir(sys.argv[1])
PU='app/lib/product-utils.ts'; VS='app/components/product/VersionSelector.tsx'; PC='app/components/product/ProductCard.tsx'
UNK='{version.price === undefined ? ('
M=[
 ('N1',[(PU,"price: resolveCatalogPrice(product),","price: product.standardPrice ?? product.minPrice ?? product.variants?.[0]?.price ?? 0,")]),
 ('N2',[(VS,UNK,"{false ? ("),(VS,": isUpgrade && upgradePrice !== undefined ? (",": isUpgrade ? ("),(VS,"${version.price}","${version.price ?? 0}")]),
 ('N3',[(PU,"? 'Price unavailable' :","? '$0' :")]),
 ('N4',[(PC,"const isFree = priceAmount === 0;","const isFree = (priceAmount ?? 0) === 0;")]),
 ('N5',[(PU,"price: isValidCatalogPrice(variant.price) ? variant.price : undefined,","price: variant.price,")]),
 ('N6',[(VS,"if (version.price === undefined) return undefined;\n    return version.price - ownedVersionPrice;","return (version.price ?? 0) - ownedVersionPrice;"),
        (VS,UNK,"{version.price === undefined && !isUpgrade ? ("),(VS,": isUpgrade && upgradePrice !== undefined ? (",": isUpgrade ? (")]),
]
TESTS=[l.strip() for l in open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-286/covering-files.txt') if l.strip()]+['app/lib/__tests__/product-price-cards.test.tsx']
sha=lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest()
for name,edits in M:
  files=sorted({f for f,_,_ in edits}); orig={f:open(f).read() for f in files}; h={f:sha(f) for f in files}
  for f,a,b in edits:
    s=open(f).read(); n=s.count(a); assert n>=1,(name,f,a); open(f,'w').write(s.replace(a,b))
  try:
    r=subprocess.run(['npx','vitest','run','--reporter=json']+TESTS,capture_output=True,text=True)
    j=json.loads(r.stdout[r.stdout.index('{'):])
    red=sorted({(re.match(r'([A-Z]+\d+[a-z]?)\b',t['title']) or re.match(r'(.{0,50})',t['title'])).group(1) for tr in j['testResults'] for t in tr['assertionResults'] if t['status']!='passed'})
    tot=(j['numPassedTests'],j['numFailedTests'])
  finally:
    for f,s in orig.items(): open(f,'w').write(s)
  print(name,'rc',r.returncode,'pass/fail',tot,'red',red,'restored',all(sha(f)==h[f] for f in files),flush=True)
