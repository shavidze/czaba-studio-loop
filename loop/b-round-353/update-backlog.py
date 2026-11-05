# B round 353 -> 354 planning: round-353 closure from C evidence + round-354 task. Run from the loop root:
#   MB2P='<M-B2prime summary>' python3 -I b-round-353/update-backlog.py
import json, os, pathlib, sys

P = pathlib.Path('backlog.json')
DONE = pathlib.Path('b-round-353/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 316, b['version']
MB2P = os.environ['MB2P']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 353 -> 354 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1135', 'Round 353 (RETRO 353) closed on evidence: c-round-353.json taskStatus PASS, browserVerified/realVerified true, 11 rows passed (SOURCE-SCOPE, CLAIMS, RT-NUM, RT-CAUSE, RT-IDS, RT-L57, RT-SABA, RT-SCREEN at both viewports with the mock API, G353-AUTH both viewports, STUDIO-SMOKE-353 both viewports incl. WAV 48 kHz non-silent, RT-LESSONS with Low C-R353-01); gate rows not claimed; 0 app bugs. B re-ran tools/l57-check.py on c-round-353.json: rc 0 (b-round-353/l57-check-c353.txt). Gate 353 skipped (no real changes), so the round-354 baseline stays a55543b (gate 352 published). retro_runs 353 and next_due 368 stand.')
dlog('D-29z1136', 'C-R353-01 (Low, origin C, against B lessons text): L58 lost the "fixed in the sketch or ruled" alternative. Fixed by B at this planning: l.41 now reads "...opens with the dispatched sketch\'s sha256; each Medium+ is fixed in the sketch or ruled by id..." (b-round-353/lessons-before-354.md, lessons-diff.txt: one hunk 41c41; still 60 lines). C-R353-02 (Low, origin C, against B task text): the smoke row expected "Undo: Move clip" while a cross-lane drag is labelled "Move to track — <lane>" (strings.ts l.701; "Move clip" is l.702, same lane), and the token row did not name the query parameters (the route validates ?product=&file= first, 400). Fixed in the round-354 task text (G354-AUTH and VIDEO-DRAG-SMOKE rows). Both close on this planning; C re-checks the l.41 hunk in RT-FIX-354.')
dlog('D-29z1137', 'Screen review: C measured SR-353-1 (last-added clip lies beyond the scroller right edge, scrollLeft 0, both viewports) and SR-353-4 (1280x720 export dialog scrollHeight 691 > clientHeight 646, Time selection row partly hidden; no overflow at 1440x900) in c-round-353.md RT-SCREEN. Both stay awaiting_user (behaviour/layout = Saba); nothing scheduled. ROOT-REQ-PERF-TIMEOUT unchanged (question to Saba, retro-353 section 12.1); new evidence: B sketch interactions run 488086 ms (bound 450000, STOP 540000). ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE still has no root answer; non-blocking for stage 2 (budgets only), but doc 232 TODO requires it before PERF-CAND-MASTER-GROUP-FADER-PROPS.')
dlog('D-29z1138', 'PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 shape: 12 of the 22 PERF-CAND-VIDEO-TRIM-FADE-ROWS rows go to assert at the ceiling of C round 350 (three equal samples, 1x; same app source as a55543b: dock 037f62fa..., context ff46799c...): video-trim stopped per-move <=13 (12.817), max <=15 both states, release-commits ==1 both, playing move-restarts ==0; video-fade stopped per-move <=3 (2.95), max <=3 both, playing move-restarts ==0; both live rows ==1. Owner PERF-CAND-VIDEO-TRIM-FADE-COST-2. 10 stay record, by the file\'s own rules, not by scope cut: 4 move-to-paint-p95 and 2 playing per-move are kind wallclock (0 wallclock asserts in the file; trim playing samples unequal), 2 release-restarts (no release-restarts row is asserted), 2 video-fade release-commits (2/2, unexplained second commit, joined to PERF-CAND-FADE-RELEASE-COMMITS). tech-lead sketch review (b-round-353/sketch-review.md): 0 Medium+; TL-R354-1 (note wording) applied, TL-R354-2 (owner defined in doc 232 section) applied; margin argument: one extra stopped window commit fails the per-move rows = correct signal. B sketch (production, alone): rc 0, 252 rows, 82/82 asserted pass, 0 NEW, 0 deterministic rows above C350, durationMs 488086. Mutant M-B2prime (dock subscribes to the preview store again): ' + MB2P + '. Doc 232 l.4 moves to the L28 PASS form (no pending).')
dlog('D-29z1139', 'Round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (current-task.md; claims b-round-353/claims-354.sh). Planned 2026-11-05, before the regression due date 2026-11-08. After it: REGRESSION if planned on/after 2026-11-08, then SYS-R353-DP-TEST-POLISH, then PERF-CAND-MASTER-GROUP-FADER-PROPS once ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is answered; if it is still unanswered then, B dispatches the next independent PERF stage (PERF-CAND-FADE-RELEASE-COMMITS or PERF-9) instead of waiting.')

b['rounds'][-1]['status'] = 'c_pass (D-29z1135): C round 353 PASS browserVerified/realVerified true, 0 app bugs, 2 Low against B text (C-R353-01/02, fixed D-29z1136); gate 353 skipped (no real changes)'
b['rounds'].append({'round': 354, 'task': 'current-task.md', 'decision': 'D-29z1138..D-29z1139', 'type': 'PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (12 video trim/fade rows record -> assert; budgets + doc 232 only)', 'status': 'dispatched', 'note': 'baseline a55543b clean; claims b-round-353/claims-354.sh; sketch b-round-353/sketch/budgets.patch.txt + doc232.patch.txt', 'added': ADDED})

of = b['open_findings']
for f in (
    {'id': 'C-R353-01', 'severity': 'low', 'origin': 'C round 353 (against B lessons text)', 'title': 'L58 lost the "fixed in the sketch or ruled" alternative in the RETRO 353 edit', 'evidence': 'c-round-353.md RT-LESSONS', 'repro': 'diff b-round-352/lessons-before-353.md lessons.md l.41'},
    {'id': 'C-R353-02', 'severity': 'low', 'origin': 'C round 353 (against B task text)', 'title': 'STUDIO-SMOKE-353 expected "Undo: Move clip" for a cross-lane drag (actual label "Move to track — <lane>"); the token row did not name ?product=&file=', 'evidence': 'c-round-353.md STUDIO-SMOKE-353, G353-AUTH; strings.ts l.701-702', 'repro': 'drag a clip to another lane; read the Undo title'},
):
    f['status'] = 'closed (D-29z1136): fixed by B at the round 353 -> 354 planning (lessons l.41; round-354 task text); C re-checks l.41 in RT-FIX-354'
    f['added'] = ADDED
    of.append(f)

for s in b['screen_review_candidates']:
    if s.get('id') in ('SR-353-1', 'SR-353-4'):
        s['status'] = 'awaiting_user (D-29z1137): C-confirmed by measurement in c-round-353.md RT-SCREEN | ' + s['status']

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1139): RETRO 353 done (C round 353 PASS); round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 | ' + sp['status']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1138): round 354 = video-trim-fade-cost stage 2 (12 rows to assert, 10 stay record by kind/rule); after C PASS the video trim/fade costs are guarded; item stays in_progress for the move crossing (checkpoint question 1 / PERF-CAND-MASTER-GROUP-FADER-PROPS) | ' + dp['status']

sp['stages'].append({'id': 'PERF-CAND-VIDEO-MOVE-BUDGET', 'what': 'tighten the video move component budgets: interact.drag.video.stopped.move-components-per-move <=24 -> ceiling of C (9.883 in C350 and B sketch 353), move-components-max stopped/playing record -> assert (13 / 12, equal samples)', 'evidence': 'b-round-353/perf-summary.txt mu-b2: video move per-move 9.883 -> 15.75 passed <=24 while the dock re-rendered per video preview write', 'status': 'queued (D-29z1138): one budgets-only step after SYS-R353-DP-TEST-POLISH; B re-runs the perf spec on its sketch (L58)', 'added': ADDED})

rp = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rp['data_round_353_planning'] = 'B sketch interactions run 488086 ms (b-round-353/perf-summary.txt), bound 450000, STOP 540000 (D-29z1137)'

b['current_task'] = 'current-task.md (round 354: PERF-CAND-VIDEO-TRIM-FADE-COST stage 2)'
b['version'] = 317
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v317')
