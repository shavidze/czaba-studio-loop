import json, sys
P='backlog.json'
b=json.load(open(P))
assert b['version']==221, b['version']
b['version']=222
b['updated']='2026-10-29'
NOW='2026-10-29 B round 236 -> 237 planning'
b['current_task']='current-task.md (round 237, D-29z339..D-29z345; SABA-B-11a-FIX-2: A-R234-REVIEW-M1 + merged B-R235-READY-CLOBBER (provider loading/ready writes clobber the seed status -> loadingCollectionStatus/settledCollectionStatus functional writes, failed wins), GATE234-S2 (hasAssetTempoSource memo guard), GATE234-S3 (empty-part filter); doc grants 182 + 183 (C-R236-02); baseline ecaf0e4, 9 grants + 2 new files, frozen 1090)'
b['advisor_used_by_B']='2026-10-29 round 236 -> 237 planning: advisor available and consulted after orientation, before writing; advice followed: baseline = gate commit ecaf0e4, functional setStatus via the existing reducer, prefix-swap ready rule, failed decided separately with a browser row, memo guard for GATE234-S2 without closing the seed, jsdom deferred-load repro, doc 183 bullet as a doc grant, Saba question on the lost ready hint. B differed: failed(n) replaces (B measured the append variant: 2-line status at 1280). Final advisor check before handover.'
of={f['id']:f for f in b['open_findings'] if isinstance(f,dict) and 'id' in f}
def close(i, text):
    of[i]['status']=text; of[i]['closed']=NOW
for i in ['GATE235-S1','A-R235-REVIEW-M1','C-R235-01']:
    close(i, 'closed: C round 236 PASS (c-round-236.json, browserVerified true, realVerified true) and gate 236 published ecaf0e4 on both remotes (D-29z339)')
for i in ['A-R234-REVIEW-M1','B-R235-READY-CLOBBER','GATE234-S2','GATE234-S3']:
    of[i]['status']='open, dispatched round 237 SABA-B-11a-FIX-2 (D-29z339); B reproduced the clobber deterministically at ecaf0e4 with a 4 s route delay on the two demo MP3s (b-round-236/probe/readyrace-baseline.json); sketch fix green (readyrace-scratch.json)'
new=[
 {"id":"C-R236-01","severity":"low","origin":"C round 236","title":"a playPastEnd status stays on screen after playback actually starts (strip click at 2 after an end click; Space after the end click); pre-existing, identical at 49b4c74","status":"deferred_low_polish (D-29z340); code is togglePlayback, outside round 237 grants","repro":"c-round-236/out/c236.json staleStatus/end; out/stale-status-*.png","added":NOW},
 {"id":"C-R236-02","severity":"low","origin":"C round 236 (A asked the same)","title":"doc 183 playFromRuler bullet (l.38-41) still says seekTo + togglePlayback in StudioWorkspace","status":"open, fixed now as doc grant 9 in round 237 (D-29z340; the round owns the feature doc, zero code)","repro":"docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md l.38-41","added":NOW},
 {"id":"SABA-Q-READY-AFTER-ACTION","severity":"info","origin":"B round-237 planning (L44)","title":"After round 237, if the viewer acts before every demo/purchased source has loaded, the ready line ('... Press ? for shortcuts.') is not shown in that session; the action's status stays (Shortcuts ? footer and tooltips still teach keys). Keep, or append the ready hint after the action's status?","status":"awaiting_user (D-29z339); the round-237 default holds until answered","added":NOW},
]
b['open_findings'].extend(new)
dl=b['deferred_low_polish']
dl.extend([
 {"id":"C-R236-01","severity":"low","title":"stale playPastEnd status after playback starts","status":"deferred_low_polish (D-29z340)","source":"c-round-236.json","repro":"seed pulse; scrollLeft 400; strip click t=20; scrollLeft 0; strip click t=2 -> playing with the past-end status","added":NOW},
 {"id":"GATE236-S1-MIXED-ZONE-DBL","severity":"low","title":"a double-click whose first press is in the strip and second in the lower zone runs Fit (the last press decides); doc 184 records it as deliberate","status":"deferred_low_polish (D-29z340)","source":"gates/round-236/review.md Suggestion 1","repro":"strip press then lower press within the dblclick slop at the ~10 px border","added":NOW},
 {"id":"GATE236-S2-RIGHT-CLICK-REF","severity":"low","title":"pressInStripRef is written before the hook's button check, so a right-click in the strip also writes it (harmless today)","status":"deferred_low_polish (D-29z340); or closed by GATE236-ARCH-PRESS-TARGET if approved","source":"gates/round-236/review.md Suggestion 2","repro":"ArrangementTempoRow.tsx l.144-145","added":NOW},
 {"id":"A-R236-REVIEW-PLAYING-PAST-END","severity":"low","title":"while playing, a strip click past the project end only seeks past the end (carried over, not caused by round 236)","status":"deferred_low_polish (D-29z340)","source":"a-round-236.md code-reviewer Lows","repro":"seed pulse, play, strip click at t=20","added":NOW},
])
b['architecture_signals'].extend([
 {"id":"GATE236-ARCH-PLAYFROM-HELPER","signal":"A round 236 reviewer: the end rule is split between playFrom and togglePlayback; proposal a pure lib/arrangement helper (arrangement, target, isPlaying) -> 'seek'|'pastEnd'|'start'. Gate 236 signal 4: keep playFrom in the context (needs isPlayingRef/historyRef/stopLibraryPreview)","status":"signal; addendum 2 to b-round-234-checkpoint-request.md (D-29z343); not scheduled","added":NOW},
 {"id":"GATE236-ARCH-PRESS-TARGET","signal":"gate 236 signal 2 + A reviewer: pressInStripRef copies useRulerNavigation's pressTarget; proposal: the hook passes the last pressTarget to onRulerDoubleClick({ pressTarget }) and the ref is deleted (BR7/BR12/BR14 + seconds-ruler tests unchanged); value low","status":"signal; addendum 2 to b-round-234-checkpoint-request.md (D-29z343); not scheduled","added":NOW},
])
for r in b['rounds']:
    if r.get('round')==236:
        r['status']='c_pass_published (gate 236 published ecaf0e4 on both remotes)'
