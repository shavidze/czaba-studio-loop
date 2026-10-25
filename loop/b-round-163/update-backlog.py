import json, sys
p = sys.argv[1]
b = json.load(open(p))
D = 'D-29z129'
when = '2026-10-25 B round 163 -> 164 planning (D-29z129)'
b['version'] = b.get('version', 152) + 1
b['updated'] = '2026-10-25 (B round 163 -> 164 planning, D-29z129)'
b['current_task'] = ("current-task.md (round 164: D-29z129 - SABA-B-1 envelope line/handle visibility (two-tone line: stroke-background 4 px halo under stroke-foreground 1.5 px; "
  "handle size-2.5 bg-foreground border-background hover:scale-125) + SABA-B-2 overview frame radius rounded-xs -> rounded-sm (equals the 6 px root clip); "
  "baseline 0e4287f clean (gate 163 published); grants b-round-163-r164-grants.txt (5), new doc 133; B reproduction b-round-163/out/saba-*.json; round 165 = ROOT-RECON-MARKER-ENTER, round 166 = V-3c-3b)")
r = b['rounds'][-1]
assert r['round'] == 163
r['status'] = 'c_pass_published'
r['result'] = ("C PASS (c-round-163.json: browserVerified=true realVerified=true, 0 bugs; passed T163-TARGETED 200/200, SOURCE-SCOPE, AN-REVIEW, ICON-V3C3A, RV1-V3C3A (0 px, 1 rename, 0 collisions), "
  "DOCK-STATES-BOX (0.00 px), FUNC-SMOKE-DOCK (svg-centre pointer starts, real video currentTime +1.0 s, tap peak 0.555), G163-3 anon/protected/401, PX-NET, REG-HYD; blocked fake-Bearer 403: backend unavailable in cloud; "
  "1 invalid warm-up (ENV-FIRST-LOAD-LUCIDE) replaced); gate 163 published 0e4287f423d287a1a7b4fc885ae7f1a14bdc5788 on both remotes (7 paths; verify 171 files / 2546 tests, build ok; review 9/10, 0 blocking) -> V-3c-3a done")
b['rounds'].append({
  'round': 164, 'task': 'current-task.md', 'decision': D, 'status': 'dispatched',
  'items': ['SABA-B-1 envelope line + breakpoint visibility (Medium)', 'SABA-B-2 overview frame corner notches (Low, fixed now per Saba)'],
  'note': ("baseline HEAD 0e4287f clean (gate 163 published); 982 files; grants b-round-163-r164-grants.txt (5: ArrangementClipEnvelope.tsx, ArrangementOverview.tsx, clip-envelope-ui.test, studio-theme-obsidian.test, doc 132 status), "
    "new b-round-163-r164-new-files.txt (doc 133), frozen 977 (b-round-163-r164-tree-sha256.txt); start copies b-round-163/r164-granted-start/; vitest base b-round-163-r164-vitest-base.txt (6 files, 92/92 run by B at 0e4287f); "
    "B reproduction b-round-163/out/saba-probe*.json, saba-sim-dpr2.json (line core vs darkest within +-5 device px: baseline min 1.74, simulated halo-4 fix min 15.62; handle centre vs border 1.88 -> 15.62), corner crops at 4x; "
    "locks EV1/OV1; mutations m178-m181; RV-1 reference c-round-163/out/d6/d6-{W}-r1.json; on C PASS round 165 = ROOT-RECON-MARKER-ENTER, round 166 = V-3c-3b unless the regression is due (on/after 2026-10-27)")})
q = [x for x in b['post_current_stage_queue'] if x['id'] == 'VISUAL-A-OBSIDIAN'][0]
q['status'] += (" | round 164 planning (D-29z129): V-3c-3a done (round 163, C PASS browserVerified=true realVerified=true, 0 bugs, published 0e4287f); "
  "Saba's 2026-10-25 bugs SABA-B-1 (Medium) + SABA-B-2 (Low, fix now) = round 164 (workflow: next, before the remaining V-3/M stages); then ROOT-RECON-MARKER-ENTER (165), V-3c-3b (166), V-3c-4, V-3c-5, DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS")
