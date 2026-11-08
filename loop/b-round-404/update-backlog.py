# B round 404 -> 405 planning: backlog v373 -> v374 (acceptance of round 404 + round 405 dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-404/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 373, b['version']
BY = '2026-11-08 B round 404 -> 405 planning'
SHA = 'c64a5589ed319464'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def every(idv):
    h = node(idv); assert len(h) >= 1, idv; return h
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
decisions = [
 ('D-29z1396', "Round 404 (SYS-R385-LEAF-ACTIONS-CONTEXT stage 1) accepted on independent C evidence: c-round-404.json taskStatus PASS, 8 rows passed (SOURCE-SCOPE start/end, PATCH-IDENTITY, AUTH both viewports, LEAF-ACTIONS 32 steps x 2 viewports equal to pre-patch HEAD with a real AudioContext, INTERACT 189/189 deterministic rows equal, UNIT+MUTANT 9/9 red on the tree, DOCS), browserVerified/realVerified true, L57 check OK (b-round-404/l57-check-c404.txt); gate 404 published dd52107 on both remotes. Closed: GATE379-L3-ACTIONS-STABILITY-NOTE, GATE378-L2-LOOP-IMMUTABILITY-PIN (scope of D-29z1393 only), GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO. Fake-bearer token row stays BLOCKED (backend unavailable in cloud) as open evidence."),
 ('D-29z1397', "Round 404 findings: C-R404-A-AC1-COVERAGE ruled Low by B (A's reviewer said Medium, C Low): a coverage gap in a dispatched test, no behaviour impact, mutants 9/9 red; A did not edit it because reviewed = dispatched (D-29z1392, L58); fix home SYS-R385-2 (round 405 AC7). A-R404-REVIEW-AC2-ALL-KEYS and gate-404 item 1 are the same gap (AC7's all-34-keys identity loop), not filed twice. A-R404-REVIEW-LIBRARY-PARAM -> SYS-R385-2. C-R404-B-LOOP-OFF-WORDING closed: B task wording error (row said the brace hides; it shows 'Loop off', identical on HEAD); covered by L29 (an untagged behaviour premise in a row), no new lesson. Gate 404 items 2 (redundant hook memo layer) and 3 (hook param same type as return) -> deferred_low_polish GATE404-L2-REDUNDANT-HOOK-MEMO, GATE404-L3-HOOK-PARAM-SAME-TYPE. Gate-404 Architecture note (derive the 34 Pick keys from one const tuple) = TL-R403-SK-L1 / A-R404 Architecture note (keep); recorded as an echo on TL-R403-SK-L1, not a new task."),
 ('D-29z1398', "GATE375-L1-UNUSED-WRAPPERS (delete the ArrangementLibrary/ArrangementLibraryPreview/ArrangementLoopBrace wrappers; Transport and Master have the same shape) goes to Saba as SABA-Q-UNUSED-LEAF-WRAPPERS (user-review/questions-unused-leaf-wrappers.md), awaiting_user: CLAUDE.md requires owner permission for any deletion. B recommends (a) keep until PERF-11c-iii-d/e, then one wrapper policy for all leaves. Not in SYS-R385-2; the loop does not wait for it."),
 ('D-29z1399', "GATE371-L2-COMPARATOR-PER-KEY and GATE375-L2-COMPARATOR-UNSTABLE-PROP: tech-lead consult (b-round-404/consult-tech-lead-stage2.md) = close as covered, no production change: a type rule cannot reject Object.is (typed (any, any) => boolean); GH2 and RB-LEAF3 already go red on the regressions the findings describe. B evidence on the sketch: MU-405-GH2-CANDIDATES-OBJECTIS, MU-405-GH2-OVERVIEW-OBJECTIS (GH2 red), MU-405-RBLEAF3-INLINE-WORKSPACE, MU-405-RBLEAF3-INLINE-LIBRARY (RB-LEAF3 red) in b-round-404/mutants/summary.txt. They close on C round 405's mutant row run on the tree. A residual (an inline prop new only in an untested state) exists under every option; recorded, not a finding."),
 ('D-29z1400', f"Round 405 = SYS-R385-2 (final stage of SYS-R385) from b-round-404/sketch-405.patch.txt (sha256 {SHA}..., v2 after tech-lead pass 1; 6 files: ArrangementLibrary.tsx param rename workspace -> actions; actions-context AC7 + AC4 markers freeze; fader-pointer-preview FP0 + live name; master-ui live name + counts.clear; render-budget RB-LEAF1 vacuous line removed (the ArrangementMasterViewInner line stays); selection-wrappers-render GH5 group ids) + doc 258 stage-2 section, l.4 'Completed (C round 405 PASS)'. Closes on C PASS: C-R404-A-AC1-COVERAGE, A-R404-REVIEW-AC2-ALL-KEYS, A-R404-REVIEW-LIBRARY-PARAM, B-R374-MASTER-VACUOUS-NAME-COUNTS, A-R371-REVIEW-GH5-IDENTITY, GATE371-L2, GATE375-L2, TL-R403-SK2-L1, TL-R403-SK2-L2, TL-R405-SK-L1..L4. TL-R403-SK2-L3 (comment-strip edges) and TL-R403-SK-L1 (34 names in 3 places) stay deferred. Evidence: mutants 14/14 red, gap mutants keep AC1/AC2 green (b-round-404/mutants/summary.txt); tsc/lint/Biome rc 0; full vitest b-round-404/precheck-full.log. No runtime change except a local parameter name, so no perf-spec row is asserted (L58: record only)."),
 ('D-29z1401', "INFO-C404-MARKER-SEEK-RECIPE: C round 404 row 4 placed the marker at 0 s (step 23 ArrowRight did not move the playhead), so 'Next marker' from 0 fell back to the project end 19.000 s (adjacentMarkerTarget end fallback; clip 3 s + 16 s); identical on HEAD. Not a bug; the marker-seek half of the row was not exercised. Next C row that seeks to a marker places it at a non-zero time and reads the clock."),
 ('D-29z1402', "Order after round 405: PERF-11c-iii-d (VideoDock leaf) then PERF-11c-iii-e (Lane leaf), both unblocked by SYS-R385 (stage 1 done; B-actions default of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING); then PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. SYS-R385 end = feature boundary of the leaf-plumbing work: bounded frontend-architect checkpoint ARCH-CHECKPOINT-SYS-R385-ACTIONS requested of root (b-round-404/root-request-arch-checkpoint-sys-r385.md), non-blocking."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
s = every('SYS-R385-LEAF-ACTIONS-CONTEXT')[0]
pre(s, f'in_progress (D-29z1400): stage 1 done (C round 404 PASS, gate 404 dd52107); stage 2 dispatched round 405 (b-round-404/sketch-405.patch.txt sha {SHA})')
pre(every('SYS-R385-1')[0], 'done (D-29z1396): C round 404 PASS (browserVerified true), gate 404 published dd52107')
s2 = every('SYS-R385-2')[0]
pre(s2, 'dispatched (D-29z1400): round 405; comparators closed as covered by mutants (D-29z1399); GATE375-L1 to Saba (D-29z1398)')
s2['closes_d29z1400'] = ['C-R404-A-AC1-COVERAGE', 'A-R404-REVIEW-AC2-ALL-KEYS', 'A-R404-REVIEW-LIBRARY-PARAM', 'B-R374-MASTER-VACUOUS-NAME-COUNTS', 'A-R371-REVIEW-GH5-IDENTITY', 'GATE371-L2-COMPARATOR-PER-KEY', 'GATE375-L2-COMPARATOR-UNSTABLE-PROP', 'TL-R403-SK2-L1', 'TL-R403-SK2-L2', 'TL-R405-SK-L1', 'TL-R405-SK-L2', 'TL-R405-SK-L3', 'TL-R405-SK-L4']
for lid in ['GATE379-L3-ACTIONS-STABILITY-NOTE', 'GATE378-L2-LOOP-IMMUTABILITY-PIN', 'GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO']:
    for o in every(lid):
        pre(o, 'closed (D-29z1396): C round 404 PASS, published dd52107')
for lid in ['B-R374-MASTER-VACUOUS-NAME-COUNTS', 'A-R371-REVIEW-GH5-IDENTITY', 'TL-R403-SK2-L1', 'TL-R403-SK2-L2']:
    for o in every(lid):
        pre(o, 'fix_dispatched (D-29z1400): round 405 SYS-R385-2; closes on C round 405 PASS')
for lid in ['GATE371-L2-COMPARATOR-PER-KEY', 'GATE375-L2-COMPARATOR-UNSTABLE-PROP']:
    for o in every(lid):
        pre(o, 'closing_on_evidence (D-29z1399): covered by GH2 / RB-LEAF3 per tech-lead; closes when C round 405 mutant rows are red on the tree')
for lid in ['TL-R403-SK2-L3', 'TL-R403-SK-L1']:
    for o in every(lid):
        pre(o, 'deferred_low_polish (D-29z1400): not in SYS-R385-2; stays for the polish pass')
for o in every('TL-R403-SK-L1'):
    o['gate404_echo_d29z1397'] = 'gates/round-404/review.md Architecture note (derive Pick keys from one const tuple; keep) and a-round-404.md Architecture note: same item'
for o in every('GATE375-L1-UNUSED-WRAPPERS'):
    pre(o, 'awaiting_user (D-29z1398): SABA-Q-UNUSED-LEAF-WRAPPERS, user-review/questions-unused-leaf-wrappers.md')
new_low = [
 ('C-R404-A-AC1-COVERAGE', 'C (A code-reviewer A-R404-REVIEW-AC1-COVERAGE, dispatched test)', 'c-round-404.json bugs[0]; a-round-404.md', 'actions-context AC1 never runs selectSource/sourceStates, so a callback dependency on them would stay green', 'fix_dispatched (D-29z1397/D-29z1400): round 405 AC7; closes on C round 405 PASS'),
 ('A-R404-REVIEW-AC2-ALL-KEYS', 'A code-reviewer', 'a-round-404.md; gates/round-404/review.md item 1', 'AC2 checks toBe on 4 of the 34 action keys', 'fix_dispatched (D-29z1400): round 405 AC7 all-keys loop'),
 ('A-R404-REVIEW-LIBRARY-PARAM', 'A code-reviewer', 'a-round-404.md', 'useArrangementLibraryActions parameter still named workspace (the other 4 bundle hooks use actions)', 'fix_dispatched (D-29z1400): round 405 rename'),
 ('C-R404-B-LOOP-OFF-WORDING', 'B spec', 'c-round-404.json bugs[1]', 'round-404 row 4 said the loop brace hides on Loop off; it stays as "Loop off" (identical on HEAD)', 'closed (D-29z1397): task wording; L29 covers it'),
 ('TL-R405-SK-L1', 'B sketch (tech-lead pass 1)', 'b-round-404/sketch-review.md', "render-budget RB-LEAF1 kept a vacuous 'ArrangementMaster' toBe(0) line", 'closed (D-29z1400): fixed in sketch v2 before dispatch; sketch input, never in app code'),
 ('TL-R405-SK-L2', 'B sketch (tech-lead pass 1)', 'b-round-404/sketch-review.md', 'mountProbe gained an unused collection parameter', 'closed (D-29z1400): fixed in sketch v2 before dispatch'),
 ('TL-R405-SK-L3', 'B sketch (tech-lead pass 1)', 'b-round-404/sketch-review.md', 'AC7 preview step relied on two microtask turns', 'closed (D-29z1400): fixed in sketch v2 (waitFor)'),
 ('TL-R405-SK-L4', 'B sketch (tech-lead pass 1)', 'b-round-404/sketch-review.md', 'AC7 gain check passed after preview alone', 'closed (D-29z1400): fixed in sketch v2 (undoLabel Master Volume; MU-405-MASTER-COMMIT-SKIP)'),
]
for fid, origin, ev, title, st in new_low:
    b['open_findings'].append({'id': fid, 'severity': 'low', 'origin': origin, 'evidence': ev, 'title': title, 'status': st, 'added': BY})
for fid, title in [
 ('GATE404-L2-REDUNDANT-HOOK-MEMO', 'bundle hooks still destructure fields into a memo over the already-stable actions object (redundant layer; harmless)'),
 ('GATE404-L3-HOOK-PARAM-SAME-TYPE', 'bundle hook parameter type equals its return type (the hook no longer narrows its input; cosmetic)'),
]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'gate 404 reviewer', 'evidence': 'gates/round-404/review.md', 'title': title, 'status': 'deferred_low_polish (D-29z1397)', 'added': BY})
b['open_findings'].append({'id': 'SABA-Q-UNUSED-LEAF-WRAPPERS', 'severity': 'info', 'origin': 'B (GATE375-L1)', 'evidence': 'user-review/questions-unused-leaf-wrappers.md', 'title': 'delete, keep or move the test-only leaf wrappers (Library, LibraryPreview, LoopBrace, Transport, Master)', 'status': 'awaiting_user (D-29z1398)', 'added': BY})
b['open_findings'].append({'id': 'INFO-C404-MARKER-SEEK-RECIPE', 'severity': 'info', 'origin': 'C recipe (round 404 row 4)', 'evidence': 'c-round-404/out/leaf-compare.txt steps 23-27; app/lib/arrangement/markers.ts adjacentMarkerTarget', 'title': 'marker placed at 0 s, so Next marker fell back to project end 19.000 s; marker seek not exercised', 'status': 'info (D-29z1401): carry into the next marker-seek C row', 'added': BY})
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-SYS-R385-ACTIONS', 'decision': 'D-29z1402', 'requested_of': 'root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)', 'file': 'b-round-404/root-request-arch-checkpoint-sys-r385.md', 'question': 'before PERF-11c-iii-d/e: should VideoDock and Lane take actions from useArrangementActions (extend ArrangementActions) or stay on pattern A; keep/extract the 34-name triple listing', 'status': 'requested (non-blocking)', 'added': BY})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
pre(q, 'in_progress (D-29z1402): SYS-R385-1 done (dd52107); round 405 = SYS-R385-2; next PERF-11c-iii-d/e')
for o in every('PERF-11c-iii'):
    pre(o, 'in_progress (D-29z1402): d (VideoDock) and e (Lane) unblocked by SYS-R385 stage 1 (B-actions default); planned after round 405')
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 404:
        r['status'] = 'C PASS (c-round-404.json, browserVerified true); gate 404 published dd52107'
b['rounds'].append({'round': 405, 'task': 'current-task.md', 'decision': 'D-29z1396..D-29z1402', 'type': 'SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2 (test strength + comparator closure; behaviour-preserving)', 'status': 'dispatched', 'note': f'baseline dd52107 clean; frozen b-round-404/r405-frozen-sha256.txt (1292); grants b-round-404/grants-405.txt (7); patch b-round-404/sketch-405.patch.txt sha {SHA}; claims b-round-404/claims-405.sh', 'added': BY})
b['current_task'] = 'Round 405: SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2 from B reviewed sketch b-round-404/sketch-405.patch.txt (current-task.md)'
b['version'] = 374
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v373 -> v374\n')
print('ok v374')
