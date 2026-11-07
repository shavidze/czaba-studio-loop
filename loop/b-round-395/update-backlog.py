import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-395/update-backlog.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 362, d['version']
BY = '2026-11-07 B round 395 -> 396 planning'
d['version'] = 363
d['updated'] = BY
d['current_task'] = 'Round 396: PERF-13c-ii-b (stage 3 of 3): purchased adapter previewUrl; stream element crossOrigin anonymous; fallback lifetime = collection object (PS27); PS28; perf harness preview rows (assert, B sketch); doc 252 Completed, doc 248 l.4 (current-task.md)'
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
EV = 'C round 395 PASS (c-round-395.json: browserVerified/realVerified true, 0 bugs; R1b 8287/8283 ms, R1-R7, PERF-RES, AUTH, SOURCE-SCOPE, DOC-252) + gate 395 published cf81dff (both remotes)'
for i in ['REV-B393-M1-STALL', 'GATE393-M1-SYNC-THROW', 'A-R393-REVIEW-M1-EXTERNAL-PAUSE', 'C-R394-01',
          'A-R394-REVIEW-L1-PS22-ASSERTS', 'A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL', 'A-R393-SKETCH-L4-EXTERNAL-PAUSE']:
    for o in by_id(i):
        prepend(o, 'status', f'done (D-29z1351): {EV}')
        o['closed'] = BY
for o in by_id('GATE393-M1-SYNC-THROW'):
    prepend(o, 'status', 'note: jsdom-only rows PS22/PS23 (browser cannot force a sync throw); A mutants 15/15 red a-round-395/mutants/summary.txt')
for o in by_id('PERF-13c'):
    prepend(o, 'status', 'in_progress (D-29z1351): 13c-i and 13c-ii-a done (cf81dff); round 396 = 13c-ii-b (stage 3 of 3, D-29z1352)')
    for st in o.get('stages_d29z1340', []):
        if st.get('id') == 'PERF-13c-ii-a':
            prepend(st, 'status', f'done (D-29z1351): {EV}')
        if st.get('id') == 'PERF-13c-ii-b':
            prepend(st, 'status', 'dispatched round 396 (D-29z1352): collection.ts previewUrl; preview.client.ts crossOrigin anonymous; PV1/PV2, PS27/PS28/PS29; perf rows res.harness.preview-stream-playing (>=1), res.mem.pcm-live-preview-delta-mib (<=0), res.mem.pcm-live-preview-decode-count (<=0) asserted from B sketch b-round-395/perf-sketch.log, mutant MU-396-DEMO-NO-STREAM red; purchased browser half BLOCKED no mount point (SRW-21 deferred_user; L36 tried: K14 0 non-test callers); doc 252 Completed, doc 248 l.4')
            st['closes'] = ['GATE393-L4-FALLBACK-NEVER-EXPIRES', 'SIG-R393-PREVIEW-NO-CACHE-WARM (ruled)', 'A-R393-REVIEW-L6 (ruled)', 'A-R395-REVIEW-L2-THROW-WHILE-ARMED', 'B-R395-DOC248-STATUS', 'TL-B395-SKETCH-M2-CROSSORIGIN']
for o in by_id('STUDIO-PERFORMANCE'):
    prepend(o, 'status', 'in_progress (D-29z1351): PERF-13c-ii-a done (cf81dff); round 396 = PERF-13c-ii-b')
for o in by_id('GATE393-L4-FALLBACK-NEVER-EXPIRES'):
    prepend(o, 'status', 'scheduled round 396 (D-29z1352): ruled no timer; lifetime = the collection object (a new collection resets it); row PS27 + MU-396-FALLBACK-ANY-COLLECTION; closes on C PASS + gate')
for o in by_id('SIG-R393-PREVIEW-NO-CACHE-WARM'):
    prepend(o, 'status', 'ruled (D-29z1352): the stream path writes no decoded cache and no stem cache (claim K10 cache-in-stream-branch 0; PS6/PS27 observedCache false); the stall/abort fallback uses the ordinary loadSource path unchanged; purchased sources the same; no change')
for o in by_id('ARCH-CHECKPOINT-PREVIEW-AFTER-13C'):
    o.setdefault('signals', []).append('GATE395-ARCH-STREAM-FACTORY: gate-395 reviewer: keep now; after 13c-ii-b consider extracting createStreamPreview(element, hooks) as a pure factory inside preview.client.ts (PS1-PS26 unchanged) (D-29z1353)')
    prepend(o, 'status', 'due after round 396 C PASS (D-29z1353): request b-round-393/root-request-arch-checkpoint-preview.md stands (not refiled); signals now include GATE395-ARCH-STREAM-FACTORY')
