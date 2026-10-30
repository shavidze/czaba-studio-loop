import subprocess, sys, re, shutil
P='app/components/arrangement/ArrangementDetailPanel.tsx'; S='app/lib/arrangement/strings.ts'
T='app/lib/arrangement/__tests__/'
files=[T+f for f in ['detail-panel-polish.test.tsx','background-time-selection-ui.test.tsx','strings.test.ts','navigation-strings-ui.test.tsx']]
M={
'M-CLAMP-DISPLAY':(P,"const onClipStart = clip && range && rangeOnClip ? range.start : null;\n  const onClipEnd = clip && range && rangeOnClip ? range.end : null;","const onClipStart = clip && range && rangeOnClip ? Math.max(range.start, clip.start) : null;\n  const onClipEnd = clip && range && rangeOnClip ? Math.min(range.end, clip.start + clip.duration) : null;"),
'M-NO-KEEP':(P,"    if (\n      range &&\n      rangeOnClip &&","    if (\n      false &&\n      range &&\n      rangeOnClip &&"),
'M-LANE':(P,"range.allTracks ? studioEditStrings.allTracks : selection.laneName","selection.laneName"),
'M-RAW-TEXT':(P,"rangeInputText(parseSecondsInput(startText)) === rangeInputText(range.start) &&\n      rangeInputText(parseSecondsInput(endText)) === rangeInputText(range.end)","startText === rangeInputText(range.start) &&\n      endText === rangeInputText(range.end)"),
'M-STR-DONE':(S,"'Clip split at the time selection; the part inside it is selected.'","'Clip split at both edges of the time selection; the middle part is selected.'"),
'M-STR-CLIPS':(S,"`Split at the time selection; the ${count} clips inside it are selected.`","`Clips split at the edges of the time selection; the ${count} parts inside it are selected.`"),
'M-STR-TITLE':(S,"studioShortcutTitle('Split clips at the time selection', 'split')","studioShortcutTitle('Split at both edges of the time selection', 'split')"),
}
for name,(f,a,b) in M.items():
    orig=open(f).read(); assert orig.count(a)==1,name
    open(f,'w').write(orig.replace(a,b))
    try:
        r=subprocess.run(['npx','vitest','run','--reporter=verbose',*files],capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=sorted(set(re.findall(r'^\s*[×✗] .*?> ([^>]+?)(?: \d+ms)?$',out,re.M)))
        summ=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
        print(f"== {name}: rc={r.returncode} {summ}")
        for x in fails: print('   RED:',x[:110])
    finally:
        open(f,'w').write(orig)
