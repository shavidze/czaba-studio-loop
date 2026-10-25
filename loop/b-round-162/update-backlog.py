import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z128'
when = '2026-10-25 B round 162 -> 163 planning (D-29z128)'
b['updated'] = '2026-10-25 (B round 162 -> 163 planning, D-29z128)'
b['current_task'] = ("current-task.md (round 163: D-29z128 - V-3c-3a: video dock glyphs become lucide icons: float drag handle ⠿ GripVertical, "
  "expand/return ⤢ Maximize2 (both states, as the old glyph), close ✕ X; all size-2.5 strokeWidth 2.4 in the fixed 24x24 float buttons (R2''); "
  "the two 'Esc or ✕ brings it back' status sentences -> 'Esc or Close brings it back' (SG rule); baseline 9a83018 clean (gate 162 published); "
  "grants b-round-162-r163-grants.txt (6), new doc 132; B probe b-round-162/out/v3c3a-probe.json 0.000 px, centred exactly; V-3c-3b (marker row ◀▶, detail Expand/Collapse, grid ✓, ← CZABA) = round 164)")
r162 = b['rounds'][-1]
assert r162['round'] == 162
r162['status'] = 'c_pass_published'
r162['result'] = ("C PASS (c-round-162.json: browserVerified=true realVerified=true, 0 bugs; passed T162-TARGETED (358/358), SOURCE-SCOPE, AN-REVIEW, ICON-V3C2, "
  "RV1-V3C2 (max 0 px, 6 renames, 0 collisions), LANE-STATES-BOX (keyed 0.000 px, inner title spans <=0.344), FUNC-SMOKE-LANE (actions started on svg centres; clip moves one Undo entry; audio output), "
  "G162-3 anon/protected/401, PX-NET, REG-HYD; blocked G162-3 fake-Bearer 403: backend unavailable in cloud; closures C-R154-02 (no U+25A3, Instrument Sans only) and GATE139-EMPTY-VIDEO-FORMATTER (placeholder exact)); "
  "gate 162 published 9a83018e914f745dfbe06a7c075a23f8b7c93e07 on both remotes (12 paths; verify 171/171 files, 2543/2543 tests, build ok; review 9/10, 0 blocking) -> V-3c-2 done")
b['rounds'].append({
  'round': 163, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-3a video dock glyphs -> lucide icons (GripVertical, Maximize2, X) + 2 SG status sentences'],
  'note': ("baseline HEAD 9a83018 clean (gate 162 published); 981 tracked+untracked files; grants b-round-162-r163-grants.txt (6: ArrangementVideoDock.tsx, strings.ts, strings.test, floating-video, video-dock-strings-ui, doc 131 status), "
    "new b-round-162-r163-new-files.txt (doc 132), frozen 975 (b-round-162-r163-tree-sha256.txt); start copies b-round-162/r163-granted-start/; vitest base b-round-162-r163-vitest-base.txt (8 files, 197/197 run by B at 9a83018); "
    "B probe b-round-162/out/v3c3a-probe.json (D0-empty/D1-video/D2-expanded x 2 viewports: max edge delta 0.000, svg centred dx=dy=0, elementFromPoint on the svg centre resolves inside the button; DOCK-STATES-BOX baseline = its before arrays); "
    "pointer guards: handleFloatPointerDown uses event.target instanceof Element + closest('[data-video-float-action]'/'[data-video-float-handle]') -> SVG-safe, no pointer-events-none; "
    "RV-1 reference c-round-162/out/d6/d6-{W}-r1.json + b-round-162-r163-d6-key-renames.json (1 contrast key, 0 collisions); mutations m173-m177; on C PASS root publishes round 163 and round 164 = V-3c-3b unless the regression is due (on/after 2026-10-27)")})
q = b['post_current_stage_queue'][2]
q['status'] += (" | round 163 planning (D-29z128): V-3c-2 done (round 162, C PASS browserVerified=true realVerified=true, 0 bugs, published 9a83018; C-R154-02 + GATE139-EMPTY-VIDEO-FORMATTER closed); "
  "V-3c-3 split by risk: V-3c-3a video dock (float gesture/focus paths) = round 163; V-3c-3b marker row ◀▶ + detail Expand/Collapse + grid menu ✓ + ← CZABA back link = round 164")
