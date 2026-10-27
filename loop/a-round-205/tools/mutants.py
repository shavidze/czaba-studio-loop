import subprocess, shutil, sys, re, json
SCR='/tmp/a205s'; STORE='/home/runner/czaba-project/store'
START='/home/runner/czaba-project/tmp/studio-real-loop/b-round-204/r205-granted-start'
LM='app/components/marketing/LeadMagnetPopup.tsx'; SL='app/hooks/useScrollLock.ts'; HD='app/components/layout/Header.tsx'
LMT='app/lib/__tests__/store-lead-magnet-dialog.test.tsx'; HFT='app/lib/__tests__/store-hidden-focusables.test.tsx'
def restore():
    for f in [LM,SL,HD,LMT,HFT]: shutil.copy(f'{STORE}/{f}', f'{SCR}/{f}')
def sub(f,a,b):
    p=f'{SCR}/{f}'; s=open(p).read(); assert s.count(a)>=1,(f,a); open(p,'w').write(s.replace(a,b))
def run(testfile, pattern):
    r=subprocess.run(['npx','vitest','run',testfile,'-t',pattern],cwd=SCR,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    m=re.search(r'Tests\s+(.*)',out); return (m.group(1).strip() if m else out[-300:])
MUT={
 'm1':(LMT,'LM1',lambda:(sub(LM,'      role="dialog"\n',''),sub(LM,'      aria-modal="true"\n',''))),
 'm2':(LMT,'LM2',lambda:sub(LM,'    closeButtonRef.current?.focus({ preventScroll: true });\n','')),
 'm3':(LMT,'LM3',lambda:(sub(LM,"    if (currentStep === 'email') emailInputRef.current?.focus({ preventScroll: true });\n",''),sub(LM,"    if (currentStep === 'success') backToSiteButtonRef.current?.focus({ preventScroll: true });\n",''))),
 'm4':(LMT,'LM4',lambda:sub(LM,"if (e.key === 'Escape') {","if (e.key === 'NoEscape') {")),
 'm5':(LMT,'LM4',lambda:sub(LM,'      if (e.nativeEvent.isComposing) return;\n','')),
 'm6':(LMT,'LM5',lambda:sub(LM,"    if (e.key !== 'Tab') return;\n","    return;\n")),
 'm7':(LMT,'LM6',lambda:sub(LM,'(activeElement === firstControl || activeElement === dialog)','activeElement === firstControl')),
 'm8':(LMT,'LM7',lambda:sub(LM,'      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });\n','')),
 'm9':(LMT,'LM7',lambda:(sub(LM,'      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });\n',''),sub(LM,'        onClick={close}\n','        onClick={() => {\n          const returnTarget = returnFocusRef.current;\n          close();\n          returnTarget?.focus({ preventScroll: true });\n        }}\n'))),
 'm10':(LMT,'LM8',lambda:shutil.copy(f'{START}/{SL}',f'{SCR}/{SL}')),
 'm11':(HFT,'HF6b',lambda:sub(HD,'  useEffect(() => {\n    if (!isAuthenticated) setIsUserMenuOpen(false);\n  }, [isAuthenticated]);\n','')),
 'm12':(LMT,'LM9',lambda:sub(LM,'<p role="alert" ','<p ')),
 'm13':(LMT,'LM3',lambda:sub(LM,'    emailInputRef.current?.focus({ preventScroll: true });\n  }, [shouldShow, currentStep, isSubmitting]);','  }, [shouldShow, currentStep, isSubmitting]);')),
 'm14':(LMT,'LM2',lambda:sub(LM,'if (previousStep === null || previousStep === currentStep) return;','if (previousStep === currentStep) return;')),
 'm15':(LMT,'LM5',lambda:sub(LM,"'button:not([disabled]), input:not([disabled])'","'button, input'")),
}
res={}
restore(); res['tree-LM']=run(LMT,'LM'); res['tree-HF']=run(HFT,'HF')
for k,(tf,pat,ap) in MUT.items():
    restore(); ap(); res[k]=(pat,run(tf,pat))
restore()
print(json.dumps(res,indent=1))
