import json, sys
P='backlog.json'
b=json.load(open(P))
assert b['version']==290, b['version']
ADDED='2026-11-04 B round 331 -> 332 planning'
PERF=json.load(open('b-round-331/perf-numbers.json'))
b['version']=291
b['updated']=ADDED+' (D-29z972..D-29z983)'
b['current_task']=("current-task.md (round 332, D-29z972..D-29z983; PERF-DRAG-PREVIEW stage c2b-i on c1d3fbf: overview wrapper "
 "useEqualityStableSelector + sameOverviewArrangementShownFields (OVERVIEW_CLIP_FIELD_ROLES), memo(ArrangementTrackMeterInner); "
 "DP29-DP32, PS-OVR-ROLES, PS-OVR-ARR; "
 "track-meter-ui name grant; DP28/mountedSelectionMarkup try/finally (GATE331-S3); doc 232 incl. GATE331-S1/S2; sketch b-round-331/sketch/sketch.patch.txt)")
close={
 'SIG-R326-DETAIL-IGNORES-FADE':'closed (D-29z972): C round 331 PASS (DRAG-NAMES fade [14x4], no ArrangementDetail* in fade commits), gate 331 published c1d3fbf',
 'SIG-R326-READOUT-PRIMITIVE':'closed (D-29z972): C round 331 PASS (readout 0 renders per fade move, hint branch on move), gate 331 published c1d3fbf',
 'GATE330-S1':'closed (D-29z972): C round 331 DOCS PASS (K12 1 1 1 1), gate 331 published c1d3fbf',
 'GATE330-S2':'closed (D-29z972): C round 331 DOCS PASS (K12 1 1 1 1), gate 331 published c1d3fbf',
 'SIG-R331-OVERVIEW-FADE':'dispatched round 332 (stage c2b-i, D-29z976): closes on C PASS + gate publish',
}
seen=set()
for f in b['open_findings']:
    if f.get('id') in close:
        f['status']=close[f['id']]; seen.add(f['id'])
    if f.get('id')=='SIG-R331-DETAIL-PICK':
        f['status']=('signal (D-29z967, D-29z973): absorbs A-R331-REVIEW-STALE-CLIP; L46 deadline: T12-ADVANCED micro fades '
                     '(first fade field shown by the detail panel) or one question at RETRO 336, whichever comes first')
        seen.add(f['id'])
