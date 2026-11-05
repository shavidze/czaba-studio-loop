"""B round 355 -> 356 planning: backlog v318 -> v319. Idempotent via update-backlog.done."""
import json, os, shutil, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json')
done = os.path.join(L, 'b-round-355/update-backlog.done')
if os.path.exists(done):
    sys.exit('already applied')
shutil.copyfile(B, os.path.join(L, 'b-round-355/backlog-before-356.json'))
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 318, b['version']
ADDED = '2026-11-05 B round 355 -> 356 planning'
b['version'] = 319
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 356: PERF-CAND-VIDEO-MOVE-BUDGET)'
b['advisor_used_by_B'] = 'yes (round 355 -> 356 planning: advisor consulted after orientation, before writing; and before declaring done)'

b['decisions_log_b'] += [
    {'id': 'D-29z1145', 'date': '2026-11-05', 'text': 'Round 355 (SYS-R353-DP-TEST-POLISH) closed as PASS from C evidence: c-round-355.json PASS, browserVerified/realVerified true, 0 bugs, own mutants OWN-1/OWN-2 run; l57-check rc 0 (b-round-355/l57-check-c355.txt). Gate 355 published 6588f08 on both remotes. Closes A-R350-REVIEW-TEST-NITS (a)(b), A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION in open_findings and deferred_low_polish; part (c) (Video Fade In literal) stays ruled and is tracked as GATE355-L2.'},
    {'id': 'D-29z1146', 'date': '2026-11-05', 'text': 'Gate 355 review (gates/round-355/review.md): L1 (DP69 redundant oldValue check) and L3 (0.01 magic number) -> deferred_low_polish, test-only, absorbed by the next round that owns drag-preview-render.test.tsx; L2 (Video Fade In literal) -> deferred_low_polish with trigger "next task that touches ArrangementClip.tsx"; L4 recorded as info (doc 232 item 111 already states it); L5 (doc 232 title length) joins GATE354-ARCH-DOC232-SPLIT. Architecture note (move DP66-DP72 into drag-preview-video-dock.test.tsx) -> signal GATE355-ARCH-DP-VIDEO-SPLIT, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled.'},
    {'id': 'D-29z1147', 'date': '2026-11-05', 'text': 'Round 356 = PERF-CAND-VIDEO-MOVE-BUDGET, budgets-only (perf/budgets.interactions.json + doc 232): interact.drag.video.stopped.move-components-per-move <= 24 -> <= 10 (ceil 9.883); interact.drag.video.{stopped,playing}.move-components-max record -> assert <= 13 / <= 12 (deterministic, 1x single-clip, three equal samples in C350, B353 sketch, C354 and C354 mutant run; the audio move/lane/group max rows stay record). GATE354-S1 widened by class (L7): the stale "Record until ..." clause is dropped from every asserted note that carries it (12 stage-2 rows + 5 c5-ii rows + the 2 newly asserted max rows = 19 notes). Asserts 82 -> 84. Sketch b-round-355/sketch/budgets.patch.txt; B sketch + M-B2 perf runs in b-round-355/perf-summary.txt.'},
    {'id': 'D-29z1148', 'date': '2026-11-05', 'text': 'Order after round 356: PERF-CAND-MASTER-GROUP-FADER-PROPS once ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is answered, else PERF-CAND-FADE-RELEASE-COMMITS (incl. video fade release-commits 2/2) or PERF-9 -> PERF-9..15 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 under the skip rule. A planning on or after 2026-11-08 runs REGRESSION first. RETRO due at round 368 or the end of STUDIO-PERFORMANCE.'},
]

for r in b['rounds']:
    if r.get('round') == 355:
        r['status'] = 'closed PASS (D-29z1145): C round 355 PASS, browserVerified true; gate 355 published 6588f08'
b['rounds'].append({'round': 356, 'task': 'current-task.md', 'decision': 'D-29z1145..D-29z1148',
                    'type': 'PERF-CAND-VIDEO-MOVE-BUDGET (budgets-only: perf/budgets.interactions.json + doc 232)',
                    'status': 'dispatched',
                    'note': 'baseline 6588f08 clean; claims b-round-355/claims-356.sh; sketch b-round-355/sketch/budgets.patch.txt + doc232.patch.txt; perf b-round-355/perf-summary.txt',
                    'added': ADDED})

