# B round 346 -> 347 planning: backlog.json update (close-out of round 346 + dispatch of round 347).
# Run from the loop root: python3 -I b-round-346/update-backlog.py
import json, pathlib, shutil, sys

P = pathlib.Path('backlog.json')
BK = pathlib.Path('b-round-346/backlog-before-347.json')
DONE = pathlib.Path('b-round-346/update-backlog.done')
if DONE.exists():
    sys.exit('already applied')
if not BK.exists():
    shutil.copyfile(P, BK)
b = json.loads(P.read_text())
assert b['version'] == 307, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 346 -> 347 planning'

def dlog(i, text):
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})

def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)

dlog('D-29z1095', 'Round 346 closed as PASS from independent C evidence: c-round-346.json taskStatus PASS, browserVerified/realVerified true, 11 rows passed (CLAIMS, SOURCE-SCOPE, READ, UNIT 66/66 + 67/67, MUTANT x2 red, NAMES fade [6x4] trim [18x4] move [15,15,89,15] click [88,0], VISUAL outerHTML identical to HEAD at 1440x900 and 1280x720, PERF 60/60 asserted 0 NEW none higher, PERF-LIB 40/40, G346-AUTH, DOCS), 0 bugs, 0 blocked. Gate 346 published 4895732 on both remotes (gates/gate-round-346.json); baseline for round 347 is 4895732, clean tree. PERF-DRAG-PREVIEW stage c6-i -> done. New perf oracle c-round-346/perf-results/latest-interactions.json (trim 17.7, move 18.467, fade 5.9 per move).')
dlog('D-29z1096', 'Round-346 notes routed. GATE346-L1 = A-R346-REVIEW-L3 (DP64 waits for the import with a fixed 5-tick microtask loop) -> fixed in round 347 with waitFor (round owns drag-preview-render.test.tsx; cheap; 2026-10-23 rule). GATE346-L2 (DP63 positive control depends on lucide displayName) -> info, no action (fails loudly). GATE346-INFO3 (doc 232 l.4 still "C round 346 pending") -> fixed in round 347 (round owns doc 232). Gate Architecture note -> architecture_signals ARCH-R346-DP-HARNESS-EXTRACT with its trigger (2+ more describe blocks in drag-preview-render.test.tsx); not scheduled. A deviations accepted: DP63 mounts PROJECT_END_CLIP (as DP51-DP60), DP64 seeks committedStart + 1. B task-text error recorded: PERF-LIB is 40/40 (report 34 + zoom-probe 6), not 34. Durations 455027 (C) and 463379 (A) ms -> evidence on ROOT-REQ-PERF-TIMEOUT. C NAMES note (click 88 and the crossing commit carry Library/MarkerRow chevrons) -> PERF-CAND-CHROME-ICONS (click and crossing commits only; not in the <= 15/move target).')
dlog('D-29z1097', 'c6-ii shape: (b) one ref-based useStableHandler hook (app/hooks/useStableHandler.ts, latest handler written in useIsomorphicLayoutEffect, stable useCallback([]) wrapper) + memo on ArrangementMixFader and ArrangementDetailClipGain (inner forwardRef keeps the displayName, so render counters and the names probe still see it). Rejected: (a) per-site useCallback with deps (deps such as isClipGainFaderEnabled and displayedClipGainText change on commits and silently undo the memo; tech-lead); (c) extracting a memoised lane header (= checkpoint question 3, structural; not taken unilaterally). renderPanReadout stays a dep-ful useCallback because it runs during render. Both halves ship in one round (tech-lead: approve, each half has its own mutants and rows); acceptance is reported per half. Evidence: B sketch b-round-346/sketch/source.patch.txt (apply-source.py + apply-source-clipgain.py); names probe on dev sketch fade 6 -> 4, trim 18 -> 15, move 15 -> 12 (crossing 89 -> 82), click 88 -> 83 (b-round-346/names-sketch-v2.json); interactions perf on the sketch build: trim 17.7 -> 14.75, move 18.467 -> 15.317, fade 5.9 -> 3.933 per move, 0 rows higher, 0 NEW, 60/60 asserted pass (b-round-346/sketch-perf-rowcmp-vs-c346.txt); covering 104 files 1670/1670 and final 36 files 720/720 on the sketch. Consult changes adopted: no JSDoc in the hook (contract goes to doc 232); storedClipGainsDb keyed by JSON (no [] -> [0] round trip). Item target <= 15/move is now met by trim (14.75), move (15.317 incl. the crossing commit; steady 12) is recorded, not yet asserted.')
dlog('D-29z1098', 'Not in c6-ii, recorded: PERF-CAND-MASTER-GROUP-FADER-PROPS (ArrangementMaster.tsx and ArrangementGroupHeader.tsx pass inline onChange/onDoubleClick to the now-memoised MixFader, so Master still renders in the project-end crossing commit; performance-optimizer, about six lines) and the question whether ArrangementMaster should re-render on a project-end change at all -> after the conversions. Conversions stay a separate next stage (D-29z1092 rule: ceil(value) budgets, gross + fine + flushSync release mutants); performance-optimizer suggested converting trim now at 17, kept for the conversions round so all three families share one mutant set. Known limit: reasonNode is new JSX in the no-selection state, so the ClipGain memo does not hold there (no drag happens in that state). useRelativeFaderDrag writes optionsRef in a passive effect (looser than the new hook) -> architecture_signals ARCH-R346-FADER-DRAG-OPTIONS-EFFECT, not scheduled. ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE: no answer artifact found; still due with root, non-blocking; c6-ii is non-structural so a checkpoint answer to question 3 can still supersede it.')
dlog('D-29z1099', 'Round 347 dispatched: PERF-DRAG-PREVIEW stage c6-ii (current-task.md; patch b-round-346/sketch/source.patch.txt; claims b-round-346/claims-347.sh). Files: app/hooks/useStableHandler.ts (new), app/hooks/__tests__/useStableHandler.test.ts (new), ArrangementMixFader.tsx, ArrangementLane.tsx, ArrangementDetailPanel.tsx, drag-preview-render.test.tsx (DP65 + DP64 waitFor), doc 232. Interactions rows stay record (conversions next); C also runs studio-lab.perf.spec.ts for the fader rows (SABA-B-5 path). Reference-first, product-designer, screen budget and YouTube request do not apply (performance round, DOM identical). REGRESSION not due (next on/after 2026-11-08); RETRO about round 351. Advisor consulted once after orientation (available).')

