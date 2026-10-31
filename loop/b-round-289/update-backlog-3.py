import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
h = [x for x in b['harness_rules'] if x.get('id') == 'HR-C-MANIFEST-FIELDS'][0]
h['rule'] = h['rule'].replace('from round 291 C writes', 'from round 290 C writes')
r = [x for x in b['retro_runs'] if x.get('round') == 290][0]
if 'L4 ruling-line clause' not in r['lessons']:
    r['lessons'] = r['lessons'].replace('new L56 artifact manifest;', 'new L56 artifact manifest; L4 ruling-line clause;')
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print(h['rule'][:40], '|', r['lessons'])