q = next(e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE')
q['status'] = 'in_progress (D-29z1147): round 355 C PASS published 6588f08; round 356 = PERF-CAND-VIDEO-MOVE-BUDGET | ' + q['status']
for s in q['stages']:
    if s['id'] == 'SYS-R353-DP-TEST-POLISH':
        s['status'] = 'done (D-29z1145): C round 355 PASS, gate 355 published 6588f08 | ' + s['status']
    if s['id'] == 'PERF-CAND-VIDEO-MOVE-BUDGET':
        s['status'] = 'dispatched round 356 (D-29z1147): + GATE354-S1 widened to every asserted note with a "Record until" clause (19 notes) | ' + s['status']
q['execution_order_d29z1148'] = 'PERF-CAND-VIDEO-MOVE-BUDGET (356) -> PERF-CAND-MASTER-GROUP-FADER-PROPS if the checkpoint is answered, else PERF-CAND-FADE-RELEASE-COMMITS or PERF-9 -> PERF-9..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; REGRESSION first on/after 2026-11-08'

CLOSE = {'A-R350-REVIEW-TEST-NITS': 'closed (D-29z1145): (a)(b) fixed, C round 355 PASS, gate 355 published 6588f08; (c) ruled stays, tracked as GATE355-L2',
         'A-R352-REVIEW-COMMIT-EXACT': 'closed (D-29z1145): C round 355 PASS, gate 355 published 6588f08',
         'A-R352-REVIEW-DRAG-DISTANCE': 'closed (D-29z1145): C round 355 PASS, gate 355 published 6588f08',
         'A-R352-REVIEW-WINDOW-PRECONDITION': 'closed (D-29z1145): C round 355 PASS, gate 355 published 6588f08; limit in doc 232 item 111'}
n = 0
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if f.get('id') in CLOSE:
            f['status'] = CLOSE[f['id']] + ' | ' + f['status']; n += 1
        if f.get('id') == 'GATE354-S1':
            f['status'] = 'in_round_356 (D-29z1147): PERF-CAND-VIDEO-MOVE-BUDGET; closes on C PASS | ' + f['status']; n += 1
assert n == 10, n

EV = 'gates/round-355/review.md'
new = [
    {'id': 'GATE355-L1', 'severity': 'low', 'origin': 'gate 355 review finding 1', 'title': 'DP69 keeps expect(records.map(r => r.oldValue)).not.toContain(\'1.000\'), implied by toHaveLength(0)', 'evidence': EV, 'repro': 'read drag-preview-render.test.tsx DP69 (gate 355 review l.2174)', 'status': 'deferred_low_polish (D-29z1146): test-only; absorbed by the next round that owns drag-preview-render.test.tsx', 'added': ADDED},
    {'id': 'GATE355-L2', 'severity': 'low', 'origin': 'gate 355 review finding 2 (= A-R350-REVIEW-TEST-NITS (c))', 'title': 'Video Fade In literal duplicated in DP13, DP67, DP70; VIDEO_FADE_LABELS is private in ArrangementClip.tsx', 'evidence': EV, 'repro': 'grep "Video Fade In" app/lib/arrangement/__tests__/drag-preview-render.test.tsx', 'status': 'deferred_low_polish (D-29z1146): trigger = next task that touches ArrangementClip.tsx (export the label, use it in the tests)', 'added': ADDED},
    {'id': 'GATE355-L3', 'severity': 'low', 'origin': 'gate 355 review finding 3', 'title': 'DP72 distance guard > 0.01 is an unnamed constant tied to the 3-digit toBeCloseTo precision', 'evidence': EV, 'repro': 'read DP72 distance guard', 'status': 'deferred_low_polish (D-29z1146): test-only; absorbed by the next round that owns drag-preview-render.test.tsx', 'added': ADDED},
]
info = {'id': 'GATE355-I4', 'severity': 'info', 'origin': 'gate 355 review finding 4', 'title': 'DP72 does not cover an rAF-scheduled seek or a setTimeout reference captured at module load', 'evidence': EV, 'repro': '-', 'status': 'recorded (D-29z1146): already stated in doc 232 item 111; the playing path is covered by the browser perf rows and the C video probe', 'added': ADDED}
b['open_findings'] += [dict(x) for x in new] + [info]
b['deferred_low_polish'] += [dict(x) for x in new]

for s in b['architecture_signals']:
    if s.get('id') == 'GATE354-ARCH-DOC232-SPLIT':
        s['status'] = 'signal (D-29z1146): also carries GATE355-L5 (title has ~20 stage names) | ' + s['status']
b['architecture_signals'].append({'id': 'GATE355-ARCH-DP-VIDEO-SPLIT', 'origin': 'gate 355 review Architecture note', 'note': 'drag-preview-render.test.tsx (~2300 lines): reviewer says keep; when a later round touches the video-dock tests again, one bounded task moves DP66-DP72 into drag-preview-video-dock.test.tsx with a shared mount/mock helper, count stays 74', 'status': 'signal (D-29z1146); joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3; not scheduled', 'added': ADDED})

for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        r['status'] = 'wanted (D-29z1148): still no answer artifact at round 356 planning; question 3 also gathers GATE355-ARCH-DP-VIDEO-SPLIT; non-blocking | ' + r['status']

open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n')
print('backlog v319 written')
