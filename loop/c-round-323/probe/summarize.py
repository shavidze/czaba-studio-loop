import json,sys,collections
SUB={'ArrangementSelectionCount','ArrangementSelectionCountInner','ArrangementSelectedClipReadout','ArrangementSelectedClipReadoutInner','ArrangementGroupHeaderWithSelection','ArrangementGroupHeaderWithSelectionInner','ArrangementDetailPanelWithSelection','ArrangementDetailPanelWithSelectionInner'}
h=json.load(open('dup-head.json'));a=json.load(open('dup-a.json'))
K15=None
for step in [s for s in h if s!='status']:
  ch=h[step]; ca=a.get(step)
  def agg(c):
    cs=c if isinstance(c,list) else c.get('commits',c)
    n=collections.Counter(); tot=[]
    for x in cs:
      if 'names' in x: n.update(x['names']); tot.append((x.get('providerRendered'),x['rendered']))
    return n,tot
  nh,th=agg(ch); na,ta=agg(ca)
  added=na-nh; removed=nh-na
  bad=[k for k in added if k not in SUB]
  print(f"{step}: HEAD commits {th} total {sum(t[1] for t in th)} | A commits {ta} total {sum(t[1] for t in ta)}")
  print(f"   added {dict(added)}  non-subscriber-added {bad}  removed-count {sum(removed.values())}")
