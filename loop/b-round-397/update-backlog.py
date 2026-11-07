import json, sys, os
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
DONE = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-397/update-backlog.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
b = json.load(open(P))
assert b['version'] == 364, b['version']
by = '2026-11-07 B round 397 -> 398 planning'
d = '2026-11-07'

def find(lst, i):
    for x in lst:
        if x.get('id') == i:
            return x
    raise KeyError(i)

q = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
st = {s['id']: s for s in q['stages']}
st['PERF-13d']['status'] = 'done (D-29z1359): C round 397 PASS (c-round-397.json browserVerified/realVerified true, 0 bugs), gate 397 published c93d926 | ' + st['PERF-13d']['status']
st['PERF-13']['status'] = 'done (D-29z1359): 13a, 13b, 13c, 13d done (c93d926); doc 247 Completed (C round 397 PASS) | ' + st['PERF-13']['status']
st['PERF-14']['status'] = ('in_progress (D-29z1360): split 14a (round 398: lane data-clip-count model signal + 200-clip scale harness + doc 254; scale rows all record) / 14b (clip virtualization; owner of the 51-file DOM-locator sweep b-round-397/sweep-clip-dom-locators.txt) / 14c (power-of-two peak pyramid in the peaks worker + canvas tiles; fix home of the round-315 peaks Lows). '
    'Premise at HEAD c93d926 (b-round-397/probe/head-200-*.json): 200 clips -> page 4294/4277 elements, clip subtrees 3400 (17 each), 1 clip in the window at default zoom, 16-19 at min zoom; zoom keydown max 48/40 ms 1x, 272/280 ms 6x | ' + st['PERF-14']['status'])
st['PERF-14']['probe_note_correction_d29z1360'] = 'probe_note_d29z217 (ruler grows with project length) is obsolete: since PERF-3b the ruler is windowed (res.dom.ruler-1 = ruler-2 = 95, c-round-396/perf-results/latest-resources.json; 95/79 with 200 clips, b-round-397/probe/head-200-1x-*.json). The 2000-element target now depends on the clips only.'
st['PERF-14']['stages_d29z1360'] = [
    {'id': 'PERF-14a', 'what': 'lane data-clip-count (model count, ArrangementLane.tsx; LC1-LC5, 5 mutants red, sketch b-round-397/sketch-398.patch.txt) + 200-clip scale harness perf/studio-lab-scale.perf.spec.ts + perf/budgets.scale.json (record rows) + doc 254', 'status': 'dispatched round 398 (D-29z1360)'},
    {'id': 'PERF-14b', 'what': 'clip virtualization (render clips intersecting the scroll window + overscan; gesture clip and lane-move sources stay mounted; Q-14B-PIN-SELECTED: pin selected clips (tech-lead) vs not (performance-optimizer: select-all would remount 200), rule with a select-all measurement; jsdom with no layout already renders all, lock with one row; first collision block = b-round-397/sweep-clip-dom-locators.txt (51 files); scale rows res -> assert (page <= 2000 at default and min zoom) from B sketch run', 'status': 'not_started'},
    {'id': 'PERF-14c', 'what': 'power-of-two peak pyramid in the peaks worker, canvas tiles for the visible window; closes C-R315-T1/T2, A-R315-REVIEW-L1..L4, GATE315-S2, GATE315-S8 (peaks.client.ts owner)', 'status': 'not_started'},
]
q['status'] = 'in_progress (D-29z1359): PERF-13 done (c93d926); round 398 = PERF-14a (scale harness); then 14b, 14c, PERF-15; regression due on/after 2026-11-10; RETRO 400 | ' + q['status']

for f in b['open_findings']:
    if f.get('id') in ('R314-DEMO-BUFFER-LONGTASK-6X', 'PERF2-STEREO-COPY'):
        f['status'] = 'closed (D-29z1359): fixed round 397, C PASS BUF-TASKS/BUF-SAME-ARRAY (c-round-397.json), gate 397 published c93d926 | ' + f['status']

b['deferred_low_polish'].append({
    'id': 'C-R397-NOTE-LONGTASK-1280', 'severity': 'low', 'origin': 'C round 397 (harness)',
    'evidence': 'c-round-397.json lows[0]; c-round-397.md BUF-TASKS',
    'title': 'one 1440x900 run (run 3; the id says 1280 but C text says 1440) had 1 synth build inside a 72 ms long task at 6x; the row allows <= 1; recorded, not a failure',
    'status': 'deferred_low_polish (D-29z1361)', 'added': by})

