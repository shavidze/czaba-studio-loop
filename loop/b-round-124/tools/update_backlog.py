import json, sys
path, cpath = sys.argv[1], sys.argv[2]
b = json.load(open(path, encoding='utf-8'))
c = json.load(open(cpath, encoding='utf-8'))
assert c['round'] == 124 and c['taskStatus'] == 'PASS' and c['browserVerified'] and c['reviewComplete'] and not c['areasSpilled'] and not c['bugs']
ids_of = lambda lst: {e.get('id') for e in lst}
AUTH = "user decision 2026-10-23 (Ableton expert review): recommendations are not implemented until Saba approves them in user-review/ableton-decisions.md; approved items go after VISUAL-A unless he orders otherwise, and before phase 2"
NOTBUG = "a recommendation, not an ABL-B; the 2026-10-23 bug gate does not apply; its priority is C's suggestion for Saba, not a scheduling order"
xlinks = {
 "ABL-R-11": ["ABLETON-LOOP-KEYS-NOT-REQUESTED (same Live 6.6 keys; now scored with F text)", "SRW-05"],
 "ABL-R-12": ["SRW-18 (linear fades today)", "T12-ADVANCED T12.12/T12.13 (crossfades, micro fades) - related, not the same"],
 "ABL-R-13": ["ENVELOPE-SNAP (signal; now scored with F text 26.7.1)", "SRW-18", "SRW-14"],
 "ABL-R-14": ["T12 stage 1/3a double-click reset exists; Delete must still not delete the selected clip while a fader is focused"],
 "ABL-R-15": ["MASTER-FINE-STEP (scored here -> awaiting_user via ABL-R-15)", "SRW-13"],
 "ABL-R-16": ["SRW-20", "licence question for Saba: per-lane export could hand out purchased CZABA stems one by one; purchase/entitlement policy unchanged until he decides"],
 "ABL-R-17": ["already queued as PHASE2-VIDEO-SCORING SRW-40 (export with video, awaiting the user's phase-2 go-ahead); not a new item"],
 "ABL-R-18": ["PHASE2-VIDEO-SCORING SRW-41b overlaps for Normalize/loudness target; sample rate and bit depth options do not overlap", "SRW-20"],
}
recs = b['ableton_recommendations']
for r in c['recommendations']:
    if r['id'] in ids_of(recs): continue
    e = dict(r)
    e.update({"status": "awaiting_user", "source": "C round 124 ABLETON-EXPERT-REVIEW part 2 (c-round-124.json recommendations; user-review/ableton-review.md)", "authority": AUTH, "not_a_bug": NOTBUG, "links": xlinks.get(r['id'], [])})
    if r['id'] == 'ABL-R-17': e['status'] = 'awaiting_user (already queued as SRW-40 in PHASE2-VIDEO-SCORING)'
    recs.append(e)
for f in b['open_findings']:
    fid = f.get('id')
    if fid == 'MASTER-FINE-STEP':
        f['status'] = "scored in ABLETON-EXPERT-REVIEW part 2 (C round 124 Q5: Shift still 0.5 dB steps) -> recommendation ABL-R-15 awaiting_user; not a bug"
    elif fid == 'ENVELOPE-SNAP':
        f['status'] = "scored in ABLETON-EXPERT-REVIEW part 2 (C round 124 Q4: breakpoint lands at 6.370 with Snap on; Live 26.7.1 F) -> recommendation ABL-R-13 awaiting_user; not a bug"
    elif fid == 'ABLETON-LOOP-KEYS-NOT-REQUESTED':
        f['status'] = "recorded; scored in ABLETON-EXPERT-REVIEW part 2 (C round 124 Q2) -> recommendation ABL-R-11 awaiting_user"
    elif fid == 'GROUP-VOLUME-VISIBLE-READOUT':
        f['status'] = "signal for DESIGN-UX-REVIEW (re-confirmed C round 124 Q3/notesForB: group Volume has no visible value; layout change needs Saba)"
    elif fid == 'ABL-EXPERT-AGENT-UNAVAILABLE':
        f['status'] = "recorded (process); still true in round 124 (c-round-124.json expertAgent); the final verdict states it for Saba"
