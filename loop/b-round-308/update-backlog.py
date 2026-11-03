# B round 308 -> 309 planning: one-shot backlog edit. Refuses to run twice.
import json, sys
P = 'backlog.json'
b = json.load(open(P))
if any(d.get('id') == 'D-29z820' for d in b['decisions_log_b']):
    sys.exit('already applied')
D = '2026-11-03'
ADDED = '2026-11-03 B round 308 -> 309 planning'
b['version'] = b['version'] + 1
b['updated'] = ADDED
b['current_task'] = 'current-task.md (round 309, D-29z820..D-29z823; PERF-4a: R2 worker public routes ETag/304 + single-range 206/416 + Expose-Headers in both worker copies; protected routes frozen; PR1-PR9, 8 mutants; doc 225; baseline 738df73, frozen 1181, 3 modified + 1 new granted)'
b['decisions_log_b'] += [
 {'id': 'D-29z820', 'date': D, 'text': 'Round 308 closure from C evidence (c-round-308.json: PASS, browserVerified/realVerified true, 10 rows, 0 bugs; CONT-1 6/6 and CONT-30 6/6 valid runs, no click; ENDED; NO-CHANGE both viewports; G308-AUTH both viewports) and gate 308 published 738df73 (both remotes). PERF-COMMIT-RESCHEDULE closed_on_evidence_c308 (D-29z817 condition met); b-ii not opened. Gate-308 review COMMIT OK: GATE308-L1 (doc 224 cites tmp/ evidence) and GATE308-S3 (RC13 toBe(2)) -> deferred_low_polish; GATE308-S2 (compute when ?? now once) + A-R308 reviewer Low (Math.max bound) -> attached to PERF-RESCHEDULE-UNUSED-CODE, before any replaceClips caller. INFO-C308-SAME-WHEN + INFO-C308-POSCTL-INCONCLUSIVE -> retro candidate RC-R308-SPLICE-PROBE. A architecture note = A-R307-ARCH-SOURCE-REGISTRY (count +1, no new request).'},
 {'id': 'D-29z821', 'date': D, 'text': 'PERF-4 split, nothing dropped: 4a (round 309) public routes (previews + covers) ETag/304, single-range 206/416, Expose-Headers, both worker copies; 4b studio caching (private,no-cache + ETag after auth, auth outside the URL) awaiting_user SABA-Q-PERF4-STUDIO-CACHE, client half is protected (studio.$productId.tsx l.254 appends ?token=) -> SRW-21-PLAN; 4c immutable versioned keys + worker ?v= rule -> backend/upload handoff (no upload pipeline or wrangler config in the repo). Downloads/recordings/originals keep private,no-store (both consults). Consults: performance-optimizer and tech-lead agree on 4a; they differ on /studio/ (no-cache vs no-store), ruled: keep no-store, ask Saba (L44). Premise at HEAD 738df73 (b-round-308/probe/head-*-1440.json): no ETag, revalidation 5,760,044 bytes, Range ignored, seek 200 full body; sketch: 304/0, 206/1000, 416, seek 206/975,916.'},
 {'id': 'D-29z822', 'date': D, 'text': 'PERF-4a contract (current-task.md section 4): head() first; If-None-Match (weak, *) -> 304 before Range and before any body read; If-Range strong only; single bytes= range, invalid/multi -> 200, a>=size or -0 -> 416 bytes */size with no R2 read; HEAD reads nothing; existing Cache-Control values and 404 texts kept; no immutable/stale-while-revalidate; helper block byte-identical in both copies; protected handler, router, validateToken, isSafeFileName, getContentType byte-identical. R2 facts quoted from the Workers API reference (2026-11-03); out-of-range R2 behaviour is inference, avoided by validating first. Accepted race head->get recorded (4c removes it). Rows PR1-PR9, mutants MU-NO-INM, MU-RANGE-200, MU-416-PASS, MU-IFRANGE-IGNORED, MU-HEAD-READS, MU-NO-EXPOSE, MU-STUDIO-CONDITIONAL, MU-ONE-COPY: all red on B sketch (b-round-308/sketch-mutants.txt); sketch 57/57.'},
 {'id': 'D-29z823', 'date': D, 'text': 'Requests: ROOT-REQ-VERIFY-WORKER-TESTS (npm run verify does not run node --test workers/r2-proxy.test.mjs; gate-308 verify.log 0 mentions) non-blocking, C runs it as WK-UNIT meanwhile. Saba questions SABA-Q-PERF4-STUDIO-CACHE and SABA-Q-WORKER-DEPLOYED (which copy is live; then a bounded dedupe task). Worker deploy is outside the loop. Architecture checkpoint requests (ARCH-CHECKPOINT-STUDIO-LINK, D-29z811, b-round-306-checkpoint-request.md) still unanswered, non-blocking; no new request (PERF-4a is one bounded server-side change).'},
]
b['open_findings'] += [
 {'id': 'GATE308-L1-DOC-TMP-EVIDENCE', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-308/review.md suggestion 1', 'title': 'doc 224 cites tmp/studio-real-loop evidence outside the repository; key numbers are copied into the doc', 'repro': 'doc reading', 'status': 'deferred_low_polish (D-29z820)', 'added': ADDED},
 {'id': 'INFO-C308-SAME-WHEN', 'severity': 'info', 'origin': 'B spec', 'title': 'continuity probe runs repeat splice positions (ms-quantized release); no raw captures saved', 'source': 'c-round-308.json findings', 'status': 'recorded -> RC-R308-SPLICE-PROBE (D-29z820)', 'added': ADDED},
 {'id': 'INFO-C308-POSCTL-INCONCLUSIVE', 'severity': 'info', 'origin': 'environment', 'title': 'positive control could not prove the click rule sensitivity (Stop disconnects the tap)', 'source': 'c-round-308.json findings', 'status': 'recorded -> RC-R308-SPLICE-PROBE (D-29z820)', 'added': ADDED},
 {'id': 'INFO-C308-COLD-DEV', 'severity': 'info', 'origin': 'environment', 'title': 'two cold-compile timeouts before measurement; rows reran valid after warm-up', 'source': 'c-round-308.json findings', 'status': 'recorded', 'added': ADDED},
 {'id': 'SABA-Q-PERF4-STUDIO-CACHE', 'severity': 'info', 'origin': 'B + performance-optimizer/tech-lead (round 309 planning)', 'title': 'Purchased Studio stems: allow the buyer browser to keep them on disk (private, no-cache + ETag, every reuse re-authorized; faster re-open) or keep private, no-store (re-download each open, nothing left on shared machines)? Pays off only after the token leaves the URL (SRW-21-PLAN)', 'status': 'awaiting_user (D-29z821); blocks PERF-4b only', 'added': ADDED},
 {'id': 'SABA-Q-WORKER-DEPLOYED', 'severity': 'info', 'origin': 'tech-lead consult (round 309 planning)', 'title': 'Which R2 worker copy is deployed: workers/r2-proxy.js (has the cover-image route) or cloudflare/r2-worker.js? After the answer a bounded task removes the other copy', 'status': 'awaiting_user (D-29z823); non-blocking (both copies edited in lockstep)', 'added': ADDED},
 {'id': 'WK-STORE-PREVIEW-LIVE', 'severity': 'info', 'origin': 'B', 'title': 'ProductCard <audio> against the deployed worker (304 on revalidate, 206 on seek in Chrome and Safari) after Saba deploys PERF-4a', 'status': 'not runnable in the cloud (mock API serves local previews; worker not deployed); later evidence (D-29z821)', 'added': ADDED},
]
b['deferred_low_polish'] += [
 {'id': 'GATE308-L1-DOC-TMP-EVIDENCE', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-308/review.md suggestion 1', 'title': 'doc 224: mark tmp/ evidence paths as temporary or copy the probe summaries into docs/', 'repro': 'doc reading', 'status': 'deferred_low_polish (D-29z820)', 'added': ADDED},
 {'id': 'GATE308-S3-RC13-EXACT-COUNT', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-308/review.md suggestion 3', 'title': 'graph.test.ts RC13: expect(clicks.length).toBe(2) instead of >= 1', 'repro': 'test reading', 'status': 'deferred_low_polish (D-29z820)', 'added': ADDED},
 {'id': 'B-R308-PROXY-AUDIO-YEAR-CACHE', 'severity': 'low', 'origin': 'tech-lead consult (pre-existing)', 'source': 'app/routes/api.proxy.audio.ts (Cache-Control public, max-age=31536000 on unversioned preview keys)', 'title': 'the dev audio proxy caches previews for a year; a replaced preview stays stale in browsers', 'repro': 'GET /api/proxy/audio?url=<worker preview> -> Cache-Control public, max-age=31536000', 'status': 'deferred_low_polish (D-29z821); revisit with PERF-4c versioned keys', 'added': ADDED},
]
b['retro_candidates'].append({'id': 'RC-R308-SPLICE-PROBE', 'text': 'an audio-splice continuity probe saves raw captures, adds a random pre-release delay (avoid ms-quantized identical runs) and carries a positive control that is proven to flag a deliberate discontinuity', 'status': 'candidate for RETRO 320 (D-29z820); evidence INFO-C308-SAME-WHEN, INFO-C308-POSCTL-INCONCLUSIVE (1x)', 'added': ADDED})
for s in b['architecture_signals']:
    if s.get('id') == 'PERF-RESCHEDULE-UNUSED-CODE':
        s['note_d29z820'] = 'before any replaceClips caller also: compute at = when ?? ctx.currentTime once in stop() (GATE308-S2) and bound it with Math.max(at, ctx.currentTime) (A-R308 reviewer Low)'
    if s.get('id') == 'A-R307-ARCH-SOURCE-REGISTRY':
        s['count_note_d29z820'] = 'repeated by A round 308 (2x)'
b['architecture_signals'].append({'id': 'R2-WORKER-TWO-COPIES', 'source': 'tech-lead + performance-optimizer consults, round 309 planning', 'text': 'workers/r2-proxy.js and cloudflare/r2-worker.js are two copies of one worker and have drifted (cover route only in workers/); PERF-4a keeps them in lockstep with a byte-identical helper block; remove one after SABA-Q-WORKER-DEPLOYED', 'status': 'signal (D-29z823)', 'added': ADDED})
b['root_requests_b'].append({'id': 'ROOT-REQ-VERIFY-WORKER-TESTS', 'file': 'b-round-308.md (For root)', 'decision': 'D-29z823', 'blocking': False, 'status': 'open: add node --test workers/r2-proxy.test.mjs to npm run verify (gate-308 verify.log 0 mentions); until then C runs it as WK-UNIT', 'added': ADDED})
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        q['status'] = 'in_progress (D-29z821): PERF-COMMIT-RESCHEDULE closed on evidence (C round 308 PASS, gate 738df73); PERF-4a dispatched round 309; 4b awaiting_user, 4c backend handoff; next PERF-5; REGRESSION first when due (on/after 2026-11-05); RETRO at 320 | ' + q['status']
        for s in q['stages']:
            if s.get('id') == 'PERF-COMMIT-RESCHEDULE':
                s['status'] = 'closed_on_evidence_c308 (D-29z820): C round 308 CONT-1 6/6 and CONT-30 6/6 no click, ENDED, NO-CHANGE; gate 308 published 738df73 | ' + s['status']
            if s.get('id') == 'PERF-COMMIT-RESCHEDULE-b-close':
                s['status'] = 'done (D-29z820): C round 308 PASS browserVerified/realVerified true; gate 308 published 738df73 | ' + s['status']
            if s.get('id') == 'PERF-COMMIT-RESCHEDULE-b':
                s['status'] = 'closed (D-29z820): not needed, b-close evidence shows no click | ' + s['status']
            if s.get('id') == 'PERF-4':
                s['status'] = 'in_progress (D-29z821): split 4a/4b/4c; 4a dispatched round 309 | ' + s['status']
                s['split_d29z821'] = {
                    'PERF-4a': 'round 309: public routes ETag/304 + single-range 206/416 + Expose-Headers in both worker copies; PR1-PR9; doc 225',
                    'PERF-4b': 'awaiting_user SABA-Q-PERF4-STUDIO-CACHE: /studio/ private,no-cache + ETag/304 after auth; client half (auth outside the URL) in protected studio.$productId.tsx -> SRW-21-PLAN',
                    'PERF-4c': 'backend/upload handoff: immutable versioned keys + worker ?v= rule (immutable only when v equals the object ETag); product API returns the version',
                }
                s['premise_round_308'] = 'b-round-308/probe/head-proxy-1440.json, head-alt-1440.json (no ETag; revalidate 200 5,760,044 B; Range ignored; seek 200 full); sketch-*-1440.json (304/0, 206/1000, 416, seek 206/975,916, cover 304)'
        q['stages'] += [
         {'id': 'PERF-4a', 'what': 'R2 worker public routes: ETag/304, single-range 206/416, Expose-Headers, both copies; protected routes frozen', 'status': 'dispatched round 309 (D-29z821/D-29z822)', 'added': ADDED},
         {'id': 'PERF-4b', 'what': 'studio stem caching: private,no-cache + ETag/304 after auth; auth outside the URL (client in protected files)', 'status': 'awaiting_user (SABA-Q-PERF4-STUDIO-CACHE, D-29z821); client half via SRW-21-PLAN', 'added': ADDED},
         {'id': 'PERF-4c', 'what': 'immutable versioned R2 keys (upload pipeline + product API version) and worker ?v= immutable rule', 'status': 'handoff_backend (D-29z821): outside this repository; worker half planned when the version field exists', 'added': ADDED},
        ]
    for s in q.get('stages', []):
        if s.get('id') == 'SRW-21-PLAN':
            s['input_d29z821'] = 'PERF-4b client half: send the studio token outside the URL (cookie or fetch-to-blob; <audio>/WaveSurfer cannot send Authorization) so stem URLs are stable cache keys; depends on SABA-Q-PERF4-STUDIO-CACHE'
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