d['architecture_signals'].append({'id': 'GATE395-ARCH-STREAM-FACTORY', 'origin': 'gate 395 code-reviewer Architecture note (gates/round-395/review.md)', 'note': 'stream branch of playLibraryPreviewStream changed in rounds 393, 394, 395; keep now; candidate pure createStreamPreview(element, hooks) factory inside preview.client.ts after 13c-ii-b', 'status': 'recorded (D-29z1353); joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C; not scheduled', 'added': BY})
d['architecture_signals'].append({'id': 'TL-B395-SRW21-MEMO-ADAPTER', 'origin': 'tech-lead review of B round-396 sketch (b-round-395/sketch-review.md)', 'note': 'when the purchased Studio mount lands, the route must memoise createPurchasedWorkspaceCollection by product id and stems; a new collection object per render resets the stream fallback and the decode cache', 'status': 'recorded (D-29z1353); input for SRW-21-PLAN', 'added': BY})
d['open_findings'].append({'id': 'A-R395-REVIEW-L2-THROW-WHILE-ARMED', 'severity': 'low', 'origin': 'A round 395 code-reviewer', 'evidence': 'a-round-395.md Code-reviewer Low 2', 'title': 'no row for a same-url seek that throws while the stall timer is armed before playing (PS23 covers it after playing only)', 'status': 'scheduled round 396 (D-29z1353): PS28 (test file owned this round); mutants MU-394-SYNC-THROW-SEEK, MU-394-STALL-SURVIVES-STOP red on the sketch', 'added': BY})
d['open_findings'].append({'id': 'B-R395-DOC248-STATUS', 'severity': 'low', 'origin': 'B planning (L28 sweep)', 'evidence': "grep -rn 'In Progress (stage' docs/implementation: doc 248 l.4 'In Progress (stage 1 of 2; C round 384 PASS)' although PERF-13b-ii (stage 2) passed C round 392 (doc 251 Completed)", 'title': 'doc 248 (PERF-13b-i) status line not closed at the final PERF-13b stage (L28 multi-stage clause missed at round 392)', 'status': "scheduled round 396 (D-29z1354): doc 248 l.4 granted -> 'Completed (C round 392 PASS)'", 'added': BY})
d['open_findings'].append({'id': 'TL-B395-SKETCH-M2-CROSSORIGIN', 'severity': 'medium', 'origin': 'B pre-check (tech-lead review of the round-396 sketch, before dispatch)', 'evidence': 'b-round-395/sketch-review.md Review 1 Medium 2', 'title': 'the stream element requests its URL in no-cors mode with credentials included, unlike the decode fetch (credentials omit); first relevant now that the purchased adapter hands it signed stem URLs', 'status': 'scheduled round 396 (D-29z1352): element.crossOrigin = anonymous; PS29 + MU-396-NO-CROSSORIGIN; browser row R8 (b-round-395/probe/rows-R8.json)', 'added': BY})
for i, t, ev in [
    ('A-R395-REVIEW-L1-SEEK-REENTRANT', 'a fake element that dispatches pause/error synchronously inside the currentTime setter nulls active; active.restartArmedStall() then throws and catch calls active.fail() on null (real browsers fire asynchronously); fix: const current = active in the seek branch', 'a-round-395.md Code-reviewer Low 1'),
    ('GATE395-L1-CURRENTTIME-READ', 'handleError reads element.currentTime before stopActive(); a throwing getter would escape the catch blocks (theoretical; browsers do not throw)', 'gates/round-395/review.md Low 1'),
    ('GATE395-L3-IOS-PAUSE-INTERRUPTION', 'Safari/iOS interruptions (pause then resume) end the preview rather than resume it; documented choice; no C row on a real iOS device', 'gates/round-395/review.md Low 3'),
    ('B-R395-PURCHASED-DUP-URL', 'the purchased adapter rejects duplicate stem ids but not duplicate URLs; two ids sharing one URL would share the same-url seek path and mark the wrong source for fallback', 'b-round-395/sketch-review.md Review 1 Low'),
    ('B-R395-PERF-RESTORE-CATCH', 'perf preview step: the finally restore page.evaluate throws on a crashed page and hides the real error; add .catch(() => undefined)', 'b-round-395/sketch-review.md Review 2 Low'),
]:
    d['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': ev.split(' ')[0], 'evidence': ev, 'title': t, 'status': 'deferred_low_polish (D-29z1353)', 'added': BY})
