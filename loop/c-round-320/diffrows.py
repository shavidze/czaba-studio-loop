import json,sys
O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-320/'
def strip(x):
  if isinstance(x,dict): return {k:strip(v) for k,v in x.items() if k not in ('waitedMs',)}
  if isinstance(x,list): return [strip(v) for v in x]
  return x
for suf in ['-1440x900','-1280x720','-1280x720-reload']:
  try: h=json.load(open(O+f'rows-h{suf}.json')); a=json.load(open(O+f'rows-a{suf}.json'))
  except Exception as e: print('missing',suf,e); continue
  for vp in [k for k in h if 'x' in k and k[0].isdigit()]:
    H,A=h[vp],a.get(vp,{})
    print(f'== {suf} {vp} keys {len(H)} {len(A)} errors h {H.get("errors")} a {A.get("errors")}')
    n=0
    for k in H:
      if json.dumps(strip(H[k]),sort_keys=True)!=json.dumps(strip(A.get(k)),sort_keys=True):
        n+=1; print('DIFF',k); print(' h',json.dumps(strip(H[k]))[:900]); print(' a',json.dumps(strip(A.get(k)))[:900])
    print('diffs',n)
