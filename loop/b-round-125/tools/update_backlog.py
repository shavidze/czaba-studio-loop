import json, sys
path, cpath = sys.argv[1], sys.argv[2]
b = json.load(open(path, encoding='utf-8'))
c = json.load(open(cpath, encoding='utf-8'))
assert c['round'] == 125 and c['taskStatus'] == 'PASS' and c['browserVerified'] and c['realVerified'] and c['allRowsRan'] and c['partComplete'] and not c['sectionsSpilled'] and not c['failed']
ids_of = lambda lst: {e.get('id') for e in lst}
if b.get('baseline_tree_at_round126'):
    print('already'); sys.exit(0)

DEFER = "user decision 2026-10-23: open Lows no longer block T12/VISUAL-A; fixed in one polish pass after VISUAL-A-OBSIDIAN and before release; final acceptance still requires every one fixed and C-verified"
bug = next(x for x in c['bugs'] if x['id'] == 'DUX-B-1')
assert bug['severity'] == 'low'
if 'DUX-B-1' not in ids_of(b['deferred_low_polish']):
    b['deferred_low_polish'].append({
        "id": "DUX-B-1", "severity": "low", "status": "open",
        "title": "text-dim informational text is below 4.5:1: 3.67:1 on the surface (pixel-confirmed) and 3.08:1 on the selected library row; all 53 dim elements (hint line, detail-panel labels, library counts, video captions) fail; selected-row muted meta 4.38:1",
        "expected": bug['expected'], "contract": bug['contract'], "actual": bug['actual'],
        "evidence": "c-round-125.json bugs; " + bug['evidence'],
        "repro": "; ".join(bug['steps']),
        "links": ["VISUAL-A-OBSIDIAN V-1 (dim token #8A8276 in visual-direction-a.md)", "RV-2", "DESIGN-UX-REVIEW D6b"],
        "expected_closure": "expected to close in VISUAL-A V-1 (scoped dim token) and be verified by RV-2 against c-round-125/out/contrast-baseline.json on the same elements; stays in this list until C verifies >= 4.5:1 on those elements (not double-scheduled)",
        "regression": "no (first measurement)", "deferred_reason": DEFER,
        "deferred_round": "B round 125 -> 126 planning (2026-10-24)"})

AUTH = "user request 2026-10-23 (design and comfort review): nothing from section 4 is implemented without Saba; any layout move or behaviour change needs his approval in user-review/design-ux-decisions.md; approved purely visual ideas join VISUAL-A stages, approved layout/behaviour ideas become bounded tasks after VISUAL-A"
NOTBUG = "a recommendation, not a DUX-B; the 2026-10-23 bug gate does not apply; priority is C's suggestion for Saba, not a scheduling order"
xl = {"DUX-R-1": ["TRACK-VOLUME-NUMERIC-FIELD (signal; ruled a deliberate difference for the narrow header - routed to Saba, ruling not reversed)", "ABL-R-14", "SRW-13", "T12-GAIN-VOLUME"],
      "DUX-R-2": ["SHIFT-FINE-DISCOVERABILITY", "WAVEFORM-ZOOM-DISCOVERABILITY", "R77-BUTTON-SHORTCUT-SUPERSET (C round 125 D2 cite)"]}
recs = b['design_ux_recommendations']
for r in c['recommendations']:
    if r['id'] in ids_of(recs): continue
    e = dict(r)
    e.update({"status": "awaiting_user", "source": "C round 125 DESIGN-UX-REVIEW part 1 (c-round-125.json recommendations; user-review/design-ux-review.md section 5)", "authority": AUTH, "not_a_bug": NOTBUG, "links": xl.get(r['id'], [])})
    recs.append(e)

for f in b['open_findings']:
    fid = f.get('id')
    if fid == 'TRACK-VOLUME-NUMERIC-FIELD':
        f['status'] = "scored in DESIGN-UX-REVIEW part 1 (C round 125 D1 T8: -3 dB on a lane = 30 x Down or ~45 px Shift-drag; Live 42.6 F types a value) -> DUX-R-1 awaiting_user; the deliberate-difference ruling stands until Saba decides"
    elif fid == 'SHIFT-FINE-DISCOVERABILITY':
        f['status'] = "scored in DESIGN-UX-REVIEW part 1 (C round 125 D2 undiscoverable list) -> DUX-R-2 awaiting_user"
    elif fid == 'WAVEFORM-ZOOM-DISCOVERABILITY':
        f['status'] = "signal for DESIGN-UX-REVIEW part 2 (D3); related DUX-R-2 (awaiting_user); not scheduled"

