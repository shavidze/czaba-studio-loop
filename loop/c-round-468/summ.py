import json,statistics as st,sys
for n in sys.argv[1:]:
  d=json.load(open(f'/home/runner/czaba-project/tmp/studio-real-loop/c-round-468/scroll-{n}.json'))
  for path in ('/','/free-downloads'):
    for vp in ('1440x900','1280x720'):
      rs=[r for r in d['rows'] if r['path']==path and r['viewport']==vp]
      o=[r['movingOver33'] for r in rs]; m=[r['movingFrames'] for r in rs]
      print(n,path,vp,'over33',o,'median',st.median(o),'moving',min(m),max(m),'finalY',sorted({r['finalY'] for r in rs}),'dlg',sum(r['dialogs'] for r in rs))
