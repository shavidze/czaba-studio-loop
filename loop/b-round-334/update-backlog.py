import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==293
b['version']=294
b['updated']='2026-11-04 B round 334 -> 335 planning (D-29z1004..D-29z1010)'
b['current_task']='current-task.md (round 335, D-29z1004..D-29z1010; PERF-DRAG-PREVIEW stage c3-i on 0d22ab9: test-only cross-lane move scenario measureLaneDrag in perf/studio-lab-interactions.perf.spec.ts + 26 record rows in perf/budgets.interactions.json (interact.drag.lane.*, interact.harness.drag-lane-live); docs 232 and 168; claims b-round-334/claims-335.sh; HEAD premise b-round-334/cross-head-1440-summary.txt)'
D=[
("D-29z1004","Round 334 closed PASS from C evidence: c-round-334.json taskStatus PASS, browserVerified/realVerified true, 13 rows, 0 bugs; gate 334 published 0d22ab9 on both remotes (review COMMIT OK). PERF-DRAG-PREVIEW stage c2b-iii -> done; PERF-CAND-PEAK-PRIMITIVE-PROPS -> done (C measured fade 9.833/move max 10, move 24.267 max 101 = sketch; c-round-334/perf-rowcmp-vs-c333.txt)."),
("D-29z1005","Gate-334 review: finding 1 (clipWaveformScale no production caller) -> evidence on SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY; finding 2 (inline dB in context) -> evidence on SIG-R334-INLINE-DB-GAIN; info 3 closed GATE334-I3 (C measured numbers equal the sketch numbers doc 232 cites); info 4 accepted GATE334-I4 (exact render-count pins expected for the perf stage); Architecture note -> signal ARCH-R334-PEAKPATH-FILE (not scheduled; after c3-c5)."),
("D-29z1006","A round 334 code-reviewer Lows A-R334-REVIEW-WG9-UNDEF, A-R334-REVIEW-DP-ORDER, A-R334-REVIEW-DP43-DETAIL -> deferred_low_polish (2026-10-23 bug gate); round 335 does not own those test files."),
("D-29z1007","Checkpoint D-29z915 unanswered at round 335 planning (rounds 332-334 published without it): recorded default keep applied, as ARCH-R207 (D-29z182); c3 proceeds; preview-readers extraction stays a separate no-behaviour task after c5; request stays open with addendum b-round-334-checkpoint-addendum.md."),
("D-29z1008","c3 split into c3-i and c3-ii (L37, L58): the interactions harness has no cross-lane scenario (claims K3/K5), so c3-i = test-only harness row measureLaneDrag + 26 record rows at HEAD; c3-ii = clipLaneDrag provider useState -> per-provider store, measured against C round 335's lane rows. HEAD premise (b-round-334/cross-head-1440-summary.txt, 2 identical runs): cross-lane moves 87 components each with ArrangementProvider rendering every move (hooks 0 and 35), vs same-lane 19/19/101/19 without provider."),
("D-29z1009","Rounds 336/337 order: if the round-336 planning is on or after 2026-11-05, 336 = REGRESSION (speed rule) and 337 = RETRO; if before, 336 = RETRO and REGRESSION is the first round planned on or after 2026-11-05. c3-ii follows both."),
("D-29z1010","This task: round 335 = PERF-DRAG-PREVIEW stage c3-i on 0d22ab9; A owns perf/studio-lab-interactions.perf.spec.ts, perf/budgets.interactions.json, docs 232 and 168 (three sections); A: claims, typecheck, lint, perf alone (193 rows, 121 pre-existing non-wallclock EQUAL vs c-round-334, 18 NEW, drag-lane-live 1), premise, mutant MU-LANE-NO-CROSS; C: claims, scope, perf, premise (lane-rows.txt baseline for c3-ii), 2 mutants, CROSS-NAMES browser A==HEAD==b-round-334/cross-head-1440.json, harness read, G335-AUTH, docs. Order after: REGRESSION/RETRO per D-29z1009 -> c3-ii -> c4 -> c5 -> conversions -> PERF-9..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule)."),
]
for i,t in D: b['decisions_log_b'].append({"id":i,"date":"2026-11-04","text":t})
r=b['rounds'][-1]; assert r['round']==334
r['status']='c_pass_published (D-29z1004): C round 334 PASS browserVerified/realVerified true; gate 334 published 0d22ab9'
b['rounds'].append({"round":335,"task":"current-task.md","decision":"D-29z1004..D-29z1010","type":"PERF-DRAG-PREVIEW stage c3-i (cross-lane perf harness row, test-only)","status":"dispatched","note":"baseline 0d22ab9 clean; claims b-round-334/claims-335.sh; premise b-round-334/cross-head-1440-summary.txt","added":"2026-11-04 B round 334 -> 335 planning"})
q=b['post_current_stage_queue'][7]; assert q['id']=='STUDIO-PERFORMANCE'
q['status']='in_progress (D-29z1004..D-29z1010): PERF-DRAG-PREVIEW stage c2b-iii done (C round 334 PASS, gate 334 published 0d22ab9); round 335 = stage c3-i (cross-lane harness row, record); then REGRESSION/RETRO per D-29z1009, c3-ii, c4, c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | '+q['status']
it=[s for s in q['stages'] if s.get('id')=='PERF-DRAG-PREVIEW'][0]
it['status']='in_progress (D-29z1004/D-29z1008): stages a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii done (c2b-iii C round 334 PASS, 0d22ab9; fade 9.833, move 24.267/move); c3 split into c3-i (round 335: harness row measureLaneDrag, 26 record rows) and c3-ii (clipLaneDrag store); c4, c5 not started | '+it['status']
it['split_d29z1008']={"c3_i":"round 335: test-only cross-lane scenario in perf/studio-lab-interactions.perf.spec.ts (own lane -> next lane -> own lane, name-bar grab); rows interact.drag.lane.{stopped,playing}.{move-components-per-move,move-components-max,release-commits} deterministic record, .{cross,lane}-components-per-move wallclock record, playing .{move,release}-restarts, interact.harness.drag-lane-live record; 26 rows with .6x","c3_ii":"clipLaneDrag provider useState -> per-provider store (PERF-8a pattern); map provider hooks 0 and 35 that change per cross-lane move; convert drag-lane-live to assert == 1 and set budgets from C round 335 lane-rows.txt via B's sketch run (L58)","premise_head_0d22ab9":"dev 1440x900, b-round-334/cross-head-1440-summary.txt: same-lane 19/19/101/19 no provider; cross-lane 87 per move, provider renders every move; enter 101+91; release 93"}
for f in b['open_findings']:
  if f.get('id')=='PERF-CAND-PEAK-PRIMITIVE-PROPS':
    f['status']='done (D-29z1004): stage c2b-iii C round 334 PASS, gate 334 published 0d22ab9 | '+f['status']
  if f.get('id')=='SIG-R334-INLINE-DB-GAIN':
    f['evidence']=f.get('evidence','')+'; gate-334 review finding 2 (gates/round-334/review.md, D-29z1005)'
  if f.get('id')=='SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY':
    f['evidence']=f.get('evidence','')+'; gate-334 review finding 1: only waveform-zoom.test.tsx:16/:110/:445-450 call it (gates/round-334/review.md, D-29z1005)'
