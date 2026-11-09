# Archive-aware id lookup for claims scripts (D-29z1468; closes the class of C-R416-CLAIMS-K22-ARCHIVE and
# C-R420-CLAIMS-K22-ARCHIVE-AGAIN). Run from anywhere: python3 -I tools/find-ids.py <loop-root> <id> [<id> ...]
# Looks in backlog.json (open_findings, deferred_low_polish, systemic_tasks, post_current_stage_queue, items) and then
# in archive/findings-archived.json, because cloud/optimize-backlog.py moves closed findings there before each round.
# Prints one line per id: "<id> <where> <severity> <status[:60]>" or "<id> NOT-FOUND". Exit 0 always (claims compare text).
import json, os, sys
loop, ids = sys.argv[1], sys.argv[2:]
b = json.load(open(os.path.join(loop, 'backlog.json'), encoding='utf-8'))
pool = {}
for key in ('open_findings', 'deferred_low_polish', 'systemic_tasks', 'post_current_stage_queue', 'items'):
    v = b.get(key, [])
    for f in (v if isinstance(v, list) else v.get('items', []) if isinstance(v, dict) else []):
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], ('backlog:' + key, f))
arch = os.path.join(loop, 'archive', 'findings-archived.json')
if os.path.exists(arch):
    a = json.load(open(arch, encoding='utf-8'))
    for f in (a if isinstance(a, list) else a.get('findings', a.get('items', []))):
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], ('archive', f))
for i in ids:
    hit = pool.get(i)
    if not hit:
        print(i, 'NOT-FOUND')
        continue
    where, f = hit
    print(i, where, f.get('severity', '-'), str(f.get('status', '-'))[:60])
