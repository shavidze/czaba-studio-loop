import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==215
b['version']=216
b['updated']='2026-10-28'
DATE='2026-10-28 B round 230 -> 231 planning'
b['current_task']='current-task.md (round 231, D-29z299..D-29z305; SABA-B-8 CALM-2b: detail empty state one line, library notice one sentence + dismiss, first-run status, DUX-R-4(a) active empty-lane hint; + RT-FIX-231 (lessons L26), doc 170/178 l.4, GATE229-S3/S5; baseline 5da0f50, 18 grants + 3 new files, frozen 1065)'
# round 230 result + round 231 dispatch
r230=[r for r in b['rounds'] if isinstance(r,dict) and r.get('round')==230][0]
r230['status']='c_fail_rt_lessons_only (gate 230 skipped: C taskStatus FAIL; nothing to publish from store)'
r230['result']='C round 230: 8 PASS (SOURCE-SCOPE, RT-NUM, RT-CAUSE, RT-IDS, RT-SABA, RT-SCREEN, G230-3, STUDIO-SMOKE-230), 1 FAIL RT-LESSONS (C-R230-01 Low: amended L26 required TEMPLATE ## Prompt, 0/178 docs have it; same as A lesson feedback); browserVerified=true, realVerified=true; notes N1-N5'
r230['closed_by']='D-29z299 (L26 reworded, RT-FIX-231 re-check in round 231)'
b['rounds'].append({"round":231,"task":"current-task.md","decision":"D-29z299..D-29z305","status":"dispatched","type":"SABA-B-8 CALM-2b (final stage of CALM-2) + RT-FIX-231","note":"baseline 5da0f50 clean (gate 230 skipped); frozen 1065 (b-round-230-r231-tree-sha256.txt); 18 grants (b-round-230-r231-grants.txt) + 3 new files (b-round-230-r231-new-files.txt); L23 pre-check b-round-230/l23-*.log, precheck-scratch.diff; L29 browser recipes b-round-230/probe/","next":"C PASS -> round 232 CALM-3 (REGRESSION first if planning on/after 2026-10-30)","added":DATE})
# retro run
rr=b['retro_runs'][-1]; assert rr['round']==230
rr['status']='done except RT-FIX-231: C round 230 PASS on RT-NUM/RT-CAUSE/RT-IDS/RT-SABA/RT-SCREEN, FAIL RT-LESSONS (C-R230-01); L26 reworded at round-231 planning (D-29z299); screen-review addendum N3/N4 (D-29z300); closes when C round 231 passes RT-FIX-231'
# findings
of=b['open_findings']
of.append({"id":"C-R230-01","severity":"low","origin":"C round 230 RT-LESSONS + A round 230 lesson feedback","title":"amended L26 required every TEMPLATE.md ## heading incl. the authoring-instructions heading ## Prompt, which 0 of 178 docs have; the lesson was not checkable as written","status":"fixed at round-231 planning (D-29z299): L26 now compares the seven headings after ## Prompt as an in-order subsequence (171/175 quarter-IV docs pass, b-round-230/l26-check.txt; 005, 006, 009, 076 predate the rule); final newline restored (N2); C re-checks RT-FIX-231","evidence":"c-round-230.json bugs; a-round-230.md Lesson feedback; lessons.md l.36","added":DATE})
of.append({"id":"C-N230-NOTES","severity":"info","origin":"C round 230 notes N1-N5","title":"N1 retro-230 l.55 GATE217-S4 wording loose (status-line text, not stale status); N2 lessons.md no final newline; N3 SR-230-9 ~0:22 true at 1440 only (~0:18 at 1280); N4 screen review should disclose calm-studio-review keep verdicts for SR-230-1/-4/-7/-8; N5 cold-start timeout env-only","status":"N2 fixed (D-29z299); N3 and N4 fixed by an addendum to user-review/screen-review-230.md (D-29z300, original text kept because it was already notified); N1 left as is (count correct, wording only; recorded here); N5 env info","added":DATE})
of.append({"id":"SABA-Q-NOTICE-ONE-ROW","severity":"info","origin":"B round-231 planning measurement (b-round-230/probe-notice-width.mjs)","title":"Saba's exact notice wording 'Synthetic demo stems — not CZABA catalogue audio.' is 291 px at the Studio 12 px text; the library content box is 264 px at its default 288 px width (236 px beside the dismiss button), so it renders as one sentence on 2 rows (was 3 rows)","status":"awaiting_user (D-29z301): CALM-2b ships the exact approved wording on 2 rows; options for Saba: (1) keep (today), (2) a shorter wording that fits one row, e.g. 'Synthetic demo stems — not CZABA audio.', (3) accept a wider default library (layout change)","added":DATE})
# deferred low statuses
for e in b['deferred_low_polish']:
    if e.get('id')=='GATE229-S3': e['status']='dispatched round 231 (CALM-2b grants strings.ts + ArrangementLane.tsx; videoSoloTitle), closes on C round 231 PASS (D-29z301)'
    if e.get('id')=='GATE229-S5': e['status']='dispatched round 231 (doc 178 granted: l.4 + one sentence), closes on C round 231 PASS (D-29z301)'
    if e.get('id')=='B-R229-DOC170-STATUS': e['status']='dispatched round 231 (grant 18: doc 170 l.4 -> exactly **სტატუსი:** Completed (C round 221 PASS), D-29z297), closes on C round 231 PASS'
