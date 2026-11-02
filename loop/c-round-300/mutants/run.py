import subprocess, re, sys
S='/tmp/c300-mut'; OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-300/mutants'
M='app/components/arrangement/ArrangementLibraryMenu.tsx'; L='app/components/arrangement/ArrangementLibrary.tsx'
T='app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx'
muts=[
 ('control',M,None,None),
 ('m1-target-self',M,'target="_blank"','target="_self"'),
 ('m3-no-refocus',L,"    setLibraryMenu(null);\n    optionRefs.current.get(current.sourceId)?.focus({ preventScroll: true });\n","    setLibraryMenu(null);\n"),
 ('m4-enter-always-prevented',M,"    if (event.key === 'Enter' && event.repeat) {","    if (event.key === 'Enter' || (event.key === 'Enter' && event.repeat)) {"),
 ('m5-no-unmapped-check',L,"    if (getStudioLabProductHref(sourceId) === null) {\n      return;\n    }\n    event.preventDefault();\n    event.stopPropagation();\n    const anchor =","    event.preventDefault();\n    event.stopPropagation();\n    const anchor ="),
 ('m8-no-select',L,"    selectLibraryOption(sourceId, false);\n    optionRefs","    optionRefs"),
]
for name,f,old,new in muts:
  p=f'{S}/{f}'; orig=open(p).read()
  if old is not None:
    assert orig.count(old)==1,(name,orig.count(old)); open(p,'w').write(orig.replace(old,new))
  try: r=subprocess.run(['timeout','600','npx','vitest','run',T],cwd=S,capture_output=True,text=True)
  finally: open(p,'w').write(orig)
  log=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr); open(f'{OUT}/mutant-{name}.log','w').write(log)
  tests=[l.strip() for l in log.splitlines() if re.match(r'\s+Tests\s',l)]
  red=sorted(set(re.findall(r'(?:×|FAIL ).*?> (VS\w+)',log)))
  print(f'{name}: {tests} red={red} restored={open(p).read()==orig}',flush=True)
