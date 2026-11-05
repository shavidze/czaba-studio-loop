# B round 352 -> 353 planning, part 2: RETRO 353 records. Run once from the loop root: python3 -I b-round-352/update-backlog-part2.py
import json, pathlib, sys

P = pathlib.Path('backlog.json')
DONE = pathlib.Path('b-round-352/update-backlog-part2.done')
if DONE.exists():
    sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 315, b['version']
TODAY = '2026-11-05'
ADDED = '2026-11-05 B round 352 -> 353 planning'


def dlog(i, text):
    assert all(d['id'] != i for d in b['decisions_log_b']), i
    b['decisions_log_b'].append({'id': i, 'date': TODAY, 'text': text})


def find(lst, i):
    for e in lst:
        if e.get('id') == i:
            return e
    raise KeyError(i)


dlog('D-29z1130', 'RETRO 353 run (window 336-352, 17 rounds; second slip from 351, D-29z1122/D-29z1126): report retros/retro-353.md; data b-round-352/*.py, *.txt, *.json run on b-round-352/backlog-before-353.json (retro-numbers-353.txt indexes every number). Headline: C PASS 14 / FAIL 2 (350, 351) / BLOCKED 1 (340); gate published 11, skipped 6, failed 0; $277.65 (B 160.75, A 86.52, C 30.38; B share 57.9 %); one chain 350-352 ($43.44), both failures B origin and both a rule that existed but was not applied (L58). Consults: tech-lead (retro), product-designer (screen + journey); consequence-tester, qa-engineer, design-philosopher, first-visit-host not on the B consult list (2026-11-04 section 6).')
dlog('D-29z1131', 'Lessons (tech-lead): 60 -> 60 lines, l.3, L28, L57, L58 change (b-round-352/lessons-diff.txt). L58 sketch-review clause replaced: sketch-review.md opens with the dispatched sketch sha256 and rules each Medium+ by id (tech-lead while code-reviewer is off B list); every predicted mutant has a mutant-<id>.log run with the new tests whose [K#] greps the red row (adopts RC-R351-SKETCH-REVIEW-SKIPPED + RC-R350-MUTANT-PAIR-UNRUN); L58 2803 -> 2908 bytes. L57 gains tools/l57-check.py: C does not hand off until it exits 0 (absence = C bookkeeping, not a row FAIL); B runs it at planning (c-round-352: rc 1, 9 fields absent, b-round-352/l57-check-c352.txt). L28 gains the no-pending clause (adopts RC-R351-L28-PENDING-FORM); doc 232 l.4 is rewritten to the L28 form by the next task that touches it (video stage 2).')
dlog('D-29z1132', 'Systemic task SYS-R353-DP-TEST-POLISH (test-only, drag-preview-render.test.tsx + doc 232): closes A-R350-REVIEW-TEST-NITS, A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION (GATE352-S3 joined); queue after PERF-CAND-VIDEO-TRIM-FADE-COST stage 2, before PERF-CAND-MASTER-GROUP-FADER-PROPS. cachedLane (A-R350-REVIEW-CACHED-TRACKS, GATE352-S1) stays a Low with one trigger: the next task that touches the dock fixes it first (tech-lead).')
dlog('D-29z1133', 'EXP-R321-PRECHECK-GATES closed: not evaluable as specified (treatment never delivered; stop and null not met; countermetric A median 322-337 $5.35); successor affectedChecks fields unusable (absent 8-9 of 16). No new experiment until tools/l57-check.py gives about 5 consecutive complete JSONs (tech-lead). Candidate dispositions: RC-R332-COMPARATOR-BRANCH closed not adopted (no recurrence in two windows); RC-R305-LESSON-CHAR-CAP, RC-R333-STALE-DERIVED-MUTANT (possible 2x, inference: C-R345-CAPTION-MUTANT-GAP), RC-R336-SCRIPT-OUTPUT-DIR (2x: collect/classify/awaiting-user still default to b-round-352/; C copies them in round 353), RC-R344-PROD-NAME-PROBES watch to RETRO 368. ROOT-REQ-PERF-TIMEOUT -> one Saba question (retro-353 section 12.1). Screen review: user-review/screen-review-353.md, SR-353-1..5 awaiting_user (product-designer: SR-353-1 modify, park behind STEM-LANES).')
dlog('D-29z1134', 'Round 353 dispatched = RETRO 353 traceability round (current-task.md): no app code, A nothing to implement; C rows SOURCE-SCOPE, CLAIMS (b-round-352/claims-353.sh), RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA, RT-SCREEN (browser, mock), G353-AUTH and STUDIO-SMOKE-353 at both viewports, L57 checker. Outcome table fixed in advance: PASS -> round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (22 video rows record -> assert at C round 350 values, budgets only, no new interactions rows; doc 232 l.4 to L28 form), unless planning date >= 2026-11-08 (then REGRESSION in two parts first). RETRO next_due round 368 or end of STUDIO-PERFORMANCE.')

