import json, subprocess, sys, shutil, os
L='/home/runner/czaba-project/tmp/studio-real-loop/a-round-137'
T='app/lib/arrangement/__tests__/'
S='app/lib/arrangement/strings.ts'; W='app/components/arrangement/StudioWorkspace.tsx'
M={
 'm45':(S,"shiftLockedHint: 'Shift — the time is locked;","shiftLockedHint: 'Shift — the time is fixed;",['strings.test.ts','workspace-strings-ui.test.tsx']),
 'm46':(W,"clipLaneDrag.timeLocked ? CLIP_LANE_SHIFT_LOCKED_HINT : CLIP_LANE_SHIFT_HINT","clipLaneDrag.timeLocked ? CLIP_LANE_SHIFT_HINT : CLIP_LANE_SHIFT_LOCKED_HINT",['workspace-strings-ui.test.tsx']),
 'm47':(S,"returnedCompact: 'The video went back to the compact view.',","returnedCompact: 'The video went back to the compact view',",['strings.test.ts','floating-video.test.tsx']),
 'm48':(S,"renameEmpty: (name: string): string => `The name is empty — “${name}” is kept`,\n  renamed: (name: string): string => `Group","renameEmpty: (name: string): string => `The name is empty — “${name}” remains`,\n  renamed: (name: string): string => `Group",['strings.test.ts','track-groups-ui.test.tsx']),
 'm49':(S,"`Waveform Zoom ${percent}% — view only, the sound does not change.`,","`Waveform Zoom ${percent}% — view only, the sound does not change`,",['strings.test.ts','waveform-zoom.test.tsx']),
 'm50':(S,"`Time selection: ${start} — ${end} · length ${length} ·`","`Time selection: ${start} — ${end} · ${length} ·`",['strings.test.ts','all-lane-clipboard.test.tsx']),
 'm51':(S,"`${count} clips selected`","`${count} clip selected`",['strings.test.ts','workspace-strings-ui.test.tsx']),
 'm52':(W,"{studioWorkspaceStrings.headingSuffix}","· Workspaceა",['strings.test.ts','purchased-collection-ui.test.tsx']),
}
out={}
for mid in sys.argv[1:]:
    path,old,new,tests=M[mid]
    src=open(path,encoding='utf-8').read()
    assert src.count(old)==1,(mid,old)
    shutil.copy(path,f'{L}/mutations/{mid}.orig')
    open(path,'w',encoding='utf-8').write(src.replace(old,new))
    try:
        jf=f'{L}/mutations/{mid}.json'
        subprocess.run(['npx','vitest','run',*[T+t for t in tests],'--reporter=json',f'--outputFile={jf}'],capture_output=True)
        d=json.load(open(jf))
        fails=[(r['name'].split('/')[-1],a['title']) for r in d['testResults'] for a in r['assertionResults'] if a['status']=='failed']
        out[mid]={'file':path,'tests':tests,'failed':fails,'numFailed':d['numFailedTests'],'numTotal':d['numTotalTests']}
    finally:
        shutil.copy(f'{L}/mutations/{mid}.orig',path)
    print(mid,json.dumps(out[mid],ensure_ascii=False))
json.dump(out,open(f'{L}/mutations/result-{"_".join(sys.argv[1:])}.json','w'),ensure_ascii=False,indent=1)
