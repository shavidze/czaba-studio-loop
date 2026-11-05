# B round 351 -> 352 planning: backlog.json update. Run from the loop root: python3 -I b-round-351/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-351/backlog-before-352.json')
DONE = pathlib.Path('b-round-351/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
b = json.loads(P.read_text())
assert b['version'] == 313, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 351 -> 352 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1123', 'Round 351 closed as C FAIL "STOPPED - routed to B", origin B spec: A STOP at A-REVIEW (code-reviewer F1 Medium A-R351-REVIEW-RELEASE-ASSERT: DP72 had no assert between release and Undo); C confirmed by reading (C-R351-01 Medium, read-based) and ran CLAIMS, SOURCE-SCOPE, G351-AUTH both viewports (PASS); UNIT, MUTANT jsdom/browser and NAMES smoke not run, so browserVerified/realVerified false (c-round-351.json). Gate 351 skipped. Baseline stays 7f56989 with the 3 files (dock sha256 037f62fa... unchanged; DP72 as b-round-350 patch; doc 232 round-351 edits). Planning fault: L58 sketch-review clause (B reviews its sketch before dispatch) was not applied in round 350; A said so in writing. Not A fault.')
dlog('D-29z1124', 'Ruling on C-R351-01 / A-R351-REVIEW-RELEASE-ASSERT: DP72 gains a release half and an Undo-write half. Sketch b-round-351/sketch-dp72-release.patch.txt (16+/8- on the current tree; 62+/0- vs b-round-350 r350 copy): spy counts only HTMLVideoElement writes (F2), try/finally removed (F3), blank line before DP72 (F7); after pointerUpAt a 20 ms real-timer settle, then seeks length unchanged (release writes nothing) and committed start = previewed start; after Undo a new write and the pre-drag media time. B measured on scratch /home/runner/b352-scratch/sk: file 74/74 (9.98 s), tsc 0, biome clean, DP72 3/3 replicates. Mutant map: M-B1 (reader base = arrangement) -> DP69 + DP72 (DP72 red at the release-length line; green on the round-351 DP72, b-round-351/mutant-M-B1-on-dp72-r351.log, i.e. the gap the reviewer named, made concrete); M-B5 -> DP72 (preview waitFor); M-B6 (commitArrangement commits before) -> DP66-DP70 + DP72 (committed-start line); M-B7 (seek effect deps drop videoLane) -> DP72 only (Undo write line); M-B2 -> DP66/67, M-B2prime -> DP66/67/71, A-M5 -> DP71, control 7/7 (all b-round-351/mutant-*.log). Sketch reviewed by tech-lead before dispatch (code-reviewer is not on B consult list): 0 Medium+; Low 1 (count, not last value, after release) applied; Low 2 (Undo length check redundant with the final value check) kept as documentation. A-R351-REVIEW-GLOBAL-SPY, A-R351-REVIEW-TRY-SPAN and the F7 nit close with C round 352 PASS.')
dlog('D-29z1125', 'Doc 232 l.4 form (A observation round 351): keep the doc published convention "...; C round N pending)" (HEAD 7f56989 reads C round 349 pending) for this multi-stage doc; round 352 grants exactly "C round 352 pending". L28 says the post-PASS string; the mismatch is a RETRO 353 candidate (RC-R351-L28-PENDING-FORM), not changed in a fix-up.')
dlog('D-29z1126', 'Round 352 dispatched: C-R351-01 fix-up (current-task.md). A applies b-round-351/sketch-dp72-release.patch.txt and b-round-351/sketch-doc232.patch.txt unchanged; dock and context untouched. C rows: CLAIMS (b-round-351/claims-352.sh), SOURCE-SCOPE, READ, UNIT 74/74, MUTANT jsdom (M-B1, M-B2, M-B2prime, A-M5, M-B5, M-B6, M-B7), MUTANT browser M-B2prime names (round 350/351 never ran it), NAMES smoke 1440, G352-AUTH both viewports, DOCS. Round-350 PERF/BEHAVIOUR/RELEASE/PLAY-SYNC evidence cited by dock hash. RETRO moves 352 -> 353 (second slip; window 336-352), ROOT-REQ-PERF-TIMEOUT moves with it. Retro candidates RC-R351-SKETCH-REVIEW-SKIPPED, RC-R351-L28-PENDING-FORM.')

b['rounds'][-1]['status'] = 'c_fail_stop_spec (D-29z1123): A STOP at A-REVIEW (F1 Medium, DP72 release half unguarded); C FAIL STOPPED routed to B, browserVerified false; gate 351 skipped; tree kept for round 352'
b['rounds'].append({'round': 352, 'task': 'current-task.md', 'decision': 'D-29z1123..D-29z1126', 'type': 'PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up 2 (C-R351-01: DP72 release + Undo halves)', 'status': 'dispatched', 'note': 'baseline 7f56989 + 3 files; claims b-round-351/claims-352.sh; sketch b-round-351/sketch-dp72-release.patch.txt + sketch-doc232.patch.txt', 'added': ADDED})

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1126): round 351 STOP on a B-spec test gap; round 352 = DP72 release/Undo fix-up | ' + sp['status']
sp['execution_order_d29z1126'] = [
    '352 PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up 2 (C-R351-01; closes C-R350-01 and A-R350-REVIEW-SEEK-TEST on C PASS)',
    'RETRO 353 (window 336-352; ROOT-REQ-PERF-TIMEOUT to Saba if still open, L46)',
    'PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 = convert the 22 rows to assert at C round 350 values (budgets only)',
    'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing',
    'PERF-CAND-FADE-RELEASE-COMMITS',
    'PERF-9..15',
    'SYS-R2-FAKE-FIDELITY',
    'SYS-CLOCK-DETERMINISM',
    'next REGRESSION due on or after 2026-11-08',
]
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1126): video-trim-fade-cost stage 1 product verified by C round 350; test fix-ups 351 (STOP) -> 352 | ' + dp['status']
dp['stage_video_trim_fade_cost_fixup2_d29z1124'] = {
    'task': 'current-task.md round 352',
    'files': ['app/lib/arrangement/__tests__/drag-preview-render.test.tsx', 'docs/implementation/2026/quarter-IV/232-perf-drag-preview.md'],
    'dock_sha256': '037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96',
    'mutant_map': {'M-B1': ['DP69', 'DP72'], 'M-B2': ['DP66', 'DP67'], 'M-B2prime': ['DP66', 'DP67', 'DP71'], 'A-M5': ['DP71'], 'M-B3': ['DP68'], 'M-B4': ['DP70'], 'M-B5': ['DP72'], 'M-B6': ['DP66', 'DP67', 'DP68', 'DP69', 'DP70', 'DP72'], 'M-B7': ['DP72']},
}

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'overdue (L46, D-29z1126): deadline moves with the RETRO to round 353 -> one Saba question | ' + rr['status']

