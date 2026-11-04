import json, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-325/'
h = {r['id']: r for r in json.load(open(L + 'perf-h-results/latest-interactions.json'))['rows']}
ad = json.load(open(L + 'perf-a-results/latest-interactions.json'))
a = {r['id']: r for r in ad['rows']}
hd = json.load(open(L + 'perf-h-results/latest-interactions.json'))
out = [f"failures HEAD {hd['failures']} A {ad['failures']}", f"pass problems HEAD {[p['problems'] for p in hd['passes']]} A {[p['problems'] for p in ad['passes']]}"]
out.append('id\tkind\tmode(A)\tHEAD median\tA median\tA pass')
rises = []
for i in a:
    hr, ar = h.get(i), a[i]
    hm = hr['median'] if hr else None
    line = f"{i}\t{ar['kind']}\t{ar['mode']}\t{hm}\t{ar['median']}\t{ar['pass']}"
    if i.startswith(('interact.drag.trim', 'interact.drag.move', 'interact.harness.drag')):
        out.append(line)
    if ar['kind'] == 'deterministic' and hm is not None and ar['median'] is not None and ar['median'] > hm:
        rises.append(line)
out.append('--- deterministic rises (A > HEAD) ---')
out += rises
open(L + 'perf-rowcmp.txt', 'w').write('\n'.join(out) + '\n')
print('\n'.join(out))
