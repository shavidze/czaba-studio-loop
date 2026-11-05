# B round 341 -> 342 planning: backlog v300 -> v301. Once-only (marker b-round-341/update-backlog.done). Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-341/update-backlog.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-341/backlog-before-342.json').exists():
    sys.exit('backup missing')
b = json.load(open('backlog.json'))
assert b['version'] == 300, b['version']
DATE = '2026-11-05'
ADDED = '2026-11-05 B round 341 -> 342 planning'
def dec(i, text):
    assert all(d.get('id') != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': text})
dec('D-29z1067', 'Round 341 (REGRESSION-ROUND-2026-11-05 continued) closed from C evidence: c-round-341.json taskStatus PASS, browserVerified/realVerified false, 0 failed, 0 Medium+, 2 Low (C-R341-01, C-R341-02); PASS: SOURCE-SCOPE, G341-AUTH (403 with mock), R340 WAVEFORM/DETAIL-TEXT/SHOWN-READERS/PROJECT-END/FADE-STATUS+DRAG-A (D-ROWS 0 DIFF, WAV sha equal)/SELECTION/RANGE/PERF3D/NAME, RR-PERF (rc 0, 3/3, rowcmp 0 DIFF vs c-round-339), RG-SMOKE, RG-01..24 + RG-T1..T4B both viewports, R301 MENU/LINK/LOAF/NAMES/WORKER/DISABLED/STATUS-LIFETIME/REL-SNAP/TAPER/ALTGR/CONTRACTS/HIDDEN-GRID-BG/MASTER/NARROW/PERF3, RP-NOBPM-RULER; partial: OVERVIEW-METER, PEAKS, RESCHEDULE, JOURNEY, FONTS, WORKER-R2, RV/RR/RS. stopSignal none (C ended with runnable rows unrun). Gate 341 skipped (no real changes); baseline stays 99a5912. Classified by the round-341 outcome table (D-29z1064) as "a browser row that could run here did not run", NOT as "every row has a result": regression-last.json NOT updated; the remainder runs as round 342; c4-ii moves to round 343. No item changes status; nothing becomes mzadaa.')
dec('D-29z1068', 'B rulings on the round-341 notRun/inconclusive rows (terminal; not re-run): (1) R340-OVERVIEW-METER sub-check "press L" is VOID: B spec defect in tasks/round-340.md l.101 - SA-14 is RR-STRIP\'s tag (tasks/round-258.md l.189) and Studio has no bare L binding (app/lib/arrangement/shortcuts.ts: loop is Ctrl+L); the intended invariant (overview unchanged by a fade preview, moved by a move preview) is covered by the 23-sample OVERVIEW PASS. (2) R340-FONTS FONT-PIXEL retired as a regression row: the round-317 oracle predates later UI changes; c-round-341/out/fonts screenshots on 99a5912 become the baseline for the next regression. "/s/" in the row was B wording; the build serves woff2 from /assets/ as in round 317 (INFO-C341-SLASH-S accepted, no finding). (3) R340-RESCHEDULE NO-CHANGE posctl: the c-round-308 oracle is valid=false, so the row cannot decide; round 342 records one fresh run on HEAD as the new oracle (record only). (4) RR-OSS full licence suite is a gate row (gates/round-N/verify.log), not a C gap. Signal B-R341-SPEC-UNDEFINED-ROW (RETRO input, same class as B-R340-SPEC-WORDING).')
dec('D-29z1069', 'C-R341-01 = reproduction of C-R318-06 at 1280x720 without reload (c-round-341/out/b2/rows-n-1280x720.json SPLIT_range/SPLIT_do vs rows-n-1440x900.json and rows-n-1280x720-reload.json): selection overlay lands on the Stems lane while the clip is on Music; Ctrl+E refuses; no clip or history entry changes. Severity confirmed Low (no data change, refusal is announced). Per the 2026-10-23 bug gate it moves to deferred_low_polish with the new evidence; root cause undetermined (lead: lane the selection ends on after the all-tracks toggle + Esc). No separate scheduling.')
dec('D-29z1070', 'C-R341-02 (Low, regression yes since PERF-7 rounds 316/317; origin B spec gap: PERF-7 rows measured direct loads only): after "Try it in the Studio" from a product page, Chromium warns that the instrument-sans and ibm-plex-mono woff2 preloads were not used within a few seconds (dev and prod build, both viewports; direct /studio-lab load has none). -> deferred_low_polish. Signal PERF7-CLIENT-NAV-PRELOAD (wasted preload bytes on client navigation; candidate for a PERF task, not scheduled).')
dec('D-29z1071', 'INFO-C341-DELETE-MISTAKE (C-process, data loss of untracked evidence): in round 341 C ran find -delete for *.wav > 100 KB in the loop root after a failed cd, deleting untracked evidence WAVs across older round folders (e.g. c-round-301/t258/out RG-13/18/20/T3A); the tracked loop/media/tone-2s.wav was restored with git checkout; store/ untouched (SOURCE-SCOPE end clean). Not an app bug. Rule from now on: any oracle that compares WAV bytes (not a sha recorded in JSON) regenerates its reference first; round 342 rows read no WAV. lessons.md L60 added. Root note: the deleted files cannot be restored from the loop repo; B does not delete or restore anything.')
dec('D-29z1072', 'Round-341 observations recorded, no finding: INFO-C341-EXPORT-ESC-FLAKE (1/5 c320 1440 runs left the export dialog open after Esc; export-esc probe 5/5 closes; watch item), INFO-C341-STORE-WEIGHT (/store also loads Inter 700, same woff2 bytes), INFO-C341-R252 (followPause@1280 now passes, oracle false), INFO-C341-LATCH-SR (transient over-announcement captured, oracle []). C deviated from L59 again by ending with runnable rows (WK-GUARD/HEAD-CONTROL, PRICE, RG-22 narrow, rp301, RS 1280) unrun; the round-342 task lists every row with script, redirect and oracle so "no replayable script" is not an available status.')
dec('D-29z1073', 'lessons.md: L60 added (C: destructive commands only with absolute paths inside c-round-N; never find -delete or rm -r from a relative cd); L18 and L19 merged into one line to stay at 60 lines.')
dec('D-29z1074', 'This task: round 342 = REGRESSION-ROUND-2026-11-05 part 3 (remainder) on 99a5912, A no change. Closed row list: R342-WK (WK-GUARD-PROXY + WK-HEAD-CONTROL via c-round-311/run-wk.sh), R342-PRICE (R301-PRICE via c-round-301/tools/price + mock-c288 swap, last store row), R342-RS-1280 (s186 RS-1A..1D at 1280 with the gift-card step guarded as a lookup, plus RS-2A/RS-4B/RS-HIDDEN/RS-LM mapped per c-round-301.md l.165-174), R342-RG22-NARROW (rg22n.cjs redirected), R342-RP (rp301.cjs for RP-MENU-SHEET/RP-LINK-NATIVE-MENU/RP-LINK-DRAG; RP-C301-01, RP-FOLD-SELECTION, RP-SAME-TEXT-RACE, RP-GATE328-S1, RP-C331-01 built from tasks/round-340.md l.121-127), R342-POSCTL (record a fresh oracle), SOURCE-SCOPE and G342-AUTH. Outcome fixed: every row has a result and no Medium+ -> regression-last {C date, round 342, rounds 340-342} and round 343 = PERF-DRAG-PREVIEW c4-ii (b-round-339 package; git apply --check 3/3 OK on 99a5912 at this planning); Medium+ -> fix-up first. c4-ii patches re-checked: source/tests/budgets apply cleanly on 99a5912.')
for r in b['rounds']:
    if r.get('round') == 341:
        r['status'] = 'closed incomplete (D-29z1067): C PASS on all run rows, 2 Low, browserVerified false (runnable rows unrun), gate skipped (no change); remainder in round 342 | ' + r['status']
b['rounds'].append({'round': 342, 'task': 'current-task.md', 'decision': 'D-29z1067..D-29z1074', 'type': 'REGRESSION-ROUND-2026-11-05 part 3: closed remainder list (WK, PRICE, RS-1280, RG22-NARROW, parked RP rows, POSCTL record, auth)', 'status': 'dispatched', 'note': 'baseline 99a5912 clean; frozen tree b-round-339/r340-tree-sha256.txt; claims b-round-339/claims-r340.sh; next = c4-ii (round 343) or a fix-up', 'added': ADDED})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-ROUND-2026-11-05':
        x['status'] = 'in_progress (D-29z1067): round 341 ran the bulk (0 Medium+, 2 Low), browserVerified false; remainder in round 342 (D-29z1074); regression-last not updated | ' + x['status']
        x['rounds'] = [340, 341, 342]
perf = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
perf['status'] = 'in_progress (D-29z1074): regression remainder round 342; c4-ii round 343 (or a fix-up first) | ' + perf['status']
perf['execution_order_d29z1074'] = ['340-341 REGRESSION-ROUND-2026-11-05 (bulk done, 0 Medium+)', '342 REGRESSION remainder', '343 PERF-DRAG-PREVIEW c4-ii (or a fix-up first)', 'c5 (video)', 'conversions', 'PERF-9..15', 'SYS-R2-FAKE-FIDELITY', 'SYS-CLOCK-DETERMINISM']
for st in perf['stages']:
    if st.get('id') == 'PERF-DRAG-PREVIEW':
        st['status'] = 'in_progress (D-29z1074): c4-ii dispatch moves to round 343; patches 3/3 apply on 99a5912 | ' + st['status']
# C-R318-06 -> deferred_low_polish with the C-R341-01 evidence
keep = []
moved = None
for f in b['open_findings']:
    if f.get('id') == 'C-R318-06':
        moved = f
    else:
        keep.append(f)
assert moved is not None
b['open_findings'] = keep
moved['severity'] = 'low'
moved['status'] = 'deferred_low_polish (D-29z1069): reproduced as C-R341-01 at 1280x720 without reload; no data change; root cause undetermined (lead: selection lane after all-tracks toggle + Esc) | ' + moved['status']
moved['evidence'] = moved.get('evidence', '') + '; c-round-341/out/b2/rows-n-1280x720.json (SPLIT_range, SPLIT_do) vs rows-n-1440x900.json and rows-n-1280x720-reload.json'
moved['aliases'] = ['C-R341-01']
b['deferred_low_polish'].append(moved)
b['deferred_low_polish'].append({'id': 'C-R341-02', 'severity': 'low', 'origin': 'C round 341 (B spec gap: PERF-7 rows measured direct loads only)', 'title': 'After "Try it in the Studio" from a product page, Chromium warns that the instrument-sans and ibm-plex-mono woff2 preloads were not used within a few seconds', 'evidence': 'c-round-341/out/preload-warn.json (dev), c-round-341/out/preload-warn-prod.json (prod build), c-round-341/t301/r296/probe-a.json', 'repro': 'fresh context, mock API, /products/middle-east, wait 2.5 s, click product-studio-link, wait 9 s on /studio-lab?preview=middle-east, read console; direct /studio-lab load has no warning', 'regression': 'yes since PERF-7 (rounds 316/317); round 301 console []', 'status': 'deferred_low_polish (D-29z1070); signal PERF7-CLIENT-NAV-PRELOAD', 'added': ADDED})
for oid, title in [
    ('INFO-C341-DELETE-MISTAKE', 'C round 341 deleted untracked evidence WAVs > 100 KB across the loop folder (find -delete after a failed cd); tracked tone-2s.wav restored; store/ untouched'),
    ('INFO-C341-EXPORT-ESC-FLAKE', '1 of 5 c320-rows 1440 runs crashed with the export dialog still open after Esc; export-esc probe 5/5 closes; watch item'),
]:
    b['open_findings'].append({'id': oid, 'severity': 'info', 'origin': 'C round 341', 'title': title, 'evidence': 'c-round-341.md Observations; c-round-341.json observations', 'status': 'recorded (D-29z1071/D-29z1072); RETRO input', 'added': ADDED})
for f in b['open_findings']:
    if f.get('id') == 'INFO-C340-EARLY-END':
        f['status'] = 'repeated in round 341 (D-29z1072): stopSignal none with runnable rows unrun; round 342 lists every row with its script | ' + f['status']
b['architecture_signals'].append({'id': 'B-R341-SPEC-UNDEFINED-ROW', 'origin': 'B round 341 -> 342 planning', 'note': 'round-340 task carried an undefined sub-row ("press L", mis-tagged SA-14) and a stale pixel oracle; quote the accepted row and name a script/oracle per row (L6/L29/L56 class)', 'status': 'signal (D-29z1068), RETRO input; not scheduled', 'added': ADDED})
b['architecture_signals'].append({'id': 'PERF7-CLIENT-NAV-PRELOAD', 'origin': 'C-R341-02', 'note': 'font preloads emitted for /studio-lab are unused on client-side navigation from a product page; candidate PERF follow-up (preload only on document load, or route-scoped links)', 'status': 'signal (D-29z1070); not scheduled', 'added': ADDED})
b['version'] = 301
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 342: REGRESSION-ROUND-2026-11-05 remainder)'
b['advisor_used_by_B'] = 'yes (round 341 -> 342 planning: advisor consulted after orientation, before writing; and before declaring done)'
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])
