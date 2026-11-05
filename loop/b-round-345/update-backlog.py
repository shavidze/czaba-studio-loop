# B round 345 -> 346 planning: backlog.json update (close-out of round 345 + dispatch of round 346).
# Run from the loop root: python3 -I b-round-345/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-345/backlog-before-346.json')
DONE = pathlib.Path('b-round-345/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
b = json.loads(P.read_text())
assert b['version'] == 306, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 345 -> 346 planning'

def dlog(i, text):
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})

dlog('D-29z1090', 'Round 345 closed as PASS from independent C evidence: c-round-345.json taskStatus PASS, browserVerified/realVerified true, 12 rows passed (CLAIMS, SOURCE-SCOPE, UNIT 136/136, MUTANT, PERF 60/60 asserted, 162 EQUAL / 3 DIFF / 0 NEW vs C344, DOCK-FOLLOWS and RENDERS at 1440 and 1280, PERF-LIB 34/34, G345-AUTH, READ, DOCS, extra FLOW add/import/move/export WAV). Gate 345 published 645b2e6 on both remotes; baseline for round 346 is 645b2e6. PERF-DRAG-PREVIEW stage c5-ii -> done. New perf oracle c-round-345/perf-results/latest-interactions.json. Backend-blocked row (mock :5199 down) recorded under blocked, not a failure.')
dlog('D-29z1091', 'Round-345 notes routed: C-R345-PERF-DURATION (465718 ms) and A-R345-PERF-DURATION (476277 ms) -> evidence on ROOT-REQ-PERF-TIMEOUT (root-only config). C-R345-CAPTION-MUTANT-GAP (test gap), A-R345-REVIEW-DP62-FINALLY and A-R345-REVIEW-BUDGET-NOTES -> scheduled in round 346 (the round owns drag-preview-render.test.tsx and the budget notes; cheap; 2026-10-23 rule allows an early Low fix in owned code). A-R345-REVIEW-VIDEO-TRACK-ID -> deferred_low_polish (source not owned in 346). ARCH-R345-VIDEO-LANE-TYPE -> architecture_signals (joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE). Headroom note video stopped 23.617 vs <= 24 recorded. C observation "SFX added with Music active lands on Music" is by design (ArrangementContext add uses latest.activeTrackId, audio lanes only; Live inserts into the selected track) -> observation, not a finding.')
dlog('D-29z1092', 'PERF-DRAG-PREVIEW target <= 15 components/move for fade/trim/move is KEPT, not revised. Evidence: B names probe on dev 645b2e6 at 1440 (b-round-345/names-head-645b2e6-v2.json, forwardRef display names): trim 22/commit, move 19 (one project-end crossing 101), fade 10. Seven per trim commit draw nothing the gesture changes: lane ChevronDown + its inner lucide Icon, two ArrangementMixFader (forwardRef, inline props), clip GripVertical + inner Icon, ArrangementDetailClipGain (forwardRef, inline props) (performance-optimizer consult, confirmed by the v2 probe). New stage c6: c6-i (round 346) hoists the lane and clip lucide icon elements as module constants (the DETAIL_TOGGLE_CHEVRON_* pattern) and closes three round-345 Lows; perf rows stay record. c6-ii: ArrangementMixFader and ArrangementDetailClipGain memo with stable props (lane and detail handlers), informed by ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; expected trim 15, move 12 steady, fade 4. Then conversions: ceil(value) budgets (no +1, performance-optimizer), release-commits == 1 asserted with a flushSync-on-release mutant, one gross mutant (previewArrangement path) and one fine mutant (one extra component) per converted family; move-components-max and 6x copies stay record; move per-move includes the crossing commit (tech-lead/optimizer caveat, stated in that task). Then PERF-CAND-VIDEO-TRIM-FADE-ROWS (record).')
dlog('D-29z1093', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is now due (round 345 C PASS, gate 345 published 645b2e6): root calls frontend-architect. Questions (tech-lead consult, round 346 planning, max 3): (1) the project-end crossing commit re-renders StudioWorkspace (~101 components) mid-gesture while the provider does not: move project end into its own store (PERF-8a pattern) inside PERF-DRAG-PREVIEW or as a new item? (2) converge the preview paths (ARCH-R343-THREE-PREVIEW-PATHS) on one drag-preview store contract typed Pick<Arrangement, tracks | clips> (also ARCH-R345-VIDEO-LANE-TYPE)? (3) which leaf components own their subscriptions so parents stay static during a gesture: the dock overlays (ARCH-R344-DOCK-SUBTREE), the lane header with its faders and the detail clip gain (c6-ii), ARCH-R344-WITH-TEARDOWN. Non-blocking: c6-i does not depend on it; c6-ii reads the answer when present and otherwise uses stable useCallback props.')
dlog('D-29z1094', 'Round 346 dispatched: PERF-DRAG-PREVIEW stage c6-i (current-task.md; sketch b-round-345/sketch/source.patch.txt; names probe b-round-345/names-probe-v2.mjs with HEAD and sketch outputs). Reference-first, product-designer, screen budget and YouTube request do not apply (performance round, no visible change). REGRESSION not due (next on/after 2026-11-08); RETRO about round 351. Advisor: consulted once after orientation (available); the second call before writing was refused as overloaded.')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1090): C round 345 PASS browserVerified=true realVerified=true; gate 345 published 645b2e6'
b['rounds'].append({'round': 346, 'task': 'current-task.md', 'decision': 'D-29z1090..D-29z1094', 'type': 'PERF-DRAG-PREVIEW stage c6-i (lane and clip lucide icon elements hoisted; three round-345 Lows; perf rows record)', 'status': 'dispatched', 'note': 'baseline 645b2e6 clean; patch b-round-345/sketch/source.patch.txt; names probe b-round-345/names-probe-v2.mjs', 'added': ADDED})

