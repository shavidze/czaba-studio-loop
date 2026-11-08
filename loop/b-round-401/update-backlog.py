# B round 401 -> 402 planning: backlog v369 -> v370. Not re-runnable (writes update-backlog.done).
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-401/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 369, b['version']
BY = '2026-11-08 B round 401 -> 402 planning'
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

decisions = [
 ('D-29z1377', "Round 401 (RETRO 401) accepted except RT-LESSONS: C FAIL on C-R401-01 (Low, origin B; lessons.md l.3 Sources pointer not updated although retro-401 section 10 and the task said so). All other 11 rows PASS, browserVerified/realVerified true (c-round-401.json). Gate 401 skipped (C taskStatus FAIL); baseline stays c17d0e9. B fixed l.3 at this planning (retro-401.md, windows 385-400; only l.3 changed, 60 lines; b-round-401/lessons-diff.txt). RETRO 401 is done when RT-FIX-401 passes in round 402."),
 ('D-29z1378', "Round 402 = PERF-14b-ii from b-round-401/sketch-402.patch.txt (sha256 28569ea2d35c479b, 6 files, applied byte-for-byte). TL-R398-SK-M1 fixed in the sketch (per-pointer unpin on pointerup/pointercancel/blur, all three listeners removed); TL-R398-SK-L1 fixed (unmount effect). VZ1-VZ10; mutants 11/11 red (b-round-401/mutants/summary.txt). tech-lead pass 1 (TL-R401-SK-M1..M3, L1..L4) disposed; delta pass 2 'no new Medium+' (b-round-401/sketch-review.md). Full vitest on the sketch 261 files / 3862 tests pass; scale, interactions, resources, studio-lab specs rc 0 on the sketch; browser probes pin-blur-group and frames200 both viewports OK (claims K9-K11, K19-K22)."),
 ('D-29z1379', "Q-14B-PIN-GROUP-MEMBERS ruled: same-lane group-move members are NOT pinned (pinning would mount every selected clip on select-all + drag; cross-lane members are already pinned as lane-move sources). Evidence: VZ10 and b-round-401/probe/sketch-pin-*.json (member mounts mid-drag at preview start, delta 2 = pressed delta). Interactions check (f) becomes three branches (TL-R401-SK-M3). A-R400-ARCH-READBESIDECLIP: keep readBesideClip in the spec; signal stays, not scheduled."),
 ('D-29z1380', "A-R400-REVIEW-SPEC-LOWS: Lows 1, 2 and 4 fixed in the 14b-ii patch (one setup reveal after the Ctrl+click; copyDelta null and (c) explicit); Low 3 kept by ruling (Follow re-enable while playing may legitimately scroll; tech-lead agrees) and stays in deferred_low_polish as A-R400-REVIEW-SPEC-L3. interact.zoom.30.out.path-rewrites == 3 -> == 2 (key-4 clip mounts fresh). budgets.scale.json: 6 flips + scale.scroll.components-per-step <= 140 (TL-R398-SK-L3; 116.5 vs HEAD 57.75, known accepted cost, not a target)."),
 ('D-29z1381', "Docs: new doc 256 (stage 3 of 4; l.4 'In Progress (stage 3 of 4; C round 402 PASS)'); docs 254/255 contract sections updated, l.4 unchanged. REGRESSION-2026-11-10 not yet due (2026-11-08); order after round 402 unchanged (D-29z1375)."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})

st = one('PERF-14b-ii')
st['status'] = 'dispatched (D-29z1378): round 402 from b-round-401/sketch-402.patch.txt | ' + st['status']
st['sketch_evidence_round_401'] = 'b-round-401/sketch-review.md, mutants/summary.txt (11/11), perf-sketch-scale-final.json, perf-sketch-interactions-final.json, perf-sketch-resources.json, perf-sketch-studio-lab.json, sketch-full-vitest.log (261/3862), probe/sketch-pin-*.json, probe/sketch-frames-*.json'
p14 = one('PERF-14')
p14['status'] = 'in_progress (D-29z1378): 14a done (398); 14b-i done (400); round 402 = 14b-ii virtualization; 14c next after REGRESSION if due | ' + p14['status']

