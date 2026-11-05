# B round 340 -> 341 planning: backlog v299 -> v300. Once-only (marker b-round-340/update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-340/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-340/backlog-before-341.json').exists():
    sys.exit('backup missing')
b = json.load(open('backlog.json'))
assert b['version'] == 299, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 340 -> 341 planning'
def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})
dec('D-29z1059', 'Round 340 (REGRESSION-ROUND-2026-11-05) closed INCOMPLETE from C evidence: c-round-340.json taskStatus BLOCKED, browserVerified/realVerified false, 6 PASS (G340-AUTH, R340-GROUP-MOVE, R340-CROSS-LANE, R340-HINT, R340-RESCHEDULE-CONT1, journey Studio half export WAV), 1 inconclusive (R340-FONTS dev half), 0 failed, 0 bugs; most rows not run. Gate 340 skipped (C BLOCKED); nothing published; baseline stays 99a5912. Per round-340 task section 7 (D-29z1058): missing rows continue first in round 341; regression-last.json NOT updated; no item changes status.')
dec('D-29z1060', 'INFO-C340-EARLY-END (C-process observation, not an app bug): c-round-340-result.json terminal_reason completed / stop_reason end_turn after ~13 min (00:16-00:29Z), $0.79, no progress.json; the job limit did not stop C, although c-round-340.md cites time/budget. Round 301 ran 133 rows in ~3 h in one C phase. lessons.md L59 added (C does not end the phase early; progress.json per row; BLOCKED-for-time names the real stop signal); lessons.md at 60 lines, nothing dropped. Advisor: do not split the remainder into two rounds.')
dec('D-29z1061', 'Round-340 PASS rows carried into round 341 (not re-run): G340-AUTH, R340-GROUP-MOVE, R340-CROSS-LANE (C own playing run c-round-340/out/exp340.json accepted as the while-playing half; cross-lane-probe.mjs half equals c-round-338 head after dropping counts), R340-HINT, R340-RESCHEDULE CONT-1, journey Studio half (export WAV 24/48 stereo, deterministic sha at both viewports).')
dec('D-29z1062', 'R340-HINT ruling: round-303 contract = once per page load (tasks/round-303.md l.32/l.57, per provider mount; H-RELOAD l.129 "the hint is back", C round 303 PASS). Round-340 task wording "once per profile ... not after reload" was a B wording error; C observation matches the contract -> PASS, no finding. SABA-Q-NAME-HINT-LIFETIME stays awaiting_user (D-29z791). Signal B-R340-SPEC-WORDING (RETRO input: B paraphrased a contract instead of citing the row).')
dec('D-29z1063', 'R340-FONTS method for round 341: production build from a scratch tree (/tmp/r341-build via git archive HEAD, node_modules symlink, remix vite:build, remix-serve :5192) as B did in round 339 (D-29z1057), so the /s/ path, 2 CORS preloads and FONT-PIXEL run against a build; never a second dev server; nothing written under store/.')
dec('D-29z1064', 'Outcome for round 341 fixed in advance: every row has a result and no Medium+ -> regression-last.json {C date, round 341, note rounds 340+341} and round 342 = PERF-DRAG-PREVIEW c4-ii (b-round-339/current-task-c4-ii-draft.md, carry-forward to round 342); Medium+ -> bounded fix-up round 342 then c4-ii; job-limit stop -> resume from progress.json, else round 342 continues the remainder.')
dec('D-29z1065', 'Mock API is step 2 of the C order in round 341 (health 200 before any store/NAME/JOURNEY row). A store row not run because the mock was not started is not "backend unavailable in cloud" and is never listed under blocked (C round 340 classed it correctly).')
dec('D-29z1066', 'This task: round 341 = REGRESSION-ROUND-2026-11-05 continued on 99a5912 (A no change). C runs the round-340 notRun rows: section 4d remainder with an explicit script -> oracle table (WAVEFORM, DETAIL-TEXT, OVERVIEW-METER, SHOWN-READERS, PROJECT-END, FADE-STATUS+DRAG-A via b-round-328/rows.mjs vs c-round-334/rows/rows-a.json, SELECTION, RANGE, FONTS build half, PEAKS, WORKER-R2, RESCHEDULE CONT-30/ENDED/NO-CHANGE, PERF3D, NAME, JOURNEY store half), round 301 sections 3/4/4.S/4b/4c by replaying c-round-301/tools and t258/tools, section 5 parked rows, RR-PERF alone (0 DIFF vs c-round-339), RG-SMOKE, G341-AUTH (403 with mock). Frozen tree b-round-339/r340-tree-sha256.txt and claims b-round-339/claims-r340.sh still valid. Row definitions by reference: tasks/round-340.md.')
for r in b['rounds']:
    if r.get('round') == 340:
        r['status'] = 'incomplete (D-29z1059): C BLOCKED, 6 PASS carried, browserVerified false, gate skipped, nothing published; continues in round 341 | ' + r['status']
b['rounds'].append({'round': 341, 'task': 'current-task.md', 'decision': 'D-29z1059..D-29z1066', 'type': 'REGRESSION-ROUND-2026-11-05 continued: C runs every round-340 notRun row (script -> oracle table), RR-PERF, smoke, auth', 'status': 'dispatched', 'note': 'baseline 99a5912 clean; frozen tree b-round-339/r340-tree-sha256.txt; claims b-round-339/claims-r340.sh; row definitions tasks/round-340.md; next = c4-ii (round 342) or a fix-up', 'added': ADDED})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'in_progress (D-29z1059): round 340 ran 6 rows PASS (carried), browserVerified false; continues in round 341 (D-29z1066); regression-last not updated | ' + x['status']
        x['rounds'] = [340, 341]
perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1064): round 340 regression incomplete; round 341 = regression continued; round 342 = c4-ii (or a fix-up first) | ' + perf['status']
perf['execution_order_d29z1064'] = ['340 REGRESSION-ROUND-2026-11-05 (incomplete)', '341 REGRESSION-ROUND-2026-11-05 continued', '342 PERF-DRAG-PREVIEW c4-ii (or a fix-up first)', 'c5 (video)', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1064): c4-ii dispatch moves to round 342 after the regression continuation (round 341) | ' + st['status']
b['open_findings'].append({'id': 'INFO-C340-EARLY-END', 'severity': 'info', 'origin': 'B round 340 -> 341 planning (C-process)', 'title': 'C round 340 ended its phase after ~13 min with most rows not run, citing time/budget; result json shows end_turn, not a job-limit stop', 'evidence': 'c-round-340-result.json; c-round-340.md; no c-round-340/progress.json', 'status': 'open (D-29z1060): lessons L59; checked by round 341 stopSignal and progress.json; RETRO input', 'added': ADDED})
b['architecture_signals'].append({'id': 'B-R340-SPEC-WORDING', 'origin': 'B round 340 -> 341 planning', 'note': 'round-340 task paraphrased the round-303 hint lifetime wrongly ("once per profile, not after reload"); quote the accepted row instead (L6/L29 class)', 'status': 'signal (D-29z1062), RETRO input; not scheduled', 'added': ADDED})
b['version'] = 300
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 341: REGRESSION-ROUND-2026-11-05 continued)'
b['advisor_used_by_B'] = 'yes (round 340 -> 341 planning: advisor consulted after orientation, before writing; and before declaring done)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
