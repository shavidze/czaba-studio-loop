import json
P='backlog.json'
b=json.load(open(P))
b['version']=84
b['updated']='2026-10-22 (B round 84 review -> round 85 task, D-29z50)'
b['current_task']=('current-task.md (round 85: D-29z50 - X1 = C-R84-M1 (Medium): sticky track header must cover clip content '
 '(isolate on the lane body, alternative clip root; handles/trim strips/ghosts no longer paint or hit above the z-20 header) + '
 'SRW-20 stage 1 range export: renderArrangementWav optional window {start,end} (planSchedule(arr,start,end), from=start, '
 'startAt 0, length round((end-start)*48000), overload over window, Master mix), dialog scope radios (range default when a valid '
 'range exists, disabled reason otherwise, MP3 still disabled), exportWav(window?) with czaba-studio-lab-range.wav and exact '
 'messages, project path byte-identical; graph.test.ts l.388 literal grant; doc 074 l.4, new doc 075. Baseline HEAD 88b0262, '
 'frozen b-round-84-r85-tree-sha256.txt 481)')
b['baseline_tree_at_round85']={"head":"88b0262bda6bdc928bbc39c4cbca77c8a2ca9504","status_lines":0,"frozen_list":"b-round-84-r85-tree-sha256.txt","entries":481,"snapshots":"b-round-84-r85-snapshots","protected":"4/4"}
items={it['id']:it for it in b['items']}
s19=items['SRW-19']
s19['status']='c_pass_tech_lead_manual (stage 1 C PASS round 84 browserVerified=true realVerified=true, both viewports, published 88b0262; R19-F1/R19-F2 pass; Tech Lead R84-T open; fake-Bearer 403 sub-check blocked: backend unavailable in cloud)'
for a in s19['acceptance']:
    if a['id']=='R19-F1':
        a['status']='pass'; a['evidence']='C round 84 VF-IN, VF-PREVIEW stopped (1/0.25/0.5/0.75/1, overlay = 1-value) and play (153 rAF samples, max |value-(pos-S)| 0.000, monotonic), pixel luminance 9.7<39.4<98.9 vs ref 129, VF-OUT, VF-FLOAT, VF-EDITS, VF-UNDO, VF-SYNC; both viewports; browserVerified true; published 88b0262'
    if a['id']=='R19-F2':
        a['status']='pass'; a['evidence']='C round 84 VF-EXPORT: video option disabled with unchanged reason, exact arrangement-export-video-fades line only with a fade, only czaba-studio-lab.wav downloaded; VF-AUDIO picture only; both viewports; published 88b0262'
st=s19['stages'][0]
st.update({"status":"c_pass_published","c_round84_passed":["VF-HANDLES","VF-IN","VF-PREVIEW","VF-OUT","VF-FLOAT","VF-EDITS","VF-UNDO","VF-AUDIO","VF-EXPORT","VF-PLAY-EDIT","VF-SYNC","X1-ALIGN","REG-HYD","G84-3 (fake-Bearer 403 sub-check blocked: backend unavailable in cloud)","T84-TARGETED","SOURCE-UNCHANGED"],
 "c_round84_bugs":["C-R84-M1 (medium, P-M1 reproduced; scheduled round 85 X1)","C-R84-L1 (low, export jitter over video sound; Lows batch)"],
 "browserVerified":True,"realVerified":True,"notBrowserVerified":[],"published":"88b0262bda6bdc928bbc39c4cbca77c8a2ca9504",
 "evidence":["c-round-84.md","c-round-84.json","gates/gate-round-84.json"]})
s20=items['SRW-20']
s20['status']='in_progress (stage 1 dispatched round 85, D-29z50; stages 2 MP3 and 3 worker/progress/cancel planned; none deferred)'
s20['stages']=[
 {"stage":"1","round":85,"decision":"D-29z50","status":"dispatched","scope":"range export WAV: renderArrangementWav window {start,end} via planSchedule(arr,start,end) from=start startAt 0, length round((end-start)*48000), overload over window, Master mix of all tracks; dialog scope radios (range default when valid range, disabled reason otherwise); exportWav(window?) czaba-studio-lab-range.wav + exact messages; project path byte-identical; R20-X3 re-check","acceptance":["R20-X1","R20-X3"],
  "c_ids":["M1-HANDLE","M1-SELECTED","M1-GHOST","M1-VISIBLE","M1-ENV","XR-DEFAULT","XR-WAV","XR-MIDSTART","XR-ALLTRACKS","XR-PROJECT","XR-PASTEND","XR-OVERLOAD","XR-KEYS","XR-X3","REG-HYD","G85-3","T85-TARGETED","SOURCE-UNCHANGED"],"tech_lead":"R85-T"},
 {"stage":"2","status":"planned","scope":"MP3 via existing app/utils/ffmpeg.ts convertWavToMp3 (CDN core); clear error and no file when the load fails; WAV+MP3","acceptance":["R20-X2"]},
 {"stage":"3","status":"planned","scope":"encoding off the main thread (worker), progress updates, cancel; 5-minute project stays responsive","acceptance":["R20-X4"]}]
