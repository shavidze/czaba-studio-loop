import json,sys,os
L='/home/runner/czaba-project/tmp/studio-real-loop'
done=L+'/b-round-363/update-backlog.done'
if os.path.exists(done): sys.exit('already applied')
p=L+'/backlog.json'; b=json.load(open(p))
assert b['version']==326
ADD='2026-11-06 B round 363 -> 364 planning'
b['version']=327; b['updated']=ADD
b['current_task']='current-task.md (round 364: PERF-10b-ii-b re-dispatch, PERF-10 stage 5 of 5: C-R363-01 option (a) perf/lib/report.test.ts DC-KINDS regex + toHaveLength 18 from b-round-363/sketch-perflib.patch.txt; C-R363-02 docs 234 (Completed (C round 364 PASS)) and 168; reviewer Lows R-L1/R-L3 in measureBackgroundRangeDrag)'
b['advisor_used_by_B']='yes (round 363 -> 364 planning: advisor available; consulted after orientation, before the approach, and before declaring done) | '+b['advisor_used_by_B']
D=[
 ('D-29z1184','Round 363 (PERF-10b-ii-b) closes as C FAIL from C evidence (c-round-363.json taskStatus FAIL, browserVerified/realVerified true); gate 363 skipped (C FAIL). A STOPped on perf-lib 39/40 (DC-KINDS) and wrote no docs. Passed and kept as partial tree: SOURCE-SCOPE, RB-MEMO 13/13 + MU-P/MU-W/MU-R each red on own row, C mutant red on RB-MEMO2, PERF 95/95 264 rows 0 DIFF vs C362, BG-RANGE both viewports, G363-AUTH. Nothing reverted; PERF-10b-ii-b not done.'),
 ('D-29z1185','C-R363-01 ruled option (a): grant perf/lib/report.test.ts, DC-KINDS regex gains background-range, toHaveLength(16)->18. B sketch (b-round-363/sketch-perflib.patch.txt) perf-lib 40/40; MU-K (bg commits-per-move kind deterministic) and MU-N (remove .6x bg row) each red on DC-KINDS only. Options (b) rename metric and (c) drop rows rejected (defeat the guard / shrink D-29z1181). Origin B-spec (round-363 pre-check never ran perf-lib against the budgets change); recorded as B-R363-PRECHECK-PERFLIB for RETRO 368.'),
 ('D-29z1186','A round-363 code-reviewer rulings: R-L1 apply (reset problem also when selectedAfter !== selectedBefore); R-L3 apply as problems-only checks (clip start/width before the step vs after reset; data-insert-marker just before vs after the name-bar reset click); R-L2 accepted (task-mandated liveness incl. reset); Info items no change; Architecture note -> SIG-R363-DRAG-ROW-WRITER (signal). Probe fact b-round-363/im-probe-*.json (dev, both viewports): insert marker 0.000 at all reads, hidden while a range exists, visible after reset; clip start/width and Undo title unchanged; press at ~0 s so a press-moves-marker effect is not distinguishable (limit stated; check window chosen accordingly).'),
 ('D-29z1187','Round 364 = PERF-10b-ii-b re-dispatch: 6 files (render-budget.test.tsx and budgets unchanged from A round 363; spec R-L1/R-L3; perf/lib/report.test.ts via B patch; doc 234 stage 5 heading "(rounds 363–364, D-29z1182, D-29z1187)", l.4 Completed (C round 364 PASS), DC-KINDS problem/solution, mermaid fix; doc 168 additions). PERF compared against c-round-363/latest-interactions.json. Claims b-round-363/claims-364.sh (K19/K20 new).'),
 ('D-29z1188','Order after round 364 unchanged from D-29z1183: REGRESSION first at any planning on/after 2026-11-08 -> PERF-9 -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 entries. RETRO at 368 or end of STUDIO-PERFORMANCE. Arch checkpoint request (b-round-362/root-request-arch-checkpoint.md) stays open, non-blocking.'),
]
have={d['id'] for d in b['decisions_log_b']}
for i,t in D:
    assert i not in have; b['decisions_log_b'].append({'id':i,'date':'2026-11-06','text':t})
for r in b['rounds']:
    if r.get('round')==363: r['status']='c_fail (D-29z1184): C round 363 FAIL (C-R363-01 perf-lib 39/40, C-R363-02 docs not written); browserVerified true; gate 363 skipped; partial tree kept'
