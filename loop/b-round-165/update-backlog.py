import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z131'
when = '2026-10-25 B round 165 -> 166 planning (D-29z131)'
assert b['version'] == 154
b['version'] = 155
b['updated'] = '2026-10-25 (B round 165 -> 166 planning, D-29z131)'
b['current_task'] = ("current-task.md (round 166: D-29z131 - V-3c-3b: marker prev/next ChevronLeft/ChevronRight at size-2.25 (9 px, two adjacent content-sized buttons), detail toggle word + ChevronDown/ChevronRight with pl-2 pr-1 gap-0.5, grid menu Check in a flex w-3 span, exit link ArrowLeft size-3 gap-0.75; strings expandText/collapseText lose the glyph; marker + stays text (R5, Q-V3-ICON-SIZE); "
  "B probes b-round-165/out/v3c3b-probe.json + v3c3b-final.json (combined max edge delta 0.468 px, 0 added/missing keys, both viewports); d6 renames b-round-165-r166-d6-key-renames.json (6 keys, 0 collisions); RV-1 reference c-round-164/out/d6; "
  "baseline 7581483 clean (gate 165 published); grants b-round-165-r166-grants.txt (11), new doc 135; vitest base 11 files 206/206; locks MS4, DPS5, TU11, TS7, LG4; mutations m185-m191)")
r = b['rounds'][-1]
assert r['round'] == 165
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-165.json: browserVerified=true realVerified=true, 0 bugs; passed T165-TARGETED 75/75, SOURCE-SCOPE, AN-REVIEW, MK-GESTURE 1440+1280 (real mouse hold + 14 Shift+Tab + F2: no input, blocked status, focus on flag; Move clip commits, flag Intro; Undo status Move clip -> Add Marker, no Rename Marker), "
  "MK-BASELINE-CHECK (C's checker FAILs on B's baseline enter-stab-probe.json), MK-POSITIVE 1440+1280, MK-BLUR 1440+1280, G165-3, PX-NET, REG-HYD; "
  "blocked MK-ENTER-OPEN (harness: StudioWorkspace capture-phase pointerdown focus release blurs the editor before any gesture claim, so no browser path keeps the editor open into a gesture; K2 covered by MU15/MU16 + m183/m184 only) and fake-Bearer 403 (backend unavailable in cloud)); "
  "gate 165 published 75814838b35be7f3ac8befa2c2f007b0cde51d28 on both remotes (4 paths; verify 171 files pass; review 9/10, 0 blocking) -> ROOT-RECON-MARKER-ENTER closed")
