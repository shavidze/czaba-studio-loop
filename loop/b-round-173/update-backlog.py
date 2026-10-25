import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==162, b['version']
T='2026-10-25 B round 173 -> 174 planning (D-29z139)'
b['version']=163
b['updated']='2026-10-25 (B round 173 -> 174 planning, D-29z139)'
b['current_task']=("current-task.md (round 174: D-29z139 - DUX-R-5a one colour rule part 1, content neutral: ArrangementClip l.824 video body bg-accent/10 -> bg-muted-bg (C1), l.840 video header bg-accent/30 -> bg-foreground/15 (C2), "
 "l.861 waveform text-accent/70|text-brand/70 -> text-muted/70 (C3), l.881 video ramps text-accent -> text-foreground (C4); ArrangementOverview l.17 bars -> bg-foreground/80, bg-muted/60, bg-dim (O1); "
 "ArrangementDetailPanel l.221 text-brand/70 -> text-muted/70 (P1); locks L1-L3; new content-colour-ui.test.tsx DXC1-DXC6; doc 141 l.83 strike, doc 142 Completed + R25 known-effect line + l.75 strike; new doc 143; "
 "mutations m241-m247; baseline 02c08fd, 993 files, 8 grants + 2 new, frozen 985, vitest base 10 files 115/115)")
b['advisor_used_by_B']=("2026-10-25 round 173 -> 174 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: preserve-first copies, split DUX-R-5 into 5a content / 5b remaining non-reserved sites (5b scheduled next, not deferred; DUX-R-5 not done until 5b passes), "
 "inheritance check for the 3:1 vs 4.5:1 threshold, named video-vs-audio replacement cue, ENV-VIS re-run in all round-164 states, countable no-brass acceptance, test-lock inventory (video-fades-ui l.383 added), gate-173 findings routed, refreshed checkpoint request")
r=[x for x in b['rounds'] if x['round']==173][0]
r['status']='c_pass_published'
r['result']=("C round 173 PASS browserVerified=true realVerified=true, 0 bugs (RADIUS-V3C5B Overview root/overlay/frame 10px, used radius 9.30 px at 1280 capsule; readout + preview wave 8px; exit 6px; OV-CORNERS no notch; BOX 0.00 px vs probe-ov.json; RV1 0 delta; FUNC-SMOKE incl. W0 not-ready click; G173-3); "
 "gate 173 published 02c08fd on both remotes (verify 172 files / 2576 tests, review 9/10, nothing blocking)")
b['rounds'].append({"round":174,"task":"current-task.md","decision":"D-29z139","status":"dispatched",
 "items":["DUX-R-5a (content colour neutral: clip waveforms, video clip tint/header/ramps, detail waveform, Overview bars; K1-K6 reserved brass kept; ENV-VIS SABA-B-1 re-verify)"],
 "note":"baseline HEAD 02c08fd clean (gate 173 published); 993 files; grants b-round-173-r174-grants.txt (8), new b-round-173-r174-new-files.txt (content-colour-ui.test.tsx, doc 143), frozen 985 (b-round-173-r174-tree-sha256.txt); start copies b-round-173/r174-granted-start/; vitest base b-round-173-r174-vitest-base.txt 10 files 115/115 (b-round-173/out/vitest-base.json)",
 "added":T})
v=[e for e in b['post_current_stage_queue'] if e['id']=='VISUAL-A-OBSIDIAN'][0]
v['status']+=(" | round 174 planning (D-29z139): V-3c-5b done (round 173, C PASS browserVerified=true realVerified=true, 0 bugs, published 02c08fd) -> V-3c-5 complete, V-3c complete, V-3 complete; "
 "DUX-R-5 split (scope unchanged): DUX-R-5a content colour = round 174; DUX-R-5b remaining non-reserved brass sites (fader thumbs, fade handles, trim hover, on-states, text-brand labels, StudioWorkspace text-accent) = next VISUAL-A step; DUX-R-5 done only after 5b C PASS; "
 "then M1, M3, M4, ROOT-RECON-GRID-HARNESS; refreshed checkpoint request b-round-173-checkpoint-request.md (V-3c boundary; fallback (c)); regression due on/after 2026-10-27")
