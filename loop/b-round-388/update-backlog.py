# B round 388 -> 389: backlog v355 -> v356. Run once from the loop root.
import json, pathlib, sys
P = pathlib.Path('backlog.json'); DONE = pathlib.Path('b-round-388/update-backlog.done')
if DONE.exists(): sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 355, b['version']
BY = '2026-11-07 B round 388 -> 389 planning'
EV = 'c-round-388.json (PASS, browserVerified true, realVerified true; METER-FLOOR/CONTROL/PLAYING, M2-FLOW, M1-NEIGHBOUR both viewports, UNIT 66/1026, MUTANTS 16/16); gate 388 published 11ca746'
close = ['C-R387-01-METER-FREEZE-AFTER-PUMP-FAILURE','GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK','A-R386-REVIEW-M1-PLAY-RETRY-THROW-STUCK','B-R386-UNGUARDED-GRAPH-CALLERS','TL-R387-M1-SYNC-STALE-STOP-POSITION','A-R386-REVIEW-L1-STOP-IN-CATCH']
n = 0
for f in b['open_findings']:
    if f.get('id') in close:
        f['status'] = f'closed (D-29z1310): {EV} | ' + str(f.get('status')); n += 1
assert n == 6, n
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 388:
        r['status'] = 'c_pass_published (D-29z1310): C round 388 PASS, 0 bugs, browserVerified/realVerified true; gate 388 published 11ca746 (rounds 387-388) | ' + str(r['status'])
        r['result'] = EV
b['rounds'].append({'round': 389, 'task': 'current-task.md', 'decision': 'D-29z1310..D-29z1315',
    'type': 'REGRESSION-2026-11-08 part 1: C-only browser sweep of rounds 343-388 (SA-1..SA-16), RR-PERF alone, PERF-LIB, RG-SMOKE, G389-AUTH; A no change',
    'status': 'dispatched', 'note': 'baseline 11ca746 clean; claims b-round-388/claims-389.sh; frozen b-round-388/r389-tree-sha256.txt (1284)', 'added': BY})
lows = [
 ('A-R388-REVIEW-L1-RESYNC-BRANCH-NO-ROW', 'the late-resync branch inside pumpPlaybackAudio (startGraphOrStop catches, the pump catch never runs) relies on the round-388 tick guard; no unit row covers it (candidate SF12, or an early return in the pump after the resync)'),
 ('A-R388-REVIEW-L2-SF11-TRACK-HOLD', 'SF11 does not assert the track meters data-hold-db'),
 ('A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB', 'SF11 relies on vi.stubGlobal(setInterval) also replacing window.setInterval (true under jsdom, unasserted)'),
 ('A-R388-REVIEW-L4-SF11-REAL-CLOCK', 'SF11 waits on the real clock (worst case ~3.2 s / 5 s; measured 0.70 s)'),
]
for i, t in lows:
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': 'A round 388 code-reviewer', 'evidence': 'a-round-388.md §4',
        'title': t, 'repro': 'code reading (schedule-failure-ui.test.tsx / ArrangementContext.tsx at 11ca746)',
        'status': 'deferred_low_polish (D-29z1312)' + ('; browser half observed by REGRESSION row R389-RESYNC-METER (end state only, path not attributable)' if 'L1' in i else ''), 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R388-FAKE-WEB-AUDIO-HELPER', 'source': 'a-round-388.md §4 Architecture note (code-reviewer, verbatim there)',
    'signal': 'signal 3 again: rounds 385-388 each changed the pump/tick/stop region of ArrangementContext.tsx (~l.1235-1391) and each needed its own fake Web Audio setup; schedule-failure-ui.test.tsx now has a third variant (metered context, captured rAF, stubbed setInterval)',
    'proposal': 'keep runtime code in place; one bounded test-only task: shared app/lib/arrangement/__tests__/helpers/fake-web-audio.ts (FakeAudioContext, metered variant, rAF capture runFrames, setInterval stub); done when SF1-SF11 and AR1-AR5 pass unchanged and the runtime is not touched',
    'status': 'recorded (D-29z1313): attached to ARCH-CHECKPOINT-DECODE-REGION; candidate SYS-R388-FAKE-WEB-AUDIO-HELPER, not scheduled until the checkpoint answers (not joined to SYS-R2-FAKE-FIDELITY, which is the R2 worker fake)', 'added': BY})
b['systemic_tasks'].append({'id': 'SYS-R388-FAKE-WEB-AUDIO-HELPER', 'added': BY + ' (D-29z1313)', 'what': 'test-only: extract the fake Web Audio context variants, rAF capture and setInterval stub used by schedule-failure-ui, apply-schedule-rollback, master-hold-tick and decoded-buffer-eviction tests into one helper; assertions unchanged',
    'closes': ['A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB', 'A-R388-REVIEW-L4-SF11-REAL-CLOCK'], 'root_cause': 'each playback bug round builds its own fake audio graph', 'place': 'candidate; scheduled only after ARCH-CHECKPOINT-DECODE-REGION answers or at RETRO 400', 'status': 'candidate'})
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-DECODE-REGION':
        a['status'] = str(a['status']) + ' | +SIG-R388-FAKE-WEB-AUDIO-HELPER: 4th consecutive round (385-388) on the pump/tick/stop region; addendum b-round-388/root-request-arch-addendum-389.md (D-29z1313). Still wanted before PERF-13b-ii dispatch'
        a['addendum_d29z1313'] = 'b-round-388/root-request-arch-addendum-389.md'
