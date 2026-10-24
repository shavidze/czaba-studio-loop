import json
out={}
for w in ['1440','1280']:
  b=json.load(open(f'c-round-138/out/layout130-{w}-r1.json'))['rows']
  n=json.load(open(f'c-round-139/out/layout130-{w}-r1.json'))['rows']
  o=out[w]={}
  for s in ['S0','S1','S2']:
    be={e['key']:e for e in b[s]['elements']}; ne={e['key']:e for e in n[s]['elements']}
    deltas=[]
    for k in sorted(set(be)|set(ne)):
      x=be.get(k); y=ne.get(k)
      if not x or not y: deltas.append({'key':k,'only':'base' if x else 'new'}); continue
      d=max(abs(x[c]-y[c]) for c in 'xywh')
      if d>1: deltas.append({'key':k,'base':[x[c] for c in 'xywh'],'new':[y[c] for c in 'xywh'],'max':d})
    o[s]={'nBase':len(be),'nNew':len(ne),'deltas':deltas}
json.dump(out,open('c-round-139/out/layout-compare.json','w'),indent=1,ensure_ascii=False)
for w in out:
  for s in ['S0','S1','S2']:
    x=out[w][s]; print(w,s,x['nBase'],x['nNew'],'deltas',len(x['deltas']))
    for d in x['deltas'][:20]: print('   ',d)
