# B round 459 -> 460 planning: backlog.json update. Run once from the loop root: python3 -I b-round-459/update-backlog-460.py
import json, os, sys
P = 'backlog.json'
MARK = 'b-round-459/update-backlog-460.done'
if os.path.exists(MARK):
    sys.exit('already applied')
b = json.load(open(P, encoding='utf-8'))
WHO = '2026-11-12 B round 459 -> 460 planning'
D1, D2 = 'D-29z1626', 'D-29z1627'
ids = {e.get('id') for e in b['decisions_log_b']}
assert D1 not in ids and D2 not in ids

b['decisions_log_b'].append({'id': D1, 'date': '2026-11-12', 'by': WHO, 'decision': (
    'Round 459 result: C FAIL (c-round-459.json, browserVerified/realVerified true); gate 459 skipped. '
    'A STOP on A-R459-REVIEW-R1 (Medium, origin B spec), confirmed by C as C-R459-01 (confirmedBy, L7): a whole-document client re-render after a hydration mismatch replaced the React-owned cover <style>, so the DOM handshake was lost and no entrance played (HEAD plays). '
    'L10 ruling: STOP accepted; B re-sketched (v2c: typed window.__czabaEntrance handshake, boot skip looks the node up at call time, boot listeners self-remove at 1250 ms (A-R459-REVIEW-R2), render-time media keeps the cover on while pending and < failsafe (TL-R460-1)); stays inside the 5 granted files, no new module (tech-lead: fine within the grant). '
    'C-R459-02 (Low, B spec): CPU-1 logo/tag floors stay binding; at CPU 4 the 1900 ms cap (D-29z1625) compresses the logo phase, so CPU-4 logo/tag become record-only with a >0 sanity row and the total-duration rows binding; closes on C round 460 PASS. '
    'C-R459-03 (Low, environment): skip latency is measured from the trusted input event timeStamp (probe field removedMinusInput); closes on C round 460 PASS. '
    'C11 SSR half: L1 console spy in the covering run plus a useLayoutEffect grep. Round 459 work stays in the tree (not reverted).')})
b['decisions_log_b'].append({'id': D2, 'date': '2026-11-12', 'by': WHO, 'decision': (
    'Round 460 = SABA-B-13 fix-up (current-task.md): A applies b-round-459/sketch-460-delta.patch.txt (sha 2c99e2b6, tech-lead review 1 REQUEST CHANGES on v2b -> review 2 APPROVE on v2c), updates doc 300 (l.4 -> C round 460 PASS, R1 scenario, E15-E19). '
    'Mutants 27 RED + BASE green (b-round-459/mutants/mutants.txt). Browser: R1 inject overlay plays on v2 3/3 vs v1 0/3 vs HEAD 3/3 (probe/r1/r1-b.txt); full frame matrix on v2c in probe/matrix/summary.txt incl. inject and delayinject. '
    'Regression not due (2026-11-13). Saba question SABA-Q-ENTRANCE-BACKGROUND-TAB added (default keep). Architecture note -> SIG-R459-ENTRANCE-HANDSHAKE (signal only).')})

of = b['open_findings']
def add_of(e):
    assert e['id'] not in {x.get('id') for x in of}, e['id']
    e.setdefault('added', WHO); of.append(e)
add_of({'id': 'A-R459-REVIEW-R1', 'severity': 'medium', 'origin': 'B spec',
        'status': f'scheduled round 460 ({D2}); closes on C round 460 PASS of the R1/inject rows',
        'title': 'Whole-document client re-render after a hydration mismatch loses the entrance handshake: no entrance plays (HEAD plays), boot capture listeners leak, cover drops',
        'confirmedBy': ['C-R459-01 (c-round-459.json, r1-c.txt)'],
        'evidence': 'a-round-459.md, a-round-459/r1/, c-round-459/r1-c.txt, b-round-459/probe/r1/r1-b.txt'})
add_of({'id': 'A-R459-REVIEW-R2', 'severity': 'low', 'origin': 'A',
        'status': f'scheduled round 460 ({D2}): boot listeners self-remove after FAILSAFE+EXIT (E18, M23); closes on C round 460 PASS',
        'title': 'Boot capture listeners have no self-timeout if SpotlightLoader never mounts', 'evidence': 'a-round-459.md'})
add_of({'id': 'C-R459-02', 'severity': 'low', 'origin': 'B spec',
        'status': f'criterion ruled ({D1}); closes on C round 460 PASS of C6',
        'title': 'C6 logo/tag floors (600/400) missed at 1440 CPU 4 (cap 1900 compresses the logo phase under throttling)',
        'evidence': 'c-round-459/matrix/summary.txt, matrix/repeats.txt'})
add_of({'id': 'C-R459-03', 'severity': 'low', 'origin': 'environment',
        'status': f'criterion ruled ({D1}): measured from the input event; closes on C round 460 PASS of C9',
        'title': 'C9 click50 at 1440 CPU 1 measured 311-373 ms from firstCovered (probe latency: click issued after a boundingBox round trip)',
        'evidence': 'c-round-459/matrix/summary.txt; b-round-459/probe/matrix (removedMinusInput)'})