def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1094): c5-ii done (round 345, 645b2e6); round 346 = PERF-DRAG-PREVIEW c6-i | ' + sp['status']
sp['execution_order_d29z1094'] = ['346 PERF-DRAG-PREVIEW c6-i (icon hoists + C-R345-CAPTION-MUTANT-GAP, A-R345-REVIEW-DP62-FINALLY, A-R345-REVIEW-BUDGET-NOTES; rows record)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect; due now, non-blocking)', 'c6-ii (MixFader + DetailClipGain memo, stable props)', 'conversions (trim/move/fade rows -> assert, ceil rule, gross + fine + release mutants)', 'PERF-CAND-VIDEO-TRIM-FADE-ROWS (record)', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1094): stages a .. c5-ii done (c5-ii C round 345 PASS, 645b2e6; video stopped 98.35 -> 23.617/move); round 346 = c6-i | ' + dp['status']
dp['split_d29z1092'] = {'c6_i': 'round 346: hoist lane fold chevrons, lane Plus and clip Film/GripVertical lucide elements as module constants; tests DP63 (no icon render during trim/move/fade) and DP64 (dock caption follows a stopped video move); DP62 try/finally; 3 stale video budget notes; rows record', 'c6_ii': 'ArrangementMixFader and ArrangementDetailClipGain memo with stable props; expected trim 15, move 12 steady, fade 4 per commit', 'conversions': 'trim/move/fade 1x per-move and max (not move max) and release-commits -> assert at ceil(value); gross, fine and flushSync release mutants; 6x copies record', 'video_rows': 'PERF-CAND-VIDEO-TRIM-FADE-ROWS record', 'target': 'kept <= 15/move (D-29z1092)', 'evidence': 'b-round-345/names-head-645b2e6-v2.json, b-round-345/names-sketch-v2.json, b-round-345/names-compare.txt'}
dp['stage_c6_i_contract_d29z1094'] = 'current-task.md round 346; patch b-round-345/sketch/source.patch.txt; probe b-round-345/names-probe-v2.mjs'

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'due now (D-29z1093): round 345 C PASS + gate 345 published 645b2e6; root calls frontend-architect with the three questions of D-29z1093; non-blocking for c6-i | ' + acr['status']

b['architecture_signals'].append({'id': 'ARCH-R345-VIDEO-LANE-TYPE', 'origin': 'A round 345 code-reviewer Architecture note', 'note': 'useVideoLaneArrangement returns a video-lane-only object typed as a full Arrangement; proposal: narrow video.ts / video-fades.ts helper parameters to Pick<Arrangement, tracks | clips>', 'status': 'signal (D-29z1091); question (2) of ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE', 'added': ADDED})

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'open; evidence added at round 345 -> 346 planning (D-29z1091): interactions spec with c5-ii took 465718 ms (C round 345) and 476277 ms (A round 345), above the L31 bound 450000 ms | ' + rr['status']

b['deferred_low_polish'].append({'id': 'A-R345-REVIEW-VIDEO-TRACK-ID', 'severity': 'low', 'origin': 'A round 345 code-reviewer', 'title': 'ArrangementVideoDock.tsx looks up videoTrackId twice (hook returns empty string, component undefined)', 'evidence': 'a-round-345.md, Open Lows', 'repro': 'read ArrangementVideoDock.tsx useVideoLaneArrangement and the component body videoTrackId lookups', 'status': 'deferred_low_polish (D-29z1091)', 'added': ADDED})

for f in [
    {'id': 'C-R345-CAPTION-MUTANT-GAP', 'severity': 'low', 'origin': 'C round 345', 'title': 'no jsdom test reads the dock caption during a video drag; a mutant passing committed arrangement to ArrangementVideoCaption stays green (64/64)', 'evidence': 'c-round-345/mut2-caption.log', 'status': 'scheduled round 346 (D-29z1091): DP64'},
    {'id': 'A-R345-REVIEW-DP62-FINALLY', 'severity': 'low', 'origin': 'A round 345 code-reviewer', 'title': 'DP62 stops playback with togglePlayback() without try/finally; a failed assert leaves playback running', 'evidence': 'a-round-345.md, Open Lows', 'status': 'scheduled round 346 (D-29z1091)'},
    {'id': 'A-R345-REVIEW-BUDGET-NOTES', 'severity': 'low', 'origin': 'A round 345 code-reviewer', 'title': 'interact.drag.video.{stopped,playing}.move-to-paint-p95 and .playing.release-restarts notes still say "Record until c5-ii moves..." with no c5-ii outcome', 'evidence': 'perf/budgets.interactions.json at 645b2e6', 'status': 'scheduled round 346 (D-29z1091)'},
    {'id': 'C-R345-PERF-DURATION', 'severity': 'low', 'origin': 'C round 345', 'title': 'interactions perf spec 465718 ms > 450000 (L31)', 'evidence': 'c-round-345/perf-results/latest-interactions.json', 'status': 'closed into ROOT-REQ-PERF-TIMEOUT (D-29z1091)'},
]:
    f['added'] = ADDED
    b['open_findings'].append(f)

b['current_task'] = 'current-task.md (round 346: PERF-DRAG-PREVIEW c6-i)'
b['version'] = 307
b['updated'] = ADDED
P.write_text(json.dumps(b, ensure_ascii=False, indent=1) + '\n')
DONE.write_text('ok\n')
print('ok v307')
