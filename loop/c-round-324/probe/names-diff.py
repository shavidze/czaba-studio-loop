# C324: per-step and per-commit name diff, HEAD vs A. usage: python3 -I names-diff.py <head.json> <a.json>
import json, sys, collections
SUB = {'ArrangementSelectionCount', 'ArrangementSelectionCountInner', 'ArrangementSelectedClipReadout', 'ArrangementSelectedClipReadoutInner',
       'ArrangementGroupHeaderWithSelection', 'ArrangementGroupHeaderWithSelectionInner', 'ArrangementDetailPanelWithSelection', 'ArrangementDetailPanelWithSelectionInner'}
h = json.load(open(sys.argv[1])); a = json.load(open(sys.argv[2]))
for step in h:
    ch = [c for c in h[step] if 'names' in c]; ca = [c for c in a.get(step, []) if 'names' in c]
    print(f"{step}: HEAD per-commit {[c['rendered'] for c in ch]} A {[c['rendered'] for c in ca]}")
    nh = collections.Counter(); na = collections.Counter()
    for c in ch: nh.update(c['names'])
    for c in ca: na.update(c['names'])
    added = na - nh; removed = nh - na
    print(f"  added {dict(added)}; removed {dict(removed)}; non-subscriber added {[k for k in added if k not in SUB]}")
    if len(ch) == len(ca):
        worst = 0
        for x, y in zip(ch, ca):
            d = collections.Counter(y['names']) - collections.Counter(x['names'])
            bad = {k: v for k, v in d.items() if k not in SUB or v > 1}
            worst = max(worst, max(d.values(), default=0))
            if bad: print('  PER-COMMIT VIOLATION', bad)
        print(f"  per-commit max added count per name: {worst}")
    else:
        print('  commit counts differ; per-commit alignment skipped')
