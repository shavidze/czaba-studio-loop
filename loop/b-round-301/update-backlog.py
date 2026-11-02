import json, sys
P = sys.argv[1]
b = json.load(open(P))
ADDED = "2026-11-02 B round 301 -> 302 planning"
def dlog(i, text):
    b['decisions_log_b'].append({"id": i, "date": "2026-11-02", "text": text})
ids = {d['id'] for d in b['decisions_log_b']}
if 'D-29z781' in ids:
    print('already applied'); sys.exit(0)

b['version'] = b['version'] + 1
b['updated'] = "2026-11-02T B round 301 -> 302 planning"
b['current_task'] = "Round 302: NAME-AND-HINT-a (Q4: one product name, CZABA Studio) on aa7a6ef; NAME-AND-HINT-b (Q5 one-time hint) = round 303"

# Round 301 close-out
for r in b['rounds']:
    if r.get('round') == 301:
        r['status'] = "c_pass_no_source_change (D-29z781): C round 301 PASS 133 rows, 0 failed, 0 inconclusive, browserVerified/realVerified true, 7 blocked (backend unavailable in cloud), 1 Low C-R301-01; gate 301 skipped (no real changes, head aa7a6ef) | " + r['status']
b['rounds'].append({"round": 302, "task": "current-task.md", "decision": "D-29z785..D-29z786",
    "type": "NAME-AND-HINT-a: Q4 one product name 'CZABA Studio' (Studio title + h1, home h2 + mockup, checkout success step) + repo-scan guard test",
    "status": "dispatched", "note": "baseline HEAD aa7a6ef clean; frozen b-round-301-r302-tree-sha256.txt (1170); claims b-round-301/claims-302.sh; 11 grants byte-equal to b-round-301/sketch-*.txt + doc 221", "added": ADDED})

for r in b['regression_rounds']:
    if r['id'] == 'REGRESSION-ROUND-2026-11-02':
        r['status'] = "completed (D-29z781): C round 301 PASS on aa7a6ef, every runnable row ran at 1440x900 and 1280x720 (133 PASS, 0 FAIL, 0 inconclusive), RR-PERF alone 3/3, RG-SMOKE 2/2, G301-AUTH 401/403 no token; 1 Low regression C-R301-01 (deferred); browserVerified/realVerified true"
b['regression_rounds'].append({"id": "REGRESSION-ROUND-2026-11-05", "round": None, "decision": "D-29z781",
    "status": "planned (due on or after 2026-11-05; regression-last = 2026-11-02 round 301)",
    "trigger": "speed rule: 3 days after regression-last",
    "template": "tasks/round-301.md (sections 2-6, which reference round 258/199) + its changed-UI facts",
    "scope_additions": [
        "items finished after round 301 (one short row each), starting with NAME-AND-HINT-a/-b when done",
        "perf oracle = c-round-301/perf/latest*.json (D-29z783)",
        "C-R301-01 is a deferred Low: record only (Tab out of a pointer-opened grid menu with no prior focus)",
        "NO-SHIFT-203 carried (needs a reference server)"],
    "added": ADDED})
dlog('D-29z781', "Round 301 REGRESSION-ROUND-2026-11-02 C PASS (c-round-301.json: 133 rows passed, 0 failed, 0 inconclusive, browserVerified/realVerified true; 7 rows BLOCKED backend unavailable in cloud; gate rows not claimed). Every runnable row ran -> regression-last.json = {date 2026-11-02, round 301}; next regression due on or after 2026-11-05 (REGRESSION-ROUND-2026-11-05 planned). Gate 301 skipped (no source change); baseline for round 302 stays aa7a6ef (gate 300 commit). A round 301 made no change (a-round-301.md).")

