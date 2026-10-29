# B round 245 -> 246 planning: backlog edits. Run from the loop root: python3 -I b-round-245/update-backlog.py
import json
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
ADDED = '2026-10-29 B round 245 -> 246 planning'
b['updated'] = '2026-10-29 (B round 245 -> 246 planning, D-29z406..D-29z411)'
b['current_task'] = ('current-task.md (round 246, D-29z406..D-29z411; B-R243-UNDO-MARKER-FOCUS fix in ArrangementMarkerRow.tsx '
                     '+ RT-FIX-246 of C-R245-01..03; baseline e9fb805, 2 grants + doc 189, frozen 1104)')
dec = [
 ('D-29z406', 'Round 245 (RETRO 245): C FAIL on RT-LESSONS and RT-SABA only (C-R245-01..03, Low, document findings); SOURCE-SCOPE, RT-NUM, RT-CAUSE, RT-IDS, RT-SCREEN, G245-AUTH, STUDIO-SMOKE-245 PASS; browserVerified and realVerified true; gate 245 skipped (C FAIL), nothing published; baseline stays e9fb805. No product item changes status. retro_runs 245 = RT-FIX pending (as 230 -> 231).'),
 ('D-29z407', 'RT-FIX-246: lessons.md L11 regains old L32 "(a timeout included)", "not under For B/root" and "its declared timeout"; L12 regains old L40 "a hit that pins classes in a frozen or protected file is a STOP (L11) with the hit list" (C-R245-01, = A round-245 lesson feedback, accepted); L50 regex alternative replaced by ^\\s*\\{[^}]*(\\.map\\(|&&|\\?) and its root narrowed to granted files + grep-found callers of the removing actions (C-R245-03: old alternative 0 hits; whole folder 206 hits); header line notes RT-FIX 246. retro-245 §12: R49-T gets a concrete question and deadline RETRO 260 (11c C PASS closes it), GATE244-S4 gets deadline RETRO 260 (C-R245-02). Diffs: b-round-245/lessons-rtfix.diff (4 lines), retro-rtfix.diff (2 lines). C re-checks only these lines.'),
 ('D-29z408', 'Round 246 = B-R243-UNDO-MARKER-FOCUS (planning still 2026-10-29, D-29z405 row 2). Ruling: when the focused flag leaves markers by any path (Undo: Add Marker, Redo: Delete Marker, Cut Time), focus goes to the next surviving flag in time order, else the previous surviving flag, else the Add marker button (the removeMarker rule, extended to surviving neighbours); focus that was not on the removed flag is never moved. Detection at the flag ref detach (React 18 detaches before removal: jsdom and Chromium probes), not by blur: Chromium 143 fires blur/focusout on removal, jsdom does not (b-round-245/chromium-removal.cjs, jsdom-removal-probe.test.tsx). B pre-applied it on a scratch copy: precheck-scratch.diff, covering 58 files 1115/1115, 8 mutants red, browser probe both viewports.'),
 ('D-29z409', 'New Medium B-R245-UNDO-GROUP-FOCUS (pre-existing, found by B round-246 planning probe at e9fb805, both viewports): with the group name button focused, Undo: Group Tracks and Redo: Ungroup Tracks remove the group row and focus falls to BODY. Different owner (StudioWorkspace pendingRowFocusRef / focusedTrackRowId), so not folded into round 246 (one owner per round, advisor); scheduled after the REGRESSION round and before SABA-B-11b stage 2b; successor to decide at its planning (the ungroup rule: first member track name button). Added as question 4 to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (non-blocking).'),
 ('D-29z410', 'Next: round 247 = REGRESSION at the first planning on/after 2026-10-30 (all scope_additions incl. C-UNDO-ORIGINS-246 as named rows, L6); if that planning is still 2026-10-29, B-R245-UNDO-GROUP-FOCUS first. Then B-R245-UNDO-GROUP-FOCUS, SABA-B-11b stage 2b, SABA-B-10a (with C-R235-02), 10b, 9, 11c. A round-246 FAIL -> fix-up on the same grants first.'),
 ('D-29z411', 'Info filed: INFO-C245-COST-ROUNDING, INFO-C245-COLLECT-DIFF, INFO-C245-BEFORE-COPY-UNVERIFIABLE, INFO-C245-SMOKE-STATE (c-round-245.json); INFO-B246-CHROMIUM-BLUR-ON-REMOVAL (harness fact); INFO-B246-REDO-ADD-NO-UNMOUNT (Redo: Add Marker unmounts nothing; with the fix the focus stays on the Add button after Undo then Redo). Clips are not focusable (no tabIndex on [data-clip-id], browser probe) so clip Undo/Redo is out of L50 scope.'),
]
have = {e['id'] for e in b['decisions_log_b']}
for i, t in dec:
    if i not in have:
        b['decisions_log_b'].append({'id': i, 'date': '2026-10-29', 'text': t})
