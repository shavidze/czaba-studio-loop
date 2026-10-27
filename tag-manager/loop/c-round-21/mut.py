import subprocess, shutil, re, sys, os
SRC='/home/runner/czaba-project/czaba-tag-manager'
MUT='/tmp/c-r21-mut'
F='src/renderer/src/components/metadata-editor/MetadataPanel.tsx'
OUT='/home/runner/czaba-project/tmp/tag-manager-loop/c-round-21/mutants.log'
if not os.path.exists(MUT):
    subprocess.run(['rsync','-a','--exclude','node_modules','--exclude','.git','--exclude','out',SRC+'/',MUT+'/'],check=True)
    os.symlink(SRC+'/node_modules',MUT+'/node_modules')
orig=open(SRC+'/'+F).read()
def rep(s,a,b,count=1):
    assert s.count(a)>=1,(a,)
    return s.replace(a,b) if count==0 else s.replace(a,b,count)
MUTS={}
MUTS['M1']=lambda s: rep(rep(s,"        mergeFieldsTypedDuringSave(typedDuringSave);\n        showToast('Tags saved'","        showToast('Tags saved'"),"            mergeFieldsTypedDuringSave(typedDuringSave);\n","")
MUTS['M2']=lambda s: rep(s,"if (current !== undefined && !isSameFieldValue(current, startMetadata[key])) {","if (current !== undefined) {")
MUTS['M3']=lambda s: rep(s,"    return a.length === b.length && a.every((item, index) => item === b[index]);","    return a === b;")
MUTS['M4']=lambda s: rep(s,"  return typed;\n}","  return { ...editingMetadata };\n}")
MUTS['M5']=lambda s: rep(s,"            mergeFieldsTypedDuringSave(typedDuringSave);\n","")
MUTS['M6']=lambda s: s.replace("collectFieldsTypedDuringSave(startEditingMetadata)","collectFieldsTypedDuringSave(useMetadataStore.getState().editingMetadata)")
def m7(s):
    s=rep(s,"        if (selectionUnchanged) setEditingMetadata({ ...(updated as WavMetadata) });\n        mergeFieldsTypedDuringSave(typedDuringSave);\n","        mergeFieldsTypedDuringSave(typedDuringSave);\n        if (selectionUnchanged) setEditingMetadata({ ...(updated as WavMetadata) });\n")
    s=rep(s,"            setEditingMetadata({});\n            mergeFieldsTypedDuringSave(typedDuringSave);\n","            mergeFieldsTypedDuringSave(typedDuringSave);\n            setEditingMetadata({});\n")
    return s
MUTS['M7']=m7
def m8(s):
    s=rep(s,"if (selectionUnchanged) skipSyncRef.current = true;","if (selectionUnchanged && Object.keys(typedDuringSave).length === 0) skipSyncRef.current = true;")
    s=rep(s,"            mergeFieldsTypedDuringSave(typedDuringSave);\n","            mergeFieldsTypedDuringSave(typedDuringSave);\n            if (Object.keys(typedDuringSave).length > 0) skipSyncRef.current = false;\n")
    return s
MUTS['M8']=m8
log=open(OUT,'w')
sel=sys.argv[1:] or list(MUTS)
for name in sel:
    m=MUTS[name](orig); assert m!=orig, name
    open(MUT+'/'+F,'w').write(m)
    r=subprocess.run(['npx','vitest','run','-c','vitest.config.renderer.ts','tests/renderer/components/metadata-panel-batch-save.test.ts'],cwd=MUT,capture_output=True,text=True)
    o=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    fails=sorted(set(re.findall(r'^\s+× (\(\w+\))',o,re.M)))
    summ=[l.strip() for l in o.splitlines() if l.strip().startswith('Tests ')]
    line=f"{name}: exit={r.returncode} {summ} killers={fails}"
    print(line); log.write(line+'\n'); log.flush()
open(MUT+'/'+F,'w').write(orig)
