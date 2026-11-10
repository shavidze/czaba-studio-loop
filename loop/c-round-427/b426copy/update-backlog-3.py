# B round 426 -> 427 backlog tidy (v404 -> v405): supersede note on D-29z1493, planned ARCH-CHECKPOINT-SYS-2, 2b-ii scan-scope carry.
import json, os, sys
DONE = 'b-round-426/update-backlog-3.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 404:
    sys.exit(f"expected version 404, found {b.get('version')}")
BY = '2026-11-10 B round 426 -> 427 planning'
b['version'] = 405
n = 0
for d in b['decisions_log_b']:
    if d.get('id') == 'D-29z1493':
        d['superseded_in_part_by'] = 'D-29z1496: the clause filing B-R426-GESTURE-REFUSAL-REPEAT-STATUS (refusal rewritten per repeat) is withdrawn; steady-state repeats do not bump statusSequence'; n += 1
for f in b['deferred_low_polish']:
    if f.get('id') == 'B-R426-GESTURE-REFUSAL-REPEAT-STATUS':
        f['note_d29z1497'] = 'title/evidence/repro describe the withdrawn premise; superseded by D-29z1496 (not a defect)'; n += 1
for s in b['systemic_tasks']:
    if s.get('id') == 'SYS-2':
        s['carry_2b_ii_d29z1497'] = 'stage 2b-ii scope: fold the 7 remaining inline copies (LibraryMenu 1, ExportDialog 1, MarkerRow 5); guard ExportDialog cancel + second button, GridMenu 4 items, MarkerMenu item, MarkerRow flag (held Escape probed at HEAD first), ShortcutSheet close + footer Shortcuts button, LibraryMenu anchor, NarrowScreen Send link; the button scan and the closing grep (0 inline key===Enter&&repeat copies outside studio-repeat-safe.ts) cover every folder /studio-lab renders (app/components/**, app/routes studio-lab route, app/lib/**) with roots app/** and perf/**, not only app/components/arrangement; grant l.4 of docs 274 and 275 to Completed (L28)'; n += 1
if n != 3:
    sys.exit('ids not found')
b['decisions_log_b'].append({'id': 'D-29z1497', 'date': '2026-11-10', 'by': BY,
    'decision': 'Planning tidy after the advisor close check: D-29z1493 marked superseded in part by D-29z1496; ARCH-CHECKPOINT-SYS-2 added as a planned (not yet requested) architecture checkpoint, filed with root after SYS-2 2b-ii C PASS (question: StudioButton wrapper vs a scanner/lint row in verify vs keep; tech-lead favours the check, TL-R426 Architecture); SYS-2 2b-ii carry recorded (scan scope = every folder /studio-lab renders). Task 427 gained claims K29-K32 (detail Space-only, options repeat, window typing skip, dock focus to Expand, L50 grep 0 added/removed lines, gate-426 timeout times) and compare.py asserts the focus map and ring for all 18 cells (ALL OK).'})
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-SYS-2', 'decision': 'D-29z1497', 'requested_of': 'root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)',
    'question': 'after SYS-2 closes: per-button preventRepeatedEnterKeyDown (about 40 sites) vs a StudioButton wrapper (conflicts with onKeyDown?: never and buttons with own key handlers) vs a scanner/lint row in verify that fails on an unguarded <button onClick> or an inline Enter-repeat copy',
    'status': 'planned: file with root after SYS-2 2b-ii C PASS; non-blocking', 'signals': ['SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT']})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v405\n')
print('ok v405')
