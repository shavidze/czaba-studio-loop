import json, sys
P = sys.argv[1]
b = json.load(open(P))
ADDED = "2026-11-02 B round 302 -> 303 planning"
def dlog(i, text):
    b['decisions_log_b'].append({"id": i, "date": "2026-11-02", "text": text})
ids = {d['id'] for d in b['decisions_log_b']}
if 'D-29z788' in ids:
    print('already applied'); sys.exit(0)
b['version'] += 1
b['updated'] = "2026-11-02T B round 302 -> 303 planning"
b['current_task'] = "Round 303: NAME-AND-HINT-b (Q5 one-time name-bar hint in the clip-added status) on 1fd0129"
for r in b['rounds']:
    if r.get('round') == 302:
        r['status'] = "c_pass_published (D-29z788): C round 302 PASS (21 rows passed, 0 bugs, browserVerified/realVerified true, both viewports; 1 row BLOCKED backend unavailable in cloud: purchased heading in a browser, unit PW1/PW6). Gate 302 published 1fd01292819d22005faae629545a9f8f05b8ad91 on both remotes"
b['rounds'].append({"round": 303, "task": "current-task.md", "decision": "D-29z790..D-29z792",
    "type": "NAME-AND-HINT-b: Q5 one-time 'Drag a clip by its name bar to move it.' appended to the first successful library clip-added status (Enter/Add menu or drag-drop) per page load",
    "status": "dispatched", "note": "baseline HEAD 1fd0129 clean; frozen b-round-302-r303-tree-sha256.txt (1172); claims b-round-302/claims-303.sh; 2 source grants byte-equal to b-round-302/sketch-*.txt; 5 collision test files + 1 new test file + doc 221", "added": ADDED})
pd = b['post_current_stage_queue'][6]
for s in pd['stages']:
    if s.get('id') == 'NAME-AND-HINT-a':
        s['status'] = "done (D-29z788): C round 302 PASS, browserVerified true; gate 302 published 1fd0129 | " + s['status']
    if s.get('id') == 'NAME-AND-HINT-b':
        s['status'] = "dispatched round 303 (D-29z790) | " + s['status']
    if s.get('id') == 'NAME-AND-HINT':
        s['status'] = "in_progress (D-29z788): stage a done (C round 302 PASS, gate 1fd0129); stage b round 303 | " + s['status']
dlog('D-29z788', "Round 302 NAME-AND-HINT-a closed on independent C evidence: c-round-302.json PASS (21 passed rows incl. N-TITLE-H1, N-RETIRED-TEXT (7 states x 2 viewports, AX tree), N-HOME (1440/1280/390 + reduced motion), N-CHECKOUT, N-NAV, N-NARROW, N-EXPORT-NAME, N-JOURNEY with a real 16 s 24-bit WAV, N-SCREEN-BUDGET, RV-EN, G302-AUTH 401/403), 0 bugs, browserVerified/realVerified true; 1 row BLOCKED (backend unavailable in cloud; unit PW1/PW6). Gate 302 published 1fd0129 on both remotes. NAME-AND-HINT-a -> done; NAME-AND-HINT stays in_progress until stage b passes. Baseline for round 303 = 1fd0129 (B re-checked HEAD, clean tree).")
b['deferred_low_polish'].append({"id": "A-R302-REVIEW-NM1-NARROW", "severity": "low", "status": "deferred (D-29z789)",
    "origin": "A round 302 code-reviewer + gate 302 reviewer finding 2 (merged, one root cause)",
    "title": "NM1 repo scan in app/lib/__tests__/studio-naming.test.tsx is both too narrow and too brittle: case-sensitive, line-by-line (a name split across JSX lines passes), misses 'Personal Studio', scans app/**/*.ts(x) only; and any future TODO/SABA-Q comment mentioning 'Studio Lab' turns it red (comments are scanned).",
    "evidence": "a-round-302.md 'Code-reviewer findings'; gates/round-302/review.md finding 2",
    "repro": "add a comment '// TODO SABA-Q-NAME-LAB-URL-FILE Studio Lab' anywhere under app/ -> NM1 red; write 'Personal Studio' in a component -> NM1 green",
    "fix_hint": "one pass: add 'Personal Studio' and the i flag, allow lines tagged TODO/SABA-Q, keep the m1-m4 mutants red",
    "added": ADDED})
for f in b['open_findings']:
    if f.get('id') == 'B-R301-E2E-STALE-PERSONAL-STUDIO':
        f['gate_evidence'] = "gates/round-302/review.md finding 3 confirms: e2e/store-page.spec.ts:102 expects 'Personal Studio Included', 0 app/** hits; outdated test, not a site leftover (D-29z789). Not owned by round 303."
