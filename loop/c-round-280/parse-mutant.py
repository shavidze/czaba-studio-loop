import json,sys
d=json.load(open(sys.argv[1]))
print('complete',d.get('complete'),'failures',len(d.get('failures',[])))
mp=[(r['id'],r['samples']) for r in d['rows'] if 'mem-polls' in r['id']]
print('mem-polls',mp)
probs=set();ab=[]
for p in d.get('passes',[]):
  ab.append(p.get('abortedAt'))
  for x in p.get('problems',[]): probs.add(x)
print('abortedAt',ab)
for x in sorted(probs): print('problem:',x)
