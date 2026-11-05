# B round 343 -> 344 planning: backlog v302 -> v303. Once-only (marker b-round-343/update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-343/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-343/backlog-before-344.json').exists():
    sys.exit('backup missing')
b = json.load(open('backlog.json'))
assert b['version'] == 302, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 343 -> 344 planning'
SKETCH = json.load(open('b-round-343/sketch-summary.json'))


def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})


dec('D-29z1079', 'Round 343 (PERF-DRAG-PREVIEW c4-ii) closed PASS from C evidence: c-round-343.json taskStatus PASS, browserVerified/realVerified true, 0 bugs; passed CLAIMS, SOURCE-SCOPE (3 patches reverse-apply), UNIT (23 files 561), MUTANT (HEAD+new tests red DP51/52/54/56/GS5b; MU-OVERVIEW-COMMITTED only DP54; C-predicted MU-VIDEO-STORE only DP53), PERF (prod :5188, 219 rows, 55/55 asserted, 149 EQUAL, 8 DIFF exactly as spec: group per-move 74.781 -> 26.969, max 106 -> 104), PERF-LIB 34/34, READ (GATE338-S1), GROUP-BEHAVIOUR, OVERVIEW-FOLLOWS, BLOCKED-STATUS (browser 1440 and 1280), G343-AUTH (Sign in required, 0 audio[src], 401/400/403 with mock up, /studio-lab anonymous), DOCS. Gate 343 published 0aa317f on both remotes. Stage c4-ii -> done. Baseline for round 344 = 0aa317f. New perf oracle = c-round-343/perf-results/latest-interactions.json (219 rows, complete, 0 failures). GATE338-S1-IDENTITY-INVARIANT closed on the READ row (historyRef.current = only at ArrangementContext.tsx l.922 updateHistory and l.1942/l.1946 previewClipGeometry). C env note (mock API down at phase start; C started and stopped mock-api/server.mjs) goes to root as an environment note, not a finding.')
dec('D-29z1080', 'Round-343 notes routed: A reviewer Lows A-R343-REVIEW-FROZEN-READERS, -DP55-LOOSE, -DP52-PREVIEW-NULL, -DP53-DUP, -GROUP-CANCEL, -HELDREF-IN-RENDER -> deferred_low_polish (2026-10-23 rule; C did not re-rate them). A/code-reviewer Architecture note (ArrangementClip.tsx chooses among three preview paths previewArrangement/previewGeometry/previewGroup; remove the hasVideo and previewArrangement fallback once video reads the preview store) -> signal ARCH-R343-THREE-PREVIEW-PATHS, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question (2); it is the natural tail of c5-ii, not a separate task now.')
dec('D-29z1081', 'PERF-DRAG-PREVIEW c5 split (precedent c3-i/c3-ii, c4-i/c4-ii): c5-i = a video clip move drag in the interactions perf harness, all rows record (round 344); c5-ii = the video preview through the preview store for move, trim and fade of a video clip (ArrangementClip.tsx isVideo -> previewClipGeometry; ArrangementVideoDock stopped-sync effect, caption, gap caption and fade overlay select the preview; group hasVideo fallback removed), with jsdom rows, C browser rows from b-round-343/video-probe.mjs and video rows -> assert from a B sketch run (L58). HEAD premise (b-round-343/probe/head-summary.txt, dev :5173 = 0aa317f, 1440 and 1280, video 10.mp4): video move 99.433 components/move (max 103), trim 100.7 (max 103, 1440), fade 94.4 (max 96); ArrangementProvider, StudioWorkspace and ArrangementVideoDock render on 59 of 59 move commits; provider hook 0 changes every move (fade also hook 16); release 1 commit (max 88-90). Audio single-clip move is 24.9/move after c4-ii. pageErrors []. Probe limitation: at 1280 the trim press landed on the fade-in handle (the perf spec visibleGrabPoint ownership check prevents that); the probe did not assert isPlaying for its playing rows.')
dec('D-29z1082', 'c5-i rulings: (1) one video gesture (name-bar move) in the harness: the video move, trim and fade all reach previewArrangement through the same isVideo branch (ArrangementClip.tsx previewGeometry = isVideo ? previewArrangement) and cost the same order at HEAD (94-101/move); c5-ii covers trim and fade with jsdom rows and C browser rows. (2) 1x only and measured last in the 1x pass (after select same lane), so no pre-existing row can change: import seeks to 0 and clears the range (ArrangementContext runVideoImport), which would move the playhead for later blocks. (3) rows "all-but-ratio": no commits-per-move row (DC-KINDS pins exactly 16 windowed commits-per-move rows). (4) setup zooms in with "=" until the video name bar is >= 480 px (at most 16 keys): sketch v1 aborted at "drag target has no visible grab point" after the select-same-lane zoom-out (b-round-343/perf-sketch-v1.log). (5) Fixture public/videos/hero/1.mp4 (tracked, 12.99 s, ~4 MB) through setInputFiles; no new binary. (6) liveness interact.harness.drag-video-live is record (c3-i precedent; B ran no mutant). (7) L31: ' + SKETCH['timing_ruling'])
dec('D-29z1083', 'Round 344 = PERF-DRAG-PREVIEW c5-i, from B sketch b-round-343/sketch/{spec,budgets}.patch.txt (apply-sketch.py on a git archive of 0aa317f): ' + SKETCH['result_text'] + ' Reference-first, product-designer, screen budget and the YouTube request do not apply (test-and-docs perf round; app behaviour untouched). Next after C PASS: c5-ii, then ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE request to root.')

