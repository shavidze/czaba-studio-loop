import json,sys
h=json.load(open(sys.argv[1])); s=json.load(open(sys.argv[2]))
T={'Go to Downloads','Upgrade to Premium','Unlock Premium'}
for a,b in zip(h,s):
  assert a['id']==b['id'] and a['vp']==b['vp']
  for i,j in zip(a['items'],b['items']):
    if i['count']!=1: print(a['id'],a['vp'],i['name'],'count',i['count'],j['count']); continue
    ra,rb=i['rest'],j['rest']
    tag='TARGET' if i['name'] in T else 'sibling'
    keys=['tag','w','h','x','radius','bg','color','font','padding','minWidth','whiteSpace','display','cursor']
    d={k:(ra[k],rb[k]) for k in keys if ra[k]!=rb[k]}
    print(a['id'],a['vp'],tag,i['name'],'card',ra['card'],'->',rb['card'],'row',ra['row'],'->',rb['row'],'diff',d if d else 'none')