b['rounds'].append({
  'round': 166, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-3b (marker step, detail toggle, grid menu check and exit link glyphs -> lucide icons; expandText/collapseText without glyphs)'],
  'note': ("baseline HEAD 7581483 clean (gate 165 published); 984 files; grants b-round-165-r166-grants.txt (11: ArrangementMarkerRow, ArrangementDetailPanel, ArrangementGridMenu, StudioWorkspace (import + exit link only), strings.ts, 5 tests, doc 134 status), new b-round-165-r166-new-files.txt (doc 135), "
    "frozen 973 (b-round-165-r166-tree-sha256.txt); start copies b-round-165/r166-granted-start/; vitest base b-round-165-r166-vitest-base.txt (11 files, 206/206 by B at 7581483); "
    "C rows T166-TARGETED, SOURCE-SCOPE, AN-REVIEW, ICON-V3C3B, ICON-BOX (baseline b-round-165/out/v3c3b-final.json before arrays), RV1-V3C3B (c-round-164 d6 r1 + 6-key map), FUNC-SMOKE-V3C3B (incl. real audio), G166-3, PX-NET/REG-HYD; "
    "on C PASS round 167 = V-3c-4 unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 166 planning (D-29z131): ROOT-RECON-MARKER-ENTER done (round 165, C PASS browserVerified=true realVerified=true, 0 bugs, published 7581483; K2 Enter guard has no browser lock - MK-ENTER-OPEN BLOCKED harness); "
  "V-3c-3b = round 166; then V-3c-4, V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
j = [k for k, s in enumerate(order) if s.startswith('ROOT-RECON-MARKER-ENTER')][0]
order[j] = "ROOT-RECON-MARKER-ENTER = round 165: done (C PASS, published 7581483; K2 browser lock not reachable, vitest-only)"
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = "V-3 remainder: V-3c-3b = round 166 (D-29z131), V-3c-4 (input: ARCH-CHECKPOINT-V3C, fallback (c)), V-3c-5 (10 px panel radius; keep the overview frame radius equal to its root, lock OV1)"
q['v3c3b_plan_d29z131'] = {
  'round': 166,
  'probe': 'b-round-165/v3c3b-probe.cjs -> out/v3c3b-probe.json (glyph metrics + single-site swaps, S0/S1-detail-toggled/S2-grid-menu, 1440+1280 identical); b-round-165/v3c3b-final.cjs -> out/v3c3b-final.json (all rulings combined: max edge delta 0.468 px, 0 added/missing keys; before arrays = C ICON-BOX baseline); header-key.cjs (d6 header key after the change)',
  'glyph_metrics': 'marker prev/next 9.234 px glyph in 19.234x16 content-sized buttons; marker + 6.000 px; detail toggle 12 px glyph 6.031 + space 2.000 + word 48/42 (74.031/68.031 x 24); exit 14 px arrow 11.734 + space 3.016; grid check 7.234 in a fixed w-3 span',
  'rulings': {
    'R1': 'marker prev/next ChevronLeft/ChevronRight size-2.25 (9 px, not R2\'\' 10 px: two adjacent content-sized buttons would add +1.53 px at 10 px) strokeWidth 2.4 + inline-flex items-center justify-center on prev/next only; detail toggle word + ChevronDown (open) / ChevronRight (collapsed) size-2.5 sw 2.4, px-2 -> pl-2 pr-1 + inline-flex items-center gap-0.5 (icon 4 px wider than the glyph); grid Check size-2.5 sw 2.4, span w-3 text-accent -> flex w-3 justify-center text-accent; exit ArrowLeft size-3 sw 2 + inline-flex items-center gap-0.75 (R2\'\')',
    'R2': "strings.ts expandText 'Expand ▸' -> 'Expand', collapseText 'Collapse ▾' -> 'Collapse'; key notation (Ctrl+←, ← →) stays",
    'R3': "a11y: marker/toggle aria-label/title/aria-keyshortcuts byte-identical; grid spans already aria-hidden; exit link accessible name '← CZABA' -> 'CZABA' (decorative arrow hidden; no aria-label added)",
    'R4': 'surfaces = V-3c-4, radius = V-3c-5; +/− shortcut hint, scenes.$productId.tsx and LeadMagnetPopup.tsx (outside Studio) and the protected purchased route are out of this stage',
    'R5': 'marker + stays ASCII text: not a spec unicode symbol; a Plus icon at 8-10 px shifts prev/next 2-4 px (probe), 6 px is illegible; question added to Q-V3-ICON-SIZE'},
  'd6_renames': 'b-round-165-r166-d6-key-renames.json (6 keys: detail toggle Collapse/Expand, exit CZABA, marker prev/next -> aria-label, header box key slice; 0 collisions vs c-round-164/out/d6 r1)',
  'locks': 'MS4 (marker icons, + unchanged), DPS5 (toggle icon both states + pl-2 pr-1), TU11 (grid check only on checked items), TS7 (exit ArrowLeft + CZABA), LG4 (strings); mutations m185-m191',
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
m = find('ROOT-RECON-MARKER-ENTER')
m['status'] = ('closed: C round 165 PASS (c-round-165.json MK-GESTURE 1440+1280 real mouse hold + Shift+Tab + F2 refused, no Rename Marker in Undo; MK-BASELINE-CHECK fails on the baseline), published 7581483. '
  'Caveat: the K2 Enter-during-gesture guard has no browser lock - MK-ENTER-OPEN BLOCKED (harness): the workspace capture-phase pointerdown focus release blurs the editor before the gesture claim, so the precondition is unreachable in the browser; K2 is locked only by vitest MU15/MU16 and mutations m183/m184')
m['closed'] = when
c = find('B-R164-COMMIT-DURING-PREVIEW')
c['status'] = ('signal: not scheduled; repeated by A round-165 code-reviewer and the gate-165 reviewer (same Architecture note: 7+ hand-written guards in ArrangementMarkerRow.tsx, one guard in ArrangementContext.commitArrangement proposed, keep for now) -> '
  'bounded root request b-round-165-checkpoint-request.md (Q-COMMIT, addendum to b-round-160-checkpoint-request.md); owner ArrangementContext.tsx protected; acceptance quoted there')
c['updated'] = when
qi = find('Q-V3-ICON-SIZE')
qi['note_d29z131'] = ("V-3c-3b (round 166): marker step icons at size-2.25 (9 px) instead of R2'' 10 px so the two adjacent content-sized buttons stay within +-1 px; "
  "detail toggle keeps its box with pr-1; question for Saba (R5): the marker + Add button stays the ASCII text '+' because a Plus icon at 8-10 px shifts prev/next by 2-4 px (b-round-165/out/v3c3b-probe.json); accept the shift or keep '+'")
for e in of:
  if e.get('id') == 'ARCH-CHECKPOINT-V3C':
    e['status'] = e.get('status', '') + '; still unanswered at round 166 planning (2026-10-25); round 165 architecture notes (A reviewer + gate reviewer, same point) -> addendum b-round-165-checkpoint-request.md (Q-COMMIT)'
of.append({'id': 'ROOT-GATE165-C-JSON', 'severity': 'info (root note)', 'status': 'root_note: the gate-165 reviewer did not find c-round-165.json among the gate artifacts (it exists in tmp/studio-real-loop/); root may pass it to the reviewer', 'evidence': 'gates/round-165/review.md (first paragraph)', 'added': when})
dl = b['deferred_low_polish']
dl += [
  {'id': 'GATE165-SR-REPEAT', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'a repeated GESTURE_EDIT_BLOCKED_MESSAGE (several blocked presses during one drag) sets the same live-region text, so screen readers usually do not announce it again; affects every runUnlessGesture caller', 'evidence': 'gates/round-165/review.md suggestion 2', 'repro': 'hold a clip drag -> press M twice -> the second identical status is not re-announced', 'added': when},
  {'id': 'GATE165-MU15-BLUR-WEAK', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'the post-commit blur check in MU15 cannot catch a double commit because the input is already unmounted; rename it as a smoke check or delete it', 'evidence': 'gates/round-165/review.md suggestion 4; a-round-165.md (doc 134 already says it is not discriminating)', 'repro': 'read markers-ui.test.tsx MU15 at 7581483', 'added': when},
  {'id': 'GATE165-MU-RELEASE-HELPER', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'MU15-MU17 repeat a `const releaseGesture: (() => void) | null = release;` narrowing workaround; a small holdGesture(api) helper returning { release } would remove it (optional)', 'evidence': 'gates/round-165/review.md suggestion 5', 'repro': 'read markers-ui.test.tsx MU15-MU17 at 7581483', 'added': when},
  {'id': 'A-R165-DRAFT-LOSS-TAB', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'after a blocked Enter during a held drag, a Tab or blur while the button is still held closes the marker editor through the MU13 path and the typed name is lost (by spec R2; belongs with B-R164-COMMIT-DURING-PREVIEW)', 'evidence': 'a-round-165.md reviewer (b); gates/round-165/review.md suggestion 3; doc 134 TODO; not reproduced by C (synthetic path unreachable, c-round-165.md)', 'repro': 'vitest-only: open the editor, claim a gesture, Enter (refused), blur -> editor closes without commit', 'added': when},
  {'id': 'A-R165-IME-ENTER', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'the marker name input commits on Enter without checking event.isComposing (IME composition Enter); pre-existing, not a regression', 'evidence': 'a-round-165.md reviewer (c)', 'repro': 'IME input in the marker name field -> confirm a composition with Enter -> the editor commits', 'added': when},
  {'id': 'A-R165-MU18-MISSING', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'no test for: blocked Enter -> release -> blur while the input is still mounted -> exactly one Add Marker', 'evidence': 'a-round-165.md reviewer (a)', 'repro': 'read markers-ui.test.tsx at 7581483', 'added': when},
]
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(dl))
