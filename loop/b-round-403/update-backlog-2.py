# B round 403 -> 404 planning: backlog v372 -> v373 (part 2: round 404 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-403/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 372, b['version']
REVIEW = sys.argv[1] if len(sys.argv) > 1 else 'see b-round-403/sketch-review.md'
BY = '2026-11-08 B round 403 -> 404 planning'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def one(idv):
    h = node(idv); assert len(h) == 1, (idv, len(h)); return h[0]
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
decisions = [
 ('D-29z1392', f"Round 404 = SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 of 2 from b-round-403/sketch-404.patch.txt (sha256 9c0cdbc99e9e (v2; v1 022c2184 kept as sketch-404-v1.patch.txt), 8 files): ArrangementActionsContext = useMemo over the 34 bundle callbacks, useArrangementActions(), 4 bundle hooks narrowed, StudioWorkspace + 4 wrappers fed from it; new actions-context.test.tsx AC1-AC6. Option B (hoisted memo) per tech-lead consult (b-round-403/consult-tech-lead-sys-r385.md); option A (ref delegation) rejected: hides instability, 2 rounds. L58 evidence: mutants 9/9 red + 1 green control, full vitest 262/3876, tsc/lint/biome rc 0, interactions spec 189/189 deterministic rows equal c-round-402. Review: {REVIEW}. Baseline cc5cbc6; frozen b-round-403/r404-frozen-sha256.txt (1290); grants b-round-403/grants-404.txt (9); claims b-round-403/claims-404.sh."),
 ('D-29z1393', "SYS-R385 stage 1 closes on C PASS: GATE379-L3-ACTIONS-STABILITY-NOTE (AC2), GATE378-L2-LOOP-IMMUTABILITY-PIN (AC4), GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO (AC5). Stage 2 keeps GATE371-L2, GATE375-L2, A-R371-REVIEW-GH5-IDENTITY, B-R374-MASTER-VACUOUS-NAME-COUNTS. GATE375-L1-UNUSED-WRAPPERS stays open (a deletion needs owner permission per CLAUDE.md; ask Saba with stage 2)."),
 ('D-29z1394', "Doc 258 docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md, l.4 'In Progress (stage 1 of 2; C round 404 PASS)'."),
 ('D-29z1395', "Order after round 404: SYS-R385 stage 2 (comparator/test Lows), then PERF-11c-iii-d/e unblocked by SYS-R385, PERF-15 (client side + backend handoff), SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. PERF-14c-ii/iii wait for SABA-Q-PERF14C-PYRAMID-CANVAS."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
s = one('SYS-R385-LEAF-ACTIONS-CONTEXT')
pre(s, 'in_progress (D-29z1392): stage 1 of 2 dispatched round 404 (b-round-403/sketch-404.patch.txt); stage 2 = comparator/test Lows')
s['stages_d29z1392'] = [
 {'id': 'SYS-R385-1', 'what': 'ArrangementActionsContext over the 34 bundle callbacks + useArrangementActions + narrowed bundle hooks + AC1-AC6', 'status': 'dispatched (D-29z1392): round 404', 'closes': ['GATE379-L3-ACTIONS-STABILITY-NOTE', 'GATE378-L2-LOOP-IMMUTABILITY-PIN', 'GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO']},
 {'id': 'SYS-R385-2', 'what': 'per-key comparators (GATE371-L2, GATE375-L2), GH5 keyed on group.id (A-R371-REVIEW-GH5-IDENTITY), Master name counts on ArrangementMasterViewInner (B-R374); GATE375-L1 wrapper deletion only with Saba permission', 'status': 'not_started'},
]
for tl, title in [
 ('TL-R403-SK-L1', 'ArrangementActions: the 34 names are hand-kept in 3 places (type, object, deps); biome useExhaustiveDependencies is warn, so a dropped dep only warns'),
 ('TL-R403-SK2-L1', 'actions-context AC4: expect(loop).not.toBeNull() adds nothing after toEqual'),
 ('TL-R403-SK2-L2', 'actions-context AC4: the markers array is not frozen (tsc readonly blocks a push)'),
 ('TL-R403-SK2-L3', 'actions-context AC5: the comment strip may swallow a /* inside a string; trailing // comments are not stripped'),
]:
    b['deferred_low_polish'].append({'id': tl, 'severity': 'low', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-403/sketch-review.md', 'title': title, 'status': 'deferred_low_polish (D-29z1392); fix home: SYS-R385-2', 'added': BY})
for tl, title in [
 ('TL-R403-SK-M1', 'AC1 could pass vacuously (only the mute step was proven to take effect)'),
 ('TL-R403-SK-M2', 'AC4 / MU-404-LOOP-SPREAD tested identity, not immutability'),
 ('TL-R403-SK-M3', 'MU-404-TRANSITION injected a string, not an API use; AC5 read comments'),
]:
    b['open_findings'].append({'id': tl, 'severity': 'medium', 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-403/sketch-review.md', 'title': title, 'status': 'closed (D-29z1392): fixed before dispatch in sketch v2; sketch input, never in app code', 'added': BY})
for o in node('GATE378-L2-LOOP-IMMUTABILITY-PIN'):
    o['scope_note_d29z1393'] = 'AC4 covers only the loop and marker objects present at mount, through track mute, Master mute and a marker commit; not later loop objects, other edit paths (drag, trim, split, loop-brace step) or the markers array (b-round-403/sketch-review.md pass 2)'
for lid in ['GATE379-L3-ACTIONS-STABILITY-NOTE', 'GATE378-L2-LOOP-IMMUTABILITY-PIN', 'GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO']:
    for o in node(lid):
        pre(o, 'fix_dispatched (D-29z1393): round 404 SYS-R385-1; closes on C round 404 PASS')
q7 = b['post_current_stage_queue'][7]
assert q7['id'] == 'STUDIO-PERFORMANCE'
pre(q7, 'in_progress (D-29z1395): PERF-14 stages 1-4 done (cc5cbc6), 14c-ii/iii awaiting_user; round 404 = SYS-R385-1')
b['rounds'].append({'round': 404, 'task': 'current-task.md', 'decision': 'D-29z1388..D-29z1395', 'type': 'SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 of 2 (stable actions context; behaviour-preserving)', 'status': 'dispatched', 'note': 'baseline cc5cbc6 clean; frozen b-round-403/r404-frozen-sha256.txt (1290); grants b-round-403/grants-404.txt (9); patch b-round-403/sketch-404.patch.txt; claims b-round-403/claims-404.sh', 'added': BY})
b['current_task'] = 'Round 404: SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 of 2 from B reviewed sketch b-round-403/sketch-404.patch.txt (current-task.md)'
b['version'] = 373
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v372 -> v373 (part 2)\n')
print('ok v373')