for fid, sev, st, title, ev in [
    ("C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER", "info", "signal for DESIGN-UX-REVIEW (not a bug yet; C may score it as DUX-B or DUX-R)", "at 1280x720 the Export dialog's 'მონიშნული მონაკვეთი' option sits partly under the dialog footer until the body is scrolled", "c-round-124/shots/Q6-dialog-1280.png (B opened it: the second range card is cut by the footer line); related ARCH-R101-MODALBODY-PADDING-SLOT, GATE102-S3-TALL-CARD-NO-CAP"),
    ("C-R124-ENV-FIRST-LOAD", "info", "known environment (ENV-FIRST-LOAD rule)", "first /studio-lab load after dev-server warm-up showed a hydration error + 'Invalid hook call' and an empty DOM; replaced once; all later sessions clean", "c-round-124.json invalidRuns[0]")]:
    if fid not in ids_of(b['open_findings']):
        b['open_findings'].append({"id": fid, "severity": sev, "status": st, "title": title, "evidence": ev, "source": "B round 124 -> 125 planning"})
q = {e['id']: e for e in b['post_current_stage_queue']}
are = q['ABLETON-EXPERT-REVIEW']
are['status'] = "done (round 123 part 1 + round 124 part 2: C PASS browserVerified=true, reviewComplete=true, P1-P8 and Q1-Q7 each with browser evidence; 0 Medium+ ABL-B; ABL-B-1/2 Low deferred; ABL-R-1..18 awaiting_user; gates 123/124 skipped - no store change; baseline 608187f)"
are['part2_result_round124'] = {"c": "c-round-124.json / c-round-124.md", "review": "user-review/ableton-review.md (final merged verdict, index; part-1 backup c-round-124/ableton-review-part1.md; B checked all 97 part-1 table rows are still present)", "taskStatus": "PASS", "browserVerified": True, "realVerified": True, "allRowsRan": True, "areasDone": c['areasDone'], "areasSpilled": [], "bugs": [], "recommendations": "ABL-R-11..18 -> backlog.ableton_recommendations (awaiting_user)", "expert_agent": c.get('expertAgent'), "b_spot_checks": "Q5 pad RMS 0.04082 -> 0.02046 (= -6.0 dB) for Clip Gain and Volume (out/Q5-1440.json); Q3 group volume pk 0.5012, group mute 0 (out/Q3-1440.json); G124-3 out/g124-3.json 401 + Sign in required; shots Q6-dialog-1280.png and Q3-nested-1440.png opened and match C's descriptions"}
vis = q['VISUAL-A-OBSIDIAN']
vis['prerequisites_status_round125'] = {"all current items done or deferred": "yes for gate (phase 1 complete-for-gate; SRW-21 deferred_user)", "T12-GAIN-VOLUME complete": "yes (V1 stages 1-4b c_pass_published, 425a807)", "ABLETON-EXPERT-REVIEW complete (Medium+ ABL-B bugs fixed)": "yes (done round 124; 0 Medium+ ABL-B)"}
vis['status'] = "in_progress: step 1 DESIGN-UX-REVIEW part 1 = round 125 (D-29z90; C-only), part 2 = round 126; V-0 after the review"
vis['design_ux_review_split_d29z90'] = {
 "part1_round125": ["D1 comfort scorecard vs Live (common tasks: count clicks/keys in CZABA from the browser, in Live only from quoted manual text F, else '?')", "D2 shortcut parity table (Live ch. 42 vs CZABA keymap from StudioWorkspace.tsx handleKeyDown + component key handlers + browser) and discoverability (tooltips, the shortcut hint line, menus)", "D6 VISUAL-A baselines: bbox-baseline-{1280,1440}.json + contrast table on composited surfaces (RV-1/RV-2 reference before V-1)", "DUX-B found on the way"],
 "part2_round126": ["D3 friction points (hierarchy, density, target sizes, contrast, feedback, first-visit clarity) with screenshots", "D4 'better than Ableton' ideas DUX-R-n with VISUAL-A fit (colour/icon/type only vs layout/behaviour)", "D5 merged verdict + DUX-B list + full index"],
 "spill_rule": "part-1 sections not finished in round 125 run first in round 126; the review is complete only when D1-D6 each have a section with browser evidence",
 "output": "tmp/studio-real-loop/user-review/design-ux-review.md (= policy loop/user-review/); answers in user-review/design-ux-decisions.md (not present at round 125 planning)"}
