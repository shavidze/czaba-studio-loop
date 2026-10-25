import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==161
T='2026-10-25 B round 172 -> 173 planning (D-29z138)'
b['version']=162
b['updated']='2026-10-25 (B round 172 -> 173 planning, D-29z138)'
b['current_task']=("current-task.md (round 173: D-29z138 - V-3c-5b: Overview root l.293, outline overlay l.305, view frame l.329 -> rounded-panel together (R25; capsule frame below 20 px at extreme zoom accepted, vetoable; no min-w, no overviewFrame change); "
 "Transport readout l.159 rounded-sm -> rounded-md (R26); LibraryPreview wave l.251 cn base rounded-sm -> rounded-md (R27); arrangement-exit l.2197 stays 6 px (R28); twMerge rule R29; "
 "OV1 block update (L1), panel-radius-ui PNR2 counts/sites + new PNR4/PNR5 (L2); doc 141 -> Completed (D1); new doc 142; mutations m235-m241; baseline 3810816, 992 files, 6 grants + 1 new, frozen 986, vitest base 25 files 423/423)")
b['advisor_used_by_B']=("2026-10-25 round 172 -> 173 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: "
 "B ran a read-only narrow-frame probe at 3810816 before ruling (b-round-172/out/probe-ov.json), all three Overview layers move together, explicit grants for OV1 and PNR2, leftover 6 px sites each ruled, C Lows deferred, gate-172 findings routed, C grid-menu focus note -> harness fact")
r=[x for x in b['rounds'] if x['round']==172][0]
r['status']='c_pass_published'
r['result']=("C round 172 PASS browserVerified=true realVerified=true (RADIUS 10px on P1-P6 both viewports, menu rows 6px, Overview untouched 6px; BOX 0.00 px vs r171; RV1 0 delta; FUNC-SMOKE P1-P6; G172-3); "
 "2 pre-existing Lows C-R172-01/02 -> deferred_low_polish; gate 172 published 3810816 on both remotes (verify 172 files / 2574 tests, review 9/10, nothing blocking)")
b['rounds'].append({"round":173,"task":"current-task.md","decision":"D-29z138","status":"dispatched",
 "items":["V-3c-5b (Overview 10 px root+overlay+frame; Transport readout 8 px; Library preview wave 8 px; exit link stays 6 px)"],
 "note":"baseline HEAD 3810816 clean (gate 172 published); 992 files; grants b-round-172-r173-grants.txt (6: ArrangementOverview O1-O3, ArrangementTransport S1, ArrangementLibraryPreview S2, studio-theme-obsidian OV1 block L1, panel-radius-ui L2, doc 141 status D1), new b-round-172-r173-new-files.txt (doc 142), frozen 986 (b-round-172-r173-tree-sha256.txt); start copies b-round-172/r173-granted-start/; vitest base b-round-172-r173-vitest-base.txt 25 files 423/423 (b-round-172/out/vitest-base.json)",
 "added":T})
v=[e for e in b['post_current_stage_queue'] if e['id']=='VISUAL-A-OBSIDIAN'][0]
v['status']+=(" | round 173 planning (D-29z138): V-3c-5a done (round 172, C PASS browserVerified=true realVerified=true, published 3810816); "
 "V-3c-5b = round 173 (Overview root/overlay/frame 10 px together, readout and preview wave 8 px, exit link stays 6 px); on C PASS V-3c-5 and V-3c complete -> B writes a refreshed checkpoint request; "
 "then DUX-R-5 stage, M1, M3, M4, ROOT-RECON-GRID-HARNESS; regression due on/after 2026-10-27; checkpoint b-round-170-checkpoint-request.md still unanswered (third planning) -> fallback (c)")
for i,o in enumerate(v['order']):
  if o.startswith('V-3 remainder'):
    v['order'][i]=o.replace("V-3c-5a = round 172","V-3c-5a done (round 172, 3810816)").replace("V-3c-5b (Overview root/overlay/frame with OV1, remaining 6 px controls;","V-3c-5b = round 173 (D-29z138: Overview root/overlay/frame with OV1, readout + preview wave 8 px, exit link 6 px;")
