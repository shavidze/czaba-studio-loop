import subprocess, sys, shutil, re, json, os
S='/tmp/c244-scratch'; L='/home/runner/czaba-project/tmp/studio-real-loop/c-round-244'
SW='app/components/arrangement/StudioWorkspace.tsx'; MR='app/components/arrangement/ArrangementMarkerRow.tsx'
T=['app/lib/arrangement/__tests__/grid-snap-menu.test.tsx']
orig={p:open(f'{S}/{p}').read() for p in (SW,MR)}
def rep(p,a,b):
    s=orig[p]; assert s.count(a)==1,(p,a,s.count(a)); return {p:s.replace(a,b)}
M={
 'FIX-CONTROL':{},
 'MU-HEAD':{SW:open('/tmp/c244-orig/SW.tsx').read(),MR:open('/tmp/c244-orig/MR.tsx').read()},
 'MU-NO-MARKER-FALLBACK':rep(SW,'    if (markerRowRef.current?.focusEditorSuccessor(returnFocus)) {\n      return;\n    }\n',''),
 'MU-NO-GROUP-FALLBACK':rep(SW,'      trackRowNameButton(scrollerRef.current, returnGroupId)?.focus({ preventScroll: true });\n',''),
 'MU-L1-REVERT':rep(SW,'      gridMenuPressFocusRef.current = pressFocus;\n      gridMenuPressGroupIdRef.current = groupNameEditorRowId(pressFocus);\n','      if (pressFocus !== null) {\n        gridMenuPressFocusRef.current = pressFocus;\n        gridMenuPressGroupIdRef.current = groupNameEditorRowId(pressFocus);\n      }\n'),
 'MU-RELEASE-LEFT-ONLY':rep(SW,'      if (\n        focused instanceof HTMLElement &&\n        (((isRangeInputTarget','      if (\n        event.button !== 2 &&\n        focused instanceof HTMLElement &&\n        (((isRangeInputTarget'),
 'MU-SUCCESSOR-NO-IDENTITY':rep(MR,'if (successor === null || successor.input !== element) {','if (successor === null) {'),
 'MU-ALWAYS-SUCCESSOR':rep(MR,"const moveFocus = reason !== 'blur';",'const moveFocus = true;'),
}
cov=[l.strip() for l in open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-243/covering-grep.txt') if l.strip()]
res={}
for name,ch in M.items():
    if len(sys.argv)>1 and name not in sys.argv[1:]: continue
    for p in (SW,MR): open(f'{S}/{p}','w').write(ch.get(p,orig[p]))
    files=T+[c for c in cov if c not in T] if name=='MU-ALWAYS-SUCCESSOR' else T
    out=subprocess.run(['npx','vitest','run','--reporter=verbose',*files],cwd=S,capture_output=True,text=True,timeout=1200).stdout
    out=re.sub(r'\x1b\[[0-9;]*m','',out); open(f'{L}/mut-{name}.log','w').write(out)
    red=sorted(set(re.findall(r'^\s*[×✗x]\s+.*?\b((?:GM|FR|MU)\d+)\b',out,re.M)))
    tot=re.findall(r'Tests\s+(.*)',out)
    res[name]={'red':red,'tests':tot[-1] if tot else None}; print(name,res[name],flush=True)
for p in (SW,MR): open(f'{S}/{p}','w').write(orig[p])
json.dump(res,open(f'{L}/mutants.json','w') if len(sys.argv)==1 else open(f'{L}/mutants-partial.json','w'),indent=1)
