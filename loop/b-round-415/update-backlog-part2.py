import json, sys, os
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-415/update-backlog-part2.done'
if os.path.exists(M): print('already applied (marker)'); sys.exit(1)
b=json.load(open(P))
if 'D-29z1445' in json.dumps(b['decisions_log_b']): print('already applied'); sys.exit(1)
BY='2026-11-08 B round 415 -> 416 planning'
b['version']=392
b['updated']='2026-11-08 (B round 415 -> 416 planning, part 2: RETRO 416)'
b['current_task']='Round 416: RETRO 416 (window 401-415) + whole-screen and journey review; no app code (current-task.md)'
PREV=['GATE393-L3-FALLBACK-REENTRY','A-R394-REVIEW-L3-REENTRANT-SYNC-THROW','A-R395-REVIEW-L1-SEEK-REENTRANT','GATE395-L1-CURRENTTIME-READ','A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW','A-R392-REVIEW-L3-SUPERSESSION-BY-ID','A-R393-REVIEW-L3-URL-SWITCH-ROWS']
rp=b['retro_policy']
rp['next_due']='round 431 or the end of STUDIO-PERFORMANCE, whichever first (retro 431 window 416-430) (D-29z1445) | '+rp['next_due']
rp['signals_for_next_retro'].insert(0,"retro-416: counters for RETRO 431 (tech-lead): sketch dispatched without an l58-check rc 0 = 0 (window 401-415: 1 of 14, round 415; 402 = sha split by bold, format only); every C bug has origin and all L57 fields present 15/15 incl. short FAILs (window: 14/15, 411); report sentences that do not match a file diff = 0 (C-R401-01); B-origin C FAIL <= 1 (window: 2, 401 and 411); A STOP reaching C <= 1 (window: 1, 411); pure fix-up chain share < 15 % (window 12.5 %, 411-412); countermetrics B median planning <= $14.50 (window $13.85), B share <= 65 % (window 67.2 %), L58 < 5000 bytes (now 4988); new host-dependent generators or fixtures = 0 (grep new AudioContext() without a rate, toLocale*, Math.random in scripts/); SYS-R416-PREVIEW-CONTROLLER ran or root answered ARCH-CHECKPOINT-PREVIEW-AFTER-13C")
b['retro_runs'].append({"round":416,"decision":"D-29z1445","window":"401-415","report":"retros/retro-416.md","lessons":"lessons.md (60 lines): l.3 pointer; L22 short FAIL full JSON; L38 reviewers work on a copy; L56 change sentences read from the diff; L57 origin definition; L58 host-independent artifacts + tools/l58-check.py (all tech-lead); diff b-round-415/lessons-diff.txt","data":"b-round-415/*.py run on b-round-415/backlog-before-416.json; outputs b-round-415/data/; retro-numbers-416.txt","consults":{"tech-lead":"used","product-designer":"used (screen + journey review)","advisor":"used (planning approach)","consequence-tester":"not in the B consult list (2026-11-04 section 6); not called","qa-engineer":"not in the B consult list; not called"},"screen_review":"user-review/screen-review-416.md (no new clutter; SR-416-1 question)","added":BY})
b['screen_review_candidates'].append({"id":"SR-416-1","decision":"D-29z1445","status":"awaiting_user (question)","note":"round-411 dimmed pre-decode library waveform: its reason is only in a hover title ('Preview — wait for the sound to load'); keyboard / screen-reader reach unconfirmed (product-designer inference); questions: capture it on a slow network at the next RETRO; does the reason need a keyboard/AT-reachable form. Not a bug until measured.","added":BY})
F={f.get('id'):f for f in b['retro_candidates'] if isinstance(f,dict)}
F['RC-R305-LESSON-CHAR-CAP']['status']='watch to RETRO 431 (D-29z1446): L23 5058, L58 4988 bytes after the RETRO 416 clause, trigger > 5500; tech-lead countermetric L58 < 5000 | '+F['RC-R305-LESSON-CHAR-CAP']['status']
F['RC-R401-ORIGIN-RETAG']['status']='adopted (D-29z1446): L57 origin clause (phase whose artifact first held the defect; B sketch/task text = B spec); fired by c-round-411.json (bug without origin, sketch cause) | '+F['RC-R401-ORIGIN-RETAG']['status']
b['retro_candidates'].append({"id":"RC-R416-L58-CHECKER","decision":"D-29z1446","round":416,"note":"the L58 sketch-review claim existed since RETRO 401 and slipped once (415); tools/l58-check.py makes it checkable (RETRO 353 pattern). Window run b-round-415/data/l58-check-window.txt: rc 0 for 403-414, rc 1 for 402 (sha split by ** in the review, format only) and 415 (no sketch-review.md).","status":"adopted (L58)","added":BY})
b['retro_candidates'].append({"id":"RC-R416-PREDECODE-CAPTURE","decision":"D-29z1445","round":416,"note":"RETRO captures run after a warm-up, so loading states (round-411 dimmed waveform) are never captured; = SR-416-1 question 1","status":"awaiting_user (SR-416-1)","added":BY})
dl=b['deferred_low_polish']; of=b['open_findings']
def pre(fid, text, lists=(None,)):
    hit=False
    for lst in (of, dl):
        for f in lst:
            if f.get('id')==fid: f['status']=text+' | '+str(f.get('status')); hit=True
    if not hit: print('missing', fid)