new_info = [
    ("C-R125-OBS-CTRL-ALT-PASTE-SPLIT", "Ctrl+Alt+V pastes and Ctrl+Alt+E splits: the Ctrl-letter branches do not exclude Alt; on Windows AltGr = Ctrl+Alt, so an AltGr character could trigger an edit", "observation (no CZABA contract); judged in DESIGN-UX-REVIEW part 2 (round 126 D3); not a bug yet", "c-round-125.json shortcuts.conflicts / notesForB"),
    ("C-R125-OBS-1280-SFX-LANE-UNDER-PANEL", "at 1280x720 with the detail panel expanded the SFX lane (with the selected clip) sits behind the detail panel; right-clicks there hit the panel", "round 126 D3 must apply the pre-ruled discriminator (current-task.md section 3 D3-A): reachable by scroll/keyboard -> friction (Low / DUX-R); unreachable by mouse in a common flow -> Medium DUX-B -> bounded fix-up before V-0", "c-round-125/shots/D6-S1-1280.png, D2-menu-clip-1280.png (B opened D6-S1-1280: only the top edge of the SFX lane shows above the panel)"),
    ("C-R125-OBS-VOLUME-DEADZONE-6PX", "Volume fader: a 6 px drag does nothing (dead zone); 30 px = -19.8 dB (0.66 dB/px on a 91 px fader); Shift gives 1/10", "data for DESIGN-UX-REVIEW part 2 (D3 feedback/precision); not a bug", "c-round-125.json notesForB"),
    ("C-R125-OBS-S1-FULL-SCALE", "the S1 fixture export has 159 full-scale samples in the 4 s range (hero + pulse summed at 0 dB)", "data (C-R86-OBS-DEFAULT-OVERLOAD class); relevant to T12-ADVANCED meters/RMS; not a bug", "c-round-125.json notesForB"),
    ("C-R125-HARNESS-OVERWRITE", "a d2 redo run overwrote the main evidence file; main groups were re-run (out/d2/d2-1440-main.json)", "applied as a harness rule from round 126: every run writes a uniquely named output (run id or UTC stamp); never reuse a main evidence file name", "c-round-125.md notes"),
]
for fid, title, st, ev in new_info:
    if fid not in ids_of(b['open_findings']):
        b['open_findings'].append({"id": fid, "severity": "info", "status": st, "title": title, "evidence": ev, "source": "B round 125 -> 126 planning"})

q = {e['id']: e for e in b['post_current_stage_queue']}
vis = q['VISUAL-A-OBSIDIAN']
vis['status'] = "in_progress: step 1 DESIGN-UX-REVIEW part 1 done round 125 (C PASS browserVerified=true, partComplete=true; D-29z90), part 2 = round 126 (D-29z91; C-only); V-0 after the review"
vis['design_ux_review_split_d29z90']['part1_result_round125'] = {
    "c": "c-round-125.json / c-round-125.md", "review": "user-review/design-ux-review.md (sections 1-3, 6-8 written; 4-5 part 2)",
    "taskStatus": "PASS", "browserVerified": True, "realVerified": True, "allRowsRan": True, "partComplete": True, "sectionsDone": c['sectionsDone'], "sectionsSpilled": [],
    "scorecard": "11 tasks: equal T1-T6, T9, T11; CZABA easier T10; Live easier T8 lane Volume; T7 and T8 Clip Gain not comparable (Live ?)",
    "shortcuts": c['shortcuts'] and {k: c['shortcuts'][k] for k in ['same', 'different', 'missing', 'czabaOnly', 'notApplicable']},
    "bugs": "DUX-B-1 (Low) -> deferred_low_polish", "recommendations": "DUX-R-1, DUX-R-2 -> design_ux_recommendations (awaiting_user)",
    "b_spot_checks": "WAV headers: project 7217877 frames 48 kHz/24-bit/2 ch at both viewports, range 192000 frames (4.000 s); contrast-baseline byToken.text-dim 53/53 fail 3.08-3.67; g125-3.json 401 + Sign in required + 0 audio[src]; bbox/contrast/under24 files labelled 'pre-V-0 baseline (608187f)'; screenshots D6-S1-1280.png and D2-hint-1440.png opened and match C's text"}
