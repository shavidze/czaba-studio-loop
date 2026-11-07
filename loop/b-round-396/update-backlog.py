import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-396/update-backlog.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 363, d['version']
BY = '2026-11-07 B round 396 -> 397 planning'
d['version'] = 364
d['updated'] = BY
d['current_task'] = 'Round 397: PERF-13d (final PERF-13 stage): the 5 worker synth demo buffers are built one per timer task from one shared array (copyToChannel x2, generateDemoStereoChannels deleted); SB1-SB6; browser BUF-TASKS/SAME-ARRAY/HASH/STATUS/PLAY at 6x; doc 253 new, doc 247 Completed (current-task.md)'
def walk(o):
    if isinstance(o, dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o, list):
        for v in o: yield from walk(v)
def by_id(i):
    hits = [o for o in walk(d) if o.get('id') == i]
    assert hits, i
    return hits
def prepend(o, key, text):
    o[key] = text + (' | ' + o[key] if o.get(key) else '')
EV = 'C round 396 PASS (c-round-396.json: browserVerified/realVerified true, 0 bugs; PERF-RES preview rows 1/0/0, R8 crossOrigin anonymous, R1b/R1-R7, AUTH, SOURCE-SCOPE, DOCS) + gate 396 published 4f28bff (both remotes)'
for i in ['TL-B395-SKETCH-M2-CROSSORIGIN', 'A-R395-REVIEW-L2-THROW-WHILE-ARMED', 'B-R395-DOC248-STATUS', 'GATE393-L4-FALLBACK-NEVER-EXPIRES']:
    for o in by_id(i):
        prepend(o, 'status', f'done (D-29z1355): {EV}')
        o['closed'] = BY
for o in by_id('PERF-13c'):
    prepend(o, 'status', f'done (D-29z1355): all 3 stages passed C (393, 395, 396); {EV}; purchased preview browser half stays open evidence on SRW-21 (BLOCKED no mount point)')
    for st in o.get('stages_d29z1340', []):
        if st.get('id') == 'PERF-13c-ii-b':
            prepend(st, 'status', f'done (D-29z1355): {EV}; row PURCHASED-PREVIEW-BROWSER BLOCKED (no mount point, SRW-21 deferred_user) - kept as open evidence on SRW-21, not passed')
for o in by_id('PERF-13d'):
    o['status'] = 'dispatched round 397 (D-29z1356): worker-path yield (setTimeout 0) + signal.throwIfAborted before each of the 5 synth buffer builds; copyToChannel(samples, 0/1) from one array; generateDemoStereoChannels deleted; SFX not yielded (narrow-gate NG5b/c collision, b-round-396/precheck-full-v1-yield-all.log); premise confirmed at HEAD 6x (b-round-396/probe/head-6x-1.json 187 ms; rows-summary.txt HEAD 5 builds in one 135-185 ms longtask x6, sketch <=1 per longtask, hashes equal) | ' + o.get('status', '')
    o['closes'] = ['R314-DEMO-BUFFER-LONGTASK-6X', 'PERF2-STEREO-COPY']
    o['doc'] = 'docs/implementation/2026/quarter-IV/253-perf-demo-synth-buffers.md (new); doc 247 l.4 -> Completed (C round 397 PASS) (L28 final PERF-13 stage)'
for o in by_id('PERF-13'):
    prepend(o, 'status', 'in_progress (D-29z1355): 13a, 13b, 13c done (4f28bff); round 397 = 13d (final stage); doc 247 closes with it')
for o in by_id('STUDIO-PERFORMANCE'):
    prepend(o, 'status', 'in_progress (D-29z1355): PERF-13c done (4f28bff); round 397 = PERF-13d (final PERF-13 stage); then PERF-14, PERF-15; regression due on/after 2026-11-10; RETRO 400')
for o in by_id('R314-DEMO-BUFFER-LONGTASK-6X'):
    prepend(o, 'status', 'scheduled round 397 (D-29z1356): premise confirmed at HEAD (hypothesis -> confirmed cause: the 5 synth loads resume from one awaited worker promise, so all builds run in one task; b-round-396/probe/rows-summary.txt); fix = one timer task per build; browser row BUF-TASKS asserts <=1 build per longtask (HEAD 5)')
