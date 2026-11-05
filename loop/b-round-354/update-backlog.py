# B round 354 -> 355 planning: round-354 closure from C evidence + gate 354 review + round-355 task. Run from the loop root:
#   python3 -I b-round-354/update-backlog.py
import json, pathlib, sys

P = pathlib.Path('backlog.json')
DONE = pathlib.Path('b-round-354/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 317, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 354 -> 355 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1140', 'Round 354 (PERF-CAND-VIDEO-TRIM-FADE-COST stage 2) closed on evidence: c-round-354.json taskStatus PASS, browserVerified/realVerified true, 0 bugs; rows CLAIMS, SOURCE-SCOPE, READ, PERF (82/82 asserted, 0 NEW, none above C350, durationMs 478956), PERF-LIB 40/40, VIDEO-DRAG-SMOKE 1440x900 and 1280x720, G354-AUTH, RT-FIX-354, DOCS, own MUTANT. Gate 354 published 7219291 on both remotes (gates/gate-round-354.json); the round-355 baseline is 7219291. The video trim/fade costs are now guarded by 12 asserted rows (red evidence: B/A M-B2, 6 red). G354-AUTH fake-bearer 500 (mock :5199 down) stays open backend evidence, not a bug. INFO-C354-MUT-VACUOUS: C-MUT-1 (sameClipList always false) stayed green with every row EQUAL, so it is not red evidence; recorded, not scheduled.')
dlog('D-29z1141', 'Gate 354 review (gates/round-354/review-result.json): GATE354-S1 (Low, the 12 asserted rows keep the "Record until C measures it" note clause) is folded into PERF-CAND-VIDEO-MOVE-BUDGET, the next budgets-only edit; GATE354-S2 (Low, near-zero headroom on trim <=13 / fade <=3) is ruled intended (doc 232 item 107: one extra stopped commit is the regression) and closed; GATE354-INFO-DOC-TITLE + the architecture note (doc 232 title/status edited every stage, signal 3; split per-stage sections into a child doc at feature close) is a signal joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, not scheduled.')
dlog('D-29z1142', 'Round 355 = SYS-R353-DP-TEST-POLISH (test-only: drag-preview-render.test.tsx DP69/DP70/DP72 + doc 232; claims b-round-354/claims-355.sh; sketch b-round-354/sketch/test.patch.txt + doc232.patch.txt). Rulings: DP69 writtenValues replaced by records toHaveLength(0) (stronger; A-M5 now red on DP69); DP70 caption check removed (caption is empty in every DP70 state, DP64 covers it) and the gap checks rebuilt around a committed trimStart that uncovers the playhead with Undo/Redo (M-B8/M-B9 red on sketch, green on HEAD); the Video Fade In literal stays (VIDEO_FADE_LABELS is private to ArrangementClip.tsx; exporting it is app source, outside a test-only task); DP72 distance > 0.01 (FX-SHORTDRAG red on sketch, green on HEAD), exact toBe(shownStart) before the seek count (M-B6 first red line moves to it), and fake setTimeout + runAllTimersAsync instead of the 20 ms sleep (M-B1-LATE red on sketch, green on HEAD); rAF and module-saved timer references stay uncovered, recorded in doc 232 item 111 (tech-lead TL-R355). tech-lead sketch review 0 Medium+, TL-R355-1/3/4 fixed in the sketch, -2 ruled keep, -5 info. The four findings close on C PASS. GATE352-S1 trigger (next task touching the dock) is NOT fired: round 355 does not touch ArrangementVideoDock.tsx.')
dlog('D-29z1143', 'Parallel execution policy (Saba 2026-11-05) recorded (L42): root may apply cloud/root-commits/*.patch before a round on lanes COPY-PD (app/components/studio/export/*, app/components/studio/StudioToolbar.tsx) and SRW-21-PLAN (docs only). B grants never include root-lane files while root works them; round 355 touches only drag-preview-render.test.tsx and doc 232 (no overlap). Claims allow a HEAD that descends from the gate commit through root-lane files only (K2 outside-root-lanes count 0); that is not a STOP. STEM-LANES, STORE-2b+ and T12-ADVANCED cannot run in parallel with PERF (same files or a Saba decision).')
dlog('D-29z1144', 'Order after round 355: PERF-CAND-VIDEO-MOVE-BUDGET (budgets-only, includes GATE354-S1 note wording; B re-runs the perf spec on its sketch, L58) -> PERF-CAND-MASTER-GROUP-FADER-PROPS once ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is answered, else PERF-CAND-FADE-RELEASE-COMMITS or PERF-9 -> PERF-9..15 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 under the skip rule. A planning on or after 2026-11-08 runs REGRESSION first (regression-last.json 2026-11-05 note).')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1140): C round 354 PASS browserVerified/realVerified true, 0 bugs; gate 354 published 7219291'
b['rounds'].append({'round': 355, 'task': 'current-task.md', 'decision': 'D-29z1142..D-29z1144', 'type': 'SYS-R353-DP-TEST-POLISH (test-only: DP69/DP70/DP72 + doc 232)', 'status': 'dispatched', 'note': 'baseline 7219291 clean; claims b-round-354/claims-355.sh; sketch b-round-354/sketch/test.patch.txt + doc232.patch.txt; mutants b-round-354/sketch/mutant-summary.txt', 'added': ADDED})

