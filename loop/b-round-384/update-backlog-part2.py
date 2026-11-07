# B round 384 -> 385: RETRO 385 outputs, dispositions, next task (D-29z1288..D-29z1292). Run once from the loop root.
import json, os, sys
DONE = 'b-round-384/update-backlog-part2.done'
if os.path.exists(DONE): sys.exit('already applied')
b = json.load(open('backlog.json'))
assert b['version'] == 351, b['version']
ADDED = '2026-11-07 B round 384 -> 385 planning'
def dec(i, t): b['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': ADDED, 'decision': t})
def rc(i): return [c for c in b['retro_candidates'] if c['id'] == i][0]
def pre(o, s): o['status'] = s + ' | ' + str(o.get('status'))
b['retro_runs'].append({'round': 385, 'decision': 'D-29z1288', 'window': '369-384', 'report': 'retros/retro-385.md',
  'lessons': 'lessons.md (60 lines): l.3 pointer; L29 recipe-reaches-branch, L31 covering set, L58 release proved in a browser, L59 heaviest-first + progressFile/stopSignal (tech-lead); diff b-round-384/lessons-diff.txt',
  'data': 'b-round-384/*.py run on b-round-384/backlog-before-385.json; outputs b-round-384/data/; retro-numbers-385.txt',
  'consults': {'tech-lead': 'used', 'product-designer': 'used (screen + journey review)', 'advisor': 'used (planning approach)', 'consequence-tester': 'not in the B consult list', 'qa-engineer': 'not in the B consult list', 'design-philosopher': 'not in the B consult list', 'first-visit-host': 'not in the B consult list'},
  'headline': '16 rounds, C PASS 13 / FAIL 1 (382) / BLOCKED 2 (376, 383); gate published 12, skipped 4, failed 0; $320.36 (B 195.21, A 102.83, C 22.32); B median 12.505; L57 15/16; screen unchanged vs 369',
  'status': 'dispatched (round 385)', 'added': ADDED, 'alias': 'RETRO-384 / "RETRO 384" in older entries = this retro'})
rp = b['retro_policy']
rp['next_due'] = 'round 400 or the end of STUDIO-PERFORMANCE, whichever first (retro 400 window 385-399) (D-29z1288) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, 'retro-385: counters for RETRO 400: unruled Medium+ found by A on B sketch 2/16 (376 M1, 382 M2; target 0); B-origin C FAIL 1/16 (382, B premise K32 with A and pre-existing; cap 3); C BLOCKED-for-time 1 (383; L59 3x); B median $12.505 (stop line $13.94); B share 60.9 %; L57 15/16; lessons 60; L23 5058 / L58 3717 bytes (trigger 5500); new clauses L29 recipe, L31 covering set, L58 browser release proof, L59 progressFile/stopSignal applied or not; ARCH leaf-plumbing answered or default task planned at RETRO 400; SYS-R369 decided')
for i, s in [
  ('RC-R305-LESSON-CHAR-CAP', 'watch to RETRO 400 (D-29z1289): L23 5058, L58 3717 bytes, trigger > 5500'),
  ('B-R365-COUNT-CLAIM-PLANNING-VS-FINAL', 'retired (D-29z1289): no second instance in 369-384 (b-round-384/data/fails-detail.txt); reopen on a second instance'),
  ('B-R382-SCOPED-LOCATORS', 'watch to RETRO 400 (D-29z1289): 1x; the round-384 task already pinned scoped locators (outerHTML of every Stop); B-R382-DUP-STOP-NAME deferred Low'),
  ('B-R382-UPDATER-CLOSURE-RETENTION', 'applied at RETRO 385 (D-29z1289): L58 clause "release is proved in a browser"'),
  ('C-R383-L59-EARLY-STOP', 'applied at RETRO 385 (D-29z1289): L59 clause heaviest-first + progressFile/stopSignal; checker enforcement = ROOT-REQ-L57-CHECK-PROGRESS'),
  ('C-R382-AUTH-CLAIM-MISMATCH', 'applied at RETRO 385 (D-29z1289): L29 clause "recipe reaches the branch"')]:
    pre(rc(i), s)
