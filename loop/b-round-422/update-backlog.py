# B round 422 -> 423 backlog update (v398 -> v399). Run once from the loop root: python3 -I b-round-422/update-backlog.py
import json, os, sys
DONE = 'b-round-422/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 398:
    sys.exit(f"expected version 398, found {b.get('version')}")
BY = '2026-11-09 B round 422 -> 423 planning'
b['version'] = 399
b['updated'] = '2026-11-09 (B round 422 -> 423 planning: round 422 accepted and published 875ff37; REGRESSION-2026-11-10 part 1 dispatched as round 423)'
b['current_task'] = 'Round 423: REGRESSION-2026-11-10 part 1 (C-only browser sweep of the items finished in rounds 391-422, scope additions SA-1..SA-6 named; A changes nothing) (current-task.md)'
b['advisor_used_by_B'] = 'round 422 -> 423 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1475', 'date': '2026-11-09', 'by': BY,
     'decision': 'Round 422 accepted from C evidence only: C PASS (c-round-422.json: 8 rows passed, 0 bugs, browserVerified/realVerified true; L57 OK in b-round-422/l57-check-c422.txt; fake-bearer auth path BLOCKED backend-unavailable, kept as open backend evidence); gate 422 published 875ff37 on both remotes (verify 264 files / 3957 tests). SYS-2 stage 1 done; GATE107-S1-MARKER-FLAG-HELD-ENTER closes (C rows 3 MU-FLAG->HE6 and 4 FLAG cells ALL OK). A-R107-SWEEP-HELD-ENTER-TOOLBAR stays open for stage 2 (transport part HE1-HE5 done). New Lows: A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER and A-R422-REVIEW-L2-HE4-HE5-PREVENTED-ONLY (confirmedBy gate 422 suggestion 3) -> deferred_low_polish. Gate 422 suggestion 1 (flag guard before the target check) is TL-R422-01 (accepted, archived) and gets no new id (L7). Gate 422 Architecture note + suggestion 2 + A-422 For B (fold Export inline guard) -> one signal SIG-R422-REPEAT-SAFE-BUTTON-PROPS attached to SYS-2 stage 2, not a scheduled task. Baseline for round 423 = 875ff37.'},
    {'id': 'D-29z1476', 'date': '2026-11-09', 'by': BY,
     'decision': 'REGRESSION-2026-11-10 dispatched as round 423 at this planning. Clock at planning: 2026-11-09T22:5x UTC, so regression-last (2026-11-07) is 2 days old; the 3-day trigger is reached at 00:00 UTC, about an hour later. A and C run round 423 on 2026-11-10 in any case; the 3-day rule is a floor, not a prohibition (precedent D-29z1311, round 389 opened one day early), D-29z1472/D-29z1474 already placed the regression at 423, and a SYS-2 stage 2 dispatch (sketch, mutants, full-suite pre-check, browser probe, review) could not be built and verified before midnight anyway. regression-last.json is updated only when the whole regression closes.'},
    {'id': 'D-29z1477', 'date': '2026-11-09', 'by': BY,
     'decision': 'REGRESSION-2026-11-10 split in two parts, as REGRESSION-2026-11-08: part 1 = round 423, one short browser check per item finished in rounds 391-422 (rows R423-*), every scope addition named SA-1..SA-6 (L6), plus RR-PERF, PERF-LIB, RG-SMOKE and the auth guard; part 2 = round 424 on the same baseline: the round-390 template (everything finished up to round 390, including its carried and parked rows). New recipe R423-MARKER-SEEK run by B at the baseline (b-round-422/probe/head/marker-seek*.json: marker 00:09.000, Next after Home = 00:09.000; control without a marker = 00:16.000). Outcome fixed in advance in current-task.md section 7: Critical/High -> fix-up round 424 then part 2; cloud-reproducible Medium -> fix-up (<= 3 related bugs) then part 2; Lows -> deferred_low_polish; PARTIAL -> continue part 1. After part 2 closes: regression-last updated; then SYS-2 stage 2a, unless Saba has answered AGREE-STEM-LANES (STEM-LANES first).'},
    {'id': 'D-29z1478', 'date': '2026-11-09', 'by': BY,
     'decision': 'SYS-2 stage 2 sizing (record only, not dispatched): the remaining scan sites (b-round-421/data/button-guard-scan.txt, 62 buttons, 16 guarded + the 6 stage-1 sites) do not fit one round. Split by owner, nothing dropped: stage 2a = mixer and lane controls (ArrangementLane Mute/Solo/fold/active-track/pan reset/video import, ArrangementGroupHeader Mute/Solo/name editor, ArrangementMaster Mute/peak, ArrangementTempoRow metronome) and the shared repeat-safe button props decision (SIG-R422-REPEAT-SAFE-BUTTON-PROPS: one helper vs per-site handler, including the onKeyDown-vs-spread order of A-R422-REVIEW-L1 and Export inline guard fold); stage 2b = library (notice, folder, entries, expand/collapse/clear), video dock (return, expand, close), detail panel, grid menu items, marker menu, export dialog cancel/secondary, shortcut sheet close, narrow screen, workspace footer buttons, held Escape on the marker editor. Each site still gets a ruling (guard or idempotent exclusion) in its task; Fit stays excluded (TH5).'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 422 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1475): C PASS c-round-422.json; gate 422 published 875ff37'; ok += 1
if ok != 1:
    sys.exit('round 422 entry not found')
b['rounds'].append({'round': 423, 'task': 'current-task.md', 'decision': 'D-29z1476, D-29z1477', 'type': 'REGRESSION-2026-11-10 part 1 (C-only browser sweep; A no change)', 'status': 'dispatched',
                    'note': 'baseline 875ff37 clean; tree manifest b-round-422/r423-tree-sha256.txt (1321); claims b-round-422/claims-423.sh; marker-seek baseline b-round-422/probe/head/'})
