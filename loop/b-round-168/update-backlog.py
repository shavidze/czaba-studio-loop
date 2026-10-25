import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z134'
when = '2026-10-25 B round 168 -> 169 planning (D-29z134)'
assert b['version'] == 157
b['version'] = 158
b['updated'] = '2026-10-25 (B round 168 -> 169 planning, D-29z134)'
b['current_task'] = ("current-task.md (round 169: D-29z134 - V-3c-4c-1: Library + Library preview buttons. Preview toggle off border-outline/hover:border-brand -> SURF + MOTION + rounded-md (R9); "
  "Stop keeps border-accent text-accent + 5/8/12 fill, hover:bg-accent/10 removed (R10, not byte-identical, gives hover feedback); Add takes the Export look (R11: bg-brand/10 + hover:bg-brand/20 -> bg-foreground/5 + enabled:hover 8 / active 12 + MOTION, border-brand text-brand kept, no border-transparent); "
  "option rows, expand, collapse, search clear radius only (R7); search input radius only, border-outline-strong kept (R3, TH5); excluded preview wave, tree nodes/tree fold (no radius today), resize handle (R12); fallback (c); "
  "B probe b-round-168/out/v3c4c1-probe.json + v3c4c1-probe-add.json (0.000 px layout P0-P3 both viewports; toggle 7.88 -> 7.05 hover 6.58; Add 6.69 -> 7.05 hover 5.48 -> 6.58); "
  "baseline e50498f clean (gate 168 published); 987 files, frozen 983, grants b-round-168-r169-grants.txt (4), new doc 138; vitest base 8 files 163/163; locks LBS1, LPS1; mutations m206-m212)")
r = b['rounds'][-1]
assert r['round'] == 168
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-168.json: browserVerified=true realVerified=true, 0 bugs; passed T168-TARGETED 251/251, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4B 1440+1280 S0-S4 (transparent 1 px border, 8 px, 5/8/12 % fill, 0.18 s cubic-bezier; on-states keep fill; mixed Solo rest = 1fef377, hover right half rgb(45,41,38); reduced motion none incl. the full import button; 4x crops), "
  "BOX-V3C4B (max 0.000 px every site every state), CONTRAST-V3C4B (lane off 5.98 / hover 12.35, group off 5.57 / 11.46, on 8.32, import 7.05 / 6.58, mixed 13.94 / 11.46), RV1-V3C4B (0 missing/added, failing set identical), "
  "FUNC-SMOKE-V3C4B 1440+1280 (real audio lane Mute silent < 0.001 in 80-101 ms, Solo, group Mute/Solo incl. mixed; real video import via file chooser with a painted dock frame; fold, name, Ctrl+click, pan reset, rename + Undo), G168-3, PX-NET, REG-HYD; "
  "blocked fake-Bearer 403 (backend unavailable in cloud); 1 invalid cold-Vite run replaced); gate 168 published e50498fe20e6952f6eb0b42a7e9ec542fd0b67d9 on both remotes (7 paths; verify 171 files / 2562 tests pass, build green; review 9/10, 0 blocking) -> V-3c-4b done")
