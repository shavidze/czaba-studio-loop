# B round 426 -> 427 backlog correction (v403 -> v404): withdraw B-R426-GESTURE-REFUSAL-REPEAT-STATUS after the tech-lead review and HM5b's full-snapshot assert.
import json, os, sys
DONE = 'b-round-426/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 403:
    sys.exit(f"expected version 403, found {b.get('version')}")
BY = '2026-11-10 B round 426 -> 427 planning'
b['version'] = 404
b['decisions_log_b'].append({'id': 'D-29z1496', 'date': '2026-11-10', 'by': BY,
    'decision': 'B-R426-GESTURE-REFUSAL-REPEAT-STATUS withdrawn (closed, not a defect): tech-lead TL-R426 review item 3 shows reduceArrangementStatus keeps the previous entry for identical text while a gesture is active, and HM5b on the final sketch (aef454cd) asserts the whole snapshot, statusSequence included, is equal after 3 repeats (green). Residual hypothesis kept as INFO-TL-R426-MOVING-DRAG-REPEAT (a repeat during a drag that also writes preview text could re-announce; unmeasured). Sketch delta 82a785ce -> aef454cd is test-only (TL-R426-03/04/05 addressed); mutants, covering 68/1226 and full 266/3984 re-run on aef454cd; browser probe and smoke ran on the v1 source, identical to the final source.'})
n = 0
for f in b['deferred_low_polish']:
    if f.get('id') == 'B-R426-GESTURE-REFUSAL-REPEAT-STATUS':
        f['status'] = 'closed_not_a_defect (D-29z1496): steady-state repeats do not bump statusSequence (HM5b full-snapshot assert; TL-R426 item 3) | ' + f['status']; n += 1
    if f.get('id') == 'TL-R425-09-HM5-GESTURE-ROW':
        f['status'] = f['status'].replace('HM5b pin row in round 427', 'HM5b characterization row in round 427 (full snapshot incl. statusSequence)'); n += 1
if n != 2:
    sys.exit('ids not found')
b['open_findings'].append({'id': 'INFO-TL-R426-MOVING-DRAG-REPEAT', 'severity': 'info', 'origin': 'B pre-check review (tech-lead)', 'status': 'open (D-29z1496): hypothesis only, unmeasured; record',
    'title': 'during a drag that also writes preview status text, a held key repeat may adopt the pending preview and bump the status sequence (re-announce) while the pointer moves', 'evidence': 'b-round-426/sketch-review.md TL-R426 item 3', 'added': BY})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v404\n')
print('ok v404')