of = b['open_findings']
ids = {e.get('id') for e in of}
for e in of:
    if e.get('id') == 'B-R243-UNDO-MARKER-FOCUS':
        e['status'] = ('dispatched round 246 (D-29z408): successor ruling next surviving flag -> previous -> Add button, detected at flag ref detach; '
                       'closes on C round 246 PASS + gate published | ' + e['status'])
new = [
 {'id': 'C-R245-01', 'severity': 'low', 'origin': 'C round 245 RT-LESSONS', 'title': 'merged L11/L12 dropped three old L32/L40 clauses ("not under For B/root", the declared timeout, the frozen-file testid STOP)', 'evidence': 'c-round-245.json bugs[0]; c-round-245/lessons.diff; a-round-245.md Lesson feedback', 'status': 'fixed by B at round-246 planning (D-29z407, b-round-245/lessons-rtfix.diff); closes on RT-FIX-246 C PASS', 'added': ADDED},
 {'id': 'C-R245-02', 'severity': 'low', 'origin': 'C round 245 RT-SABA', 'title': 'retro-245 §12 L46 list: GATE244-S4 had no deadline; R49-T had no question and a task as deadline', 'evidence': 'c-round-245.json bugs[1]; retros/retro-245.md l.179-180', 'status': 'fixed by B at round-246 planning (D-29z407, b-round-245/retro-rtfix.diff); closes on RT-FIX-246 C PASS', 'added': ADDED},
 {'id': 'C-R245-03', 'severity': 'low', 'origin': 'C round 245 RT-LESSONS', 'title': 'L50 conditional-render alternative matched 0 lines (multi-line ternaries); whole-folder run 82 hits above the 20-origin stop', 'evidence': 'c-round-245.json bugs[2]', 'status': 'fixed by B at round-246 planning (D-29z407): new alternative ^\\s*\\{[^}]*(\\.map\\(|&&|\\?), root = granted files + grep-found callers; 12 hits on ArrangementMarkerRow.tsx (b-round-245/l50-markerrow.txt); closes on RT-FIX-246 C PASS', 'added': ADDED},
 {'id': 'B-R245-UNDO-GROUP-FOCUS', 'severity': 'medium', 'origin': 'B round-246 planning probe (L50 enumeration of Undo/Redo removing a focused element)', 'title': 'with the group name button focused, Undo: Group Tracks or Redo: Ungroup Tracks removes the group row; focus falls to BODY (L47 class)', 'evidence': 'b-round-245/shots/undo-origins-head.json groupUndo@1440x900/@1280x720 and ungroupRedo@* at HEAD e9fb805; unchanged on the round-246 marker fix (undo-origins-scratch.json)', 'repro': 'fresh /studio-lab, Demo collection ready; click the 2nd track name button, Ctrl+click the 3rd, Ctrl+G; focus arrangement-group-name; Ctrl+Z -> 0 groups, document.activeElement BODY', 'status': 'open (D-29z409): scheduled after the REGRESSION round, before SABA-B-11b stage 2b; owner StudioWorkspace.tsx; question 4 of ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS', 'added': ADDED},
 {'id': 'INFO-C245-COST-ROUNDING', 'severity': 'info', 'status': 'info (D-29z411)', 'title': 'retro cost totals are sums of rounded per-file values (raw 110.72/78.14/347.67)', 'source': 'c-round-245.json info', 'added': ADDED},
 {'id': 'INFO-C245-COLLECT-DIFF', 'severity': 'info', 'status': 'info (D-29z411)', 'title': 'collect.txt differs only in round 244 b_cost after b-round-244-result.json appeared; no window number changes', 'source': 'c-round-245.json info', 'added': ADDED},
 {'id': 'INFO-C245-BEFORE-COPY-UNVERIFIABLE', 'severity': 'info', 'status': 'info (D-29z411): loop git repo is a shallow single commit; before-copies are the only record', 'title': 'b-round-244/backlog-before-245.json cannot be compared with history', 'source': 'c-round-245.json info', 'added': ADDED},
 {'id': 'INFO-C245-SMOKE-STATE', 'severity': 'info', 'status': 'info (D-29z411)', 'title': 'the smoke export SHA 1fea093b... is taken after adding demo-stem-pulse (rounds 237-245 recipe), not on an empty project', 'source': 'c-round-245.json info', 'added': ADDED},
 {'id': 'INFO-B246-CHROMIUM-BLUR-ON-REMOVAL', 'severity': 'info', 'status': 'info (D-29z411): harness fact for every focus task', 'title': 'Chromium 143 fires blur and focusout when a focused element is removed; jsdom fires neither. Both move activeElement to BODY. React 18 detaches a removed element ref while it is still focused in both', 'source': 'b-round-245/chromium-removal.cjs, jsdom-removal-probe.test.tsx, undo-origins-scratch.json', 'added': ADDED},
 {'id': 'INFO-B246-REDO-ADD-NO-UNMOUNT', 'severity': 'info', 'status': 'info (D-29z411)', 'title': 'Redo: Add Marker unmounts nothing; at HEAD focus stays BODY after Undo-then-Redo, with the fix it stays on the Add button', 'source': 'b-round-245/shots/undo-origins-head.json, undo-origins-scratch.json addUndoThenRedo', 'added': ADDED},
]
for e in new:
    if e['id'] not in ids:
        of.append(e)
