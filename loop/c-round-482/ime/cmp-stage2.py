# Round 444 contract compare for ime-stage2.mjs output (B round 443 planning). Usage: python3 -I compare.py <probe.json>
# Asserted per cell (handler contract); the type=search native clear on a synthetic composing Escape (LIB-ESC libQuery) is recorded, not asserted.
import json, sys
d = json.load(open(sys.argv[1]))
EXP = {
 'LIB-ESC': {'focused': 'arrangement-library-search', 'focusSource': 'pointer'},
 'LIB-DOWN': {'focused': 'arrangement-library-search', 'focusSource': 'pointer'},
 'LIB-ESCHELD': {'focused': 'arrangement-library-search', 'libQuery': 'so'},
 'SHEET-ESC': {'sheetOpen': True, 'focused': 'Search shortcuts', 'focusSource': 'pointer'},
 'SHEET-ESCHELD': {'sheetOpen': True, 'focused': 'Search shortcuts'},
 'FS-ENTER': {'focused': 'arrangement-library-search', 'focusSource': 'pointer'},
 'FS-UNIDENTIFIED': {'focused': 'arrangement-library-search', 'focusSource': 'pointer'},
 'LIB-PLAINESC': {'focused': 'arrangement-library-search', 'libQuery': '', 'focusSource': 'keyboard'},
 'SHEET-PLAINESC': {'sheetOpen': False, 'focused': 'Keyboard shortcuts (?)', 'focusSource': 'keyboard'},
}
fail = 0; n = 0
for key in sorted(d):
    cell = d[key]; row = key.split(':', 1)[1]; n += 1
    if 'error' in cell:
        print(f'{key} ERROR (environment-invalid, re-run) {cell["error"][:80]}'); fail += 1; continue
    after = cell['after']; bad = {k: after.get(k) for k, v in EXP[row].items() if after.get(k) != v}
    print(f'{key} {"OK" if not bad else "FAIL " + json.dumps(bad)}')
    fail += 1 if bad else 0
print(f'ALL OK ({n} cells)' if fail == 0 else f'NOT ALL OK ({fail} of {n} failing)')
