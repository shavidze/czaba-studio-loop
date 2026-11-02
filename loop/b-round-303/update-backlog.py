import json, sys
P = sys.argv[1]
b = json.load(open(P))
ADDED = "2026-11-02 B round 303 -> 304 planning"
def dlog(i, text):
    b['decisions_log_b'].append({"id": i, "date": "2026-11-02", "text": text})
if 'D-29z793' in {d['id'] for d in b['decisions_log_b']}:
    print('already applied'); sys.exit(0)
b['version'] += 1
b['updated'] = "2026-11-02T B round 303 -> 304 planning"
b['current_task'] = "Round 304: PERF-3c (zoom harness rows in/out/Ctrl+wheel with 30 clips + recorded PERF-3 exit decision; perf/** + docs only) on 53fc8df"
for r in b['rounds']:
    if r.get('round') == 303:
        r['status'] = "c_pass_published (D-29z793): C round 303 PASS (H-FIRST-ENTER, H-SECOND, H-FIRST-DROP, H-SEED, H-UNDO, H-RELOAD, H-VIDEO-FIRST, H-BEHAVIOUR, H-BOX, H-SR, H-BUDGET, H-JOURNEY, RV-EN, G303-AUTH both viewports + SOURCE-SCOPE/CLAIMS/DOC; 0 bugs; browserVerified/realVerified true; 1 row BLOCKED backend unavailable in cloud: purchased first add). Gate 303 published 53fc8dfe371f362fcc2b76ef74a8029c1d6dcd42 on both remotes"
b['rounds'].append({"round": 304, "task": "current-task.md", "decision": "D-29z795..D-29z798",
    "type": "PERF-3c: measureZoomPath(in/out) + measureZoomWheel with 30 clips (Event Timing per key, LoAF, commits, waveform d rewrites, ruler mutations), deterministic asserts in==0/out==60/wheel==60 path rewrites + live rows, wall-clock record; EXIT decision row by C; doc 222 new, docs 212/213 stage-complete lines",
    "status": "dispatched", "note": "baseline HEAD 53fc8df clean; frozen b-round-303-r304-tree-sha256.txt (1173); claims b-round-303/claims-304.sh; no app/** change; 5 modified + 2 new (+1 optional) paths", "added": ADDED})
pd = b['post_current_stage_queue'][6]
for s in pd['stages']:
    if s.get('id') == 'NAME-AND-HINT-b':
        s['status'] = "done (D-29z793): C round 303 PASS browserVerified true; gate 303 published 53fc8df | " + s['status']
    if s.get('id') == 'NAME-AND-HINT':
        s['status'] = "done (D-29z793): stages a (302, 1fd0129) and b (303, 53fc8df) C PASS with browser, doc 221 Completed | " + s['status']
pd['status'] = "in_progress (D-29z793): FIX-PD-1a..1c, STUDIO-LINK, NAME-AND-HINT done; remaining from the review: STEM-LANES (after STUDIO-PERFORMANCE), SRW-21-PLAN (parallel), STORE-3/4 acceptance additions, COPY-PD, F12 deferred Lows, SR items | " + pd['status']
dlog('D-29z793', "Round 303 NAME-AND-HINT-b closed on independent C evidence: c-round-303.json PASS (all H-* rows at 1440x900 and 1280x720, RV-EN, G303-AUTH 2nd valid run, SOURCE-SCOPE, CLAIMS, DOC, C re-run of NB1-NB9+NB4b and the 12 collision rows), 0 bugs, browserVerified/realVerified true; 1 row BLOCKED backend unavailable in cloud. Gate 303 published 53fc8df on both remotes (review 9/10, no blocker). NAME-AND-HINT-b and NAME-AND-HINT -> done. K9/K10 ruling: C's reading confirmed - content-equal, the +1 line shift is forced by byte-equal grant 2 (B's own task contradiction; A's STOP was correct). Standing rule from now on: a line-number claim on a file a grant edits is compared by content after the change. Baseline for round 304 = 53fc8df (B re-checked HEAD, clean tree).")
b['open_findings'].append({"id": "SABA-Q-NAME-HINT-KEYBOARD", "severity": "info", "status": "awaiting_user (D-29z794)", "origin": "gates/round-303/review.md finding 1 (Low)",
    "text": "The one-time hint 'Drag a clip by its name bar to move it.' also shows after an Enter add, where the user may be on the keyboard. A keyboard move exists: Nudge the selection with Left/Right arrows (shortcut sheet entry 'nudge', app/lib/arrangement/shortcuts.ts l.106 at 53fc8df). Question for Saba: keep his verbatim sentence for every add (default), or append 'or nudge with ← / →' on the Enter path? Copy change only; asked once with SABA-Q-NAME-HINT-LIFETIME.",
    "evidence": "gates/round-303/review.md; c-round-303.md H-SR", "added": ADDED})
