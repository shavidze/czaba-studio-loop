import json,subprocess,sys,re,shutil
S='/tmp/b445-scratch/store'; H=S+'/app/hooks/useLeadMagnet.ts'; OUT=sys.argv[1]
base=open(H).read()
head=subprocess.run(['git','show','HEAD:app/hooks/useLeadMagnet.ts'],cwd=S,capture_output=True,text=True).stdout
MUT={
 'M0-HEAD-HOOK': None,
 'M1-NO-ROUTE-DEP': ("  }, [isLoggedIn, isExcludedRoute]);","  }, [isLoggedIn]);"),
 'M2-NO-EXCLUDED-RETURN': ("    if (isExcludedRoute) {\n      setShouldShow(false);\n      setCurrentStep('offer');\n      return;\n    }\n",""),
 'M3-CART-LOOSE-PREFIX': ("    pathname === '/cart' ||\n    pathname.startsWith('/cart/') ||","    pathname.startsWith('/cart') ||"),
 'M4-NO-CHECKOUT': ("    pathname === '/checkout' ||\n    pathname.startsWith('/checkout/')\n","    false\n"),
 'M5-NO-STEP-RESET': ("      setCurrentStep('offer');\n",""),
 'M6-HIDE-DISMISSES': ("      setShouldShow(false);\n      setCurrentStep('offer');\n      return;","      setShouldShow(false);\n      setCurrentStep('offer');\n      setState({ ...getState(), dismissed: true });\n      return;"),
 'M7-NO-HIDE': ("    if (isExcludedRoute) {\n      setShouldShow(false);","    if (isExcludedRoute) {"),
 'M8-PRODUCTS-EXACT-TOO': ("    pathname.startsWith('/products/') ||","    pathname.startsWith('/products') ||"),
}
res=[]
for k,v in MUT.items():
    if v is None: src=head
    else:
        assert base.count(v[0])==1,k; src=base.replace(v[0],v[1])
    open(H,'w').write(src)
    p=subprocess.run(['npx','vitest','run','app/lib/__tests__/store-lead-magnet-routes.test.tsx'],cwd=S,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',p.stdout+p.stderr)
    open(f'/home/runner/czaba-project/tmp/studio-real-loop/b-round-445/mutants/mutant-{k}.log','w').write(out)
    failed=sorted(set(re.findall(r'FAIL .*?> (LMR\d+)',out)))
    res.append({'id':k,'rc':p.returncode,'failedRows':failed})
    print(k,p.returncode,failed)
open(H,'w').write(base)
with open(OUT,'w') as f:
    for r in res: f.write(json.dumps(r)+'\n')
