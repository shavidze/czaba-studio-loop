import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z135'
when = '2026-10-25 B round 169 -> 170 planning (D-29z135)'
assert b['version'] == 158
b['version'] = 159
b['updated'] = '2026-10-25 (B round 169 -> 170 planning, D-29z135)'
b['current_task'] = ("current-task.md (round 170: D-29z135 - V-3c-4c-2: ArrangementDetailPanel buttons + fields. Set selection l.752, 0 dB reset l.861, header toggle l.1142: border-outline -> SURF + MOTION + rounded-md, hover:text-brand / disabled:text-dim / font-mono / pl-2 pr-1 kept (R1, R13); "
  "inputClass l.640 radius only, border-outline-strong kept (R3, TH5, PM1/PM2, F4); excluded framed boxes l.221/l.702 (V-3c-5, detail-panel-polish l.128 locks l.221), fader l.841, resize handle l.1121, header border-b l.1124 (R14); fallback (c); "
  "B probe b-round-169/out/v3c4c2-probe.json (0.000 px layout D0-D2 both viewports; enabled 14.78 -> 13.24, hover 6.58; disabled 5.38 -> 4.82 informational); "
  "baseline 352dc91 clean (gate 169 published); 988 files, frozen 985, grants b-round-169-r170-grants.txt (3), new doc 139; vitest base 11 files 183/183; locks DSU1, DFR1; mutations m213-m218)")
r = b['rounds'][-1]
assert r['round'] == 169
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-169.json: browserVerified=true realVerified=true, 0 bugs; passed T169-TARGETED 165/165, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4C1 1440+1280 P0-P3 (toggle off transparent 1 px border, Stop accent border kept, Add brand border, 8 px, 5/8/12 % fill, 0.18 s cubic-bezier; reduced motion none; 4x crops), "
  "BOX-V3C4C1 (max 0.00 px), CONTRAST-V3C4C1 (7.05 rest / 6.58 hover / 5.82 press), RV1-V3C4C1 (0 missing/added, failing set = reference), FUNC-SMOKE-V3C4C1 1440+1280 (real preview audio peak > 0.01 in 92/94 ms, < 0.001 after Stop in 91/87 ms; Add + Undo; option select + double-click add; search filter 9 -> 1 + clear; collapse/expand focus hand-off), G169-3, PX-NET/REG-HYD; "
  "blocked fake-Bearer 403 (backend unavailable in cloud); 1 invalid cold-Vite run replaced; notes C-R169-N1 double focus ring on library search (pre-existing), N2 active fill 5.82, N3 module-level helpers); "
  "gate 169 published 352dc914f6b0f6c05030f9762cc42fd3c2270250 on both remotes (5 paths; verify 171 files / 2564 tests pass, build green; review 9/10, 0 blocking) -> V-3c-4c-1 done")
