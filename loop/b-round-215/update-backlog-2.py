import json
P='backlog.json'
b=json.load(open(P,encoding='utf-8'))
ADDED='2026-10-28 B round 215 -> 216 planning'
def by_id(l,i):
    for x in l:
        if isinstance(x,dict) and x.get('id')==i: return x
b['version']=202
b['updated']='2026-10-28 (B round 215 -> 216 planning, D-29z213..D-29z217)'
b['current_task']='current-task.md (round 216, D-29z213..D-29z217; PERF-1b-ii resource baselines + SYS-4 doc status backfill + RT-FIX-216)'
D=[
 ('D-29z213','Round 215 RETRO: C FAIL on RT-NUM only (C-R215-01 Low, retro-215.md l.53 "11 review" -> 10; also 200-202 have no review). Other 7 rows PASS, browserVerified/realVerified true, gate 215 skipped. B corrected retro l.53 and took C notes on l.70 (class label: no listed class fits, B analysis error) and l.32/l.75 (a-round-212.md l.38-41); diff b-round-215/retro-215-rtfix.diff. RT-FIX-216 re-checks only these lines in round 216 (per tasks/round-215.md section 4).'),
 ('D-29z214','L28 ruling (C-R215-02, A feedback): keep exact Completed (C round N PASS), defined as the post-PASS value true only at HEAD (c-round-N.json is the source of truth); on a re-dispatch as N+1 the doc l.4 is implicitly granted for rewriting N only; root request b-round-215-root-request-l28.md for a gate-side Pending -> Completed substitution with a gate failure on any leftover Pending; L28 switches only after root confirms (tech-lead consult). L32 amended: when a gate verify.log exists, report A time and last gate time; the higher decides. rounds[] bookkeeping fixed: 211 c_pass_published (28a274c), 212 c_pass_gate_failed_published_with_213 (fe556fd).'),
 ('D-29z215','Doc 168 PERF candidates ruled (tech-lead consult): range drag -> PERF-8 (baseline 101.283/move); clip click + play/pause -> PERF-10; zoom key 1 clip -> PERF-3 (+ Ctrl+wheel baseline row); zoom with 30 clips -> PERF-14; fade/trim/move preview via previewArrangement -> updateHistory -> new stage PERF-DRAG-PREVIEW (after PERF-8); release restart of every clip -> new stage PERF-COMMIT-RESCHEDULE (after PERF-3; audibility is a hypothesis to measure first). PERF-HARNESS-SHARED-LIB reaches its 3rd copy with PERF-1b-ii -> queued test-only stage after OSS-LIC. Order: execution_order_d29z215. interact.harness.drag-range-live DEVIATION (A-R214-DEV-RANGE-LIVE) stays accepted (D-29z210).'),
 ('D-29z216','root-deps-request.json for mediabunny + @mediabunny/mp3-encoder is filed at the planning step that dispatches PERF-16 (oss-adoption.md allows "in the same planning step as the dispatch"), not now: a chore(deps) commit at the start of round 216 would move HEAD and change package.json/package-lock.json under the frozen list, and round 216 does not use the packages. Deviation from D-29z212 recorded. @ffmpeg/* removal is part of the PERF-16 round only.'),
 ('D-29z217','Round 216 = PERF-1b-ii (third self-contained spec perf/studio-lab-resources.perf.spec.ts, perf/budgets.resources.json, res.* rows, latest-resources.json; 3 passes 1x (ready GC backing store, DOM 0/1/2 clips + clip subtree + ruler, WAV export 1 and 2 clips with RIFF header liveness, leak row, JS bytes for /studio-lab, /, /studio/middle-east guard) + 3 passes 6x exports only; durationMs <= 8 min with pre-ruled fallback; GATE206-S5 documented in doc 169) + SYS-4 (docs 160/161/162/168 l.4 -> Completed (C round 203/204/205/214 PASS)) + RT-FIX-216. Probe by performance-optimizer: b-round-215/consult-perf/. Round 217 expected REGRESSION (due 2026-10-30), then PERF-16.'),
]
for i,t in D: b['decisions_log_b'].append({'id':i,'date':'2026-10-28','text':t})
b['rounds'].append({'round':216,'task':'current-task.md','decision':'D-29z213..D-29z217','status':'dispatched','type':'PERF STAGE (STUDIO-PERFORMANCE PERF-1b-ii: resource baselines) + SYS-4 + RT-FIX-216',
 'items':['new perf/studio-lab-resources.perf.spec.ts + perf/budgets.resources.json (res.* rows; 3x1 + 3x6 passes; durationMs <= 8 min)','WAV export 1 and 2 clips: long tasks, LoAF blocking, backingStorageSize peak delta, bytes, RIFF header liveness','backing store at ready + leak row; DOM page/clip-subtree/ruler at 0/1/2 clips; JS bytes per route','doc 169 (incl. GATE206-S5 section, findings for PERF-11/12/13/14)','SYS-4: docs 160/161/162/168 l.4','RT-FIX-216 (retro-215 l.32/53/70/75, lessons L28/L32)','G216-3 auth guard, STUDIO-SMOKE-216 real WAV export'],
 'note':'baseline HEAD eb9e76e clean; frozen 1058 (b-round-215-r216-tree-sha256.txt); grants 4 docs l.4 (b-round-215-r216-grants.txt); new files 3 (b-round-215-r216-new-files.txt); no deps change (D-29z216)',
 'next':'round 217 REGRESSION if planning on/after 2026-10-30 (expected), else PERF-16 with root-deps-request.json','added':ADDED})
