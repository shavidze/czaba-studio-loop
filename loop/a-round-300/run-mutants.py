import subprocess, re, sys, shutil
S='/tmp/a300-scratch'; OUT='/home/runner/czaba-project/tmp/studio-real-loop/a-round-300/mutants'
M='app/components/arrangement/ArrangementLibraryMenu.tsx'
L='app/components/arrangement/ArrangementLibrary.tsx'
K='app/data/studio-lab-links.ts'
T='app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx'
muts=[
 ('m1-no-target',M,'        target="_blank"\n',''),
 ('m2-rel-noreferrer-only',M,'rel="noopener noreferrer"','rel="noreferrer"'),
 ('m3-no-refocus',L,"    setLibraryMenu(null);\n    optionRefs.current.get(current.sourceId)?.focus({ preventScroll: true });","    setLibraryMenu(null);"),
 ('m4-enter-prevented',M,"    if (event.key === 'Enter' && event.repeat) {","    if (event.key === 'Enter') {"),
 ('m5-no-unmapped-check',L,"  const handleOptionContextMenu = (event: MouseEvent<HTMLButtonElement>, sourceId: string) => {\n    if (getStudioLabProductHref(sourceId) === null) {\n      return;\n    }\n","  const handleOptionContextMenu = (event: MouseEvent<HTMLButtonElement>, sourceId: string) => {\n"),
 ('m6-no-stop-propagation',M,"    event.stopPropagation();\n    if (event.key === 'Escape') {","    if (event.key === 'Escape') {"),
 ('m7-reverse-map-upper',K,"[sourceId, handle]),","[sourceId, handle.toUpperCase()]),"),
 ('m8-no-select',L,"    selectLibraryOption(sourceId, false);\n    optionRefs.current.get(sourceId)?.focus","    optionRefs.current.get(sourceId)?.focus"),
 ('m9-repeat-opens',L,"      if (!event.repeat) {\n        const anchor","      if (event.repeat || !event.repeat) {\n        const anchor"),
 ('m10-space-inert',M,"        itemRef.current?.click();\n",""),
]
only=sys.argv[1:]
for name,f,old,new in muts:
  if only and name.split('-')[0] not in only: continue
  p=f'{S}/{f}'; orig=open(p).read()
  assert orig.count(old)==1,(name,orig.count(old))
  open(p,'w').write(orig.replace(old,new))
  try:
    r=subprocess.run(['timeout','600','npx','vitest','run',T],cwd=S,capture_output=True,text=True)
  finally:
    open(p,'w').write(orig)
  log=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
  open(f'{OUT}/mutant-{name}.log','w').write(log)
  tests=[l.strip() for l in log.splitlines() if re.match(r'\s+Tests\s',l)]
  red=sorted(set(re.findall(r'(?:×|FAIL ).*?> (VS\w+)',log)))
  restored=open(p).read()==orig
  print(f'{name}: {tests} red={red} restored={restored}',flush=True)
