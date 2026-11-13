import json
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
assert b['version']==470, b['version']
BY='2026-11-12 B round 481 -> 482 planning'
D=[
 {"id":"D-29z1712","date":"2026-11-12","by":BY,"decision":"Round 481 result (C evidence only): C PASS 8 rows (C1-C8), 0 bugs, browserVerified/realVerified true (c-round-481.json); C4 stubbed L36 browser row at 1440x900 and 1280x720 (href /store, full load, first Tab logo, button box 151x50 = HEAD baseline); C5 guard; C6 auth + /studio-lab anonymous; C7 recorded protected /account/downloads still href /music. Real-owner path BLOCKED (backend unavailable in cloud). Gate 481 published 751e30e on both remotes. B-R478-DEAD-MUSIC-LINK: account.orders half verified; finding stays open for the protected account.downloads half (ROOT-REQ-DOWNLOADS-MUSIC-LINK). Nothing else moves to done."},
 {"id":"D-29z1713","date":"2026-11-12","by":BY,"decision":"Round 482 = REGRESSION-2026-11-13 part 1 (C-only, A changes nothing), rounds 426-481. Planning started 2026-11-12T23:47Z, 13 min before the 3-day mark; A and C run on 2026-11-13; the 3-day rule is a floor, not a prohibition (precedent D-29z1476, round 423 planned ~1 h early); D-29z1709 already ordered 482 = REGRESSION. regression-last.json is not updated until part 2 closes. Oracle rule: each row re-runs its round's script against that round's post-change output, but where a later round in 426-481 changed the measured surface (overlap map from gates/gate-round-*.json paths, current-task.md section 2) the latest round's output is the oracle; the glow inventory of 453 and teal states of 447/454 are superseded by 470/474 and are not oracles. Baseline 751e30e, frozen manifest b-round-481/r482-tree-sha256.txt (1393), claims b-round-481/claims-482.sh (0 MISSING, stderr empty). Hue scan at 751e30e = TOTAL 20, identical to c-round-474/hue-scan.txt (all in frozen legacy Studio files)."},
 {"id":"D-29z1714","date":"2026-11-12","by":BY,"decision":"Scope additions of REGRESSION-2026-11-13 all named in round 482 (L6): REG-SABA-B-12-SPIN/RADIOS/PROGRESS/SEARCH-CLEAR/DIALOG-SCROLLBAR (conditions met: rounds 431-434 C PASS); REG-PERF-FULL-SUITE = RR-PERF; REG-SCROLL-HOME-FRAMES uses its last update what_update_d29z1657 only; REG-STORE-2C-1-FONTS condition 'only if round 471 C PASS' ruled met through the round-473 PASS that closed STORE-2c-1 (471 and 472 failed on test/doc scope, not on the font result); REG-CART-CONFIRMDIALOG-SKIN tries the L36 stubbed client path (mock API returns an empty cart, so GET /api/cart is stubbed with one item) and is BLOCKED with the exact reason only if the dialog cannot be reached. carry_to_next_regression_d29z1490 (R-RVM, R-CROSS-LANE-FIBERS, R-FOLLOW-OFFSET, R-DEV-WARMUP, R-EVICT-PIN) is carried to part 2."},
 {"id":"D-29z1715","date":"2026-11-12","by":BY,"decision":"Order after round 482 (fixed in advance in current-task.md section 8): no Medium+ finding -> 483 REGRESSION part 2 (round-423 rows for 391-422, round-425 rows for <=390, carry_to_next_regression_d29z1490), then regression-last.json updated; 484 CLIENT-NAV-CONTRACT (GATE479-M1, ruling D-29z1704 unchanged, incl. its sketch pre-run); 485 B-R480-ORDER-CARD-KEYBOARD; then DPG-BUTTON-CLEANUP and the rest of DPG P1. A Critical/High or cloud-reproducible Medium finding -> its fix-up first. This shifts CLIENT-NAV-CONTRACT 483->484 and ORDER-CARD-KEYBOARD 484->485; nothing else moves. STEM-LANES jumps ahead when Saba answers AGREE-STEM-LANES (no answer at this planning)."},
]
b['decisions_log_b'].extend(D)
for f in b['open_findings']:
    if f['id']=='B-R478-DEAD-MUSIC-LINK':
        f['status']='half verified (D-29z1712): account.orders.tsx -> /store C round 481 PASS (browser, stubbed L36 path), published 751e30e; stays open for the protected account.downloads.tsx half (ROOT-REQ-DOWNLOADS-MUSIC-LINK) | '+f['status']
    if f['id']=='GATE479-M1-ROUTE-ANNOUNCE':
        f['status']='scheduled (D-29z1715): CLIENT-NAV-CONTRACT round 484 (after REGRESSION parts 482-483) | '+f['status']
    if f['id']=='B-R480-ORDER-CARD-KEYBOARD':
        f['status']='scheduled (D-29z1715): round 485 (after REGRESSION 482-483 and CLIENT-NAV-CONTRACT 484) | '+f['status']
