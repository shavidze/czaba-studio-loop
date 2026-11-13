# B round 494 -> 495 planning: advisor closing-check corrections (D-29z1771). Run once from the loop root.
import json, os, sys
M = 'b-round-494/update-backlog-fix.done'
if os.path.exists(M): sys.exit('refused: .done marker exists')
if not os.path.exists('b-round-494/update-backlog-retro.done'): sys.exit('retro update first')
b = json.load(open('backlog.json'))
BY = '2026-11-13 B round 494 -> 495 planning (advisor closing check)'
def get(sec, i):
    for e in b[sec]:
        if isinstance(e, dict) and e.get('id') == i: return e
    raise SystemExit(f'missing {sec}:{i}')
f2 = get('deferred_low_polish', 'A-R493-REVIEW-F2')
f2['status'] = 'deferred_low_polish (D-29z1771): open half = trigger type="button" has no test/mutant (confirmedBy gate 494 finding 3); the doc-wording half was verified by C round 494 C9 (D-29z1764) | ' + f2['status'].split(' | ', 1)[1]
e = get('open_findings', 'B-R471-SKETCH-UNREVIEWED')
e['status'] = 'closed (D-29z1771): RETRO 495 counter l58-check 15/15 met (b-round-494/data/l58-check-window.txt) | ' + e['status']
b['advisor_used_by_B'] = '2026-11-13 B round 494 -> 495 planning (RETRO 495): advisor available and consulted after orientation (approach: RETRO 495 with window 480-494, accept only C-evidenced closures, freeze retro input, consult tech-lead + product-designer, score counters honestly) and as the closing check (fixes D-29z1771: retro section 3 placeholders, archive-proof K24 via tools/find-ids.py, tagged selectors in row 3, opened relayed citations, SABA-B-17 counted as a recurrence of SABA-B-13, unopened full-screen PNGs disclosed, feature-status status words, B-R471 closed, baseline head, ruling line for account.tsx, L26 doc-correction vs sketch sha note) | ' + str(b['advisor_used_by_B'])
b['baseline']['head_round_495'] = {'head': '3bcf8cb6d62e5cdbbc8b6de0263c02d316d74b52', 'source': 'gates/gate-round-494.json published (rounds 492-494)', 'date': '2026-11-13', 'tree_clean': True}
b['retro_candidates'].append({'id': 'RETRO495-SABA-RECURRENCE-ENTRANCE', 'added': BY, 'status': 'counted (D-29z1771): 1 recurrence in window 480-494',
  'note': 'SABA-B-17 (entrance 3-4 s, 2026-11-13) is the same kind as SABA-B-13 (entrance too fast, 2026-11-11). A lesson existed (L18 first painted frame, D-29z1625) but it covered measurement, not "an example number is the target"; L18 felt-quantity clause added at round 489 planning (D-29z1746). RETRO 510 counts whether a third entrance/duration complaint comes back'})
b['decisions_log_b'].append({'id': 'D-29z1771', 'date': '2026-11-13', 'by': BY, 'decision': 'Advisor closing-check corrections: A-R493-REVIEW-F2 status leads with its open half; B-R471-SKETCH-UNREVIEWED closed (l58 15/15); advisor_used_by_B and baseline head_round_495 = 3bcf8cb; SABA-B-17 counted as one recurrence of SABA-B-13 (RETRO495-SABA-RECURRENCE-ENTRANCE); task 495 K24 uses tools/find-ids.py (the optimizer archives done/closed open_findings), row 3 selectors tagged [K32], ruling line: DPG-BUTTON-CLEANUP may touch account.tsx only for the two L8 rows (Medium-class exception in section 5 item 4 wins over the hold); L26 doc-correction clause requires a sketch task to exempt granted docs from the sha pin (note in retro section 10).'})
b['version'] += 1
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
open(M, 'w').write('applied\n'); print('applied v', b['version'])
