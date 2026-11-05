import json,sys
a=json.load(open('b-round-335/screens/screen336.json')); b=json.load(open('b-round-352/screens/screen353.json'))
out=[]
for k in b['screens']:
  ta=[r['region']+'|'+r['text'] for r in a['screens'][k]]; tb=[r['region']+'|'+r['text'] for r in b['screens'][k]]
  out.append(f"{k} rows353 {len(tb)} rows336 {len(ta)} only353 {[x for x in tb if x not in ta]} only336 {[x for x in ta if x not in tb]}")
for k in b['journey']:
  ja=a['journey'][k]; jb=b['journey'][k]
  diff={f:(ja.get(f),jb.get(f)) for f in set(ja)|set(jb) if ja.get(f)!=jb.get(f)}
  out.append(f"journey {k} differing fields {json.dumps(diff,ensure_ascii=False)[:1500]}")
  out.append(f"journey {k} clips353 {len(jb.get('clips',[]))} clips336 {len(ja.get('clips',[]))}")
out.append(f"laneErrors {b.get('laneErrors')}")
print('\n'.join(out))
