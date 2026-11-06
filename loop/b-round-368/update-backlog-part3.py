# B round 368 -> 369 planning, part 3: RT-IDS inventory follow-up (advisor check). Run once from the loop root.
import json, os, sys
DONE = 'b-round-368/update-backlog-part3.done'
if os.path.exists(DONE):
    sys.exit('already applied')
b = json.load(open('backlog.json'))
assert b['version'] == 333, b['version']
b['decisions_log_b'].append({'id': 'D-29z1217', 'date': '2026-11-06', 'text': 'RETRO 369 inventory (b-round-368/retro369-mentions.py on backlog-before-369.json -> data/retro369-mentions.txt, retro369-mention-ids.txt: 36 hits, 33 ids). Every hit has a disposition in retro-369 section 8 or D-29z1210..D-29z1216; the one RETRO 368 input without an object, B-R363-PRECHECK-PERFLIB (named in D-29z1185, D-29z1189; no backlog object), is adopted into the L30 RETRO 369 clause (D-29z1213) and closed here. The D-29z1162..D-29z1183 order strings ("RETRO at round 368") are superseded by retro_policy.next_due (D-29z1216). L58 byte history: 2908 after RETRO 353, 2931 after D-29z1136 (C-R353-01 fix restored "fixed in the sketch or ruled"), 3430 after RETRO 369.'})
b['retro_candidates'].append({'id': 'B-R363-PRECHECK-PERFLIB', 'decision': 'D-29z1185', 'round': 363, 'note': 'B dispatched new budget rows without running every perf/lib test that reads the budgets file on the sketch (cause of C-R363-01); RETRO 368 input (D-29z1185, D-29z1189)', 'status': 'adopted (D-29z1217): L30 RETRO 369 clause "Every test root is pre-run"', 'added': '2026-11-06 B round 368 -> 369 planning (object created at the inventory; the id existed only in decision text)'})
b['version'] = 334
json.dump(b, open('backlog.json', 'w'), indent=2)
open(DONE, 'w').write('applied v334\n')
print('ok v334')