b['deferred_low_polish'].append({"id": "GATE303-L1-HINT-KEYBOARD", "severity": "low", "status": "deferred (D-29z794); copy waits for SABA-Q-NAME-HINT-KEYBOARD",
    "origin": "gate 303 reviewer finding 1", "title": "Name-bar hint describes only a mouse drag, also after an Enter (keyboard) add",
    "evidence": "gates/round-303/review.md finding 1", "repro": "fresh /studio-lab, focus the library, Enter -> status ends 'Drag a clip by its name bar to move it.'", "added": ADDED})
b['deferred_low_polish'].append({"id": "GATE303-L2-FIRST-ADD-HELPER", "severity": "low", "status": "deferred (D-29z794)",
    "origin": "gate 303 reviewer finding 2 + Architecture note signal 3 + A round 303 reviewer Lows (naming withNameBarHint, NB9 duplicates ST10)",
    "title": "Test maintenance: the first-add expected-status helper exists 3 times (firstAddStatus in grid-snap-loop-drop and status-lifetime, firstPlacedText in tempo-seed-ui); one wording change broke 12 exact asserts in 5 files. Proposal: __tests__/helpers/status-expectations.ts expectedClipAdded({title, track, time, suffix, first}); exact equality kept; mutants m1-m5 stay red. Also rename withNameBarHint -> appendNameBarHintOnce (A reviewer).",
    "evidence": "gates/round-303/review.md; a-round-303.md Code review", "added": ADDED})
b['open_findings'].append({"id": "A-R303-INFO-RESTORED-HINT", "severity": "info", "status": "recorded (D-29z794)", "origin": "A round 303 code-reviewer Low",
    "text": "After an edit-during-gesture refusal, statusAfterGestureRelease restores lastNonRefusalStatusRef; if that was the first-add text, the hint text reappears as restored text (not a new hint). Not reproduced in the browser by C; consistent with the restore contract. Also pre-existing: both add paths ignore applyEdit's boolean (cannot be false today). Re-check only if Saba changes the hint lifetime.",
    "evidence": "a-round-303.md; c-round-303.md 'For B'", "added": ADDED})
b['open_findings'].append({"id": "INFO-C303-WAV-PEAK", "severity": "info", "status": "recorded (D-29z794)", "origin": "C round 303",
    "text": "Journey WAV peak 1.0 at 24-bit: 30 isolated full-scale samples in 9,729,792 (3e-6, runs of 1) on the single unmoved Middle East clip - a source normalised to 0 dBFS, not sustained clipping. Pre-existing; relates to the older product question C-R178-EXPORT-CLIPS-AT-0DB.",
    "evidence": "c-round-303/peak.json", "added": ADDED})
for req in b.get('architecture_checkpoint_requests', []):
    if req.get('id') == 'ARCH-CHECKPOINT-STUDIO-LINK':
        req.setdefault('signals', []).append('GATE303-ARCH-STATUS-EXPECTATIONS')
        req['note_d29z794'] = "NAME-AND-HINT boundary input added: gate 303 Architecture signal 3 (exact clip-added status text shared by many tests; shared status-expectations helper, test-only). Keep verdict for nameBarHintShownRef in ArrangementContext (gate reviewer signal 4) recorded. Still non-blocking; no second request filed."