b['rounds'].append({
  'round': 169, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-4c-1 (ArrangementLibraryPreview Preview/Stop toggle + Add; ArrangementLibrary option rows, expand, collapse, search clear, search input radius)'],
  'note': ("baseline HEAD e50498f clean (gate 168 published); 987 files; grants b-round-168-r169-grants.txt (4: ArrangementLibrary, ArrangementLibraryPreview, library-row-strings-ui, doc 137 status), new b-round-168-r169-new-files.txt (doc 138), "
    "frozen 983 (b-round-168-r169-tree-sha256.txt); start copies b-round-168/r169-granted-start/; vitest base b-round-168-r169-vitest-base.txt (8 files, 163/163 by B at e50498f); "
    "C rows T169-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4C1 (P0-P3, Stop hover/press, disabled informational, reduced motion, 4x crops), BOX-V3C4C1 (vs B probe before boxes), CONTRAST-V3C4C1, RV1-V3C4C1 (c-round-168 d6), FUNC-SMOKE-V3C4C1 (real preview audio start/stop, Add + Undo, option select/double-click, search + clear, collapse/expand focus), G169-3, PX-NET/REG-HYD; "
    "on C PASS round 170 = V-3c-4c-2 (DetailPanel) unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 169 planning (D-29z134): V-3c-4b done (round 168, C PASS browserVerified=true realVerified=true, 0 bugs, published e50498f); V-3c-4c split by owner: V-3c-4c-1 Library + LibraryPreview = round 169, V-3c-4c-2 DetailPanel (170), V-3c-4c-3 ExportDialog + VideoDock + MarkerRow l.811 chip question (171); then V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = ("V-3 remainder: V-3c-4a done (round 167, 1fef377); V-3c-4b done (round 168, e50498f); V-3c-4c split by owner (D-29z134): V-3c-4c-1 Library + LibraryPreview = round 169; V-3c-4c-2 ArrangementDetailPanel (buttons l.752/l.861, toggle l.1142, inputs l.640; framed boxes l.221/l.702 -> V-3c-5); "
  "V-3c-4c-3 ArrangementExportDialog (secondary l.581/l.596, primary l.615, radio cards l.288-423 are labels) + ArrangementVideoDock (VIDEO_FLOAT_BUTTON_CLASS l.59-60 legibility over video, l.911) + open question ArrangementMarkerRow l.811 flag chip (inventory line numbers at 330f1f3, re-grep at planning); "
  "V-3c-5 (10 px panel radius; keep the overview frame radius equal to its root, lock OV1)")
q['v3c4c1_plan_d29z134'] = {
  'round': 169,
  'probe': 'b-round-168/v3c4c1-probe.cjs -> out/v3c4c1-probe.json (P0 default, P1 selected + query, P2 previewing, P3 collapsed) + v3c4c1-probe-add.cjs -> out/v3c4c1-probe-add.json (P1, Add Export look) + png; 1440 + 1280 identical: every box max 0.000 px, 0 added/missing, restore 0; radius 6 -> 8; toggle off border rgb(36,33,30) -> transparent, 7.88 -> 7.05, hover 6.58; Stop accent border kept, 7.88 -> 7.05, hover 6.58; Add brand/10 rgb(40,35,27) -> rgb(33,31,28), 6.69 -> 7.05, hover 5.48 -> 6.58; option row 12.56, icon buttons 6.68 / hover 13.94 / 14.78 unchanged; search 15.62 border-outline-strong kept; fill vs surface 1.12 (spec trade-off, informational)',
  'twmerge_fact': "cn(base with SURF, 'border-accent text-accent') drops border-transparent, keeps bg-foreground/5 + enabled:hover/active fills; cn(base, 'text-brand') keeps the whole base (node, installed tailwind-merge)",
  'rulings': {
    'R1': 'same SURF + MOTION + rounded-md token set (toolButtonClass); FILL = SURF without border-transparent',
    'R3': 'search input radius only, border-outline-strong kept (TH5)',
    'R7': 'borderless buttons radius only, no fill, no MOTION: option rows l.99 (button role=option), expand l.438, collapse l.457, search clear l.482',
    'R9': "toggle off: base SURF + MOTION + rounded-md; 'border-outline text-brand hover:border-brand' -> 'text-brand' (hover feedback = 8 % fill; disabled toggle no longer tints on hover)",
    'R10': "Stop: 'border-accent text-accent hover:bg-accent/10' -> 'border-accent text-accent' (outline button -> R6/Export pattern with the 5/8/12 fill; gives hover/press feedback unlike R2 on-states; not byte-identical by design)",
    'R11': 'Add takes the Export look: rounded-md, bg-brand/10 -> bg-foreground/5, hover:bg-brand/20 -> enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12, + MOTION; keep border border-brand text-brand font-medium; no border-transparent (static string)',
    'R12': 'excluded: preview wave l.251 (role=slider), tree nodes treeNodeClass l.42-43 and tree fold l.534 (no radius today, border-l-2 stripe), resize handle l.638 (role=separator), preview border-t divider l.228'},
  'locks': 'LBS1 (option row, collapse, search clear, expand radius; search input radius + border-outline-strong), LPS1 (toggle off/on, Add token lists); mutations m206-m212',
  'split': 'V-3c-4c-1 = round 169; V-3c-4c-2 = DetailPanel (170); V-3c-4c-3 = ExportDialog + VideoDock + MarkerRow l.811 question (171)',
  'checkpoint': 'still unanswered -> fallback (c); reviewers disagree on timing (A reviewer after 4c, gate-168 reviewer before 4c); pointer b-round-168-checkpoint-request.md',
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
a = find('ARCH-CHECKPOINT-V3C')
a['status'] = a.get('status', '') + ("; still unanswered at round 169 planning -> fallback (c) for V-3c-4c-1; round 168 adds 5 copies (Lane l.613/631/723/731, GroupHeader l.37); A's code-reviewer: extract after V-3c-4c with Q2; gate-168 reviewer: extract before V-3c-4c (studioButtonSurfaceClass / studioButtonMotionClass + own token test); pointer b-round-168-checkpoint-request.md (answer wanted by round 170 planning)")
s = find('ARCH-R167-SURFACE-RECIPE')
s['status'] = s.get('status', '') + ('; round 168 update: 12 copies in 7 files after V-3c-4b (gate-168 reviewer counts Transport, Lane x4, GroupHeader); reviewers disagree on timing (after vs before V-3c-4c); a file-local LANE_MIX_BUTTON_CLASS was also suggested (gates/round-168/review.md suggestion 1); still not scheduled')
s['evidence'] = s.get('evidence', '') + '; a-round-168.md Architecture note; gates/round-168/review.md suggestion 1 + Architecture note'
h = find('Q-R167-ON-HOVER')
h['status'] = h.get('status', '') + '; browser-confirmed by C round 168 (Lane/Group Mute/Solo on: 8.32 rest = hover = press); still awaiting_user; V-3c-4c-1 Stop (R10) is an outline button and does give hover feedback'
h['evidence'] = h.get('evidence', '') + '; c-round-168.json notes 1; gates/round-168/review.md suggestion 4'
of.append({'id': 'C-R168-BORDERLESS-REDUCED-MOTION', 'severity': 'info (signal)', 'status': 'signal, not scheduled: borderless header buttons (lane fold/name/pan reset, group fold/name; also the library icon buttons and option rows kept radius-only by R7 in V-3c-4c-1) keep the global app.css interactive transition (150 ms ease-out color/background/border/box-shadow/transform/opacity) under prefers-reduced-motion; pre-existing, not changed by V-3c-4b; candidate for V-3c-5 or a motion audit together with ROOT-GLOBAL-TRANSITION-RULE', 'evidence': 'c-round-168.json notes 2; c-round-168.md Notes for B', 'added': when})
of.append({'id': 'C-R168-1280-COMPACT-IMPORT', 'severity': 'info (pre-existing behaviour)', 'status': 'recorded: at 1280x720 with a group row present the video lane uses the tight density and shows the compact import button; pre-existing density behaviour, not a V-3c-4b change', 'evidence': 'c-round-168.md FUNC-SMOKE video import', 'added': when})
of.append({'id': 'GATE168-BEHAVIOUR-TRANSITION', 'severity': 'info (note)', 'status': 'recorded: Lane/Group Mute/Solo now animate the 5 % -> accent/brand toggle over 180 ms (spec motion), focus ring (box-shadow) not transitioned; motion-reduce:transition-none! in place; matches the spec, not a bug', 'evidence': 'gates/round-168/review.md suggestion 2', 'added': when})
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(of))
