# B round 460 -> 461 planning: backlog.json update. Run once from the loop root: python3 -I b-round-460/update-backlog-461.py
import json, os, sys
P = 'backlog.json'
MARK = 'b-round-460/update-backlog-461.done'
if os.path.exists(MARK):
    sys.exit('already applied')
b = json.load(open(P, encoding='utf-8'))
WHO = '2026-11-12 B round 460 -> 461 planning'
D1, D2 = 'D-29z1628', 'D-29z1629'
ids = {e.get('id') for e in b['decisions_log_b']}
assert D1 not in ids and D2 not in ids
SHA = open('b-round-460/sketch-461.sha256').read().split()[0]

b['decisions_log_b'].append({'id': D1, 'date': '2026-11-12', 'by': WHO, 'decision': (
    'Round 460 result: C PASS (c-round-460.json: C1-C16 passed, browserVerified/realVerified true, 0 bugs; Firefox/Safari BLOCKED as TLM-R459-FIREFOX-SAFARI-ENTRANCE); '
    'gate 460 published ffd0c7c (gates/gate-round-460.json; review COMMIT OK 8.5/10, gates/round-460/review.md). '
    'SABA-B-13 (STORE-2b-ENTRANCE) done: C5 first frame black, C6 duration, C8 failsafe, C9 skip, C12 R1 inject 3/3 plays, C13 delayinject expired with reblack 0, C15 Studio + anonymous protection. '
    'Closed on C evidence: A-R459-REVIEW-R1 (C12), A-R459-REVIEW-R2 (C12/C13 + E18 in C4), C-R459-02 (C6), C-R459-03 (C9), TL-R460-1 and TL-R460-2 (C13), TL-R460-3 (C3/C4), A-R459-REVIEW-R6 (C16), A-R459-REVIEW-R7 (C9). '
    'New from round 460: A-R460-REVIEW-1 (Medium, test quality: no real hydrateRoot test) is a fixable in-loop Medium under the 2026-10-23 bug gate, so it outranks STORE-2b-3c-2b (Low/info). '
    'A-R460-REVIEW-2 and -4 are unverified Lows (C did not run the optional probes); -3 = TL-R459-COLOR-BLACK-DEP = GATE460-1 (confirmedBy); -5 doc half fixed by A, code comment half is a Low; '
    'GATE460-3 = A-R459-REVIEW-R4 (confirmedBy); GATE460-4 = A-R459-REVIEW-R8 E11 part (confirmedBy); GATE460-5 joins TL-R459-TEST-NITS; GATE460-2 (dust particles re-randomized per phase) new Low. '
    'Architecture notes (A code-reviewer + gate reviewer) recorded on SIG-R459-ENTRANCE-HANDSHAKE; no checkpoint requested (single consumer, keep).')})
b['decisions_log_b'].append({'id': D2, 'date': '2026-11-12', 'by': WHO, 'decision': (
    'Round 461 = SABA-B-13 test hardening (test-only; current-task.md): A applies b-round-460/sketch-461.patch.txt (sha ' + SHA[:16] + ') to app/lib/__tests__/store-entrance-loader.test.tsx and adds a round-461 testing note to doc 300. '
    'Closes A-R460-REVIEW-1 (E20/E20b/E21: real hydrateRoot on document.head in jsdom, a foreign node forces the client re-render; clean hydration keeps the boot node), A-R460-REVIEW-6 (E9 asserts boot capture + window takeover listener removal), A-R460-REVIEW-7 (E1b server branch with window undefined); '
    'cheap same-file nits GATE460-4 (E11 regex relaxed) and GATE460-5 (E8 const). Mutants M1-M10 RED, BASE green (b-round-460/mutants/mutants.txt). '
    'Regression: not due today (2026-11-12); the next round planned on/after 2026-11-13 is REGRESSION-2026-11-13. Then STORE-2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5.')})

of = b['open_findings']
def find(lst, i):
    return [x for x in lst if isinstance(x, dict) and x.get('id') == i]
def close(i, why):
    hit = find(of, i)
    assert len(hit) == 1, i
    hit[0]['status'] = f'closed ({D1}): {why}'
    hit[0]['closedBy'] = 'C round 460 PASS (c-round-460.json), gate 460 published ffd0c7c'
