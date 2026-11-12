# RETRO 480: new deferred_low_polish entries of the window 465-479. Run from the loop root.
# An entry counts when ANY of: (a) 'added' names a planning "B round N ->" with N in 465..479;
# (b) the earliest D-29zNNNN anywhere in the entry is in 1642..1699 (D-29z1642 = first decision after RETRO 465 planning; D-29z1699 = last before this planning);
# (c) its id names a round 465..479 (A-R/C-R/GATE/B-R/TL-R/INFO-A/INFO-C prefix). Method (a) alone missed entries without 'added' (advisor check).
import json, re, collections
d = json.load(open('b-round-479/backlog-retro-input.json'))
rows = []
for x in d['deferred_low_polish']:
    s = json.dumps(x, ensure_ascii=False)
    m = re.search(r'B round (\d+) ->', str(x.get('added', '')))
    a = bool(m and 465 <= int(m.group(1)) <= 479)
    ds = [int(n) for n in re.findall(r'D-29z(\d+)', s)]
    bflag = bool(ds and 1642 <= min(ds) <= 1699)
    r = re.match(r'(?:A-R|C-R|GATE|B-R|TL-R|INFO-A|INFO-C)(\d+)', x.get('id', ''))
    c = bool(r and 465 <= int(r.group(1)) <= 479)
    if a or bflag or c:
        rows.append((x['id'], ''.join(k for k, v in (('a', a), ('b', bflag), ('c', c)) if v), str(x.get('status', '')).startswith('closed')))
print('new deferred entries, window 465-479 (union a|b|c):', len(rows))
print('by method', {k: sum(1 for r in rows if k in r[1]) for k in 'abc'})
pre = lambda i: 'gate' if i.startswith('GATE') else 'TL (tech-lead review)' if i.startswith('TL-') else 'A' if i.startswith(('A-R', 'INFO-A')) else 'C' if i.startswith(('C-R', 'INFO-C')) else 'B' if i.startswith('B-R') else 'other'
print('by id prefix', dict(collections.Counter(pre(r[0]) for r in rows)))
print('of these closed:', sum(1 for r in rows if r[2]))
for r in rows: print(*r)
