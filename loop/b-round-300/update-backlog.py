import json, sys
P = sys.argv[1]
b = json.load(open(P))
ADDED = "2026-11-02 B round 300 -> 301 planning"
def dlog(i, text):
    b['decisions_log_b'].append({"id": i, "date": "2026-11-02", "text": text})
ids = {d['id'] for d in b['decisions_log_b']}
if 'D-29z774' in ids:
    print('already applied'); sys.exit(0)

b['version'] = b['version'] + 1
b['updated'] = "2026-11-02T B round 300 -> 301 planning"
b['current_task'] = "Round 301: REGRESSION-ROUND-2026-11-02 (C-only browser sweep on aa7a6ef; A baseline report only)"

for r in b['rounds']:
    if r.get('round') == 300:
        r['status'] = "c_pass_published (D-29z774): C round 300 PASS 19 rows, browserVerified/realVerified true, 1 Low C-R300-01; gate 300 published aa7a6ef on both remotes | " + r['status']
b['rounds'].append({"round": 301, "task": "current-task.md", "decision": "D-29z778..D-29z780",
    "type": "REGRESSION-ROUND-2026-11-02: C-only browser sweep (phase 1 + T12 V1 + items done since round 199, adding rounds 259-300); A baseline only",
    "status": "dispatched", "note": "baseline HEAD aa7a6ef clean; frozen b-round-300-r301-tree-sha256.txt; claims b-round-300/claims-301.sh; no grants", "added": ADDED})

pd = b['post_current_stage_queue'][6]
for s in pd['stages']:
    if s.get('id') == 'STUDIO-LINK-b':
        s['status'] = "done (D-29z774): C round 300 PASS (19 rows incl. B-MENU, B-NEWTAB, B-KBD, B-CLOSE, B-SPACE, B-UNMAPPED, B-PREVIEW-PARITY, B-ADD-INTACT, B-SHEET, B-SCREEN-BUDGET, B-JOURNEY at 1440x900 and 1280x720), browserVerified/realVerified true; gate 300 published aa7a6ef | " + s['status']
    if s.get('id') == 'STUDIO-LINK':
        s['status'] = "done (D-29z774): STUDIO-LINK-a, -a2, -a3, -a4, -b all C PASS with browser evidence and published (bc9d9a7, 77d5341, ece19e3, 61c37d8, aa7a6ef); STUDIO-LINK-DYNAMIC stays a later candidate | " + s['status']
dlog('D-29z774', "Round 300 STUDIO-LINK-b C PASS (c-round-300.json: 19 rows passed, browserVerified/realVerified true, blocked none) and gate 300 published aa7a6ef on both remotes -> STUDIO-LINK-b done; STUDIO-LINK (a..b) done. Next baseline = gate commit aa7a6ef (the gate 'head' 61c37d8 is pre-commit).")

lows = [
 ("C-R300-01", "C round 300 + A round 300 code-reviewer (A-R300-REVIEW-3)", "The ? sheet row 'View in store (new tab)' lists Right-click and Shift+F10 but not the ContextMenu key, which also opens the menu", "c-round-300/shots/b-sheet-1440x900.png; c-round-300/rows.json B_SHEET, B_KBD_ContextMenu", "press ?; read the Library row; focus demo-middle-east and press ContextMenu -> menu opens but the key is not listed"),
 ("A-R300-REVIEW-1", "A round 300 code-reviewer (= gate-300 suggestion 1)", "ArrangementLibrary.tsx l.467-471: when the open-menu option leaves the results the effect clears the menu without moving focus; focus could fall to BODY (not reachable through today's UI)", "a-round-300.md; gates/round-300/review-result.json S1", "not reproduced; source reading only"),
 ("A-R300-REVIEW-2", "A round 300 code-reviewer", "Menu anchor uses event.button === 2; macOS Ctrl+click may report button 0 and anchor below the option instead of at the pointer", "a-round-300.md; c-round-300.md INFO-02", "real macOS Chrome only (Tech Lead list)"),
 ("A-R300-REVIEW-4", "A round 300 code-reviewer", "Tests: VS5b does not assert the outside pointerdown is swallowed; held Enter and Arrow/Home/End untested; Enter close covered only indirectly in jsdom", "a-round-300.md", "read studio-link-view-in-store-ui.test.tsx VS5b/VS7"),
 ("GATE300-S2-LINK-NATIVE-MENU", "gate-300 reviewer suggestion 2", "ArrangementLibraryMenu.tsx l.122-125 prevents the native context menu on the <a> too, so 'Copy link address' / 'Open in new window' are unavailable", "gates/round-300/review-result.json", "open the menu, right-click the 'View in store' item -> no native menu"),
 ("GATE300-S3-LINK-DRAGGABLE", "gate-300 reviewer suggestion 3", "The 'View in store' <a> is draggable; dropping it on the search input inserts the URL", "gates/round-300/review-result.json", "open the menu, drag the item onto the library search input"),
 ("GATE300-S4-AX-KEYSHORTCUTS", "gate-300 reviewer suggestion 4", "Mapped library options give screen-reader users no hint that a menu exists; proposal aria-keyshortcuts='Shift+F10' on mapped options only", "gates/round-300/review-result.json", "read the option accessible properties in CDP"),
 ("GATE300-S5-UNUSED-REASON", "gate-300 reviewer suggestion 5", "closeLibraryOptionMenu ignores its reason argument; LibraryMenuCloseReason exported for nothing", "gates/round-300/review-result.json", "source reading"),
]
for i,o,t,e,rp in lows:
    b['deferred_low_polish'].append({"id": i, "severity": "low", "status": "deferred (D-29z775)", "origin": o, "title": t, "evidence": e, "repro": rp, "added": ADDED})
