import json,sys,re
d=json.load(open(sys.argv[1]))
for k,v in d.items():
    print(k,len(v),[c.get('rendered') for c in v],'dock/video/Maximize:',sorted({n for c in v for n in c.get('names',[]) if re.search(r'ArrangementVideo|Maximize2',n)}),'providerRendered',[c.get('providerRendered') for c in v])
