import json,sys
def load(t,vp,f): return json.load(open(f))[vp]
pairs=[('1440x900','rows-h-1440.json','rows-a-1440.json'),('1280x720','rows-h-1280x720.json','rows-a-1280x720.json'),('1280x720','rows-h-1280x720-reload.json','rows-a-1280x720-reload.json')]
for vp,fh,fa in pairs:
  h=load('h',vp,fh); a=load('a',vp,fa)
  print('==',vp,'keys',len(h),len(a),'errors h',h['errors'],'a',a['errors'])
  nd=0
  for k in h:
    if k=='errors': continue
    if json.dumps(h[k],sort_keys=True)!=json.dumps(a.get(k),sort_keys=True):
      nd+=1; print('DIFF',k); print(' h',json.dumps(h[k])[:900]); print(' a',json.dumps(a.get(k))[:900])
  print('diffs',nd)
  for k in h:
    v=h[k]
    if isinstance(v,dict):
      s=v.get('after',v.get('s',v))
      if isinstance(s,dict) and 'clips' in s: print(f'  {k}: clips={len(s["clips"]) if isinstance(s["clips"],list) else s["clips"]} range={s.get("rangeReadout")} status={s.get("status","")[:90]!r}')
