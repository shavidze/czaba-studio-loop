import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==163, b['version']
T='2026-10-25 B round 174 -> 175 planning (D-29z140)'
b['version']=164
b['updated']='2026-10-25 (B round 174 -> 175 planning, D-29z140)'
b['current_task']=("current-task.md (round 175: D-29z140 - DUX-R-5b-1 controls/affordances neutral: 6 fader thumbs accent-brand -> accent-foreground (A1a-f), fade handle bg-brand -> bg-background hollow (A2), "
 "trim/loop-edge/track-height hover:bg-accent/60 -> hover:bg-foreground/50 and dragging bg-foreground/50 (A3-A5), scrollbar thumb hover/active bg-brand -> bg-foreground (A6), Library resize hover:bg-brand/40 -> hover:bg-foreground/50 (A7), "
 "collapsed-group unselected block bg-brand/25 -> bg-foreground/25 (A8), Clip fixed-string cn() -> plain className (A9, gate-174 S1); locks track-layout l.801/l.835; new affordance-colour-ui.test.tsx DXA1-DXA7; doc 143 Completed; new doc 144; "
 "mutations m248-m257; baseline 0a4a41e, 995 files, 11 grants + 2 new, frozen 984, vitest base 13 files 199/199)")
b['advisor_used_by_B']=("2026-10-25 round 174 -> 175 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: write the full 5b per-site ruling table now and make round 175 stage 5b-1 (affordances) only, "
 "5b-2 on-states and 5b-3 labels/ghosts/dialog next; test-lock grep (track-layout l.801/835 granted); Q-R167-ON-HOVER recorded as 5b-2 constraint; app/components/studio/* ruled out of scope explicitly; accent==brand finding recorded (B-R174-ACCENT-EQ-BRAND); "
 "C must pixel-measure accent-color thumbs; ENV-VIS and RV1 re-run; round-174 bookkeeping from C evidence only")
r=[x for x in b['rounds'] if x['round']==174][0]
r['status']='c_pass_published'
r['result']=("C round 174 PASS browserVerified=true realVerified=true, 0 Critical/High/Medium, 1 Low info C-R174-ENV-BELOW-DROP (handle-below 4.79 -> 4.19, still >= 3:1, by design R30; no code change): CC-COLOUR audio wave rgb(122,116,106), video wave (124,118,108), detail (118,112,103); "
 "NO-BRASS-CONTENT 0 px both VPs; SELECTION-BRASS body 0; CONTRAST waves 3.74/3.59/3.96, Overview bars 10.05/3.21/5.69, video header text 8.68; ENV-VIS 12/12 >= 3:1 (15.62); STATE-DISTINCT video vs audio header 1.50 + Film icon; RV1 0 delta; FUNC-SMOKE incl. real output tap; G174-3 401 (fake-Bearer 403 BLOCKED backend unavailable in cloud); "
 "gate 174 published 0a4a41e on both remotes (verify 173 files, review 9/10, nothing blocking)")
b['rounds'].append({"round":175,"task":"current-task.md","decision":"D-29z140","status":"dispatched",
 "items":["DUX-R-5b-1 (controls/affordances neutral: fader thumbs, fade handles, trim/loop-edge/track-height hover, scrollbar thumb, Library resize hover, collapsed-group blocks; K7-K12 reserved brass kept)"],
 "note":"baseline HEAD 0a4a41e clean (gate 174 published); 995 files; grants b-round-174-r175-grants.txt (11), new b-round-174-r175-new-files.txt (affordance-colour-ui.test.tsx, doc 144), frozen 984 (b-round-174-r175-tree-sha256.txt); start copies b-round-174/r175-granted-start/; vitest base b-round-174-r175-vitest-base.txt 13 files 199/199 (b-round-174/out/vitest-base.json)",
 "added":T})
v=[e for e in b['post_current_stage_queue'] if e['id']=='VISUAL-A-OBSIDIAN'][0]
v['status']+=(" | round 175 planning (D-29z140): DUX-R-5a done (round 174, C PASS browserVerified=true realVerified=true, published 0a4a41e); DUX-R-5b split (scope unchanged) into 5b-1 controls/affordances = round 175, "
 "5b-2 on-state toggles = next, 5b-3 labels/ghosts/Export dialog = after; DUX-R-5 done only after 5b-3 C PASS; then M1, M3, M4, ROOT-RECON-GRID-HARNESS; checkpoint unanswered, fallback (c); regression due on/after 2026-10-27")
for i,o in enumerate(v['order']):
  if o.startswith('DUX-R-5 one colour rule'):
    v['order'][i]=o+" | D-29z140: DUX-R-5a done (round 174, 0a4a41e); 5b-1 affordances = round 175; 5b-2 on-states next; 5b-3 labels/ghosts/dialog after"