for r in b['rounds']:
    if r.get('round') == 343:
        r['status'] = 'closed PASS (D-29z1079): C 12 rows PASS, 0 bugs, browserVerified true; gate published 0aa317f | ' + r['status']
b['rounds'].append({'round': 344, 'task': 'current-task.md', 'decision': 'D-29z1079..D-29z1083', 'type': 'PERF-DRAG-PREVIEW stage c5-i (video clip move drag rows in the interactions perf harness, record, 1x only)', 'status': 'dispatched', 'note': 'baseline 0aa317f clean; patches b-round-343/sketch/{spec,budgets}.patch.txt; claims b-round-343/claims-344.sh', 'added': ADDED})

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1083): c4-ii done (round 343); round 344 = PERF-DRAG-PREVIEW c5-i | ' + perf['status']
perf['execution_order_d29z1083'] = ['344 PERF-DRAG-PREVIEW c5-i (video drag rows, record)', 'c5-ii (video preview through the store; video rows -> assert)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE request after c5-ii', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1079/D-29z1081): stages a .. c4-ii done (c4-ii C round 343 PASS, 0aa317f; group 74.781 -> 26.969/move); c5 split into c5-i (round 344: video move drag rows, record, 1x) and c5-ii (video preview through the store) | ' + st['status']
        st['split_d29z1081'] = {
            'c5_i': 'round 344: test-only video clip name-bar move drag in perf/studio-lab-interactions.perf.spec.ts, 1x only, measured last; 11 record rows interact.drag.video.{stopped,playing}.* + interact.harness.drag-video-live; owner PERF-DRAG-PREVIEW-c5-i',
            'c5_ii': 'ArrangementClip.tsx: video move/trim/fade preview -> previewClipGeometry (drop isVideo ? previewArrangement and the group hasVideo fallback, ARCH-R343-THREE-PREVIEW-PATHS); ArrangementVideoDock.tsx: stopped-sync effect deps [arrangement, isPlaying, positionStore, videoSources], ArrangementVideoCaption/GapCaption (useVideoSourceIdAtPlayhead(arrangement)) and ArrangementVideoFadeOverlay (videoFadeOpacityAt(arrangement, ...)) select the preview; the playing step already reads getArrangement() (historyRef). Behaviour oracle: the dock frame follows the dragged clip mid-drag when stopped (HEAD does, through React arrangement). Rows -> assert from B sketch + mutant (L58).',
            'premise_head_0aa317f': 'b-round-343/probe/head-summary.txt',
        }
        st['stage_c5_i_contract_d29z1083'] = 'current-task.md round 344; patches b-round-343/sketch/{spec,budgets}.patch.txt; perf b-round-343/perf-sketch-results; probe b-round-343/probe/'