close('A-R459-REVIEW-R1', 'C12 R1 inject: tree 3/3 plays (v1 0/3), frames inject valid rows overlaySeen, gaps 0, reblack 0 (c-round-460/r1-c.txt)')
close('A-R459-REVIEW-R2', 'E18 green in C4 covering, M23 RED; C13 delayinject no leak symptoms')
close('C-R459-02', 'C6 PASS under the ruling (CPU-4 logo/tag record-only > 0)')
close('C-R459-03', 'C9 PASS from the input event (removedMinusInput CPU1 5-58, CPU4 9-137)')
close('A-R459-REVIEW-R6', 'C16 docs PASS')
close('A-R459-REVIEW-R7', 'C9 PASS')
close('TL-R460-3', 'C3 apply + C4 covering/mutants PASS')
for i in ('TL-R460-1',):
    if find(of, i):
        close(i, 'C13 delayinject PASS (expired, reblack 0)')

def add_of(e):
    assert not find(of, e['id']), e['id']
    e.setdefault('added', WHO); of.append(e)
add_of({'id': 'A-R460-REVIEW-1', 'severity': 'medium', 'origin': 'A (code-reviewer, round 460)',
        'status': f'scheduled round 461 ({D2}); closes on C round 461 PASS of rows C4/C5',
        'title': 'No unit test runs a real hydrateRoot: (a) mismatch re-render recreates the cover <style> with render-time media, (b) clean hydration keeps the boot node and media=all; only browser rows C11-C13 cover them',
        'evidence': 'a-round-460.md (code-reviewer findings); b-round-460/sketch-461.patch.txt; b-round-460/mutants/mutants.txt'})

dl = b['deferred_low_polish']
def add_dl(e):
    assert not find(dl, e['id']), e['id']
    e['added'] = WHO; dl.append(e)
add_of({'id': 'A-R460-REVIEW-6', 'severity': 'low', 'origin': 'A (code-reviewer, round 460)',
        'status': f'scheduled round 461 ({D2}) with A-R460-REVIEW-1 (same file, costs little); closes on C round 461 PASS (mutants M6-M8)',
        'title': 'E9 can false-pass: removal of the window takeover listener and of the boot capture listeners is not asserted',
        'evidence': 'a-round-460.md'})
add_of({'id': 'A-R460-REVIEW-7', 'severity': 'low', 'origin': 'A (code-reviewer, round 460)',
        'status': f'scheduled round 461 ({D2}) with A-R460-REVIEW-1; closes on C round 461 PASS (mutants M3/M4)',
        'title': 'Server branch of isEntrancePending (typeof window === undefined) never exercised',
        'evidence': 'a-round-460.md'})
add_dl({'id': 'A-R460-REVIEW-2', 'severity': 'low', 'origin': 'A (code-reviewer, round 460)',
        'status': f'deferred_low_polish ({D1}); unverified: C round 460 did not run the optional probe (C13 delayinject reblack 0 covers it partly)',
        'title': 'After a document re-render body::before failsafe may restart; with no takeover at / (ErrorBoundary) the cover may last re-render + 1250 ms',
        'evidence': 'a-round-460.md; c-round-460.json notRun'})
add_dl({'id': 'A-R460-REVIEW-4', 'severity': 'low', 'origin': 'A (code-reviewer, round 460)',
        'status': f'deferred_low_polish ({D1}); unverified: optional C probe not run',
        'title': 'Skip between claimEntranceStart and the hand-off effect may commit the overlay for one frame (possible one-frame black flash); E14 has no watchOverlayMounts assert',
        'evidence': 'a-round-460.md; c-round-460.json notRun'})
add_dl({'id': 'A-R460-REVIEW-5', 'severity': 'low', 'origin': 'A (code-reviewer, round 460)',
        'status': f'deferred_low_polish ({D1}): doc half fixed by A in doc 300; code comment SpotlightLoader.tsx (entranceTimeline) still says time counts from data-start',
        'title': 'Stale comment: entrance timeline no longer reads data-start', 'evidence': 'a-round-460.md'})
add_dl({'id': 'GATE460-2', 'severity': 'low', 'origin': 'gate reviewer round 460',
        'status': f'deferred_low_polish ({D1})',
        'title': 'SpotlightLoader dust particles call Math.random() in render; now rendered from mount, so 3 setPhase calls re-randomize them in the first 300 ms (wasted work, non-deterministic); fix with useState initializer',
        'evidence': 'gates/round-460/review.md finding 2'})
