import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-418/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 394, b['version']
BY = '2026-11-09 B round 418 -> 419 planning'
b['version'] = 395
b['updated'] = '2026-11-09 (B round 418 -> 419 planning: SYS-R369-STEM-CACHE-WRITE-COORDINATOR dispatched)'
b['current_task'] = 'Round 419: SYS-R369-STEM-CACHE-WRITE-COORDINATOR (stem cache per-key operation model, integrity and name guards; current-task.md)'
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 418:
        r['status'] = 'c_pass_published (C round 418 PASS, browserVerified/realVerified true; gate 418 published 3579fcc)'
b['rounds'].append({
    'round': 419, 'task': 'current-task.md', 'decision': 'D-29z1458..D-29z1461',
    'type': 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR (runtime + tests)', 'status': 'dispatched',
    'note': 'baseline 3579fcc clean (gate 418 published); frozen b-round-418/r419-frozen-sha256.txt (1316); grants b-round-418/grants-419.txt (3); sketch b-round-418/sketch-419.patch.txt; review b-round-418/sketch-review.md; claims b-round-418/claims-419.sh'})

pool = {}
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if isinstance(f, dict) and 'id' in f:
            pool.setdefault(f['id'], f)
CLOSED_418 = ['GATE393-L3-FALLBACK-REENTRY', 'A-R394-REVIEW-L3-REENTRANT-SYNC-THROW', 'A-R395-REVIEW-L1-SEEK-REENTRANT',
              'GATE395-L1-CURRENTTIME-READ', 'A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW', 'A-R392-REVIEW-L3-SUPERSESSION-BY-ID',
              'A-R393-REVIEW-L3-URL-SWITCH-ROWS', 'C-R417-L58-SKETCH-REVIEW-MISSING']
seen = []
for i in CLOSED_418:
    for key in ('open_findings', 'deferred_low_polish'):
        for f in b[key]:
            if isinstance(f, dict) and f.get('id') == i:
                f['status'] = 'closed (D-29z1458): C round 418 PASS (row evidence c-round-418.md), gate 418 published 3579fcc | ' + str(f.get('status'))
                seen.append(i)
print('closed:', sorted(set(seen)))

def low(i, sev, origin, title, evidence, status):
    return {'id': i, 'severity': sev, 'origin': origin, 'title': title, 'evidence': evidence, 'status': status, 'added': BY}
b['deferred_low_polish'] += [
    low('A-R418-REVIEW-L1-READTIME-STALE-START', 'low', 'B spec',
        'preview.client.ts readTime falls back to the element-creation start, which a same-url seek does not update; ruling 5 said "the request start offset"',
        'a-round-418.md For B; c-round-418.json C-R418-READTIME-STALE-START; gates/round-418/review.md finding 2',
        'deferred_low_polish (D-29z1459): only reachable when the currentTime getter throws (not in shipping browsers); fix with A-R418-REVIEW-L2 in one round that owns preview.client.ts: readTime on ActiveStreamPreview + an updatable start (setStart beside setErrorHandler). Same class as TL-R418-L2'),
    low('C-R418-READTIME-STALE-START', 'low', 'B spec', 'C confirmation of A-R418-REVIEW-L1 (code read)', 'c-round-418.json bugs[0]',
        'deferred_low_polish (D-29z1459): merged into A-R418-REVIEW-L1-READTIME-STALE-START'),
    low('A-R418-REVIEW-L2-OFFSET-RAW-READ', 'low', 'pre-existing',
        'getLibraryPreviewOffset reads active.element.currentTime unguarded (preview.client.ts l.218-220)',
        'a-round-418.md; c-round-418.json C-R418-OFFSET-RAW-READ; gates/round-418/review.md finding 1',
        'deferred_low_polish (D-29z1459): same item as TL-R418-L3-OFFSET-RAW-READ; closes with A-R418-REVIEW-L1'),
    low('C-R418-OFFSET-RAW-READ', 'low', 'pre-existing', 'C confirmation of A-R418-REVIEW-L2', 'c-round-418.json bugs[1]',
        'deferred_low_polish (D-29z1459): merged into A-R418-REVIEW-L2-OFFSET-RAW-READ'),
    low('A-R418-REVIEW-L3-PC12-TITLE', 'low', 'B spec',
        'PC12 title says stall after the seek, body dispatches error; seek-then-stall is covered only by browser R1b',
        'a-round-418.md; c-round-418.json C-R418-PC12-TITLE; gates/round-418/review.md finding 3',
        'deferred_low_polish (D-29z1459): rename or drive the stall path when library-preview-stream.test.tsx is next owned'),
    low('C-R418-PC12-TITLE', 'low', 'B spec', 'C confirmation of A-R418-REVIEW-L3', 'c-round-418.json bugs[2]',
        'deferred_low_polish (D-29z1459): merged into A-R418-REVIEW-L3-PC12-TITLE'),
    low('GATE418-L4-FALLBACK-MICROTASK-UNMOUNT', 'low', 'gate reviewer',
        'the deferred stream-fallback microtask is not cancelled on provider unmount and unmount does not bump previewTokenRef (reviewer judges it unreachable: unmount detaches the player listeners first)',
        'gates/round-418/review.md finding 4',
        'deferred_low_polish (D-29z1459): same root as TL-R418-L1-UNMOUNT-NO-BUMP; fix together (bump the token on unmount) when the preview region is next owned'),
]

