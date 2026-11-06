import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-365/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 328, b['version']
ADD = '2026-11-06 B round 365 -> 366 planning'
EV = 'c-round-365.json (taskStatus PASS, browserVerified true, realVerified true); gate 365 published 413218e (both remotes)'
TL = open(L + '/b-round-365/tech-lead-summary.txt').read().strip()


def finding(fid):
    for f in b['open_findings']:
        if f.get('id') == fid:
            return f
    raise KeyError(fid)


f = finding('B-R364-DEMO-DOUBLE-FETCH')
f['status'] = ('open info (D-29z1198): reproduced by C round 365 (status 0, 0 B, every open) and by B on the production build '
               '(b-round-365/probe/stem-prod-*.json: Media request, Range bytes=0-, 206, net::ERR_ABORTED, cold and DevTools-no-cache opens); '
               'PERF-9b-i records its bytes as stem.<phase>.cdp-media-bytes; not fixed (StudioNarrowScreen not granted) | ' + f['status'])

ROUND365_CLOSED = [
    {'id': 'C-R365-INFO-01', 'severity': 'low', 'origin': 'B spec',
     'title': 'K11 final = 12, task said 10: the K11 grep also matches the two new test files the task required',
     'evidence': 'c-round-365.json bugs[0]; a-round-365.md STOP 1; a-round-365/claims-final.txt',
     'status': 'closed (D-29z1195): ruled - K11 final = 12 is correct; the planning value counted the tree before the 2 required files existed. Same class as L56 count-claim clause (RETRO 368 input B-R365-COUNT-CLAIM-PLANNING-VS-FINAL)', 'added': ADD},
    {'id': 'C-R365-INFO-02', 'severity': 'low', 'origin': 'B spec',
     'title': "task 365 section 1.2: 'a sweep error is ignored' (l.127) vs sweep listed among storage errors that turn the cache off (l.143)",
     'evidence': 'c-round-365.json bugs[1]; a-round-365.md STOP 2',
     'status': "closed (D-29z1195): ruled - l.127 wins (sweep error ignored), as the code and sketch ruling D1 do; the l.143 listing of sweep was a B spec error. No code change. The ruling is carried in task 366 section 0.1", 'added': ADD},
]
b['open_findings'].extend(ROUND365_CLOSED)

dlp = b['deferred_low_polish']
for lid, title, fix in [
    ('A-R365-REVIEW-L3', 'stem-cache.client.ts: the abort/disabled check runs before sweep/list/evictions/put; an abort during those awaits still commits complete bytes (harmless today)', 're-check signal?.aborted || disabled just before each put'),
    ('A-R365-REVIEW-L4', 'stem-cache.client.ts: requestToPromise resolves on request success, not on transaction complete; a transaction abort after success leaves an orphan file or loses the old file (becomes a miss via the integrity check)', 'await tx.oncomplete; reject on onerror/onabort'),
    ('A-R365-REVIEW-L5', 'stem-cache.client.ts: a 404/410 or unstorable-200 delete does not wait for a pending same-key background write, which may re-create the entry (concurrent case of ruling D2)', 'await writes.get(key)?.catch(() => undefined) before the delete'),
    ('A-R365-REVIEW-L6', 'stem-cache.client.ts: response.clone() and the cachedResponse headers.set sit outside a try (unreachable today)', 'wrap them so a throw is a miss, never a failed load'),
    ('C-R365-OBS-INTEGRITY', 'the browser store get() integrity branch (missing OPFS file, size mismatch; stem-cache.client.ts l.164-172) has no unit test (jsdom returns null) and no browser row with a corrupted file; CS-COLD/CS-CLEAR pass without exercising it', 'browser row: truncate or delete one OPFS file, reopen, expect one 200 and the entry stored again'),
]:
    dlp.append({'id': lid, 'severity': 'low', 'origin': 'A code-reviewer (round 365)' if lid.startswith('A-') else 'C observation (round 365)',
                'title': title, 'evidence': 'a-round-365.md For B' if lid.startswith('A-') else 'c-round-365.md For B', 'repro': fix,
                'status': 'deferred_low_polish (D-29z1196): closed together by systemic task SYS-R365-STEM-CACHE-HARDENING (= PERF-9b-ii), queued right after PERF-9b-i (RETRO systemic-task rule: several Lows, one file, one root cause: storage write/commit discipline)', 'added': ADD})

