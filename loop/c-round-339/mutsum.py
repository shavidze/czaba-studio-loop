import json,sys,re,collections
d=json.load(open(sys.argv[1]))
print('complete',d.get('complete'),'failures',len(d['failures']))
c=collections.Counter()
for f in d['failures']:
    m=re.search(r'\(([a-f])\)',f)
    c[m.group(1) if m else ('teardown' if 'teardown' in f else f[:70])]+=1
print(dict(c))
for x in d['rows']:
    if 'drag-group-live' in x['id']: print(x['id'],x['samples'],x['pass'])