assert seen==set(close)|{'SIG-R331-DETAIL-PICK'}, seen
new_findings=[
 {'id':'PERF-CAND-PEAK-PRIMITIVE-PROPS','severity':'info','origin':'B pre-check round 332 (L58)',
  'title':'ArrangementPeakPath re-renders per fade and move although its drawn fields did not change; give it primitive props (clipId, sourceOffset, duration, gainDb) so the default memo skips with no wrapper fiber',
  'status':'candidate (D-29z983) for c2b-ii planning: needs a gain-based scale helper in waveform-zoom.ts and both call sites (ArrangementClip.tsx, ArrangementDetailPanel.tsx); expected saving 1 render per fade move and 2 per move; a custom comparator was measured and rejected (counted wrapper fiber, trim +1)',
  'evidence':'b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt; b-round-331/names-sketch-v1-comparator.json; b-round-331/sketch/sketch-v1-comparator.patch.txt','added':ADDED},
 {'id':'A-R331-REVIEW-STALE-CLIP','severity':'info (was medium, latent; re-rated D-29z973)','origin':'A code-reviewer round 331',
  'title':'ArrangementDetailSelection.clip may hold a clip object with stale fadeIn/fadeOut/envelope; a future spread write-back or fade-aware reader would use old values',
  'status':('design signal, merged into SIG-R331-DETAIL-PICK (D-29z973). Not a bug today: three independent traces found no reader of the ignored '
            'fields and no write-back (a-round-331.md data-safety check; c-round-331.md findings; gates/round-331/review.md "What I checked"); '
            'PS-ROLES and DP27/DP28 force any new field to be classified. L46 deadline as SIG-R331-DETAIL-PICK'),
  'evidence':'a-round-331.md; c-round-331.json carriedFindings; gates/round-331/review.md','added':ADDED},
 {'id':'GATE331-S1','severity':'low','origin':'gate 331 reviewer','title':'SELECTED_CLIP_FIELD_ROLES is not used at runtime; the equality hand-lists its 7 fields',
  'status':('ruled (D-29z975): keep hand-written equalities (also for the new c2b-i overview record): deriving them from the record needs a key list '
            'or a cast under TS strict, and every record is pinned to its equality per field by PS-ROLES / PS-OVR-ROLES; '
            'round 332 doc 232 records the choice (dispatched); closes on C DOCS PASS + gate publish'),
  'evidence':'gates/round-331/review.md suggestion 1','added':ADDED},
 {'id':'GATE331-S2','severity':'low','origin':'gate 331 reviewer','title':"doc 232 title lacks c2a; TODO 'c2' wording stale; item 30 omits sourceOffset",
  'status':'dispatched round 332 §1.3 (D-29z975)','evidence':'gates/round-331/review.md suggestion 2','added':ADDED},
 {'id':'GATE331-S3','severity':'low','origin':'gate 331 reviewer','title':'DP28 and mountedSelectionMarkup unmount only after their assertions (leaked mount on failure)',
  'status':'dispatched round 332 (D-29z975): try/finally in the sketch','evidence':'gates/round-331/review.md suggestion 3','added':ADDED},
 {'id':'GATE331-S4','severity':'info','origin':'gate 331 reviewer','title':"DP25's exact toBe(2) on ArrangementClipViewInner is brittle",
  'status':'closed, kept (D-29z975): it is the positive control of the 0-render asserts; a change in clip-view renders must surface and be ruled','evidence':'gates/round-331/review.md suggestion 4','added':ADDED},
 {'id':'NOTE-C331-OFFSET-ONLY-GUARD','severity':'info','origin':'C round 331','title':'no DP render row isolates a sourceOffset-only change',
  'status':'closed as accepted (D-29z978): the readout equality stays guarded by PS-ROLES (C mutant MU-C331-EQUAL-IGNORES-OFFSET red); a DP render row needs a sourceOffset-only UI change that no gesture makes alone. A sourceOffset-only PeakPath row was built in B\'s v1 sketch and moves with PERF-CAND-PEAK-PRIMITIVE-PROPS','evidence':'c-round-331/mutant-c.txt; b-round-331/mutants-summary-v1-comparator.txt','added':ADDED},
 {'id':'SIG-C331-FADE-COLLAPSES-GROUP','severity':'info','origin':'C round 331 GROUP-SHOWN (identical on HEAD 1e5f552)',
  'title':'pointer-down on a fade handle collapses a multi-clip selection to that clip',
  'status':'signal (D-29z980): candidate question for the next fade feature round (does Live 12 change fades on every selected clip? cite the manual fades section); not a task, not a bug',
  'evidence':'c-round-331.md GROUP-SHOWN','added':ADDED},
 {'id':'B-R332-METER-NAME-RENAME','severity':'info','origin':'B pre-check round 332 (L58)',
  'title':"memo(function ArrangementTrackMeter …) is renamed ArrangementTrackMeter2 by esbuild, so name-keyed render probes miss it",
  'status':'ruled (D-29z977): use ArrangementTrackMeterInner + memo export and grant the 4 name strings in track-meter-ui.test.tsx; named function expression rejected. RETRO 336 lesson candidate (1x): a name-keyed render probe needs the runtime function name, and a custom memo comparator is itself a counted fiber',
  'evidence':'b-round-331/meter-name-probe.txt','added':ADDED},
]
ids={f.get('id') for f in b['open_findings']}
for f in new_findings:
    assert f['id'] not in ids, f['id']
    b['open_findings'].append(f)
dl={x.get('id') for x in b['deferred_low_polish']}
for e in [
 {'id':'C-R331-01','severity':'low','origin':'C round 331 (pre-existing, identical on HEAD 1e5f552)',
  'title':"1280x720 with the detail panel open (52 px lane): the fade-in handle covers the trim-left edge's vertical centre",
  'evidence':'c-round-331/shown/attempt1/a-1280x720-dbg.json (trim-grab); shown/attempt1/compare.txt',
  'repro':"1280x720 -> Add the first library sound -> click its name bar (detail panel open) -> press at the middle of the clip's left edge and drag right -> Undo label 'Fade In', not 'Trim — left edge'",
  'status':'deferred_low_polish (D-29z974); the fix must carry a hit-target row at the smallest lane height (52 px, 1280x720, panel open) and at 1440x900','added':ADDED},
 {'id':'A-R331-REVIEW-DP27-SCOPE','severity':'low','origin':'A code-reviewer round 331',
  'title':'DP27 covers single selection only (group and video branches not exercised); DP28 has no render-count assert; the jsdom FakeAudioBuffer returns zeros',
  'evidence':'a-round-331.md code-reviewer findings','repro':'read DP27/DP28 in drag-preview-render.test.tsx',
  'status':'deferred_low_polish (D-29z978); a non-zero monotonic ramp fixture for peak-path markup rows exists in b-round-331/sketch/sketch-v1-comparator.patch.txt (DP33) for reuse','added':ADDED},
]:
    assert e['id'] not in dl
    b['deferred_low_polish'].append(e)
