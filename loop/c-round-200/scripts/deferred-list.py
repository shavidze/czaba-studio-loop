import json;d=json.load(open('backlog.json'))
for f in d['deferred_low_polish']:
  t=f.get('title') or f.get('note') or f.get('actual') or ''
  print(f['id'],'|',str(f.get('status'))[:30],'|',t[:130])
