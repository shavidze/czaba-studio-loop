import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-400/update-backlog-part2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 368, b['version']
BY = '2026-11-08 B round 400 -> 401 planning'
D = '2026-11-08'
b['version'] = 369
b['updated'] = BY
b['current_task'] = ("Round 401: RETRO 401 (fourteenth retrospective, window 385-400) + whole-screen and journey review. No app code; A implements nothing; "
                     "C checks traceability of retros/retro-401.md, lessons.md (L4, L58, l.3), user-review/screen-review-401.md and backlog v369, plus the auth guard "
                     "and a short Studio smoke in the browser (current-task.md)")
b['rounds'].append({"round": 401, "task": "current-task.md", "decision": "D-29z1372..D-29z1376", "type": "RETRO 401 (no app change)",
                    "status": "dispatched", "note": "baseline c17d0e9 clean; frozen b-round-400/r401-tree-sha256.txt (1294); grants none; claims b-round-400/claims-401.sh",
                    "added": BY})
b['retro_runs'].append({"round": 401, "decision": "D-29z1372", "window": "385-400", "report": "retros/retro-401.md",
    "lessons": "lessons.md (60 lines): l.3 pointer; L4 degraded state x gesture; L58 pre-step rules + sketch-review claim (tech-lead); diff b-round-400/lessons-diff.txt",
    "data": "b-round-400/*.py run on b-round-400/backlog-before-401.json; outputs b-round-400/data/; retro-numbers-401.txt",
    "consults": {"tech-lead": "used", "product-designer": "used (screen + journey review)", "advisor": "used (planning approach)",
                 "consequence-tester": "not in the B consult list (2026-11-04 section 6); not called", "qa-engineer": "not in the B consult list; not called"},
    "screen_review": "user-review/screen-review-401.md (no new candidates)", "added": BY})
rp = b['retro_policy']
rp['next_due'] = ("round 416 or the end of STUDIO-PERFORMANCE, whichever first (retro 416 window 401-415) (D-29z1372) | " + rp['next_due'])
rp['signals_for_next_retro'].insert(0,
    "retro-401: counters for RETRO 416 (tech-lead): A-STOP rounds reaching C 4/16 (target <= 1); plannings with a sketch patch and no sketch-review.md 4/15 "
    "(388, 391, 394, 395; target 0); unruled Medium+ found by A on B sketch 2/16 (387, 394; target 0); B-origin C FAIL after re-tagging 4 (387, 391, 394, 399; "
    "threshold <= 1); L57 all-12-fields 12/16 (target 16/16); fix-chain share of window cost 53.1 % (target < 30 %); B median $11.28; L23 5058 / L58 4335 bytes "
    "(trigger 5500); ARCH-CHECKPOINT-PREVIEW-AFTER-13C answered or its default planned")
for c in b['retro_candidates']:
    i = c.get('id')
    if i == 'RC-R394-GESTURE-IN-DEGRADED-STATE':
        c['status'] = 'adopted (D-29z1373): L4 clause "Degraded state x gesture" (tech-lead) | ' + str(c.get('status', ''))
    if i == 'RC-R399-RULE-NOOP-AT-HEAD':
        c['status'] = 'adopted (D-29z1373): L58 clause "Pre-step rules and the review claim" (tech-lead) | ' + str(c.get('status', ''))
    if i == 'B-R382-SCOPED-LOCATORS':
        c['status'] = 'retired (D-29z1374): no second instance in 385-400 (grep of c-round-385..400 for .first() / strict mode violation: 0) | ' + str(c.get('status', ''))
    if i == 'RC-R305-LESSON-CHAR-CAP':
        c['status'] = 'watch to RETRO 416 (D-29z1374): L23 5058, L58 4335 bytes after the RETRO 401 clause, trigger > 5500 | ' + str(c.get('status', ''))
b['retro_candidates'].append({"id": "RC-R401-ORIGIN-RETAG", "decision": "D-29z1376", "round": 401,
    "note": "C's origin tags 387 'C' and 391 'A (open STOP)' do not match the cause: 387 was a Medium in B's reviewed sketch (missing tick side-effect row, L49), "
            "391 a conflict between two task clauses (L4). Re-tagged B-origin in retro-401 section 3 (tech-lead). Watch to RETRO 416: if C tags a sketch or spec cause "
            "as A/C again, propose an origin definition in L57.",
    "status": "watch to RETRO 416", "added": BY})
for s in b['systemic_tasks']:
    i = s['id']
    if i == 'SYS-R385-LEAF-ACTIONS-CONTEXT':
        s['status'] = ("queued (D-29z1374): L46 default applied at RETRO 401, no answer in user-review/questions-arch-leaf-plumbing.md; normal bounded task "
                       "after PERF-14c and before PERF-15 (14b-ii owns ArrangementLane; tech-lead); PERF-11c-iii-d/e stay held until it passes | " + s['status'])
    if i == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR':
        s['status'] = ("queued (D-29z1374): L46 default applied at RETRO 401 (ARCH-CHECKPOINT-PERF9-STEM-CACHE unanswered; PERF-13 done); normal bounded task "
                       "immediately before STEM-LANES (tech-lead; B confirms stem-cache coupling at its planning) | " + s['status'])
    if i == 'SYS-R388-FAKE-WEB-AUDIO-HELPER':
        s['status'] = ("queued (D-29z1374): next to SYS-R2-FAKE-FIDELITY (after PERF-15); closes the fake-analyser gap behind C-R387-01 and "
                       "A-R388-REVIEW-L3/L4 (tech-lead) | " + str(s.get('status', '')))
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING':
        a['status'] = ("default applied (D-29z1374): unanswered at RETRO 401 (answer line empty); B-actions = SYS-R385-LEAF-ACTIONS-CONTEXT queued after PERF-14c; "
                       "the question stays open for Saba (an answer before dispatch replaces the default) | " + a['status'])
    if a.get('id') == 'ARCH-CHECKPOINT-PERF9-STEM-CACHE':
        a['status'] = ("default applied (D-29z1374): SYS-R369 queued before STEM-LANES | " + a['status'])