for a in vis.get('acceptance', []):
    if a['id'] == 'RV-1': a['baseline'] = "to be captured by C in round 125: tmp/studio-real-loop/c-round-125/out/bbox-baseline-1280.json and bbox-baseline-1440.json at 608187f (no baseline existed before)"
    if a['id'] == 'RV-2': a['baseline'] = "to be captured by C in round 125: tmp/studio-real-loop/c-round-125/out/contrast-baseline.json (composited surfaces incl. 'dim'; visual-direction-a.md TODO)"
b.setdefault('design_ux_recommendations', [])
for r in b['rounds']:
    if r.get('round') == 124:
        r['status'] = 'completed'
        r['result'] = "C PASS browserVerified=true realVerified=true allRowsRan=true reviewComplete=true; Q1-Q7 done, 0 spilled; 0 bugs; ABL-R-11..18 awaiting_user; A no-op OK; SOURCE-SCOPE start/end OK (608187f, 937); G124-3 OK (fake-Bearer 403 blocked: backend unavailable in cloud); gate 124 skipped (no real changes) -> ABLETON-EXPERT-REVIEW done"
if not any(r.get('round') == 125 for r in b['rounds']):
    b['rounds'].append({"round": 125, "task": "current-task.md", "decision": "D-29z90", "status": "dispatched", "items": ["VISUAL-A-OBSIDIAN / DESIGN-UX-REVIEW"], "note": "DESIGN-UX-REVIEW part 1 (D1 comfort scorecard, D2 shortcut parity + discoverability, D6 VISUAL-A bbox/contrast baselines). C-only review; A no-op; no store diff expected; baseline 608187f, frozen b-round-124-r125-tree-sha256.txt (937). Outcome table in current-task.md section 7."})
b['baseline_tree_at_round125'] = {"head": "608187fdf279d9b579c279f3c536b27be74c0eea", "working_tree": "clean (git status --porcelain empty at 2026-10-24T03:15Z); gate 124 skipped (no real changes), gate 122 published 608187f", "frozen_list": "tmp/studio-real-loop/b-round-124-r125-tree-sha256.txt", "entries": 937, "identical_to": "b-round-123-r124-tree-sha256.txt (cmp OK)", "excluded": [], "new_files_granted": []}
b['current_task'] = "current-task.md (round 125: D-29z90 - DESIGN-UX-REVIEW part 1, first step of VISUAL-A-OBSIDIAN, C-only review round; A no-op; C writes D1 comfort scorecard, D2 shortcut parity/discoverability and D6 bbox/contrast baselines in tmp/studio-real-loop/user-review/design-ux-review.md (Georgian) + c-round-125.json/md; DUX-B from 1, DUX-R from 1 (part 2); baseline clean 608187f; frozen b-round-124-r125-tree-sha256.txt (937))"
b['updated'] = "2026-10-24 (B round 124 result / round 125 plan, D-29z90)"
json.dump(b, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('recs', len(recs), 'dlp', len(b['deferred_low_polish']), 'open', len(b['open_findings']))
