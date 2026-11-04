import json
for vp in ['1440x900','1280x720']:
  a=json.load(open(f'ovr/a-{vp}.json')); h=json.load(open(f'ovr/head-{vp}.json'))
  print('==',vp,len(a['samples']),len(h['samples']),'errors',a['errors'],h['errors'])
  pre=a['samples'][0]
  bad=0
  for sa,sh in zip(a['samples'],h['samples']):
    d=[k for k in ('extent','state','bars','nClips','fade') if sa[k]!=sh[k]]
    if d: bad+=1
    note=''
    if sa['label'].startswith('fade-move'): note='A==predrag(bars,extent)=%s'%(sa['bars']==pre['bars'] and sa['extent']==pre['extent'])
    if sa['label'].startswith(('move-move','trim-move')): note='A bars changed vs prev=%s'%(sa['bars']!=prevb)
    prevb=sa['bars']
    print(f"{sa['label']:14s} diffs={d} {note} bars={sa['bars']} ext={sa['extent']}")
  print('SAMPLES DIFFERING A vs HEAD:',bad)
  for k in ('playing','fade-drag','move-drag','volume-drag'):
    for t,x in (('A',a),('H',h)):
      arr=x['meters'][k]; moving=len({json.dumps(f) for f in arr})>1
      print(k,t,'frames',len(arr),'distinct',len({json.dumps(f) for f in arr}),'moving',moving,'sample',arr[-1][:2])
  for k in ('overLatched','afterGain','afterReset'):
    print(k,'A',json.dumps(a[k])[:300]); print(k,'H',json.dumps(h[k])[:300])