v['v3c5b_plan_d29z138']={"round":173,
 "probe":{"tool":"b-round-172/tools/probe-ov.cjs","out":"b-round-172/out/probe-ov.json","head":"3810816",
  "facts":"Overview root 956x64 (1440) / 796x64 (1280), parent no radius; frame width at zoom max 320 px/s: empty project (extent 10 s) 274.25 / 188.55 px; demo-middle-east on music at 1 s (extent 101.352 s) 27.05 / 18.59 px; after clicking the right end the frame runs 11.5 / 7.3 px past the root's right edge (clipped by overflow-hidden; pre-existing, B-R172-OV-FRAME-OVERFLOW info)"},
 "rulings":{
  "R25":"Overview is a panel (64 px framed map, bordered overlay, own surface): root l.293, overlay l.305, frame l.329 -> rounded-panel together (OV1/SABA-B-2: a 6 px frame inside a 10 px overflow-hidden root reopens the corner notch); frame narrower than 20 px becomes a capsule at extreme zoom - accepted, vetoable; no min-w and no overviewFrame change (would misstate the visible range); clip bars keep rounded-xs",
  "R26":"Transport readout l.159 (non-interactive position/project-end display in the 8 px button row) = field-like display -> rounded-md; alternative recorded: stay 6 px as a chip",
  "R27":"Library preview wave l.251 (role=slider, 32 px borderless seek bar) = control -> rounded-md; differs from P1/Overview (bordered framed boxes = panels)",
  "R28":"arrangement-exit l.2197 (borderless text link; rounded-sm shapes only the focus ring) stays 6 px; StudioWorkspace not granted",
  "R29":"no V-3c-5b site passes rounded-panel through cn() with another rounded-* (tailwind-merge does not know rounded-panel; GATE172-TWMERGE-RADIUS-PANEL)"},
 "sites":{"O1":"ArrangementOverview l.293","O2":"ArrangementOverview l.305","O3":"ArrangementOverview l.329","S1":"ArrangementTransport l.159","S2":"ArrangementLibraryPreview l.251","L1":"studio-theme-obsidian OV1 l.219-236","L2":"panel-radius-ui EXPECTED_PANEL_CLASS_COUNTS/PANEL_SITE_CLASSES + PNR4/PNR5","D1":"doc 141 l.4 Completed","D2":"new doc 142"},
 "locks":"OV1 updated (rounded-panel on root/frame, overlay exact string), PNR2 (+Overview 3), PNR4 (Overview source + render; clip bars keep rounded-xs), PNR5 (readout + preview wave rounded-md; exit link keeps rounded-sm)",
 "mutations":"m235-m241",
 "c_rows":"T173-TARGETED, SOURCE-SCOPE, AN-REVIEW, RADIUS-V3C5B, OV-CORNERS (SABA-B-2), NARROW-FRAME, BOX-V3C5B (Overview vs probe-ov.json), RV1-V3C5B, FUNC-SMOKE-V3C5B, G173-3, PX-NET/REG-HYD",
 "user_vetoable":True,"added":T}
dl=b['deferred_low_polish']
dl.append({"id":"C-R172-01","severity":"low","status":"deferred_low_polish","preExisting":True,
 "title":"At 1280x720 the group-state reason text (range reason 2 lines + Clip Gain reason 2 lines) runs 4 px past the outer bottom edge of the P2 reason box (250x67); the bottom border and bottom-left curve cross the glyphs. Fits at 1440. Cause: wrapping (likely later VISUAL-A typography, inference), not the radius; C judged it under 'Low only', not 'visual defect at a rounded corner'",
 "owner":"ArrangementDetailPanel.tsx group-state middle box (layout: P2 height/grow, scroll or reason fit); not fixable within R21-R23",
 "evidence":"c-round-172/shots/radius/site4x-1280-D2-P2-1.png; c-round-172/out/radius/rad-1280-2.json states.D2.m.P2; c-round-172/out/box-v3c5a.json noBefore.1280.D2.P2; round 41 fit (c-round-41.md l.138/153)",
 "repro":"1280x720, load media/beeps-6s-h264-aac.mp4, add demo-middle-east to Music at 1 s, expand Clip details, click the Music clip, Ctrl+click the video clip","added":T})