for f in b['open_findings']:
    if f.get('id') == 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C':
        f['status'] = ("L46 deadline RETRO 416 (D-29z1374): due for root since round 396; if unanswered at RETRO 416, B plans one bounded preview-controller "
                       "task that closes the re-entrancy/supersession Lows (GATE393-L3-FALLBACK-REENTRY, A-R394-REVIEW-L3-REENTRANT-SYNC-THROW, "
                       "A-R395-REVIEW-L1-SEEK-REENTRANT, GATE395-L1-CURRENTTIME-READ, A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW, "
                       "A-R392-REVIEW-L3-SUPERSESSION-BY-ID, A-R393-REVIEW-L3-URL-SWITCH-ROWS) (tech-lead) | " + f['status'])
for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-NOTE-R387-STOP-NOT-HONOURED':
        r['status'] = ("open (non-blocking), recurrence 4x in 385-400 (D-29z1376): every C FAIL of the window (387, 391, 394, 399) began with an A STOP that the "
                       "runner sent to C; C cost $2.68 of the four, the chains $156.23; proposal repeated in retro-401 section 12 | " + r['status'])
b['screen_review_candidates'].append({"id": "SR-401-NONE", "decision": "D-29z1372", "status": "info",
    "note": "RETRO 401 screen + journey review: no new candidate (user-review/screen-review-401.md); '1 audio files' already STORE-4 F3 acceptance; Q-SR-385-1 still open",
    "added": BY})
b['regression_rounds'].append({"id": "REGRESSION-2026-11-10", "decision": "D-29z1375", "status": "due at the first planning on or after 2026-11-10",
    "scope": "C re-verifies in the browser the key acceptance of every item done since REGRESSION-2026-11-08 (rounds 391-401: PERF-13b-ii, 13c-i, 13c-ii-a/b, 13d, 14a, 14b-i) "
             "plus one short check per earlier done item, both viewports; npm run test:e2e:smoke; A fixes only what C finds", "added": BY})
sp = [x for x in b['post_current_stage_queue'] if x['id'] == 'STUDIO-PERFORMANCE'][0]
sp['status'] = ("in_progress (D-29z1375): round 401 = RETRO 401; then PERF-14b-ii (TL-R398-SK-M1/L1 sketch fixes + re-review first), PERF-14c, "
                "SYS-R385-LEAF-ACTIONS-CONTEXT, PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM; REGRESSION-2026-11-10 when due | " + sp['status'])
b['decisions_log_b'] += [
    {"id": "D-29z1372", "date": D, "by": BY, "decision": "Round 401 = RETRO 401 (window 385-400, 16 rounds; slipped one round by D-29z1369). Outputs: retros/retro-401.md, "
     "user-review/screen-review-401.md (no new candidates), lessons.md, backlog v369, feature-status.md; data b-round-400/data/; retro_policy.next_due round 416."},
    {"id": "D-29z1373", "date": D, "by": BY, "decision": "lessons.md stays 60 lines: l.3 pointer to retro-401; L4 gains 'Degraded state x gesture' (RC-R394-GESTURE-IN-DEGRADED-STATE); "
     "L58 gains 'Pre-step rules and the review claim' (RC-R399-RULE-NOOP-AT-HEAD + the sketch-review K-claim); both tech-lead; L58 4335 bytes; diff b-round-400/lessons-diff.txt."},
    {"id": "D-29z1374", "date": D, "by": BY, "decision": "RETRO-400 deadlines (L46): no answer to questions-arch-leaf-plumbing.md, so SYS-R385-LEAF-ACTIONS-CONTEXT is queued after PERF-14c "
     "and before PERF-15; SYS-R369 queued immediately before STEM-LANES; SYS-R388 queued next to SYS-R2-FAKE-FIDELITY; ARCH-CHECKPOINT-PREVIEW-AFTER-13C gets deadline "
     "RETRO 416 with a bounded preview-controller default (no new SYS id); B-R382-SCOPED-LOCATORS retired; RC-R305 watch to RETRO 416."},
    {"id": "D-29z1375", "date": D, "by": BY, "decision": "Order after RETRO 401: PERF-14b-ii (sketch-14bii-lane fixed for TL-R398-SK-M1/L1, mutants and VZ re-run, delta review, "
     "then Q-14B-PIN-GROUP-MEMBERS, budget flips, scroll ceiling, A-R400-REVIEW-SPEC-LOWS) unless REGRESSION-2026-11-10 is due at that planning; then PERF-14c, SYS-R385, "
     "PERF-15, SYS-R2 + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule)."},
    {"id": "D-29z1376", "date": D, "by": BY, "decision": "Origins re-tagged in retro-401 section 3: 387 and 391 are B-origin (sketch side-effect row; two task clauses), with 394 and 399 "
     "(B spec) that makes 4/4 C FAILs B-origin. RC-R401-ORIGIN-RETAG watch. ROOT-NOTE-R387-STOP-NOT-HONOURED recurrence 4x recorded for root. "
     "root-pre-push-review.md and publication-checkpoint.json date from 2026-10-07: nothing new to carry."},
]
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('applied v369')