b['rounds'].append({'round': 353, 'task': 'current-task.md', 'decision': 'D-29z1130..D-29z1134', 'type': 'RETRO 353 (window 336-352) + screen/journey review; no app code', 'status': 'dispatched', 'note': 'baseline a55543b clean; claims b-round-352/claims-353.sh', 'added': ADDED})

b['retro_runs'].append({'round': 353, 'decision': 'D-29z1130', 'window': '336-352', 'report': 'retros/retro-353.md', 'lessons': 'lessons.md (60 lines): L58 sketch review + mutant logs as claims; L57 tools/l57-check.py; L28 no pending form; line 3 pointer (tech-lead)', 'data': 'b-round-352/*.py, *.txt, *.json (run on backlog-before-353.json); retro-numbers-353.txt', 'consults': {'tech-lead': 'used', 'product-designer': 'used (screen + journey review)', 'consequence-tester': 'not in the B consult list', 'qa-engineer': 'not in the B consult list', 'design-philosopher': 'not in the B consult list', 'first-visit-host': 'not in the B consult list'}, 'headline': '17 rounds, C PASS 14 / FAIL 2 (350, 351) / BLOCKED 1 (340); gate published 11, skipped 6, failed 0; $277.65 (B 160.75, A 86.52, C 30.38); one chain 350-352, B origin, rules existed but were not applied; EXP-R321 closed not evaluable', 'status': 'dispatched (round 353)', 'added': ADDED})

rp = b['retro_policy']
rp['next_due'] = 'round 368 or the end of STUDIO-PERFORMANCE, whichever first (retro 368 window 353-367) (D-29z1134)'
rp['signals_for_next_retro'].insert(0, 'retro-353: counters for RETRO 368: C FAIL 2/17, gate failed 0, STOPs reaching C 2, B median $9.98 (337-352), B share 57.9 %, lessons 60, L23 5058 / L58 2908 bytes; L57 checker rc 0 rate per C JSON (tools/l57-check.py; c-round-352 rc 1); FAILs caused by a rule that existed but was not applied (350, 351); SYS-R353-DP-TEST-POLISH done or not; watch RC-R333-STALE-DERIVED-MUTANT, RC-R336-SCRIPT-OUTPUT-DIR, RC-R344-PROD-NAME-PROBES, RC-R305-LESSON-CHAR-CAP (trigger > 5500 bytes)')

disp = {
    'RC-R351-SKETCH-REVIEW-SKIPPED': 'adopted (D-29z1131): L58 sketch-review.md with sha256 and per-id rulings',
    'RC-R350-MUTANT-PAIR-UNRUN': 'adopted (D-29z1131): L58 mutant-<id>.log whose [K#] greps the red row',
    'RC-R351-L28-PENDING-FORM': 'adopted (D-29z1131): L28 no-pending clause; doc 232 l.4 fixed by the next task touching it',
    'RC-R332-COMPARATOR-BRANCH': 'closed, not adopted (D-29z1133): no recurrence in windows 336-352',
    'RC-R333-STALE-DERIVED-MUTANT': 'watch to RETRO 368 (D-29z1133): possible 2x by inference (C-R345-CAPTION-MUTANT-GAP)',
    'RC-R336-SCRIPT-OUTPUT-DIR': 'watch to RETRO 368 (D-29z1133): 2x (collect.py, classify.py, awaiting-user.py default to b-round-352/); round 353 C copies them; next retro scripts take the output folder',
    'RC-R344-PROD-NAME-PROBES': 'watch to RETRO 368 (D-29z1133): 1x, names probes ran on dev since',
    'RC-R305-LESSON-CHAR-CAP': 'watch to RETRO 368 (D-29z1133): L23 5058, L58 2908 bytes, trigger > 5500',
}
for i, st in disp.items():
    r = find(b['retro_candidates'], i)
    r['status'] = st + (' | ' + r['status'] if r.get('status') else '')

rr = find(b['root_requests_b'], 'ROOT-REQ-PERF-TIMEOUT')
rr['status'] = 'question to Saba (L46, D-29z1133): retros/retro-353.md section 12.1 (raise the limit or split the spec by family, checkpoint question 3); until answered no new interactions-spec rows | ' + rr['status']
b['root_requests_b'].append({'id': 'ROOT-REQ-B-CONSULT-CODE-REVIEWER', 'file': 'retros/retro-353.md section 12.4', 'decision': 'D-29z1131', 'blocking': False, 'status': 'proposal: add code-reviewer to the B consult list so the L58 sketch review uses it; tech-lead substitutes until then', 'added': ADDED})