dlog('D-29z775', "Round 300 Lows -> deferred_low_polish (2026-10-23 bug gate): C-R300-01 (= A-R300-REVIEW-3, one entry), A-R300-REVIEW-1 (= gate-300 S1), A-R300-REVIEW-2, A-R300-REVIEW-4, GATE300-S2-LINK-NATIVE-MENU, GATE300-S3-LINK-DRAGGABLE, GATE300-S4-AX-KEYSHORTCUTS, GATE300-S5-UNUSED-REASON. None reproduced as a failure; none touches auth, purchase or data. C round 301 records S2 and S3 once as observations (RP-LINK-NATIVE-MENU, RP-LINK-DRAG) so C evidence exists.")

b['tech_lead_manual_checks'].append({"id": "TLM-R300-MAC-CTRLCLICK-BLUR", "what": "Real macOS Chrome: Ctrl+click a mapped library option (menu anchor at pointer?) and confirm a real window blur when 'View in store' opens a tab leaves focus on the option", "reason": "C-R300-INFO-02: headless Linux Chromium fires no contextmenu on Ctrl+left and no blur on new tab (D-29z776)"})
b['open_findings'].append({"id": "C-R300-INFO-03-AUTH-ROW-WORDING", "severity": "info", "status": "process_rule (D-29z776): every G-AUTH row names the parameterised request GET /api/studio-token?product=middle-east&file=mix.wav (401 without a header); a bare GET returns 400 (validation before auth) and is recorded, not a finding", "origin": "C round 300", "evidence": "c-round-300.md section 5", "added": ADDED})
dlog('D-29z776', "C-R300-INFO-02 -> Tech Lead manual list TLM-R300-MAC-CTRLCLICK-BLUR. C-R300-INFO-03 -> process rule: auth rows name the parameterised studio-token request; bare GET 400 is recorded only.")

for s in b.get('architecture_signals', []):
    if s.get('id') == 'B-R299-LIBRARY-MENU-DUPLICATION':
        s['text'] = s.get('text','') + " | D-29z777: confirmed by 2 independent reviewers in round 300 (A code-reviewer architecture note; gate-300 reviewer Signal 1+2: ArrangementLibraryMenu imports armGridMenuDismissClickSwallow from ArrangementGridMenu; proposal studio-menu-dismiss.ts with each menu's item semantics unchanged). STUDIO-LINK is complete = feature boundary: frontend-architect checkpoint request sent to root in b-round-300.md section 6. Not scheduled."
dlog('D-29z777', "Feature boundary (STUDIO-LINK done): bounded frontend-architect checkpoint request to root (b-round-300.md section 6) with 3 inputs: A-R298-ARCH-HYDRATE-HARNESS + ROOT-RECON-GRID-HARNESS; B-R299-LIBRARY-MENU-DUPLICATION (now 2 reviewers); GATE296-ARCH-ROUTE-DOM-FOCUS. Signals only; no refactor scheduled; NAME-AND-HINT and PERF-3c do not wait.")

