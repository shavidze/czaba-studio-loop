import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z133'
when = '2026-10-25 B round 167 -> 168 planning (D-29z133)'
assert b['version'] == 156
b['version'] = 157
b['updated'] = '2026-10-25 (B round 167 -> 168 planning, D-29z133)'
b['current_task'] = ("current-task.md (round 168: D-29z133 - V-3c-4b: Lane + Group header buttons. Lane/Group Mute/Solo border-outline -> SURF + MOTION + rounded-md, on-states byte-identical + same hover/active fill (R2), "
  "group mixed Solo string byte-identical (R8: twMerge 3.4.0 drops bg-foreground/5 next to bg-gradient-to-r, rest look unchanged, hover 8 %); video import buttons take the Export look (R6: border-brand text-brand + bg-foreground/5 hover 8/active 12 + MOTION, hover:bg-brand/10 removed); "
  "borderless lane fold/name/pan reset + group fold/name radius only (R7); group rename input radius only (R3); TH10 one-string grant (G-TH); fallback (c); "
  "B probe b-round-167/out/v3c4b-probe.json + v3c4b-probe-S2.json (0.000 px layout S0-S4 both viewports; off 6.68 -> 5.98 lane, 6.30 -> 5.57 group; import 7.88 -> 7.05, hover 6.58; on 8.32); "
  "baseline 1fef377 clean (gate 167 published); 986 files, frozen 980, grants b-round-167-r168-grants.txt (6), new doc 137; vitest base 12 files 249/249; locks LSU7, UM11, TH10; mutations m199-m205)")
r = b['rounds'][-1]
assert r['round'] == 167
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-167.json: browserVerified=true realVerified=true, 0 bugs; passed T167-TARGETED 180/180, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4A 1440+1280 (S0, S3, real S4 Peak overload, S5, reduced motion none on 8 buttons, 4x crops), BOX-V3C4A 1440+1280 (0.000 px on 11 controls S0+S3), "
  "CONTRAST-V3C4A 1440+1280 (off 5.98, hover 12.35, held 10.93, on 5.48, mute on 8.32, Peak over 4.72; disabled metronome 2.52 exempt), RV1-V3C4A 1440+1280 (0 missing/added, max box 0, failing set identical), FUNC-SMOKE-V3C4A 1440+1280 (incl. real audio, Master Mute silent < 0.001 from 61-87 ms, Triplets checked icon), G167-3, PX-NET, REG-HYD; "
  "blocked fake-Bearer 403 (backend unavailable in cloud); invalid runs: 1 cold-Vite load (ENV-FIRST-LOAD-LUCIDE), 1 C script defect re-run); gate 167 published 1fef3770879b34d6633e26e8f3a01a83742d7f78 on both remotes (10 paths; verify 171 files pass, builds green; review 8/10, 0 blocking) -> V-3c-4a done")
