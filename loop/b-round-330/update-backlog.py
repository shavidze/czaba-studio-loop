import json
P='backlog.json'
b=json.load(open(P))
ADDED='2026-11-04 B round 330 -> 331 planning'
b['version']=290
b['updated']=ADDED+' (D-29z962..D-29z971)'
b['current_task']=("current-task.md (round 331, D-29z962..D-29z971; PERF-DRAG-PREVIEW stage c2a on 1e5f552: shown-field equality "
 "(SELECTED_CLIP_FIELD_ROLES, sameSelectedClipShownFields/sameSelectedClipsShownFields in preview-store.ts) via useEqualityStableSelector "
 "for the selected-clip readout (nothing selected while the lane-move hint shows) and the detail wrapper; DP25-DP28, PS-ROLES, PS-LIST; "
 "doc 232 incl. GATE330-S1/S2; sketch b-round-330/sketch/sketch.patch.txt)")
close={
 'C-R329-01':'closed (D-29z962): C round 330 PASS (click 106, range max 30, 113 rows equal round 328), gate 330 published 1e5f552',
 'C-R329-02':'closed (D-29z962): DP24 present, MU-OVERVIEW-NO-LOOP red (c-round-330/mutants-b.txt), gate 330 published 1e5f552',
 'C-R328-01':'closed (D-29z962): DP20 verified C rounds 329+330, gate 330 published 1e5f552',
 'A-R329-REVIEW-LOOP-EXTENT':'closed with C-R329-02 (D-29z962)',
 'SIG-R326-DETAIL-IGNORES-FADE':'dispatched round 331 (stage c2a, D-29z969): closes on C PASS + gate publish',
 'SIG-R326-READOUT-PRIMITIVE':'dispatched round 331 (stage c2a, D-29z969): closes on C PASS + gate publish',
}
seen=set()
for f in b['open_findings']:
    if f.get('id') in close:
        f['status']=close[f['id']]; seen.add(f['id'])
assert seen==set(close), seen
new_findings=[
 {'id':'INFO-C330-DP21-GRANT','severity':'info','origin':'A (round 330 DP21 strengthening), raised by C','title':"A's 7 DP21 Undo lines beyond the §3 key-rename grant",'status':'closed (D-29z963): accepted; C mutant MU-C330-MEMO-IGNORES-END-DECREASE red on them','evidence':'c-round-330/mutant-c.txt','added':ADDED},
 {'id':'GATE330-S1','severity':'low','origin':'gate 330 reviewer','title':"doc 232 test-file entry (l.128) stops at 'round 329-ში DP20–DP22'",'status':'dispatched round 331 §1.3 (D-29z964)','evidence':'gates/round-330/review.md suggestion 1','added':ADDED},
 {'id':'GATE330-S2','severity':'low','origin':'gate 330 reviewer','title':"doc 232 item 22 says memo was not added; item 23 reverses it",'status':'dispatched round 331 §1.3 (D-29z964)','evidence':'gates/round-330/review.md suggestion 2','added':ADDED},
 {'id':'SIG-R331-OVERVIEW-FADE','severity':'info','origin':'performance-optimizer consult (round 331 planning)','title':'overview wrapper + inner re-render on every fade move (2/move) although the overview draws no fade','status':'signal (D-29z966): held per tech-lead (signal-3 churn region, checkpoint D-29z915); c2b candidate','added':ADDED},
 {'id':'SIG-R331-DETAIL-PICK','severity':'info','origin':'tech-lead consult (round 331 planning)','title':'narrow ArrangementDetailSelection.clip to a Pick<ArrangementClip,...> so a stale field is a compile error','status':'signal (D-29z967): rejected for c2a (ripple into ArrangementClip.tsx PeakPath props, model.ts clipLinearGain, waveform-zoom.ts); revisit at T12-ADVANCED micro fades','added':ADDED},
 {'id':'PERF-CAND-FADE-BUDGET','severity':'info','origin':'B round 331 planning','title':'tighten interact.drag.fade.* move-components budgets (<= 24 today) after c5','status':'candidate (D-29z969): red proof pre-fix 21.633/22 (c-round-330), sketch 13.767/14 (b-round-330/perf-rowcmp-vs-c330.txt); needs a loaded replicate (L37)','added':ADDED},
]
ids={f.get('id') for f in b['open_findings']}
for f in new_findings:
    assert f['id'] not in ids
    b['open_findings'].append(f)
b['deferred_low_polish'].append({'id':'GATE330-S3','severity':'low','origin':'gate 330 reviewer (= INFO-C330-DP24-FAR, A reviewer Low 1)','title':"DP24's far-move '> 20' step would pass with the loop ignored",'evidence':'gates/round-330/review.md suggestion 3; c-round-330.json info','repro':'mutate the overview wrapper to ignore loop; only the 20.000 assertions turn red','status':'deferred_low_polish (D-29z964); optional exact-extent pin needs its own sketch run (L58)','added':ADDED})
b['architecture_signals'].append({'id':'ARCH-R330-LANE-MEMO-WIDTH','origin':'gate 330 reviewer (architecture note) + A round 330 note','note':'memo ArrangementLane and let lanes read the timeline width from a store; removes the 107/108 crossing commit; pays only once the lane is memo-able. Signal 3 churn on StudioWorkspace 808-835/2949-2958 and ArrangementTransport 77-88 recorded as more evidence for checkpoint D-29z915','status':'signal (D-29z965); not scheduled','added':ADDED})
for r in b['rounds']:
    if r.get('round')==330:
        r['status']='c_pass_published (D-29z962): C round 330 PASS 11/11, gate 330 published 1e5f552 (rounds 329+330)'
