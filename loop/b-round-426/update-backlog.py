# B round 426 -> 427 backlog update (v402 -> v403). Run once from the loop root: python3 -I b-round-426/update-backlog.py
import json, os, sys
DONE = 'b-round-426/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 402:
    sys.exit(f"expected version 402, found {b.get('version')}")
BY = '2026-11-10 B round 426 -> 427 planning'
b['version'] = 403
b['updated'] = '2026-11-10 (B round 426 -> 427 planning: round 426 C PASS + gate 426 published 052c76c; SYS-2 stage 2a done; round 427 = SYS-2 stage 2b-i on 052c76c)'
b['current_task'] = 'Round 427: SYS-2 stage 2b-i - a held Enter acts once on the footer Snap/Envelope toggles, the library tree, fold and notice dismiss, the detail panel toggle and the video dock expand/close/return; library, preview and detail inline Enter-repeat copies folded onto preventRepeatedEnterKeyDown (current-task.md; sketch b-round-426/sketch-427.patch.txt)'
b['advisor_used_by_B'] = 'round 426 -> 427 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1492', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 426 accepted from C evidence only: c-round-426.json PASS, 0 bugs, browserVerified/realVerified true, L57 OK. B re-ran C\'s own compare (python3 -I c-round-426/probe/compare.py c-round-426/probe -> ALL OK (28 cells)) and diffed c-round-426/b425copy/mutants/summary.txt against b-round-425/mutants/summary.txt (identical). The fake-bearer row with a real backend stays BLOCKED (backend unavailable in cloud), open backend evidence, not a browserVerified gap. Gate 426 published 052c76c on both remotes = baseline for round 427. SYS-2 stage 2a done; A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER closed by HM15 (MU-SPREAD-TYPE tsc rc 2); A-R107-SWEEP-HELD-ENTER-TOOLBAR advanced (HM1-HM14), stays open for 2b.'},
    {'id': 'D-29z1493', 'date': '2026-11-10', 'by': BY,
     'decision': 'TL-R425-09 (HM5 gesture-active row; A\'s reviewer rated it Medium) ruled: premise corrected, closed by a pin row. B\'s sketch run shows that during a pointer gesture the StudioWorkspace window keydown handler prevents a fresh Enter on any non-typing target and writes GESTURE_EDIT_BLOCKED_MESSAGE before the button can click, so a refused Pan reset is unreachable by Enter and the per-button guard is not observable there (TL-R425-02\'s premise did not hold). New row HM5b pins the real path (fresh Enter prevented, pan 0.5 kept, focus stays on the reset, refusal status written, repeats prevented, arrangement unchanged). HM5b is green at HEAD by design (a premise pin, not a guard row); stated in the task. The refusal status is rewritten on every key repeat while a gesture holds (window handler has no repeat check): new Low B-R426-GESTURE-REFUSAL-REPEAT-STATUS, same family as GATE274-S1-HELD-REPEAT-ANNOUNCE, deferred_low_polish (2026-10-23 rule). TL-R425-10 stays deferred.'},
    {'id': 'D-29z1494', 'date': '2026-11-10', 'by': BY,
     'decision': 'SYS-2 stage 2b split by surface (advisor + L50 size rule): 2b-i (round 427) = persistent surfaces: footer Snap and Envelope toggles (StudioWorkspace), Library collection fold, All/collection/folder nodes and notice dismiss, Library/LibraryPreview/DetailPanel inline Enter-repeat copies folded onto the helper, detail panel toggle, video dock expand/close/placeholder return; plus HM5b. 2b-ii (next) = transient surfaces: ExportDialog cancel and second button + its inline copy, GridMenu 4 menu items, MarkerMenu item, MarkerRow flag/editor (incl. held Escape probe) + its 5 inline copies, ShortcutSheet close + footer Shortcuts button, LibraryMenu inline copy and anchor, NarrowScreen Send link, then a closing grep row (0 inline Enter-repeat copies under app/** and perf/**) and the scanner row. Video drag handle (KEYDOWN-NO-ENTER, no onClick) ruled out of scope: Enter has no action there. Transport Fit stays unguarded (TH5). Stage numbering: 1 = round 422 (doc 272), 2 = 2a round 426 (doc 274, l.4 published as "stage 2 of 3"), 3 = 2b-i (doc 275, "stage 3 of 4"), 4 = 2b-ii; the 2b-ii task grants l.4 of docs 274 and 275 to Completed (L28). Real defects at HEAD in Chromium (b-round-426/probe/head): Snap, Envelope, library collection fold, detail toggle, video expand, and Close/Return (the repeats re-float the docked video through the Expand button that receives focus). Ableton conformance: does not apply (no per-press behaviour change).'},
    {'id': 'D-29z1495', 'date': '2026-11-10', 'by': BY,
     'decision': 'Gate 426 review Architecture note (repeated per-button onKeyDown guard, about 25 sites in 5 files, more in 2b) recorded as signal SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT, not a task. Its suggestion 1 (comment on the defensive group-name input guard) confirms TL-R425-04 of b-round-425/sketch-review.md (confirmedBy, no new id); suggestion 2 (a KeyboardEventHandler wrapper so the boolean return is not ignored in some places and used in others) attached to the same signal. At the SYS-2 boundary (after 2b-ii C PASS) B files one bounded frontend-architect checkpoint request with root: StudioButton wrapper vs a lint/scanner row in verify vs keep; non-blocking.'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 426 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1492): C PASS c-round-426.json, browserVerified true, 0 bugs; gate 426 published 052c76c'; ok += 1
