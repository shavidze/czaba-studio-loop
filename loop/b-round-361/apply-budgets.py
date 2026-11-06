"""B round 361 -> 362: budgets edit for PERF-10b-ii-a (Play/Stop leaf). Usage: apply-budgets.py <store-or-scratch>."""
import sys, pathlib, json
p = pathlib.Path(sys.argv[1]) / 'perf/budgets.interactions.json'
t = p.read_text(encoding='utf-8')
def sub(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
for kind, word in (('start', 'Play'), ('stop', 'Stop')):
    sub('''    "budget": {
      "op": "<=",
      "value": 28
    },
    "owner": "PERF-10a-BUDGETS",
    "note": "Sum of rendered components in the same window. Asserted since PERF-10a-BUDGETS (round 360): ''' + ('after PERF-10a only the Transport, the video dock and the follow leaf render on Play (C358 and C359: 28 x3; HEAD before PERF-10a: 70)."' if kind == 'start' else 'as start-components (C358 and C359: 28 x3; HEAD before PERF-10a: 70)."'),
'''    "budget": {
      "op": "<=",
      "value": 11
    },
    "owner": "PERF-10b-ii-a",
    "note": "Sum of rendered components in the same window. Asserted since PERF-10a-BUDGETS (round 360, <= 28); tightened by PERF-10b-ii-a (round 362, D-29z1177): the Transport body no longer reads isPlaying, only the memoized Play/Stop leaf, the video dock and the follow leaf render on ''' + word + ''' (C361 28 x3; B's sketch 11 x3 at 1x and 6x; HEAD before PERF-10a: 70)."''')
sub('''    "budget": {
      "op": "<=",
      "value": 42
    },
    "owner": "PERF-10b-i",
    "note": "Sum of rendered components over the click window; detail lists the per-commit sizes. Asserted since PERF-10b-i (round 361, D-29z1170): the active track lives in the selection store, so a cross-lane click renders 42 (C360 83; B's sketch 42,0 x3 at 1x and 6x; mutant MU-1 82)."''',
'''    "budget": {
      "op": "<=",
      "value": 38
    },
    "owner": "PERF-10b-ii-a",
    "note": "Sum of rendered components over the click window; detail lists the per-commit sizes. Asserted since PERF-10b-i (round 361, D-29z1170, <= 42: the active track lives in the selection store; C360 83; mutant MU-1 82); tightened by PERF-10b-ii-a (round 362, D-29z1177): the memoized Play/Stop leaf no longer re-renders with the Transport (C361 42 x3; B's sketch 38 x3 at 1x and 6x)."''')
json.loads(t)
p.write_text(t, encoding='utf-8')