for x in dlp:
    if x.get('id') in ('C-R364-01', 'A-R364-REVIEW-SELECTED-BEFORE', 'A-R364-REVIEW-MARKER-PRE-DRAG'):
        x['status'] = ('deferred_low_polish (D-29z1197): fix home re-routed - PERF-9b-i does not own doc 168 or the interactions spec '
                       '(its rows live in a new spec and doc 236); next task that owns perf/studio-lab-interactions.perf.spec.ts / doc 168, else the polish pass | ' + x['status'])

b.setdefault('systemic_tasks', []).append({
    'id': 'SYS-R365-STEM-CACHE-HARDENING', 'decision': 'D-29z1196',
    'closes': ['A-R365-REVIEW-L3', 'A-R365-REVIEW-L4', 'A-R365-REVIEW-L5', 'A-R365-REVIEW-L6', 'C-R365-OBS-INTEGRITY'],
    'scope': 'PERF-9b-ii: app/lib/arrangement/stem-cache.client.ts + its test file + doc 236; each Low gets an SC row and a red mutant on B sketch (L58); browser rows: corrupted OPFS file (C-R365-OBS-INTEGRITY) and changed validator (stored ETag edited -> one 200, entry re-stored; performance-optimizer round-365 consult); the reviewer proposal "serialize eviction planning per session" is ruled in that task',
    'queue': 'right after PERF-9b-i (round 366); REGRESSION first if its planning is on/after 2026-11-08', 'status': 'queued', 'added': ADD})

b['open_findings'].extend([
    {'id': 'B-R365-DEVTOOLS-NOCACHE-200', 'severity': 'info', 'origin': 'B pre-check (production build, round 365 planning)',
     'title': 'with DevTools Network.setCacheDisabled(true) Chromium adds Cache-Control: no-cache and Pragma: no-cache; remix-serve (express send/fresh) then answers 200 with the full body despite If-None-Match, so the stem cache saves nothing in that mode',
     'evidence': 'b-round-365/perf-sketch/headers-prod.json, run1.log; probe/stem-prod-*.json (warm-nocache)',
     'status': 'open info (D-29z1198): not a user path (real visitors get 304: warm-evicted and warm-http); PERF-9b-i records it as stem.warm-nocache.*; the round-365 dev-server CS-WARM cache-off 304 is a Vite behaviour, not production', 'added': ADD},
    {'id': 'B-R365-HARNESS-HOST-HEADERS', 'severity': 'info', 'origin': 'B pre-check (production build, round 365 planning)',
     'title': 'the perf harness host (remix-serve, playwright.perf.config.ts) serves public files with Cache-Control public, max-age=31536000, immutable and a weak ETag from size+mtime that changes on every build; production is Vercel (vercel.json framework remix), whose static headers were not measured',
     'evidence': 'b-round-365/perf-sketch/headers-prod.json; curl -sI on the scratch build (b-round-365.md section 3); vercel.json',
     'status': 'open info (D-29z1198): performance-optimizer rated the headers Medium if they were production; they are not (vercel.json). Question for root (ROOT-Q-R365-VERCEL-STATIC-HEADERS): measure /middle-east.mp3 headers on the Vercel deployment (Cache-Control, ETag stability across deploys); a mtime ETag there would re-download ~7.6 MB per returning visitor per deploy', 'added': ADD},
])
b.setdefault('retro_candidates', [])
if isinstance(b['retro_candidates'], list):
    b['retro_candidates'].append({'id': 'B-R365-COUNT-CLAIM-PLANNING-VS-FINAL', 'decision': 'D-29z1195', 'round': 365,
                                  'note': 'K11 (covering-test count) was pinned to its planning value although the task required 2 new files matching the same grep; A STOP 1. L56 count clause applied to the sketch for new ids but not to a final-state count; RETRO 368 input', 'added': ADD})