s20['files']=sorted(set(s20.get('files',[])+["app/contexts/ArrangementContext.tsx","app/lib/arrangement/__tests__/export-range.test.ts","app/lib/arrangement/__tests__/export-range-ui.test.tsx"]))
s20['ableton_round85']='Live 12 manual 5.1.3.1 Selection Options (b-round-84/web/managing-files.txt l.120-221, fetched 2026-10-22): a time selection sets Render Start/Length; default whole Set; Rendered Track Main = post-fader main output. CZABA same for range default and Master mix; conscious simplification: no typed start/length fields; individual-track render not in scope; MP3 leading silence noted for stage 2.'
s18=items['SRW-18']
s18['status']=s18['status'].replace('; Low C-R83-L1 scheduled round 84 X1','; C-R83-L1 closed round 84 X1-ALIGN')
for f in b['open_findings']:
    if f.get('id')=='C-R83-L1':
        f['status']='closed (C round 84 X1-ALIGN PASS both viewports: stored 6.000/10.000/14.000 at 40 px/s and 5.000/9.500/13.000 at 32 px/s, 0 px offsets; published 88b0262)'
    if f.get('id')=='GATE83-M1-STICKY-HEADER-OVERLAP':
        f['status']='reproduced by C round 84 pm1b probe -> C-R84-M1 (scheduled round 85 X1)'
    if f.get('id')=='SRW19-RESCHEDULE':
        f['status']='signal with C evidence: round 84 VF-PLAY-EDIT 4 extra createBufferSource (12->16) per video-fade drag, playback continued, position monotonic; merged with GATE83-M2; candidate fix needs a measured audible defect or the checkpoint ruling'
    if f.get('id')=='VIDEO-FADE-SOUND':
        f['status']='signal with C evidence: round 84 faded minus video-muted export max 0.507 in S..S+1 (sound present, not faded); picture-only by D-29z49; needs a user request to change'
new=[
 {"id":"C-R84-M1","severity":"medium","status":"scheduled round 85 X1 (D-29z50)","to":"A","title":"fade handles (z-30/40) and trim strips (z-20) of unselected clips escape the sticky z-20 track header: topmost for hit-testing under the header; a real drag edited a hidden video clip fade 1.000->2.000 with Undo; audio handle same class (pre-existing); envelope points covered","evidence":"c-round-84.md, c-round-84/pm1b-*.json, shots/pm1b-*.png, tools/pm1b.cjs"},
 {"id":"C-R84-M1-AUDIO-STATUS","severity":"info","status":"open - re-checked by C round 85 M1-HANDLE at the same spot (moot if the header is topmost)","to":"C","title":"audio fade handle under the header: drag wrote status 'Fade In: 1.000 წმ.' with value and Undo unchanged (observed, unexplained)","evidence":"c-round-84.md C-R84-M1"},
 {"id":"C-R84-L1","severity":"low","status":"open - Lows batch (audio path frozen); harness rule applied from round 85: range/window oracles exclude video-sound spans or mute video; <=1 LSB there is jitter","to":"B/Lows batch","title":"WAV export not bit-reproducible over the video's own sound span (+-1 LSB 24-bit in ~6.4k-7.7k samples; ~10 exports gave 6 hashes; not caused by the video fade)","evidence":"c-round-84/r2-1280x720-a.json, r2-1280x720-b.json"},
 {"id":"A-R84-ARCH-FADES-HELPERS","severity":"info","status":"signal - appended to checkpoint request (round-84 addendum q12); reviewer: keep (fades.ts frozen; VF1 parity guards drift)","to":"root/B","title":"video-fades.ts l.5-24 re-implements three private helpers of fades.ts l.21-48; proposal export roundFadeSeconds/floorFadeSeconds/withClipFadeLengths from fades.ts and delete the copies; acceptance VF1 parity green, FD1/FD6 untouched","evidence":"a-round-84.md Architecture note"},
 {"id":"A-R84-ARCH-DOCK-WRITER","severity":"info","status":"acknowledged (reviewer: keep; own sibling component, no link to sync effect)","to":"B","title":"ArrangementVideoDock.tsx l.237-273 adds a position writer and layout effect for the fade overlay","evidence":"a-round-84.md Architecture note"},
 {"id":"A-R84-BORDER-CONSTANTS","severity":"info","status":"open - one-line backlog item (reviewer: keep)","to":"Lows batch","title":"CLIP_ENVELOPE_ROOT_BORDER_PX (ArrangementClipEnvelope.tsx:21) and CLIP_BORDER_PX (ArrangementClip.tsx:44) both depend on the root border class","evidence":"a-round-84.md Architecture note"},
 {"id":"A-R84-REVIEW-LOWS","severity":"low","status":"open - Lows batch (#4 unreachable fallback branch, #5 SVG left -1 clipped by overflow-hidden, #7 export note role=note)","to":"Lows batch","title":"A round-84 code-review residuals","evidence":"a-round-84.md Code review"}]