b['rounds'].append({
  'round': 168, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-4b (Lane Mute/Solo, video import compact + full, lane fold/name/pan reset radius; GroupHeader mix buttons Mute/Solo incl. mixed, fold/name radius, rename input radius)'],
  'note': ("baseline HEAD 1fef377 clean (gate 167 published); 986 files; grants b-round-167-r168-grants.txt (6: ArrangementLane, ArrangementGroupHeader, lane-strings-ui, track-group-mix-ui, studio-theme-obsidian (G-TH one string), doc 136 status), new b-round-167-r168-new-files.txt (doc 137), "
    "frozen 980 (b-round-167-r168-tree-sha256.txt); start copies b-round-167/r168-granted-start/; vitest base b-round-167-r168-vitest-base.txt (12 files, 249/249 by B at 1fef377); "
    "C rows T168-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4B (S0-S4, mixed right-half pixel, reduced motion, 4x crops), BOX-V3C4B (vs B probe before boxes, 0.00 expected), CONTRAST-V3C4B, RV1-V3C4B (c-round-167 d6, no renames), FUNC-SMOKE-V3C4B (real audio lane/group mute+solo, real video import via file chooser, fold, name, pan reset, rename + Undo), G168-3, PX-NET/REG-HYD; "
    "on C PASS round 169 = V-3c-4c unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 168 planning (D-29z133): V-3c-4a done (round 167, C PASS browserVerified=true realVerified=true, 0 bugs, published 1fef377); V-3c-4b = round 168 (Lane + GroupHeader, fallback (c)); then V-3c-4c, V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
order = q['order']
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = ("V-3 remainder: V-3c-4a done (round 167, published 1fef377); V-3c-4b = round 168 (D-29z133, fallback (c)); V-3c-4c (inventory v3c4a_plan_d29z132.v3c4_inventory; split by owner if it exceeds the grant limit); "
  "V-3c-5 (10 px panel radius; keep the overview frame radius equal to its root, lock OV1)")
q['v3c4b_plan_d29z133'] = {
  'round': 168,
  'probe': 'b-round-167/v3c4b-probe.cjs -> out/v3c4b-probe.json (S0-S4) + out/v3c4b-probe-S2.json (S2 re-run, mixed produced) + png; 1440 + 1280 identical: every box max 0.000 px, 0 added/missing, restore 0; radius 6 -> 8; lane off 6.68 -> 5.98 (hover 12.35); group off 6.30 -> 5.57 (hover 11.46); on 8.32 unchanged; mixed rest unchanged 13.94, hover 11.46; import 7.88 -> 7.05, hover 6.58; borderless and rename field unchanged colours; fill vs surface 1.12/1.13 (WCAG 1.4.11 spec trade-off, informational)',
  'twmerge_fact': "tailwind-merge 3.4.0: twMerge('bg-foreground/5','bg-gradient-to-r') -> 'bg-gradient-to-r' (base fill dropped in the mixed Solo state; enabled:hover/active fills kept)",
  'rulings': {
    'R1': 'same SURF + MOTION + rounded-md token set as V-3c-4a (copied from toolButtonClass) on Lane/Group Mute/Solo',
    'R2': 'on-states byte-identical + same hover/active fill appended: Mute on + enabled:hover:bg-accent enabled:active:bg-accent; Solo on + enabled:hover:bg-brand enabled:active:bg-brand',
    'R3': 'group rename input radius only, border-brand kept',
    'R5prime': 'out: lane move/trim ghosts and chips (l.884/900/920/934; TH10 counts l.920), group overview blocks l.352, range inputs, row dividers and the border-l-4 active stripe',
    'R6': 'video import buttons (compact l.723, full l.731) take the Export look (spec l.87; ArrangementTransport l.339): rounded-md, keep border border-brand text-brand, replace hover:bg-brand/10 with bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12, add MOTION; no border-transparent (static string), no font-medium',
    'R7': 'borderless buttons (lane fold l.685, name l.697, pan reset l.779; group fold l.226, name l.269): radius only; links stay out, buttons are in',
    'R8': 'group mixed Solo string byte-identical; rest look pixel-identical to 1fef377, hover/press 8/12 % on the right half'},
  'locks': 'LSU7 (lane Mute/Solo off/on, import full/compact, fold/name/pan reset), UM11 (group Mute/Solo off/on/mixed, fold/name, rename input), TH10 G-TH one string; mutations m199-m205',
  'checkpoint': 'still unanswered -> fallback (c); pointer b-round-167-checkpoint-request.md',
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
t = find('C-R166-TRIPLET-CHECKED-BROWSER')
t['status'] = 'closed: C round 167 FUNC-SMOKE-V3C4A (BPM 120 -> 1/8 -> Triplets (3) -> reopen): Triplets (3) checked with exactly 1 svg.lucide-check, 1/8T checked 1, others 0, both viewports; note for future rows: Triplets needs a bars division first (default 1 s grid gives the designed bars-only status)'
t['closed'] = when
t['evidence'] = t.get('evidence', '') + '; c-round-167.json measurements.triplets, c-round-167/out/func/trip-{1440,1280}-1.json'
a = find('ARCH-CHECKPOINT-V3C')
a['status'] = a.get('status', '') + ("; still unanswered at round 168 planning -> fallback (c) for V-3c-4b; round 167: A's code-reviewer and the gate-167 reviewer both report signal 3 (7 recipe copies in 5 files) and propose one shared surface constant after V-3c-4c together with Q2; pointer b-round-167-checkpoint-request.md (answer wanted before V-3c-4c planning)")
of.append({'id': 'ARCH-R167-SURFACE-RECIPE', 'severity': 'info (signal)', 'status': 'signal: not scheduled (needs root checkpoint approval); both round-167 reviewers: the SURF + MOTION recipe is copied 7 times in 5 files (ArrangementTransport l.51, StudioWorkspace l.2285/2366, ArrangementTempoRow l.241, ArrangementMarkerRow l.51, ArrangementMaster l.108/171), V-3c-4b/4c add more; proposal after V-3c-4c: one exported tool-surface class constant in app/lib/arrangement (or a ToolButton per FORWARDREF_COMPONENT.md), used via cn with own size/padding; acceptance identical className + TS8/UI11/MS5/HM7/TH10 green; do Q2 (! suffix removal) in the same task', 'evidence': 'a-round-167.md Architecture note; gates/round-167/review.md Architecture note + suggestion 4', 'added': when})
of.append({'id': 'Q-R167-ON-HOVER', 'severity': 'info (user question)', 'status': 'awaiting_user: by ruling R2 (V-3c-4a/4b) on-state buttons (Snap/Env/Metronome on, Master Mute on, Peak over, Lane/Group Mute/Solo on) keep the same fill on hover and press, so they give no hover feedback; option from the gate-167 reviewer: one step stronger on hover/press (e.g. enabled:hover:bg-accent/25, destructive/20-25); not scheduled until Saba answers', 'evidence': 'gates/round-167/review.md suggestion 1', 'added': when})
of.append({'id': 'GATE167-WCAG-1411-FILL', 'severity': 'info (known spec trade-off)', 'status': 'recorded: with the border gone, a button edge is only the 5 % fill, 1.12-1.13:1 against its surface (below WCAG 1.4.11 3:1 for component boundaries); the text label still passes 1.4.3; this is the visual-direction-a.md decision; recorded in doc 137 and on the vetoable list; C measures it once per round for the record', 'evidence': 'gates/round-167/review.md suggestion 2; b-round-167/out/v3c4b-probe.json fillVsParent', 'added': when})
of.append({'id': 'GATE167-TWMERGE-DEPENDENCY', 'severity': 'info (signal)', 'status': 'signal: on-state fills win only because cn uses tailwind-merge (drops the conflicting base token); a switch to plain clsx would make the fill depend on CSS order; covered by TS8/UI11/HM7 (and LSU7/UM11) asserting the dropped tokens are absent; also tailwind-merge 3.4.0 treats bg-gradient-to-r as conflicting with bg-foreground/5 (R8)', 'evidence': 'gates/round-167/review.md suggestion 3', 'added': when})
of.append({'id': 'GATE167-TOKEN-TEST-FRAGILITY', 'severity': 'info (signal)', 'status': 'signal: raw className token tests (TS8, UI11, MS5, HM7, LSU7, UM11) must be edited again on every later surface change; reduced by ARCH-R167-SURFACE-RECIPE if approved', 'evidence': 'gates/round-167/review.md suggestion 4', 'added': when})
of.append({'id': 'C-R167-METRONOME-UNDER-MUTE', 'severity': 'info (evidence gap)', 'status': 'open note, not scheduled: C round 167 did not exercise the metronome click path under Master Mute (metronome off during the mute test); code unchanged by V-3c-4a; add one line to the next regression round', 'evidence': 'c-round-167.json notesForB 3', 'added': when})
of.append({'id': 'A-R167-DUP-TEST-IDS', 'severity': 'info (signal)', 'status': 'signal: test IDs TS8 and MS5 also exist in marker-time-snap-ui.test.tsx:601 and marker-snap.test.tsx:475 (B-assigned, no runtime effect); B now greps all tests before assigning IDs (round 168: LSU7, UM11 unique)', 'evidence': 'a-round-167.md reviewer notes', 'added': when})
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(of))
