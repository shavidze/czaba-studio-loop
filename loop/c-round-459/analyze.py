import json,re
rows=[]
for l in open('matrix/summary.txt'):
    if l.startswith('DONE'):continue
    p=l.split(' ',4)
    try:d=json.loads(p[4])
    except Exception as e: print('BAD',l[:200]);continue
    d['tag']=p[0];d['vp']=p[1];d['cpu']=p[2];rows.append(d)
def rem(d,k): return None if d['removedAt'] is None or d[k] is None else int(d['removedAt'])-int(float(d[k]))
for d in rows:
    print(d['tag'],d['vp'],d['cpu'],d['mode'],'fp',d['fp'],'fc',d['firstCovered'],'lum',d['firstPaintedLum'],'remFC',rem(d,'firstCovered'),'remStart',rem(d,'dataStart'),'logo',d['logoFullMs'],'tag',d['tagFullMs'],'gaps',d['gapsWhileCovered'],'black',d['anyBlackSample'],d['blackFrames'],'st',d['finalState'],'foc',d['finalFocus'],'url',d['url'])