b['rounds'].append({'round':364,'task':'current-task.md','decision':'D-29z1184..D-29z1188','type':'PERF-10b-ii-b re-dispatch: C-R363-01 (DC-KINDS option a), C-R363-02 (docs 234/168), reviewer R-L1/R-L3','status':'dispatched','note':'baseline 9da8daa + A round-363 3 modified files; claims b-round-363/claims-364.sh; sketch b-round-363/sketch-perflib.patch.txt; mutants b-round-363/mutants/','added':ADD})
of=b['open_findings']; byid={f.get('id'):f for f in of}
new=[
 {'id':'C-R363-01','severity':'medium','origin':'B-spec (perf/lib not granted; perf-lib not run on the round-363 budgets change)','title':'perf/lib/report.test.ts DC-KINDS regex/length does not know interact.drag.background-range.stopped.commits-per-move(.6x); perf-lib 39/40','evidence':'c-round-363/perf-lib.log; a-round-363/perf-lib.log; c-round-363.json bugs[0]','status':'scheduled (D-29z1185): round 364 option (a) via b-round-363/sketch-perflib.patch.txt (B sketch 40/40, MU-K/MU-N red); closes on C PASS','added':ADD},
 {'id':'C-R363-02','severity':'medium','origin':'A (STOP before docs; consequence of C-R363-01)','title':'doc 234 l.4 still In Progress (stage 4 of 5), no stage-5 section; doc 168 no background-range mentions; reviewer Lows unapplied','evidence':'c-round-363.json bugs[1]','status':'scheduled (D-29z1187): round 364 docs 234/168 (l.4 Completed (C round 364 PASS)); closes on C PASS','added':ADD},
 {'id':'A-R363-REVIEW-SELECTED-BEFORE','severity':'low','origin':'A code-reviewer (round 363)','title':'measureBackgroundRangeDrag reset check ignores selectedBefore','evidence':'a-round-363.md Code-reviewer','status':'scheduled (D-29z1186): R-L1 in round 364; closes on C PASS','added':ADD},
 {'id':'A-R363-REVIEW-RESET-CLIP-STATE','severity':'low','origin':'A code-reviewer (round 363); C round 363 noted the Insert Marker was not read separately','title':'name-bar reset does not compare clip start/width or the Insert Marker','evidence':'a-round-363.md Code-reviewer; c-round-363.md BG-RANGE','status':'scheduled (D-29z1186): R-L3 in round 364 (problems-only; IM across the reset click; clip start/width across the step); C BG-RANGE reads IM; closes on C PASS','added':ADD},
 {'id':'A-R363-REVIEW-LIVE-INCLUDES-RESET','severity':'low','origin':'A code-reviewer (round 363)','title':'liveness value includes the reset result (duplicate reset problem line)','status':'closed (D-29z1186): accepted, task-mandated by round-363 §1.2','added':ADD},
 {'id':'A-R363-REVIEW-INFO','severity':'info','origin':'A code-reviewer (round 363)','title':'not-found sentinel message, liveId naming, absent rows on early return, RB-MEMO2 mount positive','status':'closed (D-29z1186): no change; RB-MEMO1 covers the waveform mount','added':ADD},
 {'id':'B-R363-PRECHECK-PERFLIB','severity':'low','origin':'B (process)','title':'B dispatched new budgets rows without running every perf/lib test that reads the budgets file on the sketch (cause of C-R363-01)','evidence':'c-round-363.json bugs[0] origin; tasks/round-363.md §0.4','status':'open_retro (D-29z1185): RETRO 368 input (candidate L58 clause); B does not edit lessons.md itself','added':ADD},
]
for f in new:
    assert f['id'] not in byid; of.append(f)
sig={'id':'SIG-R363-DRAG-ROW-WRITER','origin':'A round-363 code-reviewer Architecture note','note':'measureDrag and measureBackgroundRangeDrag row-writing blocks are near-identical; propose writeDragRows only if a third copy appears. Signal only, not scheduled.','added':ADD}
b['architecture_signals'].append(sig)
sp=[e for e in b['post_current_stage_queue'] if e.get('id')=='STUDIO-PERFORMANCE'][0]
sp['status']='in_progress (D-29z1187): round 363 PERF-10b-ii-b C FAIL (C-R363-01/02); round 364 re-dispatch closes PERF-10; then PERF-9 | '+sp['status']
for s in sp['stages']:
    if isinstance(s,dict) and s.get('id')=='PERF-10':
        s['status']='in_progress (D-29z1187): stage 5 PERF-10b-ii-b C FAIL in round 363 (perf-lib DC-KINDS, docs); re-dispatched as round 364 | '+s['status']
json.dump(b,open(p,'w'),ensure_ascii=False,indent=1)
open(done,'w').write('ok\n'); print('updated')
