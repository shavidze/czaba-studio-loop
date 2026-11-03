import json, sys
p = sys.argv[1]
b = json.load(open(p))
ADDED = "2026-11-03 B round 311 -> 312 planning"
b['version'] = 271
b['updated'] = "2026-11-03 B round 311 -> 312 planning"
q = [x for x in b['post_current_stage_queue'] if x.get('id') == 'STUDIO-PERFORMANCE'][0]
for s in q['stages']:
    if s['id'] == 'PERF-4e':
        s['status'] = "done (D-29z832): C round 311 PASS browserVerified/realVerified true (12 rows); gate 311 published dfa4502 | " + s['status']
    if s['id'] == 'PERF-4':
        s['status'] = "in_progress (D-29z832): 4a (309), 4d (310), 4e (311, dfa4502) done; 4b awaiting_user; 4c handoff_backend | " + s['status']
close = {
    'GATE310-M1': 'closed (D-29z832): PERF-4e C round 311 PASS (WK-GUARD hugeEnd/hugeSuffix 206 h0g1; WK-HEAD-CONTROL 500 at HEAD), gate 311 dfa4502',
    'GATE310-L3': 'closed (D-29z832): PERF-4e C round 311 PASS (rereadInm/rereadFarInm 304 both modes), gate 311 dfa4502',
    'C-R310-01': 'closed (D-29z832): PR17 + MU-THROW-REREAD-KEEPS-HEAD-ETAG red, C round 311 TESTS-READ PASS',
}
for x in b['open_findings']:
    if x.get('id') in close:
        x['status'] = close[x['id']] + ' | ' + str(x.get('status'))
for x in b['deferred_low_polish']:
    if x.get('id') == 'B-R309-REFETCH-INM-WINDOW':
        x['status'] = 'closed (D-29z832): fixed as GATE310-L3 in PERF-4e, C round 311 PASS | ' + x['status']