n = 0
for t in b['systemic_tasks']:
    if t.get('id') == 'SYS-2':
        t['status'] = 'in_progress (D-29z1475, D-29z1478): stage 1 done (C round 422 PASS, gate 422 published 875ff37); stage 2a (mixer/lane controls + shared repeat-safe props decision) and stage 2b (library, dock, menus, dialogs, marker editor Escape) queued after REGRESSION-2026-11-10 | ' + t['status']
        t['stages_d29z1478'] = {'stage1': 'done round 422 (HE1-HE6, doc 272)', 'stage2a': 'ArrangementLane, ArrangementGroupHeader, ArrangementMaster, ArrangementTempoRow sites + SIG-R422-REPEAT-SAFE-BUTTON-PROPS decision + A-R422-REVIEW-L1', 'stage2b': 'ArrangementLibrary, ArrangementVideoDock, ArrangementDetailPanel, ArrangementGridMenu, ArrangementMarkerMenu, ArrangementExportDialog, ArrangementShortcutSheet, StudioNarrowScreen, StudioWorkspace footer buttons, marker editor held Escape', 'fit': 'excluded (TH5 lock, idempotent)'}
        n += 1
if n != 1:
    sys.exit('SYS-2 not found')
seen = set()
for f in b['deferred_low_polish']:
    if f.get('id') == 'GATE107-S1-MARKER-FLAG-HELD-ENTER':
        f['status'] = 'closed (D-29z1475): C round 422 PASS (rows 3 MU-FLAG->HE6, 4 FLAG cells ALL OK), gate 422 published 875ff37 | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'in_progress (D-29z1475, D-29z1478): transport part done in round 422 (HE1-HE5); rest in SYS-2 stage 2a/2b | ' + f['status']; seen.add(f['id'])
if seen != {'GATE107-S1-MARKER-FLAG-HELD-ENTER', 'A-R107-SWEEP-HELD-ENTER-TOOLBAR'}:
    sys.exit('missing ids')
b['deferred_low_polish'].append({'id': 'A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1478: rides SYS-2 stage 2a)',
    'title': 'on Split, Loop and Zoom to range the onKeyDown guard precedes {...softDisabledButtonProps(...)}; safe today (the spread has only aria-disabled and onMouseDown) but a future onKeyDown in SoftDisabledButtonProps would silently override the guard',
    'evidence': 'a-round-422.md Reviewer findings (A6); gate 422 review Checks: Event ordering', 'repro': 'read ArrangementTransport.tsx Split/Loop/Zoom to range JSX and studio-soft-disabled.ts SoftDisabledButtonProps', 'added': BY})
b['deferred_low_polish'].append({'id': 'A-R422-REVIEW-L2-HE4-HE5-PREVENTED-ONLY', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish',
    'title': 'HE4 (Split) and HE5 (Zoom to range) observe a repeat only through the prevented keydown, because a repeated Split at the same insert marker and a repeated zoom are idempotent; mutants MU-SPLIT/MU-ZOOMRANGE still turn them red',
    'evidence': 'a-round-422.md Reviewer findings; doc 272', 'confirmedBy': ['gate 422 review suggestion 3 (gates/round-422/review.md)'], 'repro': 'read transport-centre-ui.test.tsx HE4/HE5', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R422-REPEAT-SAFE-BUTTON-PROPS', 'added': BY, 'decision': 'D-29z1475', 'source': 'gates/round-422/review.md Architecture note + suggestion 2; a-round-422.md For B',
    'signal': 'repeated-Enter handling is spread over several handlers (preventRepeatedEnterKeyDown in ArrangementTransport.tsx, the inline flag guard in ArrangementMarkerRow.tsx, the Export inline guard); proposal: one exported repeat-safe button-props helper used by every A-R107 sweep site, TH5 Fit exception kept',
    'status': 'attached to SYS-2 stage 2a (decided inside that task, one owner, behaviour-preserving rows); not a separate task'})
for rr in b['regression_rounds']:
    if rr.get('id') == 'REGRESSION-2026-11-10':
        rr['status'] = 'dispatched part 1 (D-29z1476, D-29z1477): round 423 (rounds 391-422, SA-1..SA-6); part 2 = round 424 (round-390 template); regression-last updated only when part 2 closes | ' + rr['status']
        rr['round'] = 423
        rr['scope_named_d29z1477'] = {'SA-1': 'REG-14BII-EXPORT-UNMOUNTED -> R423-SCALE-EXPORT', 'SA-2': 'PERF-14b-ii frames200 + pin-blur-group -> R423-SCALE', 'SA-3': 'PERF-14c-i peaks-fallback failing mode -> R423-PEAKS-FALLBACK', 'SA-4': 'export WAV samples/duration and audio graph output -> R423-SCALE-EXPORT + R423-JOURNEY', 'SA-5': 'fake-bearer BLOCKED -> G423-AUTH', 'SA-6': 'INFO-C404-MARKER-SEEK-RECIPE -> R423-MARKER-SEEK', 'SA-7': 'planning_note_d29z1470 (every item done 402-422) -> rows R423-*'}
        ok += 1
if ok != 2:
    sys.exit('regression entry not found')
c = 0
for f in b['open_findings']:
    if f.get('id') == 'INFO-C404-MARKER-SEEK-RECIPE':
        f['status'] = 'in round 423 (D-29z1477): row R423-MARKER-SEEK; baseline b-round-422/probe/head/marker-seek.json | ' + f['status']; c += 1
if c != 1:
    sys.exit('INFO-C404 not found')
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('ok v399')
