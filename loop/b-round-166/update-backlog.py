import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z132'
when = '2026-10-25 B round 166 -> 167 planning (D-29z132)'
assert b['version'] == 155
b['version'] = 156
b['updated'] = '2026-10-25 (B round 166 -> 167 planning, D-29z132)'
b['current_task'] = ("current-task.md (round 167: D-29z132 - V-3c-4a: toolbar button surfaces in StudioWorkspace (Snap, Env + grid/waveform-zoom select radius), ArrangementTempoRow (Metronome + BPM input radius), ArrangementMarkerRow (MARKER_HEADER_BUTTON_CLASS + name input radius), ArrangementMaster (Peak, Mute): "
  "border-outline -> border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 + 4 MOTION tokens, rounded-sm -> rounded-md; on-states keep their strings + same hover/active fill (Loop precedent); fields radius only; fallback (c) copies (checkpoint unanswered); "
  "B probe b-round-166/out/v3c4a-probe.json (0.000 px layout, off-state contrast 6.68 -> 5.98, hover 12.35, on 5.48/8.32, both viewports); RV-1 reference c-round-166/out/d6, no renames; "
  "baseline 330f1f3 clean (gate 166 published); grants b-round-166-r167-grants.txt (9), new doc 136; vitest base 12 files 176/176; locks TS8, UI11, MS5, HM7; mutations m192-m198)")
r = b['rounds'][-1]
assert r['round'] == 166
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-166.json: browserVerified=true realVerified=true, 0 bugs; passed T166-TARGETED 211/211, SOURCE-SCOPE, AN-REVIEW, ICON-V3C3B 1440+1280, ICON-BOX 1440+1280 (max 0.468 px, 0 added/missing, identical to B's simulation), RV1-V3C3B 1440+1280 (max 0.5 d6-rounded, 0 missing/added after the 6-key map), "
  "FUNC-SMOKE-V3C3B 1440+1280 (svg-centre clicks; marker step 2/6/2, Ctrl+arrows, +, toggle x4, grid 1/8 + Snap + keyboard, exit to /, real audio peak 0.374), G166-3, PX-NET, REG-HYD; blocked fake-Bearer 403 (backend unavailable in cloud); "
  "1 invalid cold-Vite load replaced (ENV-FIRST-LOAD-LUCIDE)); gate 166 published 330f1f32094c758c3bdbd178b7347e667781a309 on both remotes (12 paths; verify 171 files pass, build green; review 9/10, 0 blocking) -> V-3c-3b done, V-3c-3 complete")