b['deferred_low_polish'] += [
    low('TL-R419-L3-IDLE-DRAIN', 'low', 'B pre-check', 'stem cache idle() now drains until no per-key operation is left (HEAD waited on a snapshot); under continuous traffic it would not resolve; no production caller',
        'b-round-418/sketch-review.md', 'accepted_behaviour_change (D-29z1460): idle() is a test/teardown hook; recorded in ruling 4 and doc 270. Re-open only if a production caller appears'),
    low('TL-R419-L4a-JOINER-BODY-ABORT', 'low', 'pre-existing', 'stem cache: a joiner is lost when the first load aborts while the shared clone body is still being read (the clone body errors); HEAD same',
        'b-round-418/sketch-review.md TL-R419-L4 (a)', 'deferred_low_polish (D-29z1460): known gap, not a regression; candidate fix: the write reads from a clone not tied to the first signal, or a joiner re-clones on a body error'),
    low('TL-R419-L4b-OLDER-BYTES-JOIN', 'low', 'pre-existing', 'stem cache: a newer storable 200 that arrives while an open same-key write is pending joins it, so the older bytes are stored (record and bytes match; the next conditional request corrects it); HEAD same',
        'b-round-418/sketch-review.md TL-R419-L4 (b)', 'deferred_low_polish (D-29z1460): known gap, self-heals on the next 304/200 exchange'),
    low('TL-R419-L4c-THROWING-NOW', 'low', 'B pre-check', 'stem cache: if an injected now() throws, the write done rejects and later same-key writes reject at await after (no caller passes a throwing clock)',
        'b-round-418/sketch-review.md TL-R419-L4 (c)', 'deferred_low_polish (D-29z1460): catch on the operation done, as deletes already do, when the region is next owned'),
]
b['open_findings'].append(low('TL-R419-L1-OPEN-INVARIANT', 'info', 'B pre-check',
    'MU-JOIN-IGNORES-OPEN is equivalent for a structural reason: no wait on a store or network call between open=false and settle(); keep open as insurance',
    'b-round-418/sketch-review.md', 'in round 419 task (ruling 3) and doc 270 (C row 7); closes on C round 419 PASS'))

for f in b['open_findings']:
    if isinstance(f, dict) and f.get('id') == 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C':
        f['status'] = ('signal (D-29z1459): round 418 (L46 default) done; A-418 reviewer and gate-418 reviewer: keep now, proposal = one bounded createLibraryPreviewController '
                       'in app/lib/arrangement/ (token counter, fallback memory, stream/decode/buffer decision; hook surface unchanged). Recorded as an architecture signal, not scheduled | ' + f['status'])

