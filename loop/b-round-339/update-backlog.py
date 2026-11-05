# B round 339 -> 340 planning: backlog v298 -> v299. Once-only (marker update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-339/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-339/backlog-before-340.json').exists():
    sys.exit('backup b-round-339/backlog-before-340.json missing')
FINAL = sys.argv[1] if len(sys.argv) > 1 else ''
b = json.load(open('backlog.json'))
assert b['version'] == 298, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 339 -> 340 planning (started 2026-11-04 23:20Z)'

def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})

dec('D-29z1049', 'Round 339 closed PASS from C evidence: c-round-339.json taskStatus PASS, browserVerified/realVerified true, 10 rows (CLAIMS, SOURCE-SCOPE, PERF, PREMISE, MUTANT, GROUP-NAMES, HARNESS-READ, PERF-LIB, G339-AUTH, DOCS), 0 bugs, 6 gate rows not claimed; gate 339 published 99a5912 on both remotes (gates/gate-round-339.json). PERF-DRAG-PREVIEW stage c4-i -> done (26 group rows, 219 total, 45 asserted; group 74.781/move vs lane 24.906). Baseline for round 340: 99a5912 (context/head-sha.txt stale 662ed42).')
dec('D-29z1050', 'Round-339 notes: A reviewer Lows -> deferred_low_polish A-R339-REVIEW-E-GHOST-ORDER, A-R339-REVIEW-LANE-NOTE-ORDER, A-R339-REVIEW-OVER-UNDO, A-R339-REVIEW-NULL-SETUP; gate 339 reviewer #1-#3 -> deferred_low_polish GATE339-S1-GROUP-CLEANUP-ON-THROW, GATE339-S2-TEARDOWN-TITLE, GATE339-S3-NUMBER-PARSE (#4 info). A-R339-REVIEW-TEARDOWN-ABORT (Medium on B sketch, fixed by A, confirmed by C HARNESS-READ) -> closed_fixed, L58-class planning signal (RETRO input). A Architecture note + gate Architecture note (measureLaneDrag/measureGroupDrag ~80% shared; third round in that region) -> signal ARCH-R339-DRAG-MEASURE-EXTRACT, bounded test-only extraction after c4-ii with 219-row id/value equality and MU-GROUP-SINGLE/lane mutants red; joins ARCH-R337-PERF-HELPERS-TO-LIB; not scheduled.')
dec('D-29z1051', 'REGRESSION due: regression-last.json 2026-11-02 (round 301); this planning started 2026-11-04 23:20Z and finished 2026-11-05 00:1xZ (3 days) before the backlog and task were written, so it is the first planning on or after 2026-11-05 fixed by D-29z1009..D-29z1043. Round 340 = REGRESSION-ROUND-2026-11-05 (C-only sweep, template tasks/round-301.md; every scope_additions entry named, L6). The c4-ii package (b-round-339/: sketch patches, unit logs, perf alone, mutants, probes, sketch-review, claims-340.sh, current-task-c4-ii-draft.md with a carry-forward note) is complete and becomes round 341 after the regression (or after its fix-up).')
dec('D-29z1052', 'c4-ii premise and sketch (b-round-339/): at 99a5912 the group branch of ArrangementClip handlePointerMove calls previewArrangement(next) per same-lane move and previewArrangement(gesture.before) per cross-lane plan (history write -> provider + StudioWorkspace render; c4-i rows 74.781/move, max 106). Sketch: group.hasVideo (groupHasVideoClip, Set) chooses previewArrangement for groups with a video-track clip, else previewGeometry (= previewClipGeometry); ArrangementGroupHeaderWithSelection reads the preview store when collapsed (overviewGroupId, sameTrackGroupOverviewClips). Evidence: typecheck rc0; 23 affected suites 561/561; new tests on HEAD DP51/52/54/56/GS5b red, DP53/55 green; MU-OVERVIEW-COMMITTED only DP54 red; MU-VIDEO-STORE only DP53 red; perf (source, c4-i budgets) 219 rows 149 EQUAL / 8 DIFF (group per-move 74.781 -> 26.969, max 106 -> 104, x4 each), 45/45; browser overview probe HEAD (:5173) == sketch prod build (:5192), both viewports: hidden block 0 -> 3.000 mid-drag -> 3.000 -> 0.000 after Ctrl+Z. ' + FINAL + ' Dispatch deferred to round 341 (D-29z1051).')
dec('D-29z1053', 'Rulings c4-ii: (1) collapsed group overview must follow the drag: reachable at HEAD (Ctrl+A selectAllClips selects clips on collapsed lanes; collapse prunes clip selection only at collapse time; B probe head-<w>.json), so the header reads the preview store (DP54, OVERVIEW-FOLLOWS). (2) groups containing a video-track clip keep previewArrangement (HEAD path) until stage c5 (DP53). (3) blocked-move status stays setStatus(GROUP_MOVE_BLOCKED_MESSAGE): a repeated blocked move renders the provider fiber only (reducer returns the previous entry; children bail out), workspace/lanes 0 (DP55 <= 1; TL-7); no status-write change (L51). (4) GATE338-S1: only updateHistory and the two previewClipGeometry writes touch historyRef, so the identity reset during a group drag drops preview content only (tech-lead TL-1); closes on C READ row of round 340. (5) group release-restarts 2 stays record (two moved sources restart once at release; not per-move).')
dec('D-29z1054', 'Consults (b-round-339/sketch-review.md): tech-lead no Critical/High; TL-3 Medium test gap -> DP56 (blur abort of a group move) applied; TL-5 Set lookup applied; TL-6 GS5b DOM/committed-m1 asserts applied; TL-7 ruled (D-29z1053); TL-1 edge (fader keyboard/wheel edit during a drag published with preview geometry, overwritten on return to delta 0; HEAD-equal) -> signal SIG-R340-FADER-EDIT-DURING-DRAG; TL-2 (clip view unmount cleanup releases without revert; triggers refused during a gesture; hypothesis) -> signal SIG-R340-UNMOUNT-RELEASE-PUBLISHES; TL-4 reader table: nothing stale that matters. performance-optimizer: assert per-move <= 27, release-commits == 1, playing move-restarts == 0 (both rates); max/windows/release-restarts record; per-move CPU in the group branch -> signal SIG-R340-GROUP-PERMOVE-CPU.')
dec('D-29z1055', 'Budgets c4-ii: 10 rows record -> assert, owner PERF-DRAG-PREVIEW-c4-ii, note sentence appended: interact.drag.group.{stopped,playing}.move-components-per-move(.6x) <= 27; interact.drag.group.{stopped,playing}.release-commits(.6x) == 1; interact.drag.group.playing.move-restarts(.6x) == 0. 219 rows, 12 asserted group rows, 55 asserted total (b-round-339/sketch/budgets.patch.txt).')
dec('D-29z1056', 'Tests c4-ii: drag-preview-render.test.tsx gains PROJECT_END_CLIP and DP51-DP56; grid-snap-ui.test.tsx GS5b mid-drag reads move from committed clipOf to shownClipOf (getArrangement) plus 3 asserts (committed s1 4.3, committed m1 unchanged, DOM 5.300). No expect( removed without replacement (tests.patch.txt removes 3 lines: one import line and the two replaced reads).')
dec('D-29z1057', 'Environment note: B ran a dev server for the scratch sketch on :5191 with node_modules symlinked to the store; Vite re-optimized the shared node_modules/.vite/deps at 23:38Z. Root dev server :5173 re-checked with b-round-339/overview-probe.mjs afterwards: loads, no page errors. B used the sketch production build (remix-serve :5192) instead. Rule in the task: never start a second dev server from a tree that symlinks the store node_modules. B also invalidated one of its own perf mutant runs (pkill matched its webServer); log kept as perf-mutant-head-source-killed-by-B.log; the final runs ran alone (L38).')
dec('D-29z1058', 'This task: round 340 = REGRESSION-ROUND-2026-11-05 on 99a5912 (A no change; C sweep of round 301 sections plus 4d rows for rounds 302-339, scope additions SA-1..SA-20 named, RR-PERF alone with drag-lane-live and drag-group-live, RG-SMOKE, G340-AUTH; claims b-round-339/claims-r340.sh; frozen tree b-round-339/r340-tree-sha256.txt 1239 entries). Outcome fixed in advance: all PASS -> regression-last {C date, 340} and round 341 = c4-ii from b-round-339/current-task-c4-ii-draft.md; Medium+ -> round 341 bounded fix-up, then c4-ii. c4-ii draft: 7 granted files (ArrangementClip.tsx, StudioWorkspace.tsx, drag-preview-render.test.tsx, grid-snap-ui.test.tsx, perf/budgets.interactions.json, doc 232 whole, doc 168 metrics), patches b-round-339/sketch/, claims b-round-339/claims-340.sh.')