closed = 0
for f in b['open_findings']:
    if f.get('id') == 'GATE338-S1-IDENTITY-INVARIANT':
        f['status'] = 'closed (D-29z1079): C round 343 READ row PASS, historyRef.current writes only in updateHistory and previewClipGeometry | ' + f['status']
        closed += 1
assert closed == 1

lows = [
    ('A-R343-REVIEW-FROZEN-READERS', 'During a non-video group drag any reader of React arrangement stays at the committed state; readout, detail panel, overview and project end already select the preview; other multi-selection displays not audited (residual risk; C GROUP-BEHAVIOUR and OVERVIEW-FOLLOWS covered what the user sees)'),
    ('A-R343-REVIEW-DP55-LOOSE', 'DP55 ArrangementProvider <= 1 is loose by design (TL-7); HEAD-red power comes from the workspace and lane counts'),
    ('A-R343-REVIEW-DP52-PREVIEW-NULL', 'DP52 previewOf null also holds at HEAD; the render counts distinguish HEAD from the change'),
    ('A-R343-REVIEW-DP53-DUP', 'one DP53 assert repeats the line above it'),
    ('A-R343-REVIEW-GROUP-CANCEL', 'no group-specific pointercancel test and no test for a second press over a leftover gesture; shared code covered by DP56'),
    ('A-R343-REVIEW-HELDREF-IN-RENDER', 'useEqualityStableSelector writes heldRef during render (StudioWorkspace.tsx ~l.643-652, pre-existing since c2a); reviewer confirmed no loop under zustand v5 Object.is and unconditional hook order'),
]
existing = {x.get('id') for x in b['deferred_low_polish']}
for i, title in lows:
    assert i not in existing, i
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': 'A round 343 code-reviewer', 'title': title, 'evidence': 'a-round-343.md "code-reviewer findings"', 'repro': 'read the cited test/code; no user-visible failure (C round 343 browser rows PASS)', 'status': 'deferred_low_polish (D-29z1080)', 'added': ADDED})

b['architecture_signals'].append({'id': 'ARCH-R343-THREE-PREVIEW-PATHS', 'origin': 'A round 343 code-reviewer Architecture note', 'note': 'ArrangementClip.tsx chooses among previewArrangement, previewGeometry and previewGroup; keep this round; remove the hasVideo and previewArrangement fallback once video reads the preview store (c5-ii)', 'status': 'signal (D-29z1080); folded into PERF-DRAG-PREVIEW c5-ii scope and ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question (2)', 'added': ADDED})
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE':
        a['status'] = 'planned (D-29z1081): root calls frontend-architect after c5-ii C PASS (c5 split into c5-i/c5-ii); question (2) also covers ARCH-R343-THREE-PREVIEW-PATHS | ' + a['status']

assert all(x.get('id') != 'ROOT-REQ-PERF-INTERACTIONS-TIMEOUT' for x in b['root_requests_b'])
b['root_requests_b'].append({'id': 'ROOT-REQ-PERF-INTERACTIONS-TIMEOUT', 'file': 'store/playwright.perf.config.ts (config, outside loop grants)', 'decision': 'D-29z1082', 'blocking': False, 'status': 'filed: raise timeout 15 -> 20 min for L31 headroom; B sketch runs with the c5-i video block took 417845 ms and 382525 ms (bound 450000 ms = 50 %); root decides', 'added': ADDED})
b['version'] = 303
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 344: PERF-DRAG-PREVIEW c5-i)'
b['advisor_used_by_B'] = 'yes (round 343 -> 344 planning: advisor consulted after orientation, before writing; and before declaring done)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