of_new = [
    {"id": "INFO-C311-ASSERT-MINUS-LINE", "severity": "info", "origin": "C round 311 (B spec)", "title": "SOURCE-SCOPE row said 'no - line holding assert'; B's own sketch replaced the PR13 assert in place with an equal + stronger one; C ruled PASS on intent. Wording falls under L4 ('no assertion lost; equal or stronger replacements allowed')", "status": "recorded (D-29z832): RC note on B wording, no lesson change (L4 already covers it)", "added": ADDED},
    {"id": "INFO-C311-WARM-STATUS-NULL", "severity": "info", "origin": "C round 311 (environment)", "title": "untimed warm-up saw #arrangement-status null on the cold dev server (as round 310); timed G311-AUTH ready at both viewports", "status": "recorded (D-29z832)", "added": ADDED},
    {"id": "INFO-C311-AUDIOSEEK-LINES", "severity": "info", "origin": "C round 311 (environment)", "title": "audioSeek range-line count 2 (throw) / 3 (short); Chromium media buffering, every line 206 h0g1", "status": "recorded (D-29z832)", "added": ADDED},
    {"id": "GATE311-I2", "severity": "info", "origin": "gate 311 reviewer #2", "title": "the 416 response keeps Accept-Ranges: bytes (unsatisfiableResponse deletes only Content-Type/Length); RFC-allowed, same as before", "status": "recorded (D-29z832); optional consistency with 304 when a worker round next owns the helper", "added": ADDED},
    {"id": "GATE311-I3", "severity": "info", "origin": "gate 311 reviewer #3", "title": "unsafe start with small length still reaches R2; ends 416 either way, never the satisfiable rethrow", "status": "recorded (D-29z832)", "added": ADDED},
]
b['open_findings'].extend(of_new)
dl_new = [
    {"id": "C-R311-01", "severity": "low", "origin": "C round 311 (B spec PR17 row set); = A-R311-REVIEW-L2 + A-R311-REVIEW-L3", "source": "workers/r2-proxy.test.mjs PR17", "title": "two mutants survive 75/75: the normal-path re-read `else headers.delete('ETag')` branch (the fake always returns httpEtag) and CORS (ACAO/Expose-Headers) on the re-read 304", "repro": "c-round-311/C-MU-REREAD-NO-ETAG-DELETE.patch.txt, C-MU-REREAD-304-NO-CORS.patch.txt, c-mutants.txt", "fix": "second-read object with no httpEtag; ACAO/Expose asserts in PR17", "status": "deferred_low_polish (D-29z833): closes with the next worker round that owns r2-proxy.test.mjs (R2-WORKER-TWO-COPIES dedupe), together with A-R311-REVIEW-L4 and GATE311-L1", "added": ADDED},
    {"id": "A-R311-REVIEW-L4", "severity": "low", "origin": "A round 311 code-reviewer", "source": "workers/r2-proxy.test.mjs PR15", "title": "PR15 `opened.every(o => o.cancelled)` is vacuous in throw mode (no body opened); meaningful only in short mode (doc 227 says so)", "repro": "a-round-311.md l.58", "status": "deferred_low_polish (D-29z833): same worker-test batch as C-R311-01", "added": ADDED},
    {"id": "GATE311-L1", "severity": "low", "origin": "gate 311 reviewer #1", "source": "workers/r2-proxy.test.mjs l.129/l.182", "title": "the fake throws its TypeError before the outOfRange check, so PR16's far case always takes the throw path even in short mode; far.heads 1 describes the fake, not R2", "repro": "gates/round-311/review.md #1", "fix": "TypeError only in throw mode (or a separate strict flag); short mode expects heads 0, reads 1, 416 from resolveRangeSpec", "status": "deferred_low_polish (D-29z833): same worker-test batch as C-R311-01", "added": ADDED},
]
b['deferred_low_polish'].extend(dl_new)
for s in b['architecture_signals']:
    if s.get('id') == 'R2-WORKER-TWO-COPIES':
        s['status'] = "signal x5 (D-29z833: A round 311 note + gate-311 reviewer 'signal 3, same region changed at high cost'; proposal: one shared helper source + parity check failing the build); dedupe waits for SABA-Q-WORKER-DEPLOYED; no new checkpoint request | " + s['status']
b['decisions_log_b'].extend([
    {"id": "D-29z832", "date": "2026-11-03", "text": "Round 311 closed on evidence: C round 311 PASS (12 rows: WK-GUARD-PROXY/ALT, WK-OPS-REGRESSION, WK-HEAD-CONTROL, G311-AUTH both viewports, WK-UNIT 75/75 + 32/32, RED-ON-HEAD 4, PROTECTED-UNCHANGED, SOURCE-SCOPE, CLAIMS, TESTS-READ 25/25 + C 3/5, DOC), browserVerified/realVerified true; gate 311 published dfa4502 on both remotes. PERF-4e done; GATE310-M1, GATE310-L3 (= B-R309-REFETCH-INM-WINDOW), C-R310-01, A-R310-REVIEW-L1 closed. Infos INFO-C311-ASSERT-MINUS-LINE (B wording, L4 covers it), INFO-C311-WARM-STATUS-NULL, INFO-C311-AUDIOSEEK-LINES, GATE311-I2/I3 recorded. tasks/round-311.md archived as a byte copy of current-task.md. Baseline for round 312: dfa4502."},
    {"id": "D-29z833", "date": "2026-11-03", "text": "New Lows C-R311-01 (= A-R311-REVIEW-L2/L3), A-R311-REVIEW-L4 and GATE311-L1 are all test-honesty gaps in workers/r2-proxy.test.mjs with correct code today; under the 2026-10-23 bug gate they go to deferred_low_polish as one batch that closes with the next worker round owning that file (the R2-WORKER-TWO-COPIES dedupe after SABA-Q-WORKER-DEPLOYED). No fourth consecutive worker round is opened for them. R2-WORKER-TWO-COPIES signal count x5; no new checkpoint request (three open, non-blocking)."},
])
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok', b['version'])
