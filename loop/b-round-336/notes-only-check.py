# Usage: python3 -I notes-only-check.py <HEAD budgets json> <new budgets json> <expected changed-ids file>
# Prints: same-ids, same order, every non-note field equal per id, the changed-note id set equal to the expected list.
import json, sys
ra = json.load(open(sys.argv[1]))
rb = json.load(open(sys.argv[2]))
a = {r['id']: r for r in ra}
b = {r['id']: r for r in rb}
expected = set(open(sys.argv[3]).read().split())
strip = lambda r: {k: v for k, v in r.items() if k != 'note'}
nonnote = [i for i in a if i in b and strip(a[i]) != strip(b[i])]
changed = {i for i in a if i in b and a[i]['note'] != b[i]['note']}
print('ids', 'equal' if a.keys() == b.keys() else 'differ', 'order', 'equal' if [r['id'] for r in ra] == [r['id'] for r in rb] else 'differ',
      'nonnote-diffs', len(nonnote), 'notes-changed', len(changed), 'matches-expected', changed == expected)
