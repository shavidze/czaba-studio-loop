import json,collections,sys
def tot(f,mode):
  d=json.load(open(f)); c=collections.Counter()
  allc=d['all']
  if mode=='largest': allc=[max(allc,key=lambda x:x['size'])]
  if mode=='steady':  # main commits of size most common > 5
    pass
  for cm in allc:
    for n,k in cm['names']: c[n.split(' < ')[0]]+=k
  return c,len(d['all'])
for sc in ['click','move','zoom30','range']:
  h,nh=tot(f'/home/runner/czaba-project/tmp/studio-real-loop/c-round-320/diag/h-{sc}.json','all'); a,na=tot(f'/home/runner/czaba-project/tmp/studio-real-loop/c-round-320/diag/a-{sc}.json','all')
  print('==',sc,'commits h',nh,'a',na,'sum h',sum(h.values()),'a',sum(a.values()))
  for n in sorted(set(h)|set(a)):
    if h[n]!=a[n]: print(f'   {n:45s} h={h[n]:4d} a={a[n]:4d} d={a[n]-h[n]:+d}')
