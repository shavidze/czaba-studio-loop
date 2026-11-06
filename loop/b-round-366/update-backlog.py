import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-366/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 329, b['version']
ADD = '2026-11-06 B round 366 -> 367 planning'


def finding(fid):
    for f in b['open_findings']:
        if f.get('id') == fid:
            return f
    raise KeyError(fid)


f = finding('B-R364-DEMO-DOUBLE-FETCH')
f['status'] = ('open info (D-29z1204): C round 366 saw the 206 Media request on the cold open at 1440x900 too (c-round-366.md observations); '
               'B round-366 HEAD probe (b-round-366/probe/head-1440x900.json, head-1280x720.json) shows a timing-dependent side effect: when the aborted '
               '206 primes the HTTP cache, the cold stem fetch is sent with If-None-Match and answered 200 with fewer body bytes (3,464,881 / 3,592,881 vs 4,054,384); '
               'the sketch build cold open had no If-None-Match. Not fixed (StudioNarrowScreen not granted); still routed to its own task | ' + f['status'])

f = finding('C-R178-EXPORT-CLIPS-AT-0DB')
f['status'] = ('signal (D-29z1204), severity to confirm: C round 366 AUDIO export of the 101 s demo project peaks at 1.0 (24-bit, rms -15.29 dB), identical for cold, '
               'warm and blocked opens (c-round-366/audio.json), so it is not a cache effect. Repro: /studio-lab, add Middle East public preview with Enter, Export WAV, '
               'read the sample peak. Same root as this finding (demo mix clips at 0 dB). Owner: T12-ADVANCED T12.20 (RMS/LUFS) or a product question to Saba; '
               'not scheduled before then | ' + f['status'])

dlp = b['deferred_low_polish']
A366 = [
    ('A-R366-REVIEW-QUIET-NOOP', 'perf/studio-lab-stem-cache.perf.spec.ts: waitForQuietState is a no-op because the spec does not install installPerfInstrumentation'),
    ('A-R366-REVIEW-NOCACHE-REWRITE', 'stem-cache spec: the warm-nocache background rewrite is not awaited before the blocked step (every interruption leaves a consistent pair; reviewer traced put())'),
    ('A-R366-REVIEW-QUOTA-DETAIL', 'stem-cache spec: low quota silently skips caching; record navigator.storage.estimate().quota as a row'),
    ('A-R366-REVIEW-PAGEERROR', 'stem-cache spec: page errors are not counted'),
    ('A-R366-REVIEW-NAMING', 'stem-cache spec: stemEntriesTimeoutMs should be stemFetchTimeoutMs'),
    ('A-R366-REVIEW-DOUBLE-REPORT', 'stem-cache spec: a blocked-open failure is reported twice'),
    ('A-R366-REVIEW-ABOUT-BLANK', 'stem-cache spec: a repeat same-URL goto may count as a reload'),
    ('A-R366-REVIEW-STEM-PATHS', 'stem-cache spec: stemPaths duplicates the private demoUrls'),
    ('A-R366-REVIEW-FETCH-ASSERT', 'stem-cache spec: stem.warm.fetch-requests is record-only, so a consistent double-fetch passes silently; candidate assert == 2'),
    ('A-R366-REVIEW-CDP-RESIDUAL', 'stem-cache spec: residual CDP byte window (old-page bytes between takeMp3Bytes() and the navigation commit)'),
]
for lid, title in A366:
    dlp.append({'id': lid, 'severity': 'low', 'origin': 'A code-reviewer (round 366)', 'title': title,
                'evidence': 'a-round-366.md Code-reviewer (Lows routed to B)', 'repro': 'see a-round-366.md; fix in perf/studio-lab-stem-cache.perf.spec.ts',
                'status': 'deferred_low_polish (D-29z1202): perf-spec Lows; PERF-9b-ii owns stem-cache.client.ts, not the perf spec (one owner, one root cause per round). '
                          'Fixed by the next task that owns perf/studio-lab-stem-cache.perf.spec.ts, else the polish pass. FETCH-ASSERT is the first candidate (an assert needs an L58 sketch run).',
                'added': ADD})

