import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-364/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/backlog.json'
b = json.load(open(p))
assert b['version'] == 327, b['version']
ADD = '2026-11-06 B round 364 -> 365 planning'
EV = 'c-round-364.json (taskStatus PASS, browserVerified true, realVerified true); gate 364 published df4e5b1 (both remotes)'

def finding(fid):
    for f in b['open_findings']:
        if f.get('id') == fid:
            return f
    raise KeyError(fid)

for fid in ('C-R363-01', 'C-R363-02', 'C-R320-01', 'A-R362-DOC-STALE-MERMAID'):
    f = finding(fid)
    f['status'] = f'closed (D-29z1189): fixed in round 364; {EV} | ' + f['status']

f = finding('B-R363-PRECHECK-PERFLIB')
f['status'] = 'retro_input (D-29z1189): RETRO 368 input; C-R363-01 itself closed by C round 364 PASS | ' + f['status']

dlp = b['deferred_low_polish']
for entry in [
    {'id': 'C-R364-01', 'severity': 'low', 'origin': 'B spec (round-364 doc grant was additions-only)',
     'title': 'doc 168 l.113 and l.284 (round-225 paragraphs) still say 16 wallclock commits-per-move rows; the round-364 bullet says 18',
     'evidence': 'c-round-364.json bugs[0]; a-round-364.md For B', 'repro': "grep -n '16 commits-per-move' docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md",
     'status': 'deferred_low_polish (D-29z1190): fix home = the next task that owns doc 168 (PERF-9b adds its rows to doc 168), else the polish pass', 'added': ADD},
    {'id': 'A-R364-REVIEW-SELECTED-BEFORE', 'severity': 'low', 'origin': 'A code-reviewer (round 364)',
     'title': "measureBackgroundRangeDrag: the selectedAfter !== selectedBefore reset check has no passing outcome when the clip starts unselected; it relies on earlier stopped-drag resets leaving the clip selected",
     'evidence': 'a-round-364.md A-REVIEW', 'repro': 'reorder the interactions spec so the background step runs first; the reset problem blames the reset',
     'status': 'deferred_low_polish (D-29z1190): harness robustness; fix home = next task owning perf/studio-lab-interactions.perf.spec.ts (PERF-9b)', 'added': ADD},
    {'id': 'A-R364-REVIEW-MARKER-PRE-DRAG', 'severity': 'low', 'origin': 'A code-reviewer (round 364)',
     'title': 'the Insert Marker read happens after the drag, so the harness catches only a reset that moves it, not a drag that moves it (jsdom background-time-selection-ui l.317-319 covers the drag)',
     'evidence': 'a-round-364.md A-REVIEW', 'repro': 'read perf/studio-lab-interactions.perf.spec.ts measureBackgroundRangeDrag',
     'status': 'deferred_low_polish (D-29z1190): add one readInsertMarker before t0 when PERF-9b owns the spec', 'added': ADD},
]:
    dlp.append(entry)

b['open_findings'].append({'id': 'B-R364-DEMO-DOUBLE-FETCH', 'severity': 'info', 'origin': 'B probe (HEAD dev, round 364 planning)',
    'title': 'a cold /studio-lab open shows two resource entries for /middle-east.mp3 (one status 0 transfer 300 B, one 200 gzip 908 KB) and the warm reopen re-downloaded it in full (4,054,380 B) while hero-music revalidated (transfer 300 B)',
    'evidence': 'b-round-364/probe/reopen-1440.json', 'cause_probe': 'sketch probe b-round-364/probe/sketch-cache-1440x900.json: the extra entry has initiatorType audio (status 0, 0 body bytes) in every open; the loader makes exactly one fetch per URL. Inference (not yet proven): the StudioNarrowScreen preview <audio preload=metadata> (app/components/arrangement/StudioNarrowScreen.tsx) is mounted at 1440 too. The full 4 MB warm re-download is the HTTP-cache behaviour the stem cache removes.', 'status': 'open info (D-29z1191): not a loader double fetch; round 365 row ONE-FETCH pins exactly one fetch-initiator request per URL per open; the audio-initiator metadata request is recorded, not fixed (StudioNarrowScreen not granted)', 'added': ADD})

for f in b['open_findings']:
    if f.get('id') == 'SABA-Q-PERF4-STUDIO-CACHE':
        f['status'] = 'awaiting_user (D-29z821; D-29z1192): blocks PERF-4b and PERF-9c (purchased stems in the stem cache); the PERF-9a cache is public-preview only | ' + f['status']
        break
else:
    raise KeyError('SABA-Q-PERF4-STUDIO-CACHE')