pre('B-R411-SKETCH-M1-MISSED','closed (D-29z1446): processed by RETRO 416 (retro-416 section 3; L58 host-independent artifacts clause)')
pre('TL-R413-I1','closed (D-29z1446): processed by RETRO 416 (L38 reviewers-work-on-a-copy clause)')
pre('ARCH-CHECKPOINT-PREVIEW-AFTER-13C','L46 default applied (D-29z1447): no root answer by RETRO 416; SYS-R416-PREVIEW-CONTROLLER queued after SYS-CLOCK-DETERMINISM (tech-lead); a root answer that arrives before its dispatch wins')
for i in PREV: pre(i,'assigned to SYS-R416-PREVIEW-CONTROLLER (D-29z1447)')
for t in b['tech_lead_manual_checks']:
    if t.get('id')=='TLM-PERF15-FIREFOX':
        t['deadline']='RETRO 431 (L46; first RETRO question sent at RETRO 416)'
        t['status']='question to Saba (D-29z1447): retro-416 section 12; still needs ROOT-REQ-PLAYWRIGHT-FIREFOX or Saba running it on a Firefox machine | '+t['status']
b['systemic_tasks'].append({"id":"SYS-R416-PREVIEW-CONTROLLER","decision":"D-29z1447","added":BY,"origin":"L46 default of ARCH-CHECKPOINT-PREVIEW-AFTER-13C (root request b-round-393/root-request-arch-checkpoint-preview.md unanswered since round 396)","scope":"library preview controller only (app/lib or app/components files of decidePreviewMode / useLibraryPreviewController / preview.client.ts, found by grep at dispatch): replace sourceId supersession with a per-request token so stale or superseded calls cannot stop or restart the preview; never call the start path synchronously from the media-error and seek handlers; read currentTime once per tick; public hook surface unchanged; L58 event-kind x event-kind matrix as rows; behaviour-preserving for the user (tech-lead opinion)","closes":PREV,"size":"one round; split into two only if the matrix needs > ~20 rows on the sketch (request token + stale calls, then re-entrancy guards)","place":"after SYS-CLOCK-DETERMINISM, before SYS-R369 and STEM-LANES","status":"queued (D-29z1447)"})
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
q['stages'].append({"id":"SYS-R416-PREVIEW-CONTROLLER","status":"queued (D-29z1447): after SYS-CLOCK-DETERMINISM; see systemic_tasks"})
q['status']='in_progress (D-29z1448): SYS-R388 done (415, 344a59f); round 416 = RETRO 416; then SYS-CLOCK-DETERMINISM, SYS-R416-PREVIEW-CONTROLLER, SYS-R369 (conditional on its root checkpoint); REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10 | '+q['status']
for s in b['systemic_tasks']:
    if s.get('id')=='SYS-CLOCK-DETERMINISM' and 'A-R415-REVIEW-L1-CALLSITE-FLAG' not in s.get('may_close',[]):
        s.setdefault('may_close',[]).append('A-R415-REVIEW-L1-CALLSITE-FLAG')
