import subprocess, re, sys, os
SRC='/home/runner/czaba-project/czaba-tag-manager'
OLD='/tmp/c-r22-old'
MUT='/tmp/c-r22-mut'
F='src/renderer/src/components/file-list/FileList.tsx'
T='tests/renderer/components/file-list.test.ts'
OUT='/home/runner/czaba-project/tmp/tag-manager-loop/c-round-22/mutants.log'
if not os.path.exists(MUT):
    subprocess.run(['rsync','-a','--exclude','node_modules','--exclude','.git','--exclude','out',SRC+'/',MUT+'/'],check=True)
    os.symlink(SRC+'/node_modules',MUT+'/node_modules')
orig=open(SRC+'/'+F).read()
def rep(s,a,b):
    assert s.count(a)==1,(a,)
    return s.replace(a,b)
LOOKUP="""      const anchorIndex =
        e.shiftKey && anchorPath !== null
          ? visibleFiles.findIndex((visibleFile) => visibleFile.path === anchorPath)
          : -1;"""
CLEAR="""  useEffect(() => {
    if (!hasSelection) anchorPathRef.current = null;
  }, [hasSelection]);"""
MUTS={}
MUTS['M1']=lambda s: open(OLD+'/'+F).read()
MUTS['M2']=lambda s: rep(s,CLEAR,"""  useEffect(() => {
    anchorPathRef.current = null;
  }, [files]);""")
MUTS['M3']=lambda s: rep(s,CLEAR,"""  useEffect(() => {}, [hasSelection]);""")
MUTS['M4']=lambda s: rep(s,LOOKUP,"""      const anchorIndex =
        e.shiftKey && anchorPath !== null
          ? useFileStore.getState().files.findIndex((visibleFile) => visibleFile.path === anchorPath)
          : -1;""")
MUTS['M5']=lambda s: rep(s,LOOKUP,"""      const foundIndex =
        anchorPath !== null
          ? visibleFiles.findIndex((visibleFile) => visibleFile.path === anchorPath)
          : -1;
      const anchorIndex = e.shiftKey ? Math.max(foundIndex, 0) : -1;""")
MUTS['M6']=lambda s: rep(s,"      anchorPathRef.current = file.path;\n","      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) anchorPathRef.current = file.path;\n")
log=open(OUT,'w')
sel=sys.argv[1:] or list(MUTS)
try:
    for name in sel:
        m=MUTS[name](orig); assert m!=orig, name
        open(MUT+'/'+F,'w').write(m)
        r=subprocess.run(['npx','vitest','run','-c','vitest.config.renderer.ts',T],cwd=MUT,capture_output=True,text=True)
        o=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=sorted(set(re.findall(r'^\s+× (\(\w+(?:-\w+)?\))',o,re.M)))
        summ=[l.strip() for l in o.splitlines() if l.strip().startswith('Tests ')]
        line=f"{name}: exit={r.returncode} {summ} killers={fails}"
        print(line); log.write(line+'\n'); log.flush()
finally:
    open(MUT+'/'+F,'w').write(orig)
r=subprocess.run(['npx','vitest','run','-c','vitest.config.renderer.ts',T],cwd=MUT,capture_output=True,text=True)
o=re.sub(r'\x1b\[[0-9;]*m','',r.stdout)
line='restored: '+str([l.strip() for l in o.splitlines() if l.strip().startswith('Tests ')])
print(line); log.write(line+'\n')