b['systemic_tasks'].append({'id': 'SYS-R353-DP-TEST-POLISH', 'decision': 'D-29z1132', 'closes': ['A-R350-REVIEW-TEST-NITS', 'A-R352-REVIEW-COMMIT-EXACT', 'A-R352-REVIEW-DRAG-DISTANCE', 'A-R352-REVIEW-WINDOW-PRECONDITION'], 'scope': 'test-only: app/lib/arrangement/__tests__/drag-preview-render.test.tsx + doc 232; no app source change', 'acceptance': 'each tightened assert has a mutant red on B sketch (L58 log); the DP66-DP72 mutant map unchanged; test count >= 74; DP70 caption/gap checks able to fail; no fixed real-time wait as the only no-write proof', 'queue': 'after PERF-CAND-VIDEO-TRIM-FADE-COST stage 2, before PERF-CAND-MASTER-GROUP-FADER-PROPS', 'status': 'not_started', 'added': ADDED})
for i in ['A-R350-REVIEW-TEST-NITS', 'A-R352-REVIEW-COMMIT-EXACT', 'A-R352-REVIEW-DRAG-DISTANCE', 'A-R352-REVIEW-WINDOW-PRECONDITION']:
    for lst in (b['deferred_low_polish'], b['open_findings']):
        for e in lst:
            if e.get('id') == i:
                e['status'] = 'scheduled in SYS-R353-DP-TEST-POLISH (D-29z1132) | ' + e.get('status', '')
for lst in (b['deferred_low_polish'], b['open_findings']):
    for e in lst:
        if e.get('id') in ('A-R350-REVIEW-CACHED-TRACKS', 'GATE352-S1'):
            e['trigger_d29z1132'] = 'the next task that touches ArrangementVideoDock.tsx fixes it first (cachedLane.tracks === base.tracks or rebuild); one trigger (tech-lead)'

sr = [
    ('SR-353-1', 'journey353-2-studio-playing-1440x900.png, -1280x720.png', 'after Add the chosen clip (Melody, left 2432 px) is off-screen at both viewports; product-designer: modify - park behind STEM-LANES, or scroll only when stopped and only to bring the clip edge into view; Live behaviour unknown'),
    ('SR-353-2', 'journey353-2-studio-playing-1440x900.png', 'clip name shown 3-4 times in the bottom third (Clip details header, body, status row 2); proposal: status row 2 only while Clip details is collapsed'),
    ('SR-353-3', 'journey353-2-studio-playing-1440x900.png', 'permanent sentence "The source file stays unchanged" in Clip details; proposal: tooltip on Source offset or the ? sheet'),
    ('SR-353-4', 'journey353-3-export-1280x720.png', 'export range text shown twice (subtitle and Range); Range options below the fold at 1280 (screenshot, not DOM-measured); proposal: drop the subtitle'),
    ('SR-353-5', 'journey353-1b-studio-arrival-1440x900.png', '"Original sound" label under the video fader in an audio-only project; SABA-B-8 kept it, so question only'),
]
for i, ev, text in sr:
    b['screen_review_candidates'].append({'id': i, 'source': 'user-review/screen-review-353.md', 'evidence': 'b-round-352/screens/' + ev, 'text': text, 'status': 'awaiting_user (D-29z1133)', 'added': ADDED})

sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
sp['status'] = 'in_progress (D-29z1134): round 353 = RETRO 353; round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (or REGRESSION first if planned on/after 2026-11-08) | ' + sp['status']
sp['execution_order_d29z1134'] = [
    '353 RETRO 353 (traceability)',
    '354 PERF-CAND-VIDEO-TRIM-FADE-COST stage 2: 22 video rows record -> assert at C round 350 values (budgets only, no new interactions rows); doc 232 l.4 to the L28 form',
    'REGRESSION due on or after 2026-11-08 (two parts, mock API health first)',
    'SYS-R353-DP-TEST-POLISH (test-only)',
    'PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing',
    'PERF-CAND-FADE-RELEASE-COMMITS',
    'PERF-9..15',
    'SYS-R2-FAKE-FIDELITY',
    'SYS-CLOCK-DETERMINISM',
    'then STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase-2 entries (skip rule)',
]
sp['stages'].append({'id': 'SYS-R353-DP-TEST-POLISH', 'status': 'not_started (D-29z1132)', 'see': 'systemic_tasks'}) if all(s.get('id') != 'SYS-R353-DP-TEST-POLISH' for s in sp['stages']) else None

b['current_task'] = 'current-task.md (round 353: RETRO 353, window 336-352)'
b['version'] = 316
b['updated'] = ADDED
P.write_text(json.dumps(b, indent=2))
DONE.write_text('ok\n')
print('ok v316')