b['architecture_signals'].append({'id': 'SIG-R366-STEM-STORE-NAME', 'origin': 'A round-366 code-reviewer Architecture note',
                                  'note': "perf/studio-lab-stem-cache.perf.spec.ts hardcodes 'entries', a copy of the private STORE_NAME in stem-cache.client.ts; proposal: export STEM_CACHE_STORE_NAME from stem-cache.ts and import it in the spec. Signal only, not scheduled; folded into ARCH-CHECKPOINT-PERF9-STEM-CACHE question 2.",
                                  'added': ADD})

b.setdefault('architecture_checkpoint_requests', []).append({
    'id': 'ARCH-CHECKPOINT-PERF9-STEM-CACHE', 'decision': 'D-29z1203', 'requested_of': 'root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)',
    'file': 'b-round-366/root-request-arch-checkpoint.md', 'blocking': False,
    'when': 'after C round 367 PASS (PERF-9b-ii closes the cloud part of PERF-9; 9c awaiting_user, 9d root)',
    'status': 'requested', 'added': ADD})

b.setdefault('retro_candidates', []).extend([
    {'id': 'B-R366-SKETCH-MEDIUMS-UNRULED', 'decision': 'D-29z1201', 'round': 366,
     'note': "A's code-reviewer found 2 Medium on B's dispatched sketch v4 (audio-requests kind, CDP byte window) that b-round-365/sketch-review.md did not rule; A fixed them under task 366 section 1.1; C PASS. L58 says an unruled Medium on the sketch is a planning FAIL (B origin). RETRO 368 input.", 'added': ADD},
    {'id': 'B-R366-V1-SKETCH-HIGHS', 'decision': 'D-29z1203', 'round': 366,
     'note': 'B sketch v1 for PERF-9b-ii had 2 High (transactionDone rejected with null on onerror; the L5 wait put the commit queue on the response path) and a regex source-scan row; all 13 mutants were red on v1, so mutants alone did not catch them; the tech-lead sketch review did. RETRO 368 input: a review before dispatch is load-bearing, not a formality.', 'added': ADD},
])

perf = next(x for x in b['post_current_stage_queue'] if isinstance(x, dict) and x.get('id') == 'STUDIO-PERFORMANCE')
perf['status'] = 'in_progress (D-29z1203): PERF-9a and PERF-9b-i done (C rounds 365/366 PASS, gates 413218e/d53d113); round 367 = PERF-9b-ii (SYS-R365-STEM-CACHE-HARDENING) | ' + perf['status']
for t in perf['stages']:
    if t['id'] == 'PERF-9':
        t['status'] = 'in_progress (D-29z1201..D-29z1203): 9a done (365), 9b-i done (C round 366 PASS, gate d53d113), round 367 = 9b-ii; 9c awaiting_user; 9d root | ' + t['status']
        t['split_d29z1197']['PERF-9b-i'] = 'done (D-29z1201): C round 366 PASS (browserVerified, realVerified; 7/7 asserts, ratio 0.184), gate d53d113 | ' + t['split_d29z1197']['PERF-9b-i']
        t['split_d29z1197']['PERF-9b-ii'] = ('round 367 (D-29z1203): stem-cache.client.ts commit discipline (transactionDone on abort only, abort/disabled re-checks, '
                                             'non-blocking chained hit delete, clone/headers guards, per-session commit chain), SC22-SC29 incl. fake IndexedDB+OPFS rows, '
                                             'browser rows INTEGRITY (truncate, delete-file) and VALIDATOR (stale ETag); doc 236 Completed | ' + t['split_d29z1197']['PERF-9b-ii'])
perf['consults_round_367'] = {
    'tech-lead': 'sketch v1 review: High TL-1 (transactionDone rejected with null on onerror -> quota retry broken), High TL-2 (L5 wait on the response path), Medium TL-3 (chain hang surface: accepted, loads never wait on it after TL-2), Medium TL-4 (regex SC23 -> fake IndexedDB+OPFS rows), Medium TL-5 (same-key race: fixed by TL-2), Low TL-6..8; serialise eviction planning: yes. Rulings in b-round-366/sketch-review.md.',
}
perf['execution_order_d29z1205'] = ('PERF-9b-ii (367) -> RETRO 368 (window 353..367) -> REGRESSION at the first planning on/after 2026-11-08 that is not the RETRO round '
                                    '-> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS '
                                    '-> T12-ADVANCED -> phase-2 entries (skip rule). PERF-9c awaiting_user; PERF-9d root; ARCH-CHECKPOINT-PERF9-STEM-CACHE with root (non-blocking).')

