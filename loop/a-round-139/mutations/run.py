import json, subprocess, hashlib, shutil, sys, os
os.chdir('/home/runner/czaba-project/store')
OUT='/home/runner/czaba-project/tmp/studio-real-loop/a-round-139/mutations'
D='app/lib/arrangement/__tests__/'
LANE='app/components/arrangement/ArrangementLane.tsx'
WS='app/components/arrangement/StudioWorkspace.tsx'
ST='app/lib/arrangement/strings.ts'
named=open('/home/runner/czaba-project/tmp/studio-real-loop/a-round-139/vitest-files.txt').read().split()
M={
'm61':(ST,"`${name} — set as the active track`","`${name} — set active track`",named),
'm62':(WS,'button[aria-label*="— set as the active track"]','button[aria-label*="— აქტიური ხაზის არჩევა"]',named),
'm63':(LANE,"${selected ? studioLaneStrings.selectedSuffix : ''}","${selected ? '' : studioLaneStrings.selectedSuffix}",named),
'm64':(LANE,"? ` · ${studioLaneMoveStrings.noRoom}`","? ' · No space here'",[D+'grid-snap-loop-drop.test.tsx',D+'marker-snap.test.tsx']),
'm65':(LANE,"{studioClipStrings.seconds(Math.abs(range.end - range.start).toFixed(3))} ·{' '}","{Math.abs(range.end - range.start).toFixed(3)} sec ·{' '}",[D+'delete-selection-ui.test.tsx']),
'm66':(LANE,"{isVideo ? studioLaneStrings.dropVideoHere : studioLaneStrings.videoNotOnAudioTrack}","{isVideo ? studioLaneStrings.videoNotOnAudioTrack : studioLaneStrings.dropVideoHere}",[D+'lane-strings-ui.test.tsx']),
'm67':(ST,"` · start ${start} · length ${length} · source offset ${offset}`","` · start ${start} · length ${length}`",[D+'strings.test.ts',D+'lane-strings-ui.test.tsx']),
'm68':(LANE,"{studioLaneStrings.activeBadge}</span>","{studioLaneStrings.activeBadge}ა</span>",[D+'strings.test.ts']),
}
sel=sys.argv[1:] or list(M)
res={}
if os.path.exists(OUT+'/results.json'): res=json.load(open(OUT+'/results.json'))
for k in sel:
    f,a,b,tests=M[k]
    src=open(f,encoding='utf-8').read(); h=hashlib.sha256(src.encode()).hexdigest()
    assert src.count(a)==1,(k,a)
    shutil.copy(f,f'{OUT}/{k}.bak')
    try:
        open(f,'w',encoding='utf-8').write(src.replace(a,b))
        jf=f'{OUT}/{k}.json'
        p=subprocess.run(['npx','vitest','run',*tests,'--reporter=json',f'--outputFile={jf}'],capture_output=True,text=True)
    finally:
        shutil.copy(f'{OUT}/{k}.bak',f)
    h2=hashlib.sha256(open(f,'rb').read()).hexdigest()
    assert h==h2,k
    d=json.load(open(jf))
    failed=[]
    for r in d['testResults']:
        for t in r['assertionResults']:
            if t['status']=='failed': failed.append(r['name'].split('/')[-1]+' :: '+t['title'])
    res[k]={'file':f,'exit':p.returncode,'failedCount':len(failed),'failed':failed,'restoredSha256':h2}
    print(k,'exit',p.returncode,'failed',len(failed))
    for x in failed: print('   ',x)
json.dump(res,open(OUT+'/results.json','w'),indent=1,ensure_ascii=False)
