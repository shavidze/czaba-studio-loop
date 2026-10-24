import json, sys
path = sys.argv[1]
b = json.load(open(path, encoding='utf-8'))
ids_of = lambda lst: {e.get('id') for e in lst}
c = json.load(open(sys.argv[2], encoding='utf-8'))
DEF_REASON = "user decision 2026-10-23: open Lows no longer block T12/VISUAL-A; fixed in one polish pass after VISUAL-A-OBSIDIAN and before release; final acceptance still requires every one fixed and C-verified"
links = {"ABL-B-1": ["SRW-12", "ABLETON-EXPERT-REVIEW P2"], "ABL-B-2": ["SRW-10", "C-R108-01", "ABLETON-EXPERT-REVIEW P8"]}
repro = {"ABL-B-1": "1440x900 or 1280x720 fresh /studio-lab; click library option 'Soft impact'; click '▶ მოუსმინე'; read the option's scrollWidth vs clientWidth (139-152 > 126) and look at the '▶ ისმის' badge",
         "ABL-B-2": "fresh /studio-lab; add 'CZABA hero' to music at 0; drag a range 4->8 s on the clip waveform; Z; Z again (view unchanged); X -> view stays 137.7 px/s (1440) with status 'წინა ხედი აღდგა. X კიდევ ერთი ნაბიჯით აბრუნებს.'; second X returns to 40 px/s"}
for bug in c['bugs']:
    bid = bug['id']
    if bid not in ids_of(b['deferred_low_polish']):
        b['deferred_low_polish'].append({"id": bid, "severity": bug['severity'], "status": "open", "title": bug['actual'], "expected": bug['expected'], "contract": bug['contract'], "evidence": "c-round-123.json bugs; " + bug['evidence'], "repro": repro[bid], "links": links[bid], "regression": bug['regression'], "deferred_reason": DEF_REASON, "deferred_round": "B round 123 -> 124 planning (2026-10-24)"})
    if bid not in ids_of(b['open_findings']):
        b['open_findings'].append({"id": bid, "severity": bug['severity'], "status": "deferred_low_polish", "title": bug['actual'], "evidence": "c-round-123.json bugs; " + bug['evidence'], "source": "C round 123 ABLETON-EXPERT-REVIEW part 1"})
for f in b['open_findings']:
    if f.get('id') == 'C-R108-01':
        f.setdefault('related', []);
        if 'ABL-B-2' not in f['related']: f['related'].append('ABL-B-2')
xlinks = {"ABL-R-3": ["TRACK-FOLD-U"], "ABL-R-6": ["B-R107-ENTER-ON-BODY (same open user question; not duplicated)"], "ABL-R-10": ["ROW-RANGE-M", "SRW-16 plan R3 (user asked that the marker name field opens at once) - conflicts; Saba decides"], "ABL-R-9": ["empty-project Play refusal (SRW-03 transport: 'დასაკრავი არაფერია')"], "ABL-R-7": ["SRW-24 / delete-selection-update.md (Cut Time exists; Paste/Duplicate Time and Insert Silence are new behaviour)"], "ABL-R-8": ["SRW-14", "CTRL-DIGIT-BROWSER-RESERVED"], "ABL-R-1": ["CTRL-DIGIT-BROWSER-RESERVED (Ctrl+Alt+3 may be browser-reachable; C exercised it in out/keys.json)"], "ABL-R-2": [], "ABL-R-4": ["Ctrl+F is browser find-in-page"], "ABL-R-5": ["fixed lane set (user scope)"]}
recs = b.setdefault('ableton_recommendations', [])
for r in c['recommendations']:
    if r['id'] in ids_of(recs): continue
    e = dict(r)
    e.update({"status": "awaiting_user", "source": "C round 123 ABLETON-EXPERT-REVIEW part 1 (c-round-123.json recommendations; user-review/ableton-review.md)", "authority": "user decision 2026-10-23 (Ableton expert review): recommendations are not implemented until Saba approves them in user-review/ableton-decisions.md; approved items go after VISUAL-A unless he orders otherwise, and before phase 2", "not_a_bug": "a recommendation, not an ABL-B; the 2026-10-23 bug gate does not apply; its priority is C's suggestion for Saba, not a scheduling order", "links": xlinks.get(r['id'], [])})
    recs.append(e)
