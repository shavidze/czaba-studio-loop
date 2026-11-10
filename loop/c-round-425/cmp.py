import json,sys
a,b=sys.argv[1:3]
d=json.load(open(a));o=json.load(open(b))
skip={'t','waitedMs','heldClipId','heldStatus','statusAfterHeld','ts','at','ms','readyMs','durationMs'}
def strip(x):
    if isinstance(x,dict): return {k:strip(v) for k,v in x.items() if k not in skip}
    if isinstance(x,list): return [strip(v) for v in x]
    return x
s,t=strip(d),strip(o)
print('same' if s==t else 'DIFF')
if s!=t: print(json.dumps(s)[:1500]); print(json.dumps(t)[:1500])
