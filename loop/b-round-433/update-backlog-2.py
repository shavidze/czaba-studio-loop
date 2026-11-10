# B round 433 -> 434 backlog follow-up after the close review (v416 -> v417). Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-433/update-backlog-2.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 416 and b['decisions_log_b'][-1]['id'] == 'D-29z1536', (b['version'], b['decisions_log_b'][-1]['id'])
b['decisions_log_b'].append({'id': 'D-29z1537', 'date': '2026-11-10', 'by': '2026-11-10 B round 433 -> 434 planning (close review, advisor)', 'decision': 'Close-review follow-ups. (1) Lesson L61 amended in place (lessons.md stays 60 lines; copy b-round-433/lessons-before-434.md): the parts list names the scrollbar and the rule states the headless --hide-scrollbars trap and ignoreDefaultArgs; this is the SABA-B-12 scrollbar "Why we missed it" rule; C row 6 / K22 check it. (2) Neighbour: round 433 clear-probe.mjs + compare-clear.py (hidden-bar harness) on the sketch at :5174 -> ALL OK (2 cells) incl. input-box-670x38 (b-round-433/probe/neighbour-clear/compare.txt); added as C row 4b; REG-SABA-B-12-SEARCH-CLEAR unaffected. (3) gates/round-433/review.md read in full: its Architecture note (keep; shared search-field constant only on a third field) = TL-R433-06, already in ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS; no further finding. (4) Store Modal user: app/routes/cart.tsx ConfirmDialog -> Modal (default skin); needs cart items, so no cloud browser row (backend unavailable in cloud); DS1 proves the default at unit level; task text corrected. (5) STEM-LANES: AGREE-STEM-LANES.md has no answer (K21 0); no new decision files in user-review/.'})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-2026-11-13':
        x.setdefault('scope_additions', []).append({'id': 'REG-CART-CONFIRMDIALOG-SKIN', 'what': 'If a backend or mock API is available: /cart remove confirmation (ConfirmDialog -> Modal) still uses the store styled-scrollbar default after round 434; otherwise BLOCKED backend unavailable in cloud', 'added': 'D-29z1537'})
b['version'] = 417
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v417')
