# Round 491 C6 checker: python3 -I c6-check.py <narrow-491 output json>
# Prints one line per narrow viewport and clause; exit 0 only if every clause holds at 375x812, 360x780 and 320x640.
import json, sys
d = json.load(open(sys.argv[1]))['rows']
ok = True
for vp in ('375x812', '360x780', '320x640'):
    r = d[vp]; vw = int(vp.split('x')[0])
    e = r['editing']; sv = r['saving']; lt = r['longTyped']
    def inside(b):
        return b['hit'] == 'self' and b['box'][2] >= 32 and b['box'][3] >= 32 and b['rightEdge'] <= vw
    checks = {
        'editing-buttons': len(e['buttons']) == 2 and all(inside(b) for b in e['buttons']),
        'mouseSave': r['mouseSave'] == {'puts': 1, 'editing': False},
        'tapSave': r.get('tapSave') == {'puts': 1, 'editing': False},
        'mouseCancel': r['mouseCancel']['editing'] is False,
        'tapCancel': r.get('tapCancel') == {'editing': False},
        'saving': sv is not None and len(sv['buttons']) == 2 and all(b['disabled'] and b['rightEdge'] <= vw for b in sv['buttons']),
        'longTyped': len(lt['buttons']) == 2 and all(inside(b) for b in lt['buttons']),
        'kbSave': r['kbSave']['ariaLabel'] == 'Save name' and r['kbSave']['focusVisible'] and r['kbSave']['box'][0] + r['kbSave']['box'][2] <= vw,
        'kbCancel': r['kbCancel']['ariaLabel'] == 'Cancel name edit' and r['kbCancel']['focusVisible'] and r['kbCancel']['box'][0] + r['kbCancel']['box'][2] <= vw,
    }
    for k, v in checks.items():
        ok = ok and v
        print(vp, k, 'PASS' if v else 'RED')
print('C6', 'PASS' if ok else 'RED')
sys.exit(0 if ok else 1)