sa = [
 'SA-1 schedule-failure rollback + meter floor (386-388): R389-SCHED-FAIL, R389-EDIT-THROW',
 'SA-2 round-388 reviewer L1 late-resync branch (browser end state): R389-RESYNC-METER',
 'SA-3 decoded-buffer cache + Play refusal + deferred preview (382-384, 386): R389-DECODE-CACHE',
 'SA-4 WAV streaming export worker (380): R389-WAV-STREAM',
 'SA-5 leaf memos (371, 374-379): R389-LEAVES',
 'SA-6 status store (372/373): R389-STATUS',
 'SA-7 lazy signalr + no page transition on /studio* (370): R389-LAZY',
 'SA-8 stem cache v2 (365-368): R389-STEM-CACHE',
 'SA-9 range background memo (363/364): R389-RANGE-BG',
 'SA-10 selection store + transport leaf (361/362): R389-SELECT-TRANSPORT',
 'SA-11 playback store + settings survive remount (357-360): R389-PLAY-STORE',
 'SA-12 video drag preview + trim/fade cost (345, 349-356): R389-VIDEO-DRAG',
 'SA-13 fader memo + hoisted icons (346/347): R389-FADERS-ICONS',
 'SA-14 group move preview (343): R389-GROUP-MOVE',
 'SA-15 journey (L54): R389-JOURNEY',
 'SA-16 perf harness + perf lib (343-388 budgets, stem-cache spec, GATE304-M1): RR-PERF, PERF-LIB',
 'SA-17 everything up to round 342 (round 340 template rows, parked RP rows): round 390 part 2',
]
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-2026-11-08':
        r['status'] = 'dispatched part 1 (D-29z1311): round 389 (rounds 343-388, SA-1..SA-16); part 2 = round 390 (SA-17); regression-last updated only when part 2 closes | ' + r['status']
        r['round'] = 389; r['scope_additions'] = sa
dec = [
 ('D-29z1310', 'Round 388 accepted on C evidence (c-round-388.json PASS, 14 rows, browserVerified/realVerified true, 0 bugs; meter-1440/1280.json all -inf after the failure; unit 66/1026; mutants 16/16); gate 388 published 11ca746. Closed: C-R387-01, GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, TL-R387-M1, A-R386-REVIEW-L1. Baseline for round 389 = 11ca746 (gate commit, not head 5312260).'),
 ('D-29z1311', 'Round 389 = REGRESSION-2026-11-08 part 1, opened one day before the 3-day trigger (regression-last 2026-11-05; due 2026-11-08): per D-29z1309, and independently because rounds 385-388 changed shared playback infrastructure (graph build/rollback, pump, tick, stop), a named trigger for re-checking unchanged features. regression-last.json is updated only when part 2 closes.'),
 ('D-29z1312', 'Round-388 code-reviewer Lows L1-L4 -> deferred_low_polish (L5 fixed by A in doc 250). L1 (late-resync branch without a unit row) also gets the browser end-state row R389-RESYNC-METER; path attribution stays a unit-row candidate (SF12).'),
 ('D-29z1313', 'Round-388 Architecture note (signal 3, 4th consecutive round on the pump/tick/stop region) recorded as SIG-R388-FAKE-WEB-AUDIO-HELPER and candidate SYS-R388-FAKE-WEB-AUDIO-HELPER (test-only, not scheduled); ARCH-CHECKPOINT-DECODE-REGION amended with addendum b-round-388/root-request-arch-addendum-389.md, still wanted before PERF-13b-ii dispatch. Not joined to SYS-R2-FAKE-FIDELITY (different fake).'),
 ('D-29z1314', 'REGRESSION-2026-11-08 scope_additions SA-1..SA-17 written (rounds 343-388 items each a named row in round 389; SA-17 = round-340 template rows in round 390). RR-PERF has no C full-run oracle on 7295618: round 389 saves the new oracle, counts only.'),
 ('D-29z1315', 'Outcome fixed in advance: C PASS -> round 390 = part 2 on 11ca746, then regression-last updated and PERF-13b-ii; Critical/High/Medium (cloud-reproducible) -> round 390 fix-up, regression resumes after; Lows -> deferred_low_polish; PARTIAL -> round 390 continues part 1. Queue after the regression unchanged from D-29z1298.'),
]
for i, t in dec:
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        q['status'] = 'in_progress (D-29z1311): round 388 C PASS + published 11ca746; round 389 = REGRESSION-2026-11-08 part 1, round 390 part 2, then PERF-13b-ii | ' + q['status']
b['current_task'] = 'Round 389: REGRESSION-2026-11-08 part 1 (rounds 343-388), C-only; A no change (current-task.md)'
b['version'] = 356; b['updated'] = BY
P.write_text(json.dumps(b, indent=2)); DONE.write_text('ok\n'); print('ok')