b['root_requests_b'].append({'id': 'ROOT-REQ-PERF9D-LEGACY-CACHE', 'file': 'tasks/round-365.md section 5 (after archive) / current-task.md section 5', 'decision': 'D-29z1192', 'blocking': False,
    'status': "proposal: PERF-9d needs protected files: retire app/lib/audio-cache.ts (only importer app/contexts/StudioContext.tsx, protected) with the SRW-21 mount, delete the legacy 'czaba-audio-cache' DB once on the new route, and rewrite .claude/skills/indexeddb-cache/SKILL.md (protected .claude/**) to describe the v2 stem cache (czaba-stem-cache-v2, OPFS + IndexedDB index, validators, LRU). Loop does not edit these files.",
    'added': ADD})

perf = next(x for x in b['post_current_stage_queue'] if isinstance(x, dict) and x.get('id') == 'STUDIO-PERFORMANCE')
perf['status'] = 'in_progress (D-29z1193): PERF-10 done (C round 364 PASS, gate df4e5b1); round 365 = PERF-9a (stem cache v2, public previews); then PERF-9b | ' + perf['status']
stages = perf['stages']
for t in stages:
    if t['id'] == 'PERF-10':
        t['status'] = 'done (D-29z1189): 10a (358), 10a-BUDGETS (360), 10b-i (361), 10b-ii-a (362), 10b-ii-b (rounds 363-364; C round 364 PASS browserVerified/realVerified true, gate 364 published df4e5b1); required rows C-R320-01 (+ A-R320-REVIEW-WAVEFORM-NAME-POSITIVE) and GATE320-S3 delivered | ' + t['status']
    if t['id'] == 'PERF-9':
        t['status'] = 'in_progress (D-29z1191..D-29z1193): split 9a/9b/9c/9d; round 365 = PERF-9a | ' + t['status']
        t['harness_decision_d29z1191'] = 'D-29z1152 resolved: the two same-origin public previews /studio-lab already fetches (/middle-east.mp3, /videos/hero/hero-music.mp3; ETag + Last-Modified) are the network stem path. Rejected: a mock-api collection (adds a product path that exists only for tests) and SRW-21-PLAN (protected files, deferred_user).'
        t['split_d29z1192'] = {
            'PERF-9a': 'round 365: source-fetch.ts (shared fetch/decode/error mapping), stem-cache.ts (pure policy), stem-cache.client.ts (OPFS file per entry + IndexedDB index czaba-stem-cache-v2, conditional revalidation, 304 -> cached bytes, network error -> cached bytes, any storage error -> plain network, LRU budget min(256 MB, 10% quota), no persist()), wired into the demo public previews only; purchased adapter shares source-fetch but never the cache',
            'PERF-9b': 'perf harness rows: warm-reopen stem body bytes (0), request count, cold vs warm stem-load time under a fixed CDP throttle (plan target ready <= 50% of cold is gated on stem-load time; whole ready is record); budgets; doc 168; carries C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG',
            'PERF-9c': 'purchased stems in the cache: awaiting_user SABA-Q-PERF4-STUDIO-CACHE (with SRW-21-PLAN)',
            'PERF-9d': 'legacy audio-cache.ts retirement + indexeddb-cache skill doc: protected files, ROOT-REQ-PERF9D-LEGACY-CACHE',
        }
        t['plan_deviations_d29z1192'] = [
            'target "second open: 0 stem network bytes" -> "0 stem body bytes" (a conditional request with a 304 is allowed; it keeps a changed file fresh)',
            '"ready <= 50% of cold" is defined in PERF-9b under a fixed CDP throttle and gated on stem-load time: on localhost fetch is not the bottleneck (B probe 2759 vs 2483 ms)',
            'navigator.storage.persist() is not called: Firefox shows a permission prompt and best-effort storage is enough for a re-downloadable cache',
            'keys are the same-origin path plus the ETag / Last-Modified validators, not a content hash: a hash needs the full download before lookup and cannot give a 304',
        ]
perf['consults_round_365'] = {
    'performance-optimizer': 'agent a7d6cebf: split and revalidation sound; 304 before !ok; store decoded bytes; skip 206/opaque/no-store/Vary other than Accept-Encoding; copy before decode; temp file then IDB record as commit point; per-key in-flight; 404/410 evict; budget min(256 MB, 10% quota), entry > budget/4 not stored, no persist(); QuotaExceeded -> evict once, retry once, then off for the session; 9a rows with Network.setCacheDisabled; ready <= 50% only under a CDP throttle (9b)',
    'tech-lead': 'agent af4eb2cb: extract fetchAndDecodeSource now (source-fetch.ts), cache as a SourceFetch (createCachedFetch), purchased keeps plain fetch with a test that it never calls the cache; StemCacheStore get/put/delete/list with an in-memory fake; DB czaba-stem-cache-v2 + schemaVersion; temp file then index; read whole file; AbortError passes through; same-origin no-query keys; SSR guard; strings.test.ts DEMO_REMAINING_GEORGIAN_LINES re-run',
}
perf['execution_order_d29z1194'] = 'PERF-9a (365) -> PERF-9b -> REGRESSION first at any planning on/after 2026-11-08 -> PERF-11 (absorbs GATE361-S1, SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE, SIG-R361-CONTEXT-LEAF-CONSUMERS, A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT) -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM; PERF-9c awaiting_user; PERF-9d root; RETRO at 368 or end of STUDIO-PERFORMANCE'

