import json,sys
p='backlog.json'; b=json.load(open(p))
if b['version']!=280: sys.exit('refuse: version is not 280 (already run?)')
T='2026-11-03 B round 321 -> 322 planning'
b['version']=281; b['updated']=T
b['current_task']='current-task.md (round 322, D-29z890..D-29z895; PERF-8b selectedClipIds into a per-provider zustand selection store + RT-FIX of retro-321 sections 4/8/9; baseline 53c5c79; budget rows record (L58, type-only sketch); harness click row and activeTrackId stay PERF-10)'
b['advisor_used_by_B']='round 321 planning: advisor available and used (before writing and before finishing)'
D=[
("D-29z890","Round 321 ruled: C FAIL (c-round-321.json) on three Low B-origin findings in the retro documents only (C-R321-01 section 9 assert range, C-R321-02 D-29z801 missing from the inventory, C-R321-03 section 4 '7 + 2'); browserVerified/realVerified true; 8 rows PASS; no app bug; gate 321 skipped. B corrected retros/retro-321.md (b-round-321/retro-321-fix.diff.txt; asserts-specified-305-320.txt; retro321-mentions-v2.py 18 ids + 4 strings). The three ids stay open until the round-322 RT-FIX row passes; RETRO-321 closes with it. A's L58 feedback recorded as RC-R321-RECORD-WORDING (applied in the round-322 task)."),
("D-29z891","Round 322 = RT-FIX + PERF-8b (planning 2026-11-03 < 2026-11-05, REGRESSION not due). B HEAD probe (b-round-321/click-hooks-head.json, select-same-lane-head.json): the harness click changes selectedClipIds AND activeTrackId; selection-only click (same lane) changes only selectedClipIds (105 dev components); re-click of the selected clip stores an equal-content array (92). PERF-8b keeps D-29z860: only selectedClipIds moves, with an order-sensitive equality guard; activeTrackId and interact.click.* stay PERF-10 (performance-optimizer). tech-lead's one-store alternative recorded as SIG-R322-ACTIVE-TRACK-STORE (PERF-10 signal)."),
("D-29z892","PERF-8b is the final PERF-8 stage: grants doc 230 l.4 -> Completed (C round 322 PASS) and new doc 231 l.4 (L28); GATE320-L1 doc 230 rulings line rides; GATE320-S2 browser experiment S2-VIDEO (b-round-321/s2-probe.mjs): HEAD add-video path shows 2 commits with range cleared and old selection drawn (~8 ms), 0 rAF frames observed; library Enter-add shows no split."),
("D-29z893","L58 applied: B built a type-only sketch (b-round-321/sketch-type-tsc.log: 92 errors, 3 app files, 29 test files) and ran the full suite on it (precheck-full.log: 110 failed / 128 passed; 81 outside-list files all fail on the unmigrated StudioWorkspace render crash, precheck-classify.txt). No store migration was sketched, so every new budget row is record ('record — not run on sketch: B built a type-only sketch'); C acceptance is relative to the HEAD control (same-lane.30.components <= half the control, reclick 0 commits) plus SELECT-NAMES from B's saved HEAD probe; mutantRedOnSketch null."),
("D-29z894","Store pattern: ARCH-CHECKPOINT-PERF8-STORE-PATTERN unanswered, so PERF-8b follows D-29z193 (zustand/vanilla, per provider, range-store shape). Explicit shape-change grant: selectedClipId and selectedClipIds leave ArrangementContextValue/useArrangement() (read with useArrangementSelection); precedent GATE320-C1 / tasks/round-318.md l.102."),
("D-29z895","Bookkeeping: tasks/round-321.md archived (cmp equal); C-R321-01/02/03 added to open_findings (open, RT-FIX round 322); next after PERF-8b: REGRESSION if planned on/after 2026-11-05, else PERF-DRAG-PREVIEW; queue otherwise unchanged; regression-last unchanged (2026-11-02)."),
]
for i,t in D: b['decisions_log_b'].append({'id':i,'date':'2026-11-03','text':t})
q=[e for e in b['post_current_stage_queue'] if e['id']=='STUDIO-PERFORMANCE'][0]
q['status']='in_progress (D-29z890..D-29z895): round 321 RETRO C FAIL on 3 retro Lows only (RT-FIX in round 322); round 322 = PERF-8b + RT-FIX | '+q['status']
st={s['id']:s for s in q['stages']}
st['PERF-8b']['status']='in_progress (D-29z891..D-29z894): dispatched round 322 (selectedClipIds only, equality guard, record rows, SELECT-NAMES, S2-VIDEO) | '+st['PERF-8b']['status']
st['PERF-8b']['premise_d29z891']={'harness_click_hooks':'selectedClipIds + activeTrackId','same_lane_select':'selectedClipIds only, 105 dev components','reclick':'equal-content array, 92 dev components','evidence':'b-round-321/click-hooks-head.json, b-round-321/select-same-lane-head.json'}
st['PERF-8']['status']='in_progress (D-29z891): PERF-8a done; PERF-8b dispatched round 322 (final stage) | '+st['PERF-8']['status']
st['PERF-10'].setdefault('signals_d29z891',[]).append('SIG-R322-ACTIVE-TRACK-STORE: activeTrackId (with the harness clip-click row interact.click.components, 103) moves to a store here; tech-lead proposed one selection store holding both (round 321 planning consult)')
of={f['id']:f for f in b['open_findings']}
of['GATE320-S2-POST-AWAIT-ORDER']['status']='open_low_provisional (D-29z892): HEAD probe b-round-321/s2-video-head.json shows the mechanism in the DOM (2 commits, range cleared + old selection, ~8 ms) with 0 rAF frames observed; PERF-8b S2-VIDEO row on A tree must show 0 mixed commits, else Medium | '+of['GATE320-S2-POST-AWAIT-ORDER']['status']
of['GATE320-L1-DOC230-GRANT-LINE']['status']='scheduled (D-29z892): round 322 grants the doc 230 rulings line | '+of['GATE320-L1-DOC230-GRANT-LINE']['status']
for fid,title,ev in [
 ('C-R321-01','retro-321.md section 9 said all 16 rounds name asserts (7-18); source: 15 of 16 (305 null), range 1-19','c-round-321.md RT-NUM; fixed text: b-round-321/asserts-specified-305-320.txt'),
 ('C-R321-02','RETRO 320/321 inventory regex missed D-29z801 (\'RETRO round 320\'); no section 8 disposition','c-round-321.md RT-IDS; fixed: b-round-321/retro321-mentions-v2.py'),
 ('C-R321-03','retro-321.md section 4 \'7 + 2\' mixed open focus with open keyboard (should be 9 + 2)','c-round-321.md; b-round-320/classify.txt'),
]:
    b['open_findings'].append({'id':fid,'severity':'low','origin':'B','title':title,'source':ev,'status':'open (D-29z890): corrected in retros/retro-321.md at round 322 planning; closes on the round-322 RT-FIX row PASS','added':T})
b['retro_candidates'].append({'id':'RC-R321-RECORD-WORDING','text':"a row B could not run on its sketch is written 'record — not run on sketch: <reason>' per row, so A does not treat a record number as a budget or its miss as a STOP (A round 321 lesson feedback on L58)",'status':'candidate for RETRO 336 (D-29z890); applied in the round-322 task','added':T})
rr=[r for r in b['retro_runs'] if r.get('round')==321][0]
rr['status']='C FAIL round 321 on 3 Low traceability findings (C-R321-01/02/03); corrected at round 322 planning (D-29z890); closes on round-322 RT-FIX PASS'
json.dump(b,open(p,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'])
