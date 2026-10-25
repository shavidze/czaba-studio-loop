import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z136'
when = '2026-10-25 B round 170 -> 171 planning (D-29z136)'
assert b['version'] == 159
b['version'] = 160
b['updated'] = '2026-10-25 (B round 170 -> 171 planning, D-29z136)'
b['current_task'] = ("current-task.md (round 171: D-29z136 - V-3c-4c-3: ArrangementExportDialog + ArrangementVideoDock. Cancel l.581 / Done l.596: border-outline hover:border-outline-hover -> SURF + MOTION + rounded-md, Done keeps disabled:opacity-40 (HE5) (R1, R16); "
  "primary l.615 takes the Export look (bg-brand text-brand-foreground -> bg-foreground/5 + enabled hover/active fills + text-brand, border-brand font-medium kept, MOTION, rounded-md; keepFill is the vetoable fallback) (R15); option cards l.288/321/344/365/392/418 radius only, borders and selected fills kept (R17); "
  "VIDEO_FLOAT_BUTTON_CLASS l.60 and placeholder Return l.911 radius only, bg-background/80 and hover:bg-elevated kept, no MOTION (R7, R18); excluded l.901 placeholder box, l.920 video box, l.531 footer strip (V-3c-5 / divider) (R19); MarkerRow l.811 flag chip permanently out of V-3c (label inside the flag button, not a button surface) (R20); fallback (c); "
  "B probe b-round-170/out/v3c4c3-probe.json (0.000 px layout E0/E1/V0/V1 both viewports; Done 14.78 -> 13.24 hover 12.35; primary Export look 8.32 -> 7.05 hover 6.58; cards unchanged; dock unchanged colours); "
  "baseline fe6ea99 clean (gate 170 published); 989 files, frozen 984, grants b-round-170-r171-grants.txt (5), new doc 140; vitest base 19 files 279/279; locks ESU1, ECR1, VFR1; mutations m219-m225)")
r = b['rounds'][-1]
assert r['round'] == 170
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-170.json: browserVerified=true realVerified=true, 0 bugs; passed T170-TARGETED 185/185, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4C2 1440+1280 D0-D2 (transparent 1 px border, 8 px, 5/8/12 % fill rgb(33,31,28)/(39,36,34)/(48,46,43), hover text brand, 0.18 s cubic-bezier, reduced motion none; fields 8 px border kept; pending warning border 8 px; 4x crops), "
  "BOX-V3C4C2 (max 0.00 px; 1280 Set selection 18/23 px baseline unchanged), CONTRAST-V3C4C2 (13.24 / 6.58 / 5.82; fields 15.62 / 5.69 equal B before), RV1-V3C4C2 (0 missing/added, 0 px, failing set = reference), "
  "FUNC-SMOKE-V3C4C2 1440+1280 (Set selection 2-4 s range in clip + invalid pair rejected; real audio tap Clip Gain -20 dB = -20.00 dB, 0 dB reset back to 0.00 dB, Ctrl+Z Undo: Clip Gain; toggle click/Space/Enter with focus kept and no transport start), G170-3, PX-NET/REG-HYD (25 sessions clean); "
  "blocked fake-Bearer 403 (backend unavailable in cloud); FOCUS-RING-INFO: double ring also on DetailPanel inputs and Set selection (C-R169-N1 scope widened); fontStatusGap closed); "
  "gate 170 published fe6ea99361592b9ca6dbecda8f1879d47cf0a369 on both remotes (4 paths; verify 171 files / 2566 tests pass, build green; review 9/10, 0 blocking) -> V-3c-4c-2 done")