for r in b['rounds']:
    if r.get('round') == 339:
        r['status'] = 'c_pass_published (D-29z1049): gate 339 published 99a5912 | ' + r['status']
b['rounds'].append({'round': 340, 'task': 'current-task.md', 'decision': 'D-29z1049..D-29z1058', 'type': 'REGRESSION-ROUND-2026-11-05: C-only browser sweep (round 301 sections + rounds 302-339 rows, SA-1..SA-20), RR-PERF, smoke, auth', 'status': 'dispatched', 'note': 'baseline 99a5912 clean; claims b-round-339/claims-r340.sh; frozen tree b-round-339/r340-tree-sha256.txt; next = c4-ii (b-round-339/current-task-c4-ii-draft.md)', 'added': ADDED})

for f in b['open_findings']:
    if f.get('id') == 'GATE338-S1-IDENTITY-INVARIANT':
        f['status'] = 'ruled (D-29z1053): only updateHistory and the two previewClipGeometry writes touch historyRef; closes on the C READ row of the c4-ii round (341) | ' + f['status']
    if f.get('id') == 'GATE338-S3-STALE-LIVE-NOTE':
        f['status'] = 'closed_fixed (D-29z1049): round 339 removed the sentence from both drag-lane-live notes; C round 339 SOURCE-SCOPE budget diff (2 drag-lane-live rows changed, note only) | ' + f['status']
