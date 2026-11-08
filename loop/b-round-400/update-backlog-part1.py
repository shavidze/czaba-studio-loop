import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-400/update-backlog-part1.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 367, b['version']
BY = '2026-11-08 B round 400 -> 401 planning'
D = '2026-11-08'
b['version'] = 368
b['updated'] = BY
for r in b['rounds']:
    if r.get('round') == 400:
        r['status'] = 'c_pass_published'
        r['result'] = ("C round 400 PASS (c-round-400.json: 12 rows INTERACT-HEAD/VIRT, RES-HEAD/VIRT, SCALE-HEAD/VIRT, PERF-LIB, BUDGET-SHAPE, "
                       "NO-APP-CHANGE, AUTH, SOURCE-SCOPE, DOCS; browserVerified/realVerified true; 0 bugs); gate 400 published c17d0e9 on both remotes "
                       "(rounds 399-400) (D-29z1371)")
for r in b['rounds']:
    if r.get('round') == 399 and 'published' not in str(r.get('status')):
        r['status'] = 'c_fail_stop; completed and published with round 400 (c17d0e9) | ' + str(r.get('status'))
of = b['open_findings']
for f in of:
    if f.get('id') == 'C-R399-01':
        f['status'] = ("closed (D-29z1371): fixed by round 400 R-b' (D-29z1368); C round 400 INTERACT-HEAD 189/189 equal, INTERACT-VIRT VIRT-RULE PASS "
                       "(problems [] x6, drag-group-live 1, only path-rewrites 2 vs 3); published c17d0e9 | " + f['status'])
    if f.get('id') == 'TL-R398-SK-M2':
        f['status'] = ("closed (D-29z1371): interactions and resources specs no longer abort under the lane sketch (C round 400 INTERACT-VIRT and RES-VIRT: "
                       "abortedAt null, problems []); published c17d0e9 | " + f['status'])
b['deferred_low_polish'].append({
    "id": "A-R400-REVIEW-SPEC-LOWS", "severity": "low", "origin": "A round 400 code-reviewer (B's pinned sketch)",
    "evidence": "a-round-400.md 'Code review (A7)' Lows 1-4; c-round-400.json notes[0]",
    "title": "interactions spec: CopyReveals does not count the setup at-rest reveal; copyAtRest is read before the Ctrl+click that selects the copy; "
             "Follow re-enable click comes after the 1 px scrollLeft restore check; copyDelta NaN only via the null lane id",
    "status": "deferred_low_polish (2026-10-23 bug gate); PERF-14b-ii input: the 14b-ii sketch owns the interactions spec and folds these in (D-29z1371)",
    "added": BY})
b['architecture_signals'].append({
    "id": "A-R400-ARCH-READBESIDECLIP", "origin": "A round 400 code-reviewer", "evidence": "a-round-400.md 'For B'",
    "signal": "keep readBesideClip in the interactions spec for now (test-only, one caller family); at 14b-ii (Q-14B-PIN-GROUP-MEMBERS) decide pin-group-members "
              "vs moving the reveal helper into perf/lib/page.ts with a vitest for restore and Follow; alternative: one setup reveal reading id + ClipState together",
    "status": "signal (D-29z1371), 14b-ii input, not scheduled", "added": BY})
sp = [x for x in b['post_current_stage_queue'] if x['id'] == 'STUDIO-PERFORMANCE'][0]
sp['status'] = ("in_progress (D-29z1371): PERF-14b-i done (C round 400 PASS, published c17d0e9); round 401 = RETRO 401 (window 385-400); then 14b-ii, 14c, PERF-15 | "
                + sp['status'])
st = [s for s in sp['stages'] if s.get('id') == 'PERF-14'][0]
st['status'] = ("in_progress (D-29z1371): 14a done (398); 14b-i done (C round 400 PASS, gate 400 published c17d0e9); next 14b-ii virtualization after RETRO 401; 14c | "
                + st['status'])
b['decisions_log_b'].append({"id": "D-29z1371", "date": D, "by": BY,
    "decision": "Round 400 accepted on independent evidence: C PASS (c-round-400.json, 12 rows, browserVerified/realVerified true, 0 bugs); gate 400 published "
                "c17d0e9 (rounds 399-400), the baseline for round 401. PERF-14b-i done. Closed C-R399-01 and TL-R398-SK-M2. A's four spec Lows -> "
                "A-R400-REVIEW-SPEC-LOWS (deferred, 14b-ii input); reviewer architecture note -> signal A-R400-ARCH-READBESIDECLIP (not scheduled)."})
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('applied v368')