for a in vis.get('acceptance', []):
    if a['id'] == 'RV-1':
        a['baseline'] = "captured (pre-V-0 baseline (608187f), C round 125): tmp/studio-real-loop/c-round-125/out/bbox-baseline-1280.json and bbox-baseline-1440.json, states S0/S1/S2 with written S1 setup steps, determinism 0 px max in all six states. Frozen input: do not rewrite. V-0 acceptance proves only text widths moved; the last V-0 round re-captures bbox-baseline-{1280,1440} as the RV-1 reference for V-1..V-3."
    if a['id'] == 'RV-2':
        a['baseline'] = "captured (pre-V-0 baseline (608187f), C round 125): tmp/studio-real-loop/c-round-125/out/contrast-baseline.json (composited surfaces + 120 pixel samples) and under24px.json. Baseline shows text-dim 53/53 below 4.5 (3.08-3.67) = DUX-B-1; RV-2 at V-1 must show >= 4.5:1 on those same elements. Frozen input: do not rewrite."
vis['design_ux_review_split_d29z90']['part2_round126_rules_d29z91'] = [
    "roles: design-philosopher and design-auditor named explicitly in addition to flow-sage, first-visit-host, accessibility-auditor, ableton-arrangement-expert; C states how each was used",
    "pre-ruled discriminator for C-R125-OBS-1280-SFX-LANE-UNDER-PANEL (reachable -> friction; unreachable by mouse in a common flow -> Medium DUX-B)",
    "DUX-R ids continue from DUX-R-3; every idea states fitsVisualA",
    "D5 adds a final verdict block above the part-1 preliminary bullets; sections 2, 3 and 7 are not rewritten"]

for r in b['rounds']:
    if r.get('round') == 125:
        r['status'] = 'completed'
        r['result'] = "C PASS browserVerified=true realVerified=true allRowsRan=true partComplete=true; D6/D1/D2 done, 0 spilled; DUX-B-1 Low -> deferred_low_polish; DUX-R-1/2 awaiting_user; A no-op OK; SOURCE-SCOPE start/end OK (608187f, 937); G125-3 OK (fake-Bearer 403 blocked: backend unavailable in cloud); gate 125 skipped (no real changes)"
if not any(r.get('round') == 126 for r in b['rounds']):
    b['rounds'].append({"round": 126, "task": "current-task.md", "decision": "D-29z91", "status": "dispatched", "items": ["VISUAL-A-OBSIDIAN / DESIGN-UX-REVIEW"], "note": "DESIGN-UX-REVIEW part 2 (D3 friction points, D4 'better than Ableton' DUX-R from 3, D5 final verdict + index). C-only review; A no-op; no store diff expected; baseline 608187f, frozen b-round-125-r126-tree-sha256.txt (937). Outcome table in current-task.md section 7."})
b['baseline_tree_at_round126'] = {"head": "608187fdf279d9b579c279f3c536b27be74c0eea", "working_tree": "clean (git status --porcelain empty at B round 126 planning 2026-10-24 ~04:20Z); gate 125 skipped (no real changes), gate 122 published 608187f", "frozen_list": "tmp/studio-real-loop/b-round-125-r126-tree-sha256.txt", "entries": 937, "identical_to": "b-round-124-r125-tree-sha256.txt (cmp OK)", "excluded": [], "new_files_granted": []}
b['current_task'] = "current-task.md (round 126: D-29z91 - DESIGN-UX-REVIEW part 2, VISUAL-A-OBSIDIAN step 1, C-only review round; A no-op; C writes D3 friction points, D4 'better than Ableton' DUX-R from 3, D5 final verdict + index into tmp/studio-real-loop/user-review/design-ux-review.md + c-round-126.json/md; baseline clean 608187f; frozen b-round-125-r126-tree-sha256.txt (937))"
b['updated'] = "2026-10-24 (B round 125 result / round 126 plan, D-29z91)"
json.dump(b, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('dux recs', len(recs), 'dlp', len(b['deferred_low_polish']), 'open', len(b['open_findings']))
