# Part 2 (D-29z1462): the systemic_tasks copy of SYS-R369 gets the same done status. Run once from the loop root.
import json, os, sys
if os.path.exists('b-round-419/update-backlog-part2.done'): sys.exit('already applied')
b = json.load(open('backlog.json', encoding='utf-8'))
n = 0
for f in b['systemic_tasks']:
    if f.get('id') == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR':
        f['status'] = 'done (D-29z1462): C round 419 PASS (c-round-419.json: 8 rows passed, browserVerified/realVerified true, 0 bugs), gate 419 published 6609dfa | ' + f['status']; n += 1
assert n == 1
json.dump(b, open('backlog.json', 'w', encoding='utf-8'), indent=2)
open('b-round-419/update-backlog-part2.done', 'w').write('ok\n'); print('ok')
