import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-367/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 330, b['version']
ADD = '2026-11-06 B round 367 -> 368 planning'
EVR = 'b-round-367/sketch-review.md; c-round-367.json; a-round-367.md'

of = b['open_findings']
of.extend([
    {'id': 'C-R367-DEDUP-CANCELLED-WRITE', 'severity': 'medium', 'origin': 'A code-reviewer (A-R367-REVIEW-DEDUP-CANCELLED-WRITE), reproduced by C',
     'title': 'PERF-9b-ii sketch v2: a same-key load skipped by the writes.has(key) dedup loses the cache write when the pending write is cancelled by the L3 re-check (cache efficiency only; no wrong bytes)',
     'evidence': 'c-round-367/dedup-sketch.log, c-round-367/dedup-head.log, a-round-367/dedup-probe-block.ts.txt',
     'repro': 'P1: sweep held, write B, load A (c1), abort c1, load A again, release, idle -> sketch storedA=false (HEAD true). P2: B put held, same order.',
     'status': 'targeted round 368 (D-29z1206, D-29z1208): ruled fix = join (a same-key load joins the pending write; cancel only when every joined signal aborted); rows SC30, SC31; mutants M-V2-NO-JOIN, M-V2-SOME, M-V2-LAST-SIGNAL. Closes on C round 368 PASS.',
     'added': ADD},
    {'id': 'C-R367-STATUS-LINE-PREMATURE', 'severity': 'low', 'origin': 'A (L28 form written before C)',
     'title': 'doc 236 l.4 says Completed (C round 367 PASS) while round 367 is FAIL', 'evidence': 'c-round-367.json bugs[1]',
     'repro': 'sed -n 4p docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md',
     'status': 'targeted round 368 (D-29z1208): A rewrites l.4 = Completed (C round 368 PASS) (L28). Closes on C round 368 PASS.', 'added': ADD},
    {'id': 'C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN', 'severity': 'low', 'origin': 'C',
     'title': 'deleteAfterPendingWrite without the same-key wait stays green 31/31 (not equivalent: it matters while the pending write is still reading its body)',
     'evidence': 'c-round-367/mutant-own.diff.txt, c-round-367/mutant-own.log', 'repro': 'see evidence',
     'status': 'targeted round 368 (D-29z1208): row SC32 (held body + same-key hit 404); M-C367-DELETE-SKIPS-PENDING red on SC32 (b-round-367/mutants). Closes on C round 368 PASS.', 'added': ADD},
    {'id': 'A-R367-REVIEW-L-ABF', 'severity': 'low', 'origin': 'A code-reviewer (round 367) L-a, L-b, L-f',
     'title': 'SC22 title overstates (L-a); quota-retry cancelled() has no row while doc 236 claims it (L-b); doc 236 stage-1 limitation line, stage-1 mermaid order, CompletableTransaction import, nosize wording (L-f)',
     'evidence': 'a-round-367/code-review.md; a-round-367/mutants/own-M-L3-RETRY.log', 'repro': 'see evidence',
     'status': 'targeted round 368 (D-29z1208): SC22 title narrowed and SC33 added in the sketch; doc items in the A-DOC row (L26). Closes on C round 368 PASS.', 'added': ADD},
])
dlp = b['deferred_low_polish']
for lid, title in [
    ('A-R367-REVIEW-L-c', "stem-cache: idle()'s wait on deletes has no row of its own (M-IDLE-NO-DELETES removes two lines together)"),
    ('A-R367-REVIEW-L-d', 'stem-cache: no cancelled() check between victim deletes; SC24 has a single victim'),
    ('A-R367-REVIEW-L-e', "stem-cache: integrity remove() re-reads the record, so racing a just-committed same-key put deletes the new valid record (result is still a miss); optional fix: delete with the record get already holds"),
    ('A-R367-REVIEW-L-g', "stem-cache test SC26: expect(served.headers.get('x-injected')).toBeNull() can never fail; the content-type assert does the work"),
    ('B-R367-TL3-1-JOIN-MICROTASK-GAP', 'stem-cache: a load that joins in the microtask gap between a write\'s last cancelled() and writes.delete is lost silently; unreachable in a browser (joiner arrives in a separate task); HEAD skipped such a load too (accepted, b-round-367/sketch-review.md TL3-1)'),
]:
    dlp.append({'id': lid, 'severity': 'low', 'origin': 'A code-reviewer (round 367)' if lid.startswith('A-') else 'B pre-check tech-lead review (round 367 planning)',
                'title': title, 'evidence': 'a-round-367/code-review.md' if lid.startswith('A-') else 'b-round-367/sketch-review.md',
                'repro': 'see evidence; stem-cache.client.ts / stem-cache.test.ts',
                'status': 'deferred_low_polish (D-29z1207): bounded round 368 to the Medium + C Lows + doc-claim Lows (L26); fixed by the next owner of stem-cache.client.ts or the polish pass',
                'added': ADD})

