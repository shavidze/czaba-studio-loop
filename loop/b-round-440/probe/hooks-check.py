"""usage: python3 -I hooks-check.py <head overview-hooks.json> <after overview-hooks.json>
Prints one line per check and a final ALL OK / NOT ALL OK."""
import json, sys
head = json.load(open(sys.argv[1])); after = json.load(open(sys.argv[2]))
bad = 0
def check(name, ok):
    global bad
    print(('OK   ' if ok else 'FAIL ') + name)
    bad += 0 if ok else 1
for w in ('1440', '1280'):
    for k in ('empty', 'full'):
        a, h = after[w][k], head[w][k]
        p = f'{w} {k} '
        check(p + 'state', a['state'] == k)
        check(p + 'bbox = head', a['bbox'] == h['bbox'])
        check(p + 'childCount = head', a['childCount'] == h['childCount'])
        check(p + 'first child class = head', a['overlayClass'] == h['overlayClass'])
        check(p + 'one lanes container', a['lanesContainer'] == 1)
        check(p + 'lane ids = track ids', a['laneIds'] == a['trackIds'] and len(a['laneIds']) == 4)
        check(p + 'outline count', a['outline'] == (1 if k == 'full' else 0))
        if k == 'full':
            check(p + 'outline parent is root', a['outlineParentIsRoot'] is True)
            check(p + 'bars = clips', sorted(a['barIds']) == sorted(a['clipIds']) and len(a['clipIds']) == 1)
            check(p + 'bar sum', sum(a['barsPerLane']) == len(a['clipIds']))
        else:
            check(p + 'no bars', a['barsPerLane'] == [0, 0, 0, 0] and a['barIds'] == [])
print('ALL OK' if bad == 0 else f'NOT ALL OK ({bad})')
