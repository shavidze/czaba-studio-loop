import subprocess, sys, re, os
SE='src/renderer/src/components/schema/SchemaEditor.tsx'
MP='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
OUT='/home/runner/czaba-project/tmp/tag-manager-loop/c-round-35/mutants/'
TESTS=['tests/renderer/components/schema-editor-done-busy.test.ts','tests/renderer/components/schema-editor-stale-close.test.ts','tests/renderer/components/schema-change-during-folder-load.test.ts','tests/renderer/components/metadata-panel-schema-change.test.ts','tests/renderer/components/schema-editor.test.ts','tests/renderer/components/reread-after-folder-switch.test.ts','tests/renderer/components/c-probes.test.ts']
WAIT='    await waitForFolderLoadIdle();\n'
ID='    schemaReadIdRef.current += 1;\n    const schemaReadId = schemaReadIdRef.current;\n'
G='    if (schemaReadId !== schemaReadIdRef.current) return;\n'
LG='    if (!isFolderLoadCurrent(loadId)) return;\n'
M=[
 ('BM-0 control',[]),
 ('BM-1 Done disabled ignores isApplying',[(SE,'disabled={isApplying || fields.length === 0}','disabled={fields.length === 0}')]),
 ('BM-2 fieldset never disabled',[(SE,'<fieldset disabled={isApplying}','<fieldset disabled={false}')]),
 ('BM-3 catch does not reset isApplying',[(SE,'if (isMountedRef.current) setIsApplying(false);\n      return;','return;')]),
 ('BM-4 label unchanged',[(SE,"{isApplying ? 'Applying...' : 'Done'}",'Done')]),
 ('BM-5 setIsApplying(true) removed',[(SE,'    setIsApplying(true);\n','')]),
 ('BM-6 setIsApplying(false) before onClose removed',[(SE,'    setIsApplying(false);\n    onClose();','    onClose();')]),
 ('BM-7 catch falls through (no return)',[(SE,'if (isMountedRef.current) setIsApplying(false);\n      return;\n','if (isMountedRef.current) setIsApplying(false);\n')]),
 ('BM-8 catch reset without mounted check',[(SE,'if (isMountedRef.current) setIsApplying(false);','setIsApplying(false);')]),
 ('BM-9 fieldset dim class removed',[(SE,'className="min-w-0 space-y-4 disabled:opacity-60"','className="min-w-0 space-y-4"')]),
 ('BM-10 try/catch removed',[(SE,'    try {\n      await onSave?.();\n    } catch {\n      if (isMountedRef.current) setIsApplying(false);\n      return;\n    }\n','    await onSave?.();\n')]),
 ('BM-11 setIsApplying(true) after await',[(SE,'    setIsApplying(true);\n    try {\n      await onSave?.();\n','    try {\n      await onSave?.();\n      setIsApplying(true);\n')]),
 ('DM-8 schema read id guard removed',[(MP,G,'')]),
 ('DM-9 id taken after the wait',[(MP,ID+WAIT,WAIT+ID)]),
 ('DM-10 guard right after the wait',[(MP,G,''),(MP,WAIT,WAIT+G)]),
 ('DM-11 guard after load guard',[(MP,G+LG,LG+G)]),
 ('DM-12 guard uses < instead of !==',[(MP,'schemaReadId !== schemaReadIdRef.current','schemaReadId < schemaReadIdRef.current')]),
 ('DM-13 increment removed (id never changes)',[(MP,'    schemaReadIdRef.current += 1;\n','')]),
 ('SM-1 D-41 mounted guard removed',[(SE,'    if (!isMountedRef.current) return;\n    setIsApplying(false);','    setIsApplying(false);')]),
 ('SM-2 useRef(true) and effect does not set true',[(SE,'useRef(false)','useRef(true)'),(SE,'    isMountedRef.current = true;\n','')]),
]
for name,edits in M:
    origs={}
    ok=True
    for f,old,new in edits:
        src=open(f).read() if f not in origs else open(f).read()
        origs.setdefault(f,open(f).read())
        if src.count(old)!=1: print(name,'PATTERN COUNT',src.count(old),repr(old[:50])); ok=False; break
        open(f,'w').write(src.replace(old,new,1))
    if not ok:
        for f,s in origs.items(): open(f,'w').write(s)
        continue
    tag=name.split()[0]
    for f in origs:
        subprocess.run(f'diff -u /tmp/c35/new/{f} {f} > {OUT}{tag}-{os.path.basename(f)}.diff',shell=True)
    try:
        r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts']+TESTS,capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        failed=sorted(set(re.findall(r'× (\([a-z]+\d+\))',out)))
        summ=[l.strip() for l in out.splitlines() if l.strip().startswith(('Tests ','Errors '))]
        print(name,'|',' '.join(summ),'| failed:',failed or 'none',flush=True)
    finally:
        for f,s in origs.items(): open(f,'w').write(s)