for i,o in enumerate(v['order']):
  if o.startswith('V-3 remainder'):
    v['order'][i]=o.replace("V-3c-5b = round 173 (D-29z138:","V-3c-5b done (round 173, 02c08fd) (D-29z138:")
  if o.startswith('DUX-R-5 one colour rule'):
    v['order'][i]=o+" | split D-29z139: DUX-R-5a content = round 174; DUX-R-5b remaining non-reserved brass sites = next"
v['dux_r5a_plan_d29z139']={"round":174,
 "inventory":"B grep at 02c08fd: ~150 brand/accent class sites in 19 files of app/components/arrangement; content sites = ArrangementClip l.824/840/861/881, ArrangementOverview l.17, ArrangementDetailPanel l.221",
 "computation":"text-muted/70 on elevated 3.76, on muted-bg 3.61, on background 3.98 (>= 3:1 D6/WCAG 1.4.11); fg line vs waveform w/o halo 3.71 (today 3.24); video header bg-foreground/15 text 8.57, vs audio header 1.52; outline-strong rejected (#736b60, text 4.22); Overview ladder fg/80 10.11, muted/60 ~3.3, dim 5.69 (today brand 8.32, brand/50 2.87); brass test R-B>=45 (neutral <=21, brass >=68)",
 "rulings":{"R30":"clip waveform (audio+video) and detail waveform -> text-muted/70","R31":"video body bg-muted-bg, header bg-foreground/15; cue = lightness step + Film icon (hue no longer separates; vetoable)","R32":"video fade ramps text-foreground","R33":"Overview audio bars fg/80, muted/60, dim; video bar unchanged",
  "K1-K6":"kept brass: selected clip ring/border + header (selection), Overview + detail playheads, focus rings, Library preview played fill (playback progress = playhead role), envelope unchanged (SABA-B-1)"},
 "sites":{"C1":"ArrangementClip l.824","C2":"l.840","C3":"l.861","C4":"l.881","O1":"ArrangementOverview l.17","P1":"ArrangementDetailPanel l.221","L1":"detail-panel-polish l.128","L2":"panel-radius-ui l.50","L3":"video-fades-ui l.383","T1":"new content-colour-ui.test.tsx DXC1-DXC6","D1":"doc 141 l.83 strike","D2":"doc 142 status Completed + R25 known-effect line + l.75 strike","D3":"new doc 143"},
 "mutations":"m241-m247",
 "c_rows":"T174-TARGETED, SOURCE-SCOPE, AN-REVIEW, CC-COLOUR, NO-BRASS-CONTENT, SELECTION-BRASS, CONTRAST-DUX5A, ENV-VIS (c164-env.cjs, 12 cells), STATE-DISTINCT, RV1-DUX5A (vs c-round-173/out/d6/d6-*-r1.json), FUNC-SMOKE-DUX5A, RV3-STORE, G174-3, PX-NET/REG-HYD",
 "dux_r5b_scope":"next VISUAL-A step: fader thumbs accent-brand (DetailPanel l.841, Lane x2, GroupHeader, Master, Transport, ExportDialog radios), fade handles ArrangementClip l.956 bg-brand, trim hover l.972/977 hover:bg-accent/60, on-state fills (border-accent/bg-accent/20 etc.), text-brand labels (Lane x6, Library x3, Transport x2, DetailPanel l.676, MarkerRow, Export), StudioWorkspace text-accent x6 / border-accent x4 / bg-accent/20 x3; per-site ruling table (selection / playhead / primary / focus / none); StudioWorkspace granted",
 "user_vetoable":True,"added":T}
