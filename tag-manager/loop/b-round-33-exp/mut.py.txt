import shutil, subprocess, sys
SE='src/renderer/src/components/schema/SchemaEditor.tsx'
MP='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
M={
 'SM-0 control': [],
 'SM-1 guard removed': [(SE,"    if (!isMountedRef.current) return;\n","")],
 'SM-2 effect setup does not set true (useRef(true))': [(SE,"useRef(false)","useRef(true)"),(SE,"    isMountedRef.current = true;\n","")],
 'SM-3 guard before await': [(SE,"    await onSave?.();\n    if (!isMountedRef.current) return;\n","    if (!isMountedRef.current) return;\n    await onSave?.();\n")],
 'SM-4 cleanup removed': [(SE,"    return () => {\n      isMountedRef.current = false;\n    };\n","")],
 'SM-5 guard also skips onSave result (return before onSave when unmounted is impossible) -> guard inverted': [(SE,"if (!isMountedRef.current) return;","if (isMountedRef.current && false) return;")],
 'DM-3 loadId before wait': [(MP,"    await waitForFolderLoadIdle();\n    const { files, folderLoadId: loadId } = useFileStore.getState();\n","    const loadId = useFileStore.getState().folderLoadId;\n    await waitForFolderLoadIdle();\n    const { files } = useFileStore.getState();\n")],
}
files=['tests/renderer/components/schema-editor-stale-close.test.ts','tests/renderer/components/schema-change-during-folder-load.test.ts','tests/renderer/components/schema-editor.test.ts','tests/renderer/components/metadata-panel-schema-change.test.ts','tests/renderer/components/reread-after-folder-switch.test.ts']
for name,edits in M.items():
    backup={}
    for f,a,b in edits:
        backup.setdefault(f,open(f).read())
        s=open(f).read(); assert a in s,(name,a); open(f,'w').write(s.replace(a,b,1))
    r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts',*files],capture_output=True,text=True)
    out=r.stdout+r.stderr
    import re
    out=re.sub(r'\x1b\[[0-9;]*m','',out)
    failed=[l.strip().split(':')[0] for l in out.splitlines() if l.strip().startswith('×')]
    tot=[l for l in out.splitlines() if 'Tests ' in l]
    print(name,'|',tot[-1].strip() if tot else '?','|',[f[:6] for f in failed]); sys.stdout.flush()
    for f,s in backup.items(): open(f,'w').write(s)
