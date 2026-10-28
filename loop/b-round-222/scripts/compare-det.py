import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2]))
ra={r['id']:r for r in a['rows']}; rb={r['id']:r for r in b['rows']}
print(a['harness'], 'rows', len(ra), len(rb), 'same id order', [r['id'] for r in a['rows']]==[r['id'] for r in b['rows']])
det=[i for i,r in rb.items() if r['kind']=='deterministic']
diff=[]
for i in det:
    if i not in ra: diff.append((i,'missing in A',None,None)); continue
    if ra[i]['median']!=rb[i]['median']: diff.append((i,ra[i]['median'],rb[i]['median'],(ra[i]['samples'],rb[i]['samples'])))
print('deterministic', len(det), 'median differs', len(diff))
for d in diff: print(' ', d)
print('failures', len(a['failures']), len(b['failures']))