dlog('D-29z794', "Round 303 findings triaged: gate L1 (hint names only a mouse action after an Enter add) -> SABA-Q-NAME-HINT-KEYBOARD awaiting_user (nudge ← / → exists, shortcuts.ts l.106) + deferred Low GATE303-L1-HINT-KEYBOARD; gate L2 + Architecture signal 3 + A reviewer naming/NB9 Lows -> one deferred Low GATE303-L2-FIRST-ADD-HELPER and signal GATE303-ARCH-STATUS-EXPECTATIONS appended to ARCH-CHECKPOINT-STUDIO-LINK; A reviewer restored-hint Low and pre-existing applyEdit boolean -> info A-R303-INFO-RESTORED-HINT; INFO-C303-WAV-PEAK recorded. No Critical/High/Medium: round 304 = PERF-3c as planned.")
sp = b['post_current_stage_queue'][7]
for s in sp['stages']:
    if s.get('id') == 'PERF-3c':
        s['status'] = "dispatched round 304 (D-29z796): harness rows + recorded exit decision; the exit fix moved to PERF-3d (D-29z795) | " + s['status']
        s['what'] = "perf harness rows for zoom with 30 clips in both directions (in-first and out-first) plus Ctrl+wheel: Event Timing keydown max/median per path, LoAF max, commits per key, waveform d rewrites (assert in==0, out==60, wheel==60), ruler mutations, live rows; res.dom.ruler-1/2 notes; EXIT decision row (C) against p95 < 50 ms and <= 1 commit per step; doc 222 new, docs 212/213 stage-complete"
    if s.get('id') == 'PERF-3':
        s['status'] = "in_progress (D-29z795): 3a/3b done; 3c dispatched round 304 (harness + exit decision); exit NOT met at HEAD on band-crossing keys -> PERF-3d (fix) after RETRO 305 | " + s['status']
ids = [s.get('id') for s in sp['stages']]
if 'PERF-3d' not in ids:
    sp['stages'].insert(ids.index('PERF-3c') + 1, {"id": "PERF-3d", "status": "not_started (queued D-29z795; round 306 after RETRO 305 unless a Medium+ comes first)",
        "what": "band-crossing fix so zoom meets the PERF-3 exit (keydown p95 < 50 ms with 30 clips in both directions, <= 1 commit per step; Ctrl+wheel crossing LoAF in the same class). HEAD (53fc8df) measurement by B: out-first key 3 = 56 ms, key 8 = 80-88 ms, wheel step 7 LoAF 75-76 ms; each crossing rewrites 30 waveform paths (b-round-303/probe/*.json). Cost per performance-optimizer: buildPeakShape x30 with toFixed(3) strings (~3 MB of path text) plus SVG re-parse. Options to measure first: (a) integer heights in a scaled viewBox (smaller strings, same pixels; WAVE-PIXELS re-check); (b) a per-source shape cache (flatters Ctrl+D copies). Rejected: deferring the swap with startTransition/useDeferredValue (adds a second commit, breaks <= 1 commit per step). B consults performance-optimizer and tech-lead again with PERF-3c's LoAF numbers.",
        "added": ADDED})
