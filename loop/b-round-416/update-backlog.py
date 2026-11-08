import json, os, sys

LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-416/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 392, b['version']
BY = '2026-11-08 B round 416 -> 417 planning'

b['version'] = 393
b['updated'] = '2026-11-08 (B round 416 -> 417 planning: SYS-CLOCK-DETERMINISM dispatched)'
b['current_task'] = 'Round 417: SYS-CLOCK-DETERMINISM (test-only; 5 jsdom rows on a deterministic clock + IM24 end-stop; current-task.md)'

for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 416:
        r['status'] = 'c_pass (C round 416 PASS, browserVerified/realVerified true, 0 app bugs; gate 416 skipped: no source change)'
b['rounds'].append({
    'round': 417, 'task': 'current-task.md', 'decision': 'D-29z1450..D-29z1453',
    'type': 'SYS-CLOCK-DETERMINISM (test-only)', 'status': 'dispatched',
    'note': 'baseline 344a59f clean (gate 416 skipped, gate 415 published); frozen b-round-416/r417-frozen-sha256.txt (1311); grants b-round-416/grants-417.txt (6); sketch b-round-416/sketch-417.patch.txt; claims b-round-416/claims-417.sh'})

for rr in b['retro_runs']:
    if isinstance(rr, dict) and rr.get('round') == 416:
        rr['c_result'] = 'C round 416 PASS (c-round-416.json; 11 rows passed, browserVerified true); D-29z1450'

new_low = {
    'id': 'C-R416-CLAIMS-K22-ARCHIVE', 'severity': 'low', 'origin': 'environment',
    'title': 'B claims script K22 raised KeyError: the backlog optimizer archived two closed findings to archive/findings-archived.json after B planned',
    'evidence': 'c-round-416.json bugs[0]; c-round-416/claims.err',
    'status': 'fixed_in_b_tooling_pending_c (D-29z1451): b-round-416/claims-417.sh K14 reads open_findings + deferred_low_polish + archive/findings-archived.json; closes when C round 417 CLAIMS shows K14 with empty stderr; lesson L56 gains the archive clause',
    'added': BY}
b['open_findings'].append(new_low)

CLOSES = ['GATE148-S2-VDS3-WALLCLOCK', 'GATE77-S4-EN10-CLOCK', 'ROOT-R70-L4-BW5-WALLCLOCK', 'C-R326-01',
          'A-R388-REVIEW-L4-SF11-REAL-CLOCK', 'A-R415-REVIEW-L1-CALLSITE-FLAG']
seen = set()
for key in ('open_findings', 'deferred_low_polish'):
    v = b[key]
    for f in (v if isinstance(v, list) else v.get('items', [])):
        if isinstance(f, dict) and f.get('id') in CLOSES:
            f['status'] = 'scheduled in round 417 SYS-CLOCK-DETERMINISM (D-29z1452); closes on C PASS | ' + str(f.get('status'))
            seen.add(f['id'])
assert seen == set(CLOSES), set(CLOSES) - seen

for t in b['systemic_tasks']:
    if isinstance(t, dict) and t.get('id') == 'SYS-CLOCK-DETERMINISM':
        t['status'] = 'dispatched round 417 (D-29z1452) | ' + t['status']
        t['closes_round_417'] = CLOSES
        t['ruling_d29z1452'] = (
            'helper fake-web-audio.ts unchanged (only SF11 uses it; it already exposes fakeClock); per row: '
            'EN10 Date.now frozen + exact 2.25 + fakeClock step 0.3 -> 2.5; VDS3 vi.useFakeTimers toFake Date+performance '
            '(the dock gates on performance.now) + advance exactly 50 ms; SF11 Date.now frozen, both real 150 ms waits -> '
            'fakeClock.base steps, plus setInterval-stub assert (A-R415-REVIEW-L1); IM24 tail ends with one captured rAF tick '
            '-> end-stop at 16 then the stopped text (C-R326-01, matches c-round-326 browser); BW5 elapsed<100 replaced by '
            'a window-read count <= 1000 (HEAD 442, full-build mutant 6,784,880). B-R184-FAKECLOCK-UNASSERTED and '
            'GATE325-IM24-WALLCLOCK stay related, not closed. Converging the 3 local fakes onto the helper stays signal '
            'SIG-R415-WORKSPACE-ENV-CONVERGENCE.')

sp = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STUDIO-PERFORMANCE'][0]
sp['status'] = ('in_progress (D-29z1453): RETRO 416 done (C PASS); round 417 = SYS-CLOCK-DETERMINISM (test-only); '
                'then SYS-R416-PREVIEW-CONTROLLER, SYS-R369 (L46 default, queued before STEM-LANES); '
                'REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10 | ' + sp['status'])

b['decisions_log_b'] += [
    {'id': 'D-29z1450', 'date': '2026-11-08', 'by': BY,
     'decision': 'Round 416 accepted: C PASS (c-round-416.json, browserVerified/realVerified true, 0 app bugs, 1 environment Low). RETRO-416 done. Gate 416 status skipped (no source change); baseline for round 417 stays 344a59f (gate 415 published; HEAD = 344a59f, clean). REGRESSION not due: regression-last 2026-11-07, due on/after 2026-11-10.'},
    {'id': 'D-29z1451', 'date': '2026-11-08', 'by': BY,
     'decision': 'C-R416-CLAIMS-K22-ARCHIVE (Low, environment, B loop tool) fixed in B tooling now instead of deferring: claims scripts that read finding ids also read archive/findings-archived.json; L56 gains one clause. Closes on C round 417 CLAIMS with empty stderr.'},
    {'id': 'D-29z1452', 'date': '2026-11-08', 'by': BY,
     'decision': 'SYS-CLOCK-DETERMINISM rulings (see systemic_tasks ruling_d29z1452): 5 test files + doc 268; helper unchanged; per-row clock method; IM24 tail asserts the end-stop (smallest honest behaviour, equals the browser contract c-round-272 B-ATEND / c-round-326); BW5 wall-clock bound replaced by an operation count (equal-or-stronger, L4). Sketch b-round-416/sketch-417.patch.txt 63/63; 6 mutants as designed (b-round-416/mutants/summary.txt).'},
    {'id': 'D-29z1453', 'date': '2026-11-08', 'by': BY,
     'decision': 'Order unchanged after round 417: SYS-R416-PREVIEW-CONTROLLER -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule); REGRESSION-2026-11-10 at the first planning on/after 2026-11-10; next RETRO round 431 or end of STUDIO-PERFORMANCE.'},
]
open(p, 'w').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('ok\n')
print('backlog v393 written')
