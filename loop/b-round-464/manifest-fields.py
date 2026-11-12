import json
for n in range(450,465):
  c=json.load(open(f'c-round-{n}.json'))
  print(n, {k:(len(c[k]) if isinstance(c.get(k),list) else c.get(k)) for k in ('manifestPaths','missingPaths','countMismatches','claimCheckMinutes') if k in c}, [ (b.get('id'),b.get('origin')) for b in c.get('bugs') or [] if isinstance(b,dict)])
