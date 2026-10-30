import subprocess, json, os, sys
os.chdir('/tmp/c270-new')
P='app/components/arrangement/ArrangementDetailPanel.tsx'; S='app/lib/arrangement/strings.ts'
T='app/lib/arrangement/__tests__/'
files=[T+f for f in ['detail-panel-polish.test.tsx','background-time-selection-ui.test.tsx','strings.test.ts','navigation-strings-ui.test.tsx']]
M=[
('NONE',P,'',''),
('M-CLAMP-DISPLAY',P,"? range.start : null;\n  const onClipEnd = clip && range && rangeOnClip ? range.end : null;","? Math.max(range.start, clip.start) : null;\n  const onClipEnd = clip && range && rangeOnClip ? Math.min(range.end, clip.start + clip.duration) : null;"),
('M-NO-KEEP',P,"    if (\n      range &&\n      rangeOnClip &&\n      rangeInputText(","    if (\n      false &&\n      range &&\n      rangeOnClip &&\n      rangeInputText("),
('M-LANE',P,"range.allTracks ? studioEditStrings.allTracks : selection.laneName","selection.laneName"),
('M-RAW-TEXT',P,"rangeInputText(parseSecondsInput(startText)) === rangeInputText(range.start)","startText === rangeInputText(range.start)"),
('M-RAW-TEXT-BOTH',P,"rangeInputText(parseSecondsInput(startText)) === rangeInputText(range.start) &&\n      rangeInputText(parseSecondsInput(endText)) === rangeInputText(range.end)","startText === rangeInputText(range.start) &&\n      endText === rangeInputText(range.end)"),
('C-M-KEEP-SETS',P,"      setStatus(\n        detailRangeAppliedMessage(\n          range,","      setTimeRange({ start: range.start, end: range.end, trackId: selection.clip.trackId });\n      setStatus(\n        detailRangeAppliedMessage(\n          range,"),
('C-M-NO-ONCLIP',P,"    if (\n      range &&\n      rangeOnClip &&\n      rangeInputText(","    if (\n      range &&\n      rangeInputText("),
('M-STR-DONE',S,"'Clip split at the time selection; the part inside it is selected.'","'Clip split at both edges of the time selection; the middle part is selected.'"),
('M-STR-CLIPS',S,"`Split at the time selection; the ${count} clips inside it are selected.`","`Clips split at the edges of the time selection; the ${count} parts inside it are selected.`"),
('M-STR-TITLE',S,"studioShortcutTitle('Split clips at the time selection', 'split')","studioShortcutTitle('Split at both edges of the time selection', 'split')"),
]
for name,f,a,b in M:
    orig=open(f).read()
    if a:
        assert orig.count(a)==1,(name,orig.count(a))
        open(f,'w').write(orig.replace(a,b))
    try:
        subprocess.run(['npx','vitest','run','--reporter=json','--outputFile=/tmp/c270-mut.json',*files],capture_output=True,text=True)
        j=json.load(open('/tmp/c270-mut.json'))
        red=[x['title'][:60] for r in j['testResults'] for x in r['assertionResults'] if x['status']!='passed']
        print(f"== {name}: total={j['numTotalTests']} failed={j['numFailedTests']}",flush=True)
        for x in red: print('   RED:',x,flush=True)
    finally:
        open(f,'w').write(orig)
