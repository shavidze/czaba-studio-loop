import json, sys
runs = [{r['id']: r for r in json.load(open(p))['rows']} for p in sys.argv[1:]]
base = runs[0]
ids = [i for i in base if not i.endswith('.6x')]
print('| row | 1× median (run 1 / run 2) | 6× median (run 1 / run 2) | samples run 1 (1×) |')
print('|---|---|---|---|')
dis = []
for i in ids:
    one = ' / '.join(str(r[i]['median']) for r in runs)
    six = ' / '.join(str(r[i + '.6x']['median']) for r in runs) if i + '.6x' in base else '—'
    print(f"| `{i}` | {one} | {six} | {base[i]['samples']} |")
for i, r in base.items():
    if r['kind'] == 'deterministic':
        vals = [run[i]['median'] for run in runs]
        allsamples = [s for run in runs for s in run[i]['samples']]
        if len(set(vals)) > 1 or len(set(allsamples)) > 1:
            dis.append((i, [run[i]['samples'] for run in runs]))
print()
print('DETERMINISTIC rows whose samples differ within or across runs:')
for d in dis: print(' ', d)