b['root_requests_b'].append({'id': 'ROOT-Q-R365-VERCEL-STATIC-HEADERS', 'decision': 'D-29z1198', 'blocking': False,
    'status': 'question: curl -sI the production /middle-east.mp3 and /videos/hero/hero-music.mp3 twice across one deploy; report Cache-Control, ETag, Last-Modified. If the ETag changes per deploy or immutable is set on these unhashed URLs, B plans a follow-up (content-hash validators or fingerprinted preview URLs) with root, since vercel.json / hosting is outside loop grants.',
    'added': ADD})

perf = next(x for x in b['post_current_stage_queue'] if isinstance(x, dict) and x.get('id') == 'STUDIO-PERFORMANCE')
perf['status'] = 'in_progress (D-29z1199): PERF-9a done (C round 365 PASS, gate 413218e); round 366 = PERF-9b-i (stem-cache perf rows, production build); then PERF-9b-ii (SYS-R365-STEM-CACHE-HARDENING) | ' + perf['status']
for t in perf['stages']:
    if t['id'] == 'PERF-9':
        t['status'] = 'in_progress (D-29z1195..D-29z1199): 9a done (C round 365 PASS, gate 413218e); round 366 = 9b-i; 9b-ii = SYS-R365-STEM-CACHE-HARDENING; 9c awaiting_user; 9d root | ' + t['status']
        t['split_d29z1197'] = {
            'PERF-9a': 'done: round 365 C PASS (browserVerified, realVerified), gate 413218e',
            'PERF-9b-i': 'round 366: perf/studio-lab-stem-cache.perf.spec.ts + perf/budgets.stem-cache.json (production build, CDP throttle 40 ms / 1,250,000 B/s; 7 asserts: cold-body-live, cold.entries-stored, warm.body-bytes 0, warm.status-304 2, warm-ready-ratio <= 0.5, blocked.ready, blocked.entries); doc 236 stage 2 of 3',
            'PERF-9b-ii': 'SYS-R365-STEM-CACHE-HARDENING: reviewer Lows L3-L6, browser-store integrity row, changed-validator row; doc 236 Completed',
            'doc_home_ruling': 'D-29z1192 named doc 168 for 9b; doc 168 is the interactions baseline and 9b-i owns neither it nor the interactions spec, so the stem rows go to doc 236 and the three round-364 Lows are re-routed (D-29z1197)',
        }
perf['consults_round_366'] = {
    'performance-optimizer': 'keep the 6 asserts (mutants separate them); add blocked.entries == 2 (adopted), CDP byte cross-check record rows (adopted: cdp-mp3-bytes, cdp-media-bytes), machine details (adopted), 1280 as a record pass (adopted as a C probe row); changed-ETag row (-> 9b-ii); forced revalidation per hit = Low later candidate PERF-CAND-STEM-BACKGROUND-REVALIDATE; production headers Medium IF production - rejected premise: production is Vercel (B-R365-HARNESS-HOST-HEADERS, ROOT-Q-R365-VERCEL-STATIC-HEADERS)',
    'tech-lead': TL,
}
perf['execution_order_d29z1200'] = 'PERF-9b-i (366) -> REGRESSION if the round-367 planning is on/after 2026-11-08, else PERF-9b-ii (SYS-R365-STEM-CACHE-HARDENING) -> RETRO 368 -> (REGRESSION when due) -> PERF-9b-ii if not yet run -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; PERF-9c awaiting_user; PERF-9d root'
perf['stages'].append({'id': 'PERF-CAND-STEM-BACKGROUND-REVALIDATE', 'what': 'stem-cache hit: serve the stored copy and revalidate in the background', 'status': 'candidate_not_scheduled (D-29z1198)', 'severity': 'low', 'decision': 'D-29z1198',
    'note': 'a stem-cache hit always revalidates before returning (one parallel 304 round trip per stem, ~44 ms window under the 9b throttle, < 5 % of warm ready 1275 ms); option: serve the stored copy and revalidate in the background. Only after ROOT-Q-R365-VERCEL-STATIC-HEADERS is answered (stale-audio risk). Not scheduled.', 'added': ADD})

