"""B round 360 -> 361: budgets edit for PERF-10b-i (two click rows asserted; C-R360-NOTE-STALE notes). Usage: apply-budgets.py <store-or-scratch>."""
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/budgets.interactions.json'
t = p.read_text(encoding='utf-8')
def sub(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
sub('''    "id": "interact.click.commits",
    "scenario": "clip click",
    "metric": "commits",
    "unit": "count",
    "kind": "deterministic",
    "mode": "record",
    "budget": null,
    "owner": "PERF-1b-i",
    "note": "React commits from the click until quiet (min 600 ms, then 200 ms without a commit or start(), cap 3 s)."''',
'''    "id": "interact.click.commits",
    "scenario": "clip click",
    "metric": "commits",
    "unit": "count",
    "kind": "deterministic",
    "mode": "assert",
    "budget": {
      "op": "<=",
      "value": 2
    },
    "owner": "PERF-10b-i",
    "note": "React commits from the click until quiet (min 600 ms, then 200 ms without a commit or start(), cap 3 s). Asserted since PERF-10b-i (round 361, D-29z1170) as an upper bound: the click commit and a 0-component commit (C360 and B's sketch: 2 x3 at 1x and 6x); a click that commits nothing fails interact.harness.click-live."''')
sub('''    "id": "interact.click.components",
    "scenario": "clip click",
    "metric": "components",
    "unit": "components",
    "kind": "deterministic",
    "mode": "record",
    "budget": null,
    "owner": "PERF-1b-i",
    "note": "Sum of rendered components over the click window; detail lists the per-commit sizes."''',
'''    "id": "interact.click.components",
    "scenario": "clip click",
    "metric": "components",
    "unit": "components",
    "kind": "deterministic",
    "mode": "assert",
    "budget": {
      "op": "<=",
      "value": 42
    },
    "owner": "PERF-10b-i",
    "note": "Sum of rendered components over the click window; detail lists the per-commit sizes. Asserted since PERF-10b-i (round 361, D-29z1170): the active track lives in the selection store, so a cross-lane click renders 42 (C360 83; B's sketch 42,0 x3 at 1x and 6x; mutant MU-1 82)."''')
sub("the same imported video clip as interact.drag.video.*: same windows and definition as interact.drag.fade.stopped.release-commits. Record until C measures it (L58, PERF-CAND-VIDEO-TRIM-FADE-ROWS, round 349); kind copied",
    "the same imported video clip as interact.drag.video.*: same windows and definition as interact.drag.fade.stopped.release-commits. Added in round 349 (PERF-CAND-VIDEO-TRIM-FADE-ROWS); kind copied")
sub("the same imported video clip as interact.drag.video.*: same windows and definition as interact.drag.fade.playing.release-commits. Record until C measures it (L58, PERF-CAND-VIDEO-TRIM-FADE-ROWS, round 349); kind copied",
    "the same imported video clip as interact.drag.video.*: same windows and definition as interact.drag.fade.playing.release-commits. Added in round 349 (PERF-CAND-VIDEO-TRIM-FADE-ROWS); kind copied")
sub("upper bound per D-29z1151; the third commit is intermittent while playing (C358 and C359: 2 x3).",
    "upper bound per D-29z1151 (C358, C359 and C360: 2 x3 while playing; the bound matches the stopped fade's 3).")
p.write_text(t, encoding='utf-8')
print('budgets edited')
