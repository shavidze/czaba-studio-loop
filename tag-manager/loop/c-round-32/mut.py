import subprocess, shutil, sys, re, os
R='/tmp/c-r32-mut'
MP=R+'/src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
AP=R+'/src/renderer/src/App.tsx'
orig={MP:open(MP).read(), AP:open(AP).read()}
muts={
 'SM-0 unmutated (control)':[],
 'SM-1 single: updateFileMetadata without isListedPath':[(MP,"if (isListedPath(path)) updateFileMetadata(path, updated);","updateFileMetadata(path, updated);")],
 'SM-2 batch: savedEntries without isListedPath':[(MP,"!failedPaths.has(path) && isListedPath(path)","!failedPaths.has(path)")],
 'SM-3 save keyed on folderLoadId (round-30 hint) instead of listed path':[
   (MP,"    const startEditingMetadata = useMetadataStore.getState().editingMetadata;\n","    const startEditingMetadata = useMetadataStore.getState().editingMetadata;\n    const saveLoadId = useFileStore.getState().folderLoadId;\n"),
   (MP,"if (isListedPath(path)) updateFileMetadata(path, updated);","if (isFolderLoadCurrent(saveLoadId)) updateFileMetadata(path, updated);"),
   (MP,"!failedPaths.has(path) && isListedPath(path)","!failedPaths.has(path) && isFolderLoadCurrent(saveLoadId)")],
 'SM-4 save keyed on folderPath snapshot instead of listed path':[
   (MP,"    const startEditingMetadata = useMetadataStore.getState().editingMetadata;\n","    const startEditingMetadata = useMetadataStore.getState().editingMetadata;\n    const saveFolder = useFileStore.getState().folderPath;\n"),
   (MP,"if (isListedPath(path)) updateFileMetadata(path, updated);","if (useFileStore.getState().folderPath === saveFolder) updateFileMetadata(path, updated);"),
   (MP,"!failedPaths.has(path) && isListedPath(path)","!failedPaths.has(path) && useFileStore.getState().folderPath === saveFolder")],
 'SM-5 schema: guard removed':[(MP,"    if (!isFolderLoadCurrent(loadId)) return;\n    const { metadata: currentMetadata","    const { metadata: currentMetadata")],
 'SM-6 schema: guard only around setMetadata (toast still shown)':[
   (MP,"    if (!isFolderLoadCurrent(loadId)) return;\n    const { metadata: currentMetadata","    const isCurrent = isFolderLoadCurrent(loadId);\n    const { metadata: currentMetadata"),
   (MP,"    setMetadata(accumulated);\n    const currentSelection","    if (isCurrent) setMetadata(accumulated);\n    const currentSelection")],
 'SM-7 schema: loadId taken after the reads':[
   (MP,"    const loadId = useFileStore.getState().folderLoadId;\n    const newSchema","    const newSchema"),
   (MP,"    if (!isFolderLoadCurrent(loadId)) return;\n    const { metadata: currentMetadata","    const loadId = useFileStore.getState().folderLoadId;\n    if (!isFolderLoadCurrent(loadId)) return;\n    const { metadata: currentMetadata")],
 'SM-8 App: schema-wait guard removed':[(AP,"        if (!isFolderLoadCurrent(loadId)) return;\n      }\n","      }\n")],
 'SM-9 App: guard after the loop instead of inside':[(AP,"        if (!isFolderLoadCurrent(loadId)) return;\n      }\n","      }\n      if (!isFolderLoadCurrent(loadId)) return;\n")],
}
files=['tests/renderer/components/reread-after-folder-switch.test.ts','tests/renderer/components/folder-read-during-save.test.ts','tests/renderer/components/metadata-panel-schema-change.test.ts','tests/renderer/components/metadata-panel-batch-save.test.ts','tests/renderer/components/folder-read-overlap.test.ts','tests/renderer/components/folder-read-rejected-chunk.test.ts']
for name,edits in muts.items():
    for p,t in orig.items(): open(p,'w').write(t)
    for p,a,b in edits:
        s=open(p).read(); assert s.count(a)==1,(name,a); open(p,'w').write(s.replace(a,b))
    out=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts',*files],cwd=R,capture_output=True,text=True).stdout
    out=re.sub(r'\x1b\[[0-9;]*m','',out)
    failed=sorted(set(re.findall(r'×\s+(\([a-z]+\d+\))',out)))
    tot=re.findall(r'Tests\s+(.*)',out)
    print(f'{name}: {"KILLED" if failed else "SURVIVED"} by {" ".join(failed)} | {tot[-1] if tot else "?"}', flush=True)
for p,t in orig.items(): open(p,'w').write(t)