of = b['open_findings']
for i in ('A-R350-REVIEW-TEST-NITS', 'A-R352-REVIEW-COMMIT-EXACT', 'A-R352-REVIEW-DRAG-DISTANCE', 'A-R352-REVIEW-WINDOW-PRECONDITION'):
    for lst in (of, b['deferred_low_polish']):
        f = find(lst, i)
        f['status'] = 'in_round_355 (D-29z1142): SYS-R353-DP-TEST-POLISH dispatched; closes on C PASS | ' + f['status']
for f in (
    {'id': 'GATE354-S1', 'severity': 'low', 'origin': 'gate 354 review finding 1', 'title': 'the 12 stage-2 asserted rows keep the "Record until C measures it" note clause before the assert sentence', 'evidence': 'gates/round-354/review-result.json', 'repro': 'read the note of interact.drag.video-trim.stopped.move-components-per-move', 'status': 'scheduled in PERF-CAND-VIDEO-MOVE-BUDGET (D-29z1141)'},
    {'id': 'GATE354-S2', 'severity': 'low', 'origin': 'gate 354 review finding 2', 'title': 'near-zero headroom: video trim stopped per-move <=13 vs 12.817, fade <=3 vs 2.95', 'evidence': 'gates/round-354/review-result.json; doc 232 item 107', 'repro': 'compare budgets with C350', 'status': 'closed (D-29z1141): ruled intended - one extra stopped commit is the regression the rows catch; read windowCommits/componentsSum before calling a red row a regression'},
    {'id': 'INFO-C354-MUT-VACUOUS', 'severity': 'info', 'origin': 'C round 354', 'title': 'C-MUT-1 (sameClipList always false) left every perf row EQUAL; it is not red evidence for the 12 rows', 'evidence': 'c-round-354/rowcmp-mutant.txt', 'repro': 'c-round-354.json notes', 'status': 'recorded (D-29z1140); red evidence stays B/A M-B2'},
):
    f['added'] = ADDED
    of.append(f)
gs1 = dict(find(of, 'GATE354-S1'))
b['deferred_low_polish'].append(gs1)

b['architecture_signals'].append({'id': 'GATE354-ARCH-DOC232-SPLIT', 'origin': 'gate 354 review Architecture note + Info 3', 'note': 'doc 232 carries 20+ stages; title and status line are edited every round (signal 3). Proposal: at PERF-DRAG-PREVIEW close, a docs-only task moves per-stage sections to a child doc and keeps a short index', 'status': 'signal (D-29z1141); joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE; not scheduled', 'added': ADDED})

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1142): round 354 C PASS published 7219291; round 355 = SYS-R353-DP-TEST-POLISH | ' + sp['status']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1140): video-trim-fade-cost stage 2 C round 354 PASS, gate 354 published 7219291 (12 rows asserted, 82/252); item stays in_progress for the move crossing (checkpoint question 1 / PERF-CAND-MASTER-GROUP-FADER-PROPS) | ' + dp['status']
pol = find(sp['stages'], 'SYS-R353-DP-TEST-POLISH')
pol['status'] = 'dispatched round 355 (D-29z1142)'
st = find(b['systemic_tasks'], 'SYS-R353-DP-TEST-POLISH')
st['status'] = 'dispatched round 355 (D-29z1142)'
mv = find(sp['stages'], 'PERF-CAND-VIDEO-MOVE-BUDGET')
mv['status'] = 'next after round 355 (D-29z1144); also drops the "Record until C measures it" clause from the 12 stage-2 notes (GATE354-S1) | ' + mv['status']

b['current_task'] = 'current-task.md (round 355: SYS-R353-DP-TEST-POLISH)'
b['version'] = 318
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v318')