for o in by_id('PERF2-STEREO-COPY'):
    prepend(o, 'status', 'scheduled round 397 (D-29z1356): copyToChannel(samples, 0) and (samples, 1); generateDemoStereoChannels deleted; rows SB1/SB2 identity + BUF-SAME-ARRAY (HEAD 0/5, sketch 5/5)')
for o in by_id('ARCH-CHECKPOINT-PREVIEW-AFTER-13C'):
    o.setdefault('signals', []).append('GATE396-ARCH-STREAM-FACTORY: gate-396 reviewer: keep playLibraryPreviewStream as one closure (one lifecycle, PS1-PS29); extract a pure createStreamPreview(element, hooks) inside preview.client.ts only if a fourth round touches the region (D-29z1357)')
    prepend(o, 'status', 'DUE NOW (D-29z1358): PERF-13c passed C round 396 (gate 396 4f28bff); request b-round-393/root-request-arch-checkpoint-preview.md stands, answer together with ARCH-CHECKPOINT-DECODE-REGION; reminder b-round-396/root-request-arch-checkpoint-due.md; does not block PERF-13d (touches neither region)')
d['architecture_signals'].append({'id': 'GATE396-ARCH-STREAM-FACTORY', 'origin': 'gate 396 code-reviewer Architecture note (gates/round-396/review.md)', 'note': 'playLibraryPreviewStream holds six listeners, a stall timer, a same-URL seek path and crossOrigin in one closure; rounds 394-396 changed it; keep now; candidate pure createStreamPreview(element, hooks) in preview.client.ts only if a fourth round touches it', 'status': 'recorded (D-29z1357); joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C', 'added': BY})
for o in by_id('B-R395-PERF-RESTORE-CATCH'):
    o['evidence'] = o.get('evidence', '') + ' | same root cause also reported by gate 396 reviewer Low 3 (gates/round-396/review.md: perf/studio-lab-resources.perf.spec.ts l.535-538, 576-581), merged here (D-29z1357, L7)'
lows = [
    ('GATE396-L1-CORS-DEPLOY', 'low', 'gates/round-396/review.md Low 1', 'crossOrigin anonymous on the stream element needs Access-Control-Allow-Origin on the production asset host (R2/CDN) for range requests before SRW-21 mounts purchased stems; without it the stream errors and falls back to decode, which needs the same header', 'gate 396 code-reviewer'),
    ('GATE396-L2-SIGNED-URL-STRING', 'low', 'gates/round-396/review.md Low 2', 'collection.previewUrl hands out the signed stem URL as a plain string (same URL loadSource uses; not logged or rendered); signed-URL expiry matters at SRW-21: a refresh must build a new collection object', 'gate 396 code-reviewer'),
    ('GATE396-I4-PREVIEW-ELEMENT-IDENTITY', 'info', 'gates/round-396/review.md Info 4', 'perf preview step proves that some media element played >= 1 s, not that it is the library preview element', 'gate 396 code-reviewer'),
    ('A-R396-REVIEW-DOC248-TODO', 'low', 'a-round-396.md Code review Low (outside grants)', 'doc 248 TODO (~l.93) still lists PERF-13b-ii as a next step while l.4 says Completed', 'A round 396 code-reviewer'),
    ('C-R396-NOTE-PS29-TITLE', 'low', 'c-round-396.json lows[0]', "PS29 title says 'like the credential-free decode fetch'; crossorigin=anonymous is the same-origin credentials mode; retitle when the test file is next owned", 'C round 396'),
]
for i, sev, ev, t, origin in lows:
    d['deferred_low_polish'].append({'id': i, 'severity': sev, 'origin': origin, 'evidence': ev, 'title': t, 'status': 'deferred_low_polish (D-29z1357)' + ('; SRW-21-PLAN input' if i.startswith('GATE396-L') else ''), 'added': BY})
for o in by_id('SRW-21-PLAN'):
    o.setdefault('inputs_d29z1357', []).extend(['GATE396-L1-CORS-DEPLOY: confirm the asset host sends CORS headers for range requests', 'GATE396-L2-SIGNED-URL-STRING: a signed-URL refresh builds a new collection object (with TL-B395-SRW21-MEMO-ADAPTER)', 'PURCHASED-PREVIEW-BROWSER (C round 396 BLOCKED, no mount point): a browser row for a purchased preview stream once the route mounts'])