b['open_findings'].append({"id": "GATE302-INFO", "severity": "info", "status": "recorded (D-29z789)", "origin": "gates/round-302/review.md",
    "text": "F1: checkout.success.tsx changed one STEPS string only (no loader/action/token/order/download change) - behaviour-preserving, purchase protection unchanged. F4: /studio-lab title deviates from the '| CZABA' page-title pattern by product-designer decision (doc 221). F5: verify.log 'must be used within an ArrangementProvider' lines are pre-existing outside-provider tests. Suggestion: StudioWorkspace.tsx:2767/2772 calls workspaceCollectionCopy twice per render (cheap, pre-existing).",
    "evidence": "gates/round-302/review.md", "added": ADDED})
b['open_findings'].append({"id": "A-R302-INFO-CZABA-DOUBLE-READOUT", "severity": "info", "status": "awaiting_user candidate for the RETRO 305 screen review (D-29z789)", "origin": "A round 302 code-reviewer",
    "text": "The Studio header reads the back link 'CZABA' next to the h1 'CZABA Studio', so assistive tech hears 'CZABA CZABA Studio'. Copy question for product-designer / Saba, not a defect; not scheduled.",
    "evidence": "a-round-302.md", "added": ADDED})
b['open_findings'].append({"id": "INFO-C302-BUDGET-METHOD", "severity": "info", "status": "recorded (D-29z789)", "origin": "C round 302 N-SCREEN-BUDGET",
    "text": "Screen-budget baselines on 1fd0129 (round-300 method): empty /studio-lab 95 text-node lines / 56 distinct visual rows at 1440x900 and 78 / 49 at 1280x720; with one demo clip 113 / 59 and 95 / 51. Future budget rows state both counts and compare distinct visual rows (a removed same-row span lowers the node count only).",
    "evidence": "c-round-302/budget.json, c-round-302/budget-clip.json", "added": ADDED})
b['architecture_signals'].append({"id": "A-R302-SIGNAL-PURCHASED-TITLE", "source": "A round 302 code-reviewer (info)", "text": "a future purchased Studio route needs its own <title> (input for SRW-21-PLAN)", "status": "signal (D-29z789)", "added": ADDED}) if isinstance(b.get('architecture_signals'), list) else None
dlog('D-29z789', "Round 302 findings triaged: A-R302-REVIEW-NM1-NARROW (A reviewer Low) and gate 302 finding 2 (NM1 trips on TODO/SABA-Q comments) share one root cause -> one deferred_low_polish entry; gate finding 3 attached to B-R301-E2E-STALE-PERSONAL-STUDIO (round 303 does not own e2e/store-page.spec.ts); gate F1/F4/F5 recorded as info (GATE302-INFO); 'CZABA CZABA Studio' read-out -> RETRO 305 screen-review candidate; INFO-C302-BUDGET-METHOD records the 1fd0129 budget baselines with the method; purchased <title> -> SRW-21-PLAN signal. No Medium+ finding: round 303 = NAME-AND-HINT-b as planned (D-29z785).")
b['open_findings'].append({"id": "SABA-Q-NAME-HINT-LIFETIME", "severity": "info", "status": "awaiting_user (D-29z791)", "origin": "B round 302 planning (product-designer consult, L44)",
    "text": "Q5 says 'a one-time status'. Round 303 shows the name-bar hint once per page load (in memory; the ready text has no persistence either). Question for Saba: should it stop after the first visit in this browser (localStorage)? Recommended default: no, per page load (demo is revisited fresh; testers cannot reset it; the line is quiet and in the status line only).",
    "evidence": "current-task.md round 303 section 2", "added": ADDED})
dlog('D-29z790', "NAME-AND-HINT-b rulings (product-designer consulted; advisor consulted): (1) delivery = appended to the same clipAdded setStatus write (one polite announcement, nothing can clobber it between); (2) triggers = addSourceToActiveTrack (Enter / Add menu) and dropLibrarySource only; refusals and failures neither show nor consume it; video import neither shows nor consumes it (its async decode statuses would overwrite it); (3) lifetime = once per page load (workspace mount, ref), Undo does not re-arm it; (4) ordering = hint right after the add sentence, before the tempo-seed text that StudioWorkspace's existing function-form write appends (seed code unchanged, L49); (5) microcopy = Saba's sentence verbatim plus a final period. Live 12 manual 6.7 'only the clip bar is draggable' / 6.9 'clicking and dragging in the waveform selects time' confirm the behaviour; Live shows no such hint: CZABA-only aid by Saba's Q5 decision (not a planner deviation). Manual term 'clip bar' vs Saba's 'name bar': Saba's sentence kept, recorded as info. B scratch: 12 collisions in 5 test files (granted with the L4 wording), seeded composite measured 1162 px of 1256 px at 1280x720 (1 line, footer 53 px unchanged).")
dlog('D-29z791', "SABA-Q-NAME-HINT-LIFETIME asked once (per page load vs per browser), default per page load; awaiting_user, non-blocking.")
dlog('D-29z792', "Round 303 dispatched: NAME-AND-HINT-b on 1fd0129. Not a REGRESSION round (regression-last 2026-11-02, next due 2026-11-05). RETRO stays at round 305. ARCH-CHECKPOINT-STUDIO-LINK still unanswered and non-blocking.")
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
