# C325: diff rows-head.json vs rows-a.json; ignores the playhead position (time-dependent) and the loop position sample.
import json, sys
import re
U = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
def norm(path):
    t = open(path).read(); m = {}
    return json.loads(U.sub(lambda x: m.setdefault(x.group(0), f'UUID{len(m)}'), t))
h = norm(sys.argv[1]); a = norm(sys.argv[2])  # clip ids are random UUIDs; mapped by first appearance
IGN = {'posSample', 'wrapsSeen', 'errorsAtEnd', 'path', 'startedUtc', 'endedUtc', 'base', 'tag'}
diffs = []
def walk(x, y, p):
    if isinstance(x, dict) and isinstance(y, dict):
        for k in sorted(set(x) | set(y)):
            if k in IGN: continue
            walk(x.get(k), y.get(k), p + '.' + k)
    elif isinstance(x, list) and isinstance(y, list) and len(x) == len(y):
        for i, (u, v) in enumerate(zip(x, y)): walk(u, v, f'{p}[{i}]')
    elif x != y:
        diffs.append((p, x, y))
walk(h, a, '')
print('DIFFS', len(diffs))
for d in diffs: print(d[0], '\n  HEAD:', json.dumps(d[1])[:400], '\n  A   :', json.dumps(d[2])[:400])