b['deferred_low_polish'].append({
    'id': 'GATE397-L1-HIDDEN-TAB-YIELD', 'severity': 'low', 'origin': 'gate 397 reviewer',
    'evidence': 'gates/round-397/review.md findings 1-3',
    'title': 'studio-lab-demo.ts setTimeout(0) yield is throttled in a hidden tab (about 1 s later ready); the yield timer is not cancelled on abort; the abort check runs after the worker await. Reviewer: keep, no fix; doc 253 records the hidden-tab trade-off',
    'status': 'deferred_low_polish (D-29z1361): reviewer ruled keep; re-check only if a hidden-tab load row is ever added', 'added': by})
b['architecture_signals'].append({
    'id': 'GATE397-ARCH-YIELD-HELPER', 'origin': 'gate 397 reviewer', 'evidence': 'gates/round-397/review.md Architecture note',
    'signal': 'keep yieldToNextTask local in studio-lab-demo.ts; extract a small lib/arrangement helper with its own test only if a second collection needs one-build-per-task',
    'status': 'signal (D-29z1361), not scheduled', 'added': by})
b['decisions_log_b'].extend([
    {'id': 'D-29z1359', 'date': d, 'by': by, 'decision': 'Round 397 accepted from evidence: C PASS (c-round-397.json, browserVerified/realVerified true, 0 bugs; L57 check OK b-round-397/l57-check-c397.txt), gate 397 published c93d926 on both remotes. PERF-13d done, so PERF-13 is done; R314-DEMO-BUFFER-LONGTASK-6X and PERF2-STEREO-COPY closed. A reviewer pass-1 Medium on doc l.4 is the L28 convention, no id.'},
    {'id': 'D-29z1360', 'date': d, 'by': by, 'decision': 'PERF-14 premise re-measured at HEAD (L37, b-round-397/probe/head-200-*.json) and split 14a/14b/14c. Round 398 = PERF-14a: lane data-clip-count model signal (tech-lead; sketch pre-checked: tsc 0, Biome 0, full suite rc 0, 5/5 mutants red, tech-lead review + delta review 0 Medium+, b-round-397/sketch-review.md) + new scale perf spec and budgets (all record, not run on sketch; harness self-checks push problems) + doc 254 (In Progress stage 1 of 3). Consults performance-optimizer + tech-lead (b-round-397/consults.md). Obsolete ruler premise corrected on PERF-14.'},
    {'id': 'D-29z1361', 'date': d, 'by': by, 'decision': 'C-R397-NOTE-LONGTASK-1280 (Low, harness) and GATE397-L1-HIDDEN-TAB-YIELD (gate 397 reviewer Lows 1-3, ruled keep) to deferred_low_polish; GATE397-ARCH-YIELD-HELPER recorded as an architecture signal, not scheduled. Q-14B-PIN-SELECTED recorded on PERF-14b.'},
])
b['rounds'].append({'round': 398, 'task': 'current-task.md', 'decision': 'D-29z1359..D-29z1361', 'type': 'PERF-14a: 200-clip scale perf harness (record rows) + doc 254', 'status': 'dispatched', 'note': 'baseline c93d926 clean; grants b-round-397/grants-398.txt (5: ArrangementLane.tsx + 4 new); frozen b-round-397/r398-frozen-sha256.txt (1288); sketch b-round-397/sketch-398.patch.txt sha bd8fe321; claims b-round-397/claims-398.sh', 'added': by})
for r in b['rounds']:
    if r.get('round') == 397 and r.get('status') == 'dispatched':
        r['status'] = 'done (D-29z1359): C PASS, gate 397 published c93d926'
b['current_task'] = 'Round 398: PERF-14a: lane data-clip-count model signal + 200-clip scale perf harness (perf/studio-lab-scale.perf.spec.ts + perf/budgets.scale.json, record rows: DOM at default and min zoom, clips in DOM and in window, zoom keydown p95/max 1x and 6x, components per zoom key) + doc 254 (current-task.md)'
b['version'] = 365
b['updated'] = by
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('ok\n')
print('applied v365')
