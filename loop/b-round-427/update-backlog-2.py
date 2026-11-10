# B round 427 -> 428 backlog addendum (v406 -> v407), advisor close fixes. Run once from the loop root: python3 -I b-round-427/update-backlog-2.py
import json, os, sys
DONE = 'b-round-427/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 406:
    sys.exit(f"expected version 406, found {b.get('version')}")
BY = '2026-11-10 B round 427 -> 428 planning (close)'
b['version'] = 407
b['decisions_log_b'].append({'id': 'D-29z1504', 'date': '2026-11-10', 'by': BY,
    'decision': 'Close fixes to round 428 (advisor): (1) the settled-state auth recipe was run by B at HEAD :5173 (b-round-427/probe/g428-auth.cjs, output probe/auth-head/g428-auth.json: pass true, samples at 0.5/3/10 s and the settled read all Sign in required, workspace false, audio[src] 0, both viewports; API 401/500/400); C row 6 uses that script. C-R427 attempt-2 raw read was not saved by C; B read c-round-427/legacy-1440.png (Sign in required) and treats the transient read as reported by C. (2) GMENU: Enter on an item of a pointer-opened grid menu with no prior focus returns focus to BODY at HEAD and on the sketch: same root cause as C-R301-01 (no return target when pointer-opened with no prior focus), recorded as confirmedBy on C-R301-01; compare.py records GMENU focus and no longer asserts BODY. (3) XEXPORT: the download count depends on when the WAV lands, so compare.py leaves downloads out of the A/B and HEAD comparisons and asserts the whole-interval totals (B renders 1, B downloads 1); re-run on the saved JSONs ALL OK (13 cells), and the same compare with HEAD as the sketch fails 3 of 13 (probe/compare-head-as-sketch.txt). (4) AuthModal and Toast exclusion reworded as not probed, ruled in stage 5 with the closing scan. (5) Row 5 is record only (no pass sentence).'})
seen = set()
for f in b['deferred_low_polish']:
    if f.get('id') == 'C-R301-01':
        f['confirmedBy'] = (f.get('confirmedBy', '') + ' | ' if f.get('confirmedBy') else '') + 'b-round-427/probe GMENU (Enter on an item of a pointer-opened grid menu with no prior focus lands on BODY; D-29z1504)'; seen.add(f['id'])
    if f.get('id') == 'A-R427-REVIEW-L3-HM5B-LOOSE':
        f['notes'] = 'gates/round-427/review.md suggestion 1: HM5b title is very long; shorten it in the same test-only pass (D-29z1504)'; seen.add(f['id'])
if seen != {'C-R301-01', 'A-R427-REVIEW-L3-HM5B-LOOSE'}:
    sys.exit('ids not found: ' + str(seen))
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v407\n')
print('ok v407')