dux=[x for x in b['design_ux_recommendations'] if x.get('id')=='DUX-R-5'][0]
dux['status']+=" | D-29z139 split: DUX-R-5a content colour = round 174; DUX-R-5b remaining non-reserved brass sites = next VISUAL-A step; done only after 5b C PASS"
dl=b['deferred_low_polish']
dl.append({"id":"GATE173-S3-PNR5-DUP-MOUNT","severity":"low","status":"deferred_low_polish","title":"panel-radius-ui.test.tsx l.200-212: PNR5's second mount repeats render + double Promise.resolve flush instead of mountPanelWorkspace(collection) with a parameter (duplication only; same behaviour)","owner":"panel-radius-ui.test.tsx (test-only; candidate for ROOT-RECON-GRID-HARNESS / checkpoint Q2)","evidence":"gates/round-173/review.md suggestion 3","added":T})
dl.append({"id":"GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR","severity":"low","status":"deferred_low_polish","title":"panel-radius-ui.test.tsx l.145-148 finds Overview clip bars positionally (overview.children[1] ... :scope > div > div); a new overlay would silently retarget the test; fix with a data hook on the bar wrapper or a [data-timeline-overview] query","owner":"panel-radius-ui.test.tsx (+ ArrangementOverview data hook if chosen)","evidence":"gates/round-173/review.md suggestion 4","added":T})
of=b['open_findings']
for e in [
 {"id":"C-R173-N1-OVERVIEW-MOUSE-FOCUS-RING","severity":"info","status":"product question (not scheduled): a pure mouse click on the Overview shows the brass focus-visible ring because pointerdown calls currentTarget.focus() (ArrangementOverview l.182); pre-existing","evidence":"c-round-173/out/c173-{1440,1280}-o2clean.json pureMouseFocus"},
 {"id":"C-R173-N2-OVERVIEW-PLAYHEAD-OVER-FRAME","severity":"info","status":"acknowledged (stacking order, pre-existing): the Overview playhead at x=0 covers the frame's left border","evidence":"c-round-173/shots/mag/*-O1-root-*-x16.png"},
 {"id":"C-R173-N3-EXIT-RING-OUTLINE","severity":"info","status":"acknowledged (pre-existing): the arrangement-exit focus ring is drawn by the outline; its ring-2 box-shadow computes transparent","evidence":"c-round-173/out/c173-1440-normal-2.json func.focus_exit"},
 {"id":"GATE173-S1-OVERVIEW-CORNER-CUT","severity":"info","status":"routed to round 174 D2(b): one 'known effect, vetoable' line in doc 142 R25; the 10 px overflow-hidden corner cuts ~2 px of a clip bar and ~4 px of the playhead at x=0/extent end; no code change","evidence":"gates/round-173/review.md suggestion 1"},
 {"id":"GATE173-S2-DOC141-TODO","severity":"low","status":"routed to round 174 D1 (doc 141 l.83 strike-through; reviewer cited l.284)","evidence":"gates/round-173/review.md suggestion 2"},
]:
  e['added']=T; of.append(e)
fr=[x for x in of if x.get('id')=='GATE167-TOKEN-TEST-FRAGILITY'][0]
fr['round173_update']="A round-173 reviewer and gate-173 reviewer (Signal 3, keep): panel-radius-ui l.38-100 full className locks re-edited every radius round; PNR5 locks protected StudioWorkspace.tsx source from an owned test (cross-file coupling); proposal token-based expectTokens with ROOT-RECON-GRID-HARNESS -> checkpoint Q2 (b-round-173-checkpoint-request.md). "+T
arch=[x for x in of if x.get('id')=='ARCH-R167-SURFACE-RECIPE'][0]
arch['round173_update']="V-3c boundary reached (round 173 C PASS, 02c08fd); refreshed bounded request b-round-173-checkpoint-request.md Q1 (extract SURF/FILL/MOTION + drop ! suffixes + twMerge radius panel) and Q3 (order vs DUX-R-5b); fallback (c). "+T
ck=[x for x in of if x.get('id')=='ARCH-CHECKPOINT-V3C']
if ck:
  ck[0]['status']+=" | round 174 planning: V-3c boundary reached; refreshed request b-round-173-checkpoint-request.md (Q1 surface recipe, Q2 token-based test assertions + PNR5 cross-file lock, Q3 order vs DUX-R-5b); non-blocking; fallback (c)"
b['architecture_signals'].append({"round":173,"note":"A reviewer and gate-173 reviewer, Signal 3 (keep): full-className locks in panel-radius-ui/studio-theme-obsidian re-edited each radius round; PNR5 reads protected StudioWorkspace.tsx source (cross-file lock); proposal token-based assertions bundled with ROOT-RECON-GRID-HARNESS -> checkpoint Q2; not scheduled","added":T})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],len(dl),bool(ck))
