# B round 247 -> 248 planning: backlog edits. Run from the loop root: python3 -I b-round-247/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 247 -> 248 planning'
b['updated'] = '2026-10-29 (B round 247 -> 248 planning, D-29z419..D-29z425)'
b['current_task'] = ('current-task.md (round 248, D-29z419..D-29z425; SABA-B-11b stage 2b: a hidden grid pauses Snap incl. Alt; '
                     'StudioWorkspace.tsx + ArrangementLane.tsx snapGridSeconds + ArrangementTempoRow.tsx type + strings.ts; '
                     'GS10/HS1-HS5/HP1-HP2/GU12; doc 186 Completed; baseline da8c641, frozen 1098)')
dec = [
 ('D-29z419', 'Round 247 closed: C PASS (c-round-247.json, browserVerified and realVerified true, 15 rows passed, 0 bugs; purchased origin BLOCKED backend); gate 247 published da8c641 (gates/gate-round-247.json; review 9/10, no Critical). B-R245-UNDO-GROUP-FOCUS closed (C-GROUP-ORIGINS-247, C-PRECEDENCE-247, C-NO-STEAL-247, C-KEEP-247, C-VOLUME-REMOVAL-247). INFO-C247-GRIDMENU and INFO-C247-NESTED-COLLAPSE closed info. INFO-B247-GRIDMENU-UNVERIFIED closed by INFO-C247-GRIDMENU (Ctrl+Z with the grid menu open undoes nothing, both builds).'),
 ('D-29z420', 'SABA-B-11b stage 2b ruling: when gridLinesVisible(gridSeconds, pxPerSecond) is false (lines < 6 px apart: fixed divisions zoomed out, adaptive family end), every grid snap acts as Snap off (clip move/trim, library drop, ruler, playhead, empty lane, bars ruler, tempo row, markers, loop brace; edge and marker targets too, since they are reached only through a non-null step); keyboard steps fall back to their Snap-off 0.1 s steps; Alt never enables a hidden grid (it still enables a visible one, Live 6.10); the Snap toggle keeps the user choice (data-snap/aria-pressed on) and zooming in resumes snapping; titles (Snap + select) and data-snap-paused tell the state; the 6 user grid status writes get snapPausedNote when Snap is on and the result is hidden; zoom writes no status (D-29z357, L51). Rejected: coarsen to the finest visible step (undrawn lines or readout mismatch, invented mode), a status per zoom crossing (clobber). grid.ts unchanged (undefined grid -> resolveSnapStep null). Round-247 notes triage: A-R247-REVIEW-L1 (index -1 guard), A-R247-REVIEW-L2 (rescue does not check focus already moved) and A-R247-REVIEW-L3 merged with GATE247-S1 (untested previous-row fallback) and GATE247-S2 (doc 190 wording: React-DOM commit-order guarantee, not inference) -> deferred_low_polish; GATE247-S3 (effect order), GATE247-S4 (preventScroll/scrollIntoView) and S5 (blurGroupVolume) info. The reviewer option "narrow D-29z415 to next-only" is recorded on D-29z415 as a question for the polish pass, not scheduled.'),
 ('D-29z421', 'Architecture: gate 247 Architecture note (three no-deps focus layout effects whose precedence lives in declaration order; proposal useRowFocusRescue) recorded as signal GATE247-ARCH-ROW-FOCUS-RESCUE and added to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 4; requested from root at the feature boundary in b-round-247-checkpoint-request.md; non-blocking; wanted before SABA-B-10a.'),
 ('D-29z422', 'SABA-Q-11B-HIDDEN-SNAP (L44, awaiting_user, non-blocking): pause on hidden lines (shipped in round 248) vs (b) coarsen and draw the visible step, (c) keep edge/marker magnetism while the grid is paused, (d) a one-time status when zoom hides the lines; the seed/tempo statuses keep their text. Live 12 documents none of these (expert + docs-explorer 2026-10-29: no reference found).'),
 ('D-29z423', 'Round 248 = SABA-B-11b stage 2b, the final stage: doc 186 l.4 -> Completed (C round 248 PASS) (L28 multi-stage clause; the other In Progress hit, doc 176, ties to PERF-HARNESS-SHARED-LIB-b-ii). ABL-R-8 closes at the round-248 C PASS + gate. ARCH-CHECKPOINT-TEMPO-GRID re-ask (addendum 10: three derived snap values and withSnapPausedNote in StudioWorkspace) filed in b-round-247-checkpoint-request.md.'),
 ('D-29z424', 'Next: round 249 = REGRESSION at the first planning on/after 2026-10-30 (all scope_additions incl. C-UNDO-ORIGINS-246, C-GROUP-ORIGINS-247 and C-HIDDEN-SNAP-248 as named rows, L6); if that planning is still 2026-10-29, SABA-B-10a (with C-R235-02) first, with its Space-contract test list (policy). Then SABA-B-10b, 9, 11c; SABA-B-7 when Saba answers. A round-248 FAIL -> fix-up on the same grants first.'),
 ('D-29z425', 'B pre-check for round 248 (L23/L29): scratch /tmp/b248-scratch, precheck-scratch.diff (9 files), tsc rc 0, biome clean, covering 134 files 2073/2073; 10 mutant runs red as listed (b-round-247/mutants/logs/summary.txt); Chromium both viewports HEAD vs fix (head-probe2/3, head-probe-musical, scratch-probe, scratch-probe-musical .json): HEAD lands on hidden lines (11.1, 810, 970, 18.7, 8.563; nudge 0.25 steps), fix free (11.133, 811.328, 973.08, 18.717, 8.535; nudge 0.1 then next visible line 0.25); visible grids unchanged (11.1; 7.625 at 1440). Harness facts INFO-B248-RULER-DBLCLICK and INFO-B248-OFFSCREEN-RULER; invalid attempts kept.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})
of = b['open_findings']
ids = {e.get('id') for e in of}
for e in of:
    i = e.get('id')
    if i == 'B-R245-UNDO-GROUP-FOCUS' and not e['status'].startswith('closed'):
        e['status'] = ('closed (D-29z419): C round 247 PASS (C-GROUP-ORIGINS-247, C-PRECEDENCE-247, C-NO-STEAL-247, C-KEEP-247, '
                       'C-VOLUME-REMOVAL-247; browserVerified true), gate 247 published da8c641 | ' + e['status'])
    if i == 'INFO-B247-GRIDMENU-UNVERIFIED' and not e['status'].startswith('closed'):
        e['status'] = 'closed (D-29z419): INFO-C247-GRIDMENU (c-round-247.md section 6): with the menu open Ctrl+Z undoes nothing; same at HEAD | ' + e['status']
    if i == 'ABL-R-8' and 'D-29z423' not in e.get('status', ''):
        e['status'] = 'in_progress via SABA-B-11b stage 2b = round 248 (D-29z423): closes at the round-248 C PASS + gate | ' + e.get('status', '')
new = [
 {'id': 'INFO-C247-GRIDMENU', 'severity': 'info', 'origin': 'c-round-247.json info', 'title': 'grid menu open (focus on Medium), Ctrl+Z undoes nothing and the menu stays open; Escape returns focus to the group name; same at HEAD', 'status': 'closed info (D-29z419)', 'added': ADDED},
 {'id': 'INFO-C247-NESTED-COLLAPSE', 'severity': 'info', 'origin': 'c-round-247.json info', 'title': 'inner group name focused, outer group selected, U: the outer group folds and focus lands on its name with the ring', 'status': 'closed info (D-29z419)', 'added': ADDED},
 {'id': 'GATE247-S3', 'severity': 'info', 'origin': 'gates/round-247/review.md suggestion 3', 'title': 'three no-deps focus layout effects; precedence by declaration order; do not reorder without GF7', 'status': 'info (D-29z420); signal GATE247-ARCH-ROW-FOCUS-RESCUE (D-29z421)', 'added': ADDED},
 {'id': 'GATE247-S4', 'severity': 'info', 'origin': 'gates/round-247/review.md suggestion 4', 'title': 'focusRowSuccessor uses preventScroll; consider scrollIntoView({block: nearest}) if reused for other removals', 'status': 'info (D-29z420)', 'added': ADDED},
 {'id': 'GATE247-S5', 'severity': 'info', 'origin': 'gates/round-247/review.md suggestion 5', 'title': 'blurGroupVolume runs on removal for a missing group (pre-existing, doc 190 TODO)', 'status': 'info (D-29z420); same as INFO-B247-VOLUME-BLUR-ON-REMOVAL', 'added': ADDED},
 {'id': 'SABA-Q-11B-HIDDEN-SNAP', 'severity': 'info', 'origin': 'B round 247 -> 248 planning, L44 (deviation: Alt never enables a hidden grid; edge/marker magnetism pauses with the grid)', 'title': 'hidden grid lines: CZABA pauses Snap (Alt and edges included; titles and action statuses say paused; zoom in resumes). Or (b) snap to the finest visible step and draw it, (c) keep edge/marker magnetism, (d) a one-time status when zoom hides the lines? Live 12 documents none.', 'status': 'awaiting_user (D-29z422): non-blocking; round 248 ships the pause', 'added': ADDED},
 {'id': 'INFO-B248-RULER-DBLCLICK', 'severity': 'info', 'origin': 'b-round-247/head-probe2.json fixed01Hidden altClickSnapOff', 'title': 'two ruler clicks at the same x within ~1 s can count as a double-click (Fit); give each click its own x and >= 800 ms', 'status': 'harness fact (D-29z425)', 'added': ADDED},
 {'id': 'INFO-B248-OFFSCREEN-RULER', 'severity': 'info', 'origin': 'b-round-247/scratch-probe.json clickVisible', 'title': 'at high zoom the ruler box is wider than the window; a fraction of its width can be off-screen; clamp to the visible part', 'status': 'harness fact (D-29z425)', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)
dl = b['deferred_low_polish']
dids = {e.get('id') for e in dl}
lows = [
 {'id': 'A-R247-REVIEW-L1', 'severity': 'low', 'title': 'focusRowSuccessor: removedId not in order (index -1) makes every row a candidate; unreachable today; fix: if (index === -1) return;', 'source': 'a-round-247.md section 6', 'repro': 'unit: call the rescue with an id absent from the committed order', 'status': 'deferred_low_polish (D-29z420)', 'added': ADDED},
 {'id': 'A-R247-REVIEW-L2', 'severity': 'low', 'title': 'the group detach rescue does not check whether focus already moved in the same commit (child layout effects run first); fix: rescue only when activeElement is null, BODY or disconnected', 'source': 'a-round-247.md section 6', 'repro': 'a child rescue that moves focus in the same history commit as a group-row removal (none exists today)', 'status': 'deferred_low_polish (D-29z420)', 'added': ADDED},
 {'id': 'A-R247-REVIEW-L3', 'severity': 'low', 'title': 'the "else previous row" fallback of D-29z415 has no test (merged with GATE247-S1); alternative: narrow D-29z415 to next-only (question for the polish pass)', 'source': 'a-round-247.md section 6; gates/round-247/review.md suggestion 1 (GATE247-S1)', 'repro': 'remove a group that is the last row with no rendered successor; expect the previous row name button', 'status': 'deferred_low_polish (D-29z420); closes GATE247-S1 too', 'added': ADDED, 'merged': ['GATE247-S1']},
 {'id': 'GATE247-S2', 'severity': 'low', 'title': 'doc 190 calls ref-detach-before-removal an inference; it is a React-DOM commit-order guarantee in every browser', 'source': 'gates/round-247/review.md suggestion 2', 'repro': 'docs/implementation/2026/quarter-IV/190-group-undo-focus.md environment-facts section', 'status': 'deferred_low_polish (D-29z420)', 'added': ADDED},
]
for e in lows:
    if e['id'] not in dids:
        dl.append(e)
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        add = ('C-HIDDEN-SNAP-248 (if round 248 done): fixed 0.1 s at 40 px/s with Snap on, a ruler click lands on the free time and data-snap-paused is true; '
               'at 60 px/s the same click snaps; both viewports (D-29z424)')
        if add not in r['scope_additions']:
            r['scope_additions'].append(add)
sig = {'id': 'GATE247-ARCH-ROW-FOCUS-RESCUE', 'origin': 'gates/round-247/review.md Architecture note (signals 2+4); a-round-247.md section 6', 'text': 'StudioWorkspace holds three no-deps focus layout effects (detach rescue, pendingRowFocusRef, library rail) with precedence by declaration order; proposal useRowFocusRescue with written precedence (acceptance GF1-GF7, UC4 F3, UC9, UM9)', 'status': 'signal (D-29z421); not scheduled; ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 4 (b-round-247-checkpoint-request.md)', 'added': ADDED}
if sig['id'] not in {e.get('id') for e in b['architecture_signals']}:
    b['architecture_signals'].append(sig)
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS':
        if 'D-29z421' not in r['question']:
            r['question'] += '; 4 addendum 2 (D-29z421, b-round-247-checkpoint-request.md section 2): gate-247 note, three no-deps focus layout effects; keep or useRowFocusRescue, before or after SABA-B-10a'
        if 'GATE247-ARCH-ROW-FOCUS-RESCUE' not in r['signals']:
            r['signals'].append('GATE247-ARCH-ROW-FOCUS-RESCUE')
        r['status'] = 'requested from root at the SABA-B-11b boundary (D-29z421, b-round-247-checkpoint-request.md); non-blocking; wanted before SABA-B-10a | ' + r['status']
    if r.get('id') == 'ARCH-CHECKPOINT-TEMPO-GRID' and 'D-29z423' not in r['status']:
        r['status'] = ('addendum 10 (D-29z423, b-round-247-checkpoint-request.md section 1): stage 2b adds snapGridSeconds, activeSnapSeconds, '
                       'gridLinesShown move and withSnapPausedNote; re-ask after 2b filed now; non-blocking; wanted before SABA-B-10a | ' + r['status'])
q = b['post_current_stage_queue']
for e in q:
    if e.get('id') == 'SABA-B-9-10-11-TRANSPORT-GRID':
        if 'D-29z424' not in e['status']:
            e['status'] = ('in_progress (D-29z424): round 247 B-R245-UNDO-GROUP-FOCUS done (C PASS browserVerified, published da8c641); '
                           'round 248 = SABA-B-11b stage 2b (final 11b stage); then REGRESSION (on/after 2026-10-30), else SABA-B-10a | ' + e['status'])
        for s in e['stages']:
            if s.get('id') == 'SABA-B-11b' and 'D-29z423' not in s['status']:
                s['status'] = ('in_progress (D-29z423): stage 1 + FIX-1 done (04c2a5b), stage 2a done (7e5b23c); stage 2b dispatched round 248 '
                               '(D-29z420: a hidden grid pauses Snap incl. Alt); done at the round-248 C PASS + gate | ' + s['status'])
                s['decisions'].append('D-29z420: stage 2b ruling (hidden lines pause Snap; Alt never enables a hidden grid; titles, data-snap-paused and 6 action statuses tell it; zoom silent); D-29z422 SABA-Q-11B-HIDDEN-SNAP')
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']), len(b['open_findings']), len(b['decisions_log_b']))
