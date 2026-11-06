# B round 368 -> 369 planning, part 2: RETRO 369 records. Run once from the loop root.
import json, os, sys

DONE = 'b-round-368/update-backlog-part2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
b = json.load(open('backlog.json'))
assert b['version'] == 332, b['version']
D = '2026-11-06'
ADDED = '2026-11-06 B round 368 -> 369 planning'

def dlog(i, t):
    b['decisions_log_b'].append({'id': i, 'date': D, 'text': t})

SYS_CLOSES = ['A-R367-REVIEW-L-c', 'A-R367-REVIEW-L-d', 'A-R367-REVIEW-L-e', 'A-R367-REVIEW-L-g', 'B-R367-TL3-1-JOIN-MICROTASK-GAP',
              'A-R368-REVIEW-L1', 'A-R368-REVIEW-L3', 'GATE368-L1-REMOVEFILE-SAME-NAME', 'GATE368-L3-QUEUED-BUFFER-RETENTION']

dlog('D-29z1212', 'RETRO 369 run (window 353-368, 16 rounds; slipped one round from 368, D-29z1209): report retros/retro-369.md; data b-round-368/*.py run on b-round-368/backlog-before-369.json, outputs in b-round-368/data/ (retro-numbers-369.txt indexes every number). Headline: C PASS 13 / FAIL 3 (357, 363, 367) / BLOCKED 0; gate published 12, skipped 4 (353, 357, 363, 367), failed 0; $287.91 (B 173.19, A 99.77, C 14.95; B share 60.2 %); chains 357-359, 363-364, 367-368 ($118.86); all FAILs B origin (357, 367 sketch missed a behaviour; 363 pre-check coverage/grant gap, tech-lead); L57 fields 16/16, origin 21/21. Consults: tech-lead (retro), product-designer (screen + journey); consequence-tester, qa-engineer, design-philosopher, first-visit-host not on the B consult list.')
dlog('D-29z1213', 'Lessons (tech-lead): 60 -> 60 lines, l.3, L30 (l.19), L58 (l.41) change (b-round-368/lessons-diff.txt). L58 gains "Reviewed = dispatched; ordering contracts get a matrix" (one review on the frozen sketch, reviewed sha = dispatched sha, delta re-review with both shas; event-kind x event-kind matrix for concurrency/ordering contracts, each cell a row id or ruled exclusion, C counts n^2 cells); L58 evidence parentheses shortened, no evidence id removed; 2931 -> 3430 bytes. L30 gains "Every test root is pre-run" (own config when test:run omits it, e.g. perf/lib; red file outside the grant is granted or the item changes). Candidates: RC-R305 watch to RETRO 384; RC-R333 retired; RC-R336 applied; RC-R344 applied in practice; RC-R297-* retired; B-R365-COUNT-CLAIM watch to RETRO 384; B-R366-*, B-R367-* adopted into L58.')
dlog('D-29z1214', 'Screen + journey review: user-review/screen-review-369.md (captures b-round-368/screens/, 12 PNG, rows 138/168/118/144 = retro 353, laneErrors none). No new candidates (product-designer). SR-353-4 marked duplicate_of SR-290-1/SR-290-2 (proposal to Saba to merge; stays awaiting_user).')
dlog('D-29z1215', 'Systemic task SYS-R369-STEM-CACHE-WRITE-COORDINATOR (closes 9 stem-cache Lows) queued after REGRESSION and before PERF-11, conditional on root ARCH-CHECKPOINT-PERF9-STEM-CACHE (extract / keep-fix -> runs; not now or no answer when reached -> PERF-11 starts, Lows stay deferred). Root request ROOT-REQ-B-RETRO-CONSULTS (add qa-engineer, consequence-tester, design-philosopher, first-visit-host to B consults on RETRO rounds; proposal). SYS-R353-DP-TEST-POLISH marked done (C round 355 PASS, gate 355 published).')
dlog('D-29z1216', 'Round 369 dispatched = RETRO 369 traceability round (current-task.md): no app code, A nothing to implement; C rows SOURCE-SCOPE, CLAIMS (b-round-368/claims-369.sh), RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA, RT-SCREEN (browser, mock), G369-AUTH, STUDIO-SMOKE-369 at both viewports, L57 checker. Outcome fixed in advance: PASS and planning on/after 2026-11-08 -> REGRESSION; PASS before 2026-11-08 -> SYS-R369 if root approved, else PERF-11. RETRO next_due round 384 or end of STUDIO-PERFORMANCE.')

b['rounds'].append({'round': 369, 'task': 'current-task.md', 'decision': 'D-29z1212..D-29z1216', 'type': 'RETRO 369 (window 353-368) + screen/journey review; no app code', 'status': 'dispatched', 'note': 'baseline 29f4b4d clean; claims b-round-368/claims-369.sh', 'added': ADDED})
b['current_task'] = 'current-task.md (round 369: RETRO 369 traceability round, window 353-368; no app code)'
b['retro_runs'].append({'round': 369, 'decision': 'D-29z1212', 'window': '353-368', 'report': 'retros/retro-369.md',
    'lessons': 'lessons.md (60 lines): L58 reviewed=dispatched + ordering matrix; L30 every test root pre-run; line 3 (tech-lead)',
    'data': 'b-round-368/*.py run on b-round-368/backlog-before-369.json; outputs b-round-368/data/; retro-numbers-369.txt',
    'consults': {'tech-lead': 'used', 'product-designer': 'used (screen + journey review)', 'consequence-tester': 'not in the B consult list', 'qa-engineer': 'not in the B consult list', 'design-philosopher': 'not in the B consult list', 'first-visit-host': 'not in the B consult list'},
    'headline': '16 rounds, C PASS 13 / FAIL 3 (357, 363, 367); gate published 12, skipped 4, failed 0; $287.91 (B 173.19, A 99.77, C 14.95); all FAILs B origin; L57 16/16',
    'status': 'dispatched (round 369)', 'added': ADDED})