b['retro_candidates'].append({'id': 'RC-R376-COVERING-HEADROOM', 'decision': 'D-29z1289', 'round': 376, 'note': 'L31 checked only files gaining rows; TC10 (unchanged covering file) caused A STOP 376', 'status': 'applied at RETRO 385 (D-29z1289): L31 covering-set clause', 'added': ADDED})
ar = [r for r in b['architecture_checkpoint_requests'] if r['id'] == 'ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING'][0]
pre(ar, 'sent to Saba (D-29z1290, L46): user-review/questions-arch-leaf-plumbing.md; options A / B / B-actions (tech-lead recommends B-actions); default: d/e hold; if unanswered at RETRO 400, B plans B-actions as a normal bounded task; eleventh echo SIG-R384-USE-DECODED-SOURCES-HOOK')
ar['awaiting_user'] = 'questions-arch-leaf-plumbing.md (2026-11-07)'
st = [s for s in b['post_current_stage_queue'][7]['stages'] if s['id'] == 'PERF-11c-iii'][0]
pre(st, 'in_progress (D-29z1290): a..c2b done; d (VideoDock) and e (Lane) HOLD pending Saba answer on questions-arch-leaf-plumbing.md; default at RETRO 400 = B-actions task first, then d/e')
sy = [s for s in b['systemic_tasks'] if s['id'] == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR'][0]
pre(sy, 'queued_conditional (D-29z1290): ARCH-CHECKPOINT-PERF9-STEM-CACHE still unanswered by root; L46 default: if unanswered at RETRO 400, B plans it as a normal bounded task after PERF-13 (tech-lead: conditional queueing stalls)')
b['systemic_tasks'].append({'id': 'SYS-R385-LEAF-ACTIONS-CONTEXT', 'decision': 'D-29z1290',
  'closes': ['GATE371-L2-COMPARATOR-PER-KEY', 'GATE375-L2-COMPARATOR-UNSTABLE-PROP', 'GATE379-L3-ACTIONS-STABILITY-NOTE', 'GATE378-L2-LOOP-IMMUTABILITY-PIN', 'A-R371-REVIEW-GH5-IDENTITY', 'B-R374-MASTER-VACUOUS-NAME-COUNTS', 'GATE375-L1-UNUSED-WRAPPERS', 'GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO'],
  'scope': 'stable actions context for the Arrangement workspace (B-actions half of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING), one owner, behaviour-preserving tests; zustand data stores later',
  'status': 'awaiting_user (D-29z1290): user-review/questions-arch-leaf-plumbing.md; default at RETRO 400 if unanswered: planned as a normal bounded task before PERF-11c-iii-d/e', 'added': ADDED})
b['root_requests_b'].append({'id': 'ROOT-REQ-L57-CHECK-PROGRESS', 'added': ADDED, 'note': 'tools/l57-check.py does not check progressFile/stopSignal for BLOCKED-for-time C JSONs (L59 not enforced, 3x). Proposal: fail when taskStatus BLOCKED and progressFile or stopSignal is absent. B does not edit tools/; C writes the fields by L59 meanwhile', 'status': 'open (non-blocking)'})
b['screen_review_candidates'].append({'id': 'Q-SR-385-1', 'source': 'user-review/screen-review-385.md', 'evidence': 'b-round-384/screens/journey385-1-product-1440x900.png', 'text': 'question only: move "Try it in the Studio" into the purchase column next to the version cards? product-designer recommends keeping it until STEM-LANES and SRW-21', 'status': 'awaiting_user (D-29z1288)', 'added': ADDED})
for q in b['post_current_stage_queue']:
    for s in q.get('stages', []):
        if s.get('id') == 'STEM-LANES':
            s.setdefault('scope_additions', []).append('RETRO 385 journey row (D-29z1288, L54/L55): export the stem-set mix and read the file; the stems overlap in time (product-designer screen-review-385 section 3)')
b['rounds'].append({'round': 385, 'task': 'current-task.md', 'decision': 'D-29z1288..D-29z1292', 'type': 'RETRO 385 (window 369-384) + screen/journey review; no app code', 'status': 'dispatched', 'note': 'baseline 7295618 clean; frozen b-round-384/r385-tree-sha256.txt (1280); claims b-round-384/claims-385.sh; grants none', 'added': ADDED})
b['current_task'] = 'current-task.md (round 385: RETRO 385, window 369-384; no app code; A nothing; C traceability RT-* rows, script re-run under c-round-385/scripts, G385-AUTH, STUDIO-SMOKE-385 both viewports; frozen b-round-384/r385-tree-sha256.txt; claims b-round-384/claims-385.sh)'
sp = b['post_current_stage_queue'][7]
pre(sp, 'in_progress (D-29z1291): PERF-13b-i done (7295618); round 385 = RETRO 385; round 386 = GATE384-M1 + A-R383-REVIEW-L1 bug round; then REGRESSION-2026-11-08 (first planning on/after 2026-11-08 once 386 closes), PERF-13b-ii, 13c, 13d, 14, 15; 11c-iii-d/e hold for Saba')
b['regression_rounds'].append({'id': 'REGRESSION-2026-11-08', 'decision': 'D-29z1291', 'status': 'planned (D-29z1291): due at the first planning on or after 2026-11-08; if the round-386 Medium bug round is open then, the regression follows it', 'added': ADDED})
dec('D-29z1288', 'RETRO 385 outputs: retros/retro-385.md (window 369-384; "RETRO 384" ids resolve to it), user-review/screen-review-385.md (no new candidates; Q-SR-385-1 question only), STEM-LANES journey export row, retro_runs 385, retro_policy next_due round 400 or end of STUDIO-PERFORMANCE.')
dec('D-29z1289', 'Lessons (tech-lead, 60 lines kept, no line added): l.3 pointer; L29 recipe-reaches-branch; L31 covering set; L58 release proved in a browser; L59 heaviest-first + progressFile/stopSignal. Retro candidates: RC-R305 watch to 400; B-R365 retired; B-R382-SCOPED-LOCATORS watch; B-R382-UPDATER, C-R383-L59, C-R382-AUTH applied; RC-R376-COVERING-HEADROOM added as applied.')
dec('D-29z1290', 'Deadline dispositions (L46): ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING sent to Saba (questions-arch-leaf-plumbing.md); PERF-11c-iii-d/e hold; default at RETRO 400 = SYS-R385-LEAF-ACTIONS-CONTEXT (8 Lows) planned as a normal task. SYS-R369 gets the same RETRO 400 default. ROOT-REQ-L57-CHECK-PROGRESS filed.')
dec('D-29z1291', 'Order: 385 RETRO -> 386 GATE384-M1 + A-R383-REVIEW-L1 (+GATE384-L2 if cheap) -> REGRESSION-2026-11-08 -> PERF-13b-ii -> PERF-13c/13d/14/15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). A Medium+ from round 385 goes first.')
dec('D-29z1292', 'Root files root-pre-push-review.md and publication-checkpoint.json are dated 2026-10-07 (round 3); their findings were folded into the backlog long ago; nothing new to carry.')
b['version'] = 352; b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=1, ensure_ascii=False)
open(DONE, 'w').write('applied\n'); print('ok v352')