have={f.get('id') for f in b['open_findings']}
for n in new:
    if n['id'] not in have: b['open_findings'].append(n)
b['architecture_signals'].append({"round":84,"source":"a-round-84.md Architecture note","note":"Signal 3: video-fades.ts duplicates three private fades.ts helpers -> keep (fades.ts frozen, VF1 parity); proposal export them from fades.ts later. Signal 4: dock fade-overlay writer -> keep. Coupling: two border constants -> keep, one-line backlog. SRW-19 feature boundary reached: appended as round-84 addendum (q12) to b-round-83-checkpoint-request.md; root has not answered the SRW-16 / round-83 requests; non-blocking."})
tl=b['tech_lead_manual_checks']
if not any(t.get('id')=='R84-T' for t in tl):
    tl.append({"id":"R84-T","what":"real Chrome on /studio-lab with an own video: a 1 s video fade-in/2 s fade-out looks smooth from/to black, docked and floating; handles easy to grab; the export note is clear","why":"feel of SRW-19 (D-29z49)","status":"open","added":"round 85 planning"})
if not any(t.get('id')=='R85-T' for t in tl):
    tl.append({"id":"R85-T","what":"real Chrome: select 4-9 s, Export defaults to the range; the file sounds like that part of the mix; scrolling the timeline never shows handles over the track names","why":"feel of SRW-20 stage 1 + C-R84-M1 (D-29z50)","status":"open","added":"round 85 planning"})
for r in b['rounds']:
    if r.get('round')==84:
        r['status']='c_pass_published'
        r['result']='C PASS browserVerified=true realVerified=true, 16 rows both viewports; P-M1 reproduced -> C-R84-M1 (medium); C-R84-L1 (low); fake-Bearer 403 blocked (backend unavailable in cloud); gate 84 published 88b0262'
if not any(r.get('round')==85 for r in b['rounds']):
    b['rounds'].append({"round":85,"task":"current-task.md","decision":"D-29z50","status":"dispatched","items":["X1 = C-R84-M1 sticky header stacking (medium)","SRW-20 stage 1: range export WAV (R20-X1, R20-X3)","doc 074 l.4"],
     "note":"baseline HEAD 88b0262, clean tree; frozen b-round-84-r85-tree-sha256.txt 481/481; snapshots b-round-84-r85-snapshots (7 files); protected 4/4",
     "owned":["app/components/arrangement/ArrangementLane.tsx (lane body isolate)","app/components/arrangement/ArrangementClip.tsx (X1 alternative only; else byte-identical)","app/lib/arrangement/graph.client.ts (renderArrangementWav window)","app/contexts/ArrangementContext.tsx (exportWav window)","app/components/arrangement/ArrangementExportDialog.tsx (scope radios)","app/lib/arrangement/__tests__/graph.test.ts (l.388 literal + one assertion)","app/lib/arrangement/__tests__/export-range.test.ts (new)","app/lib/arrangement/__tests__/export-range-ui.test.tsx (new)","app/lib/arrangement/__tests__/track-header-stacking.test.tsx (new)","docs/implementation/2026/quarter-IV/074-studio-lab-video-opacity-fade.md (l.4)","docs/implementation/2026/quarter-IV/075-studio-lab-range-export-and-header-stacking.md (new)"],
     "c_ids":s20['stages'][0]['c_ids']})
b['harness_rules'] = b.get('harness_rules')
hr=b['harness_rules']
rule={"id":"HR-C-R84-L1-EXPORT-JITTER","added":"round 85 planning","rule":"export equality oracles (range vs window, A vs B) exclude spans with the video's own sound or mute the video track; <=1 LSB (24-bit) there is jitter, report per-span counts"}
if isinstance(hr,list):
    if not any(isinstance(x,dict) and x.get('id')==rule['id'] for x in hr): hr.append(rule)
elif isinstance(hr,dict):
    hr[rule['id']]=rule['rule']
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', type(hr))
