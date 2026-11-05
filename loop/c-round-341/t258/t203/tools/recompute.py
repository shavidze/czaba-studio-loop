# C round 203: recompute ring gap/out from saved ray profiles. ring = band of pixels within 25 of max warm score in [1,18];
# gap = pixel 2 before the band start (skips 1 AA pixel); out = pixel 2 after the band end.
import json,sys
def lum(c):
    v=[x/255 for x in c[:3]]; v=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in v]; return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]
def cr(a,b):
    a,b=sorted([lum(a),lum(b)],reverse=True); return round((a+0.05)/(b+0.05),2)
res={}
for t in sys.argv[1:]:
    d=json.load(open(f'../out/contrast/{t}.json'))
    for k,r in d.items():
        if 'err' in r: print(k,'ERR'); continue
        line=[]
        for s,v in r['sides'].items():
            prof={int(a):list(map(int,b.split(','))) for a,b in (x.split(':') for x in v['prof'].split())}
            sc=lambda p:(p[0]-p[2])+0.5*p[0]
            cand=[o for o in prof if 1<=o<=18]; best=max(sc(prof[o]) for o in cand)
            band=[o for o in cand if sc(prof[o])>=best-25]
            # contiguous band from the first hit
            r0=band[0]; r1=r0
            while r1+1 in band: r1+=1
            ring=prof[(r0+r1)//2]; gap=prof[r0-2]; out=prof[r1+2]
            res[(k,s)]=(cr(ring,gap),cr(ring,out))
            line.append(f"{s} band[{r0},{r1}] ring{ring} gap{gap} out{out} {cr(ring,gap)}/{cr(ring,out)}")
        print(k,' ; '.join(line))
json.dump({f'{a}|{b}':v for (a,b),v in res.items()},open('../out/contrast/recomputed.json','w'),indent=1)
