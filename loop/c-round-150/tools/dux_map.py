import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
b=json.load(open(L+'c-round-125/out/contrast-baseline.json'))['elements']
c=json.load(open(L+'c-round-150/out/d6/contrast-post-v1b.json'))['elements']
tgt=[e for e in b if e['ratio']!='?' and not e['pass'] and not e['disabled']]
out=[];unm=[]
for e in tgt:
  cand=[x for x in c if x['vp']==e['vp'] and x['state']==e['state'] and x['key']==e['key']]
  how='key'
  if not cand:
    cand=[x for x in c if x['vp']==e['vp'] and x['state']==e['state'] and x['token']==e['token'] and max(abs(p-q) for p,q in zip(x['box'],e['box']))<=6]; how='box'
  if not cand: unm.append(e); continue
  x=min(cand,key=lambda x:sum(abs(p-q) for p,q in zip(x['box'],e['box'])))
  out.append({'vp':e['vp'],'state':e['state'],'key125':e['key'],'key149':x['key'],'match':how,'token':e['token'],'ratio125':e['ratio'],'ratio149':x['ratio'],'fg149':x['fg'],'bg149':x['bg'],'pass45':x['ratio']!='?' and x['ratio']>=4.5})
res={'n':len(tgt),'matched':len(out),'unmatched':[{k:e[k] for k in ('vp','state','key','token','box','ratio')} for e in unm],'below45':[o for o in out if not o['pass45']],'min149':min(o['ratio149'] for o in out if o['ratio149']!='?'),'rows':out}
json.dump(res,open(L+'c-round-150/out/rv2-dux-map.json','w'),indent=1,ensure_ascii=False)
print(res['n'],res['matched'],len(res['unmatched']),len(res['below45']),res['min149'])
for u in res['unmatched']: print('UNM',u)
for o in res['below45']: print('LOW',o)
import collections; print(collections.Counter((o['token'],o['match']) for o in out))