b['decisions_log_b'].extend([
    {'id': 'D-29z1195', 'date': '2026-11-06', 'text': 'Round 365 closes as C PASS (c-round-365.json: taskStatus PASS, browserVerified true, realVerified true; 12 rows passed incl. CS-COLD/WARM/AUDIO/BLOCKED/CLEAR at both viewports and G365-AUTH; 2 rows blocked: SSR dev-log half (server stdout unreadable), fake-bearer 500 fails closed). Gate 365 published 413218e. PERF-9a done. A STOP rulings: K11 final = 12 accepted (C-R365-INFO-01 closed); sweep error is ignored (l.127 wins, l.143 listing was a B spec error; C-R365-INFO-02 closed). SSR dev-log half: dropped from future rows (BLOCKED twice; A and C cannot read the orchestrator pipe); a task that needs it starts its own server with redirected output. Baseline HEAD for round 366 = 413218e.'},
    {'id': 'D-29z1196', 'date': '2026-11-06', 'text': 'Reviewer Lows A-R365-REVIEW-L3..L6 and C-R365-OBS-INTEGRITY -> deferred_low_polish, closed together by the systemic task SYS-R365-STEM-CACHE-HARDENING (= PERF-9b-ii: one file, one root cause), queued right after PERF-9b-i. Info I2-I5 stay notes in a-round-365.md.'},
    {'id': 'D-29z1197', 'date': '2026-11-06', 'text': 'PERF-9b split into 9b-i (perf rows, round 366) and 9b-ii (hardening). Doc home ruling: stem rows go to doc 236 (stage 2 of 3), not doc 168; C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG re-routed to the next task owning the interactions spec / doc 168, else the polish pass.'},
    {'id': 'D-29z1198', 'date': '2026-11-06', 'text': 'B production pre-check (scratch 413218e build, remix-serve): warm reopen with the HTTP cache evicted = 2x 304, 0 network body bytes, ready 1275 vs 7427 ms (ratio 0.172; loaded 0.235); DevTools cache-disabled = 200 full body (B-R365-DEVTOOLS-NOCACHE-200, info); harness-host headers immutable + mtime ETag, production is Vercel (B-R365-HARNESS-HOST-HEADERS, info; ROOT-Q-R365-VERCEL-STATIC-HEADERS). Candidate PERF-CAND-STEM-BACKGROUND-REVALIDATE (Low, not scheduled).'},
    {'id': 'D-29z1199', 'date': '2026-11-06', 'text': 'Round 366 = PERF-9b-i (current-task.md): A applies b-round-365/sketch.patch.txt (2 new perf files) and updates doc 236 (l.4 In Progress (stage 2 of 3; C round 366 PASS), stage-2 content). No app/ change. B ran C\'s command on the sketch (production build): run2/run4-assert PASS, loaded replicate run3, mutants cache-off (5 asserts red + blocked.entries red in v3) and counter-zero (liveness red only). Reference-first / product-designer / screen budget not applicable (performance, nothing on screen).'},
    {'id': 'D-29z1200', 'date': '2026-11-06', 'text': 'Order after round 366: REGRESSION if the round-367 planning is on/after 2026-11-08, else PERF-9b-ii; RETRO at 368; then PERF-9b-ii if not yet run -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). Arch checkpoint: b-round-362/root-request-arch-checkpoint.md stays with root; no new request (9b-i touches no component owner).'},
])
for r in b['rounds']:
    if r.get('round') == 365:
        r['status'] = 'c_pass_published (D-29z1195): C round 365 PASS, gate 365 413218e'
b['rounds'].append({'round': 366, 'task': 'current-task.md', 'decision': 'D-29z1195..D-29z1200', 'type': 'PERF-9b-i: stem-cache perf rows on the production build (new spec + budgets), doc 236 stage 2', 'status': 'dispatched',
                    'note': 'baseline 413218e clean; sketch b-round-365/sketch.patch.txt; claims b-round-365/claims-366.sh', 'added': ADD})
b['current_task'] = 'current-task.md (round 366: PERF-9b-i stem-cache perf rows on the production build; perf/studio-lab-stem-cache.perf.spec.ts, perf/budgets.stem-cache.json, doc 236 stage 2)'
b['version'] = 329
b['updated'] = ADD
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('ok')