v['dux_r5b_plan_d29z140']={"round":175,
 "inventory":"B grep at 0a4a41e: ~75 brand/accent sites outside focus rings in app/components/arrangement (Lane 48 tokens, StudioWorkspace 29, GroupHeader 23, ExportDialog 23, Transport 15, Library 15, DetailPanel 13, LibraryPreview 9, TempoRow 8, Master 8, MarkerRow 8, Clip 7, LoopBrace 6, GridMenu 4, Ruler 3, scrollbar 2, VideoDock 2 focus, Overview 2)",
 "rule_R34":"brass stays on selecting an object (clip, track, group, marker, Library node/row, marquee, chosen Export option), playheads, primary action (Export) and focus; mode toggles, on-states, affordances, labels and warnings go neutral (vetoable)",
 "kept":{"K7":"selection: GroupHeader l.354 selected block, Lane l.698 / GroupHeader l.270 selected rows, active-track Lane l.665/840/712 + GroupHeader l.195, MarkerRow l.806/813 selected, Library l.49/100, marquee StudioWorkspace l.2504, ExportDialog chosen cards/radios l.289-435",
   "K8":"playheads Ruler l.221, StudioWorkspace l.450","K9":"primary Transport Export l.339 (M1 owns hierarchy)","K10":"focus Library l.473 focus:border-brand, l.638 focus-visible:bg-brand, GroupHeader rename field l.252","K11":"LibraryPreview fill-brand (K5)","K12":"envelope (K6)"},
 "out_of_scope":"app/components/studio/* (outside [data-studio-theme=obsidian], only via protected studio.$productId.tsx, SRW-21 deferred_user)",
 "stage_5b1_round175":{"A1a-f":"accent-brand -> accent-foreground: DetailPanel l.841, Master l.199, Lane l.766 pan, l.820 volume, GroupHeader l.338, Transport l.277 zoom","A2":"Clip l.953 fade handle bg-brand -> bg-background (hollow; distinct from env point bg-foreground border-background)",
   "A3":"Clip l.969/974 hover:bg-accent/60 -> hover:bg-foreground/50","A4":"LoopBrace l.263/269 same","A5":"Lane l.1049 hover + l.1050 dragging -> foreground/50","A6":"studio-scrollbar l.15/16 thumb hover/active bg-brand -> bg-foreground","A7":"Library l.638 hover:bg-brand/40 -> hover:bg-foreground/50",
   "A8":"GroupHeader l.354 unselected block bg-brand/25 -> bg-foreground/25","A9":"Clip l.859/876-879 fixed-string cn() -> plain className (gate-174 S1)","L1-L2":"track-layout l.801/l.835","T1":"affordance-colour-ui.test.tsx DXA1-DXA7","D1":"doc 143 Completed + TODO strike + 5b note","D2":"new doc 144"},
 "computation":"thumb fg vs surface 14.78; fade handle border vs elevated 13.94; fg/50 over elevated 4.40, muted-bg 4.30, background 4.53, surface 4.49 (fg/40 3.25-3.32 rejected); scrollbar dim->fg 2.75 (muted 1.24 rejected); group block fg/25 ~1.98 (today brand/25 1.57), selected brand/60 3.65 (x1.84); muted/60 rejected (vs selected 1.14)",
 "stage_5b2_next":"on-state toggles: Lane Mute l.615 / Solo l.633; GroupHeader Mute l.288 / Solo l.304 / mixed l.306; Master Mute l.173; Transport Delete-with-range l.218, Loop l.234, Follow l.255/256; TempoRow Metronome l.243; StudioWorkspace Snap l.2287, Env l.2368, Waveform Zoom l.2388; LoopBrace enabled l.239/257; LibraryPreview toggle l.308; Library previewing l.132; distinct neutral targets (B-R174-ACCENT-EQ-BRAND); Q-R167-ON-HOVER awaiting_user constrains hover (keep R2)",
 "stage_5b3_after":"labels/ghosts/dialog: Lane drop hint l.874, drop ring l.842, ghosts l.886/887, l.922/923; StudioWorkspace demo badge l.2210, delete hint l.2562, selection count l.2568, refusal l.2605; GridMenu l.204/226/246; ExportDialog l.524/562/569; DetailPanel l.676; Library filter l.492",
 "mutations":"m248-m257","c_rows":"T175-TARGETED, SOURCE-SCOPE, AN-REVIEW, CC-AFFORD, NO-BRASS-AFFORD, CONTRAST-DUX5B1, HANDLE-DISTINCT, ENV-VIS (vs c-round-174/out/env), RV1-DUX5B1 (vs c-round-174/out/d6), FUNC-SMOKE-DUX5B1, RV3-STORE, G175-3, PX-NET/REG-HYD",
 "user_vetoable":True,"added":T}
