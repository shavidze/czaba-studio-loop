# usage: python3 -I mutants-507.py <tree-with-sketch-applied> <abs logdir> [<HEAD AudioPlayer.tsx path>]
import subprocess,sys,os,shutil
T=sys.argv[1]; LOG=sys.argv[2]; os.makedirs(LOG,exist_ok=True)
P=os.path.join(T,'app/components/audio/AudioPlayer.tsx'); ORIG=open(P).read()
HEAD_SRC=open(sys.argv[3]).read() if len(sys.argv)>3 else None
TEST='app/lib/__tests__/store-button-cleanup-n1.test.tsx'
M=[('M0-head-markup',None,['N1-1','N1-3','N1-4','N1-5']),
   ('M1-mute-label-static',("label={volume === 0 ? 'Unmute' : 'Mute'}","label=\"Mute\""),['N1-2']),
   ('M2-next-calls-previous',('label="Next track" onClick={skipNext}','label="Next track" onClick={skipPrevious}'),['N1-2']),
   ('M3-close-icon-18',('<X size={16} />','<X size={18} />'),['N1-4']),
   ('M4-close-loses-position',('className="absolute top-1/2 right-0 -translate-y-1/2"','className=""'),['N1-3']),
   ('M5-close-size-md',('size="sm"\n            label="Close player"','size="md"\n            label="Close player"'),['N1-3']),
   ('M6-white-hover-back',('label="Previous track" onClick={skipPrevious}>','label="Previous track" onClick={skipPrevious} className="hover:bg-white/10">'),['N1-4','N1-5'])]
res=[]
try:
  for name,ch,exp in M:
    if ch is None:
      if HEAD_SRC is None: res.append(f'{name} SKIPPED (no HEAD path)'); continue
      src=HEAD_SRC
    else:
      assert ORIG.count(ch[0])==1,(name,ORIG.count(ch[0])); src=ORIG.replace(ch[0],ch[1])
    open(P,'w').write(src)
    r=subprocess.run(['npx','vitest','run','--reporter=verbose',TEST],cwd=T,capture_output=True,text=True,timeout=600)
    out=r.stdout+r.stderr; open(os.path.join(LOG,name+'.log'),'w').write(out)
    failed=sorted({l.split('N1-')[1][:1] for l in out.splitlines() if ('×' in l or '✗' in l or 'FAIL' in l) and 'N1-' in l})
    failed=['N1-'+x for x in failed]
    ok=all(e in failed for e in exp) and r.returncode!=0
    res.append(f"{name} rc={r.returncode} red={','.join(failed)} expected={','.join(exp)} {'OK' if ok else 'MISMATCH'}")
finally:
  open(P,'w').write(ORIG)
  rc=subprocess.run(['npx','vitest','run',TEST],cwd=T,capture_output=True,text=True,timeout=600).returncode
  res.append(f'restored rc {rc}')
open(os.path.join(LOG,'summary.txt'),'w').write('\n'.join(res)+'\n'); print('\n'.join(res))