f = one('TL-R398-SK-M1')
f['status'] = 'fixed_in_sketch (D-29z1378): b-round-401/sketch-402.patch.txt (blur unpin, all three listeners removed; VZ8, VZ9; mutants MU-402-NO-BLUR-UNPIN, NO-CANCEL-REMOVE, NO-CAPTURE-REMOVE red); closes on C round 402 rows 5 and 10 | ' + f['status']
q = one('Q-14B-PIN-GROUP-MEMBERS')
q['status'] = 'ruled (D-29z1379): do not pin same-lane group members; VZ10 + b-round-401/probe/sketch-pin-*.json; (f) three branches | ' + q['status']
s = one('A-R400-ARCH-READBESIDECLIP')
s['status'] = 'signal (D-29z1379): keep in spec; not scheduled | ' + s['status']
low = one('A-R400-REVIEW-SPEC-LOWS')
low['status'] = 'fix_dispatched (D-29z1380): Lows 1, 2, 4 in round 402 patch; Low 3 split to A-R400-REVIEW-SPEC-L3; closes on C round 402 row 8 | ' + low['status']
b['deferred_low_polish'].append({'id': 'A-R400-REVIEW-SPEC-L3', 'severity': 'low', 'origin': 'A round 400 code-reviewer', 'evidence': 'a-round-400.md Code review (A7) Low 3; b-round-401/sketch-review.md', 'title': 'interactions spec readBesideClip: the Follow re-enable click comes after the 1 px scrollLeft restore check, so a scroll caused by re-enabling Follow is not re-checked', 'status': 'deferred_low_polish, ruled kept for now (D-29z1380): Follow re-enable while playing may legitimately scroll; tech-lead agrees. Revisit in the polish pass', 'added': BY})
b['open_findings'].append({'id': 'C-R401-01', 'severity': 'low', 'origin': 'B (retro-401 section 10 and lessons.md l.3, planning artifact)', 'evidence': 'c-round-401.json; c-round-401/data/lessons-l3-diff.txt', 'title': 'lessons.md l.3 Sources pointer not updated although retro-401 section 10 and the round-401 task said so', 'status': 'fixed_in_planning (D-29z1377): l.3 now names retro-401.md (windows 385-400); closes on C round 402 RT-FIX-401', 'added': BY})
for tl, sev, title, disp in [
 ('TL-R401-SK-M1', 'medium', 'reviewed patch lacked the new test file', 'fixed before dispatch (git add -N)'),
 ('TL-R401-SK-M2', 'medium', 'budgets.scale.json flip patch dropped five HEAD notes (round-398 base)', 'fixed before dispatch (rebuilt from HEAD; 7 rows change)'),
 ('TL-R401-SK-M3', 'medium', 'interactions check (f) could no longer fail once same-lane members are unpinned', 'fixed before dispatch (three branches)'),
 ('TL-R401-SK-L1', 'low', 'VZ9 ignored the capture flag', 'fixed before dispatch (MU-402-NO-CAPTURE-REMOVE red)'),
 ('TL-R401-SK-L2', 'low', 'mutant name', 'fixed (renamed MU-402-NO-CANCEL-REMOVE)'),
 ('TL-R401-SK-L3', 'low', 'WG2-WG5 depend on the ghost pin', 'documented in doc 256 (no code comments rule)'),
 ('TL-R401-SK-L4', 'low', 'scroll ceiling note must say known cost', 'fixed in the note'),
]:
    b['open_findings'].append({'id': tl, 'severity': sev, 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-401/sketch-review.md', 'title': title, 'status': f'closed (D-29z1378): {disp}; sketch input, never in app code', 'added': BY})
hy = one('PERF-CAND-14-SCROLL-HYSTERESIS')
hy['note_d29z1380'] = 'scroll ceiling <= 140 set in round 402 (116.5 measured vs HEAD 57.75); hysteresis stays a later candidate'

q7 = b['post_current_stage_queue'][7]
assert q7['id'] == 'STUDIO-PERFORMANCE'
q7['status'] = 'in_progress (D-29z1378): round 402 = PERF-14b-ii; then REGRESSION-2026-11-10 when due, PERF-14c, SYS-R385-LEAF-ACTIONS-CONTEXT, PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369 | ' + q7['status']

for r in b['retro_runs']:
    if isinstance(r, dict) and r.get('round') == 401:
        r['status_d29z1377'] = 'C round 401: all rows PASS except RT-LESSONS (C-R401-01 Low, origin B), fixed at the 402 planning; done when RT-FIX-401 passes'
b['rounds'].append({'round': 402, 'task': 'current-task.md', 'decision': 'D-29z1377..D-29z1381', 'type': 'PERF-14b-ii lane clip virtualization (stage 3 of 4) + RT-FIX-401', 'status': 'dispatched', 'note': 'baseline c17d0e9 clean; frozen b-round-401/r402-frozen-sha256.txt (1287); grants b-round-401/grants-402.txt (9); patch b-round-401/sketch-402.patch.txt; claims b-round-401/claims-402.sh', 'added': BY})
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 401:
        r['status'] = 'C FAIL (C-R401-01 Low, origin B; RT-FIX in round 402); gate 401 skipped'
b['current_task'] = 'Round 402: PERF-14b-ii lane clip virtualization (PERF-14 stage 3 of 4) from B reviewed sketch b-round-401/sketch-402.patch.txt + RT-FIX-401 (C-R401-01) (current-task.md)'
b['version'] = 370
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v369 -> v370\n')
print('ok v370')