q['order'] = q['order'][:5] + [
  "SABA-B-1 + SABA-B-2 (Saba's 2026-10-25 bugs; next, before the remaining V-3 and M stages) = round 164",
  "ROOT-RECON-MARKER-ENTER (test-first; fix only if reproduced) = round 165 (B ruling: possible commit during an active gesture outranks icon polish)",
  "V-3 remainder: V-3c-3b, V-3c-4 (input: ARCH-CHECKPOINT-V3C, fallback (c)), V-3c-5 (10 px panel radius; keep the overview frame radius equal to its root, lock OV1)",
  "DUX-R-5 one colour rule (approved 2026-10-25; own bounded stage before M1; keep the D6 contrast thresholds; re-verify SABA-B-1 envelope contrast with the round-164 ENV-VIS metric)",
] + q['order'][5:] + [
  "ROOT-RECON-GRID-HARNESS (test-only extraction at the end of the visual stage, at a safe boundary)",
]
q['saba_b1_b2_plan_d29z129'] = {
  'round': 164,
  'source': 'agent-workflow.md section "Bugs reported by Saba (2026-10-25)"; user-review/img/saba-2026-10-25-envelope-handle.png, saba-2026-10-25-overview-corners.png',
  'reproduction': {
    'SABA-B-1': 'line stroke text-accent, point bg-accent, waveform text-brand/70, selected header bg-brand: all rgb(201,164,106) brass; DPR2 line core vs darkest within +-5 px min 1.74 (median 7.42); handle centre vs border 1.88; no hover style; muted lane does not change clip rendering; at 0 dB the point sits half over the selected brass header (b-round-163/out/saba-probe.json, saba-probe2.json, saba-sim-dpr2.json)',
    'SABA-B-2': 'overview root overflow-hidden rounded-sm (6 px) + outline overlay rounded-sm, but arrangement-overview-frame rounded-xs (2 px) inset-y-0 border-foreground/70; when the frame touches a side (empty project 0%/100%, or the far right) its corners are cut by the 6 px clip -> notch (out/corner-1440-*.png, saba-probe2-*-corner-empty-*.png)'},
  'rulings': {
    'R1': 'envelope line = 2 polylines: stroke-background strokeWidth 4 halo under stroke-foreground 1.5; svg loses text-accent (survives DUX-R-5 neutral waveforms; same two-tone idea as the round-150 overview playhead)',
    'R2': 'handle size-2.5 bg-foreground border-background hover:scale-125 (no colour on hover: DUX-R-5 reserves the accent); z-30/cursor/rounded/handlers unchanged',
    'R3': 'overview frame rounded-xs -> rounded-sm',
    'R4': 'no Ableton parity claim (manual not opened this planning)'},
  'simulation': 'DOM-injected halo 4 px: core vs halo min 15.62 at both viewports; handle centre vs border 15.62 (b-round-163/out/saba-sim-dpr2.json, saba-sim-1440-selected-sim.png)',
  'dux_r5_coordination': 'the DUX-R-5 stage re-runs ENV-VIS (round-164 metric) after the waveform becomes neutral',
  'user_vetoable': True}