b['rounds'].append({
  'round': 167, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-4a (toolbar button surfaces: Snap, Env, Metronome, marker header buttons, Master Peak, Master Mute; field radius: BPM input, grid select, waveform-zoom select, marker name input)'],
  'note': ("baseline HEAD 330f1f3 clean (gate 166 published); 985 files; grants b-round-166-r167-grants.txt (9: StudioWorkspace (4 class sites), ArrangementTempoRow, ArrangementMarkerRow, ArrangementMaster, transport-surface-ui, metronome-ui, marker-strings-ui, header-meter-envelope-strings-ui tests, doc 135 status), new b-round-166-r167-new-files.txt (doc 136), "
    "frozen 976 (b-round-166-r167-tree-sha256.txt); start copies b-round-166/r167-granted-start/; vitest base b-round-166-r167-vitest-base.txt (12 files, 176/176 by B at 330f1f3); "
    "C rows T167-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4A (computed border/radius/bg rest-hover-active/transition, reduced motion, fields, 4x crops), BOX-V3C4A (vs B probe before boxes, 0.00 expected), CONTRAST-V3C4A, RV1-V3C4A (c-round-166 d6, no renames), FUNC-SMOKE-V3C4A (incl. real audio + master mute), G167-3, PX-NET/REG-HYD; "
    "on C PASS round 168 = V-3c-4b unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 167 planning (D-29z132): V-3c-3b done (round 166, C PASS browserVerified=true realVerified=true, 0 bugs, published 330f1f3) -> V-3c-3 complete, glyph-to-icon work complete; "
  "V-3c-4 split by owner (V-3c-4a toolbar controls StudioWorkspace/TempoRow/MarkerRow/Master = round 167; V-3c-4b Lane + GroupHeader Mute/Solo + Lane video import; V-3c-4c DetailPanel, LibraryPreview + Library search, ExportDialog, VideoDock float buttons); checkpoint unanswered -> fallback (c); "
  "then V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = ("V-3 remainder: V-3c-3b done (round 166, published 330f1f3); V-3c-4a = round 167 (D-29z132, fallback (c)), V-3c-4b, V-3c-4c (inventory v3c4a_plan_d29z132.v3c4_inventory), "
  "V-3c-5 (10 px panel radius; keep the overview frame radius equal to its root, lock OV1)")
q['v3c4a_plan_d29z132'] = {
  'round': 167,
  'spec': 'visual-direction-a.md section buttons and surfaces: border -> foreground fill 5/8/12 %, transparent 1 px border kept, buttons and fields 8 px radius, motion background-color,color 180ms cubic-bezier(.2,.8,.2,1), off under reduced motion',
  'probe': 'b-round-166/v3c4a-probe.cjs -> out/v3c4a-probe.json + png (S0-default, S3-on; 1440 + 1280 identical): every button/a/input/select/[data-testid]/[role] box max 0.000 px, 0 added/missing; radius 6 -> 8 px; off-state muted text 6.68 -> 5.98 (fill rgb(33,31,28) on surface rgb(22,20,18)); hover 12.35; on-state accent/20 5.48; Master Mute on 8.32; disabled metronome 2.59 -> 2.52 (exempt); fields unchanged (15.62, 14.78); colours parsed through a canvas (Tailwind v4 emits oklab)',
  'rulings': {
    'R1': 'surface token set copied from ArrangementTransport toolButtonClass: SURF border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12; MOTION motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!; rounded-sm -> rounded-md; NOT copied: inline-flex, h-8, items-center, gap-1, px-2.5, text-sm, text-foreground, disabled:opacity-40; each button keeps size/padding/text colour/hover text/focus/disabled cue',
    'R2': 'on-state strings stay byte-identical (twMerge drops the base border/fill); same hover/active fill appended so hover keeps the on-fill (Loop precedent ArrangementTransport l.234): Snap/Env/Metronome on + enabled:hover:bg-accent/20 enabled:active:bg-accent/20; Master Mute on + enabled:hover:bg-accent enabled:active:bg-accent; Master Peak over: separate cn argument enabled:hover:bg-destructive/15 enabled:active:bg-destructive/15 (over string counted by TH10 stays byte-identical)',
    'R3': 'fields keep their border (spec removes the border on buttons only; radius applies to buttons and fields): BPM input, grid select, waveform-zoom select, marker name input -> rounded-md only',
    'R4': '16 px high controls (marker + / prev / next, metronome) become pill/circle shapes at 8 px radius; spec taken literally; C records 4x crops; user-vetoable',
    'R5': 'out of this slice: demo badge span (StudioWorkspace l.2210), exit link rounded-sm (l.2197, borderless link), marker flag label chip (ArrangementMarkerRow l.811, a label), structural row dividers'},
  'checkpoint': 'b-round-160-checkpoint-request.md + b-round-165-checkpoint-request.md still unanswered at round 167 planning -> fallback (c): copies per component locked by tests; repeated to root at the feature boundary (b-round-166.md)',
  'locks': 'TS8 (Snap/Env off+on, selects, Master Mute off+on, Peak clear), UI11 (metronome disabled/on, BPM input), MS5 (marker header buttons, name input), HM7 (Peak over + reset); mutations m192-m198',
  'v3c4_inventory': {
    'V-3c-4a (round 167)': 'StudioWorkspace l.2285-2286 Snap, l.2365-2366 Env, l.2326 grid select (radius), l.2384 waveform-zoom select (radius); ArrangementTempoRow l.241-242 Metronome, l.230 BPM input (radius); ArrangementMarkerRow l.51 MARKER_HEADER_BUTTON_CLASS, l.847 name input (radius); ArrangementMaster l.108-111 Peak, l.170-173 Mute (line numbers at 330f1f3)',
    'V-3c-4b': 'ArrangementLane l.613-616 Mute, l.631-634 Solo (h-6 w-6; on-states border-accent bg-accent / border-brand bg-brand), l.723 and l.731 video import buttons (border-brand text-brand hover:bg-brand/10: brand outline like transport Export -> radius only + motion is the default ruling to confirm), l.685 fold button and l.697 name button and l.779 volume readout (rounded-sm, borderless -> radius ruling); ArrangementGroupHeader l.36-37 TRACK_GROUP_MIX_BUTTON_CLASS + l.288-289 mute and l.303-306 solo (incl. the half-solo gradient), l.226 fold button, l.252 rename input (field radius), l.269 name button',
    'V-3c-4c': 'ArrangementDetailPanel l.752 and l.861 buttons, l.1142 toggle, l.640 inputs (field radius), l.221 and l.702 framed boxes (panel radius = V-3c-5); ArrangementLibraryPreview l.307-310 Preview/Stop, l.334 Add (brand fill/10); ArrangementLibrary l.473 search field (radius), l.99 row, l.438/l.457 icon buttons, l.482 clear; ArrangementExportDialog l.581/l.596 secondary buttons (hover:border-outline-hover), l.615 primary (brand fill), l.288-423 radio cards (decision: cards are labels, not buttons); ArrangementVideoDock l.59-60 VIDEO_FLOAT_BUTTON_CLASS (bg-background/80 over video: legibility over the picture, own ruling), l.911 button; open question: ArrangementMarkerRow l.811 marker flag label chip'},
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
a = find('ARCH-CHECKPOINT-V3C')
a['status'] = a.get('status', '') + ("; still unanswered at round 167 planning (2026-10-25) -> fallback (c) applied to V-3c-4a; repeated to root at the feature boundary (end of the V-3 glyph work) in b-round-166.md: V-3c-4b/4c copy SURF + MOTION into 5 more components, so Q1/Q2 have their highest value now; "
  "round 166 architecture notes: A reviewer none; gate-166 reviewer none, plus the planner note that the icon size/stroke props repeat at 7 sites (Q3 signal GATE166-ICON-PROPS)")
qi = find('Q-V3-ICON-SIZE')
qi['note_d29z132'] = 'V-3c-4a R4: an 8 px radius on the 16 px-high marker header buttons and metronome makes pill/circle shapes (the + becomes a circle); spec taken literally; Saba may veto with C round 167 4x crops'
of.append({'id': 'GATE166-ICON-PROPS', 'severity': 'info (signal)', 'status': 'signal: not scheduled; the gate-166 reviewer notes the icon props (size-* shrink-0, strokeWidth 2.4, aria-hidden) repeat at 7 sites across V-3c; one ICON_STROKE constant in lib/arrangement is worth it only if the stroke changes again; carried as checkpoint Q3 evidence', 'evidence': 'gates/round-166/review.md suggestion 3 + Architecture note', 'added': when})
of.append({'id': 'Q-R166-EXIT-NAME', 'severity': 'info (user question)', 'status': "awaiting_user: the exit link's accessible name became 'CZABA' in round 166 (ruling R3, D-29z131); the old name '← CZABA' did not say 'back to the store' either; option from the gate-166 reviewer and A's reviewer: aria-label 'Back to CZABA' (label-in-name preserved, WCAG 2.5.3); not scheduled until Saba answers", 'evidence': 'gates/round-166/review.md suggestion 2; a-round-166.md reviewer Low 4; c-round-166.json notesForB R3', 'added': when})
of.append({'id': 'C-R166-TRIPLET-CHECKED-BROWSER', 'severity': 'info (evidence gap)', 'status': 'open evidence note: the Grid menu Triplets (3) checked-state Check icon was not exercised in the browser in round 166 (only its unchecked span at BPM 120); covered by vitest TU11 only; C adds one browser look in the next round that opens the grid menu with a tempo (V-3c-4b/4c or the regression round)', 'evidence': 'c-round-166.json notesForB', 'added': when})
dl = b['deferred_low_polish']
dl += [
  {'id': 'GATE166-TS7-INDEXOF', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'TS7 slices the header text with headerText.indexOf(heading.textContent); if the h1 text appears earlier in the header the slice is wrong; check exit.textContent and exit.previousSibling == null (or compareDocumentPosition) instead', 'evidence': 'gates/round-166/review.md suggestion 4', 'repro': 'read transport-surface-ui.test.tsx TS7 at 330f1f3', 'added': when},
  {'id': 'GATE166-GRID-ARIA-HIDDEN-DUP', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'grid menu check svg carries aria-hidden inside a span that is already aria-hidden (harmless duplicate; kept for the icon recipe)', 'evidence': 'gates/round-166/review.md suggestion 3; a-round-166.md reviewer nit 5', 'repro': 'read ArrangementGridMenu.tsx l.205/227/247 at 330f1f3', 'added': when},
]
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(dl))
