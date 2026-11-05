"""READ row: python3 -I read-diff.py <store-tree>. Compares perf/budgets.interactions.json with git HEAD 6588f08's copy."""
import json, subprocess, sys
t = sys.argv[1]
head = json.loads(subprocess.run(['git', '-C', '/home/runner/czaba-project/store', 'show', '6588f08:perf/budgets.interactions.json'],
                                 capture_output=True, check=True, text=True).stdout)
new = json.load(open(f'{t}/perf/budgets.interactions.json', encoding='utf-8'))
assert [r['id'] for r in head] == [r['id'] for r in new], 'id order differs'
fields = {}
for a, b in zip(head, new):
    ch = sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))
    if ch:
        fields[a['id']] = ch
print('rows', len(new), 'changed', len(fields), 'equal', len(new) - len(fields))
from collections import Counter
print('field-sets', dict(Counter(','.join(v) for v in fields.values())))
for i, v in fields.items():
    print(' ', i, ','.join(v))