b['rounds'][-1]['status'] = 'c_pass_published (D-29z1095): C round 346 PASS browserVerified=true realVerified=true; gate 346 published 4895732'
b['rounds'].append({'round': 347, 'task': 'current-task.md', 'decision': 'D-29z1095..D-29z1099', 'type': 'PERF-DRAG-PREVIEW stage c6-ii (ArrangementMixFader + ArrangementDetailClipGain memo with useStableHandler; DP65; DP64 waitFor; rows record)', 'status': 'dispatched', 'note': 'baseline 4895732 clean; patch b-round-346/sketch/source.patch.txt; claims b-round-346/claims-347.sh; names probe b-round-346/names-probe-v2.mjs', 'added': ADDED})

q = b['post_current_stage_queue']
sp = find(q, 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1099): c6-i done (round 346, 4895732); round 347 = PERF-DRAG-PREVIEW c6-ii | ' + sp['status']
sp['execution_order_d29z1099'] = ['347 PERF-DRAG-PREVIEW c6-ii (MixFader + DetailClipGain memo via useStableHandler; GATE346-L1 DP64 waitFor; doc 232 status; rows record)', 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect; due, non-blocking)', 'conversions (trim/move/fade rows -> assert at ceil(value); gross, fine and flushSync release mutants; oracle = C round 347 run)', 'PERF-CAND-VIDEO-TRIM-FADE-ROWS (record)', 'PERF-CAND-MASTER-GROUP-FADER-PROPS', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM', 'next REGRESSION due on or after 2026-11-08', 'RETRO due about round 351']
dp = find(sp['stages'], 'PERF-DRAG-PREVIEW')
dp['status'] = 'in_progress (D-29z1099): stages a .. c6-i done (c6-i C round 346 PASS, 4895732; trim 21.633 -> 17.7, move 22.8 -> 18.467, fade 9.833 -> 5.9 per move); round 347 = c6-ii | ' + dp['status']
dp['stage_c6_ii_contract_d29z1099'] = {'task': 'current-task.md round 347', 'patch': 'b-round-346/sketch/source.patch.txt', 'shape': 'D-29z1097 option (b) useStableHandler + memo', 'expected_names': 'fade 4, trim 15, move 12 (crossing 82), click 83 per commit', 'expected_perf': 'trim 14.75, move 15.317, fade 3.933 per move (B sketch build run)', 'rows': 'record (conversions next)'}
dp['later_candidates_d29z1098'] = ['PERF-CAND-MASTER-GROUP-FADER-PROPS: ArrangementMaster.tsx and ArrangementGroupHeader.tsx inline onChange/onDoubleClick defeat the MixFader memo; Master renders in the project-end crossing commit (performance-optimizer, round 347 planning)', 'PERF-CAND-CHROME-ICONS: click (83 after c6-ii) and the crossing commit still carry ArrangementLibrary/ArrangementMarkerRow lucide icons (C round 346 NAMES note)', 'question: should ArrangementMaster re-render on a project-end change at all (check its selector first)']

