import json,sys
h=json.load(open(sys.argv[1])); a=json.load(open(sys.argv[2]))
H={r['id']:r for r in h['rows']}; A={r['id']:r for r in a['rows']}
print('failures h',h['failures'],'a',a['failures'],'complete',h.get('complete'),a.get('complete'))
print('rows h',len(H),'a',len(A),'onlyH',sorted(set(H)-set(A)),'onlyA',sorted(set(A)-set(H)))
rise=[];drop=[]
for k in sorted(H):
  if k not in A: continue
  if not any(x in k for x in ('components','commits','restarts','path','mutation','live')): continue
  hv,av=H[k]['median'],A[k]['median']
  if hv is None or av is None: continue
  if av>hv: rise.append((k,hv,av))
  elif av<hv: drop.append((k,hv,av))
print('RISES',len(rise)); [print('  ',*x) for x in rise]
print('DROPS',len(drop)); [print('  ',*x) for x in drop]
print('ASSERTED rows in A:')
for k,r in A.items():
  if r['mode']=='assert': print('  ',k,r['budget'],'median',r['median'],'max',r['max'],'pass',r['pass'])