for r in b['rounds']:
    if r.get('round')==481:
        r['status']='c_pass_published (D-29z1712): C PASS 8 rows, browserVerified true, 0 bugs; gate 481 published 751e30e'
b['rounds'].append({"round":482,"task":"current-task.md","decision":"D-29z1713","type":"REGRESSION-2026-11-13 part 1 (rounds 426-481 + scope additions; A no change)","status":"dispatched","note":"baseline HEAD 751e30e clean; claims b-round-481/claims-482.sh; frozen manifest b-round-481/r482-tree-sha256.txt (1393); part 2 = round 483"})
for q in b['regression_rounds']:
    if q['id']=='REGRESSION-2026-11-13':
        q['status']='dispatched part 1 (D-29z1713, D-29z1714): round 482 on 751e30e (rounds 426-481, every scope_additions entry named); part 2 = round 483 (round-423 + round-425 rows, carry_to_next_regression_d29z1490); regression-last updated only when part 2 closes | '+q['status']
        q['round']=482
        q['scope_named_d29z1714']={"REG-SABA-B-12-SPIN":"R482-SPIN","REG-SABA-B-12-RADIOS":"R482-RADIOS","REG-SABA-B-12-PROGRESS":"R482-PROGRESS","REG-SABA-B-12-SEARCH-CLEAR":"R482-SEARCH-CLEAR","REG-SABA-B-12-DIALOG-SCROLLBAR":"R482-DIALOG-SCROLLBAR","REG-CART-CONFIRMDIALOG-SKIN":"REG-CART (L36 stubbed, else BLOCKED)","REG-PERF-FULL-SUITE":"RR-PERF","REG-SCROLL-HOME-FRAMES":"R482-SCROLL (what_update_d29z1657)","REG-STORE-2C-1-FONTS":"R482-FONTS (condition met via round 473)","carry_to_next_regression_d29z1490":"carried to part 2 (round 483)"}
for q in b['post_current_stage_queue']:
    if q['id']=='DPG-FIX':
        q['status']='in_progress (D-29z1715): 481 B-R478-DEAD-MUSIC-LINK C PASS published 751e30e; 482-483 REGRESSION-2026-11-13 parts 1-2, 484 CLIENT-NAV-CONTRACT (GATE479-M1), 485 B-R480-ORDER-CARD-KEYBOARD, then DPG-BUTTON-CLEANUP | '+q['status']
b['current_task']='Round 482: REGRESSION-2026-11-13 part 1 - C-only browser sweep of rounds 426-481 plus every scope addition, both viewports, RR-PERF, PERF-LIB, smoke, auth; A changes nothing (current-task.md)'
b['baseline']['head_round_482']={"head":"751e30e475abcf0e3edeb0c596cb6a2cbf11a283","source":"gates/gate-round-481.json published (head field bbb3193 is pre-commit; context/head-sha.txt stale)","date":"2026-11-12","tree_clean":True}
b['version']=471
b['updated']=BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],b['decisions_log_b'][-1]['id'])