b['decisions_log_b'].extend([
    {'id': 'D-29z1189', 'date': '2026-11-06', 'text': 'Round 364 closes as C PASS (c-round-364.json: taskStatus PASS, browserVerified true, realVerified true; 9 rows passed; gate rows left to the gate). Gate 364 published df4e5b1 (rounds 363-364). Closed: C-R363-01, C-R363-02, C-R320-01 (with the A-R320-REVIEW-WAVEFORM-NAME-POSITIVE and GATE320-S3 rows), A-R362-DOC-STALE-MERMAID. PERF-10 done (stages 10a..10b-ii-b). B-R363-PRECHECK-PERFLIB stays a RETRO 368 input. Baseline HEAD for round 365 = df4e5b1.'},
    {'id': 'D-29z1190', 'date': '2026-11-06', 'text': 'New Lows to deferred_low_polish (2026-10-23 rule): C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG; their cheap fix home is PERF-9b (owns doc 168 and the interactions spec). SIG-R363-DRAG-ROW-WRITER stays a signal (A round-364 reviewer agrees: keep separate). PERF-10 is a feature boundary: the open request b-round-362/root-request-arch-checkpoint.md is now actionable for root; no second request; PERF-CAND-MASTER-GROUP-FADER-PROPS keeps waiting on it; PERF-9a does not touch ArrangementContext or StudioWorkspace.'},
    {'id': 'D-29z1191', 'date': '2026-11-06', 'text': 'PERF-9 harness decision (D-29z1152): the network stem path is the two same-origin public previews /studio-lab already fetches. Rejected: a mock-api collection (test-only product path) and SRW-21-PLAN (protected, deferred_user). B probe HEAD dev (b-round-364/probe/reopen-1440.json): warm reopen re-downloaded /middle-east.mp3 in full (4,054,380 B), hero-music revalidated; recorded B-R364-DEMO-DOUBLE-FETCH (info).'},
    {'id': 'D-29z1192', 'date': '2026-11-06', 'text': 'PERF-9 split 9a/9b/9c/9d with four plan deviations (0 stem body bytes; ready ratio under a CDP throttle in 9b; no persist(); path + validator keys). 9c (purchased) awaiting_user on SABA-Q-PERF4-STUDIO-CACHE; 9d (legacy cache + skill doc, protected files) = ROOT-REQ-PERF9D-LEGACY-CACHE. Scope not shrunk: every plan item has a stage.'},
    {'id': 'D-29z1193', 'date': '2026-11-06', 'text': 'Round 365 = PERF-9a (current-task.md): 7 app files (3 new modules, collection.ts, studio-lab-demo.ts, 2 new test files) + doc 236. B sketch on df4e5b1: tsc 0, biome 0, covering 10 files 165/165, full suite 248 files 3647/3647, browser probe on a scratch dev server (b-round-364/probe/). Reference-first / product-designer / screen budget not applicable (performance, nothing on screen).'},
    {'id': 'D-29z1194', 'date': '2026-11-06', 'text': 'Order after round 365: PERF-9b -> REGRESSION first at any planning on/after 2026-11-08 -> PERF-11 -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). RETRO at 368 or end of STUDIO-PERFORMANCE.'},
])
for r in b['rounds']:
    if r.get('round') == 364:
        r['status'] = 'c_pass_published (D-29z1189): C round 364 PASS, gate 364 df4e5b1'
b['rounds'].append({'round': 365, 'task': 'current-task.md', 'decision': 'D-29z1189..D-29z1194', 'type': 'PERF-9a: stem cache v2 for the /studio-lab public previews (OPFS + IndexedDB index, conditional revalidation, LRU), shared source-fetch', 'status': 'dispatched',
    'note': 'baseline df4e5b1 clean; sketch b-round-364/sketch.patch.txt; claims b-round-364/claims-365.sh', 'added': ADD})
b['current_task'] = 'current-task.md (round 365: PERF-9a stem cache v2 for the two /studio-lab public previews; source-fetch.ts, stem-cache.ts, stem-cache.client.ts, collection.ts, studio-lab-demo.ts, tests, doc 236)'
b['version'] = 328
b['updated'] = ADD
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('ok\n')
print('ok')