of = b['open_findings']
of += [
  {'id': 'SABA-B-1', 'severity': 'medium', 'status': 'open: scheduled round 164 (D-29z129)', 'title': 'the clip volume envelope line and breakpoint handle nearly disappear on the brass clip (Saba could not find the control)', 'source': 'Saba 2026-10-25 (agent-workflow.md); user-review/img/saba-2026-10-25-envelope-handle.png', 'evidence': 'B reproduction b-round-163/out/saba-probe2.json, saba-sim-dpr2.json (baseline min 1.74:1, handle 1.88:1)', 'repro': '/studio-lab -> demo-middle-east on music at 0 s -> Env -> double-click the body -> line and point are brass on the brass waveform/header', 'target': 'line and handle >= 3:1 against adjacent colours in normal/selected/muted/hover (WCAG 1.4.11); theme tokens only; coordinate with DUX-R-5', 'added': when},
  {'id': 'SABA-B-2', 'severity': 'low', 'status': 'open: scheduled round 164 (D-29z129); fixed now, not deferred (Saba saw it himself)', 'title': 'the ARRANGEMENT · Overview frame shows notches at its corners', 'source': 'Saba 2026-10-25 (agent-workflow.md); user-review/img/saba-2026-10-25-overview-corners.png', 'evidence': 'b-round-163/out/saba-probe.json (radius chain), corner-1440-*.png, saba-probe2-*-corner-empty-*.png', 'repro': '/studio-lab empty project -> 4x zoom on the overview corners', 'cause': 'frame rounded-xs 2 px inside the overflow-hidden rounded-sm 6 px root', 'target': 'no notch; no size or position change beyond +-1 px', 'added': when},
  {'id': 'ROOT-RECON-MARKER-ENTER', 'severity': 'unconfirmed (source hypothesis)', 'status': 'scheduled round 165 (test-first) unless C fails round 164 or the regression is due', 'title': 'Enter in the marker add/rename editor may reach commitArrangement during an active pointer gesture (f08c7ce ArrangementMarkerRow.tsx commitEditor guards only the blur reason with isGestureActive)', 'source': 'agent-workflow.md section on the local/cloud reconciliation (2026-10-25); PC markers-ui MU14 (open add editor + active gesture + Enter => no mutation, editor stays open)', 'plan': 'write the correct-behaviour regression test first for add and rename; a small separate fix only if it reproduces; C browser evidence; full root gate. Canonical focus-release clause and MU8c/MU8d/MU8e already cover C-R72-01; do not port the whole 4e87bec', 'added': when},
  {'id': 'ROOT-RECON-GRID-HARNESS', 'severity': 'info (approved test-only refactor)', 'status': 'queued: end of VISUAL-A at a safe boundary (after M4, before REVIEW-RECOMMENDATIONS)', 'title': 'extract createWorkspaceTestEnvironment (helpers/workspace-test-environment.ts) from the fakeClock..FakeResizeObserver blocks of grid-snap-ui, grid-musical-ui and grid-triplet-ui', 'source': 'agent-workflow.md reconciliation 2026-10-25; local 3ea2e04 on refactor/grid-test-harness (not in cloud)', 'plan': 'own clock/classes per suite; assertions, setup/teardown and canonical changes unchanged; new free doc number (doc063 is taken); targeted 3 suites + typecheck/lint + code-reviewer + root verify; old 44/1683 PASS applies only to the old commit; no source reimplementation', 'added': when},
  {'id': 'ROOT-RECON-PC-BACKUP', 'severity': 'info', 'status': 'note: keep backup/local-2026-10-23 (4e87bec) and refactor/grid-test-harness; no reset, no force push, no replay of old rounds', 'source': 'agent-workflow.md reconciliation 2026-10-25', 'added': when},
]
for e in of:
  if e.get('id') == 'B-R107-ENTER-ON-BODY':
    e['status'] = 'closed: intended behaviour (Saba via ableton-decisions.md 2026-10-25, ABL-R-6: keep Enter / double-click adds at the playhead on the active track; no work)'
  if e.get('id') == 'ARCH-CHECKPOINT-V3C':
    e['status'] = e.get('status', '') + '; still unanswered at round 164 planning (2026-10-25); round 163 architecture note: none'
  if e.get('id') == 'Q-V3-ICON-SIZE':
    e['note_d29z129'] = 'round 163 added a 10 px icon in each 24x24 float button (R1); alternative Minimize2 for the return state; still awaiting_user'
  if e.get('id') == 'B-R153-PREVIEW-DUR':
    e['note_d29z129'] = 'not covered by the 2026-10-25 decisions (design-ux-decisions approved DUX-R-1..9 and decided V-2b-DISPLAY; this is a separate V-2b question); still awaiting_user'
