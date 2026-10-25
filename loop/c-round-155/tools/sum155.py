import json,sys;d=json.load(open(sys.argv[1]))
print('fonts',d['fontsWait']['ok'],'snap',d.get('snap'),'clips',d.get('clips'),'errors',d['errors'])
print('play',d['play2s'])
for k in ['laneGhostN6','laneGhostLong','groupLaneGhost']:
  if k not in d: continue
  g=d[k]; print('==',k,g['fit'],g['releaseStatus'],'|',g['afterRelease'],'| undo',g['undo'],'|',g['afterUndo'],g['shot'])
  for n,v in g['ghost'].items():
    for e in v: print('  ',n,repr(e['text']),e['weight'],e['family'][:22],e['fvn'],e['box'],e['cw'],e['sw'],e['pf'])
print('cross',d['dragCrossLane'])
for k in ['libDrop','groupDropGhost']:
  if k not in d: continue
  g=d[k]; print('==',k,g['ghostShown'],g['gattr'],g['releaseStatus'],'added',g['added'],'undo',g['undo'],g['undoRestored'],g['shot'])
  for n,v in g['ghost'].items():
    for e in v: print('  ',n,repr(e['text'][:40]),e['weight'],e['family'][:22],e['pf'])
print('laneM',d['laneM'])
for s,v in d['plexScan'].items(): print('scan',s,v)
print('faces',d['facesEnd']['loaded'])
print('plex faces all',[x for x in d['facesEnd']['all'] if 'Plex' in x])
if 'groupS1' in d:
  print('groupS1', d['groupS1']['status'], d['groupS1']['groups'])
  for nm,inv in [('S0',d['invS0']['els']),('S1',d['groupS1']['inv']),('marker',d['invMenus']['markerMenu']),('grid',d['invMenus']['gridMenu']),('export',d['invMenus']['exportDialog'])]:
    print('inv600',nm,[(e['text'],e['weight'],e['tag'],e['inDialog'],e['family'][:16]) for e in inv])
  print('menus',d['invMenus']['markerMenuOpen'],d['invMenus']['gridMenuOpen'])
print('net',d['net'],[(f['n'],len(f['non200']),len(f['fail'])) for f in d['fontNet']])
