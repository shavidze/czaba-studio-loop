import json,glob,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','out'))
agg={}
for f in sorted(glob.glob('vid131-*.json')):
    d=json.load(open(f)); rows=[]
    for s in d['steps']:
        g=[]
        for k in ('geoStatus','geoUndo'):
            if k in s: g.append((k,s[k]['net'],s[k]['raw'],s[k]['subtracted']))
        if s.get('geo'): g+= [('exportList',x['net'],x['raw'],x['subtracted']) for x in s['geo']]
        obsg=[o['text'] for o in s.get('observer',[]) if any('Ⴀ'<=c<='ჿ' for c in o['text'])]
        rows.append({'id':s['id'],'exact':s.get('exact',s.get('titleOk')),'geo':g,'obsGeorgian':obsg})
    agg[f]={'rows':rows,'net':d['net'],'error':d.get('error')}
json.dump(agg,open('aggregate.json','w'),indent=1,ensure_ascii=False)
for f,v in agg.items():
    nets=[x[1] for r in v['rows'] for x in r['geo']]
    print(f,'exact',[r['exact'] for r in v['rows']],'geoNetMax',max(nets) if nets else None,'obsGeo',sum(len(r['obsGeorgian']) for r in v['rows']),'net',v['net']['ok'])
