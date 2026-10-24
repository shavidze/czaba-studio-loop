import hashlib, json, os, shutil, subprocess, sys
os.chdir('/home/runner/czaba-project/store')
OUT='/home/runner/czaba-project/tmp/studio-real-loop/a-round-138/mutations'
T='app/lib/arrangement/__tests__/'
S='app/lib/arrangement/strings.ts'; C='app/components/arrangement/ArrangementClip.tsx'; X='app/contexts/ArrangementContext.tsx'
def t(*n): return [T+(f if f.endswith('.ts') else f+'.test.tsx') for f in n]
M=[
('m53',S,"historyMoveClip: 'Move clip',","historyMoveClip: 'Move clips',",[T+'strings.test.ts']+t('gesture-guard','grid-snap-ui')),
('m54',C,"""            ? studioClipStrings.groupMovedRight
            : studioClipStrings.groupMovedLeft)({""","""            ? studioClipStrings.groupMovedLeft
            : studioClipStrings.groupMovedRight)({""",t('clip-strings-ui','grid-snap-clip-edges')),
('m55',S,"the Undo history is unchanged.`","the Undo history is unchanged`",[T+'strings.test.ts']+t('clip-fades-ui','marker-snap','grid-snap-clip-edges')),
('m56',S,"rangeBodyTitle: 'drag = time selection · click = playhead'","rangeBodyTitle: 'drag = selection · click = playhead'",[T+'strings.test.ts']+t('clip-strings-ui','track-layout','grid-snap-position','grid-snap-edit','grid-snap-clip-edges','fader-guards','marker-edge-nav-ui','marker-time-snap-ui','markers-ui')),
('m57',S,"seconds: (value: string): string => `${value} s`,","seconds: (value: string): string => `${value} sec`,",[T+'strings.test.ts']+t('clip-strings-ui')),
('m58',X,"applyEdit(moved, studioClipStrings.historyMoveClips(ids.length));","applyEdit(moved, `Move ${ids.length}`);",t('clip-strings-ui')),
('m59',C,"            : studioClipStrings.moveTitle(title)","            : `${studioClipStrings.moveTitle(title)}ა`",[T+'strings.test.ts']),
('m60',C,None,None,t('gesture-reentry','grid-snap-edit','track-layout')),
]
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
res={}
only=sys.argv[1:]
for mid,path,a,b,files in M:
    if only and mid not in only: continue
    h=sha(path); bak=f'{OUT}/{mid}.bak'; shutil.copyfile(path,bak)
    s=open(path,encoding='utf8').read()
    if mid=='m60':
        a1='        title={studioClipStrings.trimStartLabel}\n'; a2='        title={studioClipStrings.trimEndLabel}\n'
        assert s.count(a1)==1 and s.count(a2)==1
        s=s.replace(a1,'@@1').replace(a2,a1).replace('@@1',a2)
    else:
        assert s.count(a)==1,(mid,a)
        s=s.replace(a,b)
    open(path,'w',encoding='utf8').write(s)
    try:
        r=subprocess.run(['npx','vitest','run',*files,'--reporter=json',f'--outputFile={OUT}/{mid}.json'],capture_output=True,text=True,timeout=900)
        j=json.load(open(f'{OUT}/{mid}.json'))
        per={}
        for tr in j['testResults']:
            fails=[x['title'] for x in tr['assertionResults'] if x['status']!='passed']
            per[tr['name'].split('/')[-1]]={'failed':len(fails),'total':len(tr['assertionResults']),'firstFailed':fails[:4],'suiteStatus':tr['status']}
        res[mid]={'exit':r.returncode,'files':per}
    finally:
        shutil.copyfile(bak,path)
        assert sha(path)==h,(mid,'restore mismatch')
        res.setdefault(mid,{})['restoredSha256']=h
        os.remove(bak)
    print(mid,json.dumps(res[mid],ensure_ascii=False))
json.dump(res,open(f'{OUT}/results{"-"+"-".join(only) if only else ""}.json','w'),ensure_ascii=False,indent=1)
