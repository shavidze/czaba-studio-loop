# B round 342 -> 343 planning: backlog v301 -> v302. Once-only (marker b-round-342/update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-342/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-342/backlog-before-343.json').exists():
    sys.exit('backup missing')
b = json.load(open('backlog.json'))
assert b['version'] == 301, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 342 -> 343 planning'
def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})
dec('D-29z1075', 'Round 342 (REGRESSION-ROUND-2026-11-05 part 3, closed list) closed PASS from C evidence: c-round-342.json taskStatus PASS, browserVerified/realVerified true; passed SOURCE-SCOPE start/end, R342-WK-GUARD, R342-WK-HEAD-CONTROL (control differs from guard), R342-RS-1280, R342-RS-MAP, R342-RG22-NARROW, R342-PRICE, G342-AUTH (fake Bearer 403 with mock); recorded R342-RP301, R342-RP-BUILT, R342-POSCTL; 0 failed/inconclusive/blocked/notRun; 0 new bugs, 0 Medium+. Gate 342 skipped (no change); baseline stays 99a5912. Per the round-342 outcome table (D-29z1074) REGRESSION-ROUND-2026-11-05 (rounds 340-342) is done and regression-last.json = {2026-11-05, round 342}; next regression due on or after 2026-11-08. INFO-C340-EARLY-END did not repeat (stopSignal "none: all 12 rows have a result"). No item changes status from a regression round.')
dec('D-29z1076', 'Regression oracles recorded for the next regression: R342-POSCTL = c-round-342 run (valid=false at both viewports, splicedInCapture=false, starts=1: a fade-out edit during playback causes no new source start); FONT-PIXEL baseline = c-round-341/out/fonts/ (D-29z1068); RS-MAP sc-tree-1280 tabs oracle 27 (round 258; c301 26 was the outlier); WK-GUARD/WK-HEAD-CONTROL re-confirmed against c-round-311. Re-seen known Lows unchanged and already deferred: C-R186-02 (Gift Cards paragraph contrast now 3.41:1 measured independently, c-round-342/out/giftbg.json; was 2.59 in round 186), C-R301-01, C-R331-01. RP-SAME-TEXT-RACE / GATE328-S1 exact triggers not reachable from the page (natural-trigger probe: no flicker/duplicate); A-R328-REVIEW-SAME-TEXT-RACE stays open as before, not proven absent. C newLessonEvidence (cold dev server invalid-hook hydration) is already L38: no lesson change.')
dec('D-29z1077', 'Round 343 = PERF-DRAG-PREVIEW stage c4-ii, the b-round-339 package (current-task-c4-ii-draft.md) dispatched with its carry-forward applied: HEAD unchanged at 99a5912 (gates 340-342 skipped), so no re-measurement (git apply --check 3/3 OK; claims-340.sh equal to planning output before regression-last moved; round-341 RR-PERF rowcmp 0 DIFF vs c-round-339). "round 340" -> 343 in doc/budget text; budgets patch regenerated as b-round-342/sketch/budgets.patch.txt (b-round-342/sketch/apply-budgets-343.py; applies on HEAD; diff vs old = note text + git header; K6 219 26 12 55 10); claims script b-round-342/claims-343.sh (K12 extended), expected b-round-342/claims-343-planning-output.txt and claims-343-sketch-output.txt (K8 2026-11-05). D-29z1049..D-29z1058 kept as history.')
dec('D-29z1078', 'Auth oracle: the c4-ii draft G340-AUTH expected fake Bearer -> 500; C measured 403 in rounds 341 and 342 with the mock API up (g340-auth.cjs accepts 403 or 500). G343-AUTH expects 403 while /__mock/health is 200; 500 only when the mock is down, with the health status recorded. Purchase protection unchanged (no token in any body; Sign in required; 0 audio[src]).')
for r in b['rounds']:
    if r.get('round') == 342:
        r['status'] = 'closed PASS (D-29z1075): 12/12 rows with an allowed result (9 PASS, 3 recorded), 0 bugs, browserVerified true; gate skipped (no change); regression done | ' + r['status']
b['rounds'].append({'round': 343, 'task': 'current-task.md', 'decision': 'D-29z1075..D-29z1078', 'type': 'PERF-DRAG-PREVIEW stage c4-ii (group move preview through the store; collapsed-group overview follows; 10 group perf rows -> assert)', 'status': 'dispatched', 'note': 'baseline 99a5912 clean; package b-round-339/sketch/{source,tests}.patch.txt + b-round-342/sketch/budgets.patch.txt; claims b-round-342/claims-343.sh', 'added': ADDED})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'done (D-29z1075): rounds 340-342 on 99a5912; 0 Medium+; Lows C-R341-01 (=C-R318-06) and C-R341-02 deferred; round 342 browserVerified true; regression-last 2026-11-05 round 342 | ' + x['status']
        x['rounds'] = [340, 341, 342]
        x['oracles_for_next_d29z1076'] = {'POSCTL': 'c-round-342 (valid=false, starts=1)', 'FONT-PIXEL': 'c-round-341/out/fonts/', 'RS-MAP sc-tree-1280 tabs': 27}
perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1077): regression done (rounds 340-342); round 343 = PERF-DRAG-PREVIEW c4-ii | ' + perf['status']
perf['execution_order_d29z1077'] = ['343 PERF-DRAG-PREVIEW c4-ii', 'c5 (video)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE request after c5', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1077): c4-ii dispatched as round 343 | ' + st['status']
for f in b['open_findings']:
    if f.get('id') == 'INFO-C340-EARLY-END':
        f['status'] = 'not repeated in round 342 (D-29z1075): C ran every row of the closed list | ' + f['status']
b['version'] = 302
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 343: PERF-DRAG-PREVIEW c4-ii)'
b['advisor_used_by_B'] = 'yes (round 342 -> 343 planning: advisor consulted after orientation, before writing; and before declaring done)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
