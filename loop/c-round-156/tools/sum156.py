import json,sys
d=json.load(open(sys.argv[1]))
print('fonts',d['fontsWait']['ok'],'snap',d.get('snap'),'clips',d.get('clips'),'errors',d['errors'])
print('table0',d.get('table0')); print('play',d.get('play2s'))
def S(r):
  if not r or not r.get('present'): print('   ABSENT',r); return
  print('  [%s] bytesEqual=%s(%s) monosOk=%s monoStyleOk=%s'%(r['name'],r.get('bytesEqual'),r.get('mode'),r.get('monosOk'),r['monoStyleOk']))
  print('   text=',repr(r['text'][:160])); 
  if r.get('expected') is not None: print('   exp =',repr(r['expected'][:160]))
  print('   root',r['rootStyle'],'pf',r['pf'].get('root'),'other',r['otherMonoClasses'])
  for m in r['monos']: print('   mono',repr(m['text']),m['family'][:16],m['weight'],m['fvn'],m['w'],r['pf'].get(m['id']))
  print('   fit',r['fit'])
for k,subs in [('rangeBody',['a','e']),('allTracks',['d','a2']),('selClip',['b']),('selClipSfx',None),('ghostFree',['g']),('ghostBlocked',['g']),('videoGap',['f'])]:
  v=d.get(k); print('==',k)
  if v is None: print('  missing'); continue
  if subs is None: S(v); print('   titleEq',v.get('titleEqualsText')); continue
  for s in subs: S(v.get(s))
  for x in ['status','det','hint','laneOf','allLanesSpan','badgeWhileAll','releaseStatus','added','undo','restored','unchanged','before','after','back','attr','titleEqualsText','shot','shot2','samples','distinctSamples','video','gapHiddenAt1s','vids','vEnd','pos','file']:
    if x in v: print('  ',x,v[x])
  if 'b' in v: print('   titleEq',v['b'].get('titleEqualsText'),v['b'].get('titleStartsClip'),v['b'].get('title'))
print('deleteUndo',d.get('deleteUndo')); print('escape',d.get('escape'))
print('statusSans',d.get('statusSans')); print('laneM',d.get('laneM'))
for s,v in d['plexScan'].items(): print('scan',s,v['plex500plus'],v['plexVisibleWeights'])
if 'invMenus' in d:
  m=d['invMenus']; print('menus',m['markerMenuOpen'],m['gridMenuOpen'])
  for nm,inv in [('S0',d['invS0']['els']),('marker',m['markerInv']),('grid',m['gridInv']),('export',m['exportInv'])]: print('inv600',nm,[(e['text'],e['weight'],e['tag'],e['inDialog']) for e in inv])
print('faces',d['facesEnd']['loaded']); print('plexAll',[x for x in d['facesEnd']['all'] if 'Plex' in x])
print('net',d['net'],d['fontNet'])
