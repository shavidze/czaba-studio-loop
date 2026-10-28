import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==218
ADDED='2026-10-28 B round 232 -> 233 planning'
q=b['post_current_stage_queue']
assert not any(e.get('id')=='SABA-B-9-10-11-TRANSPORT-GRID' for e in q)
idx=[i for i,e in enumerate(q) if e.get('id')=='SABA-B-7-ENVELOPE-DB'][0]
entry={"id":"SABA-B-9-10-11-TRANSPORT-GRID","status":"not_started: approved by Saba 2026-10-28 (policy section 'SABA-B-9/10/11'); after SABA-B-8 CALM-3 and SABA-B-7, before the next PERF task; recorded at round-233 planning (B-R232-SABA-B-9-11-UNRECORDED, D-29z319)",
"severity":"medium","requested":"Saba 2026-10-28 (approved): transport in the centre with Stop and master bottom-right (SABA-B-9), a separate Insert Marker and playhead (SABA-B-10), a musical grid with tempo from the product BPM, seconds when no BPM (SABA-B-11)",
"source":"loop policy section 'SABA-B-9/10/11: transport, Insert Marker and a musical grid'; docs/technical/studio-real-workspace/transport-grid-review.md (read 2d4a93f; B re-checks every file:line before each dispatch); reference/youtube/SABA-B-9-10-11-transcripts.md",
"saba_decisions":["a click during playback moves only the Insert Marker; playback continues","a click on the top strip of the bars ruler starts playback from that point (Live scrub area)","grid: asset BPM -> tempo from catalogue BPM, musical default grid (bar..1/32, triplets), Snap on; no BPM in the project -> seconds grid, never invent 120 BPM; mixed -> tempo from the music asset; manual family switch; min:sec ruler always visible; audio never stretched; frame grid out of scope (later candidate)","transport layout: centre group Follow, clock, Play, new Stop, back to start, Loop; master volume (ArrangementMaster) moves to the workspace bottom-right corner; only these position moves; the toolbar must not grow or wrap at 1280x720"],
"stages":[
 {"id":"SABA-B-11a","order":1,"scope":"tempo from the product BPM; musical default grid; seconds when there is no BPM; the bars ruler becomes interactive","rounds":"~2","status":"not_started"},
 {"id":"SABA-B-11b","order":2,"scope":"zoom-adaptive grid as in Live 6.10; closes ABL-R-8; Live keys Ctrl/Cmd+1..5 as reference; map G and 1/2/3 or list each difference as a deviation","rounds":"~1.5","status":"not_started"},
 {"id":"SABA-B-10a","order":3,"scope":"separate Insert Marker and playhead: Space plays from the marker; Stop and Space restart from the marker; Shift+Space continues from the stop point; Home or a double Stop sends the marker to the start; Space with a time selection plays from its start; Ctrl/Cmd+Shift+Space moves the marker to the playhead; replaces D-15; B lists every changed test and why (44 files use Space/togglePlayback + D-27 and paste tests); removing an assertion only = Medium bug","rounds":"~2","status":"not_started"},
 {"id":"SABA-B-10b","order":4,"scope":"the flashing marker (motion-safe only) and the shortcut-sheet rows","rounds":"~1-1.5","status":"not_started"},
 {"id":"SABA-B-9","order":5,"scope":"centre transport group, the Stop button, master volume bottom-right","rounds":"~1.5","status":"not_started"},
 {"id":"SABA-B-11c","order":6,"scope":"time selection on an empty lane background, no clamp to one clip, relative snap; dispatch only after an ableton-arrangement-expert consult confirms whether Live keeps an off-grid clip's offset; closes R49-T and F1-ABSOLUTE-SNAP","rounds":"~2","status":"not_started"}],
"closes":["R49-T","F1-ABSOLUTE-SNAP","ABL-R-8","D-15"],
"lessons_at_11a_planning":["L43 a position frozen by the rules is a question for Saba, not a pass","L44 a deviation recorded by the planner is not a Saba decision; every deliberate difference from Live goes to Saba once","L45 build the reference's unit first (musical grid before seconds grid)","L46 a parked check gets a deadline round; past it, it goes to Saba"],
"rules":["reference-first: B reads reference/youtube/SABA-B-9-10-11-transcripts.md and resolves its CHECK items against the manual before each of the six tasks; a behaviour the review missed becomes a Saba question, not a scope change","already agreed with Saba (no AGREE file needed)","lessons.md stays <= 60 lines: merge or drop an old lesson when adding L43-L46 and record which"],
"prerequisites":["SABA-B-8 complete","SABA-B-7-ENVELOPE-DB done"],
"added":ADDED}
q.insert(idx+1,entry)
for e in q:
    if e.get('id')=='STUDIO-PERFORMANCE':
        e['status']='order note D-29z319: after SABA-B-7, SABA-B-9/10/11 (six stages) and SYS-5 | '+e['status']
b['open_findings'].append({"id":"B-R232-SABA-B-9-11-UNRECORDED","severity":"info","origin":"B round-233 planning (L42 check)","title":"the Saba-approved SABA-B-9/10/11 policy section (2026-10-28) had no backlog id and no feature-status row until round-233 planning","status":"closed (D-29z319): queue entry SABA-B-9-10-11-TRANSPORT-GRID added after SABA-B-7-ENVELOPE-DB; feature-status rows added; second occurrence of the L42 class (first: SABA-B-7, B-R229-SABA-B-7-UNRECORDED); RETRO input","added":ADDED})
for s in b.get('systemic_tasks',[]):
    if 'SYS-5' in json.dumps(s)[:200]:
        s['queue']='after SABA-B-7-ENVELOPE-DB and SABA-B-9-10-11-TRANSPORT-GRID, before STUDIO-PERFORMANCE b-ii (D-29z319; Saba-ordered stages first) | '+s.get('queue','')
b['decisions_log_b'].append({"id":"D-29z319","date":"2026-10-28","text":"L42: the Saba-approved SABA-B-9/10/11 (policy 2026-10-28, transport-grid-review.md) recorded as queue entry SABA-B-9-10-11-TRANSPORT-GRID after SABA-B-7-ENVELOPE-DB, with the six stages in Saba's order (11a, 11b, 10a, 10b, 9, 11c) and his four decisions. SYS-5 (B-planned systemic task) moves after it; both stay before the next PERF task. Lessons L43-L46 are added at SABA-B-11a planning as the policy says. Finding B-R232-SABA-B-9-11-UNRECORDED (info, second L42 occurrence) for the next RETRO."})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',[e['id'] for e in q])