for e in dl:
    if e.get('id') == 'TL-R459-COLOR-BLACK-DEP':
        e.setdefault('confirmedBy', []).extend(['A-R460-REVIEW-3 (a-round-460.md)', 'GATE460-1 (gates/round-460/review.md)'])
    if e.get('id') == 'A-R459-REVIEW-R4':
        e.setdefault('confirmedBy', []).append('GATE460-3 (gates/round-460/review.md)')
    if e.get('id') == 'A-R459-REVIEW-R8':
        e.setdefault('confirmedBy', []).append('GATE460-4 (E11 regex; gates/round-460/review.md)')
        e['status'] = e['status'] + f' | E11 regex part scheduled round 461 ({D2}); findOverlay(_container) unused parameter remains'
    if e.get('id') == 'TL-R459-TEST-NITS':
        e.setdefault('confirmedBy', []).append('GATE460-5 (E8 dead let; gates/round-460/review.md)')
        e['status'] = e['status'] + f' | E8 dead let (GATE460-5) scheduled round 461 ({D2})'
    if e.get('id') == 'TL-R460-2':
        e['status'] = f'closed ({D1}): C13 delayinject PASS (expired, reblack 0)'
    if e.get('id') == 'TL-R459-EXPIRED-CUT':
        e.setdefault('confirmedBy', []).append('A-R460 code-reviewer "takeover/re-render between 1000 and 1250 ms cuts the fade short" (a-round-460.md)')

for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R459-ENTRANCE-HANDSHAKE':
        s.setdefault('updates', []).append({'by': WHO, 'decision': D1,
            'note': 'Round 460: A code-reviewer (keep; extract app/lib/entrance-handshake.ts if a second consumer appears) and gate reviewer (keep; useEntranceHandshake() hook in loading/ only if a later round touches the region, acceptance E1-E19 unchanged). Still signal only; no checkpoint request.'})

for t in b['tech_lead_manual_checks']:
    if t.get('id') == 'TLM-R459-FIREFOX-SAFARI-ENTRANCE':
        t['status'] = f'open ({D1}): Chromium half PASS in C round 460; Firefox/Safari with Saba, deadline RETRO 465'

for r in b['rounds']:
    if r.get('round') == 460:
        r['status'] = f'C PASS (c-round-460.json, browserVerified/realVerified true, 0 bugs); gate 460 published ffd0c7c ({D1})'
b['rounds'].append({'round': 461, 'task': 'current-task.md', 'decision': D2,
    'type': 'SABA-B-13 test hardening (test-only): real hydrateRoot rows (A-R460-REVIEW-1), E9 listener asserts (-6), server branch (-7)',
    'status': 'dispatched',
    'note': 'baseline ffd0c7c (gate 460 published), clean tree; A applies b-round-460/sketch-461.patch.txt sha ' + SHA[:16] + '; grants = b-round-460/grants-461.txt (2 paths)'})

q = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN'][0]
st2 = [x for x in q['stages'] if x['id'] == 'STORE-2'][0]
sp = st2['split_2b_d29z1583']
sp['STORE-2b-ENTRANCE'] = (f'done ({D1}): C round 460 PASS (c-round-460.json, browserVerified/realVerified true, C1-C16, 0 bugs), gate 460 published ffd0c7c (review COMMIT OK 8.5/10); '
    f'round 461 = test hardening of the same file (A-R460-REVIEW-1/6/7, {D2}); Firefox/Safari half TLM-R459-FIREFOX-SAFARI-ENTRANCE (deadline RETRO 465) | ' + sp['STORE-2b-ENTRANCE'])
q['status'] = (f'in_progress ({D2}): round 461 = SABA-B-13 test hardening (A-R460-REVIEW-1 Medium, test-only); then REGRESSION-2026-11-13 if planned on/after 11-13, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5 | ' + q['status'])
b['current_task'] = f'Round 461: SABA-B-13 test hardening, real hydrateRoot rows (current-task.md, {D2})'
assert b['version'] == 452, b['version']
b['version'] = 453
b['updated'] = '2026-11-12'
open(P, 'w', encoding='utf-8').write(json.dumps(b, indent=2, ensure_ascii=True))
open(MARK, 'w').write('applied 2026-11-12\n')
print('ok')
