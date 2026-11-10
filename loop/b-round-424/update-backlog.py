# B round 424 -> 425 backlog update (v400 -> v401). Run once from the loop root: python3 -I b-round-424/update-backlog.py
import json, os, sys
DONE = 'b-round-424/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 400:
    sys.exit(f"expected version 400, found {b.get('version')}")
BY = '2026-11-10 B round 424 -> 425 planning'
b['version'] = 401
b['updated'] = '2026-11-10 (B round 424 -> 425 planning: round 424 C PASS, published f6c76f4; C-R423-01 closed; round 425 = REGRESSION-2026-11-10 part 2 on f6c76f4)'
b['current_task'] = 'Round 425: REGRESSION-2026-11-10 part 2 on f6c76f4 (C-only browser sweep: round-389 rows for rounds 343-388, round-390 rows for rounds up to 342, the four carries of REGRESSION-2026-11-08, and a lane re-check on the new baseline; A changes nothing) (current-task.md)'
b['advisor_used_by_B'] = 'round 424 -> 425 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1483', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 424 accepted from C evidence only: C PASS (c-round-424.json: 9 rows passed, 0 failed, 0 bugs, browserVerified/realVerified true; L57 OK in b-round-424/l57-check-c424.txt, 5 fields null without a written reason = bookkeeping INFO only). RR-PERF: 5 specs passed (22.1 min), all 17 C-R423-01 ids at the sketch medians, no components row above round 423 (c-round-424/perf-compare.txt). Name probe shell 0 / Memo(lane) 0; ghost, lane/leaf, video and play smoke equal their oracles; auth guard PASS, fake bearer BLOCKED (backend unavailable in cloud, kept as open backend evidence). Gate 424 published f6c76f4 on both remotes (verify 264 files / 3957 tests, gates/round-424/verify.log; review score 9/10, no Medium+). C-R423-01 closes; PERF-11c-iii-e-ii returns to done. A Lows A-R424-DP30-SHELL-RENDER and A-R424-PREVIEW-WRAPPER-STYLE and B artifact drift INFO-B424-MUTANT-LINE-DRIFT go to deferred_low_polish (2026-10-23 rule). L7 sweep: TL-R424-L1/L2/L3 already deferred; A-R424-PREVIEW-WRAPPER-STYLE is a different point from TL-R424-L3 (raw useStore vs the useArrangementPreview wrapper, not selector naming) and the gate review Low 2 (useShallow in render) is confirmed harmless by the reviewer, no new id.'},
    {'id': 'D-29z1484', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 425 = REGRESSION-2026-11-10 part 2 on f6c76f4 (task 423 section 7 / task 424 section 6 PASS row). Part 2 = everything finished up to round 390: the round-389 rows (rounds 343-388, tasks/round-389.md section 3) and the round-390 rows (rounds up to 342 via the round-340 template), in one round: C time for rounds 389 + 390 was 1.03 h + 0.34 h (metrics/rounds.csv), well under the 350-minute job; PARTIAL resumes from progress.json. RR-PERF is carried from C round 424, not re-run: the published f6c76f4 code equals the sketch C verified (b-round-424/rrperf-carry-proof.txt: both code files sha-equal to sketch-424 applied to 875ff37; diff 875ff37..f6c76f4 = the 3 granted paths; perf/ unchanged since cc5cbc6). PERF-LIB and RG-SMOKE are re-run (cheap, baseline changed). New row R425-LANE-REBASE: ArrangementLane.tsx changed after part 1, and round 424 did not re-run lane virtualization (frames200, pin-blur-group) or lane peaks; they re-run on f6c76f4 against the c-round-423 outputs. R389-JOURNEY and R340-JOURNEY run once as one journey with export.'},
    {'id': 'D-29z1485', 'date': '2026-11-10', 'by': BY,
     'decision': 'Carries of REGRESSION-2026-11-08 (carry_to_next_regression_d29z1323) ruled, L6: (1) NO-SHIFT-203 retired as a tree-vs-ref row: its reference was the pre-round-203 tree, which no regression has (carried unrun in rounds 301, 340, 390); its intent, no layout shift on focus, is the RS-4B sub-check, which round 425 runs on the same tree; not carried again. (2) INFO-C390-HARNESS-DRIFT: the four adapted probes already live in c-round-390/t258/tools and c-round-390/tools; round 425 uses c-round-390 copies first, so the drift is folded by use; C saves its copies under c-round-425/ as the next template base; closed when C round 425 runs RG-06, RG-18, the c250-s9 split and the c218-mp3 add from those copies. (3) INFO-C390-RV-M-HYDRATION-GLITCH: named row R425-RVM-FRESH (fresh browser context per load, 3 loads per viewport, no other probe running); a reproduction on a valid isolated load is a finding. (4) INFO-C390-VIDEO-SNAP: R425-VIDEO-SOUND expectations are written against the real grid-snapped landing start read from the clip after release.'},
    {'id': 'D-29z1486', 'date': '2026-11-10', 'by': BY,
     'decision': 'Pre-rulings for older rows on the post-390 tree: (a) R389-DECODE-CACHE round-386 BROWSER-L2-OK (preview started during a decode plays once the decode ends): since rounds 393/395 a URL-backed library preview streams through a media element (K9 preview-client), so the preview may sound before the decode ends; that is the round-393 S1 contract, not a failure. The row passes when the preview is audible at most once (no double start) and stops on Play (S7); a preview that never sounds, or that keeps sounding after Play or Stop, is a Medium finding. Same family as INFO-C423-DECODE-ORACLE-DRIFT. (b) Scripts that count clips use the lane data-clip-count attribute, never DOM clip elements (lane virtualization, round 402). (c) A held Enter acts once on the 11 guarded transport buttons (round 422); older scripts that hold Enter adapt to one action. Reviewer architecture note signal 3 of gate 424 and A report For B (fiber-count guard for component-boundary changes in components/arrangement/) recorded as signal SIG-R424-BOUNDARY-FIBER-GUARD, merged with RC-R423-PERF-SPEC-ON-STRUCTURE and GATE304-M1 for RETRO 435; not scheduled; no architecture checkpoint request (single contained owner, fix verified).'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 424 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass (D-29z1483): C PASS c-round-424.json, 0 bugs, browserVerified true; gate 424 published f6c76f4'; ok += 1
if ok != 1:
    sys.exit('round 424 entry not found')
b['rounds'].append({'round': 425, 'task': 'current-task.md', 'decision': 'D-29z1484, D-29z1485, D-29z1486', 'type': 'REGRESSION-2026-11-10 part 2 (C-only; A changes nothing)', 'status': 'dispatched',
                    'note': 'baseline f6c76f4 clean; frozen tree b-round-424/r425-tree-sha256.txt; claims b-round-424/claims-425.sh'})
seen = set()
for f in b['open_findings']:
    if f.get('id') == 'C-R423-01-PERF-DRAG-COMPONENTS-BUDGET':
        f['status'] = 'closed (D-29z1483): C round 424 PASS (row 3 RR-PERF: all 17 ids at the sketch medians, c-round-424/perf-compare.txt; row 4 name probe shell 0); gate 424 published f6c76f4 | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'INFO-C423-DECODE-ORACLE-DRIFT':
        f['status'] = 'open (D-29z1486): applied again to R389-DECODE-CACHE BROWSER-L2-OK in round 425 | ' + f['status']; seen.add(f['id'])
if seen != {'C-R423-01-PERF-DRAG-COMPONENTS-BUDGET', 'INFO-C423-DECODE-ORACLE-DRIFT'}:
    sys.exit('findings not found: ' + str(seen))
n = 0
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        for s in q.get('stages', []):
            if s.get('id') == 'PERF-11c-iii-e-ii':
                s['status'] = 'done (D-29z1483): C-R423-01 fixed by round 424 (C PASS, browserVerified true, gate 424 published f6c76f4) | ' + s['status']; n += 1
if n != 1:
    sys.exit('PERF-11c-iii-e-ii not found')
for rr in b['regression_rounds']:
    if rr.get('id') == 'REGRESSION-2026-11-10':
        rr['status'] = 'part 1 done (D-29z1483: RR-PERF re-run PASS in C round 424); part 2 dispatched as round 425 on f6c76f4 (D-29z1484); regression-last updated only when part 2 closes | ' + rr['status']
        rr['scope_named_d29z1484'] = {
            'SA-P2-389': 'round-389 rows R389-* (rounds 343-388) -> R425-389 block',
            'SA-P2-390': 'round-390 rows (round-340 template, rounds up to 342, parked RP rows) -> R425-390 block',
            'SA-P2-CARRY': 'carry_to_next_regression_d29z1323 of REGRESSION-2026-11-08 -> NO-SHIFT-203 retired (D-29z1485, RS-4B sub-check), HARNESS-DRIFT via c-round-390 copies, R425-RVM-FRESH, R425-VIDEO-SOUND snapped start',
            'SA-P2-LANE': 'ArrangementLane changed in round 424 -> R425-LANE-REBASE (frames200, pin-blur-group, lane peaks vs c-round-423 outputs)',
            'SA-P2-PERF': 'RR-PERF carried from C round 424 (b-round-424/rrperf-carry-proof.txt); PERF-LIB and RG-SMOKE re-run'}
        ok += 1
    if rr.get('id') == 'REGRESSION-2026-11-08' and 'carry_to_next_regression_d29z1323' in rr:
        rr['carry_ruled_d29z1485'] = 'all four carries ruled in round 425 planning (D-29z1485)'
        ok += 1
if ok != 3:
    sys.exit('regression entries not found')
b['architecture_signals'].append({'id': 'SIG-R424-BOUNDARY-FIBER-GUARD', 'added': BY, 'decision': 'D-29z1486',
    'source': 'gates/round-424/review.md Architecture note signal 3; a-round-424.md For B',
    'signal': 'the ArrangementLane shell/inner boundary was reshaped twice (409, 424) and each change needed the browser name probe and test:perf, neither in the gate; proposal: a unit-level render-count guard that fails if a lane shell subscribes to a per-gesture store, or the perf move-components rows on any component-boundary change in components/arrangement/',
    'status': 'signal only; merged with RC-R423-PERF-SPEC-ON-STRUCTURE and GATE304-M1-PERF-LIB-NOT-IN-GATE for RETRO 435; not scheduled'})
for lid, sev, title, ev in [
    ('A-R424-DP30-SHELL-RENDER', 'low', 'drag-preview-render DP30 still asserts rendersOf(ArrangementLane) > 0 on a same-lane move to x=80 while DP21 asserts 0 for a similar gesture; the shell render cause is unconfirmed (guess: a committed-context change such as the timeline extent)', 'a-round-424.md Low 1; docs/implementation/2026/quarter-IV/273-perf-fix-lane-shell-subscriptions.md DP30 paragraph'),
    ('A-R424-PREVIEW-WRAPPER-STYLE', 'low', 'ArrangementLaneViewInner uses raw useStore(useArrangementPreviewStore(), ...) where the existing useArrangementPreview(selector) wrapper would remove the direct zustand import', 'a-round-424.md Low 3'),
    ('INFO-B424-MUTANT-LINE-DRIFT', 'info', 'b-round-423/mutants/summary.txt cites HEAD line numbers (436/610/978/1248) for the shell toBe(0) asserts, which sit at 437/612/981/1252 in the sketch tree; B artifact only', 'a-round-424.md Low 2')]:
    b['deferred_low_polish'].append({'id': lid, 'severity': sev, 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1483)', 'title': title,
        'evidence': ev, 'repro': 'read app/components/arrangement/ArrangementLane.tsx and app/lib/arrangement/__tests__/drag-preview-render.test.tsx at f6c76f4', 'added': BY})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('ok v401')
