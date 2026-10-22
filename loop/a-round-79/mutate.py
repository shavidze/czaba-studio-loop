import shutil, subprocess, sys, filecmp, os, re
ROOT='/home/runner/czaba-project/store'
SCR='/home/runner/czaba-project/tmp/studio-real-loop/a-round-79'
G='app/lib/arrangement/groups.ts'
W='app/components/arrangement/StudioWorkspace.tsx'
H='app/components/arrangement/ArrangementGroupHeader.tsx'
C='app/components/arrangement/ArrangementClip.tsx'
BLOCK="""      if (modifier && key === 'g' && !event.altKey) {
        event.preventDefault();
        if (!event.repeat) {
          if (event.shiftKey) {
            ungroupSelectedTrackRows();
          } else {
            groupSelectedTrackRows();
          }
        }
        return;
      }
"""
MOD="""      if (modifier) {
        return;
      }
"""
def move_block(s):
    assert s.count(BLOCK)==1 and s.count(BLOCK+MOD)==1
    return s.replace(BLOCK+MOD, MOD+BLOCK)
M={
 'a':(G,[("return groups.length === 0 ? { ...rest, tracks } : { ...rest, tracks, groups };","return { ...rest, tracks, groups };")]),
 'b':(G,[("if (Math.max(...indices) - Math.min(...indices) + 1 !== picked.length) {","if (indices.length < 0) {")]),
 'c':(G,[("if (picked.some((row) => row.parentId !== parentId)) {","if (picked.length < 0) {")]),
 'd':(G,[("selected.has(entry.id) ? { ...entry, parentId: group.id } : entry,","entry,")]),
 'e':(W,[("groupSelectedRows(before, liveTrackSelection(before, trackSelectionRef.current));","groupSelectedRows(before, trackSelectionRef.current);")]),
 'f':(H,[("      data-group-id={group.id}\n","      data-group-id={group.id}\n      data-track-id={group.id}\n")]),
 'g':(C,[("    return last.dataset.trackId ?? null;\n  }\n  return null;\n}","    return last.dataset.trackId ?? null;\n  }\n  return last.dataset.trackId ?? null;\n}")]),
 'h':(W,[("return metrics && groupRowsHeight > 0","return metrics && groupRowsHeight < 0")]),
 'i':(W,'move'),
}
tests=['app/lib/arrangement/__tests__/groups.test.ts','app/lib/arrangement/__tests__/track-groups-ui.test.tsx']
out=open(os.path.join(SCR,'mutations.txt'),'w')
for k in sys.argv[1:] or sorted(M):
    path,edits=M[k]
    full=os.path.join(ROOT,path)
    pristine=os.path.join(SCR,'pristine',os.path.basename(path))
    shutil.copyfile(full,pristine)
    s=open(full).read()
    if edits=='move':
        s=move_block(s)
    else:
        for a,b in edits:
            assert s.count(a)==1,(k,a)
            s=s.replace(a,b)
    open(full,'w').write(s)
    try:
        r=subprocess.run(['npx','vitest','run',*tests],cwd=ROOT,capture_output=True,text=True,timeout=600)
        txt=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=sorted(set(re.findall(r'FAIL\s+\S+ > [^>]+> (.+)',txt)))
        summary=[l.strip() for l in txt.splitlines() if l.strip().startswith('Tests ')]
    finally:
        shutil.copyfile(pristine,full)
    same=filecmp.cmp(pristine,full,shallow=False)
    out.write(f"({k}) {path}: {summary} restored_cmp={'OK' if same else 'DIFF'}\n")
    for f in fails: out.write(f"    red: {f.strip()}\n")
    out.flush()
out.close()
print(open(os.path.join(SCR,'mutations.txt')).read())
