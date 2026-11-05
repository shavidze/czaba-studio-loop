# B round 352 -> 353 planning, part 1: round-352 closure from C evidence. Run from the loop root: python3 -I b-round-352/update-backlog.py
import json, pathlib, sys

P = pathlib.Path('backlog.json')
DONE = pathlib.Path('b-round-352/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 314, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 352 -> 353 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1127', 'Round 352 closed on evidence: c-round-352.json taskStatus PASS, browserVerified/realVerified true, 0 bugs, 9 rows passed (CLAIMS, SOURCE-SCOPE, READ, UNIT 74/74, MUTANT jsdom, MUTANT browser M-B2prime names, NAMES smoke 1440, G352-AUTH both viewports, DOCS); gate rows not claimed. Gate 352 published a55543b on both remotes (gates/gate-round-352.json; verify.log 245 test files passed). PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 is done (product rows C round 350 by dock sha256 037f62fa..., test rows C round 352). Closed: C-R351-01, A-R350-REVIEW-SEEK-TEST (Medium), C-R350-01, A-R351-REVIEW-GLOBAL-SPY, A-R351-REVIEW-TRY-SPAN (Low). Baseline for round 353 = a55543b, clean tree (b-round-352/head-at-planning.txt, git-status-at-planning.txt empty).')
dlog('D-29z1128', 'Round-352 notes routed: A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION (Low, A code-reviewer; C agrees, c-round-352.md Notes) -> deferred_low_polish. Gate 352 review (gates/round-352/review.md): S1 latent stale cachedLane (reviewer: medium-low, harmless today, no reader uses the stale fields) = same root cause as A-R350-REVIEW-CACHED-TRACKS -> recorded as GATE352-S1 Low, joined to it, kept deferred because the dock is not owned by the next rounds and no reproducible defect exists; it is also put to the architecture checkpoint (question 4). S2 subscription churn (Low, keep as is) -> deferred. S3 DP72 fixed 20 ms wait (Low) -> joined to A-R352-REVIEW-WINDOW-PRECONDITION. S4/S5 info. Architecture note (dock reader + fade overlay, signal 3 + signal 4, keep for now) -> signal GATE352-ARCH-DOCK-LIFECYCLE joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.')
dlog('D-29z1129', 'Feature boundary + accumulated risk on one owner: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 closed; ArrangementVideoDock.tsx changed in rounds 345, 349, 350-352 and named by two reviewers (A-R350-ARCH-PREVIEW-READER, GATE352-ARCH-DOCK-LIFECYCLE). ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has been wanted since D-29z1104 with no answer artifact. B asks root for the bounded frontend-architect checkpoint now (b-round-352/root-request-arch-checkpoint.md, per store/.claude/references/architecture-checkpoint.md). Non-blocking: RETRO 353 and PERF stage 2 (row conversion, test-only) proceed; no extract is scheduled until root records a result.')

b['rounds'][-1]['status'] = 'c_pass_published a55543b (D-29z1127): C round 352 PASS browserVerified/realVerified true, 0 bugs; gate 352 published a55543b'

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1127): PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 done (C round 352 PASS, gate a55543b); round 353 = RETRO 353 | ' + sp['status']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1127): video-trim-fade-cost stage 1 done (C round 350 product rows by dock hash + C round 352 test rows; gate 352 published a55543b); next stage 2 = convert the 22 video rows to assert (budgets only) | ' + dp['status']

of = b['open_findings']
for i in ('C-R351-01', 'A-R350-REVIEW-SEEK-TEST', 'C-R350-01', 'A-R351-REVIEW-GLOBAL-SPY', 'A-R351-REVIEW-TRY-SPAN'):
    f = find(of, i)
    f['status'] = 'closed (D-29z1127): C round 352 PASS (c-round-352.json, mutant red sets equal the map), gate 352 published a55543b | ' + f['status']