decs = [
 ('D-29z1351', 'Round 395 result: C PASS (c-round-395.json: browserVerified/realVerified true, 0 bugs; R1b binding 8287/8283 ms; R1-R7, PERF-RES, AUTH, SOURCE-SCOPE, DOC-252) and gate 395 published cf81dff to both remotes (gates/gate-round-395.json). PERF-13c-ii-a done. Closed: REV-B393-M1-STALL, GATE393-M1-SYNC-THROW (jsdom rows), A-R393-REVIEW-M1-EXTERNAL-PAUSE, A-R393-SKETCH-L4-EXTERNAL-PAUSE, C-R394-01, A-R394-REVIEW-L1-PS22-ASSERTS, A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL. Baseline for round 396: cf81dff, clean tree. tasks/round-395.md archived (copy).'),
 ('D-29z1352', 'PERF-13c-ii-b (stage 3 of 3) dispatched as round 396. Rulings: (a) the same-preview seek keeps comparing the URL: the purchased adapter builds its Map once, previewUrl returns the identical string per source for the collection lifetime (PV2); a URL refresh must build a new collection, which also resets the fallback, so URL equality fails safe; A-R393-REVIEW-L6 closed by ruling. (b) the stream fallback set gets no timer; its lifetime is the collection object (PS27) - closes GATE393-L4 on C PASS. (c) the stream path writes no cache (SIG-R393-PREVIEW-NO-CACHE-WARM ruled). (d) crossOrigin anonymous on the stream element (tech-lead Medium on the sketch, TL-B395-SKETCH-M2-CROSSORIGIN), matching the decode fetch credentials omit. (e) Purchased browser half: L36 tried, there is nothing to stub - no route constructs the purchased collection (K14: 0 non-test callers); the row is BLOCKED "no mount point: SRW-21 deferred_user", unit rows PV1/PV2 carry the adapter; it does not make browserVerified false (SRW-21 counts as deferred). (f) perf rows asserted from B production sketch (b-round-395/perf-sketch.log: 1 / 0 / 0) with fix-removed mutant MU-396-DEMO-NO-STREAM red (0 / 37.1 / 1).'),
 ('D-29z1353', 'Placement of review notes: A-R395-REVIEW-L2 -> PS28 in round 396 (owned test file); A-R395-REVIEW-L1, GATE395-L1, GATE395-L3, B-R395-PURCHASED-DUP-URL, B-R395-PERF-RESTORE-CATCH -> deferred_low_polish; architecture notes GATE395-ARCH-STREAM-FACTORY (joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C) and TL-B395-SRW21-MEMO-ADAPTER (SRW-21-PLAN input) recorded, not scheduled. The bounded frontend-architect checkpoint request b-round-393/root-request-arch-checkpoint-preview.md becomes due when round 396 passes C (PERF-13c feature boundary); not refiled.'),
 ('D-29z1354', 'L28 sweep at the 13c-ii-b planning found doc 248 (PERF-13b-i) still In Progress although PERF-13b-ii passed C round 392: B-R395-DOC248-STATUS, granted in round 396 (l.4 -> Completed (C round 392 PASS)). The other In Progress hits tie to open stages: 232 PERF-DRAG-PREVIEW, 247 PERF-13 (13d open), 246 PERF-12b (awaiting_user), 238 PERF-11c-iii-d/e (awaiting_user).'),
]
for i, t in decs:
    d['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for r in d['rounds']:
    if r.get('round') == 395:
        r['status'] = 'C PASS (c-round-395.json, browserVerified true, 0 bugs); gate 395 published cf81dff (D-29z1351)'
d['rounds'].append({'round': 396, 'task': 'current-task.md', 'decision': 'D-29z1351..D-29z1354', 'type': 'PERF-13c-ii-b (stage 3 of 3): purchased previewUrl, crossOrigin anonymous, fallback lifetime, perf preview rows, doc 252 Completed', 'status': 'dispatched', 'note': 'baseline cf81dff clean; grants b-round-395/grants-396.txt (8); frozen b-round-395/r396-frozen-sha256.txt (1279); claims b-round-395/claims-396.sh K1..K22; sketch b-round-395/sketch-396.patch.txt sha 91c5d730', 'added': BY})
d['advisor_used_by_B'] = 'round 395 -> 396 planning: advisor available and consulted after orientation; tech-lead reviewed the sketch twice'
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text(BY + '\n')
print('ok v363')