b['rounds'].append({"round":237,"task":"current-task.md","decision":"D-29z339..D-29z345","status":"dispatched","type":"bug round (3 related): SABA-B-11a-FIX-2 (A-R234-REVIEW-M1 + B-R235-READY-CLOBBER, GATE234-S2, GATE234-S3) + doc grants 182/183 (C-R236-02)","note":"baseline ecaf0e4 clean (gate 236 published); frozen 1090 (b-round-236-r237-tree-sha256.txt); 9 grants (b-round-236-r237-grants.txt) + 2 new files; L23 pre-check b-round-236/precheck-scratch.diff + precheck-covering.log (121 files, 1715 tests green); mutants MU-RC/MU-LD/MU-F/MU-S2 red, MU-SR equivalent (b-round-236/mutant-*.log); L29 recipes b-round-236/probe/readyrace-{baseline,scratch}.json both viewports"})
for rr in b['regression_rounds']:
    if rr.get('id')=='REGRESSION-ROUND-2026-10-30':
        rr['scope_additions'].append('SABA-B-11a-FIX-2 (if done): delay recipe (4 s route delay on the two demo MP3s, pulse Add before ready) keeps the exact placement + seed status; fail recipe shows failed(1); idle load shows the ready text')
D=[
 ("D-29z339","Round 236 accepted from C evidence (c-round-236.json PASS, browserVerified/realVerified true, 0 blocked; gate 236 published ecaf0e4): GATE235-S1, A-R235-REVIEW-M1, C-R235-01 closed. Round 237 = SABA-B-11a-FIX-2 as planned (D-29z334). Status contract ruled: ready replaces only the collection's loading text or its prefix; failed(n) always wins (append variant measured 2 lines at 1280, b-round-236/probe/statusbox-append-variant-*); loading keeps a status already starting with its own loading text. New Saba question SABA-Q-READY-AFTER-ACTION (L44)."),
 ("D-29z340","Round-236 Lows: C-R236-01, GATE236-S1, GATE236-S2, A-R236-REVIEW-PLAYING-PAST-END -> deferred_low_polish (outside 237 grants). C-R236-02 fixed now as doc grant 9 (round owns the feature docs; zero code). Gate-236 suggestion 3 = B-R236-END-WORDING (already deferred); suggestion 5 (playbackEndedAtRef) recorded as a note. A's BR13 extension (loop past end, preview stop, MU-L/MU-P) accepted as additive inside the granted row."),
 ("D-29z341","MU-SR (render-time status read) is an equivalent mutant: the status write and the clip change commit in the same render; the functional form is kept because it reads the reducer's current text by construction. Not a required red row."),
 ("D-29z342","GATE234-S2 fixed by a per-collection memo guard (hasAssetTempoSource) instead of closing tempoSeedOpenRef, so a later BPM collection still seeds; browser-unreachable in /studio-lab (demo has BPM stems) -> unit-only row C-S2-237, not BLOCKED."),
 ("D-29z343","Gate-236 Architecture notes recorded as signals GATE236-ARCH-PLAYFROM-HELPER and GATE236-ARCH-PRESS-TARGET and as addendum 2 to b-round-234-checkpoint-request.md; not scheduled. ARCH-CHECKPOINT-TEMPO-GRID still unanswered; round 237 proceeds non-blocking (question 2 answered by the round-237 design unless root's checkpoint objects); requested before SABA-B-11b."),
 ("D-29z344","Doc grants 182 (one problem bullet + the mount-clobber TODO bullet) and 183 (playFromRuler bullet) so the SABA-B-11a docs match the code after rounds 236-237; l.4 of both unchanged (Completed (C round 235 PASS))."),
 ("D-29z345","No Saba answers (AGREE-SABA-B-7, SABA-Q-*). Store direction-decision.md already recorded (STORE paused behind STUDIO-PERFORMANCE). Regression due on or after 2026-10-30 (today 2026-10-29) -> not due; FIX-2 key acceptance added to its scope_additions. RETRO next at round 245. b-next CONTINUE; round 238 = SABA-B-11b unless the regression is due first."),
]
for i,t in D:
    b['decisions_log_b'].append({"id":i,"date":"2026-10-29","text":t})
for a in b['architecture_checkpoint_requests']:
    if a.get('id')=='ARCH-CHECKPOINT-TEMPO-GRID':
        a['status']+=' | addendum 2 GATE236-ARCH-PLAYFROM-HELPER / GATE236-ARCH-PRESS-TARGET (D-29z343); still unanswered at round-237 planning; requested before SABA-B-11b (round 238)'
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['deferred_low_polish']))
