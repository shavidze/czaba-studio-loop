# B round 389 -> 390: backlog v356 -> v357. Run once from the loop root.
import json, pathlib, sys
P = pathlib.Path('backlog.json'); DONE = pathlib.Path('b-round-389/update-backlog.done')
if DONE.exists(): sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 356, b['version']
BY = '2026-11-07 B round 389 -> 390 planning'
EV = 'c-round-389.json (PASS, 20 rows, 0 failed, 0 bugs, browserVerified/realVerified true; RR-PERF 4/4 218 assert rows, PERF-LIB 3/54, RG-SMOKE 2); gate 389 skipped (no source change), baseline stays 11ca746'
n = 0
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 389:
        r['status'] = 'c_pass (D-29z1316): REGRESSION part 1 PASS, 0 bugs; gate 389 skipped - nothing to publish | ' + str(r['status'])
        r['result'] = EV; n += 1
assert n == 1, n
b['rounds'].append({'round': 390, 'task': 'current-task.md', 'decision': 'D-29z1316..D-29z1321',
    'type': 'REGRESSION-2026-11-08 part 2 (SA-17): round-340 template rows (rounds 199-342) + carried R390-VIDEO-SOUND, R390-WAV-3CLIP-LEN; RR-PERF/PERF-LIB/RG-SMOKE carried from round 389 (same HEAD); A no change',
    'status': 'dispatched', 'note': 'baseline 11ca746 clean; claims b-round-389/claims-390.sh; frozen tree reused b-round-388/r389-tree-sha256.txt (1284)', 'added': BY})
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-2026-11-08':
        r['status'] = 'part 1 PASS (round 389, D-29z1316); part 2 dispatched as round 390 (D-29z1317); regression-last updated only when part 2 closes | ' + r['status']
        r['scope_additions'].append('SA-18 carried from part 1 (D-29z1318): R390-VIDEO-SOUND (R389-VIDEO-DRAG sub-check "video sound after the move" not re-asserted) and R390-WAV-3CLIP-LEN (3-clip export length/format not parsed in round 389)')
        r['round'] = 390
m = 0
for f in b['open_findings']:
    if f.get('id') == 'ESCAPE-CANCEL-GESTURE':
        f['status'] = str(f['status']) + ' | D-29z1319: round 389 R389-STATUS observed again that Esc during a clip drag does not cancel (release commits "Move clip: start 00:02.500"; c-round-389/misc.json); evidence only, still awaiting a Live source and Saba; recorded again as R390-ESC-DRAG'
        m += 1
assert m == 1, m
dec = [
 ('D-29z1316', 'Round 389 accepted on C evidence: ' + EV + '. B checked c-round-389.json, c-round-389.md and export-det.json directly. No findings to close or defer; C reported 0 bugs.'),
 ('D-29z1317', 'Round 390 = REGRESSION-2026-11-08 part 2 on 11ca746 per D-29z1315 (round-340 template, executed as in rounds 341/342, with their B rulings D-29z1062/1063/1068 bound into the task). RR-PERF, PERF-LIB and RG-SMOKE are carried from round 389 on the same HEAD (not re-run). Mock API starts first (round 340 BLOCKED cause).'),
 ('D-29z1318', 'Two round-389 gaps are carried as named rows (L6, V2): R390-VIDEO-SOUND (video sound after a move was not re-asserted; Medium if silent) and R390-WAV-3CLIP-LEN (3-clip export length/format). R389-JOURNEY without export accepted as a labelled deviation for part 1; R340-JOURNEY in part 2 must include the export step in one flow.'),
 ('D-29z1319', 'C round-389 question 1 (Esc does not cancel a clip drag): answered as existing signal ESCAPE-CANCEL-GESTURE / C-R85-L1 (no CZABA contract; needs a Live source and a Saba decision). Round-389 observation appended as evidence; not a finding, not scheduled. Record-only row R390-ESC-DRAG.'),
 ('D-29z1320', 'Round 390 reuses the round-389 frozen tree b-round-388/r389-tree-sha256.txt (same HEAD 11ca746) instead of regenerating it. Claims: b-round-389/claims-390.sh (K1..K10).'),
 ('D-29z1321', 'Outcome fixed in advance: all rows with allowed results and no Medium+ -> regression-last {C completion date, 390}, REGRESSION-2026-11-08 closes, round 391 = PERF-13b-ii (ARCH-CHECKPOINT-DECODE-REGION wanted first; if unanswered B rules with a reason); Critical/High/cloud-reproducible Medium -> round 391 fix-up then PERF-13b-ii; PARTIAL -> round 391 continues part 2; Lows -> deferred_low_polish.'),
]
for i, t in dec:
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        q['status'] = 'in_progress (D-29z1317): round 389 regression part 1 PASS; round 390 = part 2, then PERF-13b-ii | ' + q['status']
b['advisor_used_by_B'] = 'yes (round 389 -> 390 planning: advisor available; consulted after orientation and before declaring done; effect: carried rows R390-VIDEO-SOUND / R390-WAV-3CLIP-LEN, mock first, rounds 341/342 rulings bound, RR-PERF/PERF-LIB/RG-SMOKE carried from 389, r389 tree reused) | ' + b['advisor_used_by_B']
b['current_task'] = 'Round 390: REGRESSION-2026-11-08 part 2 (rounds up to 342, round-340 template + 2 carried rows), C-only; A no change (current-task.md)'
b['version'] = 357; b['updated'] = BY
P.write_text(json.dumps(b, indent=2)); DONE.write_text('ok\n'); print('ok')
