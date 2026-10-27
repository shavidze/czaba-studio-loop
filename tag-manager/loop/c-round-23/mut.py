import subprocess, re, sys
MUT='/tmp/c-r23-mut'
OUT='/home/runner/czaba-project/tmp/tag-manager-loop/c-round-23/mutants.log'
FL='src/renderer/src/components/file-list/FileList.tsx'
MP='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
TB='tests/renderer/components/metadata-panel-batch-save.test.ts'
TF='tests/renderer/components/file-list.test.ts'
def rep(s,a,b):
    assert s.count(a)==1,(a,s.count(a)); return s.replace(a,b)
def mi(name):
    return (TB, lambda s: rep(s,f"vi.mocked(window.api.{name}).mockReset()",f"vi.mocked(window.api.{name}).mockClear()"), TB)
MUTS={
 'M7':(FL, lambda s: rep(s,"      anchorPathRef.current = file.path;\n","      if (!e.shiftKey) anchorPathRef.current = file.path;\n"), TF),
 'MI-1':mi('writeMetadataBatch'),'MI-2':mi('readMetadataBatch'),'MI-3':mi('writeMetadata'),'MI-4':mi('readMetadata'),'MI-5':mi('scanFolder'),
 'MI-all':(TB, lambda s: s.replace(".mockReset()",".mockClear()"), TB),
 'MS-1':(MP, lambda s: rep(rep(s,"const startEditingMetadata = useMetadataStore.getState().editingMetadata;","const startEditingMetadata = editingMetadata;"),
     "}, [selectedFiles, fields, setIsSaving, setEditingMetadata, showToast, updateFileMetadata]);","}, [selectedFiles, editingMetadata, fields, setIsSaving, setEditingMetadata, showToast, updateFileMetadata]);"), TB),
}
log=open(OUT,'a')
for name in (sys.argv[1:] or list(MUTS)):
    f,fn,t=MUTS[name]; orig=open(MUT+'/'+f).read(); m=fn(orig); assert m!=orig
    try:
        open(MUT+'/'+f,'w').write(m)
        r=subprocess.run(['npx','vitest','run','-c','vitest.config.renderer.ts',t],cwd=MUT,capture_output=True,text=True)
        o=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=re.findall(r'^\s+× (.*)$',o,re.M)
        errs=[l.strip() for l in o.splitlines() if 'AssertionError' in l][:3]
        summ=[l.strip() for l in o.splitlines() if l.strip().startswith('Tests ')]
        line=f"{name} [{f} -> {t}]: exit={r.returncode} {summ} failed={fails} msgs={errs}"
        print(line); log.write(line+'\n'); log.flush()
    finally:
        open(MUT+'/'+f,'w').write(orig)
