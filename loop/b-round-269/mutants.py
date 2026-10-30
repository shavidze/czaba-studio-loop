import subprocess, sys, re, shutil
root=sys.argv[1]
P=f'{root}/app/components/arrangement/ArrangementDetailPanel.tsx'
S=f'{root}/app/lib/arrangement/strings.ts'
files=[f'app/lib/arrangement/__tests__/{f}' for f in ['strings.test.ts','navigation-strings-ui.test.tsx','background-time-selection-ui.test.tsx','detail-panel-polish.test.tsx']]
muts={
 'M-CLAMP-DISPLAY':(P,"  const onClipStart = clip && range && rangeOnClip ? range.start : null;\n  const onClipEnd = clip && range && rangeOnClip ? range.end : null;","  const onClipStart = clip && range && rangeOnClip ? Math.max(range.start, clip.start) : null;\n  const onClipEnd =\n    clip && range && rangeOnClip ? Math.min(range.end, clip.start + clip.duration) : null;"),
 'M-NO-KEEP':(P,"      startText === rangeInputText(range.start) &&","      false &&"),
 'M-LANE':(P,"range.allTracks ? studioEditStrings.allTracks : selection.laneName","selection.laneName"),
 'M-STR-DONE':(S,"'Clip split at the time selection; the part inside it is selected.'","'Clip split at both edges of the time selection; the middle part is selected.'"),
 'M-STR-CLIPS':(S,"`Split at the time selection; the ${count} clips inside it are selected.`","`Clips split at the edges of the time selection; the ${count} parts inside it are selected.`"),
 'M-STR-TITLE':(S,"'Split clips at the time selection'","'Split at both edges of the time selection'"),
}
for name,(path,old,new) in muts.items():
    src=open(path).read(); assert src.count(old)==1,(name,src.count(old))
    open(path,'w').write(src.replace(old,new))
    try:
        out=subprocess.run(['npx','vitest','run',*files],cwd=root,capture_output=True,text=True,timeout=900).stdout
    finally:
        open(path,'w').write(src)
    out=re.sub(r'\x1b\[[0-9;]*m','',out)
    reds=sorted(set(l.strip() for l in out.splitlines() if ' × ' in l or l.strip().startswith('×') or 'FAIL ' in l))
    summary=[l for l in out.splitlines() if l.strip().startswith('Tests ')]
    print(name, summary, len(reds)); [print('   ',r[:160]) for r in reds]
out=subprocess.run(['npx','vitest','run',*files],cwd=root,capture_output=True,text=True,timeout=900).stdout
print('UNMUTATED',[l for l in re.sub(r'\x1b\[[0-9;]*m','',out).splitlines() if l.strip().startswith('Tests ')])
