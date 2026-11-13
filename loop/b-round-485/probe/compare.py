import json,sys
h=json.load(open(sys.argv[1]));s=json.load(open(sys.argv[2]))
for vp in s['rows']:
  r=s['rows'][vp]; hr=h['rows'][vp]
  print('==',vp)
  print('cardStops HEAD',len(hr['cardStops']),'sketch',json.dumps(r['cardStops']))
  c=r['collapsed']['c1']; hc=hr['collapsed']['c1']
  for k in ['card','header','titleBox','titleFont','headerTextAlign','headerCursor','cardHeight']: print(' ',k,hc[k],'->',c[k], 'EQ' if hc[k]==c[k] else 'DIFF')
  print('  c2 card',hr['collapsed']['c2']['card'],'->',r['collapsed']['c2']['card'])
  print('  button',c['button'],'headingInsideButton',c['headingInsideButton'],'headingBox',c['headingBox'])
  if 'afterEnter' in r:
    print('  focusedBefore',r['focusedBefore'])
    print('  enter',r['afterEnter']['active'],r['afterEnter']['c1']['button']['expanded'],r['afterEnter']['c1']['itemsVisible'],r['afterEnter']['c1']['card'])
    print('  space',r['afterSpace']['active']['expanded'],r['afterSpace']['c1']['itemsVisible'])
    print('  heldEnter',r['afterHeldEnter6']['expanded'],'heldSpace',r['afterHeldSpace6']['expanded'])
  m=r['afterMouse']; hm=hr['afterMouse']
  print('  mouse card',hm['c1']['card'],'->',m['c1']['card'],'items',hm['c1']['itemsVisible'],'->',m['c1']['itemsVisible'])
  print('  mouse active',m['active'],'fs',m['focusSource'])
  print('  mouse2 card',hr['afterMouse2']['c1']['card'],'->',r['afterMouse2']['c1']['card'],'c2',hm['c2']['card'],'->',m['c2']['card'],'speakers',hr['speakersInPage'],r['speakersInPage'])
