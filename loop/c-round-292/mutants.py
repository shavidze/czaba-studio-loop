import subprocess, shutil, sys, re, json, os
S='/tmp/c292-scratch'; OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-292'
R='app/routes/studio-lab.tsx'; H='app/hooks/useStudioWideViewport.ts'; N='app/components/arrangement/StudioNarrowScreen.tsx'
T=['app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx']
prov_open='<ArrangementProvider\n          collection={studioLabDemoCollection}\n          initialArrangement={studioLabInitialArrangement}\n        >\n          {showsWorkspace ? <StudioWorkspace /> : <StopPlaybackOnNarrow />}\n        </ArrangementProvider>'
M={
 'M1-gate-below-provider':(R,'return <StudioNarrowScreen themeMarker focusHeadingOnMount={false} />;','return (<ArrangementProvider collection={studioLabDemoCollection} initialArrangement={studioLabInitialArrangement}><StudioNarrowScreen themeMarker focusHeadingOnMount={false} /></ArrangementProvider>);'),
 'M2-latch-starts-true':(R,'const wasWideRef = useRef(false);','const wasWideRef = useRef(true);'),
 'M3-server-snapshot-false':(H,'function readStudioWideServerSnapshot(): boolean {\n  return true;','function readStudioWideServerSnapshot(): boolean {\n  return false;'),
 'M4-gt-900':(H,'window.innerWidth >= STUDIO_WIDE_MIN_PX','window.innerWidth > STUDIO_WIDE_MIN_PX'),
 'M5-provider-only-wide':(R,prov_open,'{showsWorkspace ? (<ArrangementProvider collection={studioLabDemoCollection} initialArrangement={studioLabInitialArrangement}><StudioWorkspace /></ArrangementProvider>) : null}'),
 'M6-heading-focus-removed':(N,'      headingRef.current?.focus();','      void headingRef;'),
 'M7-workspace-kept-mounted':(R,'{showsWorkspace ? <StudioWorkspace /> : <StopPlaybackOnNarrow />}','<StudioWorkspace />'),
 'M8-latch-during-hydration':(R,'if (isHydrated && isWide) {','if (isWide) {'),
 'M9-stop-child-removed':(R,'{showsWorkspace ? <StudioWorkspace /> : <StopPlaybackOnNarrow />}','{showsWorkspace ? <StudioWorkspace /> : null}'),
}
only=sys.argv[1:] or list(M)
res={}
for name in only:
  f,a,b=M[name]; p=os.path.join(S,f); orig=open(p).read()
  assert orig.count(a)==1,(name,orig.count(a))
  open(p,'w').write(orig.replace(a,b))
  tests=T+(['app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx','app/lib/arrangement/__tests__/ssr-layout-effect.test.tsx'] if name.startswith('M3') else [])
  r=subprocess.run(['npx','vitest','run',*tests,'--reporter=verbose'],cwd=S,capture_output=True,text=True)
  log=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr); open(f'{OUT}/mutant-{name}.log','w').write(log)
  red=sorted(set(re.findall(r'^\s*[×✗x] .*?> ((?:NG|TH|LRS|DT|SL)[0-9a-z]*)',log,re.M)))
  open(p,'w').write(orig)
  res[name]={'rc':r.returncode,'red':red}
  print(name,res[name],flush=True)
r=subprocess.run(['diff','-rq',S+'/app','/home/runner/czaba-project/store/app'],capture_output=True,text=True); res['restore_diff']=r.stdout
json.dump(res,open(f'{OUT}/mutants.json','w'),indent=1); print('restore',repr(r.stdout))