b['deferred_low_polish'].append({"id": "C-R301-01", "severity": "low", "status": "deferred (D-29z782)",
    "origin": "C round 301 (RV-REVEAL / grid-menu focus, C-FOCUS-242 neighbour)",
    "title": "Tab out of a pointer-opened grid menu with no prior focus lands on BODY; round 258 landed on arrangement-exit. The grid menu is now the last focusable in DOM order. Keyboard origin (Snap focused) still returns correctly.",
    "evidence": "c-round-301/tools/gridtab/gridtab.json; c-round-301/t258/logs/chrome-1440.log vs c-round-258/logs/chrome-1440.log (side-gridmenu seq)",
    "repro": "fresh /studio-lab (1440x900 or 1280x720), wait for 'Demo collection ready', nothing focused; right-click an empty SFX lane; ArrowDown; Tab -> activeElement BODY",
    "regression": "yes, last pass C round 258 (d732d26)",
    "class": "L47 (BODY is never an expected focus target)",
    "cause_hypothesis": "unconfirmed: DOM order changed after round 258 (rounds 262/263 moved Master into the footer); not probed by B",
    "related": ["C-R241-01 (closed)", "C-R242-01 (closed)", "GATE232-S1 (closed)"],
    "added": ADDED})
dlog('D-29z782', "C-R301-01 (Low, regression since round 258) -> deferred_low_polish under the 2026-10-23 bug gate: Tab out of a pointer-opened grid menu with no prior focus lands on BODY. L47 class; related closed ids C-R241-01, C-R242-01, GATE232-S1 (L7 cross-check: none reopened, none covers this origin). Cause hypothesis (DOM order after the round-262/263 master move) is unconfirmed. Not scheduled: NAME-AND-HINT does not own ArrangementGridMenu; the next RETRO (305) counts it under L47.")

b['open_findings'].append({"id": "B-R301-PERF-ORACLE-DELTAS", "severity": "info", "status": "ruled (D-29z783)", "origin": "C round 301 RR-PERF",
    "text": "PERF-1a 164 deterministic rows 0 deltas; PERF-1b-i 106 rows 0 median deltas; PERF-1b-ii 9 deterministic growth rows vs c-round-285: res.dom.page-0/1/2 +12 nodes each, res.js.studio-lab +2941 B encoded, res.js.home +1162 B, res.js.studio-guard +2 B. All budgets pass (93/17/15). Accepted as the intended growth of rounds 286-300 (price fallback, narrow screen + preview player, deep link, library menu); new oracle = c-round-301/perf/latest*.json.",
    "evidence": "c-round-301.md RR-PERF; c-round-301/perf/equiv-*.txt", "added": ADDED})
dlog('D-29z783', "RR-PERF oracle deltas ruled: 0 deterministic deltas in PERF-1a and PERF-1b-i; the 9 PERF-1b-ii growth rows (DOM +12 nodes per page, studio-lab JS +2.9 KB, home JS +1.2 KB) are accepted as intended growth of FIX-PD-1 and STUDIO-LINK (rounds 286-300), all budgets pass. The perf oracle for later comparisons becomes c-round-301/perf/latest*.json (B-R301-PERF-ORACLE-DELTAS).")

for e in b['deferred_low_polish']:
    if e.get('id') == 'GATE300-S2-LINK-NATIVE-MENU':
        e['c_evidence'] = "C round 301 RP-LINK-NATIVE-MENU: contextmenu does not reach a window listener, CZABA menu stays open; whether Chromium draws its native menu is not observable headless (D-29z784)"
    if e.get('id') == 'GATE300-S3-LINK-DRAGGABLE':
        e['c_evidence'] = "C round 301 RP-LINK-DRAG: dragging the item onto the library search input sets its value to http://127.0.0.1:5173/products/middle-east; 0 clips added (D-29z784)"
b['open_findings'].append({"id": "B-R299-MENU-SHEET-CANDIDATE", "severity": "info", "status": "closed no finding (D-29z784)", "origin": "b-round-299 section 9",
    "text": "C round 301 RP-MENU-SHEET: with the library or marker menu open, ? does not open the sheet; Esc returns focus to the option / marker flag; no stacked dialogs, never BODY, no lost edit.",
    "evidence": "c-round-301/tools/rp301/rp301.json", "added": ADDED})