decs = [
 ('D-29z1355', 'Round 396 result: C PASS (c-round-396.json: browserVerified/realVerified true, 0 bugs; PERF-RES preview rows 1/0/0 asserted, R8 crossOrigin anonymous, R1b/R1-R7, AUTH, SOURCE-SCOPE, DOCS) and gate 396 published 4f28bff to both remotes (gates/gate-round-396.json). PERF-13c-ii-b and PERF-13c done. Closed: TL-B395-SKETCH-M2-CROSSORIGIN, A-R395-REVIEW-L2-THROW-WHILE-ARMED, B-R395-DOC248-STATUS, GATE393-L4-FALLBACK-NEVER-EXPIRES. PURCHASED-PREVIEW-BROWSER stays open evidence on SRW-21 (BLOCKED, no mount point), not passed.'),
 ('D-29z1356', 'PERF-13d dispatched as round 397 (final PERF-13 stage). Premise re-measured at HEAD (L37): one 135-187 ms long task at 6x holds all 5 worker synth buffer builds (b-round-396/probe/head-6x-1.json, rows-summary.txt); R314 cause confirmed (one awaited worker promise). Rulings: (1) copyToChannel(samples, 0/1) from one array, generateDemoStereoChannels deleted; (2) worker path awaits a setTimeout(0) yield then signal.throwIfAborted before each build, so 5 builds = 5 tasks; generated SFX not yielded (applying it broke NG5b/NG5c, b-round-396/precheck-full-v1-yield-all.log); setTimeout not scheduler.yield (support); (3) aborted worker-path load rejects with signal.reason; both consumers ignore it; (4) mono rejected (StereoPanner equal-power law on mono input changes the sound; peaks/export read channel count); (5) no status write moved; (6) no new perf spec row (no load row isolates the builds; 1x builds ~30 ms total); deterministic browser rows from b-round-396/probe/rows.cjs instead. Consults: performance-optimizer (include the yield) and tech-lead (separate stage) disagreed on bundling; B bundled because the change is one function in one file, the yield is the only part that splits the task, and both found no hang risk. tech-lead sketch review: 0 Critical/High/Medium (b-round-396/sketch-review.md, reviewed sha = dispatched sha 4db03d5a).'),
 ('D-29z1357', 'Placement of round-396 notes: GATE396-L1-CORS-DEPLOY, GATE396-L2-SIGNED-URL-STRING (both SRW-21-PLAN inputs), GATE396-I4-PREVIEW-ELEMENT-IDENTITY, A-R396-REVIEW-DOC248-TODO, C-R396-NOTE-PS29-TITLE -> deferred_low_polish; gate-396 Low 3 merged into B-R395-PERF-RESTORE-CATCH (same root cause, L7); GATE396-ARCH-STREAM-FACTORY recorded as an architecture signal under ARCH-CHECKPOINT-PREVIEW-AFTER-13C.'),
 ('D-29z1358', 'Feature boundary: PERF-13c complete, so ARCH-CHECKPOINT-PREVIEW-AFTER-13C is due now (with ARCH-CHECKPOINT-DECODE-REGION). Reminder for root: b-round-396/root-request-arch-checkpoint-due.md. Non-blocking: PERF-13d touches studio-lab-demo.ts and demo-synth.ts only, neither the preview nor the decode region.'),
]
for i, t in decs:
    d['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for r in d['rounds']:
    if r.get('round') == 396:
        r['status'] = 'C PASS (c-round-396.json, browserVerified true, 0 bugs); gate 396 published 4f28bff (D-29z1355)'
d['rounds'].append({'round': 397, 'task': 'current-task.md', 'decision': 'D-29z1355..D-29z1358', 'type': 'PERF-13d (final PERF-13 stage): synth demo buffers one per task, one shared array; doc 253, doc 247 Completed', 'status': 'dispatched', 'note': 'baseline 4f28bff clean; grants b-round-396/grants-397.txt (5); frozen b-round-396/r397-frozen-sha256.txt (1284); claims b-round-396/claims-397.sh K1..K22; sketch b-round-396/sketch-397.patch.txt sha 4db03d5a', 'added': BY})
d['advisor_used_by_B'] = 'round 396 -> 397 planning: advisor available and consulted after orientation; performance-optimizer and tech-lead consulted; tech-lead reviewed the frozen sketch'
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text(BY + '\n')
print('ok v364')