for i, note in [
    ('RC-R351-SKETCH-REVIEW-SKIPPED', 'L58 already says B reviews its sketch before dispatch; round 350 B shipped DP72 without that review and A reviewer found a Medium (A STOP 351). Candidate: make the sketch review a K-claim artifact (b-round-N/sketch-review.md must exist) so a skipped review is visible at planning. Note: code-reviewer is not on B consult list; tech-lead was used in round 351 planning. Evidence: C-R351-01, a-round-351/review.md (1x).'),
    ('RC-R351-L28-PENDING-FORM', 'L28 says A writes the post-PASS l.4 string; doc 232 publishes "C round N pending" every stage (HEAD 7f56989: C round 349 pending). Decide one form at RETRO and update L28 or the doc. Evidence: A observation round 351, D-29z1125 (1x).'),
]:
    b['retro_candidates'].append({'id': i, 'note': note, 'added': ADDED})

of = b['open_findings']
find(of, 'C-R350-01')['status'] = 'ruled (D-29z1119); closes on the next C PASS of the fix-up (round 352, D-29z1126); round 351 STOPPED'
find(of, 'A-R350-REVIEW-SEEK-TEST')['status'] = 'in_progress round 352 (D-29z1124): DP72 with release and Undo halves, mutants M-B1/M-B5/M-B6/M-B7; closes on C round 352 PASS'
new = [
    {'id': 'C-R351-01', 'severity': 'medium', 'origin': 'B spec (C round 351; = A-R351-REVIEW-RELEASE-ASSERT)', 'title': 'DP72 has no assert between release and Undo; a release seek-back or an Undo that writes nothing is hidden', 'evidence': 'a-round-351/review.md F1; c-round-351.md; b-round-351/mutant-M-B1-on-dp72-r351.log (round-351 DP72 green under the stale-base reader that writes on release)', 'status': 'in_progress round 352 (D-29z1124): sketch b-round-351/sketch-dp72-release.patch.txt; closes on C round 352 PASS'},
    {'id': 'A-R351-REVIEW-GLOBAL-SPY', 'severity': 'low', 'origin': 'A round 351 code-reviewer F2', 'title': 'DP72 currentTime spy records writes from every media element', 'evidence': 'a-round-351/review.md', 'status': 'in_progress round 352 (D-29z1124): spy filters HTMLVideoElement in the sketch; closes on C round 352 PASS'},
    {'id': 'A-R351-REVIEW-TRY-SPAN', 'severity': 'low', 'origin': 'A round 351 code-reviewer F3', 'title': 'DP72 try/finally covers only one waitFor', 'evidence': 'a-round-351/review.md', 'status': 'in_progress round 352 (D-29z1124): try/finally removed in the sketch (DP64 pattern); closes on C round 352 PASS'},
]
for f in new:
    f['added'] = ADDED
    of.append(f)

b['current_task'] = 'current-task.md (round 352: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 fix-up 2, C-R351-01)'
b['version'] = 314
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v314')