for f in b['deferred_low_polish']:
    if f.get('id') == 'A-R338-REVIEW-IDENTITY-TRIM-TEST':
        f['status'] = 'related: round 340 DP55/DP56 exercise the identity branch for a group; the trim/fade return-to-start row stays open | ' + f['status']
b['open_findings'] += [
    {'id': 'A-R339-REVIEW-TEARDOWN-ABORT', 'severity': 'medium', 'origin': 'A round 339 code-reviewer (on B sketch)', 'title': 'group teardown did one Ctrl+Z then expect(count 1); a stale entry from the playing reset would abort the 1x pass', 'evidence': 'a-round-339.md code review; c-round-339.md HARNESS-READ', 'status': 'closed_fixed (D-29z1050): bounded Ctrl+Z loop in round 339, confirmed by C; L58-class planning signal (RETRO input)', 'added': ADDED},
]
lows = [
    ('A-R339-REVIEW-E-GHOST-ORDER', 'A round 339 code-reviewer', 'liveness (e) reads target.at(0) of the two ghosts (DOM order)', 'compare sorted starts, cross[i] > entry[i]'),
    ('A-R339-REVIEW-LANE-NOTE-ORDER', 'A round 339 code-reviewer', 'in the two drag-lane-live notes (e) follows the Asserted since sentence', 'perf/budgets.interactions.json interact.harness.drag-lane-live notes'),
    ('A-R339-REVIEW-OVER-UNDO', 'A round 339 code-reviewer (re-review)', 'teardown Ctrl+Z loop cap 3 can undo past the start entry when 2+ unexpected entries exist (never silent)', 'teardownGroupClips in perf/studio-lab-interactions.perf.spec.ts'),
    ('A-R339-REVIEW-NULL-SETUP', 'A round 339 code-reviewer', 'failed-setup cleanup is a single Ctrl+Z with no waitForQuiet and no Undo check', 'runInteractionPass group block, setup null path'),
    ('GATE339-S1-GROUP-CLEANUP-ON-THROW', 'gate 339 reviewer #1 (Medium-Low)', 'if measureGroupDrag throws after setup, teardownGroupClips does not run (copy kept, Control maybe pressed)', 'gates/round-339/review.md finding 1'),
    ('GATE339-S2-TEARDOWN-TITLE', 'gate 339 reviewer #2', 'teardown loop cannot tell Undo title unchanged from nothing undone', 'gates/round-339/review.md finding 2'),
    ('GATE339-S3-NUMBER-PARSE', 'gate 339 reviewer #3', 'liveness (c) Number(string) treats an empty data-clip-start as 0', 'gates/round-339/review.md finding 3'),
]
for i, origin, title, repro in lows:
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': origin, 'title': title, 'evidence': 'a-round-339.md / gates/round-339/review.md', 'repro': repro, 'status': 'deferred_low_polish (D-29z1050); candidate for ARCH-R339-DRAG-MEASURE-EXTRACT (same code)', 'added': ADDED})