sp['status'] = "in_progress (D-29z795): PERF-3c round 304 (harness + exit decision), PERF-3d after RETRO 305 | " + sp['status']
sp['consults_round_304'] = {"performance-optimizer": "in path never crosses the 25 px/s band (40 -> 122 px/s); out path crosses on keys 3 and 8; add both directions; ms rows record (n=10 makes p95 = max; 8 ms granularity); assert deterministic rows (commits, d rewrites); Ctrl+wheel via keyboard.down + mouse.wheel, record wheel->paint/LoAF/rewrites; band cost = buildPeakShape x30 + 3 MB path text; fix options (a) integer path / (b) shape cache; deferring the swap breaks <=1 commit", "tech-lead": "separate measureZoomPath, keep existing measureZoom rows byte-identical, new id prefix, 1x only (no .6x rows), wheel last after 'stop with 30 clips' (scrollLeft), MutationObserver in its own perf/lib module switched on only around zoom, filter d writes to the waveform testid, ruler via a stable ancestor + closest; close 3c as measurement-only and open PERF-3d; docs 212/213 Completed as stages; new doc 222; architecture debt: per-spec report builders and hand-copied budget rows", "B_ruling": "tech-lead suggested asserting in-first p95 < 50; B keeps every wall-clock row record (performance-optimizer + advisor: shared runner, n=10 max) and makes the 50 ms target an EXIT decision row by C; the asserts are deterministic only (D-29z796)"}
dlog('D-29z795', "PERF-3 exit measured by B at HEAD 53fc8df (production build, Chromium, 30 clips, 2 runs x 1440/1280; b-round-303/probe/*.json, zoom-probe.cjs, zoom-probe-realwheel.cjs): in-first keys 16-24 ms, 0 waveform rewrites; out-first key 3 = 56 ms and key 8 = 80-88 ms (30 d rewrites each, LoAF 50-82); real Ctrl+wheel out-first step 4/7 crossings with 30 rewrites each, LoAF 75-76 on step 7 (wheel->2rAF includes ~65 ms CDP round trip, so not used). The exit target (p95 < 50 ms with 30 clips) is NOT met on band-crossing keys. PERF-3 gets a fourth stage PERF-3d (the fix); PERF-3c stays one stage: harness rows + recorded exit decision. Exit criterion unchanged from perf-plan l.29; it is operationalised as the per-key Event Timing max (n=10 => percentile 0.95 is the max) as the median of 3 runs, both directions.")
dlog('D-29z796', "PERF-3c rulings: new functions measureZoomPath(in/out) and measureZoomWheel (wheel last, after stop with 30 clips), 1x only, existing measureZoom rows byte-identical; new perf/lib/zoom-probe.ts MutationObserver only around zoom (waveform-testid d writes; ruler childList via stable ancestor); units reuse exact 'count' and 'commits / key' (no determinism.ts change); asserts: path-rewrites in==0 / out==60 / wheel==60 and live rows; wall-clock rows record; EXIT decision row by C; res.dom.ruler-1/2 notes; doc 222 new, docs 212/213 l.4 'Completed (PERF-3x stage; ...; PERF-3 exit -> doc 222)'. Mutants m1-m4. Consults: performance-optimizer, tech-lead (consults_round_304); advisor consulted.")
b['open_findings'].append({"id": "B-R303-PERF-HARNESS-METRIC-FAMILY", "severity": "info", "status": "architecture signal (D-29z797), non-blocking",
    "origin": "tech-lead consult round 304 planning", "text": "Each of the three ~800-line perf specs has its own report builder, writer and table printer; adding one metric family touches the spec, the budgets JSON (.6x rows copied by hand) and sometimes determinism.ts + report.test.ts. Debt, not a reason to refactor now (line count alone is not a reason). Input for a future perf-harness checkpoint.",
    "evidence": "b-round-303.md section 3", "added": ADDED})
dlog('D-29z797', "Architecture signal B-R303-PERF-HARNESS-METRIC-FAMILY recorded (tech-lead); round 304 keeps the zoom probe in its own lib module, no refactor.")
dlog('D-29z798', "Round 304 dispatched: PERF-3c on 53fc8df. Not a REGRESSION round (regression-last 2026-11-02, next due 2026-11-05). RETRO = round 305 (window 290-304). PERF-3d planned for round 306. ARCH-CHECKPOINT-STUDIO-LINK still unanswered and non-blocking.")
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