if ok != 1:
    sys.exit('round 426 entry not found')
b['rounds'].append({'round': 427, 'task': 'current-task.md', 'decision': 'D-29z1494', 'type': 'SYS-2 stage 2b-i (footer toggles, library, detail toggle, video dock held Enter)', 'status': 'dispatched',
                    'note': 'baseline 052c76c clean; sketch b-round-426/sketch-427.patch.txt; claims b-round-426/claims-427.sh'})
seen = set()
for s in b['systemic_tasks']:
    if s.get('id') == 'SYS-2':
        s['status'] = 'in_progress (D-29z1492, D-29z1494): stage 2a done (C round 426 PASS, gate 426 published 052c76c); stage 2b split: 2b-i dispatched as round 427 (footer Snap/Envelope, library tree/fold/dismiss + inline folds, detail toggle + inline folds, video dock expand/close/return, HM5b); 2b-ii next (export dialog, grid menu, marker menu/row incl. held Escape, shortcut sheet + footer Shortcuts, library menu, narrow screen, closing inline-copy grep row) | ' + s['status']
        seen.add('SYS-2')
for f in b['deferred_low_polish']:
    if f.get('id') == 'A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER':
        f['status'] = 'closed (D-29z1492): C round 426 PASS (HM15, MU-SPREAD-TYPE tsc rc 2), gate 426 published 052c76c | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'in_progress (D-29z1494): lane/group/master/tempo done (round 426); panels part in round 427 (HP1-HP9); transient surfaces in 2b-ii | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'TL-R425-09-HM5-GESTURE-ROW':
        f['status'] = 'in_progress (D-29z1493): premise corrected (window handler refuses Enter during a gesture before the click); HM5b pin row in round 427; closes on its C PASS | ' + f['status']
        f['confirmedBy'] = 'a-round-426.md reviewer Medium (A-R426 code-reviewer), ruled D-29z1493'; seen.add(f['id'])
if seen != {'SYS-2', 'A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER', 'A-R107-SWEEP-HELD-ENTER-TOOLBAR', 'TL-R425-09-HM5-GESTURE-ROW'}:
    sys.exit('ids not found: ' + str(seen))
b['deferred_low_polish'].append({'id': 'B-R426-GESTURE-REFUSAL-REPEAT-STATUS', 'severity': 'low', 'origin': 'pre-existing (B pre-check found it)', 'status': 'deferred_low_polish (D-29z1493)',
    'title': 'during a pointer gesture a held Enter (or M, Delete, arrows) rewrites the gesture refusal status on every key repeat; the StudioWorkspace window keydown refusal branch has no repeat check', 'evidence': 'b-round-426/sketch-review.md; HM5b on the sketch (statusSequence grows on the fresh press; repeats re-enter the same branch); same family as GATE274-S1-HELD-REPEAT-ANNOUNCE',
    'repro': 'start a clip drag (pointer down on a clip name bar), keep the pointer down, focus any button and hold Enter: the live region text is rewritten on every repeat', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT', 'added': BY, 'decision': 'D-29z1495', 'source': 'gates/round-426/review.md Architecture note signal 3 and suggestions 1-2',
    'signal': 'onKeyDown={preventRepeatedEnterKeyDown} is hand-added per button (about 25 sites in 5 files after 2a, more in 2b); proposal: a StudioButton wrapper that applies the guard by default, or a scanner/lint row in verify that fails for a <button onClick> without the guard; plus a KeyboardEventHandler-typed wrapper so the boolean return is used consistently. Suggestion 1 (comment on the defensive group-name input guard) is confirmedBy on TL-R425-04 (b-round-425/sketch-review.md)',
    'status': 'signal only; frontend-architect checkpoint request at the SYS-2 boundary (after 2b-ii C PASS); not scheduled'})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v403\n')
print('ok v403')