for r in b['architecture_checkpoint_requests']:
    if r['id'] == 'ARCH-CHECKPOINT-PERF9-STEM-CACHE':
        r['when'] = 'after C round 368 PASS (PERF-9b-ii re-dispatch; D-29z1208) | ' + r['when']
        r['signals_round_367'] = 'A round-367 code-reviewer Architecture note: createCachedSourceFetch l.293-303 and l.358-367 changed in rounds 365, 366, 367 and gained session state (commitChain, deletes; round 368 adds the joined-signals writes map); reviewer verdict keep (one session lifecycle). Signal only, not a task.'

b.setdefault('retro_candidates', []).extend([
    {'id': 'B-R367-FINAL-SKETCH-UNREVIEWED', 'decision': 'D-29z1206', 'round': 367,
     'note': 'tech-lead reviewed sketch v1; the commit chain arrived in v2 and v2 was not re-reviewed against the existing writes.has(key) dedup; A\'s code-reviewer found the Medium (C-R367-DEDUP-CANCELLED-WRITE) -> A STOP, C FAIL. B origin (L58). Round 368 planning reviewed the final v3 sketch. RETRO 369 input: the review must be of the final dispatched sketch.', 'added': ADD},
    {'id': 'B-R367-MUTANTS-MISSED-INTERACTION', 'decision': 'D-29z1206', 'round': 367,
     'note': '13 mutants all red on v2 still missed a cross-rule interaction (L3 re-check x SC17 dedup); mutants test rules one at a time. RETRO 369 input (same class as B-R366-V1-SKETCH-HIGHS).', 'added': ADD},
])

perf = next(x for x in b['post_current_stage_queue'] if isinstance(x, dict) and x.get('id') == 'STUDIO-PERFORMANCE')
perf['status'] = 'in_progress (D-29z1208): PERF-9a and PERF-9b-i done; PERF-9b-ii C round 367 FAIL (A STOP on C-R367-DEDUP-CANCELLED-WRITE; browser rows PASS) -> round 368 re-dispatch with the join fix | ' + perf['status']
for t in perf['stages']:
    if t['id'] == 'PERF-9':
        t['status'] = 'in_progress (D-29z1206..D-29z1208): 9b-ii round 367 FAIL (not done), round 368 re-dispatch | ' + t['status']
        t['split_d29z1197']['PERF-9b-ii'] = ('round 368 re-dispatch (D-29z1208): v3 = v2 + b-round-367/sketch-delta.patch.txt (join pending same-key writes; SC30-SC33; SC22 title); '
                                             'round 367 FAIL (A STOP, C reproduced the dedup Medium; INTEGRITY/VALIDATOR/AUTH browser rows passed on v2) | ' + t['split_d29z1197']['PERF-9b-ii'])
perf['consults_round_368'] = {
    'tech-lead': 'review of final sketch v3 (join design): no Medium+; ordering table confirmed vs HEAD; Lows TL3-1 accepted (microtask gap, unreachable in a browser), TL3-2 and TL3-3 fixed in v3 (SC32 put guard, SC31 joiner-aborts part), TL3-4 wording. b-round-367/sketch-review.md',
    'performance-optimizer': 'not consulted: no perf budget change', 'product-designer': 'not consulted: nothing on screen changes'}
