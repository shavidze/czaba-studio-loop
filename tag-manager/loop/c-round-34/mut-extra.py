import subprocess,re,sys
SE='src/renderer/src/components/schema/SchemaEditor.tsx'
MP='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
M={
 'CM-6 onClose before await (close at once)': [(SE,"    await onSave?.();\n    if (!isMountedRef.current) return;\n    onClose();\n","    onClose();\n    await onSave?.();\n")],
 'CM-7 effect without deps array': [(SE,"    };\n  }, []);\n","    };\n  });\n")],
 'CM-8 onSave not awaited': [(SE,"    await onSave?.();\n","    onSave?.();\n")],
 'DM-3 (assertion check)': [(MP,"    await waitForFolderLoadIdle();\n    const { files, folderLoadId: loadId } = useFileStore.getState();\n","    const loadId = useFileStore.getState().folderLoadId;\n    await waitForFolderLoadIdle();\n    const { files } = useFileStore.getState();\n")],
}
files=['tests/renderer/components/schema-editor-stale-close.test.ts','tests/renderer/components/schema-change-during-folder-load.test.ts','tests/renderer/components/schema-editor.test.ts','tests/renderer/components/metadata-panel-schema-change.test.ts','tests/renderer/components/reread-after-folder-switch.test.ts']
for name,edits in M.items():
    backup={}
    for f,a,b in edits:
        backup.setdefault(f,open(f).read()); s=open(f).read(); assert a in s,(name,a); open(f,'w').write(s.replace(a,b,1))
    r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts',*files],capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    failed=sorted(set(re.findall(r'^\s+×\s+(\(\w+\))',out,re.M)))
    tot=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    locs=re.findall(r'❯ (tests/renderer/components/[\w.-]+\.ts:\d+:\d+)',out)
    print(name,'|',tot[-1] if tot else '?','|',failed,'|',sorted(set(locs))); sys.stdout.flush()
    for f,s in backup.items(): open(f,'w').write(s)
