import json, sys
p = sys.argv[1]
b = json.load(open(p))
b['updated'] = '2026-10-23 (B round 118 result / round 119 plan, D-29z84)'
b['current_task'] = ("current-task.md (round 119: D-29z84 - C-R118-01 fix-up: clip-gain-fader CF11 l.501 toBe(-1.2) -> toBe(-1) "
  "(B spec defect: Master fine value snaps to MASTER_GAIN_STEP_DB 0.5); doc 101 l.4/50/66/70 and doc 100 l.69 status lines; "
  "m5 re-run; baseline 9cb820b + round-118 working tree (8 M + 2 ??); frozen b-round-118-r119-tree-sha256.txt (929, incl. untracked group-volume-db.test.tsx))")
b['advisor_used_by_B'] += " | round 118 planning (round 119 task): advisor available and consulted before writing (2026-10-23)"
t = b['post_current_stage_queue'][0]
assert t['id'] == 'T12-GAIN-VOLUME'
t['status'] = ("in_progress (stages 1, 2, 3a c_pass_published: 38c0e21, d5de68f, 9cb820b; stage 3b browser-verified in round 118 "
  "(c-round-118.json: all browser rows PASS, browserVerified=true) but C FAIL on T118-TARGETED 451/452 (C-R118-01, B test pin) -> fix-up round 119 (D-29z84); stage 4 not_started)")
for s in t['stages']:
    if s.get('stage') == '3b':
        s['status'] = 'bug (test pin only) - fix-up round 119'
        s['evidence'] = ("c-round-118.json FAIL only on T118-TARGETED 451/452 (CF11 l.501 B pin -1.2 vs app -1; Master step 0.5); "
          "23 rows passed incl. GV-PRESENT/DRAG/INF/DBL, SH-LANE/GROUP/MASTER/MID, NB-PAN/CLIP, G-GROUP-T3 ratio 0.501187 (0.000 %), "
          "G-GROUP-INF 0 non-zero samples, GV-PLAY 37.50 dB drop / 0 sources, TV-ANCHOR; browserVerified=true realVerified=true; gate 118 skipped")
t['t12_rulings_round119_planning'] = ("D-29z84: C-R118-01 is a B spec defect (round-118 section 2.1 formula omitted MASTER_GAIN_STEP_DB 0.5; "
  "relativeFaderValue rounds -1.2 to -1); ruling CF11 l.501 toBe(-1); A's m5 (-12 without fineDivisor) and C SH-MASTER (-2.5 vs -27.5) prove the fine path. "
  "Regression round not due (2026-10-23 22:12 UTC, 2 days); first planning on/after 2026-10-24 UTC is the REGRESSION round, then stage 4. "
  "A TV11 pre-check outcome (a): no A-R118-TV11-ANCHOR finding (C TV-ANCHOR PASS confirms).")
r118 = [r for r in b['rounds'] if r.get('round') == 118][0]
r118['status'] = 'c_fail (T118-TARGETED 451/452 only: C-R118-01 B test pin; every browser row PASS, browserVerified=true); gate 118 skipped'
b['rounds'].append({"round": 119, "task": "current-task.md", "decision": "D-29z84", "status": "dispatched",
  "items": ["C-R118-01", "T12-GAIN-VOLUME stage 3b (publication unit 118+119)", "A-R118-REVIEW-DOC100-L69"],
  "note": "Fix-up: A owns clip-gain-fader.test.tsx l.501 only (toBe(-1)), doc 101 l.4/50/66/70, doc 100 l.69. Every app file frozen (round-118 changes included). "
          "C: T119-TARGETED 452/452, AN-REVIEW (revert-copy sha 261472d6), SOURCE-SCOPE (frozen 929), SH-MASTER + GV-DRAG both viewports, G119-3, PX-NET/REG-HYD; other round-118 rows carried. Rounds 118+119 publish together."})
b['baseline_tree_at_round119'] = {"head": "9cb820b6f7e5f9f44d1c651954d30ebf4f83be9f",
  "working_tree": "round-118 end state: 8 M + 2 ?? (git status --porcelain md5 554bfcc89afd451f279ac4436c37bf74); gate 118 skipped",
  "frozen_list": "tmp/studio-real-loop/b-round-118-r119-tree-sha256.txt", "entries": 929,
  "included_untracked": ["app/lib/arrangement/__tests__/group-volume-db.test.tsx (5168160d...)"],
  "excluded": ["app/lib/arrangement/__tests__/clip-gain-fader.test.tsx (l.501; pre 261472d6d911226b2b74c5d997be003ad8b7f965a124b79dfa6f961439142bad)",
               "docs/implementation/2026/quarter-IV/101-studio-group-volume-db-shift-fine.md (l.4/50/66/70; pre f910ed7b2f923395fc00af7d1bc794e9d625a3a3c244dca122ea2ed462af74f9)",
               "docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md (l.69; pre 5912f18f7c1aed3f35b04676611ebaece65a276e31edc3f5ac5c29c5e15f110b)"],
  "protected": {"app/routes/studio.$productId.tsx": "fa2cf0bc", "app/routes/api.studio-token.ts": "13914809", "app/lib/auth.ts": "56f5b76f", "app/contexts/AuthContext.tsx": "bf9ee257"}}
