import json,sys
d=json.load(open(sys.argv[1]))
def row(e): return f"w{e['weight']} {e['family'][:22]!r} fvn={e['fvn']} txt={e['text'][:28]!r} box={e['box']} sw/cw={e['sw']}/{e['cw']} ln={e['lines']} pf={e['pf']}"
for st in ('S0','S1'):
  if st not in d: continue
  for part in ('weight','mono','sans'):
    for k,v in d[st][part].items():
      print(st,part,k,len(v))
      for e in v[:3]: print('   ',row(e))
      if len(v)>3:
        ws=set(e['weight'] for e in v); fs=set(e['family'][:22] for e in v); pfs=set(tuple(x.split(' [')[0] for x in (e['pf'] or [])) for e in v); ov=sum(e['overflowX'] for e in v); ln=set(e['lines'] for e in v)
        print('    ALL weights',ws,'fam',fs,'pf',pfs,'overflow',ov,'lines',ln)
for k in ('fontsWait','h1PrePost','activeLaneRow','bpm90','bpmRestore','laneMS','group','clipGain','masterOver','fontNet','fontsWait2'):
  if k in d: print(k, json.dumps(d[k],ensure_ascii=False)[:1500])
