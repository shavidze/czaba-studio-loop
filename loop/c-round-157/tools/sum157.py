import json,sys
d=json.load(open(sys.argv[1]))
print('fonts',d['fontsWait']['ok'],'clips',d.get('clips'),'table0',d.get('table0'),'pe',d.get('projectEnd'))
print('css2Dom',d.get('css2Dom'))
c=d.get('css2Body') or {}; print('css2 blocks',c.get('nBlocks'),c.get('counts'))
m=c.get('map',{}); print('fontReqs',[(r['s'],r['t'],m.get(r['u'],r['u'][:60])) for r in d.get('fontReqs',[])])
print('play',d.get('play2s'))
def S(r):
  if not r or not r.get('present'): print('   ABSENT',r); return
  print('  [%s] ok=%s bytes=%s monosOk=%s style=%s n=%s secInSpan=%s other=%s'%(r['name'],r.get('ok'),r.get('bytesEqual'),r.get('monosOk'),r['monoStyleOk'],r.get('nMono'),r.get('secondsInSpan'),r['otherMonoClasses']))
  print('   text=',repr(r['text'])); print('   exp =',repr(r.get('expected')))
  print('   root',r['rootStyle'],'pf',r['pf'].get('root'))
  for x in r['monos']: print('   mono',repr(x['text']),x['family'][:16],x['weight'],x['fvn'],x['w'],r['pf'].get(x['id']))
  print('   fit',{k:r['fit'][k] for k in ('cw','sw','lines','fullyVisible','naturalMonoW','naturalSansW')})
for k in ['A_noRange','B_range','C_loop','C_loopNoRange']:
  v=d.get(k); print('==',k)
  if not v: print('  missing'); continue
  for kk,vv in v.items():
    if isinstance(vv,dict) and 'present' in vv: S(vv)
    elif kk not in ('inv','lay'): print('  ',kk,vv)
  if 'lay' in v: print('   lay',{a:(b and {x:b[x] for x in ('cw','sw','lines','fullyVisible','naturalMonoW','naturalSansW','box')}) for a,b in v['lay'].items()})
  if v.get('inv'): print('   inv',v['inv']['ok'],v['inv']['w700'],v['inv']['w600'],v['inv']['badFaces'],v['inv']['toast'])
def I(o): print('  inv %s ok=%s w700=%s w600=%s plex500=%s bad=%s toast=%s'%(o['name'],o['ok'],len(o['w700']),[(e['text'],e['tag'],e['testid'],e['family']) for e in o['w600']],o['plex']['plex500plus'],o['badFaces'],o['toast']))
for k in ['invS0','invRangeLoop']:
  if d.get(k): I(d[k])
if d.get('invStates'):
  s=d['invStates']; print('menus',s.get('markerMenuOpen'),s.get('gridMenuOpen'),'preview',s.get('previewTxt'))
  for k in ['selClipDetail','range','allTracks','markerMenu','gridMenu','preview']: I(s[k])
for k in ['expRange','expProject','closeFocus']: print(k,d.get(k))
print('facesEnd',d['facesEnd']['all'])
print('net',d['net'],d['fontNet'],d['errors'])