of.append({'id': 'V-2b-DISPLAY', 'severity': 'info', 'status': 'decided_user: no serif (design-ux-decisions.md 2026-10-25 final). Studio uses Instrument Sans + IBM Plex Mono only; no work: Cormorant is not loaded in Studio (studio-theme-obsidian.test.tsx l.237 asserts no Cormorant/Inter/Playfair); store fonts unaffected', 'added': when})
amap = {x['id']: x for x in b['ableton_recommendations']}
for i in ['ABL-R-1', 'ABL-R-2', 'ABL-R-3', 'ABL-R-4', 'ABL-R-7', 'ABL-R-8', 'ABL-R-11', 'ABL-R-12', 'ABL-R-13', 'ABL-R-14', 'ABL-R-15', 'ABL-R-18']:
  amap[i]['status'] = 'approved_user_2026_10_25 (ableton-decisions.md) -> REVIEW-RECOMMENDATIONS'
amap['ABL-R-9']['status'] = 'approved_user_2026_10_25: Play in an empty project runs the transport and the metronome -> REVIEW-RECOMMENDATIONS'
amap['ABL-R-10']['status'] = "approved_user_2026_10_25 (review variant): during playback only, M adds the marker at the playhead without opening the name field; stopped: SRW-16 R3 unchanged -> REVIEW-RECOMMENDATIONS"
amap['ABL-R-6']['status'] = 'decided_user_2026_10_25: keep current behaviour; no work; B-R107-ENTER-ON-BODY closed as intended'
for i in ['ABL-R-5', 'ABL-R-16']:
  amap[i]['status'] = 'awaiting_user (ableton-decisions.md 2026-10-25: still pending, do NOT implement)'
amap['ABL-R-17']['status'] = 'awaiting_user (ableton-decisions.md 2026-10-25: still pending; already queued as SRW-40 in PHASE2-VIDEO-SCORING)'
dmap = {x['id']: x for x in b['design_ux_recommendations']}
for i in ['DUX-R-1', 'DUX-R-2', 'DUX-R-4', 'DUX-R-6', 'DUX-R-7', 'DUX-R-8', 'DUX-R-9']:
  dmap[i]['status'] = 'approved_user_2026_10_25 (design-ux-decisions.md) -> REVIEW-RECOMMENDATIONS'
dmap['DUX-R-3']['status'] = 'approved_user_2026_10_25 -> REVIEW-RECOMMENDATIONS; option (auto-reveal the selected clip vs auto-collapse the panel at 1280) chosen by design-philosopher + flow-sage with browser evidence at its planning, recorded in that task'
dmap['DUX-R-5']['status'] = 'approved_user_2026_10_25: inside VISUAL-A as its own bounded stage before M1 (fitsVisualA true); keep D6 contrast thresholds; re-verify SABA-B-1 envelope contrast'
order = ['ABL-R-7', 'DUX-R-3', 'ABL-R-12', 'DUX-R-1', 'ABL-R-13', 'DUX-R-4', 'ABL-R-10', 'DUX-R-6', 'ABL-R-9', 'DUX-R-2',
         'ABL-R-1', 'ABL-R-2', 'ABL-R-3', 'ABL-R-4', 'ABL-R-8', 'ABL-R-11', 'ABL-R-14', 'ABL-R-15', 'ABL-R-18', 'DUX-R-7', 'DUX-R-8', 'DUX-R-9']
