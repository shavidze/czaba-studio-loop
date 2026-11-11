# usage: python3 -I compare-video.py <tree.json> [<head.json>]
# OK cell: no error; BODY: the fresh Escape returns the video (afterFresh false); every other site: video still expanded after the fresh
# press AND after the 3 repeats. With <head.json>: also prints SAME/DIFF of each cell's afterFresh snapshot (keys log dropped) vs HEAD.
import json, sys
t = json.load(open(sys.argv[1])); bad = []
for k, c in sorted(t.items()):
    if 'error' in c: bad.append(f'{k} error'); continue
    body = k.endswith(':BODY')
    fresh = c['afterFresh']['videoExpanded']; rep = c['afterRepeats']['videoExpanded']
    ok = (fresh is False and rep is False) if body else (fresh is True and rep is True)
    if not ok: bad.append(f'{k} fresh={fresh} repeats={rep}')
print('ALL OK (%d cells)' % len(t) if not bad else 'NOT ALL OK (%d of %d failing)' % (len(bad), len(t)))
for b in bad: print(' ', b)
if len(sys.argv) > 2:
    h = json.load(open(sys.argv[2])); diff = []
    strip = lambda s: {k: v for k, v in s.items() if k != 'keys'}
    for k in sorted(t):
        if k not in h or 'error' in h[k] or 'error' in t[k]: diff.append(f'{k} missing/error'); continue
        if strip(t[k]['afterFresh']) != strip(h[k]['afterFresh']): diff.append(k)
    print('FRESH ALL SAME (%d cells)' % len(t) if not diff else 'FRESH DIFF: ' + ', '.join(diff))
