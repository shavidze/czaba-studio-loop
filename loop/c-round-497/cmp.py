import json
a=json.load(open('c-round-497/after/after.json')); s=json.load(open('b-round-495/measure/sketch.json'))
key=lambda r:(r['id'],r['vp'])
sm={key(r):r for r in s}
bad=0
for r in a:
    k=key(r); b=sm.get(k)
    if r['id']=='MENU-SIGNIN':
        print(k,'cnt',r['count'],[(x['visible'],x['box'],x['borderTopLeftRadius']) for x in r['all']], 'sketch',[(x['visible'],x['box']) for x in b['all']] if b else None); continue
    rest=r.get('rest'); sr=(b or {}).get('rest')
    if not rest: print(k,'count',r['count'],'sketch',(b or {}).get('count')); continue
    bx=rest['box']; sb=sr['box'] if sr else None
    diff=[p for p in ['backgroundColor','color','borderTopLeftRadius','fontSize','fontWeight','paddingTop','paddingLeft','display'] if sr and rest[p]!=sr[p]]
    boxok = sb and all(abs(x-y)<=1 for x,y in zip(bx[2:],sb[2:])) and (r['id']=='HERO' or all(abs(x-y)<=1 for x,y in zip(bx[:2],sb[:2])))
    print(k,r['count'],bx,sb,'styleDiff',diff,'boxok',boxok,rest['backgroundColor'],rest['color'],rest['borderTopLeftRadius'],rest['fontSize'],rest['fontWeight'],rest['paddingTop'],rest['paddingLeft'],'hover',r.get('hover'),'shs',(sr or {}).get('hover'))
