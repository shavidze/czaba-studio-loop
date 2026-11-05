# B round 347 -> 348 planning, part 2 (advisor close-out): L7 closures. Run from the loop root.
import json, pathlib, sys
P = pathlib.Path('backlog.json'); DONE = pathlib.Path('b-round-347/update-backlog-part2.done')
if DONE.exists(): sys.exit('already applied')
b = json.loads(P.read_text()); assert b['version'] == 309, b['version']
ADDED = '2026-11-05 B round 347 -> 348 planning'
def find(i):
    return next(f for f in b['open_findings'] if f.get('id') == i)
f = find('PERF-CAND-FADE-BUDGET')
f['status'] = 'scheduled round 348 (D-29z1105): fade per-move/max <= 24 -> <= 4 in the conversions round; closes on C round 348 PASS (B sketch 3.933/4 pass; MU-GROSS-PREVIEW 76.7/77 and MU-COMBO 5.9/6 red, b-round-347/perf-summary.txt) | ' + f['status']
f = find('PERF-CAND-DETAIL-CLIPGAIN-MEMO')
f['status'] = 'closed (D-29z1105): done by c6-ii (round 347, C PASS, published 95774e6; memo + useStableHandler) | ' + f['status']
b['decisions_log_b'].append({'id': 'D-29z1105', 'date': '2026-11-05', 'text': 'L7 close-out (advisor): PERF-CAND-DETAIL-CLIPGAIN-MEMO closed (done by c6-ii, round 347); PERF-CAND-FADE-BUDGET scheduled in round 348 (fade tightened to <= 4), closes on C PASS; doc 232 TODO marks both done (task 1.2). Test-shape sweep: grep budgets.interactions over app/perf/e2e/scripts hits only perf/lib/report.test.ts (A-PERF-LIB; 40/40 on the sketch, b-round-347/sketch-perf-lib.log) and the spec.'})
b['version'] = 310; b['updated'] = ADDED
P.write_text(json.dumps(b, ensure_ascii=False, indent=1) + '\n'); DONE.write_text('ok\n'); print('ok v310')
