import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==285
D='2026-11-04'; ADD='2026-11-04 B round 326 -> 327 planning'
b['version']=286
b['updated']='2026-11-04 B round 326 -> 327 planning (D-29z928..D-29z936)'
b['current_task']='current-task.md (round 327, D-29z928..D-29z936; PERF-DRAG-PREVIEW stage b: audio fade-handle drag via previewClipGeometry + a per-provider status-preview store (setStatus wrapper flushes the preview first; adopt keeps the aria-live span); six status-text comparison reads use getStatusPreviewText() ?? status; 5 fade budget rows assert; baseline 234ccdd)'
dec=[
 ('D-29z928','Rounds 325 + 326 closed from evidence: C round 326 PASS (c-round-326.json browserVerified/realVerified true); gate 326 published 234ccdd (rounds 325 + 326, both remotes). PERF-DRAG-PREVIEW stage a -> done; GATE325-IM24-WALLCLOCK -> done; B-R299-IM24-LOAD-SIGNAL -> closed.'),
 ('D-29z929','C-R326-01 (Low, origin B spec): the round-326 B-IM24 row asked the browser for the playing "after the playhead" tail that tasks/round-253.md l.208 had already ruled jsdom-only (playback auto-stops at the project end). -> deferred_low_polish; the IM24 tail (assert the end-stop or use a fixture whose last stop is before projectEnd) joins SYS-CLOCK-DETERMINISM (jsdom fake fidelity), not SYS-R2-FAKE-FIDELITY (R2 worker fake) as C suggested. lessons L29 gains it as evidence (state-recipe premise not probed at baseline).'),
 ('D-29z930','INFO-C326-PLAYING-STEP-MOVES-INSERT-MARKER: matches the recorded planner contract (tasks/round-252.md l.254/l.322 IM24 + C-NAV-ORIGIN-252, tasks/round-253.md l.224: Ctrl+Right moves the insert marker during playback). Live 12 behaviour while playing unverified -> LIVE-MEAS-MARKER-STEP-PLAYING appended to user-review/live-checks.md (L44); a differing Live result becomes one Saba question. INFO-C326-END-STOP-STALE-STATUS -> signal SIG-R326-END-STOP-STATUS (status lifetime after the project-end auto-stop; not scheduled).'),
 ('D-29z931','Round 327 = PERF-DRAG-PREVIEW stage b (current-task.md): audio fade moves use previewClipGeometry; the per-move fade text goes to a new per-provider zustand status-preview store rendered by a memo footer subscriber; setStatus becomes a wrapper that flushes (adopts) a pending preview before every committed write, so updaters, refusals and stops see the shown text as at HEAD; adopt keeps the preview span key (no second aria-live announcement); six status-text comparison reads (StudioWorkspace stop effect + nudge, ArrangementMarkerRow x3) read getStatusPreviewText() ?? status. Video fades stay on the provider path (stage c). Consults: tech-lead (drop baseSequence, wrap setStatus, flush once via release, keep the key on adopt), performance-optimizer (expected 22-26/move; assert per-move/max/restarts with tolerance). B sketch: fade 103.25 -> 21.633/move, max 105 -> 22, restarts 0, stopped release-commits 1 -> 2 (second commit 0 components); full suite 3555/3555; 7 jsdom + 1 combined perf mutant red.'),
 ('D-29z932','Budgets: interact.drag.fade.{stopped,playing}.move-components-per-move <= 24, .move-components-max <= 24, interact.drag.fade.playing.move-restarts == 0 become assert (owner PERF-DRAG-PREVIEW-b; .6x copies stay record, stage-a convention). The stage-a trim/move per-move conversion (D-29z922) moves to stage c with the move rows (no trim perf mutant run yet, L58).'),
 ('D-29z933','DP9 (stage-a pin of the fade provider path) rewritten, not deleted: DP9a (fade: provider 0, store non-null mid-drag, same status text, one entry, Undo) + DP9b (video move unchanged) + DP10-DP15; expect( 68 -> 112 on the sketch; no assertion lost.'),
 ('D-29z934','Doc 232 is the PERF-DRAG-PREVIEW feature doc for all three stages; stage b rewrites its sections; l.4 -> In Progress (stage 2 of 3; C round 327 PASS). Doc 168 PERF-DRAG-PREVIEW paragraph block granted whole (L34).'),
 ('D-29z935','Item target unchanged (<= 15 components per move for fade/trim/move). Stage b sketch reaches 21.633; the remainder carries to stage c with three unscheduled signals from the performance-optimizer consult: SIG-R326-READOUT-PRIMITIVE (selected-clip readout selects primitives), SIG-R326-DETAIL-IGNORES-FADE (detail panel equality ignores fadeIn/fadeOut, needs a stale-guard test), SIG-R326-SKIP-UNCHANGED-FADE (no new arrangement when the rounded fade value is unchanged).'),
 ('D-29z936','Next round: REGRESSION if its planning falls on or after 2026-11-05 (regression-last 2026-11-02 round 301), else PERF-DRAG-PREVIEW stage c. regression-last.json unchanged. Checkpoint request D-29z915 stays open; round 327 adds a fourth per-provider store to ArrangementContext.tsx (noted in b-round-326-checkpoint-addendum.md).'),
]
for i,t in dec: b['decisions_log_b'].append({'id':i,'date':D,'text':t})
def walk(o):
    if isinstance(o,dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
byid={}
for o in walk(b):
    if 'id' in o and isinstance(o['id'],str): byid.setdefault(o['id'],[]).append(o)
pdp=byid['PERF-DRAG-PREVIEW'][0]
pdp['status']='in_progress (D-29z931): stage a done (C round 325 PASS, gate 326 published 234ccdd, D-29z928); stage b dispatched round 327 | '+pdp['status']
pdp['stage_b_contract_d29z931']='current-task.md round 327; sketch b-round-326/sketch/; budgets D-29z932; tests D-29z933; doc D-29z934; remaining gap D-29z935'
for fid,st in [('GATE325-IM24-WALLCLOCK','done (D-29z928): C round 326 PASS, gate 326 published 234ccdd'),('B-R299-IM24-LOAD-SIGNAL','closed (D-29z928): fixed by GATE325-IM24-WALLCLOCK, published 234ccdd')]:
    for o in byid[fid]: o['status']=st+' | '+o['status']
new_findings=[
 {'id':'C-R326-01','severity':'low','origin':'B spec (round-326 B-IM24 row; tasks/round-253.md l.208 had ruled the tail jsdom-only)','title':'IM24 playing-state tail ("No more markers after the playhead" + Playing at 16) is unreachable in the browser: playback auto-stops at the project end','evidence':'c-round-326.json, c-round-326/b-im24.json, probe-sync-ctrlright.json','status':'deferred_low_polish (D-29z929); fix with SYS-CLOCK-DETERMINISM','added':ADD},
 {'id':'INFO-C326-PLAYING-STEP-MOVES-INSERT-MARKER','severity':'info','origin':'C round 326','title':'Ctrl+Right while playing also moves the insert marker','status':'ruled (D-29z930): matches tasks/round-252/253 planner contract; LIVE-MEAS-MARKER-STEP-PLAYING requested','added':ADD},
 {'id':'SIG-R326-END-STOP-STATUS','severity':'info','origin':'C round 326 (INFO-C326-END-STOP-STALE-STATUS)','title':'after the project-end auto-stop (also natural end) the status keeps the previous text, no stopped text','status':'signal (D-29z930); not scheduled','added':ADD},
 {'id':'SIG-R326-READOUT-PRIMITIVE','severity':'info','origin':'performance-optimizer consult (round 327 planning)','title':'selected-clip readout re-renders per fade move; select primitives (sourceId, start, duration, sourceOffset) instead of the clip object','status':'signal (D-29z935); stage c candidate, measure first (L37)','added':ADD},
 {'id':'SIG-R326-DETAIL-IGNORES-FADE','severity':'info','origin':'performance-optimizer consult (round 327 planning)','title':'detail panel re-renders per fade move although it shows no fade field; an equality that ignores fadeIn/fadeOut needs a stale-guard test','status':'signal (D-29z935); stage c candidate','added':ADD},
 {'id':'SIG-R326-SKIP-UNCHANGED-FADE','severity':'info','origin':'performance-optimizer consult (round 327 planning)','title':'setFade builds a new arrangement when the rounded fade seconds did not change (sub-pixel moves)','status':'signal (D-29z935); stage c candidate','added':ADD},
 {'id':'LIVE-MEAS-MARKER-STEP-PLAYING','severity':'info','origin':'B (L44)','title':'root measures in Live 12: while playing, does Ctrl+Right (Win) / Alt+Right (Mac) to the next locator move playback, the insert marker, or both','status':'requested_from_root (D-29z930): user-review/live-checks.md','added':ADD},
]
b['open_findings'].extend(new_findings)
b['deferred_low_polish'].append({k:new_findings[0][k] for k in new_findings[0]})
for s in b['systemic_tasks']:
    if s['id']=='SYS-CLOCK-DETERMINISM':
        s.setdefault('closes',[]).append('C-R326-01')
        s['note_d29z929']='also fixes the IM24 playing tail (end-stop never runs in jsdom): assert the end-stop or use a fixture whose last forward stop is before projectEnd'
for o in byid.get('A-R325-ARCH-PREVIEW-OWNER',[]):
    o['note_d29z936']='round 327 adds the status-preview store to ArrangementContext.tsx; see b-round-326-checkpoint-addendum.md'
b['rounds'].append({'round':325,'task':'tasks/round-325.md','decision':'D-29z913..D-29z919, D-29z920','type':'PERF-DRAG-PREVIEW stage a','status':'done (C PASS; gate 325 failed on IM24; published with round 326 in 234ccdd, D-29z928)','added':ADD})
b['rounds'].append({'round':326,'task':'tasks/round-326.md','decision':'D-29z920..D-29z927','type':'GATE325-IM24-WALLCLOCK test-only fix-up','status':'done (C PASS, gate 326 published 234ccdd, D-29z928)','added':ADD})
b['rounds'].append({'round':327,'task':'current-task.md','decision':'D-29z928..D-29z936','type':'PERF-DRAG-PREVIEW stage b (audio fade drag + status-preview store)','status':'dispatched','note':'baseline 234ccdd; claims b-round-326/claims-327.sh','added':ADD})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