b['architecture_signals'].append({
    'id': 'SIG-R418-PREVIEW-CONTROLLER-EXTRACT', 'added': BY, 'decision': 'D-29z1459',
    'source': 'a-round-418.md For B (Architecture note); gates/round-418/review.md Architecture note',
    'signal': 'ArrangementContext.tsx startLibraryPreview (~125 lines, three branches) plus previewTokenRef/streamFallbackRef/startLibraryPreviewRef changed in rounds 392-418. Both reviewers: keep now; proposal createLibraryPreviewController in app/lib/arrangement/ with injected ensureDecoded/pins/status writes; PS/PC rows unchanged; mutants keep red.',
    'status': 'recorded, not scheduled (same item as ARCH-CHECKPOINT-PREVIEW-AFTER-13C; count once). Re-raise to root only if the region changes again.'})

R369_IDS = ['A-R368-REVIEW-L1', 'B-R367-TL3-1-JOIN-MICROTASK-GAP', 'A-R367-REVIEW-L-c', 'A-R367-REVIEW-L-d', 'A-R367-REVIEW-L-e',
            'GATE368-L1-REMOVEFILE-SAME-NAME', 'A-R368-REVIEW-L3', 'A-R367-REVIEW-L-g']
for key in ('open_findings', 'deferred_low_polish'):
    for f in b[key]:
        if isinstance(f, dict) and f.get('id') in R369_IDS:
            f['status'] = 'scheduled in round 419 SYS-R369 (D-29z1460); closes on C PASS | ' + str(f.get('status'))
        if isinstance(f, dict) and f.get('id') == 'GATE368-L3-QUEUED-BUFFER-RETENTION':
            f['status'] = ('deferred_low_polish (D-29z1460): not in round 419. A cap needs a measured limit: the number of public-preview stems that load together; '
                           'STEM-LANES changes that number (a stem set loads together). Re-rule at STEM-LANES planning with a measured concurrent-load count; '
                           'the per-key model of round 419 already bounds same-key retention to one buffer. The limit must count both holding points (tech-lead TL-R419-L2): a write waiting at `await after` and a write queued in commitChain | ' + str(f.get('status')))

for t in b['systemic_tasks']:
    if isinstance(t, dict) and t.get('id') == 'SYS-R416-PREVIEW-CONTROLLER':
        t['status'] = 'done (D-29z1458): C round 418 PASS (browserVerified true), gate 418 published 3579fcc | ' + t['status']
    if isinstance(t, dict) and t.get('id') == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR':
        t['status'] = 'dispatched round 419 (D-29z1460) | ' + t['status']
        t['ruling_d29z1460'] = (
            'No root answer to ARCH-CHECKPOINT-PERF9-STEM-CACHE (find over the loop folder, 2026-11-09): keep in stem-cache.client.ts (no sibling module). '
            'writes map + deletes set -> one per-key operations map (write {signals, open} | delete). A write that arrives while the key has a queued delete (or a closed write) starts its own write whose commit waits for that operation (A-R368-REVIEW-L1, SC34). '
            'open=false is set in the same synchronous step as the abandon decision (B-R367-TL3-1; MU-JOIN-IGNORES-OPEN accepted equivalent: no jsdom schedule reaches the gap). '
            'idle() loops over every per-key operation, then the commit chain (A-R367-REVIEW-L-c, SC35; MU-IDLE-WRITES-ONLY red SC25/SC32/SC35). '
            'cancelled() before each victim delete (L-d, SC36). get() integrity miss deletes only the record it read, in one readwrite transaction, then its file (L-e, SC37). '
            'File names time-counter-random (GATE368-L1, SC38) and the browser store refuses a put whose fileName equals the stored one before touching files (SC39). '
            'SC40 pins the chain-start check (A-R368-REVIEW-L3). SC26 vacuous assert replaced (L-g). SC41 surface lock. GATE368-L3 deferred to STEM-LANES planning with a measured count.')
        t['closes_round_419'] = R369_IDS