q = {e['id']: e for e in b['post_current_stage_queue']}
are = q['ABLETON-EXPERT-REVIEW']
are['status'] = "in_progress: part 1 done (round 123 C PASS browserVerified=true, all P1-P8 areas, 0 spilled, 2 Lows ABL-B-1/2 deferred, ABL-R-1..10 awaiting_user; gate 123 skipped - no store change); part 2 (Q1-Q7) = round 124 (D-29z89)"
are['part1_result_round123'] = {"c": "c-round-123.json / c-round-123.md", "review": "user-review/ableton-review.md", "taskStatus": "PASS", "browserVerified": True, "realVerified": True, "areasDone": c['areasDone'], "areasSpilled": c['areasSpilled'], "bugs": ["ABL-B-1 low -> deferred_low_polish", "ABL-B-2 low -> deferred_low_polish"], "recommendations": "ABL-R-1..10 -> backlog.ableton_recommendations (awaiting_user)", "expert_agent": "ableton-arrangement-expert could not be invoked on this runner (no subagent tool); C read its role file and based every conclusion on browser observation + Live 12 manual text (F/?); recorded as process finding ABL-EXPERT-AGENT-UNAVAILABLE", "next_numbering": "part 2 continues ABL-B from 3 and ABL-R from 11"}
are['inputs_from_round121_status_round123'] = {"Waveform Zoom not an Undo step": "browser-confirmed CZABA fact (C round 123 P8); Live parity '?'", "Detail panel not zoomed": "browser-confirmed CZABA fact (C round 123 P8); Live parity '?'", "WAVEFORM-ZOOM-LIVE-PARITY": "Live parity '?' (no F text on range/location)"}
for fid, sev, st, title, ev in [
    ("ABL-EXPERT-AGENT-UNAVAILABLE", "info", "recorded (process)", "the ableton-arrangement-expert subagent cannot be invoked on the cloud runner (no subagent tool); C used its role file as a checklist; findings rest only on C's browser observations and Live 12 manual text (F/?). Part 2 and the final verdict state this for Saba.", "c-round-123.json notesForB[0]; c-round-123.md Scope and method"),
    ("C-R123-OBS-SFX-HEADER-SELECTION", "info", "watch (unreproduced; not a bug)", "native text-selection highlight on the SFX header in two first-run P3 screenshots (harness drag started off-screen); 4 targeted probes found selection length 0; record as a bug only with a reproducible gesture", "c-round-123.json notesForB[4]; c-round-123/tools/selprobe.cjs, selprobe2.cjs")]:
    if fid not in ids_of(b['open_findings']):
        b['open_findings'].append({"id": fid, "severity": sev, "status": st, "title": title, "evidence": ev, "source": "B round 123 -> 124 planning"})
for r in b['rounds']:
    if r.get('round') == 123:
        r['status'] = 'completed'
        r['result'] = "C PASS browserVerified=true realVerified=true allRowsRan=true; P1-P8 done, 0 spilled; ABL-B-1, ABL-B-2 (Low) -> deferred_low_polish; ABL-R-1..10 awaiting_user; A no-op OK; SOURCE-SCOPE start/end OK (608187f, 937); G123-3 OK (fake-Bearer 403 blocked: backend unavailable in cloud); gate 123 skipped (no real changes)"
if not any(r.get('round') == 124 for r in b['rounds']):
    b['rounds'].append({"round": 124, "task": "current-task.md", "decision": "D-29z89", "status": "dispatched", "items": ["ABLETON-EXPERT-REVIEW"], "note": "ABLETON-EXPERT-REVIEW part 2 (Q1 transport/video, Q2 loop/range, Q3 groups, Q4 fades/envelopes, Q5 gain/volume/pan/mute/solo/meters, Q6 export, Q7 final verdict). C-only review; A no-op; no store diff expected; baseline 608187f, frozen b-round-123-r124-tree-sha256.txt (937). Outcome table in current-task.md section 7."})
b['baseline_tree_at_round124'] = {"head": "608187fdf279d9b579c279f3c536b27be74c0eea", "working_tree": "clean (git status --porcelain empty at 2026-10-24T02:24Z); gate 123 skipped (no real changes), gate 122 published 608187f", "frozen_list": "tmp/studio-real-loop/b-round-123-r124-tree-sha256.txt", "entries": 937, "identical_to": "b-round-122-r123-tree-sha256.txt (cmp OK)", "excluded": [], "new_files_granted": []}
b['current_task'] = "current-task.md (round 124: D-29z89 - ABLETON-EXPERT-REVIEW part 2, C-only review round; A no-op (start-state check + a-round-124.md, no store change); C reviews areas Q1-Q6 in the real browser on /studio-lab against the Live 12 manual and writes Q7, the merged final verdict, in tmp/studio-real-loop/user-review/ableton-review.md (Georgian) + c-round-124.json/md; ABL-B from 3, ABL-R from 11; baseline clean 608187f; frozen b-round-123-r124-tree-sha256.txt (937))"
b['updated'] = "2026-10-24 (B round 123 result / round 124 plan, D-29z89)"
json.dump(b, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('dlp', len(b['deferred_low_polish']), 'of', len(b['open_findings']), 'recs', len(recs))
