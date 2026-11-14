import subprocess,sys,os,re
T=sys.argv[1]; LOG=sys.argv[2]
P=os.path.join(T,'app/components/audio/AudioPlayer.tsx'); ORIG=open(P).read()
TEST='app/lib/__tests__/store-button-cleanup-n1.test.tsx'
X='M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'
S='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728'
A='{volume === 0 ? (\n              <svg'
M=[('X1-icon-threshold-0.05',[(A,'{volume < 0.05 ? (\n              <svg')]),
   ('X2-muted-speaker-swap',None)]
try:
  for name,edits in M:
    src=ORIG
    if edits:
      for a,b in edits:
        assert src.count(a)==1,(name,a); src=src.replace(a,b)
    else:
      assert src.count(X)==1 and src.count(S)==2
      src=src.replace(X,'@@X@@').replace(S,'@@S@@',1).replace('@@X@@',S).replace('@@S@@',X)
    open(P,'w').write(src)
    r=subprocess.run(['npx','vitest','run','--reporter=verbose',TEST],cwd=T,capture_output=True,text=True,timeout=600)
    out=r.stdout+r.stderr; open(os.path.join(LOG,name+'.log'),'w').write(out)
    failed=sorted({'N1-'+m for l in out.splitlines() if ('×' in l or '✗' in l or 'FAIL' in l) for m in re.findall(r'N1-(\d+)',l)})
    print(f"{name} rc={r.returncode} red={','.join(failed) or 'none'}")
finally:
  open(P,'w').write(ORIG); print('restored', open(P).read()==ORIG)