acr = find(b['architecture_checkpoint_requests'], 'ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE')
acr['status'] = 'due (D-29z1098): no answer artifact at round 347 planning; non-blocking; c6-ii takes the non-structural option so question 3 can supersede it | ' + acr['status']

for sig in [
    {'id': 'ARCH-R346-DP-HARNESS-EXTRACT', 'origin': 'gate 346 review Architecture note (signal 3)', 'note': 'drag-preview-render.test.tsx (~2000 lines) changes every round; if 2-3 more describe blocks are added, consider extracting renderLog, fake audio and mountPreviewWorkspace into a shared helper; criterion: DP1..DP65 pass unchanged, one renderLog instance; value medium', 'status': 'signal (D-29z1096); trigger = two more describe blocks after round 347', 'added': ADDED},
    {'id': 'ARCH-R346-FADER-DRAG-OPTIONS-EFFECT', 'origin': 'tech-lead consult, round 347 planning', 'note': 'useRelativeFaderDrag writes optionsRef in a passive useEffect (small stale window); useStableHandler uses a layout effect; align later', 'status': 'signal (D-29z1098); not scheduled', 'added': ADDED},
]:
    b['architecture_signals'].append(sig)

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'open; evidence added at round 346 -> 347 planning (D-29z1096): 455027 ms (C round 346), 463379 ms (A round 346), 468516 ms (B sketch run) above the L31 bound 450000 ms | ' + rr['status']

for f in [
    {'id': 'GATE346-L1', 'severity': 'low', 'origin': 'gate 346 review (= A-R346-REVIEW-L3)', 'title': 'DP64 waits for the video import with a fixed 5-tick microtask loop', 'evidence': 'gates/round-346/review.md item 1; a-round-346.md Open Low #3', 'status': 'scheduled round 347 (D-29z1096): waitFor on the imported video clip'},
    {'id': 'A-R346-REVIEW-L3', 'severity': 'low', 'origin': 'A round 346 code-reviewer', 'title': 'same as GATE346-L1', 'evidence': 'a-round-346.md', 'status': 'duplicate of GATE346-L1 (D-29z1096)'},
    {'id': 'GATE346-L2', 'severity': 'info', 'origin': 'gate 346 review', 'title': 'DP63 positive control depends on lucide displayName; a lucide rename fails loudly', 'evidence': 'gates/round-346/review.md item 2', 'status': 'closed_info (D-29z1096): no action'},
    {'id': 'GATE346-INFO3', 'severity': 'info', 'origin': 'gate 346 review', 'title': 'doc 232 l.4 still says C round 346 pending', 'evidence': 'gates/round-346/review.md item 3', 'status': 'scheduled round 347 (D-29z1096)'},
    {'id': 'C-R346-PERF-DURATION', 'severity': 'low', 'origin': 'C round 346', 'title': 'interactions perf spec 455027 ms > 450000 (L31)', 'evidence': 'c-round-346.json notes', 'status': 'closed into ROOT-REQ-PERF-TIMEOUT (D-29z1096)'},
]:
    f['added'] = ADDED
    b['open_findings'].append(f)

b['current_task'] = 'current-task.md (round 347: PERF-DRAG-PREVIEW c6-ii)'
b['version'] = 308
b['updated'] = ADDED
P.write_text(json.dumps(b, ensure_ascii=False, indent=1) + '\n')
DONE.write_text('ok\n')
print('ok v308')
