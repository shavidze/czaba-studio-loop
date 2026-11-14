# usage: python3 -I mutants-508.py <tree-with-v2+v3-applied> <abs logdir> <HEAD AudioPlayer.tsx path>
# Each mutant is a list of (old,new) edits; every old must occur exactly once in the current source.
import subprocess,sys,os,re
T=sys.argv[1]; LOG=sys.argv[2]; os.makedirs(LOG,exist_ok=True)
P=os.path.join(T,'app/components/audio/AudioPlayer.tsx'); ORIG=open(P).read()
HEAD_SRC=open(sys.argv[3]).read() if len(sys.argv)>3 else None
TEST='app/lib/__tests__/store-button-cleanup-n1.test.tsx'
UNMUTE_SVG='{volume === 0 ? (\n              <svg width="20" height="20"'
LOW_SVG=') : volume < 0.5 ? (\n              <svg width="20" height="20"'
M=[('M0-head-markup',None,['N1-1','N1-3','N1-4','N1-5']),
   ('M1-mute-label-static',[("label={volume === 0 ? 'Unmute' : 'Mute'}","label=\"Mute\"")],['N1-2']),
   ('M2-next-calls-previous',[('label="Next track" onClick={skipNext}','label="Next track" onClick={skipPrevious}')],['N1-2']),
   ('M3-close-icon-18',[('<X size={16} />','<X size={18} />')],['N1-4']),
   ('M4-close-loses-position',[('className="absolute top-1/2 right-0 -translate-y-1/2"','className=""')],['N1-3']),
   ('M5-close-size-md',[('size="sm"\n            label="Close player"','size="md"\n            label="Close player"')],['N1-3']),
   ('M6-white-hover-back',[('label="Previous track" onClick={skipPrevious}>','label="Previous track" onClick={skipPrevious} className="hover:bg-white/10">')],['N1-4','N1-5']),
   ('M7-prev-next-swap',[('label="Previous track" onClick={skipPrevious}','label="Previous track" onClick={skipNext}'),('label="Next track" onClick={skipNext}','label="Next track" onClick={skipPrevious}')],['N1-2']),
   ('M8-close-next-swap',[('label="Close player"\n            onClick={closePlayer}','label="Close player"\n            onClick={skipNext}'),('label="Next track" onClick={skipNext}','label="Next track" onClick={closePlayer}')],['N1-2']),
   ('M9-unmute-icon-24',[(UNMUTE_SVG,UNMUTE_SVG.replace('width="20" height="20"','width="24" height="24"'))],['N1-6']),
   ('M10-low-volume-icon-24',[(LOW_SVG,LOW_SVG.replace('width="20" height="20"','width="24" height="24"'))],['N1-6']),
   ('M11-close-extra-class',[('className="absolute top-1/2 right-0 -translate-y-1/2"','className="absolute top-1/2 right-0 -translate-y-1/2 hover:text-destructive"')],['N1-7']),
   ('M12-previous-icon-height-24',[('label="Previous track" onClick={skipPrevious}>\n              <svg width="20" height="20"','label="Previous track" onClick={skipPrevious}>\n              <svg width="20" height="24"')],['N1-4']),
   ('M13-mute-threshold-0.3',[("label={volume === 0 ? 'Unmute' : 'Mute'}","label={volume < 0.3 ? 'Unmute' : 'Mute'}")],['N1-6']),
   ('M14-previous-extra-class',[('label="Previous track" onClick={skipPrevious}>','label="Previous track" onClick={skipPrevious} className="opacity-70">')],['N1-7'])]
res=[]
try:
  for name,edits,exp in M:
    if edits is None:
      if HEAD_SRC is None: res.append(f'{name} SKIPPED (no HEAD path)'); continue
      src=HEAD_SRC
    else:
      src=ORIG
      for a,b in edits:
        assert src.count(a)==1,(name,a,src.count(a)); src=src.replace(a,b)
    open(P,'w').write(src)
    r=subprocess.run(['npx','vitest','run','--reporter=verbose',TEST],cwd=T,capture_output=True,text=True,timeout=600)
    out=r.stdout+r.stderr; open(os.path.join(LOG,name+'.log'),'w').write(out)
    failed=sorted({'N1-'+m for l in out.splitlines() if ('×' in l or '✗' in l or 'FAIL' in l) for m in re.findall(r'N1-(\d+)',l)})
    ok=all(e in failed for e in exp) and r.returncode!=0
    res.append(f"{name} rc={r.returncode} red={','.join(failed)} expected={','.join(exp)} {'OK' if ok else 'MISMATCH'}")
finally:
  open(P,'w').write(ORIG)
  rc=subprocess.run(['npx','vitest','run',TEST],cwd=T,capture_output=True,text=True,timeout=600).returncode
  res.append(f'restored rc {rc}')
open(os.path.join(LOG,'summary.txt'),'w').write('\n'.join(res)+'\n'); print('\n'.join(res))
