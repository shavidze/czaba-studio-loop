import json
a=json.load(open('b-round-400/screens/screen401.json'));b=json.load(open('b-round-415/screens/screen416.json'))
key=lambda e:(e.get('region'),e.get('text'))
for k in a['screens']:
    la=a['screens'][k];lb=b['screens'].get(k,[])
    out=lambda l:sum(1 for e in l if not e.get('inClip') and not e.get('inLibraryList'))
    ka=[key(e) for e in la];kb=[key(e) for e in lb]
    print(k,'count',len(la),len(lb),'outside',out(la),out(lb),'only401',[t for t in ka if t not in kb],'only416',[t for t in kb if t not in ka],'identical-list',ka==kb)
for vp in a['journey']:
    ja=a['journey'][vp];jb=b['journey'].get(vp,{})
    diff=sorted(kk for kk in set(ja)|set(jb) if ja.get(kk)!=jb.get(kk))
    print(vp,'url',jb.get('url'),'clipLefts',jb.get('clipLefts'),'diffKeys',diff,'positionAfterPlay',ja.get('positionAfterPlay'),'=>',jb.get('positionAfterPlay'))
