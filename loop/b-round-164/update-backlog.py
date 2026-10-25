import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z130'
when = '2026-10-25 B round 164 -> 165 planning (D-29z130)'
b['version'] = b.get('version', 153) + 1
b['updated'] = '2026-10-25 (B round 164 -> 165 planning, D-29z130)'
b['current_task'] = ("current-task.md (round 165: D-29z130 - ROOT-RECON-MARKER-ENTER confirmed Medium by B browser repro (held clip-header drag + Shift+Tab to a flag + F2 + Enter commits Rename Marker mid-gesture; the next preview rebuilds from gesture.before, the name is lost and the history keeps an empty Rename Marker step); "
  "fix K1 F2 -> runUnlessGesture, K2 Enter during a gesture refused with GESTURE_EDIT_BLOCKED_MESSAGE and the editor kept open with its draft; tests MU15-MU17 test-first, mutations m182-m184; "
  "baseline 7952439 clean (gate 164 published); grants b-round-164-r165-grants.txt (3), new doc 134; round 166 = V-3c-3b unless the regression is due)")
r = b['rounds'][-1]
assert r['round'] == 164
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-164.json: browserVerified=true realVerified=true, 0 bugs; passed T164-TARGETED 94/94, SOURCE-SCOPE, AN-REVIEW, ENV-VIS (line core vs halo min 15.62 in all 12 state x viewport cells, baseline 1.74; handle >= 3.48 hover / 15.62 rest, baseline 1.88), "
  "ENV-FUNC (add/drag/delete/undo/redo/A key; real audio gain-0 peak 0.00000 vs -4 dB reference 0.19-0.54), OV-CORNERS (notch tl/tr/bl/br 1/0/1/0 empty, tr/br 0 right-touch; baseline 3/13/3/15 re-detected; radius 6 px x3), "
  "RV1-SABA (0 px), OV-FUNC, G164-3 anon/protected/401, PX-NET, REG-HYD; blocked fake-Bearer 403: backend unavailable in cloud; 2 invalid runs replaced (cold-vite first load; harness past project end)); "
  "gate 164 published 7952439defa941dd4246d23651f8591aede28f7c on both remotes (6 paths; verify 171 files pass, typecheck + build ok; review 9/10, 0 blocking) -> SABA-B-1 and SABA-B-2 closed")