b['rounds'].append({'round':331,'task':'current-task.md','decision':'D-29z962..D-29z971','type':'PERF-DRAG-PREVIEW stage c2a (selected-clip readers shown-field equality)','status':'dispatched','note':'baseline 1e5f552 clean; claims b-round-330/claims-331.sh; sketch b-round-330/sketch/sketch.patch.txt','added':ADDED})
for e in b['post_current_stage_queue']:
    if e.get('id')=='STUDIO-PERFORMANCE':
        e['status']=('in_progress (D-29z962..D-29z971): PERF-DRAG-PREVIEW stage c1 done (C round 330 PASS, gate 330 published 1e5f552); '
          'round 331 = stage c2a (selected-clip readout + detail panel shown-field equality); then REGRESSION (first round planned on/after 2026-11-05), '
          'stage c2b (overview, TrackMeter memo, PeakPath comparator, detail text in render), c3..c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | ')+e['status']
for e in b['regression_rounds']:
    if e.get('id')=='REGRESSION-ROUND-2026-11-05':
        e['scope_additions'].append('PERF-DRAG-PREVIEW stage c2a (331, if published): one short browser row (fade drag: readout/detail unchanged; move: hint shown)')
D=[
 ('D-29z962','Round 330 closed PASS from C evidence (11/11, browserVerified/realVerified true); gate 330 published 1e5f552 (rounds 329+330). PERF-DRAG-PREVIEW stage c1 done. Closed C-R329-01, C-R329-02, C-R328-01, A-R329-REVIEW-LOOP-EXTENT.'),
 ('D-29z963','INFO-C330-DP21-GRANT: A\'s 7 DP21 Undo lines accepted (C mutant MU-C330-MEMO-IGNORES-END-DECREASE red on them).'),
 ('D-29z964','Gate-330 review: S1 (doc 232 l.128 test list) and S2 (item 22 vs 23) folded into round 331 §1.3 (same owned file); S3 (= INFO-C330-DP24-FAR) -> deferred_low_polish.'),
 ('D-29z965','Gate-330 architecture proposal (ArrangementLane memo + width from store) -> architecture_signals ARCH-R330-LANE-MEMO-WIDTH, linked to D-29z915; not scheduled. A round-330 architecture note (keep) recorded with it.'),
 ('D-29z966','Stage c2 split c2a/c2b. performance-optimizer wanted overview + memo(TrackMeter) in c2a; tech-lead wanted the overview held (signal-3 churn, D-29z915). B follows tech-lead on the overview (SIG-R331-OVERVIEW-FADE, 2/fade move) and moves TrackMeter memo, PeakPath comparator and the detail layout-effect text to c2b. c2b takes the overview when D-29z915 is answered or still unanswered at c2b planning.'),
 ('D-29z967','tech-lead Pick<ArrangementClip> projection rejected for c2a: ripple into ArrangementClip.tsx (PeakPath props), model.ts clipLinearGain, waveform-zoom.ts clipWaveformScale; replaced by exhaustive Record<keyof ArrangementClip, role> + PS-ROLES + DP27 fresh-mount markup guard. Signal SIG-R331-DETAIL-PICK for T12-ADVANCED.'),
 ('D-29z968','useEqualityStableSelector stays in StudioWorkspace.tsx next to its 2 callers (zustand useShallow ref pattern); extraction to app/hooks/ is c2b\'s first step if a second file needs it.'),
 ('D-29z969','SIG-R326-DETAIL-IGNORES-FADE and SIG-R326-READOUT-PRIMITIVE close on round 331 C PASS + gate; SIG-R326-SKIP-UNCHANGED-FADE stays a signal; PERF-CAND-FADE-BUDGET recorded (pre-fix 21.633/22, sketch 13.767/14). B\'s sketch DP26 disproved the "move readout render is legitimate" hypothesis (hint branch); first DP27 (same-mount) was vacuous against MU-DETAIL-SHOWS-FADE/MU-DETAIL-FADE-ATTR and was replaced by fresh-mount compare + DP28.'),
 ('D-29z970','Round 331 task: current-task.md; sketch b-round-330/sketch/sketch.patch.txt (preview-store.ts, StudioWorkspace.tsx, drag-preview-render.test.tsx DP25-DP28, preview-store.test.ts PS-ROLES/PS-LIST) + doc 232; evidence: perf 104 EQUAL / 17 DIFF vs C round 330 (fade 21.633->13.767, max 22->14; move 30.367->29.4, max 108->107), 36/36 asserted; names probe fade [14x4], move [22,2,22,2,107,2,22,2]; full vitest 3570/3570; 7 mutants red.'),
 ('D-29z971','Next round: REGRESSION if planned on/after 2026-11-05 (regression-last 2026-11-02), carrying REGRESSION-ROUND-2026-11-05 scope_additions; otherwise stage c2b.'),
]
have={d['id'] for d in b['decisions_log_b']}
for i,t in D:
    assert i not in have
    b['decisions_log_b'].append({'id':i,'date':'2026-11-04','text':t})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
