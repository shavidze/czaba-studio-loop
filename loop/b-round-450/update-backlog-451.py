# B round 450 -> 451 backlog edit (D-29z1602..D-29z1604). Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
mark = os.path.join(L, 'b-round-450', 'update-backlog-451.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 439, b['version']
b['version'] = 440
b['updated'] = '2026-11-11 B round 450 -> 451 planning'
b['current_task'] = 'Round 451: SYS-R450-STORE-STYLE-SCAN test-only (current-task.md)'
b['advisor_used_by_B'] = '2026-11-11 round 450 -> 451 planning: advisor available and consulted after orientation and before writing'
by = '2026-11-11 B round 450 -> 451 planning'
b['decisions_log_b'] += [
 {'id': 'D-29z1602', 'date': '2026-11-11', 'by': by, 'decision': 'Round 450 (RETRO 450) accepted: C round 450 PASS (0 bugs, browserVerified/realVerified true; fake-bearer premium path BLOCKED, backend unavailable in cloud); B l57-check L57 OK (b-round-450/l57-check-c450.txt); gate 450 skipped (no source change), baseline stays a8599a2 (gate 449). RETRO-450 done. INFO-C450-CAPTURE-CONCURRENCY and INFO-C450-RT-CAUSE-VIA-SCRIPTS logged.'},
 {'id': 'D-29z1603', 'date': '2026-11-11', 'by': by, 'decision': 'Round 451 = SYS-R450-STORE-STYLE-SCAN (regression-last 2026-11-10, REGRESSION due on/after 2026-11-13; systemic task order before STORE-2b-3b; owns the only loop-runnable open Medium A-R449-REVIEW-GT1-TSX). Sketch b-round-450/sketch-451.patch.txt, golden + 37 mutants both ways, tech-lead review.'},
 {'id': 'D-29z1604', 'date': '2026-11-11', 'by': by, 'decision': 'Sketch rulings: (a) store-header-footer.test.tsx .text-glow absence asserts kept as deliberate redundancy with GT3 (closes that sub-point of A-R449-REVIEW-L-TEST-HYGIENE); (b) teal scan stays TS/TSX-only, CSS teal is STORE-2b-3c; (c) TS3 zero-offset glow check stays on the 9 granted files, the 5 app hits (CinemaCurtainLoader 2, PurchaseHeader 1, GlobalPlayhead 1, routes/store.tsx 1) are STORE-2b-3b inventory; (d) A-R447-REVIEW-L3 already met by TS5 (round 448), kept via PERF_ROOT, mutant N4; (e) drop-shadow-[0_0_ class already caught at HEAD (substring), the real A-R447-REVIEW-L2 gap is inline boxShadow (N3). Legacy studio.css and pages/studio.css are scanned read-only, never edited.'},
]
for f in b['open_findings'] + b['deferred_low_polish']:
    pass
b['open_findings'] += [
 {'id': 'INFO-C450-CAPTURE-CONCURRENCY', 'severity': 'info', 'status': 'logged (D-29z1602)', 'title': 'capture.mjs run concurrently with another browser script failed once (Execution context was destroyed); sequential rerun clean. Harness note: run browser scripts one at a time', 'evidence': 'c-round-450.md Notes', 'origin': 'environment'},
 {'id': 'INFO-C450-RT-CAUSE-VIA-SCRIPTS', 'severity': 'info', 'status': 'logged (D-29z1602)', 'title': 'C round 450 RT-CAUSE was checked through script outputs and the consult file, not by reopening every file in the retro section 3/5-8 lists', 'evidence': 'c-round-450.md row 7', 'origin': 'C'},
]
ids = {'A-R449-REVIEW-GT1-TSX', 'TL-R449-L3-SCAN-ROOTS', 'A-R447-REVIEW-L2', 'A-R447-REVIEW-L3', 'TL-R449-L4-PARSER-QUOTES', 'A-R449-REVIEW-L-FILL-REGEX', 'A-R449-REVIEW-L-TEST-HYGIENE'}
hit = set()
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if f.get('id') in ids:
            f['status'] = 'in_progress round 451 (D-29z1603): SYS-R450-STORE-STYLE-SCAN; closes on C PASS + gate | ' + f.get('status', '')
            hit.add(f['id'])
assert hit == ids, ids - hit
for t in b['systemic_tasks']:
    if t.get('id') == 'SYS-R450-STORE-STYLE-SCAN':
        t['status'] = 'dispatched round 451 (D-29z1603) | ' + t['status']
        t['task'] = 'current-task.md (round 451); sketch b-round-450/sketch-451.patch.txt'
for r in b['rounds']:
    if r.get('round') == 450:
        r['status'] = 'done: C PASS, gate skipped (no source change) (D-29z1602)'
b['rounds'].append({'round': 451, 'task': 'current-task.md', 'decision': 'D-29z1603', 'type': 'SYS-R450-STORE-STYLE-SCAN (test-only)', 'status': 'dispatched', 'note': 'baseline a8599a2; manifest b-round-450/r451-tree-sha256.txt (1366); grants b-round-450/grants-451.txt; claims b-round-450/claims-451.sh'})
for q in b['post_current_stage_queue']:
    if isinstance(q, dict) and q.get('id') == 'RETRO-450':
        q['status'] = 'done (D-29z1602)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied v440')