for e in b['post_current_stage_queue']:
    if e['id']=='STORE-REDESIGN':
        e['note_d29z1448']='direction-decision.md exists since 2026-10-25 (direction A, Obsidian & Brass): STORE-2b..5 are not direction-gated; they stay paused only by the 2026-10-27 order (STUDIO-PERFORMANCE, SYS-1..3 first)'
b['rounds'].append({"round":416,"task":"current-task.md","decision":"D-29z1445..D-29z1449","type":"RETRO 416 (window 401-415) + screen/journey review; no app code","status":"dispatched","note":"baseline 344a59f clean; frozen b-round-415/r416-tree-sha256.txt (1316); grants none; claims b-round-415/claims-416.sh"})
dlog=b['decisions_log_b']
dlog.append({"id":"D-29z1445","date":"2026-11-08","by":BY,"decision":"RETRO 416 (window 401-415) outputs: retros/retro-416.md, user-review/screen-review-416.md (no new clutter; SR-416-1 question), lessons.md, data and scripts under b-round-415/; retro_policy.next_due = round 431 or end of STUDIO-PERFORMANCE; counters for RETRO 431 recorded (tech-lead)."})
dlog.append({"id":"D-29z1446","date":"2026-11-08","by":BY,"decision":"Lessons (60 lines, ids unchanged): l.3 pointer to retro-416; L22 short FAIL is a full JSON; L38 reviewers work on a copy (TL-R413-I1); L56 a change sentence is read from the saved diff (C-R401-01); L57 origin definition (RC-R401-ORIGIN-RETAG adopted); L58 host-independent artifacts + tools/l58-check.py in the claims script (B-R411-SKETCH-M1-MISSED, round 415 unreviewed sketch). All tech-lead. B-R411-SKETCH-M1-MISSED and TL-R413-I1 closed as processed."})
dlog.append({"id":"D-29z1447","date":"2026-11-08","by":BY,"decision":"L46 deadlines at RETRO 416: ARCH-CHECKPOINT-PREVIEW-AFTER-13C unanswered -> recorded default: new SYS-R416-PREVIEW-CONTROLLER (one bounded round, closes the 7 preview re-entrancy/supersession Lows) queued after SYS-CLOCK-DETERMINISM, before SYS-R369 and STEM-LANES (tech-lead); a root answer before dispatch wins. TLM-PERF15-FIREFOX -> one question to Saba (retro-416 section 12), deadline RETRO 431."})
dlog.append({"id":"D-29z1448","date":"2026-11-08","by":BY,"decision":"Order after RETRO 416: REGRESSION-2026-11-10 first if due at that planning (date >= 2026-11-10), else SYS-CLOCK-DETERMINISM -> SYS-R416-PREVIEW-CONTROLLER -> SYS-R369 (only with a root checkpoint answer; else skipped, Lows stay deferred) -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction A decided 2026-10-25; paused only by order) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). RETRO 431 at round 431 or at the end of STUDIO-PERFORMANCE."})
dlog.append({"id":"D-29z1449","date":"2026-11-08","by":BY,"decision":"RETRO 416 data notes: stops-count regex now excludes 'STOP: none' (403 was a false hit; only 411 stopped); B planning cost of round 409 is a lower bound (b-round-408-result.json.attempt1.json empty); round 411 C bug A-R411-REVIEW-M1 re-tagged origin B spec (dispatched sketch, L57 origin clause); 401 C-R401-01 origin B as tagged."})
json.dump(b, open(P,'w'), ensure_ascii=False, indent=1)
open(M,'w').write('applied v392\n')
print('ok', b['version'])
