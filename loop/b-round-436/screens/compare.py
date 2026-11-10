# usage: python3 -I compare.py <head json> <sketch json> -> per-screen line-record counts, outside timeline/library, and text diffs
import json, sys
h = json.load(open(sys.argv[1]))['screens']; s = json.load(open(sys.argv[2]))['screens']
for name, d in (('head', h), ('sketch', s)):
    print(name, {k: len(v) for k, v in d.items()}, 'outside', [len([r for r in v if not r['inClip'] and not r['inLibraryList']]) for v in d.values()])
for k in h:
    a = [r['text'] for r in h[k]]; b = [r['text'] for r in s[k]]
    diffs = [(x, y) for x, y in zip(a, b) if x != y]
    print(k, 'text-diffs', len(diffs) + abs(len(a) - len(b)), diffs[:5])