b['architecture_signals'].append({'id':'ARCH-R331-PREVIEW-READERS','origin':'gate 331 reviewer (architecture note, signal 3)',
 'note':'after c2b, one bounded no-behaviour task moves useEqualityStableSelector and the three *WithPreview/*WithSelection wrappers to ArrangementPreviewReaders.tsx; useArrangement() shape, gesture lifecycle, DP1-DP32 and PS-* unchanged; identical render counts; low cost',
 'status':'signal (D-29z979); not scheduled; sent to checkpoint D-29z915 (b-round-331-checkpoint-addendum.md, run requested after round 332 publishes and before c3)','added':ADDED})
b['architecture_signals'].append({'id':'ARCH-R331-PREVIEW-ISEQUAL','origin':'A code-reviewer round 331 (architecture note)',
 'note':'optional isEqual parameter on useArrangementPreview(selector, isEqual?) in ArrangementContext.tsx; move the lane hook onto it; DP1, DP25-DP32, PS-* green; useArrangement() shape unchanged',
 'status':'signal (D-29z979); not scheduled; part of checkpoint D-29z915 question','added':ADDED})
for r in b['regression_rounds']:
    if r['id']=='REGRESSION-ROUND-2026-11-05':
        r['scope_additions'].append('PERF-DRAG-PREVIEW stage c2b-i (332, if published): one short browser row (fade drag: overview markup unchanged and no overview/meter in the fade commit names; same-lane move: overview bar follows) (D-29z982)')
        r['scope_additions'].append('C-R331-01 is a deferred Low: record only (trim-left centre under the fade handle at 1280x720, panel open)')
for r in b['rounds']:
    if r.get('round')==331:
        r['status']='c_pass_published (D-29z972): C round 331 PASS 14/14, browserVerified/realVerified true, gate 331 published c1d3fbf'
b['rounds'].append({'round':332,'task':'current-task.md','decision':'D-29z972..D-29z983','type':'PERF-DRAG-PREVIEW stage c2b-i (overview equality, TrackMeter memo)','status':'dispatched','note':'baseline c1d3fbf clean; claims b-round-331/claims-332.sh; sketch b-round-331/sketch/sketch.patch.txt','added':ADDED})
for q in b['post_current_stage_queue']:
    if q.get('id')=='STUDIO-PERFORMANCE':
        q['status']=('in_progress (D-29z972..D-29z983): PERF-DRAG-PREVIEW stage c2a done (C round 331 PASS, gate 331 published c1d3fbf); '
                     'round 332 = stage c2b-i (overview equality, TrackMeter memo); then REGRESSION (first round planned on/after 2026-11-05), '
                     'stage c2b-ii (detail start/end text derived in render; PERF-CAND-PEAK-PRIMITIVE-PROPS decided there), c3..c5, conversions, PERF-9..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM | '+q['status'])
        for st in q.get('stages',[]):
            if st.get('id')=='PERF-DRAG-PREVIEW':
                st['status']=('in_progress (D-29z976): stages a, b, c1, c2a done (c2a C round 331 PASS, c1d3fbf); c2 split again: c2b-i dispatched round 332, '
                              'c2b-ii (detail text in render, sentinel keyed on raw numbers) after REGRESSION; fade item target <= 15 met at c2a (14/move), '
                              'sketch c2b-i fade '+str(PERF['fadePerMove'])+'/move; PeakPath comparator dropped from c2b-i (D-29z983) -> PERF-CAND-PEAK-PRIMITIVE-PROPS for c2b-ii; c3..c5 not started | '+st['status'])