add_of({'id': 'SABA-Q-ENTRANCE-BACKGROUND-TAB', 'severity': 'info', 'origin': 'A (code-reviewer A-R459-REVIEW-R5)',
        'status': f'awaiting_user ({D1}): non-blocking; default keep once per tab (a background tab uses up the entrance)',
        'title': 'A / opened in a background tab plays the entrance unseen and uses up the once-per-tab entrance',
        'evidence': 'user-review/questions-saba-b-13.md (2026-11-12 round 459 -> 460 addendum)'})

dl = b['deferred_low_polish']
for e in dl:
    if e.get('id') == 'TL-R459-COLOR-BLACK-DEP':
        e.setdefault('confirmedBy', []).append('A-R459-REVIEW-R3 (a-round-459.md)')
    if e.get('id') == 'TL-R459-TEST-NITS':
        e.setdefault('confirmedBy', []).append('A-R459-REVIEW-R8 remainder (E11 source regex, findOverlay unused parameter)')
for e in [
    {'id': 'A-R459-REVIEW-R4', 'severity': 'info', 'origin': 'A', 'status': f'deferred_low_polish ({D1}): record for future CSP work',
     'title': 'No CSP exists; a future CSP needs hashes for the inline entrance <script>/<style> (both fail safe)', 'evidence': 'a-round-459.md'},
    {'id': 'A-R459-REVIEW-R8', 'severity': 'low', 'origin': 'A', 'status': f'deferred_low_polish ({D1}): node-replacement + listener assertions land in round 460 (E15-E18); E11 source regex and findOverlay(_container) unused parameter remain',
     'title': 'Entrance test gaps', 'evidence': 'a-round-459.md'},
    {'id': 'TL-R460-2', 'severity': 'low', 'origin': 'tech-lead review of sketch-460', 'status': f'C row in round 460 ({D2}): delayinject rows must end expired with no black after ~1250 ms; closes on C PASS',
     'title': 'No Chromium probe beyond the failsafe for slow JS + #418', 'evidence': 'b-round-459/sketch-review.md'},
]:
    assert e['id'] not in {x.get('id') for x in dl}
    e['added'] = WHO; dl.append(e)
closed = b.setdefault('closed_findings_round_460_planning', [])
closed += [
    {'id': 'A-R459-REVIEW-R6', 'status': f'closed ({D1}): fixed by A in doc 300 (round 459)'},
    {'id': 'A-R459-REVIEW-R7', 'status': f'closed ({D1}): browser-only claim, covered by C9'},
    {'id': 'TL-R460-1', 'status': f'closed ({D2}): applied in sketch v2c (E19, M27); tech-lead review 2 resolved'},
    {'id': 'TL-R460-3', 'status': f'closed ({D2}): helper renamed reinsertCoverHeadHtml'},
]

b['architecture_signals'].append({'id': 'SIG-R459-ENTRANCE-HANDSHAKE', 'added': WHO,
    'source': 'A round 459 code-reviewer Architecture note',
    'status': f'signal ({D1})',
    'note': 'The entrance state machine is split between an inline JS string (boot script) and React (SpotlightLoader); round 460 moves the contract onto a typed window global. Keep. Extract app/lib/entrance-handshake.ts only if the boot script grows again; acceptance = E1-E19 + mutants unchanged; root.tsx untouched.'})

b['retro_candidates'].append({'id': 'RETRO465-B-PREHYDRATION-HANDSHAKE', 'added': WHO, 'decision': D1, 'status': 'retro input RETRO 465',
    'text': 'Round 459 FAIL: B sketch and two tech-lead reviews missed that React 18 hydrateRoot(document) client-renders the whole document after a mismatch, replacing React-owned nodes that a pre-hydration script had mutated. Candidate lesson: any pre-hydration DOM handshake keeps its state outside React-owned nodes and carries a browser row with an injected-node hydration mismatch (and one with slow JS + mismatch).'})

for t in b['tech_lead_manual_checks']:
    if t.get('id') == 'TLM-R459-FIREFOX-SAFARI-ENTRANCE':
        t['status'] = 'open (after round 460 C PASS)'

for r in b['rounds']:
    if r.get('round') == 459:
        r['status'] = 'C FAIL (C-R459-01 Medium = A-R459-REVIEW-R1; C-R459-02/03 Low); gate 459 skipped; re-dispatched as round 460 (' + D1 + ')'
b['rounds'].append({'round': 460, 'task': 'current-task.md', 'decision': D2,
    'type': 'SABA-B-13 fix-up: entrance survives a hydration re-render (C-R459-01), boot listener self-timeout, ruled C6/C9/C11',
    'status': 'dispatched',
    'note': 'baseline 891dc0f (gate 458 commit; gate 459 skipped); tree holds round-459 v1 + doc 300; A applies b-round-459/sketch-460-delta.patch.txt sha 2c99e2b6 (tech-lead APPROVE review 2); grants = b-round-458/grants-459.txt (5 paths, root.tsx unchanged vs v1)'})

q = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN'][0]
q['status'] = (f'in_progress ({D2}): round 460 = SABA-B-13 fix-up (C-R459-01); then REGRESSION-2026-11-13 if planned on/after 11-13, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5 | ' + q['status'])
b['current_task'] = f'Round 460: SABA-B-13 fix-up, entrance handshake survives a hydration re-render (current-task.md, {D2})'
assert b['version'] == 451, b['version']
b['version'] = 452
b['updated'] = '2026-11-12'
open(P, 'w', encoding='utf-8').write(json.dumps(b, indent=2, ensure_ascii=True))
open(MARK, 'w').write('applied 2026-11-12\n')
print('ok')