b['architecture_signals'] += [
    {'id': 'ARCH-R339-DRAG-MEASURE-EXTRACT', 'origin': 'A round 339 Architecture note + gate 339 reviewer Architecture note', 'note': 'measureLaneDrag and measureGroupDrag share ~80% (windows, put rows, double-rAF settle); extract writeLaneWindowRows/settleTwoFrames keeping row ids and windows; acceptance: all 219 row ids and values equal vs round 339/340 run, MU-GROUP-SINGLE and lane mutants red', 'status': 'signal (D-29z1050), after c4-ii; joins ARCH-R337-PERF-HELPERS-TO-LIB; not scheduled', 'added': ADDED},
    {'id': 'SIG-R340-GROUP-PERMOVE-CPU', 'origin': 'performance-optimizer consult (round 340 planning)', 'note': 'group branch recomputes markerSnapTimes, scans all clips in groupDeltaOnGrid, runs planClipLaneMove twice on a refusal and JSON.stringify of ghosts per move; CPU not renders', 'status': 'signal (D-29z1054); not scheduled', 'added': ADDED},
    {'id': 'SIG-R340-FADER-EDIT-DURING-DRAG', 'origin': 'tech-lead TL-1 (round 340 planning)', 'note': 'a keyboard/wheel fader edit during a clip drag publishes {...historyRef.current} including preview geometry; a return to delta 0 then overwrites it (HEAD-equal)', 'status': 'signal (D-29z1054); hypothesis, not reproduced; not scheduled', 'added': ADDED},
    {'id': 'SIG-R340-UNMOUNT-RELEASE-PUBLISHES', 'origin': 'tech-lead TL-2 (round 340 planning)', 'note': 'ArrangementClip unmount cleanup releases a moved gesture without revert; the gesture release then publishes the preview with no history entry; known triggers are refused during a gesture (HEAD-equal)', 'status': 'signal (D-29z1054); hypothesis, not reproduced; not scheduled', 'added': ADDED},
]
for a in b['architecture_signals']:
    if a.get('id') == 'SIG-R338-GROUP-CROSS-PREVIEW':
        a['status'] = 'sketched for c4-ii (round 341, D-29z1051): the cross-lane plan previews through previewGroup | ' + a['status']
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE', 'file': 'b-round-339.md section 5', 'question': 'At the close of PERF-DRAG-PREVIEW (after c5): keep/extract for (1) the per-provider store contexts (ARCH-R338-STORES-PROVIDER), (2) ArrangementClip gesture handler size and the group/single branches, (3) the perf harness drag measurers (ARCH-R339-DRAG-MEASURE-EXTRACT, ARCH-R337-PERF-HELPERS-TO-LIB). Output per architecture-checkpoint.md: keep/extract, value, risk, max three sentences.', 'status': 'planned (D-29z1058): root calls frontend-architect after c5 C PASS; does not block c5', 'added': ADDED})

perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1049..D-29z1058): PERF-DRAG-PREVIEW c4-i done (C round 339 PASS, gate 99a5912); round 340 = REGRESSION-ROUND-2026-11-05; round 341 = c4-ii (sketched and reviewed in b-round-339/); then c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | ' + perf['status']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1058): stages a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i done (c4-i C round 339 PASS, 99a5912); c4-ii sketched, measured and reviewed (b-round-339/, D-29z1052..D-29z1056), dispatch round 341 after the regression (D-29z1051); c5 not started | ' + st['status']
        st['stage_c4_ii_contract_d29z1058'] = 'b-round-339/current-task-c4-ii-draft.md (round 341); patches b-round-339/sketch/{source,tests,budgets}.patch.txt; perf b-round-339/perf-sketch-final-results; mutant b-round-339/perf-mutant-head-source/; probes b-round-339/probe/'
perf['execution_order_d29z1051'] = ['340 REGRESSION-ROUND-2026-11-05', '341 PERF-DRAG-PREVIEW c4-ii (or a fix-up first)', 'c5 (video)', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM']

for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'dispatched (D-29z1058): round 340, task current-task.md (scope additions SA-1..SA-20 named) | ' + x['status']
        x['round'] = 340

b['advisor_used_by_B'] = 'yes (round 339 -> 340 planning: advisor consulted after orientation, at the date boundary (pivot to REGRESSION), and before declaring done)'
b['current_task'] = 'current-task.md (round 340, D-29z1049..D-29z1058; REGRESSION-ROUND-2026-11-05 on 99a5912; claims b-round-339/claims-r340.sh; next c4-ii draft b-round-339/current-task-c4-ii-draft.md)'
b['version'] = 299
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=2, ensure_ascii=False)
marker.write_text('v299\n')
print('backlog v299 written')