b['open_findings'].append({"id": "SA-28", "severity": "info", "status": "closed expected (D-29z784)", "origin": "carried since round 258 (D-29z509)",
    "text": "C round 301: fixed 1/4 at 120 BPM, zoom to 4.3 px/s, key 3 -> 1/4T with 'Lines are hidden at this zoom, so Snap is paused' status. Expected under the hidden-grid snap-pause rule.",
    "evidence": "c-round-301.json observations SA-28", "added": ADDED})
dlog('D-29z784', "Round 301 record-only rows ruled: SA-28 closed as expected (fixed mode reaches 1/4T, snap paused by the hidden-grid rule); RP-MENU-SHEET closes the b-round-299 section 9 candidate with no finding; RP-LINK-NATIVE-MENU and RP-LINK-DRAG attached as C evidence to GATE300-S2/S3 (still deferred Lows); RP-NARROW 0 overlap at 1024/900/1280/1440 (GATE257 Low unchanged); RP-METRO-MUTE, RP-SPACE-EMPTY, RP-VIDEO-MARKER equal to round 258; NO-SHIFT-203 carried again (needs a reference server).")

# NAME-AND-HINT split
pd = b['post_current_stage_queue'][6]
new_stages = []
for s in pd['stages']:
    if s.get('id') == 'NAME-AND-HINT':
        s['status'] = "in_progress (D-29z785): split into NAME-AND-HINT-a (Q4 naming, round 302) and NAME-AND-HINT-b (Q5 one-time hint, round 303 unless round 302 yields Medium+) | " + s['status']
        new_stages.append(s)
        new_stages.append({"id": "NAME-AND-HINT-a", "finding": "Q4 / F6 (name part)", "what": "one product name 'CZABA Studio': /studio-lab title 'CZABA Studio — Demo collection', Studio h1 'CZABA Studio' (suffix '· Workspace' removed, demo and purchased), home showcase h2 'CZABA Studio' (glow on Studio) and mockup title, checkout success step 'Access CZABA Studio anytime'; repo-scan guard studio-naming.test.tsx", "status": "dispatched round 302 (D-29z785)"})
        new_stages.append({"id": "NAME-AND-HINT-b", "finding": "Q5", "what": "after the first clip is added, a one-time status 'Drag a clip by its name bar to move it'; behaviour unchanged (body drag = time selection). Needs at planning: product-designer consult, Live reference section, L51 clobber list (ready text -> 'Added ...' -> hint), lifetime ruling (smallest honest reading: once per page load; persistence offered to Saba as a question), L39 screen-budget row (status line only, no new persistent text)", "status": "queued round 303 (D-29z785)"})
    else:
        new_stages.append(s)
pd['stages'] = new_stages
dlog('D-29z785', "NAME-AND-HINT split into two bounded stages (round-size rule: one feature stage per round): NAME-AND-HINT-a = Q4 naming (round 302), NAME-AND-HINT-b = Q5 one-time hint (round 303 unless 302 yields Medium+). Q5 is scheduled, not deferred. Doc 221 stays 'In Progress (stage 1 of 2; C round 302 PASS)' until stage b passes. RETRO stays at round 305.")

b['open_findings'].append({"id": "SABA-Q-NAME-LAB-URL-FILE", "severity": "info", "status": "awaiting_user (D-29z786)", "origin": "B round 301 planning (L44)",
    "text": "Q4 names nav, <title>, header and home copy. The URL /studio-lab and the demo export filename czaba-studio-lab.wav / -range.wav / .mp3 still carry 'lab'. product-designer proposed fileStem czaba-studio-demo; B kept both in round 302 because they are not in Q4's list and a filename/URL is an external contract (28 hits in 10 files incl. perf/studio-lab-resources.perf.spec.ts and perf/budgets.resources.json liveness notes). Question for Saba: keep, or rename URL and/or filename in a later bounded round?",
    "evidence": "b-round-301/claims-302-output.txt K7", "added": ADDED})
