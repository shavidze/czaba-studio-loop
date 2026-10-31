import json, sys
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
A = '2026-10-31 B round 289 -> 290 planning'
if any(x.get('id') == 'D-29z718' for x in b['decisions_log_b']):
    sys.exit('already applied')
def f(key, i):
    for x in b[key]:
        if x.get('id') == i:
            return x
    raise KeyError(i)
T = 'RETRO 290 (D-29z718): '
for i in ('B-R280-TASK-2.4-OVERSTATED', 'B-R281-GATE279-S1-PREMISE', 'INFO-B282-CONSULT-FALSE-CLAIMS'):
    x = f('open_findings', i)
    x['status'] = T + 'counted in retro-290 section 8 / claims-findings-hand.txt (B-found before damage; not in the experiment baseline) | ' + str(x.get('status'))
for i in ('C-R261-N2-WIRING-WORDING', 'RC-R266-JSX-ATTR-GREP', 'RC-R270-TEST-ID-COLLISION'):
    x = f('retro_candidates', i)
    x['status'] = T + 'retired as a candidate: no second instance among the 275-289 C bugs, gate fails or C FAIL causes (fails-detail.txt, fails-cause-hand.txt); reopen on a second instance | ' + str(x.get('status'))
x = f('retro_candidates', 'RC-R265-AT-RISK-NO-ROW')
x['status'] = T + 'watch closed: none of the 4 failures in 275-289 is of this class (fails-cause-hand.txt) | ' + str(x.get('status'))
b['retro_candidates'].append({'id': 'RC-R284-POST-FRAME-PROBE', 'added': A, 'text': 'D-29z689 lesson candidate (1x, B-found): a per-frame painted-state check uses a post-frame probe (requestAnimationFrame -> setTimeout 0)', 'status': T + 'not added to lessons (1x, line budget); watch to RETRO 305'})
x = f('architecture_signals', 'GATE264-ARCH-TEST-HELPER')
x['status'] = T + 're-reviewed: helpers/workspace-test-environment.ts is referenced by 13 files in app at 5a911ff (b-round-289/helper-users.txt; 13 at a4c0e24); keep as systemic test-only candidate together with ROOT-RECON-GRID-HARNESS (visual-stage boundary); interim rule unchanged | ' + str(x.get('status'))
b['decisions_log_b'].append({'id': 'D-29z718', 'date': '2026-10-31', 'text': 'RETRO 290 inventory of every backlog entry naming RETRO 290 (b-round-289/retro290-mention-ids.txt, C-R275-01 lesson): B-R280/B-R281/INFO-B282 counted; C-R261-N2, RC-R266, RC-R270 retired (no 2nd instance); RC-R265 watch closed; RC-R284-POST-FRAME-PROBE added (watch to 305); GATE264-ARCH-TEST-HELPER re-reviewed (13 users, kept).'})
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok')
