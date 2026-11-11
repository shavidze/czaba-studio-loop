import json,subprocess,sys,re
# usage: run-mutants.py <tree> <out.jsonl> <log-dir>  (tree = a git checkout whose HEAD is 4bfebd7 with the sketch applied; logs go to <log-dir>)
import os
S=sys.argv[1]; OUT=sys.argv[2]; LOG=sys.argv[3]; os.makedirs(LOG, exist_ok=True)
H='app/hooks/useLeadMagnet.ts'; SL='app/hooks/useScrollLock.ts'; P='app/components/marketing/LeadMagnetPopup.tsx'
TESTS=['app/lib/__tests__/store-lead-magnet-routes.test.tsx','app/lib/__tests__/store-lead-magnet-dialog.test.tsx']
def rd(f): return open(f'{S}/{f}').read()
def head(f): return subprocess.run(['git','show','HEAD:'+f],cwd=S,capture_output=True,text=True).stdout
base={f:rd(f) for f in (H,SL,P)}
MUT={
 'M0-HEAD-SOURCES': {H:'HEAD',SL:'HEAD',P:'HEAD'},
 'M1-NO-ROUTE-DEP': {H:[("  }, [isLoggedIn, isExcludedRoute]);","  }, [isLoggedIn]);")]},
 'M2-NO-EXCLUDED-RETURN': {H:[("      setError(null);\n      return;\n    }\n","    }\n")]},
 'M3-CART-LOOSE-PREFIX': {H:[("    pathname === '/cart' ||\n    pathname.startsWith('/cart/') ||","    pathname.startsWith('/cart') ||")]},
 'M4-NO-CHECKOUT': {H:[("    pathname === '/checkout' ||\n    pathname.startsWith('/checkout/')\n","    false\n")]},
 'M5-NO-STEP-RESET': {H:[("      setCurrentStep('offer');\n","")]},
 'M6-HIDE-DISMISSES': {H:[("      setError(null);\n      return;","      setError(null);\n      setState({ ...getState(), dismissed: true });\n      return;")]},
 'M7-NO-HIDE': {H:[("    if (isExcludedRoute) {\n      setShouldShow(false);","    if (isExcludedRoute) {")]},
 'M8-PRODUCTS-EXACT-TOO': {H:[("    pathname.startsWith('/products/') ||","    pathname.startsWith('/products') ||")]},
 'M9-SAME-RENDER-MASK-REMOVED': {H:[("    shouldShow: shouldShow && !isExcludedRoute,","    shouldShow,")]},
 'M10-POPUP-NO-RESTORE-OPTION': {P:[("  useScrollLock(shouldShow, { restoreScrollOnUnlock: !isRouteExcluded });","  useScrollLock(shouldShow);")]},
 'M11-CLEANUP-IGNORES-OPTION': {SL:[("      document.body.style.paddingRight = '';\n      if (scrollY && restoreScrollOnUnlockRef.current) {","      document.body.style.paddingRight = '';\n      if (scrollY) {")]},
 'M12-OPTION-DEFAULT-FALSE': {SL:[("  restoreScrollOnUnlockRef.current = options.restoreScrollOnUnlock ?? true;","  restoreScrollOnUnlockRef.current = options.restoreScrollOnUnlock ?? false;")]},
 'M13-NO-ERROR-RESET': {H:[("      setError(null);\n","")]},
}
res=[]
for k,spec in MUT.items():
    for f,ch in spec.items():
        if ch=='HEAD': src=head(f)
        else:
            src=base[f]
            for a,b in ch:
                assert src.count(a)==1,(k,a); src=src.replace(a,b)
        open(f'{S}/{f}','w').write(src)
    p=subprocess.run(['npx','vitest','run',*TESTS],cwd=S,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',p.stdout+p.stderr)
    open(f'{LOG}/mutant-{k}.log','w').write(out)
    failed=sorted(set(re.findall(r'FAIL .*?> ((?:LMR|SL|L)\w*\d+)',out)))
    res.append({'id':k,'rc':p.returncode,'failedRows':failed}); print(k,p.returncode,failed,flush=True)
    for f in spec: open(f'{S}/{f}','w').write(base[f])
with open(OUT,'w') as f:
    for r in res: f.write(json.dumps(r)+'\n')