rr = {
  'id': 'REVIEW-RECOMMENDATIONS', 'status': 'not_started (queued after VISUAL-A-OBSIDIAN)',
  'requested': '2026-10-25 (Saba: "write tasks and bugs from what the reviews checked, and follow them"; ableton-decisions.md + design-ux-decisions.md)',
  'instruction': 'one bounded B task per approved id (split if larger), A->C->B; after VISUAL-A-OBSIDIAN, before T12-ADVANCED and phase 2; each task carries the Ableton source table',
  'prerequisites': ['VISUAL-A-OBSIDIAN complete (incl. DUX-R-5 stage, M1/M3/M4, SABA-B-1/2)'],
  'items': [{'id': i, 'status': 'not_started', 'source': ('ableton_recommendations' if i.startswith('ABL') else 'design_ux_recommendations')} for i in order],
  'order_ruling_d29z129': ("B ruling (user-vetoable): each review's own order is kept - ABL: R-7, then R-12/R-13 (Saba's words), then the rest with Medium R-10 first, then R-9 (approved question), then Lows in id order; "
    "DUX: Top 5 minus R-5 (R-3, R-1, R-4, R-6), then R-2, R-7, R-8, R-9. The two lists alternate one item each, starting with ABL-R-7, until the Medium/Top items are used; then the remaining Lows follow ABL then DUX."),
  'not_included': {'ABL-R-5': 'awaiting_user', 'ABL-R-16': 'awaiting_user (licensing)', 'ABL-R-17': 'awaiting_user (SRW-40, phase 2)', 'ABL-R-6': 'decided: no work', 'DUX-R-5': 'inside VISUAL-A'},
  'source': 'user-review/ableton-decisions.md, user-review/design-ux-decisions.md (data, read by B 2026-10-25)'}
qi = [x['id'] for x in b['post_current_stage_queue']]
if 'REVIEW-RECOMMENDATIONS' not in qi:
  b['post_current_stage_queue'].insert(qi.index('T12-ADVANCED'), rr)
t12a = [x for x in b['post_current_stage_queue'] if x['id'] == 'T12-ADVANCED'][0]
if 'REVIEW-RECOMMENDATIONS complete' not in t12a['prerequisites']:
  t12a['prerequisites'].append('REVIEW-RECOMMENDATIONS complete (Saba 2026-10-25: approved recommendations come before T12-ADVANCED)')
dl = b['deferred_low_polish']
dl += [
  {'id': 'GATE163-LG3-DUP', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'LG3 repeats ST14 exact-value checks; only the glyph regex and endsWith add value', 'evidence': 'gates/round-163/review.md suggestion 3', 'repro': 'read strings.test.ts l.2512-2529 at 0e4287f', 'added': when},
  {'id': 'GATE163-LVD2-CLAMP', 'severity': 'low', 'status': 'deferred_low_polish', 'title': 'LVD2 hard-codes the clamp {left: 1440-272, top: 900-153} with an undefined 153 px box height', 'evidence': 'gates/round-163/review.md suggestion 4', 'repro': 'read floating-video.test.tsx l.103 at 0e4287f', 'added': when},
]
for e in of:
  if e.get('id') == 'REVIEW-R162-STATIC-CN-DEAD-TEXT':
    e['note_d29z129'] = 'gate 163 review suggestion 1 adds VIDEO_FLOAT_BUTTON_CLASS text-xs'
for e in dl:
  if e.get('id') == 'REVIEW-R162-STATIC-CN-DEAD-TEXT':
    e['note_d29z129'] = 'gate 163 review suggestion 1 adds VIDEO_FLOAT_BUTTON_CLASS text-xs (ArrangementVideoDock.tsx:60)'
b.setdefault('architecture_signals', []).append({'round': 163, 'note': 'none (a-round-163.md reviewer and gates/round-163/review.md: only JSX children swapped)', 'added': when})
b['baseline_tree_at_round164'] = {'head': '0e4287f423d287a1a7b4fc885ae7f1a14bdc5788', 'files': 982, 'frozen': 'b-round-163-r164-tree-sha256.txt (977)', 'grants': 'b-round-163-r164-grants.txt (5)', 'new': 'b-round-163-r164-new-files.txt (1)', 'vitest_base': 'b-round-163-r164-vitest-base.txt (6 files, 92/92)'}
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', len(dl), len(of), len(b['rounds']), [x['id'] for x in b['post_current_stage_queue']])
