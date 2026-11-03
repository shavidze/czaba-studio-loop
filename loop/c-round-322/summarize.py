import json,sys
d=json.load(open(sys.argv[1]))[sys.argv[2]]
for k,v in d.items():
  if isinstance(v,dict) and 'error' in v: print('ERR',k,str(v)[:150])
print('errors',d['errors']); print('setup',d['setup']['clips'])
for k in ['noSel','click0','ctrlClick1','shiftClick2','ctrlClick1off','reclick0','ctrlA','esc','marquee','esc2','rangeDrag','rangeThenClick1']:
  x=d[k]; print(k, x.get('clips'), '|', x.get('count'),'|',(x.get('selectedClip') or '')[:50], '|', (x.get('status') or '')[:50], '|', (x.get('range') or '')[:40],'|',x.get('gain'))
for k in ['DUP1','DUP2','COPYPASTE1','COPYPASTE2','CUT1','CUT2','SPLIT1','SPLIT2','DELETE1','DELETE2']:
  x=d[k]; print(k, [len(x[s]['clips']) for s in ['before','doIt','undo','redo','undo2']] if 'doIt' in x else x, x.get('doIt',{}).get('status','')[:80])
print('transport noSel', d['noSel'].get('transport')); print('transport 1', d['click0'].get('transport')); print('transport range', d['transportRange'].get('transport'))
print(d['export']); print('group', str(d['group'])[:200])
