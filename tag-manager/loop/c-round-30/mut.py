import os, re, subprocess, shutil, sys
SRC='/tmp/c-r30-new'; W='/tmp/c-r30-mut'
OUT='/home/runner/czaba-project/tmp/tag-manager-loop/c-round-30/mutants.log'
U='src/renderer/src/lib/utils.ts'; FB='src/renderer/src/components/sidebar/FolderBrowser.tsx'; AP='src/renderer/src/App.tsx'
TESTS=['tests/renderer/components/folder-read-rejected-chunk.test.ts','tests/renderer/components/folder-read-during-save.test.ts','tests/renderer/stores/file-store.test.ts','tests/renderer/utils/utils.test.ts']
def sub(path, old, new, occ=None):
    fp=os.path.join(W,path); s=open(fp).read(); n=s.count(old)
    if occ is None: assert n==1,(path,old,n); s=s.replace(old,new)
    else:
        assert n>occ,(path,old,n); idx=-1
        for _ in range(occ+1): idx=s.index(old,idx+1)
        s=s[:idx]+new+s[idx+len(old):]
    open(fp,'w').write(s)
def run(name, edits, full=False):
    shutil.rmtree(W,ignore_errors=True); shutil.copytree(SRC,W,symlinks=True)
    for e in edits: sub(*e)
    d=''.join(subprocess.run(['diff','-u',os.path.join(SRC,p),os.path.join(W,p)],capture_output=True,text=True).stdout for p in (U,FB,AP))
    r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts']+([] if full else TESTS),cwd=W,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    tests=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    errs=[l for l in out.splitlines() if 'Transform failed' in l or 'SyntaxError' in l][:3]
    fails=sorted(set(re.findall(r'^\s*×\s*(\([a-z0-9]+\))',out,re.M)))
    with open(OUT,'a') as f: f.write(f'## {name}{" (full suite)" if full else ""}\n```diff\n{d}```\n{tests} {errs}\nkilled by: {fails}\n\n')
    print(name,'full' if full else '',tests,fails,errs,flush=True)
ELSE_FB="      } else {\n        setMetadata({});\n      }\n"
ELSE_AP="        } else {\n          setMetadata({});\n        }\n"
SCAN_FB="      const wavFiles = await window.api.scanFolder(path);\n      setFiles(wavFiles);\n"
M=[('baseline',[]),
 ('EX-1',[(U,'failedPaths.push(...chunk);','failedPaths.splice(0, failedPaths.length, ...chunk);')]),
 ('EX-2',[(U,'failedPaths.push(...chunk);','if (failedPaths.length === 0) failedPaths.push(...chunk);')]),
 ('ME-1 remove handleOpenFolder else',[(FB,ELSE_FB,'      }\n',0)]),
 ('ME-2 remove App openFolder else',[(AP,ELSE_AP,'        }\n')]),
 ('ME-3 remove handleRescan else',[(FB,ELSE_FB,'      }\n',1)]),
 ('ME-4 handleOpenFolder else adds toast',[(FB,ELSE_FB,"      } else {\n        setMetadata({});\n        useMetadataStore.getState().showToast('Folder is empty', 'error');\n      }\n",0)]),
 ('ME-5 handleOpenFolder unconditional setMetadata after scan',[(FB,ELSE_FB,'      }\n',0),(FB,SCAN_FB,"      const wavFiles = await window.api.scanFolder(path);\n      setMetadata({});\n      setFiles(wavFiles);\n")]),
]
open(OUT,'w').close()
for n,e in M: run(n,e)
run(M[-1][0],M[-1][1],full=True)
