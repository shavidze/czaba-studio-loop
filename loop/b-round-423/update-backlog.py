# B round 423 -> 424 backlog update (v399 -> v400). Run once from the loop root: python3 -I b-round-423/update-backlog.py
import json, os, sys
DONE = 'b-round-423/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 399:
    sys.exit(f"expected version 399, found {b.get('version')}")
BY = '2026-11-10 B round 423 -> 424 planning'
b['version'] = 400
b['updated'] = '2026-11-10 (B round 423 -> 424 planning: round 423 C FAIL on one Medium, C-R423-01; round 424 = its fix-up PERF-FIX-R423-LANE-SHELL; regression part 2 moves to round 425)'
b['current_task'] = 'Round 424: PERF-FIX-R423-LANE-SHELL, fix-up of C-R423-01 (the lane preview subscriptions move into the memo inner so a drag commit renders the lane once, from B reviewed sketch b-round-423/sketch-424.patch.txt) (current-task.md)'
b['advisor_used_by_B'] = 'round 423 -> 424 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1479', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 423 (REGRESSION-2026-11-10 part 1) accepted from C evidence only: C FAIL (c-round-423.json), 21 rows passed, 1 failed (RR-PERF: interactions spec, 17 deterministic move-components asserts), 1 blocked (fake bearer, backend unavailable in cloud; kept as open backend evidence), browserVerified/realVerified true, L57 OK (c-round-423/l57-check.txt). Gate 423 skipped (C FAIL); baseline for round 424 stays 875ff37. Part 1 is complete except RR-PERF, which is re-run in round 424. regression-last.json is not updated (part 2 not run).'},
    {'id': 'D-29z1480', 'date': '2026-11-10', 'by': BY,
     'decision': 'C-R423-01 diagnosed by B before dispatch (L37 name the extra commit): every clip drag gets +2 fibers per rendered lane vs round 404 (b-round-423/move-components-404-vs-423.txt; lane drags +4 = two lanes, range drags unchanged). Named probe b-round-423/probe/fade-names-head.json (dev, fade drag, 59 commits x 6 fibers): ArrangementLane + Memo(ArrangementLaneViewInner) tag 14 + ArrangementLaneViewInner + Memo(ArrangementClipViewInner) + ArrangementClipEnvelope + Memo(ArrangementStatusTextInner); round 404 had 4. Cause: round 409 (PERF-11c-iii-e-ii, 9616d3a) split the Lane into a shell that subscribes to the per-lane preview and ghost stores over memo(inner, custom compare); the harness (perf/lib/instrumentation.ts tags 0/1/11/14/15) counts shell + memo + inner on every drag commit. Origin: B spec (round 409 was dispatched from B sketch without a perf-spec run on the sketch; its K21 checked only the ArrangementLane name count, L58 clause "equal to round N run is an assert too" not applied). Move-to-paint p95 unchanged (b-round-423/latency-404-vs-423.txt, all <= 7.8 ms).'},
    {'id': 'D-29z1481', 'date': '2026-11-10', 'by': BY,
     'decision': 'Ruling RESTORE over ACCEPT. tech-lead: restore (the memo comparator always fails during a drag and the shell runs hooks per move; budgets have no headroom by design; restoring keeps RB-LEAF7). performance-optimizer dissent: accept +2 (microseconds, latency unchanged) and add a latency budget row instead. B follows tech-lead and the advisor default: the 17 budgets stay as they are (no re-baseline); the fix keeps round 409 saving. The dissent is recorded and its latency-row idea filed as PERF-CAND-DRAG-LATENCY-BUDGET (candidate, not scheduled). Round 424 = PERF-FIX-R423-LANE-SHELL from B sketch b-round-423/sketch-424.patch.txt (ArrangementLane.tsx: preview-lane-clips and ghost subscriptions, laneSources and laneGhostTitles move into the memo inner; the shell passes committedLaneClips via useShallow; 4 drag-preview-render rows move their lane count to ArrangementLaneViewInner and add ArrangementLane = 0). REGRESSION-2026-11-10 part 2 moves to round 425 (task 423 section 7, Medium row).'},
    {'id': 'D-29z1482', 'date': '2026-11-10', 'by': BY,
     'decision': 'C round 423 lookups ruled: (1) R423-DECODE-STATUS oracle drift: round-392 rows B1/B7/B8/B9/nb rely on decode-delay hooks that do not apply since previews stream (rounds 393/395, S7: Preview stops the transport); C own replay passed. Accepted as B spec drift, INFO-C423-DECODE-ORACLE-DRIFT (info, origin B spec): later regressions cite c-round-423/r392/b7-replay2.mjs + r393/r395 instead of those five rows. (2) R423-SCALE-EXPORT second clip via Ctrl+D instead of a second Enter: accepted as lookup (the row targets an unmounted clip outside the lane page window, which the copy at 01:41.352 satisfies). (3) Min-zoom probe without a round-403 oracle: recorded only, as written. Why we missed C-R423-01: test:perf is outside the gate and was not run in rounds 405-422; retro candidate RC-R423-PERF-SPEC-ON-STRUCTURE (any task that changes a component fiber structure - shell, memo split, wrapper - runs the interactions spec on the sketch; L58 already says so for "equal to round N" claims) for RETRO 435.'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 423 and r.get('status') == 'dispatched':
        r['status'] = 'c_fail (D-29z1479): C FAIL c-round-423.json, 1 Medium C-R423-01 (RR-PERF); gate 423 skipped; fix-up = round 424'; ok += 1
if ok != 1:
    sys.exit('round 423 entry not found')
b['rounds'].append({'round': 424, 'task': 'current-task.md', 'decision': 'D-29z1480, D-29z1481', 'type': 'PERF-FIX-R423-LANE-SHELL (fix-up of C-R423-01)', 'status': 'dispatched',
                    'note': 'baseline 875ff37 clean; sketch b-round-423/sketch-424.patch.txt; claims b-round-423/claims-424.sh; perf sketch run b-round-423/perf-sketch/'})
b['open_findings'].append({'id': 'C-R423-01-PERF-DRAG-COMPONENTS-BUDGET', 'severity': 'medium', 'origin': 'B spec', 'status': 'in_progress (D-29z1481): fix-up round 424 PERF-FIX-R423-LANE-SHELL',
    'title': 'every clip drag commit renders 3 lane fibers (shell + Memo + inner) since round 409, so 17 deterministic move-components budgets fail (fade 6/4, trim 17/15, video 15/13, video-trim 17/15, video-fade 5/3)',
    'evidence': 'c-round-423.json bug C-R423-01; c-round-423/perf-results/latest-interactions.json; b-round-423/move-components-404-vs-423.txt; b-round-423/probe/fade-names-head.json',
    'repro': 'cd store; npm run test:perf (alone); studio-lab-interactions.perf.spec.ts', 'added': BY})
b['open_findings'].append({'id': 'INFO-C423-DECODE-ORACLE-DRIFT', 'severity': 'info', 'origin': 'B spec', 'status': 'open (D-29z1482): next regression cites c-round-423/r392/b7-replay2.mjs and r393/r395 instead of round-392 B1/B7/B8/B9/nb',
    'title': 'round-392 decode-delay oracle rows are obsolete since library previews stream (393+)', 'evidence': 'c-round-423.json lookups; c-round-423/r392/', 'repro': 'see c-round-423.md R423-DECODE-STATUS', 'added': BY})
n = 0
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        for s in q.get('stages', []):
            if s.get('id') == 'PERF-11c-iii-e-ii':
                s['status'] = 'bug (D-29z1480): C-R423-01 - the shell split adds 2 fibers per drag commit; fix-up round 424 | ' + s['status']; n += 1
        q.setdefault('candidates_d29z1481', []).append({'id': 'PERF-CAND-DRAG-LATENCY-BUDGET', 'source': 'performance-optimizer consult, round 423 -> 424 planning',
            'idea': 'assert a move-to-paint p95 budget for fade/trim/video drags so a real slowdown fails the run, not only a fiber count', 'status': 'candidate (not scheduled)'})
if n != 1:
    sys.exit('PERF-11c-iii-e-ii not found')
for rr in b['regression_rounds']:
    if rr.get('id') == 'REGRESSION-2026-11-10':
        rr['status'] = 'part 1 done except RR-PERF (D-29z1479): C round 423 FAIL on C-R423-01 only; RR-PERF re-run in fix-up round 424; part 2 = round 425 (round-390 template) | ' + rr['status']
        ok += 1
if ok != 2:
    sys.exit('regression entry not found')
b['architecture_signals'].append({'id': 'SIG-R423-SHELL-MEMO-FIBER-COST', 'added': BY, 'decision': 'D-29z1481', 'source': 'tech-lead + performance-optimizer consults, b-round-423.md',
    'signal': 'a shell over memo(inner, compare) costs 2 extra counted fibers on every update that reaches the inner through the shell; per-gesture subscriptions belong inside the memo inner, the shell keeps only commit-time data',
    'status': 'applied to the Lane in round 424; check the other leaf shells (video dock, marker row, transport groups) when their drag rows are next touched; not a separate task'})
for lid, title in [
    ('TL-R424-L1-GHOST-TITLE-REF-READ', 'ghost titles read getArrangement().clips in a render-time useMemo keyed on laneGhosts; a commit that re-sources a ghost clip while the ghosts stay the same keeps the old title until the next ghost update; minimal fix: sourceId on ClipLaneGhost'),
    ('TL-R424-L2-UNUSED-PREVIEW-LANE-HOOK', 'useArrangementPreviewLaneClips is used only by context-hygiene and preview-store tests after round 424; removal needs Saba approval (as GATE375-L1-UNUSED-WRAPPERS)'),
    ('TL-R424-L3-SELECTOR-NAMING', 'selectPreviewLaneClips(state.preview, state.preview, id) and (null, committed, id) hide intent; a plain lane filter reads better')]:
    b['deferred_low_polish'].append({'id': lid, 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1481)', 'title': title,
        'evidence': 'b-round-423/sketch-review.md (tech-lead review of sha 942dfdb6)', 'repro': 'read app/components/arrangement/ArrangementLane.tsx after round 424', 'added': BY})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('ok v400')