b['rounds'].append({
  'round': 170, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-4c-2 (ArrangementDetailPanel: Set selection, 0 dB reset, header toggle surfaces; range + Clip Gain input radius)'],
  'note': ("baseline HEAD 352dc91 clean (gate 169 published); 988 files; grants b-round-169-r170-grants.txt (3: ArrangementDetailPanel, detail-panel-strings-ui, doc 138 status), new b-round-169-r170-new-files.txt (doc 139), "
    "frozen 985 (b-round-169-r170-tree-sha256.txt); start copies b-round-169/r170-granted-start/; vitest base b-round-169-r170-vitest-base.txt (11 files, 183/183 by B at 352dc91); "
    "C rows T170-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4C2 (D0 none, D1 clip, D2 collapsed; disabled informational; reduced motion; 4x crops), BOX-V3C4C2 (vs B probe before boxes), CONTRAST-V3C4C2, RV1-V3C4C2 (c-round-169 d6), FUNC-SMOKE-V3C4C2 (real clip select, Set selection range, Clip Gain type + Enter + 0 dB reset + Undo with real audio level, toggle mouse + keyboard focus), FOCUS-RING-INFO, G170-3, PX-NET/REG-HYD; "
    "on C PASS round 171 = REGRESSION if planned on/after 2026-10-27, else V-3c-4c-3 (ExportDialog + VideoDock + MarkerRow l.811 question)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 170 planning (D-29z135): V-3c-4c-1 done (round 169, C PASS browserVerified=true realVerified=true, 0 bugs, published 352dc91); V-3c-4c-2 DetailPanel = round 170; then V-3c-4c-3 (171 unless the regression is due), V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = ("V-3 remainder: V-3c-4a done (round 167, 1fef377); V-3c-4b done (round 168, e50498f); V-3c-4c-1 done (round 169, 352dc91); V-3c-4c-2 ArrangementDetailPanel = round 170 (D-29z135: Set selection l.752, 0 dB reset l.861, toggle l.1142, inputClass l.640; framed boxes l.221/l.702 -> V-3c-5); "
  "V-3c-4c-3 ArrangementExportDialog (secondary l.581/l.596, primary l.615, radio cards l.288-423 are labels) + ArrangementVideoDock (VIDEO_FLOAT_BUTTON_CLASS l.59-60 legibility over video, l.911) + open question ArrangementMarkerRow l.811 flag chip (inventory line numbers at 330f1f3, re-grep at planning); "
  "V-3c-5 (10 px panel radius incl. DetailPanel framed boxes l.221/l.702 and detail-panel-polish l.128 lock; keep the overview frame radius equal to its root, lock OV1)")
q['v3c4c2_plan_d29z135'] = {
  'round': 170,
  'probe': 'b-round-169/v3c4c2-probe.cjs -> out/v3c4c2-probe.json (D0 nothing selected + panel open, D1 one clip selected via Enter-add of demo-middle-east on Music at 1 s + panel open, D2 collapsed) + png; 1440 + 1280: every button/a/input/select/[data-testid]/[role] box max 0.000 px, 0 added/missing, restore 0; radius 6 -> 8; border rgb(36,33,30) -> transparent; fill rgb(22,20,18) -> rgb(33,31,28); enabled (toggle, Set selection with a clip) 14.78 -> 13.24, hover (8 % + hover:text-brand) 6.58; disabled (Set selection with no clip, 0 dB reset at 0 dB) 5.38 -> 4.82, hover unchanged (disabled:text-dim wins, enabled: fills off); inputs 5.69 radius only, border rgb(115,107,96) kept; transition after swap background-color, color 0.18s; fill vs surface 1.12 (spec trade-off)',
  'rulings': {
    'R1': 'same SURF + MOTION + rounded-md token set (toolButtonClass); each button keeps size, padding, text colour, hover:text-brand, focus ring and disabled:text-dim (V-3c-4a R1 precedent, MarkerRow l.51 keeps hover:text-foreground)',
    'R3': 'inputClass l.640 (range start/end, Clip Gain input) radius only; border-outline-strong kept (TH5); pending cn(...border-warning) unchanged (PM1/PM2, detail-panel-fit F4)',
    'R13': 'Set selection l.752, 0 dB reset l.861 (font-mono kept, TH10 l.405), header toggle l.1142 (inline-flex items-center gap-0.5 pl-2 pr-1 kept, DPS5): border-outline -> border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 + MOTION, rounded-sm -> rounded-md; static strings, one border colour each; disabled:opacity-40 not added (disabled cue stays text-dim)',
    'R14': 'excluded: video/waveform framed box l.221 (V-3c-5; detail-panel-polish l.128 WAVEFORM_BOX_CLASS exact string), reason box l.702 (V-3c-5 framed box), Clip Gain fader l.841 (range input, same category as the V-3c-4b range inputs), resize handle l.1121 (role separator), header border-b l.1124 and panel border-t l.1095 (dividers)'},
  'locks': 'DSU1 (Set selection, 0 dB reset, toggle token lists, collapsed and expanded), DFR1 (start/end/Clip Gain input radius + border-outline-strong; pending keeps border-warning and rounded-md); mutations m213-m218',
  'checkpoint': 'still unanswered -> fallback (c); pointer b-round-169-checkpoint-request.md',
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
a = find('ARCH-CHECKPOINT-V3C')
a['status'] = a.get('status', '') + ("; still unanswered at round 170 planning -> fallback (c) for V-3c-4c-2; round 169 added 2 copies (LibraryPreview toggle l.307, Add l.332), round 170 adds 3 (DetailPanel l.752/l.861/l.1142); A's code-reviewer and gate-169 reviewer both propose lib/arrangement/surface-classes.ts after Q1; pointer b-round-169-checkpoint-request.md")
s = find('ARCH-R167-SURFACE-RECIPE')
s['status'] = s.get('status', '') + ('; round 169 update: SURF/FILL/MOTION now in 9 components (gate-169 review), 14 copies; round 170 adds 3 in ArrangementDetailPanel (10th component); proposal: one bounded task adding lib/arrangement/surface-classes.ts + one token-lock test, existing per-file locks stay green, no visible change; still not scheduled (awaits checkpoint Q1)')
s['evidence'] = s.get('evidence', '') + '; a-round-169.md Architecture note; gates/round-169/review.md Architecture note'
dl = b['deferred_low_polish']
dl.append({'id': 'C-R169-N1-SEARCH-DOUBLE-RING', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'focused library search field shows two brand rings: global :focus-visible outline 2px offset 2px (inferred: unlayered rule app/styles/app.css l.378 beats Tailwind focus:outline-none) plus focus:border-brand; with the 8 px radius the two radii look worse; pre-existing (visible at e50498f)', 'evidence': 'c-round-169.md Notes C-R169-N1, c-round-169/out/c169-n1.json, shots/surf/crop4x-*-P1-selected-query-search-clear-1.png; gates/round-169/review.md suggestion 2', 'repro': '/studio-lab 1440x900, click into arrangement-library-search: outline solid 2px rgb(201,164,106) offset 2px + border rgb(201,164,106)', 'owner_note': 'app/styles/app.css is protected for VISUAL-A class-only stages; fix = one ring only on this field, confirmed by a real browser focus check; round 170 C records whether the DetailPanel inputs share it (FOCUS-RING-INFO)', 'added': when})
dl.append({'id': 'GATE169-TEST-HYGIENE-LIBRARY-STRINGS', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'library-row-strings-ui.test.tsx: beforeEach/afterEach audio stubs duplicated from the first describe; view.unmount() after the asserts leaves the tree mounted when an assert fails; module-level helpers outside the new describe', 'evidence': 'gates/round-169/review.md suggestion 3; a-round-169.md note 2; c-round-169.json C-R169-N3', 'repro': 'read library-row-strings-ui.test.tsx l.119-134, l.193, l.217 at 352dc91', 'added': when})
dl.append({'id': 'B-R169-1280-SET-SELECTION-SQUASH', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'at 1280x720 with the Clip details panel open (142 px) the Set selection button (h-6) is squeezed to 18 px (no clip) / 23 px (one clip) by the flex column, and the reason line under it (Select a clip first) is cut at the panel edge; pre-existing at 352dc91 (same before and after the planned V-3c-4c-2 swap)', 'evidence': 'b-round-169/out/v3c4c2-probe.json 1280 D0/D1 detail-apply box [862,620,90,18] / [862,620,90,23]; b-round-169/out/v3c4c2-probe-1280-D0-none-open-after.png', 'repro': '/studio-lab 1280x720, expand Clip details, nothing selected: getBoundingClientRect of arrangement-detail-apply height 18', 'owner_note': 'owned by ArrangementDetailPanel; not fixed in round 170 because the fix (shrink-0 or a taller panel) changes layout and the V-3c-4c-2 acceptance is 0 px; candidate for V-3c-5 or the polish pass', 'added': when})
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(of), len(dl))