sp = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STUDIO-PERFORMANCE'][0]
found369 = False
for st in sp['stages']:
    if st.get('id') == 'SYS-R416-PREVIEW-CONTROLLER':
        st['status'] = 'done (D-29z1458): C round 418 PASS, gate 418 published 3579fcc | ' + st['status']
    if st.get('id') == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR':
        st['status'] = 'dispatched round 419 (D-29z1460) | ' + str(st.get('status'))
        found369 = True
if not found369:
    sp['stages'].append({'id': 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR', 'status': 'dispatched round 419 (D-29z1460)', 'added': BY})
sp['status'] = ('in_progress (D-29z1461): SYS-R416-PREVIEW-CONTROLLER done (round 418, 3579fcc); round 419 = SYS-R369-STEM-CACHE-WRITE-COORDINATOR; '
                'then REGRESSION-2026-11-10 (first planning on/after 2026-11-10), STEM-LANES | ' + sp['status'])

b['decisions_log_b'] += [
    {'id': 'D-29z1458', 'date': '2026-11-09', 'by': BY,
     'decision': 'Round 418 accepted from independent evidence: C PASS (c-round-418.json, 8 rows passed, browserVerified/realVerified true; fake-bearer BLOCKED backend unavailable), gate 418 published 3579fcc (verify 3934/3934). SYS-R416-PREVIEW-CONTROLLER done; its 7 ids and C-R417-L58-SKETCH-REVIEW-MISSING (C row 1 K19 L58 OK) closed. Baseline for round 419 = 3579fcc (clean). context/head-sha.txt still read 061068d at planning (written before the gate commit): stale, not the baseline. REGRESSION not due: regression-last 2026-11-07, due on/after 2026-11-10 (today 2026-11-09).'},
    {'id': 'D-29z1459', 'date': '2026-11-09', 'by': BY,
     'decision': 'Round-418 findings ruled (L10): A-R418-REVIEW-L1/L2/L3 + C confirmations + GATE418-L4 -> deferred_low_polish (L1+L2 close together with a readTime on ActiveStreamPreview and an updatable start; GATE418-L4 with TL-R418-L1). Architecture notes recorded as SIG-R418-PREVIEW-CONTROLLER-EXTRACT (signal, not scheduled; same item as ARCH-CHECKPOINT-PREVIEW-AFTER-13C).'},
    {'id': 'D-29z1460', 'date': '2026-11-09', 'by': BY,
     'decision': 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR dispatched as round 419 (L46 default D-29z1374; no root answer). 8 of 9 ids in scope; GATE368-L3 deferred with reason (needs a measured concurrent-load limit; STEM-LANES changes it). Sketch b-round-418/sketch-419.patch.txt, 8 new rows SC34-SC41 + SC26 assert replaced, 15 mutant lines, tech-lead sketch review. STEM-LANES coupling confirmed: public demo previews load through publicPreviewSourceFetch (stem cache), purchased stems use their own fetchAudio; a stem set (STEM-LANES) loads several keys together through the same commit chain, so the per-key model lands first.'},
    {'id': 'D-29z1461', 'date': '2026-11-09', 'by': BY,
     'decision': 'Order: 419 SYS-R369 -> REGRESSION-2026-11-10 (first planning on/after 2026-11-10) -> STEM-LANES (product-designer + reference-first; LIVE-MEAS-STEM-DROP) -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). Next RETRO round 431 or end of STUDIO-PERFORMANCE. No new architecture checkpoint request: stem-cache region keep (one session lifecycle), ARCH-CHECKPOINT-PERF9-STEM-CACHE still open with root (non-blocking).'},
]
open(p, 'w').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('ok\n')
print('backlog v395 written')
