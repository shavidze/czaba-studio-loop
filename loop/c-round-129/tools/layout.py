import json,sys
out={}
for w,tag in [('1440','r2'),('1280','r1')]:
  b=json.load(open(f'c-round-125/out/bbox-baseline-{w}.json'))['states']
  n=json.load(open(f'c-round-127/out/main-{w}-{tag}.json'))['rows']
  o=out[w]={}
  for s in ['S0','S1','S2']:
    be={e['key']:e for e in b[s]['elements']}; ne={e['key']:e for e in n[s]['elements']}
    deltas=[]
    for k in sorted(set(be)|set(ne)):
      x=be.get(k); y=ne.get(k)
      if not x or not y: deltas.append({'key':k,'only':'base' if x else 'new','box':(x or y) and [ (x or y)[c] for c in 'xywh']}); continue
      d=max(abs(x[c]-y[c]) for c in 'xywh')
      if d>1: deltas.append({'key':k,'base':[x[c] for c in 'xywh'],'new':[y[c] for c in 'xywh'],'max':d})
    o[s]={'nBase':len(be),'nNew':len(ne),'deltas':deltas,'hdrBase':{k:b[s]['header'][k] for k in ['clips','loop','zoom','detailExpanded','scrollLeft','scrollTop']},'hdrNew':{k:n[s]['header'][k] for k in ['clips','loop','zoom','detailExpanded','scrollLeft','scrollTop']}}
  dd=n['S2']['dump']; o['S2dialog']={'footerRows':dd['footerRows'],'fbtn':dd['fbtn'],'overflowAny':dd['overflowAny'],'overflow':dd['overflow'],'rangeCardFooterOverlap':dd['rangeCardFooterOverlap'],'georg':dd['net']}
json.dump(out,open('c-round-128/out/layout-compare.json','w'),indent=1,ensure_ascii=False)
for w in out:
  for s in ['S0','S1','S2']:
    x=out[w][s]; print(w,s,x['nBase'],x['nNew'],'deltas',len(x['deltas']), x['hdrBase']==x['hdrNew'])
    for d in x['deltas'][:30]: print('   ',d)
  print(w,'S2dialog',out[w]['S2dialog'])