dux=[x for x in b['design_ux_recommendations'] if x.get('id')=='DUX-R-5'][0]
dux['status']+=" | D-29z140: DUX-R-5a done (round 174 C PASS, 0a4a41e); 5b split into 5b-1 affordances (round 175), 5b-2 on-states, 5b-3 labels/ghosts/dialog; done only after 5b-3 C PASS"
dl=b['deferred_low_polish']
g=[x for x in dl if x['id']=='GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR'][0]
g['round174_update']="gate-174 review suggestion 3: content-colour-ui.test.tsx l.303 repeats the same positional selector (overview.children[1].children); fix both together (ROOT-RECON-GRID-HARNESS or a data hook when data-* edits are allowed)"
of=b['open_findings']
for e in [
 {"id":"C-R174-ENV-BELOW-DROP","severity":"info","status":"acknowledged by B (agrees with C): envelope handle vs the pixels just below dropped 4.79 -> 4.19 at both VPs (a-selected, b-normal, d-muted), still >= 3:1; cause is the lighter neutral waveform under the handle by design (R30); no code change, no deferred_low_polish entry; ENV-VIS re-run in round 175 against c-round-174 values","evidence":"c-round-174/out/env/env-1440-2.json, env-1280-2.json; c-round-174.json bugs[0]"},
 {"id":"B-R174-ACCENT-EQ-BRAND","severity":"low","status":"scheduled (not deferred): in Obsidian --color-accent = --color-brand = #c9a46a (app.css l.3936/3939), so brand-vs-accent state pairs render identically: valid vs blocked drop ghosts (Lane l.886/887, l.922/923), video vs audio drop hint (l.874), Solo on vs Mute on, Follow on vs paused; text/letters still differ; source evidence by B, C to confirm; owned by 5b-2 (on-states) and 5b-3 (ghosts/hints) with distinct targets","evidence":"app/styles/app.css l.3920-3942 at 0a4a41e; current-task.md round 175 §0.3"},
 {"id":"GATE174-S1-FIXED-CN","severity":"low","status":"routed to round 175 A9 (ArrangementClip l.859/876-879 -> plain className)","evidence":"gates/round-174/review.md suggestion 1"},
 {"id":"GATE174-S2-DOC143-STATUS","severity":"low","status":"routed to round 175 D1 (doc 143 Completed)","evidence":"gates/round-174/review.md suggestion 2"},
 {"id":"GATE174-S4-R31-CUE","severity":"info","status":"recorded: video vs audio cue = lightness 1.50:1 + Film icon (WCAG 1.4.1 not broken); R31 vetoable by Saba","evidence":"gates/round-174/review.md suggestion 4; c-round-174.md STATE-DISTINCT"},
 {"id":"GATE174-OVERVIEW-LADDER-NONMONOTONIC","severity":"info","status":"recorded: Overview audio ladder contrast 10.05/3.21/5.69 is not monotonic, same shape as before (8.32/2.87/5.69); vetoable with R33; not scheduled","evidence":"a-round-174.md code review design note; c-round-174.md CONTRAST-DUX5A"},
]:
  e['added']=T; of.append(e)
fr=[x for x in of if x.get('id')=='GATE167-TOKEN-TEST-FRAGILITY'][0]
fr['round174_update']="gate-174 Architecture note (Signal 3, keep): ArrangementClip l.822-842 and colour cn() blocks changed in V-3c-5a/5b and DUX-R-5a; proposal after DUX-R-5b: one test-only task replacing exact-className checks with role-based token checks (selection/playhead/focus/content) in a small helper, same failures on m241-m247, no component change; signal under checkpoint Q2, not scheduled; round 175 new tests assert tokens only"
ck=[x for x in of if x.get('id')=='ARCH-CHECKPOINT-V3C'][0]
ck['status']+=" | round 175 planning: still unanswered; fallback (c); gate-174 role-based test-helper proposal added to Q2 as a signal"
b['architecture_signals'].append({"round":174,"note":"A reviewer (Signal 3, keep): content-colour-ui.test.tsx copies the fake Web Audio/ResizeObserver harness again -> ROOT-RECON-GRID-HARNESS (doc 143 TODO). Gate-174 reviewer (Signal 3, keep): Clip colour region changed repeatedly; post-5b role-based token test helper proposal -> checkpoint Q2; alternative semantic content tokens in app.css after 5b assigns roles; not scheduled","added":T})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(dl),len(of))