b['open_findings'].append({"id": "SABA-Q-NAME-TESTIMONIAL", "severity": "info", "status": "awaiting_user (D-29z786)", "origin": "B round 301 planning (product-designer consult)",
    "text": "TestimonialsSection quote says 'The Mixdown Studio' (keep-list: testimonials are never reworded without Saba). Kept verbatim in round 302. Question: keep the customer's words, or change to 'CZABA Studio'? Recommended default: keep.",
    "evidence": "b-round-301/claims-302-output.txt K13", "added": ADDED})
b['open_findings'].append({"id": "B-R301-E2E-STALE-PERSONAL-STUDIO", "severity": "info", "status": "recorded (D-29z786)", "origin": "B round 301 planning",
    "text": "e2e/store-page.spec.ts l.102 expects a badge 'Personal Studio Included' that no app/** source renders (0 hits). Pre-existing stale e2e expectation (full e2e is not a gate row; smoke does not include it). Candidate for STORE-4 (version card) or a test-only cleanup.",
    "evidence": "b-round-301/claims-302-output.txt K14", "added": ADDED})
b['open_findings'].append({"id": "B-R301-DOCS-OLD-NAME", "severity": "info", "status": "recorded (D-29z786)", "origin": "B round 301 planning",
    "text": "8 doc files (docs/technical/**, CLAUDE.md) still say 'Studio Lab' or 'Personal Mixdown'. Out of round 302's scope (Q4 lists UI places). CLAUDE.md tagline is a project-level rule file: proposal only, listed 'For Saba' at RETRO 305.",
    "evidence": "b-round-301/claims-302-output.txt K16", "added": ADDED})
dlog('D-29z786', "NAME-AND-HINT-a rulings (product-designer consulted): title 'CZABA Studio — Demo collection'; h1 'CZABA Studio' with the '· Workspace' span and headingSuffix removed (demo and purchased headings equal; the badge carries the origin); home h2 'CZABA <glow>Studio</glow>'; mockup title 'CZABA Studio'; checkout step 'Access CZABA Studio anytime'. Deviation from product-designer: export fileStem stays czaba-studio-lab (not in Q4's list; external filename contract; 28 hits incl. perf liveness) -> SABA-Q-NAME-LAB-URL-FILE. Testimonial kept verbatim (keep-list) -> SABA-Q-NAME-TESTIMONIAL. Docs and the stale e2e badge recorded, not in scope. Narrow share title and nav already 'CZABA Studio' / 'Studio'.")

b.setdefault('architecture_checkpoint_requests', []).append({"id": "ARCH-CHECKPOINT-STUDIO-LINK", "file": "b-round-300.md section 6",
    "question": "STUDIO-LINK feature boundary: keep or extract (1) one shared hydrate-route/workspace test harness (A-R298-ARCH-HYDRATE-HARNESS + ROOT-RECON-GRID-HARNESS), (2) studio-menu-dismiss.ts for the library/marker/grid menus (B-R299-LIBRARY-MENU-DUPLICATION, 2 reviewers), (3) route DOM query vs library optionRefs (GATE296-ARCH-ROUTE-DOM-FOCUS)",
    "signals": ["A-R298-ARCH-HYDRATE-HARNESS", "ROOT-RECON-GRID-HARNESS", "B-R299-LIBRARY-MENU-DUPLICATION", "GATE296-ARCH-ROUTE-DOM-FOCUS"],
    "blocking": False, "status": "requested (D-29z777), unanswered at round 302 planning (D-29z787); non-blocking; NAME-AND-HINT and PERF-3c proceed", "added": ADDED})
dlog('D-29z787', "Frontend-architect checkpoint at the STUDIO-LINK boundary (b-round-300.md section 6) recorded as ARCH-CHECKPOINT-STUDIO-LINK; no root result yet. Non-blocking. Round 302 adds no new component and does not touch the menu files, so it adds no risk to that request.")

json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
