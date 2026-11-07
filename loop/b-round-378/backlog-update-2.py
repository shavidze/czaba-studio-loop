import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==344, b['version']
D='2026-11-07'; BY='B round 378 -> 379 planning'
of=b['open_findings']; ids={f.get('id'):f for f in of}
def add(f):
    assert f['id'] not in ids, f['id']
    f.setdefault('added', D+' '+BY); of.append(f); ids[f['id']]=f
q=[e for e in b['post_current_stage_queue'] if e['id']=='STUDIO-PERFORMANCE'][0]; st={s['id']:s for s in q['stages']}
c=st['PERF-11c-iii-c2b']
c['status']='dispatched round 379 (D-29z1260): sketch b-round-378/sketch.patch.txt v2 (sha in b-round-378/sketch-dispatched.sha256); tech-lead APPROVE v1 + delta APPROVE v2 (b-round-378/sketch-review.md); full suite 252/3725; RB-LEAF6; mutants MU-MR-NO-MEMO / ACTIONS-FRESH / MARKERS-FRESH red only on RB-LEAF6 (l.981), MU-MR-HEAD-REVERT name guard (l.966) | '+c['status']
c['what']='ArrangementMarkerRowView = memo(ArrangementMarkerRowViewInner) with markers, projectEnd, layout props, actions (useArrangementMarkerRowActions: 11 provider callbacks) and handleRef (replaces forwardRef; the test render log names only plain function fibers); no wrapper (StudioWorkspace is the only consumer); focusEditorSuccessor clears pendingFocusRef (TL-R379-L1, HEAD-equal); row RB-LEAF6 with playback/range zero steps, projectEnd-only positive and a handle check'
st['PERF-11c-iii']['status']='in_progress (D-29z1260): a, b, c1, c2a done (gates 374 ad13a96, 375 6b11be7, 377 79ed8a9, 378 3ae2885); round 379 = c2b (MarkerRow); d/e wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING or RETRO 384 | '+st['PERF-11c-iii']['status']
q['status']='in_progress (D-29z1260): PERF-11c-iii-c2a done (C round 378 PASS, gate 378 3ae2885); round 379 = PERF-11c-iii-c2b (MarkerRow); then REGRESSION-2026-11-08 (next planning on/after 2026-11-08); d/e wait for the checkpoint or RETRO 384 | '+q['status']
g=ids['GATE378-L2-LOOP-IMMUTABILITY-PIN']
g['status']='deferred_low_polish (D-29z1260, corrects D-29z1259): RB-LEAF5/RB-LEAF6 pin loop/markers IDENTITY across non-loop/non-marker commits, which does not catch an in-place mutation (identity is kept by a mutation); the reviewer guard (a source scan forbidding in-place writes to arrangement.loop / markers, or frozen test fixtures) stays open; not scheduled in round 379'
for dl in b['deferred_low_polish']:
    if dl.get('id')=='GATE378-L2-LOOP-IMMUTABILITY-PIN': dl['status']=g['status']
add({'id':'INFO-TL-R379-D1','severity':'info','origin':'B pre-check (tech-lead delta review of the round-379 sketch)','title':'RB-LEAF6 Play/Stop/range block asserts ViewInner 0 without StudioWorkspace > 0 in that block','evidence':'b-round-378/sketch-review.md section 2','status':'info (D-29z1260): ruled not applied (optional; the mute/undo loop of the same row shows workspace renders with ViewInner 0 and the behaviour mutants are red there)'})
add({'id':'INFO-B379-LEAF-PREVIEW-WALLCLOCK','severity':'info','origin':'B pre-check','title':'leaf probe ArrangementLibraryPreviewViewInner on library-preview-stop counts preview progress frames by wallclock (~315, +-1 under load)','evidence':'b-round-378/probe/leaf-sketch-vs-head-379.txt (sketch v2 under concurrent full-suite load 314/316 vs HEAD 315; v1 unloaded equal)','status':'info (D-29z1260): LEAF-PROBE treats that cell as record +-3 (L37)'})
b['architecture_signals'].append({'id':'SIG-R379-ACTIONS-CONTEXT','origin':'tech-lead review of the round-379 sketch (TL-R379-ARCH)','note':'fifth useXActions(workspace) + memo leaf with a hand-written 11-entry useMemo; StudioWorkspace still renders every commit; proposal: split the stable callbacks into one actions context created once in the provider so leaves read actions directly and the per-leaf hooks and actions props disappear (= option B of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING). Seventh echo; not scheduled','added':D+' '+BY})
for r in b['architecture_checkpoint_requests']:
    if r.get('id')=='ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING':
        r.setdefault('inputs',[]).append('D-29z1260: SIG-R379-ACTIONS-CONTEXT (seventh echo, tech-lead on the c2b sketch, favours option B). With c2b all small leaves are pattern A; d (VideoDock) and e (Lane) wait for the root answer or RETRO 384 (deadline, L46)')
b['rounds'].append({'round':379,'task':'current-task.md','decision':'D-29z1258..D-29z1261','type':'PERF-11c-iii-c2b: MarkerRow leaf (memo view + actions hook + handleRef), row RB-LEAF6, 4 mutants; C unit/mutants/perf/leaf probe/marker browser recipe/auth/smoke/L50 ruling','status':'dispatched','note':'baseline 3ae2885 (gate 378); claims b-round-378/claims-379.sh; sketch v2 eaa1b3fd','added':D+' '+BY})
b['current_task']='current-task.md (round 379: PERF-11c-iii-c2b MarkerRow leaf; sketch b-round-378/sketch.patch.txt v2)'
b['decisions_log_b'].extend([
 {'id':'D-29z1260','date':D,'by':BY,'decision':'REGRESSION not due (2026-11-05 -> 2026-11-07 = 2 days < 3); round 377 placing c2b after REGRESSION was a timing guess, not a rule, so round 379 = PERF-11c-iii-c2b (MarkerRow). Sketch v1 42ae6ae9 reviewed by tech-lead (APPROVE, Lows TL-R379-L1 pending-focus clear and TL-R379-L2 RB-LEAF6 gaps, both fixed in v2; ARCH note -> SIG-R379-ACTIONS-CONTEXT); v2 eaa1b3fd delta-reviewed APPROVE (optional Low D1 ruled not applied). v2: tsc/Biome 0, full suite 252/3725, mutants red only on RB-LEAF6, marker recipe = HEAD both viewports, leaf probe MarkerRow-only differences (plus one wallclock preview cell). Perf spec ran on v1 (0 FAIL, 0 count-row change except the known record median); v2 delta outside perf scenarios. GATE378-L2 status corrected: identity pins do not catch in-place mutation; stays deferred'},
 {'id':'D-29z1261','date':D,'by':BY,'decision':'Order after round 379: REGRESSION-2026-11-08 at the next planning on/after 2026-11-08 (regression-last 2026-11-05), then PERF-11c-iii-d/e only after ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING answer or RETRO 384, PERF-11b, PERF-12..15, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries under the skip rule. lessons.md unchanged (60 lines; no Saba-reported issue). Not applicable: reference-first, product-designer, YouTube, screen budget (invisible perf refactor). Advisor available and consulted'},
])
b['version']=345; b['updated']=D+' '+BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok', b['version'])