dec=[
 ('D-29z972','Round 331 closed as PASS from C evidence: c-round-331.json taskStatus PASS, browserVerified/realVerified true, 14/14 rows; gate 331 published c1d3fbf on both remotes. Stage c2a done. Closed: SIG-R326-DETAIL-IGNORES-FADE, SIG-R326-READOUT-PRIMITIVE, GATE330-S1, GATE330-S2.'),
 ('D-29z973','A-R331-REVIEW-STALE-CLIP re-rated from latent Medium to an info design signal merged into SIG-R331-DETAIL-PICK: no reproducible failure; A, C and the gate-331 reviewer each traced every reader and action (no fade/envelope reader, no spread write-back); PS-ROLES/DP27/DP28 force classification of any new field. L46 deadline: T12-ADVANCED micro fades or one question at RETRO 336.'),
 ('D-29z974','C-R331-01 (Low, pre-existing) -> deferred_low_polish; its fix carries a hit-target row at the smallest lane height (52 px, 1280x720, panel open).'),
 ('D-29z975','Gate 331 Lows: S1 keep hand-written equalities, record the reason in doc 232 (round 332); S2 doc fixes in round 332; S3 try/finally in round 332 (sketch); S4 keep DP25 toBe(2) as the positive control.'),
 ('D-29z976','Stage c2b split into c2b-i (overview equality, memo TrackMeter; one mechanism: skip unchanged fields; the PeakPath comparator was dropped, D-29z983) and c2b-ii (detail start/end text derived in render with the clipGainText sentinel pattern keyed on raw numbers). Both performance-optimizer and tech-lead recommended the split. tech-lead also advised holding the overview until D-29z915; B keeps D-29z966 (proceed): the overview equality only skips renders, falls back to a render when tracks change reference, and DP29/DP30/DP32 + 5 overview mutants guard it.'),
 ('D-29z977','TrackMeter memo uses ArrangementTrackMeterInner + export const ArrangementTrackMeter = memo(...); track-meter-ui.test.tsx gets a 4-string name grant (no expect removed). performance-optimizer suggested a named function expression; B measured that esbuild renames it ArrangementTrackMeter2 (b-round-331/meter-name-probe.txt), which silently breaks the name-keyed probe, so it is rejected.'),
 ('D-29z978','NOTE-C331-OFFSET-ONLY-GUARD closed as accepted: PS-ROLES guards the readout equality (C mutant red); no gesture changes sourceOffset alone. A-R331 reviewer Lows on DP27 scope / zero-peak fixture -> deferred_low_polish A-R331-REVIEW-DP27-SCOPE.'),
 ('D-29z979','Architecture: gate-331 note -> ARCH-R331-PREVIEW-READERS, A note -> ARCH-R331-PREVIEW-ISEQUAL (signals, not scheduled). Signal 3 has recurred in rounds 328-332 on StudioWorkspace.tsx l.637-864: B asks root to run checkpoint D-29z915 after round 332 publishes and before c3 (b-round-331-checkpoint-addendum.md). Non-blocking.'),
 ('D-29z980','SIG-C331-FADE-COLLAPSES-GROUP recorded as a candidate Live-reference question for the next fade feature round; not a task.'),
 ('D-29z983','The ArrangementPeakPath field comparator is dropped from c2b-i. B measured it (v1 sketch): a custom memo comparator turns the simple memo into a MemoComponent wrapper fiber plus the inner fiber, and both probes count both, so trim rose 24.583 -> 25.567 per move (max 23 -> 24) while fade fell to 9.833 and move to 26.233 (b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt; names-sketch-v1-comparator.json shows ArrangementPeakPathInner twice per instance). tech-lead had rated it low value (useMemo already caches the path). Successor PERF-CAND-PEAK-PRIMITIVE-PROPS (primitive props so the default memo skips with no wrapper; touches waveform-zoom.ts and both call sites incl. ArrangementDetailPanel.tsx, which c2b-ii opens) is decided at c2b-ii planning.'),
 ('D-29z981','This task: round 332 = PERF-DRAG-PREVIEW stage c2b-i on c1d3fbf; A applies b-round-331/sketch/sketch.patch.txt and edits doc 232 by hand.'),
 ('D-29z982','Next round: REGRESSION (round 333 will be planned on/after 2026-11-05; regression-last 2026-11-02), carrying REGRESSION-ROUND-2026-11-05 scope_additions incl. one c2a and one c2b-i row; then c2b-ii.'),
]
have={d['id'] for d in b['decisions_log_b']}
for i,t in dec:
    assert i not in have, i
    b['decisions_log_b'].append({'id':i,'date':'2026-11-04','text':t})
json.dump(b,open(P,"w"),ensure_ascii=False,indent=2)
print('ok v',b['version'])
