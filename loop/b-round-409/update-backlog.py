# B round 409 -> 410 planning, part 1: backlog v383 -> v384 (acceptance of round 409 from C evidence only). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-409/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 383, b['version']
BY = '2026-11-08 B round 409 -> 410 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1421', "Round 409 (PERF-11c-iii-e-ii) accepted on independent C evidence: c-round-409.json taskStatus PASS, 8 rows passed (SOURCE-SCOPE start/end + L57, PATCH-IDENTITY cmp-identical to sketch sha 1beedffb, LANE-ACTIONS 8/8 ok both viewports no pageErrors (1440 attempt 1 cold timeout kept, L38), LEAF-PROBE inner [0,8,4,4,0,0,0,1,1,4,4,0,0,1,1] shell [0,12,4,4,0,0,0,4,4,4,4,4,8,4,4] both viewports, UNIT 914/914 + 9/9 mutants RED on C's committed scratch + tsc guard rc 2, AUTH, DOCS), failed [], bugs [], browserVerified/realVerified true; gate 409 published 9616d3a on both remotes (review COMMIT OK, no blockers). PERF-11c-iii-e-ii done; PERF-11c-iii done (a..e all done); PERF-11c done (i, ii, iii). PERF-11 stays in_progress only on 11b (awaiting_user). Still open evidence: fake-bearer /api/studio-token row BLOCKED (backend unavailable in cloud). C-recorded gaps (not bugs): library drop / video import / lane drag not browser-run (unit-covered); export WAV integrity not re-measured (unchanged code)."),
 ('D-29z1422', "Round 409 reviewer findings ruled. A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE (Low: no mutant for a wrong compare body of name/volume/groupId/kind) -> deferred_low_polish, fix home = next round owning render-budget.test.tsx (proposal: a volume step and a rename step, each 1 inner render + DOM updated). Gate-409 review: item 2 -> GATE409-L1-COMPARATOR-OBJECT-IS-TRAP (Low, deferred_low_polish; RB-LEAF7 inner counts guard it today); item 3 -> GATE409-L2-ARRANGEMENT-CLIPS-ALIAS (Low, deferred_low_polish, tidy only when editing nearby); item 1 info = TL-R409-SK-6, merged into the signal below. A reviewer + gate 409 Architecture notes (both 'keep' the shell + inner in one file; both propose an identity-stable sourceDurations in ArrangementContext) -> one signal SIG-R409-SOURCE-DURATIONS-IDENTITY attached to ARCH-CHECKPOINT-PERF11C-III-BOUNDARY; not scheduled. ARCH-CHECKPOINT-PERF11C-III-BOUNDARY has no root result at this planning; non-blocking per b-round-408.md section 3, so B proceeds with PERF-15."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
st = {x.get('id'): x for x in q['stages']}
pre(st['PERF-11c-iii-e-ii'], 'done (D-29z1421): C round 409 PASS browserVerified/realVerified true; gate 409 published 9616d3a')
pre(st['PERF-11c-iii'], 'done (D-29z1421): a..e all done; last stage e-ii C round 409 PASS, gate 9616d3a')
pre(st['PERF-11c'], 'done (D-29z1421): 11c-i, 11c-ii, 11c-iii all done (last C round 409, gate 9616d3a)')
pre(st['PERF-11'], 'in_progress (D-29z1421): 11a and 11c done; only 11b awaiting_user (ROOT-REQ-PERF11B-FIREBASE-LAZY)')
for i, (fid, title, ev) in enumerate([
  ('A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE', 'render-budget RB-LEAF7: no mutant for a wrong compare body of name/volume/groupId/kind (only a missing key is a compile error)', 'a-round-409.md Code review table; c-round-409.md Findings'),
  ('GATE409-L1-COMPARATOR-OBJECT-IS-TRAP', 'ArrangementLane comparator builds a Map per parent render, and a future inline arrow/object prop from StudioWorkspace silently turns the memo off (RB-LEAF7 inner counts guard it today)', 'gates/round-409/review.md item 2'),
  ('GATE409-L2-ARRANGEMENT-CLIPS-ALIAS', 'ArrangementLane shell: local arrangementClips alias used only for memo deps while arrangement.clips.length is read directly', 'gates/round-409/review.md item 3'),
]):
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': 'A (code-reviewer)' if i == 0 else 'gate reviewer', 'evidence': ev, 'title': title, 'status': 'deferred_low_polish (D-29z1422)', 'added': BY, 'fix_home': 'next round that owns ArrangementLane.tsx / render-budget.test.tsx'})
b['architecture_signals'].append({'id': 'SIG-R409-SOURCE-DURATIONS-IDENTITY', 'source': 'a-round-409.md Architecture note; gates/round-409/review.md item 1 + Architecture note (TL-R409-SK-6)', 'note': 'laneSources depends on whole-map identities and sourceDurations is passed whole, so any peaks/duration/loading write re-renders every lane (the pre-409 cost). Proposal: identity-stable sourceDurations (or per-lane slices) in ArrangementContext; acceptance = a duration arrival re-renders only lanes using that source; needs a test that fails first. Both reviewers keep the 409 shell + inner in one file.', 'status': 'recorded (D-29z1422), not scheduled; attached to ARCH-CHECKPOINT-PERF11C-III-BOUNDARY; PERF-15 premise interacts (peaks may land before ready)', 'added': BY})
for o in b['architecture_checkpoint_requests']:
    if o.get('id') == 'ARCH-CHECKPOINT-PERF11C-III-BOUNDARY':
        pre(o, 'requested (D-29z1422): feature boundary reached (round 409 published 9616d3a); no root result yet; non-blocking; adds SIG-R409-SOURCE-DURATIONS-IDENTITY')
for r in b['rounds']:
    if r.get('round') == 409:
        r['status'] = 'done (D-29z1421): C PASS, gate 409 published 9616d3a'
b['version'] = 384
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v383 -> v384\n')
print('ok v384')