b['rounds'].append({
  'round': 165, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['ROOT-RECON-MARKER-ENTER (confirmed Medium: marker rename during a held clip drag is lost and leaves an empty Undo step)'],
  'note': ("baseline HEAD 7952439 clean (gate 164 published); 983 files; grants b-round-164-r165-grants.txt (3: ArrangementMarkerRow.tsx, markers-ui.test.tsx, doc 133 status), new b-round-164-r165-new-files.txt (doc 134), "
    "frozen 980 (b-round-164-r165-tree-sha256.txt); start copies b-round-164/r165-granted-start/; vitest base b-round-164-r165-vitest-base.txt (5 marker files, 72/72 run by B at 7952439; markers-ui expect( 183); "
    "B repro b-round-164/out/enter-stab-probe.json (real Shift+Tab x14 during a held header drag, both viewports) + enter-f2-probe.json; non-tests enter-probe/enter-touch-probe (editor opened before the drag: blur commits first); "
    "observation tab-abort-probe.json (forward Tab #23 aborts the drag); locks MU15-MU17 (cloud MU14 is unrelated, keep it); mutations m182-m184; C rows MK-GESTURE, MK-BASELINE-CHECK, MK-ENTER-OPEN (synthetic pointer), MK-POSITIVE, MK-BLUR, G165-3, PX-NET/REG-HYD; "
    "on C PASS round 166 = V-3c-3b unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 165 planning (D-29z130): SABA-B-1 + SABA-B-2 done (round 164, C PASS browserVerified=true realVerified=true, 0 bugs, published 7952439); "
  "ROOT-RECON-MARKER-ENTER reproduced by B in the real browser (confirmed Medium) = round 165; then V-3c-3b (166), V-3c-4, V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
i = [k for k, s in enumerate(order) if s.startswith('SABA-B-1 + SABA-B-2')][0]
order[i] = "SABA-B-1 + SABA-B-2 (Saba's 2026-10-25 bugs) = round 164: done (C PASS, published 7952439)"
j = [k for k, s in enumerate(order) if s.startswith('ROOT-RECON-MARKER-ENTER')][0]
order[j] = "ROOT-RECON-MARKER-ENTER = round 165 (confirmed Medium by B browser repro, D-29z130; F2 + Enter guards in ArrangementMarkerRow.tsx); then V-3c-3b = round 166"
q['marker_enter_plan_d29z130'] = {
  'round': 165,
  'source': 'agent-workflow.md 2026-10-25 reconciliation item 1; PC MU14 (source material only)',
  'reproduction': 'b-round-164/out/enter-stab-probe.json (1440 + 1280): held clip-header move, Shift+Tab x14 to the marker flag, F2 opens rename (F2 branch l.654-665 lacks runUnlessGesture), Enter commits Rename Marker (settleEditor guards only blur, l.294); next pointermove rebuilds the preview from gesture.before -> flag back to Intro; release commits Move clip; Undo stack Move clip -> Rename Marker (no-op) -> Add Marker; the typed name is unrecoverable',
  'non_tests': 'enter-probe.json (mouse) and enter-touch-probe.json (touch) opened the editor before the drag; pointerdown blurred it and the blur committed before any claim (correct); clipDx 0 -> no gesture at Enter',
  'rulings': {
    'R1': 'F2 on a flag during a pointer gesture -> runUnlessGesture (status GESTURE_EDIT_BLOCKED_MESSAGE, no editor, flag keeps focus)',
    'R2': 'Enter in an open editor during a gesture -> refused, status blocked, editor stays open with draft and focus; a later Enter commits once (blur keeps closing: MU13). Alternative rejected: close like blur (loses typed text)',
    'R3': 'Escape during a gesture unchanged (cancel, no mutation); lock only',
    'R4': 'B-R164-COMMIT-DURING-PREVIEW (context-level contract) recorded as a signal, not scheduled; owner ArrangementContext.tsx is protected'},
  'locks': 'MU15 add+Enter during gesture, MU16 rename+Enter/Escape during gesture, MU17 F2 during gesture; mutations m182 (K1), m183 (K2, two-sided with MU13), m184 (K2 closes the editor)',
  'ableton': 'parity not applicable / not claimed; manual not opened',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
s1 = find('SABA-B-1')
s1['status'] = 'closed: C round 164 PASS (c-round-164.json ENV-VIS line core vs halo min 15.62 in 12 cells, handle >= 3.48; ENV-FUNC real audio), published 7952439; re-verify after DUX-R-5 with the round-164 ENV-VIS metric'
s1['closed'] = when
s2 = find('SABA-B-2')
s2['status'] = 'closed: C round 164 PASS (c-round-164.json OV-CORNERS notch 1/0/1/0 empty and tr/br 0 right-touch vs baseline 3/13/3/15; radius 6 px x3), published 7952439; V-3c-5 must keep frame = root radius (OV1)'
s2['closed'] = when
m = find('ROOT-RECON-MARKER-ENTER')
m['severity'] = 'medium (confirmed by B in the real browser, D-29z130)'
m['status'] = 'open: scheduled round 165 (D-29z130), test-first (MU15-MU17 red before the fix)'
m['evidence'] = 'b-round-164/out/enter-stab-probe.json, enter-f2-probe.json (+ png); non-tests enter-probe.json, enter-touch-probe.json; observation tab-abort-probe.json'
m['repro'] = '/studio-lab -> demo-middle-east on music, snap off -> add marker Intro at 5 s -> hold the mouse on the clip header and move 40 px -> Shift+Tab x14 to the flag -> F2 -> type Lost? -> Enter -> move 60 px -> release -> flag shows Intro, Undo stack Move clip -> Rename Marker -> Add Marker'
m['cause'] = 'F2 branch of handleFlagKeyDown (l.654-665) opens the editor without runUnlessGesture; settleEditor (l.287) checks the gesture only for blur; the clip preview rebuilds from gesture.before'
m['updated'] = when
of += [
  {'id': 'B-R164-COMMIT-DURING-PREVIEW', 'severity': 'info (architecture signal)', 'status': 'signal: not scheduled; candidate question for the pending frontend-architect checkpoint (b-round-160-checkpoint-request.md)',
   'title': 'commitArrangement accepts commits while a pointer gesture holds a preview built from gesture.before, so any keyboard commit during a drag is overwritten by the next preview and leaves an empty Undo step',
   'evidence': 'b-round-164/out/enter-stab-probe.json (the marker case); owner ArrangementContext.tsx (protected)', 'added': when},
  {'id': 'B-R164-TAB-ABORT', 'severity': 'info (observation)', 'status': 'observation: no work; forward Tab during a held clip drag aborts the drag when focus leaves arrangement-detail-clip-gain-fader for BODY (press 23 at 1440); nothing commits, the clip snaps back',
   'evidence': 'b-round-164/out/tab-abort-probe.json', 'added': when},
  {'id': 'A11Y-R164-ENV-POINT-TARGET', 'severity': 'info (a11y signal)', 'status': 'signal: envelope breakpoints are 10 px divs (below the WCAG 2.5.8 24 px target) and are not keyboard-focusable; candidate for a separate a11y task, not scheduled',
   'evidence': 'gates/round-164/review.md suggestion 5', 'added': when},
]
for e in of:
  if e.get('id') == 'ARCH-CHECKPOINT-V3C':
    e['status'] = e.get('status', '') + '; still unanswered at round 165 planning (2026-10-25); round 164 architecture notes (A reviewer, gate reviewer): none; extra candidate question B-R164-COMMIT-DURING-PREVIEW'
dl = b['deferred_low_polish']
dl += [
  {'id': 'C-R164-N1', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'the overview view frame is invisible (left clamped to 100 %) when the timeline is scrolled past the project end; no view indicator', 'evidence': 'c-round-164.md notes N1; c-round-164/out/invalid/ov-1440-1-pastend.json', 'repro': '/studio-lab with a clip -> scroll the timeline to scrollWidth -> the overview frame sits outside the overview', 'added': when},
  {'id': 'C-R164-N2', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'at 0 dB on a selected clip the 10 px white envelope handle (z-30) covers about 2 letters of the clip name; the dark halo also draws a 2 px band on the header bottom (gate review 1)', 'evidence': 'c-round-164.md N2; c-round-164/shots/env/env-1440-1-e-fresh-0dB-selected.png; gates/round-164/review.md suggestion 1', 'repro': 'Env on -> double-click a selected audio clip body -> new point at gain 1.0 sits on the header edge', 'added': when},
  {'id': 'GATE164-PILL-FRAME', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'overviewFrame has no minimum width; with rounded-sm a frame narrower than about 12 px turns pill-shaped at high zoom on long projects', 'evidence': 'gates/round-164/review.md suggestion 2; a-round-164.md reviewer Low 5; c-round-164.md N3 (39-57 px frames looked normal)', 'repro': 'long project -> max zoom -> overview frame < 12 px', 'added': when},
  {'id': 'GATE164-OV1-FRAGILE', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'OV1 matches the full class string of the overview outline overlay in the source text; a class reorder breaks it with no behaviour change', 'evidence': 'gates/round-164/review.md suggestion 3; a-round-164.md reviewer Low 4', 'repro': 'read studio-theme-obsidian.test.tsx l.133-138 at 7952439', 'added': when},
  {'id': 'A-R164-EV1-TRANSLATE', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'EV1 does not lock -translate-x-1/2, -translate-y-1/2 and cursor-move on the envelope point (centring under the hover scale)', 'evidence': 'a-round-164.md reviewer Low 3', 'repro': 'read clip-envelope-ui.test.tsx EV1 at 7952439', 'added': when},
]
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(dl), len(of))
