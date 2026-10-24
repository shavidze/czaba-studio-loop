import json,sys
L='/home/runner/czaba-project/tmp/studio-real-loop/'
TEXT={'dock-overview-label','dock-overview-note','dock-caption-note','dock-placeholder-text','dock-placeholder-return'}
res={}
for w in (1440,1280):
  b=json.load(open(f'{L}b-round-147/out/dockbase148-{w}.json'));p=json.load(open(f'{L}c-round-148/out/dockpost148-{w}.json'))
  R={'dock':[], 'rest':[], 'unexplained':[]}
  for st in b['states']:
    bn=b['states'][st]['nodes'];pn=p['states'][st]['nodes']
    if set(bn)!=set(pn): R['unexplained'].append([st,'node set',sorted(set(bn)^set(pn))])
    lw=None
    if 'dock-overview-label' in bn and 'dock-overview-label' in pn: lw=pn['dock-overview-label']['box'][2]-bn['dock-overview-label']['box'][2]
    for k in bn:
      if k not in pn: continue
      B=bn[k]['box'];P=pn[k]['box'];d=[P[i]-B[i] for i in range(4)]
      m=max(abs(x) for x in d)
      rec=[st,k,d,bn[k]['lines'],pn[k]['lines'],bn[k]['glyph'],pn[k]['glyph'],bn[k]['text'][:50],pn[k]['text'][:50]]
      cause=None
      if m<=1: cause='<=1px'
      elif k in TEXT:
        if k=='dock-placeholder-return':
          cause='own w + centred x shift' if abs(d[1])<=1 and abs(d[3])<=1 and abs(d[0]+d[2]/2)<=1 else None
        elif k=='dock-overview-note':
          cause='own w (x follows label start)' if abs(d[1])<=1 and abs(d[3])<=1 and abs(d[0])<=1 else None
        else:
          if abs(d[1])<=1 and abs(d[3])<=1:
            if abs(d[0])<=1: cause='own w (left anchored)'
            elif abs(d[0]+d[2])<=1: cause='own w (right anchored: text-right parent, right edge fixed)'
            elif abs(d[0]+d[2]/2)<=1: cause='own w (centred in fixed placeholder, centre fixed)'
      elif k=='dock-caption':
        cause='flex sibling = label dw, right edge fixed' if lw is not None and abs(d[0]-lw)<=1 and abs(d[2]+lw)<=1 and abs(d[0]+d[2])<=1 and abs(d[1])<=1 and abs(d[3])<=1 else None
      if m>1 or bn[k]['lines']!=pn[k]['lines'] or bn[k]['glyph']!=pn[k]['glyph']:
        R['dock'].append(rec+[cause or ('glyph/lines only' if m<=1 else 'UNEXPLAINED')])
      if cause is None: R['unexplained'].append(rec)
    if pn.get('dock') and False: pass
    if p['states'][st]['docW'][0]>p['states'][st]['docW'][1]: R['unexplained'].append([st,'docW overflow',p['states'][st]['docW']])
  for st in b['rest']:
    bb=b['rest'][st];pp=p['rest'][st]
    if set(bb)!=set(pp): R['rest'].append([st,'keyset',sorted(set(bb)^set(pp))[:20]])
    for k in bb:
      if k in pp:
        d=[pp[k][i]-bb[k][i] for i in range(4)]
        if max(abs(x) for x in d)>1: R['rest'].append([st,k,d])
    R.setdefault('restCount',{})[st]=len(bb)
  res[w]=R
json.dump(res,open(L+'c-round-148/out/cmp148.json','w'),indent=1,ensure_ascii=False)
for w,R in res.items():
  print('==',w,'restCount',R['restCount'],'rest>1px',R['rest'])
  for r in R['dock']: print(' ',r)
  print(' UNEXPLAINED',R['unexplained'])
