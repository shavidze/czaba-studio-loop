# B round 434 -> 435 planning, part 1: accept round 434 (v417 -> v418). Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-434/update-backlog-accept.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 417 and b['decisions_log_b'][-1]['id'] == 'D-29z1537', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 434 -> 435 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
F = {f.get('id'): f for f in b['open_findings'] if isinstance(f, dict)}
dec('D-29z1538', 'Round 434 accepted from C evidence: c-round-434.json PASS, 0 bugs, browserVerified/realVerified true (cart ConfirmDialog browser row, fake-bearer row and Firefox/Safari BLOCKED: cloud/backend/engine; gate rows listed as gate). B re-runs: tools/l57-check.py L57 OK (b-round-434/l57-check-c434.txt); b-round-433/probe/compare-scrollbar.py on c-round-434/probe/after -> ALL OK (2 cells), on c-round-434/probe/head -> NOT ALL OK (b-round-434/recheck/); c-round-434/mutants/summary.txt identical to b-round-433/mutants/summary.txt; c-round-434/auth/measured.log pass true. Gate 434 published 8233840 on both remotes (verify: 272 files / 4018 tests, build ok; review COMMIT OK 9/10). SABA-B-12 stage 3b (SABA-B-12-DIALOG-SCROLLBAR) is done; baseline for round 435 = 8233840.')
F['SABA-B-12-DIALOG-SCROLLBAR']['status'] = 'done (D-29z1538): C round 434 PASS browserVerified, published 8233840 | ' + F['SABA-B-12-DIALOG-SCROLLBAR']['status']
F['SABA-B-12']['status'] = 'in_progress (D-29z1515, D-29z1521, D-29z1523, D-29z1527, D-29z1532, D-29z1536, D-29z1538): stages 1, 2a, 2b, 3, 3b passed C and are published (5a30894, 1197dcb, 1a417fb, 0c22ac9, 8233840); stage 4 (selects, STUDIO-VIS-3) in REVIEW-RECOMMENDATIONS'
t = F['TLM-SABA-B-12-FIREFOX-SAFARI']
t.setdefault('confirmedBy', []).append('GATE434 review finding 3 (Firefox shows the OS scrollbar in Studio dialogs; already in scope_r434) (D-29z1539, L7)')
lows = [
 ('GATE434-S1-MODAL-SCROLLBAR-REPLACES', 'gate reviewer', 'Modal scrollbarClassName replaces the default skin instead of adding to it: an empty string removes the skin (filtered by A: scrollbarClassName="" falls back), a value with spaces is passed as is; doc 282 point 6 records it; suggested type-level note', 'gates/round-434/review.md finding 1'),
 ('GATE434-S2-DS4-SOURCE-SCAN-SCOPE', 'gate reviewer', 'DS4 is a source-text scan of top-level app/components/arrangement/*.tsx via process.cwd(); a Modal in a subfolder or in studio/ is not flagged and a renamed prop breaks it; doc 282 point 7 names the scope; fix with a StudioDialog render test at the ARCH checkpoint', 'gates/round-434/review.md finding 2'),
 ('B-R434-CONFIRMMODAL-NAME', 'B spec', 'round-434 task text section 1 and ruling 1 named the store Modal user ConfirmModal; the component is ConfirmDialog (Modal.tsx, used by cart.tsx); A fixed doc 282, task text stays archived as written', 'a-round-434.md For B; c-round-434.md For B'),
]
for i, o, title, ev in lows:
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': o, 'status': 'deferred_low_polish (D-29z1539)', 'title': title, 'evidence': ev, 'added': BY})
for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS':
        r.setdefault('signals', []).append('gate 434 Architecture note + a-round-434.md For B: shared store Modal carries a Studio-only scrollbarClassName enforced by the DS4 source scan; keep for two callers; revisit a StudioDialog wrapper (skin, focus trap, Esc) on a third Studio dialog = question 4 of this request (D-29z1539; signal, not scheduled)')
dec('D-29z1539', 'Round 434 findings: gate review findings 1 and 2 -> deferred_low_polish GATE434-S1-MODAL-SCROLLBAR-REPLACES, GATE434-S2-DS4-SOURCE-SCAN-SCOPE; finding 3 (Firefox OS scrollbar) is a confirmedBy on TLM-SABA-B-12-FIREFOX-SAFARI (L7), not a new id; B-R434-CONFIRMMODAL-NAME (B spec, Low) -> deferred_low_polish; the gate/A Architecture note is a signal on ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS question 4, not a scheduled task.')
b['version'] = 418
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n'); print('ok v418')
