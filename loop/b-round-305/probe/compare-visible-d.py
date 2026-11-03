# B round 305: compare two visible-d.cjs outputs, ignoring the random clip ids. Usage: python3 -I compare-visible-d.py head.json other.json
import json, sys
a, b = (json.load(open(p)) for p in sys.argv[1:3])
strip = lambda r: [[(x['vb'], x['d']) for x in k] for k in r['keys']] + [[(x['vb'], x['d']) for x in r['back']]]
print('d+viewBox equal ignoring clip ids:', strip(a) == strip(b))
