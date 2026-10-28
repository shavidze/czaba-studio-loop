import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
D='2026-10-28'; ADD='2026-10-28 B round 226 -> 227 planning'
b['version']=212; b['updated']=D
b['current_task']=('current-task.md (round 227, D-29z272..D-29z277; CALM-1a gate fix-up: GATE226-B1 (track-layout.test.tsx class pins on footer slots -> structure assertions), C-R226-02 (waveform-zoom chip -> Waveform Zoom menu), C-R226-03 (fit row -> overview / ruler (no selection)); baseline 80fbb3b + round-226 tree (9 paths preserved); frozen 1072; 5 grants; carried 5 at round-226 end hash; B L23 pre-check 6 files 89 green). Next: CALM-1b (round 228) unless REGRESSION due.')
for r in b['rounds']:
    if r.get('round')==226:
        r['status']='c_pass_gate_failed'
        r['result']=('C PASS (16 rows passed; C-BBOX not passed pending B ruling C-R226-01; browserVerified=true, realVerified=true; 4 Low C-R226-01..04); '
                     'gate 226 FAILED: verify exit 1, 1/2972 tests red (track-layout.test.tsx l.859 class pin, A deviation D1), build not reached; nothing published (D-29z272)')
b['rounds'].append({'round':227,'task':'current-task.md','decision':'D-29z272..D-29z277','status':'dispatched','type':'CALM-1a gate fix-up (GATE226-B1 + C-R226-02 + C-R226-03)',
 'note':'baseline 80fbb3b + round-226 working tree (4 M + 5 ??) preserved; frozen 1072 (b-round-226-r227-tree-sha256.txt); grants 5 (b-round-226-r227-grants.txt); carried 5 (b-round-226-r227-carried-r226-sha256.txt); root 4; L23 pre-check on /tmp/b227 scratch: 6 files 89 tests green',
 'next':'C PASS + gate PASS -> CALM-1a done; round 228 CALM-1b unless REGRESSION due (on/after 2026-10-30)','added':ADD})
b['open_findings'] += [
 {'id':'GATE226-B1','severity':'medium','origin':'root gate 226','title':'track-layout.test.tsx (frozen in round 226) pins the class lists of arrangement-selected-clip-reserve (equality) and arrangement-selected-clip (arrayContaining basis-full); A deviation D1 moved basis-full to the new row wrapper, so verify fails (1/2972); browser behaviour correct (C-SLOT, C-GEOM)','status':'open - fixed in round 227 (structure assertions instead of class pins, D-29z273)','evidence':'gates/gate-round-226.json; gates/round-226/verify.log','added':ADD},
 {'id':'C-R226-02','severity':'low','origin':'C round 226','title':"shortcut sheet row waveform-zoom chip says '1× button' but the control is a <select> (Waveform Zoom)",'status':'open - fixed in round 227 (owned file, two literals; not deferred)','evidence':'c-round-226/rows/rows-1440x900.json waveform-zoom.info','added':ADD},
 {'id':'C-R226-03','severity':'low','origin':'C round 226','title':"shortcut sheet row fit says 'Double-click the ruler or the overview' fits, but with a time selection the ruler double-click zooms to the selection (StudioWorkspace handleRulerDoubleClick l.1269-1275)",'status':'open - fixed in round 227 (keys: Double-click the overview / Double-click the ruler (no selection))','evidence':'c-round-226.md C-R226-03','added':ADD},
]
for f in b['open_findings']:
    if f.get('id')=='B-R225-BACK-TO-START-KEY':
        f['status']='open - fixed in CALM-1b (now round 228, after the round-227 gate fix-up; D-29z272)'
b['closed_findings_d29z163'].append({'id':'C-R226-01','severity':'low','origin':'C round 226','title':'C-BBOX exceptions (a)-(c) did not cover the deterministic 1280x720 lane-fit cascade (fitLaneHeights) from the +20 px scroller','status':'closed by B ruling D-29z274: criterion amended with exception (d) (1280 only: video header h +0..+4, audio headers h +0..+1, lane controls y +0..+7, playhead h +0..+7); C re-runs C-BBOX-227','evidence':'c-round-226/bbox-diff.txt','closed_round':226,'added':ADD})
b['deferred_low_polish'].append({'id':'C-R226-04','severity':'low','status':'deferred_low_polish, candidate_round CALM-1b (D-29z275): B re-decides at round-228 planning; fixed there only if StudioWorkspace.tsx is granted anyway and a Live 12 reference check on keyboard focus after a ruler click supports adding the playhead handle to releaseEditFocusOnTimelinePointerDown (one clause + one test); otherwise the polish pass. Not buried: the sheet now advertises <-/-> nudge and +/- zoom',
 'title':'after a ruler click/double-click focus stays on the playhead handle (role=slider, ArrangementRuler l.151 focus()); a clip title click does not release it, so <-/-> moves the playhead 0.1 s instead of nudging the selected clip and +/- do nothing','source':'c-round-226.md C-R226-04; c-round-226/probe1.json, probe2-*.txt','repro':'add a clip; double-click the ruler; click the clip title bar; press ArrowRight then =','added':ADD})