rp = b['retro_policy']
rp['next_due'] = 'round 384 or the end of STUDIO-PERFORMANCE, whichever first (retro 384 window 369-383) (D-29z1216) | ' + rp['next_due']
rp['signals_for_next_retro'].insert(0, 'retro-369: counters for RETRO 384: unruled Medium+ found by A on B sketch 2/16 (357, 367; target 0); B-origin C FAIL 3/16 (cap 3); B median $11.46 (stop line $13.94); B share 60.2 %; L57 16/16; lessons 60; L23 5058 / L58 3430 bytes (trigger 5500); new L58 matrix and L30 pre-run clauses applied or not; SYS-R369 ran or not')

cand = {
    'RC-R305-LESSON-CHAR-CAP': 'watch to RETRO 384 (D-29z1213): L23 5058, L58 3430 bytes, trigger > 5500',
    'RC-R333-STALE-DERIVED-MUTANT': 'retired (D-29z1213): no second instance in 353-368 (b-round-368/data/fails-detail.txt); reopen on a second instance',
    'RC-R336-SCRIPT-OUTPUT-DIR': 'applied (D-29z1213): retro 369 scripts default to b-round-368/data/; C still runs copies under c-round-369/scripts/',
    'RC-R344-PROD-NAME-PROBES': 'applied in practice (D-29z1213): C probes in 365-368 ran on production builds (remix-serve)',
    'RC-R297-SCRATCH-CACHEDIR': 'retired (D-29z1213): never statused; no instance in 353-368 fails-detail; reopen on a second instance',
    'RC-R297-JSDOM-SSR-MUTANT': 'retired (D-29z1213): never statused; no instance in 353-368 fails-detail; reopen on a second instance',
    'B-R365-COUNT-CLAIM-PLANNING-VS-FINAL': 'watch to RETRO 384 (D-29z1213): 1x; L56 count clause covers it',
    'B-R366-SKETCH-MEDIUMS-UNRULED': 'adopted (D-29z1213): L58 RETRO 369 clause',
    'B-R366-V1-SKETCH-HIGHS': 'adopted (D-29z1213): L58 RETRO 369 clause',
    'B-R367-FINAL-SKETCH-UNREVIEWED': 'adopted (D-29z1213): L58 reviewed = dispatched',
    'B-R367-MUTANTS-MISSED-INTERACTION': 'adopted (D-29z1213): L58 ordering matrix',
}
seen = set()
for c in b['retro_candidates']:
    if c.get('id') in cand:
        c['status'] = cand[c['id']] + (' | ' + c['status'] if c.get('status') else '')
        seen.add(c['id'])
assert seen == set(cand), set(cand) - seen

for x in b['screen_review_candidates']:
    if x.get('id') == 'SR-353-4':
        x['duplicate_of'] = ['SR-290-1', 'SR-290-2']
        x['status'] = 'awaiting_user (D-29z1214): duplicate of SR-290-1/2 per product-designer; Saba asked once to merge (screen-review-369.md) | ' + str(x.get('status'))

b['systemic_tasks'].append({'id': 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR', 'decision': 'D-29z1215', 'closes': SYS_CLOSES,
    'scope': 'explicit per-key write state model (idle / reading / committing / deleting) in app/lib/arrangement/stem-cache.client.ts (or a sibling module if root says extract) + its test file + doc; L58 event-kind x event-kind matrix as rows; SC1-SC33 unchanged and green; public surface { fetchSource, idle } unchanged (tech-lead opinion)',
    'condition': 'root ARCH-CHECKPOINT-PERF9-STEM-CACHE answer: extract / keep-fix -> runs after REGRESSION, before PERF-11; not now or no answer when reached -> skip, PERF-11 starts, Lows stay deferred',
    'status': 'queued_conditional (D-29z1215)', 'added': ADDED})
for t in b['systemic_tasks']:
    if t.get('id') == 'SYS-R353-DP-TEST-POLISH':
        t['status'] = 'done (D-29z1215): C round 355 PASS, gate 355 published | ' + str(t.get('status'))
for f in b['deferred_low_polish'] + b['open_findings']:
    if f.get('id') in SYS_CLOSES:
        f['status'] = 'scheduled in SYS-R369-STEM-CACHE-WRITE-COORDINATOR (conditional, D-29z1215) | ' + str(f.get('status'))

b['root_requests_b'].append({'id': 'ROOT-REQ-B-RETRO-CONSULTS', 'decision': 'D-29z1215', 'blocking': False,
    'status': 'proposal: on RETRO rounds add qa-engineer, consequence-tester, design-philosopher, first-visit-host to the B consult list (retro_policy and the whole-screen rule name them; 2026-11-04 section 6 says root adds them back as needed); missing at RETRO 353 and 369', 'added': ADDED})

sp = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
sp['execution_order_d29z1216'] = 'RETRO 369 (window 353..368) -> REGRESSION at the first planning on/after 2026-11-08 -> SYS-R369-STEM-CACHE-WRITE-COORDINATOR (only if root ARCH-CHECKPOINT-PERF9-STEM-CACHE approves) -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). PERF-9c awaiting_user; PERF-9d root.'

b['version'] = 333
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=2)
open(DONE, 'w').write('applied v333\n')
print('ok v333')
