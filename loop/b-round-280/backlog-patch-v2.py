# B round 280 -> 281: patch after the pre-check finding (D-29z657). Run once.
import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
assert b['decisions_log_b'][-1]['id'] == 'D-29z656', 'already patched?'
ADDED = '2026-10-31 B round 280 -> 281 planning (pre-check patch)'
def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i: return x
    raise KeyError(i)
d = find(b['decisions_log_b'], 'D-29z652')
d['text'] += (' AMENDED by D-29z657: plus a shared waitForLibraryReady(page) in perf/lib/page.ts that replaces the three identical 90 s library-ready predicates '
              '(1a measureLoad, 1b-i and 1b-ii measureLoadReady) and throws "demo collection failed before the library was ready: <status>" when the status shows the failed text first.')
d = find(b['decisions_log_b'], 'D-29z653')
d['text'] += ' AMENDED by D-29z657: PERF-1b-ii is now re-run; oracle c-round-280/run-1/latest-resources.json, equiv-check-b2.py with --tol res.export.{1,2}.peak-backing-delta-mib=0.1 only (no note exemptions).'
b['decisions_log_b'].append({'id': 'D-29z657', 'date': '2026-10-31', 'text': (
    'Pre-check finding (B L23): the round-281 sketch v1 changed only waitForCollectionReady, but the runtime mutant MU-FAILED-SOURCE (selected source /middle-east.mp3 aborted) still aborted every pass with '
    '"aborted at load: page.waitForFunction: Timeout 90000ms exceeded." because measureLoad\'s 90 s library-ready predicate runs first and never resolves (Add stays aria-disabled, no preview wave; '
    'b-round-280/failed-other-probe.json, head-load-control-partial.json). Design widened within the same three items: shared waitForLibraryReady in perf/lib/page.ts used by all three specs; '
    'waitForCollectionReady change kept (it catches a non-selected source failure, where Add and the wave do become ready). Grants +3 (1a spec, resources spec, doc 169 approach intro); '
    'frozen 1134; MU-READY-ONLY dropped (HEAD control = head-load-control-partial.json); new mutant MU-FAILED-OTHER (/hero-music.mp3).')})
b['open_findings'].append({'id': 'B-R281-GATE279-S1-PREMISE', 'severity': 'info', 'origin': 'gate reviewer premise (gates/round-279/review.md suggestion 1); caught by B L23 pre-check, round 281 planning; counted at RETRO 290',
    'status': 'recorded (D-29z657)', 'title': 'GATE279-S1 named waitForCollectionReady as the wait that times out on a failed demo source; the first wait that times out is the 90 s library-ready predicate in all three specs (selected source failed); waitForCollectionReady only sees a non-selected source failure',
    'evidence': 'b-round-280/head-load-control-partial.json, failed-other-probe.json, mutants/MU-FAILED-SOURCE/run-v1-killed.log', 'added': ADDED})
f = find(b['open_findings'], 'B-R281-RESOURCES-READY-FAILED')
f['title'] = 'PERF-1b-ii has no status wait: when a NON-selected demo source fails after the library is ready (Add enabled + waveform), it continues and measures with a failed source (the selected-source case is covered by waitForLibraryReady from round 281)'
f['status'] = 'signal (D-29z657, narrowed; not scheduled): adding a status wait to 1b-ii moves time-since-load rows such as res.mem.used-ready-mib (round 279 measured) | ' + f['status']
r = [x for x in b['rounds'] if x.get('round') == 281][0]
r['note'] += (' | D-29z657 pre-check finding: v1 sketch could not fire (90 s library-ready predicate first); v2 = shared waitForLibraryReady in all three specs; '
              'v2 3-spec perf run + mutants MU-FAILED-SOURCE / MU-FAILED-OTHER: see b-round-280/v2-equiv.txt and mutants-summary.txt')
r['decision'] = 'D-29z650..D-29z657'
b['current_task'] = b['current_task'].replace('current-task.md (round 281, D-29z650..D-29z656;', 'current-task.md (round 281, D-29z650..D-29z657; + shared waitForLibraryReady replacing the three 90 s library-ready predicates;')
b['current_task'] = b['current_task'].replace('oracle c-round-279/results-1 (1a + 1b-i, code identical); mutants MU-FAILED-SOURCE, MU-READY-ONLY, MU-NO-OWN-GUARD)', 'oracles c-round-279/results-1 (1a + 1b-i) and c-round-280/run-1 (1b-ii, peak +-0.1); mutants MU-FAILED-SOURCE, MU-FAILED-OTHER, MU-NO-OWN-GUARD; frozen 1134)')
sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
st = find(sp['stages'], 'PERF-HARNESS-DIAG-281')
st['what'] += ' | D-29z657: + shared waitForLibraryReady (perf/lib/page.ts) replacing the three identical 90 s library-ready predicates; all three specs re-run'
b['updated'] = ADDED
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok')
