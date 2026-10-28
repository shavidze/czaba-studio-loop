import json,sys
for p in sys.argv[1:]:
  d=json.load(open(p)); print('==',p.split('/')[-1],d['numPassedTests'],'passed',d['numFailedTests'],'failed')
  rows=[]
  for f in d['testResults']:
    a=f['assertionResults']; tot=sum((x.get('duration') or 0) for x in a)
    if tot>500: rows.append((tot,len(a),max((x.get('duration') or 0) for x in a),f['name'].split('tests/renderer/')[1]))
  for r in sorted(rows,reverse=True): print('%7.0f ms n=%3d max=%6.0f %s'%r)
