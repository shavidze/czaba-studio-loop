# Every backlog entry (retro input) that names RETRO 465. Run from the loop root: python3 -I b-round-464/retro465-deadlines.py > b-round-464/data/retro465-deadlines.txt
import json, re
d = json.load(open('b-round-464/backlog-retro-input.json'))
def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, path + '/' + str(k))
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, path + f'[{i}]')
    elif isinstance(o, str) and re.search(r'RETRO[ -]465|retro 465', o):
        yield path, o[:300]
for p, v in walk(d):
    if 'decisions_log_b' in p: continue
    node = d
    for part in re.findall(r'/([^/\[]+)|\[(\d+)\]', p)[:2]:
        node = node[part[0]] if part[0] else node[int(part[1])]
    ident = node.get('id') if isinstance(node, dict) else None
    print(ident, '|', p, '::', v)
