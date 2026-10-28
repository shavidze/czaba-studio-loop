import subprocess,sys,re,shutil
P='/tmp/c33/mut/src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
proto=open('/tmp/c33/new/src/renderer/src/components/metadata-editor/MetadataPanel.tsx').read()
base=open('/tmp/c33/red/src/renderer/src/components/metadata-editor/MetadataPanel.tsx').read()
WAIT='    await waitForFolderLoadIdle();\n'
GET='    const { files, folderLoadId: loadId } = useFileStore.getState();\n'
M={
 'BASE (ee15e6c src)': base,
 'DM-0 control': proto,
 'DM-1 wait removed': proto.replace(WAIT,''),
 'DM-2 closure allFiles after wait': proto.replace("export function MetadataPanel(): React.ReactElement {\n","export function MetadataPanel(): React.ReactElement {\n  const allFiles = useFileStore((s) => s.files);\n").replace(GET,'    const { folderLoadId: loadId } = useFileStore.getState();\n    const files = allFiles;\n').replace('}, [setMetadata, setEditingMetadata, showToast]);','}, [allFiles, setMetadata, setEditingMetadata, showToast]);'),
 'DM-3 loadId before wait': proto.replace(WAIT+GET,'    const loadId = useFileStore.getState().folderLoadId;\n'+WAIT+'    const { files } = useFileStore.getState();\n'),
 'DM-4 isScanning early return': proto.replace(WAIT,'    if (useFileStore.getState().isScanning) return;\n'),
 'DM-5 files identity guard instead of wait': proto.replace(WAIT,'').replace('    if (!isFolderLoadCurrent(loadId)) return;\n','    if (!isFolderLoadCurrent(loadId) || useFileStore.getState().files !== files) return;\n'),
 'DM-6 wait resolves on any store change': proto.replace('      if (state.isScanning) return;\n',''),
 'DM-7 load guard removed': proto.replace('    if (!isFolderLoadCurrent(loadId)) return;\n',''),
}
files=['tests/renderer/components/schema-change-during-folder-load.test.ts','tests/renderer/components/reread-after-folder-switch.test.ts','tests/renderer/components/folder-read-during-save.test.ts','tests/renderer/components/metadata-panel-schema-change.test.ts','tests/renderer/components/metadata-panel-batch-save.test.ts','tests/renderer/components/folder-read-overlap.test.ts','tests/renderer/components/folder-read-rejected-chunk.test.ts']
for name,src in M.items():
    if src==proto and name!='DM-0 control': print(name,'NO-OP EDIT'); continue
    open(P,'w').write(src)
    open('/home/runner/czaba-project/tmp/tag-manager-loop/c-round-33/mutants/'+name.split()[0]+'.tsx','w').write(src)
    subprocess.run('diff -u /tmp/c33/new/src/renderer/src/components/metadata-editor/MetadataPanel.tsx /home/runner/czaba-project/tmp/tag-manager-loop/c-round-33/mutants/'+name.split()[0]+'.tsx > /home/runner/czaba-project/tmp/tag-manager-loop/c-round-33/mutants/'+name.split()[0]+'.diff',shell=True)
    r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts',*files],cwd='/tmp/c33/mut',capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    failed=sorted(set(re.findall(r'^\s+×\s+(\(\w+\))',out,re.M)))
    tl=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    print(name,'|',tl[-1] if tl else 'NO SUMMARY','| failed:',' '.join(failed),flush=True)
open(P,'w').write(proto)