b['open_findings']+= [
 {"id":"GATE334-I3","severity":"info","origin":"gate 334 reviewer","title":"doc 232 quotes B's sketch numbers for c2b-iii","status":"closed_info (D-29z1005): C round 334 measured 9.833/10 fade and 24.267/101 move, equal to the sketch numbers (c-round-334/perf-rowcmp-vs-c333.txt)","evidence":"gates/round-334/review.md info 3","added":"2026-11-04 B round 334 -> 335 planning"},
 {"id":"GATE334-I4","severity":"info","origin":"gate 334 reviewer","title":"DP43-DP48 pin exact render counts tied to the current memo structure","status":"accepted_info (D-29z1005): expected for the perf stage; later stages update the pins with sketch evidence","evidence":"gates/round-334/review.md info 4","added":"2026-11-04 B round 334 -> 335 planning"},
]
lows=[("A-R334-REVIEW-WG9-UNDEF","clip-gain-waveform.test.tsx WG9 expect(panel.d).not.toBe(fromStart?.path) would pass trivially if fromStart were undefined; safe today only because expectedShape throws without peaks","add expect(fromStart).toBeDefined() before the compare"),
("A-R334-REVIEW-DP-ORDER","drag-preview-render.test.tsx: DP48 sits before DP47 (cosmetic order)","reorder the two it() blocks"),
("A-R334-REVIEW-DP43-DETAIL","DP43 does not check whether the detail panel is open; its 0-render assert covers the lane only","state or assert the detail panel state in DP43")]
for i,t,fix in lows:
  b['deferred_low_polish'].append({"id":i,"severity":"low","origin":"A round 334 code-reviewer","title":t,"evidence":"a-round-334.md code-reviewer findings; c-round-334.md Bugs","repro":"read the named test row in app/lib/arrangement/__tests__","fix_hint":fix,"status":"deferred_low_polish (D-29z1006)","added":"2026-11-04 B round 334 -> 335 planning"})
b['architecture_signals'].append({"id":"ARCH-R334-PEAKPATH-FILE","origin":"gate 334 reviewer (architecture note)","note":"ArrangementPeakPath is exported from ArrangementClip.tsx (~1000 lines) and imported by ArrangementDetailPanel.tsx; move ArrangementPeakPath, buildPeakShape and the props type into ArrangementPeakPath.tsx, keep the ArrangementPeakPathInner name, DP43-DP48, WG1-WG10, WZ1 unchanged, no behaviour change; after c3-c5","status":"signal (D-29z1005); not scheduled; added to checkpoint D-29z915 (b-round-334-checkpoint-addendum.md)","added":"2026-11-04 B round 334 -> 335 planning"})
rr=[x for x in b['regression_rounds'] if x.get('id')=='REGRESSION-ROUND-2026-11-05'][0]
rr['status']='planned (D-29z1009): round 336 if its planning is on or after 2026-11-05 (then RETRO 337); otherwise the first round planned on or after 2026-11-05 | '+rr['status']
rr['scope_additions'].append("PERF-DRAG-PREVIEW c2b-iii (published 0d22ab9): one short browser row (lane and detail waveform path d after a fade drag and a Clip Gain change equal the pre-drag shape rules; no visual change) (D-29z1009)")
rr['scope_additions'].append("PERF-DRAG-PREVIEW c3-i (round 335, if published): one row reading interact.harness.drag-lane-live = 1 in the regression perf run (D-29z1009)")
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok', b['version'], len(b['decisions_log_b']))