b['architecture_signals'] += [
 {'id':'ARCH-A226-BLOCKING-DIALOG-REF','signal':'A round-226 reviewer: one blockingDialogOpenRef (export + shortcut sheet) read by handleKeyDown and handleKeyUp would remove the sheet onKeyUp Space workaround (handleKeyUp outside the round-226 grant)','status':'signal, not scheduled (input to ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP)','added':ADD},
 {'id':'ARCH-A226-PRODUCT-ROUTE-KEYS','signal':'protected app/routes/studio.$productId.tsx l.283-296 has its own ?/Esc handler without typing guards; not mounted with StudioWorkspace today; convergence candidate when the protected route work (SRW-21) resumes','status':'signal, not scheduled (protected file; deferred_user SRW-21 path)','added':ADD},
]
b['open_findings'] += [
 {'id':'A-R226-REVIEW-L7','severity':'info','origin':'A round 226 code-reviewer L7','title':'SC1 pins keys only for split and shortcuts; SS5 Space has no positive control in jsdom; UC12 title stale','status':'info - UC12 title fixed in round 227; SC4 adds key pins for fit and waveform-zoom; rest recorded, not scheduled','evidence':'a-round-226.md section 6','added':ADD},
 {'id':'C-R226-OBS-KBD-BORDER','severity':'info','origin':'C round 226','title':'kbd chip border rgb(36,33,30) on surface rgb(22,20,18) is very low contrast; decorative (key text >= 6.68:1), no SC applies','status':'info - VISUAL polish candidate, not scheduled','evidence':'c-round-226.md notes','added':ADD},
]
for q in b['post_current_stage_queue']:
    if q.get('id')=='SABA-B-8-CALM-STUDIO':
        q['status']='in_progress: CALM-1a C round 226 PASS but gate 226 failed (GATE226-B1) -> round 227 fix-up (D-29z272); CALM-1b = 228, CALM-2 = 229, then RETRO at 230 (retro_policy), CALM-3 after RETRO; REGRESSION takes precedence on/after 2026-10-30; then STUDIO-PERFORMANCE resumes with PERF-HARNESS-SHARED-LIB-b-ii'
        for s in q['stages']:
            if s['id']=='CALM-1a':
                s['status']='bug (gate-blocked): C round 226 PASS browserVerified=true; gate 226 failed on track-layout class pin; fix-up round 227 (D-29z272..D-29z277); not done until gate publishes'
            if s['id']=='CALM-1b':
                s['status']='not_started (round 228 planned; carries the C-R226-04 candidate decision, D-29z275)'
    if q.get('id')=='STUDIO-PERFORMANCE':
        q['status']='in_progress, paused for SABA-B-8 (CALM-1a fix-up 227, CALM-1b 228, CALM-2 229, RETRO 230, CALM-3); next PERF task b-ii after CALM-3 (D-29z272) | '+q['status']
b['decisions_log_b'] += [
 {'id':'D-29z272','date':D,'text':'Round 226 closed from evidence: C PASS (16 rows, browserVerified=true, realVerified=true, 4 Low), but gate 226 FAILED (verify exit 1: track-layout.test.tsx l.859 class pin, 1/2972; build not reached). CALM-1a = bug (gate-blocked), not done; nothing published; the round-226 working tree (9 paths) is preserved as the round-227 base on 80fbb3b. CALM-1b shifts to 228, CALM-2 to 229, RETRO stays at 230, CALM-3 after the RETRO.'},
 {'id':'D-29z273','date':D,'text':'GATE226-B1 fix direction: remove the two class-list assertions in the track-layout case and replace them with structure assertions (same parent row as the footer Keyboard shortcuts (?) button before select, after select and after deselect); do not re-pin the new classes (L8/L12; CALM-2/3 touch the footer). Lesson L40 added (testid element change -> its test files join the covering set).'},
 {'id':'D-29z274','date':D,'text':'Rulings: C-R226-01 accepted and closed (deterministic 1280 lane-fit cascade; C-BBOX exception (d) added, C re-runs it as C-BBOX-227); A round-226 D2 (sheet headings text-xs 12 px) accepted, the >= 12 px row wins (L4); doc 177 l.4 -> In Progress (stage 1 of 2; C round 227 PASS) per L28.'},
 {'id':'D-29z275','date':D,'text':'C-R226-04 (playhead handle keeps focus after a ruler click, so the advertised nudge/zoom keys are inert until focus moves): Low, pre-existing, frozen ArrangementRuler + SW release clause. Recorded in deferred_low_polish with candidate_round CALM-1b; B re-decides at round-228 planning (fix there only if SW is granted anyway and a Live 12 reference check supports it).'},
 {'id':'D-29z276','date':D,'text':"Sheet copy fixes: fit keys ['Double-click the overview', 'Double-click the ruler (no selection)'] (ruler double-click zooms to a time selection; zoom-range row covers that); waveform-zoom keys ['Waveform Zoom menu'] (the control is a <select> named Waveform Zoom; the shown value changes). SC4 pins both and forbids 'button' in any keys."},
 {'id':'D-29z277','date':D,'text':'Round 227 = CALM-1a fix-up with 5 grants (track-layout case + imports, shortcuts.ts two keys, shortcuts.test.ts SC4, track-group-collapse-ui UC12 title only, doc 177), StudioWorkspace.tsx not granted; A runs npm run build once as insurance (gate 226 never reached build). A round-226 architecture notes recorded as signals (ARCH-A226-BLOCKING-DIALOG-REF, ARCH-A226-PRODUCT-ROUTE-KEYS), not scheduled.'},
]
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(b['deferred_low_polish']))
