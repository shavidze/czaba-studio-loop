import json,os,collections
D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-152/out/'
summ={}
allc=[]; under=[]
for vp in (1280,1440):
    r1=json.load(open(D+f'd6/d6-{vp}-r1.json')); r2=json.load(open(D+f'd6/d6-{vp}-r2.json'))
    det={}
    for s in ('S0','S1','S2'):
        a={e['key']:e for e in r1['states'][s]['elements']}; b={e['key']:e for e in r2['states'][s]['elements']}
        mx=0;mk=None;diffs=[]
        for k in a.keys()&b.keys():
            d=max(abs(a[k][f]-b[k][f]) for f in 'xywh')
            if d>0: diffs.append((d,k))
            if d>mx: mx=d;mk=k
        only1=sorted(a.keys()-b.keys()); only2=sorted(b.keys()-a.keys())
        diffs.sort(reverse=True)
        det[s]={'maxPx':mx,'maxKey':mk,'over1px':[{'key':k,'px':d} for d,k in diffs if d>1],'onlyRun1':only1,'onlyRun2':only2,'nRun1':len(a),'nRun2':len(b)}
        for e in r1['states'][s]['elements']:
            if e['kind'] in ('interactive',) and (e['w']<24 or e['h']<24):
                under.append({'vp':vp,'state':s,'key':e['key'],'tag':e['tag'],'role':e['role'],'w':e['w'],'h':e['h'],'disabled':e['disabled']})
    out={'label':'post-V-2a RV-1-TYPE capture (round-152 tree (round-151 V-2a tree + A r152 test/doc))','viewport':f'{vp}x{720 if vp==1280 else 900}','capturedUtc':'2026-10-25','tree':'e94ae88 + A round-151 working tree (a-round-151/end-sha256.txt)','keyRule':r1['keyRule'],
         'S1setup':[s['step'] for s in r1['s1Steps']],
         'S1setupObserved':r1['s1Steps'],
         'states':{s:{'header':r1['states'][s]['header'],'shot':r1['states'][s].get('shot'),'scopeNote':r1['states'][s].get('scopeNote'),'elements':r1['states'][s]['elements']} for s in ('S0','S1','S2')},
         'determinism':det,'net':[r1['net'],r2['net']]}
    json.dump(out,open(D+f'bbox-post-v2a-{vp}.json','w'),ensure_ascii=False,indent=1)
    summ[vp]={s:{'maxPx':det[s]['maxPx'],'maxKey':det[s]['maxKey'],'over1':len(det[s]['over1px']),'only1':det[s]['onlyRun1'],'only2':det[s]['onlyRun2'],'n':det[s]['nRun1']} for s in det}
    for st in ('S0','S1'):
        for c in r1['contrast'+st]: allc.append(dict(c,vp=vp,state=st))
    for st in ('S0','S1'):
        for px in r1['pix'+st]: px.update(vp=vp,state=st)
    summ[vp]['pix']=r1['pixS0']+r1['pixS1']
# contrast grouped by token
by=collections.defaultdict(list)
for c in allc: by[c['token'].split(':')[-1]].append(c)
tok={}
for t,L in sorted(by.items()):
    num=[c for c in L if c['ratio']!='?']
    fails=[c for c in num if not c['pass']]
    tok[t]={'n':len(L),'computed':len(num),'unknownBackdrop':len(L)-len(num),'min':min([c['ratio'] for c in num],default=None),'max':max([c['ratio'] for c in num],default=None),'fails':len(fails),
            'failSamples':[{k:c[k] for k in ('vp','state','key','fg','bg','opacity','ratio','fontPx','cls','disabled')} for c in sorted(fails,key=lambda c:c['ratio'])[:12]]}
pix=summ[1280].pop('pix')+summ[1440].pop('pix')
json.dump({'label':'post-V-2a RV-1-TYPE capture (round-152 tree (round-151 V-2a tree + A r152 test/doc))','method':'computed fg (x cumulative opacity) composited over ancestor background-color chain; ? where an ancestor has background-image or the element sits on canvas/video/img or inside a clip (waveform). Pixel check: modal pixel in element box = bg, highest-contrast pixel colour (>=3 px) = fg, on the real screenshot (dpr 1).',
 'byToken':tok,'pixelSamples':pix,'elements':allc},open(D+'d6/contrast-post-v2a.json','w'),ensure_ascii=False,indent=1)
json.dump(under,open(D+'d6/under24px-post-v2a.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(summ,ensure_ascii=False,indent=0)[:3000])
for t,v in tok.items(): print(t,{k:v[k] for k in ('n','computed','unknownBackdrop','min','max','fails')})
print('under24',len(under),len({(u['vp'],u['key']) for u in under}))