perf['execution_order_d29z1209'] = ('PERF-9b-ii re-dispatch (368) -> RETRO 369 (window 353..368) -> REGRESSION at the first planning on/after 2026-11-08 that is not the RETRO round '
                                    '-> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS '
                                    '-> T12-ADVANCED -> phase-2 entries (skip rule). PERF-9c awaiting_user; PERF-9d root; ARCH-CHECKPOINT-PERF9-STEM-CACHE with root after 368 PASS (non-blocking).')
b['retro_policy']['next_due'] = 'round 369 (window 353-368) (D-29z1209: round 368 = PERF-9b-ii re-dispatch, C bugs first) | ' + b['retro_policy']['next_due']

for st in b['systemic_tasks']:
    if st.get('id') == 'SYS-R365-STEM-CACHE-HARDENING':
        st['status'] = 're-dispatched round 368 (D-29z1208) after round 367 FAIL; closes its 5 Lows (A-R365-REVIEW-L3..L6, C-R365-OBS-INTEGRITY) only on C PASS'

b['decisions_log_b'].extend([
    {'id': 'D-29z1206', 'date': '2026-11-06', 'text': 'Round 367 closes as FAIL from C evidence (c-round-367.json: taskStatus FAIL, browserVerified true, realVerified true). A STOPped on an unruled code-reviewer Medium; C reproduced it (C-R367-DEDUP-CANCELLED-WRITE: sketch storedA=false in P1/P2, HEAD true). Browser rows INTEGRITY/VALIDATOR (both viewports), G367-AUTH, PLAYBACK-EXPORT record passed on v2, but PERF-9b-ii is not done. Gate 367 skipped; baseline stays d53d113 with the v2 tree uncommitted. L10 ruling: fix with join (b-round-367/sketch-review.md); options 1 and 3 rejected. RETRO inputs B-R367-FINAL-SKETCH-UNREVIEWED, B-R367-MUTANTS-MISSED-INTERACTION.'},
    {'id': 'D-29z1207', 'date': '2026-11-06', 'text': 'A-R367-REVIEW-L-c, L-d, L-e, L-g and B-R367-TL3-1-JOIN-MICROTASK-GAP -> deferred_low_polish (2026-10-23 bug gate; round bounded). L-a, L-b and L-f are fixed in round 368 because doc 236 claims them (L26). Architecture note -> ARCH-CHECKPOINT-PERF9-STEM-CACHE signals_round_367.'},
    {'id': 'D-29z1208', 'date': '2026-11-06', 'text': 'Round 368 = PERF-9b-ii re-dispatch (current-task.md): A applies b-round-367/sketch-delta.patch.txt on the current tree (v2 + doc 236), so git diff -- app equals b-round-367/sketch.patch.txt; doc 236 l.4 Completed (C round 368 PASS) and claim fixes. B pre-check on the final sketch: covering 35/35 + 6/6, v1 client red on SC30/SC31 only, 19 mutants red, typecheck 0, Biome 0, full suite (precheck-full.log), production probe both viewports identical to C round 367. tech-lead reviewed the final v3: no Medium+.'},
    {'id': 'D-29z1209', 'date': '2026-11-06', 'text': 'RETRO moves from 368 to 369 (window 353..368): the tree holds unpublishable round-367 work and C bugs come first; a RETRO round changes no code and could not close it. REGRESSION still due on/after 2026-11-08. Order otherwise as D-29z1205.'},
])
for r in b['rounds']:
    if r.get('round') == 367:
        r['status'] = 'c_fail (D-29z1206): A STOP + C reproduced C-R367-DEDUP-CANCELLED-WRITE (Medium); browser rows passed; gate 367 skipped'
b['rounds'].append({'round': 368, 'task': 'current-task.md', 'decision': 'D-29z1206..D-29z1209', 'type': 'PERF-9b-ii re-dispatch: join pending same-key writes (C-R367-DEDUP-CANCELLED-WRITE), SC30-SC33, doc 236 Completed', 'status': 'dispatched',
                    'note': 'baseline d53d113 + uncommitted round-367 v2 tree; delta b-round-367/sketch-delta.patch.txt; claims b-round-367/claims-368.sh', 'added': ADD})
b['current_task'] = 'current-task.md (round 368: PERF-9b-ii re-dispatch; stem-cache.client.ts join fix, stem-cache.test.ts SC30-SC33, doc 236 Completed)'
b['version'] = 331
b['updated'] = ADD
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('ok')