# SABA-B-8 queue entry
for q in b['post_current_stage_queue']:
    if isinstance(q,dict) and q.get('id')=='SABA-B-8-CALM-STUDIO':
        q['status']='in_progress: CALM-1 done; CALM-2a done (5da0f50); RETRO 230 done except RT-FIX-231; CALM-2b = round 231 (D-29z301); CALM-3 = round 232 (REGRESSION first if planning on/after 2026-10-30); then SABA-B-7-ENVELOPE-DB | '+q['status']
        for st in q['stages']:
            if st['id']=='CALM-2a': st['status']='done: C round 229 PASS (browserVerified=true, realVerified=true); gate 229 published 5da0f50 (D-29z292)'
            if st['id']=='CALM-2b':
                st['status']='dispatched round 231 (D-29z301..D-29z303): header label empty + one hint line, none-state reasons sr-only (aria-describedby kept), notice exact wording on 2 rows + dismiss (localStorage czaba-studio-notice-dismissed:<collection id>, server snapshot visible, focus to search), first-run status demo+purchased, lane hint !video && active && clips==0 && not folded && no drag; + doc 179'
            if st['id']=='CALM-3': st['status']='not_started (round 232 unless REGRESSION is due); also carries GATE229-S2 and the GATE229-S4 C row'
# decisions
dl=b['decisions_log_b']
D=[
("D-29z299","Round 230 accepted except RT-LESSONS: C FAIL only on C-R230-01 (Low, lessons.md L26), browserVerified=true; gate 230 skipped, baseline stays 5da0f50. L26 reworded (seven TEMPLATE headings after ## Prompt, in-order subsequence, extras allowed) and the final newline restored; A's and C's identical feedback adopted. Per tasks/round-230.md section 4 the RT row is re-checked as RT-FIX-231 and round 231 runs as planned (planning date 2026-10-28 < 2026-10-30, so CALM-2b, not REGRESSION)."),
("D-29z300","C notes N3/N4 on user-review/screen-review-230.md are fixed by an appended addendum, not an in-place rewrite, because the file was already notified (screen-review-230.md.notified 16:22Z); root re-forwards the addendum. N1 (retro wording) is left: the count is correct."),
("D-29z301","CALM-2b rulings (L4): (1) detail none-state: header label renders '' and the one visible line is arrangement-detail-hint 'Select a clip to edit its time selection and Clip Gain.'; both none-state reason <p> keep their ids and text and become sr-only so aria-describedby still reaches 'Select a clip first'; nothingSelected deleted (one source). (2) notice = Saba's exact wording; it measures 291 px vs a 264 px box, so it shows as one sentence on 2 rows (SABA-Q-NOTICE-ONE-ROW awaiting_user). (3) dismiss: an X button beside the notice (search-clear pattern, global focus ring), key czaba-studio-notice-dismissed:<collection.id> = '1', useSyncExternalStore server snapshot = visible, in-memory fallback when storage throws, focus moves to the library search. (4) first-run status changes for demo and purchased origins alike. (5) lane hint 'Drag a sound here, or press Enter to add it' renders when !isVideo && isActive && density !== 'folded' && arrangement.clips.length === 0 && !isFileDragOver && libraryGhost === null; it returns after an Undo back to 0 clips (an empty-state line, the smallest honest reading of 'before the first clip'). (6) GATE229-S3 videoSoloTitle and GATE229-S5 doc 178 sentence ride along."),
("D-29z302","Geometry rule for CALM-2b: detail field boxes x/y/w unchanged +-1 px at both viewports; the one allowed delta is arrangement-detail-apply height 18 -> 24 px at 1280x720 expanded (the visible none-state reason no longer squeezes the w-44 column; measured b-round-230/probe). Library: notice 48 -> 32 px tall, the tree moves up 16 px (allowed, the notice shrank)."),
("D-29z303","L31 ruling: LRS4 is 1756 ms at gate 229 (35 % of the 5 s default) but 3003 ms in B's loaded full-suite scratch sweep (60 %); library-row-strings-ui gets no new rows (only the LRS5 literal); the notice cases go to a new file library-notice-ui.test.tsx."),
("D-29z304","L28 multi-stage: grep 'In Progress (stage' at 5da0f50 = docs 170 (grant 18, D-29z297), 176 (open stage PERF-HARNESS-SHARED-LIB-b-ii) and 178 (grant 17, final stage of CALM-2: Completed (C round 231 PASS)). Doc 179 l.4 = Completed (C round 231 PASS)."),
("D-29z305","Round 232 = CALM-3 (Overview empty state + Ctrl+Alt+O; carries GATE229-S2 and the GATE229-S4 C row) if round-232 planning is before 2026-10-30, else REGRESSION first (regression-last.json round 199). C FAIL on CALM-2b -> fix-up on the same grants."),
]
for i,t in D: dl.append({"id":i,"date":"2026-10-28","text":t})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok', b['version'], len(b['open_findings']), len(dl))
