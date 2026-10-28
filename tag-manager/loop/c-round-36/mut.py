import subprocess, sys, json, os, difflib
ROOT=sys.argv[1]; OUT=sys.argv[2]; os.chdir(ROOT)
SE='src/renderer/src/components/schema/SchemaEditor.tsx'
MP='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
H='tests/renderer/helpers/dom-queries.ts'
WAIT='    await waitForFolderLoadIdle();\n'
ID='    schemaReadIdRef.current += 1;\n    const schemaReadId = schemaReadIdRef.current;\n'
G='    if (schemaReadId !== schemaReadIdRef.current) return;\n'
M=[
 ('CTRL',[]),
 ('SM-1',[(SE,'    if (!isMountedRef.current) return;\n    setIsApplying(false);','    setIsApplying(false);')]),
 ('SM-2',[(SE,'useRef(false)','useRef(true)'),(SE,'    isMountedRef.current = true;\n','')]),
 ('DM-3',[(MP,"    await waitForFolderLoadIdle();\n    const { files, folderLoadId: loadId } = useFileStore.getState();\n","    const loadId = useFileStore.getState().folderLoadId;\n    await waitForFolderLoadIdle();\n    const { files } = useFileStore.getState();\n")]),
 ('BM-1',[(SE,'disabled={isApplying || fields.length === 0}','disabled={fields.length === 0}')]),
 ('DM-8',[(MP,G,'')]),
 ('DM-9',[(MP,ID+WAIT,WAIT+ID)]),
 ('BM-6',[(SE,'    setIsApplying(false);\n    onClose();','    onClose();')]),
 ('HM-1',[(H,'  if (matches.length > 1) throw new Error(`button ${String(name)} matched ${matches.length} buttons`);\n','')]),
 ('HM-2',[(H,'text === name','text.includes(name)')]),
 ('HM-3',[(H,'(button.textContent ?? "").trim()','(button.textContent ?? "")')]),
]
only=sys.argv[3:] 
for tag,edits in M:
    if only and tag not in only: continue
    backup={}
    ok=True
    for f,a,b in edits:
        backup.setdefault(f,open(f).read()); s=open(f).read()
        if s.count(a)!=1: print(tag,'PATTERN COUNT',s.count(a),repr(a[:60])); ok=False; break
        open(f,'w').write(s.replace(a,b,1))
    if ok:
        with open(f'{OUT}/{tag}.diff','w') as d:
            for f in backup: d.writelines(difflib.unified_diff(backup[f].splitlines(1),open(f).read().splitlines(1),f,f))
        jf=f'/tmp/c36/{tag}.json'
        r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts','--reporter=json','--outputFile='+jf],capture_output=True,text=True)
        d=json.load(open(jf))
        fails=[(t['fullName'] if 'fullName' in t else t['title'])[:110]+' :: '+(t.get('failureMessages') or [''])[0].split('\n')[0][:160] for f in d['testResults'] for t in f['assertionResults'] if t['status']!='passed']
        errs=[l for l in (r.stdout+r.stderr).splitlines() if 'Unhandled' in l or 'Errors ' in l]
        print(f"== {tag} passed={d['numPassedTests']} failed={d['numFailedTests']} suitefail={[f['name'].split('/')[-1] for f in d['testResults'] if f['status']!='passed' and not f['assertionResults']]} errs={errs[:3]}")
        for x in fails: print('   x',x)
        sys.stdout.flush()
    for f,s in backup.items(): open(f,'w').write(s)
