import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]))
def strip(o):
    if isinstance(o,dict): return {k:strip(v) for k,v in o.items() if k not in ('rowClass','base','tag')}
    if isinstance(o,list): return [strip(x) for x in o]
    return o
for vp in a['rows']:
    eq = strip(a['rows'][vp])==strip(b['rows'][vp])
    print(vp, 'equal' if eq else 'differs')
