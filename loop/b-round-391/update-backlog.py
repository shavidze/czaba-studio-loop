import json, os
P='backlog.json'; DONE='b-round-391/update-backlog.done'
if os.path.exists(DONE): raise SystemExit('already applied')
b=json.load(open(P))
assert b['version']==358, b['version']
W='2026-11-07 B round 391 -> 392 planning'
b['version']=359; b['updated']=W
b['current_task']='Round 392: PERF-13b-ii re-dispatch: settle ruling for A STOP / C-R391-01 (owner-controller success, null-owner no loading write), EV9 superseded rewrite, EV23-25, doc 251 (current-task.md)'
for r in b['rounds']:
  if r.get('round')==391:
    r['status']='C FAIL (c-round-391.json: C-R391-01 Medium = A STOP, C-R391-02 Low; browserVerified true; B1,B3-B6,PERF-RES PASS); gate 391 skipped; work kept in tree (D-29z1330)'
b['rounds'].append({"round":392,"task":"current-task.md","decision":"D-29z1330..D-29z1335","type":"PERF-13b-ii re-dispatch: settle rule decided by the owner controller (not the cache) at Play and preview; null owner -> sourceNotLoaded, no loading write; superseded failure unconditional; EV9 superseded rewritten to sourceReady, EV9 stop, EV12 extended, EV23-25; doc 251; C rows B7 (C-R391-01 repro), B8 preview->Space, B9 superseded failure, B1-B4, PERF-RES","status":"dispatched","note":"baseline 11ca746 + A round-391 tree (5 status lines); grants b-round-391/grants-392.txt (6, same as 391); frozen b-round-390/r391-frozen-sha256.txt (1279, 0 fail); claims b-round-391/claims-392.sh K1..K24","added":W})
of=b['open_findings']
of.append({"id":"C-R391-01","severity":"medium","origin":"C round 391 (= A STOP; root cause: B spec success clause written on cache state, l.68 vs l.73/l.162)","evidence":"c-round-391.json bugs[0]; c-round-391/probe2-1440.json rows.STALE_SUPERSEDED; a-round-391.md §0, a-round-391/stop-probes.log","title":"a superseded (or stopped) library preview leaves 'Loading “X”…' on the status line forever","repro":"/studio-lab, __delayDecodes=1, Preview Middle East, then Preview Full mix while it decodes; status stays Loading","status":"in_fix round 392 (D-29z1331)","added":W})
dl=b['deferred_low_polish']
dl.append({"id":"C-R391-02","severity":"low","origin":"C round 391 observation","evidence":"c-round-391.json bugs[1]; c-round-391/probe2-1440.json rows.B4wav.dlg, b4-wav-1440.png","title":"export dialog preflight says 'There is no clip with sound … silence' when the only clip's source failed, above the refusal text","repro":"Add Middle East, delete it, fail its re-decode, Ctrl+Z, open Export","owner_lane":"ArrangementExportDialog.tsx (noSoundNote consumer); export dialog = root COPY-PD lane","status":"deferred_low_polish (D-29z1334)","added":W})
dl.append({"id":"A-R391-REVIEW-L-TITLE-LOOKUP-x3","severity":"low","origin":"A round 391 code-reviewer","evidence":"a-round-391.md §5","title":"'first error clip -> title or id' lookup written three times in ArrangementContext.tsx","status":"deferred_low_polish (D-29z1334); round 392 may fold it into the optional settle helper","added":W})
b['architecture_signals'].append({"id":"SIG-R392-DECODE-SETTLE-HELPER","origin":"A round 391 code-reviewer Architecture note","note":"the decode settle rule is duplicated at two call sites in ArrangementContext.tsx and this round's bug sat in it; proposal: pure decideDecodeSettle in lib/arrangement with unit tests. Round 392 allows one module-local helper only. Tenth consecutive round (381-392) in the decode region; appended to ARCH-CHECKPOINT-DECODE-REGION","status":"recorded (D-29z1335)","added":W})
for e in b['architecture_checkpoint_requests']:
  if isinstance(e,dict) and e.get('id')=='ARCH-CHECKPOINT-DECODE-REGION':
    e['status']='still unanswered at round 392 planning (D-29z1335): round 392 is a bug re-dispatch in the region (tenth round); addendum: SIG-R392-DECODE-SETTLE-HELPER (extract the settle decision). Needed before PERF-13c. | '+e['status']
q=[x for x in b['post_current_stage_queue'] if x.get('id')=='STUDIO-PERFORMANCE'][0]
q['status']='in_progress (D-29z1330): round 391 PERF-13b-ii C FAIL (C-R391-01 Medium = A STOP); round 392 = re-dispatch with the settle ruling | '+q['status']
for s in q['stages']:
  if s.get('id')=='PERF-13b-ii':
    s['status']='in_progress (D-29z1330): round 391 C FAIL on C-R391-01 only (B1,B3-B6,PERF-RES PASS, browserVerified true; not done); round 392 re-dispatch (D-29z1331..1335) | '+s['status']
D=[("D-29z1330","Round 391 result: C FAIL (c-round-391.json read directly): C-R391-01 Medium (= A STOP, superseded preview stale Loading), C-R391-02 Low; browser rows B1,B3,B4,B5,B6,PERF-RES and B2 status part PASS at both viewports, browserVerified true; gate 391 skipped. PERF-13b-ii stays in_progress; A's round-391 tree is kept and continued in round 392."),
("D-29z1331","Settle rule (A STOP option i): at Play refusal and preview call sites, capture the owner controller as ensureDecoded does; settle: any awaited source error -> unconditional sourceFailed(first); else controller not aborted -> conditional swap to sourceReady; else no write. Cache-based success expressions deleted. 'is ready' = the decode completed under the current collection, not held in memory (CZABA decision, no Live reference). Optional single module-local helper."),
("D-29z1332","Null owner at call time: no loading write, no preview pin, no ensureDecoded call; write sourceNotLoaded(title) (pre-391 text). EV12 extended; mutant MU-392-LOADING-ON-NULL-OWNER."),
("D-29z1333","A superseded preview whose decode fails writes sourceFailed (unconditional) - confirmed; new row EV23."),
("D-29z1334","C-R391-02 (export preflight noSoundNote with a failed clip) -> deferred_low_polish: consumer ArrangementExportDialog.tsx is not granted (export dialog = root COPY-PD lane). A-R391-REVIEW title lookup x3 -> deferred_low_polish. Reviewer Low (no MP3 window row) is fixed in round 392 as EV24 (owned test file)."),
("D-29z1335","Mutants: WARNING-BEFORE-PLAYINGFROM equivalent (accepted, functional playingFrom update); READY-ON-FIRST/READY-ON-SOME retired (target deleted); table regenerated. SIG-R392-DECODE-SETTLE-HELPER recorded and appended to ARCH-CHECKPOINT-DECODE-REGION (tenth round in region). Retro input: the l.68 success clause was specified on internal cache state instead of the observable required at l.162 and was not traced through the eviction path before dispatch.")]
for i,t in D: b['decisions_log_b'].append({"id":i,"date":"2026-11-07","by":W,"decision":t})
b['advisor_used_by_B']='yes (round 391 -> 392 planning: advisor available; consulted after orientation and before writing; effect: owner-controller success at both sites, null-owner no loading write, regenerated mutant table, EV9 exact sourceReady assert, B8 preview->Space browser variant, B2 level clause dropped explicitly, C-R391-02 deferred to COPY-PD lane) | '+str(b['advisor_used_by_B'])
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
open(DONE,'w').write('ok\n')
print('ok', b['version'])