dl.append({"id":"C-R172-02","severity":"low","status":"deferred_low_polish","preExisting":True,
 "title":"Set selection adds a 4th footer line ('Time selection: ...'); the workspace above shrinks and the Clip details panel, waveform box and library preview jump up 20 px with no transition (1440 and 1280). C-R11-02 reserved the selected-clip footer line for the same reason; the range line is not reserved",
 "owner":"StudioWorkspace footer status lines / workspace layout",
 "evidence":"c-round-172/shots/radius/rad-1440-2-D1.png vs rad-1440-2-D1-setsel.png; out/radius/rad-{1440,1280}-2.json func.P1.applied.p1 vs states.D1.m.P1.box; related C-R11-02, A-R28-REVIEW-4-ALL-LANE-FOOTER, C-R28-INFO-STALE-STATUS",
 "repro":"1440x900, load the video, add demo-middle-east to Music at 1 s, select it, From 2 To 4, Set selection","added":T})
of=b['open_findings']
of.append({"id":"GATE172-TWMERGE-RADIUS-PANEL","severity":"info (signal)","status":"signal: app/lib/utils.ts plain twMerge treats rounded-panel as unknown, so cn('rounded-panel','rounded-md') keeps both; no conflict today (only cn() site ArrangementVideoDock l.919-924); fix when needed with extendTailwindMerge({extend:{theme:{radius:['panel']}}}); round 173 task rule R29","evidence":"gates/round-172/review.md finding 2","added":T})
of.append({"id":"B-R172-OV-FRAME-OVERFLOW","severity":"info","status":"observation: when the view scrolls past the extent (e.g. clicking the Overview's right end at max zoom) the view frame runs 7-12 px past the root's right edge and is clipped by overflow-hidden, so its right border is hidden; pre-existing behaviour of overviewFrame (left clamped, width not); not scheduled","evidence":"b-round-172/out/probe-ov.json clip_max_right","added":T})
fr=[x for x in of if x.get('id')=='GATE167-TOKEN-TEST-FRAGILITY'][0]
fr['round172_update']="gate-172 finding 4: PNR2 (panel-radius-ui l.45-73) and detail-panel-polish l.79 lock full class strings from source; rendered PNR3 checks already cover behaviour; could later be cut to contains rounded-panel / not rounded-sm|md. Not scheduled. "+T
arch=[x for x in of if x.get('id')=='ARCH-R167-SURFACE-RECIPE'][0]
arch['round172_update']="gate-172 review and A's round-172 reviewer: Architecture note none (class-only diff). Checkpoint b-round-170-checkpoint-request.md unanswered at round 173 planning (third) -> fallback (c); round 173 adds no SURF/MOTION copy; after V-3c-5b C PASS (V-3c boundary) B writes a refreshed bounded request. "+T
b['tech_lead_manual_checks'].append({"id":"GATE172-SAFARI-VIDEO-RADIUS","status":"open (cloud is Chromium only)","what":"Real Safari/WebKit: the floating video box (ArrangementVideoDock l.920, fixed + overflow-hidden + rounded-panel 10 px around <video>) clips the video to the rounded corners; if square corners show, add isolate (Tailwind-only, no layout change)","source":"gates/round-172/review.md finding 3"})
b['harness_facts'].append({"id":"C-R172-GRID-ESCAPE-FOCUS-BODY","fact":"with a real mouse, the right press on a non-focusable lane blurs the focused element before contextmenu, so 'the element that had focus at open' is BODY and Grid menu Escape returns focus to BODY; GM11 dispatches contextmenu without a press. Acceptance wording from round 173 on: focus returns to the opener only when the opener is focusable; otherwise record where focus lands","evidence":"c-round-172.md FUNC-SMOKE P5 note","added":T})
b['harness_facts'].append({"id":"C-R172-DETAIL-COLLAPSED-720","fact":"at 1280x720 the Clip details panel is collapsed by default; expand it with arrangement-detail-toggle before measuring P1/P2; the SFX lane may be out of reach at 1280, use the Video lane for the grid menu","evidence":"c-round-172.json invalidRuns rad-1280-1","added":T})
b['architecture_signals'].append({"round":172,"note":"A reviewer and gate-172 review: Architecture note none (class-only token swap). Gate-172 Lows routed: doc status -> round 173 D1; twMerge radius -> GATE172-TWMERGE-RADIUS-PANEL signal + R29; Safari video radius -> Tech Lead manual check; exact-string locks -> GATE167-TOKEN-TEST-FRAGILITY round172_update","added":T})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(dl))