new_lows = [
    {'id': 'A-R352-REVIEW-COMMIT-EXACT', 'severity': 'low', 'origin': 'A round 352 code-reviewer', 'title': 'DP72 committed start uses toBeCloseTo(shownStart, 6), looser than the de-dupe key the release-count line relies on; toBe placed before the count would report a commit mismatch as such', 'evidence': 'a-round-352.md Review findings; drag-preview-render.test.tsx DP72', 'repro': 'read DP72 committed-start assert vs the release length assert'},
    {'id': 'A-R352-REVIEW-DRAG-DISTANCE', 'severity': 'low', 'origin': 'A round 352 code-reviewer', 'title': 'DP72 checks drag direction (> imported.start) but not a distance above the 3-digit seek precision; suggested guard > 0.01', 'evidence': 'a-round-352.md Review findings', 'repro': 'read DP72 preview-start assert'},
    {'id': 'A-R352-REVIEW-WINDOW-PRECONDITION', 'severity': 'low', 'origin': 'A round 352 code-reviewer; gate 352 review S3 joined (D-29z1128)', 'title': 'DP72 no-write window relies on stubbed requestAnimationFrame and jsdom readyState 0 and a fixed real 20 ms wait (can pass vacuously on a later write); record the coverage limit in doc 232 or flush rAF/microtasks instead', 'evidence': 'a-round-352.md; gates/round-352/review.md suggestion 3', 'repro': 'read DP72 settle and the harness rAF stub'},
    {'id': 'GATE352-S1', 'severity': 'low', 'origin': 'gate 352 review suggestion 1 (reviewer label medium-low, latent)', 'title': 'useVideoLanePreviewReader returns the cached lane object with stale base fields (tracks) when the base changes but video clips are element-wise equal; harmless today (video.ts and video-fades.ts read only the video track kind/id and clips)', 'evidence': 'gates/round-352/review.md suggestion 1', 'repro': 'same root cause as A-R350-REVIEW-CACHED-TRACKS; no user-visible defect', 'joined_to': 'A-R350-REVIEW-CACHED-TRACKS'},
    {'id': 'GATE352-S2', 'severity': 'low', 'origin': 'gate 352 review suggestion 2', 'title': 'a new reader per commit re-creates the dock useSyncExternalStore subscriptions and re-runs syncStoppedVideo (de-duplicated by stoppedKeyRef); keep unless profiling shows it', 'evidence': 'gates/round-352/review.md suggestion 2', 'repro': 'read ArrangementVideoDock reader identity'},
]
for f in new_lows:
    f['status'] = 'deferred_low_polish (D-29z1128)'
    f['added'] = ADDED
    of.append(dict(f))
    b['deferred_low_polish'].append(dict(f))

b['architecture_signals'].append({'id': 'GATE352-ARCH-DOCK-LIFECYCLE', 'origin': 'gate 352 review Architecture note', 'note': 'reader hook and fade overlay add lifecycle/subscription code to the already large ArrangementVideoDock (signal 4) in a region changed in rounds 345, 349, 350-352 (signal 3); reviewer: keep for now, the reader is pure and could move later at low cost', 'status': 'signal, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 4 (D-29z1128); not scheduled', 'added': ADDED})

ac = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
ac['status'] = 'requested_from_root now (D-29z1129): b-round-352/root-request-arch-checkpoint.md; feature boundary (video-trim-fade-cost stage 1 closed) + signal 3 on ArrangementVideoDock.tsx; non-blocking | ' + ac['status']
ac['question_4_d29z1129'] = 'keep or extract the ArrangementVideoDock preview reader (useVideoLanePreviewReader, sameClipList) and fade overlay subscription (A-R350-ARCH-PREVIEW-READER, GATE352-ARCH-DOCK-LIFECYCLE), including the stale cachedLane invariant (A-R350-REVIEW-CACHED-TRACKS, GATE352-S1)'

b['current_task'] = 'current-task.md (round 353: RETRO 353, window 336-352)'
b['version'] = 315
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v315')