e=by_id(b['post_current_stage_queue'],'STUDIO-PERFORMANCE')
e['status']='in_progress: PERF-1a, SABA-B-6, PERF-FADER-a0/a/b/c, PERF-1b-i done; RETRO 215 (round 215 C FAIL RT-NUM Low, corrected; RT-FIX in 216); PERF-1b-ii dispatched round 216 (D-29z217); then PERF-16 (after REGRESSION 217 if due), OSS-LIC, PERF-HARNESS-SHARED-LIB, then execution_order_d29z215 | '+e['status']
s=by_id(e['stages'],'PERF-1b-ii'); s['status']='dispatched round 216 (D-29z217) | '+s['status']
s=by_id(e['stages'],'PERF-1b'); s['status']=s['status']+' | PERF-1b-ii dispatched round 216'
s=by_id(e['stages'],'PERF-16'); s['deps_request_d29z216']='file root-deps-request.json {"add": ["mediabunny", "@mediabunny/mp3-encoder"], "remove": []} at the planning step that dispatches PERF-16; the round itself removes @ffmpeg/* via a second request only after the code no longer imports it (B rules the exact sequence at PERF-16 planning)'
for i in ['PERF-12','PERF-13','PERF-14','PERF-11']:
    s=by_id(e['stages'],i); s['baseline_source_d29z217']='round 216 PERF-1b-ii res.* rows (doc 169); probe b-round-215/consult-perf/'
s=by_id(e['stages'],'PERF-14'); s['probe_note_d29z217']='probe: ~220 page elements per added 101 s clip = 17 clip subtree + ~202 ruler + 1 overview; ruler is not virtualized and grows with project length, so the 200-clip <= 2000-element target needs ruler work too'
st=by_id(b['systemic_tasks'],'SYS-4'); st['status']='dispatched round 216 (D-29z217; 4 one-line grants) | '+st['status']
for i in ['GATE214-DOC168-STATUS','B-R214-DOC160-161-STATUS','GATE205-DOC162-STATUS']:
    x=by_id(b['open_findings'],i); x['status']='dispatched round 216 SYS-4 | '+x['status']
b['deferred_low_polish'].append({'id':'B-R215-EXPORT-CEIL-FRAME','severity':'low','status':'deferred_low_polish','title':'WAV export can be one frame longer than the project: renderArrangementWav uses Math.ceil(end * 48000) and 3*101.352*48000 = 14594688.000000002 -> 14594689 frames (6 extra bytes in a 3-clip export)','source':'B probe b-round-215/consult-perf (3-clip download 87,568,178 B vs 44 + 14594688*6); python check in b-round-215.md section 3; cause is an inference from graph.client.ts l.468-469, not verified by C','repro':'/studio-lab: Add demo clip, Ctrl+D x2, Export WAV; size - 44 = 6 * 14594689','note':'harmless silent frame (21 us); owner PERF-12 (chunked export rewrites the length math); PERF-1b-ii liveness tolerates +1 frame','added':ADDED})
json.dump(b,open(P,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', len(b['deferred_low_polish']))