for r in b['retro_runs']:
    if r.get('round') == 245:
        r['status'] = ('RT-FIX pending (D-29z406/D-29z407): C round 245 PASS on SOURCE-SCOPE, RT-NUM, RT-CAUSE, RT-IDS, RT-SCREEN, G245-AUTH, STUDIO-SMOKE-245; '
                       'FAIL RT-LESSONS (C-R245-01, C-R245-03) and RT-SABA (C-R245-02); corrected at round-246 planning; closes when C round 246 passes RT-FIX-246 | ' + str(r.get('status', '')))
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-ROUND-2026-10-30':
        add = ('C-UNDO-ORIGINS-246 (if round 246 done): with a marker flag focused, Ctrl+Z of its add -> Add marker button (no other flag) or the next surviving flag; '
               'Redo of its delete -> the next flag; Undo: Move Marker keeps the flag; focus elsewhere is not moved; both viewports (D-29z410)')
        if add not in r['scope_additions']:
            r['scope_additions'].append(add)
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS':
        r['question'] += '; 4 (D-29z409) one rule for history steps that remove the focused row (B-R245-UNDO-GROUP-FOCUS) next to pendingRowFocusRef, or a per-owner rescue like the round-246 marker ref-detach rescue'
        if 'B-R245-UNDO-GROUP-FOCUS' not in r['signals']:
            r['signals'].append('B-R245-UNDO-GROUP-FOCUS')
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['open_findings']), len(b['decisions_log_b']))