of = b['open_findings']
ids = {i.get('id'): i for i in of}
ids['GATE117-S1-DOC100-STALE']['status'] = 'done in tree (C round 118 DOC-100/101 PASS: doc 100 l.4/56/70 as granted); publishes with rounds 118+119'
ids['C-R86-OBS-DEFAULT-OVERLOAD']['note_round118'] = ("merged OBS-R118-DEMO-OVER (c-round-118.json): Master 0 dB, music muted, stems + SFX at 4.0-4.6 s peak +1.48 dBFS live, SFX meter 0; "
  "export at Master -12 peaks -10.52 dBFS (consistent). Existing gain staging, not caused by round 118; signal for gain-staging/over-indicator, not scheduled")
ids['ARCH-CHECKPOINT-PHASE1-BOUNDARY']['status'] += " | round 119 planning: A round-118 reviewer Architecture note repeats addendum (ac) (start capture + stored<->slider mapping copied in ArrangementLane.tsx and ArrangementGroupHeader.tsx; keep; one bounded hook task later); no new addendum; still unanswered"
if 'ARCH-R117-HOOK-SLIDER-MAPPING' in ids:
    ids['ARCH-R117-HOOK-SLIDER-MAPPING']['note_round118'] = "A round-118 reviewer repeated it (second word-for-word copy in ArrangementGroupHeader.tsx l.83, 102-133); verdict keep; = addendum (ac)"
new = [
 {"id": "C-R118-01", "severity": "low", "status": "dispatched round 119 (D-29z84) - blocks publication (red test fails the gate's full vitest); NOT deferred_low_polish",
  "to": "B", "title": "CF11 l.501 pins the fine Master value at -1.2 while the app gives -1 (Master step 0.5); targeted vitest 451/452",
  "evidence": "c-round-118.json bug; c-round-118/out/vitest-targeted.log; a-round-118.md STOP; c-round-118/out/ui-1440-2.json SH-MASTER",
  "repro": "npx vitest run app/lib/arrangement/__tests__/clip-gain-fader.test.tsx",
  "root_cause": "B round-118 section 2.1 formula omitted MASTER_GAIN_STEP_DB (B defect, not A's)"},
 {"id": "A-R118-REVIEW-DOC100-L69", "severity": "low", "status": "dispatched round 119 (doc 100 l.69 grant); l.13 kept as round-117 history (acknowledged)",
  "title": "doc 100 l.69 TODO still lists 3b as future work; l.13 describes the round-117 state", "evidence": "a-round-118.md code-reviewer Low"},
 {"id": "MASTER-FINE-STEP", "severity": "info", "status": "signal for ABLETON-EXPERT-REVIEW (not scheduled; not requested)",
  "title": "Shift fine on Master still snaps to the 0.5 dB Master step (fine = 10x travel per step, not 0.05 dB resolution); Live behaviour unconfirmed",
  "evidence": "c-round-118.json SH-MASTER (-2.5 vs theory -2.75); ArrangementMaster.tsx l.25"},
 {"id": "SHIFT-FINE-DISCOVERABILITY", "severity": "info", "status": "signal for DESIGN-UX-REVIEW (shortcut discoverability is in its scope; not scheduled)",
  "title": "Shift fine drag on Volume faders has no tooltip or hint", "evidence": "a-round-118.md code-reviewer Low"},
 {"id": "A-R118-REVIEW-GV-HALVES", "severity": "info", "status": "acknowledged (the move-and-return half of GV4 and the -inf text of GV3 discriminate; m2 turns GV4 red)",
  "title": "the first half of GV4 and GV3's stored 0 also pass on the pre-round code", "evidence": "a-round-118.md code-reviewer Low"},
 {"id": "C-R118-OBS-GV-INF-METER-BALLISTICS", "severity": "info", "status": "acknowledged (B accepts C's reading: 'meters stay silent' = no signal; meters fall at METER_RELEASE_DB_PER_SECOND 20, output exactly 0 from +150 ms)",
  "title": "after the group goes to -inf during play the member meters fall at the 20 dB/s release instead of jumping to -inf", "evidence": "c-round-118.json observations; c-round-118/out/gplay-1440-3.json"},
 {"id": "B-R118-UM9-ROW-WORDING", "severity": "info", "status": "acknowledged (B spec imprecision; C tested both cases: group fader stays visible and focused; member lane fader -> focus to arrangement-group-name; PASS)",
  "title": "round-118 neighbour row 'U with the group fader focused -> focus to the group name, as in UM9' misdescribed UM9", "evidence": "c-round-118.md Notes for B"},
 {"id": "ENV-FIRST-LOAD-GRID-NULL", "severity": "info", "status": "watch (second occurrence: rounds 117 and 118; likely first Vite load; harness: discard the first setup run if it crashes before the grid control exists)",
  "title": "first /studio-lab load of a job crashes the C setup (grid control null); run 2 valid", "evidence": "c-round-118/out/ui-1440-1-envfail.log"},
]
existing = set(ids)
for n in new:
    assert n['id'] not in existing, n['id']
    of.append(n)
for x in b['deferred_low_polish']:
    if x.get('id') == 'GATE117-S3-START-REF-NOT-CLEARED':
        x['note_round118'] = 'round 118 added the same never-cleared volumeGestureStartRef in ArrangementGroupHeader.tsx (doc 101 problem 3); fix both copies in the polish pass'
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', len(of), len(b['deferred_low_polish']))