for st in b['systemic_tasks']:
    if st.get('id') == 'SYS-R365-STEM-CACHE-HARDENING':
        st['status'] = 'dispatched round 367 (D-29z1203); closes its 5 Lows only on C PASS'

b['decisions_log_b'].extend([
    {'id': 'D-29z1201', 'date': '2026-11-06', 'text': 'Round 366 closes as C PASS from C evidence (c-round-366.json: taskStatus PASS, browserVerified true, realVerified true; 10 rows passed incl. PERF 7/7 asserts with warm-ready-ratio 0.184, own mutant red on stem.blocked.ready, PROBE both viewports, AUDIO with identical WAV sha256 across cold/warm/blocked, G366-AUTH both viewports; blocked: fake-bearer 500, backend only). Gate 366 published d53d113 (both remotes) = baseline of round 367. PERF-9b-i done. A changed the sketch for 2 code-reviewer Mediums that B had not ruled: RETRO 368 input B-R366-SKETCH-MEDIUMS-UNRULED (B origin, L58).'},
    {'id': 'D-29z1202', 'date': '2026-11-06', 'text': 'A-R366-REVIEW-* (10 perf-spec Lows) -> deferred_low_polish; fixed by the next owner of perf/studio-lab-stem-cache.perf.spec.ts or the polish pass (PERF-9b-ii owns stem-cache.client.ts only). Architecture note STEM_CACHE_STORE_NAME -> architecture_signals SIG-R366-STEM-STORE-NAME.'},
    {'id': 'D-29z1203', 'date': '2026-11-06', 'text': 'Round 367 = PERF-9b-ii (current-task.md): A applies b-round-366/sketch.patch.txt (v2, sha 66ce5455) to stem-cache.client.ts + stem-cache.test.ts and writes doc 236 stage 3 (l.4 Completed (C round 367 PASS)). B pre-check: covering 31/31, full suite 250 files / 3684 tests rc 0, typecheck 0, Biome 0, 13 mutants red on their rows, browser probes on HEAD and sketch production builds at both viewports (recovery identical, playback live), 2 mutant builds red on the INTEGRITY truncate and VALIDATOR rows. tech-lead review of v1: 2 High + 3 Medium all ruled (sketch-review.md). Serialise eviction planning: yes. Architecture checkpoint request ARCH-CHECKPOINT-PERF9-STEM-CACHE to root (non-blocking, after C 367 PASS).'},
    {'id': 'D-29z1204', 'date': '2026-11-06', 'text': 'Observations from C round 366 recorded, not scheduled: B-R364-DEMO-DOUBLE-FETCH (206 at 1440 cold; HTTP-cache priming side effect) and the WAV peak 1.0 under C-R178-EXPORT-CLIPS-AT-0DB (severity to confirm; T12-ADVANCED T12.20 or Saba).'},
    {'id': 'D-29z1205', 'date': '2026-11-06', 'text': 'Order after round 367: RETRO 368 (15-round rule, window 353..367; reviews the whole screen and journey per policy) -> REGRESSION at the first planning on/after 2026-11-08 that is not the RETRO round -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule).'},
])
for r in b['rounds']:
    if r.get('round') == 366:
        r['status'] = 'c_pass_published (D-29z1201): C round 366 PASS, gate 366 d53d113'
b['rounds'].append({'round': 367, 'task': 'current-task.md', 'decision': 'D-29z1201..D-29z1205', 'type': 'PERF-9b-ii: stem-cache commit discipline (SYS-R365-STEM-CACHE-HARDENING), doc 236 Completed', 'status': 'dispatched',
                    'note': 'baseline d53d113 clean; sketch b-round-366/sketch.patch.txt; claims b-round-366/claims-367.sh', 'added': ADD})
b['current_task'] = 'current-task.md (round 367: PERF-9b-ii stem-cache commit discipline; app/lib/arrangement/stem-cache.client.ts, its test file, doc 236 stage 3 Completed)'
b['version'] = 330
b['updated'] = ADD
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('ok')
