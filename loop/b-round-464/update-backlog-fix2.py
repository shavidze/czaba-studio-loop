# B round 464 -> 465 planning, part 4: lesson byte numbers after edit-lessons-2 (D-29z1641). Usage: python3 -I b-round-464/update-backlog-fix2.py <loop root>. Idempotent (.done).
import json, os, sys
L = sys.argv[1]; P = f'{L}/backlog.json'; DONE = f'{L}/b-round-464/update-backlog-fix2.done'
if os.path.exists(DONE): print('already applied'); sys.exit(0)
t = open(P, encoding='utf-8').read()
n = t.count('58399 -> 57341'); t = t.replace('58399 -> 57341', '58399 -> 57320')
m = t.count('L58 4988 -> 4710'); t = t.replace('L58 4988 -> 4710', 'L58 4988 -> 4689')
k = t.count('net -1058 B'); t = t.replace('net -1058 B', 'net -1079 B')
b = json.loads(t); b['version'] += 1
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n'); print('ok', n, m, k, 'version', b['version'])