q['v3c3a_plan_d29z128'] = {
  'round': 163,
  'split_reason': 'V-3c-3 inventory = 5 components + strings + ~6 test files + 2 docs (~13 grants, above the ~12 split threshold); the dock carries the only gesture/focus risk (float drag, focus-to-handle on pointerdown, no drag from action buttons), so it goes alone',
  'mapping_R2': {'float_drag_handle': 'GripVertical (B ruling; same as the round-162 audio clip grip)', 'expand_and_return': 'Maximize2 in both states (spec ⤢ -> Maximize2; the old glyph did not change between states; Minimize2 for the return state is a user-vetoable alternative)', 'float_close': 'X (B ruling; same as the V-3c-1 search clear)'},
  'sizing': "R2'': the float buttons are fixed 24x24 (VIDEO_FLOAT_BUTTON_CLASS h-6 w-6 flex items-center justify-center) with text-xs -> size-2.5 strokeWidth 2.4; VIDEO_FLOAT_BUTTON_CLASS unchanged (text-xs stays, V-3c-4/polish); the 10 px icon in a 24 px box is recorded under Q-V3-ICON-SIZE",
  'strings_SG': "studioVideoStrings.expanded / expandedLibraryOpened: 'Esc or ✕ brings it back.' -> 'Esc or Close brings it back.' (the close button's title is 'Close (Esc)')",
  'probe': 'b-round-162/v3c3a-probe.cjs -> out/v3c3a-probe.json + png: glyphs ⤢ 10x15, ⠿ 8.80x15, ✕ 10.06x15 at 12 px; svg 10x10 swap: 0.000 px max edge delta, centred exactly, all 3 states x 2 viewports',
  'pointer_targets': 'ArrangementVideoDock.tsx l.800 and l.813 use Element + closest(): an svg target resolves to its button; C starts each pointer action on the svg centre',
  'v3c3b_inventory': "round 164: ArrangementMarkerRow.tsx l.719/735 ◀ ▶ (marker step, navigation: B proposes ChevronLeft/ChevronRight, not Play); ArrangementDetailPanel.tsx l.1144 + strings expandText/collapseText 'Expand ▸'/'Collapse ▾' (content-sized h-6 px-2 button: word + chevron, gap rule R2'''); ArrangementGridMenu.tsx l.203-205/223-225/241-243 ✓ in a w-3 span (Check); StudioWorkspace.tsx l.2199 '← CZABA' link (ArrowLeft + text; the l.2610 shortcut hint '←/→' is key notation and stays); tests detail-panel-strings-ui l.206/215, grid-triplet-ui l.570 replace('✓') no-op; probe needed at planning",
  'out_of_studio': 'app/components/marketing/LeadMagnetPopup.tsx has glyphs but is outside Studio (VISUAL-A scope is the Studio root only); not scheduled',
  'user_vetoable': True}
dl = b['deferred_low_polish']
for e in dl:
  if e.get('id') == 'C-R154-02':
    e['status'] = 'closed round 162: C round 162 PASS browserVerified=true (group name has no U+25A3 text node; getPlatformFontsForNode lists only Instrument Sans at both viewports), published 9a83018'
  if e.get('id') == 'GATE139-EMPTY-VIDEO-FORMATTER':
    e['status'] = 'closed round 162: strings.ts videoEmptyHint interpolates STUDIO_VIDEO_IMPORT_LABEL (LG2); C round 162 browser placeholder exact at both viewports, published 9a83018'
dl += [
  {'id': 'REVIEW-R162-STATIC-CN-DEAD-TEXT', 'severity': 'low', 'status': 'deferred_low_polish', 'title': "icon-only buttons keep text-sizing classes that size no text (lane fold 'text-sm leading-none', group fold 'text-sm leading-none' inside a cn() with one static string, compact import 'text-xs')", 'evidence': 'gates/round-162/review.md suggestion 1; a-round-162.md reviewer Low; c-round-162.json notes', 'repro': 'read ArrangementGroupHeader.tsx:225-227 and ArrangementLane.tsx:685 at 9a83018', 'added': when},
  {'id': 'REVIEW-R162-REPLACE-NOOPS', 'severity': 'low', 'status': 'deferred_low_polish', 'title': "tests still call .replace('▣', '') which is now a no-op (group-volume-db l.322, track-group-mix-ui l.262/l.417, track-groups-ui l.245, track-group-collapse-ui l.246)", 'evidence': 'gates/round-162/review.md suggestion 4; doc 131 TODO', 'repro': "grep -rn \"replace('▣'\" app/lib/arrangement/__tests__", 'added': when},
  {'id': 'REVIEW-R162-STALE-GLYPH-DOCS', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'implementation docs 070 (l.16, l.71 before:content / data-fold-glyph) and 115 (l.28, l.32 ＋ strings) describe the pre-V-3c-2 glyphs', 'evidence': 'a-round-162.md reviewer notes; c-round-162.json notes', 'repro': 'read docs/implementation/2026/quarter-IV/070*, 115*', 'added': when},
]
of = b['open_findings']
of += [
  {'id': 'INFO-R162-CLIP-SVG-DOM', 'severity': 'info', 'status': 'signal (not scheduled): measure DOM node count with many clips in a later performance pass', 'title': 'each clip header now mounts an svg with child paths instead of one text span (memo unchanged)', 'source': 'gates/round-162/review.md suggestion 2', 'added': when},
  {'id': 'INFO-C162-VIDEO-INPUT-MULTIPLE', 'severity': 'info', 'status': 'note (pre-existing, unchanged by round 162)', 'title': 'the video import file chooser reports isMultiple=true; choosing one file places one clip', 'source': 'c-round-162.json notes', 'added': when},
]
for e in of:
  if e.get('id') == 'Q-V3-ICON-SIZE':
    e['note_d29z128'] = ("gate 162 reviewer suggestion 3: gap-0.75 / gap-1.25 are Tailwind spacing-multiplier utilities off the --spacing-1..24 step scale (not custom CSS); "
      "V-3c-3a puts a 10 px (size-2.5) icon in each 24x24 float button by R2''; both belong to Saba's answer on (a) 16 px spec vs (b) glyph-slot size")
  if e.get('id') == 'ARCH-CHECKPOINT-V3C':
    e['status'] = e.get('status', '') + '; still unanswered at round 163 planning (2026-10-25); round 162 architecture note: none'
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', len(dl), len(of), len(b['rounds']))