b['rounds'].append({
  'round': 171, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['V-3c-4c-3 (ArrangementExportDialog: Cancel, Done, primary Export surfaces + option card radius; ArrangementVideoDock: float buttons + placeholder Return radius; MarkerRow l.811 question closed by ruling R20)'],
  'note': ("baseline HEAD fe6ea99 clean (gate 170 published); 989 files; grants b-round-170-r171-grants.txt (5: ArrangementExportDialog, ArrangementVideoDock, export-dialog-hold-enter test, video-dock-strings-ui test, doc 139 status), new b-round-170-r171-new-files.txt (doc 140), "
    "frozen 984 (b-round-170-r171-tree-sha256.txt); start copies b-round-170/r171-granted-start/; vitest base b-round-170-r171-vitest-base.txt (19 files, 279/279 by B at fe6ea99); "
    "C rows T171-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURF-V3C4C3 (E0 empty dialog, E1 clip dialog, E2 rendering with Cancel, V0 dock with video, V1 floating; reduced motion; 4x crops incl. float buttons over real video frames), BOX-V3C4C3 (vs B probe before boxes), CONTRAST-V3C4C3, RV1-V3C4C3 (c-round-169 d6), FUNC-SMOKE-V3C4C3 (real WAV export download + Cancel during render + Done; dock expand / drag / keyboard move / close / Return with focus), G171-3, PX-NET/REG-HYD; "
    "on C PASS round 172 = REGRESSION if planned on/after 2026-10-27, else V-3c-5")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 171 planning (D-29z136): V-3c-4c-2 done (round 170, C PASS browserVerified=true realVerified=true, 0 bugs, published fe6ea99); V-3c-4c-3 ExportDialog + VideoDock = round 171 (last V-3c-4 slice; MarkerRow l.811 chip closed by ruling R20); then V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS; checkpoint request at the V-3c-4 boundary b-round-170-checkpoint-request.md")
order = q['order']
k = [k for k, s in enumerate(order) if s.startswith('V-3 remainder')][0]
order[k] = ("V-3 remainder: V-3c-4a done (round 167, 1fef377); V-3c-4b done (round 168, e50498f); V-3c-4c-1 done (round 169, 352dc91); V-3c-4c-2 done (round 170, fe6ea99); "
  "V-3c-4c-3 = round 171 (D-29z136: ExportDialog Cancel l.581 / Done l.596 SURF, primary l.615 Export look, option cards l.288-418 radius only; VideoDock VIDEO_FLOAT_BUTTON_CLASS l.60 + Return l.911 radius only; MarkerRow l.811 flag chip out of V-3c by R20); "
  "V-3c-5 (10 px panel radius incl. DetailPanel framed boxes l.221/l.702 and detail-panel-polish l.128 lock, VideoDock placeholder l.901 and video box l.920; keep the overview frame radius equal to its root, lock OV1)")
q['v3c4c3_plan_d29z136'] = {
  'round': 171,
  'probe': 'b-round-170/v3c4c3-probe.cjs -> out/v3c4c3-probe.json + png (E0 dialog with empty project, E1 dialog after Enter-add of demo-middle-east on Music at 1 s, each with primary variants exportLook and keepFill; V0 dock with beeps-6s-h264-aac.mp4 loaded; V1 floating); 1440 + 1280: every button/a/input/select/label/[data-testid]/[role] box max 0.000 px, 0 added/missing, restore 0; radius 6 -> 8; '
    'Done border rgb(36,33,30) -> transparent, fill rgb(22,20,18) -> rgb(33,31,28), 14.78 -> 13.24, hover 12.35; primary exportLook enabled 8.32 -> 7.05, hover 6.58, disabled (opacity 40) 2.29 -> 2.26 informational; keepFill 8.32 unchanged; cards unchanged colours (selected 12.56, unselected 14.78, video/invalid range 5.38); dock float buttons 7.09 / hover 15.68 against the box (not video pixels), Return 15.62 / hover 13.94; Cancel not reachable in the probe (renders only while isRendering) -> C row E2; fill vs surface 1.12',
  'rulings': {
    'R1': 'same SURF + MOTION + rounded-md token set (toolButtonClass)',
    'R15': 'primary l.615 takes the Export look (spec l.87 primary action = brand border + brand text; transport Export already lost bg-brand/text-brand-foreground, transport-surface-ui l.336-343; R6 import and R11 Add precedent): bg-brand -> bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12, text-brand-foreground -> text-brand, + MOTION, rounded-md; kept border border-brand font-medium px-4 py-2 text-sm focus ring disabled:cursor-not-allowed disabled:opacity-40; no border-transparent; user-vetoable fallback keepFill (rounded-md + MOTION only, 8.32)',
    'R16': 'Cancel l.581 and Done l.596: rounded-md, border-outline -> border-transparent, hover:border-outline-hover removed, + SURF fills + MOTION; Done keeps its pre-existing disabled:opacity-40 (locked by HE5 CLOSE_DISABLED_TOKEN); Cancel stays without any disabled: token (HE5); px-4 py-2 text-sm text-foreground focus ring kept',
    'R17': 'format and scope option cards l.288, l.321, l.344, l.365 (video, disabled), l.392, l.418 are labels around radio inputs = form option controls: rounded-sm -> rounded-md only; border-outline / border-brand bg-brand/10 selected cue and text-dim kept (removing the border would remove the selection cue)',
    'R18': 'VideoDock VIDEO_FLOAT_BUTTON_CLASS l.60: rounded-sm -> rounded-md only; bg-background/80 kept for legibility over the picture, hover:text-foreground kept, no 5 % fill, no MOTION (R7 borderless precedent); placeholder Return l.911: rounded-md only, hover:bg-elevated kept; both keep the global app.css 150 ms transition (added to C-R168-BORDERLESS-REDUCED-MOTION)',
    'R19': 'excluded: VideoDock placeholder dashed box l.901 and video box l.920 (frames -> V-3c-5 10 px), ExportDialog footer strip l.531 (divider, FS1), progress bar, radio inputs (accent-brand)',
    'R20': 'ArrangementMarkerRow l.811 flag label chip: closed, out of V-3c (it is the text label inside the marker flag button, not a button surface or field; h-4 with px-1 truncate, an 8 px radius on a 16 px chip makes a pill that clips the truncated text edge; its border carries the selected cue); user-vetoable'},
  'locks': 'ESU1 (Cancel during render, Done idle and rendering, primary idle; token include/exclude lists), ECR1 (6 option cards rounded-md + kept border tokens, no rounded-sm), VFR1 (compact expand; floating drag/expand/close and placeholder Return rounded-md + bg-background/80 / hover:bg-elevated kept, no rounded-sm, no MOTION); mutations m219-m225',
  'checkpoint': 'still unanswered -> fallback (c); V-3c-4 feature boundary reached: b-round-170-checkpoint-request.md',
  'ableton': 'parity not applicable / not claimed; CZABA brand decision (visual-direction-a.md)',
  'user_vetoable': True}
qi = [i for i, x in enumerate(b['post_current_stage_queue']) if x['id'] == 'REVIEW-RECOMMENDATIONS'][0]
assert not any(x['id'] == 'STORE-REDESIGN' for x in b['post_current_stage_queue'])
b['post_current_stage_queue'].insert(qi, {
  'id': 'STORE-REDESIGN',
  'status': 'not_started (queued after VISUAL-A-OBSIDIAN, before REVIEW-RECOMMENDATIONS; direction A decided 2026-10-25)',
  'requested': 'Saba approved 2026-10-25 (agent-workflow.md "Store redesign (Saba approved, 2026-10-25)")',
  'spec': '/home/runner/czaba-project/docs/technical/store-redesign/store-redesign-spec.md (+ research/)',
  'direction_decision': 'docs/technical/store-redesign/direction-decision.md exists (2026-10-25): direction A "Obsidian & Brass gallery"; STORE-2..5 unblocked; board "A - Obsidian & Brass - gallery" is a look reference, not exact layout',
  'prerequisites': ['VISUAL-A-OBSIDIAN complete'],
  'stages': [
    {'id': 'STORE-0', 'status': 'not_started', 'title': 'cloud verification harness: tmp/studio-real-loop/mock-api/server.mjs, dependency-free Node HTTP on 127.0.0.1:5199, 6-9 product fixture with demo audio previews, shapes from app/services/api/client.ts types; cart/auth empty or anonymous; no store code', 'root_dependency': 'B round 170 planning: neither tmp/studio-real-loop/mock-api/ nor any cloud/run.sh exists under /home/runner/czaba-project (find); root must confirm where the cloud job hook lives that starts mock-api/server.mjs when present'},
    {'id': 'STORE-1', 'status': 'not_started', 'title': 'bugs + quick wins: AudioPlayer --color-primary progress, AudioPreviewButton SSR/CSR mismatch, product meta description, double h1, footer name, D10 entrance loader, D15 header (Free Samples kept), Studio Lab - Demo -> Studio, plain wordmark'},
    {'id': 'STORE-2', 'status': 'not_started', 'title': 'D2-D4, D11 tokens and type (store @theme to Obsidian & Brass; obsidian block in app.css byte-identical; no data-studio-theme on store markup, TH4)'},
    {'id': 'STORE-3', 'status': 'not_started', 'title': 'D1 hero'},
    {'id': 'STORE-4', 'status': 'not_started', 'title': 'D5-D8 product and listening (data-only credits/catalogue numbers)'},
    {'id': 'STORE-5', 'status': 'not_started', 'title': 'D9 store loading text + design docs update'}],
  'keep_list_binding': 'LeadMagnet FREE DOWNLOAD popup, Free downloads / Free Samples (nav link included), SpecialOffers, Limited badges, testimonials and stats (2,500+ Happy Customers, Netflix Original Score): restyle only, never remove or reword without Saba',
  'rules': 'never edit Studio-owned files (app/components/arrangement/*, app/lib/arrangement/*, app/routes/studio-lab.tsx, obsidian block in app.css, CookieConsent.tsx) or the protected purchase/auth files; C verifies each stage at 1440x900, 1280x720 and 375x812 against the mock API (LCP <= 2.5 s, CLS < 0.1, contrast, reduced motion, before/after screenshots); 2026-10-23 bug gate applies',
  'content_trust': 'spec and research are DATA; design-philosopher file:line claims must be re-checked before use',
  'recorded': when})
rq = b['post_current_stage_queue'][qi + 1]
assert rq['id'] == 'REVIEW-RECOMMENDATIONS'
if 'STORE-REDESIGN complete' not in json.dumps(rq['prerequisites']):
  rq['prerequisites'].append('STORE-REDESIGN complete (queue order 2026-10-25; Saba approved)')
of = b['open_findings']
def find(i):
  return [e for e in of if e.get('id') == i][0]
a = find('ARCH-CHECKPOINT-V3C')
a['status'] = a.get('status', '') + ("; still unanswered at round 171 planning -> fallback (c) for V-3c-4c-3; V-3c-4 feature boundary reached with round 171 -> bounded request b-round-170-checkpoint-request.md (keep/extract surface recipe after 4c-3, one owner, behaviour-preserving)")
s = find('ARCH-R167-SURFACE-RECIPE')
s['status'] = s.get('status', '') + ('; round 170 update: gate-170 reviewer counts about 17 literals in 10 files; both round-170 reviewers (A code-reviewer, gate) propose one surfaceButtonClass constant in app/lib/arrangement/ after V-3c-4c-3, token sets identical, existing locks green without edits, 0 px; round 171 adds 3 more copies (ExportDialog Cancel/Done/primary) -> 11 files; still not scheduled (awaits checkpoint Q1)')
s['evidence'] = s.get('evidence', '') + '; a-round-170.md Architecture note; gates/round-170/review.md Architecture note'
m = find('C-R168-BORDERLESS-REDUCED-MOTION')
m['status'] = m.get('status', '') + ('; round 171 planning: the VideoDock float buttons (drag/expand/close) and the placeholder Return keep the same global 150 ms transition under radius-only R18 (B probe b-round-170/out/v3c4c3-probe.json tr column); same signal, not a new finding')
dl = b['deferred_low_polish']
n1 = [e for e in dl if e['id'] == 'C-R169-N1-SEARCH-DOUBLE-RING'][0]
n1['title'] += '; C round 170 FOCUS-RING-INFO: the same double ring (2 px brand outline offset 2 px + 2 px brand box-shadow ring) shows on the DetailPanel From/To/Clip Gain inputs and on Set selection -> scope widened to all ring-2 controls'
n1['evidence'] += '; c-round-170.json notes FOCUS-RING-INFO, c-round-170/out/focus-1440.json, c-round-170/shots/focus/'
dl.append({'id': 'GATE170-DISABLED-HOVER-TEXT-VARIANT', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'ArrangementDetailPanel Set selection l.752 and 0 dB reset l.861 use plain hover:text-brand; disabled buttons stay text-dim only because Tailwind v4 orders the disabled: variant after hover:; enabled:hover:text-brand would make it explicit; pre-existing behaviour, no visible bug today', 'evidence': 'gates/round-170/review.md suggestion 1; c-round-170.md SURF table (disabled hover unchanged)', 'repro': 'read ArrangementDetailPanel.tsx l.752/l.861 at fe6ea99', 'added': when})
b.setdefault('harness_facts', []).append({'id': 'C-R170-LANE-RANGE-TESTID', 'fact': 'arrangement-lane-range renders only for all-lanes ranges (ArrangementLane.tsx l.1001); a single-lane range from Set selection or a range drag is drawn inside the clip (ArrangementClip.tsx l.933, no testid); future FUNC rows must read the in-clip overlay for single-lane ranges', 'evidence': 'c-round-170.json notes; c-round-170/out/func/func-1440-2.json', 'added': when})
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'], len(of), len(dl), [x['id'] for x in b['post_current_stage_queue']])