for r in b['regression_rounds']:
    if r['id'] == 'REGRESSION-ROUND-2026-11-02':
        r['round'] = 301
        r['decision'] = 'D-29z778'
        r['status'] = "dispatched (round 301, baseline aa7a6ef; planned 2026-11-02, regression-last 2026-10-30 = 3 days)"
        r['scope_additions'] += [
          "SABA-B-9 stage 2 master in footer (262/263): PLACE/STATES",
          "L46 contract checks (264): CC-META, CC-ALTGR, CC-SR-ORDER, CC-CTRLCLICK",
          "SABA-B-11c stage 1 + fix-ups (265/266/270): BG-RANGE, MARQUEE-CTRL, SPLIT-*, DP-*",
          "GATE264-S2 Alt/AltGr (267/268): ALTGR-UNDO, CTRLALT-REAL, GESTURE-ARROW",
          "SABA-B-7 envelope dB taper (269): TAPER-EXPORT, SILENCE-EXPORT, NO-CLICK-EXPORT, DRAG-READOUT",
          "SABA-B-11c stage 2 relative snap (271): RS-B-OFFSET, RS-B-NUDGE",
          "SYS-6 status lifetime (272-274): B-PASTEND, B-RANGE-STATUS, B-NUDGE-SINGLE",
          "SYS-5 disabled-control contract (276-278): B-TAB, B-AX, B-REASON-TITLES, V-RING",
          "PERF-2 worker synth (282/283): WORKER-BROWSER, EXPORT-BITEXACT, LIBRARY-STATES",
          "PERF-3a/3b (284/285): ZOOM-ONE-COMMIT, WAVE-PIXELS, RULER-NODES, RULER-JUMP",
          "FIX-PD-1a/1b/1c (286-294): B-KNOWN/B-UNKNOWN price, B-NAMES/B-GROUPS, B-NARROW-*",
          "STUDIO-LINK a..b (296-300): B-LINK, B-COLD-DEEPLINK, B-DOCK-MUTED, B-MENU, B-NEWTAB, B-SPACE",
          "carried from 258: SA-28 reworded (adaptive off, fixed 1/4, key 3; record only), NO-SHIFT-203 tree-vs-ref compare",
          "B-R299 section 9 candidate: ? while the library or marker menu is open (record only)",
          "GATE300-S2/S3 record-only rows RP-LINK-NATIVE-MENU, RP-LINK-DRAG",
        ]
        r['template'] = "tasks/round-258.md (which references tasks/round-199.md) + template_corrections_d29z510 + current-task.md round 301 adaptations"
dlog('D-29z778', "Round 301 = REGRESSION-ROUND-2026-11-02 (speed rule: regression-last 2026-10-30 round 258, planned 2026-11-02 = 3 days). No Critical/High/Medium open with a cloud repro, so nothing outranks it. Template = round 258 by reference; section 4c adds one short row per item finished in rounds 259-300; the two pre-planned scope additions (REG-11C-HIDDEN-GRID-BG, 11c stage 1 rows) are named rows. A changes nothing. regression-last.json is updated only at the 301 -> 302 planning after every row ran.")
dlog('D-29z779', "Round 301 template corrections: (1) RV-EN has no ledger exemption any more: app/data/studio-lab-demo.ts has 0 Georgian characters since FIX-PD-1b (K4); only user-typed text is excluded. (2) Below 900 px the workspace is hidden by FIX-PD-1c (studio-lab.tsx max-[900px]:hidden, K5): RP-NARROW measures toolbar overlap at 1024 and 900 only (0 expected) and asserts the narrow screen below 900; RG-22's 390 half becomes B-NARROW-LOAD. (3) Layout baselines: round 262 PLACE/STATES replace round 257's below-toolbar tops (footer 53, toolbar 49 / 87). (4) Perf oracle = c-round-285/perf/latest*.json (gate 285 60bfb38); perf/ last changed at eded57a (round 295, LOAF1); deltas are reported, ruled at 301 -> 302.")
dlog('D-29z780', "Order after round 301 (fixed in advance): all PASS or Lows only -> regression-last = C completion date, round 302 = NAME-AND-HINT; Medium+ -> round 302 bounded fix-up first (regression-last still advances when every row ran); rows not run -> continue first from progress.json, no date advance. Then PERF-3c and STUDIO-PERFORMANCE, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries (skip rule). RETRO stays at round 305.")

json.dump(b, open(P,'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
