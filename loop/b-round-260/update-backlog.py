import json
p='backlog.json'; b=json.load(open(p))
tag='2026-10-30 B round 260 -> 261 planning'
for r in b['rounds']:
    if r.get('round')==260:
        r['status']='c_fail_rt_lessons_low'
        r['result']='C FAIL on RT-LESSONS only (C-R260-01 Low); 8 rows PASS incl. G260-AUTH + STUDIO-SMOKE-260 both viewports; browserVerified/realVerified true; gate 260 skipped (C FAIL, nothing to publish from store). Corrections applied in round-261 planning, re-checked by RT-FIX-261 (D-29z524).'
b['rounds'].append({"round":261,"task":"current-task.md","decision":"D-29z524..D-29z529","status":"dispatched","type":"PERF-HARNESS-STRINGS-DRIFT (systemic, test-only, perf/** + doc 195) + RT-FIX-261 (loop artifacts)","note":"baseline 7a960c1 clean (gate 260 skipped); frozen 1114 (b-round-260-r261-tree-sha256.txt); grants b-round-260-r261-grants.txt (4 perf files); new files b-round-260-r261-new-files.txt (perf/lib/app-labels.ts, doc 195)","next":"PASS -> round 262 = REGRESSION if planned on/after 2026-11-02, else SABA-B-9 stage 2","added":tag})
b['open_findings'].append({"id":"C-R260-01","severity":"low","origin":"C round 260 (RT-LESSONS)","title":"L29 rewrite dropped two obligations: render condition 'the task's state must satisfy that branch' and changed meaning 'every readout that names the old source is a consumer row'","status":"fixed_in_planning_awaiting_c (D-29z524): both phrases restored inside their claim types in lessons.md l.18; RT-FIX-261 re-checks","source":"c-round-260.json bugs[0]; lessons.md l.18 vs b-round-259/lessons-before-260.md l.18","note":"loop-artifact Low, not app polish: not moved to deferred_low_polish","added":tag})
b['open_findings'].append({"id":"C-R260-02","severity":"low","origin":"C round 260 (RT-IDS)","title":"retro-260 §8 named retro 245 as the origin of B-R239 -> L49; backlog says applied at round-240 planning","status":"fixed_in_planning_awaiting_c (D-29z524): retro-260.md l.121 corrected; also the §5 grep sentence (l.93, C info) restated on backlog.json + policy.local.md; RT-FIX-261 re-checks","source":"c-round-260.json bugs[1], info[1]","note":"loop-artifact Low, not app polish","added":tag})
for x in b['retro_runs']:
    if x.get('round')==260:
        x['status']='done_pending_rt_fix_261'
        x['c_result']='c-round-260.json FAIL on RT-LESSONS (C-R260-01); RT-NUM/RT-CAUSE/RT-IDS/RT-SABA/RT-SCREEN PASS; corrections D-29z524'
st=b['systemic_tasks']; items=st if isinstance(st,list) else st['items']
for t in items:
    if t.get('id')=='PERF-HARNESS-STRINGS-DRIFT':
        t['status']='dispatched round 261 (D-29z525)'
        t['scope_ruling']='D-29z525: perf/** only. Labels that have a strings.ts key are imported (12 keys); 6 labels that exist only inline in components (Clip Gain — fader, Volume — ${mixLabel}, Pan — ${track.name}, Master Volume, Export, Undo) go to one perf-local allowlist with source file + needle, NOT drift-protected by the gate; fixture data (track names, Soft impact) stays perf-local. Moving the inline 6 into strings.ts is signal SIG-R261-INLINE-LABELS for SABA-B-9 stage 2 (which owns Transport/Master), not a grant now.'
b.setdefault('architecture_signals',[])
sig={"id":"SIG-R261-INLINE-LABELS","source":"B round 261 planning (D-29z525)","text":"6 accessible names/texts are inline in components, not in strings.ts: ArrangementDetailPanel.tsx l.429, ArrangementLane.tsx l.797 + l.832, ArrangementMaster.tsx l.208, ArrangementTransport.tsx l.153 + l.397. Candidate: move to strings.ts when the owning round touches them (SABA-B-9 stage 2 owns Master + Transport); then perf/lib/app-labels.ts drops them from its allowlist.","status":"signal (not scheduled)","added":tag}
a=b['architecture_signals']
if isinstance(a,list): a.append(sig)
else: a['SIG-R261-INLINE-LABELS']=sig
d=b['decisions_log_b']
d+= [
 {"id":"D-29z524","date":"2026-10-30","text":"Round 260 closed as C FAIL on RT-LESSONS (C-R260-01 Low) with all browser rows PASS. Corrections at this planning: lessons.md L29 restores 'and the task's state must satisfy that branch' and 'when a command's source changes (position, unit, target), every readout that names the old source is a consumer (acceptance) row' (line count 59); retro-260 §8 provenance (C-R260-02) and §5 grep sentence (C info). RT-FIX-261 re-checks only these lines. Before-copies in b-round-260/."},
 {"id":"D-29z525","date":"2026-10-30","text":"Round 261 = PERF-HARNESS-STRINGS-DRIFT (task 260 §4: planning 2026-10-30 < 2026-11-02, regression not due). Scope perf/** + doc 195 only; inline-only app labels -> perf-local allowlist with stated limit; signal SIG-R261-INLINE-LABELS."},
 {"id":"D-29z526","date":"2026-10-30","text":"Ruling on A's L11 feedback (a-round-260.md): a spec conflict is two task clauses that cannot both be met by one change, or a clause that forces a removed accessible state or a regression against HEAD. If A finds one change that meets both clauses, it is not a STOP; A quotes both clauses and the change at the top of a-round-N.md under 'Spec tension (B to confirm)', and C rows it. L11 text unchanged this planning (wording candidate for RETRO 275)."},
 {"id":"D-29z527","date":"2026-10-30","text":"Mutant proof for PERF-HARNESS-STRINGS-DRIFT must show a tsc error located in perf/** (renaming a strings.ts key also errors in app components, so 'tsc red' alone proves nothing about the wiring)."},
 {"id":"D-29z528","date":"2026-10-30","text":"browserVerified for round 261 = the isolated npm run test:perf run (real Chromium on :5188) ran; no /studio-lab UI changes, so no screen-budget or reference rows (test-only round, policy 'Not in scope')."},
 {"id":"D-29z529","date":"2026-10-30","text":"Queue after 261 unchanged from D-29z523: REGRESSION when due (on/after 2026-11-02), SABA-B-9 stage 2, L46-CONTRACT-CHECKS, SABA-B-11c (expert consult first), SYS-6; SABA-B-7 when Saba answers; SYS-5; STUDIO-PERFORMANCE b-ii; rest unchanged."}]
b['current_task']='current-task.md (round 261, D-29z524..D-29z529; PERF-HARNESS-STRINGS-DRIFT + RT-FIX-261; baseline 7a960c1, grants 4 perf files + 2 new, frozen 1114)'
b['updated']=tag+' (D-29z524..D-29z529)'
json.dump(b,open(p,'w'),ensure_ascii=False,indent=1)
print('ok')
